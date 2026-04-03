import { Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import db from './db.js'
import { getGameUrl } from './pp-integration.js'

const router = Router()

// ==================== IN-MEMORY CACHE ====================
const h5Cache = new Map()

function h5CacheGet(key) {
  const entry = h5Cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    h5Cache.delete(key)
    return null
  }
  return entry.data
}

function h5CacheSet(key, data, ttlMs) {
  h5Cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

// H5 JWT secret - must be set via environment variable. No fallback allowed.
if (!process.env.H5_JWT_SECRET) {
  throw new Error('FATAL: H5_JWT_SECRET environment variable is not set.')
}
const H5_JWT_SECRET = process.env.H5_JWT_SECRET

// ==================== H5 Auth Middleware ====================
function h5Auth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, H5_JWT_SECRET)
    if (decoded.role !== 'h5_user') {
      return res.status(401).json({ error: 'Invalid token type' })
    }
    req.h5user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ==================== AUTH ====================

// POST /api/h5/auth/register
router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, phone } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if username already exists in h5_users
    const existing = db.prepare('SELECT id FROM h5_users WHERE username = ?').get(username)
    if (existing) {
      return res.status(400).json({ error: 'Username already exists' })
    }

    // Create member entry (visible in admin dashboard)
    const memberCount = db.prepare('SELECT COUNT(*) as c FROM members').get().c
    const memberId = 'M' + (10000 + memberCount + 1)

    // Insert into members table
    db.prepare(`INSERT INTO members (id, username, agent, vip, balance, status, registered, last_login, total_deposit, total_withdraw, tags)
      VALUES (?, ?, '', 0, 0, 'active', datetime('now'), datetime('now'), 0, 0, '["H5"]')`).run(memberId, username)

    // Insert into h5_users table with hashed password
    const hashedPassword = await bcrypt.hash(password, 10)
    db.prepare(`INSERT INTO h5_users (username, password, phone, nickname, member_id, last_login)
      VALUES (?, ?, ?, ?, ?, datetime('now'))`).run(username, hashedPassword, phone || '', username, memberId)

    const h5user = db.prepare('SELECT * FROM h5_users WHERE username = ?').get(username)

    // Send welcome message
    db.prepare(`INSERT INTO h5_user_messages (member_id, title, content, type)
      VALUES (?, '欢迎加入平台', '感谢您注册成为我们的会员，祝您游戏愉快！新用户可领取首充奖励。', 'system')`).run(memberId)

    const token = jwt.sign(
      { id: h5user.id, username, memberId, role: 'h5_user' },
      H5_JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      access_token: token,
      user: {
        id: memberId,
        username,
        nickname: username,
        phone: phone || '',
        vipLevel: 0,
        balance: 0,
        avatar: ''
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Registration failed' })
  }
})

// POST /api/h5/auth/login
router.post('/auth/login', async (req, res) => {
  try {
    const { phone, password, username } = req.body
    const loginName = username || phone
    if (!loginName || !password) {
      return res.status(400).json({ error: 'Username/phone and password required' })
    }

    const h5user = db.prepare('SELECT * FROM h5_users WHERE username = ? OR phone = ?').get(loginName, loginName)
    if (!h5user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const pwdMatch = await bcrypt.compare(password, h5user.password)
    if (!pwdMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    if (h5user.status !== 'active') {
      return res.status(403).json({ error: 'Account disabled' })
    }

    // Update last login
    db.prepare(`UPDATE h5_users SET last_login = datetime('now') WHERE id = ?`).run(h5user.id)
    db.prepare(`UPDATE members SET last_login = datetime('now') WHERE id = ?`).run(h5user.member_id)

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(h5user.member_id)

    const token = jwt.sign(
      { id: h5user.id, username: h5user.username, memberId: h5user.member_id, role: 'h5_user' },
      H5_JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      access_token: token,
      user: {
        id: h5user.member_id,
        username: h5user.username,
        nickname: h5user.nickname || h5user.username,
        phone: h5user.phone,
        vipLevel: member ? member.vip : 0,
        balance: member ? member.balance : 0,
        avatar: h5user.avatar || ''
      }
    })
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' })
  }
})

// ==================== USER PROFILE ====================

// GET /api/h5/user/profile
router.get('/user/profile', h5Auth, (req, res) => {
  const h5user = db.prepare('SELECT * FROM h5_users WHERE id = ?').get(req.h5user.id)
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.h5user.memberId)
  if (!h5user || !member) {
    return res.status(404).json({ error: 'User not found' })
  }

  res.json({
    id: member.id,
    username: h5user.username,
    nickname: h5user.nickname || h5user.username,
    phone: h5user.phone,
    avatar: h5user.avatar || '',
    vipLevel: member.vip,
    balance: member.balance,
    totalDeposit: member.total_deposit,
    totalWithdraw: member.total_withdraw,
    registered: member.registered,
    status: member.status
  })
})

// PUT /api/h5/user/profile
router.put('/user/profile', h5Auth, (req, res) => {
  const { nickname, avatar, phone } = req.body
  db.prepare(`UPDATE h5_users SET
    nickname = COALESCE(?, nickname),
    avatar = COALESCE(?, avatar),
    phone = COALESCE(?, phone)
    WHERE id = ?`).run(nickname, avatar, phone, req.h5user.id)
  res.json({ success: true })
})

// PUT /api/h5/user/password
router.put('/user/password', h5Auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new password required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    const h5user = db.prepare('SELECT * FROM h5_users WHERE id = ?').get(req.h5user.id)
    const oldPwdMatch = await bcrypt.compare(oldPassword, h5user.password)
    if (!oldPwdMatch) {
      return res.status(400).json({ error: 'Old password incorrect' })
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    db.prepare('UPDATE h5_users SET password = ? WHERE id = ?').run(hashedNewPassword, req.h5user.id)
    res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Password change failed' })
  }
})

// ==================== WALLET ====================

// GET /api/h5/wallet/balance
router.get('/wallet/balance', h5Auth, (req, res) => {
  const member = db.prepare('SELECT balance FROM members WHERE id = ?').get(req.h5user.memberId)
  res.json({ balance: member ? member.balance : 0 })
})

// POST /api/h5/wallet/deposit
router.post('/wallet/deposit', h5Auth, (req, res) => {
  const { amount, channel } = req.body
  const amt = Number(amount)
  if (!amt || amt < 10 || amt > 500000) {
    return res.status(400).json({ error: 'Amount must be between 10 and 500,000' })
  }

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.h5user.memberId)
  const newBalance = (member ? member.balance : 0) + amt

  // Create deposit record
  const depositId = 'D' + Date.now()
  db.prepare(`INSERT INTO deposits (id, member, agent, amount, channel, status, time)
    VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'))`).run(
    depositId, req.h5user.memberId, member ? member.agent : '', amt, channel || 'USDT-TRC20'
  )

  // Update member balance and total deposit
  db.prepare('UPDATE members SET balance = ?, total_deposit = total_deposit + ? WHERE id = ?').run(
    newBalance, amt, req.h5user.memberId
  )

  // Record transaction
  db.prepare(`INSERT INTO h5_transactions (member_id, type, amount, balance_after, description, status)
    VALUES (?, 'deposit', ?, ?, ?, 'completed')`).run(
    req.h5user.memberId, amt, newBalance, `Deposit via ${channel || 'USDT-TRC20'}`
  )

  res.json({ success: true, balance: newBalance, id: depositId })
})

// POST /api/h5/wallet/withdraw
router.post('/wallet/withdraw', h5Auth, (req, res) => {
  const { amount, channel, address } = req.body
  const amt = Number(amount)
  if (!amt || amt < 50 || amt > 50000) {
    return res.status(400).json({ error: 'Amount must be between 50 and 50,000' })
  }

  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.h5user.memberId)
  if (!member || member.balance < amt) {
    return res.status(400).json({ error: 'Insufficient balance' })
  }

  const newBalance = member.balance - amt

  // Create withdrawal record
  const withdrawId = 'W' + Date.now()
  db.prepare(`INSERT INTO withdrawals (id, member, agent, amount, channel, status, time, address, risk_level)
    VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'), ?, 'low')`).run(
    withdrawId, req.h5user.memberId, member.agent, amt, channel || 'USDT-TRC20', address || ''
  )

  // Update member balance and total withdraw
  db.prepare('UPDATE members SET balance = ?, total_withdraw = total_withdraw + ? WHERE id = ?').run(
    newBalance, amt, req.h5user.memberId
  )

  // Record transaction
  db.prepare(`INSERT INTO h5_transactions (member_id, type, amount, balance_after, description, status)
    VALUES (?, 'withdraw', ?, ?, ?, 'pending')`).run(
    req.h5user.memberId, amt, newBalance, `Withdraw to ${address || 'wallet'}`
  )

  res.json({ success: true, balance: newBalance, id: withdrawId })
})

// GET /api/h5/wallet/transactions
router.get('/wallet/transactions', h5Auth, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = 20
  const offset = (page - 1) * limit
  const type = req.query.type

  let query = 'SELECT * FROM h5_transactions WHERE member_id = ?'
  const params = [req.h5user.memberId]

  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }

  const total = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params).count
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const rows = db.prepare(query).all(...params)
  res.json({
    list: rows.map(r => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      balanceAfter: r.balance_after,
      description: r.description,
      status: r.status,
      time: r.created_at
    })),
    total,
    page,
    pageSize: limit
  })
})

// ==================== GAMES ====================

// GET /api/h5/games
router.get('/games', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = 50
  const offset = (page - 1) * limit
  const category = req.query.category
  const search = req.query.search
  const provider = req.query.provider

  let query = "SELECT * FROM games WHERE status = 'active'"
  const params = []

  if (category) {
    // Map H5 category names to DB category names
    const categoryMap = {
      'slots': '电子游戏',
      'live': '真人视讯',
      'fishing': '捕鱼游戏',
      'lottery': '彩票',
      'sports': '体育竞猜',
      'chess': '棋牌游戏'
    }
    const dbCategory = categoryMap[category] || category
    query += ' AND category = ?'
    params.push(dbCategory)
  }

  if (provider) {
    query += ' AND provider = ?'
    params.push(provider)
  }

  if (search) {
    query += ' AND (name LIKE ? OR provider LIKE ?)'
    params.push(`%${search}%`, `%${search}%`)
  }

  const total = db.prepare(query.replace('SELECT *', 'SELECT COUNT(*) as count')).get(...params).count
  query += ' ORDER BY is_hot DESC, revenue DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)

  const rows = db.prepare(query).all(...params)
  res.json({
    list: rows.map(r => ({
      id: r.id,
      name: r.name,
      provider: r.provider,
      category: r.category,
      rtp: r.rtp,
      hot: !!r.is_hot,
      isNew: !!r.is_new,
      image: ''
    })),
    total,
    page,
    pageSize: limit
  })
})

// GET /api/h5/games/:id
router.get('/games/:id', (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)
  if (!game) return res.status(404).json({ error: 'Game not found' })

  res.json({
    id: game.id,
    name: game.name,
    provider: game.provider,
    category: game.category,
    rtp: game.rtp,
    hot: !!game.is_hot,
    isNew: !!game.is_new,
    bets: game.bets,
    revenue: game.revenue,
    image: ''
  })
})

// POST /api/h5/games/:id/launch
router.post('/games/:id/launch', h5Auth, async (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)
  if (!game) return res.status(404).json({ error: 'Game not found' })

    // Launch game via Pragmatic Play API
    try {
      const result = await getGameUrl({ symbol: game.pp_game_id || game.name, token: req.h5user.memberId, externalPlayerId: req.h5user.memberId })
      res.json({
        success: true,
        launchUrl: result.gameURL,
        game: {
          id: game.id,
          name: game.name,
          provider: game.provider
        }
      })
    } catch (err) {
      console.error('PP game launch error:', err.message)
      res.status(500).json({ error: 'Failed to launch game', details: err.message })
    }
})

// ==================== PROMOTIONS ====================

// GET /api/h5/promotions
router.get('/promotions', (req, res) => {
  const cached = h5CacheGet('h5:promotions')
  if (cached) return res.json(cached)

  const rows = db.prepare("SELECT * FROM promotions WHERE status = 'active' ORDER BY id").all()
  const gradients = [
    'linear-gradient(135deg, #6c5ce7, #a855f7)',
    'linear-gradient(135deg, #f0c040, #e67e22)',
    'linear-gradient(135deg, #e84393, #fd79a8)',
    'linear-gradient(135deg, #00b894, #00cec9)',
    'linear-gradient(135deg, #e17055, #d63031)',
    'linear-gradient(135deg, #0984e3, #6c5ce7)'
  ]

  const result = rows.map((r, i) => ({
    id: r.id,
    title: r.name,
    description: `Min deposit: ${r.min_deposit}, Bonus: ${r.bonus_rate}%, Max: ${r.max_bonus}`,
    type: r.type,
    gradient: gradients[i % gradients.length],
    startDate: r.start_time,
    endDate: r.end_time,
    minDeposit: r.min_deposit,
    bonusRate: r.bonus_rate,
    wagering: r.wagering,
    maxBonus: r.max_bonus,
    participants: r.participants
  }))
  h5CacheSet('h5:promotions', result, 300000)
  res.json(result)
})

// POST /api/h5/promotions/:id/claim
router.post('/promotions/:id/claim', h5Auth, (req, res) => {
  const promo = db.prepare('SELECT * FROM promotions WHERE id = ?').get(req.params.id)
  if (!promo) return res.status(404).json({ error: 'Promotion not found' })
  if (promo.status !== 'active') return res.status(400).json({ error: 'Promotion is not active' })

  // Check if already claimed
  const claimed = db.prepare('SELECT id FROM h5_promotion_claims WHERE member_id = ? AND promotion_id = ?')
    .get(req.h5user.memberId, req.params.id)
  if (claimed) return res.status(400).json({ error: 'Already claimed' })

  // Calculate bonus
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.h5user.memberId)
  const bonus = Math.min(promo.max_bonus, (member.total_deposit * promo.bonus_rate) / 100)

  if (bonus > 0) {
    // Credit bonus
    db.prepare('UPDATE members SET balance = balance + ? WHERE id = ?').run(bonus, req.h5user.memberId)

    // Record claim
    db.prepare('INSERT INTO h5_promotion_claims (member_id, promotion_id, amount) VALUES (?, ?, ?)').run(
      req.h5user.memberId, req.params.id, bonus
    )

    // Record transaction
    db.prepare(`INSERT INTO h5_transactions (member_id, type, amount, balance_after, description)
      VALUES (?, 'bonus', ?, ?, ?)`).run(
      req.h5user.memberId, bonus, member.balance + bonus, `Promotion: ${promo.name}`
    )

    // Update participants count
    db.prepare('UPDATE promotions SET participants = participants + 1 WHERE id = ?').run(req.params.id)
  }

  res.json({ success: true, bonus, message: bonus > 0 ? `Claimed ${bonus} USDT` : 'No bonus available' })
})

// ==================== MESSAGES ====================

// GET /api/h5/messages
router.get('/messages', h5Auth, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = 20
  const offset = (page - 1) * limit

  const total = db.prepare('SELECT COUNT(*) as count FROM h5_user_messages WHERE member_id = ?')
    .get(req.h5user.memberId).count

  const rows = db.prepare(`SELECT * FROM h5_user_messages WHERE member_id = ?
    ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(req.h5user.memberId, limit, offset)

  const unread = db.prepare('SELECT COUNT(*) as count FROM h5_user_messages WHERE member_id = ? AND is_read = 0')
    .get(req.h5user.memberId).count

  res.json({
    list: rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      type: r.type,
      isRead: !!r.is_read,
      time: r.created_at
    })),
    total,
    unread,
    page,
    pageSize: limit
  })
})

// PUT /api/h5/messages/:id/read
router.put('/messages/:id/read', h5Auth, (req, res) => {
  db.prepare('UPDATE h5_user_messages SET is_read = 1 WHERE id = ? AND member_id = ?')
    .run(req.params.id, req.h5user.memberId)
  res.json({ success: true })
})

// ==================== VIP ====================

// GET /api/h5/vip/info
router.get('/vip/info', h5Auth, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.h5user.memberId)
  const levels = db.prepare('SELECT * FROM vip_levels ORDER BY level').all()

  const currentLevel = member ? member.vip : 0
  const currentLevelInfo = levels.find(l => l.level === currentLevel) || levels[0]
  const nextLevelInfo = levels.find(l => l.level === currentLevel + 1)

  res.json({
    currentLevel,
    currentLevelName: currentLevelInfo ? currentLevelInfo.name : '新手',
    totalDeposit: member ? member.total_deposit : 0,
    nextLevelDeposit: nextLevelInfo ? nextLevelInfo.upgrade_deposit : null,
    nextLevelWager: nextLevelInfo ? nextLevelInfo.upgrade_wager : null,
    benefits: {
      monthlyBonus: currentLevelInfo ? currentLevelInfo.monthly_bonus : 0,
      birthdayBonus: currentLevelInfo ? currentLevelInfo.birthday_bonus : 0,
      withdrawLimit: currentLevelInfo ? currentLevelInfo.withdraw_limit : '50000'
    },
    levels: levels.map(l => ({
      level: l.level,
      name: l.name,
      deposit: l.upgrade_deposit,
      turnover: l.upgrade_wager,
      monthlyBonus: l.monthly_bonus,
      birthdayBonus: l.birthday_bonus,
      withdrawLimit: l.withdraw_limit
    }))
  })
})

// ==================== RAKEBACK ====================

// GET /api/h5/rakeback/records
router.get('/rakeback/records', h5Auth, (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = 20
  const offset = (page - 1) * limit

  const total = db.prepare('SELECT COUNT(*) as count FROM rakeback_records WHERE member = ?')
    .get(req.h5user.memberId).count

  const rows = db.prepare(`SELECT * FROM rakeback_records WHERE member = ?
    ORDER BY time DESC LIMIT ? OFFSET ?`).all(req.h5user.memberId, limit, offset)

  res.json({
    list: rows.map(r => ({
      id: r.id,
      gameType: r.game_type,
      betAmount: r.bet_amount,
      rakebackAmount: r.rakeback_amount,
      time: r.time,
      status: r.status
    })),
    total,
    page,
    pageSize: limit
  })
})

// GET /api/h5/rakeback/today
router.get('/rakeback/today', h5Auth, (req, res) => {
  const today = db.prepare(`SELECT COALESCE(SUM(rakeback_amount), 0) as total
    FROM rakeback_records WHERE member = ? AND date(time) = date('now')`).get(req.h5user.memberId)

  const allTime = db.prepare(`SELECT COALESCE(SUM(rakeback_amount), 0) as total
    FROM rakeback_records WHERE member = ?`).get(req.h5user.memberId)

  res.json({
    today: today.total,
    allTime: allTime.total
  })
})

// ==================== COMPLIANCE ====================

// POST /api/h5/compliance/kyc/submit - User submits KYC documents
router.post('/compliance/kyc/submit', h5Auth, (req, res) => {
  const { documentType, documentUrl } = req.body
  if (!documentType) {
    return res.status(400).json({ error: 'Document type is required' })
  }

  // Check if user already has a pending KYC
  const existing = db.prepare("SELECT id FROM kyc_documents WHERE user_id = ? AND status = 'pending'")
    .get(req.h5user.memberId)
  if (existing) {
    return res.status(400).json({ error: 'You already have a pending KYC submission' })
  }

  db.prepare(`INSERT INTO kyc_documents (user_id, document_type, document_url, status)
    VALUES (?, ?, ?, 'pending')`).run(req.h5user.memberId, documentType, documentUrl || '')

  res.json({ success: true, message: 'KYC documents submitted for review' })
})

// GET /api/h5/compliance/kyc/status - Check KYC status
router.get('/compliance/kyc/status', h5Auth, (req, res) => {
  const kyc = db.prepare('SELECT * FROM kyc_documents WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 1')
    .get(req.h5user.memberId)

  if (!kyc) {
    return res.json({ status: 'not_submitted', message: 'No KYC documents submitted' })
  }

  res.json({
    status: kyc.status,
    documentType: kyc.document_type,
    submittedAt: kyc.submitted_at,
    reviewedAt: kyc.reviewed_at,
    rejectReason: kyc.reject_reason || ''
  })
})

// POST /api/h5/compliance/self-exclude - User self-exclude
router.post('/compliance/self-exclude', h5Auth, (req, res) => {
  const { exclusionType, reason } = req.body
  const validTypes = ['24h', '7d', '30d', '6m', 'permanent']
  if (!exclusionType || !validTypes.includes(exclusionType)) {
    return res.status(400).json({ error: 'Invalid exclusion type. Must be one of: 24h, 7d, 30d, 6m, permanent' })
  }

  // Check if already self-excluded
  const active = db.prepare("SELECT id FROM self_exclusions WHERE user_id = ? AND status = 'active'")
    .get(req.h5user.memberId)
  if (active) {
    return res.status(400).json({ error: 'You are already self-excluded' })
  }

  // Calculate end date
  const durationMap = {
    '24h': '+1 day',
    '7d': '+7 days',
    '30d': '+30 days',
    '6m': '+6 months',
    'permanent': '+100 years'
  }

  const endDateResult = db.prepare(`SELECT datetime('now', ?) as end_date`).get(durationMap[exclusionType])

  db.prepare(`INSERT INTO self_exclusions (user_id, exclusion_type, start_date, end_date, status, reason)
    VALUES (?, ?, datetime('now'), ?, 'active', ?)`).run(
    req.h5user.memberId, exclusionType, endDateResult.end_date, reason || ''
  )

  // Freeze the member account
  db.prepare("UPDATE members SET status = 'self_excluded' WHERE id = ?").run(req.h5user.memberId)

  res.json({
    success: true,
    message: `Self-exclusion activated for ${exclusionType}`,
    endDate: endDateResult.end_date
  })
})

// GET /api/h5/compliance/self-exclude/status - Check self-exclusion status
router.get('/compliance/self-exclude/status', h5Auth, (req, res) => {
  const exclusion = db.prepare("SELECT * FROM self_exclusions WHERE user_id = ? AND status = 'active' ORDER BY start_date DESC LIMIT 1")
    .get(req.h5user.memberId)

  if (!exclusion) {
    return res.json({ active: false })
  }

  res.json({
    active: true,
    exclusionType: exclusion.exclusion_type,
    startDate: exclusion.start_date,
    endDate: exclusion.end_date,
    reason: exclusion.reason
  })
})

// GET /api/h5/compliance/limits - Get user limits
router.get('/compliance/limits', h5Auth, (req, res) => {
  const limits = db.prepare('SELECT * FROM user_limits WHERE user_id = ? ORDER BY limit_type, period')
    .all(req.h5user.memberId)

  res.json(limits.map(l => ({
    id: l.id,
    limitType: l.limit_type,
    period: l.period,
    amount: l.amount,
    createdAt: l.created_at,
    updatedAt: l.updated_at
  })))
})

// PUT /api/h5/compliance/limits - Set/update user limits
router.put('/compliance/limits', h5Auth, (req, res) => {
  const { limitType, period, amount } = req.body
  const validTypes = ['deposit', 'bet']
  const validPeriods = ['daily', 'weekly', 'monthly']

  if (!validTypes.includes(limitType)) {
    return res.status(400).json({ error: 'Invalid limit type. Must be deposit or bet' })
  }
  if (!validPeriods.includes(period)) {
    return res.status(400).json({ error: 'Invalid period. Must be daily, weekly, or monthly' })
  }
  if (amount === undefined || amount < 0) {
    return res.status(400).json({ error: 'Amount must be a non-negative number' })
  }

  // Upsert the limit
  const existing = db.prepare('SELECT id FROM user_limits WHERE user_id = ? AND limit_type = ? AND period = ?')
    .get(req.h5user.memberId, limitType, period)

  if (existing) {
    if (amount === 0) {
      // Remove limit
      db.prepare('DELETE FROM user_limits WHERE id = ?').run(existing.id)
    } else {
      db.prepare("UPDATE user_limits SET amount = ?, updated_at = datetime('now') WHERE id = ?").run(amount, existing.id)
    }
  } else if (amount > 0) {
    db.prepare('INSERT INTO user_limits (user_id, limit_type, period, amount) VALUES (?, ?, ?, ?)').run(
      req.h5user.memberId, limitType, period, amount
    )
  }

  res.json({ success: true })
})

// ==================== APP DATA (public) ====================

// GET /api/h5/app/banners
router.get('/app/banners', (req, res) => {
  const cached = h5CacheGet('h5:banners')
  if (cached) return res.json(cached)

  const rows = db.prepare("SELECT * FROM banners WHERE status = 'active' ORDER BY sort").all()
  const result = rows.map(r => ({
    id: r.id,
    title: r.title,
    image: r.image,
    link: r.link || '/promotions',
    gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)'
  }))
  h5CacheSet('h5:banners', result, 600000)
  res.json(result)
})

// GET /api/h5/app/announcements
router.get('/app/announcements', (req, res) => {
  const rows = db.prepare("SELECT * FROM announcements WHERE status = 'active' ORDER BY created_at DESC LIMIT 5").all()
  res.json(rows.map(r => ({
    id: r.id,
    content: r.content || r.title
  })))
})

// GET /api/h5/app/config
router.get('/app/config', (req, res) => {
  const cached = h5CacheGet('h5:config')
  if (cached) return res.json(cached)

  const rows = db.prepare('SELECT * FROM system_settings').all()
  const settings = {}
  for (const r of rows) {
    settings[r.key] = r.value
  }
  const result = {
    siteName: settings.site_name || 'H5 Entertainment',
    customerService: 'https://t.me/support',
    downloadUrl: '#',
    registerEnabled: settings.register_enabled !== 'false',
    maintenanceMode: settings.maintenance_mode === 'true'
  }
  h5CacheSet('h5:config', result, 600000)
  res.json(result)
})

// GET /api/h5/app/support
router.get('/app/support', (req, res) => {
  res.json({
    telegram: 'https://t.me/support',
    whatsapp: '',
    email: 'support@h5entertainment.com',
    livechat: true
  })
})

export default router

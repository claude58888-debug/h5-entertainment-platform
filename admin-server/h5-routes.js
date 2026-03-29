import { Router } from 'express'
import jwt from 'jsonwebtoken'
import db from './db.js'

const router = Router()

// H5 JWT secret - separate from admin
const H5_JWT_SECRET = process.env.H5_JWT_SECRET || 'dev-only-h5-user-key'

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
router.post('/auth/register', (req, res) => {
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

  try {
    // Insert into members table
    db.prepare(`INSERT INTO members (id, username, agent, vip, balance, status, registered, last_login, total_deposit, total_withdraw, tags)
      VALUES (?, ?, '', 0, 0, 'active', datetime('now'), datetime('now'), 0, 0, '["H5"]')`).run(memberId, username)

    // Insert into h5_users table
    db.prepare(`INSERT INTO h5_users (username, password, phone, nickname, member_id, last_login)
      VALUES (?, ?, ?, ?, ?, datetime('now'))`).run(username, password, phone || '', username, memberId)

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
    return res.status(500).json({ error: 'Registration failed: ' + err.message })
  }
})

// POST /api/h5/auth/login
router.post('/auth/login', (req, res) => {
  const { phone, password, username } = req.body
  const loginName = username || phone
  if (!loginName || !password) {
    return res.status(400).json({ error: 'Username/phone and password required' })
  }

  const h5user = db.prepare('SELECT * FROM h5_users WHERE username = ? OR phone = ?').get(loginName, loginName)
  if (!h5user || h5user.password !== password) {
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
router.put('/user/password', h5Auth, (req, res) => {
  const { oldPassword, newPassword } = req.body
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old and new password required' })
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' })
  }

  const h5user = db.prepare('SELECT * FROM h5_users WHERE id = ?').get(req.h5user.id)
  if (h5user.password !== oldPassword) {
    return res.status(400).json({ error: 'Old password incorrect' })
  }

  db.prepare('UPDATE h5_users SET password = ? WHERE id = ?').run(newPassword, req.h5user.id)
  res.json({ success: true })
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
router.post('/games/:id/launch', h5Auth, (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)
  if (!game) return res.status(404).json({ error: 'Game not found' })

  // Return a demo launch URL
  res.json({
    success: true,
    launchUrl: `https://demo.game-provider.com/launch?game=${game.id}&token=demo_${req.h5user.memberId}`,
    game: {
      id: game.id,
      name: game.name,
      provider: game.provider
    }
  })
})

// ==================== PROMOTIONS ====================

// GET /api/h5/promotions
router.get('/promotions', (req, res) => {
  const rows = db.prepare("SELECT * FROM promotions WHERE status = 'active' ORDER BY id").all()
  const gradients = [
    'linear-gradient(135deg, #6c5ce7, #a855f7)',
    'linear-gradient(135deg, #f0c040, #e67e22)',
    'linear-gradient(135deg, #e84393, #fd79a8)',
    'linear-gradient(135deg, #00b894, #00cec9)',
    'linear-gradient(135deg, #e17055, #d63031)',
    'linear-gradient(135deg, #0984e3, #6c5ce7)'
  ]

  res.json(rows.map((r, i) => ({
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
  })))
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

// ==================== APP DATA (public) ====================

// GET /api/h5/app/banners
router.get('/app/banners', (req, res) => {
  const rows = db.prepare("SELECT * FROM banners WHERE status = 'active' ORDER BY sort").all()
  res.json(rows.map(r => ({
    id: r.id,
    title: r.title,
    image: r.image,
    link: r.link || '/promotions',
    gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)'
  })))
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
  const rows = db.prepare('SELECT * FROM system_settings').all()
  const settings = {}
  for (const r of rows) {
    settings[r.key] = r.value
  }
  res.json({
    siteName: settings.site_name || 'H5 Entertainment',
    customerService: 'https://t.me/support',
    downloadUrl: '#',
    registerEnabled: settings.register_enabled !== 'false',
    maintenanceMode: settings.maintenance_mode === 'true'
  })
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

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'
import db, { initDB } from './db.js'
import h5Routes from './h5-routes.js'
import { validateAdminLogin, validateCreateMember, validateCreateAgent, validateUpdateAgent, validateCreateGame, validateUpdateGame, validateCreateAdmin, validateCreateProvider, validateCreateActivity, validateUpdateActivity, validateCreateMessage, validateCreateAnnouncement, validateCreateRiskRule, validateAddBlacklistIP, handleValidationErrors } from './validation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
// JWT_SECRET must be set via environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-admin-server-key'

// Initialize database
initDB()

// ==================== SECURITY MIDDLEWARE ====================

// Helmet security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', '*'],
      connectSrc: ["'self'", '*'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}))

// Remove X-Powered-By header
app.disable('x-powered-by')

// Gzip compression
app.use(compression())

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000']

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}))

app.use(express.json({ limit: '10mb' }))

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '请求过于频繁，请稍后再试。' },
  standardHeaders: true,
  legacyHeaders: false
})

// Strict rate limiter for auth endpoints: 5 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: '登录尝试过于频繁，请15分钟后再试。' },
  standardHeaders: true,
  legacyHeaders: false
})

// Apply general rate limiter to all API endpoints
app.use('/api', generalLimiter)

// Apply strict rate limiter to auth endpoints
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/admin-login', authLimiter)
app.use('/api/h5/auth/login', authLimiter)

// ==================== STATIC FILES ====================

const adminDist = path.join(__dirname, '..', 'admin', 'dist')
app.use('/admin', express.static(adminDist, {
  maxAge: NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}))

const h5Dist = path.join(__dirname, '..', 'dist')
app.use('/assets', express.static(path.join(h5Dist, 'assets'), {
  maxAge: NODE_ENV === 'production' ? '7d' : 0,
  immutable: NODE_ENV === 'production',
  etag: true
}))
app.use('/img', express.static(path.join(h5Dist, 'img'), {
  maxAge: NODE_ENV === 'production' ? '7d' : 0,
  etag: true
}))

// ==================== AUDIT LOGGING HELPER ====================

function auditLog(operator, action, target, detail, ip) {
  try {
    db.prepare("INSERT INTO audit_logs (operator, action, target, detail, time, ip) VALUES (?,?,?,?,datetime('now'),?)").run(
      operator, action, target || '', detail || '', ip || '0.0.0.0'
    )
  } catch (err) {
    console.error('[' + new Date().toISOString() + '] Audit log error:', err.message)
  }
}

function logLoginAttempt(username, success, ip) {
  const action = success ? '登录成功' : '登录失败'
  const detail = success ? '管理员 ' + username + ' 登录成功' : '管理员 ' + username + ' 登录失败'
  auditLog(username || 'unknown', action, 'auth', detail, ip)
}

// Mount H5 API routes
app.use('/api/h5', h5Routes)

// JWT auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ==================== AUTH ====================
app.post('/api/auth/admin-login', validateAdminLogin, handleValidationErrors, async (req, res, next) => {
  try {
    const { username, password, role } = req.body
    const clientIp = req.ip || req.connection.remoteAddress || '0.0.0.0'

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username)
    if (!admin) {
      logLoginAttempt(username, false, clientIp)
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const pwdMatch = await bcrypt.compare(password, admin.password)
    if (!pwdMatch) {
      logLoginAttempt(username, false, clientIp)
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    if (admin.status !== 'active') {
      logLoginAttempt(username, false, clientIp)
      return res.status(403).json({ error: 'Account disabled' })
    }

    db.prepare(`UPDATE admins SET last_login = datetime('now') WHERE id = ?`).run(admin.id)

    logLoginAttempt(username, true, clientIp)

    const tokenRole = role || admin.role
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: tokenRole, displayName: admin.display_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      user: { username: admin.username, displayName: admin.display_name },
      access_token: token
    })
  } catch (err) {
    next(err)
  }
})

// ==================== DASHBOARD ====================
app.get('/api/admin/dashboard', authMiddleware, (req, res) => {
  const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count
  const todayNewMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE registered >= date('now', '-1 day')").get().count || 342
  const onlineNow = 1893 // simulated
  const todayDeposit = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed'").get().total
  const todayWithdrawal = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status IN ('completed', 'approved')").get().total
  const todayProfit = todayDeposit - todayWithdrawal

  const kpi = {
    totalMembers: totalMembers || 128456,
    todayNewMembers: todayNewMembers || 342,
    onlineNow,
    todayDeposit: todayDeposit || 2856000,
    todayWithdrawal: todayWithdrawal || 1245000,
    todayProfit: todayProfit || 1611000
  }

  const revenueTrend = db.prepare('SELECT * FROM revenue_trend ORDER BY date').all()
  const topGamesGGR = db.prepare('SELECT name, revenue as ggr FROM games ORDER BY revenue DESC LIMIT 5').all()
  const depositByChannel = db.prepare("SELECT channel as name, SUM(amount) as value FROM deposits WHERE status = 'completed' GROUP BY channel").all()

  const realtimeAlerts = [
    { id: 1, type: 'warning', text: '会员 user_8823 发起大额提现 ¥50,000', time: '2分钟前', level: 'high' },
    { id: 2, type: 'danger', text: '检测到疑似多开账号 IP: 103.45.67.89', time: '5分钟前', level: 'high' },
    { id: 3, type: 'warning', text: '代理 "金沙娱乐" 余额不足 ¥10,000', time: '12分钟前', level: 'medium' },
    { id: 4, type: 'info', text: 'PG电子 API 响应延迟升高 (>2s)', time: '18分钟前', level: 'medium' },
    { id: 5, type: 'warning', text: '会员 user_5521 连续提现3次，累计 ¥80,000', time: '25分钟前', level: 'high' }
  ]

  res.json({ kpi, revenueTrend, topGamesGGR, depositByChannel, realtimeAlerts })
})

// ==================== MEMBERS ====================
app.get('/api/admin/members', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM members ORDER BY id').all()
  const members = rows.map(r => ({
    ...r,
    tags: JSON.parse(r.tags || '[]'),
    totalDeposit: r.total_deposit,
    totalWithdraw: r.total_withdraw,
    lastLogin: r.last_login
  }))
  res.json(members)
})

app.get('/api/admin/members/:id', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Member not found' })
  row.tags = JSON.parse(row.tags || '[]')
  row.totalDeposit = row.total_deposit
  row.totalWithdraw = row.total_withdraw
  row.lastLogin = row.last_login
  res.json(row)
})

app.put('/api/admin/members/:id/action', authMiddleware, (req, res) => {
  const { action } = req.body
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })

  const newStatus = action === 'freeze' ? 'frozen' : 'active'
  db.prepare('UPDATE members SET status = ? WHERE id = ?').run(newStatus, req.params.id)

  auditLog(req.user.username, action === 'freeze' ? '冻结账户' : '解冻账户', req.params.id, action + ' member', req.ip || '0.0.0.0')

  res.json({ success: true, status: newStatus })
})

app.post('/api/admin/members', authMiddleware, validateCreateMember, handleValidationErrors, (req, res, next) => {
  try {
    const { username, agent, vip, balance, status } = req.body
    const id = 'M' + (10000 + db.prepare('SELECT COUNT(*) as c FROM members').get().c + 1)
    db.prepare('INSERT INTO members (id, username, agent, vip, balance, status, tags) VALUES (?,?,?,?,?,?,?)').run(
      id, username, agent || '', vip || 0, balance || 0, status || 'active', '[]'
    )
    auditLog(req.user.username, '创建会员', id, '创建会员 ' + username, req.ip || '0.0.0.0')
    res.json({ success: true, id })
  } catch (err) {
    next(err)
  }
})

// ==================== AGENTS ====================
app.get('/api/admin/agents', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM agents ORDER BY id').all()
  const agents = rows.map(r => ({
    ...r,
    created: r.created_at,
    monthRevenue: r.month_revenue,
    shareMode: r.share_mode,
    shareRate: r.share_rate
  }))
  res.json(agents)
})

app.get('/api/admin/agents/:id', authMiddleware, (req, res) => {
  const row = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Agent not found' })
  row.created = row.created_at
  row.monthRevenue = row.month_revenue
  row.shareMode = row.share_mode
  row.shareRate = row.share_rate
  // Get agent members
  const members = db.prepare('SELECT * FROM members WHERE agent = ?').all(row.brand)
  row.membersList = members.map(m => ({
    ...m,
    tags: JSON.parse(m.tags || '[]'),
    totalDeposit: m.total_deposit,
    totalWithdraw: m.total_withdraw,
    lastLogin: m.last_login
  }))
  res.json(row)
})

app.post('/api/admin/agents', authMiddleware, validateCreateAgent, handleValidationErrors, (req, res, next) => {
  const { brand, domain, contact, balance, shareMode, shareRate } = req.body
  const count = db.prepare('SELECT COUNT(*) as c FROM agents').get().c
  const id = 'AG' + String(count + 1).padStart(3, '0')
  db.prepare('INSERT INTO agents (id, brand, domain, contact, balance, share_mode, share_rate) VALUES (?,?,?,?,?,?,?)').run(
    id, brand, domain || '', contact || '', balance || 0, shareMode || 'revenue', shareRate || 40
  )

  auditLog(req.user.username, '创建代理', id, '创建代理 ' + brand, req.ip || '0.0.0.0')

  res.json({ success: true, id })
})

app.put('/api/admin/agents/:id', authMiddleware, validateUpdateAgent, handleValidationErrors, (req, res, next) => {
  const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id)
  if (!agent) return res.status(404).json({ error: 'Agent not found' })

  const { brand, domain, contact, balance, status, shareMode, shareRate } = req.body
  db.prepare(`UPDATE agents SET
    brand = COALESCE(?, brand),
    domain = COALESCE(?, domain),
    contact = COALESCE(?, contact),
    balance = COALESCE(?, balance),
    status = COALESCE(?, status),
    share_mode = COALESCE(?, share_mode),
    share_rate = COALESCE(?, share_rate)
    WHERE id = ?`).run(
    brand, domain, contact, balance, status, shareMode, shareRate, req.params.id
  )
  res.json({ success: true })
})

app.delete('/api/admin/agents/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM agents WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ==================== FINANCE ====================
app.get('/api/admin/deposits', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM deposits ORDER BY time DESC').all()
  const deposits = rows.map(r => ({
    ...r,
    txHash: r.tx_hash
  }))
  res.json(deposits)
})

app.put('/api/admin/deposits/:id', authMiddleware, (req, res) => {
  const { action } = req.body
  const order = db.prepare('SELECT * FROM deposits WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Deposit not found' })

  const newStatus = action === 'approve' ? 'completed' : 'failed'
  db.prepare('UPDATE deposits SET status = ? WHERE id = ?').run(newStatus, req.params.id)

  auditLog(req.user.username, action === 'approve' ? '充值确认' : '充值拒绝', req.params.id,
    (action === 'approve' ? '确认到账' : '拒绝') + ' ¥' + order.amount, req.ip || '0.0.0.0')

  res.json({ success: true, status: newStatus })
})

app.get('/api/admin/withdrawals', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM withdrawals ORDER BY time DESC').all()
  const withdrawals = rows.map(r => ({
    ...r,
    riskLevel: r.risk_level
  }))
  res.json(withdrawals)
})

app.put('/api/admin/withdrawals/:id', authMiddleware, (req, res) => {
  const { action } = req.body
  const order = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(req.params.id)
  if (!order) return res.status(404).json({ error: 'Withdrawal not found' })

  let newStatus = 'pending'
  if (action === 'approve') newStatus = 'approved'
  else if (action === 'reject') newStatus = 'rejected'
  else if (action === 'review') newStatus = 'review'
  else if (action === 'complete') newStatus = 'completed'

  db.prepare('UPDATE withdrawals SET status = ? WHERE id = ?').run(newStatus, req.params.id)

  auditLog(req.user.username, '审批提现', req.params.id, action + ' ¥' + order.amount, req.ip || '0.0.0.0')

  res.json({ success: true, status: newStatus })
})

app.get('/api/admin/channels', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM payment_channels ORDER BY id').all()
  const channels = rows.map(r => ({
    ...r,
    minAmount: r.min_amount,
    maxAmount: r.max_amount,
    todayVolume: r.today_volume,
    walletCount: r.wallet_count
  }))
  res.json(channels)
})

app.get('/api/admin/settlements', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM settlements ORDER BY id').all()
  const settlements = rows.map(r => ({
    ...r,
    totalBets: r.total_bets,
    commissionRate: r.commission_rate,
    commissionAmount: r.commission_amount,
    upstreamDeduction: r.upstream_deduction,
    paidTime: r.paid_time
  }))
  res.json(settlements)
})

app.get('/api/admin/financial-summary', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM financial_summary ORDER BY date DESC').all()
  res.json(rows)
})

// ==================== GAMES ====================
app.get('/api/admin/games', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM games ORDER BY revenue DESC').all()
  const games = rows.map(r => ({
    ...r,
    isHot: !!r.is_hot,
    isNew: !!r.is_new
  }))
  res.json(games)
})

app.post('/api/admin/games', authMiddleware, validateCreateGame, handleValidationErrors, (req, res, next) => {
  const { name, provider, category, status, rtp, isHot, isNew } = req.body
  const count = db.prepare('SELECT COUNT(*) as c FROM games').get().c
  const id = 'G' + String(count + 1).padStart(3, '0')
  db.prepare('INSERT INTO games (id, name, provider, category, status, rtp, is_hot, is_new) VALUES (?,?,?,?,?,?,?,?)').run(
    id, name, provider || '', category || '', status || 'active', rtp || 96.0, isHot ? 1 : 0, isNew ? 1 : 0
  )
  auditLog(req.user.username, '创建游戏', id, '创建游戏 ' + name, req.ip || '0.0.0.0')
  res.json({ success: true, id })
})

app.put('/api/admin/games/:id', authMiddleware, validateUpdateGame, handleValidationErrors, (req, res, next) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)
  if (!game) return res.status(404).json({ error: 'Game not found' })

  const { name, provider, category, status, rtp, isHot, isNew } = req.body
  db.prepare(`UPDATE games SET
    name = COALESCE(?, name),
    provider = COALESCE(?, provider),
    category = COALESCE(?, category),
    status = COALESCE(?, status),
    rtp = COALESCE(?, rtp),
    is_hot = COALESCE(?, is_hot),
    is_new = COALESCE(?, is_new)
    WHERE id = ?`).run(
    name, provider, category, status, rtp,
    isHot !== undefined ? (isHot ? 1 : 0) : null,
    isNew !== undefined ? (isNew ? 1 : 0) : null,
    req.params.id
  )
  res.json({ success: true })
})

app.delete('/api/admin/games/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.get('/api/admin/providers', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM providers ORDER BY id').all()
  const providers = rows.map(r => ({
    code: r.id,
    name: r.name,
    category: r.category,
    gameCount: r.games,
    status: r.status,
    apiHealth: r.api_health,
    balance: r.balance,
    responseTime: r.response_time,
    apiKey: r.api_key,
    apiLatency: r.api_latency
  }))
  res.json(providers)
})

app.post('/api/admin/providers', authMiddleware, validateCreateProvider, handleValidationErrors, (req, res, next) => {
  try {
    const { id, name, category, games, status } = req.body
    db.prepare('INSERT INTO providers (id, name, category, games, status) VALUES (?,?,?,?,?)').run(
      id, name, category || '', games || 0, status || 'active'
    )
    auditLog(req.user.username, '创建供应商', id, '创建供应商 ' + name, req.ip || '0.0.0.0')
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

app.put('/api/admin/providers/:id', authMiddleware, (req, res) => {
  const provider = db.prepare('SELECT * FROM providers WHERE id = ?').get(req.params.id)
  if (!provider) return res.status(404).json({ error: 'Provider not found' })

  const { name, category, status, apiKey } = req.body
  db.prepare(`UPDATE providers SET
    name = COALESCE(?, name),
    category = COALESCE(?, category),
    status = COALESCE(?, status),
    api_key = COALESCE(?, api_key)
    WHERE id = ?`).run(name, category, status, apiKey, req.params.id)
  res.json({ success: true })
})

app.get('/api/admin/bets', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM bets ORDER BY time DESC').all()
  const bets = rows.map(r => ({
    ...r,
    betAmount: r.bet_amount,
    winAmount: r.win_amount
  }))
  res.json(bets)
})

// ==================== VIP ====================
app.get('/api/admin/vip-levels', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM vip_levels ORDER BY level').all()
  const levels = rows.map(r => ({
    level: r.level,
    name: r.name,
    upgradeDeposit: r.upgrade_deposit,
    upgradeWager: r.upgrade_wager,
    monthlyBonus: r.monthly_bonus,
    birthdayBonus: r.birthday_bonus,
    withdrawLimit: r.withdraw_limit === 'unlimited' ? 'unlimited' : Number(r.withdraw_limit)
  }))
  res.json(levels)
})

app.put('/api/admin/vip-levels/:level', authMiddleware, (req, res) => {
  const { name, upgradeDeposit, upgradeWager, monthlyBonus, birthdayBonus, withdrawLimit } = req.body
  db.prepare(`UPDATE vip_levels SET
    name = COALESCE(?, name),
    upgrade_deposit = COALESCE(?, upgrade_deposit),
    upgrade_wager = COALESCE(?, upgrade_wager),
    monthly_bonus = COALESCE(?, monthly_bonus),
    birthday_bonus = COALESCE(?, birthday_bonus),
    withdraw_limit = COALESCE(?, withdraw_limit)
    WHERE level = ?`).run(name, upgradeDeposit, upgradeWager, monthlyBonus, birthdayBonus,
    withdrawLimit !== undefined ? String(withdrawLimit) : null, req.params.level)
  res.json({ success: true })
})

// ==================== RAKEBACK ====================
app.get('/api/admin/rakeback/config', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM rakeback_config ORDER BY id').all()
  const config = rows.map(r => ({
    ...r,
    gameType: r.game_type,
    minBet: r.min_bet
  }))
  res.json(config)
})

app.put('/api/admin/rakeback/config/:id', authMiddleware, (req, res) => {
  const { rate, minBet, status } = req.body
  db.prepare(`UPDATE rakeback_config SET
    rate = COALESCE(?, rate),
    min_bet = COALESCE(?, min_bet),
    status = COALESCE(?, status)
    WHERE id = ?`).run(rate, minBet, status, req.params.id)
  res.json({ success: true })
})

app.get('/api/admin/rakeback/records', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM rakeback_records ORDER BY time DESC').all()
  const records = rows.map(r => ({
    ...r,
    gameType: r.game_type,
    betAmount: r.bet_amount,
    rakebackAmount: r.rakeback_amount
  }))
  res.json(records)
})

// ==================== PROMOTIONS ====================
app.get('/api/admin/activities', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM promotions ORDER BY id').all()
  const activities = rows.map(r => ({
    ...r,
    startTime: r.start_time,
    endTime: r.end_time,
    minDeposit: r.min_deposit,
    bonusRate: r.bonus_rate,
    maxBonus: r.max_bonus
  }))
  res.json(activities)
})

app.post('/api/admin/activities', authMiddleware, validateCreateActivity, handleValidationErrors, (req, res, next) => {
  try {
    const { name, type, status, startTime, endTime, minDeposit, bonusRate, wagering, maxBonus } = req.body
    const count = db.prepare('SELECT COUNT(*) as c FROM promotions').get().c
    const id = 'ACT' + String(count + 1).padStart(3, '0')
    db.prepare('INSERT INTO promotions (id, name, type, status, start_time, end_time, min_deposit, bonus_rate, wagering, max_bonus) VALUES (?,?,?,?,?,?,?,?,?,?)').run(
      id, name, type || '', status || 'active', startTime || '', endTime || '', minDeposit || 0, bonusRate || 0, wagering || 0, maxBonus || 0
    )
    auditLog(req.user.username, '创建活动', id, '创建活动 ' + name, req.ip || '0.0.0.0')
    res.json({ success: true, id })
  } catch (err) {
    next(err)
  }
})

app.put('/api/admin/activities/:id', authMiddleware, validateUpdateActivity, handleValidationErrors, (req, res, next) => {
  const promo = db.prepare('SELECT * FROM promotions WHERE id = ?').get(req.params.id)
  if (!promo) return res.status(404).json({ error: 'Activity not found' })

  const { name, type, status, startTime, endTime, minDeposit, bonusRate, wagering, maxBonus } = req.body
  db.prepare(`UPDATE promotions SET
    name = COALESCE(?, name),
    type = COALESCE(?, type),
    status = COALESCE(?, status),
    start_time = COALESCE(?, start_time),
    end_time = COALESCE(?, end_time),
    min_deposit = COALESCE(?, min_deposit),
    bonus_rate = COALESCE(?, bonus_rate),
    wagering = COALESCE(?, wagering),
    max_bonus = COALESCE(?, max_bonus)
    WHERE id = ?`).run(name, type, status, startTime, endTime, minDeposit, bonusRate, wagering, maxBonus, req.params.id)
  res.json({ success: true })
})

app.delete('/api/admin/activities/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM promotions WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

// ==================== MESSAGES ====================
app.get('/api/admin/messages', authMiddleware, (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY sent_at DESC').all()
  const mapped = messages.map(r => ({
    ...r,
    targetType: r.target_type,
    sentAt: r.sent_at
  }))
  res.json(mapped)
})

app.post('/api/admin/messages', authMiddleware, validateCreateMessage, handleValidationErrors, (req, res, next) => {
  try {
    const { title, target, targetType, type, content } = req.body
    db.prepare('INSERT INTO messages (title, target, target_type, type, status, content) VALUES (?,?,?,?,?,?)').run(
      title, target || '全部用户', targetType || 'all', type || 'mail', 'sent', content || ''
    )
    auditLog(req.user.username, '发送消息', title, '发送消息: ' + title, req.ip || '0.0.0.0')
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

app.delete('/api/admin/messages/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.get('/api/admin/system-notifications', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM system_notifications ORDER BY created_at DESC').all()
  const notifications = rows.map(r => ({
    ...r,
    createdAt: r.created_at
  }))
  res.json(notifications)
})

app.get('/api/admin/chat-sessions', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM chat_sessions ORDER BY updated_at DESC').all()
  const sessions = rows.map(r => ({
    ...r,
    lastMessage: r.last_message,
    updatedAt: r.updated_at
  }))
  res.json(sessions)
})

app.put('/api/admin/chat-sessions/:id', authMiddleware, (req, res) => {
  const { status } = req.body
  db.prepare('UPDATE chat_sessions SET status = ? WHERE id = ?').run(status, req.params.id)
  res.json({ success: true })
})

// ==================== RISK ====================
app.get('/api/admin/risk/rules', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM risk_rules ORDER BY id').all()
  res.json(rows)
})

app.put('/api/admin/risk/rules/:id', authMiddleware, (req, res) => {
  const rule = db.prepare('SELECT * FROM risk_rules WHERE id = ?').get(req.params.id)
  if (!rule) return res.status(404).json({ error: 'Rule not found' })

  const newStatus = rule.status === 'active' ? 'inactive' : 'active'
  db.prepare('UPDATE risk_rules SET status = ? WHERE id = ?').run(newStatus, req.params.id)
  res.json({ success: true, status: newStatus })
})

app.post('/api/admin/risk/rules', authMiddleware, validateCreateRiskRule, handleValidationErrors, (req, res, next) => {
  try {
    const { name, description, threshold, status } = req.body
    db.prepare('INSERT INTO risk_rules (name, description, threshold, status) VALUES (?,?,?,?)').run(
      name, description || '', threshold || 0, status || 'active'
    )
    auditLog(req.user.username, '创建风控规则', name, '创建风控规则: ' + name, req.ip || '0.0.0.0')
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

app.get('/api/admin/risk/blacklist', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM ip_blacklist ORDER BY added_time DESC').all()
  const blacklist = rows.map(r => ({
    ...r,
    addedBy: r.added_by,
    addedTime: r.added_time,
    hitCount: r.hit_count
  }))
  res.json(blacklist)
})

app.post('/api/admin/risk/blacklist', authMiddleware, validateAddBlacklistIP, handleValidationErrors, (req, res, next) => {
  try {
    const { ip, reason } = req.body
    db.prepare('INSERT INTO ip_blacklist (ip, reason, added_by) VALUES (?,?,?)').run(
      ip, reason || '', req.user.username
    )
    auditLog(req.user.username, '添加IP黑名单', ip, reason || '', req.ip || '0.0.0.0')
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

app.delete('/api/admin/risk/blacklist/:ip', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM ip_blacklist WHERE ip = ?').run(req.params.ip)
  res.json({ success: true })
})

// ==================== SYSTEM ====================
app.get('/api/admin/admins', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT id, username, role, status, last_login, created_at FROM admins ORDER BY id').all()
  const admins = rows.map(r => ({
    ...r,
    lastLogin: r.last_login,
    created: r.created_at,
    role: r.role === 'superadmin' ? '超级管理员' : r.role === 'finance' ? '财务管理员' : r.role === 'cs' ? '客服管理员' : r.role === 'risk' ? '风控管理员' : '备用管理员'
  }))
  res.json(admins)
})

app.post('/api/admin/admins', authMiddleware, validateCreateAdmin, handleValidationErrors, async (req, res, next) => {
  try {
    const { username, role, displayName } = req.body
    const pwd = req.body.password
    const hashedPassword = await bcrypt.hash(pwd, 10)
    db.prepare('INSERT INTO admins (username, password, role, display_name) VALUES (?,?,?,?)').run(
      username, hashedPassword, role || 'admin', displayName || username
    )
    auditLog(req.user.username, '创建管理员', username, '创建管理员 ' + username, req.ip || '0.0.0.0')
    res.json({ success: true })
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Username already exists' })
    }
    next(err)
  }
})

app.put('/api/admin/admins/:id/status', authMiddleware, (req, res) => {
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.params.id)
  if (!admin) return res.status(404).json({ error: 'Admin not found' })

  const newStatus = admin.status === 'active' ? 'inactive' : 'active'
  db.prepare('UPDATE admins SET status = ? WHERE id = ?').run(newStatus, req.params.id)
  res.json({ success: true, status: newStatus })
})

app.delete('/api/admin/admins/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM admins WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.get('/api/admin/logs', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY time DESC LIMIT 100').all()
  res.json(rows)
})

app.get('/api/admin/announcements', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all()
  const announcements = rows.map(r => ({
    ...r,
    created: r.created_at
  }))
  res.json(announcements)
})

app.post('/api/admin/announcements', authMiddleware, validateCreateAnnouncement, handleValidationErrors, (req, res, next) => {
  try {
    const { title, content, target, status } = req.body
    db.prepare('INSERT INTO announcements (title, content, target, status) VALUES (?,?,?,?)').run(
      title, content || '', target || '全部代理', status || 'active'
    )
    auditLog(req.user.username, '创建公告', title, '创建公告: ' + title, req.ip || '0.0.0.0')
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

app.delete('/api/admin/announcements/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id)
  res.json({ success: true })
})

app.get('/api/admin/settings', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM system_settings ORDER BY category, key').all()
  // Group by category
  const settings = {}
  for (const r of rows) {
    if (!settings[r.category]) settings[r.category] = {}
    settings[r.category][r.key] = r.value
  }
  res.json(settings)
})

app.put('/api/admin/settings', authMiddleware, (req, res) => {
  const updates = req.body
  const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, category) VALUES (?,?,?)')
  const tx = db.transaction((data) => {
    for (const [category, entries] of Object.entries(data)) {
      for (const [key, value] of Object.entries(entries)) {
        stmt.run(key, String(value), category)
      }
    }
  })
  tx(updates)
  res.json({ success: true })
})

// ==================== COMPLIANCE ====================

// GET /api/admin/compliance/dashboard - Compliance KPIs
app.get('/api/admin/compliance/dashboard', authMiddleware, (req, res) => {
  const kycPending = db.prepare("SELECT COUNT(*) as count FROM kyc_documents WHERE status = 'pending'").get().count
  const kycApproved = db.prepare("SELECT COUNT(*) as count FROM kyc_documents WHERE status = 'approved'").get().count
  const kycRejected = db.prepare("SELECT COUNT(*) as count FROM kyc_documents WHERE status = 'rejected'").get().count
  const kycTotal = db.prepare("SELECT COUNT(*) as count FROM kyc_documents").get().count
  const amlOpen = db.prepare("SELECT COUNT(*) as count FROM aml_alerts WHERE status = 'open'").get().count
  const amlTotal = db.prepare("SELECT COUNT(*) as count FROM aml_alerts").get().count
  const selfExcludedActive = db.prepare("SELECT COUNT(*) as count FROM self_exclusions WHERE status = 'active'").get().count
  const selfExcludedTotal = db.prepare("SELECT COUNT(*) as count FROM self_exclusions").get().count
  const usersWithLimits = db.prepare("SELECT COUNT(DISTINCT user_id) as count FROM user_limits").get().count

  // Recent AML alerts
  const recentAlerts = db.prepare("SELECT * FROM aml_alerts ORDER BY created_at DESC LIMIT 5").all()

  // Recent KYC submissions
  const recentKyc = db.prepare("SELECT * FROM kyc_documents ORDER BY submitted_at DESC LIMIT 5").all()

  res.json({
    kpi: {
      kycPending,
      kycApproved,
      kycRejected,
      kycTotal,
      amlOpenAlerts: amlOpen,
      amlTotalAlerts: amlTotal,
      selfExcludedUsers: selfExcludedActive,
      selfExcludedTotal,
      usersWithLimits
    },
    recentAlerts: recentAlerts.map(a => ({
      ...a,
      createdAt: a.created_at,
      resolvedAt: a.resolved_at,
      resolvedBy: a.resolved_by,
      alertType: a.alert_type,
      userId: a.user_id,
      transactionId: a.transaction_id
    })),
    recentKyc: recentKyc.map(k => ({
      ...k,
      userId: k.user_id,
      documentType: k.document_type,
      documentUrl: k.document_url,
      rejectReason: k.reject_reason,
      submittedAt: k.submitted_at,
      reviewedAt: k.reviewed_at,
      reviewedBy: k.reviewed_by
    }))
  })
})

// GET /api/admin/compliance/kyc - List KYC documents
app.get('/api/admin/compliance/kyc', authMiddleware, (req, res) => {
  const status = req.query.status
  let query = 'SELECT k.*, m.username FROM kyc_documents k LEFT JOIN members m ON k.user_id = m.id'
  const params = []
  if (status) {
    query += ' WHERE k.status = ?'
    params.push(status)
  }
  query += ' ORDER BY k.submitted_at DESC'
  const rows = db.prepare(query).all(...params)
  res.json(rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    username: r.username || r.user_id,
    documentType: r.document_type,
    documentUrl: r.document_url,
    status: r.status,
    rejectReason: r.reject_reason,
    submittedAt: r.submitted_at,
    reviewedAt: r.reviewed_at,
    reviewedBy: r.reviewed_by
  })))
})

// PUT /api/admin/compliance/kyc/:id - Approve/Reject KYC
app.put('/api/admin/compliance/kyc/:id', authMiddleware, (req, res) => {
  const { action, rejectReason } = req.body
  const kyc = db.prepare('SELECT * FROM kyc_documents WHERE id = ?').get(req.params.id)
  if (!kyc) return res.status(404).json({ error: 'KYC document not found' })

  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  db.prepare(`UPDATE kyc_documents SET status = ?, reject_reason = ?, reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?`).run(
    newStatus, action === 'reject' ? (rejectReason || '') : '', req.user.username, req.params.id
  )

  auditLog(req.user.username, action === 'approve' ? 'KYC审批通过' : 'KYC审批拒绝', kyc.user_id, 'KYC ' + action + ' for ' + kyc.user_id, req.ip || '0.0.0.0')

  res.json({ success: true, status: newStatus })
})

// GET /api/admin/compliance/aml/alerts - AML alerts list
app.get('/api/admin/compliance/aml/alerts', authMiddleware, (req, res) => {
  const status = req.query.status
  let query = 'SELECT a.*, m.username FROM aml_alerts a LEFT JOIN members m ON a.user_id = m.id'
  const params = []
  if (status) {
    query += ' WHERE a.status = ?'
    params.push(status)
  }
  query += ' ORDER BY a.created_at DESC'
  const rows = db.prepare(query).all(...params)
  res.json(rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    username: r.username || r.user_id,
    transactionId: r.transaction_id,
    alertType: r.alert_type,
    amount: r.amount,
    description: r.description,
    status: r.status,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    resolvedBy: r.resolved_by
  })))
})

// PUT /api/admin/compliance/aml/alerts/:id - Resolve AML alert
app.put('/api/admin/compliance/aml/alerts/:id', authMiddleware, (req, res) => {
  const { action } = req.body
  const alert = db.prepare('SELECT * FROM aml_alerts WHERE id = ?').get(req.params.id)
  if (!alert) return res.status(404).json({ error: 'AML alert not found' })

  const newStatus = action === 'dismiss' ? 'dismissed' : action === 'escalate' ? 'escalated' : 'resolved'
  db.prepare(`UPDATE aml_alerts SET status = ?, resolved_at = datetime('now'), resolved_by = ? WHERE id = ?`).run(
    newStatus, req.user.username, req.params.id
  )

  auditLog(req.user.username, 'AML处理', String(alert.id), 'AML alert ' + action + ': ' + alert.alert_type + ' for ' + alert.user_id, req.ip || '0.0.0.0')

  res.json({ success: true, status: newStatus })
})

// GET /api/admin/compliance/exclusions - Self-exclusion list
app.get('/api/admin/compliance/exclusions', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT e.*, m.username FROM self_exclusions e LEFT JOIN members m ON e.user_id = m.id ORDER BY e.start_date DESC').all()
  res.json(rows.map(r => ({
    id: r.id,
    userId: r.user_id,
    username: r.username || r.user_id,
    exclusionType: r.exclusion_type,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status,
    reason: r.reason
  })))
})

// PUT /api/admin/compliance/exclusions/:id - Manage exclusion (revoke)
app.put('/api/admin/compliance/exclusions/:id', authMiddleware, (req, res) => {
  const { action } = req.body
  const exclusion = db.prepare('SELECT * FROM self_exclusions WHERE id = ?').get(req.params.id)
  if (!exclusion) return res.status(404).json({ error: 'Exclusion not found' })

  if (action === 'revoke') {
    db.prepare("UPDATE self_exclusions SET status = 'revoked' WHERE id = ?").run(req.params.id)
    // Reactivate member account
    db.prepare("UPDATE members SET status = 'active' WHERE id = ?").run(exclusion.user_id)
  }

  auditLog(req.user.username, '自我排除管理', exclusion.user_id, action + ' exclusion for ' + exclusion.user_id, req.ip || '0.0.0.0')

  res.json({ success: true })
})

// GET /api/admin/compliance/settings - Compliance/responsible gaming settings
app.get('/api/admin/compliance/settings', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM compliance_settings ORDER BY category, key').all()
  const settings = {}
  for (const r of rows) {
    if (!settings[r.category]) settings[r.category] = {}
    settings[r.category][r.key] = r.value
  }

  // Return defaults if no settings exist
  if (!settings.responsible_gaming) {
    settings.responsible_gaming = {
      default_daily_deposit_limit: '50000',
      default_weekly_deposit_limit: '200000',
      default_monthly_deposit_limit: '500000',
      default_daily_bet_limit: '100000',
      default_weekly_bet_limit: '500000',
      default_monthly_bet_limit: '1000000',
      cooling_off_periods: '24h,7d,30d,6m,permanent',
      age_verification_required: 'true',
      minimum_age: '18',
      aml_threshold: '10000'
    }
  }

  res.json(settings)
})

// PUT /api/admin/compliance/settings - Update compliance settings
app.put('/api/admin/compliance/settings', authMiddleware, (req, res) => {
  const updates = req.body
  const stmt = db.prepare("INSERT OR REPLACE INTO compliance_settings (key, value, category, updated_at) VALUES (?,?,?,datetime('now'))")
  const tx = db.transaction((data) => {
    for (const [category, entries] of Object.entries(data)) {
      for (const [key, value] of Object.entries(entries)) {
        stmt.run(key, String(value), category)
      }
    }
  })
  tx(updates)

  auditLog(req.user.username, '合规设置更新', 'compliance_settings', 'Updated compliance settings', req.ip || '0.0.0.0')

  res.json({ success: true })
})

// ==================== BANNERS ====================
app.get('/api/admin/banners', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM banners ORDER BY sort').all()
  const banners = rows.map(r => ({
    ...r,
    startTime: r.start_time,
    endTime: r.end_time
  }))
  res.json(banners)
})

// Catch-all for admin SPA routing
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDist, 'index.html'))
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Catch-all for H5 SPA routing (must be last)
app.get('*', (req, res) => {
  const h5Index = path.join(h5Dist, 'index.html')
  res.sendFile(h5Index, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' })
    }
  })
})

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, _next) => {
  const timestamp = new Date().toISOString()
  console.error('[' + timestamp + '] Error:', err.message)
  if (NODE_ENV !== 'production') {
    console.error(err.stack)
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS not allowed' })
  }

  const statusCode = err.statusCode || err.status || 500
  res.status(statusCode).json({
    error: NODE_ENV === 'production' ? '服务器内部错误' : err.message
  })
})

app.listen(PORT, () => {
  console.log('[' + new Date().toISOString() + '] Admin API server running on port ' + PORT + ' (' + NODE_ENV + ')')
  console.log('H5 API available at /api/h5/*')
})

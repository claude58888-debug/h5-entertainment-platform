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
import { validateAdminLogin, validateCreateMember, validateCreateAgent, validateUpdateAgent, validateCreateGame, validateUpdateGame, validateCreateAdmin, validateCreateProvider, validateCreateActivity, validateUpdateActivity, validateCreateMessage, validateCreateAnnouncement, validateUpdateAnnouncement, validateCreateRiskRule, validateAddBlacklistIP, validateManualDeposit, validateBatchWithdrawal, validateAutoReviewRule, validateHotScore, validateRecommend, validateVipAdjust, validateTagsUpdate, validateBalanceAdjust, handleValidationErrors } from './validation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
// JWT_SECRET must be set via environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-admin-server-key'

// ==================== IN-MEMORY CACHE ====================
const cache = new Map()

function cacheGet(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function cacheSet(key, data, ttlMs) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs })
}

function cacheInvalidate(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// Initialize database
initDB()

// Trust proxy for correct IP detection behind reverse proxies (needed for rate limiting)
app.set('trust proxy', 1)

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
  const { startDate, endDate } = req.query

  // Use date range cache key if provided
  const cacheKey = startDate && endDate ? `dashboard:${startDate}:${endDate}` : 'dashboard'
  const cached = cacheGet(cacheKey)
  if (cached) return res.json(cached)

  const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count

  // Date-filtered queries
  let newMembersQuery, depositQuery, withdrawalQuery, revenueTrendQuery, depositByChannelQuery
  if (startDate && endDate) {
    newMembersQuery = db.prepare('SELECT COUNT(*) as count FROM members WHERE registered >= ? AND registered <= ?').get(startDate, endDate).count
    depositQuery = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed' AND time >= ? AND time <= ?").get(startDate, endDate + ' 23:59:59').total
    withdrawalQuery = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status IN ('completed', 'approved') AND time >= ? AND time <= ?").get(startDate, endDate + ' 23:59:59').total
    revenueTrendQuery = db.prepare('SELECT * FROM revenue_trend WHERE date >= ? AND date <= ? ORDER BY date').all(startDate, endDate)
    depositByChannelQuery = db.prepare("SELECT channel as name, SUM(amount) as value FROM deposits WHERE status = 'completed' AND time >= ? AND time <= ? GROUP BY channel").all(startDate, endDate + ' 23:59:59')
  } else {
    newMembersQuery = db.prepare("SELECT COUNT(*) as count FROM members WHERE registered >= date('now', '-1 day')").get().count
    depositQuery = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed'").get().total
    withdrawalQuery = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status IN ('completed', 'approved')").get().total
    revenueTrendQuery = db.prepare('SELECT * FROM revenue_trend ORDER BY date').all()
    depositByChannelQuery = db.prepare("SELECT channel as name, SUM(amount) as value FROM deposits WHERE status = 'completed' GROUP BY channel").all()
  }

  const onlineNow = 1893 // simulated
  const todayProfit = (depositQuery || 0) - (withdrawalQuery || 0)

  // Agent stats
  const totalAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get().count
  const activeAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'active'").get().count

  const kpi = {
    totalMembers: totalMembers || 128456,
    todayNewMembers: newMembersQuery || 342,
    onlineNow,
    todayDeposit: depositQuery || 2856000,
    todayWithdrawal: withdrawalQuery || 1245000,
    todayProfit: todayProfit || 1611000,
    totalAgents: totalAgents || 0,
    activeAgents: activeAgents || 0
  }

  const topGamesGGR = db.prepare('SELECT name, revenue as ggr FROM games ORDER BY revenue DESC LIMIT 5').all()

  const realtimeAlerts = [
    { id: 1, type: 'warning', text: '会员 user_8823 发起大额提现 ¥50,000', time: '2分钟前', level: 'high' },
    { id: 2, type: 'danger', text: '检测到疑似多开账号 IP: 103.45.67.89', time: '5分钟前', level: 'high' },
    { id: 3, type: 'warning', text: '代理 "金沙娱乐" 余额不足 ¥10,000', time: '12分钟前', level: 'medium' },
    { id: 4, type: 'info', text: 'PG电子 API 响应延迟升高 (>2s)', time: '18分钟前', level: 'medium' },
    { id: 5, type: 'warning', text: '会员 user_5521 连续提现3次，累计 ¥80,000', time: '25分钟前', level: 'high' }
  ]

  const result = { kpi, revenueTrend: revenueTrendQuery, topGamesGGR, depositByChannel: depositByChannelQuery, realtimeAlerts }
  cacheSet(cacheKey, result, 30000)
  res.json(result)
})

// Dashboard stats - real aggregated data
app.get('/api/admin/dashboard/stats', authMiddleware, (req, res) => {
  const cached = cacheGet('dashboard:stats')
  if (cached) return res.json(cached)

  const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count
  const todayRegistrations = db.prepare("SELECT COUNT(*) as count FROM members WHERE registered >= date('now')").get().count
  const totalDeposits = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed'").get().total
  const totalWithdrawals = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status IN ('completed', 'approved')").get().total
  const todayDeposits = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM deposits WHERE status = 'completed' AND time >= date('now')").get().total
  const todayWithdrawals = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM withdrawals WHERE status IN ('completed', 'approved') AND time >= date('now')").get().total
  const activeOnline = Math.floor(Math.random() * 500) + 100 // placeholder

  const result = {
    totalMembers,
    todayRegistrations,
    totalDeposits,
    totalWithdrawals,
    todayDeposits,
    todayWithdrawals,
    todayProfit: todayDeposits - todayWithdrawals,
    activeOnline
  }
  cacheSet('dashboard:stats', result, 30000)
  res.json(result)
})

// Dashboard alerts - counts of pending items and recent risk events
app.get('/api/admin/dashboard/alerts', authMiddleware, (req, res) => {
  const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM withdrawals WHERE status = 'pending'").get().count
  const pendingKyc = db.prepare("SELECT COUNT(*) as count FROM kyc_documents WHERE status = 'pending'").get().count
  const openAmlAlerts = db.prepare("SELECT COUNT(*) as count FROM aml_alerts WHERE status = 'open'").get().count

  const recentRiskEvents = db.prepare("SELECT * FROM aml_alerts ORDER BY created_at DESC LIMIT 10").all().map(r => ({
    id: r.id,
    userId: r.user_id,
    transactionId: r.transaction_id,
    alertType: r.alert_type,
    amount: r.amount,
    description: r.description,
    status: r.status,
    createdAt: r.created_at
  }))

  const recentSuspicious = db.prepare("SELECT r.name, r.triggers, r.status FROM risk_rules r WHERE r.status = 'active' ORDER BY r.triggers DESC LIMIT 5").all()

  res.json({
    pendingWithdrawals: pendingWithdrawals || 0,
    pendingKyc: pendingKyc || 0,
    suspiciousActivities: openAmlAlerts || 0,
    recentRiskEvents,
    activeRiskRules: recentSuspicious
  })
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

// Member detail with aggregated data
app.get('/api/admin/members/:id/detail', authMiddleware, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })

  member.tags = JSON.parse(member.tags || '[]')
  member.totalDeposit = member.total_deposit
  member.totalWithdraw = member.total_withdraw
  member.lastLogin = member.last_login

  // Aggregate bet stats
  const betStats = db.prepare('SELECT COUNT(*) as totalBets, COALESCE(SUM(bet_amount), 0) as totalBetAmount, COALESCE(SUM(win_amount), 0) as totalWinAmount FROM bets WHERE member = ?').get(req.params.id)

  // Recent bets
  const recentBets = db.prepare('SELECT * FROM bets WHERE member = ? ORDER BY time DESC LIMIT 50').all(req.params.id)
  const bets = recentBets.map(r => ({
    ...r,
    betAmount: r.bet_amount,
    winAmount: r.win_amount
  }))

  // Recent transactions (deposits + withdrawals)
  const deposits = db.prepare('SELECT id, amount, channel, status, time, "deposit" as type FROM deposits WHERE member = ? ORDER BY time DESC LIMIT 30').all(req.params.id)
  const withdrawals = db.prepare('SELECT id, amount, channel, status, time, "withdrawal" as type FROM withdrawals WHERE member = ? ORDER BY time DESC LIMIT 30').all(req.params.id)
  const transactions = [...deposits, ...withdrawals].sort((a, b) => (b.time || '').localeCompare(a.time || ''))

  // H5 transactions
  const h5Transactions = db.prepare('SELECT * FROM h5_transactions WHERE member_id = ? ORDER BY created_at DESC LIMIT 50').all(req.params.id)

  // Device fingerprint info (table may not exist)
  let devices = []
  try {
    devices = db.prepare('SELECT * FROM device_fingerprints WHERE user_id = ? ORDER BY last_seen DESC LIMIT 5').all(req.params.id)
  } catch (e) {
    devices = []
  }

  res.json({
    ...member,
    betStats,
    bets,
    transactions,
    h5Transactions,
    devices
  })
})

// VIP manual adjustment
app.put('/api/admin/members/:id/vip', authMiddleware, validateVipAdjust, handleValidationErrors, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })

  const { level, reason } = req.body
  const oldLevel = member.vip
  db.prepare('UPDATE members SET vip = ? WHERE id = ?').run(level, req.params.id)

  auditLog(req.user.username, 'VIP调整', req.params.id, `VIP ${oldLevel} → ${level}, 原因: ${reason || '手动调整'}`, req.ip || '0.0.0.0')

  res.json({ success: true, oldLevel, newLevel: level })
})

// Tags update
app.put('/api/admin/members/:id/tags', authMiddleware, validateTagsUpdate, handleValidationErrors, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })

  const { tags } = req.body
  const tagsJson = JSON.stringify(tags || [])
  db.prepare('UPDATE members SET tags = ? WHERE id = ?').run(tagsJson, req.params.id)

  auditLog(req.user.username, '更新标签', req.params.id, '标签: ' + (tags || []).join(', '), req.ip || '0.0.0.0')

  res.json({ success: true, tags })
})

// Force logout
app.post('/api/admin/members/:id/force-logout', authMiddleware, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })

  // Invalidate by updating last_login to trigger token mismatch on next request
  db.prepare("UPDATE members SET last_login = datetime('now') WHERE id = ?").run(req.params.id)

  auditLog(req.user.username, '强制下线', req.params.id, '强制下线会员 ' + member.username, req.ip || '0.0.0.0')

  res.json({ success: true, message: '已强制下线' })
})

// Manual balance adjustment
app.post('/api/admin/members/:id/balance-adjust', authMiddleware, validateBalanceAdjust, handleValidationErrors, (req, res) => {
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.params.id)
  if (!member) return res.status(404).json({ error: 'Member not found' })

  const { amount, type, reason } = req.body
  const adjustAmount = type === 'deduction' ? -Math.abs(amount) : Math.abs(amount)
  const newBalance = member.balance + adjustAmount

  if (newBalance < 0) {
    return res.status(400).json({ error: '余额不足，无法扣减' })
  }

  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, req.params.id)

  // Record in h5_transactions
  const txType = type === 'deduction' ? 'admin_deduction' : 'admin_deposit'
  db.prepare('INSERT INTO h5_transactions (member_id, type, amount, balance_after, description, status) VALUES (?,?,?,?,?,?)').run(
    req.params.id, txType, adjustAmount, newBalance, reason || '管理员手动调整', 'completed'
  )

  auditLog(req.user.username, '余额调整', req.params.id,
    `${type === 'deduction' ? '扣减' : '充值'} ¥${Math.abs(amount)}, 原因: ${reason || '手动调整'}, 余额: ¥${member.balance} → ¥${newBalance}`,
    req.ip || '0.0.0.0')

  cacheInvalidate('dashboard')

  res.json({ success: true, oldBalance: member.balance, newBalance, adjustAmount })
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

// Agent stats summary
app.get('/api/admin/agents/stats', authMiddleware, (req, res) => {
  const cached = cacheGet('agents:stats')
  if (cached) return res.json(cached)

  const totalAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get().count
  const activeAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'active'").get().count
  const frozenAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'frozen'").get().count
  const inactiveAgents = db.prepare("SELECT COUNT(*) as count FROM agents WHERE status = 'inactive'").get().count
  const totalBalance = db.prepare('SELECT COALESCE(SUM(balance), 0) as total FROM agents').get().total
  const totalMonthRevenue = db.prepare('SELECT COALESCE(SUM(month_revenue), 0) as total FROM agents').get().total
  const totalMembers = db.prepare('SELECT COALESCE(SUM(members), 0) as total FROM agents').get().total

  const topAgents = db.prepare('SELECT id, brand, members, month_revenue, balance, status FROM agents ORDER BY month_revenue DESC LIMIT 5').all().map(r => ({
    id: r.id,
    brand: r.brand,
    members: r.members,
    monthRevenue: r.month_revenue,
    balance: r.balance,
    status: r.status
  }))

  const result = {
    totalAgents,
    activeAgents,
    frozenAgents,
    inactiveAgents,
    totalBalance,
    totalMonthRevenue,
    totalMembers,
    topAgents
  }
  cacheSet('agents:stats', result, 60000)
  res.json(result)
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

// POST /api/finance/deposits/manual - Manual deposit creation (补单)
app.post('/api/finance/deposits/manual', authMiddleware, validateManualDeposit, handleValidationErrors, (req, res, next) => {
  try {
    const { member_id, amount, channel, txhash, reason } = req.body
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(member_id)
    if (!member) return res.status(404).json({ error: '会员不存在' })

    const count = db.prepare('SELECT COUNT(*) as c FROM deposits').get().c
    const id = 'MD' + String(count + 1).padStart(6, '0')
    db.prepare('INSERT INTO deposits (id, member, agent, amount, channel, status, tx_hash) VALUES (?,?,?,?,?,?,?)').run(
      id, member_id, member.agent || '', amount, channel || '手动补单', 'completed', txhash || ''
    )

    // Update member total_deposit
    db.prepare('UPDATE members SET total_deposit = total_deposit + ?, balance = balance + ? WHERE id = ?').run(amount, amount, member_id)

    auditLog(req.user.username, '手动补单', id, '手动补单 ¥' + amount + ' 给 ' + member_id + ' 原因: ' + reason, req.ip || '0.0.0.0')
    cacheInvalidate('dashboard')
    res.json({ success: true, id })
  } catch (err) {
    next(err)
  }
})

// GET /api/finance/deposits/export - Export deposits as CSV
app.get('/api/finance/deposits/export', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM deposits ORDER BY time DESC').all()
  const headers = ['订单号', '会员', '代理', '金额', '渠道', '状态', 'TxHash', '时间']
  const csvLines = [headers.join(',')]
  for (const r of rows) {
    csvLines.push([r.id, r.member, r.agent || '', r.amount, r.channel || '', r.status, r.tx_hash || '', r.time].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=deposits_export.csv')
  res.send('\uFEFF' + csvLines.join('\n'))
})

// GET /api/finance/withdrawals/export - Export withdrawals as CSV
app.get('/api/finance/withdrawals/export', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM withdrawals ORDER BY time DESC').all()
  const headers = ['订单号', '会员', '代理', '金额', '渠道', '状态', '提现地址', '风险等级', '时间']
  const csvLines = [headers.join(',')]
  for (const r of rows) {
    csvLines.push([r.id, r.member, r.agent || '', r.amount, r.channel || '', r.status, r.address || '', r.risk_level || '', r.time].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename=withdrawals_export.csv')
  res.send('\uFEFF' + csvLines.join('\n'))
})

// POST /api/finance/withdrawals/batch - Batch approve/reject withdrawals
app.post('/api/finance/withdrawals/batch', authMiddleware, validateBatchWithdrawal, handleValidationErrors, (req, res, next) => {
  try {
    const { ids, action, reason } = req.body
    const newStatus = action === 'approve' ? 'approved' : 'rejected'
    const stmt = db.prepare('UPDATE withdrawals SET status = ? WHERE id = ? AND status IN (\'pending\', \'review\')')
    let updated = 0
    for (const id of ids) {
      const result = stmt.run(newStatus, id)
      if (result.changes > 0) updated++
    }
    auditLog(req.user.username, '批量' + (action === 'approve' ? '通过' : '拒绝') + '提现', ids.join(','), '批量操作 ' + updated + ' 笔, 原因: ' + (reason || ''), req.ip || '0.0.0.0')
    res.json({ success: true, updated })
  } catch (err) {
    next(err)
  }
})

// GET /api/finance/auto-review-rules - List auto review rules
app.get('/api/finance/auto-review-rules', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM auto_review_rules ORDER BY id').all()
  res.json(rows.map(r => ({ ...r, enabled: !!r.enabled })))
})

// POST /api/finance/auto-review-rules - Create auto review rule
app.post('/api/finance/auto-review-rules', authMiddleware, validateAutoReviewRule, handleValidationErrors, (req, res, next) => {
  try {
    const { name, condition_field, operator, threshold, action, enabled } = req.body
    db.prepare('INSERT INTO auto_review_rules (name, condition_field, operator, threshold, action, enabled) VALUES (?,?,?,?,?,?)').run(
      name, condition_field, operator, threshold, action, enabled !== false ? 1 : 0
    )
    auditLog(req.user.username, '创建自动审核规则', name, '创建规则: ' + name, req.ip || '0.0.0.0')
    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

// PUT /api/finance/auto-review-rules/:id - Update auto review rule
app.put('/api/finance/auto-review-rules/:id', authMiddleware, (req, res) => {
  const rule = db.prepare('SELECT * FROM auto_review_rules WHERE id = ?').get(req.params.id)
  if (!rule) return res.status(404).json({ error: 'Rule not found' })

  const { name, condition_field, operator, threshold, action, enabled } = req.body
  db.prepare(`UPDATE auto_review_rules SET
    name = COALESCE(?, name),
    condition_field = COALESCE(?, condition_field),
    operator = COALESCE(?, operator),
    threshold = COALESCE(?, threshold),
    action = COALESCE(?, action),
    enabled = COALESCE(?, enabled)
    WHERE id = ?`).run(
    name || null, condition_field || null, operator || null,
    threshold !== undefined ? threshold : null,
    action || null,
    enabled !== undefined ? (enabled ? 1 : 0) : null,
    req.params.id
  )
  res.json({ success: true })
})

// DELETE /api/finance/auto-review-rules/:id - Delete auto review rule
app.delete('/api/finance/auto-review-rules/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM auto_review_rules WHERE id = ?').run(req.params.id)
  res.json({ success: true })
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
  const cached = cacheGet('admin:games')
  if (cached) return res.json(cached)

  const rows = db.prepare('SELECT * FROM games ORDER BY revenue DESC').all()
  const games = rows.map(r => ({
    ...r,
    isHot: !!r.is_hot,
    isNew: !!r.is_new,
    hotScore: r.hot_score || 0,
    isRecommended: !!r.is_recommended,
    recommendSort: r.recommend_sort || 0
  }))
  cacheSet('admin:games', games, 60000)
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
  cacheInvalidate('admin:games')
  cacheInvalidate('h5:games')
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
  cacheInvalidate('admin:games')
  cacheInvalidate('h5:games')
  res.json({ success: true })
})

app.delete('/api/admin/games/:id', authMiddleware, (req, res) => {
  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id)
  cacheInvalidate('admin:games')
  cacheInvalidate('h5:games')
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

// GET /api/games/bets - Bet records with pagination and filters
app.get('/api/games/bets', authMiddleware, (req, res) => {
  const { page = 1, pageSize = 20, search, provider, category, startDate, endDate } = req.query
  let where = []
  let params = []

  if (search) {
    where.push('(b.member LIKE ? OR b.id LIKE ?)')
    params.push('%' + search + '%', '%' + search + '%')
  }
  if (provider) {
    where.push('b.provider = ?')
    params.push(provider)
  }
  if (category) {
    where.push('g.category = ?')
    params.push(category)
  }
  if (startDate) {
    where.push('b.time >= ?')
    params.push(startDate)
  }
  if (endDate) {
    where.push('b.time <= ?')
    params.push(endDate)
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''
  const countQuery = `SELECT COUNT(*) as total FROM bets b LEFT JOIN games g ON b.game = g.name ${whereClause}`
  const total = db.prepare(countQuery).get(...params).total

  const offset = (Number(page) - 1) * Number(pageSize)
  const dataQuery = `SELECT b.*, g.category as game_category, m.agent as member_agent FROM bets b LEFT JOIN games g ON b.game = g.name LEFT JOIN members m ON b.member = m.id ${whereClause} ORDER BY b.time DESC LIMIT ? OFFSET ?`
  const rows = db.prepare(dataQuery).all(...params, Number(pageSize), offset)

  res.json({
    data: rows.map(r => ({
      id: r.id,
      member: r.member,
      agent: r.member_agent || '',
      game: r.game,
      provider: r.provider,
      category: r.game_category || '',
      betAmount: r.bet_amount,
      payout: r.win_amount,
      profit: r.bet_amount - r.win_amount,
      time: r.time,
      status: r.status
    })),
    total,
    page: Number(page),
    pageSize: Number(pageSize)
  })
})

// PUT /api/games/:id/hot-score - Update game hot score
app.put('/api/games/:id/hot-score', authMiddleware, validateHotScore, handleValidationErrors, (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)
  if (!game) return res.status(404).json({ error: 'Game not found' })

  const { hot_score } = req.body
  db.prepare('UPDATE games SET hot_score = ? WHERE id = ?').run(hot_score, req.params.id)
  cacheInvalidate('admin:games')
  cacheInvalidate('h5:games')
  res.json({ success: true })
})

// PUT /api/games/:id/recommend - Update game recommend settings
app.put('/api/games/:id/recommend', authMiddleware, validateRecommend, handleValidationErrors, (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id)
  if (!game) return res.status(404).json({ error: 'Game not found' })

  const { is_recommended, recommend_sort } = req.body
  db.prepare('UPDATE games SET is_recommended = ?, recommend_sort = COALESCE(?, recommend_sort) WHERE id = ?').run(
    is_recommended ? 1 : 0, recommend_sort !== undefined ? recommend_sort : null, req.params.id
  )
  cacheInvalidate('admin:games')
  cacheInvalidate('h5:games')
  res.json({ success: true })
})

// ==================== VIP ====================
app.get('/api/admin/vip-levels', authMiddleware, (req, res) => {
  const cached = cacheGet('admin:vip-levels')
  if (cached) return res.json(cached)

  const rows = db.prepare('SELECT * FROM vip_levels ORDER BY level').all()
  const levels = rows.map(r => ({
    id: r.id,
    level: r.level,
    name: r.name,
    minPoints: r.min_points,
    benefits: (() => { try { return JSON.parse(r.benefits_json || '[]') } catch { return [] } })(),
    benefitsJson: r.benefits_json,
    rakebackBonus: r.rakeback_bonus,
    monthlyReview: r.monthly_review,
    upgradeDeposit: r.upgrade_deposit,
    upgradeWager: r.upgrade_wager,
    monthlyBonus: r.monthly_bonus,
    birthdayBonus: r.birthday_bonus,
    withdrawLimit: r.withdraw_limit === 'unlimited' ? 'unlimited' : Number(r.withdraw_limit),
    status: r.status || 'active',
    pointsRule: r.points_rule,
    quarterlyReview: r.quarterly_review
  }))
  cacheSet('admin:vip-levels', levels, 120000)
  res.json(levels)
})

app.put('/api/admin/vip-levels/:id', authMiddleware, (req, res) => {
  const { name, minPoints, benefitsJson, rakebackBonus, monthlyReview, upgradeDeposit, upgradeWager, monthlyBonus, birthdayBonus, withdrawLimit, status, quarterlyReview } = req.body
  db.prepare(`UPDATE vip_levels SET
    name = COALESCE(?, name),
    min_points = COALESCE(?, min_points),
    benefits_json = COALESCE(?, benefits_json),
    rakeback_bonus = COALESCE(?, rakeback_bonus),
    monthly_review = COALESCE(?, monthly_review),
    upgrade_deposit = COALESCE(?, upgrade_deposit),
    upgrade_wager = COALESCE(?, upgrade_wager),
    monthly_bonus = COALESCE(?, monthly_bonus),
    birthday_bonus = COALESCE(?, birthday_bonus),
    withdraw_limit = COALESCE(?, withdraw_limit),
    status = COALESCE(?, status),
    quarterly_review = COALESCE(?, quarterly_review)
    WHERE id = ?`).run(
    name, minPoints, benefitsJson, rakebackBonus, monthlyReview,
    upgradeDeposit, upgradeWager, monthlyBonus, birthdayBonus,
    withdrawLimit !== undefined ? String(withdrawLimit) : null,
    status, quarterlyReview, req.params.id
  )
  cacheInvalidate('admin:vip-levels')
  auditLog(req.user.username, 'VIP等级更新', 'vip_level_' + req.params.id, 'Updated VIP level config', req.ip || '0.0.0.0')
  res.json({ success: true })
})

// ==================== RAKEBACK ====================
app.get('/api/admin/rakeback/config', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM rakeback_config ORDER BY id').all()
  const config = rows.map(r => ({
    ...r,
    gameType: r.game_type,
    houseEdgeMin: r.house_edge_min,
    houseEdgeMax: r.house_edge_max,
    defaultEdge: r.default_edge,
    minBet: r.min_bet
  }))
  res.json(config)
})

app.put('/api/admin/rakeback/config/:id', authMiddleware, (req, res) => {
  const { rate, minBet, status, houseEdgeMin, houseEdgeMax, defaultEdge } = req.body
  db.prepare(`UPDATE rakeback_config SET
    rate = COALESCE(?, rate),
    min_bet = COALESCE(?, min_bet),
    status = COALESCE(?, status),
    house_edge_min = COALESCE(?, house_edge_min),
    house_edge_max = COALESCE(?, house_edge_max),
    default_edge = COALESCE(?, default_edge)
    WHERE id = ?`).run(rate, minBet, status, houseEdgeMin, houseEdgeMax, defaultEdge, req.params.id)
  auditLog(req.user.username, '返水配置更新', 'rakeback_config_' + req.params.id, 'Updated rakeback config', req.ip || '0.0.0.0')
  res.json({ success: true })
})

app.get('/api/admin/rakeback/records', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM rakeback_records ORDER BY time DESC').all()
  const records = rows.map(r => ({
    ...r,
    memberId: r.member_id,
    gameType: r.game_type,
    totalBets: r.total_bets,
    betAmount: r.bet_amount,
    calculatedRakeback: r.calculated_rakeback,
    rakebackAmount: r.rakeback_amount,
    vipLevel: r.vip_level
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
    created: r.created_at,
    targetType: r.target_type,
    targetVipLevel: r.target_vip_level,
    scheduledAt: r.scheduled_at,
    publishedAt: r.published_at
  }))
  res.json(announcements)
})

app.post('/api/admin/announcements', authMiddleware, validateCreateAnnouncement, handleValidationErrors, (req, res, next) => {
  try {
    const { title, content, target, targetType, targetVipLevel, type, status, scheduledAt } = req.body
    const finalStatus = scheduledAt ? 'scheduled' : (status || 'published')
    const publishedAt = finalStatus === 'published' ? new Date().toISOString() : null

    const result = db.prepare(
      'INSERT INTO announcements (title, content, target, target_type, target_vip_level, type, status, scheduled_at, published_at) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(
      title, content || '', target || '全部用户', targetType || 'all', targetVipLevel || null, type || '普通', finalStatus, scheduledAt || null, publishedAt
    )
    auditLog(req.user.username, '创建公告', title, '创建公告: ' + title, req.ip || '0.0.0.0')
    res.json({ success: true, id: result.lastInsertRowid })
  } catch (err) {
    next(err)
  }
})

app.put('/api/admin/announcements/:id', authMiddleware, validateUpdateAnnouncement, handleValidationErrors, (req, res) => {
  const ann = db.prepare('SELECT * FROM announcements WHERE id = ?').get(req.params.id)
  if (!ann) return res.status(404).json({ error: 'Announcement not found' })

  const { title, content, target, targetType, targetVipLevel, type, status, scheduledAt } = req.body
  db.prepare(`UPDATE announcements SET
    title = COALESCE(?, title),
    content = COALESCE(?, content),
    target = COALESCE(?, target),
    target_type = COALESCE(?, target_type),
    target_vip_level = ?,
    type = COALESCE(?, type),
    status = COALESCE(?, status),
    scheduled_at = ?,
    published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN datetime('now') ELSE published_at END
    WHERE id = ?`).run(
    title, content, target, targetType, targetVipLevel || null, type, status, scheduledAt || null, status, req.params.id
  )
  res.json({ success: true })
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

// ==================== AGENT SETTLEMENTS ====================
app.get('/api/admin/agents/settlements', authMiddleware, (req, res) => {
  const { agent_id, status, period_start, period_end } = req.query
  let query = 'SELECT * FROM agent_settlements WHERE 1=1'
  const params = []
  if (agent_id) { query += ' AND agent_id = ?'; params.push(agent_id) }
  if (status) { query += ' AND status = ?'; params.push(status) }
  if (period_start) { query += ' AND period_start >= ?'; params.push(period_start) }
  if (period_end) { query += ' AND period_end <= ?'; params.push(period_end) }
  query += ' ORDER BY created_at DESC'
  const rows = db.prepare(query).all(...params)
  res.json(rows.map(r => ({
    ...r,
    agentId: r.agent_id,
    agentName: r.agent_name,
    periodStart: r.period_start,
    periodEnd: r.period_end,
    totalRevenue: r.total_revenue,
    commissionRate: r.commission_rate,
    commissionAmount: r.commission_amount,
    upstreamFee: r.upstream_fee,
    netAmount: r.net_amount,
    createdAt: r.created_at,
    approvedAt: r.approved_at,
    approvedBy: r.approved_by
  })))
})

app.post('/api/admin/agents/settlements/calculate', authMiddleware, (req, res) => {
  const { periodStart, periodEnd } = req.body
  if (!periodStart || !periodEnd) {
    return res.status(400).json({ error: 'periodStart and periodEnd are required' })
  }

  const agents = db.prepare('SELECT * FROM agents WHERE status = ?').all('active')
  const commissionTiers = [
    { min: 1, max: 9, rate: 25 },
    { min: 10, max: 49, rate: 30 },
    { min: 50, max: 99, rate: 35 },
    { min: 100, max: 499, rate: 40 },
    { min: 500, max: Infinity, rate: 45 }
  ]

  const results = []
  for (const agent of agents) {
    const memberCount = agent.members || 0
    const tier = commissionTiers.find(t => memberCount >= t.min && memberCount <= t.max) || commissionTiers[0]
    const totalRevenue = agent.month_revenue || 0
    const commissionAmount = totalRevenue * (tier.rate / 100)
    const upstreamFee = commissionAmount * 0.05
    const netAmount = commissionAmount - upstreamFee

    const existing = db.prepare('SELECT * FROM agent_settlements WHERE agent_id = ? AND period_start = ? AND period_end = ?').get(agent.id, periodStart, periodEnd)
    if (existing) continue

    db.prepare(`INSERT INTO agent_settlements (agent_id, agent_name, period_start, period_end, total_revenue, commission_rate, commission_amount, upstream_fee, net_amount, status) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
      agent.id, agent.brand, periodStart, periodEnd, totalRevenue, tier.rate, commissionAmount, upstreamFee, netAmount, 'pending'
    )
    results.push({ agentId: agent.id, agentName: agent.brand, commissionRate: tier.rate, commissionAmount, upstreamFee, netAmount })
  }

  auditLog(req.user.username, '代理结算计算', 'agent_settlements', 'Calculated settlements for period ' + periodStart + ' to ' + periodEnd, req.ip || '0.0.0.0')
  res.json({ success: true, count: results.length, results })
})

app.put('/api/admin/agents/settlements/:id/approve', authMiddleware, (req, res) => {
  const settlement = db.prepare('SELECT * FROM agent_settlements WHERE id = ?').get(req.params.id)
  if (!settlement) return res.status(404).json({ error: 'Settlement not found' })

  db.prepare(`UPDATE agent_settlements SET status = 'approved', approved_at = datetime('now'), approved_by = ? WHERE id = ?`).run(
    req.user.username, req.params.id
  )

  auditLog(req.user.username, '代理结算审批', settlement.agent_id, 'Approved settlement #' + req.params.id + ' for ' + settlement.agent_name, req.ip || '0.0.0.0')
  res.json({ success: true })
})

// ==================== SYSTEM PERMISSIONS (RBAC) ====================
app.get('/api/admin/system/permissions', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM role_permissions ORDER BY role, module').all()
  const grouped = {}
  for (const r of rows) {
    if (!grouped[r.role]) grouped[r.role] = []
    grouped[r.role].push({
      id: r.id,
      module: r.module,
      canView: !!r.can_view,
      canCreate: !!r.can_create,
      canEdit: !!r.can_edit,
      canDelete: !!r.can_delete
    })
  }
  res.json(grouped)
})

app.put('/api/admin/system/permissions/:role', authMiddleware, (req, res) => {
  const { permissions } = req.body
  const role = req.params.role
  if (!permissions || !Array.isArray(permissions)) {
    return res.status(400).json({ error: 'permissions array is required' })
  }

  const stmt = db.prepare('INSERT OR REPLACE INTO role_permissions (role, module, can_view, can_create, can_edit, can_delete) VALUES (?,?,?,?,?,?)')
  const tx = db.transaction((perms) => {
    for (const p of perms) {
      stmt.run(role, p.module, p.canView ? 1 : 0, p.canCreate ? 1 : 0, p.canEdit ? 1 : 0, p.canDelete ? 1 : 0)
    }
  })
  tx(permissions)

  auditLog(req.user.username, '权限更新', role, 'Updated permissions for role: ' + role, req.ip || '0.0.0.0')
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

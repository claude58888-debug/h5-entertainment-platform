import { Router } from 'express'
import jwt from 'jsonwebtoken'
import db from './db.js'
import { getGameUrl, getCasinoGames, verifyCallbackHash } from './pp-integration.js'

const router = Router()
const H5_JWT_SECRET = process.env.H5_JWT_SECRET || 'dev-only-h5-user-key'

// H5 Auth Middleware
function h5Auth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, H5_JWT_SECRET)
    req.h5user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ==================== PP GAME LAUNCH ====================
// POST /api/pp/games/launch - Launch a real PP game
router.post('/games/launch', h5Auth, async (req, res) => {
  try {
    const { symbol, playMode } = req.body
    if (!symbol) return res.status(400).json({ error: 'Game symbol required' })
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(req.h5user.memberId)
    if (!member) return res.status(404).json({ error: 'User not found' })
    const result = await getGameUrl({
      symbol,
      token: req.h5user.memberId,
      externalPlayerId: req.h5user.memberId,
      playMode: playMode || 'REAL',
      platform: 'WEB'
    })
    if (result.error !== 0) {
      return res.status(400).json({ error: 'Failed to get game URL', code: result.error, description: result.description })
    }
    res.json({ success: true, gameUrl: result.gameURL })
  } catch (err) {
    console.error('PP game launch error:', err.message)
    res.status(500).json({ error: 'Game launch failed' })
  }
})

// GET /api/pp/games/list - Get PP casino games list
router.get('/games/list', async (req, res) => {
  try {
    const result = await getCasinoGames()
    res.json(result)
  } catch (err) {
    console.error('PP games list error:', err.message)
    res.status(500).json({ error: 'Failed to fetch games' })
  }
})

// ==================== PP WALLET CALLBACKS ====================
// These endpoints are called by Pragmatic Play servers

// POST /api/pp/callback/balance
router.post('/callback/balance', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const userId = params.userId
  const member = db.prepare('SELECT balance FROM members WHERE id = ?').get(userId)
  if (!member) {
    return res.json({ error: 2, description: 'User not found' })
  }
  res.json({
    error: 0,
    userId: userId,
    currency: 'CNY',
    cash: member.balance
  })
})

// POST /api/pp/callback/bet (debit)
router.post('/callback/bet', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const { userId, amount, reference, roundId, gameId } = params
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(userId)
  if (!member) return res.json({ error: 2, description: 'User not found' })
  if (member.balance < amount) return res.json({ error: 3, description: 'Insufficient balance' })
  // Check duplicate
  const existing = db.prepare('SELECT id FROM pp_transactions WHERE reference = ?').get(reference)
  if (existing) return res.json({ error: 0, transactionId: existing.id, currency: 'CNY', cash: member.balance })
  const newBalance = member.balance - amount
  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, userId)
  const txResult = db.prepare(`INSERT INTO pp_transactions (reference, round_id, game_id, user_id, type, amount, balance_after) VALUES (?,?,?,?,?,?,?)`)
    .run(reference, roundId, gameId || '', userId, 'bet', amount, newBalance)
  res.json({
    error: 0,
    transactionId: String(txResult.lastInsertRowid),
    currency: 'CNY',
    cash: newBalance
  })
})

// POST /api/pp/callback/result (credit)
router.post('/callback/result', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const { userId, amount, reference, roundId, gameId } = params
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(userId)
  if (!member) return res.json({ error: 2, description: 'User not found' })
  // Check duplicate
  const existing = db.prepare('SELECT id FROM pp_transactions WHERE reference = ?').get(reference)
  if (existing) return res.json({ error: 0, transactionId: existing.id, currency: 'CNY', cash: member.balance })
  const newBalance = member.balance + amount
  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, userId)
  const txResult = db.prepare(`INSERT INTO pp_transactions (reference, round_id, game_id, user_id, type, amount, balance_after) VALUES (?,?,?,?,?,?,?)`)
    .run(reference, roundId, gameId || '', userId, 'result', amount, newBalance)
  res.json({
    error: 0,
    transactionId: String(txResult.lastInsertRowid),
    currency: 'CNY',
    cash: newBalance
  })
})

// POST /api/pp/callback/refund (rollback)
router.post('/callback/refund', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const { userId, amount, reference, roundId } = params
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(userId)
  if (!member) return res.json({ error: 2, description: 'User not found' })
  // Check duplicate refund
  const existing = db.prepare("SELECT id FROM pp_transactions WHERE reference = ? AND type = 'refund'").get(reference)
  if (existing) return res.json({ error: 0, transactionId: existing.id, currency: 'CNY', cash: member.balance })
  const newBalance = member.balance + amount
  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, userId)
  const txResult = db.prepare(`INSERT INTO pp_transactions (reference, round_id, game_id, user_id, type, amount, balance_after) VALUES (?,?,?,?,?,?,?)`)
    .run(reference, roundId, '', userId, 'refund', amount, newBalance)
  res.json({
    error: 0,
    transactionId: String(txResult.lastInsertRowid),
    currency: 'CNY',
    cash: newBalance
  })
})

// POST /api/pp/callback/bonusWin (credit - bonus win)
router.post('/callback/bonusWin', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const { userId, amount, reference, roundId, gameId } = params
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(userId)
  if (!member) return res.json({ error: 2, description: 'User not found' })
  const existing = db.prepare('SELECT id FROM pp_transactions WHERE reference = ?').get(reference)
  if (existing) return res.json({ error: 0, transactionId: existing.id, currency: 'CNY', cash: member.balance })
  const newBalance = member.balance + amount
  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, userId)
  const txResult = db.prepare(`INSERT INTO pp_transactions (reference, round_id, game_id, user_id, type, amount, balance_after) VALUES (?,?,?,?,?,?,?)`)
    .run(reference, roundId, gameId || '', userId, 'bonusWin', amount, newBalance)
  res.json({
    error: 0,
    transactionId: String(txResult.lastInsertRowid),
    currency: 'CNY',
    cash: newBalance
  })
})

// POST /api/pp/callback/jackpotWin (credit - jackpot win)
router.post('/callback/jackpotWin', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const { userId, amount, reference, roundId, gameId, jackpotId } = params
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(userId)
  if (!member) return res.json({ error: 2, description: 'User not found' })
  const existing = db.prepare('SELECT id FROM pp_transactions WHERE reference = ?').get(reference)
  if (existing) return res.json({ error: 0, transactionId: existing.id, currency: 'CNY', cash: member.balance })
  const newBalance = member.balance + amount
  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, userId)
  const txResult = db.prepare(`INSERT INTO pp_transactions (reference, round_id, game_id, user_id, type, amount, balance_after) VALUES (?,?,?,?,?,?,?)`)
    .run(reference, roundId, gameId || '', userId, 'jackpotWin', amount, newBalance)
  res.json({
    error: 0,
    transactionId: String(txResult.lastInsertRowid),
    currency: 'CNY',
    cash: newBalance
  })
})

// POST /api/pp/callback/endRound (informational - round ended)
router.post('/callback/endRound', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  // EndRound is informational only - just acknowledge
  res.json({ error: 0 })
})

// POST /api/pp/callback/promoWin (credit - promotional win)
router.post('/callback/promoWin', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const { userId, amount, reference, roundId, campaignId, campaignType } = params
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(userId)
  if (!member) return res.json({ error: 2, description: 'User not found' })
  const existing = db.prepare('SELECT id FROM pp_transactions WHERE reference = ?').get(reference)
  if (existing) return res.json({ error: 0, transactionId: existing.id, currency: 'CNY', cash: member.balance })
  const newBalance = member.balance + amount
  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, userId)
  const txResult = db.prepare(`INSERT INTO pp_transactions (reference, round_id, game_id, user_id, type, amount, balance_after) VALUES (?,?,?,?,?,?,?)`)
    .run(reference, roundId || '', '', userId, 'promoWin', amount, newBalance)
  res.json({
    error: 0,
    transactionId: String(txResult.lastInsertRowid),
    currency: 'CNY',
    cash: newBalance
  })
})

// POST /api/pp/callback/sessionExpired (informational - session expired)
router.post('/callback/sessionExpired', (req, res) => {
  // Session expired notification - just acknowledge
  res.json({ error: 0 })
})

// POST /api/pp/callback/adjustment (credit/debit - balance adjustment)
router.post('/callback/adjustment', (req, res) => {
  const params = req.body
  if (!verifyCallbackHash(params)) {
    return res.json({ error: 1, description: 'Invalid hash' })
  }
  const { userId, amount, reference, roundId, gameId } = params
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(userId)
  if (!member) return res.json({ error: 2, description: 'User not found' })
  const existing = db.prepare('SELECT id FROM pp_transactions WHERE reference = ?').get(reference)
  if (existing) return res.json({ error: 0, transactionId: existing.id, currency: 'CNY', cash: member.balance })
  const newBalance = member.balance + amount
  db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, userId)
  const txResult = db.prepare(`INSERT INTO pp_transactions (reference, round_id, game_id, user_id, type, amount, balance_after) VALUES (?,?,?,?,?,?,?)`)
    .run(reference, roundId || '', gameId || '', userId, 'adjustment', amount, newBalance)
  res.json({
    error: 0,
    transactionId: String(txResult.lastInsertRowid),
    currency: 'CNY',
    cash: newBalance
  })
})

export default router

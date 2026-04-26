/**
 * Handle SK7755 seamless wallet callbacks.
 *
 * Supported actions:
 *   - getBalance: return player's current balance
 *   - bet / placeBet / debit: deduct bet amount from player's balance
 *   - settle / credit: settle a bet (add winnings to player's balance)
 *   - betNSettle: combined bet + settle in one call
 *   - cancelBet: cancel a previous bet
 *
 * Expects a `db` instance (better-sqlite3) to be injected via init().
 * The user_account sent to SK7755 is `ddyl_{memberId}`, e.g. ddyl_M10018.
 */

let db = null

export function init(database) {
  db = database
}

export function ensureTable() {
  if (!db) throw new Error('callbackHandler not initialised — call init(db) first')

  db.exec(`
    CREATE TABLE IF NOT EXISTS sk7755_bets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      uid TEXT NOT NULL,
      acc_type INTEGER DEFAULT 0,
      supplier INTEGER,
      platform TEXT,
      order_no TEXT NOT NULL UNIQUE,
      main_order_no TEXT,
      bonus_code TEXT,
      game_type TEXT,
      game_code TEXT,
      game_name TEXT,
      balance_before REAL,
      balance_after REAL,
      bet_amount REAL,
      win_amount REAL,
      add_amount REAL,
      sub_amount REAL,
      bet_time INTEGER,
      settle_time INTEGER,
      currency TEXT DEFAULT 'CNY',
      bet_type TEXT,
      status TEXT DEFAULT 'settled',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_sk7755_uid ON sk7755_bets(uid)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sk7755_order_no ON sk7755_bets(order_no)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sk7755_settle_time ON sk7755_bets(settle_time)`)
}

/**
 * Extract memberId from SK7755 uid.
 * uid format: "ddyl_M10018" → memberId: "M10018"
 */
function extractMemberId(uid) {
  if (!uid) return null
  const parts = uid.split('_')
  return parts.length > 1 ? parts.slice(1).join('_') : uid
}

function getMemberBalance(uid) {
  const memberId = extractMemberId(uid)
  if (!memberId) return 0
  const row = db.prepare('SELECT balance FROM members WHERE id = ?').get(memberId)
  return row ? row.balance : 0
}

function updateMemberBalance(uid, newBalance) {
  const memberId = extractMemberId(uid)
  if (!memberId) return false
  const result = db.prepare('UPDATE members SET balance = ? WHERE id = ?').run(newBalance, memberId)
  return result.changes > 0
}

function handleGetBalance(body) {
  const balance = getMemberBalance(body.uid)
  return {
    code: '0000',
    message: 'Success',
    balance: balance,
    currency: 'CNY',
  }
}

function handleBet(body) {
  const uid = body.uid
  const betAmount = Number(body.betAmount || body.subAmount || body.amount || 0)
  const orderNo = body.orderNo

  if (!orderNo) {
    return { code: '9999', message: 'Missing orderNo' }
  }

  const currentBalance = getMemberBalance(uid)
  if (currentBalance < betAmount) {
    return { code: '1002', message: 'Insufficient balance', balance: currentBalance }
  }

  const newBalance = currentBalance - betAmount
  updateMemberBalance(uid, newBalance)

  // Record the bet
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO sk7755_bets
      (action, uid, acc_type, supplier, platform, order_no, main_order_no,
       bonus_code, game_type, game_code, game_name, balance_before, balance_after,
       bet_amount, win_amount, add_amount, sub_amount, bet_time, settle_time,
       currency, bet_type, status)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertStmt.run(
    body.action || 'bet',
    uid || '',
    body.accType || body.acc_type || 0,
    body.supplier || null,
    body.platform || '',
    orderNo,
    body.mainOrderNo || body.main_order_no || null,
    body.bonusCode || body.bonus_code || null,
    body.gameType || body.game_type || null,
    body.code || body.game_code || null,
    body.gameName || body.game_name || null,
    currentBalance,
    newBalance,
    betAmount,
    0,
    0,
    betAmount,
    body.betTime || body.bet_time || null,
    body.stime || body.settle_time || null,
    body.currency || 'CNY',
    body.betType || body.bet_type || null,
    'pending'
  )

  return {
    code: '0000',
    message: 'Success',
    balance: newBalance,
    currency: 'CNY',
  }
}

function handleSettle(body) {
  const uid = body.uid
  const winAmount = Number(body.winAmount || body.addAmount || body.amount || 0)
  const betAmount = Number(body.betAmount || body.subAmount || 0)
  const orderNo = body.orderNo

  if (!orderNo) {
    return { code: '9999', message: 'Missing orderNo' }
  }

  const currentBalance = getMemberBalance(uid)
  const newBalance = currentBalance + winAmount
  updateMemberBalance(uid, newBalance)

  // Insert or update bet record
  const existing = db.prepare('SELECT id FROM sk7755_bets WHERE order_no = ?').get(orderNo)

  if (existing) {
    db.prepare(`
      UPDATE sk7755_bets
      SET status = 'settled', win_amount = ?, add_amount = ?, balance_after = ?,
          settle_time = ?, updated_at = datetime('now')
      WHERE order_no = ?
    `).run(winAmount, winAmount, newBalance, body.stime || body.settle_time || null, orderNo)
  } else {
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO sk7755_bets
        (action, uid, acc_type, supplier, platform, order_no, main_order_no,
         bonus_code, game_type, game_code, game_name, balance_before, balance_after,
         bet_amount, win_amount, add_amount, sub_amount, bet_time, settle_time,
         currency, bet_type, status)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    insertStmt.run(
      body.action || 'settle',
      uid || '',
      body.accType || body.acc_type || 0,
      body.supplier || null,
      body.platform || '',
      orderNo,
      body.mainOrderNo || body.main_order_no || null,
      body.bonusCode || body.bonus_code || null,
      body.gameType || body.game_type || null,
      body.code || body.game_code || null,
      body.gameName || body.game_name || null,
      currentBalance,
      newBalance,
      betAmount,
      winAmount,
      winAmount,
      betAmount,
      body.betTime || body.bet_time || null,
      body.stime || body.settle_time || null,
      body.currency || 'CNY',
      body.betType || body.bet_type || null,
      'settled'
    )
  }

  return {
    code: '0000',
    message: 'Success',
    balance: newBalance,
    currency: 'CNY',
  }
}

function handleBetNSettle(body) {
  const uid = body.uid
  const betAmount = Number(body.betAmount || body.subAmount || 0)
  const winAmount = Number(body.winAmount || body.addAmount || 0)
  const orderNo = body.orderNo

  if (!orderNo) {
    return { code: '9999', message: 'Missing orderNo' }
  }

  const currentBalance = getMemberBalance(uid)
  if (currentBalance < betAmount) {
    return { code: '1002', message: 'Insufficient balance', balance: currentBalance }
  }

  const newBalance = currentBalance - betAmount + winAmount
  updateMemberBalance(uid, newBalance)

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO sk7755_bets
      (action, uid, acc_type, supplier, platform, order_no, main_order_no,
       bonus_code, game_type, game_code, game_name, balance_before, balance_after,
       bet_amount, win_amount, add_amount, sub_amount, bet_time, settle_time,
       currency, bet_type, status)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  insertStmt.run(
    'betNSettle',
    uid || '',
    body.accType || body.acc_type || 0,
    body.supplier || null,
    body.platform || '',
    orderNo,
    body.mainOrderNo || body.main_order_no || null,
    body.bonusCode || body.bonus_code || null,
    body.gameType || body.game_type || null,
    body.code || body.game_code || null,
    body.gameName || body.game_name || null,
    currentBalance,
    newBalance,
    betAmount,
    winAmount,
    winAmount,
    betAmount,
    body.betTime || body.bet_time || null,
    body.stime || body.settle_time || null,
    body.currency || 'CNY',
    body.betType || body.bet_type || null,
    'settled'
  )

  return {
    code: '0000',
    message: 'Success',
    balance: newBalance,
    currency: 'CNY',
  }
}

function handleCancelBet(body) {
  const uid = body.uid
  const orderNo = body.orderNo

  if (!orderNo) {
    return { code: '9999', message: 'Missing orderNo' }
  }

  const existing = db.prepare('SELECT * FROM sk7755_bets WHERE order_no = ?').get(orderNo)

  if (existing && existing.status !== 'cancelled') {
    const refundAmount = Number(existing.bet_amount || 0)
    const currentBalance = getMemberBalance(uid)
    const newBalance = currentBalance + refundAmount
    updateMemberBalance(uid, newBalance)

    db.prepare(`
      UPDATE sk7755_bets
      SET status = 'cancelled', balance_after = ?, updated_at = datetime('now')
      WHERE order_no = ?
    `).run(newBalance, orderNo)

    return {
      code: '0000',
      message: 'Success',
      balance: newBalance,
      currency: 'CNY',
    }
  }

  return {
    code: '0000',
    message: 'Success',
    balance: getMemberBalance(uid),
    currency: 'CNY',
  }
}

export function processCallback(body) {
  if (!db) throw new Error('callbackHandler not initialised — call init(db) first')

  const { action } = body

  console.log(`[SK7755 Callback] action=${action} uid=${body.uid || ''} orderNo=${body.orderNo || ''}`)

  switch (action) {
    case 'getBalance':
      return handleGetBalance(body)
    case 'bet':
    case 'placeBet':
    case 'debit':
      return handleBet(body)
    case 'settle':
    case 'credit':
      return handleSettle(body)
    case 'betNSettle':
      return handleBetNSettle(body)
    case 'cancelBet':
      return handleCancelBet(body)
    default:
      console.warn(`[SK7755 Callback] Unknown action: ${action}`)
      return { code: '9999', message: `Unknown action: ${action}` }
  }
}

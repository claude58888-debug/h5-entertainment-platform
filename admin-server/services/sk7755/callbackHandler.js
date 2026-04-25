/**
 * Handle SK7755 WalletData push callbacks (settle / cancelBet).
 *
 * Expects a `db` instance (better-sqlite3) to be injected via init().
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

const INSERT_BET = `
  INSERT INTO sk7755_bets
    (action, uid, acc_type, supplier, platform, order_no, main_order_no,
     bonus_code, game_type, game_code, game_name, balance_before, balance_after,
     bet_amount, win_amount, add_amount, sub_amount, bet_time, settle_time,
     currency, bet_type, status)
  VALUES
    (@action, @uid, @accType, @supplier, @platform, @orderNo, @mainOrderNo,
     @bonusCode, @gameType, @code, @gameName, @balance, @newBalance,
     @betAmount, @winAmount, @addAmount, @subAmount, @betTime, @stime,
     @currency, @betType, @status)
`

const UPDATE_CANCEL = `
  UPDATE sk7755_bets
  SET status = 'cancelled', updated_at = datetime('now')
  WHERE order_no = @orderNo
`

function handleSettle(body) {
  const stmt = db.prepare(INSERT_BET)
  stmt.run({ ...body, status: 'settled' })
}

function handleCancelBet(body) {
  const upd = db.prepare(UPDATE_CANCEL)
  const result = upd.run({ orderNo: body.orderNo })

  if (result.changes === 0) {
    const stmt = db.prepare(INSERT_BET)
    stmt.run({ ...body, status: 'cancelled' })
  }
}

export function processCallback(body) {
  if (!db) throw new Error('callbackHandler not initialised — call init(db) first')

  const { action } = body

  if (action === 'settle') {
    handleSettle(body)
  } else if (action === 'cancelBet') {
    handleCancelBet(body)
  } else {
    throw new Error(`Unknown action: ${action}`)
  }
}

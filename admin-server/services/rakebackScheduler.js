/**
 * Daily Rakeback Settlement Scheduler
 *
 * Runs daily at 00:05 UTC to calculate and distribute rakeback
 * based on the previous day's SK7755 betting activity.
 *
 * Formula: rakeback = bet_amount × (rate / 100)
 * Rate comes from rakeback_config table, matched by game type.
 */

import cron from 'node-cron'

let db = null

const SK7755_TO_RAKEBACK_TYPE = {
  SLOT: '电子游戏',
  LIVE: '真人视讯',
  SPORT: '体育竞猜',
  FH: '捕鱼游戏',
  CHESS: '棋牌游戏',
  LOTTERY: '彩票'
}

export function initRakebackScheduler(database) {
  db = database

  // Run daily at 00:05 UTC
  cron.schedule('5 0 * * *', () => {
    console.log('[Rakeback] Starting daily settlement...')
    try {
      const count = settleRakeback()
      console.log(`[Rakeback] Settlement complete: ${count} records created`)
    } catch (err) {
      console.error('[Rakeback] Settlement error:', err.message)
    }
  })

  console.log('[Rakeback] Scheduler initialized (daily at 00:05 UTC)')
}

/**
 * Calculate and settle rakeback for the previous day.
 * Can also be called manually via admin API.
 * @param {string} [targetDate] - optional ISO date string (YYYY-MM-DD), defaults to yesterday
 * @returns {number} number of rakeback records created
 */
export function settleRakeback(targetDate) {
  if (!db) throw new Error('Rakeback scheduler not initialized')

  const date = targetDate || new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const nextDate = new Date(new Date(date).getTime() + 86400000).toISOString().slice(0, 10)

  // Check if already settled for this date
  const existing = db.prepare('SELECT COUNT(*) as count FROM rakeback_records WHERE date = ?').get(date)
  if (existing.count > 0) {
    console.log(`[Rakeback] Already settled for ${date}, skipping`)
    return 0
  }

  // Load active rakeback configs
  const configs = db.prepare("SELECT * FROM rakeback_config WHERE status = 'active'").all()
  const rateByType = new Map()
  for (const c of configs) {
    rateByType.set(c.game_type, { rate: c.rate, minBet: c.min_bet })
  }

  // Aggregate previous day's SK7755 bets by member + game_type
  const bets = db.prepare(`
    SELECT uid, game_type, COUNT(*) as total_bets, SUM(bet_amount) as bet_amount
    FROM sk7755_bets
    WHERE created_at >= ? AND created_at < ?
    GROUP BY uid, game_type
  `).all(date, nextDate)

  if (bets.length === 0) {
    console.log(`[Rakeback] No bets found for ${date}`)
    return 0
  }

  const insertRakeback = db.prepare(`
    INSERT INTO rakeback_records (member_id, member, date, game_type, total_bets, bet_amount, calculated_rakeback, rakeback_amount, vip_level, time, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'pending')
  `)

  let count = 0
  const memberBalanceUpdates = new Map()

  for (const bet of bets) {
    // Extract memberId from uid (ddyl_M10018 -> M10018)
    const memberId = bet.uid.replace(/^ddyl_/, '')
    const rakebackType = SK7755_TO_RAKEBACK_TYPE[bet.game_type] || bet.game_type
    const config = rateByType.get(rakebackType)

    if (!config) continue
    if (bet.bet_amount < config.minBet) continue

    const rakebackAmount = parseFloat((bet.bet_amount * config.rate / 100).toFixed(2))
    if (rakebackAmount < 0.01) continue

    // Get member info
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(memberId)
    if (!member) continue

    insertRakeback.run(
      memberId,
      memberId,
      date,
      rakebackType,
      bet.total_bets,
      bet.bet_amount,
      rakebackAmount,
      rakebackAmount,
      member.vip || 0
    )

    // Accumulate balance updates per member
    const prev = memberBalanceUpdates.get(memberId) || 0
    memberBalanceUpdates.set(memberId, prev + rakebackAmount)
    count++
  }

  // Update member balances
  const updateBalance = db.prepare('UPDATE members SET balance = balance + ? WHERE id = ?')
  for (const [memberId, amount] of memberBalanceUpdates) {
    updateBalance.run(amount, memberId)
  }

  return count
}

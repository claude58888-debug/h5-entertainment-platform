import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import Database from 'better-sqlite3'
import { init, ensureTable, processCallback } from '../callbackHandler.js'

let db

function makeBetBody(overrides = {}) {
  return {
    action: 'settle',
    uid: '10001',
    accType: 0,
    supplier: 9,
    platform: 'web',
    orderNo: `ORD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    mainOrderNo: 'MAIN123',
    bonusCode: 'BONUS001',
    gameType: 'slot',
    code: 'GAME001',
    gameName: 'TestSlot',
    balance: '100.00',
    newBalance: '110.00',
    betAmount: '10.00',
    winAmount: '20.00',
    addAmount: '10.00',
    subAmount: '0.00',
    betTime: 1710000000,
    stime: 1710000100,
    currency: 'CNY',
    betType: 'normal',
    ...overrides,
  }
}

before(() => {
  db = new Database(':memory:')
  init(db)
  ensureTable()
})

after(() => {
  db.close()
})

describe('callbackHandler — settle', () => {
  it('inserts a settled bet record', () => {
    const body = makeBetBody()
    processCallback(body)

    const row = db.prepare('SELECT * FROM sk7755_bets WHERE order_no = ?').get(body.orderNo)
    assert.ok(row, 'row should exist')
    assert.equal(row.status, 'settled')
    assert.equal(row.uid, '10001')
    assert.equal(Number(row.bet_amount), 10)
    assert.equal(Number(row.win_amount), 20)
  })

  it('rejects duplicate orderNo', () => {
    const body = makeBetBody({ orderNo: 'UNIQUE_DUP_TEST' })
    processCallback(body)
    assert.throws(() => processCallback(body))
  })
})

describe('callbackHandler — cancelBet', () => {
  it('cancels an existing settled bet', () => {
    const body = makeBetBody({ orderNo: 'CANCEL_TEST_1' })
    processCallback(body)

    processCallback({ ...body, action: 'cancelBet' })

    const row = db.prepare('SELECT * FROM sk7755_bets WHERE order_no = ?').get('CANCEL_TEST_1')
    assert.equal(row.status, 'cancelled')
  })

  it('inserts cancelled record if original order not found', () => {
    const body = makeBetBody({ action: 'cancelBet', orderNo: 'ORPHAN_CANCEL_1' })
    processCallback(body)

    const row = db.prepare('SELECT * FROM sk7755_bets WHERE order_no = ?').get('ORPHAN_CANCEL_1')
    assert.ok(row, 'row should exist')
    assert.equal(row.status, 'cancelled')
  })
})

describe('callbackHandler — unknown action', () => {
  it('throws on unknown action', () => {
    const body = makeBetBody({ action: 'refund' })
    assert.throws(() => processCallback(body), { message: 'Unknown action: refund' })
  })
})

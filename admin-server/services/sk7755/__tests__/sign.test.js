import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'crypto'
import { generateSign } from '../sign.js'

const MOCK_KEY = 'test_key_12345'

describe('generateSign', () => {
  it('sorts params by ASCII ascending key order', () => {
    const params = { uid: '10001', agent_id: 'TEST', timestamp: 1700000000 }
    const sign = generateSign(params, MOCK_KEY)

    // Manual: agent_id=TEST&timestamp=1700000000&uid=10001&key=test_key_12345
    const expected = crypto
      .createHash('md5')
      .update('agent_id=TEST&timestamp=1700000000&uid=10001&key=test_key_12345')
      .digest('hex')

    assert.equal(sign, expected)
  })

  it('produces lowercase hex of 32 chars', () => {
    const sign = generateSign({ a: '1' }, MOCK_KEY)
    assert.match(sign, /^[0-9a-f]{32}$/)
  })

  it('different params produce different signatures', () => {
    const sign1 = generateSign({ uid: '1' }, MOCK_KEY)
    const sign2 = generateSign({ uid: '2' }, MOCK_KEY)
    assert.notEqual(sign1, sign2)
  })

  it('different keys produce different signatures', () => {
    const params = { uid: '10001' }
    const sign1 = generateSign(params, 'key_a')
    const sign2 = generateSign(params, 'key_b')
    assert.notEqual(sign1, sign2)
  })

  it('handles single param correctly', () => {
    const sign = generateSign({ z: '9' }, MOCK_KEY)
    const expected = crypto
      .createHash('md5')
      .update('z=9&key=test_key_12345')
      .digest('hex')
    assert.equal(sign, expected)
  })

  it('handles numeric values by coercing to string', () => {
    const sign = generateSign({ num: 42 }, MOCK_KEY)
    assert.match(sign, /^[0-9a-f]{32}$/)
  })
})

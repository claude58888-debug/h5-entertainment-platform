import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'

const SK7755_MD5KEY = process.env.SK7755_MD5KEY
const SKIP = !SK7755_MD5KEY

describe('SK7755 Client — integration (requires $SK7755_MD5KEY)', { skip: SKIP }, () => {
  let client

  before(async () => {
    client = await import('../client.js')
  })

  it('getPlatformList returns platform array', async () => {
    const res = await client.getPlatformList()
    assert.equal(res.code, '0000', `expected code 0000, got ${res.code}: ${res.message}`)
    assert.ok(Array.isArray(res.result), 'result should be an array')
    assert.ok(res.result.length > 0, 'should have at least one platform')
    console.log(`[integration] getPlatformList: ${res.result.length} platforms`)
  })

  it('getGameList returns games for AWC-FC', async () => {
    const res = await client.getGameList('AWC-FC')
    assert.equal(res.code, '0000', `expected code 0000, got ${res.code}: ${res.message}`)
    assert.ok(res.result?.data?.length > 0, 'should have at least one game')
    console.log(`[integration] getGameList(AWC-FC): ${res.result.data.length} games`)
  })

  it('getBalance returns balance for uid 10001', async () => {
    const res = await client.getBalance(10001)
    assert.equal(res.code, '0000', `expected code 0000, got ${res.code}: ${res.message}`)
    assert.ok(res.result?.balance !== undefined, 'should have balance field')
    console.log(`[integration] getBalance: ${res.result.balance}`)
  })

  it('login returns a launch URL for AWC-FC game', async () => {
    const res = await client.login(10001, {
      platform: 'AWC-FC',
      game_code: 'FC-SLOT-032',
      nickname: 'testplayer',
    })
    assert.equal(res.code, '0000', `expected code 0000, got ${res.code}: ${res.message}`)
    assert.ok(res.result?.url, 'should have url field')
    console.log(`[integration] login URL (first 80 chars): ${res.result.url.slice(0, 80)}...`)
  })
})

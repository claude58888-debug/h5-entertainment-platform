import { describe, it, before } from 'node:test'
import assert from 'node:assert/strict'

const SK7755_MD5KEY = process.env.SK7755_MD5KEY
const SKIP = !SK7755_MD5KEY

describe('SK7755 Client — integration (requires $SK7755_MD5KEY)', { skip: SKIP }, () => {
  let client

  before(async () => {
    client = await import('../client.js')
  })

  it('getPlatformList returns a response', async () => {
    const res = await client.getPlatformList('10001')
    assert.ok(res.code, 'response should have a code field')
    console.log('[integration] getPlatformList code:', res.code, 'message:', res.message)
  })

  it('getBalance returns a response', async () => {
    const res = await client.getBalance('10001')
    assert.ok(res.code, 'response should have a code field')
    console.log('[integration] getBalance code:', res.code, 'message:', res.message)
  })
})

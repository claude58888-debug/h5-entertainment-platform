import axios from 'axios'
import config from './config.js'
import { generateSign } from './sign.js'

const http = axios.create({
  baseURL: config.baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

function buildSignedParams(extra = {}) {
  const params = {
    agent_id: config.agentId,
    timestamp: Math.floor(Date.now() / 1000),
    ...extra,
  }
  params.sign = generateSign(params, config.md5Key)
  return params
}

export async function getPlatformList() {
  const res = await http.post('/api/platform', { agent_id: config.agentId })
  return res.data
}

export async function getGameList(platform) {
  const res = await http.post('/api/gamelist', { agent_id: config.agentId, platform })
  return res.data
}

export async function login(userAccount, { platform, game_code } = {}) {
  const data = buildSignedParams({ user_account: userAccount, platform, game_code })
  const res = await http.post('/api/login', data)
  return res.data
}

export async function getGameInfo(uid, platform, game_code) {
  const data = buildSignedParams({ uid, platform, game_code })
  const res = await http.post('/api/gameInfo', data)
  return res.data
}

export async function getBalance(uid) {
  const res = await http.post('/api/balance', { uid, agent_id: config.agentId })
  return res.data
}

export async function scoreDown(uid, amount) {
  const data = buildSignedParams({ uid, amount })
  const res = await http.post('/api/scoreDown', data)
  return res.data
}

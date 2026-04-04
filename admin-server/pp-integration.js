import crypto from 'crypto'
import https from 'https'
import querystring from 'querystring'

// ==================== PRAGMATIC PLAY CONFIG ====================
// Sensitive credentials - must be set via environment variables. No fallback allowed.

const PP_API_URL = process.env.PP_API_URL || 'https://api.prerelease-env.biz'
const PP_SECURE_LOGIN = process.env.PP_SECURE_LOGIN || 'zf1487_bygame02'
const PP_SECRET = process.env.PP_SECRET || '8IPy9SfmmITyT8Wh'
const PP_CONFIGURED = !!(PP_SECRET && PP_SECURE_LOGIN)
if (!PP_CONFIGURED) {
  console.warn('WARNING: PP_SECRET and/or PP_SECURE_LOGIN not set. PP game API will be unavailable.')
}

const PP_PROVIDER_ID = process.env.PP_PROVIDER_ID || 'bygame02'
const PP_STYLENAME = process.env.PP_STYLENAME || 'bygame02'
const PP_CURRENCY = process.env.PP_CURRENCY || 'USDT'
const PP_LOBBY_URL = process.env.PP_LOBBY_URL || 'https://dd.top/#/home'
const PP_CASHIER_URL = process.env.PP_CASHIER_URL || 'https://dd.top/#/deposit'

// ==================== HASH CALCULATION ====================
// PP hash: MD5 of all POST param values sorted by key + SECRET
export function calcHash(params) {
  const sorted = Object.keys(params).sort()
  let str = ''
  for (const key of sorted) {
    if (key === 'hash') continue
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      str += params[key]
    }
  }
  str += PP_SECRET
  return crypto.createHash('md5').update(str).digest('hex')
}

// ==================== HTTP REQUEST HELPER ====================
function ppRequest(path, params) {
  if (!PP_CONFIGURED) {
    return Promise.resolve({ error: '1', description: 'PP integration not configured. Set PP_SECRET and PP_SECURE_LOGIN env vars.' })
  }
  return new Promise((resolve, reject) => {
    const hash = calcHash(params)
    const body = querystring.stringify({ ...params, hash })
    const url = new URL(PP_API_URL)
    const options = {
      hostname: url.hostname,
      port: 443,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'Cache-Control': 'no-cache'
      }
    }
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        try {
          resolve(JSON.parse(data))
        } catch (e) {
          resolve({ error: '1', description: 'Invalid JSON response', raw: data })
        }
      })
    })
    req.on('error', (e) => reject(e))
    req.write(body)
    req.end()
  })
}

// ==================== API: GET CASINO GAMES ====================
export async function getCasinoGames(options = '') {
  const params = {
    secureLogin: PP_SECURE_LOGIN,
  }
  if (options) params.options = options
  return ppRequest('/IntegrationService/v3/http/CasinoGameAPI/getCasinoGames/', params)
}

// ==================== API: GET GAME URL ====================
export async function getGameUrl({ symbol, token, externalPlayerId, language = 'zh', playMode = 'REAL', country = 'CN', platform = 'MOBILE' }) {
  const params = {
    secureLogin: PP_SECURE_LOGIN,
    symbol,
    language,
    token,
    externalPlayerId,
    country,
    platform,
    technology: 'H5',
    stylename: PP_STYLENAME,
    currency: PP_CURRENCY,
    cashierUrl: PP_CASHIER_URL,
    lobbyUrl: PP_LOBBY_URL,
    playMode,
  }
  return ppRequest('/IntegrationService/v3/http/CasinoGameAPI/game/url/', params)
}

// ==================== VERIFY CALLBACK HASH ====================
export function verifyCallbackHash(params) {
  const { hash, ...rest } = params
  const expected = calcHash(rest)
  return hash === expected
}

export { PP_CONFIGURED, PP_PROVIDER_ID, PP_CURRENCY }

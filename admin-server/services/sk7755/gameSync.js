/**
 * SK7755 Game List Sync — fetches games from all configured platforms,
 * caches them in SQLite + memory, and auto-refreshes every 10 minutes.
 */
import { getGameList } from './client.js'

let db = null
const REFRESH_INTERVAL = 10 * 60 * 1000 // 10 minutes
let refreshTimer = null

// In-memory cache
let cachedGames = []
let cacheTimestamp = 0

// Platform → H5 category mapping
const CATEGORY_MAP = {
  SLOT: 'slots',
  LIVE: 'live',
  SPORT: 'sports',
  FH: 'fishing',
  LOTTERY: 'lottery',
}

// All 12 confirmed platforms with their types
const PLATFORMS = [
  { code: 'TX-PG', type: 'SLOT', name: 'PG电子' },
  { code: 'ZFPP', type: 'SLOT', name: 'PP电子' },
  { code: 'ONE-HACKSAW', type: 'SLOT', name: 'Hacksaw' },
  { code: 'ONE-NOLIMIT', type: 'SLOT', name: 'Nolimit City' },
  { code: 'TX-JDB', type: 'SLOT', name: 'JDB电子' },
  { code: 'OPS-JILI', type: 'SLOT', name: 'JILI电子' },
  { code: 'PP', type: 'LIVE', name: 'PP真人' },
  { code: 'AWC-EVOLUTION', type: 'LIVE', name: 'EVO真人' },
  { code: 'ZF-CR', type: 'SPORT', name: 'CR皇冠体育' },
  { code: 'WALI', type: 'FH', name: '瓦力捕鱼' },
  { code: 'AWC-JILI', type: 'FH', name: 'JILI捕鱼' },
  { code: 'PC28-NEW', type: 'LOTTERY', name: 'PC28彩票' },
]

export function init(database) {
  db = database
  ensureTables()
  seedPlatforms()
}

function ensureTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sk7755_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      game_code TEXT NOT NULL,
      game_name TEXT,
      game_type TEXT,
      image_url TEXT DEFAULT '',
      category TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(platform, game_code)
    )
  `)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sk7755g_platform ON sk7755_games(platform)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_sk7755g_category ON sk7755_games(category)`)

  db.exec(`
    CREATE TABLE IF NOT EXISTS sk7755_platforms (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      game_count INTEGER DEFAULT 0,
      last_sync TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)
}

function seedPlatforms() {
  const upsert = db.prepare(`
    INSERT INTO sk7755_platforms (code, name, type, category)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(code) DO UPDATE SET name = excluded.name, type = excluded.type, category = excluded.category
  `)
  const tx = db.transaction(() => {
    for (const p of PLATFORMS) {
      upsert.run(p.code, p.name, p.type, CATEGORY_MAP[p.type] || 'slots')
    }
  })
  tx()
}

export function getPlatforms() {
  return db.prepare('SELECT * FROM sk7755_platforms ORDER BY type, code').all()
}

export function togglePlatform(code, enabled) {
  db.prepare('UPDATE sk7755_platforms SET enabled = ? WHERE code = ?').run(enabled ? 1 : 0, code)
}

export function toggleGame(platform, gameCode, status) {
  db.prepare('UPDATE sk7755_games SET status = ? WHERE platform = ? AND game_code = ?')
    .run(status, platform, gameCode)
}

export function getGamesByPlatform(platform) {
  return db.prepare('SELECT * FROM sk7755_games WHERE platform = ? ORDER BY game_name').all(platform)
}

/**
 * Get all active SK7755 games, optionally filtered by H5 category.
 * Returns from in-memory cache when available.
 */
export function getCachedGames(category) {
  let games = cachedGames
  if (!games.length) {
    // Fall back to SQLite
    games = db.prepare(`
      SELECT g.*, p.name as platform_name, p.type as platform_type, p.category as h5_category
      FROM sk7755_games g
      JOIN sk7755_platforms p ON g.platform = p.code
      WHERE g.status = 'active' AND p.enabled = 1
      ORDER BY g.platform, g.game_name
    `).all()
    cachedGames = games
    cacheTimestamp = Date.now()
  }
  if (category) {
    return games.filter(g => g.h5_category === category)
  }
  return games
}

/**
 * Sync games from a single platform via SK7755 API.
 */
async function syncPlatform(platformCode) {
  try {
    const result = await getGameList(platformCode)
    if (result.code !== '0000' || !Array.isArray(result.data)) {
      console.warn(`[SK7755 Sync] Platform ${platformCode} returned code=${result.code}`)
      return 0
    }

    const platform = PLATFORMS.find(p => p.code === platformCode)
    const h5Category = platform ? CATEGORY_MAP[platform.type] : 'slots'

    const upsert = db.prepare(`
      INSERT INTO sk7755_games (platform, game_code, game_name, game_type, image_url, category)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(platform, game_code) DO UPDATE SET
        game_name = excluded.game_name,
        game_type = excluded.game_type,
        image_url = excluded.image_url,
        category = excluded.category,
        updated_at = datetime('now')
    `)

    const tx = db.transaction(() => {
      for (const game of result.data) {
        upsert.run(
          platformCode,
          game.code || game.game_code || '',
          game.name || game.gameName || game.code || '',
          game.gameType || game.type || '',
          game.imageUrl || game.icon || game.img || '',
          h5Category
        )
      }
    })
    tx()

    // Update platform game count and last sync time
    db.prepare('UPDATE sk7755_platforms SET game_count = ?, last_sync = datetime(\'now\') WHERE code = ?')
      .run(result.data.length, platformCode)

    return result.data.length
  } catch (err) {
    console.error(`[SK7755 Sync] Error syncing platform ${platformCode}:`, err.message)
    return 0
  }
}

/**
 * Sync all enabled platforms.
 */
export async function syncAll() {
  console.log('[SK7755 Sync] Starting full sync...')
  const platforms = db.prepare('SELECT code FROM sk7755_platforms WHERE enabled = 1').all()
  let totalGames = 0

  for (const p of platforms) {
    const count = await syncPlatform(p.code)
    totalGames += count
  }

  // Refresh in-memory cache
  cachedGames = db.prepare(`
    SELECT g.*, p.name as platform_name, p.type as platform_type, p.category as h5_category
    FROM sk7755_games g
    JOIN sk7755_platforms p ON g.platform = p.code
    WHERE g.status = 'active' AND p.enabled = 1
    ORDER BY g.platform, g.game_name
  `).all()
  cacheTimestamp = Date.now()

  console.log(`[SK7755 Sync] Complete — ${totalGames} games across ${platforms.length} platforms`)
  return totalGames
}

/**
 * Start the auto-refresh timer.
 */
export function startAutoSync() {
  // Sync on startup (delayed to avoid blocking)
  setTimeout(() => syncAll().catch(err => console.error('[SK7755 Sync] Initial sync error:', err)), 5000)

  // Schedule periodic refresh
  refreshTimer = setInterval(() => {
    syncAll().catch(err => console.error('[SK7755 Sync] Refresh error:', err))
  }, REFRESH_INTERVAL)

  console.log(`[SK7755 Sync] Auto-sync scheduled every ${REFRESH_INTERVAL / 60000} minutes`)
}

export function stopAutoSync() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

export { PLATFORMS, CATEGORY_MAP }

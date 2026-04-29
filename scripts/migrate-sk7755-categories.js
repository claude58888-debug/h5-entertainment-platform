#!/usr/bin/env node
/**
 * SK7755 Category Migration Script
 *
 * Maps all sk7755_games to game_categories based on platform type / game_type.
 * Also maps the legacy `games` table entries.
 *
 * Usage:
 *   node scripts/migrate-sk7755-categories.js           # run migration
 *   node scripts/migrate-sk7755-categories.js --rollback # undo migration
 *   node scripts/migrate-sk7755-categories.js --dry-run  # preview only
 */
import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '..', 'admin-server', 'admin.db')
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isRollback = args.includes('--rollback')

// SK7755 platform type → category code mapping
const PLATFORM_TYPE_MAP = {
  'SLOT': 'slot',
  'LIVE': 'live',
  'SPORT': 'sports',
  'FH': 'fish',
  'LOTTERY': 'lottery',
}

// game_type field → category code mapping (from SK API response)
const GAME_TYPE_MAP = {
  'slot': 'slot',
  'slots': 'slot',
  'SLOT': 'slot',
  'live': 'live',
  'LIVE': 'live',
  'livecasino': 'live',
  'table': 'live',
  'TABLE': 'live',
  'fish': 'fish',
  'fishing': 'fish',
  'FH': 'fish',
  'FISH': 'fish',
  'sport': 'sports',
  'sports': 'sports',
  'SPORT': 'sports',
  'lottery': 'lottery',
  'LOTTERY': 'lottery',
  'egame': 'egame',
  'card': 'card',
  'chess': 'card',
  'CHESS': 'card',
  'arcade': 'egame',
  'ARCADE': 'egame',
  'crash': 'egame',
  'CRASH': 'egame',
  'instant': 'egame',
}

// Legacy games.category → category code mapping
const LEGACY_CATEGORY_MAP = {
  '电子': 'slot',
  '真人': 'live',
  '捕鱼': 'fish',
  '体育': 'sports',
  '彩票': 'lottery',
  '棋牌': 'card',
  'slots': 'slot',
  'live': 'live',
  'fishing': 'fish',
  'sports': 'sports',
  'lottery': 'lottery',
  'chess': 'card',
}

function getCategories() {
  return db.prepare('SELECT id, code FROM game_categories').all()
}

function rollback() {
  console.log('Rolling back category migration...')
  const tx = db.transaction(() => {
    db.prepare('UPDATE sk7755_games SET category_id = NULL, sub_category_id = NULL').run()
    db.prepare('UPDATE games SET category_id = NULL, sub_category_id = NULL').run()
  })
  tx()
  console.log('Rollback complete.')
}

function migrate() {
  const categories = getCategories()
  if (!categories.length) {
    console.error('No game_categories found. Run initDB() first.')
    process.exit(1)
  }
  const codeToId = Object.fromEntries(categories.map(c => [c.code, c.id]))

  // 1. Migrate sk7755_games
  console.log('\n=== Migrating sk7755_games ===')
  const sk7755Games = db.prepare(`
    SELECT g.id, g.platform, g.game_code, g.game_type, g.category, p.type as platform_type
    FROM sk7755_games g
    LEFT JOIN sk7755_platforms p ON g.platform = p.code
  `).all()

  let mapped = 0
  let defaulted = 0

  const updateSk = db.prepare('UPDATE sk7755_games SET category_id = ? WHERE id = ?')

  const tx1 = db.transaction(() => {
    for (const game of sk7755Games) {
      let catCode = null

      // Priority 1: game_type from SK API
      if (game.game_type) {
        catCode = GAME_TYPE_MAP[game.game_type] || GAME_TYPE_MAP[game.game_type.toLowerCase()]
      }

      // Priority 2: platform type
      if (!catCode && game.platform_type) {
        catCode = PLATFORM_TYPE_MAP[game.platform_type]
      }

      // Priority 3: existing category field
      if (!catCode && game.category) {
        catCode = LEGACY_CATEGORY_MAP[game.category] || LEGACY_CATEGORY_MAP[game.category.toLowerCase()]
      }

      // Default: slot
      if (!catCode) {
        catCode = 'slot'
        defaulted++
      }

      const catId = codeToId[catCode]
      if (catId) {
        if (!isDryRun) {
          updateSk.run(catId, game.id)
        }
        mapped++
      }
    }
  })
  tx1()

  console.log(`Total sk7755_games: ${sk7755Games.length}`)
  console.log(`Mapped: ${mapped}`)
  console.log(`Defaulted to slot: ${defaulted}`)

  // Verify
  const unmapped = db.prepare('SELECT COUNT(*) as c FROM sk7755_games WHERE category_id IS NULL').get().c
  console.log(`Unmapped after migration: ${unmapped}`)

  // 2. Migrate legacy games table
  console.log('\n=== Migrating legacy games table ===')
  const legacyGames = db.prepare('SELECT id, category, provider FROM games').all()
  const updateGame = db.prepare('UPDATE games SET category_id = ? WHERE id = ?')

  let legacyMapped = 0
  let legacyDefaulted = 0

  const tx2 = db.transaction(() => {
    for (const game of legacyGames) {
      let catCode = null
      if (game.category) {
        catCode = LEGACY_CATEGORY_MAP[game.category] || LEGACY_CATEGORY_MAP[game.category.toLowerCase()]
      }
      if (!catCode) {
        catCode = 'slot'
        legacyDefaulted++
      }
      const catId = codeToId[catCode]
      if (catId && !isDryRun) {
        updateGame.run(catId, game.id)
      }
      legacyMapped++
    }
  })
  tx2()

  console.log(`Total legacy games: ${legacyGames.length}`)
  console.log(`Mapped: ${legacyMapped}`)
  console.log(`Defaulted to slot: ${legacyDefaulted}`)

  // Summary
  console.log('\n=== Category Distribution ===')
  for (const cat of categories) {
    const sk = db.prepare('SELECT COUNT(*) as c FROM sk7755_games WHERE category_id = ?').get(cat.id).c
    const legacy = db.prepare('SELECT COUNT(*) as c FROM games WHERE category_id = ?').get(cat.id).c
    console.log(`  ${cat.code}: SK7755=${sk}, Legacy=${legacy}`)
  }

  if (isDryRun) {
    console.log('\n[DRY RUN] No changes were written.')
  } else {
    console.log('\nMigration complete!')
  }
}

// Main
if (isRollback) {
  rollback()
} else {
  migrate()
}

db.close()

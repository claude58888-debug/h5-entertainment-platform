const STORAGE_KEY = 'recent_browsing_games'
const MAX_ITEMS = 20

export function getRecentGames() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addRecentGame(game) {
  if (!game || !game.id) return
  try {
    const list = getRecentGames()
    const filtered = list.filter(g => g.id !== game.id)
    filtered.unshift({
      id: game.id,
      name: game.name,
      image: game.image || '',
      provider: game.provider || '',
      category: game.category || '',
      hot: game.hot || false,
      timestamp: Date.now()
    })
    const trimmed = filtered.slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function clearRecentGames() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

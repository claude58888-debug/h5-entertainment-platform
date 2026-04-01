import { describe, it, expect, beforeEach } from 'vitest'
import { getRecentGames, addRecentGame, clearRecentGames } from '@/utils/recentBrowsing'

describe('utils/recentBrowsing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getRecentGames() returns empty array when no data', () => {
    expect(getRecentGames()).toEqual([])
  })

  it('addRecentGame() stores a game and retrieves it', () => {
    addRecentGame({ id: 1, name: 'Slots Gold', image: '/img/slots.png', provider: 'PG' })
    const games = getRecentGames()
    expect(games).toHaveLength(1)
    expect(games[0].id).toBe(1)
    expect(games[0].name).toBe('Slots Gold')
  })

  it('addRecentGame() moves duplicate to front', () => {
    addRecentGame({ id: 1, name: 'Game A' })
    addRecentGame({ id: 2, name: 'Game B' })
    addRecentGame({ id: 1, name: 'Game A' })

    const games = getRecentGames()
    expect(games).toHaveLength(2)
    expect(games[0].id).toBe(1)
    expect(games[1].id).toBe(2)
  })

  it('addRecentGame() caps at 20 items', () => {
    for (let i = 1; i <= 25; i++) {
      addRecentGame({ id: i, name: `Game ${i}` })
    }
    expect(getRecentGames()).toHaveLength(20)
  })

  it('addRecentGame() ignores null/undefined/missing id', () => {
    addRecentGame(null)
    addRecentGame(undefined)
    addRecentGame({ name: 'No ID' })
    expect(getRecentGames()).toEqual([])
  })

  it('clearRecentGames() removes all stored games', () => {
    addRecentGame({ id: 1, name: 'Game A' })
    clearRecentGames()
    expect(getRecentGames()).toEqual([])
  })
})

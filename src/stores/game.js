import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGamesApi, getGameDetailApi, getGameCategoriesApi, getSK7755GamesApi } from '@/api/game'

const defaultCategories = [
  { id: 'home', labelKey: 'nav.home', icon: 'home' },
  { id: 'hot', labelKey: 'home.hot', icon: 'fire' },
  { id: 'slots', labelKey: 'home.slots', icon: 'slots' },
  { id: 'live', labelKey: 'home.live', icon: 'live' },
  { id: 'fishing', labelKey: 'home.fishing', icon: 'fish' },
  { id: 'lottery', labelKey: 'home.lottery', icon: 'lottery' },
  { id: 'sports', labelKey: 'home.sports', icon: 'sports' },
  { id: 'chess', labelKey: 'home.chess', icon: 'chess' },
]

// SK7755 category → H5 tab mapping
const categoryCodeMap = {
  'slot': 'slots',
  'live': 'live',
  'fish': 'fishing',
  'sports': 'sports',
  'lottery': 'lottery',
  'card': 'chess',
  'egame': 'slots',
  'slots': 'slots',
  'fishing': 'fishing',
  'chess': 'chess',
}

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const sk7755Games = ref([])
  const categories = ref(defaultCategories)
  const loading = ref(false)
  const fetched = ref(false)
  const sk7755Fetched = ref(false)

  const hotGames = computed(() => {
    const local = games.value.filter(g => g.hot || g.is_hot)
    const sk = sk7755Games.value.filter(g => g.is_hot)
    return [...local, ...sk]
  })

  function getGamesByCategory(category) {
    if (category === 'home' || category === 'hot') {
      return hotGames.value
    }
    const local = games.value.filter(g => {
      const mapped = categoryCodeMap[g.category] || g.category
      return mapped === category
    })
    const sk = sk7755Games.value.filter(g => {
      const mapped = categoryCodeMap[g.category] || g.category
      return mapped === category
    })
    return [...local, ...sk]
  }

  async function fetchGames(params = {}) {
    loading.value = true
    try {
      const res = await getGamesApi(params)
      const list = res?.list || res
      if (Array.isArray(list) && list.length) {
        if (!params.category && !params.search) {
          games.value = list
        }
        fetched.value = true
      }
    } catch (e) {
      console.warn('Games API failed', e)
    }
    await fetchSK7755Games()
    loading.value = false
    return games.value
  }

  async function fetchSK7755Games() {
    try {
      const res = await getSK7755GamesApi()
      const list = res?.list || []
      if (Array.isArray(list)) {
        sk7755Games.value = list.map(g => ({
          ...g,
          source: 'sk7755',
        }))
        sk7755Fetched.value = true
      }
    } catch (e) {
      console.warn('SK7755 games API failed', e)
    }
  }

  function getGameById(id) {
    const local = games.value.find(g => g.id === id || g.id === String(id))
    if (local) return local
    return sk7755Games.value.find(g => g.id === id || g.id === String(id)) || null
  }

  return {
    games, sk7755Games, categories, loading, hotGames,
    getGamesByCategory, fetchGames, fetchSK7755Games, getGameById,
  }
})

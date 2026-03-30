import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGamesApi, getGameDetailApi, getGameCategoriesApi } from '@/api/game'
const defaultCategories = [
  { id: 'home', labelKey: 'nav.home', icon: 'home' },
  { id: 'hot', labelKey: 'home.hot', icon: 'fire' },
  { id: 'slots', labelKey: 'home.slots', icon: 'slots' },
  { id: 'live', labelKey: 'home.live', icon: 'live' },
  { id: 'fishing', labelKey: 'home.fishing', icon: 'fish' },
  { id: 'lottery', labelKey: 'home.lottery', icon: 'lottery' },
  { id: 'sports', labelKey: 'home.sports', icon: 'sports' },
  { id: 'chess', labelKey: 'home.chess', icon: 'chess' },
  { id: 'video', labelKey: 'home.video', icon: 'video' }
]

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const categories = ref(defaultCategories)
  const providers = ref({})
  const loading = ref(false)
  const fetched = ref(false)

  const hotGames = computed(() => games.value.filter(g => g.hot))

  function getGamesByCategory(category) {
    if (category === 'home' || category === 'hot') {
      return hotGames.value
    }
    return games.value.filter(g => g.category === category)
  }

  function getProvidersByCategory(category) {
    return providers.value[category] || []
  }

  async function fetchGames(params = {}) {
    loading.value = true
    try {
      const res = await getGamesApi(params)
      const list = res?.list || res
      if (Array.isArray(list) && list.length) {
        // Merge with existing games if fetching a subset
        if (!params.category && !params.provider && !params.search) {
          games.value = list
        }
        fetched.value = true
        loading.value = false
        return list
      }
    } catch (e) {
      console.warn('Games API failed, using default data', e)
    }
    loading.value = false
    return games.value
  }

  function getGameById(id) {
    return games.value.find(g => g.id === id || g.id === String(id)) || null
  }

  return { games, categories, providers, loading, hotGames, getGamesByCategory, getProvidersByCategory, fetchGames, getGameById }
})

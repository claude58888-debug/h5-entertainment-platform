import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGamesApi, getGameDetailApi, getGameCategoriesApi } from '@/api/game'
import { mockGames, mockProviders, mockCategories } from '@/mock'

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const categories = ref(mockCategories)
  const providers = ref(mockProviders)
  const loading = ref(false)

  const hotGames = computed(() => games.value.filter(g => g.hot))

  function getGamesByCategory(category) {
    if (category === 'home' || category === 'hot') {
      return hotGames.value
    }
    if (category === 'recent') {
      return games.value.slice(0, 8)
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
      if (res?.length) {
        games.value = res
        loading.value = false
        let result = [...res]
        if (params.category && params.category !== 'home' && params.category !== 'hot') {
          result = result.filter(g => g.category === params.category)
        }
        if (params.category === 'hot') {
          result = result.filter(g => g.hot)
        }
        if (params.provider) {
          result = result.filter(g => g.provider === params.provider)
        }
        return result
      }
      throw new Error('No games data')
    } catch (e) {
      console.warn('Games API failed, using mock data', e)
      let result = [...mockGames]
      if (params.category && params.category !== 'home' && params.category !== 'hot') {
        result = result.filter(g => g.category === params.category)
      }
      if (params.category === 'hot') {
        result = result.filter(g => g.hot)
      }
      if (params.provider) {
        result = result.filter(g => g.provider === params.provider)
      }
      games.value = mockGames
      loading.value = false
      return result
    }
  }

  function getGameById(id) {
    const found = games.value.find(g => g.id === Number(id))
    if (found) return found
    return mockGames.find(g => g.id === Number(id))
  }

  return { games, categories, providers, loading, hotGames, getGamesByCategory, getProvidersByCategory, fetchGames, getGameById }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getGamesApi, getGameDetailApi, getGameCategoriesApi } from '@/api/game'
import { mockGames, mockProviders, mockCategories } from '@/mock'

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const categories = ref(mockCategories)
  const providers = ref(mockProviders)
  const loading = ref(false)
  const fetched = ref(false)

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
      if (!fetched.value) games.value = mockGames
    }
    loading.value = false
    return games.value
  }

  function getGameById(id) {
    return games.value.find(g => g.id === id || g.id === String(id)) || mockGames.find(g => g.id === Number(id)) || null
  }

  return { games, categories, providers, loading, hotGames, getGamesByCategory, getProvidersByCategory, fetchGames, getGameById }
})

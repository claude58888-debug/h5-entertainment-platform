import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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
    return games.value.filter(g => g.category === category)
  }

  function getProvidersByCategory(category) {
    return providers.value[category] || []
  }

  function fetchGames(params = {}) {
    return new Promise((resolve) => {
      loading.value = true
      setTimeout(() => {
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
        resolve(result)
      }, 600)
    })
  }

  function getGameById(id) {
    return mockGames.find(g => g.id === Number(id))
  }

  return { games, categories, providers, loading, hotGames, getGamesByCategory, getProvidersByCategory, fetchGames, getGameById }
})

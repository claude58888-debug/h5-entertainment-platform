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

const defaultProviders = {
  slots: [
    { id: 'PG', name: 'PG电子', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', image: '/img/providers/provider_pg.png' },
    { id: 'PP', name: 'PP电子', gradient: 'linear-gradient(135deg, #0f3460, #533483)', image: '/img/providers/provider_pp.png' },
    { id: 'JILI', name: 'JILI电子', gradient: 'linear-gradient(135deg, #e94560, #0f3460)' },
    { id: 'COMING', name: '即将推出' }
  ],
  live: [
    { id: 'EVO', name: 'EVO真人', gradient: 'linear-gradient(135deg, #2d3436, #000000)', image: '/img/providers/provider_evo.png' },
    { id: 'WM', name: 'WM真人', gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)', image: '/img/providers/provider_wm.png' },
    { id: 'GFG', name: 'GFG真人', gradient: 'linear-gradient(135deg, #e17055, #d63031)', image: '/img/providers/provider_gfg.png' },
    { id: 'COMING', name: '即将推出' }
  ],
  fishing: [
    { id: 'JDB_FISH', name: 'JDB捕鱼', gradient: 'linear-gradient(135deg, #0984e3, #6c5ce7)' },
    { id: 'FC_FISH', name: 'FC捕鱼', gradient: 'linear-gradient(135deg, #00b894, #00cec9)' },
    { id: 'JILI_FISH', name: 'JILI捕鱼', gradient: 'linear-gradient(135deg, #e17055, #fdcb6e)' }
  ],
  lottery: [
    { id: 'CANADA42', name: '加拿大4.2-4.6', gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)', link: '/canada28', backgroundImage: '/img/games/pc28-4.2.webp' },
    { id: 'CANADA_HIGH', name: '加拿大高倍网盘', gradient: 'linear-gradient(135deg, #e84393, #fd79a8)', link: '/canadaHigh', backgroundImage: '/img/games/pc28high.webp' },
    { id: 'HASH1M', name: '1分哈希', gradient: 'linear-gradient(135deg, #00b894, #55efc4)', link: '/hash1m' }
  ],
  sports: [
    { id: 'CR_SPORTS', name: 'CR皇冠体育', gradient: 'linear-gradient(135deg, #d4a017, #b8860b)' },
    { id: 'COMING', name: '即将推出' }
  ],
  chess: [
    { id: 'FC_CHESS', name: 'FC棋牌', gradient: 'linear-gradient(135deg, #2d3436, #636e72)' },
    { id: 'JILI_CHESS', name: 'JILI棋牌', gradient: 'linear-gradient(135deg, #e17055, #d63031)' },
    { id: 'COMING', name: '即将推出' }
  ],
  video: [
    { id: 'ADULT', name: '成人内容', gradient: 'linear-gradient(135deg, #e84393, #fd79a8)', link: '/video?tab=adult' },
    { id: 'MOVIES', name: '电影', gradient: 'linear-gradient(135deg, #0984e3, #74b9ff)', link: '/video?tab=movies' },
    { id: 'COMING', name: '即将推出' }
  ]
}

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const categories = ref(defaultCategories)
  const providers = ref(defaultProviders)
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

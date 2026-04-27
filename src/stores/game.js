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
  { id: 'video', labelKey: 'home.video', icon: 'video' }
]

const defaultProviders = {
  slots: [
    { id: 'PG', name: 'PG电子', label: 'PG SOFT', gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)', image: '/img/providers/provider_pg.png', gameCount: 80 },
    { id: 'PP', name: 'PP电子', label: 'PRAGMATIC PLAY', gradient: 'linear-gradient(135deg, #0f3460, #533483)', image: '/img/providers/provider_pp.png', gameCount: 120 },
    { id: 'CQ9', name: 'CQ9电子', label: 'CQ9 GAMING', gradient: 'linear-gradient(135deg, #00695c, #004d40)', gameCount: 95 },
    { id: 'FC', name: 'FC电子', label: 'FC GAMING', gradient: 'linear-gradient(135deg, #bf360c, #e65100)', gameCount: 65 },
    { id: 'JILI', name: 'JILI电子', label: 'JILI GAMES', gradient: 'linear-gradient(135deg, #e94560, #0f3460)', gameCount: 75 },
    { id: 'JDB', name: 'JDB电子', label: 'JDB GAMING', gradient: 'linear-gradient(135deg, #4a148c, #7b1fa2)', gameCount: 55 }
  ],
  live: [
    { id: 'EVO', name: 'EVO真人', label: 'EVOLUTION', gradient: 'linear-gradient(135deg, #2d3436, #000000)', image: '/img/providers/provider_evo.png', gameCount: 50 },
    { id: 'WM', name: 'WM真人', label: 'WM CASINO', gradient: 'linear-gradient(135deg, #281850, #3d2070)', image: '/img/providers/provider_wm.png', gameCount: 30 },
    { id: 'GFG', name: 'GFG真人', label: 'GFG LIVE', gradient: 'linear-gradient(135deg, #e17055, #d63031)', image: '/img/providers/provider_gfg.png', gameCount: 25 },
    { id: 'AG', name: 'AG真人', label: 'ASIA GAMING', gradient: 'linear-gradient(135deg, #1565c0, #0d47a1)', gameCount: 35 }
  ],
  fishing: [
    { id: 'JDB_FISH', name: 'JDB捕鱼', label: 'JDB FISHING', gradient: 'linear-gradient(135deg, #0984e3, #3b82f6)', gameCount: 15 },
    { id: 'FC_FISH', name: 'FC捕鱼', label: 'FC FISHING', gradient: 'linear-gradient(135deg, #00b894, #00cec9)', gameCount: 12 },
    { id: 'JILI_FISH', name: 'JILI捕鱼', label: 'JILI FISHING', gradient: 'linear-gradient(135deg, #e17055, #fdcb6e)', gameCount: 10 },
    { id: 'CQ9_FISH', name: 'CQ9捕鱼', label: 'CQ9 FISHING', gradient: 'linear-gradient(135deg, #00695c, #26a69a)', gameCount: 8 }
  ],
  lottery: [
    { id: 'CANADA42', name: '加拿大4.2-4.6', gradient: 'linear-gradient(135deg, #d4a843, #f3c869)', link: '/canada28', backgroundImage: '/img/games/pc28-4.2.webp' },
    { id: 'CANADA_HIGH', name: '加拿大高倍网盘', gradient: 'linear-gradient(135deg, #e84393, #fd79a8)', link: '/canadaHigh', backgroundImage: '/img/games/pc28high.webp' },
    { id: 'HASH1M', name: '1分哈希', gradient: 'linear-gradient(135deg, #00b894, #55efc4)', link: '/hash1m' }
  ],
  sports: [
    { id: 'CR_SPORTS', name: 'CR皇冠体育', label: 'CROWN SPORTS', gradient: 'linear-gradient(135deg, #d4a017, #b8860b)', gameCount: 20 },
    { id: 'IM_SPORTS', name: 'IM体育', label: 'IM SPORTS', gradient: 'linear-gradient(135deg, #1565c0, #42a5f5)', gameCount: 15 },
    { id: 'FB_SPORTS', name: 'FB体育', label: 'FB SPORTS', gradient: 'linear-gradient(135deg, #2e7d32, #66bb6a)', gameCount: 18 }
  ],
  chess: [
    { id: 'FC_CHESS', name: 'FC棋牌', label: 'FC CHESS', gradient: 'linear-gradient(135deg, #2d3436, #636e72)', gameCount: 20 },
    { id: 'JILI_CHESS', name: 'JILI棋牌', label: 'JILI CHESS', gradient: 'linear-gradient(135deg, #e17055, #d63031)', gameCount: 15 },
    { id: 'KY_CHESS', name: '开元棋牌', label: 'KY CHESS', gradient: 'linear-gradient(135deg, #f57f17, #ff8f00)', gameCount: 25 }
  ],
  video: [
    { id: 'ADULT', name: '成人内容', gradient: 'linear-gradient(135deg, #e84393, #fd79a8)', link: '/video?tab=adult' },
    { id: 'MOVIES', name: '电影', gradient: 'linear-gradient(135deg, #0984e3, #74b9ff)', link: '/video?tab=movies' },
    { id: 'COMING', name: '即将推出' }
  ]
}

// SK7755 platform → H5 category mapping
const sk7755CategoryMap = {
  slots: 'slots',
  live: 'live',
  sports: 'sports',
  fishing: 'fishing',
  lottery: 'lottery',
}

export const useGameStore = defineStore('game', () => {
  const games = ref([])
  const sk7755Games = ref([])
  const categories = ref(defaultCategories)
  const providers = ref(defaultProviders)
  const loading = ref(false)
  const fetched = ref(false)
  const sk7755Fetched = ref(false)

  const hotGames = computed(() => games.value.filter(g => g.hot))

  function getGamesByCategory(category) {
    if (category === 'home' || category === 'hot') {
      return hotGames.value
    }
    // Merge local games + SK7755 games for the category
    const local = games.value.filter(g => g.category === category)
    const sk = sk7755Games.value.filter(g => g.category === category)
    return [...local, ...sk]
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
        if (!params.category && !params.provider && !params.search) {
          games.value = list
        }
        fetched.value = true
      }
    } catch (e) {
      console.warn('Games API failed, using default data', e)
    }
    // Also fetch SK7755 games
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
    // Search local games first, then SK7755 games
    const local = games.value.find(g => g.id === id || g.id === String(id))
    if (local) return local
    return sk7755Games.value.find(g => g.id === id || g.id === String(id)) || null
  }

  return {
    games, sk7755Games, categories, providers, loading, hotGames,
    getGamesByCategory, getProvidersByCategory, fetchGames, fetchSK7755Games, getGameById,
  }
})

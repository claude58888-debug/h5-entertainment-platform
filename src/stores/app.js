import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getBannersApi, getAnnouncementsApi, getAppConfigApi } from '@/api/app'

const defaultBanners = [
  { id: 'b1', title: '新人首充双倍', subtitle: '首次充值即享100%加赠',     highlight: '100%', link: '/deposit',    gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%)' },
  { id: 'b2', title: '每日签到送豪礼', subtitle: '连续签到7天最高领888USDT', highlight: '888U', link: '/tasks',      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)' },
  { id: 'b3', title: '邀请好友赚佣金', subtitle: '每邀请一位好友最高奖励50USDT', highlight: '50U',  link: '/invite',     gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { id: 'b4', title: 'VIP专属特权',   subtitle: 'VIP等级越高返水越多',      highlight: 'VIP',  link: '/vip',        gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' },
  { id: 'b5', title: '充值返利活动',   subtitle: '每笔充值享最高2%返利',     highlight: '2%',   link: '/activities', gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' },
  { id: 'b6', title: '周末狂欢福利',   subtitle: '周末投注额外赠送奖金',     highlight: '2X',   link: '/promotions', gradient: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)' }
]

const defaultAnnouncements = [
  { id: 'a1', content: '🎉 欢迎来到DD娱乐平台！新用户注册即送体验金' },
  { id: 'a2', content: '🔥 充值返利活动火热进行中，最高返2%' },
  { id: 'a3', content: '📢 系统维护通知：每周二凌晨2:00-4:00进行例行维护' }
]

const defaultLiveWins = [
  { id: 'w1', user: 'VIP**5188', amount: '12,456', game: 'PG 糖果派对' },
  { id: 'w2', user: 'USDT**99', amount: '8,320', game: 'EVO 百家乐' },
  { id: 'w3', user: 'Player**23', amount: '21,008', game: 'JILI 捕鱼' },
  { id: 'w4', user: 'Dragon**77', amount: '5,420', game: 'PP 甜蜜派对' },
  { id: 'w5', user: 'Lucky**66', amount: '33,210', game: 'DG 龙虎' },
  { id: 'w6', user: 'Gold**08', amount: '9,870', game: 'CQ9 水浒传' }
]

export const useAppStore = defineStore('app', () => {
  const banners = ref(defaultBanners)
  const announcements = ref(defaultAnnouncements)
  const liveWins = ref(defaultLiveWins)
  const config = ref({})
  const loading = ref(false)

  async function fetchBanners() {
    try {
      const res = await getBannersApi()
      if (Array.isArray(res) && res.length) {
        banners.value = res
        return res
      }
    } catch (e) {
      console.warn('Banners API failed, using default data', e)
    }
    if (!banners.value.length) banners.value = defaultBanners
    return banners.value
  }

  async function fetchAnnouncements() {
    try {
      const res = await getAnnouncementsApi()
      if (Array.isArray(res) && res.length) {
        announcements.value = res
        return res
      }
    } catch (e) {
      console.warn('Announcements API failed, using default data', e)
    }
    if (!announcements.value.length) announcements.value = defaultAnnouncements
    return announcements.value
  }

  async function fetchConfig() {
    try {
      const res = await getAppConfigApi()
      if (res) {
        config.value = res
        return res
      }
    } catch (e) {
      console.warn('Config API failed, using defaults', e)
    }
    config.value = {
      siteName: 'H5 Entertainment',
      customerService: 'https://t.me/support',
      downloadUrl: '#'
    }
    return config.value
  }

  function initApp() {
    loading.value = true
    return Promise.all([
      fetchBanners(),
      fetchAnnouncements(),
      fetchConfig()
    ]).finally(() => {
      loading.value = false
    })
  }

  return { banners, announcements, liveWins, config, loading, fetchBanners, fetchAnnouncements, fetchConfig, initApp }
})

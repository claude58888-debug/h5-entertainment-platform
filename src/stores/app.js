import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockBanners, mockAnnouncements } from '@/mock'
import { getBannersApi, getAnnouncementsApi, getAppConfigApi } from '@/api/app'

export const useAppStore = defineStore('app', () => {
  const banners = ref(mockBanners)
  const announcements = ref(mockAnnouncements)
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

  return { banners, announcements, config, loading, fetchBanners, fetchAnnouncements, fetchConfig, initApp }
})

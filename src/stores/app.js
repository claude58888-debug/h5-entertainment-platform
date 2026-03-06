import { defineStore } from 'pinia'
import { ref } from 'vue'
import { mockBanners, mockAnnouncements } from '@/mock'

export const useAppStore = defineStore('app', () => {
  const banners = ref([])
  const announcements = ref([])
  const config = ref({})
  const loading = ref(false)

  function fetchBanners() {
    return new Promise((resolve) => {
      setTimeout(() => {
        banners.value = mockBanners
        resolve(mockBanners)
      }, 500)
    })
  }

  function fetchAnnouncements() {
    return new Promise((resolve) => {
      setTimeout(() => {
        announcements.value = mockAnnouncements
        resolve(mockAnnouncements)
      }, 300)
    })
  }

  function fetchConfig() {
    return new Promise((resolve) => {
      setTimeout(() => {
        config.value = {
          siteName: 'H5 Entertainment',
          customerService: 'https://t.me/support',
          downloadUrl: '#'
        }
        resolve(config.value)
      }, 200)
    })
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

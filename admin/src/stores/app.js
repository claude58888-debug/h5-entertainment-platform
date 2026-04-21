import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'admin_app_state'

function loadPersisted() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch (e) {
    return {}
  }
}

export const useAppStore = defineStore('app', () => {
  const persisted = loadPersisted()

  const sidebarCollapsed = ref(!!persisted.sidebarCollapsed)
  const theme = ref(persisted.theme || 'dark')
  const loading = ref(false)
  const pageLoading = ref(false)
  const notifications = ref([])
  let _nextNotifId = 1

  const isDark = computed(() => theme.value === 'dark')
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  function toggleSidebar() { sidebarCollapsed.value = !sidebarCollapsed.value }
  function setSidebarCollapsed(v) { sidebarCollapsed.value = !!v }

  function setTheme(t) {
    theme.value = t === 'light' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }
  function toggleTheme() { setTheme(theme.value === 'dark' ? 'light' : 'dark') }

  function setLoading(v) { loading.value = !!v }
  function setPageLoading(v) { pageLoading.value = !!v }

  function pushNotification(n) {
    const item = {
      id: _nextNotifId++,
      type: n.type || 'info', // info | success | warning | error
      title: n.title || '',
      message: n.message || '',
      createdAt: Date.now(),
      read: false,
    }
    notifications.value.unshift(item)
    if (notifications.value.length > 50) notifications.value.length = 50
    return item.id
  }
  function markRead(id) {
    const item = notifications.value.find(n => n.id === id)
    if (item) item.read = true
  }
  function markAllRead() { notifications.value.forEach(n => { n.read = true }) }
  function removeNotification(id) {
    notifications.value = notifications.value.filter(n => n.id !== id)
  }
  function clearNotifications() { notifications.value = [] }

  // Persist UI prefs (sidebar + theme) to localStorage
  watch([sidebarCollapsed, theme], () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sidebarCollapsed: sidebarCollapsed.value,
        theme: theme.value,
      }))
    } catch (e) { /* storage disabled */ }
  })

  // Apply theme class on init
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme.value === 'dark')
  }

  return {
    sidebarCollapsed, theme, loading, pageLoading, notifications,
    isDark, unreadCount,
    toggleSidebar, setSidebarCollapsed,
    setTheme, toggleTheme,
    setLoading, setPageLoading,
    pushNotification, markRead, markAllRead, removeNotification, clearNotifications,
  }
})

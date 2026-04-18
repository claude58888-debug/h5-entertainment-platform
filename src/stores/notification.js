import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const defaultMessages = [
  {
    id: 'm1',
    type: 'system',
    titleKey: 'messageSamples.m1.title',
    summaryKey: 'messageSamples.m1.summary',
    contentKey: 'messageSamples.m1.content',
    time: '2026-03-30 08:00',
    read: false,
    icon: 'volume-o'
  },
  {
    id: 'm2',
    type: 'personal',
    titleKey: 'messageSamples.m2.title',
    summaryKey: 'messageSamples.m2.summary',
    contentKey: 'messageSamples.m2.content',
    time: '2026-03-29 20:15',
    read: false,
    icon: 'balance-o'
  },
  {
    id: 'm3',
    type: 'personal',
    titleKey: 'messageSamples.m3.title',
    summaryKey: 'messageSamples.m3.summary',
    contentKey: 'messageSamples.m3.content',
    time: '2026-03-29 18:30',
    read: true,
    icon: 'cash-back-record'
  },
  {
    id: 'm4',
    type: 'system',
    titleKey: 'messageSamples.m4.title',
    summaryKey: 'messageSamples.m4.summary',
    contentKey: 'messageSamples.m4.content',
    time: '2026-03-29 10:00',
    read: false,
    icon: 'gift-o'
  },
  {
    id: 'm5',
    type: 'personal',
    titleKey: 'messageSamples.m5.title',
    summaryKey: 'messageSamples.m5.summary',
    contentKey: 'messageSamples.m5.content',
    time: '2026-03-29 09:00',
    read: true,
    icon: 'gift-o'
  },
  {
    id: 'm6',
    type: 'system',
    titleKey: 'messageSamples.m6.title',
    summaryKey: 'messageSamples.m6.summary',
    contentKey: 'messageSamples.m6.content',
    time: '2026-03-28 18:40',
    read: true,
    icon: 'shield-o'
  },
  {
    id: 'm7',
    type: 'system',
    titleKey: 'messageSamples.m7.title',
    summaryKey: 'messageSamples.m7.summary',
    contentKey: 'messageSamples.m7.content',
    time: '2026-03-28 08:00',
    read: true,
    icon: 'medal-o'
  },
  {
    id: 'm8',
    type: 'personal',
    titleKey: 'messageSamples.m8.title',
    summaryKey: 'messageSamples.m8.summary',
    contentKey: 'messageSamples.m8.content',
    time: '2026-03-28 15:20',
    read: true,
    icon: 'balance-o'
  }
]

// Bump storage key to v2 so users with the old English-only cached messages get the i18n-keyed version
const STORAGE_KEY = 'notifications_v2'

function loadInitialMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultMessages
    const parsed = JSON.parse(raw)
    // Sanity check: ensure messages are in the new keyed format
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].titleKey) {
      return parsed
    }
    return defaultMessages
  } catch {
    return defaultMessages
  }
}

export const useNotificationStore = defineStore('notification', () => {
  const messages = ref(loadInitialMessages())

  const unreadCount = computed(() => messages.value.filter(m => !m.read).length)

  function markAsRead(id) {
    const msg = messages.value.find(m => m.id === id)
    if (msg) {
      msg.read = true
      saveToStorage()
    }
  }

  function markAllAsRead() {
    messages.value.forEach(m => { m.read = true })
    saveToStorage()
  }

  function deleteMessage(id) {
    messages.value = messages.value.filter(m => m.id !== id)
    saveToStorage()
  }

  function getMessagesByType(type) {
    if (type === 'all') return messages.value
    return messages.value.filter(m => m.type === type)
  }

  function getUnreadByType(type) {
    if (type === 'all') return messages.value.filter(m => !m.read)
    return messages.value.filter(m => m.type === type && !m.read)
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
  }

  return {
    messages,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    getMessagesByType,
    getUnreadByType
  }
})

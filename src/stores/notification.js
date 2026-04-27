import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const defaultMessages = []

export const useNotificationStore = defineStore('notification', () => {
  // Clear legacy mock messages from localStorage (IDs m1-m8 were hardcoded fakes)
  const stored = JSON.parse(localStorage.getItem('notifications') || 'null')
  if (stored && stored.length > 0 && stored.some(m => ['m1','m2','m3','m4','m5','m6','m7','m8'].includes(m.id))) {
    localStorage.removeItem('notifications')
  }
  const messages = ref(JSON.parse(localStorage.getItem('notifications') || 'null') || defaultMessages)

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
    localStorage.setItem('notifications', JSON.stringify(messages.value))
  }

  return { messages, unreadCount, markAsRead, markAllAsRead, deleteMessage, getMessagesByType, getUnreadByType }
})

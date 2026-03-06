import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUser } from '@/mock'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const showLoginModal = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  function login(phone, password) {
    // Mock login
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockToken = 'mock_jwt_token_' + Date.now()
        token.value = mockToken
        user.value = { ...mockUser, phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(user.value))
        showLoginModal.value = false
        resolve({ success: true })
      }, 800)
    })
  }

  function register(phone, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockToken = 'mock_jwt_token_' + Date.now()
        token.value = mockToken
        user.value = { ...mockUser, phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(user.value))
        resolve({ success: true })
      }, 800)
    })
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, showLoginModal, isLoggedIn, login, register, logout }
})

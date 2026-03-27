import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUser } from '@/mock'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const user = ref(null)
  const showLoginModal = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  // Rate limiting
  const loginAttempts = ref(parseInt(localStorage.getItem('login_attempts') || '0'))
  const lockoutUntil = ref(parseInt(localStorage.getItem('lockout_until') || '0'))

  function clearExpiredLock() {
    if (lockoutUntil.value && Date.now() >= lockoutUntil.value) {
      loginAttempts.value = 0
      lockoutUntil.value = 0
      localStorage.removeItem('login_attempts')
      localStorage.removeItem('lockout_until')
    }
  }

  const isLocked = computed(() => {
    return !!(lockoutUntil.value && Date.now() < lockoutUntil.value)
  })

  const remainingLockTime = computed(() => {
    if (!isLocked.value) return 0
    return Math.ceil((lockoutUntil.value - Date.now()) / 1000 / 60)
  })

  function login(phone, password) {
    clearExpiredLock()
    if (isLocked.value) {
      return Promise.reject(new Error(`登录已锁定，请${remainingLockTime.value}分钟后重试`))
    }
    // Mock login
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation: any phone + password works
        const mockToken = 'mock_jwt_token_' + Date.now()
        token.value = mockToken
        user.value = { ...mockUser, phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }
        localStorage.setItem('token', mockToken)
        localStorage.setItem('user', JSON.stringify(user.value))
        showLoginModal.value = false
        // Reset attempts on success
        loginAttempts.value = 0
        localStorage.removeItem('login_attempts')
        localStorage.removeItem('lockout_until')
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

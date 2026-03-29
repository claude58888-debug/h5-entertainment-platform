import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginApi, registerApi } from '@/api/auth'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
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

  async function login(phone, password) {
    clearExpiredLock()
    if (isLocked.value) {
      throw new Error(`登录已锁定，请${remainingLockTime.value}分钟后重试`)
    }
    try {
      const res = await loginApi({ phone, password, username: phone })
      token.value = res.access_token
      user.value = res.user || { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(user.value))
      showLoginModal.value = false
      loginAttempts.value = 0
      localStorage.removeItem('login_attempts')
      localStorage.removeItem('lockout_until')
      return { success: true }
    } catch (err) {
      loginAttempts.value++
      localStorage.setItem('login_attempts', loginAttempts.value.toString())
      if (loginAttempts.value >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntil.value = Date.now() + LOCKOUT_DURATION
        localStorage.setItem('lockout_until', lockoutUntil.value.toString())
      }
      throw err
    }
  }

  async function register(phone, password) {
    const res = await registerApi({ phone, password, username: phone })
    token.value = res.access_token
    user.value = res.user || { phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }
    localStorage.setItem('token', res.access_token)
    localStorage.setItem('user', JSON.stringify(user.value))
    return { success: true }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, showLoginModal, isLoggedIn, login, register, logout }
})

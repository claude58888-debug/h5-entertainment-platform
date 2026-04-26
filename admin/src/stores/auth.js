import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminLogin } from '@/api/auth'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const isLoggedIn = computed(() => !!user.value)
  const role = computed(() => user.value?.role || '')
  const isSuperAdmin = computed(() => role.value === 'superadmin')
  const isAgent = computed(() => role.value === 'agent')

  // Rate limiting state
  const loginAttempts = ref(parseInt(localStorage.getItem('admin_login_attempts') || '0'))
  const lockoutUntil = ref(parseInt(localStorage.getItem('admin_lockout_until') || '0'))

  function clearExpiredLock() {
    if (lockoutUntil.value && Date.now() >= lockoutUntil.value) {
      loginAttempts.value = 0
      lockoutUntil.value = 0
      localStorage.removeItem('admin_login_attempts')
      localStorage.removeItem('admin_lockout_until')
    }
  }

  const isLocked = computed(() => {
    return !!(lockoutUntil.value && Date.now() < lockoutUntil.value)
  })

  const remainingLockTime = computed(() => {
    if (!isLocked.value) return 0
    return Math.ceil((lockoutUntil.value - Date.now()) / 1000 / 60)
  })


  async function login(username, password, selectedRole) {
    clearExpiredLock()
    if (isLocked.value) {
      return { success: false, locked: true, remainingMinutes: remainingLockTime.value }
    }

    let res = null
    try {
      res = await adminLogin(username, password, selectedRole)
    } catch (err) {
      console.warn('Login API failed', err)
    }

    if (res) {
      // Success - reset attempts
      loginAttempts.value = 0
      lockoutUntil.value = 0
      localStorage.removeItem('admin_login_attempts')
      localStorage.removeItem('admin_lockout_until')

      user.value = {
        ...res.user,
        token: res.access_token,
        role: selectedRole,
        agentName: selectedRole === 'agent' ? (res.user.agentName || '代理') : '总平台',
        loginTime: new Date().toISOString()
      }
      localStorage.setItem('admin_user', JSON.stringify(user.value))
      return { success: true }
    }

    loginAttempts.value++
    localStorage.setItem('admin_login_attempts', String(loginAttempts.value))

    if (loginAttempts.value >= MAX_LOGIN_ATTEMPTS) {
      lockoutUntil.value = Date.now() + LOCKOUT_DURATION
      localStorage.setItem('admin_lockout_until', String(lockoutUntil.value))
      return { success: false, locked: true, remainingMinutes: 15 }
    }

    return { success: false, locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - loginAttempts.value }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('admin_user')
  }

  return { user, isLoggedIn, role, isSuperAdmin, isAgent, isLocked, remainingLockTime, login, logout }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

  const isLocked = computed(() => {
    if (lockoutUntil.value && Date.now() < lockoutUntil.value) return true
    if (lockoutUntil.value && Date.now() >= lockoutUntil.value) {
      // Lock expired, reset
      loginAttempts.value = 0
      lockoutUntil.value = 0
      localStorage.removeItem('admin_login_attempts')
      localStorage.removeItem('admin_lockout_until')
    }
    return false
  })

  const remainingLockTime = computed(() => {
    if (!isLocked.value) return 0
    return Math.ceil((lockoutUntil.value - Date.now()) / 1000 / 60)
  })

  function login(username, password, selectedRole) {
    if (isLocked.value) {
      return { success: false, locked: true, remainingMinutes: remainingLockTime.value }
    }

    // Mock validation: admin/123456
    if (username !== 'admin' || password !== '123456') {
      loginAttempts.value++
      localStorage.setItem('admin_login_attempts', String(loginAttempts.value))

      if (loginAttempts.value >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntil.value = Date.now() + LOCKOUT_DURATION
        localStorage.setItem('admin_lockout_until', String(lockoutUntil.value))
        return { success: false, locked: true, remainingMinutes: 15 }
      }

      return { success: false, locked: false, attemptsLeft: MAX_LOGIN_ATTEMPTS - loginAttempts.value }
    }

    // Success - reset attempts
    loginAttempts.value = 0
    lockoutUntil.value = 0
    localStorage.removeItem('admin_login_attempts')
    localStorage.removeItem('admin_lockout_until')

    user.value = {
      username,
      role: selectedRole,
      agentName: selectedRole === 'agent' ? '金沙娱乐' : '总平台',
      loginTime: new Date().toISOString()
    }
    localStorage.setItem('admin_user', JSON.stringify(user.value))
    return { success: true }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('admin_user')
  }

  return { user, isLoggedIn, role, isSuperAdmin, isAgent, isLocked, remainingLockTime, login, logout }
})

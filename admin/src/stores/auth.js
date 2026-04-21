import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminLogin } from '@/api/auth'

const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15 minutes

// Permission matrix keyed by role. Granular feature flags that page guards /
// menu renderers can consult via `authStore.can(permission)`.
const ROLE_PERMISSIONS = {
  superadmin: [
    'dashboard:view',
    'agents:view', 'agents:create', 'agents:edit', 'agents:delete',
    'members:view', 'members:edit',
    'finance:view', 'finance:adjust', 'finance:approve',
    'games:view', 'games:edit',
    'vip:view', 'vip:edit',
    'rakeback:view', 'rakeback:edit',
    'promotions:view', 'promotions:edit',
    'messages:view', 'messages:send',
    'risk:view', 'risk:manage',
    'compliance:view', 'compliance:manage',
    'system:view', 'system:edit',
  ],
  agent: [
    'dashboard:view',
    'members:view',
    'finance:view',
    'games:view',
    'promotions:view', 'promotions:edit',
    'content:view', 'content:edit',
    'referral:view',
    'risk:view',
    'reports:view',
    'settings:view', 'settings:edit',
  ],
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const rememberedUsername = ref(localStorage.getItem('admin_remembered_username') || '')
  const isLoggedIn = computed(() => !!user.value)
  const token = computed(() => user.value?.token || '')
  const role = computed(() => user.value?.role || '')
  const displayName = computed(() => user.value?.displayName || user.value?.username || '')
  const isSuperAdmin = computed(() => role.value === 'superadmin')
  const isAgent = computed(() => role.value === 'agent')
  const permissions = computed(() => ROLE_PERMISSIONS[role.value] || [])

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

  const DEMO_ACCOUNTS = {
    admin: { password: 'demo', roles: ['superadmin', 'agent'], displayName: '管理员' }
  }

  function tryMockLogin(username, password, selectedRole) {
    const account = DEMO_ACCOUNTS[username]
    if (account && account.password === password && account.roles.includes(selectedRole)) {
      return {
        user: { username, displayName: account.displayName },
        access_token: 'demo-token-' + Date.now()
      }
    }
    return null
  }

  /**
   * @param {string} username
   * @param {string} password
   * @param {string} selectedRole  'superadmin' | 'agent'
   * @param {object} [opts]
   * @param {string} [opts.code]        6-digit 2FA code (optional; backend may ignore)
   * @param {boolean} [opts.remember]   persist username across sessions
   */
  async function login(username, password, selectedRole, opts = {}) {
    clearExpiredLock()
    if (isLocked.value) {
      return { success: false, locked: true, remainingMinutes: remainingLockTime.value }
    }

    let res = null
    try {
      res = await adminLogin(username, password, selectedRole, opts.code)
    } catch (err) {
      // Backend unavailable — fall back to mock login (2FA not enforced in mock)
      res = tryMockLogin(username, password, selectedRole)
    }

    if (res) {
      loginAttempts.value = 0
      lockoutUntil.value = 0
      localStorage.removeItem('admin_login_attempts')
      localStorage.removeItem('admin_lockout_until')

      user.value = {
        ...res.user,
        token: res.access_token,
        role: selectedRole,
        agentName: selectedRole === 'agent' ? '金沙娱乐' : '总平台',
        loginTime: new Date().toISOString(),
      }
      localStorage.setItem('admin_user', JSON.stringify(user.value))

      if (opts.remember) {
        localStorage.setItem('admin_remembered_username', username)
        rememberedUsername.value = username
      } else {
        localStorage.removeItem('admin_remembered_username')
        rememberedUsername.value = ''
      }
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

  function can(perm) { return permissions.value.includes(perm) }
  function canAny(perms) { return perms.some(p => can(p)) }
  function canAll(perms) { return perms.every(p => can(p)) }

  return {
    user, rememberedUsername,
    isLoggedIn, token, role, displayName, isSuperAdmin, isAgent, permissions,
    isLocked, remainingLockTime,
    login, logout,
    can, canAny, canAll,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('admin_user') || 'null'))
  const isLoggedIn = computed(() => !!user.value)
  const role = computed(() => user.value?.role || '')
  const isSuperAdmin = computed(() => role.value === 'superadmin')
  const isAgent = computed(() => role.value === 'agent')

  function login(username, password, selectedRole) {
    user.value = {
      username,
      role: selectedRole,
      agentName: selectedRole === 'agent' ? '金沙娱乐' : '总平台',
      loginTime: new Date().toISOString()
    }
    localStorage.setItem('admin_user', JSON.stringify(user.value))
    return true
  }

  function logout() {
    user.value = null
    localStorage.removeItem('admin_user')
  }

  return { user, isLoggedIn, role, isSuperAdmin, isAgent, login, logout }
})

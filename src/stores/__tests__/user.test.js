import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user'

// Mock the auth API module
vi.mock('@/api/auth', () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn()
}))

import { loginApi, registerApi } from '@/api/auth'

describe('stores/user', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('initializes with default values when localStorage is empty', () => {
    const store = useUserStore()
    expect(store.token).toBe('')
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(store.showLoginModal).toBe(false)
  })

  it('initializes with token from localStorage', () => {
    localStorage.setItem('token', 'saved-token')
    localStorage.setItem('user', JSON.stringify({ phone: '138****5678' }))

    // Need a fresh pinia to pick up localStorage
    setActivePinia(createPinia())
    const store = useUserStore()

    expect(store.token).toBe('saved-token')
    expect(store.user).toEqual({ phone: '138****5678' })
    expect(store.isLoggedIn).toBe(true)
  })

  it('login() stores token and user on success', async () => {
    loginApi.mockResolvedValue({
      access_token: 'new-token',
      user: { phone: '138****5678' }
    })

    const store = useUserStore()
    const result = await store.login('13812345678', 'password123')

    expect(result).toEqual({ success: true })
    expect(store.token).toBe('new-token')
    expect(store.isLoggedIn).toBe(true)
    expect(localStorage.getItem('token')).toBe('new-token')
  })

  it('login() increments attempts on failure', async () => {
    loginApi.mockRejectedValue(new Error('Invalid credentials'))

    const store = useUserStore()
    await expect(store.login('13800000000', 'wrong')).rejects.toThrow('Invalid credentials')
    expect(localStorage.getItem('login_attempts')).toBe('1')
  })

  it('login() locks out after MAX_LOGIN_ATTEMPTS (5) failures', async () => {
    loginApi.mockRejectedValue(new Error('Invalid credentials'))

    const store = useUserStore()
    for (let i = 0; i < 5; i++) {
      await expect(store.login('13800000000', 'wrong')).rejects.toThrow()
    }

    // 6th attempt should be locked
    await expect(store.login('13800000000', 'wrong')).rejects.toThrow(/登录已锁定/)
  })

  it('register() stores token and user on success', async () => {
    registerApi.mockResolvedValue({
      access_token: 'reg-token',
      user: { phone: '139****1234' }
    })

    const store = useUserStore()
    const result = await store.register('13912341234', 'password123')

    expect(result).toEqual({ success: true })
    expect(store.token).toBe('reg-token')
    expect(store.isLoggedIn).toBe(true)
  })

  it('logout() clears token and user', async () => {
    loginApi.mockResolvedValue({ access_token: 'tok', user: { phone: '138****0000' } })

    const store = useUserStore()
    await store.login('13800000000', 'pass')
    expect(store.isLoggedIn).toBe(true)

    store.logout()
    expect(store.token).toBe('')
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })
})

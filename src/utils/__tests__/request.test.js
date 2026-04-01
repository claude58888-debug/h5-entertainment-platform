import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

// Mock axios
vi.mock('axios', () => {
  const interceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  }
  const instance = {
    interceptors,
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
  return {
    default: {
      create: vi.fn(() => instance)
    }
  }
})

describe('utils/request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('creates an axios instance with correct defaults', async () => {
    // Re-import to trigger module execution
    vi.resetModules()
    await import('@/utils/request')

    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
      })
    )
  })

  it('registers request and response interceptors', async () => {
    vi.resetModules()
    const mod = await import('@/utils/request')
    const instance = mod.default

    expect(instance.interceptors.request.use).toHaveBeenCalledTimes(1)
    expect(instance.interceptors.response.use).toHaveBeenCalledTimes(1)
  })

  it('request interceptor attaches Bearer token from localStorage', async () => {
    vi.resetModules()
    localStorage.setItem('token', 'test-jwt-token')

    await import('@/utils/request')
    const requestFulfill = axios.create().interceptors.request.use.mock.calls[0][0]

    const config = { headers: {} }
    const result = requestFulfill(config)
    expect(result.headers.Authorization).toBe('Bearer test-jwt-token')
  })

  it('request interceptor does not attach token when absent', async () => {
    vi.resetModules()
    localStorage.removeItem('token')

    await import('@/utils/request')
    const requestFulfill = axios.create().interceptors.request.use.mock.calls[0][0]

    const config = { headers: {} }
    const result = requestFulfill(config)
    expect(result.headers.Authorization).toBeUndefined()
  })

  it('response interceptor returns response.data on success', async () => {
    vi.resetModules()
    await import('@/utils/request')
    const responseFulfill = axios.create().interceptors.response.use.mock.calls[0][0]

    const response = { data: { success: true, user: 'alice' } }
    expect(responseFulfill(response)).toEqual({ success: true, user: 'alice' })
  })
})

import { describe, it, expect, vi } from 'vitest'

// Mock the request module
vi.mock('@/utils/request', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

import request from '@/utils/request'
import { loginApi, registerApi, getUserInfoApi, logoutApi } from '@/api/auth'

describe('api/auth', () => {
  it('loginApi() calls POST /auth/login with credentials', async () => {
    const mockResponse = { access_token: 'tok', user: { phone: '138****5678' } }
    request.post.mockResolvedValue(mockResponse)

    const result = await loginApi({ phone: '13812345678', password: 'pass', username: '13812345678' })

    expect(request.post).toHaveBeenCalledWith('/auth/login', {
      phone: '13812345678',
      password: 'pass',
      username: '13812345678'
    })
    expect(result).toEqual(mockResponse)
  })

  it('registerApi() calls POST /auth/register with data', async () => {
    const mockResponse = { access_token: 'reg-tok', user: { phone: '139****1234' } }
    request.post.mockResolvedValue(mockResponse)

    const result = await registerApi({ phone: '13912341234', password: 'pass', username: '13912341234' })

    expect(request.post).toHaveBeenCalledWith('/auth/register', {
      phone: '13912341234',
      password: 'pass',
      username: '13912341234'
    })
    expect(result).toEqual(mockResponse)
  })

  it('getUserInfoApi() calls GET /user/profile', async () => {
    const mockProfile = { phone: '138****5678', vip: 3 }
    request.get.mockResolvedValue(mockProfile)

    const result = await getUserInfoApi()

    expect(request.get).toHaveBeenCalledWith('/user/profile')
    expect(result).toEqual(mockProfile)
  })

  it('logoutApi() resolves with success (client-side only)', async () => {
    const result = await logoutApi()
    expect(result).toEqual({ success: true })
  })
})

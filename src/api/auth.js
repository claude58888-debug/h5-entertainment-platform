import request from '@/utils/request'

export function loginApi(data) {
  return request.post('/auth/login', data)
}

export function registerApi(data) {
  return request.post('/auth/register', data)
}

export function getUserInfoApi() {
  return request.get('/user/profile')
}

export function logoutApi() {
  // Client-side only logout (clear token)
  return Promise.resolve({ success: true })
}

import request from '@/utils/request'

export function loginApi(data) {
  return request.post('/auth/login', data)
}

export function registerApi(data) {
  return request.post('/auth/register', data)
}

export function getUserInfoApi() {
  return request.get('/auth/userinfo')
}

export function logoutApi() {
  return request.post('/auth/logout')
}

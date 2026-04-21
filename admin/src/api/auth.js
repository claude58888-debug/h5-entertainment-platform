import api from './index'

export function adminLogin(username, password, role = 'superadmin', code) {
  const body = { username, password, role }
  if (code) body.code = code
  return api.post('/api/auth/admin-login', body)
}

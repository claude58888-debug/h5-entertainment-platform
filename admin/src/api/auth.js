import api from './index'

export function adminLogin(username, password, role = 'superadmin') {
  return api.post('/api/auth/admin-login', { username, password, role })
}

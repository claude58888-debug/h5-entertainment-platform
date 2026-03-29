import api from './index'

export function getDashboard() {
  return api.get('/api/admin/dashboard')
}

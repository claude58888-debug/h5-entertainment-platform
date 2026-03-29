import api from './index'

export function getDashboard(params) {
  return api.get('/api/admin/dashboard', { params })
}

export function getDashboardAlerts() {
  return api.get('/api/admin/dashboard/alerts')
}

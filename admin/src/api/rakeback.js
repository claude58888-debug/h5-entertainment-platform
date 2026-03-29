import api from './index'

export function getRakebackConfig() {
  return api.get('/api/admin/rakeback/config')
}

export function updateRakebackConfig(id, data) {
  return api.put(`/api/admin/rakeback/config/${id}`, data)
}

export function getRakebackRecords() {
  return api.get('/api/admin/rakeback/records')
}

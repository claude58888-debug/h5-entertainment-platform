import api from './index'

export function getVipLevels() {
  return api.get('/api/admin/vip-levels')
}

export function updateVipLevel(level, data) {
  return api.put(`/api/admin/vip-levels/${level}`, data)
}

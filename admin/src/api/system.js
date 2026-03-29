import api from './index'

export function getAdmins() {
  return api.get('/api/admin/admins')
}

export function createAdmin(data) {
  return api.post('/api/admin/admins', data)
}

export function toggleAdmin(adminId) {
  return api.put(`/api/admin/admins/${adminId}/status`)
}

export function deleteAdmin(adminId) {
  return api.delete(`/api/admin/admins/${adminId}`)
}

export function getLogs() {
  return api.get('/api/admin/logs')
}

export function getAnnouncements() {
  return api.get('/api/admin/announcements')
}

export function createAnnouncement(data) {
  return api.post('/api/admin/announcements', data)
}

export function updateAnnouncement(id, data) {
  return api.put(`/api/admin/announcements/${id}`, data)
}

export function deleteAnnouncement(id) {
  return api.delete(`/api/admin/announcements/${id}`)
}

export function getActivities() {
  return api.get('/api/admin/activities')
}

export function getVipLevels() {
  return api.get('/api/admin/vip-levels')
}

export function getSettings() {
  return api.get('/api/admin/settings')
}

export function updateSettings(data) {
  return api.put('/api/admin/settings', data)
}

export function getPermissions(role) {
  return api.get('/api/admin/system/permissions', { params: { role } })
}

export function updatePermissions(role, permissions) {
  return api.put(`/api/admin/system/permissions/${role}`, { permissions })
}

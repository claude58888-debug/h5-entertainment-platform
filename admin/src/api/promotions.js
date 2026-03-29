import api from './index'

export function getActivities() {
  return api.get('/api/admin/activities')
}

export function createActivity(data) {
  return api.post('/api/admin/activities', data)
}

export function updateActivity(id, data) {
  return api.put(`/api/admin/activities/${id}`, data)
}

export function deleteActivity(id) {
  return api.delete(`/api/admin/activities/${id}`)
}

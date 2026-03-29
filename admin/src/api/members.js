import api from './index'

export function getMembers(params) {
  return api.get('/api/admin/members', { params })
}

export function getMember(memberId) {
  return api.get(`/api/admin/members/${memberId}`)
}

export function memberAction(memberId, action, reason) {
  return api.put(`/api/admin/members/${memberId}/action`, { action, reason })
}

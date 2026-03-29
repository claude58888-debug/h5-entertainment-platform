import api from './index'

export function getMembers(params) {
  return api.get('/api/admin/members', { params })
}

export function getMember(memberId) {
  return api.get(`/api/admin/members/${memberId}`)
}

export function getMemberDetail(memberId) {
  return api.get(`/api/admin/members/${memberId}/detail`)
}

export function memberAction(memberId, action, reason) {
  return api.put(`/api/admin/members/${memberId}/action`, { action, reason })
}

export function updateMemberVip(memberId, level, reason) {
  return api.put(`/api/admin/members/${memberId}/vip`, { level, reason })
}

export function updateMemberTags(memberId, tags) {
  return api.put(`/api/admin/members/${memberId}/tags`, { tags })
}

export function forceLogoutMember(memberId) {
  return api.post(`/api/admin/members/${memberId}/force-logout`)
}

export function adjustMemberBalance(memberId, amount, type, reason) {
  return api.post(`/api/admin/members/${memberId}/balance-adjust`, { amount, type, reason })
}

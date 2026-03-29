import api from './index'

export function getRiskRules() {
  return api.get('/api/admin/risk/rules')
}

export function toggleRiskRule(ruleId) {
  return api.put(`/api/admin/risk/rules/${ruleId}`)
}

export function getBlacklist() {
  return api.get('/api/admin/risk/blacklist')
}

export function addBlacklist(ip, reason) {
  return api.post('/api/admin/risk/blacklist', { ip, reason })
}

export function removeBlacklist(ip) {
  return api.delete(`/api/admin/risk/blacklist/${ip}`)
}

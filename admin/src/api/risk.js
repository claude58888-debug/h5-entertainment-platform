import api from './index'

export function getRiskRules() {
  return api.get('/api/admin/risk/rules')
}

export function createRiskRule(data) {
  return api.post('/api/admin/risk/rules', data)
}

export function updateRiskRule(ruleId, data) {
  return api.put(`/api/admin/risk/rules/${ruleId}`, data)
}

export function toggleRiskRule(ruleId) {
  return api.put(`/api/admin/risk/rules/${ruleId}`)
}

export function deleteRiskRule(ruleId) {
  return api.delete(`/api/admin/risk/rules/${ruleId}`)
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

export function getWhitelist() {
  return api.get('/api/admin/risk/whitelist')
}

export function addWhitelist(ip, reason) {
  return api.post('/api/admin/risk/whitelist', { ip, reason })
}

export function removeWhitelist(ip) {
  return api.delete(`/api/admin/risk/whitelist/${ip}`)
}

export function getRiskAlerts(params) {
  return api.get('/api/admin/risk/alerts', { params })
}

export function handleRiskAlert(alertId, action) {
  return api.put(`/api/admin/risk/alerts/${alertId}`, { action })
}

export function getIpMonitoring(params) {
  return api.get('/api/admin/risk/ip-monitoring', { params })
}

export function getMemberRiskLevels(params) {
  return api.get('/api/admin/risk/member-levels', { params })
}

export function updateMemberRiskLevel(memberId, level) {
  return api.put(`/api/admin/risk/member-levels/${memberId}`, { level })
}

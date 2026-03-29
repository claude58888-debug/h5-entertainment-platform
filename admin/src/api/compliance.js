import api from './index'

export function getComplianceDashboard() {
  return api.get('/api/admin/compliance/dashboard')
}

export function getKycList(status) {
  const params = status ? { status } : {}
  return api.get('/api/admin/compliance/kyc', { params })
}

export function reviewKyc(id, action, rejectReason) {
  return api.put(`/api/admin/compliance/kyc/${id}`, { action, rejectReason })
}

export function getAmlAlerts(status) {
  const params = status ? { status } : {}
  return api.get('/api/admin/compliance/aml/alerts', { params })
}

export function resolveAmlAlert(id, action) {
  return api.put(`/api/admin/compliance/aml/alerts/${id}`, { action })
}

export function getExclusions() {
  return api.get('/api/admin/compliance/exclusions')
}

export function manageExclusion(id, action) {
  return api.put(`/api/admin/compliance/exclusions/${id}`, { action })
}

export function getComplianceSettings() {
  return api.get('/api/admin/compliance/settings')
}

export function updateComplianceSettings(settings) {
  return api.put('/api/admin/compliance/settings', settings)
}

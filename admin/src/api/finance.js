import api from './index'

export function getDeposits(params) {
  return api.get('/api/admin/deposits', { params })
}

export function updateDeposit(orderId, action, remark) {
  return api.put(`/api/admin/deposits/${orderId}`, { action, remark })
}

export function getWithdrawals(params) {
  return api.get('/api/admin/withdrawals', { params })
}

export function updateWithdrawal(orderId, action, remark) {
  return api.put(`/api/admin/withdrawals/${orderId}`, { action, remark })
}

export function getChannels() {
  return api.get('/api/admin/channels')
}

export function getSettlements() {
  return api.get('/api/admin/settlements')
}

export function getFinancialSummary() {
  return api.get('/api/admin/financial-summary')
}

export function createManualDeposit(data) {
  return api.post('/api/finance/deposits/manual', data)
}

export function exportDepositsCSV() {
  return api.get('/api/finance/deposits/export', { responseType: 'blob' })
}

export function exportWithdrawalsCSV() {
  return api.get('/api/finance/withdrawals/export', { responseType: 'blob' })
}

export function batchWithdrawals(data) {
  return api.post('/api/finance/withdrawals/batch', data)
}

export function getAutoReviewRules() {
  return api.get('/api/finance/auto-review-rules')
}

export function createAutoReviewRule(data) {
  return api.post('/api/finance/auto-review-rules', data)
}

export function updateAutoReviewRule(id, data) {
  return api.put(`/api/finance/auto-review-rules/${id}`, data)
}

export function deleteAutoReviewRule(id) {
  return api.delete(`/api/finance/auto-review-rules/${id}`)
}

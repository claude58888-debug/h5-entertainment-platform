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

// ==================== Phase 18A: Deposit Management ====================

export function getDepositStats() {
  return api.get('/api/finance/deposit-stats')
}

export function getDepositOrders(params) {
  return api.get('/api/admin/deposits', { params })
}

export function approveDeposit(orderId, notes) {
  return api.put(`/api/admin/deposits/${orderId}`, { action: 'approve', notes })
}

export function rejectDeposit(orderId, notes) {
  return api.put(`/api/admin/deposits/${orderId}`, { action: 'reject', notes })
}

export function getDepositChannels() {
  return api.get('/api/finance/deposit-channels')
}

export function saveDepositChannel(data) {
  if (data.id) {
    return api.put(`/api/finance/deposit-channels/${data.id}`, data)
  }
  return api.post('/api/finance/deposit-channels', data)
}

export function deleteDepositChannel(id) {
  return api.delete(`/api/finance/deposit-channels/${id}`)
}

// ==================== Phase 18A: Withdrawal Management ====================

export function getWithdrawOrders(params) {
  return api.get('/api/admin/withdrawals', { params })
}

export function updateWithdrawStatus(orderId, data) {
  const action = data.status === 'approved' ? 'approve'
    : data.status === 'rejected' ? 'reject'
    : data.status === 'completed' ? 'complete'
    : data.status === 'processing' ? 'review'
    : data.status
  return api.put(`/api/admin/withdrawals/${orderId}`, { action, reason: data.reason || '' })
}

// ==================== Phase 18A: Financial Report ====================

export function getFinancialReport(params) {
  return api.get('/api/admin/financial-summary', { params })
}

export function getGameCategoryRevenue() {
  return api.get('/api/finance/game-category-revenue')
}

export function exportFinancialCSV(params) {
  return api.get('/api/finance/financial-report/export', { params, responseType: 'blob' })
}

// ==================== Phase 18A: Balance Adjustment ====================

export function getMemberInfo(memberId) {
  return api.get(`/api/admin/members/${memberId}`)
}

export function adjustMemberBalance(data) {
  return api.post(`/api/admin/members/${data.memberId}/balance-adjust`, {
    amount: data.amount,
    type: data.type,
    reason: `[${data.reasonType}] ${data.reason}`
  })
}

export function getBalanceAdjustLogs() {
  return api.get('/api/finance/balance-adjust-logs')
}

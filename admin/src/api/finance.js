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

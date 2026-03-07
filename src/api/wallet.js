import request from '@/utils/request'

export function getBalanceApi() {
  return request.get('/wallet/balance')
}

export function depositApi(data) {
  return request.post('/wallet/deposit', data)
}

export function withdrawApi(data) {
  return request.post('/wallet/withdraw', data)
}

export function getTransactionsApi(params) {
  return request.get('/wallet/transactions', { params })
}

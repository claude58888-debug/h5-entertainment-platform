import request from '@/utils/request'

export function getPromotionsApi(params) {
  return request.get('/promotions', { params })
}

export function getPromotionDetailApi(id) {
  return request.get(`/promotions/${id}`)
}

export function applyPromotionApi(id) {
  return request.post(`/promotions/${id}/claim`)
}

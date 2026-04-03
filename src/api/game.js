import request from '@/utils/request'

export function getGamesApi(params) {
  return request.get('/games', { params })
}

export function getGameDetailApi(id) {
  return request.get(`/games/${id}`)
}

export function getGameCategoriesApi() {
  return request.get('/games/categories')
}

export function getProvidersApi(category) {
  return request.get('/games/providers', { params: { category } })
}

export function launchGameApi(id) {
  return request.post(`/games/${id}/launch`)
}

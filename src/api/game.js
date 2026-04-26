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

export function demoGameApi(id) {
  return request.post(`/games/${id}/demo`)
}

// SK7755 game aggregator APIs
export function getSK7755GamesApi(category) {
  return request.get('/sk7755/games', { params: { category } })
}

export function launchSK7755GameApi(platform, gameCode) {
  return request.post('/sk7755/launch', { platform, game_code: gameCode })
}

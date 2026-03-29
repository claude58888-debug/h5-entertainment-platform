import api from './index'

export function getGames(params) {
  return api.get('/api/admin/games', { params })
}

export function createGame(data) {
  return api.post('/api/admin/games', data)
}

export function updateGame(gameId, data) {
  return api.put(`/api/admin/games/${gameId}`, data)
}

export function deleteGame(gameId) {
  return api.delete(`/api/admin/games/${gameId}`)
}

export function getProviders() {
  return api.get('/api/admin/providers')
}

export function createProvider(data) {
  return api.post('/api/admin/providers', data)
}

export function updateProvider(providerId, data) {
  return api.put(`/api/admin/providers/${providerId}`, data)
}

export function getBets() {
  return api.get('/api/admin/bets')
}

export function getBetsWithPagination(params) {
  return api.get('/api/games/bets', { params })
}

export function updateHotScore(gameId, hotScore) {
  return api.put(`/api/games/${gameId}/hot-score`, { hot_score: hotScore })
}

export function updateRecommend(gameId, isRecommended, recommendSort) {
  return api.put(`/api/games/${gameId}/recommend`, { is_recommended: isRecommended, recommend_sort: recommendSort })
}

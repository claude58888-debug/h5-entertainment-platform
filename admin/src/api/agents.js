import api from './index'

export function getAgents(params) {
  return api.get('/api/admin/agents', { params })
}

export function getAgent(agentId) {
  return api.get(`/api/admin/agents/${agentId}`)
}

export function createAgent(data) {
  return api.post('/api/admin/agents', data)
}

export function updateAgent(agentId, data) {
  return api.put(`/api/admin/agents/${agentId}`, data)
}

export function deleteAgent(agentId) {
  return api.delete(`/api/admin/agents/${agentId}`)
}

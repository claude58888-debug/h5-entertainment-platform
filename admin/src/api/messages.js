import api from './index'

export function getMessages() {
  return api.get('/api/admin/messages')
}

export function sendMessage(data) {
  return api.post('/api/admin/messages', data)
}

export function deleteMessage(id) {
  return api.delete(`/api/admin/messages/${id}`)
}

export function getSystemNotifications() {
  return api.get('/api/admin/system-notifications')
}

export function getChatSessions() {
  return api.get('/api/admin/chat-sessions')
}

export function updateChatSession(id, data) {
  return api.put(`/api/admin/chat-sessions/${id}`, data)
}

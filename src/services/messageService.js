import api from './api'

export const getConversations = () => api.get('/messages/conversations')
export const createConversation = (userId) => api.post(`/messages/conversations/${userId}`)
export const getMessages = (userId, page = 1, limit = 50) => 
  api.get(`/messages/${userId}?page=${page}&limit=${limit}`)
export const sendMessage = (data) => api.post('/messages', data)
export const markMessageRead = (messageId) => api.put(`/messages/${messageId}/read`)
export const getUnreadCount = () => api.get('/messages/unread-count')
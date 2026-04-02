import api from './api';

export const getNotifications = (page = 1, limit = 20) => api.get(`/notifications?page=${page}&limit=${limit}`);
export const getUnreadCount = () => api.get('/notifications/unread-count');
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllRead = () => api.put('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
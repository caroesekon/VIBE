import api from './api';

export const sendFriendRequest = (userId) => api.post(`/friends/request/${userId}`);
export const acceptFriendRequest = (requestId) => api.put(`/friends/request/${requestId}/accept`);
export const rejectFriendRequest = (requestId) => api.put(`/friends/request/${requestId}/reject`);
export const getFriendRequests = () => api.get('/friends/requests');
export const getFriendsList = () => api.get('/friends/list');
export const removeFriend = (friendId) => api.delete(`/friends/${friendId}`);
export const getFriendStatus = (userId) => api.get(`/friends/status/${userId}`);
export const cancelFriendRequest = (userId) => api.delete(`/friends/request/${userId}/cancel`);
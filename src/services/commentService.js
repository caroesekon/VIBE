import api from './api';

export const getComments = (postId, page = 1, limit = 20) => 
  api.get(`/comments?postId=${postId}&page=${page}&limit=${limit}`);

export const createComment = (data) => api.post('/comments', data);
export const updateComment = (commentId, content) => api.put(`/comments/${commentId}`, { content });
export const deleteComment = (commentId) => api.delete(`/comments/${commentId}`);
export const likeComment = (commentId) => api.post(`/comments/${commentId}/like`);
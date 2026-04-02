import api from './api'

export const createPost = (data) => api.post('/posts', data)
export const getFeed = (page = 1, limit = 10) => api.get(`/posts/feed?page=${page}&limit=${limit}`)
export const getUserPosts = (userId, page = 1, limit = 10) => api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`)
export const getPost = (postId) => api.get(`/posts/${postId}`)
export const updatePost = (postId, data) => api.put(`/posts/${postId}`, data)
export const deletePost = (postId) => api.delete(`/posts/${postId}`)

// likePost now accepts reaction parameter
export const likePost = (postId, reaction = 'like') => {
  return api.post(`/posts/${postId}/like`, { reaction })
}

export const sharePost = (postId, data) => api.post(`/posts/${postId}/share`, data)
import api from './api'

export const getUserProfile = (userId) => api.get(`/users/profile/${userId}`)
export const updateProfile = (data) => api.put('/users/profile', data)
export const updateAvatar = (imageUrl) => api.put('/users/avatar', { imageUrl })
export const updateCover = (imageUrl) => api.put('/users/cover', { imageUrl })
export const searchUsers = (query) => api.get(`/users/search?q=${query}`)
export const getSuggestions = () => api.get('/users/suggestions')
export const getUserPhotos = (userId) => api.get(`/users/${userId}/photos`)  // FIXED: correct endpoint
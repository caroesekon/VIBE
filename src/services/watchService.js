import api from './api'

export const getVideos = (page = 1, limit = 12, filters = {}) => {
  let url = `/watch/videos?page=${page}&limit=${limit}`
  if (filters.search) url += `&search=${filters.search}`
  if (filters.category) url += `&category=${filters.category}`
  return api.get(url)
}

export const getVideo = (id) => api.get(`/watch/videos/${id}`)
export const createVideo = (data) => api.post('/watch/videos', data)
export const updateVideo = (id, data) => api.put(`/watch/videos/${id}`, data)
export const deleteVideo = (id) => api.delete(`/watch/videos/${id}`)
export const likeVideo = (id) => api.post(`/watch/videos/${id}/like`)
export const getMyVideos = () => api.get('/watch/my-videos')
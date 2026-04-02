import api from './api'

export const uploadVideo = (formData) => api.post('/upload/video', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (progressEvent) => {
    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
    return percentCompleted
  }
})

export const getVideos = (page = 1, limit = 12, category = '') => {
  let url = `/watch/videos?page=${page}&limit=${limit}`
  if (category) url += `&category=${category}`
  return api.get(url)
}

export const getVideo = (id) => api.get(`/watch/videos/${id}`)
export const updateVideo = (id, data) => api.put(`/watch/videos/${id}`, data)
export const deleteVideo = (id) => api.delete(`/watch/videos/${id}`)
export const likeVideo = (id) => api.post(`/watch/videos/${id}/like`)
export const commentOnVideo = (id, content) => api.post(`/watch/videos/${id}/comment`, { content })
export const getMyVideos = () => api.get('/watch/my-videos')
export const getTrendingVideos = () => api.get('/watch/trending')
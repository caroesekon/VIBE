import api from './api'

export const getStories = () => api.get('/stories')
export const createStory = (data) => api.post('/stories', data)
export const deleteStory = (storyId) => api.delete(`/stories/${storyId}`)
export const viewStory = (storyId) => api.post(`/stories/${storyId}/view`)
export const reactToStory = (storyId, reaction) => api.post(`/stories/${storyId}/react`, { reaction })
export const getStoryViewers = (storyId) => api.get(`/stories/${storyId}/viewers`)
export const getUserStories = (userId) => api.get(`/stories/user/${userId}`)
import api from './api'

export const createGroup = (data) => api.post('/groups', data)
export const getMyGroups = () => api.get('/groups')
export const discoverGroups = () => api.get('/groups/discover')
export const getGroup = (groupId) => api.get(`/groups/${groupId}`)
export const updateGroup = (groupId, data) => api.put(`/groups/${groupId}`, data)
export const deleteGroup = (groupId) => api.delete(`/groups/${groupId}`)
export const joinGroup = (groupId) => api.post(`/groups/${groupId}/join`)
export const leaveGroup = (groupId) => api.post(`/groups/${groupId}/leave`)

export const getGroupPosts = (groupId, page = 1, limit = 10) => api.get(`/groups/posts/${groupId}/posts?page=${page}&limit=${limit}`)
export const createGroupPost = (groupId, data) => api.post(`/groups/posts/${groupId}/posts`, data)
export const updateGroupPost = (groupId, postId, data) => api.put(`/groups/posts/${groupId}/posts/${postId}`, data)
export const deleteGroupPost = (groupId, postId) => api.delete(`/groups/posts/${groupId}/posts/${postId}`)
export const likeGroupPost = (groupId, postId) => api.post(`/groups/posts/${groupId}/posts/${postId}/like`)

export const getGroupMembers = (groupId, page = 1, limit = 20) => api.get(`/groups/members/${groupId}/members?page=${page}&limit=${limit}`)
export const getJoinRequests = (groupId) => api.get(`/groups/members/${groupId}/requests`)
export const approveJoinRequest = (groupId, userId) => api.put(`/groups/members/${groupId}/requests/${userId}/approve`)
export const rejectJoinRequest = (groupId, userId) => api.put(`/groups/members/${groupId}/requests/${userId}/reject`)
export const removeGroupMember = (groupId, userId) => api.delete(`/groups/members/${groupId}/members/${userId}`)
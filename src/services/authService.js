import api from './api'

export const login = (identifier, password) => api.post('/auth/login', { identifier, password })
export const register = (name, email, password, phone) => api.post('/auth/register', { name, email, password, phone })
export const logout = () => api.post('/auth/logout')
export const refreshToken = () => api.post('/auth/refresh')
export const getCurrentUser = () => api.get('/auth/me')
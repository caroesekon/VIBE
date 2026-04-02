import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens, isTokenExpired } from '../utils/tokenManager'

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vibeserver.pxxl.click/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Request interceptor - add token
api.interceptors.request.use(
  async (config) => {
    let token = getAccessToken()
    
    // Check if token is expired and refresh if needed
    if (token && isTokenExpired(token)) {
      token = await refreshToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }
      
      originalRequest._retry = true
      isRefreshing = true
      
      try {
        const newToken = await refreshToken()
        if (newToken) {
          processQueue(null, newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest)
        } else {
          processQueue(new Error('Refresh failed'), null)
          clearTokens()
          window.location.href = '/login'
          return Promise.reject(error)
        }
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

const refreshToken = async () => {
  const refresh = getRefreshToken()
  if (!refresh) return null
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${refresh}` }
    })
    const { accessToken } = response.data
    setTokens(accessToken, refresh)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    return accessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
}

export default api
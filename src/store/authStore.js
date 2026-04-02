import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'
import { setTokens, clearTokens, getAccessToken, getRefreshToken } from '../utils/tokenManager'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      init: async () => {
        const token = getAccessToken()
        const refresh = getRefreshToken()
        
        if (token) {
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            
            const res = await api.get('/auth/me')
            set({
              user: res.data.data,
              accessToken: token,
              refreshToken: refresh,
              isAuthenticated: true,
              isLoading: false
            })
            return true
          } catch (error) {
            console.error('Init auth error:', error)
            const refreshed = await get().refreshToken()
            if (!refreshed) {
              get().logout()
            }
            set({ isLoading: false })
            return false
          }
        } else {
          set({ isLoading: false })
          return false
        }
      },

      login: async (identifier, password) => {
        try {
          const res = await api.post('/auth/login', { identifier, password })
          const { accessToken, refreshToken, user } = res.data.data
          
          setTokens(accessToken, refreshToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          console.error('Login error:', error)
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed'
          }
        }
      },

      register: async (name, email, password, phone) => {
        try {
          const res = await api.post('/auth/register', { name, email, password, phone })
          const { accessToken, refreshToken, user } = res.data.data
          
          setTokens(accessToken, refreshToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          console.error('Register error:', error)
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          // Ignore errors on logout
        }
        delete api.defaults.headers.common['Authorization']
        clearTokens()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false
        })
      },

      refreshToken: async () => {
        try {
          const refreshToken = getRefreshToken()
          if (!refreshToken) return false
          
          const res = await api.post('/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refreshToken}` }
          })
          
          const newAccessToken = res.data.accessToken
          setTokens(newAccessToken, refreshToken)
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
          
          set({ accessToken: newAccessToken, isAuthenticated: true })
          
          const userRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${newAccessToken}` }
          })
          set({ user: userRes.data.data })
          
          return true
        } catch (error) {
          console.error('Refresh token error:', error)
          return false
        }
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser }
        }))
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('Auth store rehydrated:', state?.isAuthenticated)
        if (state?.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.accessToken}`
        }
      }
    }
  )
)
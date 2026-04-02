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
        if (token) {
          try {
            const res = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${token}` }
            })
            set({
              user: res.data.data,
              accessToken: token,
              refreshToken: getRefreshToken(),
              isAuthenticated: true,
              isLoading: false
            })
          } catch (error) {
            // Token invalid, try refresh
            const refreshed = await get().refreshToken()
            if (!refreshed) {
              get().logout()
            }
          }
        } else {
          set({ isLoading: false })
        }
      },

      login: async (identifier, password) => {
        try {
          const res = await api.post('/auth/login', { identifier, password })
          const { accessToken, refreshToken, user } = res.data.data
          setTokens(accessToken, refreshToken)
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
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
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false
          })
          return { success: true }
        } catch (error) {
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          }
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout', {}, {
            headers: { Authorization: `Bearer ${get().accessToken}` }
          })
        } catch (error) {
          // Ignore errors on logout
        } finally {
          clearTokens()
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false
          })
        }
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
          set({ accessToken: newAccessToken, isAuthenticated: true })
          
          // Re-fetch user
          const userRes = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${newAccessToken}` }
          })
          set({ user: userRes.data.data })
          
          return true
        } catch (error) {
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
    }
  )
)

// Auto-initialize
useAuthStore.getState().init()
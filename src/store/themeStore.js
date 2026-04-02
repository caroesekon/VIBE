import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () => {
        set((state) => {
          const newIsDark = !state.isDark
          if (newIsDark) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return { isDark: newIsDark }
        })
      },
      setTheme: (isDark) => {
        if (isDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
        set({ isDark })
      }
    }),
    {
      name: 'theme-storage',
    }
  )
)

// Initialize from localStorage safely (handles legacy "dark"/"light" strings)
const saved = localStorage.getItem('theme-storage')
if (saved) {
  try {
    const parsed = JSON.parse(saved)
    if (parsed.state && typeof parsed.state.isDark === 'boolean') {
      if (parsed.state.isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Fallback for corrupted data
      document.documentElement.classList.remove('dark')
    }
  } catch (e) {
    // Legacy: maybe stored as plain string "dark" or "light"
    if (saved === 'dark') {
      document.documentElement.classList.add('dark')
      // Upgrade to new format
      localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark: true } }))
    } else if (saved === 'light') {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme-storage', JSON.stringify({ state: { isDark: false } }))
    } else {
      console.error('Error parsing theme:', e)
      document.documentElement.classList.remove('dark')
    }
  }
} else {
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
    useThemeStore.getState().setTheme(true)
  }
}
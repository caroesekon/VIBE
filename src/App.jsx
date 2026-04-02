import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useUIStore } from './store/uiStore'
import { useEffect } from 'react'
import PrivateRoute from './components/common/PrivateRoute'
import Layout from './components/layout/Layout'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Main Pages
import Home from './pages/home/Home'
import Profile from './pages/profile/Profile'
import Groups from './pages/groups/Groups'
import GroupDetails from './pages/groups/GroupDetails'
import Messages from './pages/messages/Messages'
import Friends from './pages/friends/Friends'
import Settings from './pages/settings/Settings'

// Feature Pages
import Marketplace from './pages/marketplace/Marketplace'
import Watch from './pages/watch/Watch'
import Notifications from './pages/notifications/Notifications'
import Search from './pages/search/Search'

// Legal Pages
import Terms from './pages/legal/Terms'
import Privacy from './pages/legal/Privacy'
import About from './pages/legal/About'
import Help from './pages/legal/Help'
import AdChoices from './pages/legal/AdChoices'

// Error Page
import NotFound from './pages/NotFound'

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()
  const { darkMode } = useUIStore()

  // Apply dark mode class to html element when store changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Legal Routes - Public */}
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/about" element={<About />} />
      <Route path="/help" element={<Help />} />
      <Route path="/ad-choices" element={<AdChoices />} />
      
      {/* Protected Routes with Layout */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:userId?" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:groupId" element={<GroupDetails />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      
      {/* 404 Not Found */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}

export default App
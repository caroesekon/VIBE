import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSocket } from '../../hooks/useSocket'
import { useUIStore } from '../../store/uiStore'
import { getUnreadCount } from '../../services/notificationService'
import { getFriendRequests } from '../../services/friendService'
import { 
  FiHome, 
  FiUsers, 
  FiMessageSquare, 
  FiBell, 
  FiSearch,
  FiLogOut,
  FiChevronDown,
  FiVideo,
  FiFlag,
  FiSettings,
  FiShoppingBag,
  FiSun,
  FiMoon
} from 'react-icons/fi'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const { darkMode, toggleDarkMode } = useUIStore()
  const navigate = useNavigate()
  const location = useLocation()
  const socket = useSocket()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [pendingRequests, setPendingRequests] = useState(0)

  const fetchUnreadCount = async () => {
    if (!isAuthenticated || !user) return
    try {
      const res = await getUnreadCount()
      setUnreadCount(res.data.data?.count || 0)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  const fetchPendingRequests = async () => {
    if (!isAuthenticated || !user) return
    try {
      const res = await getFriendRequests()
      const pending = res.data.data?.filter(r => r.status === 'pending') || []
      setPendingRequests(pending.length)
    } catch (error) {
      console.error('Failed to fetch pending requests:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUnreadCount()
      fetchPendingRequests()
      
      const interval = setInterval(() => {
        fetchUnreadCount()
        fetchPendingRequests()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (!socket) return

    const handleNewNotification = () => {
      fetchUnreadCount()
    }

    const handleFriendRequest = () => {
      fetchPendingRequests()
      fetchUnreadCount()
    }

    socket.on('new_notification', handleNewNotification)
    socket.on('friend_request', handleFriendRequest)
    socket.on('friend_updated', handleFriendRequest)

    return () => {
      socket.off('new_notification', handleNewNotification)
      socket.off('friend_request', handleFriendRequest)
      socket.off('friend_updated', handleFriendRequest)
    }
  }, [socket])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path
  }

  const totalNotifications = unreadCount + pendingRequests

  // Don't render header if not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-blue-600 hidden sm:inline">Vibe</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-48 bg-gray-100 dark:bg-gray-700 rounded-full py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
                />
              </div>
            </form>
          </div>

          {/* Navigation Icons */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`p-2 rounded-lg ${isActive('/') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiHome size={20} />
            </Link>
            <Link to="/friends" className={`p-2 rounded-lg relative ${isActive('/friends') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiUsers size={20} />
              {pendingRequests > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {pendingRequests > 9 ? '9+' : pendingRequests}
                </span>
              )}
            </Link>
            <Link to="/messages" className={`p-2 rounded-lg ${isActive('/messages') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiMessageSquare size={20} />
            </Link>
            <Link to="/notifications" className={`p-2 rounded-lg relative ${isActive('/notifications') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiBell size={20} />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              )}
            </Link>
            <Link to="/watch" className={`p-2 rounded-lg ${isActive('/watch') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiVideo size={20} />
            </Link>
            <Link to="/groups" className={`p-2 rounded-lg ${isActive('/groups') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiFlag size={20} />
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? <FiSun size={20} className="text-yellow-500" /> : <FiMoon size={20} className="text-gray-600 dark:text-gray-400" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-1 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} 
                  alt={user?.name || 'User'} 
                  className="h-8 w-8 rounded-full object-cover"
                />
                <FiChevronDown size={14} className="text-gray-500 hidden md:block" />
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-3">
                        <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email || ''}</p>
                          <Link to={`/profile/${user?._id}`} className="text-xs text-blue-600 hover:underline" onClick={() => setShowDropdown(false)}>View profile</Link>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link to="/" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiHome size={16} /><span>Home</span></Link>
                      <Link to="/friends" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiUsers size={16} /><span>Friends</span></Link>
                      <Link to="/messages" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiMessageSquare size={16} /><span>Messages</span></Link>
                      <Link to="/notifications" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiBell size={16} /><span>Notifications</span></Link>
                      <Link to="/marketplace" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiShoppingBag size={16} /><span>Marketplace</span></Link>
                      <Link to="/watch" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiVideo size={16} /><span>Watch</span></Link>
                      <Link to="/groups" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiFlag size={16} /><span>Groups</span></Link>
                      <Link to="/settings" className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm" onClick={() => setShowDropdown(false)}><FiSettings size={16} /><span>Settings</span></Link>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                      <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 text-sm">
                        <FiLogOut size={16} /><span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-2">
        <form onSubmit={handleSearch} className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Vibe"
            className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800"
          />
        </form>
      </div>
    </header>
  )
}
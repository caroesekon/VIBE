import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'
import { useSocket } from '../../context/SocketContext'
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
  const { darkMode, toggleDarkMode, unreadCount, pendingRequests, setUnreadCount, setPendingRequests } = useUIStore()
  const socket = useSocket()
  const navigate = useNavigate()
  const location = useLocation()
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Initial fetch and periodic refresh
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const fetchCounts = async () => {
      try {
        const [unreadRes, requestsRes] = await Promise.all([
          getUnreadCount(),
          getFriendRequests()
        ]);
        setUnreadCount(unreadRes.data.data?.count || 0);
        const pending = requestsRes.data.data?.filter(r => r.status === 'pending') || [];
        setPendingRequests(pending.length);
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    };

    fetchCounts();
    
    // Refresh every 30 seconds as fallback
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, setUnreadCount, setPendingRequests]);

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };

    const handleFriendRequest = () => {
      setPendingRequests(prev => prev + 1);
    };

    const handleFriendUpdated = () => {
      // Refresh friend requests count
      getFriendRequests().then(res => {
        const pending = res.data.data?.filter(r => r.status === 'pending') || [];
        setPendingRequests(pending.length);
      });
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('friend_request', handleFriendRequest);
    socket.on('friend_updated', handleFriendUpdated);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('friend_request', handleFriendRequest);
      socket.off('friend_updated', handleFriendUpdated);
    };
  }, [socket, setUnreadCount, setPendingRequests]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const totalNotifications = unreadCount + pendingRequests;

  if (!isAuthenticated || !user) return null;

  return (
    <header className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-1">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-blue-600 hidden sm:inline ml-1">Vibe</span>
          </Link>

          {/* Navigation Icons */}
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide">
            <Link to="/" className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isActive('/') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiHome size={20} />
            </Link>
            <Link to="/friends" className={`p-1.5 sm:p-2 rounded-lg transition-colors relative ${isActive('/friends') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiUsers size={20} />
              {pendingRequests > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {pendingRequests > 9 ? '9+' : pendingRequests}
                </span>
              )}
            </Link>
            <Link to="/groups" className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isActive('/groups') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiFlag size={20} />
            </Link>
            <Link to="/watch" className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isActive('/watch') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiVideo size={20} />
            </Link>
            <Link to="/marketplace" className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isActive('/marketplace') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiShoppingBag size={20} />
            </Link>
            <Link to="/messages" className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isActive('/messages') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiMessageSquare size={20} />
            </Link>
            <Link to="/notifications" className={`p-1.5 sm:p-2 rounded-lg transition-colors relative ${isActive('/notifications') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
              <FiBell size={20} />
              {totalNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              )}
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {darkMode ? <FiSun size={18} className="text-yellow-500" /> : <FiMoon size={18} className="text-gray-600" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <img 
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} 
                  alt={user?.name || 'User'} 
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                />
              </button>

              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
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
                      <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => setShowDropdown(false)}>
                        <FiSettings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <FiLogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="py-2 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Vibe"
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
      </div>
    </header>
  );
}
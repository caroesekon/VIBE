import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'
import { useQuery } from '@tanstack/react-query'
import { getFriendRequests } from '../../services/friendService'
import { 
  FiHome, 
  FiUsers, 
  FiUser, 
  FiMessageSquare, 
  FiBell, 
  FiFlag, 
  FiVideo,
  FiShoppingBag,
  FiSettings,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi'
import { useState } from 'react'

export default function LeftSidebar() {
  const { user, isAuthenticated } = useAuth()
  const { pendingRequests } = useUIStore()
  const location = useLocation()
  const [showMore, setShowMore] = useState(false)

  // Real-time friend requests count
  const { data: requestsData } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: getFriendRequests,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const pendingCount = requestsData?.data?.data?.filter(r => r.status === 'pending')?.length || pendingRequests;

  if (!isAuthenticated || !user) return null;

  const mainNav = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/friends', label: 'Friends', icon: FiUsers, badge: pendingCount > 0 ? pendingCount : null },
    { to: '/messages', label: 'Messages', icon: FiMessageSquare },
    { to: `/profile/${user?._id}`, label: 'Profile', icon: FiUser },
  ];

  const moreNav = [
    { to: '/marketplace', label: 'Marketplace', icon: FiShoppingBag },
    { to: '/watch', label: 'Watch', icon: FiVideo },
    { to: '/groups', label: 'Groups', icon: FiFlag },
    { to: '/notifications', label: 'Notifications', icon: FiBell },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/profile') return location.pathname.startsWith('/profile');
    return location.pathname === path;
  };

  const displayedNav = showMore ? [...mainNav, ...moreNav] : [...mainNav, ...moreNav.slice(0, 2)];

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="sticky top-20">
        <nav className="space-y-1">
          {displayedNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                isActive(item.to)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={22} />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setShowMore(!showMore)}
          className="mt-2 flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 w-full"
        >
          {showMore ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          <span className="font-medium">{showMore ? 'Show Less' : 'See More'}</span>
        </button>
      </div>
    </aside>
  );
}
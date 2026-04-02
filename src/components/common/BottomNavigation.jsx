import { Link, useLocation } from 'react-router-dom'
import { FiHome, FiUsers, FiMessageSquare, FiBell, FiUser, FiShoppingBag } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

export default function BottomNavigation() {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/friends', label: 'Friends', icon: FiUsers },
    { to: '/messages', label: 'Messages', icon: FiMessageSquare },
    { to: '/marketplace', label: 'Market', icon: FiShoppingBag },
    { to: '/notifications', label: 'Notif', icon: FiBell },
    { to: `/profile/${user?._id}`, label: 'Profile', icon: FiUser },
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 z-50 md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex flex-col items-center p-2 ${isActive(item.to) ? 'text-primary-600' : 'text-gray-500'}`}
        >
          <item.icon size={24} />
          <span className="text-xs mt-1">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
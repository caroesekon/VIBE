import { Link, useLocation } from 'react-router-dom'
import { useUIStore } from '../../store/uiStore'
import { FiHome, FiUsers, FiUser, FiSettings, FiMessageSquare } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

export default function Sidebar() {
  const { sidebarOpen } = useUIStore()
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { to: '/', label: 'Home', icon: FiHome },
    { to: '/friends', label: 'Friends', icon: FiUsers },
    { to: '/messages', label: 'Messages', icon: FiMessageSquare },
    { to: `/profile/${user?._id}`, label: 'Profile', icon: FiUser },
    { to: '/settings', label: 'Settings', icon: FiSettings },
  ]

  if (!sidebarOpen) return null

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-40 transform transition-transform lg:translate-x-0 lg:static lg:w-64 lg:shadow-none">
      <div className="h-full flex flex-col">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
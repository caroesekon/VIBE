import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useUIStore } from '../../store/uiStore'
import { FiMenu, FiBell, FiMessageSquare, FiUser, FiLogOut } from 'react-icons/fi'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { toggleSidebar } = useUIStore()
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 rounded-md text-gray-500 lg:hidden">
              <FiMenu size={24} />
            </button>
            <Link to="/" className="flex-shrink-0 flex items-center ml-2 lg:ml-0">
              <span className="text-2xl font-bold text-primary-600">Vibe</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/messages" className="p-2 text-gray-500 hover:text-gray-700">
              <FiMessageSquare size={24} />
            </Link>
            <Link to="/notifications" className="p-2 text-gray-500 hover:text-gray-700 relative">
              <FiBell size={24} />
            </Link>

            <div className="relative">
              <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center space-x-2">
                <img src={user?.avatar} alt={user?.name} className="h-8 w-8 rounded-full object-cover" />
                <span className="hidden md:inline text-sm text-gray-700">{user?.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
                  <Link to={`/profile/${user?._id}`} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FiUser className="mr-2" /> Profile
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <FiLogOut className="mr-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
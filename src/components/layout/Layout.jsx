import { Outlet } from 'react-router-dom'
import Header from './Header'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import BottomNavigation from '../common/BottomNavigation'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <LeftSidebar />
        <main className="flex-1 min-w-0 lg:mx-6">
          <Outlet />
        </main>
        <RightSidebar />
      </div>
      <BottomNavigation />
    </div>
  )
}
import { useQuery } from '@tanstack/react-query'
import { getSuggestions } from '../../services/userService'
import { Link } from 'react-router-dom'
import { FiPlus, FiTrendingUp, FiCalendar } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'
import { getStories } from '../../services/storyService'
import StoryCircle from '../feed/stories/StoryCircle'

export default function RightSidebar() {
  const { user } = useAuth()
  const [currentYear] = useState(new Date().getFullYear())

  // Real-time suggestions - refetch every 2 minutes
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['suggestions'],
    queryFn: getSuggestions,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  })

  // Real-time stories - refetch every minute
  const { data: storiesData, refetch: refetchStories } = useQuery({
    queryKey: ['stories'],
    queryFn: getStories,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  })

  const suggestions = data?.data?.data || []
  const stories = storiesData?.data?.data || []

  return (
    <aside className="hidden lg:block w-80 flex-shrink-0">
      <div className="sticky top-20 space-y-4">
        {/* Stories Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Stories</h3>
          <StoryCircle stories={stories} currentUser={user} />
        </div>

        {/* Friend Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">People you may know</h3>
            <button 
              onClick={() => refetch()} 
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Refresh
            </button>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No suggestions available</p>
          ) : (
            <div className="space-y-3">
              {suggestions.slice(0, 5).map(user => (
                <div key={user._id} className="flex items-center justify-between">
                  <Link to={`/profile/${user._id}`} className="flex items-center space-x-3 flex-1">
                    <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Suggested for you</p>
                    </div>
                  </Link>
                  <button className="p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full">
                    <FiPlus size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Topics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiTrendingUp className="text-gray-500 dark:text-gray-400" size={16} />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Trending</h3>
          </div>
          <div className="space-y-3">
            <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition">
              <p className="text-sm font-medium text-gray-900 dark:text-white">#TechNews</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">1.2k posts</p>
            </div>
            <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition">
              <p className="text-sm font-medium text-gray-900 dark:text-white">#WeekendVibes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">856 posts</p>
            </div>
            <div className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition">
              <p className="text-sm font-medium text-gray-900 dark:text-white">#MusicLovers</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">654 posts</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 mb-3">
            <FiCalendar className="text-gray-500 dark:text-gray-400" size={16} />
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">Upcoming Events</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">15</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Tech Meetup</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Tomorrow at 7:00 PM</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">22</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Music Festival</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Next Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-xs text-gray-400 dark:text-gray-500 px-2">
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/help" className="hover:underline">Help</Link>
            <Link to="/ad-choices" className="hover:underline">Ad Choices</Link>
          </div>
          <p className="mt-2">© {currentYear} Vibe Social Media</p>
        </div>
      </div>
    </aside>
  );
}
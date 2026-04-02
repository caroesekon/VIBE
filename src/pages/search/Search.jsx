import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { globalSearch } from '../../services/searchService'
import { FiSearch, FiUser, FiFileText, FiUsers, FiLoader } from 'react-icons/fi'
import { formatDistanceToNow } from 'date-fns'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [activeTab, setActiveTab] = useState('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['search', query, activeTab],
    queryFn: () => globalSearch(query, activeTab === 'all' ? 'all' : activeTab, 1, 20),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const results = data?.data?.data || { users: [], posts: [], groups: [] }
  const hasResults = (results.users?.length > 0 || results.posts?.length > 0 || results.groups?.length > 0)

  if (!query) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-12">
          <FiSearch size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Search Vibe</h2>
          <p className="text-gray-500 mt-2">Enter a keyword to search for people, posts, or groups</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader size={32} className="animate-spin text-primary-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-12">
        Error loading search results
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Search Results</h1>
        <p className="text-gray-500">Showing results for "{query}"</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            People ({results.users?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'posts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Posts ({results.posts?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'groups'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Groups ({results.groups?.length || 0})
          </button>
        </nav>
      </div>

      {/* Results */}
      {!hasResults ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No results found for "{query}"</p>
          <p className="text-sm text-gray-400 mt-2">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Users */}
          {(activeTab === 'all' || activeTab === 'users') && results.users?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">People</h2>
              <div className="space-y-3">
                {results.users.slice(0, activeTab === 'all' ? 3 : undefined).map(user => (
                  <Link
                    key={user._id}
                    to={`/profile/${user._id}`}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow hover:shadow-md transition"
                  >
                    <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold">{user.name}</p>
                      {user.bio && <p className="text-sm text-gray-500 line-clamp-1">{user.bio}</p>}
                    </div>
                  </Link>
                ))}
                {activeTab === 'all' && results.users.length > 3 && (
                  <button onClick={() => setActiveTab('users')} className="text-primary-600 text-sm hover:underline">
                    See all {results.users.length} people
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Posts */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Posts</h2>
              <div className="space-y-3">
                {results.posts.slice(0, activeTab === 'all' ? 3 : undefined).map(post => (
                  <div key={post._id} className="p-4 bg-white rounded-lg shadow">
                    <div className="flex items-center space-x-2 mb-2">
                      <img src={post.user?.avatar} alt={post.user?.name} className="h-8 w-8 rounded-full" />
                      <span className="font-semibold text-sm">{post.user?.name}</span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-800">{post.content}</p>
                    {post.images?.length > 0 && (
                      <img src={post.images[0]} alt="" className="mt-2 rounded-lg max-h-64 object-cover" />
                    )}
                  </div>
                ))}
                {activeTab === 'all' && results.posts.length > 3 && (
                  <button onClick={() => setActiveTab('posts')} className="text-primary-600 text-sm hover:underline">
                    See all {results.posts.length} posts
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Groups */}
          {(activeTab === 'all' || activeTab === 'groups') && results.groups?.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Groups</h2>
              <div className="space-y-3">
                {results.groups.slice(0, activeTab === 'all' ? 3 : undefined).map(group => (
                  <Link
                    key={group._id}
                    to={`/groups/${group._id}`}
                    className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow hover:shadow-md transition"
                  >
                    <img src={group.coverPhoto || `https://picsum.photos/50/50?random=${group._id}`} alt={group.name} className="h-12 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold">{group.name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{group.description}</p>
                      <p className="text-xs text-gray-400">{group.members?.length || 0} members</p>
                    </div>
                  </Link>
                ))}
                {activeTab === 'all' && results.groups.length > 3 && (
                  <button onClick={() => setActiveTab('groups')} className="text-primary-600 text-sm hover:underline">
                    See all {results.groups.length} groups
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
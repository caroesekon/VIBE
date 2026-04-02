import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect, useState } from 'react'
import { getFeed } from '../../services/postService'
import { getStories } from '../../services/storyService'
import PostList from '../../components/feed/PostList'
import PostForm from '../../components/feed/PostForm'
import StoryCircle from '../../components/feed/stories/StoryCircle'
import { useAuth } from '../../hooks/useAuth'
import { FiLoader } from 'react-icons/fi'

export default function Home() {
  const { user } = useAuth()
  const { ref, inView } = useInView()
  const [showStoryModal, setShowStoryModal] = useState(false)

  // Fetch stories
  const { data: storiesData, isLoading: storiesLoading, refetch: refetchStories } = useQuery({
    queryKey: ['stories'],
    queryFn: getStories,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })

  // Fetch feed posts
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => getFeed(pageParam, 10),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data.pagination
      return page < pages ? page + 1 : undefined
    },
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const stories = storiesData?.data?.data || []
  const posts = data?.pages.flatMap(page => page.data.data) || []

  if (isLoading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="animate-spin text-primary-600" size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Error loading feed</p>
        <button onClick={() => refetch()} className="mt-2 text-primary-600 hover:underline">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Stories Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 p-4">
        {storiesLoading ? (
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded mt-1 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <StoryCircle 
            stories={stories} 
            currentUser={user} 
            onAddStory={() => setShowStoryModal(true)}
          />
        )}
      </div>

      {/* Create Post Section */}
      <div className="mb-4">
        <PostForm />
      </div>

      {/* Posts Feed */}
      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-3">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No posts yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Be the first to share something with your friends!</p>
        </div>
      ) : (
        <PostList posts={posts} />
      )}

      {/* Load More */}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage && (
            <FiLoader className="animate-spin text-primary-600" size={24} />
          )}
        </div>
      )}
    </div>
  )
}
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { getUserPosts } from '../../services/postService'
import PostList from '../feed/PostList'

export default function Timeline({ userId }) {
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['userPosts', userId],
    queryFn: ({ pageParam = 1 }) => getUserPosts(userId, pageParam, 10),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data.pagination
      return page < pages ? page + 1 : undefined
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">Error loading posts</div>
  }

  const posts = data?.pages.flatMap(page => page.data.data) || []

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
        <p className="text-gray-400">No posts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PostList posts={posts} />
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          {isFetchingNextPage && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          )}
        </div>
      )}
    </div>
  )
}
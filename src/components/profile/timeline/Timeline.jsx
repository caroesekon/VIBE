import { useInfiniteQuery } from '@tanstack/react-query'
import { getFeed } from '../../services/postService'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
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
    queryFn: ({ pageParam = 1 }) => getFeed(pageParam, 10, userId),
    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data.pagination
      return page < pages ? page + 1 : undefined
    },
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) return <div className="text-center py-8">Loading posts...</div>
  if (error) return <div className="text-red-500">Error loading posts</div>

  const posts = data?.pages.flatMap(page => page.data.data) || []

  if (posts.length === 0) {
    return <div className="text-center text-gray-500 py-8">No posts yet</div>
  }

  return (
    <div className="space-y-4">
      <PostList posts={posts} />
      {hasNextPage && (
        <div ref={ref} className="text-center py-4">
          {isFetchingNextPage && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>}
        </div>
      )}
    </div>
  )
}
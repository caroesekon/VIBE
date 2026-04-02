import { useInfiniteQuery } from '@tanstack/react-query'
import { getGroupPosts } from '../../services/groupService'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import GroupPostForm from './group-feed/GroupPostForm'
import GroupPost from './group-feed/GroupPost'

export default function GroupFeed({ groupId }) {
  const { ref, inView } = useInView()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error
  } = useInfiniteQuery({
    queryKey: ['groupPosts', groupId],
    queryFn: ({ pageParam = 1 }) => getGroupPosts(groupId, pageParam, 10),
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

  if (isLoading) return <div className="text-center">Loading posts...</div>
  if (error) return <div className="text-red-500">Error loading posts</div>

  const posts = data?.pages.flatMap(page => page.data.data) || []

  return (
    <div className="space-y-4">
      <GroupPostForm groupId={groupId} />
      {posts.map(post => (
        <GroupPost key={post._id} post={post} groupId={groupId} />
      ))}
      {hasNextPage && (
        <div ref={ref} className="text-center py-4">
          {isFetchingNextPage && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>}
        </div>
      )}
    </div>
  )
}
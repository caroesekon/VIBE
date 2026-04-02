import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { getNotifications, markNotificationRead, markAllRead, deleteNotification } from '../../services/notificationService'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import { FiHeart, FiMessageCircle, FiUserPlus, FiCheckCircle, FiTrash2, FiCheck, FiLoader } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Notifications() {
  const { ref, inView } = useInView()
  const queryClient = useQueryClient()

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam = 1 }) => getNotifications(pageParam, 20),
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

  const markReadMutation = useMutation({
    mutationFn: (id) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['unreadCount'])
    }
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['unreadCount'])
      toast.success('All notifications marked as read')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      queryClient.invalidateQueries(['unreadCount'])
      toast.success('Notification deleted')
    }
  })

  const notifications = data?.pages.flatMap(page => page.data.data) || []
  const unreadCount = notifications.filter(n => !n.read).length

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <FiHeart className="text-red-500" size={20} />
      case 'love': return <FiHeart className="text-red-500" size={20} />
      case 'haha': return <span className="text-xl">😂</span>
      case 'wow': return <span className="text-xl">😮</span>
      case 'comment': return <FiMessageCircle className="text-blue-500" size={20} />
      case 'friend_request': return <FiUserPlus className="text-green-500" size={20} />
      case 'friend_accept': return <FiCheckCircle className="text-green-500" size={20} />
      default: return <FiHeart className="text-gray-500" size={20} />
    }
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center space-x-3 py-3 border-b animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-500">Error loading notifications</p>
          <button 
            onClick={() => refetch()} 
            className="mt-2 text-primary-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <FiCheck size={16} />
              )}
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-3">
              <FiHeart size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-gray-500">When someone interacts with you, you'll see it here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`flex items-start space-x-3 p-4 hover:bg-gray-50 transition cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
                onClick={() => !notification.read && markReadMutation.mutate(notification._id)}
              >
                <div className="flex-shrink-0">
                  {notification.sender ? (
                    <Link to={`/profile/${notification.sender._id}`} onClick={(e) => e.stopPropagation()}>
                      <img
                        src={notification.sender.avatar}
                        alt={notification.sender.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </Link>
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      {notification.sender && (
                        <Link 
                          to={`/profile/${notification.sender._id}`} 
                          className="font-semibold hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {notification.sender.name}
                        </Link>
                      )}
                      <p className="text-gray-600 text-sm mt-0.5">{notification.message}</p>
                      {notification.post && (
                        <Link 
                          to={`/posts/${notification.post._id}`} 
                          className="text-xs text-primary-600 hover:underline mt-1 inline-block"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View post
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMutation.mutate(notification._id)
                        }}
                        className="text-gray-400 hover:text-red-500 transition"
                        disabled={deleteMutation.isPending}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {hasNextPage && (
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <FiLoader className="animate-spin text-primary-600" size={24} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
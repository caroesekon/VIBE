import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getComments, createComment, deleteComment, likeComment } from '../../services/commentService'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../hooks/useAuth'
import { FiHeart, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function CommentSection({ postId }) {
  const [newComment, setNewComment] = useState('')
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId, 1, 20),
    enabled: !!postId,
  })

  const createMutation = useMutation({
    mutationFn: (content) => createComment({ postId, content }),
    onMutate: async (content) => {
      await queryClient.cancelQueries(['comments', postId])
      const previousComments = queryClient.getQueryData(['comments', postId])
      
      queryClient.setQueryData(['comments', postId], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: [
              {
                _id: Date.now().toString(),
                user: { _id: user._id, name: user.name, avatar: user.avatar },
                content,
                likes: [],
                createdAt: new Date().toISOString(),
                isOptimistic: true
              },
              ...old.data.data
            ]
          }
        }
      })
      return { previousComments }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId])
      queryClient.invalidateQueries(['feed'])
      setNewComment('')
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['comments', postId], context.previousComments)
      toast.error('Failed to add comment')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (commentId) => deleteComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries(['comments', postId])
      const previousComments = queryClient.getQueryData(['comments', postId])
      
      queryClient.setQueryData(['comments', postId], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.filter(c => c._id !== commentId)
          }
        }
      })
      return { previousComments }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['comments', postId], context.previousComments)
      toast.error('Failed to delete comment')
    }
  })

  const likeMutation = useMutation({
    mutationFn: (commentId) => likeComment(commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries(['comments', postId])
      const previousComments = queryClient.getQueryData(['comments', postId])
      
      queryClient.setQueryData(['comments', postId], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map(c => {
              if (c._id === commentId) {
                const isLiked = c.liked || c.likes?.includes(user._id)
                return {
                  ...c,
                  liked: !isLiked,
                  likes: isLiked 
                    ? (c.likes || []).filter(id => id !== user._id)
                    : [...(c.likes || []), user._id]
                }
              }
              return c
            })
          }
        }
      })
      return { previousComments }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['comments', postId], context.previousComments)
    }
  })

  const comments = data?.data?.data || []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    createMutation.mutate(newComment)
  }

  if (isLoading) return <div className="text-center py-2 text-gray-500">Loading comments...</div>

  return (
    <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm hover:bg-primary-700 disabled:opacity-50"
        >
          Post
        </button>
      </form>

      <div className="mt-3 space-y-3">
        {comments.map(comment => (
          <div key={comment._id} className="flex space-x-2">
            <img 
              src={comment.user?.avatar} 
              alt={comment.user?.name} 
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{comment.user?.name}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
                {comment.user?._id === user?._id && (
                  <button
                    onClick={() => deleteMutation.mutate(comment._id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-gray-800 dark:text-gray-200 text-sm mt-1">{comment.content}</p>
              <button
                onClick={() => likeMutation.mutate(comment._id)}
                className={`flex items-center space-x-1 mt-1 text-xs ${
                  comment.liked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                } hover:text-red-500`}
              >
                <FiHeart size={12} fill={comment.liked ? 'currentColor' : 'none'} />
                <span>{comment.likes?.length || 0}</span>
              </button>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-2">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
}
import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likePost, deletePost } from '../../services/postService'
import { useAuth } from '../../hooks/useAuth'
import { FiMessageCircle, FiShare, FiTrash2, FiThumbsUp } from 'react-icons/fi'
import { FaLaugh, FaSurprise, FaFrown, FaAngry, FaHeart } from 'react-icons/fa'
import CommentSection from './CommentSection'
import toast from 'react-hot-toast'

const REACTIONS = [
  { type: 'like', emoji: '👍', color: 'text-blue-500' },
  { type: 'love', emoji: '❤️', color: 'text-red-500' },
  { type: 'haha', emoji: '😂', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😮', color: 'text-orange-500' },
  { type: 'sad', emoji: '😢', color: 'text-blue-400' },
  { type: 'angry', emoji: '😠', color: 'text-red-600' },
]

export default function PostCard({ post }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showComments, setShowComments] = useState(false)
  const [showReactions, setShowReactions] = useState(false)
  const reactionTimeout = useRef(null)

  const getReactionEmoji = (type) => {
    const found = REACTIONS.find(r => r.type === type)
    return found?.emoji || '👍'
  }

  const reactionDisplay = {
    text: post.userReaction ? REACTIONS.find(r => r.type === post.userReaction)?.type?.charAt(0).toUpperCase() + REACTIONS.find(r => r.type === post.userReaction)?.type?.slice(1) || 'Like' : 'Like',
    emoji: post.userReaction ? REACTIONS.find(r => r.type === post.userReaction)?.emoji : null,
    color: post.userReaction ? REACTIONS.find(r => r.type === post.userReaction)?.color || 'text-gray-500' : 'text-gray-500'
  }

  const totalReactions = post.reactionCounts ? Object.values(post.reactionCounts).reduce((a, b) => a + b, 0) : 0
  
  const reactionDisplayString = []
  if (post.reactionCounts) {
    Object.entries(post.reactionCounts).forEach(([type, count]) => {
      if (count > 0) {
        reactionDisplayString.push(`${getReactionEmoji(type)} ${count}`)
      }
    })
  }

  const likeMutation = useMutation({
    mutationFn: (reactionType) => {
      const finalReaction = reactionType === post.userReaction ? null : reactionType
      return likePost(post._id, finalReaction || 'like')
    },
    onMutate: async (reactionType) => {
      await queryClient.cancelQueries(['feed'])
      const previousFeed = queryClient.getQueryData(['feed'])
      
      const finalReaction = reactionType === post.userReaction ? null : reactionType
      
      queryClient.setQueryData(['feed'], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(p => {
              if (p._id === post._id) {
                const oldCount = p.reactionCounts?.[reactionType] || 0
                const newCount = finalReaction ? oldCount + 1 : oldCount - 1
                const oldCurrentCount = p.reactionCounts?.[post.userReaction] || 0
                const newCurrentCount = post.userReaction && !finalReaction ? oldCurrentCount - 1 : oldCurrentCount
                
                return {
                  ...p,
                  userReaction: finalReaction,
                  reactionCounts: {
                    ...p.reactionCounts,
                    [reactionType]: newCount,
                    [post.userReaction]: newCurrentCount
                  }
                }
              }
              return p
            })
          }))
        }
      })
      return { previousFeed }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['feed'], context.previousFeed)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['feed'])
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['feed'])
      toast.success('Post deleted')
    },
  })

  const handleReaction = (reactionType) => {
    likeMutation.mutate(reactionType)
    setShowReactions(false)
  }

  const handleMouseEnter = () => {
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current)
    reactionTimeout.current = setTimeout(() => setShowReactions(true), 300)
  }

  const handleMouseLeave = () => {
    if (reactionTimeout.current) clearTimeout(reactionTimeout.current)
    reactionTimeout.current = setTimeout(() => setShowReactions(false), 200)
  }

  const isOwner = user?._id === post.user?._id
  const isPending = likeMutation.isPending

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start space-x-3">
          <Link to={`/profile/${post.user?._id}`}>
            <img 
              src={post.user?.avatar || `https://ui-avatars.com/api/?name=${post.user?.name}`} 
              alt={post.user?.name} 
              className="h-10 w-10 rounded-full object-cover"
            />
          </Link>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <Link to={`/profile/${post.user?._id}`} className="font-semibold hover:underline text-gray-900 dark:text-white">
                  {post.user?.name}
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
              {isOwner && (
                <button 
                  onClick={() => deleteMutation.mutate()} 
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
            {post.images?.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {post.images.map((img, idx) => (
                  <img key={idx} src={img} alt="" className="rounded-lg object-cover max-h-96 w-full" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reaction Bar */}
        {totalReactions > 0 && (
          <div className="flex items-center mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {reactionDisplayString.join(' ')}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex space-x-6">
            {/* Like/Reaction Button */}
            <div 
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleReaction('like')}
                className={`flex items-center space-x-1 transition ${reactionDisplay.color}`}
                disabled={isPending}
              >
                {isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
                ) : reactionDisplay.emoji ? (
                  <span className="text-xl">{reactionDisplay.emoji}</span>
                ) : (
                  <FiThumbsUp size={20} />
                )}
                <span className="text-sm">{isPending ? '...' : reactionDisplay.text}</span>
              </button>

              {/* Reactions Popup */}
              {showReactions && !isPending && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex space-x-2 z-50">
                  {REACTIONS.map((r) => (
                    <button
                      key={r.type}
                      onClick={() => handleReaction(r.type)}
                      className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition transform hover:scale-125 ${r.color}`}
                      title={r.type}
                    >
                      <span className="text-2xl">{r.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 transition"
            >
              <FiMessageCircle size={20} />
              <span className="text-sm">{post.comments?.length || 0}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-green-500 transition">
              <FiShare size={20} />
              <span className="text-sm">Share</span>
            </button>
          </div>
        </div>
      </div>

      {showComments && <CommentSection postId={post._id} />}
    </div>
  )
}
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getVideo, likeVideo, commentOnVideo } from '../../services/videoService'
import { formatDistanceToNow } from 'date-fns'
import { FiHeart, FiMessageCircle, FiShare, FiThumbsUp, FiSend } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function VideoPlayer() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const videoRef = useRef(null)
  const [newComment, setNewComment] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['video', id],
    queryFn: () => getVideo(id),
    enabled: !!id,
  })

  const likeMutation = useMutation({
    mutationFn: () => likeVideo(id),
    onMutate: async () => {
      await queryClient.cancelQueries(['video', id])
      const previous = queryClient.getQueryData(['video', id])
      queryClient.setQueryData(['video', id], (old) => {
        if (!old) return old
        const isLiked = old.data.data.likes?.includes(user._id)
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data.data,
              likes: isLiked 
                ? old.data.data.likes.filter(uid => uid !== user._id)
                : [...(old.data.data.likes || []), user._id]
            }
          }
        }
      })
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['video', id], context.previous)
      toast.error('Failed to like video')
    }
  })

  const commentMutation = useMutation({
    mutationFn: (content) => commentOnVideo(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['video', id])
      setNewComment('')
      toast.success('Comment added')
    },
    onError: () => toast.error('Failed to add comment')
  })

  const handleComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    commentMutation.mutate(newComment)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !data?.data.data) {
    return <div className="text-center text-red-500 py-8">Video not found</div>
  }

  const video = data.data.data
  const isLiked = video.likes?.includes(user._id)

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Video Player */}
      <div className="bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={video.videoUrl}
          controls
          autoPlay
          className="w-full"
        />
      </div>

      {/* Video Info */}
      <div className="mt-4">
        <h1 className="text-xl font-bold">{video.title}</h1>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-3">
            <img 
              src={video.uploader?.avatar} 
              alt={video.uploader?.name} 
              className="h-10 w-10 rounded-full"
            />
            <div>
              <Link to={`/profile/${video.uploader?._id}`} className="font-semibold hover:underline">
                {video.uploader?.name}
              </Link>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <button
            onClick={() => likeMutation.mutate()}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FiHeart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{video.likes?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* Description */}
      {video.description && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700 whitespace-pre-wrap">{video.description}</p>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-6">
        <h3 className="font-semibold text-lg mb-4">Comments ({video.comments?.length || 0})</h3>
        
        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex space-x-3 mb-6">
          <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim() || commentMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <FiSend size={16} />
                <span>Comment</span>
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {video.comments?.map(comment => (
            <div key={comment._id} className="flex space-x-3">
              <img src={comment.user?.avatar} alt={comment.user?.name} className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <Link to={`/profile/${comment.user?._id}`} className="font-semibold text-sm hover:underline">
                    {comment.user?.name}
                  </Link>
                  <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
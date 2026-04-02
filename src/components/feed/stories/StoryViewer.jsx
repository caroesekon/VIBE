import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { FiX, FiChevronLeft, FiChevronRight, FiTrash2, FiEye, FiSmile } from 'react-icons/fi'
import { viewStory, deleteStory, reactToStory, getStoryViewers } from '../../../services/storyService'
import { useAuth } from '../../../hooks/useAuth'
import toast from 'react-hot-toast'

const REACTIONS = [
  { type: 'like', emoji: '👍', color: 'text-blue-500' },
  { type: 'love', emoji: '❤️', color: 'text-red-500' },
  { type: 'haha', emoji: '😂', color: 'text-yellow-500' },
  { type: 'wow', emoji: '😮', color: 'text-orange-500' },
  { type: 'sad', emoji: '😢', color: 'text-blue-400' },
  { type: 'angry', emoji: '😠', color: 'text-red-600' },
]

export default function StoryViewer({ user, stories, onClose, onStoryDelete }) {
  const { user: currentUser } = useAuth()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showReactions, setShowReactions] = useState(false)
  const [showViewers, setShowViewers] = useState(false)

  const isOwnStory = user?._id === currentUser?._id

  const currentStory = stories[currentIndex]

  // Fetch viewers for own story
  const { data: viewersData, refetch: refetchViewers } = useQuery({
    queryKey: ['storyViewers', currentStory?._id],
    queryFn: () => getStoryViewers(currentStory?._id),
    enabled: isOwnStory && !!currentStory?._id,
  })

  const deleteMutation = useMutation({
    mutationFn: (storyId) => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries(['stories'])
      toast.success('Story deleted')
      if (onStoryDelete) onStoryDelete()
      if (stories.length === 1) {
        onClose()
      } else {
        nextStory()
      }
    },
    onError: () => toast.error('Failed to delete story'),
  })

  const reactMutation = useMutation({
    mutationFn: ({ storyId, reaction }) => reactToStory(storyId, reaction),
    onSuccess: () => {
      queryClient.invalidateQueries(['stories'])
      queryClient.invalidateQueries(['storyViewers'])
      toast.success('Reaction added')
      setShowReactions(false)
    },
    onError: () => toast.error('Failed to add reaction'),
  })

  useEffect(() => {
    if (!stories || stories.length === 0) {
      onClose()
    }
  }, [stories, onClose])

  useEffect(() => {
    if (!stories || stories.length === 0) return

    const markViewed = async () => {
      if (currentStory?._id && !isOwnStory) {
        try {
          await viewStory(currentStory._id)
        } catch (error) {
          console.error('Failed to mark story as viewed')
        }
      }
    }
    markViewed()

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          nextStory()
          return 0
        }
        return prev + 2
      })
    }, 50)
    return () => clearInterval(interval)
  }, [currentIndex, stories])

  const nextStory = () => {
    if (!stories || stories.length === 0) {
      onClose()
      return
    }
    if (currentIndex + 1 < stories.length) {
      setCurrentIndex(prev => prev + 1)
      setProgress(0)
      setShowViewers(false)
    } else {
      onClose()
    }
  }

  const prevStory = () => {
    if (!stories || stories.length === 0) {
      onClose()
      return
    }
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setProgress(0)
      setShowViewers(false)
    } else {
      onClose()
    }
  }

  const handleDelete = () => {
    if (window.confirm('Delete this story?')) {
      deleteMutation.mutate(currentStory._id)
    }
  }

  const handleReaction = (reactionType) => {
    reactMutation.mutate({ storyId: currentStory._id, reaction: reactionType })
  }

  const currentUserReaction = currentStory?.userReaction
    ? REACTIONS.find(r => r.type === currentStory.userReaction)
    : null

  const viewers = viewersData?.data?.data || []

  if (!stories || stories.length === 0 || !currentStory) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-10">
        <FiX size={24} />
      </button>

      {/* Delete (own story) */}
      {isOwnStory && (
        <button
          onClick={handleDelete}
          className="absolute top-4 left-4 text-white z-10 hover:text-red-400"
        >
          <FiTrash2 size={20} />
        </button>
      )}

      {/* Viewers (own story) */}
      {isOwnStory && viewers.length > 0 && (
        <button
          onClick={() => setShowViewers(!showViewers)}
          className="absolute bottom-20 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full flex items-center space-x-1 z-10"
        >
          <FiEye size={14} />
          <span>{viewers.length}</span>
        </button>
      )}

      {/* Reaction button (others' stories) */}
      {!isOwnStory && (
        <div className="absolute bottom-20 right-4 z-10">
          <div className="relative">
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
            >
              {currentUserReaction ? (
                <span className="text-2xl">{currentUserReaction.emoji}</span>
              ) : (
                <FiSmile size={24} />
              )}
            </button>

            {showReactions && (
              <div className="absolute bottom-full right-0 mb-2 bg-white rounded-full shadow-lg border p-2 flex space-x-2 z-20">
                {REACTIONS.map((r) => (
                  <button
                    key={r.type}
                    onClick={() => handleReaction(r.type)}
                    className={`p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-125 ${r.color}`}
                  >
                    <span className="text-2xl">{r.emoji}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story content */}
      <div className="relative w-full max-w-sm mx-auto">
        {/* Progress bars */}
        <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
          {stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-100"
                style={{
                  width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {currentStory.type === 'text' ? (
          <div className="w-full h-screen flex items-center justify-center p-8 bg-black">
            <p className="text-white text-2xl whitespace-pre-wrap break-words text-center">
              {currentStory.caption}
            </p>
          </div>
        ) : (
          <img
            src={currentStory.media}
            alt="story"
            className="w-full h-screen object-contain"
          />
        )}

        {/* User info */}
        <div className="absolute top-12 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-10 w-10 rounded-full border-2 border-white"
            />
            <div className="text-white">
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs opacity-75">
                {new Date(currentStory.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          {currentUserReaction && !isOwnStory && (
            <div className="bg-black bg-opacity-50 rounded-full px-2 py-1">
              <span className="text-lg">{currentUserReaction.emoji}</span>
            </div>
          )}
        </div>

        {/* Caption for image stories */}
        {currentStory.caption && currentStory.type !== 'text' && (
          <div className="absolute bottom-20 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
            {currentStory.caption}
          </div>
        )}

        {/* Viewers modal */}
        {showViewers && (
          <div className="absolute inset-0 bg-black bg-opacity-90 z-20 flex items-center justify-center">
            <div className="bg-white rounded-lg w-80 max-h-96 overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-semibold">Viewers ({viewers.length})</h3>
                <button onClick={() => setShowViewers(false)} className="text-gray-500 hover:text-gray-700">
                  <FiX size={20} />
                </button>
              </div>
              <div className="overflow-y-auto max-h-80">
                {viewers.map((viewer) => (
                  <div key={viewer._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50">
                    <img src={viewer.avatar} alt={viewer.name} className="h-10 w-10 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900">{viewer.name}</p>
                      <p className="text-xs text-gray-500">
                        {viewer.reaction ? `Reacted with ${viewer.reaction.emoji}` : 'Viewed'}
                      </p>
                    </div>
                    {viewer.reaction && <span className="ml-auto text-xl">{viewer.reaction.emoji}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <button
          onClick={prevStory}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
        >
          <FiChevronLeft size={40} />
        </button>
        <button
          onClick={nextStory}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
        >
          <FiChevronRight size={40} />
        </button>
      </div>
    </div>
  )
}
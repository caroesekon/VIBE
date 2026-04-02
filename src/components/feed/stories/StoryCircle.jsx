import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import StoryViewer from './StoryViewer'
import CreateStoryModal from './CreateStoryModal'
import { FiPlus } from 'react-icons/fi'
import { getStories } from '../../../services/storyService'
import { useAuth } from '../../../hooks/useAuth'

export default function StoryCircle() {
  const { user } = useAuth()
  const [selectedStory, setSelectedStory] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  // Fetch stories from API
  const { data: storiesData, isLoading, refetch } = useQuery({
    queryKey: ['stories'],
    queryFn: getStories,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  })

  const stories = storiesData?.data?.data || []
  
  // Group stories by user
  const groupedStories = {}
  stories.forEach(story => {
    if (story.user && story.user._id) {
      const userId = story.user._id
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.user,
          stories: []
        }
      }
      groupedStories[userId].stories.push(story)
    }
  })

  const userStories = user?._id ? groupedStories[user._id] : null
  const friendStories = Object.values(groupedStories).filter(s => s.user?._id !== user?._id)

  const handleYourStoryClick = () => {
    setShowCreateModal(true)
  }

  const handleStoryClick = (storyGroup) => {
    if (storyGroup.stories && storyGroup.stories.length > 0) {
      setSelectedStory(storyGroup)
    }
  }

  const handleModalClose = () => {
    setShowCreateModal(false)
    refetch()
  }

  const handleStoryDelete = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-3 w-12 bg-gray-200 rounded mt-1 animate-pulse"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Your story */}
        <div 
          className="flex flex-col items-center cursor-pointer flex-shrink-0" 
          onClick={handleYourStoryClick}
        >
          <div className="relative">
            <img 
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`} 
              alt="Your story" 
              className="h-16 w-16 rounded-full border-2 border-blue-500 object-cover" 
            />
            <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-white">
              <FiPlus size={12} />
            </div>
          </div>
          <span className="text-xs mt-1 text-gray-600">
            {userStories?.stories?.length > 0 ? 'Your story' : 'Add story'}
          </span>
        </div>

        {/* Friends' stories */}
        {friendStories.map((storyGroup) => (
          <div 
            key={storyGroup.user?._id} 
            className="flex flex-col items-center cursor-pointer flex-shrink-0" 
            onClick={() => handleStoryClick(storyGroup)}
          >
            <div className="relative">
              <img 
                src={storyGroup.user?.avatar} 
                alt={storyGroup.user?.name} 
                className="h-16 w-16 rounded-full border-2 border-pink-500 object-cover" 
              />
              {storyGroup.stories?.length > 1 && (
                <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {storyGroup.stories.length}
                </div>
              )}
            </div>
            <span className="text-xs mt-1 text-gray-600 truncate max-w-20">
              {storyGroup.user?.name?.split(' ')[0] || 'User'}
            </span>
          </div>
        ))}

        {/* No stories message */}
        {!isLoading && friendStories.length === 0 && (
          <div className="flex items-center justify-center w-full py-4">
            <p className="text-sm text-gray-500">No stories from friends yet</p>
          </div>
        )}
      </div>

      {selectedStory && (
        <StoryViewer
          user={selectedStory.user}
          stories={selectedStory.stories}
          onClose={() => setSelectedStory(null)}
          onStoryDelete={handleStoryDelete}
        />
      )}

      <CreateStoryModal 
        isOpen={showCreateModal} 
        onClose={handleModalClose}
      />
    </>
  )
}
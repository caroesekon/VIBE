import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateAvatar, updateCover } from '../../services/userService'
import { uploadImage } from '../../services/uploadService'
import { useAuth } from '../../hooks/useAuth'
import { FiCamera, FiEdit2, FiUsers, FiImage, FiVideo } from 'react-icons/fi'
import toast from 'react-hot-toast'
import EditProfileModal from './EditProfileModal'

export default function ProfileHeader({ profile, isOwnProfile, friendButton }) {
  const { updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadImage(file)
      const url = res.data.data.url
      await updateAvatar({ imageUrl: url })
      updateUser({ avatar: url })
      queryClient.invalidateQueries(['user', profile._id])
      toast.success('Avatar updated')
    } catch {
      toast.error('Failed to update avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadImage(file)
      const url = res.data.data.url
      await updateCover({ imageUrl: url })
      updateUser({ coverPhoto: url })
      queryClient.invalidateQueries(['user', profile._id])
      toast.success('Cover photo updated')
    } catch {
      toast.error('Failed to update cover')
    } finally {
      setUploading(false)
    }
  }

  const postCount = profile.postsCount || 0
  const friendCount = profile.friendsCount || 0
  const videoCount = profile.videosCount || 0

  return (
    <>
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-48 bg-gradient-to-r from-primary-500 to-pink-500 relative">
          {profile.coverPhoto && (
            <img 
              src={profile.coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
          {isOwnProfile && (
            <label className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full cursor-pointer hover:bg-opacity-70 transition">
              <FiCamera size={20} />
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          )}
        </div>
        
        {/* Avatar */}
        <div className="absolute -bottom-12 left-4">
          <div className="relative">
            <img 
              src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&background=6366f1&color=fff`} 
              alt={profile.name} 
              className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-white"
            />
            {isOwnProfile && (
              <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-1 rounded-full cursor-pointer hover:bg-primary-700 transition">
                <FiCamera size={14} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>
        
        {/* Profile Info */}
        <div className="pt-16 pb-4 px-4 bg-white dark:bg-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.bio}</p>
              )}
              
              {/* Stats Row */}
              <div className="flex space-x-6 mt-3">
                <div className="flex items-center space-x-1">
                  <FiImage size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{postCount}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">posts</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiUsers size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{friendCount}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">friends</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FiVideo size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{videoCount}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">videos</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {friendButton}
              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition flex items-center space-x-2"
                >
                  <FiEdit2 size={18} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        profile={profile}
      />
    </>
  )
}
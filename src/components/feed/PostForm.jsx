import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPost } from '../../services/postService'
import { uploadImage } from '../../services/uploadService'
import { useAuth } from '../../hooks/useAuth'
import { FiImage, FiX, FiGlobe, FiUsers, FiLock } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function PostForm() {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [showPrivacyMenu, setShowPrivacyMenu] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['feed'])
      setContent('')
      setImages([])
      toast.success('Post created!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create post')
    }
  })

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploading(true)
    try {
      const uploads = await Promise.all(files.map(file => uploadImage(file)))
      const urls = uploads.map(res => res.data.data.url)
      setImages(prev => [...prev, ...urls])
      toast.success(`${files.length} image(s) uploaded`)
    } catch {
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!content.trim() && images.length === 0) {
      toast.error('Please write something or add an image')
      return
    }
    mutation.mutate({ content, privacy, images })
  }

  const getPrivacyIcon = () => {
    switch (privacy) {
      case 'public': return <FiGlobe size={14} />
      case 'friends': return <FiUsers size={14} />
      case 'only-me': return <FiLock size={14} />
      default: return <FiGlobe size={14} />
    }
  }

  const getPrivacyText = () => {
    switch (privacy) {
      case 'public': return 'Public'
      case 'friends': return 'Friends'
      case 'only-me': return 'Only Me'
      default: return 'Public'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} 
            alt={user?.name} 
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              rows="2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full resize-none border-none focus:ring-0 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
            />
          </div>
        </div>

        {images.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {images.map((url, idx) => (
              <div key={idx} className="relative">
                <img src={url} alt="" className="h-20 w-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FiX size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex space-x-4">
            <label className="cursor-pointer text-gray-500 hover:text-primary-600 transition">
              <FiImage size={20} />
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                onClick={() => setShowPrivacyMenu(!showPrivacyMenu)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {getPrivacyIcon()}
                <span>{getPrivacyText()}</span>
              </button>
              
              {showPrivacyMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowPrivacyMenu(false)}></div>
                  <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                    <button
                      onClick={() => { setPrivacy('public'); setShowPrivacyMenu(false) }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <FiGlobe size={14} />
                      <span>Public</span>
                    </button>
                    <button
                      onClick={() => { setPrivacy('friends'); setShowPrivacyMenu(false) }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <FiUsers size={14} />
                      <span>Friends</span>
                    </button>
                    <button
                      onClick={() => { setPrivacy('only-me'); setShowPrivacyMenu(false) }}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <FiLock size={14} />
                      <span>Only Me</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending || uploading || (!content.trim() && images.length === 0)}
              className="px-4 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {mutation.isPending ? 'Posting...' : uploading ? 'Uploading...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
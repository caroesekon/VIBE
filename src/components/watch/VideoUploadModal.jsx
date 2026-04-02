import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadVideo } from '../../services/videoService'
import { FiX, FiUpload, FiVideo, FiImage, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function VideoUploadModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('other')
  const [tags, setTags] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [videoPreview, setVideoPreview] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  
  const videoInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (formData) => uploadVideo(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['videos'])
      toast.success('Video uploaded successfully!')
      resetForm()
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload video')
    }
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setCategory('other')
    setTags('')
    setVideoFile(null)
    setThumbnailFile(null)
    setVideoPreview(null)
    setThumbnailPreview(null)
  }

  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file')
      return
    }
    
    if (file.size > 500 * 1024 * 1024) {
      toast.error('Video must be less than 500MB')
      return
    }
    
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file for thumbnail')
      return
    }
    
    setThumbnailFile(file)
    setThumbnailPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    
    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }
    
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('tags', tags)
    formData.append('video', videoFile)
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile)
    }
    
    setIsUploading(true)
    try {
      await mutation.mutateAsync(formData)
    } finally {
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Upload Video</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Video File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Video File *</label>
            <div 
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
            >
              {videoPreview ? (
                <div className="relative">
                  <video src={videoPreview} className="w-full rounded-lg max-h-48 object-cover" controls />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVideoFile(null)
                      setVideoPreview(null)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <FiVideo size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">Click to select video file</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI up to 500MB</p>
                </div>
              )}
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail (Optional)</label>
            <div onClick={() => thumbnailInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 transition">
              {thumbnailPreview ? (
                <div className="relative inline-block">
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="h-32 w-auto rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setThumbnailFile(null)
                      setThumbnailPreview(null)
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ) : (
                <div>
                  <FiImage size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to select thumbnail</p>
                </div>
              )}
              <input ref={thumbnailInputRef} type="file" accept="image/*" onChange={handleThumbnailSelect} className="hidden" />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter video title"
            />
            <p className="text-xs text-gray-400 mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell viewers about your video..."
            />
            <p className="text-xs text-gray-400 mt-1">{description.length}/500</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="entertainment">Entertainment</option>
              <option value="music">Music</option>
              <option value="gaming">Gaming</option>
              <option value="sports">Sports</option>
              <option value="education">Education</option>
              <option value="news">News</option>
              <option value="vlog">Vlog</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="funny, viral, tutorial"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !videoFile || !title}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <FiUpload size={18} />
              <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
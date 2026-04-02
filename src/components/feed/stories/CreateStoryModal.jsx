import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createStory } from '../../../services/storyService'
import { uploadImage } from '../../../services/uploadService'
import { FiX, FiCamera, FiImage, FiUpload, FiType, FiSend } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function CreateStoryModal({ isOpen, onClose }) {
  const [storyType, setStoryType] = useState('image')
  const [media, setMedia] = useState(null)
  const [caption, setCaption] = useState('')
  const [textContent, setTextContent] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [backgroundColor, setBackgroundColor] = useState('#6366f1')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => createStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['stories'])
      toast.success('Story posted!')
      resetForm()
      onClose()
    },
    onError: () => toast.error('Failed to create story')
  })

  const resetForm = () => {
    setMedia(null)
    setCaption('')
    setTextContent('')
    setPreview(null)
    setStoryType('image')
    setTextColor('#ffffff')
    setBackgroundColor('#6366f1')
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    
    setMedia(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (storyType === 'image' && !media) {
      toast.error('Please select an image')
      return
    }
    if (storyType === 'text' && !textContent.trim()) {
      toast.error('Please enter some text')
      return
    }

    setUploading(true)
    try {
      let storyData = {}
      
      if (storyType === 'image') {
        const res = await uploadImage(media)
        const imageUrl = res.data.data.url
        storyData = { media: imageUrl, caption, type: 'image' }
      } else {
        // Create a canvas for text story
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 700
        const ctx = canvas.getContext('2d')
        
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = textColor
        ctx.font = 'bold 32px "Inter", system-ui'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Word wrap
        const words = textContent.split(' ')
        let lines = []
        let currentLine = words[0]
        
        for (let i = 1; i < words.length; i++) {
          const testLine = currentLine + ' ' + words[i]
          const metrics = ctx.measureText(testLine)
          if (metrics.width > canvas.width - 40) {
            lines.push(currentLine)
            currentLine = words[i]
          } else {
            currentLine = testLine
          }
        }
        lines.push(currentLine)
        
        const lineHeight = 48
        const startY = (canvas.height - (lines.length * lineHeight)) / 2
        
        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, startY + (index * lineHeight))
        })
        
        const dataUrl = canvas.toDataURL('image/png')
        const blob = await fetch(dataUrl).then(res => res.blob())
        const file = new File([blob], 'text-story.png', { type: 'image/png' })
        const uploadRes = await uploadImage(file)
        const imageUrl = uploadRes.data.data.url
        storyData = { media: imageUrl, caption: textContent, type: 'text' }
      }
      
      mutation.mutate(storyData)
    } catch (error) {
      toast.error('Failed to create story')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold">Create Story</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        {/* Story Type Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setStoryType('image')}
            className={`flex-1 py-3 text-center font-medium transition ${
              storyType === 'image' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiImage className="inline mr-2" size={18} />
            Image Story
          </button>
          <button
            onClick={() => setStoryType('text')}
            className={`flex-1 py-3 text-center font-medium transition ${
              storyType === 'text' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiType className="inline mr-2" size={18} />
            Text Story
          </button>
        </div>

        <div className="p-4">
          {storyType === 'image' ? (
            <>
              {!preview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition"
                >
                  <FiCamera size={48} className="mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">Click to select an image</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img src={preview} alt="Story preview" className="w-full rounded-lg max-h-96 object-cover" />
                  <button
                    onClick={() => {
                      setMedia(null)
                      setPreview(null)
                      fileInputRef.current?.click()
                    }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  >
                    <FiImage size={16} />
                  </button>
                </div>
              )}

              {preview && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
                  <textarea
                    rows="2"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Add a caption..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div 
                className="w-full rounded-lg p-6 text-center min-h-[400px] flex items-center justify-center"
                style={{ backgroundColor, color: textColor }}
              >
                <p className="text-xl break-words whitespace-pre-wrap">
                  {textContent || 'Start typing your story...'}
                </p>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Story Text</label>
                <textarea
                  rows="4"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="What's on your mind?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={200}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{textContent.length}/200</p>
              </div>

              {/* Text Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <div className="flex space-x-2 flex-wrap gap-2">
                  {['#ffffff', '#000000', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9f4a'].map(color => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${textColor === color ? 'border-blue-500' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <div className="flex space-x-2 flex-wrap gap-2">
                  {['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec489a', '#14b8a6', '#334155'].map(color => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${backgroundColor === color ? 'border-blue-500' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || (storyType === 'image' ? !media : !textContent.trim())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <FiUpload className="animate-spin" size={16} />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiSend size={16} />
                <span>Share Story</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
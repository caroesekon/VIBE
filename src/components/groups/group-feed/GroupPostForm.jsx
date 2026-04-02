import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGroupPost } from '../../../services/groupService'
import { uploadImage } from '../../../services/uploadService'
import { FiImage, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function GroupPostForm({ groupId }) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data) => createGroupPost(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['groupPosts', groupId])
      setContent('')
      setImages([])
      toast.success('Post created')
    },
    onError: () => toast.error('Failed to create post'),
  })

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploading(true)
    try {
      const uploads = await Promise.all(files.map(file => uploadImage(file)))
      const urls = uploads.map(res => res.data.data.url)
      setImages(prev => [...prev, ...urls])
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
    if (!content.trim() && images.length === 0) return
    mutation.mutate({ content, images })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 space-y-3">
      <textarea rows="2" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share something with the group..." className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500" />
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, idx) => (
            <div key={idx} className="relative">
              <img src={url} alt="" className="h-16 w-16 object-cover rounded" />
              <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FiX size={12} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center">
        <label className="cursor-pointer text-gray-500">
          <FiImage size={20} />
          <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
        <button type="submit" disabled={mutation.isPending || uploading} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50">Post</button>
      </div>
    </form>
  )
}
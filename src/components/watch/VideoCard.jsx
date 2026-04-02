import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { FiPlay, FiEye, FiHeart } from 'react-icons/fi'

export default function VideoCard({ video }) {
  const [isHovered, setIsHovered] = useState(false)

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatViews = (views) => {
    if (!views) return '0'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  return (
    <Link 
      to={`/watch/${video._id}`}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
        {/* Thumbnail */}
        <div className="relative">
          <img
            src={video.thumbnail || `https://via.placeholder.com/400x225?text=${video.title}`}
            alt={video.title}
            className="w-full aspect-video object-cover"
          />
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity">
              <FiPlay size={48} className="text-white" />
            </div>
          )}
          {video.duration > 0 && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
              {formatDuration(video.duration)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
            {video.title}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <img 
                src={video.uploader?.avatar} 
                alt={video.uploader?.name} 
                className="h-6 w-6 rounded-full"
              />
              <span className="text-xs text-gray-500 truncate">
                {video.uploader?.name}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <FiEye size={12} />
                <span>{formatViews(video.views)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiHeart size={12} />
                <span>{video.likes?.length || 0}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Link>
  )
}
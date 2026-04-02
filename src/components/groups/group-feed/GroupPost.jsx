import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likeGroupPost, deleteGroupPost } from '../../../services/groupService'
import { useAuth } from '../../../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { FiHeart, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function GroupPost({ post, groupId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isOwner = post.user?._id === user?._id

  const likeMutation = useMutation({
    mutationFn: () => likeGroupPost(groupId, post._id),
    onMutate: async () => {
      await queryClient.cancelQueries(['groupPosts', groupId])
      const previous = queryClient.getQueryData(['groupPosts', groupId])
      queryClient.setQueryData(['groupPosts', groupId], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            data: page.data.map(p =>
              p._id === post._id
                ? { ...p, liked: !p.liked, likes: p.liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id] }
                : p
            )
          }))
        }
      })
      return { previous }
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['groupPosts', groupId], context.previous)
      toast.error('Failed to like post')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteGroupPost(groupId, post._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['groupPosts', groupId])
      toast.success('Post deleted')
    },
  })

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start space-x-3">
        <Link to={`/profile/${post.user?._id}`}>
          <img src={post.user?.avatar} alt={post.user?.name} className="h-10 w-10 rounded-full" />
        </Link>
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <Link to={`/profile/${post.user?._id}`} className="font-semibold hover:underline">{post.user?.name}</Link>
              <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</p>
            </div>
            {isOwner && (
              <button onClick={() => deleteMutation.mutate()} className="text-gray-400 hover:text-red-500"><FiTrash2 size={16} /></button>
            )}
          </div>
          <p className="mt-2 text-gray-800">{post.content}</p>
          {post.images?.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {post.images.map((img, idx) => (
                <img key={idx} src={img} alt="" className="rounded-lg object-cover max-h-64 w-full" />
              ))}
            </div>
          )}
          <button
            onClick={() => likeMutation.mutate()}
            className={`flex items-center space-x-1 mt-3 ${post.liked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <FiHeart size={20} fill={post.liked ? 'currentColor' : 'none'} />
            <span>{post.likes?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
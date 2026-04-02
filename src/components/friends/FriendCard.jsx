import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { removeFriend } from '../../services/friendService'
import { FiMessageSquare, FiUserMinus } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function FriendCard({ user }) {
  const queryClient = useQueryClient()

  const removeMutation = useMutation({
    mutationFn: () => removeFriend(user._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['friends'])
      toast.success('Friend removed')
    },
    onError: () => toast.error('Failed to remove friend')
  })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
      <Link to={`/profile/${user._id}`}>
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="h-12 w-12 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1">
        <Link to={`/profile/${user._id}`} className="font-semibold hover:underline text-gray-900 dark:text-white">
          {user.name}
        </Link>
        {user.bio && (
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.bio}</p>
        )}
      </div>
      <div className="flex space-x-2">
        <Link
          to={`/messages`}
          className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-full transition"
          title="Message"
        >
          <FiMessageSquare size={18} />
        </Link>
        <button
          onClick={() => removeMutation.mutate()}
          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition"
          title="Remove Friend"
        >
          <FiUserMinus size={18} />
        </button>
      </div>
    </div>
  )
}
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { acceptFriendRequest, rejectFriendRequest } from '../../services/friendService'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { FiCheck, FiX } from 'react-icons/fi'

export default function FriendRequests({ requests }) {
  const queryClient = useQueryClient()

  const accept = useMutation({
    mutationFn: (requestId) => acceptFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['friendRequests'])
      queryClient.invalidateQueries(['friends'])
      toast.success('Friend request accepted')
    },
    onError: () => toast.error('Failed to accept request')
  })

  const reject = useMutation({
    mutationFn: (requestId) => rejectFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(['friendRequests'])
      toast.success('Friend request rejected')
    },
    onError: () => toast.error('Failed to reject request')
  })

  if (!requests.length) return null

  return (
    <div className="space-y-3">
      {requests.map(req => (
        <div key={req._id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-center space-x-3">
          <Link to={`/profile/${req.sender._id}`}>
            <img 
              src={req.sender.avatar} 
              alt={req.sender.name} 
              className="h-12 w-12 rounded-full object-cover"
            />
          </Link>
          <div className="flex-1">
            <Link to={`/profile/${req.sender._id}`} className="font-semibold hover:underline text-gray-900 dark:text-white">
              {req.sender.name}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">sent you a friend request</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => accept.mutate(req._id)}
              className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              title="Accept"
            >
              <FiCheck size={16} />
            </button>
            <button
              onClick={() => reject.mutate(req._id)}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              title="Decline"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
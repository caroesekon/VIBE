import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { joinGroup, leaveGroup } from '../../services/groupService'
import toast from 'react-hot-toast'

export default function GroupCard({ group, isMember }) {
  const queryClient = useQueryClient()

  const join = useMutation({
    mutationFn: () => joinGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myGroups'])
      toast.success('Joined group')
    },
  })

  const leave = useMutation({
    mutationFn: () => leaveGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['myGroups'])
      toast.success('Left group')
    },
  })

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <img src={group.coverPhoto || `https://picsum.photos/400/200?random=${group._id}`} alt={group.name} className="h-32 w-full object-cover" />
      <div className="p-4">
        <Link to={`/groups/${group._id}`} className="font-bold text-lg hover:underline">{group.name}</Link>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{group.description}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">{group.members?.length || 0} members</span>
          {isMember ? (
            <button onClick={() => leave.mutate()} className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded-full">Joined</button>
          ) : (
            <button onClick={() => join.mutate()} className="text-sm bg-primary-600 text-white px-3 py-1 rounded-full hover:bg-primary-700">Join</button>
          )}
        </div>
      </div>
    </div>
  )
}
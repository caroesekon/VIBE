import { useMutation, useQueryClient } from '@tanstack/react-query'
import { joinGroup, leaveGroup } from '../../services/groupService'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function GroupHeader({ group }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isMember = group.members?.includes(user?._id)

  const join = useMutation({
    mutationFn: () => joinGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['group', group._id])
      toast.success('Joined group')
    },
  })

  const leave = useMutation({
    mutationFn: () => leaveGroup(group._id),
    onSuccess: () => {
      queryClient.invalidateQueries(['group', group._id])
      toast.success('Left group')
    },
  })

  return (
    <div className="relative">
      <img src={group.coverPhoto || `https://picsum.photos/1200/300?random=${group._id}`} alt={group.name} className="h-48 w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-sm opacity-90">{group.members?.length || 0} members</p>
          </div>
          <div>
            {isMember ? (
              <button onClick={() => leave.mutate()} className="bg-white text-gray-800 px-4 py-2 rounded-full hover:bg-gray-100">Joined</button>
            ) : (
              <button onClick={() => join.mutate()} className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700">Join Group</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
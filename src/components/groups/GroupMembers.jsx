import { useQuery } from '@tanstack/react-query'
import { getGroupMembers } from '../../services/groupService'
import { Link } from 'react-router-dom'

export default function GroupMembers({ groupId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['groupMembers', groupId],
    queryFn: () => getGroupMembers(groupId),
    enabled: !!groupId,
  })

  if (isLoading) return <div className="text-center">Loading members...</div>
  if (error) return <div className="text-red-500">Error loading members</div>

  const members = data?.data?.data || []

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">Members ({members.length})</h3>
      <div className="space-y-2">
        {members.map(member => (
          <div key={member.user._id} className="flex items-center space-x-3">
            <Link to={`/profile/${member.user._id}`}>
              <img src={member.user.avatar} alt={member.user.name} className="h-8 w-8 rounded-full" />
            </Link>
            <Link to={`/profile/${member.user._id}`} className="hover:underline">{member.user.name}</Link>
            {member.role !== 'member' && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {member.role === 'owner' ? 'Owner' : 'Admin'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
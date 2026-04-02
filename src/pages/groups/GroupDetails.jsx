import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getGroup } from '../../services/groupService'
import GroupHeader from '../../components/groups/GroupHeader'
import GroupFeed from '../../components/groups/GroupFeed'
import GroupMembers from '../../components/groups/GroupMembers'
import GroupAbout from '../../components/groups/GroupAbout'
import { useState } from 'react'

export default function GroupDetails() {
  const { groupId } = useParams()
  const [activeTab, setActiveTab] = useState('feed')

  const { data, isLoading, error } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroup(groupId),
    enabled: !!groupId,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !data?.data.data) {
    return <div className="text-center text-red-500">Group not found</div>
  }

  const group = data.data.data

  return (
    <div className="max-w-5xl mx-auto">
      <GroupHeader group={group} />
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8 px-4">
          <button onClick={() => setActiveTab('feed')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'feed' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Feed</button>
          <button onClick={() => setActiveTab('members')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'members' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Members</button>
          <button onClick={() => setActiveTab('about')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'about' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>About</button>
        </nav>
      </div>

      <div className="px-4">
        {activeTab === 'feed' && <GroupFeed groupId={groupId} />}
        {activeTab === 'members' && <GroupMembers groupId={groupId} />}
        {activeTab === 'about' && <GroupAbout group={group} />}
      </div>
    </div>
  )
}
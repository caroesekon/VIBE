import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getMyGroups, discoverGroups } from '../../services/groupService'
import GroupList from '../../components/groups/GroupList'
import CreateGroupModal from '../../components/groups/CreateGroupModal'

export default function Groups() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState('my')

  const { data: myGroups, isLoading: myLoading, error: myError } = useQuery({
    queryKey: ['myGroups'],
    queryFn: getMyGroups,
    staleTime: 5 * 60 * 1000,
  })

  const { data: discover, isLoading: discoverLoading, error: discoverError } = useQuery({
    queryKey: ['discoverGroups'],
    queryFn: discoverGroups,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'discover',
  })

  const groups = activeTab === 'my' ? myGroups?.data?.data || [] : discover?.data?.data || []
  const isLoading = activeTab === 'my' ? myLoading : discoverLoading
  const error = activeTab === 'my' ? myError : discoverError

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Create Group</button>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('my')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'my' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>My Groups</button>
          <button onClick={() => setActiveTab('discover')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'discover' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Discover</button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
      ) : error ? (
        <div className="text-red-500">Error loading groups</div>
      ) : groups.length === 0 ? (
        <div className="text-center text-gray-500 py-12">{activeTab === 'my' ? "You haven't joined any groups yet." : "No groups to discover."}</div>
      ) : (
        <GroupList groups={groups} />
      )}

      <CreateGroupModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  )
}
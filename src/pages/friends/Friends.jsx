import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getFriendsList, getFriendRequests } from '../../services/friendService'
import FriendList from '../../components/friends/FriendList'
import FriendRequests from '../../components/friends/FriendRequests'

export default function Friends() {
  const [activeTab, setActiveTab] = useState('friends')

  const { data: friends, isLoading: friendsLoading, error: friendsError } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriendsList,
    staleTime: 5 * 60 * 1000,
  })

  const { data: requests, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: getFriendRequests,
    staleTime: 5 * 60 * 1000,
    enabled: activeTab === 'requests',
  })

  const friendsList = friends?.data?.data || []
  const requestsList = requests?.data?.data || []

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Friends</h1>

      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button onClick={() => setActiveTab('friends')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'friends' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>All Friends ({friendsList.length})</button>
          <button onClick={() => setActiveTab('requests')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'requests' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Requests ({requestsList.filter(r => r.status === 'pending').length})</button>
        </nav>
      </div>

      {activeTab === 'friends' && (
        <>
          {friendsLoading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
          ) : friendsError ? (
            <div className="text-red-500">Error loading friends</div>
          ) : friendsList.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No friends yet. Send some friend requests!</div>
          ) : (
            <FriendList friends={friendsList} />
          )}
        </>
      )}

      {activeTab === 'requests' && (
        <>
          {requestsLoading ? (
            <div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
          ) : requestsError ? (
            <div className="text-red-500">Error loading requests</div>
          ) : requestsList.length === 0 ? (
            <div className="text-center text-gray-500 py-12">No pending friend requests</div>
          ) : (
            <FriendRequests requests={requestsList} />
          )}
        </>
      )}
    </div>
  )
}
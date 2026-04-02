import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfile } from '../../services/userService'
import { getUserPosts } from '../../services/postService'
import { 
  getFriendStatus, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend,
  cancelFriendRequest
} from '../../services/friendService'
import { useAuth } from '../../hooks/useAuth'
import ProfileHeader from '../../components/profile/ProfileHeader'
import Timeline from '../../components/profile/Timeline'
import AboutInfo from '../../components/profile/AboutInfo'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function Profile() {
  const { userId } = useParams()
  const { user: currentUser, isAuthenticated, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Wait for auth to load
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, authLoading, navigate])

  // Don't render anything while auth is loading or not authenticated
  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Determine profile ID
  const profileId = userId || currentUser?._id
  
  if (!profileId) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const isOwnProfile = !userId || userId === currentUser?._id

  // Fetch user profile
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', profileId],
    queryFn: () => getUserProfile(profileId),
    enabled: !!profileId && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch user posts count
  const { data: userPosts } = useQuery({
    queryKey: ['userPostsCount', profileId],
    queryFn: () => getUserPosts(profileId, 1, 1),
    enabled: !!profileId && isAuthenticated,
  })

  // Fetch friend status - only for other profiles
  const { data: friendStatus, refetch: refetchFriendStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['friendStatus', profileId],
    queryFn: () => getFriendStatus(profileId),
    enabled: !!profileId && !isOwnProfile && isAuthenticated,
  })

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: () => sendFriendRequest(profileId),
    onSuccess: () => {
      refetchFriendStatus()
      toast.success('Friend request sent')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send request')
    }
  })

  // Accept friend request mutation
  const acceptMutation = useMutation({
    mutationFn: (requestId) => acceptFriendRequest(requestId),
    onSuccess: () => {
      refetchFriendStatus()
      queryClient.invalidateQueries(['friends'])
      toast.success('Friend request accepted')
    },
  })

  // Reject friend request mutation
  const rejectMutation = useMutation({
    mutationFn: (requestId) => rejectFriendRequest(requestId),
    onSuccess: () => {
      refetchFriendStatus()
      toast.success('Friend request rejected')
    },
  })

  // Cancel friend request mutation
  const cancelMutation = useMutation({
    mutationFn: () => cancelFriendRequest(profileId),
    onSuccess: () => {
      refetchFriendStatus()
      toast.success('Friend request cancelled')
    },
  })

  // Remove friend mutation
  const removeMutation = useMutation({
    mutationFn: () => removeFriend(profileId),
    onSuccess: () => {
      refetchFriendStatus()
      queryClient.invalidateQueries(['friends'])
      toast.success('Friend removed')
    },
  })

  // Render friend button based on status
  const renderFriendButton = () => {
    if (isOwnProfile) return null
    
    if (statusLoading) {
      return (
        <button className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg cursor-wait">
          Loading...
        </button>
      )
    }

    const status = friendStatus?.data?.data

    // Already friends
    if (status?.isFriend) {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => removeMutation.mutate()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center space-x-2"
          >
            <span>Remove Friend</span>
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
          >
            <span>Message</span>
          </button>
        </div>
      )
    }

    // Friend request received (current user is receiver)
    if (status?.isFriendRequestReceived) {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => acceptMutation.mutate(status.requestId)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Accept Request
          </button>
          <button
            onClick={() => rejectMutation.mutate(status.requestId)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Decline
          </button>
        </div>
      )
    }

    // Friend request sent (current user is sender)
    if (status?.isFriendRequestSent) {
      return (
        <button
          onClick={() => cancelMutation.mutate()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center space-x-2"
        >
          <span>Request Sent</span>
          <span className="text-red-500 text-lg">✕</span>
        </button>
      )
    }

    // Default: Not friends, no pending request - Show Add Friend button
    return (
      <button
        onClick={() => sendRequestMutation.mutate()}
        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
      >
        <span>Add Friend</span>
      </button>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !data?.data.data) {
    return (
      <div className="text-center text-red-500 py-8">
        User not found
        <button
          onClick={() => navigate('/')}
          className="block mx-auto mt-2 text-primary-600 hover:underline"
        >
          Go back home
        </button>
      </div>
    )
  }

  const profile = data.data.data
  const postsCount = userPosts?.data?.pagination?.total || 0
  const friendsCount = profile.friends?.length || 0
  const videosCount = profile.videos?.length || 0

  const enhancedProfile = {
    ...profile,
    postsCount,
    friendsCount,
    videosCount
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ProfileHeader
        profile={enhancedProfile}
        isOwnProfile={isOwnProfile}
        friendButton={renderFriendButton()}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        <div className="md:col-span-1">
          <AboutInfo profile={profile} />
        </div>
        <div className="md:col-span-2">
          <Timeline userId={profileId} />
        </div>
      </div>
    </div>
  )
}
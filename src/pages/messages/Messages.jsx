import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getConversations, sendMessage, createConversation } from '../../services/messageService'
import { searchUsers } from '../../services/userService'
import ChatList from '../../components/messages/chat/ChatList'
import ChatWindow from '../../components/messages/chat/ChatWindow'
import { useMediaQuery } from 'react-responsive'
import { FiSearch, FiX, FiSend } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Messages() {
  const { user } = useAuth()
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const [showChat, setShowChat] = useState(!isMobile)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    staleTime: 5 * 60 * 1000,
  })

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['searchUsers', searchQuery],
    queryFn: () => searchUsers(searchQuery),
    enabled: searchQuery.length > 2,
  })

  const createConversationMutation = useMutation({
    mutationFn: (userId) => createConversation(userId),
    onSuccess: (response) => {
      const newConversation = response.data.data
      queryClient.setQueryData(['conversations'], (old) => {
        if (!old) return old
        return {
          ...old,
          data: {
            ...old.data,
            data: [newConversation, ...(old.data.data || [])]
          }
        }
      })
      setSelectedConversation(newConversation)
      setSelectedUser(null)
      setShowNewChat(false)
      setNewMessage('')
      if (isMobile) setShowChat(true)
      toast.success('Conversation started!')
    },
    onError: () => toast.error('Failed to start conversation'),
  })

  const sendFirstMessageMutation = useMutation({
    mutationFn: ({ userId, content }) => sendMessage({ receiverId: userId, content }),
    onSuccess: (response) => {
      const newMessage = response.data.data
      queryClient.invalidateQueries(['conversations'])
      toast.success('Message sent!')
    },
  })

  const conversations = data?.data?.data || []

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    if (isMobile) setShowChat(true)
    setShowNewChat(false)
  }

  const handleBack = () => {
    setShowChat(false)
    setSelectedConversation(null)
  }

  const handleStartChat = () => {
    setShowNewChat(true)
    setSelectedConversation(null)
    setShowChat(false)
  }

  const handleSelectUser = (selectedUser) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => 
      conv.participants.some(p => p._id === selectedUser._id)
    )
    
    if (existingConv) {
      setSelectedConversation(existingConv)
      setShowNewChat(false)
      if (isMobile) setShowChat(true)
    } else {
      setSelectedUser(selectedUser)
    }
  }

  const handleSendFirstMessage = () => {
    if (!newMessage.trim()) return
    sendFirstMessageMutation.mutate({ userId: selectedUser._id, content: newMessage })
  }

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading conversations</div>
  }

  // New Chat Modal Content
  const NewChatModal = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">New Message</h2>
        <button onClick={() => setShowNewChat(false)} className="text-gray-500 hover:text-gray-700">
          <FiX size={20} />
        </button>
      </div>
      <div className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        {searchLoading ? (
          <div className="text-center py-4">Searching...</div>
        ) : searchResults?.data?.data?.length > 0 ? (
          <div className="space-y-2">
            {searchResults.data.data.map(u => (
              <button
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
              >
                <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full" />
                <div className="flex-1 text-left">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-gray-500">@{u.email?.split('@')[0]}</p>
                </div>
              </button>
            ))}
          </div>
        ) : searchQuery.length > 2 ? (
          <div className="text-center text-gray-500 py-8">No users found</div>
        ) : (
          <div className="text-center text-gray-500 py-8">Type at least 3 characters to search</div>
        )}
      </div>

      {selectedUser && (
        <div className="border-t p-4">
          <div className="flex items-center space-x-3 mb-3">
            <img src={selectedUser.avatar} alt={selectedUser.name} className="h-10 w-10 rounded-full" />
            <div>
              <p className="font-medium">{selectedUser.name}</p>
              <p className="text-sm text-gray-500">Send a message to start chatting</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              onClick={handleSendFirstMessage}
              disabled={!newMessage.trim() || sendFirstMessageMutation.isPending}
              className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50"
            >
              <FiSend size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <div className="h-full">
        {!showChat && !showNewChat && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <button
                onClick={handleStartChat}
                className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                Start New Chat
              </button>
            </div>
            <ChatList
              conversations={conversations}
              onSelectConversation={handleSelectConversation}
              selectedId={selectedConversation?._id}
            />
          </div>
        )}
        {showNewChat && <NewChatModal />}
        {showChat && selectedConversation && (
          <ChatWindow
            conversation={selectedConversation}
            onBack={handleBack}
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-96 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={handleStartChat}
            className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
          >
            Start New Chat
          </button>
        </div>
        <ChatList
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedId={selectedConversation?._id}
        />
      </div>
      <div className="flex-1">
        {showNewChat ? (
          <NewChatModal />
        ) : selectedConversation ? (
          <ChatWindow conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMessages, sendMessage } from '../../../services/messageService'
import { useSocket } from '../../../hooks/useSocket'
import { useAuth } from '../../../hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'
import { FiArrowLeft, FiSend } from 'react-icons/fi'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ conversation, onBack }) {
  const [message, setMessage] = useState('')
  const { user } = useAuth()
  const socket = useSocket()
  const queryClient = useQueryClient()
  const messagesEndRef = useRef(null)

  const otherUser = conversation?.participants.find(p => p._id !== user?._id)

  const { data, isLoading } = useQuery({
    queryKey: ['messages', otherUser?._id],
    queryFn: () => getMessages(otherUser._id, 1, 50),
    enabled: !!otherUser,
    staleTime: 5 * 60 * 1000,
  })

  const sendMutation = useMutation({
    mutationFn: (content) => sendMessage({ receiverId: otherUser._id, content }),
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', otherUser._id], (old) => {
        if (!old) return old
        return {
          ...old,
          data: { ...old.data, data: [...old.data.data, newMessage.data.data] }
        }
      })
      setMessage('')
      if (socket) {
        socket.emit('send_message', { receiverId: otherUser._id, content: newMessage.data.data.content })
      }
    },
  })

  useEffect(() => {
    if (socket) {
      socket.on('new_message', (msg) => {
        if (msg.sender._id === otherUser?._id) {
          queryClient.setQueryData(['messages', otherUser._id], (old) => {
            if (!old) return old
            return {
              ...old,
              data: { ...old.data, data: [...old.data.data, msg] }
            }
          })
        }
      })
      return () => socket.off('new_message')
    }
  }, [socket, otherUser, queryClient])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data])

  const messages = data?.data?.data || []

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMutation.mutate(message)
  }

  if (!conversation) return null

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white p-4 flex items-center space-x-3 border-b">
        {onBack && (
          <button onClick={onBack} className="md:hidden"><FiArrowLeft size={20} /></button>
        )}
        <img src={otherUser?.avatar} alt={otherUser?.name} className="h-10 w-10 rounded-full" />
        <span className="font-semibold">{otherUser?.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center">Loading messages...</div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg._id} message={msg} isOwn={msg.sender._id === user?._id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button type="submit" disabled={sendMutation.isPending} className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:opacity-50">
          <FiSend size={20} />
        </button>
      </form>
    </div>
  )
}
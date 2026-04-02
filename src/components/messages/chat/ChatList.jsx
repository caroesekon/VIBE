import { formatDistanceToNow } from 'date-fns'

export default function ChatList({ conversations, onSelectConversation, selectedId }) {
  return (
    <div className="h-full overflow-y-auto">
      {conversations.map(conv => {
        const otherUser = conv.participants.find(p => p._id !== conv.currentUserId)
        const lastMessage = conv.lastMessage
        return (
          <button
            key={conv._id}
            onClick={() => onSelectConversation(conv)}
            className={`w-full flex items-center space-x-3 p-4 hover:bg-gray-50 transition ${selectedId === conv._id ? 'bg-gray-100' : ''}`}
          >
            <img src={otherUser?.avatar} alt={otherUser?.name} className="h-12 w-12 rounded-full" />
            <div className="flex-1 text-left">
              <div className="flex justify-between">
                <span className="font-semibold">{otherUser?.name}</span>
                {lastMessage && (
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 truncate">{lastMessage?.content || 'No messages yet'}</p>
            </div>
            {conv.unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1">{conv.unreadCount}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
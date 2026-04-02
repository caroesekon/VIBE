import FriendCard from './FriendCard'

export default function FriendList({ friends }) {
  if (!friends.length) return <div className="text-center text-gray-500 py-8">No friends yet</div>
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map(friend => (
        <FriendCard key={friend._id} user={friend} isFriend />
      ))}
    </div>
  )
}
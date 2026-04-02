import GroupCard from './GroupCard'

export default function GroupList({ groups }) {
  if (!groups.length) return <div className="text-center text-gray-500 py-8">No groups found</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map(group => (
        <GroupCard key={group._id} group={group} />
      ))}
    </div>
  )
}
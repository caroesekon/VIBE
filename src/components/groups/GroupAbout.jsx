export default function GroupAbout({ group }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-2">About</h3>
      <p className="text-gray-600">{group.description || 'No description provided'}</p>
      <div className="mt-4">
        <h4 className="font-medium text-sm text-gray-700">Topics</h4>
        <div className="flex flex-wrap gap-2 mt-1">
          {group.topics?.map(topic => (
            <span key={topic} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">{topic}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
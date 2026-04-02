import { useQuery } from '@tanstack/react-query'
import { getSuggestions } from '../../services/userService'
import FriendCard from '../friends/FriendCard'

export default function RightSidebar() {
  const { data, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: getSuggestions,
    staleTime: 5 * 60 * 1000,
  })

  const suggestions = data?.data?.data || []

  return (
    <aside className="hidden lg:block w-80 ml-6">
      <div className="sticky top-20">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-3">Suggested for you</h3>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : suggestions.length === 0 ? (
            <p className="text-gray-500 text-sm">No suggestions</p>
          ) : (
            <div className="space-y-3">
              {suggestions.map(user => (
                <FriendCard key={user._id} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
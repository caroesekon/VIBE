import { format } from 'date-fns'

export default function AboutInfo({ profile }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold mb-3">About</h3>
      <div className="space-y-2 text-sm">
        {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
        {profile.location && <p className="text-gray-600">📍 {profile.location}</p>}
        {profile.website && (
          <p className="text-gray-600">🔗 <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{profile.website}</a></p>
        )}
        <p className="text-gray-600">📅 Joined {format(new Date(profile.createdAt), 'MMMM yyyy')}</p>
      </div>
    </div>
  )
}
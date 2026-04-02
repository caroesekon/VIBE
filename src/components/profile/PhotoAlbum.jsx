import { useQuery } from '@tanstack/react-query'
import { getUserPhotos } from '../../services/userService'

export default function PhotoAlbum({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['userPhotos', userId],
    queryFn: () => getUserPhotos(userId),
    enabled: !!userId,
  })

  const photos = data?.data?.data || []

  if (isLoading) return <div className="text-center py-4">Loading photos...</div>
  if (photos.length === 0) return null

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="font-semibold mb-3">Photos</h3>
      <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 6).map((photo, idx) => (
          <img key={idx} src={photo} alt="" className="w-full h-32 object-cover rounded" />
        ))}
      </div>
    </div>
  )
}
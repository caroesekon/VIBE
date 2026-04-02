import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateProfile } from '../../services/userService'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [location, setLocation] = useState(user?.location || '')
  const [website, setWebsite] = useState(user?.website || '')
  const [gender, setGender] = useState(user?.gender || 'prefer_not_to_say')
  const [isLoading, setIsLoading] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: (response) => {
      const updatedUser = response.data.data
      updateUser(updatedUser)
      queryClient.invalidateQueries(['user', user._id])
      toast.success('Profile updated successfully')
      setIsLoading(false)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Update failed')
      setIsLoading(false)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    mutation.mutate({ name, bio, location, website, gender })
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea rows="3" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="Tell us about yourself" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="City, Country" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Website</label>
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="https://example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isLoading} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
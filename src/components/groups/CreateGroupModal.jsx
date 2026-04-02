import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createGroup } from '../../services/groupService'
import { FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function CreateGroupModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [topics, setTopics] = useState([])
  const [topicInput, setTopicInput] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries(['myGroups'])
      toast.success('Group created')
      onClose()
      setName('')
      setDescription('')
      setPrivacy('public')
      setTopics([])
    },
    onError: () => toast.error('Failed to create group'),
  })

  const addTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()])
      setTopicInput('')
    }
  }

  const removeTopic = (topic) => setTopics(topics.filter(t => t !== topic))

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({ name, description, privacy, topics })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><FiX size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Group Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Privacy</label>
            <select value={privacy} onChange={(e) => setPrivacy(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
              <option value="public">Public (Anyone can join)</option>
              <option value="private">Private (Approval required)</option>
              <option value="secret">Secret (Invite only)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Topics</label>
            <div className="flex mt-1">
              <input type="text" value={topicInput} onChange={(e) => setTopicInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())} placeholder="Add topic" className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              <button type="button" onClick={addTopic} className="bg-gray-200 px-3 rounded-r-md hover:bg-gray-300">Add</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {topics.map(topic => (
                <span key={topic} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm flex items-center">
                  {topic}
                  <button type="button" onClick={() => removeTopic(topic)} className="ml-1 text-gray-500 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">Create</button>
          </div>
        </form>
      </div>
    </div>
  )
}
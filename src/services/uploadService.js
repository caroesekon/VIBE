import api from './api'

export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('image', file)
  return api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

export const uploadImages = (files) => {
  const formData = new FormData()
  files.forEach(file => formData.append('images', file))
  return api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}
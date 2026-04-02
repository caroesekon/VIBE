import api from './api'

export const getProducts = (page = 1, limit = 12, filters = {}) => {
  let url = `/marketplace/products?page=${page}&limit=${limit}`
  if (filters.search) url += `&search=${filters.search}`
  if (filters.category) url += `&category=${filters.category}`
  if (filters.min) url += `&minPrice=${filters.min}`
  if (filters.max) url += `&maxPrice=${filters.max}`
  return api.get(url)
}

export const getProduct = (id) => api.get(`/marketplace/products/${id}`)
export const createProduct = (data) => api.post('/marketplace/products', data)
export const updateProduct = (id, data) => api.put(`/marketplace/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/marketplace/products/${id}`)
export const getMyProducts = () => api.get('/marketplace/my-products')
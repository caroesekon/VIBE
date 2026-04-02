import api from './api'

export const globalSearch = (query, type = 'all', page = 1, limit = 20) => {
  let url = `/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  if (type !== 'all') {
    url += `&type=${type}`
  }
  return api.get(url)
}

export const searchUsers = (query, page = 1, limit = 20) => 
  api.get(`/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)

export const searchPosts = (query, page = 1, limit = 20) => 
  api.get(`/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)

export const searchGroups = (query, page = 1, limit = 20) => 
  api.get(`/search/groups?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`)
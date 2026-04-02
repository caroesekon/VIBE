export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&color=fff&size=128'

export const POST_PRIVACY = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  ONLY_ME: 'only-me'
}

export const GROUP_PRIVACY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  SECRET: 'secret'
}
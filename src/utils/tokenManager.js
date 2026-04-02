const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }
}

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export const decodeToken = (token) => {
  try {
    if (!token) return null
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Token decode error:', error)
    return null
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true
  const decoded = decodeToken(token)
  if (!decoded) return true
  const currentTime = Date.now() / 1000
  return decoded.exp < currentTime
}

export const getTokenExpirationTime = (token) => {
  const decoded = decodeToken(token)
  if (!decoded) return 0
  return decoded.exp * 1000 - Date.now()
}
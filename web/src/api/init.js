import axios from 'axios'
import { rememberToken, rememberRefreshToken, getValidToken, getRefreshToken } from './token'

const baseURL = process.env.REACT_APP_API_URL

// Create an axios instance
const api = axios.create({
  baseURL
})

export function setToken(token, refreshToken) {
  // saves token to local storage
  rememberToken(token)
  if (refreshToken) {
    rememberRefreshToken(refreshToken)
  }
  
  if (token) {
    // Setting the Authorisation header for all future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
    rememberRefreshToken(null)
  }
}

// Intercept responses to handle 401 errors by trying to refresh the token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          const response = await axios.post(`${baseURL}/auth/refresh`, { refresh_token: refreshToken })
          const { token } = response.data
          setToken(token)
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return axios(originalRequest)
        } catch (refreshError) {
          // If refresh fails, log out
          setToken(null)
          window.location.href = '/'
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  }
)

// Validates token, and removes it if it's invalid
setToken(getValidToken(), getRefreshToken())

export default api

import axios from 'axios'
import toast from 'react-hot-toast'
import { getFriendlyErrorMessage } from '../utils/friendlyErrorMessage'

const API_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://blackcart-backend.onrender.com')

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  timeout: 20_000,
})

const isAuthenticated = () => {
  const token = localStorage.getItem('token')
  return Boolean(token && token.length > 10)
}

const clearAuthData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete api.defaults.headers.common.Authorization
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}`
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  } else if (config.headers['Content-Type'] === undefined) {
    config.headers['Content-Type'] = 'application/json'
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && isAuthenticated()) clearAuthData()

    const responseData = error.response?.data
    const rawMessage = responseData?.message || responseData?.error || error.message
    const friendlyMessage = getFriendlyErrorMessage(rawMessage, {
      status: error.response?.status,
    })

    error.message = friendlyMessage
    if (responseData && typeof responseData === 'object') {
      if (responseData.message) responseData.message = friendlyMessage
      if (responseData.error) responseData.error = friendlyMessage
    }

    if (responseData?.message) toast.error(friendlyMessage)
    return Promise.reject(error)
  },
)

export { api, isAuthenticated, clearAuthData }
export default api


// src/services/api.ts 
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com'
const API_BASE = `${API_URL}/api`

const api = axios.create({
  baseURL: API_BASE,
  
  withCredentials: true,
})

// Auth helpers
const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token')
  return !!token && token.length > 10
}

const clearAuthData = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  delete api.defaults.headers.common['Authorization']
}

// Interceptors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      const cleanToken = token.replace('Bearer ', '').trim()
      config.headers.Authorization = `Bearer ${cleanToken}`
    }
    
    // ✅ FIX: Don't set Content-Type for FormData
    if (config.data instanceof FormData) {
      // Let browser set the Content-Type automatically
      delete config.headers['Content-Type']
    } else if (config.headers['Content-Type'] === undefined) {
      // Only set JSON for non-FormData requests
      config.headers['Content-Type'] = 'application/json'
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthData()
      window.location.href = '/login'
    }
    
    if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    }
    
    return Promise.reject(error)
  }
)

// ✅ EXPORT BOTH NAMED AND DEFAULT
export { api, isAuthenticated, clearAuthData }
export default api




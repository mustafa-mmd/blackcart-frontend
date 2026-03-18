

import { api } from './api'
import { LoginFormData, RegisterFormData, User } from '../types'

// ─── helpers ──────────────────────────────────────────────────────────────────
// Both register and login share the same response envelope:
//   { success: boolean, data: { ...user, token: string }, message: string }
// We extract token + user here so every caller gets the same shape back.
type AuthResponse = {
  success: boolean
  message: string
  data: User & { token: string }
}

const storeCredentials = (token: string, user: Omit<User, 'token'>) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

// ─── authService ──────────────────────────────────────────────────────────────
export const authService = {
  // FIX (BUG D): register now mirrors login — it extracts and stores credentials
  // immediately, and returns the same normalised shape that AuthContext expects.
  register: async (data: RegisterFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    const { token, ...user } = response.data.data
    if (token) {
      storeCredentials(token, user)
    }
    return response.data
  },

  login: async (data: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data)
    const { token, ...user } = response.data.data
    if (token) {
      storeCredentials(token, user)
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      // Always clear local state even if the server call fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me')
    return response.data.data
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/auth/update-profile', data)
    return response.data
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/change-password', data)
    return response.data
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.put(`/auth/reset-password/${token}`, { password })
    return response.data
  },

  verifyEmail: async (token: string) => {
    const response = await api.get(`/auth/verify-email/${token}`)
    return response.data
  },

  resendVerification: async () => {
    const response = await api.post('/auth/resend-verification')
    return response.data
  },

  refreshToken: async () => {
    const response = await api.post<AuthResponse>('/auth/refresh-token')
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token)
    }
    return response.data
  },

  googleLogin: () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${apiUrl}/api/auth/google`
  },

  verifyOAuthToken: async (token: string) => {
    const response = await api.get('/auth/verify-token', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.data
  },

  handleOAuthCallback: async (token: string) => {
    const verification = await authService.verifyOAuthToken(token)
    if (verification.success) {
      storeCredentials(token, verification.data)
      return verification.data
    }
    throw new Error('Token verification failed')
  },
}
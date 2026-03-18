import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react'
import { authService } from '../services/authService'
import { User } from '../types'
import toast from 'react-hot-toast'
import { api, clearAuthData } from '../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserWithSettings extends User {
  settings?: {
    notifications?: {
      orderUpdates: boolean
      promotions: boolean
      recommendations: boolean
      emailNotifications: boolean
      smsNotifications: boolean
    }
    privacy?: {
      publicProfile: boolean
      showOrderHistory: boolean
      shareEmail: boolean
    }
    theme?: {
      darkMode: boolean
      compactView: boolean
    }
  }
}

interface AuthContextType {
  user: UserWithSettings | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: UserWithSettings) => void
  updateProfile: (data: Partial<UserWithSettings>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerification: () => Promise<void>
  refreshToken: () => Promise<string | null>
  googleLogin: () => void
  loginWithToken: (token: string, userData: UserWithSettings) => Promise<void>
  setUser: (user: UserWithSettings | null) => void
  setToken: (token: string | null) => void
  isAdmin: () => boolean
  updateNotificationPreferences: (preferences: Record<string, unknown>) => Promise<void>
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_NOTIFICATIONS = {
  orderUpdates: true,
  promotions: false,
  recommendations: true,
  emailNotifications: true,
  smsNotifications: false,
}

const ensureSettings = (user: UserWithSettings): UserWithSettings => ({
  ...user,
  settings: {
    ...user.settings,
    notifications: user.settings?.notifications ?? DEFAULT_NOTIFICATIONS,
  },
})

// ─── Token helpers ────────────────────────────────────────────────────────────

const validateToken = (token: string | null): boolean => {
  if (!token || typeof token !== 'string') return false
  const t = token.trim()
  return t.length > 10 && t !== 'undefined' && t !== 'null'
}

const applyAxiosToken = (token: string | null): boolean => {
  if (token && validateToken(token)) {
    const clean = token.replace(/^Bearer\s+/i, '').trim()
    api.defaults.headers.common['Authorization'] = `Bearer ${clean}`
    return true
  }
  delete api.defaults.headers.common['Authorization']
  return false
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserWithSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const initialized = useRef(false)

  // Hydrate from localStorage on mount (runs once)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const token = localStorage.getItem('token')
    const raw = localStorage.getItem('user')

    if (token && raw && raw !== 'undefined') {
      try {
        const parsed = JSON.parse(raw) as UserWithSettings
        applyAxiosToken(token)
        setUserState(ensureSettings(parsed))
        setIsAuthenticated(true)
      } catch {
        clearAuthData()
      }
    }

    setLoading(false)
  }, [])

  // ── Primitive setters ───────────────────────────────────────────────────────

  const setUser = useCallback((incoming: UserWithSettings | null) => {
    if (incoming) {
      const hydrated = ensureSettings(incoming)
      localStorage.setItem('user', JSON.stringify(hydrated))
      setUserState(hydrated)
      setIsAuthenticated(true)
    } else {
      localStorage.removeItem('user')
      setUserState(null)
      setIsAuthenticated(false)
      delete api.defaults.headers.common['Authorization']
    }
  }, [])

  const setToken = useCallback((token: string | null) => {
    if (token && validateToken(token)) {
      localStorage.setItem('token', token)
      applyAxiosToken(token)
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }, [])

  // ── Auth actions ────────────────────────────────────────────────────────────

  // FIX (BUG B): AuthContext no longer shows toasts for register/login.
  // Toasts are the component's responsibility — the context just does the work
  // and throws on failure so the component can react however it needs to.
  const register = useCallback(
    async (name: string, email: string, password: string, phone?: string) => {
      setLoading(true)
      try {
        const result = await authService.register({ name, email, password, phone })
        const { token, ...userData } = result.data

        if (!token) throw new Error('No token received from server')

        const hydrated = ensureSettings(userData as UserWithSettings)
        applyAxiosToken(token)
        setUserState(hydrated)
        setIsAuthenticated(true)
        // token + user were already stored by authService
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const login = useCallback(
    async (email: string, password: string, isAdminLogin = false) => {
      setLoading(true)
      try {
        const result = await authService.login({ email, password })

        if (isAdminLogin && result.data.role !== 'admin') {
          throw new Error('Access denied. Admin privileges required.')
        }

        const { token, ...userData } = result.data

        if (!token) throw new Error('No token received from server')

        const hydrated = ensureSettings(userData as UserWithSettings)
        applyAxiosToken(token)
        setUserState(hydrated)
        setIsAuthenticated(true)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authService.logout()
    } catch (err) {
      console.error('Server-side logout error (non-fatal):', err)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUserState(null)
      setIsAuthenticated(false)
      delete api.defaults.headers.common['Authorization']
      setLoading(false)
      setTimeout(() => (window.location.href = '/'), 100)
    }
  }, [])

  const updateUser = useCallback(
    (updated: UserWithSettings) => {
      // Preserve existing notification settings if incoming data omits them
      const merged: UserWithSettings =
        user?.settings?.notifications && !updated.settings?.notifications
          ? { ...updated, settings: { ...updated.settings, notifications: user.settings.notifications } }
          : updated
      localStorage.setItem('user', JSON.stringify(merged))
      setUserState(merged)
    },
    [user]
  )

  const updateProfile = useCallback(
    async (data: Partial<UserWithSettings>) => {
      setLoading(true)
      try {
        const response = await api.put<{ success: boolean; data: UserWithSettings }>(
          '/users/profile',
          data
        )
        const incoming = response.data.data
        // Preserve notifications that backend doesn't return
        const merged =
          user?.settings?.notifications && !incoming.settings?.notifications
            ? { ...incoming, settings: { ...incoming.settings, notifications: user.settings.notifications } }
            : incoming
        localStorage.setItem('user', JSON.stringify(merged))
        setUserState(merged)
        setIsAuthenticated(true)
        toast.success('Profile updated successfully')
        return response
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        toast.error(msg || 'Profile update failed')
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true)
    try {
      const response = await authService.changePassword({ currentPassword, newPassword })
      toast.success('Password changed successfully')
      return response
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Password change failed')
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const forgotPassword = useCallback(async (email: string) => {
    setLoading(true)
    try {
      const response = await authService.forgotPassword(email)
      toast.success('Password reset instructions sent to your email')
      return response
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Password reset request failed')
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (token: string, password: string) => {
    setLoading(true)
    try {
      const response = await authService.resetPassword(token, password)
      toast.success('Password reset successful! You can now sign in.')
      return response
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Password reset failed')
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyEmail = useCallback(async (token: string) => {
    setLoading(true)
    try {
      const response = await authService.verifyEmail(token)
      toast.success('Email verified successfully!')
      return response
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Email verification failed')
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const resendVerification = useCallback(async () => {
    setLoading(true)
    try {
      const response = await authService.resendVerification()
      toast.success('Verification email sent')
      return response
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Failed to send verification email')
      toast.error(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const result = await authService.refreshToken()
      if (result.data?.token) {
        setToken(result.data.token)
        return result.data.token
      }
      return null
    } catch {
      await logout()
      return null
    }
  }, [setToken, logout])

  const googleLogin = useCallback(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    window.location.href = `${apiUrl}/api/auth/google`
  }, [])

  const loginWithToken = useCallback(async (token: string, userData: UserWithSettings) => {
    if (!validateToken(token)) throw new Error('Invalid authentication token')
    const hydrated = ensureSettings(userData)
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(hydrated))
    applyAxiosToken(token)
    setUserState(hydrated)
    setIsAuthenticated(true)
    toast.success(`Welcome ${userData.name}!`)
  }, [])

  const updateNotificationPreferences = useCallback(
    async (preferences: Record<string, unknown>) => {
      setLoading(true)
      try {
        const response = await api.put('/notifications/preferences', preferences)
        if (response.data.success && user) {
          const updated = {
            ...user,
            settings: { ...user.settings, notifications: response.data.data },
          }
          localStorage.setItem('user', JSON.stringify(updated))
          setUserState(updated)
          toast.success('Notification preferences updated')
        }
        return response.data
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Failed to update preferences'
        toast.error(msg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [user]
  )

  const isAdmin = useCallback(() => user?.role === 'admin', [user])

  // ── Context value ───────────────────────────────────────────────────────────

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    refreshToken,
    googleLogin,
    loginWithToken,
    setUser,
    setToken,
    isAdmin,
    updateNotificationPreferences,
  }

  // Loading spinner — rendered AFTER all hooks, so hook order is never violated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading…</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
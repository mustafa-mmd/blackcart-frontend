// src/hooks/useAdmin.ts
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface AdminContextType {
  isAdmin: boolean
  isLoading: boolean
  adminFeatures: {
    canManageProducts: boolean
    canManageOrders: boolean
    canManageUsers: boolean
    canManageCategories: boolean
    canViewAnalytics: boolean
    canManageSettings: boolean
  }
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export const useAdmin = () => {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}

interface AdminProviderProps {
  children: ReactNode
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading) {
      const checkAdminAccess = () => {
        if (!user) {
          setIsAdmin(false)
          setIsLoading(false)
          return
        }

        const adminStatus = user.role === 'admin' || user.role === 'moderator'
        setIsAdmin(adminStatus)
        
        if (!adminStatus && window.location.pathname.startsWith('/admin')) {
          toast.error('Access denied. Admin privileges required.')
          navigate('/')
        }
        
        setIsLoading(false)
      }

      checkAdminAccess()
    }
  }, [user, authLoading, navigate])

  const adminFeatures = {
    canManageProducts: isAdmin,
    canManageOrders: isAdmin,
    canManageUsers: isAdmin && user?.role === 'admin',
    canManageCategories: isAdmin,
    canViewAnalytics: isAdmin,
    canManageSettings: isAdmin && user?.role === 'admin',
  }

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading, adminFeatures }}>
      {children}
    </AdminContext.Provider>
  )
}

// Custom hook to check admin access for specific routes
export const useAdminRoute = () => {
  const { isAdmin, isLoading } = useAdmin()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast.error('Admin access required')
      navigate('/')
    }
  }, [isAdmin, isLoading, navigate])

  return { isAdmin, isLoading }
}
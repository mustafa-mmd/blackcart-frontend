// src/components/common/PrivateRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Loader from './Loader'

interface PrivateRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
  requireAdmin?: boolean // alias used in App.tsx
}

// ============================================================
// ⚠️  AUTH TEMPORARILY BYPASSED FOR GUESTS
//     Authentication is bypassed for regular pages, but
//     enforced for Admin routes so the admin can still log in and manage.
// ============================================================
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, adminOnly = false, requireAdmin = false }) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Enforce auth ONLY if admin-level access is required
  if (adminOnly || requireAdmin) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader size="lg" />
        </div>
      )
    }

    if (!user) {
      // Redirect to admin login page
      return <Navigate to="/admin/login" state={{ from: location }} replace />
    }

    if (user.role !== 'admin') {
      return <Navigate to="/" replace />
    }
  }

  // Otherwise, bypass authentication for regular pages (guest mode)
  return <>{children}</>

  /* ---------- ORIGINAL FULL AUTH GUARD (do not delete) ----------
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
  ---------------------------------------------------------- */
}

export default PrivateRoute
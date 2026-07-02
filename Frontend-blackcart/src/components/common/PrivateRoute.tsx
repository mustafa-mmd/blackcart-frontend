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
// ⚠️  AUTH TEMPORARILY DISABLED — restore by removing bypass
//     and uncommenting the original block below.
// ============================================================
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // BYPASS: render all protected routes without authentication check
  return <>{children}</>

  /* ---------- ORIGINAL AUTH GUARD (do not delete) ----------
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
import React, { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import { authService } from '../../services/authService'

type VerifyState = 'verifying' | 'success' | 'error'

const VerifyEmailPage: React.FC = () => {
  const [state,   setState]   = useState<VerifyState>('verifying')
  const [message, setMessage] = useState('')

  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  // ── ROOT FIX — infinite loop prevention ──────────────────────────────────────
  // PROBLEM: The previous version called verifyEmail from AuthContext.
  //   AuthContext.verifyEmail calls setLoading(true), which makes AuthProvider
  //   render the full-screen spinner and UNMOUNT the entire app tree including
  //   VerifyEmailPage. When setLoading(false) fires in finally, the app
  //   remounts, VerifyEmailPage mounts again, useEffect fires again →
  //   infinite loop → 17 API calls to the same endpoint.
  //   The backend marks the token as used after the FIRST call, so every
  //   subsequent call returns 400 "invalid or expired token".
  //
  // FIX: Call authService.verifyEmail() directly with LOCAL state only.
  //   This never touches the global loading state, so AuthProvider never
  //   unmounts the tree. The hasFired ref ensures the effect runs exactly
  //   once even under React 18 Strict Mode (which double-invokes effects
  //   in development to help catch side-effect bugs).
  const hasFired = useRef(false)

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    const verify = async () => {
      if (!token) {
        setState('error')
        setMessage('No verification token found. Please use the link from your email.')
        return
      }

      try {
        await authService.verifyEmail(token)
        setState('success')
      } catch (err: unknown) {
        setState('error')
        const msg =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ||
          (err instanceof Error
            ? err.message
            : 'Verification failed. The link may have expired.')
        setMessage(msg)
      }
    }

    verify()
  }, [token])

  // ── Verifying ────────────────────────────────────────────────────────────────
  if (state === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-10 max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Loader className="h-8 w-8 text-primary-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying your email…</h1>
          <p className="text-gray-500">Please wait while we confirm your address.</p>
        </motion.div>
      </div>
    )
  }

  // ── Success ──────────────────────────────────────────────────────────────────
  if (state === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card p-10 max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-8">
            Your email address has been verified successfully. You can now access
            all features of your BlackCart account.
          </p>
          <Link to="/" className="btn-primary inline-block px-8 py-3">
            Start Shopping
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-10 max-w-md w-full text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
        <p className="text-gray-600 mb-8">
          {message || 'The verification link is invalid or has expired.'}
        </p>
        <div className="space-y-3">
          <Link to="/login" className="btn-primary inline-block w-full py-3">
            Go to Login
          </Link>
          <p className="text-sm text-gray-500">
            Need a new verification email?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in to resend it
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default VerifyEmailPage
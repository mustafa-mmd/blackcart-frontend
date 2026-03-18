

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'  // ← useSearchParams, not useParams
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, Check, ArrowLeft } from 'lucide-react'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

// ─── Schema ───────────────────────────────────────────────────────────────────
// FIX: min(8) to match the checklist items shown in the UI
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// ─── Password helpers (shared constants) ──────────────────────────────────────
const PASSWORD_CHECKS = [
  { label: 'At least 8 characters', regex: /^.{8,}$/ },
  { label: 'Uppercase letter',       regex: /[A-Z]/ },
  { label: 'Lowercase letter',       regex: /[a-z]/ },
  { label: 'Number',                 regex: /[0-9]/ },
  { label: 'Special character',      regex: /[^A-Za-z0-9]/ },
]

const calcScore = (pw: string) =>
  PASSWORD_CHECKS.reduce((n, c) => n + (c.regex.test(pw) ? 1 : 0), 0)

const getStrength = (score: number) => {
  if (score === 0) return { text: 'Very Weak',  color: 'bg-red-500'     }
  if (score <= 2)  return { text: 'Weak',        color: 'bg-orange-500'  }
  if (score <= 3)  return { text: 'Good',        color: 'bg-yellow-500'  }
  if (score <= 4)  return { text: 'Strong',      color: 'bg-green-500'   }
  return              { text: 'Very Strong',  color: 'bg-emerald-600' }
}

// ─── Component ────────────────────────────────────────────────────────────────
const ResetPasswordPage: React.FC = () => {
  const [showPassword,        setShowPassword]        = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading,           setIsLoading]           = useState(false)

  // ── BUG FIX ──────────────────────────────────────────────────────────────────
  // ORIGINAL: useParams<{ token: string }>()
  //   This expects the URL to be /reset-password/:token  (path segment)
  //
  // PROBLEM: The email sends /reset-password?token=abc  (query string)
  //   useParams reads path segments — it returns undefined for query strings.
  //   isValidToken was set from `!token` check → `token` was always undefined
  //   → page showed "Invalid Token" screen immediately on arrival, or 404.
  //
  // FIX: useSearchParams reads query strings (?key=value).
  // The route in App.tsx stays as  path="/reset-password"  (no :token segment).
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')   // reads ?token= correctly

  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const password  = watch('password', '')
  const score     = calcScore(password)
  const strength  = getStrength(score)

  // Show invalid screen immediately if the URL has no token at all
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="container-lg section-padding">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Link</h1>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <Link to="/forgot-password" className="btn-primary">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true)
    try {
      await authService.resetPassword(token, data.password)
      toast.success('Password reset successful! You can now sign in.')
      navigate('/login')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Failed to reset password. Please try again.')
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container-lg section-padding">
        <div className="max-w-md mx-auto">
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Login
          </Link>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card p-8"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Lock className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600">Create a new password for your account</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        Strength: {strength.text}
                      </span>
                      <span className="text-sm text-gray-500">{score}/5</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Checklist */}
                <ul className="mt-3 space-y-1.5">
                  {PASSWORD_CHECKS.map((check) => {
                    const passed = check.regex.test(password)
                    return (
                      <li key={check.label} className="flex items-center text-sm">
                        <Check
                          className={`h-4 w-4 mr-2 shrink-0 ${
                            passed ? 'text-green-600' : 'text-gray-300'
                          }`}
                        />
                        <span className={passed ? 'text-gray-700' : 'text-gray-400'}>
                          {check.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {errors.password && (
                  <p className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1 shrink-0" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? 'Hide' : 'Show'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1 shrink-0" />
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Resetting…
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                Make sure your new password is strong and different from previous passwords.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
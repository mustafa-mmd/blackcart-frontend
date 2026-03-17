// import React, { useState, useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Link, useParams, useNavigate } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { Lock, Eye, EyeOff, AlertCircle, Check, ArrowLeft } from 'lucide-react'
// import { authService } from '../../services/authService'
// import toast from 'react-hot-toast'

// const resetPasswordSchema = z.object({
//   password: z.string()
//     .min(6, 'Password must be at least 6 characters')
//     .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
//     .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
//     .regex(/[0-9]/, 'Password must contain at least one number')
//     .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
//   confirmPassword: z.string(),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords don't match",
//   path: ["confirmPassword"],
// })

// type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// const ResetPasswordPage: React.FC = () => {
//   const [showPassword, setShowPassword] = useState(false)
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false)
//   const [passwordScore, setPasswordScore] = useState(0)
//   const [isLoading, setIsLoading] = useState(false)
//   const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
//   const { token } = useParams<{ token: string }>()
//   const navigate = useNavigate()

//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors },
//   } = useForm<ResetPasswordFormData>({
//     resolver: zodResolver(resetPasswordSchema),
//   })

//   const password = watch('password', '')

//   // Validate token on component mount
//   useEffect(() => {
//     if (!token) {
//       setIsValidToken(false)
//       return
//     }

//     // In a real app, you might want to validate the token with the backend
//     // For now, we'll assume it's valid if it exists
//     setIsValidToken(true)
//   }, [token])

//   // Calculate password strength
//   useEffect(() => {
//     if (!password) {
//       setPasswordScore(0)
//       return
//     }

//     let score = 0
//     if (password.length >= 8) score += 1
//     if (/[A-Z]/.test(password)) score += 1
//     if (/[a-z]/.test(password)) score += 1
//     if (/[0-9]/.test(password)) score += 1
//     if (/[^A-Za-z0-9]/.test(password)) score += 1

//     setPasswordScore(score)
//   }, [password])

//   const getPasswordStrength = (score: number) => {
//     if (score === 0) return { text: 'Very Weak', color: 'bg-red-500' }
//     if (score <= 2) return { text: 'Weak', color: 'bg-orange-500' }
//     if (score <= 3) return { text: 'Good', color: 'bg-yellow-500' }
//     if (score <= 4) return { text: 'Strong', color: 'bg-green-500' }
//     return { text: 'Very Strong', color: 'bg-emerald-600' }
//   }

//   const strength = getPasswordStrength(passwordScore)

//   const passwordChecks = [
//     { label: 'At least 8 characters', regex: /^.{8,}$/ },
//     { label: 'Uppercase letter', regex: /[A-Z]/ },
//     { label: 'Lowercase letter', regex: /[a-z]/ },
//     { label: 'Number', regex: /[0-9]/ },
//     { label: 'Special character', regex: /[^A-Za-z0-9]/ },
//   ]

//   const onSubmit = async (data: ResetPasswordFormData) => {
//     if (!token) {
//       toast.error('Invalid reset token')
//       return
//     }

//     setIsLoading(true)
//     try {
//       await authService.resetPassword(token, data.password)
//       toast.success('Password reset successful! You can now login with your new password.')
//       navigate('/login')
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to reset password. Please try again.')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   if (isValidToken === false) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
//         <div className="container-lg section-padding">
//           <div className="max-w-md mx-auto text-center">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
//               <AlertCircle className="h-8 w-8 text-red-600" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-4">Invalid Token</h1>
//             <p className="text-gray-600 mb-6">
//               The password reset link is invalid or has expired. Please request a new reset link.
//             </p>
//             <Link to="/forgot-password" className="btn-primary">
//               Request New Reset Link
//             </Link>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
//       <div className="container-lg section-padding">
//         <div className="max-w-md mx-auto">
//           <Link
//             to="/login"
//             className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-8"
//           >
//             <ArrowLeft className="h-5 w-5 mr-2" />
//             Back to Login
//           </Link>

//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="card p-8"
//           >
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
//                 <Lock className="h-8 w-8 text-primary-600" />
//               </div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
//               <p className="text-gray-600">
//                 Create a new password for your account
//               </p>
//             </div>

//             <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//               {/* Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   New Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     {...register('password')}
//                     className="input-field pl-10 pr-10"
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-5 w-5" />
//                     ) : (
//                       <Eye className="h-5 w-5" />
//                     )}
//                   </button>
//                 </div>
                
//                 {/* Password Strength */}
//                 {password && (
//                   <div className="mt-4">
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="text-sm font-medium text-gray-700">
//                         Password Strength: {strength.text}
//                       </span>
//                       <span className="text-sm text-gray-500">{passwordScore}/5</span>
//                     </div>
//                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                       <div
//                         className={`h-full ${strength.color} transition-all duration-300`}
//                         style={{ width: `${(passwordScore / 5) * 100}%` }}
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Password Requirements */}
//                 <div className="mt-4 space-y-2">
//                   {passwordChecks.map((check, index) => (
//                     <div key={index} className="flex items-center text-sm">
//                       <div className={`mr-2 ${check.regex.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
//                         <Check className="h-4 w-4" />
//                       </div>
//                       <span className={check.regex.test(password) ? 'text-gray-700' : 'text-gray-500'}>
//                         {check.label}
//                       </span>
//                     </div>
//                   ))}
//                 </div>

//                 {errors.password && (
//                   <div className="flex items-center mt-2 text-red-600 text-sm">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.password.message}
//                   </div>
//                 )}
//               </div>

//               {/* Confirm Password Field */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Confirm New Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//                   <input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     {...register('confirmPassword')}
//                     className="input-field pl-10 pr-10"
//                     placeholder="••••••••"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
//                   >
//                     {showConfirmPassword ? (
//                       <EyeOff className="h-5 w-5" />
//                     ) : (
//                       <Eye className="h-5 w-5" />
//                     )}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && (
//                   <div className="flex items-center mt-2 text-red-600 text-sm">
//                     <AlertCircle className="h-4 w-4 mr-1" />
//                     {errors.confirmPassword.message}
//                   </div>
//                 )}
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isLoading ? (
//                   <span className="flex items-center justify-center">
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Resetting...
//                   </span>
//                 ) : (
//                   'Reset Password'
//                 )}
//               </button>
//             </form>

//             {/* Additional Info */}
//             <div className="mt-8 pt-6 border-t border-gray-200">
//               <p className="text-center text-gray-600 text-sm">
//                 Make sure your new password is strong and different from previous passwords.
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ResetPasswordPage

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
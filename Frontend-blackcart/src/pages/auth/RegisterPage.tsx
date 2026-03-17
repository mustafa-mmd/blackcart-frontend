import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, Phone, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// ─── Validation schema ────────────────────────────────────────────────────────
// FIX (BUG A): min(8) now matches the "At least 8 characters" checklist item
// and aligns with passwordConfig.calculateStrength on the backend.
const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(60, 'Name is too long'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    // FIX (BUG C): terms checkbox is now part of the RHF schema so it is
    // validated on submit, not relying on the native HTML `required` attribute
    // which is bypassed by programmatic form submission.
    terms: z.boolean().refine((v) => v === true, {
      message: 'You must accept the Terms of Service and Privacy Policy',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

// ─── Password checklist ───────────────────────────────────────────────────────
const PASSWORD_CHECKS = [
  { label: 'At least 8 characters', regex: /^.{8,}$/ },
  { label: 'Uppercase letter', regex: /[A-Z]/ },
  { label: 'Lowercase letter', regex: /[a-z]/ },
  { label: 'Number', regex: /[0-9]/ },
  { label: 'Special character', regex: /[^A-Za-z0-9]/ },
]

const calcPasswordScore = (pw: string): number => {
  if (!pw) return 0
  return PASSWORD_CHECKS.reduce((n, c) => n + (c.regex.test(pw) ? 1 : 0), 0)
}

const getStrengthLabel = (score: number): { text: string; color: string } => {
  if (score === 0) return { text: 'Very Weak', color: 'bg-red-500' }
  if (score <= 2) return { text: 'Weak', color: 'bg-orange-500' }
  if (score <= 3) return { text: 'Good', color: 'bg-yellow-500' }
  if (score <= 4) return { text: 'Strong', color: 'bg-green-500' }
  return { text: 'Very Strong', color: 'bg-emerald-600' }
}

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register: registerUser, googleLogin } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { terms: false },
  })

  const password = watch('password', '')
  const passwordScore = calcPasswordScore(password)
  const strength = getStrengthLabel(passwordScore)

  // FIX (BUG B): This component owns the toasts for register.
  // AuthContext.register no longer shows toasts — it just throws on failure.
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      await registerUser(data.name, data.email, data.password, data.phone)
      toast.success('Account created! Please check your email to verify your account.')
      navigate('/')
    } catch (err: unknown) {
      const apiMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      const fallback = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      toast.error(apiMsg || fallback)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="container-lg section-padding">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">BC</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600">Join thousands of satisfied customers</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      {...register('name')}
                      className="input-field pl-10"
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                  {errors.name && (
                    <p className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1 shrink-0" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      {...register('email')}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && (
                    <p className="flex items-center mt-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1 shrink-0" />
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    {...register('phone')}
                    className="input-field pl-10"
                    placeholder="+92 300 1234567"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
                      <span className="text-sm text-gray-500">{passwordScore}/5</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${(passwordScore / 5) * 100}%` }}
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
                  Confirm Password
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
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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

              {/* FIX (BUG C): Terms checkbox registered with RHF */}
              <div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      {...register('terms')}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms-of-service" className="text-primary-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy-policy" className="text-primary-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="flex items-center mt-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1 shrink-0" />
                    {errors.terms.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating account…
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              {/* Google OAuth */}
              <button
                type="button"
                onClick={googleLogin}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign up with Google
              </button>

              {/* Login link */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
})

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

const ChangePassword: React.FC = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordScore, setPasswordScore] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { changePassword } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const newPassword = watch('newPassword', '')

  // Calculate password strength
  React.useEffect(() => {
    if (!newPassword) {
      setPasswordScore(0)
      return
    }

    let score = 0
    if (newPassword.length >= 8) score += 1
    if (/[A-Z]/.test(newPassword)) score += 1
    if (/[a-z]/.test(newPassword)) score += 1
    if (/[0-9]/.test(newPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1

    setPasswordScore(score)
  }, [newPassword])

  const getPasswordStrength = (score: number) => {
    if (score === 0) return { text: 'Very Weak', color: 'bg-red-500' }
    if (score <= 2) return { text: 'Weak', color: 'bg-orange-500' }
    if (score <= 3) return { text: 'Good', color: 'bg-yellow-500' }
    if (score <= 4) return { text: 'Strong', color: 'bg-green-500' }
    return { text: 'Very Strong', color: 'bg-emerald-600' }
  }

  const strength = getPasswordStrength(passwordScore)

  const passwordChecks = [
    { label: 'At least 8 characters', regex: /^.{8,}$/ },
    { label: 'Uppercase letter', regex: /[A-Z]/ },
    { label: 'Lowercase letter', regex: /[a-z]/ },
    { label: 'Number', regex: /[0-9]/ },
    { label: 'Special character', regex: /[^A-Za-z0-9]/ },
  ]

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true)
    try {
      await changePassword(data.currentPassword, data.newPassword)
      toast.success('Password changed successfully!')
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              {...register('currentPassword')}
              className="input-field pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.currentPassword.message}
            </div>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type={showNewPassword ? 'text' : 'password'}
              {...register('newPassword')}
              className="input-field pl-10 pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength */}
          {newPassword && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Password Strength: {strength.text}
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

          {/* Password Requirements */}
          <div className="mt-4 space-y-2">
            {passwordChecks.map((check, index) => (
              <div key={index} className="flex items-center text-sm">
                <div className={`mr-2 ${check.regex.test(newPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                  <Check className="h-4 w-4" />
                </div>
                <span className={check.regex.test(newPassword) ? 'text-gray-700' : 'text-gray-500'}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          {errors.newPassword && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.newPassword.message}
            </div>
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
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <div className="flex items-center mt-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.confirmPassword.message}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Changing...
              </span>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </form>

      {/* Security Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-medium text-blue-900 mb-2">Security Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use a unique password for each account</li>
          <li>• Avoid using personal information in passwords</li>
          <li>• Consider using a password manager</li>
          <li>• Update your password regularly</li>
        </ul>
      </div>
    </motion.div>
  )
}

export default ChangePassword
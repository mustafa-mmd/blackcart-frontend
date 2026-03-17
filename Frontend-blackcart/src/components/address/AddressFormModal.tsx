// src/components/address/AddressFormModal.tsx
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { X, MapPin, Phone, User, Home, Check } from 'lucide-react'
import { pakistanCities } from '../../utils/pakistanCities'

const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').default('Pakistan'),
  phone: z.string().min(10, 'Valid phone number is required'),
  isDefault: z.boolean().optional().default(false),
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddressFormModalProps {
  isOpen: boolean
  onClose: () => void
  address?: any | null
  onSubmit: (data: AddressFormData) => Promise<void>
  isLoading?: boolean
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  address,
  onSubmit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'Pakistan',
      isDefault: false,
    },
  })

  useEffect(() => {
    if (address) {
      setValue('fullName', address.fullName)
      setValue('address', address.address)
      setValue('city', address.city)
      setValue('postalCode', address.postalCode)
      setValue('country', address.country || 'Pakistan')
      setValue('phone', address.phone)
      setValue('isDefault', address.isDefault || false)
    } else {
      reset({
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: 'Pakistan',
        phone: '',
        isDefault: false,
      })
    }
  }, [address, setValue, reset])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <MapPin className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {address ? 'Edit Address' : 'Add New Address'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                {...register('fullName')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="John Doe"
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="tel"
                {...register('phone')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="+92 300 1234567"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                {...register('address')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="123 Main Street"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* City and Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <select
                {...register('city')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="">Select City</option>
                {pakistanCities.map((city) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                {...register('postalCode')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="54000"
              />
              {errors.postalCode && (
                <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              {...register('country')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-gray-50"
              readOnly
            />
          </div>

          {/* Default Address Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('isDefault')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : address ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddressFormModal
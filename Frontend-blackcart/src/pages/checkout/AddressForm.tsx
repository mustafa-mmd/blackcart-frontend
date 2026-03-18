// import React, { useEffect } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { motion } from 'framer-motion'
// import { MapPin, User, Home, Phone, Check, Building } from 'lucide-react'
// import { pakistanCities, getProvinces } from '../../utils/pakistanCities'

// // Updated schema to match backend Address model
// const addressSchema = z.object({
//   fullName: z.string().min(2, 'Full name must be at least 2 characters'),
//   name: z.string().min(2, 'Name must be at least 2 characters'),
//   address: z.string().min(5, 'Address must be at least 5 characters'),
//   city: z.string().min(1, 'Please select a city'),
//   province: z.string().min(1, 'Please select a province'),
//   postalCode: z.string().regex(/^\d{5}$/, 'Postal code must be 5 digits').optional().or(z.literal('')),
//   phone: z.string()
//     .regex(/^(\+92|0|92)?[0-9]{10}$/, 'Please enter a valid Pakistani phone number')
//     .transform(val => {
//       // Format to +92XXXXXXXXXX
//       let cleaned = val.replace(/\D/g, '');
//       if (cleaned.startsWith('92')) {
//         return '+' + cleaned;
//       } else if (cleaned.startsWith('0')) {
//         return '+92' + cleaned.substring(1);
//       } else {
//         return '+92' + cleaned;
//       }
//     }),
//   type: z.enum(['home', 'office', 'other']).default('home'),
//   isDefault: z.boolean().optional().default(false),
// })

// type AddressFormData = z.infer<typeof addressSchema>

// interface AddressFormProps {
//   initialData?: Partial<AddressFormData>
//   onSubmit: (data: AddressFormData) => void
//   isLoading?: boolean
// }

// const AddressForm: React.FC<AddressFormProps> = ({ initialData, onSubmit, isLoading = false }) => {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm<AddressFormData>({
//     resolver: zodResolver(addressSchema),
//     defaultValues: {
//       fullName: initialData?.fullName || '',
//       name: initialData?.name || initialData?.fullName || '',
//       address: initialData?.address || '',
//       city: initialData?.city || '',
//       province: initialData?.province || '',
//       postalCode: initialData?.postalCode || '',
//       phone: initialData?.phone || '',
//       type: initialData?.type || 'home',
//       isDefault: initialData?.isDefault || false,
//     },
//   })

//   // Auto-set province when city is selected
//   const selectedCity = watch('city');
  
//   useEffect(() => {
//     if (selectedCity) {
//       const cityData = pakistanCities.find(c => c.name === selectedCity);
//       if (cityData) {
//         setValue('province', cityData.province, { shouldValidate: true });
//       }
//     }
//   }, [selectedCity, setValue]);

//   // Get unique cities from pakistanCities
//   const cities = pakistanCities
//     .filter(city => city.isActive)
//     .map(city => city.name)
//     .sort((a, b) => a.localeCompare(b));

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="card p-6"
//     >
//       <div className="flex items-center mb-6">
//         <MapPin className="h-6 w-6 text-primary-600 mr-2" />
//         <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
//       </div>

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         {/* Full Name */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Full Name <span className="text-red-500">*</span>
//           </label>
//           <div className="relative">
//             <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//             <input
//               type="text"
//               {...register('fullName')}
//               className="input-field pl-10"
//               placeholder="John Doe"
//             />
//           </div>
//           {errors.fullName && (
//             <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
//           )}
//         </div>

//         {/* Hidden name field (same as fullName for backend) */}
//         <input type="hidden" {...register('name')} />

//         {/* Address Type */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Address Type <span className="text-red-500">*</span>
//           </label>
//           <div className="flex space-x-4">
//             <label className="flex items-center">
//               <input
//                 type="radio"
//                 value="home"
//                 {...register('type')}
//                 className="mr-2"
//               />
//               <Home className="h-4 w-4 mr-1" />
//               Home
//             </label>
//             <label className="flex items-center">
//               <input
//                 type="radio"
//                 value="office"
//                 {...register('type')}
//                 className="mr-2"
//               />
//               <Building className="h-4 w-4 mr-1" />
//               Office
//             </label>
//             <label className="flex items-center">
//               <input
//                 type="radio"
//                 value="other"
//                 {...register('type')}
//                 className="mr-2"
//               />
//               Other
//             </label>
//           </div>
//           {errors.type && (
//             <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
//           )}
//         </div>

//         {/* Street Address */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Street Address <span className="text-red-500">*</span>
//           </label>
//           <div className="relative">
//             <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//             <textarea
//               {...register('address')}
//               className="input-field pl-10 min-h-[100px] resize-none"
//               placeholder="House #, Street, Area"
//               rows={3}
//             />
//           </div>
//           {errors.address && (
//             <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
//           )}
//         </div>

//         {/* City */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             City <span className="text-red-500">*</span>
//           </label>
//           <div className="relative">
//             <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//             <select
//               {...register('city')}
//               className="input-field pl-10"
//             >
//               <option value="">Select City</option>
//               {cities.map((city) => (
//                 <option key={city} value={city}>
//                   {city}
//                 </option>
//               ))}
//             </select>
//           </div>
//           {errors.city && (
//             <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
//           )}
//         </div>

//         {/* Province (hidden - auto-filled) */}
//         <input type="hidden" {...register('province')} />
//         {errors.province && (
//           <p className="mt-1 text-sm text-red-600">{errors.province.message}</p>
//         )}

//         {/* Postal Code and Phone */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Postal Code */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Postal Code (Optional)
//             </label>
//             <input
//               type="text"
//               {...register('postalCode')}
//               className="input-field"
//               placeholder="54000"
//               maxLength={5}
//             />
//             {errors.postalCode && (
//               <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
//             )}
//           </div>

//           {/* Phone Number */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Phone Number <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
//               <input
//                 type="tel"
//                 {...register('phone')}
//                 className="input-field pl-10"
//                 placeholder="03XXXXXXXXX"
//               />
//             </div>
//             {errors.phone && (
//               <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
//             )}
//           </div>
//         </div>

//         {/* Default Address Toggle */}
//         <div className="flex items-center">
//           <input
//             type="checkbox"
//             id="isDefault"
//             {...register('isDefault')}
//             className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
//           />
//           <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
//             Set as default shipping address
//           </label>
//         </div>

//         {/* Submit Button */}
//         <div className="flex justify-end pt-4 border-t border-gray-200">
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="btn-primary px-8 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? (
//               <span className="flex items-center">
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                 Saving...
//               </span>
//             ) : (
//               <span className="flex items-center">
//                 <Check className="h-5 w-5 mr-2" />
//                 Save Address
//               </span>
//             )}
//           </button>
//         </div>
//       </form>

//       {/* Shipping Estimate */}
//       {watch('city') && (
//         <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
//           <h3 className="font-medium text-blue-900 mb-2">Shipping Estimate</h3>
//           <p className="text-sm text-blue-800">
//             Delivery to {watch('city')}: 3-5 business days
//             <br />
//             Estimated shipping cost: PKR 200 (FREE on orders above PKR 5,000)
//           </p>
//         </div>
//       )}
//     </motion.div>
//   )
// }

// export default AddressForm

//after deployment

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { MapPin, User, Home, Phone, Check, Building } from 'lucide-react'
import { pakistanCities } from '../../utils/pakistanCities'

// ✅ FIXED: Updated schema to match what the backend actually expects
const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  // Remove 'name' field as it's not needed - we'll use fullName for both
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(1, 'Please select a city'),
  // Province will be auto-set from city selection
  postalCode: z.string().optional().or(z.literal('')),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9+\-\s]+$/, 'Please enter a valid phone number'),
  type: z.enum(['home', 'office', 'other']).default('home'),
  isDefault: z.boolean().optional().default(false),
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddressFormProps {
  onSubmit: (data: any) => void
  initialData?: any
  isSubmitting?: boolean
  onCancel?: () => void
}

const AddressForm: React.FC<AddressFormProps> = ({ 
  onSubmit, 
  initialData, 
  isSubmitting = false,
  onCancel 
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: initialData?.fullName || initialData?.name || '',
      address: initialData?.address || '',
      city: initialData?.city || '',
      postalCode: initialData?.postalCode || '',
      phone: initialData?.phone || '',
      type: initialData?.type || 'home',
      isDefault: initialData?.isDefault || false,
    },
  })

  // Auto-set province when city is selected (for display only)
  const selectedCity = watch('city');
  
  // Get province for selected city (for display purposes)
  const getProvinceForCity = (city: string): string => {
    const cityData = pakistanCities.find(c => c.name === city);
    return cityData?.province || '';
  };

  // Get unique cities from pakistanCities
  const cities = pakistanCities
    .filter(city => city.isActive)
    .map(city => city.name)
    .sort((a, b) => a.localeCompare(b));

  // Handle form submission
  const onFormSubmit = (data: AddressFormData) => {
    // Find province from selected city
    const cityData = pakistanCities.find(c => c.name === data.city);
    
    if (!cityData) {
      // This should not happen if city is selected from dropdown
      return;
    }

    // Transform data to match what backend expects
    const addressData = {
      fullName: data.fullName,
      name: data.fullName, // Backend requires both
      address: data.address,
      city: data.city,
      province: cityData.province,
      postalCode: data.postalCode || '',
      country: 'Pakistan',
      phone: data.phone.replace(/\D/g, ''), // Remove non-digits for backend
      type: data.type,
      isDefault: data.isDefault || false
    };

    onSubmit(addressData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center mb-6">
        <MapPin className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Add Shipping Address</h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              {...register('fullName')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="John Doe"
              disabled={isSubmitting}
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        {/* Address Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address Type <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="home"
                {...register('type')}
                className="mr-2"
                disabled={isSubmitting}
              />
              <Home className="h-4 w-4 mr-1" />
              Home
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="office"
                {...register('type')}
                className="mr-2"
                disabled={isSubmitting}
              />
              <Building className="h-4 w-4 mr-1" />
              Office
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="other"
                {...register('type')}
                className="mr-2"
                disabled={isSubmitting}
              />
              Other
            </label>
          </div>
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              {...register('address')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all min-h-[80px] resize-none"
              placeholder="House #, Street, Area"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
            <select
              {...register('city')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
              disabled={isSubmitting}
            >
              <option value="">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city} {getProvinceForCity(city) && `(${getProvinceForCity(city)})`}
                </option>
              ))}
            </select>
          </div>
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        {/* Province Display (read-only) */}
        {selectedCity && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Province:</span> {getProvinceForCity(selectedCity)}
            </p>
          </div>
        )}

        {/* Postal Code and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code (Optional)
            </label>
            <input
              type="text"
              {...register('postalCode')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="54000"
              maxLength={5}
              disabled={isSubmitting}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                {...register('phone')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="03XXXXXXXXX"
                disabled={isSubmitting}
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Default Address Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isDefault"
            {...register('isDefault')}
            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
            disabled={isSubmitting}
          />
          <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
            Set as default shipping address
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Address
              </>
            )}
          </button>
        </div>
      </form>

      {/* Shipping Estimate */}
      {selectedCity && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            Shipping Estimate
          </h3>
          <p className="text-sm text-blue-800">
            Delivery to <span className="font-semibold">{selectedCity}</span>: 3-5 business days
            <br />
            <span className="text-xs">Estimated shipping cost: PKR 200 (FREE on orders above PKR 5,000)</span>
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default AddressForm
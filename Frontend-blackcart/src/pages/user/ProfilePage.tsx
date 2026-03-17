

// src/pages/profile/ProfilePage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Shield, ShoppingBag, Heart, 
  Settings, LogOut, Edit, Save, X, Camera, Plus, Trash2,
  Check, Loader, Key, AlertCircle, Star, ChevronRight,
  Bell, Globe, Lock, Moon, Sun, Clock, DollarSign, Package,
  Home, Map, Building, Volume2, VolumeX, Mail as MailIcon,
  Smartphone, Eye, EyeOff, Award, Zap, RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService } from '../../services/userService'
import { adminService } from '../../services/adminServiceMethods'
import toast from 'react-hot-toast'
import PrivateRoute from '../../components/common/PrivateRoute'
import { getAvatarUrl, getUserInitials, getUserColor, getInitialsBgColor } from '../../utils/avatarUtils'
import { formatPrice } from '../../utils/formatPrice'
import { formatDate } from '../../utils/dateFormatter'
import ChangePasswordModal from '../../components/auth/ChangePasswordModal'
import AddressFormModal from '../../components/address/AddressFormModal'
import { applyTheme, loadTheme, defaultTheme } from '../../utils/themeUtils'

// Profile schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional().nullable(),
})

type ProfileFormData = z.infer<typeof profileSchema>

// Address schema
const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(2, 'Postal code is required'),
  country: z.string().min(2, 'Country is required').default('Pakistan'),
  phone: z.string().min(10, 'Valid phone number is required'),
  isDefault: z.boolean().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface Address {
  _id: string
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
  phone: string
  isDefault: boolean
}

interface Order {
  _id: string
  invoiceNumber?: string
  orderStatus: string
  totalPrice: number
  createdAt: string
  orderItems: any[]
}

interface WishlistItem {
  _id: string
  product: {
    _id: string
    name: string
    price: number
    discountPrice?: number
    images?: string[]
  }
  addedAt: string
}

interface NotificationSettings {
  orderUpdates: boolean
  promotions: boolean
  recommendations: boolean
  emailNotifications: boolean
  smsNotifications: boolean
}

interface PrivacySettings {
  publicProfile: boolean
  showOrderHistory: boolean
  shareEmail: boolean
}

interface ThemeSettings {
  darkMode: boolean
  compactView: boolean
  reducedMotion: boolean
  highContrast: boolean
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: false,
    recommendations: true,
    emailNotifications: true,
    smsNotifications: false,
  })
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    publicProfile: false,
    showOrderHistory: true,
    shareEmail: false,
  })
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultTheme)
  const [globalSettings, setGlobalSettings] = useState<any>(null)
  const [settingsLoading, setSettingsLoading] = useState<Record<string, boolean>>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  // Fetch global settings from admin
  const { data: settingsData } = useQuery({
    queryKey: ['globalSettings'],
    queryFn: async () => {
      try {
        const response = await adminService.getSettings()
        return response.data
      } catch (error) {
        console.log('Global settings not available')
        return null
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (settingsData) {
      setGlobalSettings(settingsData)
    }
  }, [settingsData])

  // Fetch user profile
  const { data: userData, isLoading: profileLoading, refetch: refetchProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const data = await userService.getProfile()
        return data
      } catch (error) {
        console.error('Error fetching profile:', error)
        return user
      }
    },
    enabled: !!user,
  })

  // Fetch addresses
  const { data: addressesData, isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: async () => {
      try {
        const data = await userService.getAddresses()
        return Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error fetching addresses:', error)
        return []
      }
    },
    enabled: !!user,
  })

  // Fetch orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['userOrders', { limit: 5 }],
    queryFn: async () => {
      try {
        const response = await userService.getOrders({ limit: 5 })
        if (response?.data?.orders) {
          return { orders: response.data.orders }
        } else if (response?.orders) {
          return { orders: response.orders }
        } else if (Array.isArray(response)) {
          return { orders: response }
        }
        return { orders: [] }
      } catch (error) {
        console.error('Error fetching orders:', error)
        return { orders: [] }
      }
    },
    enabled: !!user,
  })

  // Fetch wishlist
  const { data: wishlistData, isLoading: wishlistLoading, refetch: refetchWishlist } = useQuery({
    queryKey: ['userWishlist'],
    queryFn: async () => {
      try {
        const response = await userService.getWishlist()
        return response
      } catch (error) {
        console.error('Error fetching wishlist:', error)
        return { items: [] }
      }
    },
    enabled: !!user,
  })

  // Fetch user settings
  const { data: userSettingsData, isLoading: userSettingsLoading, refetch: refetchUserSettings } = useQuery({
    queryKey: ['userSettings'],
    queryFn: async () => {
      try {
        const data = await userService.getSettings()
        return data
      } catch (error) {
        console.error('Error fetching user settings:', error)
        return null
      }
    },
    enabled: !!user,
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormData) => userService.updateProfile(data),
    onSuccess: (data) => {
      toast.success('Profile updated successfully')
      updateProfile(data)
      setIsEditing(false)
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile')
    },
  })

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(file),
    onSuccess: (data) => {
      toast.success('Avatar updated successfully')
      if (data.avatarUrl) {
        updateProfile({ avatar: data.avatarUrl })
      }
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
      setAvatarError(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload avatar')
    },
  })

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: (data: AddressFormData) => userService.addAddress(data),
    onSuccess: () => {
      toast.success('Address added successfully')
      setShowAddressModal(false)
      refetchAddresses()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add address')
    },
  })

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressFormData> }) => 
      userService.updateAddress(id, data),
    onSuccess: () => {
      toast.success('Address updated successfully')
      setShowAddressModal(false)
      setSelectedAddress(null)
      refetchAddresses()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update address')
    },
  })

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: (id: string) => userService.deleteAddress(id),
    onSuccess: () => {
      toast.success('Address deleted successfully')
      refetchAddresses()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete address')
    },
  })

  // Set default address mutation
  const setDefaultAddressMutation = useMutation({
    mutationFn: (id: string) => userService.setDefaultAddress(id),
    onSuccess: () => {
      toast.success('Default address updated')
      refetchAddresses()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to set default address')
    },
  })

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: (settings: any) => userService.updateSettings(settings),
    onSuccess: (data) => {
      toast.success('Settings updated successfully')
      queryClient.invalidateQueries({ queryKey: ['userSettings'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    },
  })

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: (productId: string) => userService.removeFromWishlist(productId),
    onSuccess: () => {
      toast.success('Item removed from wishlist')
      refetchWishlist()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove item')
    },
  })

  // Move to cart mutation
  const moveToCartMutation = useMutation({
    mutationFn: (productId?: string) => userService.moveToCart(productId),
    onSuccess: () => {
      toast.success('Item moved to cart')
      refetchWishlist()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to move item to cart')
    },
  })

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: (password: string) => userService.deleteAccount(password),
    onSuccess: () => {
      toast.success('Account deleted successfully')
      logout()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData?.name || user?.name || '',
      email: userData?.email || user?.email || '',
      phone: userData?.phone || user?.phone || '',
    },
  })

  useEffect(() => {
    if (userData) {
      setValue('name', userData.name || '')
      setValue('email', userData.email || '')
      setValue('phone', userData.phone || '')
    }
  }, [userData, setValue])

  // Load user settings when data is fetched
  useEffect(() => {
    if (userSettingsData) {
      setNotificationSettings(prev => ({
        ...prev,
        ...(userSettingsData.notifications || {})
      }))
      setPrivacySettings(prev => ({
        ...prev,
        ...(userSettingsData.privacy || {})
      }))
      setThemeSettings(prev => ({
        ...prev,
        ...(userSettingsData.theme || {})
      }))
    }
  }, [userSettingsData])

  // ✅ SIMPLIFIED: Apply theme settings to document
  useEffect(() => {
    applyTheme(themeSettings)
  }, [themeSettings])

  // ✅ SIMPLIFIED: Load theme from localStorage on initial mount
  useEffect(() => {
    const savedTheme = loadTheme()
    if (savedTheme) {
      setThemeSettings(savedTheme)
    }
  }, [])

  const onSubmit = async (data: ProfileFormData) => {
    await updateProfileMutation.mutateAsync(data)
  }

  const handleEditToggle = () => {
    if (isEditing) {
      reset({
        name: userData?.name || user?.name || '',
        email: userData?.email || user?.email || '',
        phone: userData?.phone || user?.phone || '',
      })
    }
    setIsEditing(!isEditing)
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout()
      toast.success('Logged out successfully')
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingAvatar(true)
    try {
      await uploadAvatarMutation.mutateAsync(file)
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleAddressSubmit = async (data: AddressFormData) => {
    if (selectedAddress) {
      await updateAddressMutation.mutateAsync({ id: selectedAddress._id, data })
    } else {
      await addAddressMutation.mutateAsync(data)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await deleteAddressMutation.mutateAsync(id)
    }
  }

  const handleSetDefaultAddress = async (id: string) => {
    await setDefaultAddressMutation.mutateAsync(id)
  }

  const handleSettingChange = async (
    type: 'notifications' | 'privacy' | 'theme',
    key: string,
    value: any
  ) => {
    // Set loading state for this specific setting
    setSettingsLoading(prev => ({ ...prev, [`${type}.${key}`]: true }))
    
    let newSettings: any = {}
    let updatedSettings: any = {}
    
    if (type === 'notifications') {
      const updated = { ...notificationSettings, [key]: value }
      setNotificationSettings(updated)
      newSettings = { notifications: updated }
      updatedSettings = updated
    } else if (type === 'privacy') {
      const updated = { ...privacySettings, [key]: value }
      setPrivacySettings(updated)
      newSettings = { privacy: updated }
      updatedSettings = updated
    } else if (type === 'theme') {
      const updated = { ...themeSettings, [key]: value }
      setThemeSettings(updated)
      newSettings = { theme: updated }
      updatedSettings = updated
    }
    
    try {
      await updateSettingsMutation.mutateAsync(newSettings)
      
      // Show specific success message based on the setting
      if (type === 'theme') {
        if (key === 'darkMode') {
          toast.success(value ? 'Dark mode enabled' : 'Light mode enabled', { icon: value ? '🌙' : '☀️' })
        } else if (key === 'compactView') {
          toast.success(value ? 'Compact view enabled' : 'Normal view enabled')
        } else if (key === 'reducedMotion') {
          toast.success(value ? 'Reduced motion enabled' : 'Animations enabled')
        } else if (key === 'highContrast') {
          toast.success(value ? 'High contrast mode enabled' : 'Normal contrast restored')
        }
      }
    } catch (error) {
      // Revert local state if API call fails
      if (type === 'notifications') {
        setNotificationSettings(prev => ({ ...prev, [key]: !value }))
      } else if (type === 'privacy') {
        setPrivacySettings(prev => ({ ...prev, [key]: !value }))
      } else if (type === 'theme') {
        setThemeSettings(prev => ({ ...prev, [key]: !value }))
      }
    } finally {
      setSettingsLoading(prev => ({ ...prev, [`${type}.${key}`]: false }))
    }
  }

  const handleDeleteAccount = async () => {
    const password = window.prompt('Please enter your password to confirm account deletion:')
    if (!password) return
    
    if (window.confirm('⚠️ WARNING: This action is permanent and cannot be undone. All your data will be permanently deleted. Are you absolutely sure?')) {
      await deleteAccountMutation.mutateAsync(password)
    }
  }

  const displayUser = userData || user
  const avatarUrl = getAvatarUrl(displayUser)
  const userInitials = getUserInitials(displayUser?.name || '')
  const userColor = getUserColor(displayUser?._id, displayUser?.name)

  const addresses: Address[] = Array.isArray(addressesData) ? addressesData : []
  const orders: Order[] = ordersData?.orders || []
  
  // Normalize wishlist data
  const wishlistItems: WishlistItem[] = 
    wishlistData?.data?.items || 
    wishlistData?.items || 
    wishlistData?.products?.map((p: any) => ({ product: p, _id: p._id })) || 
    []

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const isLoading = profileLoading || addressesLoading || ordersLoading || wishlistLoading || userSettingsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Toggle component for consistent styling
  const Toggle = ({ 
    checked, 
    onChange, 
    label, 
    description,
    loading 
  }: { 
    checked: boolean; 
    onChange: () => void; 
    label: string; 
    description?: string;
    loading?: boolean;
  }) => (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        type="button"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="h-3 w-3 text-white animate-spin" />
          </span>
        )}
      </button>
    </div>
  )

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-24 transition-all duration-300 ${
                  themeSettings.compactView ? 'p-4' : 'p-6'
                }`}
              >
                {/* Avatar Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div 
                      className={`rounded-full overflow-hidden cursor-pointer group ${
                        themeSettings.compactView ? 'w-20 h-20' : 'w-24 h-24'
                      } ${userColor}`}
                      onClick={handleAvatarClick}
                    >
                      {avatarUrl && !avatarError ? (
                        <img
                          src={avatarUrl}
                          alt={displayUser?.name || 'User'}
                          className="w-full h-full object-cover group-hover:opacity-75 transition-opacity"
                          onError={() => {
                            console.error('Failed to load avatar:', avatarUrl)
                            setAvatarError(true)
                          }}
                          onLoad={() => setAvatarError(false)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900">
                          <span className={`font-bold text-primary-600 dark:text-primary-300 ${
                            themeSettings.compactView ? 'text-xl' : 'text-2xl'
                          }`}>
                            {userInitials}
                          </span>
                        </div>
                      )}
                      
                      {/* Upload overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploadingAvatar ? (
                          <Loader className="h-6 w-6 text-white animate-spin" />
                        ) : (
                          <Camera className="h-6 w-6 text-white" />
                        )}
                      </div>
                    </div>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  <h2 className={`font-bold text-gray-900 dark:text-white ${
                    themeSettings.compactView ? 'text-lg' : 'text-xl'
                  }`}>
                    {displayUser?.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{displayUser?.email}</p>
                  
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    {displayUser?.emailVerified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </span>
                    )}
                    {displayUser?.googleId && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        Google
                      </span>
                    )}
                  </div>
                </div>

                {/* Navigation Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900 dark:text-primary-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        } ${themeSettings.compactView ? 'py-2' : 'py-3'}`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                        {tab.id === 'orders' && orders.length > 0 && (
                          <span className="ml-auto bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                            {orders.length}
                          </span>
                        )}
                        {tab.id === 'wishlist' && wishlistItems.length > 0 && (
                          <span className="ml-auto bg-primary-100 text-primary-600 text-xs px-2 py-1 rounded-full">
                            {wishlistItems.length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                  
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <Key className="h-5 w-5" />
                    <span className="font-medium">Change Password</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </nav>

                {/* Account Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className={`font-bold text-gray-900 dark:text-white ${
                        themeSettings.compactView ? 'text-xl' : 'text-2xl'
                      }`}>
                        {orders.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                    </div>
                    <div>
                      <p className={`font-bold text-gray-900 dark:text-white ${
                        themeSettings.compactView ? 'text-xl' : 'text-2xl'
                      }`}>
                        {addresses.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Addresses</p>
                    </div>
                    <div>
                      <p className={`font-bold text-gray-900 dark:text-white ${
                        themeSettings.compactView ? 'text-xl' : 'text-2xl'
                      }`}>
                        {wishlistItems.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Wishlist</p>
                    </div>
                  </div>
                </div>

                {/* Global Store Info */}
                {globalSettings && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      Store: {globalSettings.general?.storeName || 'BlackCart Store'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Currency: {globalSettings.general?.storeCurrency || 'PKR'}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              <AnimatePresence mode="wait">
                {/* Profile Section */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${
                      themeSettings.compactView ? 'p-4' : 'p-6'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`font-bold text-gray-900 dark:text-white ${
                        themeSettings.compactView ? 'text-xl' : 'text-2xl'
                      }`}>
                        Profile Information
                      </h2>
                      <button
                        onClick={handleEditToggle}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          isEditing
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                        } ${themeSettings.compactView ? 'px-3 py-1 text-sm' : 'px-4 py-2'}`}
                      >
                        {isEditing ? (
                          <>
                            <X className="h-4 w-4" />
                            <span>Cancel</span>
                          </>
                        ) : (
                          <>
                            <Edit className="h-4 w-4" />
                            <span>Edit Profile</span>
                          </>
                        )}
                      </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              {...register('name')}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="Your full name"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <User className="h-5 w-5 text-gray-400" />
                              <span className="font-medium text-gray-900 dark:text-white">{displayUser?.name}</span>
                            </div>
                          )}
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email Address
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              {...register('email')}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              placeholder="you@example.com"
                            />
                          ) : (
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Mail className="h-5 w-5 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{displayUser?.email}</span>
                              {displayUser?.emailVerified && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          )}
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            {...register('phone')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="+92 300 1234567"
                          />
                        ) : (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-900 dark:text-white">{displayUser?.phone || 'Not provided'}</span>
                          </div>
                        )}
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                        )}
                      </div>

                      {/* Save Button */}
                      {isEditing && (
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                            <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                          </button>
                        </div>
                      )}
                    </form>
                  </motion.div>
                )}

                {/* Orders Section */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${
                      themeSettings.compactView ? 'p-4' : 'p-6'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`font-bold text-gray-900 dark:text-white ${
                        themeSettings.compactView ? 'text-xl' : 'text-2xl'
                      }`}>
                        My Orders
                      </h2>
                      <a href="/orders" className="text-primary-600 hover:text-primary-700 font-medium flex items-center text-sm">
                        View All
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </a>
                    </div>

                    {orders.length > 0 ? (
                      <div className="space-y-4">
                        {orders.slice(0, 5).map((order) => (
                          <a
                            key={order._id}
                            href={`/orders/${order._id}`}
                            className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {order.invoiceNumber || `#${order._id.slice(-8).toUpperCase()}`}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {formatDate(order.createdAt)} • {order.orderItems?.length || 0} items
                                </p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                  order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                  order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {order.orderStatus}
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                  {formatPrice(order.totalPrice)}
                                </span>
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't placed any orders yet</p>
                        <a href="/products" className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                          Start Shopping
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Wishlist Section */}
                {activeTab === 'wishlist' && (
                  <motion.div
                    key="wishlist"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${
                      themeSettings.compactView ? 'p-4' : 'p-6'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`font-bold text-gray-900 dark:text-white ${
                        themeSettings.compactView ? 'text-xl' : 'text-2xl'
                      }`}>
                        My Wishlist
                      </h2>
                      {wishlistItems.length > 0 && (
                        <button
                          onClick={() => moveToCartMutation.mutateAsync()}
                          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                          disabled={moveToCartMutation.isPending}
                        >
                          {moveToCartMutation.isPending ? 'Moving...' : 'Move All to Cart'}
                        </button>
                      )}
                    </div>

                    {wishlistItems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wishlistItems.slice(0, 4).map((item) => {
                          const product = item.product || item
                          return (
                            <div
                              key={item._id || product._id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary-500 transition-all"
                            >
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={product.images?.[0] || '/placeholder-image.jpg'}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder-image.jpg'
                                    }}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2">
                                    {product.name}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {formatPrice(product.discountPrice || product.price)}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => moveToCartMutation.mutateAsync(product._id)}
                                      className="text-xs bg-primary-50 text-primary-600 px-2 py-1 rounded hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-200"
                                      disabled={moveToCartMutation.isPending}
                                    >
                                      Move to Cart
                                    </button>
                                    <button
                                      onClick={() => removeFromWishlistMutation.mutateAsync(product._id)}
                                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                                      disabled={removeFromWishlistMutation.isPending}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Your wishlist is empty</p>
                        <a href="/products" className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                          Browse Products
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Addresses Section */}
                {activeTab === 'addresses' && (
                  <motion.div
                    key="addresses"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${
                      themeSettings.compactView ? 'p-4' : 'p-6'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className={`font-bold text-gray-900 dark:text-white ${
                        themeSettings.compactView ? 'text-xl' : 'text-2xl'
                      }`}>
                        Shipping Addresses
                      </h2>
                      <button
                        onClick={() => {
                          setSelectedAddress(null)
                          setShowAddressModal(true)
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add New</span>
                      </button>
                    </div>

                    {addresses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <div
                            key={address._id}
                            className={`border rounded-lg p-4 transition-all ${
                              address.isDefault
                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <MapPin className={`h-5 w-5 ${
                                  address.isDefault ? 'text-primary-600' : 'text-gray-400'
                                }`} />
                                <h3 className="font-medium text-gray-900 dark:text-white">{address.fullName}</h3>
                              </div>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => {
                                    setSelectedAddress(address)
                                    setShowAddressModal(true)
                                  }}
                                  className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                  title="Edit address"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                {!address.isDefault && (
                                  <button
                                    onClick={() => handleDeleteAddress(address._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title="Delete address"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{address.address}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {address.city}, {address.country} {address.postalCode}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{address.phone}</p>
                            
                            <div className="flex items-center justify-between">
                              {address.isDefault ? (
                                <span className="inline-flex items-center text-xs text-primary-600">
                                  <Check className="h-3 w-3 mr-1" />
                                  Default Address
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetDefaultAddress(address._id)}
                                  className="text-xs text-gray-500 hover:text-primary-600"
                                  disabled={setDefaultAddressMutation.isPending}
                                >
                                  Set as Default
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No addresses saved yet</p>
                        <button
                          onClick={() => setShowAddressModal(true)}
                          className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Add Your First Address
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Settings Section */}
                {activeTab === 'settings' && (
                  <motion.div
                    key="settings"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 ${
                      themeSettings.compactView ? 'p-4' : 'p-6'
                    }`}
                  >
                    <h2 className={`font-bold text-gray-900 dark:text-white mb-6 ${
                      themeSettings.compactView ? 'text-xl' : 'text-2xl'
                    }`}>
                      Account Settings
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Email Notifications */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-5 w-5 text-primary-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <Toggle
                            checked={notificationSettings.orderUpdates}
                            onChange={() => handleSettingChange('notifications', 'orderUpdates', !notificationSettings.orderUpdates)}
                            label="Order updates"
                            description="Get notified when your order status changes"
                            loading={settingsLoading[`notifications.orderUpdates`]}
                          />
                          <Toggle
                            checked={notificationSettings.promotions}
                            onChange={() => handleSettingChange('notifications', 'promotions', !notificationSettings.promotions)}
                            label="Promotions and offers"
                            description="Receive special deals and promotional offers"
                            loading={settingsLoading[`notifications.promotions`]}
                          />
                          <Toggle
                            checked={notificationSettings.recommendations}
                            onChange={() => handleSettingChange('notifications', 'recommendations', !notificationSettings.recommendations)}
                            label="Product recommendations"
                            description="Get personalized product suggestions"
                            loading={settingsLoading[`notifications.recommendations`]}
                          />
                        </div>
                      </div>

                      {/* Notification Channels */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-5 w-5 text-primary-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Notification Channels</h3>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <Toggle
                            checked={notificationSettings.emailNotifications}
                            onChange={() => handleSettingChange('notifications', 'emailNotifications', !notificationSettings.emailNotifications)}
                            label="Email notifications"
                            description="Receive notifications via email"
                            loading={settingsLoading[`notifications.emailNotifications`]}
                          />
                          <Toggle
                            checked={notificationSettings.smsNotifications}
                            onChange={() => handleSettingChange('notifications', 'smsNotifications', !notificationSettings.smsNotifications)}
                            label="SMS notifications"
                            description="Get text messages for important updates"
                            loading={settingsLoading[`notifications.smsNotifications`]}
                          />
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            <Lock className="h-5 w-5 text-primary-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Privacy</h3>
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                          <Toggle
                            checked={privacySettings.publicProfile}
                            onChange={() => handleSettingChange('privacy', 'publicProfile', !privacySettings.publicProfile)}
                            label="Make my profile public"
                            description="Allow others to see your profile information"
                            loading={settingsLoading[`privacy.publicProfile`]}
                          />
                          <Toggle
                            checked={privacySettings.showOrderHistory}
                            onChange={() => handleSettingChange('privacy', 'showOrderHistory', !privacySettings.showOrderHistory)}
                            label="Show my order history"
                            description="Display your past orders on your profile"
                            loading={settingsLoading[`privacy.showOrderHistory`]}
                          />
                          <Toggle
                            checked={privacySettings.shareEmail}
                            onChange={() => handleSettingChange('privacy', 'shareEmail', !privacySettings.shareEmail)}
                            label="Share email with partners"
                            description="Allow trusted partners to contact you"
                            loading={settingsLoading[`privacy.shareEmail`]}
                          />
                        </div>
                      </div>

                      {/* Appearance Settings */}
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                          <div className="flex items-center space-x-2">
                            <Sun className="h-5 w-5 text-primary-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Appearance</h3>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {themeSettings.darkMode ? 'Dark mode active' : 'Light mode active'} • 
                            {themeSettings.compactView ? ' Compact view' : ' Normal view'}
                          </p>
                        </div>
                        <div className="p-4 space-y-2">
                          <Toggle
                            checked={themeSettings.darkMode}
                            onChange={() => handleSettingChange('theme', 'darkMode', !themeSettings.darkMode)}
                            label="Dark mode"
                            description="Switch between light and dark theme"
                            loading={settingsLoading[`theme.darkMode`]}
                          />
                          <Toggle
                            checked={themeSettings.compactView}
                            onChange={() => handleSettingChange('theme', 'compactView', !themeSettings.compactView)}
                            label="Compact view"
                            description="Reduce spacing for a denser layout"
                            loading={settingsLoading[`theme.compactView`]}
                          />
                          <Toggle
                            checked={themeSettings.reducedMotion}
                            onChange={() => handleSettingChange('theme', 'reducedMotion', !themeSettings.reducedMotion)}
                            label="Reduced motion"
                            description="Minimize animations for better accessibility"
                            loading={settingsLoading[`theme.reducedMotion`]}
                          />
                          <Toggle
                            checked={themeSettings.highContrast}
                            onChange={() => handleSettingChange('theme', 'highContrast', !themeSettings.highContrast)}
                            label="High contrast"
                            description="Increase contrast for better visibility"
                            loading={settingsLoading[`theme.highContrast`]}
                          />
                        </div>
                      </div>

                      {/* Store Information (from admin settings) */}
                      {globalSettings && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                          <div className="flex items-center space-x-2 mb-4">
                            <Package className="h-5 w-5 text-primary-600" />
                            <h3 className="font-medium text-gray-900 dark:text-white">Store Information</h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Store Name</p>
                              <p className="font-medium text-gray-900 dark:text-white">{globalSettings.general?.storeName || 'BlackCart Store'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Currency</p>
                              <p className="font-medium text-gray-900 dark:text-white">{globalSettings.general?.storeCurrency || 'PKR'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Free Shipping</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {globalSettings.shipping?.freeShippingThreshold 
                                  ? `Above ${formatPrice(globalSettings.shipping.freeShippingThreshold)}`
                                  : 'Not available'}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 dark:text-gray-400">Return Policy</p>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {globalSettings.shipping?.returnPolicyDays || 14} days
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Danger Zone */}
                      <div className="border border-red-200 dark:border-red-900 rounded-lg overflow-hidden">
                        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-3 border-b border-red-200 dark:border-red-800">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <h3 className="font-medium text-red-600 dark:text-red-400">Danger Zone</h3>
                          </div>
                        </div>
                        <div className="p-4">
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteAccountMutation.isPending}
                            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
                          >
                            {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete Account'}
                          </button>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                            Once you delete your account, all your orders, addresses, and personal data will be permanently removed. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <AddressFormModal
          isOpen={showAddressModal}
          onClose={() => {
            setShowAddressModal(false)
            setSelectedAddress(null)
          }}
          address={selectedAddress}
          onSubmit={handleAddressSubmit}
          isLoading={addAddressMutation.isPending || updateAddressMutation.isPending}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </PrivateRoute>
  )
}

export default ProfilePage
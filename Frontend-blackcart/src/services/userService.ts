

// src/services/userService.ts
import api from './api'
import { User, ShippingAddress } from '../types'

// Define response types for better type safety
interface WishlistResponse {
  success: boolean
  message?: string
  data?: {
    items?: Array<{
      _id: string
      product: any
      addedAt: string
    }>
    products?: any[]
  }
  items?: any[]
  products?: any[]
}

interface ApiResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: any
  config: any
}

// User settings interface
export interface UserSettings {
  notifications: {
    orderUpdates: boolean
    promotions: boolean
    recommendations: boolean
    emailNotifications: boolean
    smsNotifications: boolean
  }
  privacy: {
    publicProfile: boolean
    showOrderHistory: boolean
    shareEmail: boolean
  }
  theme: {
    darkMode: boolean
    compactView: boolean
    reducedMotion?: boolean
    highContrast?: boolean
  }
}

export const userService = {
  // Get user profile
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/profile')
      return response.data.data || response.data.user || response.data
    } catch (error: any) {
      console.error('Get profile error:', error)
      throw error
    }
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await api.put('/users/profile', data)
      return response.data.data || response.data.user || response.data
    } catch (error: any) {
      console.error('Update profile error:', error)
      throw error
    }
  },

  // Get addresses
  getAddresses: async (): Promise<ShippingAddress[]> => {
    try {
      const response = await api.get('/addresses')
      return response.data.data || response.data.addresses || response.data || []
    } catch (error: any) {
      console.error('Get addresses error:', error)
      return [] // Return empty array on error
    }
  },

  // Add address
  addAddress: async (address: Omit<ShippingAddress, '_id' | 'isDefault'>): Promise<ShippingAddress> => {
    try {
      const response = await api.post('/addresses', address)
      return response.data.data || response.data.address || response.data
    } catch (error: any) {
      console.error('Add address error:', error)
      throw error
    }
  },

  // Update address
  updateAddress: async (addressId: string, address: Partial<ShippingAddress>): Promise<ShippingAddress> => {
    try {
      const response = await api.put(`/addresses/${addressId}`, address)
      return response.data.data || response.data.address || response.data
    } catch (error: any) {
      console.error('Update address error:', error)
      throw error
    }
  },

  // Delete address
  deleteAddress: async (addressId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/addresses/${addressId}`)
      return response.data
    } catch (error: any) {
      console.error('Delete address error:', error)
      throw error
    }
  },

  // Set default address
  setDefaultAddress: async (addressId: string): Promise<ShippingAddress> => {
    try {
      const response = await api.patch(`/addresses/${addressId}/default`)
      return response.data.data || response.data.address || response.data
    } catch (error: any) {
      console.error('Set default address error:', error)
      throw error
    }
  },

  // Get orders - FILTER OUT CANCELLED ORDERS
  getOrders: async (params?: { page?: number; limit?: number; status?: string }): Promise<{ orders: any[]; total: number }> => {
    try {
      const response = await api.get('/orders/my-orders', { params })
      
      // Handle different response structures
      let orders = []
      if (response.data.data?.orders) {
        orders = response.data.data.orders
      } else if (response.data.orders) {
        orders = response.data.orders
      } else if (Array.isArray(response.data)) {
        orders = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        orders = response.data.data
      }
      
      // FILTER OUT CANCELLED ORDERS
      const activeOrders = orders.filter((order: any) => 
        order.orderStatus !== 'cancelled' && 
        order.orderStatus !== 'canceled' &&
        order.status !== 'cancelled'
      )
      
      return {
        orders: activeOrders,
        total: activeOrders.length
      }
    } catch (error: any) {
      console.error('Get orders error:', error)
      return { orders: [], total: 0 }
    }
  },

  // Get wishlist
  getWishlist: async (): Promise<WishlistResponse> => {
    try {
      const response = await api.get('/users/wishlist')
      return response.data
    } catch (error: any) {
      console.error('Get wishlist error:', error)
      return { success: false, items: [] }
    }
  },

  // Add to wishlist
  addToWishlist: async (productId: string): Promise<WishlistResponse> => {
    try {
      const response = await api.post(`/users/wishlist/${productId}`)
      return response.data
    } catch (error: any) {
      console.error('Add to wishlist error:', error)
      throw error
    }
  },

  // Remove from wishlist
  removeFromWishlist: async (productId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/users/wishlist/${productId}`)
      return response.data
    } catch (error: any) {
      console.error('Remove from wishlist error:', error)
      throw error
    }
  },

  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    try {
      const response = await api.get('/users/settings')
      return response.data.data || response.data.settings || response.data
    } catch (error: any) {
      console.error('Get settings error, using defaults:', error)
      // Return default settings if endpoint fails
      return {
        notifications: {
          orderUpdates: true,
          promotions: false,
          recommendations: true,
          emailNotifications: true,
          smsNotifications: false,
        },
        privacy: {
          publicProfile: false,
          showOrderHistory: true,
          shareEmail: false,
        },
        theme: {
          darkMode: false,
          compactView: false,
        },
      }
    }
  },

  // Update settings
  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    try {
      const response = await api.put('/users/settings', settings)
      return response.data.data || response.data.settings || response.data
    } catch (error: any) {
      console.error('Update settings error:', error)
      throw error
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    try {
      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      })
      
      const avatarUrl = response.data.avatarUrl || 
                       response.data.data?.avatarUrl || 
                       response.data.url ||
                       response.data
      
      return { avatarUrl }
    } catch (error: any) {
      console.error('Upload avatar error:', error)
      throw new Error(error.response?.data?.message || 'Failed to upload avatar')
    }
  },

  // Move to cart
  moveToCart: async (productId?: string): Promise<{ success: boolean; message: string }> => {
    try {
      const url = productId 
        ? `/users/wishlist/${productId}/move-to-cart`
        : '/users/wishlist/move-all-to-cart'
      
      const response = await api.post(url)
      return response.data
    } catch (error: any) {
      console.error('Move to cart error:', error)
      throw error
    }
  },

  // ✅ ADD THIS: Delete account method
  deleteAccount: async (password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete('/users/account', {
        data: { password }
      })
      return response.data
    } catch (error: any) {
      console.error('Delete account error:', error)
      throw new Error(error.response?.data?.message || 'Failed to delete account')
    }
  },
}

export type UserService = typeof userService
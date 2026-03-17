// src/services/cartService.ts
import api from './api'  // Changed back to default import - make sure api.ts has export default
import { CartItem } from '../types'

export const cartService = {
  // Get user cart from server
  getCart: async () => {
    try {
      const response = await api.get('/cart')
      return response.data
    } catch (error: any) {
      // Handle 401 (unauthorized) gracefully
      if (error.response?.status === 401) {
        console.warn('User not authenticated, returning empty cart')
        return { data: [] }
      }
      throw error
    }
  },

  // Add item to cart
  addToCart: async (data: {
    productId: string;
    quantity: number;
    variant?: string;
  }) => {
    try {
      const response = await api.post('/cart', data)
      return response.data
    } catch (error: any) {
      // If 401, don't throw - just log and return success
      if (error.response?.status === 401) {
        console.warn('User not authenticated, skipping server cart update')
        return { data: { message: 'Cart updated locally only' } }
      }
      throw error
    }
  },

  // Remove item from cart
  removeFromCart: async (productId: string) => {
    try {
      const response = await api.delete(`/cart/${productId}`)
      return response.data
    } catch (error: any) {
      // If endpoint doesn't exist or 401, handle gracefully
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.warn('Cart remove endpoint not available or unauthorized')
        return { data: { message: 'Cart item removed locally' } }
      }
      throw error
    }
  },

  // Update item quantity in cart
  updateCartItem: async (productId: string, quantity: number) => {
    try {
      const response = await api.put(`/cart/${productId}`, { quantity })
      return response.data
    } catch (error: any) {
      // If endpoint doesn't exist or 401, handle gracefully
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.warn('Cart update endpoint not available or unauthorized')
        return { data: { message: 'Cart updated locally' } }
      }
      throw error
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart')
      return response.data
    } catch (error: any) {
      // If endpoint doesn't exist or 401, handle gracefully
      if (error.response?.status === 401 || error.response?.status === 404) {
        console.warn('Cart clear endpoint not available or unauthorized')
        return { data: { message: 'Cart cleared locally' } }
      }
      throw error
    }
  },

  // Sync cart with server - batch operation
  syncCart: async (cartItems: Array<{ productId: string; quantity: number }>) => {
    try {
      const response = await api.post('/cart/sync', { items: cartItems })
      return response.data
    } catch (error: any) {
      // If sync endpoint doesn't exist, handle gracefully
      if (error.response?.status === 404) {
        console.warn('Cart sync endpoint not available, using individual updates')
        
        // Fallback: Update each item individually
        try {
          // First clear the cart on server
          await api.delete('/cart').catch(() => {}) // Ignore errors
          
          // Then add each item
          for (const item of cartItems) {
            await api.post('/cart', item).catch(() => {}) // Ignore errors
          }
          
          return { data: { message: 'Cart synced via fallback method' } }
        } catch (fallbackError) {
          console.warn('Fallback sync also failed, cart is local only')
          return { data: { message: 'Cart synced locally only' } }
        }
      }
      
      // If 401, just return success for local cart
      if (error.response?.status === 401) {
        console.warn('User not authenticated, cart is local only')
        return { data: { message: 'Cart synced locally only' } }
      }
      
      throw error
    }
  },

  // Local cart management helpers
  updateCartItemLocally: (currentCart: any[], productId: string, quantity: number) => {
    return currentCart.map(item => 
      item.product === productId || item.product?._id === productId 
        ? { ...item, quantity } 
        : item
    ).filter(item => item.quantity > 0)
  },

  removeFromCartLocally: (currentCart: any[], productId: string) => {
    return currentCart.filter(item => 
      item.product !== productId && item.product?._id !== productId
    )
  },

  clearCartLocally: () => {
    return []
  }
}

export type CartService = typeof cartService
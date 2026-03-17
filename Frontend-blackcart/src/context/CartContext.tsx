// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react'
import { CartItem, Product } from '../types'
import { cartService } from '../services/cartService'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

// Types
interface CartContextType {
  cartItems: CartItem[]
  itemCount: number
  cartTotal: number
  loading: boolean
  error: string | null
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number, product?: Product) => Promise<void>
  clearCart: () => Promise<void>
  getCartItem: (productId: string) => CartItem | undefined
  isInCart: (productId: string) => boolean
  syncWithServer: () => Promise<void>
  loadCartFromServer: () => Promise<void>
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined)

// ✅ FIXED: Export useCart hook correctly
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Helper functions
const createMinimalProductData = (product: any) => {
  if (!product) return null
  
  if (typeof product === 'string') {
    return {
      _id: product,
      name: 'Product',
      price: 0,
      discountPrice: 0,
      image: ''
    }
  }
  
  return {
    _id: product._id || '',
    name: product.name || 'Product',
    price: Number(product.price) || 0,
    discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
    image: product.image || product.images?.[0] || '',
    stock: product.stock || 0,
    sku: product.sku || '',
    category: product.category || ''
  }
}

const getProductId = (product: any): string => {
  if (!product) return ''
  if (typeof product === 'string') return product
  return product._id || ''
}

const compressCartData = (cartItems: CartItem[]): any[] => {
  return cartItems.map(item => {
    const productData = typeof item.product === 'object' ? item.product : null
    
    return {
      id: getProductId(item.product),
      q: item.quantity,
      a: item.addedAt || new Date().toISOString(),
      p: productData ? {
        _id: productData._id,
        name: productData.name,
        price: productData.price,
        discountPrice: productData.discountPrice,
        image: productData.image || productData.images?.[0]
      } : null
    }
  })
}

const decompressCartData = (compressedData: any[]): CartItem[] => {
  return compressedData.map(item => {
    if (item.p && item.p._id) {
      return {
        product: item.p,
        quantity: item.q || 1,
        addedAt: item.a || new Date().toISOString()
      }
    }
    
    return {
      product: item.id || item.p || '',
      quantity: item.q || 1,
      addedAt: item.a || new Date().toISOString()
    }
  })
}

const checkLocalStorageSpace = (dataToSave: string): boolean => {
  try {
    const testKey = '__storage_test__'
    const testData = 'test'
    
    try {
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
    } catch (testError) {
      console.warn('LocalStorage is full or blocked')
      return false
    }
    
    if (dataToSave.length > 3.5 * 1024 * 1024) {
      console.warn('Cart data too large, will be truncated')
      return false
    }
    
    return true
  } catch {
    return false
  }
}

const saveCartToLocalStorage = (cartItems: CartItem[]) => {
  try {
    const compressedData = compressCartData(cartItems)
    const dataString = JSON.stringify(compressedData)
    
    if (!checkLocalStorageSpace(dataString)) {
      console.warn('LocalStorage space limited, trimming cart')
      const trimmedData = compressCartData(cartItems.slice(-10))
      const trimmedString = JSON.stringify(trimmedData)
      
      if (checkLocalStorageSpace(trimmedString)) {
        localStorage.setItem('cart', trimmedString)
      } else {
        localStorage.removeItem('cart')
        console.warn('Cleared cart from localStorage due to space limits')
      }
      return
    }
    
    localStorage.setItem('cart', dataString)
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

// Provider component
interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, user } = useAuth()
  
  const isInitialMount = useRef(true)
  const isSyncing = useRef(false)
  const serverLoadAttempted = useRef(false)
  const lastApiCall = useRef<Record<string, number>>({})
  const pendingSyncs = useRef<Array<() => Promise<void>>>([])

  // Load cart from localStorage
  useEffect(() => {
    const loadLocalCart = () => {
      try {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
          const parsedData = JSON.parse(savedCart)
          
          if (Array.isArray(parsedData)) {
            if (parsedData[0] && (parsedData[0].p || parsedData[0].id)) {
              const decompressedItems = decompressCartData(parsedData)
              setCartItems(decompressedItems)
            } else {
              const validCartItems = parsedData.filter((item: any) => 
                item && (item.product || item.productId)
              ).map((item: any) => ({
                product: item.product || item.productId || '',
                quantity: item.quantity || 1,
                addedAt: item.addedAt || new Date().toISOString()
              }))
              setCartItems(validCartItems)
              setTimeout(() => saveCartToLocalStorage(validCartItems), 1000)
            }
          }
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
        localStorage.removeItem('cart')
      } finally {
        setLoading(false)
      }
    }

    if (isInitialMount.current) {
      loadLocalCart()
      isInitialMount.current = false
    }
  }, [])

  // Load cart from server
  useEffect(() => {
    if (!isAuthenticated || serverLoadAttempted.current || isSyncing.current) return

    const timer = setTimeout(() => {
      loadCartFromServer()
    }, 1500)

    return () => clearTimeout(timer)
  }, [isAuthenticated])

  // Save cart to localStorage
  useEffect(() => {
    if (loading || isSyncing.current || cartItems.length === 0) return

    const timer = setTimeout(() => {
      saveCartToLocalStorage(cartItems)
    }, 500)

    return () => clearTimeout(timer)
  }, [cartItems, loading])

  // Calculate totals
  const { itemCount, cartTotal } = useMemo(() => {
    const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
    
    const total = cartItems.reduce((sum, item) => {
      if (typeof item.product === 'object' && item.product) {
        const price = Number(item.product.discountPrice || item.product.price || 0)
        const quantity = Number(item.quantity || 1)
        return sum + (price * quantity)
      }
      return sum
    }, 0)
    
    return { 
      itemCount: count, 
      cartTotal: total 
    }
  }, [cartItems])

  // Rate limiting helper
  const canMakeApiCall = (endpoint: string): boolean => {
    const now = Date.now()
    const lastCall = lastApiCall.current[endpoint] || 0
    const minInterval = 2000
    
    return now - lastCall > minInterval
  }

  // Queue sync operations
  const queueSyncOperation = async (operation: () => Promise<void>) => {
    pendingSyncs.current.push(operation)
    
    if (pendingSyncs.current.length === 1) {
      processSyncQueue()
    }
  }

  const processSyncQueue = async () => {
    while (pendingSyncs.current.length > 0) {
      const operation = pendingSyncs.current[0]
      try {
        await operation()
      } catch (error) {
        console.error('Error in sync operation:', error)
      }
      pendingSyncs.current.shift()
      
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Load cart from server
  const loadCartFromServer = async () => {
    if (!isAuthenticated || isSyncing.current || serverLoadAttempted.current) return

    isSyncing.current = true
    serverLoadAttempted.current = true

    try {
      setLoading(true)
      
      if (!canMakeApiCall('getCart')) {
        console.log('Rate limited: getCart')
        return
      }
      lastApiCall.current['getCart'] = Date.now()

      const response = await cartService.getCart()
      const serverCart = response.data || []
      
      const formattedCart: CartItem[] = serverCart.map((item: any) => ({
        product: {
          _id: item.product?._id || item.productId || '',
          name: item.product?.name || 'Product',
          price: Number(item.product?.price) || 0,
          discountPrice: item.product?.discountPrice ? Number(item.product.discountPrice) : undefined,
          image: item.product?.images?.[0] || item.product?.image || '',
          sku: item.product?.sku || ''
        },
        quantity: item.quantity || 1,
        addedAt: item.addedAt || new Date().toISOString()
      })).filter((item: any) => item.product._id)

      setCartItems(formattedCart)
      setError(null)

      saveCartToLocalStorage(formattedCart)

    } catch (error: any) {
      console.error('Error loading cart from server:', error)
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment.')
      } else if (error.response?.status !== 401 && error.response?.status !== 404) {
        setError(error.message || 'Failed to load cart from server')
      }
      
    } finally {
      setLoading(false)
      isSyncing.current = false
    }
  }

  // Sync with server
  const syncWithServer = async () => {
    if (!isAuthenticated || isSyncing.current) return

    await queueSyncOperation(async () => {
      isSyncing.current = true
      
      try {
        if (!canMakeApiCall('syncCart')) {
          console.log('Rate limited: syncCart')
          return
        }
        lastApiCall.current['syncCart'] = Date.now()

        const validCartItems = cartItems.filter(item => getProductId(item.product))
        
        await cartService.syncCart(
          validCartItems.map(item => ({
            productId: getProductId(item.product),
            quantity: item.quantity
          }))
        )

      } catch (error: any) {
        console.error('Error syncing cart with server:', error)
        
        if (error.response?.status === 429) {
          toast.error('Too many requests. Syncing paused.')
          await new Promise(resolve => setTimeout(resolve, 5000))
        } else if (error.response?.status !== 401 && error.response?.status !== 404) {
          toast.error('Failed to sync cart with server')
        }
      } finally {
        isSyncing.current = false
      }
    })
  }

  // Add to cart
  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!product || !product._id || typeof product !== 'object') {
      toast.error('Invalid product')
      return
    }

    const productId = String(product._id)
    const productName = product.name || 'Product'

    const productData = {
      _id: productId,
      name: productName,
      price: Number(product.price) || 0,
      discountPrice: product.discountPrice ? Number(product.discountPrice) : undefined,
      image: product.images?.[0] || product.image || '',
      sku: product.sku || '',
      stock: product.stock || 0
    }

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => getProductId(item.product) === productId
      )

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          product: productData,
          quantity: updatedItems[existingItemIndex].quantity + quantity
        }
        return updatedItems
      } else {
        return [...prevItems, {
          product: productData,
          quantity,
          addedAt: new Date().toISOString()
        }]
      }
    })

    if (isAuthenticated) {
      await queueSyncOperation(async () => {
        isSyncing.current = true
        try {
          if (!canMakeApiCall('addToCart')) {
            console.log('Rate limited: addToCart')
            return
          }
          lastApiCall.current['addToCart'] = Date.now()

          await cartService.addToCart({ 
            productId, 
            quantity 
          })
        } catch (error: any) {
          console.error('Error adding to server cart:', error)
          
          if (error.response?.status === 429) {
            toast.error('Too many requests. Please wait.')
          } else if (error.response?.status !== 401 && error.response?.status !== 404) {
            toast.error('Failed to sync with server cart')
          }
        } finally {
          isSyncing.current = false
        }
      })
    }

    toast.success(`${quantity} × ${productName} added to cart`)
  }

  // Remove from cart
  const removeFromCart = async (productId: string) => {
    const item = cartItems.find(item => getProductId(item.product) === productId)
    if (!item) {
      toast.error('Item not found in cart')
      return
    }

    setCartItems(prev => prev.filter(item => getProductId(item.product) !== productId))

    if (isAuthenticated) {
      await queueSyncOperation(async () => {
        isSyncing.current = true
        try {
          if (!canMakeApiCall('removeFromCart')) {
            console.log('Rate limited: removeFromCart')
            return
          }
          lastApiCall.current['removeFromCart'] = Date.now()

          await cartService.removeFromCart(productId)
        } catch (error: any) {
          console.error('Error removing from server cart:', error)
          
          if (error.response?.status === 429) {
            toast.error('Too many requests. Please wait.')
          } else if (error.response?.status !== 401 && error.response?.status !== 404) {
            toast.error('Failed to sync with server')
          }
        } finally {
          isSyncing.current = false
        }
      })
    }

    toast.success('Item removed from cart')
  }

  // Update quantity
  const updateQuantity = async (productId: string, quantity: number, product?: Product) => {
    if (quantity < 1) {
      await removeFromCart(productId)
      return
    }

    setCartItems(prev => 
      prev.map(item => {
        if (getProductId(item.product) === productId) {
          const productData = typeof item.product === 'object' ? item.product : product
          return { 
            ...item, 
            product: productData || item.product,
            quantity 
          }
        }
        return item
      })
    )

    if (isAuthenticated) {
      await queueSyncOperation(async () => {
        isSyncing.current = true
        try {
          if (!canMakeApiCall('updateQuantity')) {
            console.log('Rate limited: updateQuantity')
            return
          }
          lastApiCall.current['updateQuantity'] = Date.now()

          await cartService.updateCartItem(productId, quantity)
        } catch (error: any) {
          console.error('Error updating quantity on server:', error)
          
          if (error.response?.status === 429) {
            toast.error('Too many requests. Please wait before updating.')
          } else if (error.response?.status !== 401 && error.response?.status !== 404) {
            toast.error('Failed to sync with server')
          }
        } finally {
          isSyncing.current = false
        }
      })
    }
  }

  // Clear cart
  const clearCart = async () => {
    if (cartItems.length === 0) {
      toast.info('Cart is already empty')
      return
    }

    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return
    }

    setCartItems([])
    localStorage.removeItem('cart')

    if (isAuthenticated) {
      await queueSyncOperation(async () => {
        isSyncing.current = true
        try {
          if (!canMakeApiCall('clearCart')) {
            console.log('Rate limited: clearCart')
            return
          }
          lastApiCall.current['clearCart'] = Date.now()

          await cartService.clearCart()
        } catch (error: any) {
          console.error('Error clearing server cart:', error)
          
          if (error.response?.status === 429) {
            toast.error('Too many requests. Please wait.')
          } else if (error.response?.status !== 401 && error.response?.status !== 404) {
            toast.error('Failed to sync with server')
          }
        } finally {
          isSyncing.current = false
        }
      })
    }

    toast.success('Cart cleared successfully')
  }

  const getCartItem = useCallback((productId: string) => {
    return cartItems.find(item => getProductId(item.product) === productId)
  }, [cartItems])

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(item => getProductId(item.product) === productId)
  }, [cartItems])

  const value: CartContextType = useMemo(() => ({
    cartItems,
    itemCount,
    cartTotal,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart,
    syncWithServer,
    loadCartFromServer,
  }), [
    cartItems,
    itemCount,
    cartTotal,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart,
    syncWithServer,
    loadCartFromServer
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// ✅ FIXED: Export everything properly
export { CartContext }



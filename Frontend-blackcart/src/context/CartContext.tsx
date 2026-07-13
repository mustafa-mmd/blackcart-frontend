/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import toast from 'react-hot-toast'
import type { CartItem, Product } from '../types'

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
}

interface StoredCartItem {
  id?: string
  q?: number
  a?: string
  p?: Partial<Product> | string | null
  product?: Product | string | null
  quantity?: number
  addedAt?: string
}

const CartContext = createContext<CartContextType | undefined>(undefined)
const CART_STORAGE_KEY = 'cart'

const getProductId = (product: CartItem['product']): string => {
  if (!product) return ''
  return typeof product === 'string' ? product : product._id
}

const readStoredCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return (parsed as StoredCartItem[])
      .map((item): CartItem | null => {
        const product = item.product ?? item.p ?? item.id ?? null
        const productId = typeof product === 'string' ? product : product?._id
        if (!productId) return null

        return {
          product: product as Product | string,
          quantity: Math.max(1, Number(item.quantity ?? item.q ?? 1)),
          addedAt: item.addedAt ?? item.a ?? new Date().toISOString(),
        }
      })
      .filter((item): item is CartItem => item !== null)
  } catch {
    localStorage.removeItem(CART_STORAGE_KEY)
    return []
  }
}

const writeStoredCart = (items: CartItem[]) => {
  const compactItems = items.map((item) => ({
    id: getProductId(item.product),
    q: item.quantity,
    a: item.addedAt,
    p: typeof item.product === 'object' ? item.product : null,
  }))
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compactItems))
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(readStoredCart)
  useEffect(() => {
    try {
      writeStoredCart(cartItems)
    } catch {
      console.warn('Your cart could not be saved in this browser.')
    }
  }, [cartItems])

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    const safeQuantity = Math.max(1, quantity)
    setCartItems((current) => {
      const existingIndex = current.findIndex((item) => getProductId(item.product) === product._id)
      if (existingIndex < 0) {
        return [...current, { product, quantity: safeQuantity, addedAt: new Date().toISOString() }]
      }

      return current.map((item, index) =>
        index === existingIndex
          ? { ...item, product, quantity: item.quantity + safeQuantity }
          : item,
      )
    })
    toast.success(`${safeQuantity} × ${product.name} added to cart`)
  }, [])

  const removeFromCart = useCallback(async (productId: string) => {
    setCartItems((current) => current.filter((item) => getProductId(item.product) !== productId))
  }, [])

  const updateQuantity = useCallback(async (productId: string, quantity: number, product?: Product) => {
    if (quantity < 1) {
      setCartItems((current) => current.filter((item) => getProductId(item.product) !== productId))
      return
    }

    setCartItems((current) => current.map((item) =>
      getProductId(item.product) === productId
        ? { ...item, product: product ?? item.product, quantity }
        : item,
    ))
  }, [])

  const clearCart = useCallback(async () => {
    setCartItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
  }, [])

  const getCartItem = useCallback(
    (productId: string) => cartItems.find((item) => getProductId(item.product) === productId),
    [cartItems],
  )

  const isInCart = useCallback(
    (productId: string) => cartItems.some((item) => getProductId(item.product) === productId),
    [cartItems],
  )

  const { itemCount, cartTotal } = useMemo(() => cartItems.reduce(
    (totals, item) => {
      const product = typeof item.product === 'object' ? item.product : null
      const price = product?.discountPrice ?? product?.price ?? 0
      return {
        itemCount: totals.itemCount + item.quantity,
        cartTotal: totals.cartTotal + price * item.quantity,
      }
    },
    { itemCount: 0, cartTotal: 0 },
  ), [cartItems])

  const value = useMemo<CartContextType>(() => ({
    cartItems,
    itemCount,
    cartTotal,
    loading: false,
    error: null,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart,
  }), [
    addToCart,
    cartItems,
    cartTotal,
    clearCart,
    getCartItem,
    isInCart,
    itemCount,
    removeFromCart,
    updateQuantity,
  ])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export { CartContext }

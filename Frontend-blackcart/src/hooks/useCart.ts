// src/hooks/useCart.ts
import { useCallback } from 'react'
import { useCart } from '../context/CartContext'
import { Product } from '../types'
import toast from 'react-hot-toast'

export const useCartOperations = () => {
  const { 
    addToCart: contextAddToCart, 
    removeFromCart, 
    updateQuantity,
    clearCart,
    getCartItem,
    isInCart 
  } = useCart()

  const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
    await contextAddToCart(product, quantity)
  }, [contextAddToCart])

  const removeItemFromCart = useCallback(async (productId: string) => {
    await removeFromCart(productId)
  }, [removeFromCart])

  const updateCartQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) {
      toast.error('Quantity must be at least 1')
      return
    }
    await updateQuantity(productId, quantity)
  }, [updateQuantity])

  const clearCartItems = useCallback(async () => {
    const confirmed = window.confirm('Are you sure you want to clear your cart?')
    if (confirmed) {
      await clearCart()
    }
  }, [clearCart])

  const getItemQuantity = useCallback((productId: string): number => {
    const item = getCartItem(productId)
    return item?.quantity || 0
  }, [getCartItem])

  const toggleCartItem = useCallback(async (product: Product) => {
    if (isInCart(product._id)) {
      await removeFromCart(product._id)
      toast.success(`${product.name} removed from cart`)
    } else {
      await addToCart(product, 1)
    }
  }, [isInCart, removeFromCart, addToCart])

  const increaseQuantity = useCallback(async (productId: string) => {
    const currentQuantity = getItemQuantity(productId)
    await updateQuantity(productId, currentQuantity + 1)
  }, [getItemQuantity, updateQuantity])

  const decreaseQuantity = useCallback(async (productId: string) => {
    const currentQuantity = getItemQuantity(productId)
    if (currentQuantity > 1) {
      await updateQuantity(productId, currentQuantity - 1)
    } else {
      await removeFromCart(productId)
    }
  }, [getItemQuantity, updateQuantity, removeFromCart])

  return {
    addToCart,
    removeFromCart: removeItemFromCart,
    updateQuantity: updateCartQuantity,
    clearCart: clearCartItems,
    getCartItem,
    isInCart,
    getItemQuantity,
    toggleCartItem,
    increaseQuantity,
    decreaseQuantity,
  }
}

export const useCartSummary = () => {
  const { cartItems, itemCount, cartTotal } = useCart()

  const calculateSubtotal = useCallback(() => {
    return cartTotal
  }, [cartTotal])

  const calculateShipping = useCallback((shippingCost: number = 0) => {
    // Free shipping for orders over 5000
    if (cartTotal >= 5000) {
      return 0
    }
    return shippingCost
  }, [cartTotal])

  const calculateTax = useCallback((taxRate: number = 0.16) => {
    return cartTotal * taxRate
  }, [cartTotal])

  const calculateTotal = useCallback((shippingCost: number = 0, taxRate: number = 0.16) => {
    const subtotal = calculateSubtotal()
    const shipping = calculateShipping(shippingCost)
    const tax = calculateTax(taxRate)
    return subtotal + shipping + tax
  }, [calculateSubtotal, calculateShipping, calculateTax])

  return {
    cartItems,
    itemCount,
    cartTotal,
    calculateSubtotal,
    calculateShipping,
    calculateTax,
    calculateTotal,
  }
}
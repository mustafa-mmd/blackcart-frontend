
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2, X, Shield, Sparkles } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { getImageUrl } from '../../utils/imageUtils'

const getVariantId = (variant: unknown) => {
  if (!variant) return ''
  if (typeof variant === 'string') return variant
  if (typeof variant === 'object' && '_id' in variant) return String((variant as { _id?: string })._id || '')
  return ''
}

const MiniCart: React.FC = () => {
  const { cartItems, itemCount, cartTotal, removeFromCart, updateQuantity } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const [cartPulse, setCartPulse] = useState(0)
  const [flyingProduct, setFlyingProduct] = useState<{
    id: number
    imageUrl: string
    fromX: number
    fromY: number
    toX: number
    toY: number
  } | null>(null)

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    closeRef.current?.focus()
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  useEffect(() => {
    const handleCartCelebration = (event: Event) => {
      const detail = (event as CustomEvent<{ imageUrl?: string; fromX?: number; fromY?: number }>).detail
      const target = triggerRef.current?.getBoundingClientRect()
      if (!target || !detail?.imageUrl) return

      const id = Date.now()
      const fromX = detail.fromX ?? window.innerWidth * 0.7
      const fromY = detail.fromY ?? window.innerHeight * 0.72
      setFlyingProduct({
        id,
        imageUrl: detail.imageUrl,
        fromX,
        fromY,
        toX: target.left + target.width / 2,
        toY: target.top + target.height / 2,
      })
      setCartPulse(id)
      window.setTimeout(() => setFlyingProduct((current) => current?.id === id ? null : current), 850)
      window.setTimeout(() => setCartPulse((current) => current === id ? 0 : current), 700)
    }

    window.addEventListener('blackcart:cart-celebration', handleCartCelebration)
    return () => window.removeEventListener('blackcart:cart-celebration', handleCartCelebration)
  }, [])

  // Free shipping limit is PKR 5000
  const freeShippingThreshold = 5000
  const isFreeShipping = cartTotal >= freeShippingThreshold
  const progressPercent = Math.min((cartTotal / freeShippingThreshold) * 100, 100)
  const remainingForFreeShipping = freeShippingThreshold - cartTotal

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`relative rounded-lg p-2 text-gray-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-600 focus:outline-none ${cartPulse ? 'cart-icon-celebrate' : ''}`}
        aria-label={`Open cart with ${itemCount} items`}
        aria-expanded={isOpen}
        aria-controls="mini-cart"
      >
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <span className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white shadow-md ${cartPulse ? 'cart-badge-celebrate' : ''}`}>
            {itemCount}
          </span>
        )}
      </button>

      {flyingProduct && (
        <img
          key={flyingProduct.id}
          src={flyingProduct.imageUrl}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed z-[100] h-14 w-14 rounded-xl border-2 border-white bg-white object-contain shadow-xl cart-fly-to-cart"
          style={{
            left: flyingProduct.fromX,
            top: flyingProduct.fromY,
            '--cart-fly-x': `${flyingProduct.toX - flyingProduct.fromX}px`,
            '--cart-fly-y': `${flyingProduct.toY - flyingProduct.fromY}px`,
          } as React.CSSProperties}
        />
      )}

      {isOpen && (
        <div 
          id="mini-cart" 
          role="dialog" 
          aria-modal="false" 
          aria-label="Shopping cart" 
          className="fixed inset-x-3 top-[4.5rem] z-[70] overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[25rem]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                Shopping Cart
                <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </h2>
            </div>
            <button 
              ref={closeRef} 
              type="button" 
              onClick={() => { setIsOpen(false); triggerRef.current?.focus() }} 
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition" 
              aria-label="Close cart"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="font-bold text-gray-800 text-base">Your cart is empty</p>
              <p className="text-gray-500 text-sm mt-1 mb-5">Browse categories and start shopping today</p>
              <Link 
                to="/products" 
                onClick={() => setIsOpen(false)} 
                className="inline-flex rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Free Shipping Progress Bar */}
              <div className="border-b border-gray-100 bg-blue-50/50 px-5 py-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    {isFreeShipping ? (
                      <span className="text-green-700">Congratulations! You earned FREE shipping!</span>
                    ) : (
                      <span>Spend <strong className="text-blue-700">PKR {remainingForFreeShipping.toLocaleString()}</strong> more for FREE shipping</span>
                    )}
                  </span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isFreeShipping ? 'bg-green-600' : 'bg-blue-600'}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="max-h-[40vh] divide-y divide-gray-100 overflow-y-auto pr-1">
                {cartItems.map((item, index) => {
                  const product = typeof item.product === 'object' ? item.product : null
                  if (!product) return null
                  const variant = typeof item.variant === 'object' ? item.variant : null
                  const sourceImage = variant?.images?.[0] || product.images?.[0] || product.image
                  const imageUrl = sourceImage ? getImageUrl(sourceImage) : '/placeholder.png'
                  const price = product.discountPrice || product.price || 0
                  const variantId = getVariantId(item.variant)
                  const availableStock = variant?.stock ?? product.stock ?? Number.POSITIVE_INFINITY
                  
                  return (
                    <div key={`${product._id}-${variantId}-${index}`} className="flex gap-4 p-4.5 hover:bg-gray-50/30 transition-colors">
                      <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="h-16 w-16 rounded-xl bg-gray-100 object-cover border border-gray-200/60" 
                      />
                      <div className="min-w-0 flex-1">
                        <Link 
                          to={`/products/${product.slug || product._id}`} 
                          onClick={() => setIsOpen(false)} 
                          className="line-clamp-2 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {product.name}
                        </Link>
                        {item.selectedColor && (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <span 
                              className="h-3 w-3 rounded-full border border-black/10" 
                              style={{ backgroundColor: item.selectedColor.value }} 
                              aria-hidden="true" 
                            />
                            {item.selectedColor.name}
                          </p>
                        )}
                        
                        <div className="mt-2.5 flex items-center justify-between">
                          <p className="text-sm font-bold text-gray-900">
                            PKR {price.toLocaleString()}
                          </p>
                          
                          {/* Quantity Increment/Decrement */}
                          <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm">
                            <button 
                              type="button" 
                              onClick={() => updateQuantity(product._id, item.quantity - 1, product, variantId)} 
                              className="p-1 px-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition" 
                              aria-label={`Decrease quantity of ${product.name}`}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-6 text-center text-xs font-bold text-gray-800" aria-label={`Quantity ${item.quantity}`}>
                              {item.quantity}
                            </span>
                            <button 
                              type="button" 
                              disabled={item.quantity >= availableStock} 
                              onClick={() => updateQuantity(product._id, item.quantity + 1, product, variantId)} 
                              className="p-1 px-2 text-gray-500 hover:bg-gray-50 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 transition" 
                              aria-label={`Increase quantity of ${product.name}`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trash Delete Icon */}
                      <button 
                        type="button" 
                        onClick={() => removeFromCart(product._id, variantId)} 
                        className="self-start rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors" 
                        aria-label={`Remove ${product.name}`}
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 bg-gray-50/80 p-5">
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <strong className="text-gray-900 font-bold text-base">PKR {cartTotal.toLocaleString()}</strong>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Shipping</span>
                    <span>{isFreeShipping ? <span className="text-green-600 font-semibold">FREE</span> : 'Calculated at checkout'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setIsOpen(false); navigate('/cart') }}
                    className="rounded-xl border border-gray-300 bg-white px-3 py-3 text-center text-sm font-bold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                  >
                    View Cart
                  </button>
                  <button 
                    onClick={() => { setIsOpen(false); navigate('/checkout') }}
                    className="rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-bold text-white hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                  >
                    Checkout
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                  <Shield className="h-3 w-3 text-green-500" />
                  <span>Secure Shopping Guarantee</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default MiniCart


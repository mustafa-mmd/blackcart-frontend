import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Trash2, Share2, Eye, ShoppingCart, Loader } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { userService } from '../../services/userService'
import { productService } from '../../services/productService'
import { formatPrice } from '../../utils/formatCurrency'

interface Product {
  _id: string
  name: string
  slug?: string
  category: string
  price: number
  discountPrice?: number
  images?: string[]
  rating?: number
  stock: number
  inStock?: boolean
  [key: string]: any
}

interface WishlistItem {
  _id: string
  product: Product | string
}

const WishlistPage: React.FC = () => {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchWishlist()
  }, [user])

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      const response = await userService.getWishlist()
      
      // ✅ FIXED: Based on your console log, response structure is response.data.data.items
      let wishlistItems: WishlistItem[] = []
      
      if (response && response.success) {
        // Check for response.data.data.items (nested structure)
        if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
          wishlistItems = response.data.data.items.map((item: any) => ({
            _id: item._id || item.product?._id || `temp-${Math.random()}`,
            product: item.product || item
          }))
        }
        // Also check other possible structures for fallback
        else if (response.data?.items && Array.isArray(response.data.items)) {
          wishlistItems = response.data.items.map((item: any) => ({
            _id: item._id || item.product?._id || `temp-${Math.random()}`,
            product: item.product || item
          }))
        }
        else if (Array.isArray(response.data)) {
          wishlistItems = response.data.map((product: any) => ({ 
            _id: product._id || `temp-${Math.random()}`, 
            product 
          }))
        }
      }
      
      // Filter out any invalid items
      wishlistItems = wishlistItems.filter(item => 
        item && item.product && (typeof item.product === 'string' || item.product._id)
      )
      
      console.log('Parsed wishlist items:', wishlistItems)
      setWishlistItems(wishlistItems)
      
    } catch (error: any) {
      console.error('Error fetching wishlist:', error)
      toast.error(error.response?.data?.message || 'Failed to load wishlist')
      setWishlistItems([])
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: Get correct image URL
  const getImageUrl = (product: Product) => {
    try {
      if (productService.getFirstImageUrl) {
        return productService.getFirstImageUrl(product)
      }
      
      if (product.images?.[0]) {
        return productService.getImageUrl?.(product.images[0]) || product.images[0]
      }
      
      return '/images/placeholder.png'
    } catch (error) {
      return '/images/placeholder.png'
    }
  }

  // ✅ FIXED: Get product identifier for URL
  const getProductIdentifier = (product: Product) => {
    return product.slug || product._id
  }

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  const handleRemoveItem = async (productId: string) => {
    try {
      await userService.removeFromWishlist(productId)
      
      setWishlistItems(prev => prev.filter(item => {
        if (!item.product) return true
        
        if (typeof item.product === 'string') {
          return item.product !== productId
        }
        
        return (item.product._id !== productId) && (item.product.id !== productId)
      }))
      
      toast.success('Item removed from wishlist')
    } catch (error: any) {
      console.error('Error removing from wishlist:', error)
      toast.error(error.response?.data?.message || 'Failed to remove item')
    }
  }

  // ✅ ADDED: Missing handleAddAllToCart function
  const handleAddAllToCart = async () => {
    if (wishlistItems.length === 0) {
      toast.error('No items to add to cart')
      return
    }
    
    try {
      const inStockItems = wishlistItems.filter(item => {
        if (typeof item.product === 'string') {
          return false // Can't check stock if only ID is available
        }
        return item.product.stock > 0
      })
      
      if (inStockItems.length === 0) {
        toast.error('No items in stock')
        return
      }
      
      // Show loading for all items
      setAddingToCart('all')
      
      // Process items sequentially to avoid overwhelming the API
      for (const item of inStockItems) {
        if (typeof item.product !== 'string') {
          try {
            await addToCart(item.product, 1)
          } catch (error) {
            console.error(`Failed to add ${item.product.name} to cart:`, error)
          }
        }
      }
      
      toast.success(`${inStockItems.length} item${inStockItems.length === 1 ? '' : 's'} added to cart`)
    } catch (error: any) {
      console.error('Error adding all to cart:', error)
      toast.error('Failed to add some items to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  const handleAddToCart = async (product: Product | string) => {
    try {
      const productId = typeof product === 'string' ? product : product._id
      const productToAdd = typeof product === 'string' 
        ? await productService.getProduct(productId)
        : product
        
      setAddingToCart(productId)
      await addToCart(productToAdd, 1)
      toast.success('Item added to cart')
    } catch (error: any) {
      console.error('Error adding to cart:', error)
      toast.error(error.response?.data?.message || 'Failed to add item to cart')
    } finally {
      setAddingToCart(null)
    }
  }

  // ✅ FIXED: Eye icon handler
  const handleQuickView = (product: Product) => {
    const productIdentifier = getProductIdentifier(product)
    console.log(`Navigating to: /products/${productIdentifier}`)
    navigate(`/products/${productIdentifier}`)
  }

  const handleShareWishlist = () => {
    if (!user) {
      toast.error('Please login to share wishlist')
      return
    }
    
    const wishlistUrl = `${window.location.origin}/wishlist?user=${user._id}`
    
    if (navigator.share) {
      navigator.share({
        title: 'My Wishlist',
        text: 'Check out my wishlist!',
        url: wishlistUrl,
      }).catch(() => {
        navigator.clipboard.writeText(wishlistUrl)
        toast.success('Wishlist link copied to clipboard')
      })
    } else {
      navigator.clipboard.writeText(wishlistUrl)
      toast.success('Wishlist link copied to clipboard')
    }
  }

  const getProductDetails = (item: WishlistItem) => {
    if (typeof item.product === 'string') {
      return {
        _id: item.product,
        name: 'Unknown Product',
        category: 'Unknown',
        price: 0,
        stock: 0,
        images: [],
        rating: 0
      }
    }
    return item.product
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-700 mb-3">Please Login</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You need to be logged in to view your wishlist.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Login to Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-pink-600 to-rose-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">My Wishlist</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Save your favorite products and buy them later
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'} in Wishlist
            </h2>
            <p className="text-gray-600">Save items you love for later purchase</p>
          </div>
          
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button
              onClick={handleShareWishlist}
              disabled={wishlistItems.length === 0}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button
              onClick={handleAddAllToCart}
              disabled={wishlistItems.length === 0 || addingToCart === 'all'}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart === 'all' ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" />
                  Add All to Cart
                </>
              )}
            </button>
          </div>
        </motion.div>

        {wishlistItems.length > 0 ? (
          <div className="space-y-6">
            {wishlistItems.map((item, index) => {
              const product = getProductDetails(item)
              const productId = typeof item.product === 'string' ? item.product : item.product._id
              const productIdentifier = getProductIdentifier(product)
              const imageUrl = getImageUrl(product)
              
              return (
                <motion.div
                  key={item._id || productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-48 h-48 flex-shrink-0">
                      <img
                        src={imageErrors[productId] ? '/images/placeholder.png' : imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={() => handleImageError(productId)}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-start justify-between">
                        <div>
                          <span className="text-sm text-gray-500 mb-2 block">{product.category}</span>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                          
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Heart
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.floor(product.rating || 0) ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="text-sm text-gray-600 ml-1">
                                {(product.rating || 0).toFixed(1)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                              <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl font-bold text-gray-900">
                              {formatPrice(product.discountPrice || product.price)}
                            </span>
                            {product.discountPrice && product.discountPrice < product.price && (
                              <>
                                <span className="text-lg text-gray-500 line-through">
                                  {formatPrice(product.price)}
                                </span>
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                  Save {Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-4 md:mt-0">
                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={!product.stock || addingToCart === productId}
                            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-colors ${
                              product.stock > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {addingToCart === productId ? (
                              <>
                                <Loader className="h-4 w-4 animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4" />
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                              </>
                            )}
                          </button>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleQuickView(product)}
                              className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </button>
                            
                            <button
                              onClick={() => handleRemoveItem(productId)}
                              className="flex-1 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 px-4 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="mb-6">
              <Heart className="h-16 w-16 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save items you love to your wishlist. Review them anytime and easily move them to your shopping bag.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              <ShoppingBag className="h-5 w-5" />
              Start Shopping
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage





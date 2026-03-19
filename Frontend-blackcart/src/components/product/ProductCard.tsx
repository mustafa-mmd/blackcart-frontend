// src/components/product/ProductCard.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Heart, Eye, TrendingUp, Loader } from 'lucide-react'
import { Product } from '../../types'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'
// Import the image utility
import { getImageUrl } from '../../utils/imageUtils'

interface ProductCardProps {
  product: Product
  index?: number
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()
  const { user } = useAuth()
  const [isWishlisted, setIsWishlisted] = React.useState(false)
  const [isHovered, setIsHovered] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)
  const [wishlistLoading, setWishlistLoading] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState<string>('/placeholder.png')

  // Extract category name properly
  const getCategoryName = (): string => {
    if (!product?.category) return 'Uncategorized'
    
    if (typeof product.category === 'string') {
      return product.category
    }
    
    if (typeof product.category === 'object') {
      return product.category.name || 'Uncategorized'
    }
    
    return String(product.category) || 'Uncategorized'
  }

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !product?._id) return
      
      try {
        const response = await userService.getWishlist()
        
        let wishlistItems: any[] = []
        
        if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
          wishlistItems = response.data.data.items.map((item: any) => item.product)
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          wishlistItems = response.data.items.map((item: any) => item.product)
        } else if (Array.isArray(response.data)) {
          wishlistItems = response.data
        }
        
        const isInWishlist = wishlistItems.some((wishlistProduct: any) => 
          wishlistProduct?._id === product._id || wishlistProduct === product._id
        )
        
        setIsWishlisted(isInWishlist)
      } catch (error) {
        console.error('Error checking wishlist status:', error)
      }
    }
    
    checkWishlistStatus()
  }, [user, product?._id])

  // Get product image URL - FIXED to handle object format
  useEffect(() => {
    const loadImage = () => {
      if (!product) {
        setImageUrl('/placeholder.png')
        return
      }
      
      try {
        // Get the first image from the images array (which contains objects with url property)
        let imageData = null
        
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          imageData = product.images[0]
        } 
        // Fallback to product.image if it exists (could be string or object)
        else if (product.image) {
          imageData = product.image
        }
        
        if (!imageData) {
          setImageUrl('/placeholder.png')
          return
        }
        
        // Use the utility to get the full URL
        const url = getImageUrl(imageData)
        setImageUrl(url)
        
      } catch (error) {
        console.error('Error getting image URL for product:', product.name, error)
        setImageUrl('/placeholder.png')
      }
    }
    
    loadImage()
  }, [product])

  const getProductName = () => product?.name || 'Product'

  const discountPercentage = product?.discountPrice && product?.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product) return
    
    if (product.stock === 0) {
      toast.error(`${getProductName()} is out of stock!`)
      return
    }
    
    addToCart(product)
    toast.success(`${getProductName()} added to cart!`)
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product) return
    
    if (!user) {
      toast.error('Please login to add items to wishlist')
      navigate('/login', { state: { returnUrl: window.location.pathname } })
      return
    }
    
    setWishlistLoading(true)
    
    try {
      if (isWishlisted) {
        await userService.removeFromWishlist(product._id)
        setIsWishlisted(false)
        toast.success(`${getProductName()} removed from wishlist`)
      } else {
        await userService.addToWishlist(product._id)
        setIsWishlisted(true)
        toast.success(`${getProductName()} added to wishlist!`)
      }
    } catch (error: any) {
      console.error('Wishlist error:', error)
      toast.error(error?.response?.data?.message || 'Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!product) return
    
    const productIdentifier = product.slug || product._id
    
    try {
      navigate(`/products/${productIdentifier}`)
    } catch (error) {
      console.error('❌ Navigation failed:', error)
      window.location.href = `/products/${productIdentifier}`
    }
  }

  const handleCardClick = () => {
    if (!product) return
    
    const productIdentifier = product.slug || product._id
    
    try {
      navigate(`/products/${productIdentifier}`)
    } catch (error) {
      console.error('❌ Navigation failed:', error)
      window.location.href = `/products/${productIdentifier}`
    }
  }

  const safeRender = (value: any, fallback: string = ''): string => {
    if (value == null) return fallback
    
    if (typeof value === 'object') {
      if (value.name && typeof value.name === 'string') {
        return value.name
      }
      const stringValues = Object.values(value).filter(v => typeof v === 'string')
      if (stringValues.length > 0) {
        return String(stringValues[0])
      }
      return fallback
    }
    
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }
    
    return fallback
  }

  if (!product) {
    return (
      <div className="card overflow-hidden bg-gray-100">
        <div className="aspect-square bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="card overflow-hidden group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      aria-label={`View ${product.name} details`}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageError ? '/placeholder.png' : imageUrl}
          alt={safeRender(product.name, 'Product image')}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => {
            console.log('Image failed to load:', imageUrl);
            setImageError(true);
          }}
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercentage > 0 && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded">
              Out of Stock
            </span>
          )}
        </div>

        {/* Action buttons on hover */}
        <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}>
          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading || !user}
            className={`p-2 rounded-full shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isWishlisted 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:text-red-500'
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            title={!user ? "Login to add to wishlist" : isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlistLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            )}
          </button>
          <button
            onClick={handleQuickView}
            className="p-2 bg-white text-gray-700 rounded-full shadow-md hover:bg-gray-50 hover:text-blue-600 transition-all"
            aria-label="Quick view"
            title="Quick view"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Add to cart button on hover */}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-0 left-0 right-0 bg-blue-600 text-white py-3 font-medium transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          } ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={product.stock === 0}
          aria-label={product.stock === 0 ? "Out of stock" : "Add to cart"}
        >
          {isInCart(product._id) ? (
            <span className="flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              In Cart
            </span>
          ) : product.stock === 0 ? (
            'Out of Stock'
          ) : (
            <span className="flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </span>
          )}
        </button>
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {getCategoryName()}
          </span>
          {product.rating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">
                {safeRender(product.rating?.toFixed(1), '0.0')}
              </span>
            </div>
          )}
        </div>

        <h3 className="font-medium text-gray-900 mb-2 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
            onClick={handleCardClick}>
          {safeRender(product.name, 'Unnamed Product')}
        </h3>

        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
          {safeRender(product.brand, 'Unknown Brand')}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  PKR {safeRender(product.discountPrice?.toLocaleString(), '0')}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  PKR {safeRender(product.price?.toLocaleString(), '0')}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                PKR {safeRender(product.price?.toLocaleString(), '0')}
              </span>
            )}
          </div>
          
          {product.stock > 0 && product.stock < 10 && (
            <div className="flex items-center text-xs text-orange-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Only {safeRender(product.stock, '0')} left
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard



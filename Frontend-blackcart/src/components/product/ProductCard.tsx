

// src/components/product/ProductCard.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, Eye, TrendingUp } from 'lucide-react'
import type { Product, StorefrontProduct } from '../../types'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
// Import the image utility
import { getImageUrl } from '../../utils/imageUtils'

interface ProductCardProps {
  product: StorefrontProduct
  compact?: boolean
  index?: number
  viewMode?: 'grid' | 'list'  // ✅ ADDED: viewMode prop
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0, viewMode = 'grid', compact = false }) => {
  const navigate = useNavigate()
  const { addToCart, isInCart } = useCart()
  const [isHovered, setIsHovered] = React.useState(false)
  const [imageError, setImageError] = React.useState(false)
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

  const hasValidDiscount = Boolean(
    product?.discountPrice && product?.price && product.discountPrice < product.price,
  )
  const discountPercentage = hasValidDiscount && product?.discountPrice && product?.price
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
    
    const cartProduct: Product = {
      ...product,
      categoryId: typeof product.categoryId === 'object'
        ? product.categoryId._id
        : product.categoryId,
      category: product.category && typeof product.category === 'object'
        ? product.category.name
        : product.category || undefined,
    }
    addToCart(cartProduct)
    toast.success(`${getProductName()} added to cart!`)
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

  const safeRender = (value: unknown, fallback: string = ''): string => {
    if (value == null) return fallback
    
    if (typeof value === 'object') {
      const objectValue = value as Record<string, unknown>
      if (typeof objectValue.name === 'string') {
        return objectValue.name
      }
      const stringValues = Object.values(objectValue).filter(v => typeof v === 'string')
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

  // ✅ LIST VIEW - Smaller image that fits without scrolling
  if (viewMode === 'list') {
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
        <div className="flex flex-col sm:flex-row gap-4 p-4">
          {/* Product Image - FIXED: Smaller size for list view */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imageError ? '/placeholder.png' : imageUrl}
                alt={safeRender(product.name, 'Product image')}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={() => {
                  console.log('Image failed to load:', imageUrl);
                  setImageError(true);
                }}
                loading="lazy"
                decoding="async"
              />
            </div>
            
            {/* Badges for list view */}
            <div className="absolute top-0 left-0 flex flex-col gap-1">
              {discountPercentage > 0 && (
                <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  -{discountPercentage}%
                </span>
              )}
              {product.stock === 0 && (
                <span className="bg-gray-800 text-white text-xs font-bold px-2 py-0.5 rounded">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
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

            <h3 className="font-medium text-gray-900 mb-1 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
                onClick={handleCardClick}>
              {safeRender(product.name, 'Unnamed Product')}
            </h3>

            <p className="text-sm text-gray-500 mb-2 line-clamp-1">
              {safeRender(product.brand, 'Unknown Brand')}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-2">
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

            {/* Action buttons for list view */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all ${
                  product.stock === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : isInCart(product._id)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isInCart(product._id) ? 'In Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              
              <button
                onClick={handleQuickView}
                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
                aria-label="Quick view"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // ✅ GRID VIEW - Original design (no changes)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: compact ? Math.min(index, 3) * 0.03 : index * 0.05 }}
      className={`card overflow-hidden group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 ${compact ? 'flex h-full flex-col' : ''}`}
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
      <div className={`relative overflow-hidden bg-gray-100 ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
        <img
          src={imageError ? '/placeholder.png' : imageUrl}
          alt={safeRender(product.name, 'Product image')}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => {
            console.log('Image failed to load:', imageUrl);
            setImageError(true);
          }}
          loading="lazy"
          decoding="async"
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
      <div className={`p-4 ${compact ? 'flex flex-1 flex-col' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">
            {getCategoryName()}
          </span>
          {product.rating && (
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <span className="text-xs text-gray-600 ml-1">
                {safeRender(product.rating?.toFixed(1), '0.0')} ({product.numReviews || 0})
              </span>
            </div>
          )}
        </div>

        <h3 className={`font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer ${compact ? 'min-h-12 line-clamp-2' : 'line-clamp-1'}`}
            onClick={handleCardClick}>
          {safeRender(product.name, 'Unnamed Product')}
        </h3>

        <p className={`text-sm text-gray-500 mb-3 ${compact ? 'min-h-10 line-clamp-2' : 'line-clamp-1'}`}>
          {safeRender(compact ? product.shortDescription || product.brand : product.brand, 'Quality product')}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {hasValidDiscount ? (
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

        {compact && (
          <div className="mt-auto pt-4">
            <div className="mb-2 flex min-h-5 items-center justify-between gap-2 text-xs">
              <span className={product.stock > 0 ? 'font-medium text-green-700' : 'font-medium text-red-700'}>
                {product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} left` : 'In stock') : 'Out of stock'}
              </span>
              {product.variants && product.variants.length > 0 && (
                <span className="text-gray-500">{product.variants.length} variants</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                product.stock === 0
                  ? 'cursor-not-allowed bg-gray-300'
                  : isInCart(product._id)
                    ? 'bg-green-700 hover:bg-green-800'
                    : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              <ShoppingCart className="mr-2 h-4 w-4" aria-hidden="true" />
              {product.stock === 0 ? 'Out of Stock' : isInCart(product._id) ? 'In Cart' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ProductCard

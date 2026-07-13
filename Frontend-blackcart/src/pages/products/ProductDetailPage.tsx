import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Star, Truck, Shield, RefreshCw, ShoppingCart,
  Minus, Plus, Share2, Package, AlertCircle, CheckCircle,
  ChevronRight, Facebook, Twitter, Linkedin
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../../services/productService'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import Breadcrumb from '../../components/common/Breadcrumb'
import Loader from '../../components/common/Loader'
import ProductCard from '../../components/product/ProductCard'
import ProductTabs from '../../components/product/ProductTabs'
import ImageGallery from '../../components/product/ImageGallery'
import { Product } from '../../types'
import { getImageUrl } from '../../utils/imageUtils'

const ProductDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>()
  const navigate = useNavigate()
  const { addToCart, isInCart, cartItems } = useCart()

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'shipping'>('description')
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [productImages, setProductImages] = useState<string[]>([])

  // Fetch product data
  const { data: productData, isLoading, error } = useQuery({
    queryKey: ['product', identifier],
    queryFn: () => {
      if (!identifier) throw new Error('No product identifier')
      return productService.getProduct(identifier)
    },
    enabled: !!identifier,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })

  const product = productData?.data?.product || productData?.data
  const reviews = product?.reviews || []
  const ratingStats = product?.ratingStats

  // ✅ FIXED: Process images when product loads - handles object format
  useEffect(() => {
    if (product?.images && Array.isArray(product.images)) {
      // Map each image object to a URL string using getImageUrl
      const images = product.images
        .map((img: any) => {
          try {
            return getImageUrl(img);
          } catch (err) {
            console.error('Error processing image:', err);
            return null;
          }
        })
        .filter((url: string | null): url is string =>
          url !== null && url !== '' && url !== '/placeholder.png'
        );

      // If we have images, use them; otherwise, add placeholder
      if (images.length > 0) {
        setProductImages(images);
      } else {
        setProductImages(['/placeholder.png']);
      }
    } else {
      setProductImages(['/placeholder.png']);
    }
  }, [product]);

  // ✅ FIXED: Check wishlist status
  // ✅ FIXED: Fetch related products
  const fetchRelatedProducts = async () => {
    try {
      if (!product?.category) return

      console.log(`🔍 Fetching related products for category: ${product.category}`)

      const response = await productService.getProductsByCategory(product.category, { limit: 4 })

      if (response.success && response.data?.products) {
        const filtered = response.data.products.filter((p: Product) =>
          p._id !== product._id
        )
        setRelatedProducts(filtered.slice(0, 4))
        console.log(`✅ Found ${filtered.length} related products`)
      } else {
        console.log('⚠️ No related products found:', response.message)
      }
    } catch (error) {
      console.error('❌ Error fetching related products:', error)
    }
  }

  // Fetch related products
  useEffect(() => {
    if (product?.category) {
      fetchRelatedProducts()
    }
  }, [product?.category])

  // Calculate discount
  const discountPercentage = product?.discountPrice && product?.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0

  // Stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50', icon: '❌' }
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: '⚠️' }
    return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50', icon: '✅' }
  }

  const stockStatus = getStockStatus(product?.stock || 0)

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleAddToCart = () => {
    if (!product) return

    if (product.stock === 0) {
      toast.error('This product is out of stock')
      return
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available`)
      return
    }

    const cartProduct = {
      _id: String(product._id),
      name: String(product.name || 'Product'),
      price: Number(product.discountPrice || product.price || 0),
      image: String(productImages[0] || '/placeholder.png'),
      stock: product.stock
    }

    addToCart(cartProduct, quantity)
    toast.success('Added to cart!')
  }

  // Handle buy now
  const handleBuyNow = () => {
    if (!product) return

    handleAddToCart()
    setTimeout(() => {
      navigate('/checkout')
    }, 500)
  }

  // ✅ FIXED: Handle wishlist toggle
  // Handle quantity change
  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (!product) return

    if (type === 'increase') {
      if (quantity >= (product.stock || 0)) {
        toast.error(`Only ${product.stock} items available`)
        return
      }
      setQuantity(prev => prev + 1)
    } else {
      if (quantity <= 1) return
      setQuantity(prev => prev - 1)
    }
  }

  // Handle share
  const handleShare = async () => {
    const url = window.location.href
    const text = `Check out ${product?.name} on BlackCart!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: text,
          url: url,
        })
      } catch (err) {
        console.log('Share cancelled:', err)
      }
    } else {
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  // Handle social share
  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out ${product?.name} on BlackCart!`)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer')
    }
  }

  // ✅ FIXED: Handle review form open


  // ✅ FIXED: Handle review form close


  // ✅ FIXED: Handle review submit


  // ✅ FIXED: Handle helpful click


  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: product?.category || 'Category', href: `/products?category=${product?.category}` },
    { label: product?.name || 'Product', href: '#', current: true }
  ]

  // Loading state
  if (isLoading) {
    return <Loader />
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error
              ? 'Failed to load product details. Please try again.'
              : 'The product you\'re looking for doesn\'t exist or has been removed.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  const productUrl = `https://blackcart.store/products/${identifier}`
  const productImage = productImages[0] || 'https://blackcart.store/BlackCart.png'
  const productPrice = product.discountPrice || product.price
  const schemaStockAvailability = product.stock > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
  const shortDescription = product.description
    ? product.description.replace(/<[^>]+>/g, '').slice(0, 150)
    : `Buy ${product.name} in Pakistan at the best price.`

  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: productImages.length > 0 ? productImages : [productImage],
    description: product.description || `${product.name} available at BlackCart Pakistan.`,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'BlackCart',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'PKR',
      price: productPrice,
      availability: schemaStockAvailability,
      seller: {
        '@type': 'Organization',
        name: 'BlackCart',
      },
    },
    ...(product.rating && product.numReviews
      ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.numReviews,
        },
      }
      : {}),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{product.name} — Buy in Pakistan | BlackCart</title>
        <meta name="description" content={`Buy ${product.name} in Pakistan at the best price. ${shortDescription}. Fast nationwide delivery. Order now at BlackCart.`} />
        <meta property="og:title" content={`${product.name} | BlackCart Pakistan`} />
        <meta property="og:description" content={`Buy ${product.name} online in Pakistan. ${shortDescription}`} />
        <meta property="og:image" content={productImage} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | BlackCart`} />
        <meta name="twitter:image" content={productImage} />
        <link rel="canonical" href={productUrl} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-2">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Review Form Modal */}
      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Images */}
          <div>
            <ImageGallery
              images={productImages.length > 0 ? productImages : ['/placeholder.png']}
              productName={product.name}
              initialImage={selectedImage}
              onImageChange={setSelectedImage}
            />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title & Meta */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {typeof product.category === 'object'
                    ? product.category.name || 'Category'
                    : product.category || 'Category'}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">SKU:</span>
                  <span className="text-sm font-medium text-gray-900">{product.sku}</span>
                </div>
              </div>

              {/* Reduced heading size: text-3xl lg:text-4xl -> text-2xl lg:text-3xl */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-5 w-5 ${index < Math.floor(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 font-medium text-gray-700">
                    {product.rating?.toFixed(1) || '0.0'}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-500">
                    {product.numReviews || 0} reviews
                  </span>
                </div>

                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Verified Product</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
              <div className="flex items-baseline space-x-4 mb-2">
                <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {formatPrice(product.discountPrice || product.price)}
                </span>

                {discountPercentage > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">
                      Save {discountPercentage}%
                    </span>
                  </>
                )}
              </div>

              <p className="text-sm text-gray-600">
                <span className="font-medium">Inclusive of all taxes</span> • Free shipping on orders over PKR 5,000
              </p>
            </div>

            {/* Stock Status */}
            {/*
            <div className={`p-4 rounded-xl ${stockStatus.bgColor} border ${stockStatus.color.replace('text', 'border')}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{stockStatus.icon}</span>
                  <div>
                    <span className={`font-bold ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.stock === 0 
                        ? 'Currently unavailable. Check back soon!'
                        : product.stock < 10
                        ? `Only ${product.stock} left in stock - order soon!`
                        : `${product.stock} units available for immediate dispatch`
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {product.stock > 0 && product.stock < 10 && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 transition-all duration-500"
                      style={{ width: `${(product.stock / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            */}

            {/* Short Description */}
            {product.shortDescription && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Overview</h3>
                <p className="text-gray-600">{product.shortDescription}</p>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="w-16 text-center text-lg font-bold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={product.stock && quantity >= product.stock}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Max: {product.stock} units
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all ${product.stock === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span className="font-medium">
                    {isInCart(product._id)
                      ? `Update Cart (${cartItems.find(item => item._id === product._id)?.quantity || 0})`
                      : product.stock === 0
                        ? 'Out of Stock'
                        : 'Add to Cart'
                    }
                  </span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${product.stock === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-black text-white'
                    }`}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Share
              </button>
            </div>

            {/* Social Sharing */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Share with friends:</p>
              <div className="flex space-x-3">
                {['facebook', 'twitter', 'linkedin', 'whatsapp'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => handleSocialShare(platform)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label={`Share on ${platform}`}
                  >
                    {platform === 'facebook' && <Facebook className="h-5 w-5 text-blue-600" />}
                    {platform === 'twitter' && <Twitter className="h-5 w-5 text-blue-400" />}
                    {platform === 'linkedin' && <Linkedin className="h-5 w-5 text-blue-700" />}
                    {platform === 'whatsapp' && <div className="h-5 w-5 bg-green-500 rounded"></div>}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">Free Delivery</div>
                  <div className="text-sm text-gray-500">All over Pakistan</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Warranty</div>
                  <div className="text-sm text-gray-500">{product.warranty || '1 Year'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium">Easy Returns</div>
                  <div className="text-sm text-gray-500">14-Day Policy</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium">Safe Packaging</div>
                  <div className="text-sm text-gray-500">Guaranteed</div>
                </div>
              </div>
            </div>

            {/* Brand & Tags */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Brand:</span>
                <span className="font-medium">{product.brand || 'Unknown'}</span>
              </div>
              {product.tags?.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {product.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{product.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <ProductTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          product={product}
          reviews={reviews}
          ratingStats={ratingStats}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                <p className="text-gray-600 mt-1">Customers also viewed these products</p>
              </div>
              <button
                onClick={() => navigate(`/products?category=${product.category}`)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard
                  key={relatedProduct._id}
                  product={relatedProduct}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetailPage

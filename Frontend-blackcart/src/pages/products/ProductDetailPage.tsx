

// // src/pages/products/ProductDetailPage.tsx 
// import React, { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { motion, AnimatePresence } from 'framer-motion'
// import { 
//   Star, Truck, Shield, RefreshCw, ShoppingCart, Heart, 
//   Minus, Plus, Share2, Package, Check, AlertCircle, 
//   TrendingUp, Clock, Tag, Users, Award, CheckCircle,
//   MapPin, Phone, Mail, Globe, Battery, Camera, Cpu,
//   HardDrive, Smartphone, Layers, ChevronRight, ChevronLeft,
//   Facebook, Twitter, Instagram, Linkedin, Youtube, X
// } from 'lucide-react'
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { productService } from '../../services/productService'
// import { reviewService } from '../../services/reviewService';
// import { userService } from '../../services/userService'
// import { useCart } from '../../context/CartContext'
// import { useAuth } from '../../context/AuthContext'
// import toast from 'react-hot-toast'
// import ReviewForm from '../../components/reviews/ReviewForm';
// import ReviewList from '../../components/reviews/ReviewList';
// import Breadcrumb from '../../components/common/Breadcrumb'
// import Loader from '../../components/common/Loader'
// import ProductCard from '../../components/product/ProductCard'
// import ProductTabs from '../../components/product/ProductTabs'
// import ImageGallery from '../../components/product/ImageGallery'
// import { Product, Review } from '../../types'
// import { getImageUrl } from '../../utils/imageUtils'

// const ProductDetailPage: React.FC = () => {
//   const { identifier } = useParams<{ identifier: string }>()
//   const navigate = useNavigate()
//   const { user, isAuthenticated } = useAuth()
//   const { addToCart, isInCart, cartItems } = useCart()
//   const queryClient = useQueryClient()
  
//   const [selectedImage, setSelectedImage] = useState(0)
//   const [quantity, setQuantity] = useState(1)
//   const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'shipping'>('description')
//   const [showReviewForm, setShowReviewForm] = useState(false)
//   const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
//   const [isWishlisted, setIsWishlisted] = useState(false)
//   const [productImages, setProductImages] = useState<string[]>([])
//   const [wishlistLoading, setWishlistLoading] = useState(false)

//   // Fetch product data
//   const { data: productData, isLoading, error, refetch } = useQuery({
//     queryKey: ['product', identifier],
//     queryFn: () => {
//       if (!identifier) throw new Error('No product identifier')
//       return productService.getProduct(identifier)
//     },
//     enabled: !!identifier,
//     retry: 1,
//     staleTime: 1000 * 60 * 5,
//   })

//   const product = productData?.data?.product || productData?.data
//   const reviews = product?.reviews || []
//   const ratingStats = product?.ratingStats

//   // ✅ FIXED: Remove the separate reviews query and use product data
//   // const { data: reviewsData, refetch: refetchReviews } = useQuery({
//   //   queryKey: ['product-reviews', product?._id],
//   //   queryFn: () => reviewService.getProductReviews(product?._id || ''),
//   //   enabled: !!product?._id,
//   // });

//   // Create review mutation
//   const createReviewMutation = useMutation({
//     mutationFn: (reviewData: {
//       productId: string;
//       rating: number;
//       comment: string;
//       title?: string;
//     }) => reviewService.createReview(reviewData),
//     onSuccess: (data) => {
//       if (data.success) {
//         toast.success('Review submitted successfully!');
//         setShowReviewForm(false);
//         // Refetch product data to update reviews
//         queryClient.invalidateQueries({ queryKey: ['product', identifier] });
//       } else {
//         toast.error(data.message || 'Failed to submit review');
//       }
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'Failed to submit review');
//     },
//   });

//   // Mark helpful mutation
//   const markHelpfulMutation = useMutation({
//     mutationFn: (reviewId: string) => reviewService.markHelpful(reviewId),
//     onSuccess: () => {
//       toast.success('Thank you for your feedback!');
//       queryClient.invalidateQueries({ queryKey: ['product', identifier] });
//     },
//     onError: (error: any) => {
//       toast.error(error.message || 'Failed to mark as helpful');
//     },
//   });

//   // ✅ FIXED: Process images when product loads
//   useEffect(() => {
//     if (product?.images) {
//       const images = product.images.map((img: any) => {
//         // return productService.getImageUrl(img)
//         //after deployment
//          return getImageUrl(img)
//       })
//       setProductImages(images)
//     }
//   }, [product])

//   // ✅ FIXED: Check wishlist status
//   useEffect(() => {
//     const checkWishlistStatus = async () => {
//       if (!product || !isAuthenticated || !user) {
//         setIsWishlisted(false)
//         return
//       }
      
//       try {
//         const response = await userService.getWishlist()
        
//         let wishlistItems: any[] = []
        
//         if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
//           wishlistItems = response.data.data.items.map((item: any) => item.product)
//         } else if (response.data?.items && Array.isArray(response.data.items)) {
//           wishlistItems = response.data.items.map((item: any) => item.product)
//         } else if (Array.isArray(response.data)) {
//           wishlistItems = response.data
//         }
        
//         const isInWishlist = wishlistItems.some((wishlistProduct: any) => 
//           wishlistProduct?._id === product._id || wishlistProduct === product._id
//         )
        
//         setIsWishlisted(isInWishlist)
        
//         // Update localStorage for consistency
//         try {
//           const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
//           const isInLocalStorage = currentWishlist.some((item: any) => item._id === product._id)
          
//           if (isInWishlist && !isInLocalStorage) {
//             currentWishlist.push({
//               _id: product._id,
//               name: product.name,
//               price: product.discountPrice || product.price,
//               image: productImages[0] || 'http://localhost:5000/uploads/placeholder.jpg',
//               addedAt: new Date().toISOString()
//             })
//             localStorage.setItem('wishlist', JSON.stringify(currentWishlist))
//           } else if (!isInWishlist && isInLocalStorage) {
//             const updated = currentWishlist.filter((item: any) => item._id !== product._id)
//             localStorage.setItem('wishlist', JSON.stringify(updated))
//           }
//         } catch (localStorageError) {
//           console.warn('LocalStorage sync failed:', localStorageError)
//         }
        
//       } catch (error) {
//         console.error('Error checking wishlist status:', error)
//         // Fallback to localStorage check
//         try {
//           const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
//           setIsWishlisted(wishlist.some((item: any) => item._id === product._id))
//         } catch {
//           setIsWishlisted(false)
//         }
//       }
//     }
    
//     checkWishlistStatus()
//   }, [product, isAuthenticated, user, productImages])

//   // ✅ FIXED: Fetch related products
//   const fetchRelatedProducts = async () => {
//     try {
//       if (!product?.category) return
      
//       console.log(`🔍 Fetching related products for category: ${product.category}`)
      
//       const response = await productService.getProductsByCategory(product.category, { limit: 4 })
      
//       if (response.success && response.data?.products) {
//         const filtered = response.data.products.filter((p: Product) => 
//           p._id !== product._id
//         )
//         setRelatedProducts(filtered.slice(0, 4))
//         console.log(`✅ Found ${filtered.length} related products`)
//       } else {
//         console.log('⚠️ No related products found:', response.message)
//       }
//     } catch (error) {
//       console.error('❌ Error fetching related products:', error)
//     }
//   }

//   // Fetch related products
//   useEffect(() => {
//     if (product?.category) {
//       fetchRelatedProducts()
//     }
//   }, [product?.category])

//   // Calculate discount
//   const discountPercentage = product?.discountPrice && product?.price
//     ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
//     : 0

//   // Stock status
//   const getStockStatus = (stock: number) => {
//     if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-50', icon: '❌' }
//     if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: '⚠️' }
//     return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-50', icon: '✅' }
//   }

//   const stockStatus = getStockStatus(product?.stock || 0)

//   // Format price
//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('en-PK', {
//       style: 'currency',
//       currency: 'PKR',
//       minimumFractionDigits: 0
//     }).format(price)
//   }

//   const handleAddToCart = () => {
//     if (!product) return
    
//     if (product.stock === 0) {
//       toast.error('This product is out of stock')
//       return
//     }
    
//     if (quantity > product.stock) {
//       toast.error(`Only ${product.stock} items available`)
//       return
//     }

//     const cartProduct = {
//       _id: String(product._id),
//       name: String(product.name || 'Product'),
//       price: Number(product.discountPrice || product.price || 0),
//       image: String(productImages[0] || 'http://localhost:5000/uploads/placeholder.jpg'),
//       stock: product.stock
//     }

//     addToCart(cartProduct, quantity)
//     toast.success('Added to cart!')
//   }

//   // Handle buy now
//   const handleBuyNow = () => {
//     if (!product) return
    
//     handleAddToCart()
//     setTimeout(() => {
//       navigate('/checkout')
//     }, 500)
//   }

//   // ✅ FIXED: Handle wishlist toggle
//   const handleWishlistToggle = async () => {
//     if (!product) return
    
//     if (!isAuthenticated || !user) {
//       toast.error('Please login to add to wishlist')
//       navigate('/login', { state: { returnUrl: `/products/${identifier}` } })
//       return
//     }
    
//     try {
//       setWishlistLoading(true)
      
//       if (isWishlisted) {
//         await userService.removeFromWishlist(product._id)
//         setIsWishlisted(false)
//         toast.success('Removed from wishlist')
//       } else {
//         await userService.addToWishlist(product._id)
//         setIsWishlisted(true)
//         toast.success('Added to wishlist!')
//       }
      
//       // Update localStorage
//       try {
//         const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
//         if (isWishlisted) {
//           const updated = wishlist.filter((item: any) => item._id !== product._id)
//           localStorage.setItem('wishlist', JSON.stringify(updated))
//         } else {
//           wishlist.push({
//             _id: product._id,
//             name: product.name,
//             price: product.discountPrice || product.price,
//             image: productImages[0] || 'http://localhost:5000/uploads/placeholder.jpg',
//             addedAt: new Date().toISOString()
//           })
//           localStorage.setItem('wishlist', JSON.stringify(wishlist))
//         }
//       } catch (localStorageError) {
//         console.warn('LocalStorage update failed')
//       }
      
//     } catch (err: any) {
//       console.error('Wishlist API error:', err)
//       toast.error(err?.response?.data?.message || 'Failed to update wishlist')
//     } finally {
//       setWishlistLoading(false)
//     }
//   }

//   // Handle quantity change
//   const handleQuantityChange = (type: 'increase' | 'decrease') => {
//     if (!product) return
    
//     if (type === 'increase') {
//       if (quantity >= (product.stock || 0)) {
//         toast.error(`Only ${product.stock} items available`)
//         return
//       }
//       setQuantity(prev => prev + 1)
//     } else {
//       if (quantity <= 1) return
//       setQuantity(prev => prev - 1)
//     }
//   }

//   // Handle share
//   const handleShare = async () => {
//     const url = window.location.href
//     const text = `Check out ${product?.name} on BlackCart!`
    
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: product?.name,
//           text: text,
//           url: url,
//         })
//       } catch (err) {
//         console.log('Share cancelled:', err)
//       }
//     } else {
//       navigator.clipboard.writeText(url)
//       toast.success('Link copied to clipboard!')
//     }
//   }

//   // Handle social share
//   const handleSocialShare = (platform: string) => {
//     const url = encodeURIComponent(window.location.href)
//     const text = encodeURIComponent(`Check out ${product?.name} on BlackCart!`)
    
//     const urls: Record<string, string> = {
//       facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
//       twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
//       linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
//       whatsapp: `https://wa.me/?text=${text}%20${url}`
//     }
    
//     if (urls[platform]) {
//       window.open(urls[platform], '_blank', 'noopener,noreferrer')
//     }
//   }

//   // ✅ FIXED: Handle review form open
//   const handleOpenReviewForm = () => {
//     if (!isAuthenticated) {
//       toast.error('Please login to write a review')
//       navigate('/login', { state: { returnUrl: `/products/${identifier}` } })
//       return
//     }
//     setShowReviewForm(true)
//   }

//   // ✅ FIXED: Handle review form close
//   const handleCloseReviewForm = () => {
//     setShowReviewForm(false)
//   }

//   // ✅ FIXED: Handle review submit
//   const handleReviewSubmit = async (reviewData: {
//     rating: number;
//     comment: string;
//     title?: string;
//   }) => {
//     if (!product) return;
    
//     return createReviewMutation.mutateAsync({
//       productId: product._id,
//       ...reviewData
//     });
//   }

//   // ✅ FIXED: Handle helpful click
//   const handleHelpfulClick = (reviewId: string) => {
//     if (!isAuthenticated) {
//       toast.error('Please login to mark reviews as helpful')
//       navigate('/login', { state: { returnUrl: `/products/${identifier}` } })
//       return
//     }
//     markHelpfulMutation.mutate(reviewId);
//   }

//   // Breadcrumb items
//   const breadcrumbItems = [
//     { label: 'Home', href: '/' },
//     { label: 'Products', href: '/products' },
//     { label: product?.category || 'Category', href: `/products?category=${product?.category}` },
//     { label: product?.name || 'Product', href: '#', current: true }
//   ]

//   // Loading state
//   if (isLoading) {
//     return <Loader />
//   }

//   // Error state
//   if (error || !product) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="container mx-auto px-4 text-center">
//           <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
//             <AlertCircle className="h-12 w-12 text-red-400" />
//           </div>
//           <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Not Found</h1>
//           <p className="text-gray-600 mb-6">
//             {error 
//               ? 'Failed to load product details. Please try again.' 
//               : 'The product you\'re looking for doesn\'t exist or has been removed.'
//             }
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button
//               onClick={() => navigate(-1)}
//               className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
//             >
//               Go Back
//             </button>
//             <button
//               onClick={() => navigate('/products')}
//               className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Browse Products
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Breadcrumb */}
//       <div className="container mx-auto px-4 py-4">
//         <Breadcrumb items={breadcrumbItems} />
//       </div>

//       {/* Review Form Modal */}
//       <AnimatePresence>
//         {showReviewForm && (
//           <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div className="flex min-h-screen items-center justify-center p-4">
//               <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCloseReviewForm} />
//               <div className="relative z-50 w-full max-w-md">
//                 <ReviewForm
//                   productId={product._id}
//                   productName={product.name}
//                   onSubmit={handleReviewSubmit}
//                   onCancel={handleCloseReviewForm}
//                 />
//               </div>
//             </div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Main Product Section */}
//       <div className="container mx-auto px-4 py-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//           {/* Left Column - Images */}
//           <div>
//             <ImageGallery
//               images={productImages}
//               productName={product.name}
//               initialImage={selectedImage}
//               onImageChange={setSelectedImage}
//             />
//           </div>

//           {/* Right Column - Product Info */}
//           <div className="space-y-6">
//             {/* Product Title & Meta */}
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
//                   {product.category}
//                 </span>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-sm text-gray-500">SKU:</span>
//                   <span className="text-sm font-medium text-gray-900">{product.sku}</span>
//                 </div>
//               </div>
              
//               <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
//                 {product.name}
//               </h1>
              
//               <div className="flex items-center space-x-4 mb-4">
//                 <div className="flex items-center">
//                   <div className="flex">
//                     {[...Array(5)].map((_, index) => (
//                       <Star
//                         key={index}
//                         className={`h-5 w-5 ${
//                           index < Math.floor(product.rating || 0)
//                             ? 'text-yellow-400 fill-current'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="ml-2 font-medium text-gray-700">
//                     {product.rating?.toFixed(1) || '0.0'}
//                   </span>
//                   <span className="mx-2 text-gray-400">•</span>
//                   <span className="text-gray-500">
//                     {product.numReviews || 0} reviews
//                   </span>
//                 </div>
                
//                 <div className="flex items-center text-green-600">
//                   <CheckCircle className="h-4 w-4 mr-1" />
//                   <span className="text-sm">Verified Product</span>
//                 </div>
//               </div>
//             </div>

//             {/* Price Section */}
//             <div className="p-6 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100">
//               <div className="flex items-baseline space-x-4 mb-2">
//                 <span className="text-3xl lg:text-4xl font-bold text-gray-900">
//                   {formatPrice(product.discountPrice || product.price)}
//                 </span>
                
//                 {discountPercentage > 0 && (
//                   <>
//                     <span className="text-xl text-gray-500 line-through">
//                       {formatPrice(product.price)}
//                     </span>
//                     <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-lg">
//                       Save {discountPercentage}%
//                     </span>
//                   </>
//                 )}
//               </div>
              
//               <p className="text-sm text-gray-600">
//                 <span className="font-medium">Inclusive of all taxes</span> • Free shipping on orders over PKR 5,000
//               </p>
//             </div>

//             {/* Stock Status */}
//             <div className={`p-4 rounded-xl ${stockStatus.bgColor} border ${stockStatus.color.replace('text', 'border')}`}>
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center">
//                   <span className="text-lg mr-2">{stockStatus.icon}</span>
//                   <div>
//                     <span className={`font-bold ${stockStatus.color}`}>
//                       {stockStatus.text}
//                     </span>
//                     <p className="text-sm text-gray-600 mt-1">
//                       {product.stock === 0 
//                         ? 'Currently unavailable. Check back soon!'
//                         : product.stock < 10
//                         ? `Only ${product.stock} left in stock - order soon!`
//                         : `${product.stock} units available for immediate dispatch`
//                       }
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               {product.stock > 0 && product.stock < 10 && (
//                 <div className="mt-3">
//                   <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
//                     <div 
//                       className="h-full bg-red-500 transition-all duration-500"
//                       style={{ width: `${(product.stock / 10) * 100}%` }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Short Description */}
//             {product.shortDescription && (
//               <div className="p-4 bg-gray-50 rounded-lg">
//                 <h3 className="font-semibold text-gray-900 mb-2">Quick Overview</h3>
//                 <p className="text-gray-600">{product.shortDescription}</p>
//               </div>
//             )}

//             {/* Quantity & Actions */}
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Quantity
//                 </label>
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
//                     <button
//                       onClick={() => handleQuantityChange('decrease')}
//                       className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       disabled={quantity <= 1}
//                     >
//                       <Minus className="h-5 w-5" />
//                     </button>
//                     <span className="w-16 text-center text-lg font-bold">{quantity}</span>
//                     <button
//                       onClick={() => handleQuantityChange('increase')}
//                       className="flex items-center justify-center w-12 h-12 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                       disabled={product.stock && quantity >= product.stock}
//                     >
//                       <Plus className="h-5 w-5" />
//                     </button>
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     Max: {product.stock} units
//                   </span>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-4">
//                 <button
//                   onClick={handleAddToCart}
//                   disabled={product.stock === 0}
//                   className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all ${
//                     product.stock === 0
//                       ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                       : 'bg-blue-600 hover:bg-blue-700 text-white'
//                   }`}
//                 >
//                   <ShoppingCart className="h-5 w-5" />
//                   <span className="font-medium">
//                     {isInCart(product._id) 
//                       ? `Update Cart (${cartItems.find(item => item._id === product._id)?.quantity || 0})` 
//                       : product.stock === 0 
//                       ? 'Out of Stock' 
//                       : 'Add to Cart'
//                     }
//                   </span>
//                 </button>
                
//                 <button
//                   onClick={handleBuyNow}
//                   disabled={product.stock === 0}
//                   className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
//                     product.stock === 0
//                       ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                       : 'bg-gray-900 hover:bg-black text-white'
//                   }`}
//                 >
//                   Buy Now
//                 </button>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 onClick={handleWishlistToggle}
//                 disabled={wishlistLoading}
//                 className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
//                   isWishlisted
//                     ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
//                     : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
//                 } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
//               >
//                 <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''} ${wishlistLoading ? 'animate-pulse' : ''}`} />
//                 {wishlistLoading ? 'Processing...' : isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
//               </button>
              
//               <button
//                 onClick={handleShare}
//                 className="flex items-center justify-center gap-2 py-3 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
//               >
//                 <Share2 className="h-5 w-5" />
//                 Share
//               </button>
//             </div>

//             {/* Social Sharing */}
//             <div className="pt-4 border-t border-gray-200">
//               <p className="text-sm text-gray-600 mb-3">Share with friends:</p>
//               <div className="flex space-x-3">
//                 {['facebook', 'twitter', 'linkedin', 'whatsapp'].map((platform) => (
//                   <button
//                     key={platform}
//                     onClick={() => handleSocialShare(platform)}
//                     className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
//                     aria-label={`Share on ${platform}`}
//                   >
//                     {platform === 'facebook' && <Facebook className="h-5 w-5 text-blue-600" />}
//                     {platform === 'twitter' && <Twitter className="h-5 w-5 text-blue-400" />}
//                     {platform === 'linkedin' && <Linkedin className="h-5 w-5 text-blue-700" />}
//                     {platform === 'whatsapp' && <div className="h-5 w-5 bg-green-500 rounded"></div>}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Features */}
//             <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
//               <div className="flex items-center gap-3">
//                 <Truck className="h-5 w-5 text-green-600" />
//                 <div>
//                   <div className="font-medium">Free Delivery</div>
//                   <div className="text-sm text-gray-500">All over Pakistan</div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Shield className="h-5 w-5 text-blue-600" />
//                 <div>
//                   <div className="font-medium">Warranty</div>
//                   <div className="text-sm text-gray-500">{product.warranty || '1 Year'}</div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <RefreshCw className="h-5 w-5 text-purple-600" />
//                 <div>
//                   <div className="font-medium">Easy Returns</div>
//                   <div className="text-sm text-gray-500">14-Day Policy</div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Package className="h-5 w-5 text-orange-600" />
//                 <div>
//                   <div className="font-medium">Safe Packaging</div>
//                   <div className="text-sm text-gray-500">Guaranteed</div>
//                 </div>
//               </div>
//             </div>

//             {/* Brand & Tags */}
//             <div className="pt-6 border-t border-gray-200">
//               <div className="flex items-center justify-between mb-3">
//                 <span className="text-sm text-gray-600">Brand:</span>
//                 <span className="font-medium">{product.brand || 'Unknown'}</span>
//               </div>
//               {product.tags?.length > 0 && (
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">Tags:</span>
//                   <div className="flex flex-wrap gap-1 justify-end">
//                     {product.tags.slice(0, 3).map((tag: string, index: number) => (
//                       <span
//                         key={index}
//                         className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                     {product.tags.length > 3 && (
//                       <span className="text-xs text-gray-500">
//                         +{product.tags.length - 3} more
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Product Tabs - Updated to include reviews */}
//         <ProductTabs
//           activeTab={activeTab}
//           onTabChange={setActiveTab}
//           product={product}
//           reviews={reviews} // ✅ Use reviews from product data
//           ratingStats={ratingStats}
//           onReviewSubmit={handleOpenReviewForm}
//           onHelpfulClick={handleHelpfulClick}
//         />

//         {/* Related Products */}
//         {relatedProducts.length > 0 && (
//           <div className="mt-16">
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
//                 <p className="text-gray-600 mt-1">Customers also viewed these products</p>
//               </div>
//               <button
//                 onClick={() => navigate(`/products?category=${product.category}`)}
//                 className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 View All
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {relatedProducts.map((relatedProduct, index) => (
//                 <ProductCard
//                   key={relatedProduct._id}
//                   product={relatedProduct}
//                   index={index}
//                 />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ProductDetailPage

//fix after deployment image showing issue

// src/pages/products/ProductDetailPage.tsx 
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, Truck, Shield, RefreshCw, ShoppingCart, Heart, 
  Minus, Plus, Share2, Package, Check, AlertCircle, 
  TrendingUp, Clock, Tag, Users, Award, CheckCircle,
  MapPin, Phone, Mail, Globe, Battery, Camera, Cpu,
  HardDrive, Smartphone, Layers, ChevronRight, ChevronLeft,
  Facebook, Twitter, Instagram, Linkedin, Youtube, X
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productService } from '../../services/productService'
import { reviewService } from '../../services/reviewService';
import { userService } from '../../services/userService'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import Breadcrumb from '../../components/common/Breadcrumb'
import Loader from '../../components/common/Loader'
import ProductCard from '../../components/product/ProductCard'
import ProductTabs from '../../components/product/ProductTabs'
import ImageGallery from '../../components/product/ImageGallery'
import { Product, Review } from '../../types'
import { getImageUrl } from '../../utils/imageUtils'

const ProductDetailPage: React.FC = () => {
  const { identifier } = useParams<{ identifier: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { addToCart, isInCart, cartItems } = useCart()
  const queryClient = useQueryClient()
  
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'shipping'>('description')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [productImages, setProductImages] = useState<string[]>([])
  const [wishlistLoading, setWishlistLoading] = useState(false)

  // Fetch product data
  const { data: productData, isLoading, error, refetch } = useQuery({
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

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: (reviewData: {
      productId: string;
      rating: number;
      comment: string;
      title?: string;
    }) => reviewService.createReview(reviewData),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Review submitted successfully!');
        setShowReviewForm(false);
        queryClient.invalidateQueries({ queryKey: ['product', identifier] });
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });

  // Mark helpful mutation
  const markHelpfulMutation = useMutation({
    mutationFn: (reviewId: string) => reviewService.markHelpful(reviewId),
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      queryClient.invalidateQueries({ queryKey: ['product', identifier] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark as helpful');
    },
  });

  // ✅ FIXED: Process images when product loads - handles object format
  useEffect(() => {
    if (product?.images && Array.isArray(product.images)) {
      // Map each image object to a URL string using getImageUrl
      const images = product.images
        .map((img: any) => getImageUrl(img))
        .filter((url: string) => url && url !== '/placeholder.png'); // Remove invalid URLs
      
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
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product || !isAuthenticated || !user) {
        setIsWishlisted(false)
        return
      }
      
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
        
        // Update localStorage for consistency
        try {
          const currentWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
          const isInLocalStorage = currentWishlist.some((item: any) => item._id === product._id)
          
          if (isInWishlist && !isInLocalStorage) {
            currentWishlist.push({
              _id: product._id,
              name: product.name,
              price: product.discountPrice || product.price,
              image: productImages[0] || '/placeholder.png',
              addedAt: new Date().toISOString()
            })
            localStorage.setItem('wishlist', JSON.stringify(currentWishlist))
          } else if (!isInWishlist && isInLocalStorage) {
            const updated = currentWishlist.filter((item: any) => item._id !== product._id)
            localStorage.setItem('wishlist', JSON.stringify(updated))
          }
        } catch (localStorageError) {
          console.warn('LocalStorage sync failed:', localStorageError)
        }
        
      } catch (error) {
        console.error('Error checking wishlist status:', error)
        // Fallback to localStorage check
        try {
          const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
          setIsWishlisted(wishlist.some((item: any) => item._id === product._id))
        } catch {
          setIsWishlisted(false)
        }
      }
    }
    
    checkWishlistStatus()
  }, [product, isAuthenticated, user, productImages])

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
  const handleWishlistToggle = async () => {
    if (!product) return
    
    if (!isAuthenticated || !user) {
      toast.error('Please login to add to wishlist')
      navigate('/login', { state: { returnUrl: `/products/${identifier}` } })
      return
    }
    
    try {
      setWishlistLoading(true)
      
      if (isWishlisted) {
        await userService.removeFromWishlist(product._id)
        setIsWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await userService.addToWishlist(product._id)
        setIsWishlisted(true)
        toast.success('Added to wishlist!')
      }
      
      // Update localStorage
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]')
        if (isWishlisted) {
          const updated = wishlist.filter((item: any) => item._id !== product._id)
          localStorage.setItem('wishlist', JSON.stringify(updated))
        } else {
          wishlist.push({
            _id: product._id,
            name: product.name,
            price: product.discountPrice || product.price,
            image: productImages[0] || '/placeholder.png',
            addedAt: new Date().toISOString()
          })
          localStorage.setItem('wishlist', JSON.stringify(wishlist))
        }
      } catch (localStorageError) {
        console.warn('LocalStorage update failed')
      }
      
    } catch (err: any) {
      console.error('Wishlist API error:', err)
      toast.error(err?.response?.data?.message || 'Failed to update wishlist')
    } finally {
      setWishlistLoading(false)
    }
  }

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
  const handleOpenReviewForm = () => {
    if (!isAuthenticated) {
      toast.error('Please login to write a review')
      navigate('/login', { state: { returnUrl: `/products/${identifier}` } })
      return
    }
    setShowReviewForm(true)
  }

  // ✅ FIXED: Handle review form close
  const handleCloseReviewForm = () => {
    setShowReviewForm(false)
  }

  // ✅ FIXED: Handle review submit
  const handleReviewSubmit = async (reviewData: {
    rating: number;
    comment: string;
    title?: string;
  }) => {
    if (!product) return;
    
    return createReviewMutation.mutateAsync({
      productId: product._id,
      ...reviewData
    });
  }

  // ✅ FIXED: Handle helpful click
  const handleHelpfulClick = (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to mark reviews as helpful')
      navigate('/login', { state: { returnUrl: `/products/${identifier}` } })
      return
    }
    markHelpfulMutation.mutate(reviewId);
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleCloseReviewForm} />
              <div className="relative z-50 w-full max-w-md">
                <ReviewForm
                  productId={product._id}
                  productName={product.name}
                  onSubmit={handleReviewSubmit}
                  onCancel={handleCloseReviewForm}
                />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Images */}
          <div>
            <ImageGallery
              images={productImages}
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
                  {product.category}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">SKU:</span>
                  <span className="text-sm font-medium text-gray-900">{product.sku}</span>
                </div>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`h-5 w-5 ${
                          index < Math.floor(product.rating || 0)
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
                  className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl transition-all ${
                    product.stock === 0
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
                  className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all ${
                    product.stock === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 hover:bg-black text-white'
                  }`}
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''} ${wishlistLoading ? 'animate-pulse' : ''}`} />
                {wishlistLoading ? 'Processing...' : isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              
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
          onReviewSubmit={handleOpenReviewForm}
          onHelpfulClick={handleHelpfulClick}
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
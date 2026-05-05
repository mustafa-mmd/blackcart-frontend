// import React from 'react'
// import { motion } from 'framer-motion'
// import { Link, useNavigate } from 'react-router-dom'
// import {
//   ArrowRight,
//   Shield,
//   Truck,
//   CreditCard,
//   Star,
//   Headphones,
//   Keyboard,
//   Mouse,
//   Monitor,
//   Laptop,
//   Webcam,
//   Music,
//   TrendingUp,
//   Sparkles,
//   Clock,
//   Award,
//   ShoppingBag,
//   Users,
//   AlertCircle,
//   RefreshCw,
//   Package
// } from 'lucide-react'
// import { useQuery } from '@tanstack/react-query'
// import { productService } from '../services/productService'
// import ProductCard from '../components/product/ProductCard'
// import Loader from '../components/common/Loader'

// const HomePage: React.FC = () => {
//   const navigate = useNavigate();

//   const {
//     data: homeProductsData,
//     isLoading: homeProductsLoading,
//     error: homeProductsError,
//     refetch: refetchHomeProducts
//   } = useQuery({
//     queryKey: ['homeProducts'],
//     queryFn: () => productService.getProducts({ limit: 16 }),
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   })

//   const features = [
//     {
//       icon: <Truck className="h-8 w-8 text-blue-600" />,
//       title: 'Fast Delivery',
//       description: 'Across Pakistan in 3-7 business days'
//     },
//     {
//       icon: <Shield className="h-8 w-8 text-blue-600" />,
//       title: 'Secure Payments',
//       description: '100% secure with multiple payment options'
//     },
//     {
//       icon: <CreditCard className="h-8 w-8 text-blue-600" />,
//       title: 'Easy Returns',
//       description: '14-day return policy for all products'
//     },
//     {
//       icon: <Star className="h-8 w-8 text-blue-600" />,
//       title: 'Quality Products',
//       description: 'Verified quality from trusted brands'
//     },
//   ]

//   const accessories = [
//     {
//       icon: <Mouse className="h-8 w-8 text-red-500" />,
//       name: "Gaming Mouse",
//       category: "mouse",
//       bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20",
//     },
//     {
//       icon: <Keyboard className="h-8 w-8 text-green-500" />,
//       name: "Keyboard",
//       category: "keyboard",
//       bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20",
//     },
//     {
//       icon: <Headphones className="h-8 w-8 text-purple-500" />,
//       name: "Headset",
//       category: "headphones",
//       bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20",
//     },
//     {
//       icon: <Monitor className="h-8 w-8 text-blue-500" />,
//       name: "Monitor",
//       category: "monitor",
//       bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
//     },
//     {
//       icon: <Webcam className="h-8 w-8 text-yellow-500" />,
//       name: "Webcam",
//       category: "webcam",
//       bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20",
//     },
//     {
//       icon: <Music className="h-8 w-8 text-pink-500" />,
//       name: "Speakers",
//       category: "speakers",
//       bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20",
//     },
//   ]

//   // accessories for full sections (with longer names)
//   const accessoriesFull = [
//     { icon: <Mouse className="h-12 w-12 text-red-500" />, name: "Gaming Mouse", bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20" },
//     { icon: <Keyboard className="h-12 w-12 text-green-500" />, name: "Mechanical Keyboard", bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20" },
//     { icon: <Headphones className="h-12 w-12 text-purple-500" />, name: "Wireless Headset", bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20" },
//     { icon: <Monitor className="h-12 w-12 text-blue-500" />, name: "Gaming Monitor", bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20" },
//     { icon: <Webcam className="h-12 w-12 text-yellow-500" />, name: "HD Webcam", bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20" },
//     { icon: <Music className="h-12 w-12 text-pink-500" />, name: "Studio Speakers", bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20" },
//   ]

//   const allProducts = homeProductsData?.data?.products || []
//   const featuredProducts = allProducts.slice(0, 4)
//   const newArrivalProducts = allProducts.slice(4, 8)

//   const isLoading = homeProductsLoading
//   const hasErrors = !!homeProductsError
//   const isDatabaseEmpty = !isLoading && !hasErrors && allProducts.length === 0

//   const handleRetry = async () => {
//     try {
//       await refetchHomeProducts()
//       setTimeout(() => {
//         window.location.reload()
//       }, 500)
//     } catch (error) {
//       console.error('Error during retry:', error)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//         <div className="text-center">
//           <Loader size="lg" />
//           <p className="mt-4 text-gray-600 text-lg">Loading amazing products...</p>
//           <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
//         </div>
//       </div>
//     )
//   }

//   if (hasErrors) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
//         <div className="max-w-md text-center">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
//             <AlertCircle className="h-10 w-10 text-red-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
//           <p className="text-gray-600 mb-6">
//             We're having trouble loading products. This might be due to server issues.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <button onClick={handleRetry} className="btn-primary inline-flex items-center justify-center">
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Try Again
//             </button>
//             <Link to="/products" className="btn-secondary inline-flex items-center justify-center">
//               <Package className="h-4 w-4 mr-2" />
//               Browse All Products
//             </Link>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (isDatabaseEmpty) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden min-h-[70vh] flex items-center">
//           <div className="absolute inset-0 bg-black/20" />
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative w-full">
//             <div className="text-center max-w-3xl mx-auto">
//               <h1 className="text-4xl md:text-6xl font-bold mb-6">
//                 Welcome to <span className="text-yellow-300">BlackCart</span>
//               </h1>
//               <p className="text-xl md:text-2xl text-white/80 mb-8">
//                 Pakistan's premier e-commerce destination for laptops & computer accessories.
//               </p>
//               <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
//                 <div className="flex items-center justify-center mb-3">
//                   <AlertCircle className="h-8 w-8 text-yellow-300 mr-3" />
//                   <h3 className="text-xl font-bold text-white">Admin Notice</h3>
//                 </div>
//                 <p className="text-white/90 mb-4">No products found in the database. Please add products to start selling.</p>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                   <Link to="/admin/dashboard" className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all inline-flex items-center justify-center">
//                     <ShoppingBag className="h-5 w-5 mr-2" />Add Products (Admin)
//                   </Link>
//                   <Link to="/dashboard" className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center">
//                     Go to Dashboard
//                   </Link>
//                 </div>
//               </div>
//               <div className="mt-8">
//                 <p className="text-lg text-white/80 mb-6">Our product catalog is being updated. Check back soon for amazing deals!</p>
//                 <Link to="/categories" className="inline-flex items-center bg-white/20 hover:bg-white/30 border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
//                   <Package className="h-5 w-5 mr-2" />Browse Categories
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="py-16 bg-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold mb-4 text-gray-900">Coming Soon!</h2>
//               <p className="text-gray-600 max-w-2xl mx-auto">We're preparing amazing products for you. Here's what to expect:</p>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {[
//                 { icon: <Sparkles className="h-6 w-6 text-blue-600" />, bg: 'bg-blue-100', title: 'Featured Products', desc: 'Handpicked quality products from top brands will be available soon.', color: 'text-blue-600', border: 'border-blue-100', gradient: 'from-blue-50 to-indigo-50' },
//                 { icon: <Clock className="h-6 w-6 text-green-600" />, bg: 'bg-green-100', title: 'New Arrivals', desc: 'Stay tuned for the latest products and cutting-edge technology.', color: 'text-green-600', border: 'border-green-100', gradient: 'from-green-50 to-teal-50' },
//                 { icon: <TrendingUp className="h-6 w-6 text-purple-600" />, bg: 'bg-purple-100', title: 'Trending Products', desc: "Discover what's popular and trending in the tech world.", color: 'text-purple-600', border: 'border-purple-100', gradient: 'from-purple-50 to-pink-50' },
//               ].map((item, i) => (
//                 <div key={i} className={`bg-gradient-to-br ${item.gradient} rounded-xl p-6 border ${item.border}`}>
//                   <div className="flex items-center mb-4">
//                     <div className={`p-3 ${item.bg} rounded-full mr-4`}>{item.icon}</div>
//                     <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
//                   </div>
//                   <p className="text-gray-600 mb-4">{item.desc}</p>
//                   <div className={`flex items-center text-sm ${item.color}`}>
//                     <Clock className="h-4 w-4 mr-2" />Coming soon
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="py-16 bg-gray-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose BlackCart?</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//               {features.map((feature, index) => (
//                 <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-lg">
//                   <div className="mb-4 flex justify-center"><div className="p-3 bg-blue-50 rounded-full">{feature.icon}</div></div>
//                   <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
//                   <p className="text-gray-600">{feature.description}</p>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-8">
//               <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
//               <p className="text-gray-300 max-w-2xl mx-auto">Join our community of satisfied customers across Pakistan</p>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//               {[
//                 { icon: <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />, val: '4.8/5', label: 'Customer Rating' },
//                 { icon: <Truck className="h-12 w-12 text-green-400 mx-auto mb-4" />, val: '50K+', label: 'Successful Deliveries' },
//                 { icon: <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />, val: '100%', label: 'Secure Payments' },
//                 { icon: <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />, val: '24/7', label: 'Customer Support' },
//               ].map((s, i) => (
//                 <div key={i} className="text-center">{s.icon}<div className="text-3xl font-bold mb-2">{s.val}</div><div className="text-gray-300">{s.label}</div></div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//             <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience the Best Shopping?</h2>
//             <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">Join thousands of satisfied customers across Pakistan who trust BlackCart for their shopping needs.</p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link to="/register" className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all">Create Free Account</Link>
//               <Link to="/products" className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg text-lg transition-colors">Browse Products</Link>
//             </div>
//           </div>
//         </section>
//       </div>
//     )
//   }

//   // ─── Normal rendering when products exist ────────────────────────────────────
//   return (
//     <div>
//       {/* ✅ FIXED: Hero fits exactly one screen — navbar height subtracted */}
//       <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden min-h-[calc(100vh-80px)] flex items-center">
//         <div className="absolute inset-0 bg-black/20" />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative w-full">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

//             {/* LEFT side — unchanged */}
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8 }}
//               className="max-w-2xl"
//             >
//               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
//                 Welcome to <span className="text-yellow-300">BlackCart</span>
//               </h1>
//               <p className="text-base md:text-xl lg:text-2xl text-white/80 mb-6">
//                 Pakistan's premier e-commerce destination for laptops & computer accessories. Shop from thousands of products with secure payments and fast delivery.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <Link
//                   to="/products"
//                   className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center justify-center"
//                 >
//                   Start Shopping
//                   <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
//                 </Link>
//                 <Link
//                   to="/categories"
//                   className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-colors text-center"
//                 >
//                   Browse Categories
//                 </Link>
//               </div>
//             </motion.div>

//             {/* ✅ FIXED: RIGHT side — compact card so nothing overflows viewport */}
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="hidden lg:block"
//             >
//               <div className="relative">
//                 <div className="absolute -top-6 -right-6 w-48 h-48 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
//                 <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />

//                 {/* ✅ Reduced padding: p-6 → p-4 */}
//                 <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
//                   <h3 className="text-lg font-bold mb-3 text-center">Premium Computer Accessories</h3>

//                   {/* ✅ Reduced margin: mb-6 → mb-3, inner padding p-4 md:p-6 → p-3 */}
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.3 }}
//                     className="mb-3"
//                   >
//                     <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border border-gray-700/50">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <h4 className="text-base font-bold mb-1 flex items-center gap-2">
//                             <Laptop className="h-5 w-5 text-yellow-400" />
//                             Premium Laptops
//                           </h4>
//                           <p className="text-gray-300 text-sm mb-2">Latest models from top brands</p>
//                           <Link
//                             to="/categories"
//                             className="inline-flex items-center text-yellow-300 hover:text-yellow-200 font-medium text-sm"
//                           >
//                             Explore Collection
//                             <ArrowRight className="ml-1 h-3 w-3" />
//                           </Link>
//                         </div>
//                         <div className="text-4xl">💻</div>
//                       </div>
//                     </div>
//                   </motion.div>

//                   {/* ✅ FIXED: Compact accessory cards — p-2, smaller icons, no long names */}
//                   <div className="grid grid-cols-3 gap-2">
//                     {accessories.map((item, index) => (
//                       <motion.div
//                         key={index}
//                         initial={{ opacity: 0, scale: 0.8 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
//                         className={`${item.bgClass} backdrop-blur-sm rounded-xl p-2 text-center border border-white/10 cursor-pointer hover:scale-105 transition-transform`}
//                       >
//                         <div className="mb-1 flex justify-center">
//                           <div className={`p-1.5 rounded-full ${item.bgClass} border border-white/30`}>
//                             {/* ✅ Smaller icon size: h-8 w-8 → h-6 w-6 */}
//                             {React.cloneElement(item.icon, { className: "h-5 w-5" })}
//                           </div>
//                         </div>
//                         {/* ✅ Shorter names used from accessories array */}
//                         <span className="text-xs font-medium text-white leading-tight">{item.name}</span>
//                       </motion.div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         </div>
//       </section>

//       {/* Accessories Section — Mobile only */}
//       <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white lg:hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8 md:mb-10">
//             <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Premium Accessories</h2>
//             <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">Enhance your setup with our top-quality computer accessories</p>
//           </div>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
//             {accessoriesFull.map((item, index) => (
//               <div key={index} className={`${item.bgClass} rounded-xl p-3 md:p-5 text-center border border-white/10 hover:scale-105 transition-transform`}>
//                 <div className="mb-2 md:mb-4 flex justify-center">
//                   <div className={`p-2 md:p-4 rounded-full ${item.bgClass} border border-white/30`}>
//                     {React.cloneElement(item.icon, { className: "h-6 w-6 md:h-8 md:w-8" })}
//                   </div>
//                 </div>
//                 <span className="text-xs md:text-sm font-medium">{item.name}</span>
//               </div>
//             ))}
//           </div>
//           <div className="text-center mt-6 md:mt-8">
//             <Link to="/products?category=accessories" className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-sm md:text-lg transition-colors">
//               View All Accessories
//               <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Featured Products */}
//       {featuredProducts.length > 0 && (
//         <section className="py-12 md:py-16">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between mb-6 md:mb-8">
//               <div>
//                 <div className="flex items-center mb-1 md:mb-2">
//                   <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 mr-2" />
//                   <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Products</h2>
//                 </div>
//                 <p className="text-sm md:text-base text-gray-600">Handpicked quality products for you</p>
//               </div>
//               <Link to="/products?featured=true" className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">
//                 View All
//                 <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//               {featuredProducts.map((product: any, index: number) => (
//                 <ProductCard key={product._id} product={product} index={index} />
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* New Arrivals */}
//       {newArrivalProducts.length > 0 && (
//         <section className="py-12 md:py-16 bg-gray-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between mb-6 md:mb-8">
//               <div>
//                 <div className="flex items-center mb-1 md:mb-2">
//                   <Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-2" />
//                   <h2 className="text-xl md:text-2xl font-bold text-gray-900">New Arrivals</h2>
//                 </div>
//                 <p className="text-sm md:text-base text-gray-600">Discover our latest products</p>
//               </div>
//               <Link to="/products?newArrivals=true" className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base">
//                 View All
//                 <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//               {newArrivalProducts.map((product: any, index: number) => (
//                 <ProductCard key={product._id} product={product} index={index} />
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Popular Computer Accessories — Desktop only */}
//       <section className="py-12 md:py-20 bg-gray-50 hidden lg:block">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8 md:mb-12">
//             <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">Popular Computer Accessories</h2>
//             <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">Upgrade your workspace with our bestselling accessories</p>
//           </div>
//           <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
//             {accessoriesFull.map((item, index) => (
//               <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="bg-white rounded-xl p-4 md:p-5 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
//                 <div className="mb-3 md:mb-4 flex justify-center">
//                   <div className={`p-3 md:p-4 rounded-full ${item.bgClass}`}>
//                     {React.cloneElement(item.icon, { className: "h-8 w-8 md:h-10 md:w-10" })}
//                   </div>
//                 </div>
//                 <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">{item.name}</h3>
//                 <Link to="/products" className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium inline-flex items-center gap-1">
//                   Shop now <ArrowRight className="h-3 w-3" />
//                 </Link>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Why Choose BlackCart */}
//       <section className="py-12 md:py-16 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">Why Choose BlackCart?</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             {features.map((feature, index) => (
//               <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="bg-gray-50 rounded-xl p-5 md:p-6 text-center border border-gray-200 shadow-lg">
//                 <div className="mb-3 md:mb-4 flex justify-center"><div className="p-2 md:p-3 bg-blue-50 rounded-full">{feature.icon}</div></div>
//                 <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-gray-800">{feature.title}</h3>
//                 <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Trusted by Thousands */}
//       <section className="py-10 md:py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-6 md:mb-8">
//             <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Trusted by Thousands</h2>
//             <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">Join our community of satisfied customers across Pakistan</p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
//             {[
//               { icon: <Award className="h-10 w-10 md:h-12 md:w-12 text-yellow-400 mx-auto mb-3 md:mb-4" />, val: '4.8/5', label: 'Customer Rating' },
//               { icon: <Truck className="h-10 w-10 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />, val: '50K+', label: 'Successful Deliveries' },
//               { icon: <Shield className="h-10 w-10 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />, val: '100%', label: 'Secure Payments' },
//               { icon: <Users className="h-10 w-10 md:h-12 md:w-12 text-purple-400 mx-auto mb-3 md:mb-4" />, val: '24/7', label: 'Customer Support' },
//             ].map((s, i) => (
//               <div key={i} className="text-center">{s.icon}<div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">{s.val}</div><div className="text-gray-300 text-sm md:text-base">{s.label}</div></div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-12 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">Ready to Experience the Best Shopping?</h2>
//           <p className="text-base md:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto">
//             Join thousands of satisfied customers across Pakistan who trust BlackCart for their shopping needs.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
//             <Link to="/register" className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all">
//               Create Free Account
//             </Link>
//             <Link to="/products" className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-colors">
//               Browse Products
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }

// export default HomePage

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Truck,
  CreditCard,
  Star,
  Headphones,
  Keyboard,
  Mouse,
  Monitor,
  Laptop,
  Webcam,
  Music,
  TrendingUp,
  Sparkles,
  Clock,
  Award,
  ShoppingBag,
  Users,
  AlertCircle,
  RefreshCw,
  Package,
  ChevronDown,
  Zap,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";

/* ─── Google Fonts injection ─────────────────────────────────────────────── */
const FontInjector: React.FC = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
  return null;
};

/* ─── Animated canvas starfield ─────────────────────────────────────────── */
const StarCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animFrame: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random(),
      speed: Math.random() * 0.004 + 0.001,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.speed;
        if (s.alpha > 1) {
          s.alpha = 0;
          s.x = Math.random() * canvas.width;
          s.y = Math.random() * canvas.height;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,220,255,${s.alpha * 0.6})`;
        ctx.fill();
      });
      animFrame = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: homeProductsData,
    isLoading: homeProductsLoading,
    error: homeProductsError,
    refetch: refetchHomeProducts,
  } = useQuery({
    queryKey: ["homeProducts"],
    queryFn: () => productService.getProducts({ limit: 16 }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const features = [
    {
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      title: "Fast Delivery",
      description: "Across Pakistan in 3-7 business days",
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Secure Payments",
      description: "100% secure with multiple payment options",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
      title: "Easy Returns",
      description: "14-day return policy for all products",
    },
    {
      icon: <Star className="h-8 w-8 text-blue-600" />,
      title: "Quality Products",
      description: "Verified quality from trusted brands",
    },
  ];

  const accessories = [
    {
      icon: <Mouse className="h-8 w-8 text-red-500" />,
      name: "Gaming Mouse",
      category: "mouse",
      bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20",
      glow: "rgba(239,68,68,0.4)",
    },
    {
      icon: <Keyboard className="h-8 w-8 text-green-500" />,
      name: "Keyboard",
      category: "keyboard",
      bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20",
      glow: "rgba(34,197,94,0.4)",
    },
    {
      icon: <Headphones className="h-8 w-8 text-purple-500" />,
      name: "Headset",
      category: "headphones",
      bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20",
      glow: "rgba(168,85,247,0.4)",
    },
    {
      icon: <Monitor className="h-8 w-8 text-blue-500" />,
      name: "Monitor",
      category: "monitor",
      bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
      glow: "rgba(59,130,246,0.4)",
    },
    {
      icon: <Webcam className="h-8 w-8 text-yellow-500" />,
      name: "Webcam",
      category: "webcam",
      bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20",
      glow: "rgba(234,179,8,0.4)",
    },
    {
      icon: <Music className="h-8 w-8 text-pink-500" />,
      name: "Speakers",
      category: "speakers",
      bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20",
      glow: "rgba(236,72,153,0.4)",
    },
  ];

  const accessoriesFull = [
    {
      icon: <Mouse className="h-12 w-12 text-red-500" />,
      name: "Gaming Mouse",
      bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20",
    },
    {
      icon: <Keyboard className="h-12 w-12 text-green-500" />,
      name: "Mechanical Keyboard",
      bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20",
    },
    {
      icon: <Headphones className="h-12 w-12 text-purple-500" />,
      name: "Wireless Headset",
      bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20",
    },
    {
      icon: <Monitor className="h-12 w-12 text-blue-500" />,
      name: "Gaming Monitor",
      bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
    },
    {
      icon: <Webcam className="h-12 w-12 text-yellow-500" />,
      name: "HD Webcam",
      bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20",
    },
    {
      icon: <Music className="h-12 w-12 text-pink-500" />,
      name: "Studio Speakers",
      bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20",
    },
  ];

  const allProducts = homeProductsData?.data?.products || [];
  const featuredProducts = allProducts.slice(0, 4);
  const newArrivalProducts = allProducts.slice(4, 8);

  const isLoading = homeProductsLoading;
  const hasErrors = !!homeProductsError;
  const isDatabaseEmpty = !isLoading && !hasErrors && allProducts.length === 0;

  const handleRetry = async () => {
    try {
      await refetchHomeProducts();
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error during retry:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-lg">
            Loading amazing products...
          </p>
          <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
        </div>
      </div>
    );
  }

  if (hasErrors) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            We're having trouble loading products. This might be due to server
            issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="btn-primary inline-flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
            <Link
              to="/products"
              className="btn-secondary inline-flex items-center justify-center"
            >
              <Package className="h-4 w-4 mr-2" />
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isDatabaseEmpty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden min-h-[70vh] flex items-center">
          <div className="absolute inset-0 bg-black/20" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative w-full">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to <span className="text-yellow-300">BlackCart</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/80 mb-8">
                Pakistan's premier e-commerce destination for laptops & computer
                accessories.
              </p>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-3">
                  <AlertCircle className="h-8 w-8 text-yellow-300 mr-3" />
                  <h3 className="text-xl font-bold text-white">Admin Notice</h3>
                </div>
                <p className="text-white/90 mb-4">
                  No products found in the database. Please add products to
                  start selling.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/admin/dashboard"
                    className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all inline-flex items-center justify-center"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add Products (Admin)
                  </Link>
                  <Link
                    to="/dashboard"
                    className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Coming Soon!
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're preparing amazing products for you.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Sparkles className="h-6 w-6 text-blue-600" />,
                  bg: "bg-blue-100",
                  title: "Featured Products",
                  desc: "Handpicked quality products from top brands will be available soon.",
                  color: "text-blue-600",
                  border: "border-blue-100",
                  gradient: "from-blue-50 to-indigo-50",
                },
                {
                  icon: <Clock className="h-6 w-6 text-green-600" />,
                  bg: "bg-green-100",
                  title: "New Arrivals",
                  desc: "Stay tuned for the latest products and cutting-edge technology.",
                  color: "text-green-600",
                  border: "border-green-100",
                  gradient: "from-green-50 to-teal-50",
                },
                {
                  icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
                  bg: "bg-purple-100",
                  title: "Trending Products",
                  desc: "Discover what's popular and trending in the tech world.",
                  color: "text-purple-600",
                  border: "border-purple-100",
                  gradient: "from-purple-50 to-pink-50",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${item.gradient} rounded-xl p-6 border ${item.border}`}
                >
                  <div className="flex items-center mb-4">
                    <div className={`p-3 ${item.bg} rounded-full mr-4`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-4">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Why Choose BlackCart?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-lg"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 bg-blue-50 rounded-full">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience the Best Shopping?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all"
              >
                Create Free Account
              </Link>
              <Link
                to="/products"
                className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════════
     ✨ PREMIUM HERO — main render
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div>
      <FontInjector />

      {/* ─── HERO SECTION ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          height: "calc(100vh - 80px)",
          minHeight: "560px",
          maxHeight: "100vh",
          background:
            "linear-gradient(135deg, #020817 0%, #0a1628 40%, #0d1f3c 70%, #071220 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* ── Background: star canvas ─────────────────────────────────────── */}
        <StarCanvas />

        {/* ── Background: grid pattern ────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            backgroundImage: `
              linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* ── Ambient glow orbs ───────────────────────────────────────────── */}
        <div
          className="absolute pointer-events-none"
          style={{
            zIndex: 1,
            top: "-10%",
            left: "-5%",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            zIndex: 1,
            bottom: "-15%",
            right: "10%",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute pointer-events-none"
          style={{
            zIndex: 1,
            top: "30%",
            left: "45%",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(250,204,21,0.07) 0%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        {/* ── Diagonal accent line ────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: "30%",
              width: "1px",
              height: "100%",
              background:
                "linear-gradient(180deg, transparent, rgba(59,130,246,0.25), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              right: "32%",
              width: "1px",
              height: "100%",
              background:
                "linear-gradient(180deg, transparent, rgba(59,130,246,0.10), transparent)",
              transform: "skewX(-20deg)",
            }}
          />
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
        <div
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center lg:justify-start"
          style={{
            zIndex: 10,
            height: "100%",
            paddingTop: "1.25rem",
            paddingBottom: "2.5rem",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center w-full">
            {/* ── LEFT ── */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.15))",
                  border: "1px solid rgba(59,130,246,0.35)",
                  color: "#93c5fd",
                  backdropFilter: "blur(12px)",
                }}
              >
                <Zap
                  className="h-3 w-3 text-yellow-400"
                  style={{ fill: "#facc15" }}
                />
                Pakistan's #1 Tech Store
                <span
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 6px #4ade80" }}
                />
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="font-bold leading-none mb-3"
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.05,
                }}
              >
                Welcome to{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #facc15 0%, #f97316 60%, #fbbf24 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    display: "inline-block",
                    filter: "drop-shadow(0 0 30px rgba(250,204,21,0.35))",
                  }}
                >
                  BlackCart
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mb-4 leading-relaxed"
                style={{
                  color: "rgba(186,214,255,0.75)",
                  fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
                  maxWidth: "500px",
                  margin: "0 auto 1rem",
                }}
              >
                Pakistan's premier e-commerce destination for laptops &amp;
                computer accessories. Shop thousands of products with secure
                payments and lightning-fast delivery.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="flex gap-6 mb-4 justify-center lg:justify-start"
              >
                {[
                  { val: "50K+", label: "Orders" },
                  { val: "4.8★", label: "Rating" },
                  { val: "1000+", label: "Products" },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col">
                    <span
                      className="font-bold text-white"
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "1.15rem",
                        lineHeight: 1.1,
                      }}
                    >
                      {s.val}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: "rgba(148,189,255,0.6)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                {/* Primary CTA */}
                <Link
                  to="/products"
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl font-semibold transition-all duration-300"
                  style={{
                    padding: "0.7rem 1.75rem",
                    background:
                      "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    boxShadow:
                      "0 0 30px rgba(37,99,235,0.5), 0 4px 20px rgba(0,0,0,0.3)",
                    fontSize: "1rem",
                    letterSpacing: "0.01em",
                    textDecoration: "none",
                    color: "white",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 50px rgba(37,99,235,0.8), 0 8px 30px rgba(0,0,0,0.4)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 30px rgba(37,99,235,0.5), 0 4px 20px rgba(0,0,0,0.3)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  {/* shine sweep */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                      transform: "skewX(-20deg)",
                    }}
                  />
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {/* Secondary CTA */}
                <Link
                  to="/categories"
                  className="group inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300"
                  style={{
                    padding: "0.7rem 1.75rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(12px)",
                    fontSize: "1rem",
                    color: "rgba(220,235,255,0.9)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.10)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.35)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.18)";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                  }}
                >
                  Browse Categories
                </Link>
              </motion.div>
            </motion.div>

            {/* ── RIGHT CARD ── */}
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 1,
                delay: 0.25,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Halo glow behind card */}
                <div
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background:
                      "radial-gradient(ellipse at 60% 40%, rgba(59,130,246,0.25) 0%, transparent 70%)",
                    filter: "blur(30px)",
                    transform: "scale(1.1)",
                    zIndex: 0,
                  }}
                />

                {/* Glass card shell */}
                <div
                  className="relative rounded-3xl overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    backdropFilter: "blur(24px)",
                    padding: "1.1rem",
                    boxShadow:
                      "0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
                    zIndex: 2,
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-sm font-semibold tracking-widest uppercase"
                      style={{
                        color: "rgba(148,189,255,0.7)",
                        letterSpacing: "0.12em",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Premium Collection
                    </span>
                    <span
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{
                        background: "rgba(74,222,128,0.12)",
                        border: "1px solid rgba(74,222,128,0.3)",
                        color: "#4ade80",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-green-400"
                        style={{ boxShadow: "0 0 5px #4ade80" }}
                      />
                      In Stock
                    </span>
                  </div>

                  {/* Laptop feature card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="rounded-2xl p-3 mb-3 relative overflow-hidden"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.85) 100%)",
                      border: "1px solid rgba(59,130,246,0.25)",
                      boxShadow: "0 0 30px rgba(59,130,246,0.08)",
                    }}
                  >
                    {/* Subtle top gradient line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)",
                      }}
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div
                            className="p-1.5 rounded-lg"
                            style={{ background: "rgba(250,204,21,0.12)" }}
                          >
                            <Laptop className="h-4 w-4 text-yellow-400" />
                          </div>
                          <h4
                            className="font-bold text-white text-sm"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            Premium Laptops
                          </h4>
                        </div>
                        <p
                          className="text-xs mb-3"
                          style={{ color: "rgba(148,189,255,0.6)" }}
                        >
                          Latest models from top brands
                        </p>
                        <Link
                          to="/categories"
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                          style={{
                            background: "rgba(250,204,21,0.12)",
                            border: "1px solid rgba(250,204,21,0.25)",
                            color: "#fde047",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(250,204,21,0.22)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(250,204,21,0.12)")
                          }
                        >
                          Explore Collection <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div
                        className="text-5xl ml-4"
                        style={{
                          filter: "drop-shadow(0 0 20px rgba(250,204,21,0.4))",
                        }}
                      >
                        💻
                      </div>
                    </div>
                  </motion.div>

                  {/* Divider with label */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                    <span
                      className="text-xs"
                      style={{
                        color: "rgba(148,189,255,0.4)",
                        letterSpacing: "0.1em",
                      }}
                    >
                      ACCESSORIES
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    />
                  </div>

                  {/* Accessories grid */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {accessories.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.85, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: 0.55 + index * 0.07,
                        }}
                        whileHover={{ y: -3, scale: 1.04 }}
                        className="relative group rounded-xl p-2.5 text-center cursor-pointer overflow-hidden"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "rgba(255,255,255,0.08)";
                          el.style.borderColor = "rgba(255,255,255,0.20)";
                          el.style.boxShadow = `0 8px 25px ${item.glow}`;
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.background = "rgba(255,255,255,0.04)";
                          el.style.borderColor = "rgba(255,255,255,0.08)";
                          el.style.boxShadow = "none";
                        }}
                      >
                        {/* glow bg on card */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                          style={{
                            background: `radial-gradient(circle at center, ${item.glow} 0%, transparent 70%)`,
                          }}
                        />
                        <div className="relative flex justify-center mb-1.5">
                          <div
                            className="p-2 rounded-lg"
                            style={{ background: "rgba(255,255,255,0.06)" }}
                          >
                            {React.cloneElement(item.icon, {
                              className: "h-5 w-5",
                            })}
                          </div>
                        </div>
                        <span
                          className="relative text-xs font-medium leading-tight"
                          style={{ color: "rgba(214,230,255,0.85)" }}
                        >
                          {item.name}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom CTA strip */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="mt-3 rounded-xl p-2.5 flex items-center justify-between"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(99,102,241,0.12) 100%)",
                      border: "1px solid rgba(59,130,246,0.2)",
                    }}
                  >
                    <span
                      className="text-xs"
                      style={{ color: "rgba(186,214,255,0.7)" }}
                    >
                      Free delivery on orders over Rs. 5,000
                    </span>
                    <Truck
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "#60a5fa" }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Scroll indicator ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ zIndex: 10 }}
        >
          <span
            className="text-xs tracking-widest uppercase"
            style={{ color: "rgba(148,189,255,0.4)", letterSpacing: "0.15em" }}
          >
            Scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown
              className="h-4 w-4"
              style={{ color: "rgba(148,189,255,0.4)" }}
            />
          </motion.div>
        </motion.div>
      </section>
      {/* ─── END HERO ──────────────────────────────────────────────────────── */}

      {/* Accessories Section — Mobile only */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Premium Accessories
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
              Enhance your setup with our top-quality computer accessories
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
            {accessoriesFull.map((item, index) => (
              <div
                key={index}
                className={`${item.bgClass} rounded-xl p-3 md:p-5 text-center border border-white/10 hover:scale-105 transition-transform`}
              >
                <div className="mb-2 md:mb-4 flex justify-center">
                  <div
                    className={`p-2 md:p-4 rounded-full ${item.bgClass} border border-white/30`}
                  >
                    {React.cloneElement(item.icon, {
                      className: "h-6 w-6 md:h-8 md:w-8",
                    })}
                  </div>
                </div>
                <span className="text-xs md:text-sm font-medium">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 md:mt-8">
            <Link
              to="/products?category=accessories"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-sm md:text-lg transition-colors"
            >
              View All Accessories{" "}
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <div className="flex items-center mb-1 md:mb-2">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-yellow-500 mr-2" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    Featured Products
                  </h2>
                </div>
                <p className="text-sm md:text-base text-gray-600">
                  Handpicked quality products for you
                </p>
              </div>
              <Link
                to="/products?featured=true"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
              >
                View All <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product: any, index: number) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivalProducts.length > 0 && (
        <section className="py-12 md:py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <div className="flex items-center mb-1 md:mb-2">
                  <Clock className="h-5 w-5 md:h-6 md:w-6 text-blue-500 mr-2" />
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                    New Arrivals
                  </h2>
                </div>
                <p className="text-sm md:text-base text-gray-600">
                  Discover our latest products
                </p>
              </div>
              <Link
                to="/products?newArrivals=true"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
              >
                View All <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivalProducts.map((product: any, index: number) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Computer Accessories — Desktop only */}
      <section className="py-12 md:py-20 bg-gray-50 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">
              Popular Computer Accessories
            </h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
              Upgrade your workspace with our bestselling accessories
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
            {accessoriesFull.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 md:p-5 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-3 md:mb-4 flex justify-center">
                  <div className={`p-3 md:p-4 rounded-full ${item.bgClass}`}>
                    {React.cloneElement(item.icon, {
                      className: "h-8 w-8 md:h-10 md:w-10",
                    })}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
                  {item.name}
                </h3>
                <Link
                  to="/products"
                  className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium inline-flex items-center gap-1"
                >
                  Shop now <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose BlackCart */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
            Why Choose BlackCart?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-5 md:p-6 text-center border border-gray-200 shadow-lg"
              >
                <div className="mb-3 md:mb-4 flex justify-center">
                  <div className="p-2 md:p-3 bg-blue-50 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by Thousands */}
      <section className="py-10 md:py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
              Join our community of satisfied customers across Pakistan
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                icon: (
                  <Award className="h-10 w-10 md:h-12 md:w-12 text-yellow-400 mx-auto mb-3 md:mb-4" />
                ),
                val: "4.8/5",
                label: "Customer Rating",
              },
              {
                icon: (
                  <Truck className="h-10 w-10 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />
                ),
                val: "50K+",
                label: "Successful Deliveries",
              },
              {
                icon: (
                  <Shield className="h-10 w-10 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />
                ),
                val: "100%",
                label: "Secure Payments",
              },
              {
                icon: (
                  <Users className="h-10 w-10 md:h-12 md:w-12 text-purple-400 mx-auto mb-3 md:mb-4" />
                ),
                val: "24/7",
                label: "Customer Support",
              },
            ].map((s, i) => (
              <div key={i} className="text-center">
                {s.icon}
                <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
                  {s.val}
                </div>
                <div className="text-gray-300 text-sm md:text-base">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
            Ready to Experience the Best Shopping?
          </h2>
          <p className="text-base md:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers across Pakistan who trust
            BlackCart for their shopping needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all"
            >
              Create Free Account
            </Link>
            <Link
              to="/products"
              className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

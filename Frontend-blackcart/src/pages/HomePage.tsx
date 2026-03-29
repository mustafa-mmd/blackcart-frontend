
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
//       icon: <Mouse className="h-12 w-12 text-red-500" />, 
//       name: "Gaming Mouse", 
//       category: "mouse",
//       bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20",
//     },
//     { 
//       icon: <Keyboard className="h-12 w-12 text-green-500" />, 
//       name: "Mechanical Keyboard", 
//       category: "keyboard",
//       bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20",
//     },
//     { 
//       icon: <Headphones className="h-12 w-12 text-purple-500" />, 
//       name: "Wireless Headset", 
//       category: "headphones",
//       bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20",
//     },
//     { 
//       icon: <Monitor className="h-12 w-12 text-blue-500" />, 
//       name: "Gaming Monitor", 
//       category: "monitor",
//       bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
//     },
//     { 
//       icon: <Webcam className="h-12 w-12 text-yellow-500" />, 
//       name: "HD Webcam", 
//       category: "webcam",
//       bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20",
//     },
//     { 
//       icon: <Music className="h-12 w-12 text-pink-500" />,
//       name: "Studio Speakers", 
//       category: "speakers",
//       bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20",
//     },
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

//   // Loading state
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

//   // Error state
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
//             <button
//               onClick={handleRetry}
//               className="btn-primary inline-flex items-center justify-center"
//             >
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Try Again
//             </button>
//             <Link
//               to="/products"
//               className="btn-secondary inline-flex items-center justify-center"
//             >
//               <Package className="h-4 w-4 mr-2" />
//               Browse All Products
//             </Link>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Empty database state
//   if (isDatabaseEmpty) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
//           <div className="absolute inset-0 bg-black/20" />
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
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
//                 <p className="text-white/90 mb-4">
//                   No products found in the database. Please add products to start selling.
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
//                   <Link
//                     to="/admin/dashboard"
//                     className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition-all inline-flex items-center justify-center"
//                   >
//                     <ShoppingBag className="h-5 w-5 mr-2" />
//                     Add Products (Admin)
//                   </Link>
//                   <Link
//                     to="/dashboard"
//                     className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center"
//                   >
//                     Go to Dashboard
//                   </Link>
//                 </div>
//               </div>
              
//               <div className="mt-8">
//                 <p className="text-lg text-white/80 mb-6">
//                   Our product catalog is being updated. Check back soon for amazing deals!
//                 </p>
//                 <Link
//                   to="/categories"
//                   className="inline-flex items-center bg-white/20 hover:bg-white/30 border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
//                 >
//                   <Package className="h-5 w-5 mr-2" />
//                   Browse Categories
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="py-16 bg-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="text-center mb-12">
//               <h2 className="text-3xl font-bold mb-4 text-gray-900">Coming Soon!</h2>
//               <p className="text-gray-600 max-w-2xl mx-auto">
//                 We're preparing amazing products for you. Here's what to expect:
//               </p>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
//                 <div className="flex items-center mb-4">
//                   <div className="p-3 bg-blue-100 rounded-full mr-4">
//                     <Sparkles className="h-6 w-6 text-blue-600" />
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-900">Featured Products</h3>
//                 </div>
//                 <p className="text-gray-600 mb-4">
//                   Handpicked quality products from top brands will be available soon.
//                 </p>
//                 <div className="flex items-center text-sm text-blue-600">
//                   <Clock className="h-4 w-4 mr-2" />
//                   Coming soon
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
//                 <div className="flex items-center mb-4">
//                   <div className="p-3 bg-green-100 rounded-full mr-4">
//                     <Clock className="h-6 w-6 text-green-600" />
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-900">New Arrivals</h3>
//                 </div>
//                 <p className="text-gray-600 mb-4">
//                   Stay tuned for the latest products and cutting-edge technology.
//                 </p>
//                 <div className="flex items-center text-sm text-green-600">
//                   <Clock className="h-4 w-4 mr-2" />
//                   Coming soon
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
//                 <div className="flex items-center mb-4">
//                   <div className="p-3 bg-purple-100 rounded-full mr-4">
//                     <TrendingUp className="h-6 w-6 text-purple-600" />
//                   </div>
//                   <h3 className="text-xl font-bold text-gray-900">Trending Products</h3>
//                 </div>
//                 <p className="text-gray-600 mb-4">
//                   Discover what's popular and trending in the tech world.
//                 </p>
//                 <div className="flex items-center text-sm text-purple-600">
//                   <Clock className="h-4 w-4 mr-2" />
//                   Coming soon
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Why Choose BlackCart - empty state */}
//         <section className="py-16 bg-gray-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose BlackCart?</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//               {features.map((feature, index) => (
//                 <motion.div
//                   key={index}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.5, delay: index * 0.1 }}
//                   className="bg-white rounded-xl p-6 text-center border border-gray-200 shadow-lg"
//                 >
//                   <div className="mb-4 flex justify-center">
//                     <div className="p-3 bg-blue-50 rounded-full">
//                       {feature.icon}
//                     </div>
//                   </div>
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
//               <p className="text-gray-300 max-w-2xl mx-auto">
//                 Join our community of satisfied customers across Pakistan
//               </p>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//               <div className="text-center">
//                 <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
//                 <div className="text-3xl font-bold mb-2">4.8/5</div>
//                 <div className="text-gray-300">Customer Rating</div>
//               </div>
//               <div className="text-center">
//                 <Truck className="h-12 w-12 text-green-400 mx-auto mb-4" />
//                 <div className="text-3xl font-bold mb-2">50K+</div>
//                 <div className="text-gray-300">Successful Deliveries</div>
//               </div>
//               <div className="text-center">
//                 <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
//                 <div className="text-3xl font-bold mb-2">100%</div>
//                 <div className="text-gray-300">Secure Payments</div>
//               </div>
//               <div className="text-center">
//                 <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
//                 <div className="text-3xl font-bold mb-2">24/7</div>
//                 <div className="text-gray-300">Customer Support</div>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//             <h2 className="text-3xl md:text-4xl font-bold mb-6">
//               Ready to Experience the Best Shopping?
//             </h2>
//             <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
//               Join thousands of satisfied customers across Pakistan who trust BlackCart for their shopping needs.
//             </p>
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Link
//                 to="/register"
//                 className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all"
//               >
//                 Create Free Account
//               </Link>
//               <Link
//                 to="/products"
//                 className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
//               >
//                 Browse Products
//               </Link>
//             </div>
//           </div>
//         </section>
//       </div>
//     )
//   }

//   // ─── Normal rendering when products exist ────────────────────────────────────
//   return (
//     <div>
//       {/* Hero Section */}
//       <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
//         <div className="absolute inset-0 bg-black/20" />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.8 }}
//               className="max-w-2xl"
//             >
//               <h1 className="text-4xl md:text-6xl font-bold mb-6">
//                 Welcome to <span className="text-yellow-300">BlackCart</span>
//               </h1>
//               <p className="text-xl md:text-2xl text-white/80 mb-8">
//                 Pakistan's premier e-commerce destination for laptops & computer accessories. Shop from thousands of products with secure payments and fast delivery.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-4">
//                 <Link
//                   to="/products"
//                   className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center justify-center"
//                 >
//                   Start Shopping
//                   <ArrowRight className="ml-2 h-5 w-5" />
//                 </Link>
//                 <Link
//                   to="/categories"
//                   className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
//                 >
//                   Browse Categories
//                 </Link>
//               </div>
//             </motion.div>
            
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="hidden lg:block"
//             >
//               <div className="relative">
//                 <div className="absolute -top-6 -right-6 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
//                 <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                
//                 <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
//                   <h3 className="text-2xl font-bold mb-6 text-center">Premium Computer Accessories</h3>
                  
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.6, delay: 0.3 }}
//                     className="relative mb-8 group"
//                   >
//                     <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700/50">
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
//                             <Laptop className="h-6 w-6 text-yellow-400" />
//                             Premium Laptops
//                           </h4>
//                           <p className="text-gray-300 mb-4">Latest models from top brands</p>
//                           <Link 
//                             to="/categories"
//                             className="inline-flex items-center text-yellow-300 hover:text-yellow-200 font-medium"
//                           >
//                             Explore Collection
//                             <ArrowRight className="ml-2 h-4 w-4" />
//                           </Link>
//                         </div>
//                         <div className="text-5xl">💻</div>
//                       </div>
//                     </div>
//                   </motion.div>

//                   <div className="grid grid-cols-3 gap-4">
//                     {accessories.map((item, index) => (
//                       <motion.div
//                         key={index}
//                         initial={{ opacity: 0, scale: 0.8 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
//                         className={`${item.bgClass} backdrop-blur-sm rounded-xl p-4 text-center border border-white/10 cursor-pointer hover:scale-105 transition-transform`}
//                       >
//                         <div className="mb-3 flex justify-center">
//                           <div className={`p-3 rounded-full ${item.bgClass} border border-white/30`}>
//                             {item.icon}
//                           </div>
//                         </div>
//                         <span className="text-sm font-medium text-white">{item.name}</span>
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
//       <section className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white lg:hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-10">
//             <h2 className="text-3xl font-bold mb-4">Premium Accessories</h2>
//             <p className="text-gray-300 max-w-2xl mx-auto">Enhance your setup with our top-quality computer accessories</p>
//           </div>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
//             {accessories.map((item, index) => (
//               <div
//                 key={index}
//                 className={`${item.bgClass} rounded-xl p-5 text-center border border-white/10 hover:scale-105 transition-transform`}
//               >
//                 <div className="mb-4 flex justify-center">
//                   <div className={`p-4 rounded-full ${item.bgClass} border border-white/30`}>
//                     {item.icon}
//                   </div>
//                 </div>
//                 <span className="text-sm font-medium">{item.name}</span>
//               </div>
//             ))}
//           </div>
//           <div className="text-center mt-8">
//             <Link
//               to="/products?category=accessories"
//               className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
//             >
//               View All Accessories
//               <ArrowRight className="ml-2 h-5 w-5" />
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Featured Products */}
//       {featuredProducts.length > 0 && (
//         <section className="py-16">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <div className="flex items-center mb-2">
//                   <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
//                   <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
//                 </div>
//                 <p className="text-gray-600">Handpicked quality products for you</p>
//               </div>
//               <Link
//                 to="/products?featured=true"
//                 className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 View All
//                 <ArrowRight className="h-5 w-5 ml-2" />
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {featuredProducts.map((product: any, index: number) => (
//                 <ProductCard key={product._id} product={product} index={index} />
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* New Arrivals */}
//       {newArrivalProducts.length > 0 && (
//         <section className="py-16 bg-gray-50">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <div className="flex items-center mb-2">
//                   <Clock className="h-6 w-6 text-blue-500 mr-2" />
//                   <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
//                 </div>
//                 <p className="text-gray-600">Discover our latest products</p>
//               </div>
//               <Link
//                 to="/products?newArrivals=true"
//                 className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
//               >
//                 View All
//                 <ArrowRight className="h-5 w-5 ml-2" />
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//               {newArrivalProducts.map((product: any, index: number) => (
//                 <ProductCard key={product._id} product={product} index={index} />
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Popular Computer Accessories — Desktop only */}
//       <section className="py-20 bg-gray-50 hidden lg:block">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-12">
//             <h2 className="text-3xl font-bold mb-4 text-gray-900">Popular Computer Accessories</h2>
//             <p className="text-gray-600 max-w-2xl mx-auto">Upgrade your workspace with our bestselling accessories</p>
//           </div>
//           <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
//             {accessories.map((item, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="bg-white rounded-xl p-5 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
//               >
//                 <div className="mb-4 flex justify-center">
//                   <div className={`p-4 rounded-full ${item.bgClass}`}>
//                     {item.icon}
//                   </div>
//                 </div>
//                 <h3 className="font-semibold text-gray-800 mb-2">{item.name}</h3>
//                 <Link 
//                   to="/products"
//                   className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1"
//                 >
//                   Shop now
//                   <ArrowRight className="h-3 w-3" />
//                 </Link>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ✅ Why Choose BlackCart — between Popular Accessories and Trusted by Thousands */}
//       <section className="py-16 bg-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose BlackCart?</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {features.map((feature, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200 shadow-lg"
//               >
//                 <div className="mb-4 flex justify-center">
//                   <div className="p-3 bg-blue-50 rounded-full">
//                     {feature.icon}
//                   </div>
//                 </div>
//                 <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
//                 <p className="text-gray-600">{feature.description}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Trusted by Thousands */}
//       <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
//             <p className="text-gray-300 max-w-2xl mx-auto">
//               Join our community of satisfied customers across Pakistan
//             </p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//             <div className="text-center">
//               <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
//               <div className="text-3xl font-bold mb-2">4.8/5</div>
//               <div className="text-gray-300">Customer Rating</div>
//             </div>
//             <div className="text-center">
//               <Truck className="h-12 w-12 text-green-400 mx-auto mb-4" />
//               <div className="text-3xl font-bold mb-2">50K+</div>
//               <div className="text-gray-300">Successful Deliveries</div>
//             </div>
//             <div className="text-center">
//               <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
//               <div className="text-3xl font-bold mb-2">100%</div>
//               <div className="text-gray-300">Secure Payments</div>
//             </div>
//             <div className="text-center">
//               <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
//               <div className="text-3xl font-bold mb-2">24/7</div>
//               <div className="text-gray-300">Customer Support</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-3xl md:text-4xl font-bold mb-6">
//             Ready to Experience the Best Shopping?
//           </h2>
//           <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
//             Join thousands of satisfied customers across Pakistan who trust BlackCart for their shopping needs.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               to="/register"
//               className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all"
//             >
//               Create Free Account
//             </Link>
//             <Link
//               to="/products"
//               className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg text-lg transition-colors"
//             >
//               Browse Products
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   )
// }

// export default HomePage

//above code is complete correct but we just change the style the main page is show complete with full window fixing the style size issues

import React from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
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
  Package
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../services/productService'
import ProductCard from '../components/product/ProductCard'
import Loader from '../components/common/Loader'


const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const { 
    data: homeProductsData, 
    isLoading: homeProductsLoading,
    error: homeProductsError,
    refetch: refetchHomeProducts 
  } = useQuery({
    queryKey: ['homeProducts'],
    queryFn: () => productService.getProducts({ limit: 16 }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const features = [
    { 
      icon: <Truck className="h-8 w-8 text-blue-600" />, 
      title: 'Fast Delivery', 
      description: 'Across Pakistan in 3-7 business days' 
    },
    { 
      icon: <Shield className="h-8 w-8 text-blue-600" />, 
      title: 'Secure Payments', 
      description: '100% secure with multiple payment options' 
    },
    { 
      icon: <CreditCard className="h-8 w-8 text-blue-600" />, 
      title: 'Easy Returns', 
      description: '14-day return policy for all products' 
    },
    { 
      icon: <Star className="h-8 w-8 text-blue-600" />, 
      title: 'Quality Products', 
      description: 'Verified quality from trusted brands' 
    },
  ]

  const accessories = [
    { 
      icon: <Mouse className="h-12 w-12 text-red-500" />, 
      name: "Gaming Mouse", 
      category: "mouse",
      bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20",
    },
    { 
      icon: <Keyboard className="h-12 w-12 text-green-500" />, 
      name: "Mechanical Keyboard", 
      category: "keyboard",
      bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20",
    },
    { 
      icon: <Headphones className="h-12 w-12 text-purple-500" />, 
      name: "Wireless Headset", 
      category: "headphones",
      bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20",
    },
    { 
      icon: <Monitor className="h-12 w-12 text-blue-500" />, 
      name: "Gaming Monitor", 
      category: "monitor",
      bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
    },
    { 
      icon: <Webcam className="h-12 w-12 text-yellow-500" />, 
      name: "HD Webcam", 
      category: "webcam",
      bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20",
    },
    { 
      icon: <Music className="h-12 w-12 text-pink-500" />,
      name: "Studio Speakers", 
      category: "speakers",
      bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20",
    },
  ]

  const allProducts = homeProductsData?.data?.products || []
  const featuredProducts = allProducts.slice(0, 4)
  const newArrivalProducts = allProducts.slice(4, 8)

  const isLoading = homeProductsLoading
  const hasErrors = !!homeProductsError
  const isDatabaseEmpty = !isLoading && !hasErrors && allProducts.length === 0

  const handleRetry = async () => {
    try {
      await refetchHomeProducts()
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      console.error('Error during retry:', error)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-lg">Loading amazing products...</p>
          <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
        </div>
      </div>
    )
  }

  // Error state
  if (hasErrors) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">
            We're having trouble loading products. This might be due to server issues.
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
    )
  }

  // Empty database state
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
                Pakistan's premier e-commerce destination for laptops & computer accessories.
              </p>
              
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 mb-8 backdrop-blur-sm">
                <div className="flex items-center justify-center mb-3">
                  <AlertCircle className="h-8 w-8 text-yellow-300 mr-3" />
                  <h3 className="text-xl font-bold text-white">Admin Notice</h3>
                </div>
                <p className="text-white/90 mb-4">
                  No products found in the database. Please add products to start selling.
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
              
              <div className="mt-8">
                <p className="text-lg text-white/80 mb-6">
                  Our product catalog is being updated. Check back soon for amazing deals!
                </p>
                <Link
                  to="/categories"
                  className="inline-flex items-center bg-white/20 hover:bg-white/30 border-2 border-white text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
                >
                  <Package className="h-5 w-5 mr-2" />
                  Browse Categories
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Coming Soon!</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're preparing amazing products for you. Here's what to expect:
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full mr-4">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Featured Products</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Handpicked quality products from top brands will be available soon.
                </p>
                <div className="flex items-center text-sm text-blue-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Coming soon
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full mr-4">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">New Arrivals</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Stay tuned for the latest products and cutting-edge technology.
                </p>
                <div className="flex items-center text-sm text-green-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Coming soon
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full mr-4">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Trending Products</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Discover what's popular and trending in the tech world.
                </p>
                <div className="flex items-center text-sm text-purple-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Coming soon
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose BlackCart - empty state */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose BlackCart?</h2>
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
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Join our community of satisfied customers across Pakistan
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <Award className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">4.8/5</div>
                <div className="text-gray-300">Customer Rating</div>
              </div>
              <div className="text-center">
                <Truck className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">50K+</div>
                <div className="text-gray-300">Successful Deliveries</div>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">100%</div>
                <div className="text-gray-300">Secure Payments</div>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-gray-300">Customer Support</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience the Best Shopping?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers across Pakistan who trust BlackCart for their shopping needs.
            </p>
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
    )
  }

  // ─── Normal rendering when products exist ────────────────────────────────────
  return (
    <div>
      {/* Hero Section - FIXED: Reduced height to fit viewport without scrolling */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden min-h-[80vh] md:min-h-[85vh] lg:min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 relative w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                Welcome to <span className="text-yellow-300">BlackCart</span>
              </h1>
              <p className="text-base md:text-xl lg:text-2xl text-white/80 mb-6 md:mb-8">
                Pakistan's premier e-commerce destination for laptops & computer accessories. Shop from thousands of products with secure payments and fast delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link
                  to="/products"
                  className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center justify-center"
                >
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
                <Link
                  to="/categories"
                  className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-colors text-center"
                >
                  Browse Categories
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -top-6 -right-6 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Premium Computer Accessories</h3>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative mb-6 md:mb-8 group"
                  >
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 md:p-6 border border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 flex items-center gap-2">
                            <Laptop className="h-5 w-5 md:h-6 md:w-6 text-yellow-400" />
                            Premium Laptops
                          </h4>
                          <p className="text-gray-300 text-sm md:text-base mb-3 md:mb-4">Latest models from top brands</p>
                          <Link 
                            to="/categories"
                            className="inline-flex items-center text-yellow-300 hover:text-yellow-200 font-medium text-sm md:text-base"
                          >
                            Explore Collection
                            <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4" />
                          </Link>
                        </div>
                        <div className="text-4xl md:text-5xl">💻</div>
                      </div>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {accessories.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                        className={`${item.bgClass} backdrop-blur-sm rounded-xl p-2 md:p-4 text-center border border-white/10 cursor-pointer hover:scale-105 transition-transform`}
                      >
                        <div className="mb-2 md:mb-3 flex justify-center">
                          <div className={`p-2 md:p-3 rounded-full ${item.bgClass} border border-white/30`}>
                            {React.cloneElement(item.icon, { className: "h-6 w-6 md:h-8 md:w-8" })}
                          </div>
                        </div>
                        <span className="text-xs md:text-sm font-medium text-white">{item.name}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Accessories Section — Mobile only */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Premium Accessories</h2>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">Enhance your setup with our top-quality computer accessories</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
            {accessories.map((item, index) => (
              <div
                key={index}
                className={`${item.bgClass} rounded-xl p-3 md:p-5 text-center border border-white/10 hover:scale-105 transition-transform`}
              >
                <div className="mb-2 md:mb-4 flex justify-center">
                  <div className={`p-2 md:p-4 rounded-full ${item.bgClass} border border-white/30`}>
                    {React.cloneElement(item.icon, { className: "h-6 w-6 md:h-8 md:w-8" })}
                  </div>
                </div>
                <span className="text-xs md:text-sm font-medium">{item.name}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-6 md:mt-8">
            <Link
              to="/products?category=accessories"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-sm md:text-lg transition-colors"
            >
              View All Accessories
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
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Featured Products</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600">Handpicked quality products for you</p>
              </div>
              <Link
                to="/products?featured=true"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
              >
                View All
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product: any, index: number) => (
                <ProductCard key={product._id} product={product} index={index} />
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
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">New Arrivals</h2>
                </div>
                <p className="text-sm md:text-base text-gray-600">Discover our latest products</p>
              </div>
              <Link
                to="/products?newArrivals=true"
                className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
              >
                View All
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivalProducts.map((product: any, index: number) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Computer Accessories — Desktop only */}
      <section className="py-12 md:py-20 bg-gray-50 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">Popular Computer Accessories</h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">Upgrade your workspace with our bestselling accessories</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
            {accessories.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 md:p-5 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="mb-3 md:mb-4 flex justify-center">
                  <div className={`p-3 md:p-4 rounded-full ${item.bgClass}`}>
                    {React.cloneElement(item.icon, { className: "h-8 w-8 md:h-10 md:w-10" })}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">{item.name}</h3>
                <Link 
                  to="/products"
                  className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium inline-flex items-center gap-1"
                >
                  Shop now
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ Why Choose BlackCart — between Popular Accessories and Trusted by Thousands */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">Why Choose BlackCart?</h2>
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
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-gray-800">{feature.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by Thousands */}
      <section className="py-10 md:py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Trusted by Thousands</h2>
            <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
              Join our community of satisfied customers across Pakistan
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="text-center">
              <Award className="h-10 w-10 md:h-12 md:w-12 text-yellow-400 mx-auto mb-3 md:mb-4" />
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">4.8/5</div>
              <div className="text-gray-300 text-sm md:text-base">Customer Rating</div>
            </div>
            <div className="text-center">
              <Truck className="h-10 w-10 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">50K+</div>
              <div className="text-gray-300 text-sm md:text-base">Successful Deliveries</div>
            </div>
            <div className="text-center">
              <Shield className="h-10 w-10 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">100%</div>
              <div className="text-gray-300 text-sm md:text-base">Secure Payments</div>
            </div>
            <div className="text-center">
              <Users className="h-10 w-10 md:h-12 md:w-12 text-purple-400 mx-auto mb-3 md:mb-4" />
              <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">24/7</div>
              <div className="text-gray-300 text-sm md:text-base">Customer Support</div>
            </div>
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
            Join thousands of satisfied customers across Pakistan who trust BlackCart for their shopping needs.
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
  )
}

export default HomePage

// import React, { useEffect, useRef } from "react";
// import { Helmet } from "react-helmet-async";
// import { motion } from "framer-motion";
// import { Link, useNavigate } from "react-router-dom";
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
//   Package,
//   ChevronDown,
//   Zap,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { productService } from "../services/productService";
// import bannerService from "../services/bannerService";
// import ProductCard from "../components/product/ProductCard";
// import Loader from "../components/common/Loader";

// /* ─── Google Fonts now loaded in index.html <head> — no JS injection needed ─ */

// /* ─── Animated canvas starfield ─────────────────────────────────────────── */
// const StarCanvas: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
//     const ctx = canvas.getContext("2d")!;
//     let animFrame: number;
//     const resize = () => {
//       canvas.width = canvas.offsetWidth;
//       canvas.height = canvas.offsetHeight;
//     };
//     resize();
//     window.addEventListener("resize", resize);
//     const stars = Array.from({ length: 120 }, () => ({
//       x: Math.random() * canvas.width,
//       y: Math.random() * canvas.height,
//       r: Math.random() * 1.2 + 0.3,
//       alpha: Math.random(),
//       speed: Math.random() * 0.004 + 0.001,
//     }));
//     const draw = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       stars.forEach((s) => {
//         s.alpha += s.speed;
//         if (s.alpha > 1) {
//           s.alpha = 0;
//           s.x = Math.random() * canvas.width;
//           s.y = Math.random() * canvas.height;
//         }
//         ctx.beginPath();
//         ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
//         ctx.fillStyle = `rgba(180,220,255,${s.alpha * 0.6})`;
//         ctx.fill();
//       });
//       animFrame = requestAnimationFrame(draw);
//     };
//     draw();
//     return () => {
//       cancelAnimationFrame(animFrame);
//       window.removeEventListener("resize", resize);
//     };
//   }, []);
//   return (
//     <canvas
//       ref={canvasRef}
//       className="absolute inset-0 w-full h-full pointer-events-none"
//       style={{ zIndex: 0 }}
//     />
//   );
// };

// const defaultBanners = [
//   {
//     _id: "default-1",
//     url: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?q=80&w=1920&auto=format&fit=crop",
//     title: "Premium Computer Accessories",
//     link: "/products",
//     isActive: true,
//     order: 0,
//   },
//   {
//     _id: "default-2",
//     url: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?q=80&w=1920&auto=format&fit=crop",
//     title: "Upgrade Your Gaming Setup",
//     link: "/products",
//     isActive: true,
//     order: 1,
//   },
//   {
//     _id: "default-3",
//     url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop",
//     title: "Exclusive Mechanical Keyboards",
//     link: "/products",
//     isActive: true,
//     order: 2,
//   }
// ];

// const HomePage: React.FC = () => {
//   const navigate = useNavigate();
//   const [currentSlide, setCurrentSlide] = React.useState(0);

//   const {
//     data: banners = [],
//   } = useQuery({
//     queryKey: ["banners"],
//     queryFn: () => bannerService.getBanners(),
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const {
//     data: homeProductsData,
//     isLoading: homeProductsLoading,
//     error: homeProductsError,
//     refetch: refetchHomeProducts,
//   } = useQuery({
//     queryKey: ["homeProducts"],
//     queryFn: () => productService.getProducts({ limit: 16 }),
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const activeBanners = banners.length > 0 ? banners : defaultBanners;

//   useEffect(() => {
//     if (activeBanners.length <= 1) return;
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [activeBanners.length]);

//   const features = [
//     {
//       icon: <Truck className="h-8 w-8 text-blue-600" />,
//       title: "Fast Delivery",
//       description: "Across Pakistan in 3-7 business days",
//     },
//     {
//       icon: <Shield className="h-8 w-8 text-blue-600" />,
//       title: "Secure Payments",
//       description: "100% secure with multiple payment options",
//     },
//     {
//       icon: <CreditCard className="h-8 w-8 text-blue-600" />,
//       title: "Easy Returns",
//       description: "14-day return policy for all products",
//     },
//     {
//       icon: <Star className="h-8 w-8 text-blue-600" />,
//       title: "Quality Products",
//       description: "Verified quality from trusted brands",
//     },
//   ];

//   const accessories = [
//     {
//       icon: <Mouse className="h-8 w-8 text-red-500" />,
//       name: "Gaming Mouse",
//       category: "mouse",
//       bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20",
//       glow: "rgba(239,68,68,0.4)",
//     },
//     {
//       icon: <Keyboard className="h-8 w-8 text-green-500" />,
//       name: "Keyboard",
//       category: "keyboard",
//       bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20",
//       glow: "rgba(34,197,94,0.4)",
//     },
//     {
//       icon: <Headphones className="h-8 w-8 text-purple-500" />,
//       name: "Headset",
//       category: "headphones",
//       bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20",
//       glow: "rgba(168,85,247,0.4)",
//     },
//     {
//       icon: <Monitor className="h-8 w-8 text-blue-500" />,
//       name: "Monitor",
//       category: "monitor",
//       bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
//       glow: "rgba(59,130,246,0.4)",
//     },
//     {
//       icon: <Webcam className="h-8 w-8 text-yellow-500" />,
//       name: "Webcam",
//       category: "webcam",
//       bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20",
//       glow: "rgba(234,179,8,0.4)",
//     },
//     {
//       icon: <Music className="h-8 w-8 text-pink-500" />,
//       name: "Speakers",
//       category: "speakers",
//       bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20",
//       glow: "rgba(236,72,153,0.4)",
//     },
//   ];

//   const accessoriesFull = [
//     {
//       icon: <Mouse className="h-12 w-12 text-red-500" />,
//       name: "Gaming Mouse",
//       bgClass: "bg-gradient-to-br from-red-500/20 to-pink-600/20",
//     },
//     {
//       icon: <Keyboard className="h-12 w-12 text-green-500" />,
//       name: "Mechanical Keyboard",
//       bgClass: "bg-gradient-to-br from-green-500/20 to-teal-600/20",
//     },
//     {
//       icon: <Headphones className="h-12 w-12 text-purple-500" />,
//       name: "Wireless Headset",
//       bgClass: "bg-gradient-to-br from-purple-500/20 to-indigo-600/20",
//     },
//     {
//       icon: <Monitor className="h-12 w-12 text-blue-500" />,
//       name: "Gaming Monitor",
//       bgClass: "bg-gradient-to-br from-blue-500/20 to-cyan-600/20",
//     },
//     {
//       icon: <Webcam className="h-12 w-12 text-yellow-500" />,
//       name: "HD Webcam",
//       bgClass: "bg-gradient-to-br from-yellow-500/20 to-orange-600/20",
//     },
//     {
//       icon: <Music className="h-12 w-12 text-pink-500" />,
//       name: "Studio Speakers",
//       bgClass: "bg-gradient-to-br from-pink-500/20 to-rose-600/20",
//     },
//   ];

//   const allProducts = homeProductsData?.data?.products || [];
//   const featuredProducts = allProducts.slice(0, 4);
//   const newArrivalProducts = allProducts.slice(4, 8);

//   const isLoading = homeProductsLoading;
//   const hasErrors = !!homeProductsError;
//   const isDatabaseEmpty = !isLoading && !hasErrors && allProducts.length === 0;

//   const handleRetry = async () => {
//     try {
//       await refetchHomeProducts();
//       setTimeout(() => window.location.reload(), 500);
//     } catch (error) {
//       console.error("Error during retry:", error);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
//         <div className="text-center">
//           <Loader size="lg" />
//           <p className="mt-4 text-gray-600 text-lg">
//             Loading amazing products...
//           </p>
//           <p className="text-sm text-gray-500 mt-2">This might take a moment</p>
//         </div>
//       </div>
//     );
//   }

//   if (hasErrors) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
//         <div className="max-w-md text-center">
//           <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
//             <AlertCircle className="h-10 w-10 text-red-600" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 mb-4">
//             Oops! Something went wrong
//           </h2>
//           <p className="text-gray-600 mb-6">
//             We're having trouble loading products. This might be due to server
//             issues.
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
//     );
//   }

//   /* ══════════════════════════════════════════════════════════════════════════
//      ✨ PREMIUM HERO — main render
//   ══════════════════════════════════════════════════════════════════════════ */
//   return (
//     <div>
//       <Helmet>
//         <title>BlackCart — Premium Computer &amp; Gaming Accessories in Pakistan</title>
//         <meta name="description" content="Shop gaming mice, mechanical keyboards, headphones and computer accessories at BlackCart. Fast delivery across Pakistan. 14-day easy returns. Order now!" />
//         <meta property="og:title" content="BlackCart — Premium Computer & Gaming Accessories in Pakistan" />
//         <meta property="og:description" content="Shop gaming mice, mechanical keyboards, headphones and computer accessories at BlackCart. Fast delivery across Pakistan." />
//         <meta property="og:url" content="https://blackcart.store/" />
//         <meta property="og:type" content="website" />
//         <link rel="canonical" href="https://blackcart.store/" />
//       </Helmet>
//       {/* ─── HERO SLIDER SECTION ──────────────────────────────────────────────────── */}
//       <section
//         className="relative overflow-hidden text-white w-full h-[40vh] min-h-[260px] sm:h-[50vh] sm:min-h-[360px] md:h-[calc(100vh-80px)] md:min-h-[480px]"
//         style={{
//           fontFamily: "'DM Sans', sans-serif",
//           background: "#020817"
//         }}
//       >
//         <div className="relative w-full h-full">
//           {activeBanners.map((banner, index) => {
//             const bannerImgUrl = banner.url.startsWith('http')
//               ? banner.url
//               : `${import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com'}${banner.url}`;

//             return (
//               <motion.div
//                 key={banner._id}
//                 className="absolute inset-0 w-full h-full"
//                 initial={{ opacity: 0 }}
//                 animate={{
//                   opacity: index === currentSlide ? 1 : 0,
//                   zIndex: index === currentSlide ? 10 : 0
//                 }}
//                 transition={{ duration: 0.8, ease: "easeInOut" }}
//               >
//                 {/* Background Banner Image */}
//                 <img
//                   src={bannerImgUrl}
//                   alt={banner.title || "Promotional Banner"}
//                   className="w-full h-full object-cover select-none"
//                   onError={(e) => {
//                     e.currentTarget.src = 'https://placehold.co/1920x600?text=Computer+Accessories+Offer';
//                   }}
//                 />

//                 {/* Banner Click Link Overlay */}
//                 {banner.link && (
//                   banner.link.startsWith('http') ? (
//                     <a
//                       href={banner.link}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="absolute inset-0 w-full h-full cursor-pointer z-20"
//                     />
//                   ) : (
//                     <Link
//                       to={banner.link}
//                       className="absolute inset-0 w-full h-full cursor-pointer z-20"
//                     />
//                   )
//                 )}

//                 {/* Premium Dark Gradient Overlay */}
//                 <div
//                   className="absolute inset-0 pointer-events-none z-10"
//                   style={{
//                     background: "linear-gradient(to top, rgba(2, 8, 23, 0.7) 0%, rgba(2, 8, 23, 0.2) 50%, rgba(2, 8, 23, 0.4) 100%)"
//                   }}
//                 />

//                 {/* Optional overlay banner title */}
//                 {banner.title && (
//                   <div className="absolute bottom-16 left-6 md:left-12 max-w-xl z-20 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 hidden md:block">
//                     <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
//                       {banner.title}
//                     </h2>
//                   </div>
//                 )}
//               </motion.div>
//             );
//           })}

//           {/* Navigation Arrows */}
//           {activeBanners.length > 1 && (
//             <>
//               <button
//                 onClick={() => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
//                 className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
//                 aria-label="Previous Slide"
//               >
//                 <ChevronLeft className="h-6 w-6" />
//               </button>
//               <button
//                 onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
//                 className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
//                 aria-label="Next Slide"
//               >
//                 <ChevronRight className="h-6 w-6" />
//               </button>

//               {/* Dots / Indicators */}
//               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
//                 {activeBanners.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentSlide(index)}
//                     className={`h-2.5 rounded-full transition-all duration-300 ${
//                       index === currentSlide
//                         ? 'bg-blue-600 w-6'
//                         : 'bg-white/40 hover:bg-white/70 w-2.5'
//                     }`}
//                     aria-label={`Go to slide ${index + 1}`}
//                   />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </section>

//       {/* Admin Notice if database has no products */}
//       {allProducts.length === 0 && (
//         <section className="py-12 bg-gray-50 flex items-center justify-center">
//           <div className="max-w-4xl mx-auto px-4 w-full">
//             <div
//               className="rounded-2xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden"
//               style={{
//                 background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
//                 border: "1px solid rgba(59,130,246,0.3)"
//               }}
//             >
//               {/* background ambient shape */}
//               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full opacity-30 blur-2xl pointer-events-none" />

//               <div className="text-center max-w-2xl mx-auto space-y-6">
//                 <div
//                   className="inline-flex items-center justify-center p-3 rounded-xl mb-2 backdrop-blur-sm"
//                   style={{ background: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.15)" }}
//                 >
//                   <AlertCircle className="h-8 w-8 text-yellow-400" />
//                 </div>
//                 <h3 className="text-2xl md:text-3xl font-bold tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
//                   Admin Notice
//                 </h3>
//                 <p className="text-gray-300 text-sm md:text-base leading-relaxed">
//                   No products found in the database. Please add products to start displaying your store products.
//                 </p>
//                 <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
//                   <Link
//                     to="/admin/dashboard"
//                     className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center text-sm border border-blue-500/20"
//                   >
//                     <ShoppingBag className="h-5 w-5 mr-2" />
//                     Add Products (Admin)
//                   </Link>
//                   <Link
//                     to="/dashboard"
//                     className="bg-transparent border-2 border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold py-3 px-8 rounded-xl transition-all inline-flex items-center justify-center text-sm"
//                   >
//                     Go to Dashboard
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Accessories Section — Mobile only */}
//       <section className="py-12 md:py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white lg:hidden">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8 md:mb-10">
//             <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
//               Premium Accessories
//             </h2>
//             <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
//               Enhance your setup with our top-quality computer accessories
//             </p>
//           </div>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
//             {accessoriesFull.map((item, index) => (
//               <div
//                 key={index}
//                 className={`${item.bgClass} rounded-xl p-3 md:p-5 text-center border border-white/10 hover:scale-105 transition-transform`}
//               >
//                 <div className="mb-2 md:mb-4 flex justify-center">
//                   <div
//                     className={`p-2 md:p-4 rounded-full ${item.bgClass} border border-white/30`}
//                   >
//                     {React.cloneElement(item.icon, {
//                       className: "h-6 w-6 md:h-8 md:w-8",
//                     })}
//                   </div>
//                 </div>
//                 <span className="text-xs md:text-sm font-medium">
//                   {item.name}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <div className="text-center mt-6 md:mt-8">
//             <Link
//               to="/products?category=accessories"
//               className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-sm md:text-lg transition-colors"
//             >
//               View All Accessories{" "}
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
//                   <h2 className="text-xl md:text-2xl font-bold text-gray-900">
//                     Featured Products
//                   </h2>
//                 </div>
//                 <p className="text-sm md:text-base text-gray-600">
//                   Handpicked quality products for you
//                 </p>
//               </div>
//               <Link
//                 to="/products?featured=true"
//                 className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
//               >
//                 View All <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//               {featuredProducts.map((product: any, index: number) => (
//                 <ProductCard
//                   key={product._id}
//                   product={product}
//                   index={index}
//                 />
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
//                   <h2 className="text-xl md:text-2xl font-bold text-gray-900">
//                     New Arrivals
//                   </h2>
//                 </div>
//                 <p className="text-sm md:text-base text-gray-600">
//                   Discover our latest products
//                 </p>
//               </div>
//               <Link
//                 to="/products?newArrivals=true"
//                 className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
//               >
//                 View All <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
//               </Link>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//               {newArrivalProducts.map((product: any, index: number) => (
//                 <ProductCard
//                   key={product._id}
//                   product={product}
//                   index={index}
//                 />
//               ))}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* Popular Computer Accessories — Desktop only */}
//       <section className="py-12 md:py-20 bg-gray-50 hidden lg:block">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-8 md:mb-12">
//             <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">
//               Popular Computer Accessories
//             </h2>
//             <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
//               Upgrade your workspace with our bestselling accessories
//             </p>
//           </div>
//           <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6">
//             {accessoriesFull.map((item, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="bg-white rounded-xl p-4 md:p-5 text-center border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
//               >
//                 <div className="mb-3 md:mb-4 flex justify-center">
//                   <div className={`p-3 md:p-4 rounded-full ${item.bgClass}`}>
//                     {React.cloneElement(item.icon, {
//                       className: "h-8 w-8 md:h-10 md:w-10",
//                     })}
//                   </div>
//                 </div>
//                 <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 text-sm md:text-base">
//                   {item.name}
//                 </h3>
//                 <Link
//                   to="/products"
//                   className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium inline-flex items-center gap-1"
//                 >
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
//           <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12 text-gray-900">
//             Why Choose BlackCart?
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             {features.map((feature, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="bg-gray-50 rounded-xl p-5 md:p-6 text-center border border-gray-200 shadow-lg"
//               >
//                 <div className="mb-3 md:mb-4 flex justify-center">
//                   <div className="p-2 md:p-3 bg-blue-50 rounded-full">
//                     {feature.icon}
//                   </div>
//                 </div>
//                 <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2 text-gray-800">
//                   {feature.title}
//                 </h3>
//                 <p className="text-sm md:text-base text-gray-600">
//                   {feature.description}
//                 </p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Trusted by Thousands */}
//       <section className="py-10 md:py-12 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="text-center mb-6 md:mb-8">
//             <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
//               Trusted by Thousands
//             </h2>
//             <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
//               Join our community of satisfied customers across Pakistan
//             </p>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
//             {[
//               {
//                 icon: (
//                   <Award className="h-10 w-10 md:h-12 md:w-12 text-yellow-400 mx-auto mb-3 md:mb-4" />
//                 ),
//                 val: "4.8/5",
//                 label: "Customer Rating",
//               },
//               {
//                 icon: (
//                   <Truck className="h-10 w-10 md:h-12 md:w-12 text-green-400 mx-auto mb-3 md:mb-4" />
//                 ),
//                 val: "50K+",
//                 label: "Successful Deliveries",
//               },
//               {
//                 icon: (
//                   <Shield className="h-10 w-10 md:h-12 md:w-12 text-blue-400 mx-auto mb-3 md:mb-4" />
//                 ),
//                 val: "100%",
//                 label: "Secure Payments",
//               },
//               {
//                 icon: (
//                   <Users className="h-10 w-10 md:h-12 md:w-12 text-purple-400 mx-auto mb-3 md:mb-4" />
//                 ),
//                 val: "24/7",
//                 label: "Customer Support",
//               },
//             ].map((s, i) => (
//               <div key={i} className="text-center">
//                 {s.icon}
//                 <div className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
//                   {s.val}
//                 </div>
//                 <div className="text-gray-300 text-sm md:text-base">
//                   {s.label}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-12 md:py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//           <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
//             Ready to Experience the Best Shopping?
//           </h2>
//           <p className="text-base md:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto">
//             Join thousands of satisfied customers across Pakistan who trust
//             BlackCart for their shopping needs.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
//             {/* ⚠️ AUTH TEMPORARILY DISABLED — Create Free Account button commented out
//             <Link
//               to="/register"
//               className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all"
//             >
//               Create Free Account
//             </Link>
//             */}
//             <Link
//               to="/products"
//               className="bg-transparent border-2 border-white hover:bg-white/10 font-bold py-2 md:py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-colors"
//             >
//               Browse Products
//             </Link>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default HomePage;

import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import bannerService from "../services/bannerService";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";

/* ─── Google Fonts now loaded in index.html <head> — no JS injection needed ─ */

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

const defaultBanners = [
  {
    _id: "default-1",
    url: "https://images.unsplash.com/photo-1618424181497-157f25b6ddd5?q=80&w=1920&auto=format&fit=crop",
    title: "Premium Computer Accessories",
    link: "/products",
    isActive: true,
    order: 0,
  },
  {
    _id: "default-2",
    url: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?q=80&w=1920&auto=format&fit=crop",
    title: "Upgrade Your Gaming Setup",
    link: "/products",
    isActive: true,
    order: 1,
  },
  {
    _id: "default-3",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop",
    title: "Exclusive Mechanical Keyboards",
    link: "/products",
    isActive: true,
    order: 2,
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerService.getBanners(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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

  const activeBanners = banners.length > 0 ? banners : defaultBanners;

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeBanners.length]);

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

  /* ══════════════════════════════════════════════════════════════════════════
     ✨ PREMIUM HERO — main render
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <div>
      <Helmet>
        <title>
          BlackCart — Premium Computer &amp; Gaming Accessories in Pakistan
        </title>
        <meta
          name="description"
          content="Shop gaming mice, mechanical keyboards, headphones and computer accessories at BlackCart. Fast delivery across Pakistan. 14-day easy returns. Order now!"
        />
        <meta
          property="og:title"
          content="BlackCart — Premium Computer & Gaming Accessories in Pakistan"
        />
        <meta
          property="og:description"
          content="Shop gaming mice, mechanical keyboards, headphones and computer accessories at BlackCart. Fast delivery across Pakistan."
        />
        <meta property="og:url" content="https://blackcart.store/" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://blackcart.store/" />
      </Helmet>

      {/* ─── HERO SLIDER SECTION ──────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white w-full h-screen min-h-screen sm:h-[50vh] sm:min-h-[360px] md:h-[calc(100vh-80px)] md:min-h-[480px]"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: "#020817",
        }}
      >
        <div className="relative w-full h-full">
          {activeBanners.map((banner, index) => {
            const bannerImgUrl = banner.url.startsWith("http")
              ? banner.url
              : `${import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com"}${banner.url}`;

            return (
              <motion.div
                key={banner._id}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: index === currentSlide ? 1 : 0,
                  zIndex: index === currentSlide ? 10 : 0,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {/* Blurred background layer - always visible behind the image */}
                <img
                  src={bannerImgUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 select-none"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                {/* Main Banner Image - object-cover on all devices */}
                <img
                  src={bannerImgUrl}
                  alt={banner.title || "Promotional Banner"}
                  className="relative w-full h-full object-cover select-none"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/1920x1080?text=Computer+Accessories+Offer";
                  }}
                />

                {/* Banner Click Link Overlay */}
                {banner.link &&
                  (banner.link.startsWith("http") ? (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 w-full h-full cursor-pointer z-20"
                    />
                  ) : (
                    <Link
                      to={banner.link}
                      className="absolute inset-0 w-full h-full cursor-pointer z-20"
                    />
                  ))}

                {/* Premium Dark Gradient Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(2, 8, 23, 0.7) 0%, rgba(2, 8, 23, 0.2) 50%, rgba(2, 8, 23, 0.4) 100%)",
                  }}
                />

                {/* Optional overlay banner title */}
                {banner.title && (
                  <div className="absolute bottom-16 left-6 md:left-12 max-w-xl z-20 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 hidden md:block">
                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                      {banner.title}
                    </h2>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentSlide(
                    (prev) =>
                      (prev - 1 + activeBanners.length) % activeBanners.length,
                  )
                }
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
                }
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
                aria-label="Next Slide"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Dots / Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex space-x-2.5">
                {activeBanners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-blue-600 w-6"
                        : "bg-white/40 hover:bg-white/70 w-2.5"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Admin Notice if database has no products */}
      {allProducts.length === 0 && (
        <section className="py-12 bg-gray-50 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 w-full">
            <div
              className="rounded-2xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              {/* background ambient shape */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full opacity-30 blur-2xl pointer-events-none" />

              <div className="text-center max-w-2xl mx-auto space-y-6">
                <div
                  className="inline-flex items-center justify-center p-3 rounded-xl mb-2 backdrop-blur-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <AlertCircle className="h-8 w-8 text-yellow-400" />
                </div>
                <h3
                  className="text-2xl md:text-3xl font-bold tracking-wide"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Admin Notice
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  No products found in the database. Please add products to
                  start displaying your store products.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <Link
                    to="/admin/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center text-sm border border-blue-500/20"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Add Products (Admin)
                  </Link>
                  <Link
                    to="/dashboard"
                    className="bg-transparent border-2 border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-bold py-3 px-8 rounded-xl transition-all inline-flex items-center justify-center text-sm"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
            {/* ⚠️ AUTH TEMPORARILY DISABLED — Create Free Account button commented out */}
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

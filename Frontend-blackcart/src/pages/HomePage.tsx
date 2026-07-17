// import React, { useEffect, useMemo, useState } from "react";
// import { Helmet } from "react-helmet-async";
// import { motion } from "framer-motion";
// import { Link } from "react-router-dom";
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
//   Webcam,
//   Music,
//   AlertCircle,
//   RefreshCw,
//   ChevronLeft,
//   ChevronRight,
// } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { productService } from "../services/productService";
// import bannerService from "../services/bannerService";
// import ProductRail from "../components/product/ProductRail";
// import InlinePromoBanner from "../components/product/InlinePromoBanner";
// import { getBrowsingHistory } from "../utils/browsingHistory";

// /* ─── Google Fonts now loaded in index.html <head> — no JS injection needed ─ */

// /* ─── Animated canvas starfield ─────────────────────────────────────────── */
// const defaultBanners = [
//   {
//     _id: "default-1",
//     url: "https://design.canva.ai/BRgtYcrIkGFURnC",
//     mobileUrl: undefined,
//     title: "Premium Computer Accessories",
//     link: "/products",
//     isActive: true,
//     order: 0,
//   },
//   {
//     _id: "default-2",
//     url: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?q=80&w=1920&auto=format&fit=crop",
//     mobileUrl: undefined,
//     title: "Upgrade Your Gaming Setup",
//     link: "/products",
//     isActive: true,
//     order: 1,
//   },
//   {
//     _id: "default-3",
//     url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop",
//     mobileUrl: undefined,
//     title: "Exclusive Mechanical Keyboards",
//     link: "/products",
//     isActive: true,
//     order: 2,
//   },
// ];

// const resolveBannerUrl = (url: string) => {
//   if (url.startsWith("http")) return url;
//   const apiBase =
//     import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";
//   return `${apiBase}${url}`;
// };

// const HomePage: React.FC = () => {
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [selectedLaunchCategory, setSelectedLaunchCategory] = useState("all");
//   const browsingHistory = useMemo(() => getBrowsingHistory(), []);

//   const { data: banners = [] } = useQuery({
//     queryKey: ["banners"],
//     queryFn: () => bannerService.getBanners(),
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const {
//     data: homeSectionsResponse,
//     isLoading: homeProductsLoading,
//     error: homeProductsError,
//     refetch: refetchHomeProducts,
//   } = useQuery({
//     queryKey: ["homeSections", browsingHistory.categorySlugs.join(",")],
//     queryFn: () =>
//       productService.getHomeSections({
//         recentCategories: browsingHistory.categorySlugs,
//         limit: 12,
//       }),
//     retry: 1,
//     staleTime: 5 * 60 * 1000,
//     refetchOnWindowFocus: false,
//   });

//   const activeBanners = banners.length > 0 ? banners : defaultBanners;
//   const activeBanner = activeBanners[currentSlide] || activeBanners[0];
//   const desktopBannerUrl = resolveBannerUrl(activeBanner.url);
//   const rawMobileBannerUrl = activeBanner.mobileUrl || activeBanner.url;
//   const mobileBannerUrl = resolveBannerUrl(rawMobileBannerUrl);

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
//       description: "Normal 4-6 or Express 2-3 working days",
//     },
//     {
//       icon: <Shield className="h-8 w-8 text-blue-600" />,
//       title: "Secure Payments",
//       description: "100% secure with multiple payment options",
//     },
//     {
//       icon: <CreditCard className="h-8 w-8 text-blue-600" />,
//       title: "Easy Returns",
//       description: "3-day return policy for eligible products",
//     },
//     {
//       icon: <Star className="h-8 w-8 text-blue-600" />,
//       title: "Quality Products",
//       description: "Verified quality from trusted brands",
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

//   const homeSections = homeSectionsResponse?.data;
//   const justLaunchedProducts = homeSections?.justLaunched.products || [];
//   const launchedCategorySlugs = new Set(
//     justLaunchedProducts.map((product) => product.categorySlug).filter(Boolean),
//   );
//   const launchedCategories = (homeSections?.categories || []).filter(
//     (category) => launchedCategorySlugs.has(category.slug),
//   );
//   const visibleJustLaunched =
//     selectedLaunchCategory === "all"
//       ? justLaunchedProducts
//       : justLaunchedProducts.filter(
//           (product) => product.categorySlug === selectedLaunchCategory,
//         );
//   const justLaunchedViewAllUrl =
//     selectedLaunchCategory === "all"
//       ? "/products?newArrivals=true"
//       : `/categories/${selectedLaunchCategory}`;
//   const recentlyViewedIds = new Set(browsingHistory.productIds);
//   const categorySections = (homeSections?.categorySections || []).map(
//     (section) => ({
//       ...section,
//       products: section.products.filter(
//         (product) => !recentlyViewedIds.has(product._id),
//       ),
//     }),
//   );
//   const inlineBanners = banners.slice(1, 3);

//   const handleRetry = async () => {
//     await refetchHomeProducts();
//   };

//   /* ══════════════════════════════════════════════════════════════════════════
//      ✨ PREMIUM HERO — main render
//   ══════════════════════════════════════════════════════════════════════════ */
//   return (
//     <div>
//       <Helmet>
//         <title>
//           BlackCart — Premium Computer &amp; Gaming Accessories in Pakistan
//         </title>
//         <meta
//           name="description"
//           content="Shop gaming mice, mechanical keyboards, headphones and computer accessories at BlackCart. Delivery across Pakistan and 3-day returns on eligible products."
//         />
//         <meta
//           property="og:title"
//           content="BlackCart — Premium Computer & Gaming Accessories in Pakistan"
//         />
//         <meta
//           property="og:description"
//           content="Shop gaming mice, mechanical keyboards, headphones and computer accessories at BlackCart. Fast delivery across Pakistan."
//         />
//         <meta property="og:url" content="https://blackcart.store/" />
//         <meta property="og:type" content="website" />
//         <link rel="canonical" href="https://blackcart.store/" />
//       </Helmet>
//       {/* ─── HERO SLIDER SECTION ──────────────────────────────────────────────────── */}
//       <section
//         className="relative overflow-hidden text-white w-full h-[55vw] min-h-[280px] max-h-[600px] md:aspect-[16/5] md:h-auto md:min-h-0"
//         style={{
//           fontFamily: "'DM Sans', sans-serif",
//           background: "#020817",
//         }}
//       >
//         <div className="relative w-full h-full">
//           {[activeBanner].map((banner) => {
//             return (
//               <motion.div
//                 key={`${banner._id}-${currentSlide}`}
//                 className="absolute inset-0 w-full h-full"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1, zIndex: 10 }}
//                 transition={{ duration: 0.8, ease: "easeInOut" }}
//               >
//                 <img
//                   src={mobileBannerUrl}
//                   alt=""
//                   aria-hidden="true"
//                   decoding="async"
//                   className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-70 md:hidden"
//                 />
//                 <picture className="relative block h-full w-full">
//                   <source media="(max-width: 767px)" srcSet={mobileBannerUrl} />
//                   {/* <img
//                     src={desktopBannerUrl}
//                     alt={banner.title || "Promotional Banner"}
//                     decoding="async"
//                     fetchPriority="high"
//                     className="h-full w-full select-none object-contain md:object-cover"
//                   /> */}
//                   <img
//                     src={desktopBannerUrl}
//                     alt={banner.title || "Promotional Banner"}
//                     decoding="async"
//                     fetchPriority="high"
//                     className="h-full w-full select-none object-cover"
//                   />
//                 </picture>

//                 {/* Banner Click Link Overlay */}
//                 {banner.link &&
//                   (banner.link.startsWith("http") ? (
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
//                   ))}

//                 {/* Premium Dark Gradient Overlay */}
//                 <div
//                   className="absolute inset-0 pointer-events-none z-10 hidden md:block"
//                   style={{
//                     background:
//                       "linear-gradient(to top, rgba(2, 8, 23, 0.7) 0%, rgba(2, 8, 23, 0.2) 50%, rgba(2, 8, 23, 0.4) 100%)",
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
//                 onClick={() =>
//                   setCurrentSlide(
//                     (prev) =>
//                       (prev - 1 + activeBanners.length) % activeBanners.length,
//                   )
//                 }
//                 className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all hover:scale-105 active:scale-95"
//                 aria-label="Previous Slide"
//               >
//                 <ChevronLeft className="h-6 w-6" />
//               </button>
//               <button
//                 onClick={() =>
//                   setCurrentSlide((prev) => (prev + 1) % activeBanners.length)
//                 }
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
//                         ? "bg-blue-600 w-6"
//                         : "bg-white/40 hover:bg-white/70 w-2.5"
//                     }`}
//                     aria-label={`Go to slide ${index + 1}`}
//                   />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </section>

//       {homeProductsError && (
//         <section className="py-10 bg-white text-center px-4">
//           <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
//           <p className="text-gray-600 mb-4">
//             Products are temporarily unavailable.
//           </p>
//           <button
//             onClick={() => void handleRetry()}
//             className="btn-primary inline-flex items-center"
//           >
//             <RefreshCw className="h-4 w-4 mr-2" /> Try Again
//           </button>
//         </section>
//       )}

//       {!homeProductsError && (
//         <>
//           <ProductRail
//             id="just-launched"
//             title="Just Launched"
//             subtitle="The newest products to arrive at BlackCart"
//             products={visibleJustLaunched}
//             viewAllUrl={justLaunchedViewAllUrl}
//             viewAllLabel={
//               selectedLaunchCategory === "all"
//                 ? "View All New Arrivals"
//                 : undefined
//             }
//             isLoading={homeProductsLoading}
//             categories={launchedCategories}
//             selectedCategory={selectedLaunchCategory}
//             onCategoryChange={setSelectedLaunchCategory}
//             backgroundClassName="bg-white"
//           />

//           <InlinePromoBanner banner={inlineBanners[0]} />

//           <ProductRail
//             id="best-sellers"
//             title="Best Sellers"
//             subtitle="Popular products ranked from paid or delivered orders"
//             products={homeSections?.bestSellers.products || []}
//             viewAllUrl="/products?sort=soldCount&order=desc"
//             isLoading={homeProductsLoading}
//             backgroundClassName="bg-gray-50"
//           />

//           <ProductRail
//             id="best-offers"
//             title="Best Offers"
//             subtitle="The biggest valid discounts available right now"
//             products={homeSections?.bestOffers.products || []}
//             viewAllUrl="/products?onSale=true&sort=discountPercentage&order=desc"
//             isLoading={homeProductsLoading}
//             backgroundClassName="bg-white"
//           />

//           <InlinePromoBanner banner={inlineBanners[1]} />

//           <ProductRail
//             id="recommended-for-you"
//             title="Recommended For You"
//             subtitle="Private recommendations based only on browsing stored on this device"
//             products={homeSections?.recommended.products || []}
//             viewAllUrl="/products"
//             isLoading={homeProductsLoading}
//             backgroundClassName="bg-gray-50"
//           />

//           {!homeProductsLoading &&
//             categorySections.map((section, index) => (
//               <ProductRail
//                 key={section.category._id}
//                 id={`more-${section.category.slug}`}
//                 title={`More ${section.category.name}`}
//                 subtitle={`Explore more products in ${section.category.name}`}
//                 products={section.products}
//                 viewAllUrl={`/categories/${section.category.slug}`}
//                 backgroundClassName={
//                   index % 2 === 0 ? "bg-white" : "bg-gray-50"
//                 }
//               />
//             ))}
//         </>
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
//     </div>
//   );
// };

// export default HomePage;

import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  Webcam,
  Music,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import bannerService from "../services/bannerService";
import ProductRail from "../components/product/ProductRail";
import InlinePromoBanner from "../components/product/InlinePromoBanner";
import { getBrowsingHistory } from "../utils/browsingHistory";

/* ─── Google Fonts now loaded in index.html <head> — no JS injection needed ─ */

/* ─── Animated canvas starfield ─────────────────────────────────────────── */
const defaultBanners = [
  {
    _id: "default-1",
    url: "https://design.canva.ai/BRgtYcrIkGFURnC",
    mobileUrl: undefined,
    title: "Premium Computer Accessories",
    link: "/products",
    isActive: true,
    order: 0,
  },
  {
    _id: "default-2",
    url: "https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?q=80&w=1920&auto=format&fit=crop",
    mobileUrl: undefined,
    title: "Upgrade Your Gaming Setup",
    link: "/products",
    isActive: true,
    order: 1,
  },
  {
    _id: "default-3",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1920&auto=format&fit=crop",
    mobileUrl: undefined,
    title: "Exclusive Mechanical Keyboards",
    link: "/products",
    isActive: true,
    order: 2,
  },
];

const resolveBannerUrl = (url: string) => {
  if (url.startsWith("http")) return url;
  const apiBase =
    import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";
  return `${apiBase}${url}`;
};

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedLaunchCategory, setSelectedLaunchCategory] = useState("all");
  const browsingHistory = useMemo(() => getBrowsingHistory(), []);

  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerService.getBanners(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    data: homeSectionsResponse,
    isLoading: homeProductsLoading,
    error: homeProductsError,
    refetch: refetchHomeProducts,
  } = useQuery({
    queryKey: ["homeSections", browsingHistory.categorySlugs.join(",")],
    queryFn: () =>
      productService.getHomeSections({
        recentCategories: browsingHistory.categorySlugs,
        limit: 12,
      }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const activeBanners = banners.length > 0 ? banners : defaultBanners;
  const activeBanner = activeBanners[currentSlide] || activeBanners[0];
  const desktopBannerUrl = resolveBannerUrl(activeBanner.url);
  const hasMobileBannerImage = Boolean(activeBanner.mobileUrl);
  const rawMobileBannerUrl = activeBanner.mobileUrl || activeBanner.url;
  const mobileBannerUrl = resolveBannerUrl(rawMobileBannerUrl);

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
      description: "Normal 4-6 or Express 2-3 working days",
    },
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Secure Payments",
      description: "100% secure with multiple payment options",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
      title: "Easy Returns",
      description: "3-day return policy for eligible products",
    },
    {
      icon: <Star className="h-8 w-8 text-blue-600" />,
      title: "Quality Products",
      description: "Verified quality from trusted brands",
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

  const homeSections = homeSectionsResponse?.data;
  const justLaunchedProducts = homeSections?.justLaunched.products || [];
  const launchedCategorySlugs = new Set(
    justLaunchedProducts.map((product) => product.categorySlug).filter(Boolean),
  );
  const launchedCategories = (homeSections?.categories || []).filter(
    (category) => launchedCategorySlugs.has(category.slug),
  );
  const visibleJustLaunched =
    selectedLaunchCategory === "all"
      ? justLaunchedProducts
      : justLaunchedProducts.filter(
          (product) => product.categorySlug === selectedLaunchCategory,
        );
  const justLaunchedViewAllUrl =
    selectedLaunchCategory === "all"
      ? "/products?newArrivals=true"
      : `/categories/${selectedLaunchCategory}`;
  const recentlyViewedIds = new Set(browsingHistory.productIds);
  const categorySections = (homeSections?.categorySections || []).map(
    (section) => ({
      ...section,
      products: section.products.filter(
        (product) => !recentlyViewedIds.has(product._id),
      ),
    }),
  );
  const inlineBanners = banners.slice(1, 3);

  const handleRetry = async () => {
    await refetchHomeProducts();
  };

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
          content="Shop gaming mice, mechanical keyboards, headphones and computer accessories at BlackCart. Delivery across Pakistan and 3-day returns on eligible products."
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
        className="relative overflow-hidden text-white w-full aspect-[3/5] md:aspect-[16/5]"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: "#020817",
        }}
      >
        <div className="relative w-full h-full">
          {[activeBanner].map((banner) => {
            return (
              <motion.div
                key={`${banner._id}-${currentSlide}`}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, zIndex: 10 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <img
                  src={mobileBannerUrl}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-70 md:hidden"
                />
                <picture className="relative block h-full w-full">
                  <source media="(max-width: 767px)" srcSet={mobileBannerUrl} />
                  <img
                    src={desktopBannerUrl}
                    alt={banner.title || "Promotional Banner"}
                    decoding="async"
                    fetchPriority="high"
                    className={`h-full w-full select-none ${hasMobileBannerImage ? "object-cover" : "object-contain md:object-cover"}`}
                  />
                </picture>

                {banner.link && banner.link.startsWith("http") ? (
                  <a
                    href={banner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 w-full h-full cursor-pointer z-20"
                  />
                ) : banner.link ? (
                  <Link
                    to={banner.link}
                    className="absolute inset-0 w-full h-full cursor-pointer z-20"
                  />
                ) : null}

                {/* Premium Dark Gradient Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none z-10 hidden md:block"
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

      {homeProductsError && (
        <section className="py-10 bg-white text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            Products are temporarily unavailable.
          </p>
          <button
            onClick={() => void handleRetry()}
            className="btn-primary inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </button>
        </section>
      )}

      {!homeProductsError && (
        <>
          <ProductRail
            id="just-launched"
            title="Just Launched"
            subtitle="The newest products to arrive at BlackCart"
            products={visibleJustLaunched}
            viewAllUrl={justLaunchedViewAllUrl}
            viewAllLabel={
              selectedLaunchCategory === "all"
                ? "View All New Arrivals"
                : undefined
            }
            isLoading={homeProductsLoading}
            categories={launchedCategories}
            selectedCategory={selectedLaunchCategory}
            onCategoryChange={setSelectedLaunchCategory}
            backgroundClassName="bg-white"
          />

          <InlinePromoBanner banner={inlineBanners[0]} />

          <ProductRail
            id="best-sellers"
            title="Best Sellers"
            subtitle="Popular products ranked from paid or delivered orders"
            products={homeSections?.bestSellers.products || []}
            viewAllUrl="/products?sort=soldCount&order=desc"
            isLoading={homeProductsLoading}
            backgroundClassName="bg-gray-50"
          />

          <ProductRail
            id="best-offers"
            title="Best Offers"
            subtitle="The biggest valid discounts available right now"
            products={homeSections?.bestOffers.products || []}
            viewAllUrl="/products?onSale=true&sort=discountPercentage&order=desc"
            isLoading={homeProductsLoading}
            backgroundClassName="bg-white"
          />

          <InlinePromoBanner banner={inlineBanners[1]} />

          <ProductRail
            id="recommended-for-you"
            title="Recommended For You"
            subtitle="Private recommendations based only on browsing stored on this device"
            products={homeSections?.recommended.products || []}
            viewAllUrl="/products"
            isLoading={homeProductsLoading}
            backgroundClassName="bg-gray-50"
          />

          {!homeProductsLoading &&
            categorySections.map((section, index) => (
              <ProductRail
                key={section.category._id}
                id={`more-${section.category.slug}`}
                title={`More ${section.category.name}`}
                subtitle={`Explore more products in ${section.category.name}`}
                products={section.products}
                viewAllUrl={`/categories/${section.category.slug}`}
                backgroundClassName={
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }
              />
            ))}
        </>
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
    </div>
  );
};

export default HomePage;

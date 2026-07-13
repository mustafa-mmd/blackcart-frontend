import React, { useEffect } from "react";
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
  Sparkles,
  Clock,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import bannerService from "../services/bannerService";
import ProductCard from "../components/product/ProductCard";
import Loader from "../components/common/Loader";
import type { Product } from "../types";

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

const HomePage: React.FC = () => {
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
  const activeBanner = activeBanners[currentSlide] || activeBanners[0];
  const apiBase = import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";
  const desktopBannerUrl = activeBanner.url.startsWith("http")
    ? activeBanner.url
    : `${apiBase}${activeBanner.url}`;
  const rawMobileBannerUrl = activeBanner.mobileUrl || activeBanner.url;
  const mobileBannerUrl = rawMobileBannerUrl.startsWith("http")
    ? rawMobileBannerUrl
    : `${apiBase}${rawMobileBannerUrl}`;

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
        className="relative overflow-hidden text-white w-full h-[calc(100dvh-4rem)] min-h-[400px] md:h-[calc(100vh-4rem)] md:min-h-[480px]"
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
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobileBannerUrl}
                  />
                  <img
                    src={desktopBannerUrl}
                    alt={banner.title || "Promotional Banner"}
                    decoding="async"
                    fetchPriority="high"
                    className="h-full w-full select-none object-contain md:object-cover"
                  />
                </picture>

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

      {homeProductsLoading && (
        <section className="py-12 bg-white" aria-label="Loading products">
          <Loader size="lg" />
        </section>
      )}

      {homeProductsError && (
        <section className="py-10 bg-white text-center px-4">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">Products are temporarily unavailable.</p>
          <button onClick={() => void handleRetry()} className="btn-primary inline-flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" /> Try Again
          </button>
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
              {featuredProducts.map((product: Product, index: number) => (
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
              {newArrivalProducts.map((product: Product, index: number) => (
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

    </div>
  );
};

export default HomePage;

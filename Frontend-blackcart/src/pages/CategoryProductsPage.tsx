
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Filter, Grid, List, Star, 
  Package, XCircle, Search, 
  SlidersHorizontal, X, ShoppingCart
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import bannerService, { type HeroBanner } from '../services/bannerService';
import { useCart } from '../context/CartContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import type { Category, Product, StorefrontProduct } from '../types';
import { getImageUrl } from '../utils/imageUtils';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com';

interface CategoryFilters {
  sort: string;
  order: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  search: string;
}

type CategoryFilterKey = keyof CategoryFilters;
type StoreCategory = Omit<Category, 'image'> & {
  image?: string | { url?: string; secure_url?: string };
};

const DEFAULT_FILTERS: CategoryFilters = {
  sort: 'createdAt',
  order: 'desc',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  onSale: false,
  search: '',
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

const CategoryProductsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [category, setCategory] = useState<StoreCategory | null>(null);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<CategoryFilters>(DEFAULT_FILTERS);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilters, setActiveFilters] = useState<CategoryFilterKey[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [categoryBanner, setCategoryBanner] = useState<HeroBanner | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [hoverImageIndex, setHoverImageIndex] = useState<number>(0);
  const hoverSlideshowTimerRef = useRef<number | null>(null);
  
  const prevFiltersRef = useRef(filters);
  const isInitialMount = useRef(true);

  const getProductImage = (product: StorefrontProduct): string => {
    try {
      if (productService.getFirstImageUrl) return productService.getFirstImageUrl(product);
      const imageData = product?.images?.[0] || product?.image;
      if (!imageData) return '/images/placeholder-product.jpg';
      if (typeof imageData === 'object' && imageData !== null) {
        const url = imageData.url || imageData.secure_url;
        if (url && url.includes('cloudinary.com/demo')) return '/images/placeholder-product.jpg';
        return url || '/images/placeholder-product.jpg';
      }
      if (typeof imageData === 'string') {
        if (imageData.includes('cloudinary.com/demo')) return '/images/placeholder-product.jpg';
        if (imageData.startsWith('http')) return imageData;
        if (imageData.startsWith('/uploads')) return `${API_URL}${imageData}`;
        return `${API_URL}/uploads/${imageData}`;
      }
      return '/images/placeholder-product.jpg';
    } catch {
      return '/images/placeholder-product.jpg';
    }
  };  const getProductHoverImages = (product: StorefrontProduct): string[] => {
    const rawImages: unknown[] = [];
    const productWithGallery = product as StorefrontProduct & { gallery?: unknown[] | unknown };

    if (Array.isArray(product.images)) rawImages.push(...product.images);
    if (Array.isArray(productWithGallery.gallery)) rawImages.push(...productWithGallery.gallery);
    if (product.image) rawImages.push(product.image);
    if (product.thumbnail) rawImages.push(product.thumbnail);
    if (Array.isArray(product.colorVariants)) {
      product.colorVariants.forEach((variant) => {
        if (Array.isArray(variant.images)) rawImages.push(...variant.images);
      });
    }

    const urls = rawImages
      .map((imageData) => {
        try {
          return getImageUrl(imageData);
        } catch {
          return '';
        }
      })
      .filter((url): url is string => Boolean(url && url.trim() && !url.includes('cloudinary.com/demo')));

    const uniqueUrls = Array.from(new Set(urls));
    return uniqueUrls.length > 0 ? uniqueUrls : [getProductImage(product)];
  };

  const getCategoryCardImage = (product: StorefrontProduct): string => {
    const images = getProductHoverImages(product);
    if (hoveredProductId !== product._id) return images[0] || '/images/placeholder-product.jpg';
    return images[hoverImageIndex] || images[0] || '/images/placeholder-product.jpg';
  };

  const prefersReducedMotion = () => (
    typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const isTouchDevice = () => (
    typeof window !== 'undefined'
    && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );

  const stopCategoryImageSlideshow = useCallback(() => {
    if (hoverSlideshowTimerRef.current !== null) {
      window.clearInterval(hoverSlideshowTimerRef.current);
      hoverSlideshowTimerRef.current = null;
    }
  }, []);

  const handleCategoryProductMouseEnter = (product: StorefrontProduct) => {
    const images = getProductHoverImages(product);
    setHoveredProductId(product._id);
    setHoverImageIndex(0);

    if (images.length <= 1 || isTouchDevice() || prefersReducedMotion()) return;

    stopCategoryImageSlideshow();
    hoverSlideshowTimerRef.current = window.setInterval(() => {
      if (document.hidden) return;
      setHoverImageIndex((currentIndex) => (currentIndex + 1) % images.length);
    }, 1400);
  };

  const handleCategoryProductMouseLeave = () => {
    stopCategoryImageSlideshow();
    setHoveredProductId(null);
    setHoverImageIndex(0);
  };

  useEffect(() => stopCategoryImageSlideshow, [stopCategoryImageSlideshow]);



  const getCategoryBannerUrl = (url?: string): string => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };
  const getCategoryImage = (category: StoreCategory): string => {
    if (!category?.image) return '';
    if (typeof category.image === 'object' && category.image !== null) {
      const url = category.image.url || category.image.secure_url;
      if (url && url.includes('cloudinary.com/demo')) return '';
      return url || '';
    }
    if (typeof category.image === 'string') {
      if (category.image.includes('cloudinary.com/demo')) return '';
      if (category.image.startsWith('http')) return category.image;
      if (category.image.startsWith('/uploads')) return `${API_URL}${category.image}`;
      if (!category.image.includes('/')) return `${API_URL}/uploads/${category.image}`;
      return category.image;
    }
    return '';
  };

  const fetchCategoryAndProducts = useCallback(async (filterParams: CategoryFilters) => {
    if (!slug) {
      setError('Category slug is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const categoryResponse = await categoryService.getCategoryBySlug(slug);
      
      if (!categoryResponse.success || !categoryResponse.data) {
        throw new Error(categoryResponse.message || `Category "${slug}" not found`);
      }
      
      const categoryData = categoryResponse.data as StoreCategory;
      setCategory(categoryData);

      const categoryBanners = await bannerService
        .getBanners({ type: 'category', category: categoryData._id })
        .catch(() => [] as HeroBanner[]);
      setCategoryBanner(categoryBanners[0] || null);
      
      const productParams = {
        page: 1,
        limit: 50,
        sort: filterParams.sort,
        order: filterParams.order,
        minPrice: filterParams.minPrice ? Number(filterParams.minPrice) : undefined,
        maxPrice: filterParams.maxPrice ? Number(filterParams.maxPrice) : undefined,
        search: filterParams.search || undefined
      };

      const productsResponse = await categoryService.getProductsByCategory(slug, productParams);
      
      if (productsResponse.success && productsResponse.data) {
        let filteredProducts = (productsResponse.data.products || []) as StorefrontProduct[];
        if (filterParams.inStock) filteredProducts = filteredProducts.filter((product) => product.stock > 0);
        if (filterParams.onSale) filteredProducts = filteredProducts.filter((product) => Boolean(product.discountPrice && product.discountPrice < product.price));
        setProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
      
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to load category products'));
      setCategory(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) void fetchCategoryAndProducts(prevFiltersRef.current);
    else { setError('No category specified'); setLoading(false); }
  }, [fetchCategoryAndProducts, slug]);

  useEffect(() => {
    if (isInitialMount.current) { isInitialMount.current = false; return; }
    if (!category) return;
    
    const changed =
      prevFiltersRef.current.sort !== filters.sort ||
      prevFiltersRef.current.order !== filters.order ||
      prevFiltersRef.current.minPrice !== filters.minPrice ||
      prevFiltersRef.current.maxPrice !== filters.maxPrice ||
      prevFiltersRef.current.inStock !== filters.inStock ||
      prevFiltersRef.current.onSale !== filters.onSale ||
      prevFiltersRef.current.search !== filters.search;
    
    if (!changed) return;
    prevFiltersRef.current = { ...filters };
    
    const timer = setTimeout(() => void fetchCategoryAndProducts(filters), 500);
    return () => clearTimeout(timer);
  }, [filters, category, fetchCategoryAndProducts]);

  const handleFilterChange = <Key extends CategoryFilterKey>(key: Key, value: CategoryFilters[Key]) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      if (key !== 'sort' && key !== 'order') {
        if (value && value !== '' && value !== false) {
          if (!activeFilters.includes(key)) setActiveFilters(prevF => [...prevF, key]);
        } else {
          setActiveFilters(prevF => prevF.filter(f => f !== key));
        }
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setActiveFilters([]);
    toast.success('Filters cleared');
  };

  const removeFilter = (filterName: CategoryFilterKey) => {
    switch (filterName) {
      case 'minPrice': case 'maxPrice': setFilters(prev => ({ ...prev, [filterName]: '' })); break;
      case 'inStock': case 'onSale': setFilters(prev => ({ ...prev, [filterName]: false })); break;
      case 'search': setFilters(prev => ({ ...prev, search: '' })); break;
    }
    setActiveFilters(prev => prev.filter(f => f !== filterName));
  };

  const handleAddToCart = async (product: StorefrontProduct) => {
    try {
      if (product.colorVariants?.length) {
        toast('Choose a color on the product page')
        navigate(`/products/${product.slug || product._id}`)
        return
      }
      const cartProduct: Product = {
        ...product,
        categoryId: typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId,
        category: typeof product.category === 'object'
          ? product.category.name
          : product.category || undefined,
      };
      await addToCart(cartProduct, 1);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to add to cart'));
    }
  };

  const formatPrice = (price: number): string =>
    `PKR ${price.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const getDiscountPercent = (price: number, discountPrice?: number): number => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error?.includes('not found') ? 'Category Not Found' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-2">{error || 'Category not found'}</p>
          <p className="text-sm text-gray-500 mb-6">Slug: {slug}</p>
          <div className="space-y-3">
            <button onClick={() => navigate(-1)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go Back</button>
            <button onClick={() => navigate('/categories')} className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Browse All Categories</button>
            <button onClick={() => navigate('/products')} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Browse All Products</button>
          </div>
        </div>
      </div>
    );
  }

  const categoryBannerDesktop = getCategoryBannerUrl(categoryBanner?.url);
  const categoryBannerMobile = getCategoryBannerUrl(categoryBanner?.mobileUrl || categoryBanner?.url);
  const hasCategoryBanner = Boolean(categoryBannerDesktop);

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{category.name} Products in Pakistan â€” Buy Online | BlackCart</title>
        <meta
          name="description"
          content={`Shop ${category.name} products at BlackCart Pakistan. ${category.description ? category.description.slice(0, 100) + '.' : 'Browse our selection of ' + category.name + ' accessories with fast nationwide delivery.'} Best prices guaranteed.`}
        />
        <meta property="og:title" content={`${category.name} | BlackCart Pakistan`} />
        <meta property="og:description" content={`Buy ${category.name} online in Pakistan at the best prices. Fast delivery. BlackCart.`} />
        <meta property="og:url" content={`https://blackcart.store/categories/${slug}`} />
        <link rel="canonical" href={`https://blackcart.store/categories/${slug}`} />
      </Helmet>
      {/* âœ… FIXED: Header â€” reduced py-8 md:py-12 â†’ py-1 md:py-2 so filters + products are visible */}
      <div className={`relative overflow-hidden border-b ${hasCategoryBanner ? 'border-transparent bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-950'}`}>
        {hasCategoryBanner && (
          <>
            <picture>
              <source media="(max-width: 640px)" srcSet={categoryBannerMobile || categoryBannerDesktop} />
              <img
                src={categoryBannerDesktop}
                alt={categoryBanner?.altText || category.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </picture>
            <div className="absolute inset-0 bg-slate-950/55" />
          </>
        )}
        <div className="container relative mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              {/* Breadcrumb */}
              <nav className="flex items-center text-xs text-slate-500 mb-1.5">
                <button onClick={() => navigate('/')} className={hasCategoryBanner ? 'hover:text-white/90' : 'hover:text-blue-600'}>Home</button>
                <ChevronLeft className="h-3 w-3 mx-1 rotate-180" />
                <button onClick={() => navigate('/categories')} className={hasCategoryBanner ? 'hover:text-white/90' : 'hover:text-blue-600'}>Categories</button>
                <ChevronLeft className="h-3 w-3 mx-1 rotate-180" />
                <span className={hasCategoryBanner ? 'font-semibold text-white' : 'font-semibold text-slate-900'}>{category.name}</span>
              </nav>
              
              <h1 className={hasCategoryBanner ? 'mb-1 text-2xl font-bold text-white md:text-3xl' : 'mb-1 text-2xl font-bold text-slate-950 md:text-3xl'}>{categoryBanner?.headline || categoryBanner?.title || category.name}</h1>
              
              {(categoryBanner?.subheading || category.description) && (
                <p className={hasCategoryBanner ? 'mb-2 line-clamp-2 text-xs text-white/85 md:text-sm' : 'mb-2 line-clamp-2 text-xs text-slate-600 md:text-sm'}>
                  {categoryBanner?.subheading || category.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-blue-50 px-2.5 py-1 rounded-full">
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs font-medium">
                    {totalProducts} Product{totalProducts !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  category.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            {/* âœ… Smaller category image: h-40 w-40 â†’ h-20 w-20 */}
            {!hasCategoryBanner && getCategoryImage(category) && (
              <div className="hidden md:block flex-shrink-0">
                <img
                  src={getCategoryImage(category)}
                  alt={category.name}
                  className="h-28 w-56 rounded-2xl object-contain bg-slate-50 shadow-sm"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {/* âœ… FIXED: Reduced py-6 md:py-8 â†’ py-3 md:py-4 */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden mr-2 p-2 border border-gray-300 rounded-lg"
                >
                  <SlidersHorizontal className="h-4 w-4 text-gray-600" />
                </button>
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {activeFilters.length > 0 && (
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Active:</span>
                  {activeFilters.map(filter => (
                    <span key={filter} className="flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {filter === 'inStock' && 'Available'}
                      {filter === 'onSale' && 'On Sale'}
                      {filter === 'minPrice' && `Min: PKR ${filters.minPrice}`}
                      {filter === 'maxPrice' && `Max: PKR ${filters.maxPrice}`}
                      {filter === 'search' && `"${filters.search}"`}
                      <button onClick={() => removeFilter(filter)} className="ml-1 text-blue-500 hover:text-blue-700">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button onClick={clearFilters} className="text-xs text-red-600 hover:text-red-800">Clear All</button>
                </div>
              )}
              
              <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}>
                  <Grid className="h-4 w-4" />
                </button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}>
                  <List className="h-4 w-4" />
                </button>
              </div>
              
              <div className="relative">
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleFilterChange('sort', sort);
                    handleFilterChange('order', order);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 md:hidden">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range (PKR)</label>
                  <div className="flex space-x-2">
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="mobileInStock" checked={filters.inStock} onChange={(e) => handleFilterChange('inStock', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  <label htmlFor="mobileInStock" className="ml-2 text-sm text-gray-700">Available Products Only</label>
                </div>
                <div className="flex items-center">
                  <input type="checkbox" id="mobileOnSale" checked={filters.onSale} onChange={(e) => handleFilterChange('onSale', e.target.checked)} className="h-4 w-4 text-red-600 border-gray-300 rounded" />
                  <label htmlFor="mobileOnSale" className="ml-2 text-sm text-gray-700">On Sale Only</label>
                </div>
              </div>
              <div className="mt-3 flex justify-between">
                <button onClick={clearFilters} className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Reset</button>
                <button onClick={() => setShowMobileFilters(false)} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply</button>
              </div>
            </div>
          )}
          
          {/* Desktop Filter Options */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 mt-3 pt-3 border-t border-gray-200">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price Range (PKR)</label>
              <div className="flex space-x-2">
                <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
                <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs" />
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="desktopInStock" checked={filters.inStock} onChange={(e) => handleFilterChange('inStock', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
              <label htmlFor="desktopInStock" className="ml-2 text-sm text-gray-700">Available Products Only</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="desktopOnSale" checked={filters.onSale} onChange={(e) => handleFilterChange('onSale', e.target.checked)} className="h-4 w-4 text-red-600 border-gray-300 rounded" />
              <label htmlFor="desktopOnSale" className="ml-2 text-sm text-gray-700">On Sale Only</label>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs text-gray-600">Showing {products.length} of {totalProducts} products</span>
            </div>
          </div>
        </div>
        
        {/* Products Section */}
        {products.length > 0 ? (
          <>
            <div className="md:hidden flex justify-center mb-3">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}><Grid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}><List className="h-4 w-4" /></button>
              </div>
            </div>
            
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
              : 'space-y-3'
            }>
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      onMouseEnter={() => handleCategoryProductMouseEnter(product)}
                      onMouseLeave={handleCategoryProductMouseLeave}>
                      <div onClick={() => navigate(`/products/${product.slug || product._id}`)} className="cursor-pointer">
                        {/* âœ… Reduced image height h-48 â†’ h-36 */}
                        <div className="relative h-36 overflow-hidden bg-white sm:h-40">
                          <img
                            src={getCategoryCardImage(product)}
                            alt={product.name}
                            className="h-full w-full object-contain p-2 transition-all duration-500 hover:scale-105"
                            onError={(e) => { e.currentTarget.src = '/images/placeholder-product.jpg'; }}
                          />
                          {product.discountPrice && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                              {getDiscountPercent(product.price, product.discountPrice)}% OFF
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 text-sm">{product.name}</h3>
                          <p className="hidden">{product.shortDescription || product.description}</p>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-bold text-gray-900">
                                  {formatPrice(product.discountPrice || product.price)}
                                </span>
                                {product.discountPrice && (
                                  <span className="ml-1 text-xs text-gray-500 line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-0.5">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="ml-1 text-xs text-gray-600">
                                  {product.rating?.toFixed(1)}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                              className="mt-2 w-full justify-center rounded-lg bg-blue-600 px-2 py-2 text-xs font-medium text-white hover:bg-blue-700 flex items-center"
                            >
                              <ShoppingCart className="h-3 w-3 mr-1" /> Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-shadow"
                      onMouseEnter={() => handleCategoryProductMouseEnter(product)}
                      onMouseLeave={handleCategoryProductMouseLeave}>
                      <div className="flex flex-col sm:flex-row">
                        <div
                          className="sm:flex-shrink-0 sm:w-36 h-36 sm:h-auto mb-3 sm:mb-0 sm:mr-4 cursor-pointer"
                          onClick={() => navigate(`/products/${product.slug || product._id}`)}
                        >
                          <img
                            src={getCategoryCardImage(product)}
                            alt={product.name}
                            className="h-full w-full object-contain rounded-lg transition-all duration-500"
                            onError={(e) => { e.currentTarget.src = '/images/placeholder-product.jpg'; }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900 mb-1 cursor-pointer" onClick={() => navigate(`/products/${product.slug || product._id}`)}>
                            {product.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.shortDescription || product.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                              <div className="flex items-center mb-1">
                                <span className="text-lg font-bold text-gray-900">{formatPrice(product.discountPrice || product.price)}</span>
                                {product.discountPrice && (
                                  <>
                                    <span className="ml-2 text-sm text-gray-500 line-through">{formatPrice(product.price)}</span>
                                    <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">{getDiscountPercent(product.price, product.discountPrice)}% OFF</span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-3">
                                {product.stock <= 0 && (
                                  <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                    Out of Stock
                                  </span>
                                )}
                                <div className="flex items-center">
                                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                                  <span className="ml-1 text-xs text-gray-600">{product.rating?.toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-3 sm:mt-0 flex space-x-2">
                              <button onClick={() => navigate(`/products/${product.slug || product._id}`)} className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs font-medium">
                                View Details
                              </button>
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock <= 0}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center ${product.stock > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                              >
                                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-200">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto text-sm">
              {activeFilters.length > 0
                ? 'No products match your current filters.'
                : `No products found in "${category?.name || 'this category'}".`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {activeFilters.length > 0 && (
                <button onClick={clearFilters} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">Clear All Filters</button>
              )}
              <button onClick={() => navigate('/categories')} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Browse All Categories</button>
              <button onClick={() => navigate('/products')} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">Browse All Products</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;





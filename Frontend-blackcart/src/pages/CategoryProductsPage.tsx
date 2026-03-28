

// // src/pages/CategoryProductsPage.tsx 
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { 
//   ChevronLeft, Filter, Grid, List, Star, 
//   Package, XCircle, ArrowLeft, Search, 
//   SlidersHorizontal, X, ShoppingCart, Home,
//   Tag, Check
// } from 'lucide-react';
// import { categoryService } from '../services/categoryService';
// import { productService } from '../services/productService';
// import { useCart } from '../context/CartContext';
// import Loader from '../components/common/Loader';
// import toast from 'react-hot-toast';

// // Get API URL from environment or use production default
// const API_URL = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com';

// const CategoryProductsPage: React.FC = () => {
//   console.log('🔵 CategoryProductsPage Component MOUNTED');
  
//   const { slug } = useParams<{ slug: string }>();
//   const navigate = useNavigate();
//   const { addToCart } = useCart();
  
//   const [category, setCategory] = useState<any>(null);
//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Filters
//   const [filters, setFilters] = useState({
//     sort: 'createdAt',
//     order: 'desc',
//     minPrice: '',
//     maxPrice: '',
//     inStock: false,
//     onSale: false,
//     search: ''
//   });
  
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [activeFilters, setActiveFilters] = useState<string[]>([]);
//   const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
//   const [totalProducts, setTotalProducts] = useState<number>(0);
  
//   // Use ref to track previous filters and prevent unnecessary re-fetches
//   const prevFiltersRef = useRef(filters);
//   const isInitialMount = useRef(true);

//   // ✅ FIXED: Get product image with proper API_URL
//   const getProductImage = (product: any): string => {
//     try {
//       // First try to get from productService if available
//       if (productService.getFirstImageUrl) {
//         return productService.getFirstImageUrl(product);
//       }
      
//       // Get the image path
//       let imagePath = product?.images?.[0] || product?.image;
      
//       if (!imagePath) {
//         return '/images/placeholder-product.jpg';
//       }
      
//       // If it's already a full URL, return as is
//       if (imagePath.startsWith('http')) {
//         return imagePath;
//       }
      
//       // If it starts with /uploads, prepend API_URL
//       if (imagePath.startsWith('/uploads')) {
//         return `${API_URL}${imagePath}`;
//       }
      
//       // If it's just a filename, prepend /uploads and API_URL
//       return `${API_URL}/uploads/${imagePath}`;
      
//     } catch (error) {
//       console.error('Error getting product image:', error);
//       return '/images/placeholder-product.jpg';
//     }
//   };

//   // ✅ FIXED: Get category image with proper API_URL
//   const getCategoryImage = (category: any): string => {
//     if (!category?.image) return '';
    
//     if (category.image.startsWith('http')) {
//       return category.image;
//     }
    
//     if (category.image.startsWith('/uploads')) {
//       return `${API_URL}${category.image}`;
//     }
    
//     return `${API_URL}/uploads/${category.image}`;
//   };

//   const fetchCategoryAndProducts = async (filterParams = filters) => {
//     if (!slug) {
//       console.error('❌ No slug provided');
//       setError('Category slug is missing');
//       setLoading(false);
//       return;
//     }

//     try {
//       console.log(`🔄 Fetching category and products with filters:`, filterParams);
//       setLoading(true);
//       setError(null);
      
//       // STEP 1: Fetch category details
//       console.log(`📡 API Call: GET /categories/${slug}`);
//       const categoryResponse = await categoryService.getCategoryBySlug(slug);
      
//       console.log('📊 Category API Response:', {
//         success: categoryResponse.success,
//         hasData: !!categoryResponse.data,
//         message: categoryResponse.message
//       });
      
//       if (!categoryResponse.success || !categoryResponse.data) {
//         const errorMsg = categoryResponse.message || `Category "${slug}" not found`;
//         console.error('❌ Category fetch failed:', errorMsg);
//         throw new Error(errorMsg);
//       }
      
//       const categoryData = categoryResponse.data;
//       setCategory(categoryData);
//       console.log(`✅ Category loaded: ${categoryData.name}, ID: ${categoryData._id}, Slug: ${slug}`);
      
//       // STEP 2: Use the dedicated endpoint for category products
//       const productParams = {
//         page: 1,
//         limit: 50,
//         sort: filterParams.sort,
//         order: filterParams.order,
//         minPrice: filterParams.minPrice ? Number(filterParams.minPrice) : undefined,
//         maxPrice: filterParams.maxPrice ? Number(filterParams.maxPrice) : undefined,
//         brand: undefined,
//         rating: undefined,
//         search: filterParams.search || undefined
//       };

//       console.log(`📡 API Call: GET /categories/${slug}/products with params:`, productParams);
//       const productsResponse = await categoryService.getProductsByCategory(slug, productParams);
      
//       console.log('📊 Products by category response:', {
//         success: productsResponse.success,
//         hasCategory: !!productsResponse.data?.category,
//         productCount: productsResponse.data?.products?.length || 0,
//         total: productsResponse.data?.pagination?.total || 0,
//         message: productsResponse.message
//       });
      
//       if (productsResponse.success && productsResponse.data) {
//         let filteredProducts = productsResponse.data.products || [];
//         const originalCount = filteredProducts.length;
        
//         // Apply client-side filters
//         if (filterParams.inStock) {
//           filteredProducts = filteredProducts.filter(p => p.stock > 0);
//         }
        
//         if (filterParams.onSale) {
//           filteredProducts = filteredProducts.filter(p => 
//             p.discountPrice && p.discountPrice < p.price
//           );
//         }
        
//         setProducts(filteredProducts);
//         setTotalProducts(filteredProducts.length);
        
//         console.log(`📦 Products: ${originalCount} → ${filteredProducts.length} after client filters`);
        
//         if (filteredProducts.length === 0 && originalCount > 0) {
//           toast('No products match your filters', {
//             duration: 3000,
//             icon: 'ℹ️',
//             style: {
//               background: '#3b82f6',
//               color: 'white',
//             }
//           });
//         }
        
//         if (filteredProducts.length === 0) {
//           toast(`No products found in category "${categoryData.name}"`, {
//             duration: 4000,
//             icon: '📦',
//             style: {
//               background: '#3b82f6',
//               color: 'white',
//             }
//           });
//         }
//       } else {
//         console.warn('⚠️ Products fetch returned no data:', productsResponse.message);
//         setProducts([]);
//         setTotalProducts(0);
        
//         if (productsResponse.message && !productsResponse.message.includes('No products')) {
//           toast.error(productsResponse.message);
//         }
//       }
      
//     } catch (err: any) {
//       console.error('🚨 Error in fetchCategoryAndProducts:', err);
//       const errorMessage = err.message || 'Failed to load category products';
//       setError(errorMessage);
      
//       if (!err.message?.includes('not found')) {
//         toast.error(errorMessage);
//       }
      
//       setCategory(null);
//       setProducts([]);
//     } finally {
//       console.log('🏁 Fetch operation completed');
//       setLoading(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     console.log('🎬 Initial useEffect triggered, slug:', slug);
//     if (slug) {
//       fetchCategoryAndProducts();
//     } else {
//       setError('No category specified');
//       setLoading(false);
//     }
    
//     return () => {
//       console.log('🧹 Cleaning up CategoryProductsPage');
//     };
//   }, [slug]);

//   // Handle filter changes
//   useEffect(() => {
//     if (isInitialMount.current) {
//       isInitialMount.current = false;
//       return;
//     }
    
//     if (!category) return;
    
//     const hasFiltersChanged = 
//       prevFiltersRef.current.sort !== filters.sort ||
//       prevFiltersRef.current.order !== filters.order ||
//       prevFiltersRef.current.minPrice !== filters.minPrice ||
//       prevFiltersRef.current.maxPrice !== filters.maxPrice ||
//       prevFiltersRef.current.inStock !== filters.inStock ||
//       prevFiltersRef.current.onSale !== filters.onSale ||
//       prevFiltersRef.current.search !== filters.search;
    
//     if (!hasFiltersChanged) return;
    
//     console.log('🔄 Filters changed, debouncing...');
    
//     prevFiltersRef.current = { ...filters };
    
//     const timer = setTimeout(() => {
//       console.log('🔍 Applying filters:', filters);
//       fetchCategoryAndProducts(filters);
//     }, 500);
    
//     return () => clearTimeout(timer);
//   }, [filters, category]);

//   const handleFilterChange = (key: string, value: any) => {
//     console.log(`🛠️ Filter change: ${key} = ${value}`);
//     setFilters(prev => {
//       const newFilters = { ...prev, [key]: value };
      
//       if (key !== 'sort' && key !== 'order') {
//         if (value && value !== '' && value !== false) {
//           if (!activeFilters.includes(key)) {
//             setActiveFilters(prevFilters => [...prevFilters, key]);
//           }
//         } else {
//           setActiveFilters(prevFilters => prevFilters.filter(f => f !== key));
//         }
//       }
      
//       return newFilters;
//     });
//   };

//   const clearFilters = () => {
//     console.log('🧹 Clearing all filters');
//     setFilters({
//       sort: 'createdAt',
//       order: 'desc',
//       minPrice: '',
//       maxPrice: '',
//       inStock: false,
//       onSale: false,
//       search: ''
//     });
//     setActiveFilters([]);
//     toast.success('Filters cleared');
//   };

//   const removeFilter = (filterName: string) => {
//     console.log(`🗑️ Removing filter: ${filterName}`);
//     switch (filterName) {
//       case 'minPrice':
//       case 'maxPrice':
//         setFilters(prev => ({ ...prev, [filterName]: '' }));
//         break;
//       case 'inStock':
//       case 'onSale':
//         setFilters(prev => ({ ...prev, [filterName]: false }));
//         break;
//       case 'search':
//         setFilters(prev => ({ ...prev, search: '' }));
//         break;
//     }
//     setActiveFilters(prev => prev.filter(f => f !== filterName));
//   };

//   const handleAddToCart = async (product: any) => {
//     try {
//       await addToCart(product, 1);
//       toast.success(`Added ${product.name} to cart`);
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to add to cart');
//     }
//   };

//   // Format price
//   const formatPrice = (price: number): string => {
//     return `PKR ${price.toLocaleString('en-PK', {
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 2
//     })}`;
//   };

//   // Calculate discount percentage
//   const getDiscountPercent = (price: number, discountPrice?: number): number => {
//     if (!discountPrice || discountPrice >= price) return 0;
//     return Math.round(((price - discountPrice) / price) * 100);
//   };

//   // DEBUG: Log current state
//   console.log('📊 Component State:', {
//     loading,
//     error: error?.substring(0, 50),
//     hasCategory: !!category,
//     productsCount: products.length,
//     slug,
//     activeFiltersCount: activeFilters.length
//   });

//   // Loading state
//   if (loading) {
//     console.log('⏳ Rendering loading state');
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader size="lg" />
//           <p className="mt-4 text-gray-600">Loading category...</p>
//           <p className="text-sm text-gray-500">Slug: {slug}</p>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error || !category) {
//     console.log('❌ Rendering error state:', error);
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="text-center max-w-md">
//           <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">
//             {error?.includes('not found') ? 'Category Not Found' : 'Error'}
//           </h1>
//           <p className="text-gray-600 mb-2">{error || 'Category not found'}</p>
//           <p className="text-sm text-gray-500 mb-6">Slug: {slug}</p>
//           <div className="space-y-3">
//             <button
//               onClick={() => navigate(-1)}
//               className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Go Back
//             </button>
//             <button
//               onClick={() => navigate('/categories')}
//               className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//             >
//               Browse All Categories
//             </button>
//             <button
//               onClick={() => navigate('/products')}
//               className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
//             >
//               Browse All Products
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Success state
//   console.log(`✅ Rendering category: ${category.name} with ${products.length} products`);
  
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
//         <div className="container mx-auto px-4 py-8 md:py-12">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//             <div className="flex-1">
//               <nav className="flex items-center text-sm text-blue-200 mb-3">
//                 <button onClick={() => navigate('/')} className="hover:text-white">
//                   Home
//                 </button>
//                 <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
//                 <button onClick={() => navigate('/categories')} className="hover:text-white">
//                   Categories
//                 </button>
//                 <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
//                 <span className="text-white font-semibold">{category.name}</span>
//               </nav>
              
//               <h1 className="text-3xl md:text-4xl font-bold mb-3">
//                 {category.name}
//               </h1>
              
//               {category.description && (
//                 <p className="text-blue-100 text-lg mb-4">
//                   {category.description}
//                 </p>
//               )}
              
//               <div className="flex flex-wrap items-center gap-4 mt-4">
//                 <div className="flex items-center bg-blue-500/20 px-3 py-1.5 rounded-full">
//                   <Package className="h-4 w-4 mr-2" />
//                   <span className="text-sm font-medium">
//                     {totalProducts} Product{totalProducts !== 1 ? 's' : ''}
//                   </span>
//                 </div>
                
//                 <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
//                   category.isActive 
//                     ? 'bg-green-500/20 text-green-200' 
//                     : 'bg-red-500/20 text-red-200'
//                 }`}>
//                   {category.isActive ? 'Active' : 'Inactive'}
//                 </div>
//               </div>
//             </div>
            
//             {category.image && (
//               <div className="hidden md:block">
//                 <img
//                   src={getCategoryImage(category)}
//                   alt={category.name}
//                   className="h-40 w-40 rounded-xl object-cover shadow-lg"
//                   onError={(e) => {
//                     e.currentTarget.src = '/images/placeholder-category.jpg';
//                   }}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-4 py-6 md:py-8">
//         {/* Filters Bar */}
//         <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div className="flex-1">
//               <div className="flex items-center">
//                 {/* Mobile Filter Toggle */}
//                 <button
//                   onClick={() => setShowMobileFilters(!showMobileFilters)}
//                   className="md:hidden mr-3 p-2 border border-gray-300 rounded-lg"
//                 >
//                   <SlidersHorizontal className="h-5 w-5 text-gray-600" />
//                 </button>
                
//                 {/* Search Input */}
//                 <div className="relative flex-1 max-w-md">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <input
//                     type="text"
//                     placeholder="Search in this category..."
//                     value={filters.search}
//                     onChange={(e) => handleFilterChange('search', e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
//                   />
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex items-center space-x-4">
//               {/* Active Filters */}
//               {activeFilters.length > 0 && (
//                 <div className="hidden md:flex items-center space-x-2">
//                   <span className="text-sm text-gray-500">Active:</span>
//                   {activeFilters.map(filter => (
//                     <span
//                       key={filter}
//                       className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
//                     >
//                       {filter === 'inStock' && 'In Stock'}
//                       {filter === 'onSale' && 'On Sale'}
//                       {filter === 'minPrice' && `Min: PKR ${filters.minPrice}`}
//                       {filter === 'maxPrice' && `Max: PKR ${filters.maxPrice}`}
//                       {filter === 'search' && `Search: "${filters.search}"`}
//                       <button
//                         onClick={() => removeFilter(filter)}
//                         className="ml-1 text-blue-500 hover:text-blue-700"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </span>
//                   ))}
//                   <button
//                     onClick={clearFilters}
//                     className="text-sm text-red-600 hover:text-red-800"
//                   >
//                     Clear All
//                   </button>
//                 </div>
//               )}
              
//               {/* View Toggle */}
//               <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
//                 <button
//                   onClick={() => setViewMode('grid')}
//                   className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
//                 >
//                   <Grid className="h-5 w-5" />
//                 </button>
//                 <button
//                   onClick={() => setViewMode('list')}
//                   className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
//                 >
//                   <List className="h-5 w-5" />
//                 </button>
//               </div>
              
//               {/* Sort Dropdown */}
//               <div className="relative">
//                 <select
//                   value={`${filters.sort}-${filters.order}`}
//                   onChange={(e) => {
//                     const [sort, order] = e.target.value.split('-');
//                     handleFilterChange('sort', sort);
//                     handleFilterChange('order', order);
//                   }}
//                   className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
//                 >
//                   <option value="createdAt-desc">Newest First</option>
//                   <option value="createdAt-asc">Oldest First</option>
//                   <option value="price-asc">Price: Low to High</option>
//                   <option value="price-desc">Price: High to Low</option>
//                   <option value="rating-desc">Highest Rated</option>
//                   <option value="name-asc">Name: A to Z</option>
//                   <option value="name-desc">Name: Z to A</option>
//                 </select>
//                 <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
//               </div>
//             </div>
//           </div>
          
//           {/* Mobile Filters Panel */}
//           {showMobileFilters && (
//             <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
//               <div className="grid grid-cols-2 gap-4">
//                 {/* Price Range */}
//                 <div className="col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Price Range (PKR)
//                   </label>
//                   <div className="flex space-x-2">
//                     <input
//                       type="number"
//                       placeholder="Min"
//                       value={filters.minPrice}
//                       onChange={(e) => handleFilterChange('minPrice', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Max"
//                       value={filters.maxPrice}
//                       onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                     />
//                   </div>
//                 </div>
                
//                 {/* Stock Filter */}
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="mobileInStock"
//                     checked={filters.inStock}
//                     onChange={(e) => handleFilterChange('inStock', e.target.checked)}
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="mobileInStock" className="ml-2 text-sm text-gray-700">
//                     In Stock Only
//                   </label>
//                 </div>
                
//                 {/* Sale Filter */}
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="mobileOnSale"
//                     checked={filters.onSale}
//                     onChange={(e) => handleFilterChange('onSale', e.target.checked)}
//                     className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
//                   />
//                   <label htmlFor="mobileOnSale" className="ml-2 text-sm text-gray-700">
//                     On Sale Only
//                   </label>
//                 </div>
//               </div>
              
//               <div className="mt-4 flex justify-between">
//                 <button
//                   onClick={clearFilters}
//                   className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                 >
//                   Reset Filters
//                 </button>
//                 <button
//                   onClick={() => setShowMobileFilters(false)}
//                   className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   Apply Filters
//                 </button>
//               </div>
//             </div>
//           )}
          
//           {/* Desktop Filter Options */}
//           <div className="hidden md:grid md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
//             {/* Price Range */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Price Range (PKR)
//               </label>
//               <div className="flex space-x-2">
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={filters.minPrice}
//                   onChange={(e) => handleFilterChange('minPrice', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                 />
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={filters.maxPrice}
//                   onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
//                 />
//               </div>
//             </div>
            
//             {/* Stock Filter */}
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="desktopInStock"
//                 checked={filters.inStock}
//                 onChange={(e) => handleFilterChange('inStock', e.target.checked)}
//                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//               />
//               <label htmlFor="desktopInStock" className="ml-2 text-sm text-gray-700">
//                 In Stock Only
//               </label>
//             </div>
            
//             {/* Sale Filter */}
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="desktopOnSale"
//                 checked={filters.onSale}
//                 onChange={(e) => handleFilterChange('onSale', e.target.checked)}
//                 className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
//               />
//               <label htmlFor="desktopOnSale" className="ml-2 text-sm text-gray-700">
//                 On Sale Only
//               </label>
//             </div>
            
//             {/* Results Count */}
//             <div className="flex items-center justify-end">
//               <span className="text-sm text-gray-600">
//                 Showing {products.length} of {totalProducts} products
//               </span>
//             </div>
//           </div>
//         </div>
        
//         {/* Products Section */}
//         {products.length > 0 ? (
//           <>
//             {/* View Mode Toggle for Mobile */}
//             <div className="md:hidden flex justify-center mb-4">
//               <div className="flex border border-gray-300 rounded-lg overflow-hidden">
//                 <button
//                   onClick={() => setViewMode('grid')}
//                   className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
//                 >
//                   <Grid className="h-5 w-5" />
//                 </button>
//                 <button
//                   onClick={() => setViewMode('list')}
//                   className={`px-4 py-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
//                 >
//                   <List className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
            
//             {/* Products Grid/List */}
//             <div className={viewMode === 'grid' 
//               ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
//               : 'space-y-4'
//             }>
//               {products.map((product, index) => (
//                 <motion.div
//                   key={product._id}
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.3, delay: index * 0.05 }}
//                 >
//                   {viewMode === 'grid' ? (
//                     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
//                       <div onClick={() => navigate(`/products/${product.slug || product._id}`)} className="cursor-pointer">
//                         <div className="relative h-48 overflow-hidden">
//                           <img
//                             src={getProductImage(product)}
//                             alt={product.name}
//                             className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
//                             onError={(e) => {
//                               e.currentTarget.src = '/images/placeholder-product.jpg';
//                             }}
//                           />
//                           {product.discountPrice && (
//                             <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
//                               Save {getDiscountPercent(product.price, product.discountPrice)}%
//                             </div>
//                           )}
//                         </div>
//                         <div className="p-4">
//                           <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
//                             {product.name}
//                           </h3>
//                           <p className="text-sm text-gray-600 mb-3 line-clamp-2">
//                             {product.shortDescription || product.description}
//                           </p>
//                           <div className="flex items-center justify-between">
//                             <div>
//                               <div className="flex items-center">
//                                 <span className="text-lg font-bold text-gray-900">
//                                   {formatPrice(product.discountPrice || product.price)}
//                                 </span>
//                                 {product.discountPrice && (
//                                   <span className="ml-2 text-sm text-gray-500 line-through">
//                                     {formatPrice(product.price)}
//                                   </span>
//                                 )}
//                               </div>
//                               <div className="flex items-center mt-1">
//                                 <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                                 <span className="ml-1 text-sm text-gray-600">
//                                   {product.rating?.toFixed(1) || 'No ratings'}
//                                 </span>
//                               </div>
//                             </div>
//                             <button
//                               onClick={(e) => {
//                                 e.preventDefault();
//                                 e.stopPropagation();
//                                 handleAddToCart(product);
//                               }}
//                               className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
//                             >
//                               <ShoppingCart className="h-4 w-4 mr-1" />
//                               Add
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
//                       <div className="flex flex-col sm:flex-row">
//                         <div className="sm:flex-shrink-0 sm:w-48 h-48 sm:h-auto mb-4 sm:mb-0 sm:mr-4 cursor-pointer" 
//                              onClick={() => navigate(`/products/${product.slug || product._id}`)}>
//                           <img
//                             src={getProductImage(product)}
//                             alt={product.name}
//                             className="w-full h-full object-cover rounded-lg"
//                             onError={(e) => {
//                               e.currentTarget.src = '/images/placeholder-product.jpg';
//                             }}
//                           />
//                         </div>
//                         <div className="flex-1">
//                           <h3 className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer"
//                               onClick={() => navigate(`/products/${product.slug || product._id}`)}>
//                             {product.name}
//                           </h3>
//                           <p className="text-gray-600 mb-4 line-clamp-3">
//                             {product.shortDescription || product.description}
//                           </p>
//                           <div className="flex flex-col sm:flex-row sm:items-center justify-between">
//                             <div>
//                               <div className="flex items-center mb-2">
//                                 <span className="text-xl font-bold text-gray-900">
//                                   {formatPrice(product.discountPrice || product.price)}
//                                 </span>
//                                 {product.discountPrice && (
//                                   <>
//                                     <span className="ml-2 text-sm text-gray-500 line-through">
//                                       {formatPrice(product.price)}
//                                     </span>
//                                     <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
//                                       {getDiscountPercent(product.price, product.discountPrice)}% OFF
//                                     </span>
//                                   </>
//                                 )}
//                               </div>
//                               <div className="flex items-center space-x-4">
//                                 <span className={`px-2 py-1 rounded text-xs font-medium ${
//                                   product.stock > 0 
//                                     ? 'bg-green-100 text-green-800' 
//                                     : 'bg-red-100 text-red-800'
//                                 }`}>
//                                   {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
//                                 </span>
//                                 <div className="flex items-center">
//                                   <Star className="h-4 w-4 text-yellow-400 fill-current" />
//                                   <span className="ml-1 text-sm text-gray-600">
//                                     {product.rating?.toFixed(1) || 'No ratings'}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                             <div className="mt-4 sm:mt-0 flex space-x-2">
//                               <button
//                                 onClick={() => navigate(`/products/${product.slug || product._id}`)}
//                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
//                               >
//                                 View Details
//                               </button>
//                               <button
//                                 onClick={() => handleAddToCart(product)}
//                                 disabled={product.stock <= 0}
//                                 className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
//                                   product.stock > 0
//                                     ? 'bg-blue-600 text-white hover:bg-blue-700'
//                                     : 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                                 }`}
//                               >
//                                 <ShoppingCart className="h-4 w-4 mr-1" />
//                                 {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </motion.div>
//               ))}
//             </div>
//           </>
//         ) : (
//           <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
//             <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               No Products Found
//             </h3>
//             <p className="text-gray-600 mb-6 max-w-md mx-auto">
//               {activeFilters.length > 0
//                 ? 'No products match your current filters. Try adjusting your search criteria.'
//                 : `No products found in category "${category?.name || 'this category'}".`
//               }
//             </p>
//             <div className="flex flex-col sm:flex-row gap-3 justify-center">
//               {activeFilters.length > 0 && (
//                 <button
//                   onClick={clearFilters}
//                   className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                 >
//                   Clear All Filters
//                 </button>
//               )}
//               <button
//                 onClick={() => navigate('/categories')}
//                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Browse All Categories
//               </button>
//               <button
//                 onClick={() => navigate('/products')}
//                 className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
//               >
//                 Browse All Products
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CategoryProductsPage;


// src/pages/CategoryProductsPage.tsx 
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Filter, Grid, List, Star, 
  Package, XCircle, ArrowLeft, Search, 
  SlidersHorizontal, X, ShoppingCart, Home,
  Tag, Check
} from 'lucide-react';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';

// Get API URL from environment or use production default
const API_URL = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com';

const CategoryProductsPage: React.FC = () => {
  console.log('🔵 CategoryProductsPage Component MOUNTED');
  
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filters, setFilters] = useState({
    sort: 'createdAt',
    order: 'desc',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    onSale: false,
    search: ''
  });
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  
  // Use ref to track previous filters and prevent unnecessary re-fetches
  const prevFiltersRef = useRef(filters);
  const isInitialMount = useRef(true);

  // ✅ FIXED: Handles Cloudinary object format AND plain string URLs for products
  const getProductImage = (product: any): string => {
    try {
      if (productService.getFirstImageUrl) {
        return productService.getFirstImageUrl(product);
      }

      const imageData = product?.images?.[0] || product?.image;

      if (!imageData) return '/images/placeholder-product.jpg';

      // Handle Cloudinary object format { url: '...', public_id: '...' }
      if (typeof imageData === 'object' && imageData !== null) {
        return imageData.url || imageData.secure_url || '/images/placeholder-product.jpg';
      }

      // Handle string format
      if (imageData.startsWith('http')) return imageData;
      if (imageData.startsWith('/uploads')) return `${API_URL}${imageData}`;

      return `${API_URL}/uploads/${imageData}`;

    } catch (error) {
      console.error('Error getting product image:', error);
      return '/images/placeholder-product.jpg';
    }
  };

  // ✅ FIXED: Handles Cloudinary object format AND plain string URLs for categories
  const getCategoryImage = (category: any): string => {
    if (!category?.image) return '';

    // Handle Cloudinary object format { url: '...', public_id: '...' }
    if (typeof category.image === 'object' && category.image !== null) {
      return category.image.url || category.image.secure_url || '';
    }

    // Handle string format
    if (category.image.startsWith('http')) return category.image;
    if (category.image.startsWith('/uploads')) return `${API_URL}${category.image}`;
    if (!category.image.includes('/')) return `${API_URL}/uploads/${category.image}`;

    return category.image;
  };

  const fetchCategoryAndProducts = async (filterParams = filters) => {
    if (!slug) {
      console.error('❌ No slug provided');
      setError('Category slug is missing');
      setLoading(false);
      return;
    }

    try {
      console.log(`🔄 Fetching category and products with filters:`, filterParams);
      setLoading(true);
      setError(null);
      
      // STEP 1: Fetch category details
      console.log(`📡 API Call: GET /categories/${slug}`);
      const categoryResponse = await categoryService.getCategoryBySlug(slug);
      
      console.log('📊 Category API Response:', {
        success: categoryResponse.success,
        hasData: !!categoryResponse.data,
        message: categoryResponse.message
      });
      
      if (!categoryResponse.success || !categoryResponse.data) {
        const errorMsg = categoryResponse.message || `Category "${slug}" not found`;
        console.error('❌ Category fetch failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      const categoryData = categoryResponse.data;
      setCategory(categoryData);
      console.log(`✅ Category loaded: ${categoryData.name}, ID: ${categoryData._id}, Slug: ${slug}`);
      
      // STEP 2: Use the dedicated endpoint for category products
      const productParams = {
        page: 1,
        limit: 50,
        sort: filterParams.sort,
        order: filterParams.order,
        minPrice: filterParams.minPrice ? Number(filterParams.minPrice) : undefined,
        maxPrice: filterParams.maxPrice ? Number(filterParams.maxPrice) : undefined,
        brand: undefined,
        rating: undefined,
        search: filterParams.search || undefined
      };

      console.log(`📡 API Call: GET /categories/${slug}/products with params:`, productParams);
      const productsResponse = await categoryService.getProductsByCategory(slug, productParams);
      
      console.log('📊 Products by category response:', {
        success: productsResponse.success,
        hasCategory: !!productsResponse.data?.category,
        productCount: productsResponse.data?.products?.length || 0,
        total: productsResponse.data?.pagination?.total || 0,
        message: productsResponse.message
      });
      
      if (productsResponse.success && productsResponse.data) {
        let filteredProducts = productsResponse.data.products || [];
        const originalCount = filteredProducts.length;
        
        // Apply client-side filters
        if (filterParams.inStock) {
          filteredProducts = filteredProducts.filter((p: any) => p.stock > 0);
        }
        
        if (filterParams.onSale) {
          filteredProducts = filteredProducts.filter((p: any) => 
            p.discountPrice && p.discountPrice < p.price
          );
        }
        
        setProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        
        console.log(`📦 Products: ${originalCount} → ${filteredProducts.length} after client filters`);
        
        if (filteredProducts.length === 0 && originalCount > 0) {
          toast('No products match your filters', {
            duration: 3000,
            icon: 'ℹ️',
            style: { background: '#3b82f6', color: 'white' }
          });
        }
        
        if (filteredProducts.length === 0) {
          toast(`No products found in category "${categoryData.name}"`, {
            duration: 4000,
            icon: '📦',
            style: { background: '#3b82f6', color: 'white' }
          });
        }
      } else {
        console.warn('⚠️ Products fetch returned no data:', productsResponse.message);
        setProducts([]);
        setTotalProducts(0);
        
        if (productsResponse.message && !productsResponse.message.includes('No products')) {
          toast.error(productsResponse.message);
        }
      }
      
    } catch (err: any) {
      console.error('🚨 Error in fetchCategoryAndProducts:', err);
      const errorMessage = err.message || 'Failed to load category products';
      setError(errorMessage);
      
      if (!err.message?.includes('not found')) {
        toast.error(errorMessage);
      }
      
      setCategory(null);
      setProducts([]);
    } finally {
      console.log('🏁 Fetch operation completed');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    console.log('🎬 Initial useEffect triggered, slug:', slug);
    if (slug) {
      fetchCategoryAndProducts();
    } else {
      setError('No category specified');
      setLoading(false);
    }
    
    return () => {
      console.log('🧹 Cleaning up CategoryProductsPage');
    };
  }, [slug]);

  // Handle filter changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (!category) return;
    
    const hasFiltersChanged = 
      prevFiltersRef.current.sort !== filters.sort ||
      prevFiltersRef.current.order !== filters.order ||
      prevFiltersRef.current.minPrice !== filters.minPrice ||
      prevFiltersRef.current.maxPrice !== filters.maxPrice ||
      prevFiltersRef.current.inStock !== filters.inStock ||
      prevFiltersRef.current.onSale !== filters.onSale ||
      prevFiltersRef.current.search !== filters.search;
    
    if (!hasFiltersChanged) return;
    
    console.log('🔄 Filters changed, debouncing...');
    prevFiltersRef.current = { ...filters };
    
    const timer = setTimeout(() => {
      console.log('🔍 Applying filters:', filters);
      fetchCategoryAndProducts(filters);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [filters, category]);

  const handleFilterChange = (key: string, value: any) => {
    console.log(`🛠️ Filter change: ${key} = ${value}`);
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      if (key !== 'sort' && key !== 'order') {
        if (value && value !== '' && value !== false) {
          if (!activeFilters.includes(key)) {
            setActiveFilters(prevFilters => [...prevFilters, key]);
          }
        } else {
          setActiveFilters(prevFilters => prevFilters.filter(f => f !== key));
        }
      }
      
      return newFilters;
    });
  };

  const clearFilters = () => {
    console.log('🧹 Clearing all filters');
    setFilters({
      sort: 'createdAt',
      order: 'desc',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      onSale: false,
      search: ''
    });
    setActiveFilters([]);
    toast.success('Filters cleared');
  };

  const removeFilter = (filterName: string) => {
    console.log(`🗑️ Removing filter: ${filterName}`);
    switch (filterName) {
      case 'minPrice':
      case 'maxPrice':
        setFilters(prev => ({ ...prev, [filterName]: '' }));
        break;
      case 'inStock':
      case 'onSale':
        setFilters(prev => ({ ...prev, [filterName]: false }));
        break;
      case 'search':
        setFilters(prev => ({ ...prev, search: '' }));
        break;
    }
    setActiveFilters(prev => prev.filter(f => f !== filterName));
  };

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product, 1);
      toast.success(`Added ${product.name} to cart`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    }
  };

  const formatPrice = (price: number): string => {
    return `PKR ${price.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  };

  const getDiscountPercent = (price: number, discountPrice?: number): number => {
    if (!discountPrice || discountPrice >= price) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Loading category...</p>
          <p className="text-sm text-gray-500">Slug: {slug}</p>
        </div>
      </div>
    );
  }

  // Error state
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
            <button
              onClick={() => navigate(-1)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate('/categories')}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Browse All Categories
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <nav className="flex items-center text-sm text-blue-200 mb-3">
                <button onClick={() => navigate('/')} className="hover:text-white">
                  Home
                </button>
                <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
                <button onClick={() => navigate('/categories')} className="hover:text-white">
                  Categories
                </button>
                <ChevronLeft className="h-4 w-4 mx-2 rotate-180" />
                <span className="text-white font-semibold">{category.name}</span>
              </nav>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-blue-100 text-lg mb-4">
                  {category.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center bg-blue-500/20 px-3 py-1.5 rounded-full">
                  <Package className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    {totalProducts} Product{totalProducts !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  category.isActive 
                    ? 'bg-green-500/20 text-green-200' 
                    : 'bg-red-500/20 text-red-200'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            
            {/* Category image in header */}
            {getCategoryImage(category) && (
              <div className="hidden md:block">
                <img
                  src={getCategoryImage(category)}
                  alt={category.name}
                  className="h-40 w-40 rounded-xl object-cover shadow-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="md:hidden mr-3 p-2 border border-gray-300 rounded-lg"
                >
                  <SlidersHorizontal className="h-5 w-5 text-gray-600" />
                </button>
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search in this category..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Active:</span>
                  {activeFilters.map(filter => (
                    <span
                      key={filter}
                      className="flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {filter === 'inStock' && 'In Stock'}
                      {filter === 'onSale' && 'On Sale'}
                      {filter === 'minPrice' && `Min: PKR ${filters.minPrice}`}
                      {filter === 'maxPrice' && `Max: PKR ${filters.maxPrice}`}
                      {filter === 'search' && `Search: "${filters.search}"`}
                      <button
                        onClick={() => removeFilter(filter)}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear All
                  </button>
                </div>
              )}
              
              {/* View Toggle */}
              <div className="hidden md:flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleFilterChange('sort', sort);
                    handleFilterChange('order', order);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating-desc">Highest Rated</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Mobile Filters Panel */}
          {showMobileFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
              <div className="grid grid-cols-2 gap-4">
                {/* Price Range */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (PKR)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                
                {/* Stock Filter */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mobileInStock"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mobileInStock" className="ml-2 text-sm text-gray-700">
                    In Stock Only
                  </label>
                </div>
                
                {/* Sale Filter */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mobileOnSale"
                    checked={filters.onSale}
                    onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mobileOnSale" className="ml-2 text-sm text-gray-700">
                    On Sale Only
                  </label>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
          
          {/* Desktop Filter Options */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range (PKR)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            {/* Stock Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="desktopInStock"
                checked={filters.inStock}
                onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="desktopInStock" className="ml-2 text-sm text-gray-700">
                In Stock Only
              </label>
            </div>
            
            {/* Sale Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="desktopOnSale"
                checked={filters.onSale}
                onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="desktopOnSale" className="ml-2 text-sm text-gray-700">
                On Sale Only
              </label>
            </div>
            
            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                Showing {products.length} of {totalProducts} products
              </span>
            </div>
          </div>
        </div>
        
        {/* Products Section */}
        {products.length > 0 ? (
          <>
            {/* View Mode Toggle for Mobile */}
            <div className="md:hidden flex justify-center mb-4">
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Products Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div onClick={() => navigate(`/products/${product.slug || product._id}`)} className="cursor-pointer">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-product.jpg';
                            }}
                          />
                          {product.discountPrice && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                              Save {getDiscountPercent(product.price, product.discountPrice)}%
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.shortDescription || product.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatPrice(product.discountPrice || product.price)}
                                </span>
                                {product.discountPrice && (
                                  <span className="ml-2 text-sm text-gray-500 line-through">
                                    {formatPrice(product.price)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="ml-1 text-sm text-gray-600">
                                  {product.rating?.toFixed(1) || 'No ratings'}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row">
                        <div
                          className="sm:flex-shrink-0 sm:w-48 h-48 sm:h-auto mb-4 sm:mb-0 sm:mr-4 cursor-pointer"
                          onClick={() => navigate(`/products/${product.slug || product._id}`)}
                        >
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-product.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer"
                            onClick={() => navigate(`/products/${product.slug || product._id}`)}
                          >
                            {product.name}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {product.shortDescription || product.description}
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div>
                              <div className="flex items-center mb-2">
                                <span className="text-xl font-bold text-gray-900">
                                  {formatPrice(product.discountPrice || product.price)}
                                </span>
                                {product.discountPrice && (
                                  <>
                                    <span className="ml-2 text-sm text-gray-500 line-through">
                                      {formatPrice(product.price)}
                                    </span>
                                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded">
                                      {getDiscountPercent(product.price, product.discountPrice)}% OFF
                                    </span>
                                  </>
                                )}
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  product.stock > 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                </span>
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="ml-1 text-sm text-gray-600">
                                    {product.rating?.toFixed(1) || 'No ratings'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4 sm:mt-0 flex space-x-2">
                              <button
                                onClick={() => navigate(`/products/${product.slug || product._id}`)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => handleAddToCart(product)}
                                disabled={product.stock <= 0}
                                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
                                  product.stock > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingCart className="h-4 w-4 mr-1" />
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
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeFilters.length > 0
                ? 'No products match your current filters. Try adjusting your search criteria.'
                : `No products found in category "${category?.name || 'this category'}".`
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {activeFilters.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={() => navigate('/categories')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Browse All Categories
              </button>
              <button
                onClick={() => navigate('/products')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Browse All Products
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProductsPage;
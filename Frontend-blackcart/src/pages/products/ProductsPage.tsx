

// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
// import { useSearchParams, useNavigate } from 'react-router-dom'
// import { motion } from 'framer-motion'
// import { useQuery } from '@tanstack/react-query'
// import ProductCard from '../../components/product/ProductCard'
// import ProductFilters from '../../components/product/ProductFilters'
// import ProductSorting from '../../components/product/ProductSorting'
// import Pagination from '../../components/common/Pagination'
// import { productService } from '../../services/productService'
// import { AlertCircle, RefreshCw, ShoppingBag, Package, Filter, X } from 'lucide-react'

// const ProductsPage: React.FC = () => {
//   const [searchParams, setSearchParams] = useSearchParams()
//   const navigate = useNavigate()
//   const isInitialMount = useRef(true)
  
//   // Parse filters from URL
//   const getInitialFilters = useCallback(() => {
//     const params = Object.fromEntries(searchParams.entries())
    
//     return {
//       category: params.category || '',
//       brand: params.brand || '',
//       minPrice: params.minPrice ? Number(params.minPrice) : undefined,
//       maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
//       rating: params.rating ? Number(params.rating) : undefined,
//       featured: params.featured === 'true',
//       newArrivals: params.newArrivals === 'true',
//       search: params.search || '',
//     }
//   }, [searchParams])

//   const [filters, setFilters] = useState(getInitialFilters)
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
//     return (localStorage.getItem('productViewMode') as 'grid' | 'list') || 'grid'
//   })
//   const [sortBy, setSortBy] = useState(() => {
//     return searchParams.get('sort') || 'createdAt'
//   })
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
//     return (searchParams.get('order') as 'asc' | 'desc') || 'desc'
//   })
//   const [currentPage, setCurrentPage] = useState(() => {
//     const page = searchParams.get('page')
//     return page ? Number(page) : 1
//   })
//   const limit = 12

//   // Save view mode to localStorage
//   useEffect(() => {
//     localStorage.setItem('productViewMode', viewMode)
//   }, [viewMode])

//   // Update URL when filters/sorting/page change
//   useEffect(() => {
//     if (isInitialMount.current) {
//       isInitialMount.current = false
//       return
//     }

//     const params = new URLSearchParams()
    
//     // Add filters
//     Object.entries(filters).forEach(([key, value]) => {
//       if (value !== undefined && value !== null && value !== '' && value !== false) {
//         if (key === 'featured' || key === 'newArrivals') {
//           if (value) params.set(key, 'true')
//         } else if (typeof value === 'number') {
//           params.set(key, value.toString())
//         } else if (typeof value === 'string' && value.trim() !== '') {
//           params.set(key, value)
//         }
//       }
//     })
    
//     // Add sorting
//     if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
//       params.set('sort', sortBy)
//       params.set('order', sortOrder)
//     }
    
//     // Add page
//     if (currentPage > 1) {
//       params.set('page', currentPage.toString())
//     }
    
//     setSearchParams(params, { replace: true })
//   }, [filters, sortBy, sortOrder, currentPage, setSearchParams])

//   // Build query params for API
//   const queryParams = useMemo(() => {
//     const params: any = {
//       page: currentPage,
//       limit,
//       sort: sortBy,
//       order: sortOrder,
//     }
    
//     if (filters.category && filters.category !== 'all') {
//       params.category = filters.category
//     }
//     if (filters.brand && filters.brand !== 'all') {
//       params.brand = filters.brand
//     }
//     if (filters.minPrice !== undefined) {
//       params.minPrice = filters.minPrice
//     }
//     if (filters.maxPrice !== undefined) {
//       params.maxPrice = filters.maxPrice
//     }
//     if (filters.rating !== undefined && filters.rating > 0) {
//       params.rating = filters.rating
//     }
//     if (filters.featured) {
//       params.featured = true
//     }
//     if (filters.newArrivals) {
//       params.newArrivals = true
//     }
//     if (filters.search && filters.search.trim() !== '') {
//       params.search = filters.search.trim()
//     }
    
//     return params
//   }, [filters, sortBy, sortOrder, currentPage, limit])

//   // Fetch products
//   const { 
//     data, 
//     isLoading, 
//     error, 
//     isFetching, 
//     refetch 
//   } = useQuery({
//     queryKey: ['products', queryParams],
//     queryFn: () => productService.getProducts(queryParams),
//     keepPreviousData: true,
//     retry: 1,
//     staleTime: 1000 * 60 * 5,
//   })

//   // Extract data
//   const products = useMemo(() => {
//     return data?.success ? (data.data?.products || []) : []
//   }, [data])

//   const pagination = useMemo(() => {
//     return data?.success ? data.data?.pagination : null
//   }, [data])

//   // Handle filter changes
//   const handleFilterChange = useCallback((newFilters: any) => {
//     setFilters(prev => {
//       const updated = { ...prev, ...newFilters }
//       // Remove page from filters when other filters change
//       setCurrentPage(1)
//       return updated
//     })
//   }, [])

//   // Handle sort changes
//   const handleSortChange = useCallback((sort: string, order: 'asc' | 'desc') => {
//     setSortBy(sort)
//     setSortOrder(order)
//     setCurrentPage(1)
//   }, [])

//   // Handle page changes
//   const handlePageChange = useCallback((page: number) => {
//     setCurrentPage(page)
//     window.scrollTo({ top: 0, behavior: 'smooth' })
//   }, [])

//   // Clear all filters
//   const clearAllFilters = useCallback(() => {
//     setFilters({
//       category: '',
//       brand: '',
//       minPrice: undefined,
//       maxPrice: undefined,
//       rating: undefined,
//       featured: false,
//       newArrivals: false,
//       search: '',
//     })
//     setSortBy('createdAt')
//     setSortOrder('desc')
//     setCurrentPage(1)
//   }, [])

//   // Active filter count
//   const activeFilterCount = useMemo(() => {
//     return Object.entries(filters).filter(([key, value]) => {
//       if (key === 'search') return value && value !== ''
//       if (key === 'featured' || key === 'newArrivals') return value === true
//       if (key === 'minPrice' || key === 'maxPrice') return value !== undefined
//       if (key === 'rating') return value !== undefined && value > 0
//       return value !== undefined && value !== '' && value !== 'all'
//     }).length
//   }, [filters])

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="container-lg section-padding">
//           <div className="flex items-center justify-center py-20">
//             <div className="text-center">
//               <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
//               <p className="text-gray-600">Loading products...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="container-lg section-padding">
//           <div className="max-w-md mx-auto text-center">
//             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <AlertCircle className="h-8 w-8 text-red-600" />
//             </div>
//             <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Products</h2>
//             <p className="text-gray-600 mb-6">Please check your connection and try again.</p>
//             <div className="flex gap-4 justify-center">
//               <button
//                 onClick={() => refetch()}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
//               >
//                 <RefreshCw className="h-4 w-4 mr-2" />
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="container-lg section-padding">
//         {/* Page Header */}
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 {filters.search ? `Search: "${filters.search}"` : 
//                  filters.category ? `${filters.category} Products` : 
//                  filters.featured ? 'Featured Products' :
//                  filters.newArrivals ? 'New Arrivals' : 'All Products'}
//               </h1>
//               <p className="text-gray-600">
//                 {products.length > 0 
//                   ? `Showing ${products.length} of ${pagination?.total || 0} products`
//                   : 'No products found matching your criteria'}
//                 {isFetching && ' (Updating...)'}
//               </p>
//             </div>
            
//             {activeFilterCount > 0 && (
//               <button
//                 onClick={clearAllFilters}
//                 className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 <X className="h-4 w-4 mr-2" />
//                 Clear All Filters ({activeFilterCount})
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//           {/* Filters */}
//           <div className="lg:col-span-1">
//             <ProductFilters
//               filters={filters}
//               onFilterChange={handleFilterChange}
//               isLoading={isLoading || isFetching}
//             />
//           </div>

//           {/* Products Content */}
//           <div className="lg:col-span-3">
//             {/* Sorting */}
//             <ProductSorting
//               sortBy={sortBy}
//               sortOrder={sortOrder}
//               viewMode={viewMode}
//               onSortChange={handleSortChange}
//               onViewChange={setViewMode}
//               totalProducts={pagination?.total || 0}
//               showingProducts={products.length}
//               isLoading={isFetching}
//             />

//             {/* Products Grid/List */}
//             {products.length > 0 ? (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className={viewMode === 'grid' 
//                   ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
//                   : 'space-y-4'
//                 }
//               >
//                 {products.map((product: any, index: number) => (
//                   <motion.div
//                     key={product._id}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.05 }}
//                   >
//                     <ProductCard
//                       product={product}
//                       viewMode={viewMode}
//                     />
//                   </motion.div>
//                 ))}
//               </motion.div>
//             ) : (
//               <div className="bg-white rounded-lg shadow p-12 text-center">
//                 <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
//                 <p className="text-gray-600 mb-6">
//                   Try adjusting your filters or search criteria
//                 </p>
//                 <button
//                   onClick={clearAllFilters}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Clear All Filters
//                 </button>
//               </div>
//             )}

//             {/* Pagination */}
//             {pagination && pagination.pages > 1 && (
//               <div className="mt-12">
//                 <Pagination
//                   currentPage={currentPage}
//                   totalPages={pagination.pages}
//                   onPageChange={handlePageChange}
//                   totalItems={pagination.total}
//                   itemsPerPage={limit}
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ProductsPage

//in below code we just update it with multiple filter permission and commentout the rating filter

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import ProductCard from '../../components/product/ProductCard'
import ProductFilters from '../../components/product/ProductFilters'
import ProductSorting from '../../components/product/ProductSorting'
import Pagination from '../../components/common/Pagination'
import { productService } from '../../services/productService'
import { AlertCircle, RefreshCw, Package, X } from 'lucide-react'

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const isInitialMount = useRef(true)
  
  // Parse filters from URL — category/brand are now arrays
  const getInitialFilters = useCallback(() => {
    const params = Object.fromEntries(searchParams.entries())
    
    return {
      // Split comma-separated values back to arrays
      category: params.category ? params.category.split(',').filter(Boolean) : [],
      brand: params.brand ? params.brand.split(',').filter(Boolean) : [],
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      // rating: params.rating ? Number(params.rating) : undefined,  // ⛔ commented out
      featured: params.featured === 'true',
      newArrivals: params.newArrivals === 'true',
      search: params.search || '',
    }
  }, [searchParams])

  const [filters, setFilters] = useState(getInitialFilters)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('productViewMode') as 'grid' | 'list') || 'grid'
  })
  const [sortBy, setSortBy] = useState(() => {
    return searchParams.get('sort') || 'createdAt'
  })
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    return (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  })
  const [currentPage, setCurrentPage] = useState(() => {
    const page = searchParams.get('page')
    return page ? Number(page) : 1
  })
  const limit = 12

  useEffect(() => {
    localStorage.setItem('productViewMode', viewMode)
  }, [viewMode])

  // Sync filters to URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const params = new URLSearchParams()
    
    // Arrays: join with comma
    const cats = Array.isArray(filters.category) ? filters.category : []
    const brands = Array.isArray(filters.brand) ? filters.brand : []
    if (cats.length > 0) params.set('category', cats.join(','))
    if (brands.length > 0) params.set('brand', brands.join(','))

    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString())
    // if (filters.rating !== undefined && filters.rating > 0) params.set('rating', filters.rating.toString())  // ⛔ commented out
    if (filters.featured) params.set('featured', 'true')
    if (filters.newArrivals) params.set('newArrivals', 'true')
    if (filters.search && filters.search.trim() !== '') params.set('search', filters.search)
    if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
      params.set('sort', sortBy)
      params.set('order', sortOrder)
    }
    if (currentPage > 1) params.set('page', currentPage.toString())
    
    setSearchParams(params, { replace: true })
  }, [filters, sortBy, sortOrder, currentPage, setSearchParams])

  // Build API query params
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit,
      sort: sortBy,
      order: sortOrder,
    }
    
    const cats = Array.isArray(filters.category) ? filters.category : []
    const brands = Array.isArray(filters.brand) ? filters.brand : []
    
    // Send as comma-separated string to backend
    if (cats.length > 0) params.category = cats.join(',')
    if (brands.length > 0) params.brand = brands.join(',')
    
    if (filters.minPrice !== undefined) params.minPrice = filters.minPrice
    if (filters.maxPrice !== undefined) params.maxPrice = filters.maxPrice
    // if (filters.rating !== undefined && filters.rating > 0) params.rating = filters.rating  // ⛔ commented out
    if (filters.featured) params.featured = true
    if (filters.newArrivals) params.newArrivals = true
    if (filters.search && filters.search.trim() !== '') params.search = filters.search.trim()
    
    return params
  }, [filters, sortBy, sortOrder, currentPage, limit])

  const { 
    data, 
    isLoading, 
    error, 
    isFetching, 
    refetch 
  } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => productService.getProducts(queryParams),
    keepPreviousData: true,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })

  const products = useMemo(() => {
    return data?.success ? (data.data?.products || []) : []
  }, [data])

  const pagination = useMemo(() => {
    return data?.success ? data.data?.pagination : null
  }, [data])

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1)
  }, [])

  const handleSortChange = useCallback((sort: string, order: 'asc' | 'desc') => {
    setSortBy(sort)
    setSortOrder(order)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: [],
      brand: [],
      minPrice: undefined,
      maxPrice: undefined,
      // rating: undefined,   // ⛔ commented out
      featured: false,
      newArrivals: false,
      search: '',
    })
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }, [])

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0
    const cats = Array.isArray(filters.category) ? filters.category : []
    const brands = Array.isArray(filters.brand) ? filters.brand : []
    if (cats.length > 0) count += cats.length
    if (brands.length > 0) count += brands.length
    if (filters.minPrice !== undefined) count++
    if (filters.maxPrice !== undefined) count++
    // if (filters.rating !== undefined && filters.rating > 0) count++  // ⛔ commented out
    if (filters.featured) count++
    if (filters.newArrivals) count++
    if (filters.search && filters.search !== '') count++
    return count
  }, [filters])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Products</h2>
            <p className="text-gray-600 mb-6">Please check your connection and try again.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center mx-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-lg section-padding">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {filters.search
                  ? `Search: "${filters.search}"`
                  : (Array.isArray(filters.category) && filters.category.length > 0)
                  ? `${filters.category.join(', ')} Products`
                  : filters.featured
                  ? 'Featured Products'
                  : filters.newArrivals
                  ? 'New Arrivals'
                  : 'All Products'}
              </h1>
              <p className="text-gray-600">
                {products.length > 0 
                  ? `Showing ${products.length} of ${pagination?.total || 0} products`
                  : 'No products found matching your criteria'}
                {isFetching && ' (Updating...)'}
              </p>
            </div>
            
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              isLoading={isLoading || isFetching}
            />
          </div>

          {/* Products Content */}
          <div className="lg:col-span-3">
            <ProductSorting
              sortBy={sortBy}
              sortOrder={sortOrder}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewChange={setViewMode}
              totalProducts={pagination?.total || 0}
              showingProducts={products.length}
              isLoading={isFetching}
            />

            {products.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
                }
              >
                {products.map((product: any, index: number) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      product={product}
                      viewMode={viewMode}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {pagination && pagination.pages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={limit}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
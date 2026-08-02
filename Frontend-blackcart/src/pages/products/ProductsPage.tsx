

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import ProductCard from '../../components/product/ProductCard'
import ProductFilters from '../../components/product/ProductFilters'
import ProductSorting from '../../components/product/ProductSorting'
import { productService } from '../../services/productService'
import { AlertCircle, RefreshCw, Package, X, Filter, ChevronLeft } from 'lucide-react'
import type { Product } from '../../types'

interface ProductFiltersState {
  category: string[]
  brand: string[]
  minPrice?: number
  maxPrice?: number
  featured: boolean
  newArrivals: boolean
  onSale: boolean
  search: string
}

const PRODUCT_BATCH_SIZE = 100

const getAllProducts = async (queryParams: Record<string, string | number | boolean>) => {
  const firstPage = await productService.getProducts({
    ...queryParams,
    page: 1,
    limit: PRODUCT_BATCH_SIZE,
  })

  if (!firstPage.success) {
    throw new Error(firstPage.message || 'Failed to load products')
  }

  const pageCount = Math.max(1, Number(firstPage.data?.pagination?.pages) || 1)
  const remainingPages = pageCount > 1
    ? await Promise.all(
        Array.from({ length: pageCount - 1 }, (_, index) =>
          productService.getProducts({
            ...queryParams,
            page: index + 2,
            limit: PRODUCT_BATCH_SIZE,
          })
        )
      )
    : []

  const failedPage = remainingPages.find((response) => !response.success)
  if (failedPage) {
    throw new Error(failedPage.message || 'Failed to load all products')
  }

  const allProducts = [
    ...(firstPage.data?.products || []),
    ...remainingPages.flatMap((response) => response.data?.products || []),
  ] as Product[]
  const seenProductIds = new Set<string>()
  const uniqueProducts = allProducts.filter((product) => {
    if (!product._id || seenProductIds.has(product._id)) return false
    seenProductIds.add(product._id)
    return true
  })

  return {
    ...firstPage,
    data: {
      ...firstPage.data,
      products: uniqueProducts,
      pagination: {
        ...firstPage.data.pagination,
        page: 1,
        limit: uniqueProducts.length,
        pages: 1,
        total: firstPage.data.pagination?.total ?? uniqueProducts.length,
      },
    },
  }
}

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Filter sidebar state
  const [showFilters, setShowFilters] = useState(() => typeof window === 'undefined' ? true : window.innerWidth >= 1024)
  
  // Parse filters from URL â€” category/brand are now arrays
  const getInitialFilters = useCallback((): ProductFiltersState => {
    const params = Object.fromEntries(searchParams.entries())
    
    return {
      // Split comma-separated values back to arrays
      category: params.category ? params.category.split(',').filter(Boolean) : [],
      brand: params.brand ? params.brand.split(',').filter(Boolean) : [],
      minPrice: params.minPrice ? Number(params.minPrice) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      featured: params.featured === 'true',
      newArrivals: params.newArrivals === 'true',
      onSale: params.onSale === 'true',
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
  useEffect(() => {
    localStorage.setItem('productViewMode', viewMode)
  }, [viewMode])

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    
    // Arrays: join with comma
    const cats = Array.isArray(filters.category) ? filters.category : []
    const brands = Array.isArray(filters.brand) ? filters.brand : []
    if (cats.length > 0) params.set('category', cats.join(','))
    if (brands.length > 0) params.set('brand', brands.join(','))

    if (filters.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString())
    if (filters.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString())
    if (filters.featured) params.set('featured', 'true')
    if (filters.newArrivals) params.set('newArrivals', 'true')
    if (filters.onSale) params.set('onSale', 'true')
    if (filters.search && filters.search.trim() !== '') params.set('search', filters.search)
    if (sortBy !== 'createdAt' || sortOrder !== 'desc') {
      params.set('sort', sortBy)
      params.set('order', sortOrder)
    }

    setSearchParams(params, { replace: true })
  }, [filters, sortBy, sortOrder, setSearchParams])

  // Build API query params
  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
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
    if (filters.featured) params.featured = true
    if (filters.newArrivals) params.newArrivals = true
    if (filters.onSale) params.onSale = true
    if (filters.search && filters.search.trim() !== '') params.search = filters.search.trim()
    
    return params
  }, [filters, sortBy, sortOrder])

  const { 
    data, 
    isLoading, 
    error, 
    isFetching, 
    refetch 
  } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => getAllProducts(queryParams),
    placeholderData: (previousData) => previousData,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  })

  const products = useMemo(() => {
    return data?.success ? (data.data?.products || []) : []
  }, [data])

  const totalProducts = data?.success
    ? Number(data.data?.pagination?.total ?? products.length)
    : 0

  const handleFilterChange = useCallback((newFilters: Partial<ProductFiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const handleSortChange = useCallback((sort: string, order: 'asc' | 'desc') => {
    setSortBy(sort)
    setSortOrder(order)
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: [],
      brand: [],
      minPrice: undefined,
      maxPrice: undefined,
      featured: false,
      newArrivals: false,
      onSale: false,
      search: '',
    })
    setSortBy('createdAt')
    setSortOrder('desc')
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-3 sm:py-4">
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
      <div className="min-h-screen bg-gray-50 py-3 sm:py-4">
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
    <div className="min-h-screen bg-gray-50 py-3 sm:py-4">
      <Helmet>
        <title>
          {filters.search
            ? `Search: "${filters.search}" | BlackCart Pakistan`
            : Array.isArray(filters.category) && filters.category.length > 0
            ? `${filters.category.join(', ')} Products in Pakistan | BlackCart`
            : filters.featured
            ? 'Featured Products | BlackCart Pakistan'
            : filters.newArrivals
            ? 'New Arrivals | BlackCart Pakistan'
            : filters.onSale
            ? 'Best Offers | BlackCart Pakistan'
            : 'Buy Computer Accessories Online in Pakistan | BlackCart'}
        </title>
        <meta
          name="description"
          content={
            filters.search
              ? `Search results for "${filters.search}" at BlackCart. Find computer accessories and gaming gear in Pakistan.`
              : 'Explore 100+ computer and gaming accessories at unbeatable prices. Genuine products, secure payments, and nationwide delivery across Pakistan.'
          }
        />
        <meta property="og:title" content="Computer Accessories Online Pakistan | BlackCart" />
        <meta property="og:description" content="Shop gaming mice, keyboards, headphones and more. Fast delivery across Pakistan." />
        <meta property="og:url" content="https://blackcart.store/products" />
        <link rel="canonical" href="https://blackcart.store/products" />
      </Helmet>
      <div className="container-lg section-padding">
        {/* Page Header */}
        <div className="mb-4">
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
                  : filters.onSale
                  ? 'Best Offers'
                  : 'All Products'}
              </h1>
              <p className="text-gray-600">
                {products.length > 0 
                  ? `Showing all ${products.length} products`
                  : 'No products found matching your criteria'}
                {isFetching && ' (Updating...)'}
              </p>
            </div>
            
                        <div className="flex items-center gap-3">
              <button type="button" onClick={clearAllFilters} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <X className="h-4 w-4" /> Clear All
              </button>
              <button type="button" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50">
                <Filter className="h-4 w-4 text-blue-600" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          {/* Filters sidebar - with toggle functionality */}
          <div className={`lg:col-span-1 transition-all duration-300 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {showFilters && (
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                isLoading={isLoading || isFetching}
                onClose={() => setShowFilters(false)}
              />
            )}
          </div>

          {/* Products Content - adjusts width when filters are hidden */}
          <div className={`transition-all duration-300 ${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {/* Toggle Filters Button for Desktop */}
            <div className="hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <Filter className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                <ChevronLeft className={`h-4 w-4 transition-transform ${showFilters ? '' : 'rotate-180'}`} />
              </button>
            </div>

            <ProductSorting
              sortBy={sortBy}
              sortOrder={sortOrder}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewChange={setViewMode}
              totalProducts={totalProducts}
              showingProducts={products.length}
              isLoading={isFetching}
            />

            {products.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={
                  viewMode === 'grid'
                    // âœ… FIXED: 4 columns when filters hidden, 3 when shown, responsive on mobile
                    ? showFilters
                      ? 'grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4'
                      : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
                    : 'space-y-4'
                }
              >
                {products.map((product: Product, index: number) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index, 12) * 0.03 }}
                  >
                    <ProductCard
                      product={product}
                      viewMode={viewMode}
                    compact={viewMode === 'grid'}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductsPage



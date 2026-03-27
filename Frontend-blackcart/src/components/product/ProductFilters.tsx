

//making real complete

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Filter, X, ChevronDown, ChevronUp, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../../services/productService'
import { useDebounce } from '../../hooks/useDebounce'

interface ProductFiltersProps {
  filters: {
    category?: string
    brand?: string
    minPrice?: number
    maxPrice?: number
    rating?: number
    featured?: boolean
    newArrivals?: boolean
    search?: string
  }
  onFilterChange: (filters: any) => void
  isLoading?: boolean
}

interface Category {
  _id?: string
  name: string
  slug?: string
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  filters, 
  onFilterChange,
  isLoading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState({ min: 0, max: 50000 })
  
  // Use debounce for price range to avoid too many API calls
  const debouncedPriceRange = useDebounce(localPriceRange, 500)

  // Fetch filter options
  const { data: filterOptions, isLoading: optionsLoading } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: async () => {
      const result = await productService.getFilterOptions()
      return result
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

  // Extract and normalize data
  const { categories, brands, priceRangeData } = useMemo(() => {
    const defaultData = { 
      categories: [], 
      brands: [], 
      priceRange: { minPrice: 0, maxPrice: 50000 } 
    }
    
    if (!filterOptions?.success) return defaultData
    
    const data = filterOptions.data || {}
    
    // Normalize categories
    const rawCategories = Array.isArray(data.categories) ? data.categories : []
    const normalizedCategories = rawCategories.map((cat: any) => {
      if (typeof cat === 'string') {
        return { name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') }
      }
      return {
        name: cat.name || cat,
        slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')
      }
    })
    
    // Normalize brands
    const rawBrands = Array.isArray(data.brands) ? data.brands : []
    const normalizedBrands = rawBrands.map((brand: any) => {
      if (typeof brand === 'string') return brand
      return brand.name || brand
    }).filter(Boolean)
    
    return {
      categories: normalizedCategories,
      brands: normalizedBrands,
      priceRangeData: data.priceRange || defaultData.priceRange
    }
  }, [filterOptions])

  // Update local price range when filters change
  useEffect(() => {
    setLocalPriceRange({
      min: filters.minPrice !== undefined ? filters.minPrice : (priceRangeData?.minPrice || 0),
      max: filters.maxPrice !== undefined ? filters.maxPrice : (priceRangeData?.maxPrice || 50000),
    })
  }, [filters.minPrice, filters.maxPrice, priceRangeData])

  // Apply price filter when debounced value changes
  useEffect(() => {
    if (debouncedPriceRange.min !== filters.minPrice || debouncedPriceRange.max !== filters.maxPrice) {
      onFilterChange({
        ...filters,
        minPrice: debouncedPriceRange.min,
        maxPrice: debouncedPriceRange.max,
      })
    }
  }, [debouncedPriceRange, filters, onFilterChange])

  const handleCategoryChange = useCallback((categorySlug: string) => {
    onFilterChange({ 
      ...filters, 
      category: filters.category === categorySlug ? undefined : categorySlug,
      page: 1 // Reset page
    })
  }, [filters, onFilterChange])

  const handleBrandChange = useCallback((brand: string) => {
    onFilterChange({ 
      ...filters, 
      brand: filters.brand === brand ? undefined : brand,
      page: 1
    })
  }, [filters, onFilterChange])

  const handleRatingChange = useCallback((rating: number) => {
    onFilterChange({ 
      ...filters, 
      rating: filters.rating === rating ? undefined : rating,
      page: 1
    })
  }, [filters, onFilterChange])

  const handlePriceChange = useCallback((min: number, max: number) => {
    setLocalPriceRange({ min, max })
  }, [])

  const handleFeaturedChange = useCallback(() => {
    onFilterChange({
      ...filters,
      featured: !filters.featured,
      page: 1
    })
  }, [filters, onFilterChange])

  const handleNewArrivalsChange = useCallback(() => {
    onFilterChange({
      ...filters,
      newArrivals: !filters.newArrivals,
      page: 1
    })
  }, [filters, onFilterChange])

  const clearFilters = useCallback(() => {
    onFilterChange({
      category: undefined,
      brand: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      rating: undefined,
      featured: false,
      newArrivals: false,
      search: filters.search, // Keep search if present
    })
    setLocalPriceRange({
      min: priceRangeData?.minPrice || 0,
      max: priceRangeData?.maxPrice || 50000,
    })
  }, [onFilterChange, priceRangeData, filters.search])

  const activeFilterCount = useMemo(() => 
    Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value && value !== ''
      if (key === 'featured' || key === 'newArrivals') return value === true
      if (key === 'minPrice' || key === 'maxPrice') return value !== undefined
      if (key === 'rating') return value !== undefined && value !== 0
      return value !== undefined && value !== '' && value !== 'all'
    }).length,
    [filters]
  )

  const formatPrice = useCallback((price: number): string => {
    if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} L`
    if (price >= 1000) return `PKR ${(price / 1000).toFixed(1)}K`
    return `PKR ${price.toLocaleString()}`
  }, [])

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`${isOpen ? 'block' : 'hidden lg:block'}`}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-lg shadow-sm border p-6 sticky top-24"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {(optionsLoading || isLoading) ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))
              ) : categories.length > 0 ? (
                <>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.category}
                      onChange={() => handleCategoryChange('')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700 group-hover:text-blue-600">
                      All Categories
                    </span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.slug || category.name} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === (category.slug || category.name)}
                        onChange={() => handleCategoryChange(category.slug || category.name)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-blue-600">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </>
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>
          </div>

          {/* Brands */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {(optionsLoading || isLoading) ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))
              ) : brands.length > 0 ? (
                <>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="brand"
                      checked={!filters.brand}
                      onChange={() => handleBrandChange('')}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700 group-hover:text-blue-600">
                      All Brands
                    </span>
                  </label>
                  {brands.map((brand, index) => (
                    <label key={`${brand}-${index}`} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="brand"
                        checked={filters.brand === brand}
                        onChange={() => handleBrandChange(brand)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-700 group-hover:text-blue-600">
                        {brand}
                      </span>
                    </label>
                  ))}
                </>
              ) : (
                <p className="text-sm text-gray-500">No brands available</p>
              )}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600">
                  {formatPrice(localPriceRange.min)}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {formatPrice(localPriceRange.max)}
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full">
                <input
                  type="range"
                  min={priceRangeData?.minPrice || 0}
                  max={priceRangeData?.maxPrice || 50000}
                  step={(priceRangeData?.maxPrice || 50000) / 100}
                  value={localPriceRange.min}
                  onChange={(e) => {
                    const newMin = parseInt(e.target.value)
                    if (newMin < localPriceRange.max) {
                      handlePriceChange(newMin, localPriceRange.max)
                    }
                  }}
                  className="absolute w-full h-2 opacity-0 cursor-pointer"
                />
                <input
                  type="range"
                  min={priceRangeData?.minPrice || 0}
                  max={priceRangeData?.maxPrice || 50000}
                  step={(priceRangeData?.maxPrice || 50000) / 100}
                  value={localPriceRange.max}
                  onChange={(e) => {
                    const newMax = parseInt(e.target.value)
                    if (newMax > localPriceRange.min) {
                      handlePriceChange(localPriceRange.min, newMax)
                    }
                  }}
                  className="absolute w-full h-2 opacity-0 cursor-pointer"
                />
                <div 
                  className="absolute h-full bg-blue-600 rounded-full"
                  style={{ 
                    left: `${(localPriceRange.min / (priceRangeData?.maxPrice || 50000)) * 100}%`,
                    right: `${100 - (localPriceRange.max / (priceRangeData?.maxPrice || 50000)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={!filters.rating}
                  onChange={() => handleRatingChange(0)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-700 group-hover:text-blue-600">
                  Any Rating
                </span>
              </label>
              {[5, 4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="rating"
                    checked={filters.rating === rating}
                    onChange={() => handleRatingChange(rating)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-gray-700">& above</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Other Filters */}
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.featured || false}
                onChange={handleFeaturedChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700 group-hover:text-blue-600">
                Featured Products
              </span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.newArrivals || false}
                onChange={handleNewArrivalsChange}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700 group-hover:text-blue-600">
                New Arrivals (Last 30 days)
              </span>
            </label>
          </div>
        </motion.div>
      </div>
    </>
  )
}

export default ProductFilters
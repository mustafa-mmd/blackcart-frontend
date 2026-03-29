
// import React, { useState, useEffect, useCallback, useMemo } from 'react'
// import { motion } from 'framer-motion'
// import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
// import { useQuery } from '@tanstack/react-query'
// import { productService } from '../../services/productService'
// import { useDebounce } from '../../hooks/useDebounce'

// interface ProductFiltersProps {
//   filters: {
//     category?: string[]   // ✅ multi-select array
//     brand?: string[]      // ✅ multi-select array
//     minPrice?: number
//     maxPrice?: number
//     // rating?: number     // ⛔ commented out - not used for now
//     featured?: boolean
//     newArrivals?: boolean
//     search?: string
//   }
//   onFilterChange: (filters: any) => void
//   isLoading?: boolean
// }

// interface Category {
//   _id?: string
//   name: string
//   slug?: string
// }

// const ProductFilters: React.FC<ProductFiltersProps> = ({ 
//   filters, 
//   onFilterChange,
//   isLoading = false 
// }) => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [localPriceRange, setLocalPriceRange] = useState({ min: 0, max: 50000 })
  
//   const debouncedPriceRange = useDebounce(localPriceRange, 500)

//   const { data: filterOptions, isLoading: optionsLoading } = useQuery({
//     queryKey: ['filterOptions'],
//     queryFn: async () => {
//       const result = await productService.getFilterOptions()
//       return result
//     },
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//   })

//   const { categories, brands, priceRangeData } = useMemo(() => {
//     const defaultData = { 
//       categories: [], 
//       brands: [], 
//       priceRange: { minPrice: 0, maxPrice: 50000 } 
//     }
    
//     if (!filterOptions?.success) return defaultData
    
//     const data = filterOptions.data || {}
    
//     const rawCategories = Array.isArray(data.categories) ? data.categories : []
//     const normalizedCategories = rawCategories.map((cat: any) => {
//       if (typeof cat === 'string') {
//         return { name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') }
//       }
//       return {
//         name: cat.name || cat,
//         slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')
//       }
//     })
    
//     const rawBrands = Array.isArray(data.brands) ? data.brands : []
//     const normalizedBrands = rawBrands.map((brand: any) => {
//       if (typeof brand === 'string') return brand
//       return brand.name || brand
//     }).filter(Boolean)
    
//     return {
//       categories: normalizedCategories,
//       brands: normalizedBrands,
//       priceRangeData: data.priceRange || defaultData.priceRange
//     }
//   }, [filterOptions])

//   // Sync local price range with filters
//   useEffect(() => {
//     setLocalPriceRange({
//       min: filters.minPrice !== undefined ? filters.minPrice : (priceRangeData?.minPrice || 0),
//       max: filters.maxPrice !== undefined ? filters.maxPrice : (priceRangeData?.maxPrice || 50000),
//     })
//   }, [filters.minPrice, filters.maxPrice, priceRangeData])

//   // Apply debounced price change
//   useEffect(() => {
//     if (debouncedPriceRange.min !== filters.minPrice || debouncedPriceRange.max !== filters.maxPrice) {
//       onFilterChange({
//         ...filters,
//         minPrice: debouncedPriceRange.min,
//         maxPrice: debouncedPriceRange.max,
//       })
//     }
//   }, [debouncedPriceRange, filters, onFilterChange])

//   // ✅ Multi-select: toggle category in/out of array
//   const handleCategoryChange = useCallback((categorySlug: string) => {
//     const current: string[] = Array.isArray(filters.category) ? filters.category : []
//     const updated = current.includes(categorySlug)
//       ? current.filter(c => c !== categorySlug)   // remove
//       : [...current, categorySlug]                 // add
//     onFilterChange({ ...filters, category: updated, page: 1 })
//   }, [filters, onFilterChange])

//   // ✅ Multi-select: toggle brand in/out of array
//   const handleBrandChange = useCallback((brand: string) => {
//     const current: string[] = Array.isArray(filters.brand) ? filters.brand : []
//     const updated = current.includes(brand)
//       ? current.filter(b => b !== brand)
//       : [...current, brand]
//     onFilterChange({ ...filters, brand: updated, page: 1 })
//   }, [filters, onFilterChange])

//   const handlePriceChange = useCallback((min: number, max: number) => {
//     setLocalPriceRange({ min, max })
//   }, [])

//   const handleFeaturedChange = useCallback(() => {
//     onFilterChange({ ...filters, featured: !filters.featured, page: 1 })
//   }, [filters, onFilterChange])

//   const handleNewArrivalsChange = useCallback(() => {
//     onFilterChange({ ...filters, newArrivals: !filters.newArrivals, page: 1 })
//   }, [filters, onFilterChange])

//   const clearFilters = useCallback(() => {
//     onFilterChange({
//       category: [],
//       brand: [],
//       minPrice: undefined,
//       maxPrice: undefined,
//       // rating: undefined,   // ⛔ commented out
//       featured: false,
//       newArrivals: false,
//       search: filters.search,
//     })
//     setLocalPriceRange({
//       min: priceRangeData?.minPrice || 0,
//       max: priceRangeData?.maxPrice || 50000,
//     })
//   }, [onFilterChange, priceRangeData, filters.search])

//   const activeFilterCount = useMemo(() => {
//     let count = 0
//     const cats = Array.isArray(filters.category) ? filters.category : []
//     const brands_ = Array.isArray(filters.brand) ? filters.brand : []
//     if (cats.length > 0) count += cats.length
//     if (brands_.length > 0) count += brands_.length
//     if (filters.minPrice !== undefined) count++
//     if (filters.maxPrice !== undefined) count++
//     // if (filters.rating !== undefined && filters.rating !== 0) count++  // ⛔ commented out
//     if (filters.featured) count++
//     if (filters.newArrivals) count++
//     if (filters.search && filters.search !== '') count++
//     return count
//   }, [filters])

//   const formatPrice = useCallback((price: number): string => {
//     if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Cr`
//     if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} L`
//     if (price >= 1000) return `PKR ${(price / 1000).toFixed(1)}K`
//     return `PKR ${price.toLocaleString()}`
//   }, [])

//   // Helpers for checked state
//   const isCategoryChecked = (slug: string) => {
//     const current = Array.isArray(filters.category) ? filters.category : []
//     return current.includes(slug)
//   }

//   const isBrandChecked = (brand: string) => {
//     const current = Array.isArray(filters.brand) ? filters.brand : []
//     return current.includes(brand)
//   }

//   return (
//     <>
//       {/* Mobile Filter Toggle */}
//       <div className="lg:hidden mb-4">
//         <button
//           onClick={() => setIsOpen(!isOpen)}
//           className="flex items-center justify-between w-full p-4 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
//         >
//           <div className="flex items-center">
//             <Filter className="h-5 w-5 mr-2" />
//             <span className="font-medium">Filters</span>
//             {activeFilterCount > 0 && (
//               <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                 {activeFilterCount}
//               </span>
//             )}
//           </div>
//           {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
//         </button>
//       </div>

//       {/* Filters Panel */}
//       <div className={`${isOpen ? 'block' : 'hidden lg:block'}`}>
//         <motion.div
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           className="bg-white rounded-lg shadow-sm border p-6 sticky top-24"
//         >
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <h3 className="text-lg font-bold text-gray-900">Filters</h3>
//             {activeFilterCount > 0 && (
//               <button
//                 onClick={clearFilters}
//                 className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
//               >
//                 <X className="h-4 w-4 mr-1" />
//                 Clear All ({activeFilterCount})
//               </button>
//             )}
//           </div>

//           {/* ✅ Categories — multi-select checkboxes */}
//           <div className="mb-6">
//             <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
//               Categories
//             </h4>
//             <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
//               {(optionsLoading || isLoading) ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
//                 ))
//               ) : categories.length > 0 ? (
//                 categories.map((category) => {
//                   const slug = category.slug || category.name
//                   const checked = isCategoryChecked(slug)
//                   return (
//                     <label
//                       key={slug}
//                       className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
//                         checked ? 'bg-blue-50' : 'hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
//                         checked
//                           ? 'bg-blue-600 border-blue-600'
//                           : 'border-gray-300 bg-white'
//                       }`}>
//                         {checked && (
//                           <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
//                             <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                           </svg>
//                         )}
//                       </div>
//                       <input
//                         type="checkbox"
//                         className="sr-only"
//                         checked={checked}
//                         onChange={() => handleCategoryChange(slug)}
//                       />
//                       <span className={`text-sm ${checked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
//                         {category.name}
//                       </span>
//                     </label>
//                   )
//                 })
//               ) : (
//                 <p className="text-sm text-gray-500">No categories available</p>
//               )}
//             </div>

//             {/* Selected categories tags */}
//             {Array.isArray(filters.category) && filters.category.length > 0 && (
//               <div className="flex flex-wrap gap-1 mt-3">
//                 {filters.category.map(slug => {
//                   const cat = categories.find(c => (c.slug || c.name) === slug)
//                   return (
//                     <span
//                       key={slug}
//                       className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
//                     >
//                       {cat?.name || slug}
//                       <button onClick={() => handleCategoryChange(slug)}>
//                         <X className="h-3 w-3" />
//                       </button>
//                     </span>
//                   )
//                 })}
//               </div>
//             )}
//           </div>

//           <div className="border-t border-gray-100 mb-6" />

//           {/* ✅ Brands — multi-select checkboxes */}
//           <div className="mb-6">
//             <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
//               Brands
//             </h4>
//             <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
//               {(optionsLoading || isLoading) ? (
//                 Array.from({ length: 5 }).map((_, i) => (
//                   <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
//                 ))
//               ) : brands.length > 0 ? (
//                 brands.map((brand: string, index: number) => {
//                   const checked = isBrandChecked(brand)
//                   return (
//                     <label
//                       key={`${brand}-${index}`}
//                       className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
//                         checked ? 'bg-blue-50' : 'hover:bg-gray-50'
//                       }`}
//                     >
//                       <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
//                         checked
//                           ? 'bg-blue-600 border-blue-600'
//                           : 'border-gray-300 bg-white'
//                       }`}>
//                         {checked && (
//                           <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
//                             <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                           </svg>
//                         )}
//                       </div>
//                       <input
//                         type="checkbox"
//                         className="sr-only"
//                         checked={checked}
//                         onChange={() => handleBrandChange(brand)}
//                       />
//                       <span className={`text-sm ${checked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
//                         {brand}
//                       </span>
//                     </label>
//                   )
//                 })
//               ) : (
//                 <p className="text-sm text-gray-500">No brands available</p>
//               )}
//             </div>

//             {/* Selected brand tags */}
//             {Array.isArray(filters.brand) && filters.brand.length > 0 && (
//               <div className="flex flex-wrap gap-1 mt-3">
//                 {filters.brand.map(b => (
//                   <span
//                     key={b}
//                     className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
//                   >
//                     {b}
//                     <button onClick={() => handleBrandChange(b)}>
//                       <X className="h-3 w-3" />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             )}
//           </div>

//           <div className="border-t border-gray-100 mb-6" />

//           {/* Price Range */}
//           <div className="mb-6">
//             <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
//               Price Range
//             </h4>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className="text-sm font-medium text-blue-600">
//                   {formatPrice(localPriceRange.min)}
//                 </span>
//                 <span className="text-sm font-medium text-blue-600">
//                   {formatPrice(localPriceRange.max)}
//                 </span>
//               </div>
//               <div className="relative h-2 bg-gray-200 rounded-full">
//                 <input
//                   type="range"
//                   min={priceRangeData?.minPrice || 0}
//                   max={priceRangeData?.maxPrice || 50000}
//                   step={(priceRangeData?.maxPrice || 50000) / 100}
//                   value={localPriceRange.min}
//                   onChange={(e) => {
//                     const newMin = parseInt(e.target.value)
//                     if (newMin < localPriceRange.max) {
//                       handlePriceChange(newMin, localPriceRange.max)
//                     }
//                   }}
//                   className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
//                 />
//                 <input
//                   type="range"
//                   min={priceRangeData?.minPrice || 0}
//                   max={priceRangeData?.maxPrice || 50000}
//                   step={(priceRangeData?.maxPrice || 50000) / 100}
//                   value={localPriceRange.max}
//                   onChange={(e) => {
//                     const newMax = parseInt(e.target.value)
//                     if (newMax > localPriceRange.min) {
//                       handlePriceChange(localPriceRange.min, newMax)
//                     }
//                   }}
//                   className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
//                 />
//                 <div 
//                   className="absolute h-full bg-blue-600 rounded-full"
//                   style={{ 
//                     left: `${(localPriceRange.min / (priceRangeData?.maxPrice || 50000)) * 100}%`,
//                     right: `${100 - (localPriceRange.max / (priceRangeData?.maxPrice || 50000)) * 100}%`
//                   }}
//                 />
//               </div>
//               {/* Manual input boxes for precision */}
//               <div className="flex gap-2">
//                 <input
//                   type="number"
//                   placeholder="Min"
//                   value={localPriceRange.min || ''}
//                   onChange={(e) => {
//                     const val = parseInt(e.target.value) || 0
//                     if (val < localPriceRange.max) handlePriceChange(val, localPriceRange.max)
//                   }}
//                   className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 />
//                 <span className="text-gray-400 self-center">–</span>
//                 <input
//                   type="number"
//                   placeholder="Max"
//                   value={localPriceRange.max || ''}
//                   onChange={(e) => {
//                     const val = parseInt(e.target.value) || 50000
//                     if (val > localPriceRange.min) handlePriceChange(localPriceRange.min, val)
//                   }}
//                   className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="border-t border-gray-100 mb-6" />

//           {/* ⛔ Rating Section — commented out for now
//           <div className="mb-6">
//             <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
//               Minimum Rating
//             </h4>
//             <div className="space-y-2">
//               <label className="flex items-center cursor-pointer group">
//                 <input
//                   type="radio"
//                   name="rating"
//                   checked={!filters.rating}
//                   onChange={() => handleRatingChange(0)}
//                   className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                 />
//                 <span className="ml-2 text-gray-700 group-hover:text-blue-600">
//                   Any Rating
//                 </span>
//               </label>
//               {[5, 4, 3, 2, 1].map((rating) => (
//                 <label key={rating} className="flex items-center cursor-pointer group">
//                   <input
//                     type="radio"
//                     name="rating"
//                     checked={filters.rating === rating}
//                     onChange={() => handleRatingChange(rating)}
//                     className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
//                   />
//                   <span className="ml-2 flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-4 w-4 ${
//                           i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                     <span className="ml-1 text-gray-700">& above</span>
//                   </span>
//                 </label>
//               ))}
//             </div>
//           </div>
//           */}

//           {/* Other Filters */}
//           <div className="space-y-3">
//             <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
//               More Filters
//             </h4>
//             <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
//               filters.featured ? 'bg-blue-50' : 'hover:bg-gray-50'
//             }`}>
//               <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
//                 filters.featured ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
//               }`}>
//                 {filters.featured && (
//                   <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
//                     <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 )}
//               </div>
//               <input type="checkbox" className="sr-only" checked={filters.featured || false} onChange={handleFeaturedChange} />
//               <span className={`text-sm ${filters.featured ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
//                 Featured Products
//               </span>
//             </label>

//             <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
//               filters.newArrivals ? 'bg-blue-50' : 'hover:bg-gray-50'
//             }`}>
//               <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
//                 filters.newArrivals ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
//               }`}>
//                 {filters.newArrivals && (
//                   <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
//                     <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 )}
//               </div>
//               <input type="checkbox" className="sr-only" checked={filters.newArrivals || false} onChange={handleNewArrivalsChange} />
//               <span className={`text-sm ${filters.newArrivals ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
//                 New Arrivals (Last 30 days)
//               </span>
//             </label>
//           </div>
//         </motion.div>
//       </div>
//     </>
//   )
// }

// export default ProductFilters

//above code is correct we just add the close sidebar button

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productService } from '../../services/productService'
import { useDebounce } from '../../hooks/useDebounce'

interface ProductFiltersProps {
  filters: {
    category?: string[]   // ✅ multi-select array
    brand?: string[]      // ✅ multi-select array
    minPrice?: number
    maxPrice?: number
    // rating?: number     // ⛔ commented out - not used for now
    featured?: boolean
    newArrivals?: boolean
    search?: string
  }
  onFilterChange: (filters: any) => void
  isLoading?: boolean
  onClose?: () => void  // ✅ NEW: Close callback
}

interface Category {
  _id?: string
  name: string
  slug?: string
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  filters, 
  onFilterChange,
  isLoading = false,
  onClose 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState({ min: 0, max: 50000 })
  
  const debouncedPriceRange = useDebounce(localPriceRange, 500)

  const { data: filterOptions, isLoading: optionsLoading } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: async () => {
      const result = await productService.getFilterOptions()
      return result
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

  const { categories, brands, priceRangeData } = useMemo(() => {
    const defaultData = { 
      categories: [], 
      brands: [], 
      priceRange: { minPrice: 0, maxPrice: 50000 } 
    }
    
    if (!filterOptions?.success) return defaultData
    
    const data = filterOptions.data || {}
    
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

  // Sync local price range with filters
  useEffect(() => {
    setLocalPriceRange({
      min: filters.minPrice !== undefined ? filters.minPrice : (priceRangeData?.minPrice || 0),
      max: filters.maxPrice !== undefined ? filters.maxPrice : (priceRangeData?.maxPrice || 50000),
    })
  }, [filters.minPrice, filters.maxPrice, priceRangeData])

  // Apply debounced price change
  useEffect(() => {
    if (debouncedPriceRange.min !== filters.minPrice || debouncedPriceRange.max !== filters.maxPrice) {
      onFilterChange({
        ...filters,
        minPrice: debouncedPriceRange.min,
        maxPrice: debouncedPriceRange.max,
      })
    }
  }, [debouncedPriceRange, filters, onFilterChange])

  // ✅ Multi-select: toggle category in/out of array
  const handleCategoryChange = useCallback((categorySlug: string) => {
    const current: string[] = Array.isArray(filters.category) ? filters.category : []
    const updated = current.includes(categorySlug)
      ? current.filter(c => c !== categorySlug)   // remove
      : [...current, categorySlug]                 // add
    onFilterChange({ ...filters, category: updated, page: 1 })
  }, [filters, onFilterChange])

  // ✅ Multi-select: toggle brand in/out of array
  const handleBrandChange = useCallback((brand: string) => {
    const current: string[] = Array.isArray(filters.brand) ? filters.brand : []
    const updated = current.includes(brand)
      ? current.filter(b => b !== brand)
      : [...current, brand]
    onFilterChange({ ...filters, brand: updated, page: 1 })
  }, [filters, onFilterChange])

  const handlePriceChange = useCallback((min: number, max: number) => {
    setLocalPriceRange({ min, max })
  }, [])

  const handleFeaturedChange = useCallback(() => {
    onFilterChange({ ...filters, featured: !filters.featured, page: 1 })
  }, [filters, onFilterChange])

  const handleNewArrivalsChange = useCallback(() => {
    onFilterChange({ ...filters, newArrivals: !filters.newArrivals, page: 1 })
  }, [filters, onFilterChange])

  const clearFilters = useCallback(() => {
    onFilterChange({
      category: [],
      brand: [],
      minPrice: undefined,
      maxPrice: undefined,
      // rating: undefined,   // ⛔ commented out
      featured: false,
      newArrivals: false,
      search: filters.search,
    })
    setLocalPriceRange({
      min: priceRangeData?.minPrice || 0,
      max: priceRangeData?.maxPrice || 50000,
    })
  }, [onFilterChange, priceRangeData, filters.search])

  const activeFilterCount = useMemo(() => {
    let count = 0
    const cats = Array.isArray(filters.category) ? filters.category : []
    const brands_ = Array.isArray(filters.brand) ? filters.brand : []
    if (cats.length > 0) count += cats.length
    if (brands_.length > 0) count += brands_.length
    if (filters.minPrice !== undefined) count++
    if (filters.maxPrice !== undefined) count++
    // if (filters.rating !== undefined && filters.rating !== 0) count++  // ⛔ commented out
    if (filters.featured) count++
    if (filters.newArrivals) count++
    if (filters.search && filters.search !== '') count++
    return count
  }, [filters])

  const formatPrice = useCallback((price: number): string => {
    if (price >= 10000000) return `PKR ${(price / 10000000).toFixed(1)} Cr`
    if (price >= 100000) return `PKR ${(price / 100000).toFixed(1)} L`
    if (price >= 1000) return `PKR ${(price / 1000).toFixed(1)}K`
    return `PKR ${price.toLocaleString()}`
  }, [])

  // Helpers for checked state
  const isCategoryChecked = (slug: string) => {
    const current = Array.isArray(filters.category) ? filters.category : []
    return current.includes(slug)
  }

  const isBrandChecked = (brand: string) => {
    const current = Array.isArray(filters.brand) ? filters.brand : []
    return current.includes(brand)
  }

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
          {/* Header with Close Button for Desktop */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear ({activeFilterCount})
                </button>
              )}
              {/* ✅ NEW: Close button for desktop */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="lg:hidden xl:flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                  title="Hide filters"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* ✅ Categories — multi-select checkboxes */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              Categories
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {(optionsLoading || isLoading) ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                ))
              ) : categories.length > 0 ? (
                categories.map((category) => {
                  const slug = category.slug || category.name
                  const checked = isCategoryChecked(slug)
                  return (
                    <label
                      key={slug}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {checked && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => handleCategoryChange(slug)}
                      />
                      <span className={`text-sm ${checked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                        {category.name}
                      </span>
                    </label>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">No categories available</p>
              )}
            </div>

            {/* Selected categories tags */}
            {Array.isArray(filters.category) && filters.category.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {filters.category.map(slug => {
                  const cat = categories.find(c => (c.slug || c.name) === slug)
                  return (
                    <span
                      key={slug}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {cat?.name || slug}
                      <button onClick={() => handleCategoryChange(slug)}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 mb-6" />

          {/* ✅ Brands — multi-select checkboxes */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              Brands
            </h4>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {(optionsLoading || isLoading) ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-5 bg-gray-200 rounded animate-pulse" />
                ))
              ) : brands.length > 0 ? (
                brands.map((brand: string, index: number) => {
                  const checked = isBrandChecked(brand)
                  return (
                    <label
                      key={`${brand}-${index}`}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        checked
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 bg-white'
                      }`}>
                        {checked && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => handleBrandChange(brand)}
                      />
                      <span className={`text-sm ${checked ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                        {brand}
                      </span>
                    </label>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">No brands available</p>
              )}
            </div>

            {/* Selected brand tags */}
            {Array.isArray(filters.brand) && filters.brand.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {filters.brand.map(b => (
                  <span
                    key={b}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {b}
                    <button onClick={() => handleBrandChange(b)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 mb-6" />

          {/* Price Range */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              Price Range
            </h4>
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
                  className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
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
                  className="absolute w-full h-2 opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute h-full bg-blue-600 rounded-full"
                  style={{ 
                    left: `${(localPriceRange.min / (priceRangeData?.maxPrice || 50000)) * 100}%`,
                    right: `${100 - (localPriceRange.max / (priceRangeData?.maxPrice || 50000)) * 100}%`
                  }}
                />
              </div>
              {/* Manual input boxes for precision */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={localPriceRange.min || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0
                    if (val < localPriceRange.max) handlePriceChange(val, localPriceRange.max)
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <span className="text-gray-400 self-center">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localPriceRange.max || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 50000
                    if (val > localPriceRange.min) handlePriceChange(localPriceRange.min, val)
                  }}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mb-6" />

          {/* Other Filters */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
              More Filters
            </h4>
            <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              filters.featured ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                filters.featured ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}>
                {filters.featured && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input type="checkbox" className="sr-only" checked={filters.featured || false} onChange={handleFeaturedChange} />
              <span className={`text-sm ${filters.featured ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                Featured Products
              </span>
            </label>

            <label className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              filters.newArrivals ? 'bg-blue-50' : 'hover:bg-gray-50'
            }`}>
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                filters.newArrivals ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
              }`}>
                {filters.newArrivals && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input type="checkbox" className="sr-only" checked={filters.newArrivals || false} onChange={handleNewArrivalsChange} />
              <span className={`text-sm ${filters.newArrivals ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
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
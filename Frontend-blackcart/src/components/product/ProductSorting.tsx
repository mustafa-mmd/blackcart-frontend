
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Grid, List, ArrowUp, ArrowDown } from 'lucide-react'

interface ProductSortingProps {
  sortBy: string
  sortOrder: 'asc' | 'desc'
  viewMode: 'grid' | 'list'
  onSortChange: (sort: string, order: 'asc' | 'desc') => void
  onViewChange: (view: 'grid' | 'list') => void
  totalProducts?: number
  showingProducts?: number
  isLoading?: boolean
}

const ProductSorting: React.FC<ProductSortingProps> = ({
  sortBy,
  sortOrder,
  viewMode,
  onSortChange,
  onViewChange,
  totalProducts = 0,
  showingProducts = 0,
  isLoading = false,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const sortOptions = useMemo(() => [
    { value: 'createdAt', label: 'Newest', defaultOrder: 'desc' as const },
    { value: 'price', label: 'Price', defaultOrder: 'asc' as const },
    { value: 'name', label: 'Name', defaultOrder: 'asc' as const },
    { value: 'rating', label: 'Rating', defaultOrder: 'desc' as const },
    { value: 'popularity', label: 'Popularity', defaultOrder: 'desc' as const },
    { value: 'soldCount', label: 'Best Selling', defaultOrder: 'desc' as const },
    { value: 'discountPercentage', label: 'Biggest Discount', defaultOrder: 'desc' as const },
  ], [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSortSelect = useCallback((option: string, defaultOrder: 'asc' | 'desc') => {
    if (option === sortBy) {
      // Toggle order if same option
      onSortChange(option, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Use default order for new option
      onSortChange(option, defaultOrder)
    }
    setIsSortOpen(false)
  }, [sortBy, sortOrder, onSortChange])

  const getCurrentSortLabel = useCallback(() => {
    const option = sortOptions.find(opt => opt.value === sortBy)
    if (!option) return 'Sort by'
    return option.label
  }, [sortBy, sortOrder, sortOptions])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border p-3 mb-4 sm:p-4"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Results Info */}
        <div className="text-sm text-gray-600">
          {isLoading ? (
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <>
              Showing <span className="font-semibold text-gray-900">{showingProducts}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalProducts}</span> products
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <span className="text-gray-700">
                Sort: <span className="text-blue-600 font-medium">{getCurrentSortLabel()}</span>
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                {sortOptions.map((option) => {
                  const isSelected = sortBy === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortSelect(option.value, option.defaultOrder)}
                      className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <span className="text-blue-600">
                          {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewChange('grid')}
              className={`p-2.5 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              disabled={isLoading}
              title="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={`p-2.5 transition-colors border-l border-gray-300 ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              disabled={isLoading}
              title="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProductSorting



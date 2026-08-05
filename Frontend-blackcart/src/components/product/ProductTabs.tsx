
import React, { useEffect, useRef } from 'react'
import { FileText, Grid, Star, Package, Shield, Truck, RefreshCw } from 'lucide-react'
import ReviewList from '../reviews/ReviewList'
import ProductSpecifications from './ProductSpecifications'
import type { Product, Review } from '../../types'

interface RatingStats {
  average: number
  total: number
  distribution: Record<number, number>
}

interface ProductTabsProps {
  activeTab: 'description' | 'specifications' | 'reviews' | 'shipping'
  onTabChange: (tab: 'description' | 'specifications' | 'reviews' | 'shipping') => void
  product: Product
  reviews: Review[]
  ratingStats?: RatingStats
  onReviewSubmit?: () => void
  onHelpfulClick?: (reviewId: string) => void // ✅ ADDED: New prop for helpful clicks
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  activeTab,
  onTabChange,
  product,
  reviews,
  ratingStats,
  onReviewSubmit,
  onHelpfulClick // ✅ ADDED: Destructure the new prop
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true })
  }, [activeTab])

  const tabClass = (tab: ProductTabsProps['activeTab']) =>
    `min-w-0 rounded-xl px-2 py-2.5 text-xs font-semibold transition-colors sm:px-3 sm:text-sm md:rounded-none md:border-b-2 md:px-1 md:py-4 md:text-base ${
      activeTab === tab
        ? 'bg-primary-50 text-primary-700 ring-1 ring-inset ring-primary-200 md:border-primary-500 md:bg-transparent md:ring-0'
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800 md:border-transparent md:hover:bg-transparent'
    }`

  return (
    <div id="product-details" className="mt-6 min-w-0 scroll-mt-24 md:mt-8">
      {/* Tab Headers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm md:rounded-none md:border-x-0 md:border-t-0 md:p-0 md:shadow-none">
        <nav className="grid grid-cols-4 gap-1 md:flex md:gap-8" role="tablist" aria-label="Product information">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'description'}
            aria-controls="product-tab-panel"
            onClick={() => onTabChange('description')}
            className={tabClass('description')}
          >
            <span className="flex flex-col items-center justify-center gap-1 md:flex-row md:gap-2">
              <FileText className="h-5 w-5" />
              <span>Description</span>
            </span>
          </button>
          
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'specifications'}
            aria-controls="product-tab-panel"
            onClick={() => onTabChange('specifications')}
            className={tabClass('specifications')}
          >
            <span className="flex flex-col items-center justify-center gap-1 md:flex-row md:gap-2">
              <Grid className="h-5 w-5" />
              <span className="md:hidden">Specs</span>
              <span className="hidden md:inline">Specifications</span>
            </span>
          </button>
          
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'reviews'}
            aria-controls="product-tab-panel"
            onClick={() => onTabChange('reviews')}
            className={tabClass('reviews')}
          >
            <span className="flex flex-col items-center justify-center gap-1 md:flex-row md:gap-2">
              <Star className="h-5 w-5" />
              <span>Reviews<span className="hidden sm:inline"> ({reviews.length})</span></span>
            </span>
          </button>
          
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'shipping'}
            aria-controls="product-tab-panel"
            onClick={() => onTabChange('shipping')}
            className={tabClass('shipping')}
          >
            <span className="flex flex-col items-center justify-center gap-1 md:flex-row md:gap-2">
              <Truck className="h-5 w-5" />
              <span className="md:hidden">Delivery</span>
              <span className="hidden md:inline">Shipping &amp; Returns</span>
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div ref={panelRef} id="product-tab-panel" className="py-5 outline-none md:py-8" role="tabpanel" tabIndex={-1}>
        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            <h3 className="mb-4 text-xl font-bold text-gray-900 md:mb-6 md:text-2xl">Product Description</h3>
            <div className="text-gray-600 space-y-4 mb-8">
              {product.description.split('\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            
            {product.features && product.features.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {product.tags && product.tags.length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag: string, index: number) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'specifications' && (
          <ProductSpecifications specifications={product.specifications || []} />
        )}
        
        {activeTab === 'reviews' && (
          <div>
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
            </div>
            <ReviewList
              reviews={reviews}
              ratingStats={ratingStats}
              onWriteReview={onReviewSubmit}
              onHelpfulClick={onHelpfulClick} // ✅ ADDED: Pass the prop to ReviewList
            />
          </div>
        )}
        
        {activeTab === 'shipping' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="h-8 w-8 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Delivery</h4>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Normal delivery: PKR 200, 4-6 working days</li>
                    <li>• Express delivery: PKR 350, 2-3 working days</li>
                    <li>• Cash on Delivery available</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="h-8 w-8 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Packaging</h4>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Secure packaging for all items</li>
                    <li>• Waterproof packaging for electronics</li>
                    <li>• Fragile items specially marked</li>
                    <li>• Eco-friendly materials when possible</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-8 w-8 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Warranty</h4>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 1-year manufacturer warranty</li>
                    <li>• Warranty registration required</li>
                    <li>• Support for warranty claims</li>
                    <li>• Extended warranty available</li>
                  </ul>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <RefreshCw className="h-8 w-8 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">Returns</h4>
                  </div>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 3-day return policy for eligible products</li>
                    <li>• Products must be unused</li>
                    <li>• Original packaging required</li>
                    <li>• Free returns for defective items</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs

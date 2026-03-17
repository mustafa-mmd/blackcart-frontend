
import React from 'react'
import { FileText, Grid, Star, Package, Shield, Truck, RefreshCw } from 'lucide-react'
import ReviewList from '../reviews/ReviewList'
import ProductSpecifications from './ProductSpecifications'

interface ProductTabsProps {
  activeTab: 'description' | 'specifications' | 'reviews' | 'shipping'
  onTabChange: (tab: 'description' | 'specifications' | 'reviews' | 'shipping') => void
  product: any
  reviews: any[]
  ratingStats?: any
  onReviewSubmit: () => void
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
  return (
    <div className="mt-12">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex space-x-8 min-w-max">
          <button
            onClick={() => onTabChange('description')}
            className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'description'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="h-5 w-5" />
            Description
          </button>
          
          <button
            onClick={() => onTabChange('specifications')}
            className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'specifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Grid className="h-5 w-5" />
            Specifications
          </button>
          
          <button
            onClick={() => onTabChange('reviews')}
            className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Star className="h-5 w-5" />
            Reviews ({reviews.length})
          </button>
          
          <button
            onClick={() => onTabChange('shipping')}
            className={`py-4 px-1 border-b-2 font-medium flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck className="h-5 w-5" />
            Shipping & Returns
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="prose prose-gray max-w-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
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
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Specifications</h3>
            <ProductSpecifications specifications={product.specifications || []} />
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
              <button
                onClick={onReviewSubmit}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Write a Review
              </button>
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
                    <li>• Free delivery on orders over PKR 5,000</li>
                    <li>• Standard delivery: 3-7 business days</li>
                    <li>• Express delivery: 1-2 business days</li>
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
                    <li>• 14-day return policy</li>
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


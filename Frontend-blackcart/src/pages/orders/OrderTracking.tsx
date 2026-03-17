
// src/components/orders/OrderTracking.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react'

interface OrderTrackingProps {
  orderStatus: string
  trackingNumber?: string
  shippingCarrier?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt: string
  onContactSupport?: () => void
  onViewFAQ?: () => void
  onUpdateAddress?: () => void
}

const OrderTracking: React.FC<OrderTrackingProps> = ({
  orderStatus,
  trackingNumber,
  shippingCarrier,
  estimatedDelivery,
  createdAt,
  updatedAt,
  onContactSupport,
  onViewFAQ,
  onUpdateAddress,
}) => {
  const steps = [
    { 
      status: 'pending', 
      label: 'Order Placed', 
      icon: Clock,
      description: 'Your order has been received'
    },
    { 
      status: 'processing', 
      label: 'Processing', 
      icon: Package,
      description: 'We\'re preparing your order'
    },
    { 
      status: 'shipped', 
      label: 'Shipped', 
      icon: Truck,
      description: 'Your order is on the way'
    },
    { 
      status: 'delivered', 
      label: 'Delivered', 
      icon: CheckCircle,
      description: 'Your order has been delivered'
    },
  ]

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered']
  const currentIndex = statusOrder.indexOf(orderStatus)
  const isDelivered = orderStatus === 'delivered'

  const getTrackingUrl = () => {
    if (!trackingNumber || !shippingCarrier) return null
    
    // Generate tracking URL based on carrier
    const carrierUrls: Record<string, string> = {
      'TCS': `https://www.tcsexpress.com/tracking/${trackingNumber}`,
      'Leopards': `https://www.leopardscourier.com/tracking/${trackingNumber}`,
      'M&P': `https://www.mnp.com.pk/tracking/${trackingNumber}`,
      'BlueEX': `https://www.blueex.com/tracking/${trackingNumber}`,
      'DHL': `https://www.dhl.com.pk/tracking/${trackingNumber}`,
      'FedEx': `https://www.fedex.com/tracking/${trackingNumber}`,
    }
    
    return carrierUrls[shippingCarrier] || null
  }

  const trackingUrl = getTrackingUrl()

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Order Tracking</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          orderStatus === 'delivered'
            ? 'bg-green-100 text-green-800'
            : orderStatus === 'shipped'
            ? 'bg-blue-100 text-blue-800'
            : orderStatus === 'processing'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200">
          <div 
            className="h-full bg-primary-600 transition-all duration-500"
            style={{ 
              width: isDelivered ? '100%' : `${(currentIndex + 1) * 33}%`,
              transition: 'width 1s ease-in-out'
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon
            const isCompleted = index <= currentIndex
            const isCurrent = index === currentIndex
            
            return (
              <motion.div
                key={step.status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 z-10 transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-600'
                } ${isCurrent ? 'scale-110' : ''}`}>
                  <StepIcon className="h-6 w-6" />
                </div>
                <span className={`text-sm font-medium transition-colors ${
                  isCompleted ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                <span className="text-xs text-gray-500 mt-1 text-center max-w-[100px]">
                  {isCurrent && step.description}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Tracking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Order Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Clock className="h-5 w-5 text-gray-400 mr-2" />
              <h4 className="font-medium text-gray-900">Order Timeline</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Order Placed</span>
                <span className="font-medium">{new Date(createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">{new Date(updatedAt).toLocaleDateString()}</span>
              </div>
              {estimatedDelivery && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <span className="font-medium">{new Date(estimatedDelivery).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Info */}
          {trackingNumber && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <MapPin className="h-5 w-5 text-blue-400 mr-2" />
                <h4 className="font-medium text-blue-900">Tracking Information</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-blue-700">Tracking Number</p>
                  <p className="font-mono font-bold text-blue-900">{trackingNumber}</p>
                </div>
                {shippingCarrier && (
                  <div>
                    <p className="text-sm text-blue-700">Carrier</p>
                    <p className="font-medium text-blue-900">{shippingCarrier}</p>
                  </div>
                )}
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium inline-block"
                  >
                    View Detailed Tracking →
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Progress */}
        {!isDelivered && estimatedDelivery && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Delivery Progress</h4>
              <span className="text-sm text-blue-700">
                {Math.min(currentIndex * 33 + 33, 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(currentIndex * 33 + 33, 100)}%` }}
              />
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Estimated delivery: {new Date(estimatedDelivery).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onContactSupport}
            className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
          >
            Contact Support
          </button>
          <button
            onClick={onViewFAQ}
            className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
          >
            Shipping FAQ
          </button>
          <button
            onClick={onUpdateAddress}
            className="flex-1 text-center py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
          >
            Update Address
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
// src/pages/payment/PaymentSuccess.tsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, Truck, Mail, Home, ShoppingBag, Download, Share2 } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { formatDate } from '../../utils/dateFormatter'
import { formatPrice } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'

const PaymentSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getOrderById } = useOrders()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const paymentMethod = searchParams.get('method') || 'online'
  const transactionId = searchParams.get('transactionId') || ''

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orderData = await getOrderById(orderId!)
      setOrder(orderData)
    } catch (error) {
      console.error('Failed to load order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Payment Successful!',
        text: `I just completed my payment for order ${order.invoiceNumber}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleDownloadInvoice = () => {
    // Implement invoice download logic
    toast.success('Invoice download started!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment confirmation...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find your order details.</p>
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-700"
          >
            View Orders
          </button>
        </div>
      </div>
    )
  }

  const estimatedDelivery = order.estimatedDelivery || 
    new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Hero */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <CheckCircle className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Thank you for your order. Your payment has been confirmed and your order is being processed.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Confirmation</h2>
                <p className="text-gray-600 mt-1">
                  Order #{order.invoiceNumber || order._id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Invoice
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success Message */}
            <div className="flex items-start mb-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Confirmed</h3>
                <p className="text-gray-600">
                  Your payment of {formatPrice(order.totalPrice)} via {paymentMethod} has been successfully processed.
                  {transactionId && (
                    <span className="block mt-1">
                      Transaction ID: <span className="font-medium">{transactionId}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">Order Processing</h4>
                    <p className="text-gray-600 text-sm">
                      We're preparing your items for shipment. This usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Truck className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">Shipment</h4>
                    <p className="text-gray-600 text-sm">
                      Your order will be shipped via {order.shippingMethod || 'Normal Delivery'}.
                      Estimated delivery: {formatDate(estimatedDelivery, 'long')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-medium text-gray-900">Email Confirmation</h4>
                    <p className="text-gray-600 text-sm">
                      We've sent a confirmation email with all order details to your registered email address.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Shipping Address</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{order.shippingAddress.fullName}</p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                    <p className="text-sm text-gray-600">
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">{order.shippingAddress.country}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Phone: {order.shippingAddress.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Payment Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Items Total:</span>
                        <span>{formatPrice(order.itemsPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span>{formatPrice(order.shippingPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span>{formatPrice(order.taxPrice)}</span>
                      </div>
                      {order.coupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({order.coupon.code}):</span>
                          <span>-{formatPrice(order.coupon.discount)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total Paid:</span>
                          <span>{formatPrice(order.totalPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <Home className="h-5 w-5" />
            Continue Shopping
          </button>
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            View Order Details
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <div>
              <p className="text-gray-600 mb-1">Email Support</p>
              <a
                href="mailto:blackcart.ak25@gmail.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                blackcart.ak25@gmail.com
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Phone Support</p>
              <a
                href="tel:+9242111222333"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                +92 3146965599
              </a>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Live Chat</p>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                Available 24/7
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess

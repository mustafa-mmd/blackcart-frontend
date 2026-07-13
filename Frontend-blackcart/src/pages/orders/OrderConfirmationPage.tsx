// src/pages/orders/OrderConfirmationPage.tsx
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, Truck, Home, Printer, Download, Share2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../../services/orderService'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

// ✅ FIXED: Data URI fallback (no external dependency)
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\'%3E%3Crect width=\'80\' height=\'80\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\' fill=\'%23999\'%3ENo Image%3C/text%3E%3C/svg%3E'

const OrderConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  })

  const order = orderData?.data

  useEffect(() => {
    if (error) {
      toast.error('Failed to load order details')
      navigate('/')
    }
  }, [error, navigate])

  const handlePrintInvoice = () => {
    window.print()
  }

  const handleDownloadInvoice = async () => {
    try {
      toast.loading('Preparing invoice...', { id: 'invoice-download' })
      
      const response = await orderService.getInvoice(id!)
      const invoiceData = response.data
      
      // Create formatted HTML invoice
      const html = generateInvoiceHTML(order, invoiceData)
      
      // Create download
      const blob = new Blob([html], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${order?.invoiceNumber}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Invoice downloaded successfully', { id: 'invoice-download' })
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download invoice', { id: 'invoice-download' })
    }
  }

  const generateInvoiceHTML = (order: any, invoiceData: any) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order?.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .company-details, .customer-details { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: #f3f4f6; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .totals { text-align: right; margin-top: 30px; }
          .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
          .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>INVOICE</h1>
            <p>${order?.invoiceNumber}</p>
          </div>
          <div>
            <p>Date: ${new Date(order?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="company-details">
          <h3>Seller:</h3>
          <p><strong>BlackCart.store</strong></p>
          <p>Islamia Town Street# 3rd</p>
          <p>Peshawar, Khyber Pakhtunkhwa, Pakistan</p>
          <p>Email: blackcart.ak25@gmail.com</p>
          <p>Phone: +92 3146965599</p>
        </div>
        
        <div class="customer-details">
          <h3>Bill To:</h3>
          <p><strong>${order?.shippingAddress?.fullName || 'Customer'}</strong></p>
          <p>${order?.shippingAddress?.address || ''}</p>
          <p>${order?.shippingAddress?.city || ''}, ${order?.shippingAddress?.postalCode || ''}</p>
          <p>${order?.shippingAddress?.country || 'Pakistan'}</p>
          <p>Phone: ${order?.shippingAddress?.phone || ''}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order?.orderItems?.map((item: any) => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>PKR ${item.price?.toLocaleString()}</td>
                <td>PKR ${(item.price * item.quantity)?.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: PKR ${order?.itemsPrice?.toLocaleString()}</p>
          <p>Shipping: PKR ${order?.shippingPrice?.toLocaleString()}</p>
          <p>Tax (16% GST): PKR ${order?.taxPrice?.toLocaleString()}</p>
          ${order?.codCharges ? `<p>COD Charges: PKR ${order?.codCharges?.toLocaleString()}</p>` : ''}
          <p class="total-row">Total: PKR ${order?.totalPrice?.toLocaleString()}</p>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Payment Status: ${order?.isPaid ? 'Paid' : 'Pending'}</p>
          <p>Payment Method: ${order?.paymentMethod?.toUpperCase()}</p>
        </div>
      </body>
      </html>
    `
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Order ${order?.invoiceNumber}`,
        text: `Check out my order from BlackCart.store`,
        url: window.location.href,
      }).catch(() => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard')
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  const steps = [
    { status: 'pending', label: 'Order Placed', icon: Package },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: Home },
  ]

  const currentStepIndex = steps.findIndex(step => step.status === order.orderStatus)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-lg section-padding">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your order was placed successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for shopping with BlackCart.store. We have received your order.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handlePrintInvoice}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Invoice
            </button>
            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Return Home
            </button>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Tracking */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                  <div 
                    className="h-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${(currentStepIndex + 1) * 33}%` }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon
                    const isCompleted = index <= currentStepIndex
                    const isCurrent = index === currentStepIndex
                    
                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 z-10 ${
                          isCompleted
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          <StepIcon className="h-6 w-6" />
                        </div>
                        <span className={`text-sm font-medium ${
                          isCompleted ? 'text-primary-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                        {isCurrent && order.orderStatus !== 'delivered' && (
                          <span className="text-xs text-gray-500 mt-1">
                            Estimated: {order.estimatedDelivery 
                              ? new Date(order.estimatedDelivery).toLocaleDateString()
                              : 'Soon'
                            }
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Current Status */}
              <div className={`mt-6 p-4 rounded-lg ${statusColors[order.orderStatus]}`}>
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  <span className="font-medium capitalize">{order.orderStatus}</span>
                </div>
                {order.trackingNumber && (
                  <div className="mt-2">
                    <p className="text-sm">Tracking Number: {order.trackingNumber}</p>
                    <p className="text-sm">Carrier: {order.shippingCarrier || 'Standard Shipping'}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems?.map((item: any) => (
                  <div key={item._id} className="flex items-center border-b pb-4">
                    <img
                      src={item.image || FALLBACK_IMAGE}
                      alt={item.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg mr-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">PKR {(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">PKR {item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shipping & Payment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Shipping Address */}
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
                <div className="space-y-2 text-gray-600">
                  <p>{order.shippingAddress?.fullName}</p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                  </p>
                  <p>{order.shippingAddress?.country}</p>
                  <p>📞 {order.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Pending'}
                    </span>
                  </div>
                  {order.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paid On:</span>
                      <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="font-mono">{order.invoiceNumber}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">{order.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span>{order.orderItems?.length}</span>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>PKR {order.itemsPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span>PKR {order.shippingPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span>PKR {order.taxPrice?.toLocaleString()}</span>
                </div>
                {order.codCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">COD Charges:</span>
                    <span>PKR {order.codCharges.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>PKR {order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => navigate(`/orders/${order._id}/invoice`)}
                  className="w-full flex items-center justify-center py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Invoice
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied to clipboard')
                  }}
                  className="w-full flex items-center justify-center py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Order
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage

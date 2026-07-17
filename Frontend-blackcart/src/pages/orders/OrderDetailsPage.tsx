// src/pages/orders/OrderDetailsPage.tsx
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package, Truck, CheckCircle, Clock, MapPin, CreditCard,
  Printer, Download, Share2, AlertCircle, ArrowLeft,
  DollarSign, XCircle, FileText, ShoppingBag
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService } from '../../services/orderService'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

// ✅ FIXED: Data URI fallback (no external dependency)
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\'%3E%3Crect width=\'80\' height=\'80\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\' fill=\'%23999\'%3ENo Image%3C/text%3E%3C/svg%3E'

// Helper function to download invoice
const downloadInvoice = async (orderId: string, invoiceNumber: string) => {
  try {
    toast.loading('Generating invoice...', { id: 'invoice-download' })
    
    // Try to get invoice data
    const response = await orderService.getInvoice(orderId)
    const invoiceData = response.data
    
    // Format invoice for display/download
    const invoiceHTML = generateInvoiceHTML(invoiceData)
    
    // Create blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${invoiceNumber}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('Invoice downloaded successfully', { id: 'invoice-download' })
  } catch (error) {
    console.error('Download error:', error)
    toast.error('Failed to download invoice', { id: 'invoice-download' })
    
    // Fallback: Create a simple invoice with available data
    createFallbackInvoice(orderId, invoiceNumber)
  }
}

// Fallback invoice generator
const createFallbackInvoice = (orderId: string, invoiceNumber: string) => {
  const fallbackHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .invoice-header { text-align: center; margin-bottom: 40px; }
        .company-details { margin-bottom: 30px; }
        .invoice-details { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .totals { text-align: right; margin-top: 30px; }
        .total-row { font-size: 18px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <h1>INVOICE</h1>
        <h2>${invoiceNumber}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="company-details">
        <h3>BlackCart.store</h3>
        <p>Islamia Town Street# 3rd</p>
        <p>Peshawar, Khyber Pakhtunkhwa, Pakistan</p>
        <p>Email: blackcart.ak25@gmail.com</p>
        <p>Phone: +92 3146965599</p>
      </div>
      <div class="invoice-details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
      </div>
      <p><em>Full invoice details could not be loaded. Please check your order in the dashboard.</em></p>
      <div class="totals">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `
  
  const blob = new Blob([fallbackHTML], { type: 'text/html' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${invoiceNumber}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// Generate HTML invoice from data - TAX REMOVED
const generateInvoiceHTML = (invoiceData: any) => {
  // Handle both possible data structures
  const data = invoiceData.data || invoiceData
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice ${data.invoiceNumber || ''}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .company-details, .customer-details { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th { background: #f3f4f6; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .item-color { margin-top: 4px; color: #6b7280; font-size: 12px; }
        .totals { text-align: right; margin-top: 30px; }
        .total-row { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; }
        .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>INVOICE</h1>
          <p>${data.invoiceNumber || 'N/A'}</p>
        </div>
        <div>
          <p>Date: ${data.issueDate ? new Date(data.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
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
        <p><strong>${data.billingAddress?.fullName || data.shippingAddress?.fullName || 'Customer'}</strong></p>
        <p>${data.billingAddress?.address || data.shippingAddress?.address || ''}</p>
        <p>${data.billingAddress?.city || data.shippingAddress?.city || ''}, ${data.billingAddress?.postalCode || data.shippingAddress?.postalCode || ''}</p>
        <p>${data.billingAddress?.country || data.shippingAddress?.country || 'Pakistan'}</p>
        <p>Phone: ${data.billingAddress?.phone || data.shippingAddress?.phone || ''}</p>
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
          ${(data.items || data.orderItems || []).map((item: any) => `
            <tr>
              <td>
                <div>${item.description || item.name}</div>
                ${item.selectedColor?.name ? `<div class="item-color">Color: ${item.selectedColor.name}</div>` : ''}
              </td>
              <td>${item.quantity}</td>
              <td>PKR ${(item.unitPrice || item.price)?.toLocaleString()}</td>
              <td>PKR ${(item.amount || (item.price * item.quantity))?.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <p>Subtotal: PKR ${(data.subtotal || data.itemsPrice)?.toLocaleString()}</p>
        <p>Shipping: PKR ${(data.shippingAmount || data.shippingPrice)?.toLocaleString()}</p>
        ${data.discountAmount ? `<p>Discount: -PKR ${data.discountAmount.toLocaleString()}</p>` : ''}
        <p class="total-row">Total: PKR ${(data.totalAmount || data.totalPrice)?.toLocaleString()}</p>
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
        <p>Payment Status: ${data.paymentStatus || (data.isPaid ? 'Paid' : 'Pending')}</p>
        <p>Payment Method: ${data.paymentMethod?.toUpperCase() || 'N/A'}</p>
      </div>
    </body>
    </html>
  `
}

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundReason, setRefundReason] = useState('')

  const { data: orderData, isLoading, error } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  })

  const order = orderData?.data

  const refundOrderMutation = useMutation({
    mutationFn: (reason: string) => orderService.requestRefund(id!, { reason }),
    onSuccess: () => {
      toast.success('Refund request submitted')
      setShowRefundModal(false)
      setRefundReason('')
      queryClient.invalidateQueries({ queryKey: ['order', id] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to request refund')
    },
  })

  const handleRequestRefund = () => {
    if (!refundReason.trim()) {
      toast.error('Please provide a reason for refund')
      return
    }
    refundOrderMutation.mutate(refundReason)
  }

  const statusSteps = [
    { status: 'pending', label: 'Order Placed', icon: Clock },
    { status: 'processing', label: 'Processing', icon: Package },
    { status: 'shipped', label: 'Shipped', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  ]

  const currentStepIndex = order ? statusSteps.findIndex(step => step.status === order.orderStatus) : -1

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
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

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-gray-600 hover:text-primary-600 mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Order #{order.invoiceNumber || order._id.slice(-8).toUpperCase()}
                </h1>
                <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </button>
                <button
                  onClick={() => downloadInvoice(order._id, order.invoiceNumber)}
                  className="flex items-center px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Invoice
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Link copied to clipboard')
                  }}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Status & Tracking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status & Tracking</h2>
                
                {/* Progress Bar */}
                <div className="relative mb-8">
                  <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200">
                    <div 
                      className="h-full bg-primary-600 transition-all duration-500"
                      style={{ width: `${(currentStepIndex + 1) * 25}%` }}
                    />
                  </div>

                  <div className="relative flex justify-between">
                    {statusSteps.map((step, index) => {
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
                          {isCurrent && order.orderStatus !== 'delivered' && order.estimatedDelivery && (
                            <span className="text-xs text-gray-500 mt-1">
                              Est: {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Truck className="h-5 w-5 text-blue-600 mr-2" />
                      <h3 className="font-medium text-blue-800">Tracking Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tracking Number</p>
                        <p className="font-medium">{order.trackingNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Carrier</p>
                        <p className="font-medium">{order.shippingCarrier || 'Standard Shipping'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
                <div className="space-y-6">
                  {order.orderItems?.map((item: any) => (
                    <div key={item._id} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden mr-4 flex-shrink-0">
                          <img
                            src={item.image || FALLBACK_IMAGE}
                            alt={item.name || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_IMAGE
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">SKU: {item.sku}</p>
                          {item.selectedColor && <p className="mb-2 flex items-center gap-2 text-sm text-gray-600"><span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: item.selectedColor.value }} />Color: {item.selectedColor.name}</p>}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </div>
                            <div className="text-right">
                              <div className="font-bold">PKR {(item.price * item.quantity).toLocaleString()}</div>
                              <div className="text-sm text-gray-600">PKR {item.price.toLocaleString()} each</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Order Summary - TAX REMOVED */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order Number</p>
                      <p className="font-medium">{order.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>PKR {order.itemsPrice?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{order.shippingMethod === 'express' ? 'Express delivery' : 'Normal delivery'}</span>
                      <span>
                        {order.shippingPrice === 0 ? 'FREE' : `PKR ${order.shippingPrice?.toLocaleString()}`}
                      </span>
                    </div>
                    {order.coupon && order.coupon.discount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Discount ({order.coupon.code})</span>
                        <span>-PKR {order.coupon.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {order.deliveryEstimate && <p className="text-xs text-gray-500">Estimated delivery: {order.deliveryEstimate}</p>}
                    {/* TAX SECTION COMPLETELY REMOVED */}
                    {order.codCharges > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">COD Charges</span>
                        <span>PKR {order.codCharges.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>PKR {order.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Shipping & Payment */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping & Payment</h2>
                
                {/* Shipping Address */}
                <div className="mb-6">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="font-medium text-gray-900">Shipping Address</h3>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium">{order.shippingAddress?.fullName}</p>
                    <p className="text-gray-600">{order.shippingAddress?.address}</p>
                    <p className="text-gray-600">
                      {order.shippingAddress?.city}, {order.shippingAddress?.country}
                    </p>
                    <p className="text-gray-600">📞 {order.shippingAddress?.phone}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <div className="flex items-center mb-3">
                    <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="font-medium text-gray-900">Payment Information</h3>
                  </div>
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
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Actions</h2>
                <div className="space-y-3">
                  {order.isRefundable && (
                    <button
                      onClick={() => setShowRefundModal(true)}
                      className="w-full flex items-center justify-center py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Request Refund
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/orders/${order._id}/invoice`)}
                    className="w-full flex items-center justify-center py-3 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    View Invoice
                  </button>
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full flex items-center justify-center py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Shop Again
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Request Refund</h3>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  Please provide a reason for your refund request. Our team will review it within 3-5 business days.
                </p>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestRefund}
                  disabled={refundOrderMutation.isPending}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {refundOrderMutation.isPending ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
  )
}

export default OrderDetailsPage

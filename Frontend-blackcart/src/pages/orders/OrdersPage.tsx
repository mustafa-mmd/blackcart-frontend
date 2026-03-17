
// src/pages/orders/OrdersPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Package, Truck, CheckCircle, XCircle, Clock,
  Filter, AlertCircle, CreditCard, ArrowRight
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../../services/orderService'
import Loader from '../../components/common/Loader'
import Pagination from '../../components/common/Pagination'
import PrivateRoute from '../../components/common/PrivateRoute'
import toast from 'react-hot-toast'

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='12' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"

// =============================================================================
// HOW THE FIX WORKS — end to end
//
// 1. User picks an online payment method and clicks "Pay PKR X"
// 2. CheckoutPage.handlePaymentInitiate() calls createOrder API
// 3. Backend createOrder() now saves orderStatus: 'pending_payment'
//    (instead of 'pending') for all online payment methods
// 4. Payment gateway is contacted. If payment succeeds:
//    → paymentController.confirmPayment() sets orderStatus: 'processing'
//    → order now appears in the main "Active Orders" list
// 5. If payment fails or is abandoned:
//    → order stays as 'pending_payment' forever (or until auto-expired)
//    → it does NOT appear in the active/all orders list
//    → it appears here in the UNPAID ORDERS banner with a
//      "Complete Payment" button
//
// getMyOrders backend now:
//   status='active'          → excludes pending_payment
//   status='pending_payment' → only pending_payment orders (for banner)
//   status='all'             → excludes pending_payment
// =============================================================================

const OrdersPage: React.FC = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('active')
  const limit = 10

  // ── Confirmed/normal orders ────────────────────────────────────────────────
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['userOrders', page, statusFilter],
    queryFn: () => orderService.getMyOrders({ page, limit, status: statusFilter }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  // ── Unpaid orders (pending_payment) — shown in separate banner ────────────
  const { data: unpaidData, refetch: refetchUnpaid } = useQuery({
    queryKey: ['unpaidOrders'],
    queryFn: () => orderService.getMyOrders({ page: 1, limit: 10, status: 'pending_payment' }),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

  const orders       = ordersData?.data?.orders || []
  const unpaidOrders = unpaidData?.data?.orders || []
  const pagination   = ordersData?.data?.pagination

  const statusIcons: Record<string, any> = {
    pending:         Clock,
    processing:      Package,
    shipped:         Truck,
    delivered:       CheckCircle,
    cancelled:       XCircle,
    pending_payment: CreditCard,
  }

  const statusColors: Record<string, string> = {
    pending:         'bg-yellow-100 text-yellow-800',
    processing:      'bg-blue-100   text-blue-800',
    shipped:         'bg-purple-100 text-purple-800',
    delivered:       'bg-green-100  text-green-800',
    cancelled:       'bg-red-100    text-red-800',
    pending_payment: 'bg-orange-100 text-orange-800',
  }

  const handleStatusChange = (status: string) => {
    setStatusFilter(status)
    setPage(1)
    setTimeout(() => refetch(), 0)
  }

  const handleCancelUnpaid = async (orderId: string) => {
    if (!window.confirm('Cancel this unpaid order? Stock will be restored.')) return
    try {
      await orderService.cancelOrder(orderId)
      toast.success('Unpaid order cancelled and stock restored.')
      refetchUnpaid()
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">View and manage your orders</p>
          </div>

          {/* ── UNPAID ORDERS BANNER ─────────────────────────────────────────
              These orders exist because the user clicked "Pay PKR X",
              which created the order (status: pending_payment), but they
              did NOT complete the payment gateway step.
              They are intentionally excluded from the main list below.
          ──────────────────────────────────────────────────────────────────── */}
          {unpaidOrders.length > 0 && (
            <div className="mb-8">
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm font-medium text-orange-800">
                  You have {unpaidOrders.length} order{unpaidOrders.length > 1 ? 's' : ''} waiting for payment.
                  Complete payment to confirm your order, or cancel if you changed your mind.
                </p>
              </div>

              <div className="space-y-3">
                {unpaidOrders.map((order: any) => (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-5 border-l-4 border-orange-400"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
                            <CreditCard className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-sm">
                              Order #{order.invoiceNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-xs text-gray-500">
                              Created {new Date(order.createdAt).toLocaleDateString()} •{' '}
                              {order.orderItems?.length} item{order.orderItems?.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <span className="ml-auto px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                            Payment Pending
                          </span>
                        </div>

                        {/* Item thumbnails */}
                        <div className="flex gap-2 mb-3">
                          {order.orderItems?.slice(0, 5).map((item: any, idx: number) => (
                            <img
                              key={idx}
                              src={item.image || FALLBACK_IMAGE}
                              alt={item.name}
                              className="w-11 h-11 object-cover rounded-lg border border-gray-200"
                              onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                            />
                          ))}
                          {order.orderItems?.length > 5 && (
                            <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-500 font-medium">
                              +{order.orderItems.length - 5}
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-700">
                          Total: <span className="font-bold">PKR {order.totalPrice?.toLocaleString()}</span>
                          {' · '}
                          Method: <span className="capitalize font-medium">{order.paymentMethod?.replace('_', ' ')}</span>
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 min-w-[160px]">
                        <button
                          onClick={() => navigate(`/checkout?resumeOrder=${order._id}&method=${order.paymentMethod}`)}
                          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          <CreditCard className="h-4 w-4" />
                          Complete Payment
                          <ArrowRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCancelUnpaid(order._id)}
                          className="w-full px-4 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel Order
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── Filter bar ───────────────────────────────────────────────── */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-5 w-5 text-gray-500 flex-shrink-0" />
                {[
                  { key: 'active',     label: 'Active Orders' },
                  { key: 'pending',    label: 'Pending' },
                  { key: 'processing', label: 'Processing' },
                  { key: 'shipped',    label: 'Shipped' },
                  { key: 'delivered',  label: 'Delivered' },
                  { key: 'cancelled',  label: 'Cancelled' },
                  { key: 'all',        label: 'All Orders' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => handleStatusChange(f.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === f.key
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500 flex-shrink-0">
                {pagination?.total || 0} orders
              </span>
            </div>
          </div>

          {statusFilter === 'active' && (
            <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <p className="text-sm text-blue-700">
                Showing confirmed orders (pending → processing → shipped).
                Unpaid orders appear in the banner above.
              </p>
            </div>
          )}

          {/* ── Confirmed orders list ─────────────────────────────────────── */}
          {orders.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Package className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-600 mb-6">
                {statusFilter === 'active'
                  ? "You don't have any active confirmed orders."
                  : statusFilter === 'all'
                  ? "You haven't placed any orders yet."
                  : `No ${statusFilter} orders found.`}
              </p>
              <button onClick={() => navigate('/products')} className="btn-primary">
                Start Shopping
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {orders.map((order: any) => {
                const StatusIcon = statusIcons[order.orderStatus] || Package

                return (
                  <motion.div
                    key={order._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <div className={`p-2 rounded-lg mr-3 ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              Order #{order.invoiceNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems?.length} items
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-bold text-lg">PKR {order.totalPrice?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment</p>
                            <p className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.isPaid ? 'Paid' : order.paymentMethod === 'cod' ? 'Pay on Delivery' : 'Awaiting confirmation'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Shipping To</p>
                            <p className="font-medium truncate">{order.shippingAddress?.city}</p>
                            <p className="text-sm text-gray-600">{order.shippingAddress?.fullName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 md:ml-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[order.orderStatus] || 'bg-gray-100 text-gray-700'
                        }`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Item thumbnails */}
                    <div className="mt-4 flex overflow-x-auto space-x-3 pb-2">
                      {order.orderItems?.slice(0, 4).map((item: any) => (
                        <div key={item._id} className="flex-shrink-0">
                          <img
                            src={item.image || FALLBACK_IMAGE}
                            alt={item.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={e => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE }}
                          />
                        </div>
                      ))}
                      {order.orderItems?.length > 4 && (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 font-medium text-sm">+{order.orderItems.length - 4}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/orders/${order._id}`) }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                      >
                        View Details
                      </button>
                      {order.isCancellable && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            if (window.confirm('Are you sure you want to cancel this order?')) {
                              orderService.cancelOrder(order._id)
                                .then(() => { toast.success('Order cancelled'); refetch() })
                                .catch(err => toast.error(err.message))
                            }
                          }}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {pagination && pagination.pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.pages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PrivateRoute>
  )
}

export default OrdersPage
// src/pages/dashboard/DashboardPage.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { 
  Package, ShoppingBag, TrendingUp, DollarSign, 
  Clock, Award, User, BarChart, ArrowUpRight,
  Calendar, MapPin, CreditCard, AlertCircle
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../../services/orderService'
import { userService } from '../../services/userService'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/common/Loader'
import PrivateRoute from '../../components/common/PrivateRoute'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Fetch user orders statistics
  const { data: orderStats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['userOrderStats'],
    queryFn: () => orderService.getUserOrderStats(),
    enabled: !!user,
  })

  // Fetch recent orders - EXCLUDING CANCELLED ORDERS
  const { data: recentOrders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['recentOrders', 'active'],
    queryFn: () => orderService.getMyOrders({ 
      limit: 5, 
      page: 1,
    }),
    enabled: !!user,
  })

  const isLoading = statsLoading || ordersLoading
  const error = statsError || ordersError

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">Please try again later</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  const stats = orderStats?.data || {
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  }

  // FILTER OUT CANCELLED ORDERS FROM RECENT ORDERS
  const allOrders = recentOrders?.data?.orders || []
  const orders = allOrders.filter((order: any) => order.orderStatus !== 'cancelled')
  
  // Calculate active orders count (excluding cancelled)
  const activeOrdersCount = orders.length
  
  // Calculate total spent only from non-cancelled orders
  const totalSpent = orders.reduce((sum: number, order: any) => {
    // Only count completed or delivered orders in total spent
    if (order.orderStatus === 'delivered' || order.paymentStatus === 'paid') {
      return sum + (order.totalPrice || 0)
    }
    return sum
  }, 0)
  
  const totalSpentFormatted = `PKR ${totalSpent.toLocaleString()}`

  // Stat cards with real data (excluding cancelled)
  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders - (stats.cancelledOrders || 0), // Exclude cancelled from total
      icon: ShoppingBag,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Spent',
      value: totalSpentFormatted,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Delivered Orders',
      value: stats.deliveredOrders,
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    }
  ]

  const quickActions = [
    {
      title: 'Track Order',
      description: 'Check your order status',
      icon: MapPin,
      link: '/orders',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'View Products',
      description: 'Browse latest products',
      icon: ShoppingBag,
      link: '/products',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Update Profile',
      description: 'Edit your information',
      icon: User,
      link: '/profile',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Payment History',
      description: 'View payment records',
      icon: CreditCard,
      link: '/orders',
      color: 'bg-orange-100 text-orange-600'
    }
  ]

  // Calculate analytics using only non-cancelled orders
  const activeOrdersForAnalytics = orders.filter((order: any) => 
    order.orderStatus !== 'cancelled'
  )
  
  const averageOrderValue = activeOrdersForAnalytics.length > 0 
    ? Math.round(activeOrdersForAnalytics.reduce((sum: number, order: any) => 
        sum + (order.totalPrice || 0), 0) / activeOrdersForAnalytics.length
      ) 
    : 0
    
  const successRate = stats.totalOrders > 0 && (stats.totalOrders - stats.cancelledOrders) > 0
    ? Math.round((stats.deliveredOrders / (stats.totalOrders - stats.cancelledOrders)) * 100)
    : 0

  // Get current month orders (excluding cancelled)
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthOrders = orders.filter((order: any) => {
    const orderDate = new Date(order.createdAt)
    return orderDate.getMonth() === currentMonth && 
           orderDate.getFullYear() === currentYear &&
           order.orderStatus !== 'cancelled'
  }).length

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'User'}!</h1>
            <p className="text-gray-600">Here's what's happening with your account today.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders - EXCLUDING CANCELLED */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                    <p className="text-gray-600 text-sm">Your recent purchase history</p>
                  </div>
                  <Link
                    to="/orders"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View All
                  </Link>
                </div>

                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order: any) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition-colors cursor-pointer"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <Link
                              to={`/orders/${order._id}`}
                              className="font-medium text-gray-900 hover:text-primary-600"
                            >
                              {order.invoiceNumber || `#${order._id.slice(-8).toUpperCase()}`}
                            </Link>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems?.length} items
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">PKR {order.totalPrice?.toLocaleString()}</div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.orderStatus === 'delivered'
                                ? 'bg-green-100 text-green-800'
                                : order.orderStatus === 'processing'
                                ? 'bg-blue-100 text-blue-800'
                                : order.orderStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : order.orderStatus === 'shipped'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1) || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {order.shippingAddress?.city || 'N/A'}
                          </div>
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {order.paymentMethod?.replace('_', ' ') || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {orders.length > 3 && (
                      <div className="text-center mt-4">
                        <Link to="/orders" className="text-primary-600 hover:underline text-sm">
                          View all {orders.length} orders
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No active orders</p>
                    <Link to="/products" className="btn-primary inline-block">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Quick Actions & Analytics */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      to={action.link}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors group"
                    >
                      <div className={`p-3 rounded-lg ${action.color} mr-4 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Order Analytics - Using real data excluding cancelled */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Analytics</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <BarChart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Average Order Value</p>
                        <p className="font-medium text-gray-900">
                          PKR {averageOrderValue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-green-600 text-sm font-medium flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                      {orders.length > 0 ? 'Active' : 'No orders'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">This Month</p>
                        <p className="font-medium text-gray-900">
                          {thisMonthOrders} order{thisMonthOrders !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Award className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Success Rate</p>
                        <p className="font-medium text-gray-900">
                          {successRate}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Activity Timeline - EXCLUDING CANCELLED */}
          {orders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6 mt-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {orders.slice(0, 3).map((order: any) => (
                  <div key={order._id} className="flex items-start">
                    <div className="p-2 bg-primary-100 rounded-lg mr-4">
                      <ShoppingBag className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        Order <strong>{order.invoiceNumber || `#${order._id.slice(-6)}`}</strong> was placed
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium">PKR {order.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PrivateRoute>
  )
}

export default DashboardPage
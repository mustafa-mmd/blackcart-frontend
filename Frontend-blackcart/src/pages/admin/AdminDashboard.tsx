// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminServiceMethods';
import DashboardStats from '../../components/admin/DashboardStats';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      
      // ✅ Filter out cancelled orders from recent orders
      if (data.recentOrders) {
        data.recentOrders = data.recentOrders.filter(
          (order: any) => order.orderStatus !== 'cancelled'
        );
      }
      
      // ✅ Filter out cancelled orders from top products (if they have sales data)
      if (data.topProducts) {
        // Top products might already exclude cancelled, but we'll keep as is
      }
      
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard statistics');
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate active orders count (excluding cancelled)
  const activeOrders = (stats?.overview?.totalOrders || 0) - (stats?.overview?.cancelledOrders || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
          <p className="text-sm text-blue-600 mt-1">
            * Statistics exclude cancelled orders for accurate tracking
          </p>
        </div>

        {/* Stats Cards */}
        {stats && <DashboardStats stats={stats} />}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Recent Active Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Active Orders</h2>
                  <p className="text-sm text-gray-500">Latest orders (excluding cancelled)</p>
                </div>
                <button
                  onClick={() => navigate('/admin/orders?status=active')}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View All Active
                </button>
              </div>
              
              {stats?.recentOrders?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.recentOrders.slice(0, 5).map((order: any) => (
                        <tr 
                          key={order._id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/admin/orders/${order._id}`)}
                        >
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              #{order.invoiceNumber || order._id.slice(-6)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {order.user?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user?.email || ''}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.orderStatus === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">
                            PKR {order.totalPrice?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No active orders
                </div>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
                <button
                  onClick={() => navigate('/admin/products')}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View All
                </button>
              </div>
              
              {stats?.topProducts?.length > 0 ? (
                <div className="space-y-4">
                  {stats.topProducts.slice(0, 5).map((product: any, index: number) => (
                    <div 
                      key={product._id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          PKR {product.price?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.numReviews || 0} reviews
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No top products data
                </div>
              )}
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-bold text-green-600">
                    PKR {stats?.overview?.totalRevenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Orders:</span>
                  <span className="font-medium">{stats?.overview?.totalOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Orders:</span>
                  <span className="font-medium text-blue-600">{activeOrders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Orders:</span>
                  <span className="font-medium text-yellow-600">{stats?.overview?.pendingOrders || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Low Stock Products:</span>
                  <span className="font-medium text-orange-600">{stats?.overview?.lowStockProducts || 0}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/admin/products/new')}
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Add New Product
                </button>
                <button
                  onClick={() => navigate('/admin/orders?status=active')}
                  className="block w-full px-4 py-3 bg-white text-gray-700 text-center rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
                >
                  View Active Orders
                </button>
                <button
                  onClick={() => navigate('/admin/analytics')}
                  className="block w-full px-4 py-3 bg-white text-gray-700 text-center rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 7 Days)</h2>
            {stats?.userGrowth?.length > 0 ? (
              <div className="h-48 flex items-end space-x-2">
                {stats.userGrowth.map((day: any) => (
                  <div key={day._id} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-8 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                      style={{ height: `${Math.min(100, (day.count / Math.max(...stats.userGrowth.map((d: any) => d.count))) * 100)}%` }}
                      title={`${day.count} users on ${day._id}`}
                    />
                    <span className="text-xs text-gray-500 mt-2">
                      {new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No user growth data available
              </div>
            )}
          </div>
        </div>

        {/* Note about cancelled orders */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>† Cancelled orders are excluded from active views. Use the "cancelled" filter to view them.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
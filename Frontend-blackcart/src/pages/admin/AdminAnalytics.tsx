// src/pages/admin/AdminAnalytics.tsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  RefreshCw,
  Award,
  Clock,
  Star,
  Truck,
  CreditCard,
  Smartphone,
  Wallet,
  Landmark
} from 'lucide-react';
import { adminService } from '../../services/adminServiceMethods';
import toast from 'react-hot-toast';

const AdminAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'users' | 'products'>('sales');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [salesData, setSalesData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchSalesAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSalesAnalytics(period);
      setSalesData(data.data);
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      setError('Failed to load sales analytics');
      toast.error('Failed to load sales analytics');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUserAnalytics(period);
      setUserData(data.data);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      setError('Failed to load user analytics');
      toast.error('Failed to load user analytics');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const fetchProductAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getProductAnalytics();
      setProductData(data.data);
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      setError('Failed to load product analytics');
      toast.error('Failed to load product analytics');
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case 'sales':
        fetchSalesAnalytics();
        break;
      case 'users':
        fetchUserAnalytics();
        break;
      case 'products':
        fetchProductAnalytics();
        break;
    }
  }, [activeTab, period]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCompactNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cod':
        return <Truck className="h-5 w-5 text-yellow-500" />;
      case 'easypaisa':
        return <Smartphone className="h-5 w-5 text-green-500" />;
      case 'jazzcash':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'bank_transfer':
        return <Landmark className="h-5 w-5 text-purple-500" />;
      case 'card':
        return <CreditCard className="h-5 w-5 text-red-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleExportReport = () => {
    try {
      let dataToExport: any = null;
      let filename = '';

      switch (activeTab) {
        case 'sales':
          dataToExport = salesData;
          filename = `sales-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'users':
          dataToExport = userData;
          filename = `user-analytics-${period}-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'products':
          dataToExport = productData;
          filename = `product-analytics-${new Date().toISOString().split('T')[0]}.json`;
          break;
      }

      if (!dataToExport) {
        toast.error('No data to export');
        return;
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  const renderSalesTab = () => {
    if (!salesData) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No sales data available</p>
          </div>
        </div>
      );
    }

    const totalRevenue = salesData.salesData?.reduce((sum: number, item: any) => sum + item.revenue, 0) || 0;
    const totalOrders = salesData.salesData?.reduce((sum: number, item: any) => sum + item.orders, 0) || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const firstPeriod = salesData.salesData?.[0];
    const lastPeriod = salesData.salesData?.[salesData.salesData?.length - 1];
    const revenueGrowth = firstPeriod && lastPeriod 
      ? calculateGrowth(lastPeriod.revenue, firstPeriod.revenue) 
      : 0;
    const orderGrowth = firstPeriod && lastPeriod 
      ? calculateGrowth(lastPeriod.orders, firstPeriod.orders) 
      : 0;

    const topProduct = salesData.topProducts?.[0];

    return (
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="h-8 w-8 opacity-90" />
              {getTrendIcon(lastPeriod?.revenue, firstPeriod?.revenue)}
            </div>
            <p className="text-sm opacity-90 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</p>
            <div className="flex items-center text-xs opacity-75">
              <span>vs previous period: {formatPercentage(revenueGrowth)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="h-8 w-8 opacity-90" />
              {getTrendIcon(lastPeriod?.orders, firstPeriod?.orders)}
            </div>
            <p className="text-sm opacity-90 mb-1">Total Orders</p>
            <p className="text-2xl font-bold mb-1">{totalOrders.toLocaleString()}</p>
            <div className="flex items-center text-xs opacity-75">
              <span>vs previous period: {formatPercentage(orderGrowth)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="h-8 w-8 opacity-90" />
            </div>
            <p className="text-sm opacity-90 mb-1">Average Order Value</p>
            <p className="text-2xl font-bold mb-1">{formatCurrency(avgOrderValue)}</p>
            <div className="flex items-center text-xs opacity-75">
              <span>Per transaction</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <Award className="h-8 w-8 opacity-90" />
            </div>
            <p className="text-sm opacity-90 mb-1">Top Product Revenue</p>
            <p className="text-2xl font-bold mb-1">
              {topProduct ? formatCurrency(topProduct.revenue) : 'N/A'}
            </p>
            <div className="flex items-center text-xs opacity-75">
              <span>{topProduct?.name || 'No data'}</span>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-500">Performance over time</p>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="h-80">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
              {/* Chart Area - 4 columns */}
              <div className="lg:col-span-4 h-full">
                <div className="flex items-end h-full space-x-2 overflow-x-auto pb-4">
                  {salesData.salesData?.map((item: any, index: number) => {
                    const maxRevenue = Math.max(...salesData.salesData.map((d: any) => d.revenue));
                    const height = (item.revenue / maxRevenue) * 100;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-shrink-0 w-16 group">
                        <div className="relative w-full">
                          <div 
                            className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-600 group-hover:to-blue-500"
                            style={{ height: `${height}%`, minHeight: '20px' }}
                          >
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                              {formatCurrency(item.revenue)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2 font-medium">
                          {period === 'daily' ? new Date(item._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) :
                           period === 'weekly' ? `Week ${item._id.slice(-2)}` :
                           period === 'monthly' ? new Date(item._id + '-01').toLocaleDateString('en-US', { month: 'short' }) :
                           item._id}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Stats Sidebar - 1 column */}
              <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Period Summary</h4>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Highest Revenue</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(Math.max(...salesData.salesData.map((d: any) => d.revenue)))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Average Revenue</span>
                    <span className="font-semibold">
                      {formatCurrency(totalRevenue / salesData.salesData.length)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-semibold">{totalOrders.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-900">Growth Rate</span>
                      <span className={revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatPercentage(revenueGrowth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performing Products</h3>
            <div className="space-y-4">
              {salesData.topProducts?.slice(0, 5).map((product: any, index: number) => {
                const percentage = (product.revenue / totalRevenue) * 100;
                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-50 text-gray-600'}`}>
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>
                    <div className="ml-9">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 group-hover:opacity-100
                            ${index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-500' :
                              index === 2 ? 'bg-orange-500' :
                              'bg-blue-500'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{product.quantity} units sold</span>
                        <span>{percentage.toFixed(1)}% of total</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!salesData.topProducts || salesData.topProducts.length === 0) && (
                <p className="text-center text-gray-500 py-8">No product data available</p>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 Payment Methods Distribution</h3>
            <div className="space-y-4">
              {salesData.revenueByPayment?.map((method: any, index: number) => {
                const percentage = (method.revenue / totalRevenue) * 100;
                return (
                  <div key={index} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        {getPaymentMethodIcon(method._id)}
                        <span className="text-sm font-medium text-gray-900 ml-2 capitalize">
                          {method._id === 'cod' ? 'Cash on Delivery' :
                           method._id === 'easypaisa' ? 'EasyPaisa' :
                           method._id === 'jazzcash' ? 'JazzCash' :
                           method._id === 'bank_transfer' ? 'Bank Transfer' :
                           method._id === 'card' ? 'Credit/Debit Card' :
                           method._id || 'Other'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(method.revenue)}
                      </span>
                    </div>
                    <div className="ml-7">
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{method.orders} transactions</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!salesData.revenueByPayment || salesData.revenueByPayment.length === 0) && (
                <p className="text-center text-gray-500 py-8">No payment data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderUsersTab = () => {
    if (!userData) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No user data available</p>
          </div>
        </div>
      );
    }

    const totalUsers = userData.userStats?.totalUsers || 0;
    const activeUsers = userData.userStats?.activeUsers || 0;
    const verifiedUsers = userData.userStats?.verifiedUsers || 0;
    const usersWithOrders = userData.usersWithOrders || 0;

    return (
      <div className="space-y-8">
        {/* User Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <Users className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Total Users</p>
            <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <Users className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Active Users</p>
            <p className="text-3xl font-bold">{activeUsers.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-2">
              {((activeUsers / totalUsers) * 100).toFixed(1)}% of total
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <Users className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Verified Users</p>
            <p className="text-3xl font-bold">{verifiedUsers.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-2">
              {((verifiedUsers / totalUsers) * 100).toFixed(1)}% verified
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <ShoppingCart className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Users with Orders</p>
            <p className="text-3xl font-bold">{usersWithOrders.toLocaleString()}</p>
            <p className="text-xs opacity-75 mt-2">
              {((usersWithOrders / totalUsers) * 100).toFixed(1)}% converted
            </p>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 User Growth Trend</h3>
          <div className="h-80">
            <div className="flex items-end h-full space-x-2 overflow-x-auto pb-4">
              {userData.userGrowth?.map((day: any, index: number) => {
                const maxUsers = Math.max(...userData.userGrowth.map((d: any) => d.newUsers));
                const height = (day.newUsers / maxUsers) * 100;
                
                return (
                  <div key={index} className="flex flex-col items-center flex-shrink-0 w-16 group">
                    <div className="relative w-full">
                      <div 
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-300 group-hover:from-green-600 group-hover:to-green-500"
                        style={{ height: `${height}%`, minHeight: '20px' }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                          {day.newUsers} new users
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-2 font-medium">
                      {period === 'daily' ? new Date(day._id).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) :
                       period === 'weekly' ? `Week ${day._id.slice(-2)}` :
                       period === 'monthly' ? new Date(day._id + '-01').toLocaleDateString('en-US', { month: 'short' }) :
                       day._id}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">User Activity</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Rate</span>
                <span className="text-lg font-semibold text-green-600">
                  {((activeUsers / totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(activeUsers / totalUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Verification Rate</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Verified</span>
                <span className="text-lg font-semibold text-purple-600">
                  {((verifiedUsers / totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(verifiedUsers / totalUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Conversion Rate</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Made Purchase</span>
                <span className="text-lg font-semibold text-orange-600">
                  {((usersWithOrders / totalUsers) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(usersWithOrders / totalUsers) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProductsTab = () => {
    if (!productData) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No product data available</p>
          </div>
        </div>
      );
    }

    const stats = productData.productStats || {};

    return (
      <div className="space-y-8">
        {/* Product Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <Package className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Total Products</p>
            <p className="text-3xl font-bold">{stats.totalProducts?.toLocaleString() || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <Package className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Active Products</p>
            <p className="text-3xl font-bold">{stats.activeProducts?.toLocaleString() || 0}</p>
            <p className="text-xs opacity-75 mt-2">
              {stats.totalProducts ? ((stats.activeProducts / stats.totalProducts) * 100).toFixed(1) : 0}% of total
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <Package className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Low Stock</p>
            <p className="text-3xl font-bold">{stats.lowStock?.toLocaleString() || 0}</p>
            <p className="text-xs opacity-75 mt-2">Need restock soon</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <Star className="h-8 w-8 mb-4 opacity-90" />
            <p className="text-sm opacity-90 mb-1">Featured Products</p>
            <p className="text-3xl font-bold">{stats.featuredProducts?.toLocaleString() || 0}</p>
          </div>
        </div>

        {/* Products by Category */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Products by Category</h3>
          <div className="space-y-4">
            {productData.productsByCategory?.map((category: any, index: number) => {
              const maxCount = Math.max(...productData.productsByCategory.map((c: any) => c.count));
              const percentage = (category.count / maxCount) * 100;
              
              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {category._id || 'Uncategorized'}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">{category.count} products</span>
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(category.averagePrice || 0)} avg
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Rated & Recent Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Rated */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">⭐ Top Rated Products</h3>
            <div className="space-y-4">
              {productData.topRatedProducts?.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                      <Star className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1">{product.rating?.toFixed(1) || '0.0'}</span>
                        <span className="mx-2">•</span>
                        <span>{product.numReviews || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🆕 Recently Added</h3>
            <div className="space-y-4">
              {productData.recentProducts?.map((product: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <Package className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">
                        Added {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Overview */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Inventory Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{stats.totalStock?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">Total Units in Stock</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.averagePrice || 0)}</p>
              <p className="text-sm text-gray-600">Average Product Price</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{stats.outOfStock?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-600">Out of Stock Items</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Track your store's performance and insights</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
              >
                <option value="daily">📅 Daily</option>
                <option value="weekly">📊 Weekly</option>
                <option value="monthly">📈 Monthly</option>
                <option value="yearly">📉 Yearly</option>
              </select>
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </button>
              <button
                onClick={() => {
                  switch (activeTab) {
                    case 'sales': fetchSalesAnalytics(); break;
                    case 'users': fetchUserAnalytics(); break;
                    case 'products': fetchProductAnalytics(); break;
                  }
                }}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'sales', label: 'Sales Analytics', icon: BarChart3, color: 'blue' },
                { id: 'users', label: 'User Analytics', icon: Users, color: 'green' },
                { id: 'products', label: 'Product Analytics', icon: Package, color: 'purple' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <tab.icon className={`h-5 w-5 mr-2 ${
                    activeTab === tab.id ? `text-${tab.color}-500` : 'text-gray-400'
                  }`} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Data</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => {
                switch (activeTab) {
                  case 'sales': fetchSalesAnalytics(); break;
                  case 'users': fetchUserAnalytics(); break;
                  case 'products': fetchProductAnalytics(); break;
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Tab Content */}
            {activeTab === 'sales' && renderSalesTab()}
            {activeTab === 'users' && renderUsersTab()}
            {activeTab === 'products' && renderProductsTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
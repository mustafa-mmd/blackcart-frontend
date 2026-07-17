// src/pages/admin/AdminOrders.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  AlertCircle,
  Trash2
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { adminService } from '../../services/adminServiceMethods';
import type { Order, OrderStatus } from '../../types';
import toast from 'react-hot-toast';

type BulkOrderAction = Extract<OrderStatus, 'processing' | 'shipped' | 'delivered' | 'cancelled'> | 'delete';

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { message?: string; error?: string } } })?.response;
  return response?.data?.message || response?.data?.error || fallback;
};

const AdminOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // ✅ Changed from 'all' to 'active'
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkOrderAction | null>(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter; // Send active, pending, etc.
      if (paymentFilter !== 'all') params.paymentMethod = paymentFilter;
      
      const response = await adminService.getAdminOrders(params);
      setOrders(response.data.orders);
      setStats(response.data.stats);
      setPagination({
        page: response.data.pagination.page,
        pages: response.data.pagination.pages,
        total: response.data.pagination.total,
        limit: response.data.pagination.limit,
        hasNext: response.data.pagination.hasNext,
        hasPrev: response.data.pagination.hasPrev,
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, paymentFilter, searchTerm, statusFilter]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders(1);
    }, searchTerm ? 400 : 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchOrders, searchTerm]);

  const handlePageChange = (page: number) => {
    fetchOrders(page);
  };

  const handleBulkStatusUpdate = async (status: Exclude<BulkOrderAction, 'delete'>) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders first');
      return;
    }

    if (status === 'cancelled' && !window.confirm(
      `Cancel ${selectedOrders.length} selected order${selectedOrders.length === 1 ? '' : 's'}? Reserved inventory and coupon usage will be restored.`
    )) return;

    try {
      setBulkAction(status);
      toast.loading(`Updating ${selectedOrders.length} orders...`, { id: 'bulk-update' });
      const response = await adminService.bulkUpdateOrders(selectedOrders, { status });

      const modified = response.data?.modified ?? 0;
      const skipped = response.data?.skipped ?? 0;
      const message = response.message || `${modified} order${modified === 1 ? '' : 's'} marked as ${status}`;
      toast.success(skipped > 0 ? `${message}; ${skipped} final or unchanged` : message, { id: 'bulk-update' });
      setSelectedOrders([]);
      await fetchOrders(pagination.page);
    } catch (error: unknown) {
      console.error('Error updating orders:', error);
      toast.error(getApiErrorMessage(error, 'Failed to update orders'), { id: 'bulk-update' });
    } finally {
      setBulkAction(null);
    }
  };

  const handleDeleteOrders = async (orderIds: string[]) => {
    if (orderIds.length === 0) {
      toast.error('Please select orders first');
      return;
    }
    if (!window.confirm(
      `Permanently delete ${orderIds.length} order${orderIds.length === 1 ? '' : 's'}? This cannot be undone. Inventory for active orders will be restored.`
    )) return;

    try {
      setBulkAction('delete');
      toast.loading(`Deleting ${orderIds.length} order${orderIds.length === 1 ? '' : 's'}...`, { id: 'bulk-delete' });
      const response = await adminService.bulkDeleteOrders(orderIds);
      toast.success(response.message || `${response.data?.deleted ?? 0} orders deleted`, { id: 'bulk-delete' });
      setSelectedOrders((current) => current.filter((id) => !orderIds.includes(id)));
      await fetchOrders(pagination.page);
    } catch (error: unknown) {
      console.error('Error deleting orders:', error);
      toast.error(getApiErrorMessage(error, 'Failed to delete orders'), { id: 'bulk-delete' });
    } finally {
      setBulkAction(null);
    }
  };

  const handleExportOrders = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export-orders' });
      
      const response = await adminService.exportOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        paymentMethod: paymentFilter !== 'all' ? paymentFilter : undefined,
        search: searchTerm || undefined
      });
      
      const csvData = response.data as Array<Record<string, unknown>> | undefined;
      
      if (!csvData || csvData.length === 0) {
        toast.error('No data to export', { id: 'export-orders' });
        return;
      }
      
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map((row) =>
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value ?? ''
        ).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Orders exported successfully', { id: 'export-orders' });
      
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders', { id: 'export-orders' });
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(o => o._id));
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing': return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    {
      key: 'select',
      header: (
        <input
          type="checkbox"
          aria-label="Select all orders on this page"
          checked={selectedOrders.length === orders.length && orders.length > 0}
          onChange={handleSelectAll}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
      ),
      render: (_: unknown, row: Order) => (
        <input
          type="checkbox"
          aria-label={`Select order ${row.invoiceNumber || row._id}`}
          checked={selectedOrders.includes(row._id)}
          onChange={() => handleSelectOrder(row._id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 text-blue-600 rounded border-gray-300"
        />
      ),
    },
    {
      key: 'invoiceNumber',
      header: 'Order',
      render: (value: string, row: Order) => (
        <div>
          <div className="font-medium text-gray-900">
            {value || `#${row._id.slice(-6)}`}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(row.createdAt)}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (_value: unknown, row: Order) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.user?.name || row.shippingAddress?.fullName || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {row.user?.email || ''}
          </div>
        </div>
      ),
    },
    {
      key: 'orderStatus',
      header: 'Status',
      render: (value: string) => (
        <div className="flex items-center">
          {getStatusIcon(value)}
          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(value)}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'paymentMethod',
      header: 'Payment',
      render: (value: string, row: Order) => (
        <div className="text-sm text-gray-900">
          <div className="capitalize">{value?.replace('_', ' ') || 'N/A'}</div>
          <span className={`text-xs px-1 py-0.5 rounded ${
            row.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {row.isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      ),
    },
    {
      key: 'totalPrice',
      header: 'Total',
      render: (value: number) => (
        <div className="font-medium text-gray-900 flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
          {formatCurrency(value)}
        </div>
      ),
      sortable: true,
    },
  ];

  const renderActions = (row: Order) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/admin/orders/${row._id}`);
        }}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="View Order"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/admin/orders/edit/${row._id}`);
        }}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
        title="Edit Order"
      >
        <Edit className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          void handleDeleteOrders([row._id]);
        }}
        disabled={bulkAction !== null}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50"
        title="Delete Order"
        aria-label={`Delete order ${row.invoiceNumber || row._id}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  // ✅ Updated status options with 'active'
  const statusOptions = [
    { value: 'active', label: 'Active Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'all', label: 'All Orders' },
  ];

  const paymentOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'easypaisa', label: 'EasyPaisa' },
    { value: 'jazzcash', label: 'JazzCash' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'card', label: 'Credit Card' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-2">Manage and track customer orders</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportOrders}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button
                onClick={() => fetchOrders()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search orders by invoice, customer name, or email..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {paymentOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Info Banner for Active filter */}
          {statusFilter === 'active' && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
              <p className="text-sm text-blue-700">
                Showing active orders (pending, processing, shipped). 
                <button 
                  onClick={() => setStatusFilter('cancelled')}
                  className="ml-2 text-blue-600 hover:text-blue-800 font-medium underline"
                >
                  View cancelled orders
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Processing</p>
            <p className="text-2xl font-bold text-blue-600">{stats.processingOrders}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-2xl font-bold text-green-600">{stats.deliveredOrders}</p>
          </div>
        </div>

        {/* Quick Status Update */}
        {selectedOrders.length > 0 && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedOrders.length} Order{selectedOrders.length > 1 ? 's' : ''} Selected
              </h3>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear Selection
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('processing')}
                disabled={bulkAction !== null}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkAction === 'processing' ? 'Updating...' : 'Mark as Processing'}
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('shipped')}
                disabled={bulkAction !== null}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkAction === 'shipped' ? 'Updating...' : 'Mark as Shipped'}
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('delivered')}
                disabled={bulkAction !== null}
                className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkAction === 'delivered' ? 'Updating...' : 'Mark as Delivered'}
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('cancelled')}
                disabled={bulkAction !== null}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkAction === 'cancelled' ? 'Cancelling...' : 'Cancel Selected'}
              </button>
              <button
                onClick={() => void handleDeleteOrders(selectedOrders)}
                disabled={bulkAction !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {bulkAction === 'delete' ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          searchable={false}
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
          }}
          actions={renderActions}
          onRowClick={(row) => navigate(`/admin/orders/${row._id}`)}
          emptyMessage="No orders found"
        />
      </div>
    </div>
  );
};

export default AdminOrders;

// src/pages/admin/AdminOrderDetails.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Edit,
  Printer,
  RefreshCw,
  FileText,
  Download  // ✅ Added Download icon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminServiceMethods';
import { orderService } from '../../services/orderService'; // ✅ Import orderService
import toast from 'react-hot-toast';
import Loader from '../../components/common/Loader';

const AdminOrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use React Query to fetch fresh data
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['order', id],
    queryFn: () => adminService.getAdminOrderById(id!),
    enabled: !!id,
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Force refetch when component mounts or id changes
  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  const order = data?.data;

  const handleRefresh = () => {
    refetch();
    toast.success('Order refreshed');
  };

  // ✅ Handle Delivery Slip Download
  const handleDownloadDeliverySlip = async () => {
    try {
      toast.loading('Generating delivery slip...', { id: 'delivery-slip' });
      await orderService.downloadDeliverySlip(order._id, order.invoiceNumber);
      toast.success('Delivery slip downloaded', { id: 'delivery-slip' });
    } catch (error) {
      console.error('Error generating delivery slip:', error);
      toast.error('Failed to generate delivery slip', { id: 'delivery-slip' });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing': return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped': return <Truck className="h-5 w-5 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
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

  // Helper to generate tracking URL
  const getTrackingUrl = (carrier: string, trackingNumber: string) => {
    const carrierUrls: Record<string, string> = {
      'TCS': `https://www.tcsexpress.com/tracking/${trackingNumber}`,
      'Leopards': `https://www.leopardscourier.com/tracking/${trackingNumber}`,
      'M&P': `https://www.mnp.com.pk/tracking/${trackingNumber}`,
      'BlueEX': `https://www.blueex.com/tracking/${trackingNumber}`,
      'DHL': `https://www.dhl.com.pk/tracking/${trackingNumber}`,
      'FedEx': `https://www.fedex.com/tracking/${trackingNumber}`,
    };
    return carrierUrls[carrier] || null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order Not Found</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin/orders')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Orders
            </button>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order.invoiceNumber || order._id.slice(-8)}
                </h1>
                <p className="text-gray-600 mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
              
              {/* Action buttons with Delivery Slip */}
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="ml-1 capitalize">{order.orderStatus}</span>
                </span>
                
                <button
                  onClick={() => navigate(`/admin/orders/edit/${id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </button>

                {/* ✅ Delivery Slip Button */}
                <button
                  onClick={handleDownloadDeliverySlip}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  title="Download Delivery Slip for Delivery Boy"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Delivery Slip
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <Printer className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems?.map((item: any) => (
                  <div key={item._id} className="flex items-center border-b pb-4 last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg mr-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">PKR {(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">PKR {item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{order.user?.name || order.shippingAddress?.fullName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{order.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{order.shippingAddress?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Information Section */}
            {order.trackingNumber && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Truck className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Tracking Information</h2>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-medium text-gray-900 font-mono">{order.trackingNumber}</p>
                  </div>
                  {order.shippingCarrier && (
                    <div>
                      <p className="text-sm text-gray-600">Carrier</p>
                      <p className="font-medium text-gray-900 capitalize">{order.shippingCarrier}</p>
                    </div>
                  )}
                  {order.trackingNumber && order.shippingCarrier && (
                    <div className="mt-4">
                      <a
                        href={getTrackingUrl(order.shippingCarrier, order.trackingNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Track Package →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium">{order.shippingAddress?.fullName}</p>
                  <p className="text-gray-600">{order.shippingAddress?.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress?.country}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Method</p>
                    <p className="font-medium capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-medium">PKR {order.totalPrice?.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Paid Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Notes Section */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-gray-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">Order Notes</h2>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Last updated: {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">PKR {order.itemsPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">PKR {order.shippingPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">PKR {order.taxPrice?.toLocaleString()}</span>
                </div>
                {order.codCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">COD Charges:</span>
                    <span className="font-medium">PKR {order.codCharges.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>PKR {order.totalPrice?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetails;
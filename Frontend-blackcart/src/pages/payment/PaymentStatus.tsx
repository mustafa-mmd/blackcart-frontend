import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  Wallet,
  Smartphone,
  Building
} from 'lucide-react';
import { usePayment } from '../../hooks/usePayment';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateFormatter';
import toast from 'react-hot-toast';

const PaymentStatus: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getPaymentStatus, loading, paymentStatus } = usePayment();
  const { getOrderById } = useOrders();
  
  const [order, setOrder] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      const [status, orderData] = await Promise.all([
        getPaymentStatus(orderId!),
        getOrderById(orderId!)
      ]);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load payment status:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to refresh status');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (paymentStatus?.isPaid) {
      return <CheckCircle className="h-16 w-16 text-green-500" />;
    }
    if (paymentStatus?.paymentStatus === 'failed') {
      return <XCircle className="h-16 w-16 text-red-500" />;
    }
    if (paymentStatus?.paymentStatus === 'pending_review') {
      return <Clock className="h-16 w-16 text-yellow-500" />;
    }
    if (paymentStatus?.paymentStatus === 'proof_uploaded') {
      return <Building className="h-16 w-16 text-purple-500" />;
    }
    return <AlertCircle className="h-16 w-16 text-orange-500" />;
  };

  const getStatusMessage = () => {
    if (paymentStatus?.isPaid) {
      return {
        title: 'Payment Successful',
        message: 'Your payment has been confirmed and your order is being processed.',
        color: 'text-green-600'
      };
    }
    if (paymentStatus?.paymentStatus === 'failed') {
      return {
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        color: 'text-red-600'
      };
    }
    if (paymentStatus?.paymentStatus === 'pending_review') {
      return {
        title: 'Payment Under Review',
        message: 'Your payment proof is being verified. This usually takes 24-48 hours.',
        color: 'text-yellow-600'
      };
    }
    if (paymentStatus?.paymentStatus === 'proof_uploaded') {
      return {
        title: 'Proof Uploaded',
        message: 'Your payment proof has been uploaded and is pending verification.',
        color: 'text-purple-600'
      };
    }
    if (paymentStatus?.paymentStatus === 'pending_cod') {
      return {
        title: 'Cash on Delivery',
        message: 'You will pay when you receive your order.',
        color: 'text-blue-600'
      };
    }
    return {
      title: 'Payment Pending',
      message: 'Your payment is being processed. Please wait...',
      color: 'text-orange-600'
    };
  };

  const getPaymentMethodIcon = () => {
    switch (paymentStatus?.paymentMethod) {
      case 'easypaisa':
      case 'jazzcash':
      case 'sadapay':
      case 'nayapay':
        return <Smartphone className="h-5 w-5" />;
      case 'bank_transfer':
        return <Building className="h-5 w-5" />;
      case 'cod':
        return <Wallet className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const status = getStatusMessage();
  const StatusIcon = getStatusIcon();

  if (loading && !paymentStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              {StatusIcon}
            </div>
            
            <h1 className={`text-2xl font-bold mb-2 ${status.color}`}>
              {status.title}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {status.message}
            </p>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 mx-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          {/* Order Details */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Order Details</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium">
                  #{paymentStatus?.invoiceNumber || orderId?.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(paymentStatus?.totalAmount || 0)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium flex items-center gap-1">
                  {getPaymentMethodIcon()}
                  {paymentStatus?.paymentMethod?.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {paymentStatus?.isPaid && paymentStatus.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid At:</span>
                  <span className="font-medium">{formatDate(paymentStatus.paidAt)}</span>
                </div>
              )}

              {paymentStatus?.transactionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{paymentStatus.transactionId}</span>
                </div>
              )}

              {paymentStatus?.codCharges && paymentStatus.codCharges > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>COD Charges:</span>
                  <span>+{formatPrice(paymentStatus.codCharges)}</span>
                </div>
              )}

              {paymentStatus?.expiresAt && !paymentStatus.isPaid && (
                <div className="flex justify-between text-orange-600">
                  <span>Expires:</span>
                  <span>{formatDate(paymentStatus.expiresAt, 'short')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Attempts */}
          {paymentStatus?.attempts && paymentStatus.attempts.length > 0 && (
            <div className="border-t border-gray-200 p-6">
              <h4 className="font-medium text-gray-900 mb-3">Payment Attempts</h4>
              <div className="space-y-2">
                {paymentStatus.attempts.map((attempt, index) => (
                  <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {formatDate(attempt.attemptedAt, 'short')}
                      </span>
                      <span className={`font-medium ${
                        attempt.status === 'success' ? 'text-green-600' :
                        attempt.status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {attempt.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-gray-500">Method: {attempt.method}</span>
                      <span className="text-gray-500">Amount: {formatPrice(attempt.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {paymentStatus?.isPaid ? (
                <>
                  <button
                    onClick={() => navigate(`/orders/${orderId}`)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    View Order
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Continue Shopping
                  </button>
                </>
              ) : paymentStatus?.paymentMethod === 'bank_transfer' && 
                 paymentStatus?.paymentStatus !== 'proof_uploaded' ? (
                <>
                  <button
                    onClick={() => navigate(`/payment/proof/${orderId}`)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Upload Payment Proof
                  </button>
                  <button
                    onClick={() => navigate(`/payment/${orderId}`)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Try Another Method
                  </button>
                </>
              ) : paymentStatus?.paymentStatus === 'pending_review' ? (
                <button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                >
                  View Order Status
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate(`/payment/${orderId}`)}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
                  >
                    Retry Payment
                  </button>
                  <button
                    onClick={() => navigate('/cart')}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    Return to Cart
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Support Info */}
          <div className="border-t border-gray-200 bg-gray-50 p-6">
            <h4 className="font-medium text-gray-900 mb-3 text-center">Need Help?</h4>
            <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
              <a
                href="mailto:blackcart.ak25@gmail.com"
                className="text-blue-600 hover:text-blue-700"
              >
                blackcart.ak25@gmail.com
              </a>
              <a
                href="tel:+9242111222333"
                className="text-blue-600 hover:text-blue-700"
              >
                +92 3146965599
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;

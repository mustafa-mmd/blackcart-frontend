// src/pages/payment/PaymentProofPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, CheckCircle, ArrowLeft, AlertCircle, FileText, Clock, Banknote } from 'lucide-react'
import PaymentProofUpload from '../../components/payment/PaymentProofUpload'
import { useOrders } from '../../hooks/useOrders'
import { formatDate } from '../../utils/dateFormatter'
import { formatPrice } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'

const PaymentProofPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { getOrderById } = useOrders()

  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orderData = await getOrderById(orderId!)
      setOrder(orderData)
    } catch (error) {
      toast.error('Failed to load order details')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = () => {
    setUploadSuccess(true)
    setShowUploadForm(false)
    loadOrder() // Refresh order data
    toast.success('Payment proof uploaded successfully!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-700"
          >
            Go to Orders
          </button>
        </div>
      </div>
    )
  }

  const hasExistingProof = order.paymentProof && order.paymentProof.status

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Order
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Bank Transfer Payment Proof</h1>
                <p className="text-gray-600">Order #{order.invoiceNumber || order._id.slice(-8)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Amount to Pay</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Bank Details */}
          <div className="lg:col-span-2">
            {/* Bank Transfer Instructions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-blue-600" />
                Bank Transfer Details
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Important Instructions</h4>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li>1. Transfer the exact amount to the bank account below</li>
                  <li>2. Include Order ID in transaction description</li>
                  <li>3. Take a screenshot of successful transaction</li>
                  <li>4. Upload the screenshot using the form</li>
                  <li>5. Your order will be processed within 24-48 hours after verification</li>
                </ol>
              </div>

              {/* Bank Account Details */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-bold text-gray-900 mb-4">Our Bank Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bank Name</p>
                    <p className="font-medium">Habib Bank Limited (HBL)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Name</p>
                    <p className="font-medium">BlackCart.store</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Account Number</p>
                    <p className="font-medium">1234567890123456</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">IBAN</p>
                    <p className="font-medium">PK00HABB1234567890123456</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Branch Code</p>
                    <p className="font-medium">1234</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Branch Name</p>
                    <p className="font-medium">Islamia Town Street# 3rd, Peshawar</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-1">
                        Transaction Reference Required
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Please include your Order ID <strong>#{order._id.slice(-8)}</strong> in the transaction description/reference.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Proof Status */}
            {hasExistingProof && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Existing Payment Proof Status
                </h2>
                
                <div className={`p-4 rounded-lg ${
                  order.paymentProof.status === 'approved' ? 'bg-green-50 border border-green-200' :
                  order.paymentProof.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                  'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {order.paymentProof.status === 'approved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      ) : order.paymentProof.status === 'rejected' ? (
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      )}
                      <span className={`font-medium ${
                        order.paymentProof.status === 'approved' ? 'text-green-800' :
                        order.paymentProof.status === 'rejected' ? 'text-red-800' :
                        'text-yellow-800'
                      }`}>
                        {order.paymentProof.status === 'approved' ? 'Approved' :
                         order.paymentProof.status === 'rejected' ? 'Rejected' :
                         'Under Review'}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.paymentProof.uploadedAt)}
                    </span>
                  </div>
                  
                  {order.paymentProof.status === 'approved' ? (
                    <p className="text-sm text-green-700">
                      Your payment has been verified. Your order is now being processed.
                    </p>
                  ) : order.paymentProof.status === 'rejected' ? (
                    <div>
                      <p className="text-sm text-red-700 mb-2">
                        Your payment proof was rejected. Reason: {order.paymentProof.reviewNotes || 'Not specified'}
                      </p>
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Upload new proof
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-yellow-700">
                      Your payment proof is under review. This usually takes 24-48 hours.
                    </p>
                  )}
                </div>

                {/* Proof Details */}
                <div className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transaction Reference:</span>
                    <span className="text-sm font-medium">{order.paymentProof.transactionRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank Name:</span>
                    <span className="text-sm font-medium">{order.paymentProof.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transaction Date:</span>
                    <span className="text-sm font-medium">
                      {formatDate(order.paymentProof.transactionDate)}
                    </span>
                  </div>
                </div>

                {/* Proof Image */}
                {order.paymentProof.imageUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Proof</h4>
                    <img
                      src={order.paymentProof.imageUrl}
                      alt="Payment proof"
                      className="w-full max-w-md border border-gray-200 rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Upload Form */}
            {(!hasExistingProof || showUploadForm) && (
              <div className="mb-6">
                <PaymentProofUpload
                  orderId={orderId!}
                  onSuccess={handleUploadSuccess}
                  onCancel={() => setShowUploadForm(false)}
                  initialData={{
                    transactionRef: `ORD-${order._id.slice(-8)}`,
                    bankName: 'Habib Bank Limited (HBL)',
                  }}
                />
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Proof Uploaded Successfully!</h3>
                <p className="text-gray-600 mb-4">
                  Your payment proof has been submitted for review. We'll notify you via email once verified.
                </p>
                <button
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
                >
                  Go to Order
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Timeline & Help */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4">Payment Process Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                    <span className="text-white text-xs">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                    <p className="text-sm text-gray-600">Transfer amount to our bank account</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    hasExistingProof ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <span className={`text-xs ${hasExistingProof ? 'text-white' : 'text-gray-600'}`}>2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Upload Proof</h4>
                    <p className="text-sm text-gray-600">Upload transaction screenshot</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    order.paymentProof?.status === 'approved' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <span className={`text-xs ${
                      order.paymentProof?.status === 'approved' ? 'text-white' : 'text-gray-600'
                    }`}>3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Verification</h4>
                    <p className="text-sm text-gray-600">Admin reviews your proof (24-48 hours)</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    order.paymentProof?.status === 'approved' ? 'bg-blue-600' : 'bg-gray-300'
                  }`}>
                    <span className={`text-xs ${
                      order.paymentProof?.status === 'approved' ? 'text-white' : 'text-gray-600'
                    }`}>4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Order Processing</h4>
                    <p className="text-sm text-gray-600">Order shipped after verification</p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Need Help?</h4>
                <div className="space-y-2">
                  <a
                    href="mailto:accounts@blackcart.com"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    accounts@blackcart.com
                  </a>
                  <a
                    href="tel:+9242111222333"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    +92 3146965599 (Accounts)
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  For payment-related queries, contact our accounts department.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentProofPage

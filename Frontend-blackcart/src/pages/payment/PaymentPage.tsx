// src/pages/payment/PaymentPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CreditCard, Smartphone, Building, Wallet, CheckCircle, Lock, Shield, ArrowLeft } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import { formatPrice } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'

const PaymentPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { getOrderById, getPaymentMethods, createPaymentRequest } = useOrders()

  const [order, setOrder] = useState<any>(null)
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadOrderAndMethods()
  }, [orderId])

  const loadOrderAndMethods = async () => {
    try {
      setLoading(true)
      const orderData = await getOrderById(orderId!)
      setOrder(orderData)
      
      const methodsData = await getPaymentMethods(orderData.totalPrice)
      setPaymentMethods(methodsData)
      
      // Select first available method
      if (methodsData.length > 0) {
        setSelectedMethod(methodsData[0].id)
      }
    } catch (error) {
      toast.error('Failed to load order details')
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Please select a payment method')
      return
    }

    try {
      setProcessing(true)
      const response = await createPaymentRequest(orderId!, selectedMethod)
      
      // Handle different payment methods
      switch (selectedMethod) {
        case 'easypaisa':
        case 'jazzcash':
        case 'sadapay':
        case 'nayapay':
          // Redirect to payment gateway
          if (response.paymentUrl) {
            window.location.href = response.paymentUrl
          }
          break
          
        case 'bank_transfer':
          // Show bank details and proof upload
          navigate(`/payment/proof/${orderId}`)
          break
          
        case 'cod':
          // COD - just confirm order
          toast.success('COD selected! You will pay when you receive the order.')
          navigate(`/orders/${orderId}`)
          break
          
        case 'card':
          // Handle card payment (would integrate with payment gateway)
          if (response.paymentUrl) {
            window.location.href = response.paymentUrl
          }
          break
          
        default:
          toast.success('Payment request created!')
          navigate(`/orders/${orderId}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
    } finally {
      setProcessing(false)
    }
  }

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'easypaisa':
      case 'jazzcash':
      case 'sadapay':
      case 'nayapay':
        return Smartphone
      case 'bank_transfer':
        return Building
      case 'cod':
        return Wallet
      case 'card':
        return CreditCard
      default:
        return CreditCard
    }
  }

  const getMethodDescription = (methodId: string) => {
    const descriptions: Record<string, string> = {
      'easypaisa': 'Pay via EasyPaisa mobile account or EasyPaisa Shop',
      'jazzcash': 'Pay via JazzCash mobile account or JazzCash Shop',
      'sadapay': 'Pay via SadaPay mobile wallet or card',
      'nayapay': 'Pay via NayaPay mobile wallet',
      'bank_transfer': 'Transfer amount to our bank account and upload proof',
      'cod': 'Pay cash when you receive your order',
      'card': 'Pay via debit/credit card (Visa/MasterCard)',
    }
    return descriptions[methodId] || 'Secure online payment'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Order
          </button>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
                <p className="text-gray-600">Order #{order.invoiceNumber || order._id.slice(-8)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatPrice(order.totalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                Select Payment Method
              </h2>
              
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = getMethodIcon(method.id)
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-3 ${
                            selectedMethod === method.id
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{method.name}</h3>
                            <p className="text-sm text-gray-500">
                              {getMethodDescription(method.id)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {selectedMethod === method.id ? (
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                          )}
                        </div>
                      </div>
                      
                      {/* Method Details */}
                      {selectedMethod === method.id && method.details && (
                        <div className="mt-4 pl-11">
                          <div className="bg-gray-50 rounded-lg p-4">
                            {method.id === 'bank_transfer' ? (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Bank Transfer Details</h4>
                                <div className="text-sm">
                                  <p><strong>Bank:</strong> {method.details.bankName}</p>
                                  <p><strong>Account Name:</strong> {method.details.accountName}</p>
                                  <p><strong>Account Number:</strong> {method.details.accountNumber}</p>
                                  <p><strong>IBAN:</strong> {method.details.iban}</p>
                                </div>
                              </div>
                            ) : method.id === 'cod' ? (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
                                <p className="text-sm text-gray-600">
                                  Pay with cash when your order is delivered. 
                                  {method.codCharges > 0 && (
                                    <span> Additional COD charges: {formatPrice(method.codCharges)}</span>
                                  )}
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">{method.details}</p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Charges or Notes */}
                      {method.charges && method.charges > 0 && (
                        <div className="mt-2 pl-11">
                          <p className="text-sm text-red-600">
                            + {formatPrice(method.charges)} charges apply
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {order.orderItems.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-2">
                    <div className="flex items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(order.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatPrice(order.shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatPrice(order.taxPrice)}</span>
                  </div>
                  {order.coupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({order.coupon.code})</span>
                      <span>-{formatPrice(order.coupon.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3">
                    <span>Total</span>
                    <span>{formatPrice(order.totalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Button & Security */}
          <div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <Lock className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-bold text-gray-900">Secure Payment</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">PCI DSS compliant</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Shield className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">No card details stored</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing || !selectedMethod}
                className={`w-full py-4 rounded-lg font-bold text-white transition-colors mb-4 ${
                  processing || !selectedMethod
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  `Pay ${formatPrice(order.totalPrice)}`
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mb-6">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>

              {/* Contact Support */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Our support team is here to help with your payment.
                </p>
                <div className="space-y-2">
                  <a
                    href="mailto:blackcart.ak25@gmail.com"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    blackcart.ak25@gmail.com
                  </a>
                  <a
                    href="tel:+9242111222333"
                    className="block text-sm text-blue-600 hover:text-blue-700"
                  >
                    +92 3146965599
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage

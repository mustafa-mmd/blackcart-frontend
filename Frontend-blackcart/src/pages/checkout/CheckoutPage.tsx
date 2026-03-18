// src/pages/checkout/CheckoutPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingBag, MapPin, CreditCard, CheckCircle,
  ArrowLeft, AlertCircle, Shield, Truck,
  ChevronRight, Home, Check, Smartphone, Wallet, Building
} from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useQuery, useMutation } from '@tanstack/react-query'
import { orderService } from '../../services/orderService'
import { userService } from '../../services/userService'
import { paymentService } from '../../services/paymentService'
import toast from 'react-hot-toast'
import PrivateRoute from '../../components/common/PrivateRoute'
import AddressForm from './AddressForm'
import PaymentMethods from './PaymentMethods'
import Loader from '../../components/common/Loader'
import { pakistanCities } from '../../utils/pakistanCities'

// ─── Constants ────────────────────────────────────────────────────────────────
const FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'150\' height=\'150\' viewBox=\'0 0 150 150\'%3E%3Crect width=\'150\' height=\'150\' fill=\'%23f0f0f0\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'Arial\' font-size=\'14\' fill=\'%23999\'%3ENo Image%3C/text%3E%3C/svg%3E'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com'

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrderSummary {
  subtotal: number
  shipping: number
  discount: number
  total: number
}

interface PaymentMethod {
  id: string
  name: string
  type: string
  description: string
  icon: string
  processingTime: string
  minAmount: number
  maxAmount: number
  charges?: number
  enabled: boolean
}

interface Address {
  _id?: string
  fullName: string
  name?: string
  address: string
  city: string
  province?: string
  postalCode: string
  country: string
  phone: string
  type?: string
  isDefault?: boolean
}

// ─── Helper functions ────────────────────────────────────────────────────────
const getItemImageUrl = (item: any): string => {
  if (!item) return FALLBACK_IMAGE

  // Direct image from cart item (when added directly)
  if (item.image) {
    if (typeof item.image === 'string') {
      if (item.image.startsWith('http://') || item.image.startsWith('https://') || item.image.startsWith('data:')) {
        return item.image
      }
      if (item.image.startsWith('/uploads')) {
        return `${API_BASE_URL}${item.image}`
      }
      return `${API_BASE_URL}/uploads/${item.image}`
    }
  }

  // Nested product object (from cart context)
  const productData = item.product || item

  if (!productData) return FALLBACK_IMAGE

  // Check for images array first (most common)
  if (productData.images && Array.isArray(productData.images) && productData.images.length > 0) {
    const firstImage = productData.images[0]
    
    if (typeof firstImage === 'string') {
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://') || firstImage.startsWith('data:')) {
        return firstImage
      }
      if (firstImage.startsWith('/uploads')) {
        return `${API_BASE_URL}${firstImage}`
      }
      return `${API_BASE_URL}/uploads/${firstImage}`
    }
    
    if (firstImage && typeof firstImage === 'object') {
      const url = firstImage.url || firstImage.path || ''
      if (url) {
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
          return url
        }
        if (url.startsWith('/uploads')) {
          return `${API_BASE_URL}${url}`
        }
        return `${API_BASE_URL}/uploads/${url}`
      }
    }
  }

  // Check for single image property
  if (productData.image) {
    if (typeof productData.image === 'string') {
      if (productData.image.startsWith('http://') || productData.image.startsWith('https://') || productData.image.startsWith('data:')) {
        return productData.image
      }
      if (productData.image.startsWith('/uploads')) {
        return `${API_BASE_URL}${productData.image}`
      }
      return `${API_BASE_URL}/uploads/${productData.image}`
    }
  }

  return FALLBACK_IMAGE
}

const getItemName = (item: any): string => {
  if (!item) return 'Product'
  const productData = item.product || item
  return productData.name || 'Product'
}

const getItemPrice = (item: any): number => {
  if (!item) return 0
  const productData = item.product || item
  return productData.discountPrice || productData.price || 0
}

const getItemId = (item: any): string => {
  if (!item) return ''
  const productData = item.product || item
  return productData._id || ''
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate()
  const { cartItems, clearCart } = useCart()
  const { user } = useAuth()

  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod')
  const [orderNotes, setOrderNotes] = useState('')
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [shippingEstimate, setShippingEstimate] = useState({ price: 200, days: '3-5' })
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>([])
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)

  // Get addresses
  const { data: addressesData, refetch: refetchAddresses, isLoading: addressesLoading } = useQuery({
    queryKey: ['userAddresses'],
    queryFn: () => userService.getAddresses(),
    enabled: !!user,
  })
  
  const addresses: Address[] = React.useMemo(() => {
    if (!addressesData) return []
    if (Array.isArray(addressesData)) return addressesData
    if (addressesData.data && Array.isArray(addressesData.data)) return addressesData.data
    if (addressesData.addresses && Array.isArray(addressesData.addresses)) return addressesData.addresses
    return []
  }, [addressesData])

  // Calculate totals
  const orderSummary: OrderSummary = React.useMemo(() => {
    const itemsPrice = cartItems.reduce((total, item) => {
      return total + (getItemPrice(item) * (item.quantity || 1))
    }, 0)
    const shipping = shippingEstimate.price || 0
    return { 
      subtotal: itemsPrice, 
      shipping, 
      discount: 0, 
      total: itemsPrice + shipping 
    }
  }, [cartItems, shippingEstimate])

  // Load payment methods
  useEffect(() => {
    if (orderSummary.total > 0 && selectedAddress?.city) {
      loadPaymentMethods()
    }
  }, [orderSummary.total, selectedAddress?.city])

  const loadPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods(orderSummary.total, selectedAddress?.city)
      setAvailablePaymentMethods(methods)
      // Always set COD as selected
      setSelectedPaymentMethod('cod')
    } catch (error) {
      console.error('Failed to load payment methods:', error)
      toast.error('Failed to load payment methods')
    }
  }

  // Default address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]
      setSelectedAddress(defaultAddress)
    }
  }, [addresses])

  // Shipping cost
  useEffect(() => {
    if (selectedAddress?.city) {
      const cityData = pakistanCities.find(c => c.name === selectedAddress.city)
      if (cityData) {
        setShippingEstimate({
          price: orderSummary.subtotal >= 5000 ? 0 : cityData.shippingCost,
          days: `${cityData.minDeliveryDays}-${cityData.maxDeliveryDays}`,
        })
      }
    }
  }, [selectedAddress, orderSummary.subtotal])

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => orderService.createOrder(orderData),
    onSuccess: (data) => {
      const orderId = data.data?.order?._id || data.order?._id
      if (!orderId) {
        console.error('No order ID in response:', data)
        toast.error('Order created but no ID returned')
        return
      }
      
      setCreatedOrderId(orderId)
      setIsPlacingOrder(false)
      
      if (selectedPaymentMethod === 'cod') {
        toast.success('Order placed successfully!')
        clearCart()
        navigate(`/orders/${orderId}`)
      } else {
        // For other payment methods, you might want to redirect to payment page
        navigate(`/payment/${orderId}`)
      }
    },
    onError: (error: any) => {
      console.error('Order error:', error.response?.data || error)
      toast.error(error.response?.data?.message || error.message || 'Failed to create order')
      setIsPlacingOrder(false)
    },
  })

  // Build order items
  const buildOrderItems = () =>
    cartItems.map(item => {
      const imageUrl = getItemImageUrl(item)
      
      return {
        product: getItemId(item),
        name: getItemName(item),
        image: imageUrl,
        price: getItemPrice(item),
        quantity: item.quantity || 1,
        sku: item.sku || `SKU-${getItemId(item).slice(-6)}`,
      }
    })

  const buildOrderData = () => ({
    orderItems: buildOrderItems(),
    shippingAddress: {
      fullName: selectedAddress?.fullName || selectedAddress?.name || '',
      address: selectedAddress?.address || '',
      city: selectedAddress?.city || '',
      postalCode: selectedAddress?.postalCode || '',
      country: selectedAddress?.country || 'Pakistan',
      phone: selectedAddress?.phone || '',
    },
    paymentMethod: selectedPaymentMethod,
    itemsPrice: orderSummary.subtotal,
    shippingPrice: orderSummary.shipping,
    taxPrice: 0,
    totalPrice: orderSummary.total,
    notes: orderNotes || '',
  })

  const validateBeforeOrder = (): boolean => {
    if (!selectedAddress) { 
      toast.error('Please select a shipping address')
      setStep(1)
      return false 
    }
    if (!selectedPaymentMethod) { 
      toast.error('Please select a payment method')
      return false 
    }
    if (cartItems.length === 0) { 
      toast.error('Your cart is empty')
      navigate('/products')
      return false 
    }
    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateBeforeOrder()) return
    setIsPlacingOrder(true)
    try {
      await createOrderMutation.mutateAsync(buildOrderData())
    } catch (error: any) {
      console.error('❌ COD order error:', error)
      setIsPlacingOrder(false)
    }
  }

  const handlePaymentInitiate = async (): Promise<string | null> => {
    if (!validateBeforeOrder()) return null
    setIsPlacingOrder(true)
    try {
      const result = await createOrderMutation.mutateAsync({
        ...buildOrderData(),
        paymentStatus: 'pending_payment',
      })
      return result.data?.order?._id || result.order?._id
    } catch (error: any) {
      console.error('❌ Order creation error:', error)
      setIsPlacingOrder(false)
      return null
    }
  }

  const handlePaymentComplete = (success: boolean, orderId?: string) => {
    if (success && orderId) {
      toast.success('Payment successful! Your order has been confirmed.')
      clearCart()
      navigate(`/orders/${orderId}`)
    } else {
      toast.error('Payment was not completed. Your order is saved but not confirmed.')
    }
  }

  // ✅ FIXED: handleAddressSubmit function
  const handleAddressSubmit = async (data: any) => {
    try {
      console.log('📤 Submitting address data:', data);
      
      // Find province from city using pakistanCities
      const cityData = pakistanCities.find(c => c.name === data.city);
      
      if (!cityData) {
        toast.error('Invalid city selected');
        return;
      }
      
      // Transform data to match backend Address model
      const addressData = {
        fullName: data.fullName,
        name: data.fullName, // Backend requires both
        address: data.address,
        city: data.city,
        province: cityData.province,
        postalCode: data.postalCode || '',
        country: 'Pakistan',
        phone: data.phone,
        type: data.type || 'home',
        isDefault: data.isDefault || false
      };
      
      console.log('📤 Transformed address data:', addressData);
      
      const response = await userService.addAddress(addressData);
      
      console.log('📥 Address response:', response);
      
      // Get the new address from response (handle different response structures)
      let newAddress = null;
      
      if (response.data?.data) {
        newAddress = response.data.data;
      } else if (response.data) {
        newAddress = response.data;
      } else if (response.address) {
        newAddress = response.address;
      } else {
        newAddress = response;
      }
      
      if (!newAddress || !newAddress._id) {
        console.error('Invalid response structure:', response);
        toast.error('Address saved but could not get the new address');
        
        // Still refresh and continue
        await refetchAddresses();
        setShowNewAddressForm(false);
        setStep(2);
        return;
      }
      
      toast.success('Address saved successfully');
      
      // Refresh addresses list
      await refetchAddresses();
      
      // Set the new address as selected
      setSelectedAddress(newAddress);
      setShowNewAddressForm(false);
      
      // Move to next step
      setStep(2);
      toast.success('Address selected, continuing to payment');
      
    } catch (error: any) {
      console.error('❌ Full error object:', error);
      console.error('❌ Error response data:', error.response?.data);
      
      // Show more specific error message
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message || 
        'Failed to save address';
      
      toast.error(errorMessage);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address)
    setStep(2)
    toast.success('Address selected')
  }

  const handlePaymentSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId)
    const method = availablePaymentMethods.find(m => m.id === methodId)
    if (method) toast.success(`${method.name} selected`)
  }

  const steps = [
    { number: 1, title: 'Shipping', icon: MapPin },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Confirm',  icon: CheckCircle },
  ]

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some products to your cart before checkout</p>
          <button onClick={() => navigate('/products')} className="btn-primary">Start Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-lg section-padding">
          <div className="mb-8">
            <button onClick={() => navigate('/cart')} className="flex items-center text-gray-600 hover:text-primary-600 mb-4">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your purchase in a few simple steps</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {steps.map((stepItem, index) => {
                const StepIcon = stepItem.icon
                const isActive = step >= stepItem.number
                const isCompleted = step > stepItem.number
                return (
                  <div key={stepItem.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isActive ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {isCompleted ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                      </div>
                      <span className={`text-sm font-medium ${isActive ? 'text-primary-600' : 'text-gray-500'}`}>{stepItem.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 ${isCompleted ? 'bg-primary-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    {addressesLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader size="md" />
                      </div>
                    ) : addresses.length > 0 && !showNewAddressForm ? (
                      <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Shipping Address</h2>
                        <div className="space-y-4">
                          {addresses.map((address: any) => (
                            <div
                              key={address._id}
                              onClick={() => handleAddressSelect(address)}
                              className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary-500 hover:shadow-md ${selectedAddress?._id === address._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                  <Home className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                  <div>
                                    <h3 className="font-medium text-gray-900">
                                      {address.fullName || address.name}
                                      {address.isDefault && <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Default</span>}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">{address.address}, {address.city}, {address.postalCode}</p>
                                    <p className="text-gray-500 text-sm mt-1">📞 {address.phone}</p>
                                  </div>
                                </div>
                                {selectedAddress?._id === address._id && <Check className="h-5 w-5 text-primary-600" />}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => setShowNewAddressForm(true)}
                          className="w-full mt-4 py-3 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-primary-600 hover:border-primary-500 transition-colors"
                        >
                          + Add New Address
                        </button>
                      </div>
                    ) : (
                      <div className="card p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Shipping Address</h2>
                        <AddressForm 
                          onSubmit={handleAddressSubmit} 
                          initialData={selectedAddress || undefined}
                          onCancel={() => addresses.length > 0 ? setShowNewAddressForm(false) : null}
                        />
                        {addresses.length > 0 && (
                          <button
                            onClick={() => setShowNewAddressForm(false)}
                            className="mt-4 text-sm text-primary-600 hover:text-primary-700"
                          >
                            ← Back to saved addresses
                          </button>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button onClick={() => navigate('/cart')} className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                        Back to Cart
                      </button>
                      <button
                        onClick={() => selectedAddress ? setStep(2) : toast.error('Please select or add an address')}
                        disabled={!selectedAddress}
                        className="btn-primary px-6 py-3 flex items-center"
                      >
                        Continue to Payment <ChevronRight className="h-5 w-5 ml-2" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <div className="card p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-blue-500">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">How checkout works</p>
                          <p className="text-xs text-blue-700 mt-1">
                            {selectedPaymentMethod === 'cod'
                              ? 'Cash on Delivery: Click the button below to confirm your order. Pay when it arrives.'
                              : 'Select a payment method and click "Pay PKR X" to complete your purchase.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>
                      
                      {/* Only COD is displayed */}
                      <div className="space-y-3">
                        {/* Cash on Delivery */}
                        <div 
                          onClick={() => handlePaymentSelect('cod')}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedPaymentMethod === 'cod' 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <Wallet className="h-6 w-6 text-gray-600 mr-3" />
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900">Cash on Delivery</h3>
                              <p className="text-sm text-gray-500">Pay with cash when your order is delivered</p>
                            </div>
                            {selectedPaymentMethod === 'cod' && (
                              <Check className="h-5 w-5 text-primary-600" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hidden PaymentMethods component for functionality */}
                      <div className="hidden">
                        <PaymentMethods
                          selectedMethod={selectedPaymentMethod}
                          onMethodSelect={handlePaymentSelect}
                          orderTotal={orderSummary.total}
                          orderId={createdOrderId || undefined}
                          customerDetails={{
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: selectedAddress?.phone || '',
                          }}
                          city={selectedAddress?.city}
                          onPaymentComplete={handlePaymentComplete}
                          onPlaceOrder={handlePlaceOrder}
                          onPaymentInitiate={handlePaymentInitiate}
                        />
                      </div>
                    </div>

                    <div className="card p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes (Optional)</h2>
                      <textarea
                        value={orderNotes}
                        onChange={e => setOrderNotes(e.target.value)}
                        placeholder="Add special instructions for your order..."
                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <ArrowLeft className="h-5 w-5 mr-2" /> Back to Shipping
                      </button>
                      <button
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder}
                        className="btn-primary px-8 py-3 flex items-center"
                      >
                        {isPlacingOrder ? (
                          <>
                            <Loader size="sm" />
                            <span className="ml-2">Placing Order...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Place Order (COD)
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                {/* Cart items with images */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map((item, index) => {
                    const imageUrl = getItemImageUrl(item)
                    const itemPrice = getItemPrice(item)
                    const quantity = item.quantity || 1
                    const itemName = getItemName(item)

                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {imageUrl && imageUrl !== FALLBACK_IMAGE ? (
                            <img
                              src={imageUrl}
                              alt={itemName}
                              className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                              onError={(e) => { 
                                e.currentTarget.src = FALLBACK_IMAGE 
                              }}
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                              <ShoppingBag className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{itemName}</p>
                          <p className="text-xs text-gray-500">PKR {itemPrice.toLocaleString()} × {quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 flex-shrink-0">
                          PKR {(itemPrice * quantity).toLocaleString()}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-gray-100 mb-4" />

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                    <span className="font-medium">PKR {orderSummary.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {orderSummary.shipping === 0 ? <span className="text-green-600">Free</span> : `PKR ${orderSummary.shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span>PKR {orderSummary.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-1">
                    <Truck className="h-4 w-4 text-primary-600 mr-2" />
                    <span className="text-sm font-medium">Estimated Delivery</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {shippingEstimate.days} business days
                    {shippingEstimate.price === 0 && <span className="block text-green-600 font-medium mt-0.5">🎉 Free Shipping!</span>}
                  </p>
                </div>

                {selectedPaymentMethod === 'cod' && orderSummary.subtotal < 5000 && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-medium text-yellow-800">COD Charges Apply</h4>
                        <p className="text-xs text-yellow-700 mt-0.5">PKR 200 added for orders below PKR 5,000</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start text-xs text-gray-500">
                  <Shield className="h-4 w-4 mr-2 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Your payment information is encrypted and secure. We don't store card details.</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}

export default CheckoutPage
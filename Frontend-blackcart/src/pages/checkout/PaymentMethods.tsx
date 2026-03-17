import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Building, Wallet, Truck, Lock,
  Smartphone, CheckCircle, AlertCircle,
  Clock, ChevronRight, Shield, Phone, Zap,
  ArrowRight
} from 'lucide-react'
import { getPaymentMethods, SUPPORT_INFO } from '../../data/paymentMethods'
import { realPaymentService } from '../../services/realPaymentService'
import PaymentQRModal from '../../components/payment/PaymentQRModal'
import BankTransferDetails from '../../components/payment/BankTransferDetails'
import PaymentProcessingModal from '../../components/payment/PaymentProcessingModal'
import PaymentTimer from '../../components/payment/PaymentTimer'
import toast from 'react-hot-toast'

interface PaymentMethodsProps {
  selectedMethod: string
  onMethodSelect: (methodId: string) => void
  orderTotal: number
  orderId?: string
  customerDetails?: {
    name: string
    email: string
    phone: string
  }
  city?: string
  onPaymentComplete?: (success: boolean, orderId?: string) => void
  /** Called for COD — creates order immediately, no payment needed */
  onPlaceOrder?: () => void
  /**
   * Called for online payment methods instead of onPlaceOrder.
   * Creates the order first (status: pending_payment), returns the orderId,
   * then PaymentMethods contacts the payment gateway with that orderId.
   * Order is only confirmed by the backend after payment succeeds.
   */
  onPaymentInitiate?: () => Promise<string | null>
}

// =============================================================================
//  TAILWIND PURGE FIX — static class lookup helpers
//
//  Dynamic strings like `bg-${color}-600` are invisible to Tailwind's scanner
//  and get purged from the CSS bundle. This caused NayaPay (indigo) and
//  Bank Transfer (yellow) buttons to be completely invisible (white on white).
//  All colour-dependent classNames now return complete static strings.
// =============================================================================

const cardCls = (id: string, selected: boolean, available: boolean): string => {
  const base = 'p-4 rounded-xl border-2 cursor-pointer transition-all'
  const dim  = available ? '' : ' opacity-60'
  if (!selected) return `${base} border-gray-200 hover:border-gray-300 hover:bg-gray-50${dim}`
  const map: Record<string, string> = {
    easypaisa:    `${base} border-blue-500   bg-blue-50`,
    jazzcash:     `${base} border-green-500  bg-green-50`,
    sadapay:      `${base} border-purple-500 bg-purple-50`,
    nayapay:      `${base} border-indigo-500 bg-indigo-50`,
    bank_transfer:`${base} border-yellow-500 bg-yellow-50`,
    card:         `${base} border-red-500    bg-red-50`,
    cod:          `${base} border-orange-500 bg-orange-50`,
  }
  return (map[id] ?? `${base} border-blue-500 bg-blue-50`) + dim
}

const iconCls = (id: string, selected: boolean): string => {
  const base = 'p-3 rounded-lg mr-3'
  if (!selected) return `${base} bg-gray-100 text-gray-600`
  const map: Record<string, string> = {
    easypaisa:    `${base} bg-blue-100   text-blue-600`,
    jazzcash:     `${base} bg-green-100  text-green-600`,
    sadapay:      `${base} bg-purple-100 text-purple-600`,
    nayapay:      `${base} bg-indigo-100 text-indigo-600`,
    bank_transfer:`${base} bg-yellow-100 text-yellow-600`,
    card:         `${base} bg-red-100    text-red-600`,
    cod:          `${base} bg-orange-100 text-orange-600`,
  }
  return map[id] ?? `${base} bg-blue-100 text-blue-600`
}

const checkCls = (id: string): string => ({
  easypaisa:    'h-5 w-5 text-blue-500',
  jazzcash:     'h-5 w-5 text-green-500',
  sadapay:      'h-5 w-5 text-purple-500',
  nayapay:      'h-5 w-5 text-indigo-500',
  bank_transfer:'h-5 w-5 text-yellow-500',
  card:         'h-5 w-5 text-red-500',
  cod:          'h-5 w-5 text-orange-500',
} as Record<string, string>)[id] ?? 'h-5 w-5 text-blue-500'

const titleCls = (id: string): string => ({
  easypaisa:    'font-bold text-blue-600   mb-4 flex items-center',
  jazzcash:     'font-bold text-green-600  mb-4 flex items-center',
  sadapay:      'font-bold text-purple-600 mb-4 flex items-center',
  nayapay:      'font-bold text-indigo-600 mb-4 flex items-center',
  bank_transfer:'font-bold text-yellow-600 mb-4 flex items-center',
  card:         'font-bold text-red-600    mb-4 flex items-center',
  cod:          'font-bold text-orange-600 mb-4 flex items-center',
} as Record<string, string>)[id] ?? 'font-bold text-blue-600 mb-4 flex items-center'

const payBtnCls = (id: string, disabled: boolean): string => {
  const base = 'w-full py-4 rounded-lg font-bold text-white transition-colors flex items-center justify-center'
  if (disabled) return `${base} bg-gray-400 cursor-not-allowed`
  return ({
    easypaisa:    `${base} bg-blue-600   hover:bg-blue-700`,
    jazzcash:     `${base} bg-green-600  hover:bg-green-700`,
    sadapay:      `${base} bg-purple-600 hover:bg-purple-700`,
    nayapay:      `${base} bg-indigo-600 hover:bg-indigo-700`,
    bank_transfer:`${base} bg-yellow-600 hover:bg-yellow-700`,
    card:         `${base} bg-red-600    hover:bg-red-700`,
    cod:          `${base} bg-green-600  hover:bg-green-700`,
  } as Record<string, string>)[id] ?? `${base} bg-blue-600 hover:bg-blue-700`
}

// =============================================================================

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodSelect,
  orderTotal,
  orderId,
  customerDetails,
  city = 'Karachi',
  onPaymentComplete,
  onPlaceOrder,
  onPaymentInitiate,
}) => {
  const [showDetails, setShowDetails]           = useState<string | null>(null)
  const [processing, setProcessing]             = useState(false)
  const [paymentData, setPaymentData]           = useState<any>(null)
  const [showQRModal, setShowQRModal]           = useState(false)
  const [processingStatus, setProcessingStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [showProcessingModal, setShowProcessingModal] = useState(false)

  const allMethods = getPaymentMethods(orderTotal)

  // ─────────────────────────────────────────────────────────────────────────
  // handlePayment — the single entry point for all payment methods
  //
  // COD:
  //   → calls onPlaceOrder() directly. Order created, no payment needed.
  //
  // Online (easypaisa / jazzcash / sadapay / nayapay / card / bank_transfer):
  //   Step 1: If orderId already exists (order was created in a previous
  //           attempt), skip straight to payment API call.
  //   Step 2: If no orderId yet, call onPaymentInitiate() which:
  //             a) Creates the order with status "pending_payment"
  //             b) Returns the new orderId
  //           This ensures NO order is committed until user actively pays.
  //   Step 3: Call realPaymentService.createPayment() with the orderId.
  //   Step 4: Handle gateway response (redirect / QR / bank details).
  // ─────────────────────────────────────────────────────────────────────────
  const handlePayment = async (methodId: string) => {
    // ── COD: place order immediately, no payment ──────────────────────────
    if (methodId === 'cod') {
      onPlaceOrder?.()
      return
    }

    if (!customerDetails) { toast.error('Customer details required'); return }

    setProcessing(true)
    setShowProcessingModal(true)
    setProcessingStatus('processing')

    try {
      // ── Step 1: Get or create orderId ─────────────────────────────────
      let activeOrderId = orderId

      if (!activeOrderId) {
        if (!onPaymentInitiate) {
          toast.error('Payment setup incomplete. Please refresh.')
          setProcessing(false)
          setShowProcessingModal(false)
          return
        }

        // Dismiss the processing modal briefly while order is being created
        setShowProcessingModal(false)
        const newOrderId = await onPaymentInitiate()

        if (!newOrderId) {
          // onPaymentInitiate already showed an error toast
          setProcessing(false)
          return
        }

        activeOrderId = newOrderId
        setShowProcessingModal(true)  // re-show for payment processing
      }

      // ── Step 2: Contact payment gateway ───────────────────────────────
      const response = await realPaymentService.createPayment({
        orderId:       activeOrderId,
        paymentMethod: methodId,
        amount:        orderTotal,
        customerName:  customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
      })

      if (response.success && response.data) {
        setPaymentData(response.data)
        setProcessingStatus('success')

        // ── Step 3: Handle gateway response ─────────────────────────────
        switch (methodId) {
          case 'easypaisa':
            if (response.data.paymentUrl)  { window.location.href = response.data.paymentUrl }
            else if (response.data.qrCode) { setShowQRModal(true); setShowProcessingModal(false) }
            else { toast.success('Payment initiated! Complete in EasyPaisa app'); setShowProcessingModal(false) }
            break

          case 'jazzcash':
            if (response.data.formData)        { realPaymentService.submitJazzCashForm(response.data); setShowProcessingModal(false) }
            else if (response.data.paymentUrl) { window.location.href = response.data.paymentUrl }
            else                               { setShowProcessingModal(false) }
            break

          case 'sadapay':
          case 'nayapay':
            if (response.data.paymentUrl)  { window.location.href = response.data.paymentUrl }
            else if (response.data.qrCode) { setShowQRModal(true); setShowProcessingModal(false) }
            else {
              toast.success(`Payment initiated via ${methodId === 'nayapay' ? 'NayaPay' : 'SadaPay'}!`)
              setShowProcessingModal(false)
            }
            break

          case 'card':
            if (response.data.paymentUrl)       { window.location.href = response.data.paymentUrl }
            else if (response.data.clientSecret){ toast.success('Redirecting to secure payment...'); setShowProcessingModal(false) }
            else                                { setShowProcessingModal(false) }
            break

          case 'bank_transfer':
            // Bank details rendered by BankTransferDetails after paymentData is set
            setShowProcessingModal(false)
            toast.success('Bank transfer details ready! Transfer the exact amount shown below.')
            break

          default:
            setShowProcessingModal(false)
        }
      } else {
        setProcessingStatus('error')
        toast.error(response.error || 'Payment failed. Please try again.')
        setShowProcessingModal(false)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      setProcessingStatus('error')
      toast.error(error.message || 'Payment failed. Please try again.')
      setShowProcessingModal(false)
    } finally {
      setProcessing(false)
    }
  }

  const handleBankProofUpload = async (file: File) => {
    const activeOrderId = orderId
    if (!activeOrderId) return

    const formData = new FormData()
    formData.append('proof', file)
    formData.append('transactionRef', paymentData?.transactionRef || `BANK-${Date.now()}`)
    formData.append('bankName', paymentData?.bankDetails?.bankName || 'Habib Bank Limited')
    formData.append('transactionDate', new Date().toISOString())
    formData.append('notes', `Payment for order ${activeOrderId}`)

    try {
      setShowProcessingModal(true)
      setProcessingStatus('processing')
      const response = await realPaymentService.uploadPaymentProof(activeOrderId, formData)
      if (response.success) {
        setProcessingStatus('success')
        toast.success('Payment proof uploaded! Awaiting verification.')
        onPaymentComplete?.(true, activeOrderId)
      } else {
        setProcessingStatus('error')
        toast.error(response.error || 'Failed to upload proof')
      }
    } catch {
      setProcessingStatus('error')
      toast.error('Failed to upload proof')
    }
  }

  const getMethodIcon = (id: string) => {
    switch (id) {
      case 'easypaisa':    return <Smartphone className="h-6 w-6" />
      case 'jazzcash':     return <Wallet className="h-6 w-6" />
      case 'sadapay':      return <Smartphone className="h-6 w-6" />
      case 'nayapay':      return <Smartphone className="h-6 w-6" />
      case 'bank_transfer':return <Building className="h-6 w-6" />
      case 'card':         return <CreditCard className="h-6 w-6" />
      case 'cod':          return <Truck className="h-6 w-6" />
      default:             return <CreditCard className="h-6 w-6" />
    }
  }

  const isAvailable = (method: typeof allMethods[0]) =>
    orderTotal >= method.minAmount && orderTotal <= method.maxAmount

  const sortedMethods = [...allMethods].sort((a, b) => {
    const order = ['easypaisa', 'jazzcash', 'sadapay', 'nayapay', 'card', 'bank_transfer', 'cod']
    return order.indexOf(a.id) - order.indexOf(b.id)
  })

  const selectedMethodData = sortedMethods.find(m => m.id === selectedMethod)

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

        <div className="flex items-center mb-6">
          <Lock className="h-6 w-6 text-primary-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Select Payment Method</h2>
        </div>

        {/* Payment method grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedMethods.map((method) => {
            const isSelected      = selectedMethod === method.id
            const methodAvailable = isAvailable(method)
            const isPakistaniWallet = ['easypaisa', 'jazzcash', 'sadapay', 'nayapay'].includes(method.id)

            return (
              <motion.div
                key={method.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onMethodSelect(method.id)}
                className={cardCls(method.id, isSelected, methodAvailable)}
              >
                <div className="flex items-start">
                  <div className={iconCls(method.id, isSelected)}>
                    {getMethodIcon(method.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {method.name}
                        {isPakistaniWallet && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center">
                            <Zap className="h-3 w-3 mr-1" /> Popular
                          </span>
                        )}
                        {method.id === 'cod' && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Cash</span>
                        )}
                      </h3>
                      {isSelected && <CheckCircle className={checkCls(method.id)} />}
                    </div>

                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>

                    <div className="flex flex-wrap gap-2 mt-2">
                      {method.processingTime === 'Instant' && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <Clock className="h-3 w-3 mr-1" /> Instant
                        </span>
                      )}
                      {method.charges && method.charges > 0 && (
                        <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          +PKR {method.charges.toLocaleString()}
                        </span>
                      )}
                      {!methodAvailable && (
                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          <AlertCircle className="h-3 w-3 mr-1" /> Limit: PKR {method.maxAmount.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); setShowDetails(showDetails === method.id ? null : method.id) }}
                      className="flex items-center text-sm text-primary-600 mt-2 hover:underline"
                    >
                      {showDetails === method.id ? 'Hide Details' : 'View Details'}
                      <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showDetails === method.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Details panel */}
        <AnimatePresence mode="wait">
          {selectedMethodData && showDetails === selectedMethod && (
            <motion.div
              key={selectedMethod}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-6 overflow-hidden"
            >
              <h3 className={titleCls(selectedMethod)}>
                {getMethodIcon(selectedMethod)}
                <span className="ml-2">{selectedMethodData.name}</span>
              </h3>

              {paymentData?.expiresAt && selectedMethod !== 'bank_transfer' && selectedMethod !== 'cod' && (
                <div className="mb-4 flex justify-end">
                  <PaymentTimer
                    expiresAt={paymentData.expiresAt}
                    onExpire={() => { toast.error('Payment session expired. Please try again.'); setPaymentData(null) }}
                  />
                </div>
              )}

              {/* Bank Transfer: show bank details only after API returns them */}
              {selectedMethod === 'bank_transfer' && paymentData?.bankDetails ? (
                <BankTransferDetails
                  bankDetails={paymentData.bankDetails}
                  orderId={orderId!}
                  amount={orderTotal}
                  onProofUpload={handleBankProofUpload}
                />
              ) : (
                <>
                  {/* Instructions */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">How to pay:</h4>
                    <ol className="space-y-2">
                      {selectedMethodData.instructions?.map((instruction, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="font-medium text-gray-900 mr-2">{index + 1}.</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Amount limit warning */}
                  {!isAvailable(selectedMethodData) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">Amount Limit Warning</h4>
                          <p className="text-xs text-red-700 mt-1">
                            This method supports up to PKR {selectedMethodData.maxAmount.toLocaleString()}.
                            Your total is PKR {orderTotal.toLocaleString()}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAY / PLACE ORDER button */}
                  {selectedMethod === 'cod' ? (
                    <button
                      onClick={() => handlePayment('cod')}
                      disabled={!isAvailable(selectedMethodData)}
                      className={payBtnCls('cod', !isAvailable(selectedMethodData))}
                    >
                      <Truck className="h-5 w-5 mr-2" />
                      Place Order (Cash on Delivery)
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handlePayment(selectedMethod)}
                        disabled={processing || !isAvailable(selectedMethodData)}
                        className={payBtnCls(selectedMethod, processing || !isAvailable(selectedMethodData))}
                      >
                        {processing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Pay PKR {orderTotal.toLocaleString()}
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Your order is confirmed only after payment is completed.
                      </p>
                    </>
                  )}

                  {/* Processing info */}
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">{selectedMethodData.processingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fee:</span>
                      <span className="font-medium">{selectedMethodData.fee || 'No fees'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Limit:</span>
                      <span className="font-medium">
                        PKR {selectedMethodData.minAmount.toLocaleString()} - {selectedMethodData.maxAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security badge */}
        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
            <div>
              <div className="font-medium text-green-800">Secure Payment Guaranteed</div>
              <p className="text-sm text-green-700 mt-1">256-bit SSL encryption • PCI-DSS compliant • No card details stored</p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-gray-600 mr-3" />
            <div className="text-sm text-gray-700">
              Need help? Contact{' '}
              <a href={`mailto:${SUPPORT_INFO.email}`} className="text-primary-600 hover:underline">{SUPPORT_INFO.email}</a>
              {' '}or call{' '}
              <a href={`tel:${SUPPORT_INFO.phone}`} className="text-primary-600 hover:underline">{SUPPORT_INFO.phone}</a>
            </div>
          </div>
        </div>
      </motion.div>

      {/* QR Modal */}
      <PaymentQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        qrCode={paymentData?.qrCode || ''}
        paymentData={paymentData}
        onPaymentComplete={() => { setShowQRModal(false); onPaymentComplete?.(true, orderId) }}
      />

      {/* Processing Modal */}
      <PaymentProcessingModal
        isOpen={showProcessingModal}
        status={processingStatus}
        message={
          processingStatus === 'processing' ? 'Connecting to payment gateway...' :
          processingStatus === 'success'    ? 'Payment completed successfully!' :
                                             'Payment failed. Please try again.'
        }
        onClose={() => {
          setShowProcessingModal(false)
          if (processingStatus === 'success') onPaymentComplete?.(true, orderId)
        }}
      />
    </>
  )
}

export default PaymentMethods
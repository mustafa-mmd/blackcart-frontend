// src/components/payment/PaymentProcessingModal.tsx
import React from 'react'
import { motion } from 'framer-motion'
import { Loader, CheckCircle, XCircle } from 'lucide-react'

interface PaymentProcessingModalProps {
  isOpen: boolean
  status: 'processing' | 'success' | 'error'
  message?: string
  onClose?: () => void
}

const PaymentProcessingModal: React.FC<PaymentProcessingModalProps> = ({
  isOpen,
  status,
  message,
  onClose
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-2xl max-w-sm w-full p-8 text-center"
      >
        {status === 'processing' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <Loader className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Processing Payment
            </h3>
            <p className="text-gray-600">
              {message || 'Please wait while we process your payment...'}
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              {message || 'Your payment has been confirmed.'}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
            >
              Continue
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-6">
              {message || 'Please try again or choose another method.'}
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default PaymentProcessingModal
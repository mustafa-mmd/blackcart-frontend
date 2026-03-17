// src/components/payment/PaymentQRModal.tsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Smartphone, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PaymentQRModalProps {
  isOpen: boolean
  onClose: () => void
  qrCode: string
  paymentData: any
}

const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  onClose,
  qrCode,
  paymentData
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Smartphone className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">
                Scan to Pay
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* QR Code */}
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4">
            <img
              src={qrCode}
              alt="Payment QR Code"
              className="w-full max-w-[250px] mx-auto"
            />
          </div>

          {/* Payment Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Amount:</span>
              <span className="font-bold text-lg">
                PKR {paymentData.amount?.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Transaction ID:</span>
              <div className="flex items-center">
                <span className="font-mono text-sm mr-2">{paymentData.transactionId}</span>
                <button
                  onClick={() => copyToClipboard(paymentData.transactionId, 'Transaction ID')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Expires in: {new Date(paymentData.expiresAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              How to Pay:
            </h4>
            <ol className="space-y-2 text-sm text-blue-700">
              {paymentData.instructions?.map((instruction: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="font-medium mr-2">{index + 1}.</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            I've Completed the Payment
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PaymentQRModal
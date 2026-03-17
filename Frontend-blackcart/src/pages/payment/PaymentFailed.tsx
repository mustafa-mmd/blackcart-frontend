// pages/payment/PaymentFailed.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { XCircle } from 'lucide-react'

const PaymentFailed: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-6">Your payment could not be processed. Please try again.</p>
        <Link to="/cart" className="btn-primary">
          Return to Cart
        </Link>
      </div>
    </div>
  )
}
export default PaymentFailed
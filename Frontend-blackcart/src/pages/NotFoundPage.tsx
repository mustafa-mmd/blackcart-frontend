import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search, AlertTriangle } from 'lucide-react'

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <Helmet>
        <title>404 — Page Not Found | BlackCart</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="text-center px-4">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>

          {/* Error Code */}
          <h1 className="text-9xl font-bold text-gray-900 mb-4">404</h1>
          
          {/* Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="btn-primary inline-flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            <Link
              to="/products"
              className="btn-secondary inline-flex items-center justify-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Browse Products
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-12 p-6 bg-white rounded-xl shadow-soft max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you believe this is an error, please contact our support team.
            </p>
            <Link
              to="/contact"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Contact Support →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFoundPage
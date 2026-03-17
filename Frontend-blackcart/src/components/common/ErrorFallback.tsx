// src/components/common/ErrorFallback.tsx
import React from 'react'
import { AlertCircle, RefreshCw, Home, Shield } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error | null
  resetErrorBoundary?: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const handleReset = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary()
    }
    
    // Additional reset logic
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  const handleClearAndReload = () => {
    // Clear problematic storage SAFELY
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('cart')
    } catch (e) {
      console.error('Error clearing storage:', e)
    }
    
    sessionStorage.clear()
    
    // Reload the page
    window.location.href = '/'
  }

  // Safely get error message
  const getErrorMessage = () => {
    if (!error) return 'Unknown error occurred'
    
    try {
      if (typeof error === 'string') return error
      if (error.message) return error.message
      if (error.toString) return error.toString()
      return JSON.stringify(error)
    } catch (e) {
      return 'Error message cannot be displayed'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-200/50">
        <div className="text-center">
          {/* Animated error icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-400/20 rounded-full animate-ping"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full border-4 border-white shadow-lg">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          {/* Error message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Oops! Something Went Wrong
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            We encountered an unexpected error. Don't worry, this is usually temporary.
          </p>
          
          {/* Developer error details - SAFE VERSION */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Developer Details</span>
              </div>
              <code className="text-xs text-red-800 break-all">
                {getErrorMessage()}
              </code>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-5 w-5 animate-spin-once" />
              <span className="text-lg">Try Again</span>
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleClearAndReload}
                className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear & Reload
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center gap-2 bg-gray-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Home className="h-5 w-5" />
                Go Home
              </button>
            </div>
          </div>
          
          {/* Support message */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              If the problem persists, please contact our support team at{' '}
              <a href="mailto:support@blackcart.com" className="text-blue-600 hover:underline">
                support@blackcart.com
              </a>
            </p>
          </div>
        </div>
      </div>
      
      {/* Add some CSS for the spinning animation */}
      <style>{`
        @keyframes spin-once {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-once {
          animation: spin-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}

export default ErrorFallback
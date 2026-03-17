// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: any): State {
    // SAFELY handle the error
    let normalizedError: Error;
    
    if (error instanceof Error) {
      normalizedError = error;
    } else if (typeof error === 'string') {
      normalizedError = new Error(error);
    } else {
      normalizedError = new Error('An unknown error occurred');
    }
    
    return { 
      hasError: true, 
      error: normalizedError,
      errorInfo: null
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
    
    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset()
    }
    
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return React.isValidElement(this.props.fallback) 
          ? React.cloneElement(this.props.fallback as React.ReactElement<any>, {
              error: this.state.error,
              resetErrorBoundary: this.handleReset
            })
          : this.props.fallback
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Please try again.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-40">
                  <code className="text-xs text-red-600 break-words">
                    {/* SAFELY display error */}
                    {this.state.error.message || this.state.error.toString()}
                  </code>
                </div>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  // SAFELY clear storage
                  try {
                    localStorage.clear()
                    sessionStorage.clear()
                  } catch (e) {
                    console.error('Error clearing storage:', e)
                  }
                  window.location.href = '/'
                }}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Clear & Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
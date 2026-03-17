import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...')
        
        // Get hash parameters
        const hash = window.location.hash.substring(1)
        const params = new URLSearchParams(hash)
        
        const token = params.get('token')
        const user = params.get('user')
        const success = params.get('success')
        const error = params.get('error')
        
        console.log('📦 OAuth params:', { hasToken: !!token, hasUser: !!user, success, error })
        
        if (error) {
          console.error('❌ OAuth error:', error)
          toast.error(`Authentication failed: ${error}`)
          navigate('/login')
          return
        }
        
        if (success === 'true' && token && user) {
          try {
            // Decode user data
            const decodedUser = decodeURIComponent(user)
            const userData = JSON.parse(decodedUser)
            
            console.log('✅ Parsed user data:', userData.email)
            
            // Login with token
            await loginWithToken(token, userData)
            
            // Clear URL hash
            window.history.replaceState({}, '', '/')
            
            // Navigate home
            navigate('/')
            
          } catch (error) {
            console.error('❌ Error processing auth data:', error)
            toast.error('Failed to process authentication')
            navigate('/login')
          }
        } else {
          console.error('❌ Missing auth data')
          toast.error('No authentication data received')
          navigate('/login')
        }
      } catch (error) {
        console.error('❌ OAuth callback error:', error)
        toast.error('Authentication failed')
        navigate('/login')
      }
    }

    handleCallback()
  }, [navigate, loginWithToken])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-lg font-medium text-gray-900">Completing Login</h2>
        <p className="mt-2 text-gray-600">Redirecting you to your account...</p>
      </div>
    </div>
  )
}

export default OAuthCallback
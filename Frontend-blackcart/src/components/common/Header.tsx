import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, Heart, MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import NotificationBell from '../notifications/NotificationBell'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [imageError, setImageError] = useState(false)
  const [imageKey, setImageKey] = useState(Date.now()) // Force image refresh
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const { settings, loading } = useSettings()
  const navigate = useNavigate()

  // Log settings for debugging
  useEffect(() => {
    console.log('Header render:', {
      loading,
      hasLogo: !!settings?.logo?.url,
      logoUrl: settings?.logo?.url,
      storeName: settings?.general?.storeName,
      imageError
    });
  }, [settings, loading, imageError]);

  // Reset image error and update key when logo URL changes
  useEffect(() => {
    if (settings?.logo?.url) {
      console.log('🔄 Logo URL changed, resetting image state');
      setImageError(false);
      setImageKey(Date.now()); // Force image reload
    }
  }, [settings?.logo?.url]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleImageError = () => {
    console.log('❌ Logo image failed to load:', settings?.logo?.url);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Logo image loaded successfully:', settings?.logo?.url);
    setImageError(false);
  };

  // Construct full image URL
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_URL}${url}`;
  };

  // Determine if we should show the image logo
  const shouldShowImageLogo = !loading && settings?.logo?.url && !imageError;
  const imageUrl = settings?.logo?.url ? getFullImageUrl(settings.logo.url) : '';

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container-lg section-padding">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Dynamic with Settings - FIXED FOR CLEAR DISPLAY */}
          <Link to="/" className="flex items-center">
            {shouldShowImageLogo ? (
              <div className="flex items-center max-h-16">
                <img 
                  key={imageKey}
                  src={imageUrl}
                  alt={settings.logo.alt || settings.general?.storeName || 'BlackCart'}
                  className="max-h-16 w-auto object-contain"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous"
                  style={{ 
                    maxHeight: '4rem', /* 64px */
                    width: 'auto',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {settings?.general?.storeName?.charAt(0) || 'B'}
                  </span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {settings?.general?.storeName || 'BlackCart'}
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors ml-5">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              Contact
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/search')}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              <Search className="h-6 w-6" />
            </button>
            
            {user && (
              <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-primary-600">
                <Heart className="h-6 w-6" />
              </Link>
            )}
            
            {user && <NotificationBell />}
            
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
              <button onClick={() => navigate('/profile')} className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  <User className="h-6 w-6 text-gray-600" />
                  <span className="hidden md:inline font-medium">{user.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/profile" className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link to="/dashboard" className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50">
                    <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-bold">D</span>
                    </div>
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/orders" className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50">
                    <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-green-600 text-xs font-bold">O</span>
                    </div>
                    <span>My Orders</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Wishlist</span>
                  </Link>
                  <Link to="/address-book" className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span>Address Book</span>
                  </Link>
                  <Link to="/notifications" className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50">
                    <div className="w-4 h-4 bg-yellow-100 rounded flex items-center justify-center">
                      <span className="text-yellow-600 text-xs font-bold">N</span>
                    </div>
                    <span>Notifications</span>
                  </Link>
                  <div className="border-t border-gray-200">
                    {user.role === 'admin' && (
                      <Link to="/admin" className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 text-blue-600">
                        <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-bold">A</span>
                        </div>
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-3 hover:bg-gray-50 text-red-600"
                    >
                      <div className="w-4 h-4 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 text-xs font-bold">L</span>
                      </div>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link to="/login" className="btn-secondary px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
            <nav className="space-y-2">
              <Link to="/" className="block py-2 text-gray-700 hover:text-primary-600">
                Home
              </Link>
              <Link to="/products" className="block py-2 text-gray-700 hover:text-primary-600">
                Products
              </Link>
              <Link to="/categories" className="block py-2 text-gray-700 hover:text-primary-600">
                Categories
              </Link>
              <Link to="/about" className="block py-2 text-gray-700 hover:text-primary-600">
                About
              </Link>
              <Link to="/contact" className="block py-2 text-gray-700 hover:text-primary-600">
                Contact
              </Link>
              <Link to="/faq" className="block py-2 text-gray-700 hover:text-primary-600">
                FAQ
              </Link>
              
              {user ? (
                <>
                  <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-primary-600">
                    Dashboard
                  </Link>
                  <Link to="/orders" className="block py-2 text-gray-700 hover:text-primary-600">
                    My Orders
                  </Link>
                  <Link to="/wishlist" className="block py-2 text-gray-700 hover:text-primary-600">
                    Wishlist
                  </Link>
                  <Link to="/address-book" className="block py-2 text-gray-700 hover:text-primary-600">
                    Address Book
                  </Link>
                  <Link to="/notifications" className="block py-2 text-gray-700 hover:text-primary-600">
                    Notifications
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block py-2 text-blue-600 font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-red-600 hover:text-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block py-2 text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                  <Link to="/register" className="block py-2 text-primary-600 font-medium">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
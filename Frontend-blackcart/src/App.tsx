

// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AddressProvider } from './context/AddressContext'; // ✅ ADDED

// Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/common/PrivateRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import ErrorFallback from './components/common/ErrorFallback';
import Loader from './components/common/Loader';
import { NotificationProvider } from './context/NotificationContext';
// ========== LAZY IMPORTS ==========
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage   = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CategoryProductsPage = lazy(() => import('./pages/CategoryProductsPage'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/orders/OrderConfirmationPage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/orders/OrderDetailsPage'));
const OrderTracking = lazy(() => import('./pages/orders/OrderTracking'));
// Add this with your other lazy imports
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const InvoiceGenerator = lazy(() => import('./pages/orders/InvoiceGenerator'));
const ChangePassword = lazy(() => import('./pages/user/ChangePassword'));
const AddressBook = lazy(() => import('./pages/user/AddressBook')); // ✅ This will now work
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const WishlistPage = lazy(() => import('./pages/wishlist/WishlistPage'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService'));
const ShippingPolicy = lazy(() => import('./pages/legal/ShippingPolicy'));
const ReturnsPolicy = lazy(() => import('./pages/legal/ReturnsPolicy'));
const PaymentPage = lazy(() => import('./pages/payment/PaymentPage'));
const PaymentProofPage = lazy(() => import('./pages/payment/PaymentProofPage'));
const PaymentSuccess = lazy(() => import('./pages/payment/PaymentSuccess'));
const PaymentFailed = lazy(() => import('./pages/payment/PaymentFailed'));
const PaymentStatus = lazy(() => import('./pages/payment/PaymentStatus'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminRoutes = lazy(() => import('./routes/AdminRoutes'));
const AdminPaymentProofsPage = lazy(() => import('./pages/admin/AdminPaymentProofs'));
const OAuthCallback = lazy(() => import('./pages/auth/OAuthCallback'));
import { SettingsProvider } from './context/SettingsContext';
// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Fix localStorage on startup
const fixLocalStorage = () => {
  try {
    const token = localStorage.getItem('token');
    if (token && (typeof token !== 'string' || token.trim() === '')) {
      localStorage.removeItem('token');
    }
    
    const user = localStorage.getItem('user');
    if (user) {
      try {
        JSON.parse(user);
      } catch {
        localStorage.removeItem('user');
      }
    }
    
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        JSON.parse(cart);
      } catch {
        localStorage.removeItem('cart');
      }
    }
  } catch (error) {
    console.error('Storage fix error:', error);
  }
};

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('🚀 App starting...');
      fixLocalStorage();
    }
  }, []);

  

// In src/App.tsx, keep this useEffect for theme loading
useEffect(() => {
  // Load theme from localStorage on app start
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    try {
      const theme = JSON.parse(savedTheme);
      
      // Apply dark mode
      if (theme.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Apply compact view
      if (theme.compactView) {
        document.body.classList.add('compact-view');
      } else {
        document.body.classList.remove('compact-view');
      }
      
      // Apply reduced motion
      if (theme.reducedMotion) {
        document.documentElement.classList.add('reduced-motion');
      } else {
        document.documentElement.classList.remove('reduced-motion');
      }
      
      // Apply high contrast
      if (theme.highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    } catch (e) {
      console.error('Failed to parse theme');
    }
  }
}, []);

  return (
    <ErrorBoundary 
      fallback={<ErrorFallback />}
      onReset={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        sessionStorage.clear();
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <SettingsProvider>
            <NotificationProvider>
            <CartProvider>
              <AddressProvider> 
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1f2937',
                      color: '#fff',
                      borderRadius: '8px',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <Loader size="lg" />
                  </div>
                }>
                  <Routes>
                    {/* STANDALONE ROUTES */}
                    <Route path="/auth/callback" element={<OAuthCallback />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin/*" element={<AdminRoutes />} />
                    
                    {/* MAIN LAYOUT ROUTES */}
                    <Route element={<Layout />}>
                      {/* Public Routes */}
                      <Route index element={<HomePage />} />
                      <Route path="about" element={<AboutPage />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="faq" element={<FaqPage />} />
                      <Route path="privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="terms-of-service" element={<TermsOfService />} />
                      <Route path="shipping-policy" element={<ShippingPolicy />} />
                      <Route path="returns-policy" element={<ReturnsPolicy />} />
                      
                      {/* Auth Routes */}
                      <Route path="login" element={<LoginPage />} />
                      <Route path="register" element={<RegisterPage />} />
                      <Route path="forgot-password" element={<ForgotPasswordPage />} />

                      {/*
                        ── FIX: reset-password ────────────────────────────────────────────
                        Email sends: /reset-password?token=abc  (query string)
                        OLD route:   reset-password/:token      (path segment — never matched)
                        NEW route:   reset-password             (no segment; component reads
                                                                 ?token= via useSearchParams)
                      */}
                      <Route path="reset-password" element={<ResetPasswordPage />} />

                      {/*
                        ── FIX: verify-email ──────────────────────────────────────────────
                        Route was missing entirely — every click on the verification email
                        link fell through to the wildcard * → 404 page.
                        Email sends: /verify-email?token=abc  (query string)
                        Component reads ?token= via useSearchParams and auto-verifies.
                      */}
                      <Route path="verify-email" element={<VerifyEmailPage />} />
                      
                      {/* Product Routes */}
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="products/:identifier" element={<ProductDetailPage />} />
                      
                      {/* Category Routes */}
                      <Route path="categories" element={<CategoriesPage />} />
                      <Route path="categories/:slug" element={<CategoryProductsPage />} />
                      <Route path="category/:category" element={
                        <Navigate to="/categories/:category" replace />
                      } />
                      
                      {/* Protected User Routes */}
                      <Route path="profile" element={
                        <PrivateRoute><ProfilePage /></PrivateRoute>
                      } />
                      <Route path="change-password" element={
                        <PrivateRoute><ChangePassword /></PrivateRoute>
                      } />
                      <Route path="dashboard" element={
                        <PrivateRoute><DashboardPage /></PrivateRoute>
                      } />
                      <Route path="cart" element={
                        <PrivateRoute><CartPage /></PrivateRoute>
                      } />
                      <Route path="checkout" element={
                        <PrivateRoute><CheckoutPage /></PrivateRoute>
                      } />
                      <Route path="checkout/success" element={
                        <PrivateRoute><OrderConfirmationPage /></PrivateRoute>
                      } />
                      <Route path="orders" element={
                        <PrivateRoute><OrdersPage /></PrivateRoute>
                      } />
                      <Route path="orders/:id" element={
                        <PrivateRoute><OrderDetailsPage /></PrivateRoute>
                      } />
                      <Route path="track-order" element={
                        <PrivateRoute><OrderTracking /></PrivateRoute>
                      } />
                      <Route path="orders/:id/invoice" element={
                        <PrivateRoute><InvoiceGenerator /></PrivateRoute>
                      } />
                      <Route path="wishlist" element={
                        <PrivateRoute><WishlistPage /></PrivateRoute>
                      } />
                      <Route path="address-book" element={ /* ✅ This will now work */
                        <PrivateRoute><AddressBook /></PrivateRoute>
                      } />

                      
<Route path="notifications" element={
  <PrivateRoute><NotificationsPage /></PrivateRoute>
} />
                      {/* Payment Routes */}
                      <Route path="payment/:orderId" element={
                        <PrivateRoute><PaymentPage /></PrivateRoute>
                      } />
                      <Route path="payment/proof/:orderId" element={
                        <PrivateRoute><PaymentProofPage /></PrivateRoute>
                      } />
                      <Route path="payment/success/:orderId" element={
                        <PrivateRoute><PaymentSuccess /></PrivateRoute>
                      } />
                      <Route path="payment/failed/:orderId" element={
                        <PrivateRoute><PaymentFailed /></PrivateRoute>
                      } />
                      <Route path="payment/status/:orderId" element={
                        <PrivateRoute><PaymentStatus /></PrivateRoute>
                      } />
                      
                      {/* Admin Payment Proofs */}
                      <Route path="admin/payment-proofs" element={
                        <PrivateRoute requireAdmin={true}>
                          <AdminPaymentProofsPage />
                        </PrivateRoute>
                      } />
                      
                      {/* Redirects */}
                      <Route path="home" element={<Navigate to="/" replace />} />
                      <Route path="index" element={<Navigate to="/" replace />} />
                      <Route path="store" element={<Navigate to="/products" replace />} />
                      <Route path="shop" element={<Navigate to="/products" replace />} />
                      <Route path="product/:slug" element={<Navigate to="/products/:slug" replace />} />
                      
                      {/* 404 Route */}
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </Suspense>
              </AddressProvider> 
            </CartProvider>
            </NotificationProvider>
            </SettingsProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;


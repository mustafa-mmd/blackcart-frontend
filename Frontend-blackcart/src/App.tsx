import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ErrorFallback from './components/common/ErrorFallback';
import Loader from './components/common/Loader';
import { ScrollToTop } from './components/common/ScrollToTop';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CategoryProductsPage = lazy(() => import('./pages/CategoryProductsPage'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/orders/OrderConfirmationPage'));
const OrderDetailsPage = lazy(() => import('./pages/orders/OrderDetailsPage'));
const OrderTracking = lazy(() => import('./pages/orders/OrderTracking'));
const InvoicePage = lazy(() => import('./pages/orders/InvoicePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
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
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const applySavedTheme = () => {
  try {
    const theme = JSON.parse(localStorage.getItem('theme') || '{}');
    document.documentElement.classList.toggle('dark', Boolean(theme.darkMode));
    document.body.classList.toggle('compact-view', Boolean(theme.compactView));
    document.documentElement.classList.toggle('reduced-motion', Boolean(theme.reducedMotion));
    document.documentElement.classList.toggle('high-contrast', Boolean(theme.highContrast));
  } catch {
    localStorage.removeItem('theme');
  }
};

function App() {
  useEffect(applySavedTheme, []);

  return (
    <ErrorBoundary fallback={<ErrorFallback />} onReset={() => window.location.reload()}>
      <Router>
        <ScrollToTop />
        <SettingsProvider>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader size="lg" /></div>}>
                  <Routes>
                    {/* Admin authentication remains private and separate from the storefront. */}
                    <Route path="/admin/login" element={<AuthProvider><AdminLoginPage /></AuthProvider>} />
                    <Route path="/admin/*" element={<AuthProvider><AdminRoutes /></AuthProvider>} />

                    <Route element={<CartProvider><Layout /></CartProvider>}>
                      <Route index element={<HomePage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="products/:identifier" element={<ProductDetailPage />} />
                      <Route path="categories" element={<CategoriesPage />} />
                      <Route path="categories/:slug" element={<CategoryProductsPage />} />
                      <Route path="contact" element={<ContactPage />} />
                      <Route path="faq" element={<FaqPage />} />
                      <Route path="privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="terms-of-service" element={<TermsOfService />} />
                      <Route path="shipping-policy" element={<ShippingPolicy />} />
                      <Route path="returns-policy" element={<ReturnsPolicy />} />

                      {/* Guest shopping: no customer account or login is required. */}
                      <Route path="cart" element={<CartPage />} />
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="checkout/success" element={<OrderConfirmationPage />} />
                      <Route path="orders/:id" element={<OrderDetailsPage />} />
                      <Route path="orders/:orderId/invoice" element={<InvoicePage />} />
                      <Route path="track-order" element={<OrderTracking />} />
                      <Route path="payment/:orderId" element={<PaymentPage />} />
                      <Route path="payment/proof/:orderId" element={<PaymentProofPage />} />
                      <Route path="payment/success/:orderId" element={<PaymentSuccess />} />
                      <Route path="payment/failed/:orderId" element={<PaymentFailed />} />
                      <Route path="payment/status/:orderId" element={<PaymentStatus />} />

                      <Route path="home" element={<Navigate to="/" replace />} />
                      <Route path="store" element={<Navigate to="/products" replace />} />
                      <Route path="shop" element={<Navigate to="/products" replace />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Route>
                  </Routes>
                </Suspense>
        </SettingsProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

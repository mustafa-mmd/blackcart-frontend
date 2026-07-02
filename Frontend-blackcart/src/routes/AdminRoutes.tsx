import React from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import PrivateRoute from '../components/common/PrivateRoute'
import AdminLayout from '../components/admin/AdminLayout'
import { lazy, Suspense } from 'react'
import Loader from '../components/common/Loader'

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))
// ✅ NEW: User detail page handles both view and edit (via ?tab=edit)
const AdminUserDetail = lazy(() => import('../pages/admin/AdminUserDetail'))
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('../pages/admin/AdminOrders'))
const AdminAnalytics = lazy(() => import('../pages/admin/AdminAnalytics'))
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'))
const AdminPaymentProofsPage = lazy(() => import('../pages/admin/AdminPaymentProofs'))
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'))
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'))
const AdminCoupons = lazy(() => import('../pages/admin/AdminCoupons'))
const AdminCreateProduct = lazy(() => import('../pages/admin/AdminCreateProduct'))
const AdminEditProduct = lazy(() => import('../pages/admin/AdminEditProduct'))
const AdminOrderDetails = lazy(() => import('../pages/admin/AdminOrderDetails'))
const AdminEditOrder = lazy(() => import('../pages/admin/AdminEditOrder'))
const AdminBanners = lazy(() => import('../pages/admin/AdminBanners'))

const AdminPageLoader = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <Loader size="lg" color="primary" />
  </div>
)

// ✅ FIXED: Extracted to its own component so useNavigate works correctly
const AdminNotFound: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-600 mt-4">Admin page not found</p>
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Go to Dashboard
      </button>
    </div>
  )
}

const AdminRoutes: React.FC = () => {
  return (
    <PrivateRoute adminOnly>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminDashboard />
            </Suspense>
          } />

          {/* ===================== USER MANAGEMENT ===================== */}
          <Route path="users" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminUsers />
            </Suspense>
          } />

          {/* ✅ FIXED: Added missing user detail route
              Handles both:
              - /admin/users/:id          → view details
              - /admin/users/:id?tab=edit → edit mode  */}
          <Route path="users/:id" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminUserDetail />
            </Suspense>
          } />

          {/* ===================== PRODUCT MANAGEMENT ===================== */}
          <Route path="products" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminProducts />
            </Suspense>
          } />
          <Route path="products/new" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminCreateProduct />
            </Suspense>
          } />
          <Route path="products/create" element={<Navigate to="../new" replace />} />
          <Route path="products/edit/:id" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminEditProduct />
            </Suspense>
          } />
          <Route path="products/import" element={
            <div className="p-8">
              <h1 className="text-2xl font-bold text-gray-900">Import Products</h1>
              <p className="text-gray-600 mt-2">Import functionality coming soon...</p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          } />

          {/* ===================== CATEGORY MANAGEMENT ===================== */}
          <Route path="categories" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminCategories />
            </Suspense>
          } />

          {/* ===================== ORDER MANAGEMENT ===================== */}
          <Route path="orders" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminOrders />
            </Suspense>
          } />
          <Route path="orders/:id" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminOrderDetails />
            </Suspense>
          } />
          <Route path="orders/edit/:id" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminEditOrder />
            </Suspense>
          } />

          {/* ===================== OTHER MANAGEMENT ===================== */}
          <Route path="reviews" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminReviews />
            </Suspense>
          } />
          <Route path="coupons" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminCoupons />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminAnalytics />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminSettings />
            </Suspense>
          } />
          <Route path="payment-proofs" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminPaymentProofsPage />
            </Suspense>
          } />
          <Route path="banners" element={
            <Suspense fallback={<AdminPageLoader />}>
              <AdminBanners />
            </Suspense>
          } />

          {/* ✅ FIXED: 404 uses its own component with useNavigate properly initialized */}
          <Route path="*" element={<AdminNotFound />} />
        </Route>
      </Routes>
    </PrivateRoute>
  )
}

export default AdminRoutes
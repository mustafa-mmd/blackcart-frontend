// src/pages/admin/AdminUserDetail.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Package,
  RefreshCw,
  Save,
  Edit2
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import Loader from '../../components/common/Loader'
import { toast } from 'react-hot-toast'

const AdminUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'view'

  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isActive: true,
  })

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    if (!id) return
    try {
      setLoading(true)
      const response = await adminService.getUserById(id)
      if (response.success && response.data) {
        const userData = response.data.user || response.data
        const ordersData = response.data.recentOrders || []
        setUser(userData)
        setOrders(ordersData)
        setEditForm({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'user',
          isActive: userData.isActive !== false,
        })
      } else {
        toast.error('Failed to load user')
        navigate('/admin/users')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load user')
      navigate('/admin/users')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!id) return
    try {
      setSaving(true)
      const response = await adminService.updateUser(id, editForm)
      if (response.success) {
        toast.success('User updated successfully!')
        fetchUser()
        navigate(`/admin/users/${id}`)
      } else {
        toast.error((response as any).message || 'Failed to update user')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async () => {
    if (!id || !user) return
    try {
      await adminService.updateUser(id, { isActive: !user.isActive })
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`)
      fetchUser()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-xl border border-red-200 p-8 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">User Not Found</h2>
          <button onClick={() => navigate('/admin/users')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/users')}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'edit' ? 'Edit User' : 'User Details'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">ID: {user._id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== 'edit' && (
              <button
                onClick={() => navigate(`/admin/users/${id}?tab=edit`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                <Edit2 className="h-4 w-4" />
                Edit User
              </button>
            )}
            <button
              onClick={handleToggleActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm ${
                user.isActive
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={fetchUser} className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* VIEW MODE */}
        {activeTab !== 'edit' && (
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    {user.emailVerified && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                        <Shield className="h-3 w-3" /> Verified
                      </p>
                    )}
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Registered</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="text-sm font-medium text-gray-900">
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            {orders.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Orders ({orders.length})
                </h3>
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.invoiceNumber || order._id}
                        </p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.orderStatus}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          PKR {order.totalPrice?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EDIT MODE */}
        {activeTab === 'edit' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Edit User Information</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={editForm.role}
                    onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={e => setEditForm(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Account is active</span>
                    <p className="text-xs text-gray-500 mt-0.5">User can log in and use the platform</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => navigate(`/admin/users/${id}`)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUserDetail
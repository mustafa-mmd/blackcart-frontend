// src/pages/admin/AdminCoupons.tsx
import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Tag, 
  Plus, 
  Edit2, 
  Trash2, 
  Copy,
  Calendar,
  Percent,
  DollarSign,
  Users,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import Loader from '../../components/common/Loader'

interface Coupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount?: number
  maxDiscountAmount?: number
  validFrom: string
  validUntil: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CouponStats {
  total: number
  active: number
  expired: number
  totalUsage: number
  averageDiscount: number
}

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, active, expired, inactive
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState<CouponStats>({
    total: 0,
    active: 0,
    expired: 0,
    totalUsage: 0,
    averageDiscount: 0
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    isActive: true
  })

  useEffect(() => {
    fetchCoupons()
  }, [page, filter, searchTerm])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await adminService.getCoupons({
        page,
        limit: 12,
        status: filter !== 'all' ? filter : undefined,
        search: searchTerm || undefined
      })
      
      setCoupons(response.data.coupons || [])
      setTotalPages(response.data.pagination?.pages || 1)
      setTotalCount(response.data.pagination?.total || 0)
      setStats(response.data.stats || {
        total: 0,
        active: 0,
        expired: 0,
        totalUsage: 0,
        averageDiscount: 0
      })
    } catch (error: any) {
      console.error('Error fetching coupons:', error)
      toast.error(error.response?.data?.message || 'Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleCreateCoupon = async () => {
    // Validation
    if (!newCoupon.code.trim()) {
      toast.error('Coupon code is required')
      return
    }

    if (newCoupon.discountValue <= 0) {
      toast.error('Discount value must be greater than 0')
      return
    }

    if (!newCoupon.validFrom) {
      toast.error('Valid from date is required')
      return
    }

    if (!newCoupon.validUntil) {
      toast.error('Valid until date is required')
      return
    }

    if (new Date(newCoupon.validFrom) >= new Date(newCoupon.validUntil)) {
      toast.error('Valid until date must be after valid from date')
      return
    }

    try {
      const couponData = {
        code: newCoupon.code.toUpperCase(),
        discountType: newCoupon.discountType,
        discountValue: parseFloat(newCoupon.discountValue.toString()),
        minOrderAmount: newCoupon.minOrderAmount ? parseFloat(newCoupon.minOrderAmount) : undefined,
        maxDiscountAmount: newCoupon.maxDiscountAmount ? parseFloat(newCoupon.maxDiscountAmount) : undefined,
        validFrom: new Date(newCoupon.validFrom).toISOString(),
        validUntil: new Date(newCoupon.validUntil).toISOString(),
        usageLimit: newCoupon.usageLimit ? parseInt(newCoupon.usageLimit) : undefined,
        isActive: newCoupon.isActive
      }

      const response = await adminService.createCoupon(couponData)
      
      if (response.success) {
        toast.success('Coupon created successfully!')
        setShowCreateModal(false)
        resetNewCouponForm()
        fetchCoupons()
      } else {
        toast.error(response.message || 'Failed to create coupon')
      }
    } catch (error: any) {
      console.error('Error creating coupon:', error)
      toast.error(error.response?.data?.message || 'Failed to create coupon')
    }
  }

  const handleUpdateCoupon = async () => {
    if (!selectedCoupon) return

    try {
      const response = await adminService.updateCoupon(selectedCoupon._id, selectedCoupon)
      
      if (response.success) {
        toast.success('Coupon updated successfully!')
        setShowEditModal(false)
        setSelectedCoupon(null)
        fetchCoupons()
      } else {
        toast.error(response.message || 'Failed to update coupon')
      }
    } catch (error: any) {
      console.error('Error updating coupon:', error)
      toast.error(error.response?.data?.message || 'Failed to update coupon')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await adminService.updateCouponStatus(id, !currentStatus)
      
      if (response.success) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        fetchCoupons()
      } else {
        toast.error(response.message || 'Failed to update coupon status')
      }
    } catch (error: any) {
      console.error('Error updating coupon status:', error)
      toast.error(error.response?.data?.message || 'Failed to update coupon status')
    }
  }

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return
    }

    try {
      const response = await adminService.deleteCoupon(id)
      
      if (response.success) {
        toast.success('Coupon deleted successfully')
        fetchCoupons()
      } else {
        toast.error(response.message || 'Failed to delete coupon')
      }
    } catch (error: any) {
      console.error('Error deleting coupon:', error)
      toast.error(error.response?.data?.message || 'Failed to delete coupon')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Coupon code copied to clipboard!')
  }

  const resetNewCouponForm = () => {
    setNewCoupon({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: '',
      maxDiscountAmount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '',
      isActive: true
    })
  }

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon({ ...coupon })
    setShowEditModal(true)
  }

  const isCouponExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  const isCouponActive = (coupon: Coupon) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)
    
    return coupon.isActive && now >= validFrom && now <= validUntil
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) {
      return { label: 'Inactive', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle }
    }
    
    if (isCouponExpired(coupon.validUntil)) {
      return { label: 'Expired', color: 'bg-red-100 text-red-800 border-red-200', icon: Clock }
    }
    
    if (!isCouponActive(coupon)) {
      return { label: 'Upcoming', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock }
    }
    
    return { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`
  }

  const filteredCoupons = coupons

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Coupons</h1>
              <p className="text-gray-600 mt-2">Manage discount coupons and promotions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchCoupons}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search coupons by code..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value)
                    setPage(1)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Coupons</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <button 
                onClick={() => {
                  // Export functionality
                  toast.success('Export feature coming soon')
                }}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Total Coupons</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Total Usage</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalUsage.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Avg. Discount</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.averageDiscount}%</p>
          </div>
        </div>

        {/* Coupons Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader size="lg" />
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Coupons Found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'all' 
                ? 'No coupons match your search criteria'
                : 'Get started by creating your first coupon'
              }
            </p>
            {!searchTerm && filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Coupon
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => {
                const status = getCouponStatus(coupon)
                const StatusIcon = status.icon
                
                return (
                  <div key={coupon._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Coupon Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-50 rounded-lg mr-3">
                            <Tag className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 font-mono">{coupon.code}</h3>
                            <p className="text-sm text-gray-500">Discount Code</p>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition"
                          title="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {/* Discount Value */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Discount</p>
                            <p className="text-2xl font-bold text-green-600">
                              {coupon.discountType === 'percentage' 
                                ? `${coupon.discountValue}% OFF`
                                : `${formatCurrency(coupon.discountValue)} OFF`
                              }
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            {status.label}
                          </span>
                        </div>
                      </div>
                      
                      {/* Usage Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {coupon.usedCount} / {coupon.usageLimit || '∞'} used
                        </div>
                        {coupon.minOrderAmount && coupon.minOrderAmount > 0 && (
                          <div className="flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Min: {formatCurrency(coupon.minOrderAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Coupon Details */}
                    <div className="p-6">
                      {/* Validity */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Validity Period</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(coupon.validFrom)}
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {formatDate(coupon.validUntil)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Conditions */}
                      <div className="space-y-2">
                        {coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                            Max discount: {formatCurrency(coupon.maxDiscountAmount)}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Percent className="h-4 w-4 mr-2 text-gray-400" />
                          Type: {coupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          Created: {formatDate(coupon.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium flex items-center justify-center"
                        >
                          <Edit2 className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(coupon._id, coupon.isActive)}
                          className={`flex-1 px-3 py-2 rounded-lg transition text-sm font-medium flex items-center justify-center ${
                            coupon.isActive
                              ? 'bg-red-50 text-red-700 hover:bg-red-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((page - 1) * 12) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(page * 12, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Coupon Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Create New Coupon</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                      placeholder="e.g., SUMMER20"
                      maxLength={20}
                    />
                    <p className="text-xs text-gray-500 mt-1">Only uppercase letters and numbers allowed</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Type *
                      </label>
                      <select
                        value={newCoupon.discountType}
                        onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (PKR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        value={newCoupon.discountValue}
                        onChange={(e) => setNewCoupon({...newCoupon, discountValue: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder={newCoupon.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 500'}
                        min="0"
                        step={newCoupon.discountType === 'percentage' ? "1" : "100"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order (PKR)
                      </label>
                      <input
                        type="number"
                        value={newCoupon.minOrderAmount}
                        onChange={(e) => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Optional"
                        min="0"
                        step="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Discount (PKR)
                      </label>
                      <input
                        type="number"
                        value={newCoupon.maxDiscountAmount}
                        onChange={(e) => setNewCoupon({...newCoupon, maxDiscountAmount: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Optional"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid From *
                      </label>
                      <input
                        type="datetime-local"
                        value={newCoupon.validFrom}
                        onChange={(e) => setNewCoupon({...newCoupon, validFrom: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid Until *
                      </label>
                      <input
                        type="datetime-local"
                        value={newCoupon.validUntil}
                        onChange={(e) => setNewCoupon({...newCoupon, validUntil: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={newCoupon.usageLimit}
                      onChange={(e) => setNewCoupon({...newCoupon, usageLimit: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCoupon.isActive}
                      onChange={(e) => setNewCoupon({...newCoupon, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Active immediately</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      resetNewCouponForm()
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCoupon}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Coupon Modal */}
        {showEditModal && selectedCoupon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Edit Coupon</h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={selectedCoupon.code}
                      onChange={(e) => setSelectedCoupon({...selectedCoupon, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono"
                      maxLength={20}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Type *
                      </label>
                      <select
                        value={selectedCoupon.discountType}
                        onChange={(e) => setSelectedCoupon({...selectedCoupon, discountType: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (PKR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        value={selectedCoupon.discountValue}
                        onChange={(e) => setSelectedCoupon({...selectedCoupon, discountValue: parseFloat(e.target.value) || 0})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        min="0"
                        step={selectedCoupon.discountType === 'percentage' ? "1" : "100"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Order (PKR)
                      </label>
                      <input
                        type="number"
                        value={selectedCoupon.minOrderAmount || ''}
                        onChange={(e) => setSelectedCoupon({...selectedCoupon, minOrderAmount: parseFloat(e.target.value) || undefined})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        min="0"
                        step="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Discount (PKR)
                      </label>
                      <input
                        type="number"
                        value={selectedCoupon.maxDiscountAmount || ''}
                        onChange={(e) => setSelectedCoupon({...selectedCoupon, maxDiscountAmount: parseFloat(e.target.value) || undefined})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        min="0"
                        step="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid From *
                      </label>
                      <input
                        type="datetime-local"
                        value={selectedCoupon.validFrom ? selectedCoupon.validFrom.slice(0, 16) : ''}
                        onChange={(e) => setSelectedCoupon({...selectedCoupon, validFrom: new Date(e.target.value).toISOString()})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valid Until *
                      </label>
                      <input
                        type="datetime-local"
                        value={selectedCoupon.validUntil ? selectedCoupon.validUntil.slice(0, 16) : ''}
                        onChange={(e) => setSelectedCoupon({...selectedCoupon, validUntil: new Date(e.target.value).toISOString()})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={selectedCoupon.usageLimit || ''}
                      onChange={(e) => setSelectedCoupon({...selectedCoupon, usageLimit: parseInt(e.target.value) || undefined})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="1"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Currently used: {selectedCoupon.usedCount} times
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCoupon.isActive}
                      onChange={(e) => setSelectedCoupon({...selectedCoupon, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowEditModal(false)
                      setSelectedCoupon(null)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateCoupon}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Coupon
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCoupons
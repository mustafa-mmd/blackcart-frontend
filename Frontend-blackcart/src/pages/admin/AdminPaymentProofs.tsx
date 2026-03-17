// src/pages/admin/AdminPaymentProofs.tsx
import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Download, 
  RefreshCw, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import { formatDate } from '../../utils/dateFormatter'
import { formatPrice } from '../../utils/formatCurrency'
import toast from 'react-hot-toast'

interface PaymentProof {
  _id: string
  orderId: string
  imageUrl: string
  bankName: string
  transactionRef: string
  transactionDate: string
  notes?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  createdAt: string
}

interface Order {
  _id: string
  invoiceNumber: string
  totalPrice: number
  user: {
    _id: string
    name: string
    email: string
    phone: string
  }
  paymentProof: PaymentProof
  createdAt: string
}

const AdminPaymentProofs: React.FC = () => {
  const [proofs, setProofs] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedProof, setSelectedProof] = useState<Order | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })

  const loadProofs = async (pageNum = page) => {
    try {
      setLoading(true)
      // ✅ FIXED: Using correct method name
      const response = await adminService.getPendingPaymentProofs({
        page: pageNum,
        limit: 10,
        status: filter !== 'all' ? filter : undefined,
        search: search || undefined
      })
      
      setProofs(response.data.orders || [])
      setTotalPages(response.data.pagination?.pages || 1)
      setTotalCount(response.data.pagination?.total || 0)
      setStats(response.data.stats || {
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
      })
    } catch (error: any) {
      console.error('Error loading payment proofs:', error)
      toast.error(error.response?.data?.message || 'Failed to load payment proofs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProofs(1)
    setPage(1)
  }, [filter, search])

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadProofs(newPage)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadProofs(1)
    setPage(1)
  }

  // ✅ FIXED: Using correct method name and parameters
  const handleVerify = async (orderId: string, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !reviewNotes.trim()) {
      toast.error('Please provide review notes for rejection')
      return
    }

    try {
      setReviewing(true)
      await adminService.verifyManualPayment(orderId, {
        status,
        reviewNotes: reviewNotes || undefined
      })
      
      toast.success(`Payment proof ${status === 'approved' ? 'approved' : 'rejected'} successfully`)
      setSelectedProof(null)
      setReviewNotes('')
      loadProofs(page)
    } catch (error: any) {
      console.error('Error verifying payment proof:', error)
      toast.error(error.response?.data?.message || 'Failed to verify payment proof')
    } finally {
      setReviewing(false)
    }
  }

  const handleDownloadProof = async (imageUrl: string, orderId: string) => {
    try {
      toast.loading('Downloading proof...', { id: 'download' })
      
      // Fetch the image
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payment-proof-${orderId}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast.success('Proof downloaded successfully', { id: 'download' })
    } catch (error) {
      console.error('Error downloading proof:', error)
      toast.error('Failed to download proof', { id: 'download' })
      
      // Fallback: open in new tab
      window.open(imageUrl, '_blank')
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
      'pending': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
        icon: <Clock className="h-4 w-4" />,
        text: 'Pending Review'
      },
      'approved': {
        color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'Approved'
      },
      'rejected': {
        color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800',
        icon: <XCircle className="h-4 w-4" />,
        text: 'Rejected'
      }
    }
    
    const cfg = config[status] || config.pending
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${cfg.color}`}>
        {cfg.icon}
        {cfg.text}
      </span>
    )
  }

  const filteredProofs = proofs.filter(proof => {
    if (filter !== 'all' && proof.paymentProof?.status !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      return (
        proof._id?.toLowerCase().includes(searchLower) ||
        proof.invoiceNumber?.toLowerCase().includes(searchLower) ||
        proof.user?.name?.toLowerCase().includes(searchLower) ||
        proof.user?.email?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Payment Proof Review</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Review and verify bank transfer payment proofs</p>
            </div>
            <button
              onClick={() => loadProofs(page)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Filters & Search */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by order ID, invoice, or customer..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </form>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rejected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Proofs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </div>
        </div>

        {/* Proofs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading payment proofs...</p>
            </div>
          ) : filteredProofs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Payment Proofs Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter !== 'all' ? `No ${filter.replace('_', ' ')} proofs found` : 'No payment proofs available'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Order Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Payment Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredProofs.map((proof) => (
                      <tr key={proof._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              #{proof.invoiceNumber || proof._id?.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(proof.createdAt)}
                            </p>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                              {formatPrice(proof.totalPrice)}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {proof.user?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {proof.user?.email || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {proof.user?.phone || 'No phone'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {proof.paymentProof?.bankName || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Ref: {proof.paymentProof?.transactionRef || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {proof.paymentProof?.transactionDate ? formatDate(proof.paymentProof.transactionDate) : 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(proof.paymentProof?.status || 'pending')}
                          {proof.paymentProof?.reviewedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Reviewed: {formatDate(proof.paymentProof.reviewedAt, 'short')}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedProof(proof)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadProof(proof.paymentProof?.imageUrl, proof._id)}
                              className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"
                              title="Download Proof"
                              disabled={!proof.paymentProof?.imageUrl}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(page * 10, totalCount)}</span> of{' '}
                      <span className="font-medium">{totalCount}</span> results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className="flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        className="flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Review Payment Proof</h2>
                <button
                  onClick={() => {
                    setSelectedProof(null)
                    setReviewNotes('')
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Proof Image */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Uploaded Proof</h3>
                  {selectedProof.paymentProof?.imageUrl ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
                      <img
                        src={selectedProof.paymentProof.imageUrl}
                        alt="Payment proof"
                        className="w-full h-auto"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/image-placeholder.png'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center bg-gray-50 dark:bg-gray-900">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400">No image available</p>
                    </div>
                  )}
                  <div className="mt-4 flex space-x-2">
                    {selectedProof.paymentProof?.imageUrl && (
                      <>
                        <button
                          onClick={() => window.open(selectedProof.paymentProof.imageUrl, '_blank')}
                          className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition"
                        >
                          Open Full Size
                        </button>
                        <button
                          onClick={() => handleDownloadProof(selectedProof.paymentProof.imageUrl, selectedProof._id)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          Download
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Column - Details & Actions */}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">Payment Details</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedProof._id?.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Invoice</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedProof.invoiceNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                          <p className="font-medium text-sm text-green-600 dark:text-green-400">{formatPrice(selectedProof.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Bank</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedProof.paymentProof?.bankName || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Ref</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedProof.paymentProof?.transactionRef || 'N/A'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Date</p>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {selectedProof.paymentProof?.transactionDate 
                              ? formatDate(selectedProof.paymentProof.transactionDate, 'long') 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Information</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <p className="font-medium text-gray-900 dark:text-white">{selectedProof.user?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProof.user?.email || 'N/A'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedProof.user?.phone || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Review Notes */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review Notes</h4>
                      <textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes for rejection or approval..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Status Display */}
                    {selectedProof.paymentProof?.status !== 'pending' && (
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Review Status:</span>{' '}
                          {selectedProof.paymentProof.status === 'approved' ? (
                            <span className="text-green-600 dark:text-green-400">Approved</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">Rejected</span>
                          )}
                        </p>
                        {selectedProof.paymentProof.reviewNotes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="font-medium">Notes:</span> {selectedProof.paymentProof.reviewNotes}
                          </p>
                        )}
                        {selectedProof.paymentProof.reviewedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Reviewed on {formatDate(selectedProof.paymentProof.reviewedAt, 'long')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action Buttons - Only show for pending */}
                    {selectedProof.paymentProof?.status === 'pending' && (
                      <div className="flex space-x-3 pt-4">
                        <button
                          onClick={() => {
                            setSelectedProof(null)
                            setReviewNotes('')
                          }}
                          className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
                          disabled={reviewing}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleVerify(selectedProof._id, 'approved')}
                          disabled={reviewing}
                          className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                        >
                          {reviewing ? 'Approving...' : 'Approve Payment'}
                        </button>
                        <button
                          onClick={() => handleVerify(selectedProof._id, 'rejected')}
                          disabled={reviewing || !reviewNotes.trim()}
                          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                        >
                          {reviewing ? 'Rejecting...' : 'Reject Payment'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPaymentProofs
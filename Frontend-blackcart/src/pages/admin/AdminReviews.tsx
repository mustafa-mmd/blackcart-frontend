import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  RefreshCw,
  MessageSquare,
  User,
  Package,
  Calendar,
  ThumbsUp,
  AlertCircle
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import Loader from '../../components/common/Loader'

interface Review {
  _id: string
  user: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  product: {
    _id: string
    name: string
    image?: string
  }
  rating: number
  comment: string
  isApproved: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, pending, approved, featured
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await adminService.getReviews()
      
      if (response.success) {
        setReviews(response.data)
      } else {
        toast.error('Failed to load reviews')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveReview = async (id: string) => {
    try {
      const response = await adminService.approveReview(id)
      
      if (response.success) {
        toast.success('Review approved successfully!')
        fetchReviews()
      } else {
        toast.error(response.message || 'Failed to approve review')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to approve review')
    }
  }

  const handleRejectReview = async (id: string) => {
    try {
      const response = await adminService.rejectReview(id)
      
      if (response.success) {
        toast.success('Review rejected')
        fetchReviews()
      } else {
        toast.error(response.message || 'Failed to reject review')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject review')
    }
  }

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const response = await adminService.toggleReviewFeatured(id, !currentStatus)
      
      if (response.success) {
        toast.success(`Review ${!currentStatus ? 'featured' : 'unfeatured'}`)
        fetchReviews()
      } else {
        toast.error(response.message || 'Failed to update review')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update review')
    }
  }

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return
    }

    try {
      const response = await adminService.deleteReview(id)
      
      if (response.success) {
        toast.success('Review deleted successfully')
        fetchReviews()
      } else {
        toast.error(response.message || 'Failed to delete review')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete review')
    }
  }

  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review)
    setShowDetailModal(true)
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending' && review.isApproved) return false
    if (filter === 'approved' && !review.isApproved) return false
    if (filter === 'featured' && !review.isFeatured) return false
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        review.user.name.toLowerCase().includes(searchLower) ||
        review.user.email.toLowerCase().includes(searchLower) ||
        review.product.name.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower)
      )
    }
    
    return true
  })

  const getStatusBadge = (review: Review) => {
    if (!review.isApproved) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </span>
      )
    }
    
    if (review.isFeatured) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          <ThumbsUp className="h-3 w-3 mr-1" />
          Featured
        </span>
      )
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Approved
      </span>
    )
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.isApproved).length,
    approved: reviews.filter(r => r.isApproved).length,
    featured: reviews.filter(r => r.isFeatured).length,
    averageRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Product Reviews</h1>
              <p className="text-gray-600 mt-2">Manage and moderate customer reviews</p>
            </div>
            <button
              onClick={fetchReviews}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Search & Filter */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reviews by customer, product, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Reviews</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="featured">Featured</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Featured</p>
            <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Avg Rating</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold text-blue-600 mr-2">{stats.averageRating}</p>
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filteredReviews.length === 0 ? (
            <div className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'No reviews match your search criteria'
                  : 'No reviews available yet'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <div key={review._id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* User & Product Info */}
                    <div className="lg:w-1/4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{review.user.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{review.user.email}</p>
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-2">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <Package className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {review.product.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="lg:w-2/4">
                      <div className="flex items-center mb-2">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {review.rating}.0
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mb-3">
                        {review.comment}
                      </p>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(review)}
                        {review.isApproved && (
                          <button
                            onClick={() => handleToggleFeatured(review._id, review.isFeatured)}
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              review.isFeatured
                                ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {review.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:w-1/4">
                      <div className="flex flex-col space-y-2">
                        {!review.isApproved ? (
                          <>
                            <button
                              onClick={() => handleApproveReview(review._id)}
                              className="w-full px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm flex items-center justify-center"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectReview(review._id)}
                              className="w-full px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition text-sm flex items-center justify-center"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        ) : null}
                        
                        <button
                          onClick={() => viewReviewDetails(review)}
                          className="w-full px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm flex items-center justify-center"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                        
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="w-full px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm flex items-center justify-center"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition">
              Approve Selected
            </button>
            <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition">
              Reject Selected
            </button>
            <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition">
              Feature Selected
            </button>
            <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition">
              Delete Selected
            </button>
          </div>
        </div>

        {/* Review Detail Modal */}
        {showDetailModal && selectedReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedReview.user.name}</h3>
                      <p className="text-sm text-gray-600">{selectedReview.user.email}</p>
                      <p className="text-xs text-gray-500">
                        Reviewed on {new Date(selectedReview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Product</h4>
                    <p className="text-gray-700">{selectedReview.product.name}</p>
                  </div>

                  {/* Rating */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Rating</h4>
                    <div className="flex items-center">
                      {renderStars(selectedReview.rating)}
                      <span className="ml-2 text-lg font-bold text-gray-900">
                        {selectedReview.rating}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  {/* Comment */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Review Comment</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.comment}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(selectedReview)}
                      <div className="text-sm text-gray-600">
                        Last updated: {new Date(selectedReview.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {!selectedReview.isApproved && (
                    <>
                      <button
                        onClick={() => {
                          handleApproveReview(selectedReview._id)
                          setShowDetailModal(false)
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Approve Review
                      </button>
                      <button
                        onClick={() => {
                          handleRejectReview(selectedReview._id)
                          setShowDetailModal(false)
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Reject Review
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReviews
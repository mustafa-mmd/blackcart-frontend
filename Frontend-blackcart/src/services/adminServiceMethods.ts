// src/services/adminServiceMethods.ts
import api from './api'
import { 
  User, 
  Product, 
  Order, 
  Category, 
  ApiResponse, 
  Pagination,
  AdminDashboardStats,
  ProductSales,
  DailyStats,
  CategorySales
} from '../types'
// Import categoryService
import { categoryService } from './categoryService'

// Add toast import at the top
import { toast } from 'react-toastify'

export interface DashboardStats extends AdminDashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    todayOrders: number;
    todayRevenue: number;
    revenueChange: number;
    orderChange: number;
    lowStockProducts: number;
    pendingOrders: number;
  };
  topProducts: ProductSales[];
  recentOrders: Order[];
  userGrowth: DailyStats[];
  categoryStats: CategorySales[];
}

export interface Review {
  _id: string
  user: User
  product: Product
  rating: number
  comment: string
  isApproved: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface Coupon {
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

export const adminService = {
  // Dashboard Statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats')
    return response.data.data!
  },

  // User Management
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<ApiResponse<{ users: User[]; pagination: Pagination }>> => {
    const response = await api.get('/admin/users', { params })
    return response.data
  },

  getUserById: async (id: string): Promise<ApiResponse<{ user: User; recentOrders: Order[] }>> => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/admin/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  // ========== PRODUCT MANAGEMENT ==========
  getAdminProducts: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brand?: string;
    status?: string;
    stockStatus?: string;
  }): Promise<ApiResponse<{ products: Product[]; filters: { categories: string[]; brands: string[] }; pagination: Pagination }>> => {
    console.log('📡 API Call: GET /api/admin/products with params:', params);
    
    try {
      const response = await api.get('/admin/products', { params });
      console.log('✅ API Response received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ API Error details:', {
        url: '/admin/products',
        params,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  getAdminProductById: async (id: string): Promise<ApiResponse<Product>> => {
  try {
    console.log('📡 [SERVICE] Fetching admin product by ID:', id);
    console.log('📡 Making request to:', `/admin/products/${id}`);
    
    const response = await api.get(`/admin/products/${id}`);
    
    console.log('✅ [SERVICE] Raw response received');
    console.log('🔍 Response structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      dataType: typeof response.data.data,
      isArray: Array.isArray(response.data.data),
      keys: response.data.data ? Object.keys(response.data.data) : 'no data'
    });
    
    if (!response.data.success) {
      console.error('❌ API returned failure:', response.data);
      throw new Error(response.data.error || 'Failed to fetch product');
    }
    
    // ✅ FIX: The product is directly in response.data.data
    const productData = response.data.data;
    
    if (!productData) {
      console.error('❌ No product data in response');
      throw new Error('No product data received from server');
    }
    
    console.log('✅ [SERVICE] Product data extracted:', {
      productId: productData._id,
      productName: productData.name,
      hasImages: !!productData?.images?.length
    });
    
    // Return consistent structure
    return {
      success: true,
      data: productData,
      message: response.data.message
    };
    
  } catch (error: any) {
    console.error('❌ [SERVICE] Error fetching admin product:', {
      id,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
},

  // ✅ FIXED: createProduct method
  createProduct: async (formData: FormData): Promise<ApiResponse<Product>> => {
    console.log('📤 [SERVICE] createProduct called with FormData');
    
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }
    
    console.log('📁 FormData contents:');
    let hasFiles = false;
    for (let pair of formData.entries()) {
      const [key, value] = pair;
      if (value instanceof File) {
        console.log(`  ${key}: File - "${value.name}" (${value.size} bytes, ${value.type})`);
        hasFiles = true;
      } else {
        const displayValue = typeof value === 'string' && value.length > 100 
          ? value.substring(0, 100) + '...' 
          : value;
        console.log(`  ${key}:`, displayValue);
      }
    }
    console.log('📊 Has files:', hasFiles);
    
    if (!hasFiles) {
      throw new Error('Please select at least one product image');
    }
    
    try {
      console.log('🚀 Making API request to /admin/products...');
      
      const response = await api.post('/admin/products', formData, {
        timeout: 60000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📤 Upload progress: ${percentCompleted}%`);
          }
        }
      });
      
      console.log('✅ [SERVICE] Product created successfully:', {
        id: response.data.data?._id,
        name: response.data.data?.name,
        success: response.data.success,
        images: response.data.data?.images
      });
      
      return response.data;
      
    } catch (error: any) {
      console.error('❌ [SERVICE] createProduct error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Maximum 5MB per image.');
      } else if (error.response?.status === 415) {
        throw new Error('Invalid file type. Only images allowed.');
      } else if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  },

  // updateProduct: async (id: string, data: any): Promise<ApiResponse<Product>> => {
  //   const response = await api.put(`/admin/products/${id}`, data)
  //   return response.data
  // },
// src/services/adminServiceMethods.ts
// Replace the updateProduct method with this fixed version:

updateProduct: async (id: string, data: any): Promise<ApiResponse<Product>> => {
  try {
    console.log('📤 [SERVICE] Updating product:', id);
    console.log('📤 Data type:', data instanceof FormData ? 'FormData' : typeof data);
    
    // If it's FormData, log its contents for debugging
    if (data instanceof FormData) {
      console.log('📋 FormData contents:');
      for (let pair of data.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: File - ${pair[1].name}`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }
    }
    
    // Make the API request
    const response = await api.put(`/admin/products/${id}`, data, {
      headers: data instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ [SERVICE] Product updated successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ [SERVICE] Error updating product:', {
      id,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
},

  deleteProduct: async (id: string, force?: boolean): Promise<ApiResponse<{ message: string }>> => {
    const params: any = {};
    if (force) {
      params.force = 'true';
    }
    const response = await api.delete(`/admin/products/${id}`, { params });
    return response.data;
  },

  deleteProductPermanent: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/products/${id}`, { 
      params: { force: 'true' } 
    });
    return response.data;
  },

  // ✅ FIXED: bulkDeleteProducts method
  bulkDeleteProducts: async (data: { 
    productIds: string[], 
    deleteType?: 'soft' | 'hard' 
  }): Promise<ApiResponse<{ modifiedCount: number, deleteType: string }>> => {
    try {
      console.log('🗑️ Bulk delete products:', data);
      const response = await api.post('/admin/products/bulk/delete', data);
      console.log('✅ Bulk delete response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Bulk delete error:', error);
      throw error;
    }
  },

  // ✅ FIXED: bulkUpdateStatus method
  bulkUpdateStatus: async (productIds: string[], status: 'active' | 'inactive'): Promise<ApiResponse<{ modifiedCount: number }>> => {
    try {
      console.log('🔄 Bulk update status:', { productIds, status });
      const response = await api.post('/admin/products/bulk/status', { productIds, status });
      console.log('✅ Bulk status update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Bulk status update error:', error);
      throw error;
    }
  },

  // ✅ ADDED: bulkUpdateProducts method (was missing)
  bulkUpdateProducts: async (data: { 
    productIds: string[]; 
    updateData: any 
  }): Promise<ApiResponse<{ modified: number; failed: number }>> => {
    try {
      console.log('📝 Bulk update products:', data);
      
      // Update each product individually
      const results = await Promise.allSettled(
        data.productIds.map(id => 
          api.put(`/admin/products/${id}`, data.updateData)
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`✅ Bulk update complete: ${successful} succeeded, ${failed} failed`);
      
      return {
        success: true,
        data: { 
          modified: successful,
          failed
        },
        message: `Updated ${successful} products, ${failed} failed`
      };
    } catch (error: any) {
      console.error('❌ Bulk update error:', error);
      throw error;
    }
  },

  // ✅ FIXED: bulkUpdateFeatured method
  bulkUpdateFeatured: async (productIds: string[], isFeatured: boolean): Promise<ApiResponse<{ modifiedCount: number }>> => {
    try {
      console.log('⭐ Bulk update featured:', { productIds, isFeatured });
      
      // Since we don't have a dedicated endpoint, update each product individually
      const results = await Promise.allSettled(
        productIds.map(id => 
          api.put(`/admin/products/${id}`, { isFeatured })
        )
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`✅ Bulk featured update: ${successful} succeeded, ${failed} failed`);
      
      return {
        success: true,
        data: { 
          modifiedCount: successful
        },
        message: `Featured status updated for ${successful} products`
      };
    } catch (error: any) {
      console.error('❌ Bulk featured update error:', error);
      throw error;
    }
  },

  toggleProductFeatured: async (id: string): Promise<ApiResponse<{ isFeatured: boolean }>> => {
    const response = await api.put(`/admin/products/${id}/featured`)
    return response.data
  },

  toggleProductStatus: async (id: string): Promise<ApiResponse<{ isActive: boolean }>> => {
    const response = await api.put(`/admin/products/${id}/status`)
    return response.data
  },

  updateProductStock: async (id: string, data: { stock: number, operation: 'set' | 'increase' | 'decrease', reason?: string }): Promise<ApiResponse<{ stock: number }>> => {
    const response = await api.put(`/admin/products/${id}/stock`, data)
    return response.data
  },

  uploadProductImages: async (id: string, files: File[]): Promise<ApiResponse<{ images: any[] }>> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    
    const response = await api.post(`/admin/products/${id}/images`, formData)
    return response.data
  },

  removeProductImage: async (id: string, imageUrl: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/products/${id}/images`, { 
      data: { imageUrl }
    })
    return response.data
  },

  importProducts: async (data: { products: any[] }): Promise<ApiResponse<{ success: number; failed: number; errors: Array<{ product: string; error: string }> }>> => {
    const response = await api.post('/admin/products/import', data)
    return response.data
  },

    // Order Management
  getAdminOrders: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{ orders: Order[]; stats: any; pagination: Pagination }>> => {
    const response = await api.get('/admin/orders', { params })
    return response.data
  },

  getAdminOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/admin/orders/${id}`)
    return response.data
  },

updateAdminOrder: async (id: string, data: any): Promise<ApiResponse<Order>> => {
  try {
    console.log('📡 Updating admin order status:', id, data);
    
    // ✅ FIX: Use the correct status endpoint
    const response = await api.put(`/orders/${id}/status`, data);
    
    console.log('✅ Update response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update admin order error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
},

  exportOrders: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    paymentMethod?: string;
    search?: string;
  }): Promise<ApiResponse<any[]>> => {
    const response = await api.get('/admin/orders/export', { params })
    return response.data
  },

  // ✅ NEW: Bulk update orders (for admin quick actions)
  bulkUpdateOrders: async (orderIds: string[], updateData: { status?: string, trackingNumber?: string, carrier?: string }): Promise<ApiResponse<{ matched: number; modified: number }>> => {
    try {
      const response = await api.put('/admin/orders/bulk/update', { orderIds, updateData });
      return response.data;
    } catch (error: any) {
      console.error('Bulk update orders error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Add this after bulkUpdateOrders
bulkUpdateOrderStatus: async (orderIds: string[], status: string): Promise<ApiResponse<{ matched: number; modified: number }>> => {
  return adminService.bulkUpdateOrders(orderIds, { status });
},

  // Analytics
  getSalesAnalytics: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<{
    salesData: Array<{ _id: string; revenue: number; orders: number; averageOrderValue: number }>;
    topProducts: ProductSales[];
    topCategories: CategorySales[];
    revenueByPayment: Array<{ _id: string; revenue: number; orders: number }>;
    period: string;
    startDate: string;
    endDate: string;
  }>> => {
    const response = await api.get('/admin/analytics/sales', { params: { period } })
    return response.data
  },

  getUserAnalytics: async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<ApiResponse<{
    userGrowth: DailyStats[];
    userStats: {
      totalUsers: number;
      activeUsers: number;
      verifiedUsers: number;
      adminUsers: number;
    };
    usersWithOrders: number;
    period: string;
    startDate: string;
    endDate: string;
  }>> => {
    const response = await api.get('/admin/analytics/users', { params: { period } })
    return response.data
  },

  getProductAnalytics: async (): Promise<ApiResponse<{
    productStats: {
      totalProducts: number;
      activeProducts: number;
      featuredProducts: number;
      outOfStock: number;
      lowStock: number;
      averagePrice: number;
      totalStock: number;
    };
    productsByCategory: CategorySales[];
    topRatedProducts: Product[];
    recentProducts: Product[];
  }>> => {
    const response = await api.get('/admin/analytics/products')
    return response.data
  },

  // Payment proof management
  getPendingPaymentProofs: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    orders: Order[];
    pagination: Pagination;
  }>> => {
    const response = await api.get('/payments/pending-proofs', { params })
    return response.data
  },

  verifyManualPayment: async (orderId: string, data: {
    status: 'approved' | 'rejected';
    reviewNotes?: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post(`/payments/${orderId}/verify-manual`, data)
    return response.data
  },

  

// Upload logo
uploadLogo: async (formData: FormData): Promise<ApiResponse<{ url: string; alt: string; updatedAt?: string }>> => {
  try {
    const response = await api.post('/admin/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error uploading logo:', error);
    throw error;
  }
},

// Remove logo
removeLogo: async (): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await api.delete('/admin/settings/logo');
    return response.data;
  } catch (error: any) {
    console.error('Error removing logo:', error);
    throw error;
  }
},

  // ========== CATEGORIES MANAGEMENT ==========
  getCategories: categoryService.getAdminCategories,
  createCategory: categoryService.createCategory,
  updateCategory: categoryService.updateCategory,
  deleteCategory: categoryService.deleteCategory,
  updateCategoryStatus: categoryService.toggleCategoryStatus,
  
  // ========== REVIEWS MANAGEMENT ==========
  getReviews: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'pending' | 'approved' | 'rejected';
    productId?: string;
  }): Promise<ApiResponse<{
    reviews: Review[];
    pagination: Pagination;
    stats: {
      total: number;
      pending: number;
      approved: number;
      featured: number;
      averageRating: number;
    };
  }>> => {
    const response = await api.get('/admin/reviews', { params })
    return response.data
  },

  getReviewById: async (id: string): Promise<ApiResponse<Review>> => {
    const response = await api.get(`/admin/reviews/${id}`)
    return response.data
  },

  approveReview: async (id: string): Promise<ApiResponse<Review>> => {
    const response = await api.put(`/admin/reviews/${id}/approve`)
    return response.data
  },

  rejectReview: async (id: string): Promise<ApiResponse<Review>> => {
    const response = await api.put(`/admin/reviews/${id}/reject`)
    return response.data
  },

  toggleReviewFeatured: async (id: string, isFeatured: boolean): Promise<ApiResponse<Review>> => {
    const response = await api.put(`/admin/reviews/${id}/feature`, { isFeatured })
    return response.data
  },

  deleteReview: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/reviews/${id}`)
    return response.data
  },

  // ========== COUPONS MANAGEMENT ==========
  getCoupons: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: 'active' | 'expired' | 'inactive';
  }): Promise<ApiResponse<{
    coupons: Coupon[];
    pagination: Pagination;
    stats: {
      total: number;
      active: number;
      expired: number;
      usageRate: number;
    };
  }>> => {
    const response = await api.get('/admin/coupons', { params })
    return response.data
  },

  getCouponById: async (id: string): Promise<ApiResponse<Coupon>> => {
    const response = await api.get(`/admin/coupons/${id}`)
    return response.data
  },

  createCoupon: async (data: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount?: number;
    maxDiscountAmount?: number;
    validFrom: string;
    validUntil: string;
    usageLimit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<Coupon>> => {
    const response = await api.post('/admin/coupons', data)
    return response.data
  },

  updateCoupon: async (id: string, data: Partial<Coupon>): Promise<ApiResponse<Coupon>> => {
    const response = await api.put(`/admin/coupons/${id}`, data)
    return response.data
  },

  updateCouponStatus: async (id: string, isActive: boolean): Promise<ApiResponse<Coupon>> => {
    const response = await api.patch(`/admin/coupons/${id}/status`, { isActive })
    return response.data
  },

  deleteCoupon: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete(`/admin/coupons/${id}`)
    return response.data
  },

  validateCoupon: async (code: string, orderAmount?: number): Promise<ApiResponse<{
    valid: boolean;
    coupon: Coupon;
    discountAmount: number;
    message?: string;
  }>> => {
    const response = await api.post('/admin/coupons/validate', { code, orderAmount })
    return response.data
  },
// ========== SETTINGS MANAGEMENT ==========

getSettings: async <T = any>(): Promise<ApiResponse<T>> => {
  try {
    const response = await api.get('/admin/settings')
    return response.data
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    throw error
  }
},

updateSettings: async <T = any>(data: {
  section: string
  data: any
}): Promise<ApiResponse<T>> => {
  try {
    const response = await api.put('/admin/settings', data)
    return response.data
  } catch (error: any) {
    console.error('Error updating settings:', error)
    throw error
  }
},

resetSettings: async <T = any>(section: string): Promise<ApiResponse<T>> => {
  try {
    const response = await api.post(`/admin/settings/reset/${section}`)
    return response.data
  } catch (error: any) {
    console.error('Error resetting settings:', error)
    throw error
  }
},

  // ========== GENERAL UPLOAD SERVICE ==========
  uploadFile: async (files: File[]): Promise<ApiResponse<{ url: string; publicId: string; originalname: string; mimetype: string; size: number }[]>> => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('images', file)
    })
    
    const response = await api.post('/admin/upload', formData)
    return response.data
  }
}

export type AdminService = typeof adminService
export type { Product }


//fix the image show issue in category



// src/services/categoryService.ts - 
import api from './api';
import { Category, ApiResponse } from '../types';

// Constants for better maintainability
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
};

const PUBLIC_PAGINATION = {
  ...DEFAULT_PAGINATION,
  limit: 50
};

// Request queue to prevent rate limiting
let requestQueue: Promise<any> | null = null;
const REQUEST_DELAY = 300; // ms delay between requests
const CATEGORY_UPLOAD_TIMEOUT = 120_000;

// Helper function to handle string error responses
const getErrorMessage = (error: any): string => {
  const responseData = error.response?.data;
  
  if (typeof responseData === 'string') {
    return responseData;
  } else if (typeof responseData?.error === 'string') {
    return responseData.error;
  } else if (typeof responseData?.message === 'string') {
    return responseData.message;
  }
  
  return error.message || 'An unexpected error occurred';
};

// Queue requests to prevent rate limiting
const queueRequest = async <T>(requestFn: () => Promise<T>): Promise<T> => {
  if (requestQueue) {
    // Wait for previous request to complete
    await requestQueue;
  }
  
  requestQueue = new Promise(resolve => setTimeout(resolve, REQUEST_DELAY));
  const result = await requestFn();
  
  // Small delay after request
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return result;
};

// Helper function for logging errors consistently
const logError = (operation: string, error: any, additionalInfo?: Record<string, any>) => {
  console.error(`❌ Frontend: Error ${operation}:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    url: error.config?.url,
    method: error.config?.method,
    ...additionalInfo
  });
};

export const categoryService = {
  // Get all categories (public)
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    featured?: boolean;
    active?: boolean;
  }): Promise<ApiResponse<{ categories: Category[]; pagination: any }>> => {
    try {
      console.log('📡 Frontend: Calling GET /categories with params:', params);
      const response = await api.get('/categories', { params });
      
      console.log('✅ Frontend: Categories API response:', {
        success: response.data.success,
        count: response.data.data?.categories?.length || 0,
        hasPagination: !!response.data.data?.pagination
      });
      
      return {
        success: true,
        data: {
          categories: response.data?.data?.categories || [],
          pagination: response.data?.data?.pagination || PUBLIC_PAGINATION
        },
        message: 'Categories fetched successfully'
      };
    } catch (error: any) {
      logError('fetching public categories', error, { params });
      return {
        success: false,
        data: { categories: [], pagination: null },
        message: getErrorMessage(error)
      };
    }
  },

  // Get category by slug
  getCategoryBySlug: async (slug: string): Promise<ApiResponse<Category>> => {
    try {
      console.log(`📡 Frontend: Calling GET /categories/${slug}`);
      const response = await api.get(`/categories/${slug}`);
      
      console.log('✅ Frontend: Category API response:', {
        success: response.data.success,
        hasData: !!response.data.data,
        name: response.data.data?.name,
        productCount: response.data.data?.productCount || 0
      });
      
      return {
        success: true,
        data: response.data?.data,
        message: 'Category fetched successfully'
      };
    } catch (error: any) {
      logError(`fetching category ${slug}`, error);
      return {
        success: false,
        data: null,
        message: getErrorMessage(error)
      };
    }
  },

  // Get products by category slug
  getProductsByCategory: async (
    slug: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: string;
      order?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
    }
  ): Promise<ApiResponse<{ category: Category; products: any[]; pagination: any }>> => {
    try {
      console.log(`📡 Frontend: Calling GET /categories/${slug}/products with params:`, params);
      const response = await api.get(`/categories/${slug}/products`, { params });
      
      console.log('✅ Frontend: Products by category response:', {
        success: response.data.success,
        productCount: response.data.data?.products?.length || 0,
        categoryName: response.data.data?.category?.name,
        totalProducts: response.data.data?.pagination?.total || 0
      });
      
      return {
        success: true,
        data: response.data?.data || { 
          category: null, 
          products: [], 
          pagination: null 
        },
        message: 'Products fetched successfully'
      };
    } catch (error: any) {
      logError(`fetching products by category ${slug}`, error, { params });
      return {
        success: false,
        data: { category: null, products: [], pagination: null },
        message: getErrorMessage(error)
      };
    }
  },

  // Admin: Get all categories (with stats) - FIXED
  getAdminCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<{ categories: Category[]; pagination: any }>> => {
    return queueRequest(async () => {
      try {
        console.log('📡 Frontend: Calling GET /admin/categories with params:', params);
        
        const response = await api.get('/admin/categories', { params });
        
        console.log('✅ Frontend: Admin categories response:', {
          success: response.data.success,
          count: response.data.data?.categories?.length || 0
        });
        
        return {
          success: true,
          data: {
            categories: response.data?.data?.categories || [],
            pagination: response.data?.data?.pagination || DEFAULT_PAGINATION
          },
          message: 'Categories fetched successfully'
        };
      } catch (error: any) {
        console.error('❌ Frontend: Error fetching admin categories:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        // Handle 401 specifically
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/admin/login';
        }
        
        return {
          success: false,
          data: { categories: [], pagination: null },
          message: getErrorMessage(error)
        };
      }
    });
  },

  // Admin: Create category - FIXED
  createCategory: async (data: FormData): Promise<ApiResponse<Category>> => {
    return queueRequest(async () => {
      try {
        console.log('📡 Frontend: Creating category with data:', 
          Object.fromEntries(data.entries())
        );
        
        const response = await api.post('/admin/categories', data, {
          timeout: CATEGORY_UPLOAD_TIMEOUT,
        });
        
        console.log('✅ Frontend: Category created:', response.data.data?.name);
        
        return {
          success: true,
          data: response.data?.data,
          message: response.data?.message || 'Category created successfully'
        };
      } catch (error: any) {
        console.error('❌ Frontend: Error creating category:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        return {
          success: false,
          data: null,
          message: getErrorMessage(error)
        };
      }
    });
  },
// Admin: Update category - FIXED with proper data cleaning
updateCategory: async (id: string, data: FormData): Promise<ApiResponse<Category>> => {
  return queueRequest(async () => {
    try {
      console.log(`📡 Frontend: Updating category ${id}`);
      
      // ✅ Log what's being sent
      const formDataEntries: any = {};
      for (let [key, value] of data.entries()) {
        formDataEntries[key] = value;
      }
      console.log('📦 Sending FormData:', formDataEntries);
      
      const response = await api.put(`/admin/categories/${id}`, data, {
        // Cloudinary uploads can exceed the normal API timeout on a cold
        // backend. Axios sets the multipart boundary automatically.
        timeout: CATEGORY_UPLOAD_TIMEOUT,
      });
      
      console.log('✅ Frontend: Category updated:', {
        id: response.data.data?._id,
        name: response.data.data?.name
      });
      
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Category updated successfully'
      };
    } catch (error: any) {
      console.error('❌ Frontend: Error updating category:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      return {
        success: false,
        data: null,
        message: getErrorMessage(error)
      };
    }
  });
},
  // Admin: Delete category - FIXED with queue
  deleteCategory: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return queueRequest(async () => {
      try {
        console.log(`📡 Frontend: Deleting category ${id}`);
        
        const response = await api.delete(`/admin/categories/${id}`);
        
        console.log('✅ Frontend: Category deleted:', {
          id,
          message: response.data?.message
        });
        
        return {
          success: true,
          data: { message: response.data?.message || 'Category deleted successfully' },
          message: 'Category deleted successfully'
        };
      } catch (error: any) {
        console.error('❌ Frontend: Error deleting category:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        return {
          success: false,
          data: null,
          message: getErrorMessage(error)
        };
      }
    });
  },

  // Admin: Toggle category status - FIXED with queue
  toggleCategoryStatus: async (id: string, isActive: boolean): Promise<ApiResponse<Category>> => {
    return queueRequest(async () => {
      try {
        console.log(`📡 Frontend: Toggling category ${id} status to ${isActive}`);
        
        const response = await api.patch(
          `/admin/categories/${id}/status`, 
          { isActive }
        );
        
        console.log('✅ Frontend: Category status updated:', {
          id,
          isActive: response.data.data?.isActive,
          name: response.data.data?.name
        });
        
        return {
          success: true,
          data: response.data?.data,
          message: response.data?.message || 'Category status updated'
        };
      } catch (error: any) {
        console.error('❌ Frontend: Error toggling category status:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        
        return {
          success: false,
          data: null,
          message: getErrorMessage(error)
        };
      }
    });
  }
};

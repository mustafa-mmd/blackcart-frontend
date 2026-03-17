// src/services/reviewService.ts
import api from './api';
import { ApiResponse, Review, ReviewStats } from '../types';

export const reviewService = {
  // Create a new review
  createReview: async (reviewData: {
    productId: string;
    rating: number;
    comment: string;
    title?: string;
  }): Promise<ApiResponse<Review>> => {
    try {
      console.log('📝 Submitting review for product:', reviewData.productId);
      
      // Use the correct endpoint - productId in URL
      const endpoint = `/products/${reviewData.productId}/reviews`;
      
      const response = await api.post(endpoint, {
        rating: reviewData.rating,
        comment: reviewData.comment,
        title: reviewData.title || '',
        images: []
      });
      
      console.log('✅ Review submitted successfully:', response.data);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || 'Review submitted successfully'
      };
      
    } catch (error: any) {
      console.error('❌ Review submission error:', error.response?.data || error.message);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        return {
          success: false,
          data: null,
          message: error.response?.data?.error || 'Invalid review data'
        };
      }
      
      if (error.response?.status === 401) {
        return {
          success: false,
          data: null,
          message: 'Please login to submit a review'
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          data: null,
          message: 'Product not found'
        };
      }
      
      return {
        success: false,
        data: null,
        message: error.response?.data?.error || 'Failed to submit review'
      };
    }
  },

  // Get product reviews
  getProductReviews: async (
    productId: string, 
    params?: any
  ): Promise<ApiResponse<{ reviews: Review[]; ratingStats: ReviewStats }>> => {
    try {
      const endpoint = `/products/${productId}/reviews`;
      console.log(`🔄 Getting reviews from: ${endpoint}`);
      
      const response = await api.get(endpoint, { params });
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Reviews fetched successfully'
      };
      
    } catch (error: any) {
      console.error('❌ Error fetching reviews:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch reviews'
      };
    }
  },

  // Mark review as helpful
  markHelpful: async (reviewId: string): Promise<ApiResponse<any>> => {
    try {
      console.log('📡 Marking review helpful:', reviewId);
      const response = await api.put(`/reviews/${reviewId}/helpful`);
      
      return {
        success: true,
        data: response.data?.data || response.data,
        message: 'Review marked as helpful'
      };
    } catch (error: any) {
      console.error('❌ Error marking review helpful:', error);
      
      if (error.response?.status === 401) {
        return {
          success: false,
          data: null,
          message: 'Please login to mark reviews as helpful'
        };
      }
      
      if (error.response?.status === 404) {
        return {
          success: false,
          data: null,
          message: 'Review not found'
        };
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to mark review helpful'
      };
    }
  }
};
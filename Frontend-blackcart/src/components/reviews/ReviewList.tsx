// src/components/reviews/ReviewList.tsx
import React from 'react';
import { Star, User, Calendar, ThumbsUp, CheckCircle } from 'lucide-react';
import { Review } from '../../types';

interface ReviewListProps {
  reviews: Review[];
  ratingStats?: {
    average: number;
    total: number;
    distribution: Record<number, number>;
  };
  onWriteReview?: () => void;
  onHelpfulClick?: (reviewId: string) => void; // ✅ Already added
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  reviews, 
  ratingStats, 
  onWriteReview,
  onHelpfulClick // ✅ Already destructured
}) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`h-4 w-4 ${
              index < Math.floor(rating) 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600 mb-6">Be the first to review this product!</p>
        {onWriteReview && (
          <button
            onClick={onWriteReview}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Write a Review
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Stats */}
      {ratingStats && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {ratingStats.average.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(ratingStats.average)}
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {ratingStats.total}
              </div>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
            
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingStats.distribution?.[stars] || 0;
                const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
                
                return (
                  <div key={stars} className="flex items-center">
                    <div className="flex items-center w-16">
                      <span className="text-sm text-gray-600 mr-2">{stars}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-600 w-10 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div 
            key={review._id} 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {typeof review.user === 'object' ? review.user.name : 'User'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(review.createdAt)}
              </div>
            </div>

            {review.title && (
              <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
            )}

            <p className="text-gray-600 mb-4 whitespace-pre-line">
              {review.comment}
            </p>

            {review.verifiedPurchase && (
              <div className="inline-flex items-center text-sm text-green-600 bg-green-50 px-2 py-1 rounded mb-4">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Purchase
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              {/* ✅ Already correctly using onHelpfulClick with optional chaining */}
              <button
                onClick={() => onHelpfulClick?.(review._id)}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Helpful ({review.helpful || 0})
              </button>
              
              <button className="text-sm text-gray-400 hover:text-red-600">
                Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
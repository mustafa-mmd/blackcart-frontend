// src/components/reviews/ReviewForm.tsx
import React, { useState } from 'react';
import { Star, X, Send, AlertCircle, Check, Info } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  productName: string;
  onSubmit: (reviewData: {
    rating: number;
    comment: string;
    title?: string;
  }) => Promise<void> | void;
  onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  productName,
  onSubmit,
  onCancel
}) => {
  const [rating, setRating] = useState(5); // Default to 5 stars
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // In ReviewForm.tsx, update handleSubmit:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  if (rating === 0) {
    setError('Please select a rating');
    return;
  }
  
  if (!comment.trim() || comment.trim().length < 10) {
    setError('Please write a review of at least 10 characters');
    return;
  }
  
  setSubmitting(true);
  
  try {
    const result = await onSubmit({
      rating,
      comment: comment.trim(),
      title: title.trim()
    });
    
    // Check if result has success property (from reviewService)
    if (result && typeof result === 'object' && result.success === false) {
      setError(result.message || 'Failed to submit review');
      setSubmitting(false);
      return;
    }
    
    // Success
    setSuccess(true);
    setTimeout(() => onCancel(), 2000);
    
  } catch (error: any) {
    console.error('Form submission error:', error);
    setError(error.message || 'An unexpected error occurred. Please try again.');
    setSubmitting(false);
  }
};

  // Star rating labels
  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-xl">
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Review Submitted!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for sharing your experience with {productName}.
          </p>
          <div className="animate-pulse text-sm text-gray-500">
            Closing in a moment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
          <p className="text-sm text-gray-600 mt-1">Share your experience with: <span className="font-medium">{productName}</span></p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={submitting}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating *
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 transform hover:scale-110 transition-transform"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={submitting}
              >
                <Star
                  className={`h-9 w-9 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <div className="ml-4">
              <span className="text-xl font-bold text-gray-900">
                {rating}.0
              </span>
              <span className="ml-2 text-sm text-gray-600">
                - {ratingLabels[rating]}
              </span>
            </div>
          </div>
        </div>

        {/* Review Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Review Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            maxLength={100}
            disabled={submitting}
          />
          <div className="flex justify-between mt-1">
            <p className="text-sm text-gray-500">
              {title.length}/100 characters
            </p>
            {title.length > 80 && (
              <p className="text-sm text-yellow-600">
                {100 - title.length} characters left
              </p>
            )}
          </div>
        </div>

        {/* Review Comment */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about your experience. What did you like or dislike? How does the product compare to your expectations?"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            maxLength={2000}
            required
            disabled={submitting}
          />
          <div className="flex justify-between mt-1">
            <p className="text-sm text-gray-500">
              {comment.length}/2000 characters
            </p>
            {comment.length < 10 && (
              <p className="text-sm text-red-600">
                Minimum 10 characters required
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Review Guidelines</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Be specific about what you liked or disliked</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Include details about quality, performance, and value</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Keep it honest and respectful</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || rating === 0 || comment.trim().length < 10}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
              submitting || rating === 0 || comment.trim().length < 10
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
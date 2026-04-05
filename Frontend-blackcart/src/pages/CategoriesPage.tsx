
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Grid, List } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import Loader from '../components/common/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com';

const CategoriesPage: React.FC = () => {
  console.log('📂 CategoriesPage loaded');
  
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data?.categories || []);
      } else {
        setError(response.message || 'Failed to load categories');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (category: any): string => {
    if (!category?.image) return '/images/placeholder-category.jpg';

    if (typeof category.image === 'object' && category.image !== null) {
      const url = category.image.url || category.image.secure_url;
      if (url && url.includes('cloudinary.com/demo')) return '/images/placeholder-category.jpg';
      return url || '/images/placeholder-category.jpg';
    }

    if (typeof category.image === 'string') {
      if (category.image.includes('cloudinary.com/demo')) return '/images/placeholder-category.jpg';
      if (category.image.startsWith('http')) return category.image;
      if (category.image.startsWith('/uploads')) return `${API_URL}${category.image}`;
      if (!category.image.includes('/')) return `${API_URL}/uploads/${category.image}`;
      return category.image;
    }

    return '/images/placeholder-category.jpg';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/placeholder-category.jpg';
    e.currentTarget.onerror = null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ FIXED: Header — reduced py-12 → py-4 so cards are visible without scrolling */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 md:py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Product Categories</h1>
          <p className="text-blue-100 text-sm md:text-base">Browse products by category</p>
        </div>
      </div>

      {/* ✅ FIXED: Content area — reduced py-8 → py-4 */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-gray-600 mr-2" />
            <span className="text-gray-700">
              {categories.length} Categor{categories.length !== 1 ? 'ies' : 'y'}
            </span>
          </div>
          
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Categories Grid/List */}
        {categories.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.map((category) => {
                const imageUrl = getCategoryImage(category);
                return (
                  <div
                    key={category._id}
                    onClick={() => navigate(`/categories/${category.slug}`)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* ✅ Reduced image height h-32 → h-24 */}
                      {imageUrl && !imageUrl.includes('placeholder') ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="h-24 w-24 rounded-lg object-cover mb-3 group-hover:scale-105 transition-transform"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                          <Package className="h-10 w-10 text-blue-600" />
                        </div>
                      )}
                      
                      <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1">
                        {category.name}
                      </h3>
                      
                      {category.description && (
                        <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between w-full mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {category.productCount || 0} products
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => {
                const imageUrl = getCategoryImage(category);
                return (
                  <div
                    key={category._id}
                    onClick={() => navigate(`/categories/${category.slug}`)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center">
                      {imageUrl && !imageUrl.includes('placeholder') ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="h-16 w-16 rounded-lg object-cover mr-4 flex-shrink-0"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                          <Package className="h-8 w-8 text-blue-600" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {category.name}
                          </h3>
                          <span className={`ml-2 flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {category.description && (
                          <p className="text-gray-600 text-sm mb-1 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Package className="h-3 w-3 mr-1" />
                          <span>{category.productCount || 0} products</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Categories Found</h3>
            <p className="text-gray-600 mb-6">There are no categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
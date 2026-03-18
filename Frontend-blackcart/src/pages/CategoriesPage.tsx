

// src/pages/CategoriesPage.tsx 
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Grid, List } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import Loader from '../components/common/Loader';

// Get API URL from environment or use production default
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
      console.log('📡 Fetching categories...');
      setLoading(true);
      const response = await categoryService.getCategories();
      
      console.log('📊 Categories response:', response);
      
      if (response.success) {
        const cats = response.data?.categories || [];
        console.log(`✅ Loaded ${cats.length} categories`);
        setCategories(cats);
      } else {
        setError(response.message || 'Failed to load categories');
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Use environment API_URL instead of hardcoded localhost
  const getCategoryImage = (category: any): string => {
    if (!category.image) {
      return '';
    }
    
    // If image already has full URL, use as is
    if (category.image.startsWith('http') || category.image.startsWith('https')) {
      return category.image;
    }
    
    // If image starts with /uploads, prepend API_URL
    if (category.image.startsWith('/uploads')) {
      return `${API_URL}${category.image}`;
    }
    
    // If it's just a filename (no path), prepend /uploads and API_URL
    if (!category.image.includes('/')) {
      return `${API_URL}/uploads/${category.image}`;
    }
    
    // Default fallback
    return category.image;
  };

  // ✅ ADD THIS FOR IMAGE ERROR HANDLING
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/placeholder-category.jpg';
    e.currentTarget.onerror = null; // Prevent infinite loop
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Product Categories</h1>
          <p className="text-blue-100 text-lg">
            Browse products by category
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* View Toggle */}
        <div className="flex justify-between items-center mb-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category) => {
                const imageUrl = getCategoryImage(category);
                return (
                  <div
                    key={category._id}
                    onClick={() => navigate(`/categories/${category.slug}`)}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  >
                    <div className="flex flex-col items-center text-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="h-32 w-32 rounded-lg object-cover mb-4 group-hover:scale-105 transition-transform"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                          <Package className="h-12 w-12 text-blue-600" />
                        </div>
                      )}
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between w-full mt-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        
                        <span className="text-sm text-gray-500">
                          {category.productCount || 0} products
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => {
                const imageUrl = getCategoryImage(category);
                return (
                  <div
                    key={category._id}
                    onClick={() => navigate(`/categories/${category.slug}`)}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="h-20 w-20 rounded-lg object-cover mr-6"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-lg bg-blue-100 flex items-center justify-center mr-6">
                          <Package className="h-10 w-10 text-blue-600" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {category.name}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {category.description && (
                          <p className="text-gray-600 mb-2">
                            {category.description}
                          </p>
                        )}
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <Package className="h-4 w-4 mr-1" />
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 mb-6">
              There are no categories available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
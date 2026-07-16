
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Package, Grid, List, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { categoryService } from '../services/categoryService';
import Loader from '../components/common/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');

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
    if (!category?.image) return '';

    if (typeof category.image === 'object' && category.image !== null) {
      const url = category.image.url || category.image.secure_url;
      if (url && url.includes('cloudinary.com/demo')) return '';
      return url || '';
    }

    if (typeof category.image === 'string') {
      if (category.image.includes('cloudinary.com/demo')) return '';
      if (category.image.startsWith('http')) return category.image;
      if (category.image.startsWith('/uploads')) return `${API_URL}${category.image}`;
      if (!category.image.includes('/')) return `${API_URL}/uploads/${category.image}`;
      return category.image;
    }

    return '';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
    e.currentTarget.onerror = null;
  };

  const featuredCategories = categories.filter(c => c.featured || c.isFeatured);
  const allCategories = sortBy === 'popular'
    ? [...categories].sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
    : [...categories].sort((a, b) => a.name.localeCompare(b.name));

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
      <Helmet>
        <title>Shop by Category — Computer Accessories | BlackCart Pakistan</title>
        <meta name="description" content="Browse gaming peripherals, keyboards, mice, monitors, headphones and more by category at BlackCart — Pakistan's trusted computer accessories store." />
        <meta property="og:title" content="Product Categories | BlackCart Pakistan" />
        <meta property="og:description" content="Browse all computer and gaming accessory categories at BlackCart." />
        <meta property="og:url" content="https://blackcart.store/categories" />
        <link rel="canonical" href="https://blackcart.store/categories" />
      </Helmet>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Product Categories</h1>
          <p className="text-blue-100 text-base md:text-lg">Browse and explore our wide range of product categories</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3 text-sm text-gray-500">
        <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/')}>Home</span>
        <span className="mx-2">›</span>
        <span className="text-gray-800 font-medium">Categories</span>
      </div>

      <div className="container mx-auto px-4 pb-10">
        {/* Count + Controls bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 text-gray-700">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">{categories.length} Categories Available</span>
            <span className="text-sm text-gray-500">— Find the perfect products in your favorite category</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={`p-2 flex items-center gap-1 text-sm transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid View</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-2 flex items-center gap-1 text-sm transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Categories Strip */}
        {featuredCategories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-800 text-sm">Featured Categories</span>
              <button className="ml-auto text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
                View All Featured <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {featuredCategories.slice(0, 3).map((cat) => {
                const imgUrl = getCategoryImage(cat);
                return (
                  <div
                    key={cat._id}
                    onClick={() => navigate(`/categories/${cat.slug}`)}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-md transition cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {imgUrl ? (
                        <img src={imgUrl} alt={cat.name} className="w-full h-full object-cover" onError={handleImageError} />
                      ) : (
                        <Package className="h-7 w-7 text-blue-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{cat.name}</div>
                      <div className="text-blue-600 text-sm font-medium">{cat.productCount || 0} Products</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto flex-shrink-0 group-hover:text-blue-600 transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Categories */}
        {allCategories.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allCategories.map((category) => {
                const imageUrl = getCategoryImage(category);
                return (
                  <div
                    key={category._id}
                    onClick={() => navigate(`/categories/${category.slug}`)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer group flex flex-col items-center text-center"
                  >
                    {/* Circular image */}
                    <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      ) : (
                        <Package className="h-9 w-9 text-blue-500" />
                      )}
                    </div>

                    <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 line-clamp-2">
                      {category.name}
                    </h3>

                    {category.description && (
                      <p className="text-gray-500 text-xs mb-2 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-blue-600 text-xs font-medium mt-auto">
                      <Package className="h-3 w-3" />
                      <span>{category.productCount || 0} Products</span>
                    </div>

                    <button className="mt-2 text-blue-600 text-xs font-semibold hover:underline flex items-center gap-0.5">
                      Explore <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {allCategories.map((category) => {
                const imageUrl = getCategoryImage(category);
                return (
                  <div
                    key={category._id}
                    onClick={() => navigate(`/categories/${category.slug}`)}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4 group"
                  >
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                          loading="lazy"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-blue-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-0.5">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-500 text-sm line-clamp-1 mb-1">{category.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {category.productCount || 0} Products
                        </span>
                        {(category.featured || category.isFeatured) && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-3 w-3 fill-yellow-500" /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="flex items-center gap-1 text-blue-600 text-sm font-semibold group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="h-4 w-4" />
                    </button>
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
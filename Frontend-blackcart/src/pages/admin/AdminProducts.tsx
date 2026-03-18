
// Frontend-blackcart/src/pages/admin/AdminProducts.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Package, 
  Filter,
  RefreshCw,
  Upload,
  AlertTriangle,
  Star,
  BarChart3,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import DataTable from '../../components/admin/DataTable';
import { adminService, Product } from '../../services/adminServiceMethods';
import { productService } from '../../services/productService';
import { toast } from 'react-toastify';

// Define Category type
interface Category {
  _id: string;
  name: string;
  slug: string;
}

const AdminProducts: React.FC = () => {
  console.log('✅ AdminProducts component rendered');
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]); // Changed to Category[]
  const [brands, setBrands] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pagination.limit,
      };
      
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (brandFilter !== 'all') params.brand = brandFilter;
      
      console.log('📡 Fetching products with params:', params);
      const response = await adminService.getAdminProducts(params);
      console.log('✅ API Response received:', response.data);
      
      // Debug: Check what categories look like
      console.log('🔍 Categories data from API:', response.data.filters?.categories);
      console.log('🔍 Brands data from API:', response.data.filters?.brands);
      
      // FIXED: Handle categories properly (they might be objects or strings)
      const apiCategories = response.data.filters?.categories || [];
      const processedCategories: Category[] = apiCategories.map((cat: any) => {
        if (typeof cat === 'string') {
          // If category is a string, create a Category object
          const slug = cat.toLowerCase().replace(/\s+/g, '-');
          return { _id: slug, name: cat, slug };
        }
        // If category is an object, extract the properties
        return {
          _id: cat._id || cat.id || cat.name?.toLowerCase().replace(/\s+/g, '-'),
          name: cat.name || cat,
          slug: cat.slug || cat.name?.toLowerCase().replace(/\s+/g, '-')
        };
      });
      
      // FIXED: Handle brands properly
      const apiBrands = response.data.filters?.brands || [];
      const processedBrands = apiBrands.map((brand: any) => {
        if (typeof brand === 'string') return brand;
        return brand.name || brand;
      });
      
      setProducts(response.data.products || []);
      setCategories(processedCategories); // Now storing Category objects
      setBrands(processedBrands);
      setPagination({
        page: response.data.pagination?.page || 1,
        pages: response.data.pagination?.pages || 1,
        total: response.data.pagination?.total || 0,
        limit: response.data.pagination?.limit || 10,
        hasNext: response.data.pagination?.hasNext || false,
        hasPrev: response.data.pagination?.hasPrev || false,
      });
      setSelectedProducts([]);
    } catch (error: any) {
      console.error('❌ Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, categoryFilter, brandFilter, pagination.limit]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      fetchProducts(1);
    }, 500);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleUpdateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      await adminService.updateProduct(productId, updates);
      toast.success('Product updated successfully');
      fetchProducts(pagination.page);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string, permanent = false) => {
    const message = permanent 
      ? '⚠️ WARNING: This will PERMANENTLY delete the product and all associated data. This action cannot be undone!\n\nAre you absolutely sure?'
      : 'Are you sure you want to delete this product? It will be deactivated (soft delete).';
    
    if (!window.confirm(message)) {
      return;
    }

    try {
      setLoading(true);
      
      console.log(`🗑️ Deleting product ${productId}, permanent: ${permanent}`);
      
      if (permanent) {
        // Use deleteProduct with force=true
        const response = await adminService.deleteProduct(productId, true);
        
        if (response.success) {
          toast.success(response.message || 'Product permanently deleted');
          
          // Remove from local state immediately
          setProducts(prev => prev.filter(p => p._id !== productId));
          setSelectedProducts(prev => prev.filter(id => id !== productId));
          
          // Update pagination
          setPagination(prev => ({
            ...prev,
            total: prev.total - 1
          }));
        } else {
          toast.error(response.message || 'Failed to delete product');
        }
      } else {
        // Regular delete (soft delete)
        const response = await adminService.deleteProduct(productId);
        
        if (response.success) {
          toast.success(response.message || 'Product deleted (deactivated)');
          
          // Update product status in local state
          setProducts(prev => 
            prev.map(p => 
              p._id === productId 
                ? { ...p, isActive: false } 
                : p
            )
          );
        } else {
          toast.error(response.message || 'Failed to delete product');
        }
      }
      
    } catch (error: any) {
      console.error('❌ Error deleting product:', error);
      
      // Check if it's an order-related error
      if (error.response?.data?.hasOrders) {
        toast.error(
          <div>
            <strong>Product has associated orders!</strong>
            <br />
            <button 
              onClick={() => handleDeleteProduct(productId, true)}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Force Delete Anyway
            </button>
          </div>,
          {
            autoClose: false,
            closeButton: false
          }
        );
      } else {
        toast.error(error.response?.data?.error || error.message || 'Failed to delete product');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (stock < 10) return { text: 'Low Stock', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { text: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'feature' | 'unfeature' | 'delete' | 'forceDelete') => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select at least one product.');
      return;
    }

    const confirmMessages = {
      activate: 'Are you sure you want to activate the selected products?',
      deactivate: 'Are you sure you want to deactivate the selected products?',
      feature: 'Are you sure you want to feature the selected products?',
      unfeature: 'Are you sure you want to unfeature the selected products?',
      delete: 'Are you sure you want to delete (deactivate) the selected products?',
      forceDelete: '⚠️ WARNING: This will PERMANENTLY delete selected products and all associated data. This action cannot be undone!\n\nAre you absolutely sure?'
    };

    if (!window.confirm(confirmMessages[action])) return;

    try {
      setLoading(true);
      
      let response: any;
      let message = '';
      
      switch (action) {
        case 'activate':
          response = await adminService.bulkUpdateStatus(selectedProducts, 'active');
          message = `${response.data?.modifiedCount || selectedProducts.length} product(s) activated`;
          break;
        case 'deactivate':
          response = await adminService.bulkUpdateStatus(selectedProducts, 'inactive');
          message = `${response.data?.modifiedCount || selectedProducts.length} product(s) deactivated`;
          break;
        case 'feature':
          response = await adminService.bulkUpdateFeatured(selectedProducts, true);
          message = `${response.data?.modifiedCount || selectedProducts.length} product(s) featured`;
          break;
        case 'unfeature':
          response = await adminService.bulkUpdateFeatured(selectedProducts, false);
          message = `${response.data?.modifiedCount || selectedProducts.length} product(s) unfeatured`;
          break;
        case 'delete':
          // Soft delete
          response = await adminService.bulkDeleteProducts({ 
            productIds: selectedProducts, 
            deleteType: 'soft' 
          });
          message = `${response.data?.modifiedCount || selectedProducts.length} product(s) deleted (deactivated)`;
          break;
        case 'forceDelete':
          // Hard delete
          response = await adminService.bulkDeleteProducts({ 
            productIds: selectedProducts, 
            deleteType: 'hard' 
          });
          message = `${response.data?.modifiedCount || selectedProducts.length} product(s) permanently deleted`;
          break;
      }
      
      toast.success(message);
      
      // Refresh the list
      fetchProducts(pagination.page);
      
    } catch (error: any) {
      console.error(`Error performing bulk ${action}:`, error);
      
      // Provide specific error messages
      let errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || `Failed to ${action} products`;
      
      // Check if it's an order-related error
      if (error.response?.data?.hasOrders) {
        errorMessage = 'Some products have associated orders. Use Force Delete if you want to delete them anyway.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // ✅ FIXED: getImageUrl function
  const getImageUrl = (imageData: any): string => {
    if (!imageData) return '';
    
    // If it's already a full URL
    if (typeof imageData === 'string') {
      if (imageData.startsWith('http')) return imageData;
      if (imageData.startsWith('/uploads') || imageData.startsWith('/images')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl}${imageData}`;
      }
      return `https://blackcart-backend.onrender.com/uploads/${imageData}`;
    }
    
    // If it's an object
    if (typeof imageData === 'object') {
      // Try different common field names
      if (imageData.url) return getImageUrl(imageData.url);
      if (imageData.public_id) return getImageUrl(imageData.public_id);
      if (imageData.path) return getImageUrl(imageData.path);
      if (imageData.src) return getImageUrl(imageData.src);
      if (imageData.secure_url) return getImageUrl(imageData.secure_url);
    }
    
    return '';
  };

  // ✅ FIXED: Helper function to get category name from product
  const getCategoryName = (row: Product): string => {
    // Use productService.getCategoryInfo for consistent category handling
    const categoryInfo = productService.getCategoryInfo(row);
    return categoryInfo.name;
  };

  const columns = [
    {
      key: '_id',
      header: 'Product',
      render: (value: string, row: Product) => {
        // ✅ FIXED: Get category name properly using productService
        const categoryName = getCategoryName(row);
        
        // Get images
        const productImages = row.images || (row as any).image || [];
        
        // Get the first image
        let imageUrl = '';
        if (Array.isArray(productImages) && productImages.length > 0) {
          const firstImage = productImages[0];
          imageUrl = getImageUrl(firstImage);
        }
        
        console.log(`📦 Product "${row.name}" - Category: ${categoryName}`);
        
        return (
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden mr-4 flex-shrink-0">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={row.name || 'Product image'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error(`❌ ${row.name} - Image failed to load:`, imageUrl);
                    target.onerror = null;
                    target.src = '/images/placeholder-small.png';
                    target.className = 'h-full w-full object-contain p-1';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-gray-900 truncate">{row.name}</div>
              <div className="text-sm text-gray-500">{row.sku}</div>
              <div className="flex items-center mt-1">
                {row.isFeatured && (
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                )}
                <span className="text-xs text-gray-500">{categoryName}</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'price',
      header: 'Price',
      render: (value: number, row: Product) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900">{formatCurrency(value)}</div>
          {row.discountPrice && row.discountPrice > 0 && row.discountPrice < value && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-red-600 line-through">
                {formatCurrency(row.discountPrice)}
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">
                -{Math.round((1 - row.discountPrice / value) * 100)}%
              </span>
            </div>
          )}
          {row.stockStatus && (
            <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
              row.stockStatus === 'in-stock' ? 'bg-green-100 text-green-800' :
              row.stockStatus === 'low-stock' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {row.stockStatus === 'in-stock' ? '✓ In Stock' : 
               row.stockStatus === 'low-stock' ? '⚠ Low Stock' : 
               '✗ Out of Stock'}
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'stock',
      header: 'Stock',
      render: (value: number) => {
        const status = getStockStatus(value);
        return (
          <div className="flex items-center">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.bg} ${status.color}`}>
              {status.text}
            </span>
            <span className="ml-2 text-sm text-gray-600">{value} units</span>
          </div>
        );
      },
      sortable: true,
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string, row: Product) => (
        <div className="space-y-1">
          <div className="flex items-center">
            {row.isActive ? (
              <Eye className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <EyeOff className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              row.isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {row.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Updated: {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      render: (value: any, row: Product) => (
        <div className="space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateProduct(row._id, { isActive: !row.isActive });
            }}
            className={`w-full px-3 py-1.5 text-xs rounded-lg transition flex items-center justify-center ${
              row.isActive
                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            {row.isActive ? (
              <>
                <EyeOff className="h-3 w-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-3 w-3 mr-1" />
                Activate
              </>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateProduct(row._id, { isFeatured: !row.isFeatured });
            }}
            className={`w-full px-3 py-1.5 text-xs rounded-lg transition flex items-center justify-center ${
              row.isFeatured
                ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            {row.isFeatured ? (
              <>
                <Star className="h-3 w-3 mr-1" />
                Unfeature
              </>
            ) : (
              <>
                <Star className="h-3 w-3 mr-1" />
                Feature
              </>
            )}
          </button>
        </div>
      ),
    },
  ];

  const renderActions = (row: Product) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/admin/products/edit/${row._id}`);
        }}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="Edit Product"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`/products/${row.slug || row._id}`);
        }}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
        title="View Product"
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProduct(row._id, false);
        }}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Delete Product"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const renderSelectionColumn = (row: Product) => (
    <input
      type="checkbox"
      checked={selectedProducts.includes(row._id)}
      onChange={(e) => {
        e.stopPropagation();
        handleSelectProduct(row._id);
      }}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-2">Manage your product catalog and inventory</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/admin/products/import')}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button
                onClick={() => navigate('/admin/products/new')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          {/* Filters - FIXED CATEGORY DROPDOWN */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or brand..."
                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchTerm}
                />
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
              
              {/* ✅ FIXED: Category Dropdown */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.slug || category.name}>
                    {category.name} {/* Renders the name, not the object */}
                  </option>
                ))}
              </select>
              
              {/* ✅ Fixed: Brand Dropdown */}
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Brands</option>
                {brands.map((brand, index) => {
                  // Handle both string and object brands
                  const brandName = typeof brand === 'string' ? brand : brand.toString();
                  const brandValue = typeof brand === 'string' ? brand : brandName;
                  
                  return (
                    <option key={brandValue + index} value={brandValue}>
                      {brandName}
                    </option>
                  );
                })}
              </select>
              
              <button
                onClick={() => fetchProducts()}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <TrendingUp className="h-3 w-3 inline mr-1 text-green-500" />
              <span>Last 30 days: +12%</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Active Products</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {products.filter(p => p.isActive).length}
                </p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {pagination.total > 0 ? Math.round((products.filter(p => p.isActive).length / pagination.total) * 100) : 0}% of total
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {products.filter(p => p.stock < 10 && p.stock > 0).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="mt-3 text-xs text-yellow-600">
              Needs attention
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {products.filter(p => p.stock === 0).length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <div className="mt-3 text-xs text-red-600">
              Requires restocking
            </div>
          </div>
        </div>

        {/* Selected Products Actions */}
        {selectedProducts.length > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium text-blue-800">
                  {selectedProducts.length} product(s) selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction('feature')}
                  className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition text-sm font-medium"
                >
                  Feature
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <DataTable
            columns={columns}
            data={products}
            loading={loading}
            searchable={false}
            pagination={{
              ...pagination,
              onPageChange: handlePageChange,
            }}
            selection={{
              enable: true,
              render: renderSelectionColumn,
              onSelectAll: handleSelectAll,
              selectedCount: selectedProducts.length,
              totalCount: products.length,
            }}
            actions={renderActions}
            onRowClick={(row) => navigate(`/admin/products/edit/${row._id}`)}
            emptyMessage={
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? 'Try adjusting your search filters' : 'Get started by creating your first product'}
                </p>
                <button
                  onClick={() => navigate('/admin/products/new')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Product
                </button>
              </div>
            }
          />
        </div>

        {/* Bulk Actions */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Actions</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => handleBulkAction('activate')}
              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Activate Selected
            </button>
            <button 
              onClick={() => handleBulkAction('deactivate')}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition flex items-center"
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Deactivate Selected
            </button>
            <button 
              onClick={() => handleBulkAction('feature')}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition flex items-center"
            >
              <Star className="h-4 w-4 mr-2" />
              Feature Selected
            </button>
            <button 
              onClick={() => handleBulkAction('delete')}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </button>
            <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Update Prices
            </button>
            <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Export Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
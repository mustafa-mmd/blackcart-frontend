// src/pages/admin/AdminCategories.tsx 
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Folder, Plus, Edit2, Trash2, Eye, EyeOff, Search, 
  RefreshCw, Package, TrendingUp, TrendingDown, Upload 
} from 'lucide-react';
import { adminService } from '../../services/adminServiceMethods';
import Loader from '../../components/common/Loader';
import { Category } from '../../types';

// ✅ ADD THIS HELPER FUNCTION AT THE TOP
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Form states
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    isActive: true,
    featured: false
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, []);

  // ✅ Image helper function
  const getCategoryImage = (category: Category): string => {
    if (!category.image) {
      return '';
    }
    
    // If image already has full URL or is a cloudinary URL, use as is
    if (category.image.startsWith('http') || category.image.startsWith('https')) {
      return category.image;
    }
    
    // If image starts with /uploads, prepend backend URL
    if (category.image.startsWith('/uploads')) {
      return `https://blackcart-backend.onrender.com${category.image}`;
    }
    
    // If it's just a filename (no path), prepend /uploads and backend URL
    if (!category.image.includes('/')) {
      return `https://blackcart-backend.onrender.com/uploads/${category.image}`;
    }
    
    // Default fallback
    return category.image;
  };

  // ✅ Image error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/placeholder-category.jpg';
    e.currentTarget.onerror = null;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching admin categories...');
      
      const response = await adminService.getCategories();
      
      console.log('📊 Admin categories response:', response);
      
      if (response.success) {
        setCategories(response.data?.categories || []);
        toast.success(`Loaded ${response.data?.categories?.length || 0} categories`);
      } else {
        toast.error(response.message || 'Failed to load categories');
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newCategory.name.trim());
      formData.append('description', newCategory.description.trim());
      formData.append('isActive', newCategory.isActive.toString());
      formData.append('featured', newCategory.featured.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
        console.log('📤 Added image to FormData:', imageFile.name);
      }

      console.log('🚀 Sending FormData:', Object.fromEntries(formData.entries()));
      
      const response = await adminService.createCategory(formData);
      
      console.log('📦 Create category response:', response);
      
      if (response.success) {
        toast.success('Category created successfully!');
        setShowCreateModal(false);
        resetForm();
        
        // ✅ ADD DELAY BEFORE REFRESHING
        await delay(500);
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to create category');
      }
    } catch (error: any) {
      console.error('Create category error:', error);
      toast.error(error.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const formData = new FormData();
      formData.append('name', selectedCategory.name.trim());
      formData.append('description', selectedCategory.description?.trim() || '');
      formData.append('isActive', selectedCategory.isActive.toString());
      formData.append('featured', selectedCategory.featured.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      console.log('🚀 Sending update FormData:', Object.fromEntries(formData.entries()));
      
      const response = await adminService.updateCategory(selectedCategory._id, formData);
      
      console.log('📦 Update category response:', response);
      
      if (response.success) {
        toast.success('Category updated successfully!');
        setShowEditModal(false);
        resetForm();
        
        // ✅ ADD DELAY BEFORE REFRESHING
        await delay(500);
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to update category');
      }
    } catch (error: any) {
      console.error('Update category error:', error);
      toast.error(error.message || 'Failed to update category');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log(`🔄 Toggling category ${id} status to ${!currentStatus}`);
      
      const response = await adminService.updateCategoryStatus(id, !currentStatus);
      
      console.log('📦 Toggle status response:', response);
      
      if (response.success) {
        toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
        
        // ✅ ADD DELAY BEFORE REFRESHING
        await delay(500);
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to update category');
      }
    } catch (error: any) {
      console.error('Toggle status error:', error);
      toast.error(error.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`🗑️ Deleting category ${id}: ${name}`);
      
      const response = await adminService.deleteCategory(id);
      
      console.log('📦 Delete category response:', response);
      
      if (response.success) {
        toast.success('Category deleted successfully');
        
        // ✅ ADD DELAY BEFORE REFRESHING
        await delay(500);
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Delete category error:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory({ ...category });
    // ✅ FIX: Use the helper function to get correct image URL
    const imageUrl = getCategoryImage(category);
    setImagePreview(imageUrl);
    setImageFile(null);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setNewCategory({
      name: '',
      description: '',
      isActive: true,
      featured: false
    });
    setImageFile(null);
    setImagePreview('');
    setSelectedCategory(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const stats = {
    total: categories.length,
    active: categories.filter(c => c.isActive).length,
    featured: categories.filter(c => c.featured).length,
    totalProducts: categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-2">Manage product categories</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCategories}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories by name, description, or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Active Categories</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Featured Categories</p>
            <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => {
                  const imageUrl = getCategoryImage(category);
                  return (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {imageUrl ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover"
                                src={imageUrl}
                                alt={category.name}
                                onError={handleImageError}
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Folder className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {category.productCount || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          category.featured 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.featured ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(category)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(category._id, category.isActive)}
                            className={category.isActive 
                              ? "text-yellow-600 hover:text-yellow-900" 
                              : "text-green-600 hover:text-green-900"
                            }
                            title={category.isActive ? "Deactivate" : "Activate"}
                          >
                            {category.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id, category.name)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Get started by creating your first category'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create New Category</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter category name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="category-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="category-image" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-lg mb-2"
                          />
                          <p className="text-sm text-blue-600">Change image</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-900">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCategory.isActive}
                      onChange={(e) => setNewCategory({...newCategory, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCategory.featured}
                      onChange={(e) => setNewCategory({...newCategory, featured: e.target.checked})}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Featured</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Category</h2>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={selectedCategory.name}
                    onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={selectedCategory.description || ''}
                    onChange={(e) => setSelectedCategory({...selectedCategory, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    rows={3}
                  />
                </div>

                {/* Current Image */}
                {selectedCategory.image && !imagePreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Image
                    </label>
                    <img
                      src={getCategoryImage(selectedCategory)}
                      alt={selectedCategory.name}
                      className="h-32 w-32 object-cover rounded-lg"
                      onError={handleImageError}
                    />
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedCategory.image ? 'Change Image' : 'Add Image'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="edit-category-image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="edit-category-image" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="flex flex-col items-center">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-lg mb-2"
                          />
                          <p className="text-sm text-blue-600">Change image</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-900">
                            Click to upload image
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Status & Featured */}
                <div className="flex space-x-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategory.isActive}
                      onChange={(e) => setSelectedCategory({...selectedCategory, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Active</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategory.featured}
                      onChange={(e) => setSelectedCategory({...selectedCategory, featured: e.target.checked})}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-gray-700">Featured</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;



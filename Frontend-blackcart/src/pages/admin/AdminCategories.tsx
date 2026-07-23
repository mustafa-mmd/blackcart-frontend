// src/pages/admin/AdminCategories.tsx 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Folder, Plus, Edit2, Trash2, Eye, EyeOff, Search, 
  RefreshCw, Package, Upload, LayoutGrid, List, MoreHorizontal, Star, Check
} from 'lucide-react';
import { adminService } from '../../services/adminServiceMethods';
import Loader from '../../components/common/Loader';
import { Category } from '../../types';

// âœ… ADD THIS HELPER FUNCTION AT THE TOP
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const AdminCategories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() => localStorage.getItem('admin-categories-view') === 'list' ? 'list' : 'grid');

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const changeViewMode = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('admin-categories-view', mode);
  };
  
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

  // âœ… Image helper function
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

  // âœ… Image error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/images/placeholder-category.jpg';
    e.currentTarget.onerror = null;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('ðŸ”„ Fetching admin categories...');
      
      const response = await adminService.getCategories();
      
      console.log('ðŸ“Š Admin categories response:', response);
      
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
      // âœ… FIXED: Use 'image' not 'images' for category upload
      formData.append('image', imageFile);
      console.log('ðŸ“¤ Added image to FormData:', imageFile.name);
    }

    console.log('ðŸš€ Sending FormData:', Object.fromEntries(formData.entries()));
    
    const response = await adminService.createCategory(formData);
    
    console.log('ðŸ“¦ Create category response:', response);
    
    if (response.success) {
      toast.success('Category created successfully!');
      setShowCreateModal(false);
      resetForm();
      
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

    if (!selectedCategory.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const toastId = toast.loading('Updating category...');
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append('name', selectedCategory.name.trim());
      formData.append('description', selectedCategory.description?.trim() || '');
      formData.append('isActive', selectedCategory.isActive.toString());
      formData.append('featured', selectedCategory.featured.toString());
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      console.log('ðŸš€ Sending update FormData:', Object.fromEntries(formData.entries()));
      
      const response = await adminService.updateCategory(selectedCategory._id, formData);
      
      console.log('ðŸ“¦ Update category response:', response);
      
      if (response.success) {
        if (response.data) {
          setCategories((currentCategories) =>
            currentCategories.map((category) =>
              category._id === response.data?._id
                ? {
                    ...category,
                    ...response.data,
                    productCount: category.productCount,
                  }
                : category
            )
          );
        }

        setShowEditModal(false);
        resetForm();
        toast.success('Category updated successfully!', { id: toastId });
      } else {
        toast.error(response.message || 'Failed to update category', { id: toastId });
      }
    } catch (error: any) {
      console.error('Update category error:', error);
      toast.error(error.message || 'Failed to update category', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      console.log(`ðŸ”„ Toggling category ${id} status to ${!currentStatus}`);
      
      const response = await adminService.updateCategoryStatus(id, !currentStatus);
      
      console.log('ðŸ“¦ Toggle status response:', response);
      
      if (response.success) {
        toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
        
        // âœ… ADD DELAY BEFORE REFRESHING
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
      console.log(`ðŸ—‘ï¸ Deleting category ${id}: ${name}`);
      
      const response = await adminService.deleteCategory(id);
      
      console.log('ðŸ“¦ Delete category response:', response);
      
      if (response.success) {
        toast.success('Category deleted successfully');
        
        // âœ… ADD DELAY BEFORE REFRESHING
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

  const handleToggleFeatured = async (category: Category) => {
    const formData = new FormData();
    formData.append('name', category.name.trim());
    formData.append('description', category.description?.trim() || '');
    formData.append('isActive', String(category.isActive));
    formData.append('featured', String(!category.featured));
    setOpenMenuId(null);
    try {
      const response = await adminService.updateCategory(category._id, formData);
      if (response.success) {
        toast.success(!category.featured ? 'Category featured' : 'Category unfeatured');
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to update featured status');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update featured status');
    }
  };

  const renderActionMenu = (category: Category) => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenMenuId(openMenuId === category._id ? null : category._id)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        aria-label={`More actions for ${category.name}`}
        aria-expanded={openMenuId === category._id}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {openMenuId === category._id && (
        <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <button type="button" onClick={() => { setOpenMenuId(null); navigate(`/categories/${category.slug}`); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Eye className="h-4 w-4 text-slate-500" /> View Category</button>
          <button type="button" onClick={() => handleToggleFeatured(category)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Star className="h-4 w-4 text-amber-500" /> {category.featured ? 'Unfeature' : 'Feature'}</button>
          <button type="button" onClick={() => { setOpenMenuId(null); handleToggleStatus(category._id, category.isActive); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><Check className="h-4 w-4 text-emerald-500" /> {category.isActive ? 'Deactivate' : 'Activate'}</button>
          <div className="my-1 border-t border-slate-100" />
          <button type="button" onClick={() => { setOpenMenuId(null); handleDeleteCategory(category._id, category.name); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Delete</button>
        </div>
      )}
    </div>
  );
  const openEditModal = (category: Category) => {
    setSelectedCategory({ ...category });
    // âœ… FIX: Use the helper function to get correct image URL
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
      <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
        <div className="mx-auto w-full max-w-[1600px] animate-pulse">
          <div className="mb-8 flex items-center justify-between"><div><div className="h-8 w-48 rounded-lg bg-slate-200" /><div className="mt-2 h-4 w-72 rounded bg-slate-200" /></div><div className="h-10 w-36 rounded-xl bg-slate-200" /></div>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 rounded-2xl border border-slate-200 bg-white" />)}</div>
          <div className="mb-6 h-12 rounded-xl border border-slate-200 bg-white" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">{Array.from({ length: 10 }).map((_, index) => <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="aspect-[4/3] bg-slate-200" /><div className="space-y-3 p-4"><div className="h-5 w-3/4 rounded bg-slate-200" /><div className="h-10 rounded bg-slate-100" /><div className="h-4 w-1/3 rounded bg-slate-200" /></div></div>)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Categories</h1>
              <p className="mt-1 text-sm text-slate-500">Organize and manage your product catalog</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchCategories}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => navigate('/admin/categories/new')}
                className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories by name, description, or slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
            <div className="flex shrink-0 rounded-xl border border-slate-200 bg-white p-1 shadow-sm" aria-label="Category view">
              <button type="button" onClick={() => changeViewMode('list')} aria-pressed={viewMode === 'list'} className={`rounded-md p-1.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="List view"><List className="h-4 w-4" /></button>
              <button type="button" onClick={() => changeViewMode('grid')} aria-pressed={viewMode === 'grid'} className={`rounded-md p-1.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Grid view"><LayoutGrid className="h-4 w-4" /></button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Folder className="mb-2 h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-500">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Check className="mb-2 h-5 w-5 text-emerald-600" />
            <p className="text-sm text-gray-500">Active Categories</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Star className="mb-2 h-5 w-5 text-amber-500" />
            <p className="text-sm text-gray-500">Featured Categories</p>
            <p className="text-2xl font-bold text-purple-600">{stats.featured}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <Package className="mb-2 h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
          </div>
        </div>

        {/* Categories Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className={viewMode === 'list' ? 'overflow-x-auto' : 'hidden'}>
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
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => openEditModal(category)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:border-blue-300 hover:bg-blue-50" title="Edit">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {renderActionMenu(category)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {viewMode === 'grid' && filteredCategories.length > 0 && (
            <div className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredCategories.map((category) => {
                const imageUrl = getCategoryImage(category)
                return (
                  <article key={category._id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                    {imageUrl ? <img src={imageUrl} alt={category.name} onError={handleImageError} className="aspect-[4/3] w-full bg-slate-100 object-cover transition duration-300 hover:scale-[1.02]" loading="lazy" /> : <div className="flex aspect-[4/3] items-center justify-center bg-blue-50"><Folder className="h-12 w-12 text-blue-500" /></div>}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2"><h2 className="font-semibold text-gray-900">{category.name}</h2><span className={`rounded-full px-2 py-1 text-xs font-medium ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{category.isActive ? 'Active' : 'Inactive'}</span></div>
                      <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{category.description || 'No description'}</p>
                      <p className="mt-3 text-sm font-semibold text-blue-700">{category.productCount || 0} products</p>
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
                      <button type="button" onClick={() => openEditModal(category)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-blue-600 transition hover:border-blue-300 hover:bg-blue-50" title="Edit"><Edit2 className="h-4 w-4" /></button>
                      {renderActionMenu(category)}
                    </div>
                  </article>
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search.' 
                  : 'Create your first category to organize your product catalog.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/admin/categories/new')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Category
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
                  Add Category
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
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategory(null);
                    resetForm();
                  }}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateCategory}
                  disabled={isUpdating}
                  aria-busy={isUpdating}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isUpdating && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {isUpdating ? 'Updating...' : 'Update Category'}
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




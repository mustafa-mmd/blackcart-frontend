import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, Trash2, Edit2, Link2, Eye, EyeOff, Upload, 
  RefreshCw, X, Sliders, Image as ImageIcon 
} from 'lucide-react';
import bannerService, { HeroBanner } from '../../services/bannerService';
import Loader from '../../components/common/Loader';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<HeroBanner | null>(null);

  // Form state for creating
  const [newBanner, setNewBanner] = useState({
    title: '',
    link: '',
    order: 0,
    isActive: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form state for editing
  const [editForm, setEditForm] = useState({
    title: '',
    link: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getAdminBanners();
      setBanners(data);
    } catch (error: any) {
      console.error('Error fetching banners:', error);
      toast.error(error.response?.data?.message || 'Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select a banner image');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', newBanner.title);
    formData.append('link', newBanner.link);
    formData.append('order', newBanner.order.toString());
    formData.append('isActive', newBanner.isActive.toString());

    try {
      setLoading(true);
      await bannerService.createBanner(formData);
      toast.success('Banner created successfully');
      setShowCreateModal(false);
      resetCreateForm();
      fetchBanners();
    } catch (error: any) {
      console.error('Error creating banner:', error);
      toast.error(error.response?.data?.message || 'Failed to upload banner');
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setNewBanner({
      title: '',
      link: '',
      order: 0,
      isActive: true
    });
    setImageFile(null);
    setImagePreview('');
  };

  const openEditModal = (banner: HeroBanner) => {
    setSelectedBanner(banner);
    setEditForm({
      title: banner.title || '',
      link: banner.link || '',
      order: banner.order || 0,
      isActive: banner.isActive
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBanner) return;

    try {
      setLoading(true);
      await bannerService.updateBanner(selectedBanner._id, editForm);
      toast.success('Banner updated successfully');
      setShowEditModal(false);
      fetchBanners();
    } catch (error: any) {
      console.error('Error updating banner:', error);
      toast.error(error.response?.data?.message || 'Failed to update banner');
      setLoading(false);
    }
  };

  const handleToggleActive = async (banner: HeroBanner) => {
    try {
      setLoading(true);
      await bannerService.updateBanner(banner._id, { isActive: !banner.isActive });
      toast.success(`Banner ${!banner.isActive ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (error: any) {
      console.error('Error toggling active status:', error);
      toast.error('Failed to change banner status');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this banner? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await bannerService.deleteBanner(id);
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      toast.error(error.response?.data?.message || 'Failed to delete banner');
      setLoading(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_URL || 'https://blackcart-backend.onrender.com';
    return `${baseUrl}${url}`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-blue-600" />
            Hero Banners
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage the full-width promotional images displayed in the home page slider.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchBanners}
            className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            title="Refresh Banners"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Banner
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Banners</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{banners.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold">
            {banners.length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Banners</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">
              {banners.filter(b => b.isActive).length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
            <Eye className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-sm text-gray-500 font-medium">Inactive Banners</p>
            <h3 className="text-2xl font-bold text-gray-500 mt-1">
              {banners.filter(b => !b.isActive).length}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-50 flex items-center justify-center">
            <EyeOff className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-200">
          <Loader size="lg" color="primary" />
          <p className="text-gray-500 mt-4 font-medium">Loading banners...</p>
        </div>
      ) : banners.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No Banners Uploaded</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            You haven't uploaded any hero banners yet. Upload banners to display them in the slider carousel on the home page.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Upload Your First Banner
          </button>
        </div>
      ) : (
        /* Banners List */
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner) => (
            <div 
              key={banner._id} 
              className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md flex flex-col lg:flex-row ${
                banner.isActive ? 'border-gray-200' : 'border-dashed border-gray-300 opacity-75'
              }`}
            >
              {/* Banner Image Preview */}
              <div className="w-full lg:w-2/5 min-h-[160px] lg:min-h-[200px] relative bg-gray-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={getImageUrl(banner.url)} 
                  alt={banner.title || 'Hero Banner'} 
                  className="w-full h-full object-cover aspect-[21/9]"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/800x400?text=Image+Load+Failed';
                  }}
                />
                {!banner.isActive && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <span className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <EyeOff className="h-3.5 w-3.5" /> INACTIVE
                    </span>
                  </div>
                )}
              </div>

              {/* Banner Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {banner.title || <span className="text-gray-400 italic">No Title</span>}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
                        Order: {banner.order}
                      </span>
                      {banner.isActive ? (
                        <span className="px-2.5 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-500 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-700 shrink-0">Click Link:</span>
                      {banner.link ? (
                        <a 
                          href={banner.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {banner.link}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">None (no redirect)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-semibold text-gray-700 shrink-0">Cloudinary ID:</span>
                      <span className="font-mono text-xs text-gray-500 truncate">{banner.public_id}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`p-2 rounded-lg border transition-colors flex items-center justify-center gap-1.5 text-sm font-medium ${
                      banner.isActive 
                        ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                        : 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100'
                    }`}
                    title={banner.isActive ? 'Deactivate Banner' : 'Activate Banner'}
                  >
                    {banner.isActive ? (
                      <>
                        <EyeOff className="h-4 w-4" /> Deactivate
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" /> Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    title="Edit Metadata"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1.5 text-sm font-medium"
                    title="Delete Banner"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden relative">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Upload Hero Banner</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-6">
              {/* Image upload drop zone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image <span className="text-red-500">*</span>
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-300 aspect-[21/9] bg-gray-50">
                    <img 
                      src={imagePreview} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-10 w-10 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, JPEG or WEBP (Max 5MB)</p>
                      <p className="text-xs text-blue-500 font-semibold mt-1">Recommended size: 1920x600 px (3:1 aspect ratio)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                    />
                  </label>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Banner Title (Optional)
                </label>
                <input
                  type="text"
                  id="title"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  placeholder="e.g. Mega Summer Sale"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>

              {/* Link */}
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                  Redirect Link URL (Optional)
                </label>
                <input
                  type="text"
                  id="link"
                  value={newBanner.link}
                  onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
                  placeholder="e.g. /categories/laptops or https://google.com"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty if you don't want the user to be redirected when clicking the banner image. Use relative paths for shop pages (e.g. <code>/products</code>).
                </p>
              </div>

              {/* Grid for Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    value={newBanner.order}
                    onChange={(e) => setNewBanner({ ...newBanner, order: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Banners with lower numbers display first.
                  </p>
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newBanner.isActive}
                      onChange={(e) => setNewBanner({ ...newBanner, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Set as Active</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : 'Upload Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedBanner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden relative">
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h2 className="text-xl font-bold text-gray-900">Edit Banner Details</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              {/* Image Preview (Non-editable here) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image (Upload new banner if you want to replace it)
                </label>
                <div className="rounded-lg overflow-hidden border border-gray-300 aspect-[21/9]">
                  <img 
                    src={getImageUrl(selectedBanner.url)} 
                    alt="Current Banner" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                  Banner Title
                </label>
                <input
                  type="text"
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="e.g. Mega Summer Sale"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>

              {/* Link */}
              <div>
                <label htmlFor="edit-link" className="block text-sm font-medium text-gray-700">
                  Redirect Link URL
                </label>
                <input
                  type="text"
                  id="edit-link"
                  value={editForm.link}
                  onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                  placeholder="e.g. /categories/laptops"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use relative paths for shop pages (e.g. <code>/products</code>).
                </p>
              </div>

              {/* Grid for Order & Active */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-order" className="block text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    id="edit-order"
                    value={editForm.order}
                    onChange={(e) => setEditForm({ ...editForm, order: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  />
                </div>
                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;

// Frontend-blackcart/src/pages/admin/AdminEditProduct.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2,
  Package,
  DollarSign,
  Tag,
  BookOpen,
  BarChart,
  Award,
  Save,
  AlertCircle,
  Star,
  GripVertical,
  X
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import Loader from '../../components/common/Loader'

interface Specification {
  key: string
  value: string
}

interface ProductImage {
  url: string
  public_id?: string
  alt?: string
  _id?: string
  isPrimary?: boolean
}

interface Category {
  _id: string
  name: string
  slug: string
  isActive: boolean
  featured: boolean
  productCount?: number
}

interface ProductFormData {
  name: string
  description: string
  shortDescription: string
  price: number
  discountPrice?: number
  categoryId: string
  brand: string
  sku: string
  stock: number
  tags: string[]
  isFeatured: boolean
  isActive: boolean
  specifications: Specification[]
  features: string[]
}

const AdminEditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingImages, setIsUpdatingImages] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [specifications, setSpecifications] = useState<Specification[]>([{ key: '', value: '' }])
  const [features, setFeatures] = useState<string[]>([''])
  const [imagesToDelete, setImagesToDelete] = useState<ProductImage[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const touchStartRef = useRef<{ index: number; y: number } | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<ProductFormData>()

  // Fetch product data from backend
  const loadProductData = async () => {
    if (!id) return;
    
    try {
      const response = await adminService.getAdminProductById(id);
      if (response.success && response.data) {
        const productData = response.data.product || response.data;
        setProduct(productData);
        
        // Process images from backend
        const images = productData.images || [];
        const processedImages: ProductImage[] = images.map((img: any, index: number) => {
          if (typeof img === 'string') {
            return { 
              url: img, 
              alt: 'Product image',
              isPrimary: index === 0 
            };
          }
          return {
            url: img.url || img.path || '',
            public_id: img.public_id || img.publicId,
            alt: img.alt || 'Product image',
            _id: img._id,
            isPrimary: img.isPrimary || index === 0
          };
        });
        setExistingImages(processedImages);
        return processedImages;
      }
    } catch (error) {
      console.error('Error loading product:', error);
      return null;
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories
        const categoriesResponse = await adminService.getCategories();
        
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data?.categories || []);
        }
        
        // Fetch product data
        if (id) {
          const productResponse = await adminService.getAdminProductById(id);
          
          if (productResponse.success && productResponse.data) {
            const productData = productResponse.data.product || productResponse.data;
            setProduct(productData);
            
            // Process images
            const images = productData.images || [];
            const processedImages: ProductImage[] = images.map((img: any, index: number) => {
              if (typeof img === 'string') {
                return { 
                  url: img, 
                  alt: 'Product image',
                  isPrimary: index === 0 
                };
              }
              return {
                url: img.url || img.path || '',
                public_id: img.public_id || img.publicId,
                alt: img.alt || 'Product image',
                _id: img._id,
                isPrimary: img.isPrimary || index === 0
              };
            });
            setExistingImages(processedImages);
            
            // Determine category ID
            let categoryId = '';
            if (productData.categoryId) {
              categoryId = productData.categoryId;
            } else if (productData.category) {
              if (typeof productData.category === 'object' && productData.category._id) {
                categoryId = productData.category._id;
              } else if (typeof productData.category === 'string') {
                categoryId = productData.category;
              }
            }
            setSelectedCategoryId(categoryId);
            
            // Set form values
            reset({
              name: productData.name,
              description: productData.description || '',
              shortDescription: productData.shortDescription || '',
              price: productData.price,
              discountPrice: productData.discountPrice,
              categoryId: categoryId,
              brand: productData.brand,
              sku: productData.sku,
              stock: productData.stock,
              tags: productData.tags || [],
              isFeatured: productData.isFeatured || false,
              isActive: productData.isActive !== false,
              specifications: productData.specifications && productData.specifications.length > 0 
                ? productData.specifications 
                : [{ key: '', value: '' }],
              features: productData.features && productData.features.length > 0 
                ? productData.features 
                : ['']
            });
            
            if (productData.specifications?.length) setSpecifications(productData.specifications);
            if (productData.features?.length) setFeatures(productData.features);
          } else {
            toast.error('Failed to load product');
            navigate('/admin/products');
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to load product data');
        navigate('/admin/products');
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false);
      }
    };
    
    fetchData();
  }, [id, reset, navigate]);

  // ✅ CRITICAL FIX: Function to save images to backend with proper API call
  const saveImagesToBackend = async (updatedImages: ProductImage[], imagesToDeleteList: ProductImage[] = [], newImagesList: File[] = []) => {
    if (!id) return false;
    
    try {
      setIsUpdatingImages(true);
      
      // Create FormData for the update
      const formData = new FormData();
      
      // Prepare the updated images data with order and primary status
      const imagesData = updatedImages.map((img, idx) => ({
        _id: img._id,
        url: img.url,
        public_id: img.public_id,
        isPrimary: idx === 0, // First image is always primary
        order: idx
      }));
      
      formData.append('existingImages', JSON.stringify(imagesData));
      
      // Add images to delete
      if (imagesToDeleteList.length > 0) {
        const toDelete = imagesToDeleteList.map(img => ({
          _id: img._id,
          url: img.url,
          public_id: img.public_id
        }));
        formData.append('imagesToDelete', JSON.stringify(toDelete));
      }
      
      // Add new images
      newImagesList.forEach((image) => {
        formData.append('images', image);
      });
      
      // Also send a flag to indicate this is an image-only update
      formData.append('isImageUpdate', 'true');
      
      console.log('💾 Saving images to backend:', {
        totalImages: updatedImages.length,
        newImages: newImagesList.length,
        toDelete: imagesToDeleteList.length,
        primaryImageId: updatedImages[0]?._id
      });
      
      // Make the API call
      const response = await adminService.updateProduct(id, formData);
      
      if (response.success) {
        console.log('✅ Images saved successfully');
        toast.success('Image changes saved!', { duration: 2000 });
        return true;
      } else {
        throw new Error(response.message || 'Failed to save images');
      }
    } catch (error: any) {
      console.error('Error saving images:', error);
      toast.error('Failed to save image changes. Please try again.');
      return false;
    } finally {
      setIsUpdatingImages(false);
    }
  };

  // ✅ FIXED: Set primary image with immediate backend save
  const setPrimaryImage = async (index: number) => {
    if (!id || isUpdatingImages) return;
    
    try {
      // Create updated images array with new primary
      const updatedImages = existingImages.map((img, i) => ({
        ...img,
        isPrimary: i === index
      }));
      
      // Update UI immediately for better UX
      setExistingImages(updatedImages);
      
      // Save to backend immediately
      const success = await saveImagesToBackend(updatedImages, imagesToDelete, newImages);
      
      if (success) {
        setMobileMenuOpen(null);
        toast.success(`Image ${index + 1} set as primary and saved!`);
      } else {
        // Revert on failure
        await loadProductData();
        toast.error('Failed to set primary image');
      }
    } catch (error) {
      console.error('Error setting primary image:', error);
      toast.error('Failed to set primary image');
      await loadProductData(); // Reload to revert
    }
  };

  // ✅ FIXED: Handle image deletion with immediate backend save
  const handleRemoveExistingImage = async (image: ProductImage, index: number) => {
    if (!id || isUpdatingImages) return;
    
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      // Add to delete list and remove from existing
      const updatedImages = existingImages.filter((_, i) => i !== index);
      const updatedDeleteList = [...imagesToDelete, image];
      
      // Update UI immediately
      setExistingImages(updatedImages);
      setImagesToDelete(updatedDeleteList);
      
      // Save to backend immediately
      const success = await saveImagesToBackend(updatedImages, updatedDeleteList, newImages);
      
      if (success) {
        setMobileMenuOpen(null);
        toast.success('Image deleted successfully!');
      } else {
        // Revert on failure
        await loadProductData();
        setImagesToDelete([]);
        toast.error('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
      await loadProductData();
    }
  };

  // ✅ FIXED: Desktop drag and drop with immediate backend save
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedImageIndex === null || draggedImageIndex === dropIndex || isUpdatingImages) {
      setIsDragging(false);
      return;
    }
    
    try {
      // Reorder images
      const reorderedImages = [...existingImages];
      const [draggedImage] = reorderedImages.splice(draggedImageIndex, 1);
      reorderedImages.splice(dropIndex, 0, draggedImage);
      
      // Update UI immediately
      setExistingImages(reorderedImages);
      setDraggedImageIndex(null);
      setIsDragging(false);
      
      // Save to backend immediately
      const success = await saveImagesToBackend(reorderedImages, imagesToDelete, newImages);
      
      if (success) {
        toast.success('Image order updated and saved!');
      } else {
        // Revert on failure
        await loadProductData();
        toast.error('Failed to update image order');
      }
    } catch (error) {
      console.error('Error reordering images:', error);
      await loadProductData();
      toast.error('Failed to reorder images');
    }
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
    setIsDragging(false);
  };

  // ✅ FIXED: Mobile drag and drop with immediate backend save
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartRef.current = {
      index: index,
      y: touch.clientY
    };
    
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '0.7';
    target.style.transform = 'scale(0.98)';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isUpdatingImages) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartRef.current.y;
    const itemHeight = 128;
    const moveSteps = Math.round(deltaY / itemHeight);
    
    if (moveSteps !== 0) {
      const targetIndex = Math.min(
        Math.max(touchStartRef.current.index + moveSteps, 0),
        existingImages.length - 1
      );
      
      if (targetIndex !== touchStartRef.current.index) {
        const reorderedImages = [...existingImages];
        const [draggedImage] = reorderedImages.splice(touchStartRef.current.index, 1);
        reorderedImages.splice(targetIndex, 0, draggedImage);
        
        setExistingImages(reorderedImages);
        
        touchStartRef.current = {
          index: targetIndex,
          y: touch.clientY
        };
        
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
      }
    }
  };

  const handleTouchEnd = async (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = '1';
    target.style.transform = 'scale(1)';
    
    if (touchStartRef.current && !isUpdatingImages) {
      // Save the final order to backend
      const success = await saveImagesToBackend(existingImages, imagesToDelete, newImages);
      if (success) {
        toast.success('Image order updated!', { duration: 1500 });
      }
    }
    
    touchStartRef.current = null;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !id || isUpdatingImages) return;
    
    const files = Array.from(e.target.files);
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024;
    
    const validFiles: File[] = [];
    
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`);
        return;
      }
      validFiles.push(file);
    });
    
    if (validFiles.length === 0) return;
    
    // Update state
    const updatedNewImages = [...newImages, ...validFiles];
    setNewImages(updatedNewImages);
    
    // Create previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Save to backend immediately
    await saveImagesToBackend(existingImages, imagesToDelete, updatedNewImages);
  };

  const handleRemoveNewImage = async (index: number) => {
    const updatedNewImages = newImages.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setNewImages(updatedNewImages);
    setImagePreviews(updatedPreviews);
    
    // Save to backend immediately
    await saveImagesToBackend(existingImages, imagesToDelete, updatedNewImages);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(newSpecs);
      setValue('specifications', newSpecs);
    }
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
    setValue('specifications', newSpecs, { shouldValidate: true });
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index);
      setFeatures(newFeatures);
      setValue('features', newFeatures, { shouldValidate: true });
    }
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    setValue('features', newFeatures, { shouldValidate: true });
  };

  // Main submit handler for other product details
  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      
      if (!data.categoryId) {
        toast.error('Please select a valid category');
        setIsSubmitting(false);
        return;
      }
      
      if (existingImages.length === 0 && newImages.length === 0) {
        toast.error('Product must have at least one image');
        setIsSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      
      let tagsArray = [];
      if (data.tags) {
        if (Array.isArray(data.tags)) {
          tagsArray = data.tags;
        } else if (typeof data.tags === 'string') {
          tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
      }
      
      const fields = ['name', 'description', 'shortDescription', 'price', 'discountPrice', 'categoryId', 'brand', 'sku', 'stock', 'isFeatured', 'isActive'];
      
      fields.forEach(field => {
        const value = data[field as keyof ProductFormData];
        if (value !== undefined && value !== null) {
          formData.append(field, value.toString());
        }
      });
      
      if (!data.discountPrice) {
        formData.append('discountPrice', '');
      }
      
      formData.append('tags', JSON.stringify(tagsArray));
      
      const validSpecs = specifications.filter(spec => spec.key.trim() && spec.value.trim());
      formData.append('specifications', JSON.stringify(validSpecs));
      
      const validFeatures = features.filter(feature => feature.trim());
      formData.append('features', JSON.stringify(validFeatures));
      
      // Add remaining images with order and primary status
      const remainingImages = existingImages.map((img, idx) => ({
        url: img.url,
        public_id: img.public_id,
        _id: img._id,
        isPrimary: idx === 0,
        order: idx
      }));
      
      if (remainingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(remainingImages));
      }
      
      if (imagesToDelete.length > 0) {
        const imageIdentifiers = imagesToDelete.map(img => ({
          _id: img._id,
          url: img.url,
          public_id: img.public_id
        }));
        formData.append('imagesToDelete', JSON.stringify(imageIdentifiers));
      }
      
      newImages.forEach((image) => {
        formData.append('images', image);
      });
      
      const response = await adminService.updateProduct(id!, formData);
      
      if (response.success) {
        toast.success('✅ Product updated successfully!');
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/products');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!product && !isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Product not found</h3>
                <p className="text-red-700 mt-1">The product you're trying to edit does not exist.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
            >
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  const price = watch('price');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/products')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-2">Update product details and images</p>
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
              ID: {product?._id || id}
            </div>
          </div>
        </div>

        {/* Saving indicator */}
        {isUpdatingImages && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
            <Loader size="sm" />
            <span>Saving image changes...</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'Product name is required',
                        minLength: { value: 3, message: 'Name must be at least 3 characters' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU *
                      </label>
                      <input
                        type="text"
                        {...register('sku', { 
                          required: 'SKU is required',
                          pattern: {
                            value: /^[A-Z0-9-]+$/,
                            message: 'SKU must contain only uppercase letters, numbers, and hyphens'
                          }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="e.g., PROD-001"
                      />
                      {errors.sku && (
                        <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand *
                      </label>
                      <input
                        type="text"
                        {...register('brand', { 
                          required: 'Brand is required'
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Enter brand name"
                      />
                      {errors.brand && (
                        <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        {...register('categoryId', { required: 'Category is required' })}
                        value={selectedCategoryId || watch('categoryId') || ''}
                        onChange={(e) => {
                          setSelectedCategoryId(e.target.value);
                          setValue('categoryId', e.target.value, { shouldValidate: true });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      >
                        <option value="">Select a category</option>
                        {categories
                          .filter(cat => cat.isActive)
                          .map(cat => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                      {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        {...register('stock', { 
                          required: 'Stock is required',
                          min: { value: 0, message: 'Stock cannot be negative' },
                          valueAsNumber: true
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                      {errors.stock && (
                        <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (PKR) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register('price', { 
                            required: 'Price is required',
                            min: { value: 0.01, message: 'Price must be greater than 0' },
                            valueAsNumber: true
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Price (PKR)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('discountPrice', { 
                            min: { value: 0, message: 'Discount price must be positive' },
                            valueAsNumber: true,
                            validate: (value) => {
                              if (value && value >= price) {
                                return 'Discount price must be less than regular price';
                              }
                              return true;
                            }
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {errors.discountPrice && (
                        <p className="mt-1 text-sm text-red-600">{errors.discountPrice.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Description
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description *
                    </label>
                    <textarea
                      {...register('shortDescription', { 
                        required: 'Short description is required',
                        maxLength: { value: 500, message: 'Short description must be less than 500 characters' }
                      })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Brief product description (shown in listings)"
                    />
                    {errors.shortDescription && (
                      <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Detailed product description..."
                    />
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Specifications
                  </h2>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Specification
                  </button>
                </div>
                
                <div className="space-y-3">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Specification name"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Value"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        disabled={specifications.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Features
                  </h2>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </button>
                </div>
                
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Product feature"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        disabled={features.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Images & Settings */}
            <div className="space-y-6">
              {/* Images */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                  <span>Product Images</span>
                  <span className="text-xs text-gray-500">
                    <span className="hidden md:inline">Drag to reorder • </span>
                    First image is main display
                  </span>
                </h2>
                
                <div className="space-y-4">
                  <div className="md:hidden text-xs text-blue-600 bg-blue-50 p-2 rounded-lg text-center">
                    💡 Long press and drag to reorder images • Tap ⋮⋮ for options
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {existingImages.map((image, index) => (
                      <div 
                        key={image._id || index} 
                        className="relative group"
                        draggable={!isDragging}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={image.alt || `Product ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg transition-all ${
                              image.isPrimary ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                            } ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''}`}
                            draggable="false"
                          />
                          
                          {/* Drag handle */}
                          <div 
                            className="absolute top-2 left-2 cursor-move"
                            onTouchStart={(e) => handleTouchStart(e, index)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                          >
                            <div className="bg-black/50 rounded-full p-1">
                              <GripVertical className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          
                          {/* Primary badge */}
                          {image.isPrimary && (
                            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-lg shadow-md">
                              Primary
                            </div>
                          )}
                          
                          {/* Action buttons */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(image, index)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform hover:scale-110"
                              title="Remove image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            {!image.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition transform hover:scale-110"
                                title="Set as primary"
                              >
                                <Star className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          
                          {/* Mobile action menu button */}
                          <div className="absolute bottom-2 right-2 md:hidden">
                            <button
                              type="button"
                              onClick={() => setMobileMenuOpen(mobileMenuOpen === (image._id || String(index)) ? null : (image._id || String(index)))}
                              className="bg-black/50 rounded-full p-2 backdrop-blur-sm"
                            >
                              <div className="w-4 h-1 bg-white rounded-full mb-1" />
                              <div className="w-4 h-1 bg-white rounded-full mb-1" />
                              <div className="w-4 h-1 bg-white rounded-full" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Mobile action menu */}
                        {mobileMenuOpen === (image._id || String(index)) && (
                          <div className="absolute inset-0 bg-black/70 rounded-lg flex flex-col items-center justify-center gap-3 z-10">
                            <button
                              type="button"
                              onClick={() => {
                                setPrimaryImage(index);
                                setMobileMenuOpen(null);
                              }}
                              className="w-32 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm"
                            >
                              {image.isPrimary ? '✓ Primary' : 'Set as Primary'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(image, index)}
                              className="w-32 py-2 bg-red-500 text-white rounded-lg font-medium text-sm"
                            >
                              Delete Image
                            </button>
                            <button
                              type="button"
                              onClick={() => setMobileMenuOpen(null)}
                              className="w-32 py-2 bg-gray-500 text-white rounded-lg font-medium text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        
                        {/* Order indicator */}
                        <div className="absolute bottom-2 left-2 bg-black/50 rounded-full px-2 py-0.5">
                          <span className="text-white text-xs">{index + 1}</span>
                        </div>
                      </div>
                    ))}
                    
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          New
                        </div>
                      </div>
                    ))}
                    
                    <label className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Upload Image</span>
                      <span className="text-xs text-gray-500 mt-1">(Max 5MB)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    {imagesToDelete.length > 0 && (
                      <p className="text-orange-600 font-medium">
                        ⚠️ {imagesToDelete.length} image(s) will be permanently deleted
                      </p>
                    )}
                    {newImages.length > 0 && (
                      <p className="text-green-600">
                        ✓ {newImages.length} new image(s) ready to upload
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Tags
                </h2>
                
                <div>
                  <input
                    type="text"
                    {...register('tags')}
                    defaultValue={product?.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate tags with commas
                  </p>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isFeatured')}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-gray-700 font-medium">Feature this product</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Show this product in featured sections
                      </p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('isActive')}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3">
                      <span className="text-gray-700 font-medium">Product is active</span>
                      <p className="text-sm text-gray-500 mt-1">
                        Product will be visible to customers
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <button
                  type="submit"
                  disabled={isSubmitting || isUpdatingImages}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size="sm" />
                      <span className="ml-2">Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Update Product
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full mt-3 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminEditProduct
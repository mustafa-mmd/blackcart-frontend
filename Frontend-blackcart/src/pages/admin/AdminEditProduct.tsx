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
  X,
  MoreVertical
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

  // ✅ FIXED: toggleMobileMenu was called in JSX but never defined — added here
  const toggleMobileMenu = (id: string) => {
    setMobileMenuOpen(prev => prev === id ? null : id)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const categoriesResponse = await adminService.getCategories();
        
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data?.categories || []);
        } else {
          toast.error('Failed to load categories');
        }
        
        if (id) {
          const productResponse = await adminService.getAdminProductById(id);
          
          if (productResponse.success && productResponse.data) {
            const productData = productResponse.data.product || productResponse.data;
            setProduct(productData);
            
            const images = productData.images || [];
            const processedImages: ProductImage[] = images.map((img: any, index: number) => {
              if (typeof img === 'string') {
                return { url: img, alt: 'Product image', isPrimary: index === 0 };
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
            
            let categoryId = '';
            if (productData.categoryId) {
              categoryId = productData.categoryId;
            } else if (productData.category) {
              if (typeof productData.category === 'object' && productData.category._id) {
                categoryId = productData.category._id;
              } else if (typeof productData.category === 'string' && productData.category !== '') {
                categoryId = productData.category;
              }
            }
            
            if (categoryId && categoriesResponse.success && categoriesResponse.data?.categories) {
              const categoryExists = categoriesResponse.data.categories.some(
                (cat: Category) => cat._id === categoryId
              );
              if (!categoryExists) {
                categoryId = '';
              }
            }
            
            setSelectedCategoryId(categoryId);
            
            const formValues: Partial<ProductFormData> = {
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
              specifications: productData.specifications?.length > 0 ? productData.specifications : [{ key: '', value: '' }],
              features: productData.features?.length > 0 ? productData.features : ['']
            };
            
            reset(formValues);
            
            if (productData.specifications?.length > 0) setSpecifications(productData.specifications);
            if (productData.features?.length > 0) setFeatures(productData.features);
            
          } else {
            toast.error('Failed to load product');
            navigate('/admin/products');
          }
        }
      } catch (error: any) {
        console.error('❌ Error fetching data:', error);
        toast.error(error.message || 'Failed to load product data');
        navigate('/admin/products');
      } finally {
        setIsLoading(false);
        setLoadingCategories(false);
        setIsInitialLoad(false);
      }
    };
    
    fetchData();
  }, [id, reset, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024
    const validFiles: File[] = []
    
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`)
        return
      }
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Max 5MB.`)
        return
      }
      validFiles.push(file)
    })
    
    if (validFiles.length === 0) return
    setNewImages(prev => [...prev, ...validFiles])
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string])
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (image: ProductImage, index: number) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return
    setImagesToDelete(prev => [...prev, image])
    setExistingImages(prev => prev.filter((_, i) => i !== index))
    toast.success('Image marked for deletion')
    setMobileMenuOpen(null)
  }

  // ==================== DRAG & DROP ====================
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedImageIndex(index)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedImageIndex === null || draggedImageIndex === dropIndex) {
      setIsDragging(false)
      return
    }
    
    const reordered = [...existingImages]
    const [dragged] = reordered.splice(draggedImageIndex, 1)
    reordered.splice(dropIndex, 0, dragged)
    
    const updated = reordered.map((img, idx) => ({ ...img, isPrimary: idx === 0 }))
    setExistingImages(updated)
    setDraggedImageIndex(null)
    setIsDragging(false)
    toast.success('Image order updated — save the form to make it permanent')
  }

  const handleDragEnd = () => {
    setDraggedImageIndex(null)
    setIsDragging(false)
  }

  // ==================== MOBILE TOUCH DRAG ====================
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    const touch = e.touches[0]
    touchStartRef.current = { index, y: touch.clientY }
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '0.7'
    target.style.transform = 'scale(0.98)'
  }

  const handleTouchMove = (e: React.TouchEvent, currentIndex: number) => {
    if (!touchStartRef.current) return
    e.preventDefault()
    
    const touch = e.touches[0]
    const deltaY = touch.clientY - touchStartRef.current.y
    const itemHeight = 144
    const moveSteps = Math.round(deltaY / itemHeight)
    
    if (moveSteps !== 0) {
      const targetIndex = Math.min(
        Math.max(touchStartRef.current.index + moveSteps, 0),
        existingImages.length - 1
      )
      
      if (targetIndex !== touchStartRef.current.index) {
        const reordered = [...existingImages]
        const [dragged] = reordered.splice(touchStartRef.current.index, 1)
        reordered.splice(targetIndex, 0, dragged)
        const updated = reordered.map((img, idx) => ({ ...img, isPrimary: idx === 0 }))
        setExistingImages(updated)
        touchStartRef.current = { index: targetIndex, y: touch.clientY }
        if (window.navigator?.vibrate) window.navigator.vibrate(50)
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement
    target.style.opacity = '1'
    target.style.transform = 'scale(1)'
    touchStartRef.current = null
    toast.success('Image order updated — save to make permanent', { duration: 2000 })
  }

  // ✅ setPrimaryImage — marks first in state, persisted on form submit
  const setPrimaryImage = (index: number) => {
    const updated = existingImages.map((img, i) => ({ ...img, isPrimary: i === index }))
    // Move primary to front so backend naturally treats first image as primary
    const primary = updated.splice(index, 1)[0]
    updated.unshift(primary)
    // Re-assign isPrimary flags after reorder
    const final = updated.map((img, i) => ({ ...img, isPrimary: i === 0 }))
    setExistingImages(final)
    setMobileMenuOpen(null)
    toast.success('Primary image set — save the form to make it permanent')
  }

  // ==================== SPECIFICATIONS & FEATURES ====================
  const addSpecification = () => setSpecifications([...specifications, { key: '', value: '' }])
  
  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const updated = specifications.filter((_, i) => i !== index)
      setSpecifications(updated)
      setValue('specifications', updated)
    }
  }

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications]
    updated[index][field] = value
    setSpecifications(updated)
    setValue('specifications', updated, { shouldValidate: true })
  }

  const addFeature = () => setFeatures([...features, ''])
  
  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const updated = features.filter((_, i) => i !== index)
      setFeatures(updated)
      setValue('features', updated, { shouldValidate: true })
    }
  }

  const updateFeature = (index: number, value: string) => {
    const updated = [...features]
    updated[index] = value
    setFeatures(updated)
    setValue('features', updated, { shouldValidate: true })
  }

  // ==================== FORM SUBMIT ====================
  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      
      if (!data.categoryId) {
        toast.error('Please select a valid category');
        setIsSubmitting(false);
        return;
      }
      
      const totalImages = existingImages.length + newImages.length;
      if (totalImages === 0) {
        toast.error('Product must have at least one image');
        setIsSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      
      // Handle tags
      let tagsArray: string[] = [];
      if (data.tags) {
        if (Array.isArray(data.tags)) tagsArray = data.tags;
        else if (typeof data.tags === 'string') {
          tagsArray = (data.tags as string).split(',').map(t => t.trim()).filter(Boolean);
        }
      }
      
      // Basic fields
      const fields = ['name', 'description', 'shortDescription', 'price', 'categoryId', 'brand', 'sku', 'stock', 'isFeatured', 'isActive'];
      fields.forEach(field => {
        const value = data[field as keyof ProductFormData];
        if (value !== undefined && value !== null) {
          formData.append(field, value.toString());
        }
      });
      
      // Discount price
      if (!data.discountPrice || data.discountPrice === 0) {
        formData.append('discountPrice', '');
      } else {
        formData.append('discountPrice', data.discountPrice.toString());
      }
      
      formData.append('tags', JSON.stringify(tagsArray));
      
      const validSpecs = specifications.filter(s => s.key.trim() && s.value.trim());
      formData.append('specifications', JSON.stringify(validSpecs));
      
      const validFeatures = features.filter(f => f.trim());
      formData.append('features', JSON.stringify(validFeatures));
      
      // Images to delete
      if (imagesToDelete.length > 0) {
        const imageIdentifiers = imagesToDelete.map(img => ({
          _id: img._id,
          url: img.url,
          public_id: img.public_id
        }));
        formData.append('imagesToDelete', JSON.stringify(imageIdentifiers));
      }
      
      // New image files
      newImages.forEach(image => formData.append('images', image));
      
      // ✅ KEY FIX: Send existing images WITH their current order to backend
      // Backend uses this array to reorder product.images permanently
      const orderedExistingImages = existingImages.map((img, idx) => ({
        url: img.url,
        public_id: img.public_id || '',
        _id: img._id || '',
        isPrimary: idx === 0, // First in array is always primary
        order: idx
      }));
      
      formData.append('existingImages', JSON.stringify(orderedExistingImages));
      
      console.log('📤 Submitting:', {
        imagesToDelete: imagesToDelete.length,
        newImages: newImages.length,
        existingImagesOrder: orderedExistingImages.map((img, i) => `${i}: ${img.url?.split('/').pop()}`),
        primaryImage: orderedExistingImages[0]?.url
      });
      
      const response = await adminService.updateProduct(id!, formData);
      
      if (response.success) {
        toast.success('✅ Product updated successfully!');
        setImagesToDelete([]);
        setNewImages([]);
        setImagePreviews([]);
        navigate('/admin/products');
      } else {
        toast.error((response as any).message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('❌ Update error:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Failed to update product');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate('/admin/products');
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
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
    )
  }

  const price = watch('price')
  const discountPrice = watch('discountPrice')

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <button onClick={() => navigate('/admin/products')} className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition">
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      {...register('name', { 
                        required: 'Product name is required',
                        minLength: { value: 3, message: 'Name must be at least 3 characters' },
                        maxLength: { value: 200, message: 'Name must be less than 200 characters' }
                      })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Enter product name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                      <input
                        type="text"
                        {...register('sku', { 
                          required: 'SKU is required',
                          pattern: { value: /^[A-Z0-9-]+$/, message: 'SKU must contain only uppercase letters, numbers, and hyphens' }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="e.g., PROD-001"
                      />
                      {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                      <input
                        type="text"
                        {...register('brand', { 
                          required: 'Brand is required',
                          maxLength: { value: 100, message: 'Brand must be less than 100 characters' }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Enter brand name"
                      />
                      {errors.brand && <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <div className="relative">
                        {loadingCategories || isLoading ? (
                          <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                            <Loader size="sm" />
                            <span className="ml-2 text-gray-500">Loading categories...</span>
                          </div>
                        ) : (
                          <select
                            {...register('categoryId', { required: 'Category is required' })}
                            value={selectedCategoryId || watch('categoryId') || ''}
                            onChange={(e) => {
                              setSelectedCategoryId(e.target.value);
                              setValue('categoryId', e.target.value, { shouldValidate: true });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none"
                          >
                            <option value="">Select a category</option>
                            {categories.filter(cat => cat.isActive).map(cat => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name} {cat.productCount ? `(${cat.productCount})` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                      <input
                        type="number"
                        {...register('stock', { 
                          required: 'Stock is required',
                          min: { value: 0, message: 'Stock cannot be negative' },
                          valueAsNumber: true
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      />
                      {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price (PKR) *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number" step="0.01" min="0.01"
                          {...register('price', { 
                            required: 'Price is required',
                            min: { value: 0.01, message: 'Price must be greater than 0' },
                            valueAsNumber: true
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price (PKR)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number" step="0.01" min="0"
                          {...register('discountPrice', { 
                            min: { value: 0, message: 'Discount price must be positive' },
                            valueAsNumber: true,
                            validate: (value) => {
                              if (value && value >= price) return 'Discount price must be less than regular price'
                              return true
                            }
                          })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        />
                      </div>
                      {errors.discountPrice && <p className="mt-1 text-sm text-red-600">{errors.discountPrice.message}</p>}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Description *</label>
                    <textarea
                      {...register('shortDescription', { 
                        required: 'Short description is required',
                        maxLength: { value: 500, message: 'Short description must be less than 500 characters' }
                      })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Brief product description (shown in listings)"
                    />
                    {errors.shortDescription && <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Description</label>
                    <textarea
                      {...register('description', {
                        maxLength: { value: 5000, message: 'Description must be less than 5000 characters' }
                      })}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Detailed product description..."
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
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
                  <button type="button" onClick={addSpecification} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Specification
                  </button>
                </div>
                <div className="space-y-3">
                  {specifications.map((spec, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text" value={spec.key}
                        onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Specification name"
                      />
                      <input
                        type="text" value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Value"
                      />
                      <button
                        type="button" onClick={() => removeSpecification(index)}
                        disabled={specifications.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <button type="button" onClick={addFeature} className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </button>
                </div>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text" value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Product feature"
                      />
                      <button
                        type="button" onClick={() => removeFeature(index)}
                        disabled={features.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Images */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag to reorder • First image is primary display
                  </p>
                  {/* ✅ FIXED: Persistent save reminder banner */}
                  <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                    💾 Reorder or primary changes are saved when you click <strong>Update Product</strong>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Mobile instruction */}
                  <div className="md:hidden text-xs text-blue-600 bg-blue-50 p-2 rounded-lg text-center">
                    💡 Press ⋮ button for options • Long press grip icon to drag
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {existingImages.map((image, index) => (
                      <div 
                        key={image._id || `img-${index}`} 
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          index === 0 ? 'border-blue-400' : 'border-transparent'
                        } ${draggedImageIndex === index ? 'opacity-50 scale-95' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || `Product ${index + 1}`}
                          className="w-full h-32 object-cover"
                          draggable="false"
                        />
                        
                        {/* Primary badge */}
                        {index === 0 && (
                          <div className="absolute top-1.5 right-1.5 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded font-medium shadow">
                            Primary
                          </div>
                        )}
                        
                        {/* Order number */}
                        <div className="absolute bottom-1.5 left-1.5 bg-black/60 rounded-full px-1.5 py-0.5">
                          <span className="text-white text-xs font-medium">{index + 1}</span>
                        </div>

                        {/* ✅ FIXED: Desktop — grip handle top-left, action buttons always visible on hover */}
                        <div className="absolute top-1.5 left-1.5 hidden md:block cursor-move">
                          <div className="bg-black/50 rounded-full p-1 hover:bg-black/70 transition">
                            <GripVertical className="h-3.5 w-3.5 text-white" />
                          </div>
                        </div>

                        {/* Desktop hover overlay with action buttons */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-200 hidden md:flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(image, index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform hover:scale-110"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          {index !== 0 && (
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

                        {/* ✅ FIXED: Mobile — drag handle + menu button always visible (not hover-only) */}
                        <div className="md:hidden">
                          {/* Drag handle */}
                          <div
                            className="absolute top-1.5 left-1.5 cursor-move touch-manipulation"
                            onTouchStart={(e) => handleTouchStart(e, index)}
                            onTouchMove={(e) => handleTouchMove(e, index)}
                            onTouchEnd={handleTouchEnd}
                          >
                            <div className="bg-black/60 rounded-full p-1.5">
                              <GripVertical className="h-3.5 w-3.5 text-white" />
                            </div>
                          </div>

                          {/* ✅ FIXED: Menu button always visible on mobile (was hidden behind hover) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleMobileMenu(image._id || String(index))
                            }}
                            className="absolute bottom-1.5 right-1.5 bg-black/60 rounded-full p-1.5 active:bg-black/80"
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-white" />
                          </button>
                        </div>

                        {/* Mobile action menu overlay */}
                        {mobileMenuOpen === (image._id || String(index)) && (
                          <div className="absolute inset-0 bg-black/75 rounded-lg flex flex-col items-center justify-center gap-2 z-20">
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="w-36 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm active:bg-blue-600"
                              >
                                ⭐ Set as Primary
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(image, index)}
                              className="w-36 py-2 bg-red-500 text-white rounded-lg font-medium text-sm active:bg-red-600"
                            >
                              🗑️ Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setMobileMenuOpen(null)}
                              className="w-36 py-2 bg-gray-500 text-white rounded-lg font-medium text-sm active:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* New image previews */}
                    {imagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden border-2 border-green-300">
                        <img src={preview} alt={`New ${index + 1}`} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 md:transition-all md:duration-200 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveNewImage(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {/* Mobile delete button always visible */}
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-1.5 right-1.5 md:hidden bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                          New
                        </div>
                      </div>
                    ))}
                    
                    {/* Upload button */}
                    <label className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition active:bg-blue-100">
                      <Upload className="h-7 w-7 text-gray-400 mb-1" />
                      <span className="text-sm text-gray-600">Upload</span>
                      <span className="text-xs text-gray-500">Max 5MB</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  
                  {/* Status messages */}
                  <div className="text-sm space-y-1">
                    {imagesToDelete.length > 0 && (
                      <p className="text-orange-600 font-medium">
                        ⚠️ {imagesToDelete.length} image(s) will be deleted on save
                      </p>
                    )}
                    {newImages.length > 0 && (
                      <p className="text-green-600">
                        ✓ {newImages.length} new image(s) ready to upload
                      </p>
                    )}
                    {existingImages.length === 0 && newImages.length === 0 && (
                      <p className="text-red-500">Please add at least one image</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Tags</label>
                  <input
                    type="text"
                    {...register('tags', {
                      setValueAs: (value) => {
                        if (!value) return [];
                        if (typeof value === 'string') return value.split(',').map(t => t.trim()).filter(Boolean);
                        if (Array.isArray(value)) return value;
                        return [String(value).trim()];
                      }
                    })}
                    defaultValue={product?.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : ''}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="mt-1 text-sm text-gray-500">Separate tags with commas</p>
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
                      <p className="text-sm text-gray-500 mt-1">Show in featured sections</p>
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
                      <p className="text-sm text-gray-500 mt-1">Visible to customers</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6">
                <div className="space-y-3">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader size="md" />
                      <span className="ml-3 text-gray-600">Updating product...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={isSubmitting || (existingImages.length === 0 && newImages.length === 0)}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Update Product
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminEditProduct
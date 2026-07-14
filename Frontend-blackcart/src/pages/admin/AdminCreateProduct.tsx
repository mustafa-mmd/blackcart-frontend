// Frontend-blackcart/src/pages/admin/AdminCreateProduct.tsx
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  GripVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { adminService } from '../../services/adminServiceMethods'
import Loader from '../../components/common/Loader'

interface Specification {
  key: string
  value: string
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

interface Category {
  _id: string
  name: string
  slug: string
  isActive: boolean
  featured: boolean
  productCount?: number
}

interface PendingImage {
  id: string
  file: File
  previewUrl: string
}

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback

const AdminCreateProduct: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<PendingImage[]>([])
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const previewUrlsRef = useRef(new Set<string>())
  const pointerDragIdRef = useRef<string | null>(null)
  const [specifications, setSpecifications] = useState<Specification[]>([{ key: '', value: '' }])
  const [features, setFeatures] = useState<string[]>([''])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        console.log('📡 Fetching categories...')
        const response = await adminService.getCategories()
        
        if (response.success) {
          console.log(`✅ Loaded ${response.data?.categories?.length || 0} categories`)
          setCategories(response.data?.categories || [])
        } else {
          toast.error('Failed to load categories')
        }
      } catch (error: unknown) {
        console.error('Error fetching categories:', error)
        toast.error(getErrorMessage(error, 'Failed to load categories'))
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  useEffect(() => () => {
    previewUrlsRef.current.forEach(url => URL.revokeObjectURL(url))
    previewUrlsRef.current.clear()
  }, [])

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ProductFormData>({
    defaultValues: {
      isFeatured: false,
      isActive: true,
      stock: 0,
      price: 0,
      tags: [],
      specifications: [{ key: '', value: '' }],
      features: [''],
      categoryId: ''
    }
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const availableSlots = Math.max(10 - images.length, 0)
    const selectedFiles = Array.from(e.target.files)
    const files = selectedFiles.slice(0, availableSlots)
    console.log(`📁 Selected ${files.length} files`);

    if (selectedFiles.length > availableSlots) {
      toast.error(`You can upload a maximum of 10 images. ${availableSlots} slot(s) remaining.`)
    }
    
    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    const validFiles: File[] = []
    
    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, WebP, and GIF are allowed.`)
        return
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}. Maximum size is 5MB.`)
        return
      }
      
      validFiles.push(file)
    })
    
    if (validFiles.length === 0) {
      e.target.value = ''
      return
    }

    console.log(`✅ Added ${validFiles.length} valid images`)
    const pendingImages = validFiles.map((file, index) => {
      const previewUrl = URL.createObjectURL(file)
      previewUrlsRef.current.add(previewUrl)
      return {
        id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
        file,
        previewUrl,
      }
    })
    setImages(previous => [...previous, ...pendingImages])
    e.target.value = ''
  }

  const handleRemoveImage = (index: number) => {
    const image = images[index]
    if (image) {
      URL.revokeObjectURL(image.previewUrl)
      previewUrlsRef.current.delete(image.previewUrl)
    }
    setImages(previous => previous.filter((_, imageIndex) => imageIndex !== index))
    console.log(`🗑️ Removed image at index ${index}`)
  }

  const reorderImage = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return
    setImages(previous => {
      const sourceIndex = previous.findIndex(image => image.id === sourceId)
      const targetIndex = previous.findIndex(image => image.id === targetId)
      if (sourceIndex < 0 || targetIndex < 0) return previous
      const reordered = [...previous]
      const [movedImage] = reordered.splice(sourceIndex, 1)
      reordered.splice(targetIndex, 0, movedImage)
      return reordered
    })
  }

  const moveImage = (sourceIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= images.length) return
    reorderImage(images[sourceIndex].id, images[targetIndex].id)
  }

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, imageId: string) => {
    setDraggedImageId(imageId)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', imageId)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault()
    const sourceId = event.dataTransfer.getData('text/plain') || draggedImageId
    if (sourceId) reorderImage(sourceId, targetId)
    setDraggedImageId(null)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>, imageId: string) => {
    event.preventDefault()
    pointerDragIdRef.current = imageId
    setDraggedImageId(imageId)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const sourceId = pointerDragIdRef.current
    if (!sourceId) return
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-image-id]')
    const targetId = target?.dataset.imageId
    if (targetId) reorderImage(sourceId, targetId)
  }

  const endPointerDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    pointerDragIdRef.current = null
    setDraggedImageId(null)
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }])
    console.log('➕ Added new specification field')
  }

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index)
      setSpecifications(newSpecs)
      setValue('specifications', newSpecs, { shouldValidate: true })
      console.log(`🗑️ Removed specification at index ${index}`)
    }
  }

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications]
    newSpecs[index][field] = value
    setSpecifications(newSpecs)
    setValue('specifications', newSpecs, { shouldValidate: true })
  }

  const addFeature = () => {
    setFeatures([...features, ''])
    console.log('➕ Added new feature field')
  }

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index)
      setFeatures(newFeatures)
      setValue('features', newFeatures, { shouldValidate: true })
      console.log(`🗑️ Removed feature at index ${index}`)
    }
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
    setValue('features', newFeatures, { shouldValidate: true })
  }

  const safeSplit = (value: unknown): string[] => {
    if (!value) return [];
    
    if (Array.isArray(value)) {
      return value
        .map(item => String(item).trim())
        .filter(item => item.length > 0);
    }
    
    if (typeof value === 'string') {
      return value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    return [];
  }

  const onSubmit = async (data: ProductFormData) => {
    console.log('🚀 Starting form submission');
    
    try {
      setIsSubmitting(true);
      
      // Validate images
      if (images.length === 0) {
        toast.error('Please select at least one product image');
        setIsSubmitting(false);
        return;
      }
      
      // Validate category selection
      if (!data.categoryId) {
        toast.error('Please select a category');
        setIsSubmitting(false);
        return;
      }
      
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Handle special cases for arrays and objects
          if (key === 'specifications' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'features' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'tags' && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === 'categoryId') {
            // Ensure categoryId is sent
            formData.append('categoryId', value);
            console.log(`✅ Added categoryId:`, value);
          } else if (key === 'discountPrice') {
            const discountPrice = Number(value)
            if (Number.isFinite(discountPrice) && discountPrice > 0) {
              formData.append(key, String(discountPrice))
            }
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Add images
      if (images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image.file, image.file.name);
        });
      }
      
      // Debug form data
      console.log('📦 FormData contents:');
      for (const pair of formData.entries()) {
        const [key, value] = pair;
        if (value instanceof File) {
          console.log(`  ${key}: File - ${value.name}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      // Make the request
      console.log('📡 Sending to API...');
      const response = await adminService.createProduct(formData);
      console.log('✅ API Response:', response);
      
      if (response.success) {
        toast.success('✅ Product created successfully!');
        
        setTimeout(() => {
          navigate('/admin/products');
        }, 1500);
      } else {
        toast.error(response.message || 'Failed to create product');
      }
      
    } catch (error: unknown) {
      console.error('❌ API Error:', error);
      
      const errorMessage = getErrorMessage(error, 'Failed to create product');
      
      if (errorMessage.includes('Category')) {
        toast.error('Invalid category selected. Please choose a valid category.');
      } else if (errorMessage.includes('Session expired')) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => navigate('/admin/login'), 2000);
      } else {
        toast.error(errorMessage);
      }
      
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/products')
    }
  }

  const price = watch('price')

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/products')}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Product</h1>
                <p className="text-gray-600 mt-2">Add a new product to your store</p>
              </div>
            </div>
          </div>
        </div>

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
                        minLength: { value: 3, message: 'Name must be at least 3 characters' },
                        maxLength: { value: 200, message: 'Name must be less than 200 characters' }
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
                          required: 'Brand is required',
                          maxLength: { value: 100, message: 'Brand must be less than 100 characters' }
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
                      <div className="relative">
                        {loadingCategories ? (
                          <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                            <Loader size="sm" />
                            <span className="ml-2 text-gray-500">Loading categories...</span>
                          </div>
                        ) : (
                          <select
                            {...register('categoryId', { 
                              required: 'Category is required'
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none"
                          >
                            <option value="">Select a category</option>
                            {categories
                              .filter(cat => cat.isActive)
                              .map(cat => (
                                <option key={cat._id} value={cat._id}>
                                  {cat.name} {cat.productCount ? `(${cat.productCount})` : ''}
                                </option>
                              ))}
                          </select>
                        )}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
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
                        Discount Price (PKR) <span className="font-normal text-gray-500">(Optional)</span>
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
                            setValueAs: value => value === '' ? undefined : Number(value),
                            validate: (value) => {
                              if (value && value >= price) {
                                return 'Discount price must be less than regular price'
                              }
                              return true
                            }
                          })}
                          placeholder="Leave blank for no discount"
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
                      {...register('description', {
                        maxLength: { value: 5000, message: 'Description must be less than 5000 characters' }
                      })}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                      placeholder="Detailed product description..."
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
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
                        placeholder="Specification name (e.g., Color, Weight)"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                        placeholder="Value (e.g., Black, 1.5kg)"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        disabled={specifications.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove specification"
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
                        placeholder="Product feature (e.g., Water resistant, Wireless)"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        disabled={features.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove feature"
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
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        data-image-id={image.id}
                        draggable
                        onDragStart={event => handleDragStart(event, image.id)}
                        onDragOver={event => event.preventDefault()}
                        onDrop={event => handleDrop(event, image.id)}
                        onDragEnd={() => setDraggedImageId(null)}
                        className={`rounded-xl border bg-white p-2 shadow-sm transition ${
                          draggedImageId === image.id
                            ? 'scale-95 border-blue-500 opacity-60'
                            : index === 0
                              ? 'border-blue-400 ring-2 ring-blue-100'
                              : 'border-gray-200'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={image.previewUrl}
                            alt={`${image.file.name}, position ${index + 1}`}
                            draggable="false"
                            className="h-28 w-full rounded-lg object-cover sm:h-32"
                          />
                          <button
                            type="button"
                            onPointerDown={event => handlePointerDown(event, image.id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={endPointerDrag}
                            onPointerCancel={endPointerDrag}
                            className="touch-none absolute left-1.5 top-1.5 flex h-9 w-9 cursor-grab items-center justify-center rounded-lg bg-gray-950/80 text-white shadow active:cursor-grabbing"
                            aria-label={`Drag image ${index + 1} to reorder`}
                            title="Drag to reorder"
                          >
                            <GripVertical className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow transition hover:bg-red-700"
                            aria-label={`Remove image ${index + 1}`}
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <span className={`absolute bottom-1.5 left-1.5 rounded-md px-2 py-1 text-xs font-bold text-white ${index === 0 ? 'bg-blue-700' : 'bg-gray-950/75'}`}>
                            {index === 0 ? 'Primary' : `Position ${index + 1}`}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            disabled={index === 0}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={`Move image ${index + 1} left`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <span className="min-w-0 truncate text-xs text-gray-500" title={image.file.name}>
                            {index + 1} of {images.length}
                          </span>
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            disabled={index === images.length - 1}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={`Move image ${index + 1} right`}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {images.length < 10 && (
                      <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 transition hover:border-blue-400 hover:bg-blue-50 sm:h-[11.25rem]">
                        <Upload className="mb-2 h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-600">Upload Images</span>
                        <span className="mt-1 text-xs text-gray-500">Max 5MB each · {10 - images.length} left</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-500">
                      Drag images to reorder them. On mobile, drag the grip or use the arrow buttons. The first image is the main storefront image.
                    </p>
                    {images.length > 0 && (
                      <p className="text-green-600 mt-1">
                        {images.length} image(s) to upload
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Tags
                  </label>
                  <input
                    type="text"
                    {...register('tags', {
                      setValueAs: (value: unknown) => {
                        return safeSplit(value);
                      }
                    })}
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
                      defaultChecked
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
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="space-y-3">
                  {isSubmitting ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader size="md" />
                      <span className="ml-3 text-gray-600">Creating product...</span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        Create Product
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

export default AdminCreateProduct

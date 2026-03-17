// Frontend-blackcart/src/pages/admin/AdminCreateProduct.tsx
import React, { useState, useEffect } from 'react'
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
  Hash,
  Tag,
  BookOpen,
  BarChart,
  Award,
  Check,
  X,
  Save
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

const AdminCreateProduct: React.FC = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
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
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
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
    
    const files = Array.from(e.target.files)
    console.log(`📁 Selected ${files.length} files`);
    
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
    
    if (validFiles.length === 0) return
    
    console.log(`✅ Added ${validFiles.length} valid images`)
    setImages(prev => [...prev, ...validFiles])
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
        console.log(`🖼️ Created preview for ${file.name}`)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreviews(newPreviews)
    console.log(`🗑️ Removed image at index ${index}`)
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

  const safeSplit = (value: any): string[] => {
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
          } else {
            formData.append(key, String(value));
          }
        }
      });
      
      // Add images
      if (images.length > 0) {
        images.forEach((image) => {
          formData.append('images', image);
        });
      }
      
      // Debug form data
      console.log('📦 FormData contents:');
      for (let pair of formData.entries()) {
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
      
    } catch (error: any) {
      console.error('❌ API Error:', error);
      
      const errorMessage = error.message || 'Failed to create product';
      
      if (errorMessage.includes('Category')) {
        toast.error('Invalid category selected. Please choose a valid category.');
      } else if (errorMessage.includes('Session expired')) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => navigate('/login'), 2000);
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
  const discountPrice = watch('discountPrice')

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
                                return 'Discount price must be less than regular price'
                              }
                              return true
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
                  <div className="grid grid-cols-2 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform scale-0 group-hover:scale-100"
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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
                  
                  <div className="text-sm">
                    <p className="text-gray-500">
                      First image will be the main display image.
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
                      setValueAs: (value: any) => {
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
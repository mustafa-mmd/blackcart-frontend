// // Frontend-blackcart/src/pages/admin/AdminEditProduct.tsx
// import React, { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useForm } from 'react-hook-form'
// import { toast } from 'react-hot-toast'
// import { 
//   ArrowLeft, 
//   Upload, 
//   Plus, 
//   Trash2,
//   Package,
//   DollarSign,
//   Hash,
//   Tag,
//   BookOpen,
//   BarChart,
//   Award,
//   Check,
//   X,
//   Save
// } from 'lucide-react'
// import { adminService } from '../../services/adminServiceMethods'
// import Loader from '../../components/common/Loader'

// interface Specification {
//   key: string
//   value: string
// }

// interface ProductImage {
//   url: string
//   public_id?: string
//   alt?: string
//   _id?: string
// }

// interface Category {
//   _id: string
//   name: string
//   slug: string
//   isActive: boolean
//   featured: boolean
//   productCount?: number
// }

// interface ProductFormData {
//   name: string
//   description: string
//   shortDescription: string
//   price: number
//   discountPrice?: number
//   categoryId: string
//   brand: string
//   sku: string
//   stock: number
//   tags: string[]
//   isFeatured: boolean
//   isActive: boolean
//   specifications: Specification[]
//   features: string[]
// }

// const AdminEditProduct: React.FC = () => {
//   const { id } = useParams<{ id: string }>()
//   const navigate = useNavigate()
//   const [isLoading, setIsLoading] = useState(true)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [product, setProduct] = useState<any>(null)
//   const [newImages, setNewImages] = useState<File[]>([])
//   const [imagePreviews, setImagePreviews] = useState<string[]>([])
//   const [existingImages, setExistingImages] = useState<ProductImage[]>([])
//   const [specifications, setSpecifications] = useState<Specification[]>([{ key: '', value: '' }])
//   const [features, setFeatures] = useState<string[]>([''])
//   const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
//   const [categories, setCategories] = useState<Category[]>([])
//   const [loadingCategories, setLoadingCategories] = useState(false)
//   const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

//   const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<ProductFormData>()

//   // Fetch data when component mounts
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
        
//         // Fetch categories first
//         console.log('📡 Fetching categories...');
//         const categoriesResponse = await adminService.getCategories();
        
//         if (categoriesResponse.success) {
//           console.log(`✅ Loaded ${categoriesResponse.data?.categories?.length || 0} categories`);
//           setCategories(categoriesResponse.data?.categories || []);
//         } else {
//           toast.error('Failed to load categories');
//         }
        
//         // Then fetch product data
//         if (id) {
//           console.log('📦 Fetching product data...');
//           const productResponse = await adminService.getAdminProductById(id);
          
//           if (productResponse.success && productResponse.data) {
//             const productData = productResponse.data.product || productResponse.data;
//             setProduct(productData);
            
//             // Handle image structure
//             const images = productData.images || [];
//             const processedImages: ProductImage[] = images.map((img: any) => {
//               if (typeof img === 'string') {
//                 return { url: img, alt: 'Product image' };
//               }
//               return {
//                 url: img.url || img.path || '',
//                 public_id: img.public_id || img.publicId,
//                 alt: img.alt || 'Product image',
//                 _id: img._id
//               };
//             });
//             setExistingImages(processedImages);
            
//             // Determine category ID
//             let categoryId = '';
            
//             // Try multiple ways to get category ID
//             if (productData.categoryId) {
//               // Case 1: Direct categoryId field
//               categoryId = productData.categoryId;
//             } else if (productData.category) {
//               // Case 2: Category field (object or string)
//               if (typeof productData.category === 'object' && productData.category._id) {
//                 categoryId = productData.category._id;
//               } else if (typeof productData.category === 'string' && productData.category !== '') {
//                 categoryId = productData.category;
//               }
//             }
            
//             // Verify category exists
//             if (categoryId && categoriesResponse.success && categoriesResponse.data?.categories) {
//               const categoryExists = categoriesResponse.data.categories.some(
//                 (cat: Category) => cat._id === categoryId
//               );
              
//               if (!categoryExists) {
//                 console.warn(`⚠️ Category ID ${categoryId} not found in available categories`);
//                 categoryId = '';
//               }
//             }
            
//             // Store selected category ID
//             setSelectedCategoryId(categoryId);
            
//             // Set form values
//             const formValues: Partial<ProductFormData> = {
//               name: productData.name,
//               description: productData.description || '',
//               shortDescription: productData.shortDescription || '',
//               price: productData.price,
//               discountPrice: productData.discountPrice,
//               categoryId: categoryId,
//               brand: productData.brand,
//               sku: productData.sku,
//               stock: productData.stock,
//               tags: productData.tags || [],
//               isFeatured: productData.isFeatured || false,
//               isActive: productData.isActive !== false,
//               specifications: productData.specifications || [{ key: '', value: '' }],
//               features: productData.features || ['']
//             };
            
//             reset(formValues);
            
//             // Set specifications and features for local state
//             if (productData.specifications && productData.specifications.length > 0) {
//               setSpecifications(productData.specifications);
//             } else {
//               setSpecifications([{ key: '', value: '' }]);
//             }
            
//             if (productData.features && productData.features.length > 0) {
//               setFeatures(productData.features);
//             } else {
//               setFeatures(['']);
//             }
            
//           } else {
//             toast.error('Failed to load product');
//             navigate('/admin/products');
//           }
//         }
//       } catch (error: any) {
//         console.error('❌ Error fetching data:', error);
//         toast.error(error.message || 'Failed to load product data');
//         navigate('/admin/products');
//       } finally {
//         setIsLoading(false);
//         setLoadingCategories(false);
//       }
//     };
    
//     fetchData();
//   }, [id, reset, navigate]);

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files) return
    
//     const files = Array.from(e.target.files)
    
//     // Validate file types and sizes
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
//     const maxSize = 5 * 1024 * 1024 // 5MB
    
//     const validFiles: File[] = []
    
//     files.forEach(file => {
//       if (!allowedTypes.includes(file.type)) {
//         toast.error(`Invalid file type: ${file.name}. Only JPEG, PNG, WebP, and GIF are allowed.`)
//         return
//       }
      
//       if (file.size > maxSize) {
//         toast.error(`File too large: ${file.name}. Maximum size is 5MB.`)
//         return
//       }
      
//       validFiles.push(file)
//     })
    
//     if (validFiles.length === 0) return
    
//     setNewImages(prev => [...prev, ...validFiles])
    
//     // Create previews
//     validFiles.forEach(file => {
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         setImagePreviews(prev => [...prev, reader.result as string])
//       }
//       reader.readAsDataURL(file)
//     })
//   }

//   const handleRemoveNewImage = (index: number) => {
//     const newImagesList = newImages.filter((_, i) => i !== index)
//     const newPreviews = imagePreviews.filter((_, i) => i !== index)
//     setNewImages(newImagesList)
//     setImagePreviews(newPreviews)
//   }

//   const handleRemoveExistingImage = (index: number) => {
//     const imageToRemove = existingImages[index]
    
//     // Add to delete list if it has a URL
//     if (imageToRemove.url) {
//       setImagesToDelete(prev => [...prev, imageToRemove.url])
//     }
    
//     // Remove from existing images
//     setExistingImages(prev => prev.filter((_, i) => i !== index))
//   }

//   const addSpecification = () => {
//     setSpecifications([...specifications, { key: '', value: '' }])
//   }

//   const removeSpecification = (index: number) => {
//     if (specifications.length > 1) {
//       const newSpecs = specifications.filter((_, i) => i !== index)
//       setSpecifications(newSpecs)
//       setValue('specifications', newSpecs)
//     }
//   }

//   const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
//     const newSpecs = [...specifications]
//     newSpecs[index][field] = value
//     setSpecifications(newSpecs)
//     setValue('specifications', newSpecs, { shouldValidate: true })
//   }

//   const addFeature = () => {
//     setFeatures([...features, ''])
//   }

//   const removeFeature = (index: number) => {
//     if (features.length > 1) {
//       const newFeatures = features.filter((_, i) => i !== index)
//       setFeatures(newFeatures)
//       setValue('features', newFeatures, { shouldValidate: true })
//     }
//   }

//   const updateFeature = (index: number, value: string) => {
//     const newFeatures = [...features]
//     newFeatures[index] = value
//     setFeatures(newFeatures)
//     setValue('features', newFeatures, { shouldValidate: true })
//   }

//   const safeSplit = (value: any): string[] => {
//     if (!value) return [];
    
//     if (Array.isArray(value)) {
//       return value
//         .map(item => String(item).trim())
//         .filter(item => item.length > 0);
//     }
    
//     if (typeof value === 'string') {
//       return value
//         .split(',')
//         .map(tag => tag.trim())
//         .filter(tag => tag.length > 0);
//     }
    
//     return [];
//   }

//   const onSubmit = async (data: ProductFormData) => {
//     try {
//       setIsSubmitting(true);
      
//       // Validate category
//       if (!data.categoryId) {
//         toast.error('Please select a valid category');
//         setIsSubmitting(false);
//         return;
//       }
      
//       // Prepare form data
//       const formData = new FormData();
      
//       // Handle tags
//       let tagsArray = [];
//       if (data.tags) {
//         if (Array.isArray(data.tags)) {
//           tagsArray = data.tags;
//         } else if (typeof data.tags === 'string') {
//           tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
//         }
//       }
      
//       // Basic fields
//       const fields = [
//         'name', 'description', 'shortDescription', 'price', 'discountPrice',
//         'categoryId', 'brand', 'sku', 'stock', 'isFeatured', 'isActive'
//       ];
      
//       fields.forEach(field => {
//         const value = data[field as keyof ProductFormData];
//         if (value !== undefined && value !== null) {
//           formData.append(field, value.toString());
//         }
//       });
      
//       // Handle discountPrice separately
//       if (data.discountPrice === undefined || data.discountPrice === null || data.discountPrice === 0) {
//         formData.append('discountPrice', '');
//       } else {
//         formData.append('discountPrice', data.discountPrice.toString());
//       }
      
//       // Add tags as JSON string
//       formData.append('tags', JSON.stringify(tagsArray));
      
//       // Add specifications
//       const validSpecs = specifications.filter(spec => spec.key.trim() && spec.value.trim());
//       formData.append('specifications', JSON.stringify(validSpecs));
      
//       // Add features
//       const validFeatures = features.filter(feature => feature.trim());
//       formData.append('features', JSON.stringify(validFeatures));
      
//       // Add images to delete
//       if (imagesToDelete.length > 0) {
//         formData.append('imagesToDelete', JSON.stringify(imagesToDelete));
//       }
      
//       // Add new images
//       newImages.forEach((image, index) => {
//         formData.append('images', image);
//       });
      
//       // Add existing images that are not removed
//       const remainingImages = existingImages.filter(img => !imagesToDelete.includes(img.url));
//       if (remainingImages.length > 0) {
//         formData.append('existingImages', JSON.stringify(remainingImages));
//       }
      
//       // Use admin service to update product
//       const response = await adminService.updateProduct(id!, formData);
      
//       if (response.success) {
//         toast.success('✅ Product updated successfully!');
//         navigate('/admin/products');
//       } else {
//         toast.error(response.message || 'Failed to update product');
//       }
//     } catch (error: any) {
//       console.error('❌ Update error:', error);
      
//       if (error.response?.data?.message) {
//         if (error.response.data.message.includes('category')) {
//           toast.error('Invalid category selected');
//         } else {
//           toast.error(error.response.data.message);
//         }
//       } else {
//         toast.error(error.message || 'Failed to update product');
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
//       navigate('/admin/products')
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader size="lg" />
//       </div>
//     )
//   }

//   if (!product) {
//     return (
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-6xl mx-auto">
//           <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//             <div className="flex items-center">
//               <X className="h-6 w-6 text-red-500 mr-3" />
//               <div>
//                 <h3 className="text-lg font-medium text-red-800">Product not found</h3>
//                 <p className="text-red-700 mt-1">The product you're trying to edit does not exist.</p>
//               </div>
//             </div>
//             <button
//               onClick={() => navigate('/admin/products')}
//               className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
//             >
//               Back to Products
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   const allImagePreviews = [
//     ...existingImages.map(img => img.url),
//     ...imagePreviews
//   ]

//   const price = watch('price')
//   const discountPrice = watch('discountPrice')

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 md:mb-8">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <button
//                 onClick={() => navigate('/admin/products')}
//                 className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition"
//               >
//                 <ArrowLeft className="h-5 w-5" />
//               </button>
//               <div>
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Product</h1>
//                 <p className="text-gray-600 mt-2">Update product details</p>
//               </div>
//             </div>
//             <div className="text-sm text-gray-500">
//               ID: {product._id || id}
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)}>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Left Column - Basic Info */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Basic Information */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Package className="h-5 w-5 mr-2" />
//                   Basic Information
//                 </h2>
                
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Product Name *
//                     </label>
//                     <input
//                       type="text"
//                       {...register('name', { 
//                         required: 'Product name is required',
//                         minLength: { value: 3, message: 'Name must be at least 3 characters' },
//                         maxLength: { value: 200, message: 'Name must be less than 200 characters' }
//                       })}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                       placeholder="Enter product name"
//                     />
//                     {errors.name && (
//                       <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         SKU *
//                       </label>
//                       <input
//                         type="text"
//                         {...register('sku', { 
//                           required: 'SKU is required',
//                           pattern: {
//                             value: /^[A-Z0-9-]+$/,
//                             message: 'SKU must contain only uppercase letters, numbers, and hyphens'
//                           }
//                         })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         placeholder="e.g., PROD-001"
//                       />
//                       {errors.sku && (
//                         <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Brand *
//                       </label>
//                       <input
//                         type="text"
//                         {...register('brand', { 
//                           required: 'Brand is required',
//                           maxLength: { value: 100, message: 'Brand must be less than 100 characters' }
//                         })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         placeholder="Enter brand name"
//                       />
//                       {errors.brand && (
//                         <p className="mt-1 text-sm text-red-600">{errors.brand.message}</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Category *
//                       </label>
//                       <div className="relative">
//                         {loadingCategories || isLoading ? (
//                           <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
//                             <Loader size="sm" />
//                             <span className="ml-2 text-gray-500">Loading categories...</span>
//                           </div>
//                         ) : (
//                           <select
//                             {...register('categoryId', { 
//                               required: 'Category is required'
//                             })}
//                             value={selectedCategoryId || watch('categoryId') || ''}
//                             onChange={(e) => {
//                               setSelectedCategoryId(e.target.value);
//                               setValue('categoryId', e.target.value, { shouldValidate: true });
//                             }}
//                             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition appearance-none"
//                           >
//                             <option value="">Select a category</option>
//                             {categories
//                               .filter(cat => cat.isActive)
//                               .map(cat => (
//                                 <option key={cat._id} value={cat._id}>
//                                   {cat.name} {cat.productCount ? `(${cat.productCount})` : ''}
//                                 </option>
//                               ))}
//                           </select>
//                         )}
//                         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                           <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
//                           </svg>
//                         </div>
//                       </div>
//                       {errors.categoryId && (
//                         <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
//                       )}
//                       {product?.category && selectedCategoryId && (
//                         <p className="mt-1 text-sm text-green-600">
//                           Current: {typeof product.category === 'object' ? product.category.name : product.category}
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Stock Quantity *
//                       </label>
//                       <input
//                         type="number"
//                         {...register('stock', { 
//                           required: 'Stock is required',
//                           min: { value: 0, message: 'Stock cannot be negative' },
//                           valueAsNumber: true
//                         })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                       />
//                       {errors.stock && (
//                         <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Price (PKR) *
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <DollarSign className="h-5 w-5 text-gray-400" />
//                         </div>
//                         <input
//                           type="number"
//                           step="0.01"
//                           min="0.01"
//                           {...register('price', { 
//                             required: 'Price is required',
//                             min: { value: 0.01, message: 'Price must be greater than 0' },
//                             valueAsNumber: true
//                           })}
//                           className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         />
//                       </div>
//                       {errors.price && (
//                         <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Discount Price (PKR)
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <DollarSign className="h-5 w-5 text-gray-400" />
//                         </div>
//                         <input
//                           type="number"
//                           step="0.01"
//                           min="0"
//                           {...register('discountPrice', { 
//                             min: { value: 0, message: 'Discount price must be positive' },
//                             valueAsNumber: true,
//                             validate: (value) => {
//                               if (value && value >= price) {
//                                 return 'Discount price must be less than regular price'
//                               }
//                               return true
//                             }
//                           })}
//                           className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         />
//                       </div>
//                       {errors.discountPrice && (
//                         <p className="mt-1 text-sm text-red-600">{errors.discountPrice.message}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <BookOpen className="h-5 w-5 mr-2" />
//                   Description
//                 </h2>
                
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Short Description *
//                     </label>
//                     <textarea
//                       {...register('shortDescription', { 
//                         required: 'Short description is required',
//                         maxLength: { value: 500, message: 'Short description must be less than 500 characters' }
//                       })}
//                       rows={3}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                       placeholder="Brief product description (shown in listings)"
//                     />
//                     {errors.shortDescription && (
//                       <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Full Description
//                     </label>
//                     <textarea
//                       {...register('description', {
//                         maxLength: { value: 5000, message: 'Description must be less than 5000 characters' }
//                       })}
//                       rows={6}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                       placeholder="Detailed product description..."
//                     />
//                     {errors.description && (
//                       <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Specifications */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                     <BarChart className="h-5 w-5 mr-2" />
//                     Specifications
//                   </h2>
//                   <button
//                     type="button"
//                     onClick={addSpecification}
//                     className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//                   >
//                     <Plus className="h-4 w-4 mr-1" />
//                     Add Specification
//                   </button>
//                 </div>
                
//                 <div className="space-y-3">
//                   {specifications.map((spec, index) => (
//                     <div key={index} className="flex items-center gap-3">
//                       <input
//                         type="text"
//                         value={spec.key}
//                         onChange={(e) => updateSpecification(index, 'key', e.target.value)}
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         placeholder="Specification name (e.g., Color, Weight)"
//                       />
//                       <input
//                         type="text"
//                         value={spec.value}
//                         onChange={(e) => updateSpecification(index, 'value', e.target.value)}
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         placeholder="Value (e.g., Black, 1.5kg)"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeSpecification(index)}
//                         disabled={specifications.length === 1}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
//                         title="Remove specification"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Features */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <h2 className="text-lg font-semibold text-gray-900 flex items-center">
//                     <Award className="h-5 w-5 mr-2" />
//                     Features
//                   </h2>
//                   <button
//                     type="button"
//                     onClick={addFeature}
//                     className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//                   >
//                     <Plus className="h-4 w-4 mr-1" />
//                     Add Feature
//                   </button>
//                 </div>
                
//                 <div className="space-y-3">
//                   {features.map((feature, index) => (
//                     <div key={index} className="flex items-center gap-3">
//                       <input
//                         type="text"
//                         value={feature}
//                         onChange={(e) => updateFeature(index, e.target.value)}
//                         className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                         placeholder="Product feature (e.g., Water resistant, Wireless)"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeFeature(index)}
//                         disabled={features.length === 1}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
//                         title="Remove feature"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Right Column - Images & Settings */}
//             <div className="space-y-6">
//               {/* Images */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
                
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     {allImagePreviews.map((image, index) => (
//                       <div key={index} className="relative group">
//                         <img
//                           src={image}
//                           alt={`Product ${index + 1}`}
//                           className="w-full h-32 object-cover rounded-lg"
//                         />
//                         <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
//                           <button
//                             type="button"
//                             onClick={() => {
//                               if (index < existingImages.length) {
//                                 handleRemoveExistingImage(index)
//                               } else {
//                                 handleRemoveNewImage(index - existingImages.length)
//                               }
//                             }}
//                             className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition transform scale-0 group-hover:scale-100"
//                             title="Remove image"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
                    
//                     <label className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition">
//                       <Upload className="h-8 w-8 text-gray-400 mb-2" />
//                       <span className="text-sm text-gray-600">Upload Image</span>
//                       <span className="text-xs text-gray-500 mt-1">(Max 5MB)</span>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         multiple
//                         onChange={handleImageUpload}
//                         className="hidden"
//                       />
//                     </label>
//                   </div>
                  
//                   <div className="text-sm">
//                     <p className="text-gray-500">
//                       First image will be the main display image.
//                     </p>
//                     {imagesToDelete.length > 0 && (
//                       <p className="text-orange-600 mt-1">
//                         {imagesToDelete.length} image(s) marked for deletion
//                       </p>
//                     )}
//                     {newImages.length > 0 && (
//                       <p className="text-green-600 mt-1">
//                         {newImages.length} new image(s) to upload
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Tags */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                   <Tag className="h-5 w-5 mr-2" />
//                   Tags
//                 </h2>
                
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Product Tags
//                   </label>
//                   <input
//                     type="text"
//                     {...register('tags', {
//                       setValueAs: (value) => {
//                         if (!value) return [];
                        
//                         if (typeof value === 'string') {
//                           return value.split(',').map(tag => tag.trim()).filter(Boolean);
//                         } else if (Array.isArray(value)) {
//                           return value;
//                         } else {
//                           return [String(value).trim()];
//                         }
//                       }
//                     })}
//                     defaultValue={product.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : ''}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
//                     placeholder="tag1, tag2, tag3"
//                   />
//                   <p className="mt-1 text-sm text-gray-500">
//                     Separate tags with commas
//                   </p>
//                 </div>
//               </div>

//               {/* Settings */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
                
//                 <div className="space-y-4">
//                   <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
//                     <input
//                       type="checkbox"
//                       {...register('isFeatured')}
//                       className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     />
//                     <div className="ml-3">
//                       <span className="text-gray-700 font-medium">Feature this product</span>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Show this product in featured sections
//                       </p>
//                     </div>
//                   </label>
                  
//                   <label className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
//                     <input
//                       type="checkbox"
//                       {...register('isActive')}
//                       className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     />
//                     <div className="ml-3">
//                       <span className="text-gray-700 font-medium">Product is active</span>
//                       <p className="text-sm text-gray-500 mt-1">
//                         Product will be visible to customers
//                       </p>
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6">
//                 <div className="space-y-3">
//                   {isSubmitting ? (
//                     <div className="flex items-center justify-center py-3">
//                       <Loader size="md" />
//                       <span className="ml-3 text-gray-600">Updating product...</span>
//                     </div>
//                   ) : (
//                     <>
//                       <button
//                         type="submit"
//                         disabled={isSubmitting}
//                         className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center font-medium disabled:opacity-70 disabled:cursor-not-allowed"
//                       >
//                         <Save className="h-5 w-5 mr-2" />
//                         Update Product
//                       </button>
//                       <button
//                         type="button"
//                         onClick={handleCancel}
//                         className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
//                       >
//                         Cancel
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default AdminEditProduct


//fix the proper deletion 

// Frontend-blackcart/src/pages/admin/AdminEditProduct.tsx
import React, { useState, useEffect } from 'react'
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

interface ProductImage {
  url: string
  public_id?: string
  alt?: string
  _id?: string
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
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([])
  const [imagesToDeleteIds, setImagesToDeleteIds] = useState<string[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<ProductFormData>()

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Reset deletion states when loading new product
        setImagesToDelete([]);
        setImagesToDeleteIds([]);
        setNewImages([]);
        setImagePreviews([]);
        
        // Fetch categories first
        console.log('📡 Fetching categories...');
        const categoriesResponse = await adminService.getCategories();
        
        if (categoriesResponse.success) {
          console.log(`✅ Loaded ${categoriesResponse.data?.categories?.length || 0} categories`);
          setCategories(categoriesResponse.data?.categories || []);
        } else {
          toast.error('Failed to load categories');
        }
        
        // Then fetch product data
        if (id) {
          console.log('📦 Fetching product data...');
          const productResponse = await adminService.getAdminProductById(id);
          
          if (productResponse.success && productResponse.data) {
            const productData = productResponse.data.product || productResponse.data;
            setProduct(productData);
            
            // Handle image structure - store full image objects with IDs
            const images = productData.images || [];
            const processedImages: ProductImage[] = images.map((img: any, idx: number) => {
              if (typeof img === 'string') {
                return { url: img, alt: 'Product image', _id: `img_${idx}_${Date.now()}` };
              }
              return {
                url: img.url || img.path || '',
                public_id: img.public_id || img.publicId,
                alt: img.alt || 'Product image',
                _id: img._id || img.public_id || `img_${idx}_${Date.now()}`
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
              } else if (typeof productData.category === 'string' && productData.category !== '') {
                categoryId = productData.category;
              }
            }
            
            if (categoryId && categoriesResponse.success && categoriesResponse.data?.categories) {
              const categoryExists = categoriesResponse.data.categories.some(
                (cat: Category) => cat._id === categoryId
              );
              
              if (!categoryExists) {
                console.warn(`⚠️ Category ID ${categoryId} not found`);
                categoryId = '';
              }
            }
            
            setSelectedCategoryId(categoryId);
            
            // Set form values
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
              specifications: productData.specifications || [{ key: '', value: '' }],
              features: productData.features || ['']
            };
            
            reset(formValues);
            
            if (productData.specifications && productData.specifications.length > 0) {
              setSpecifications(productData.specifications);
            } else {
              setSpecifications([{ key: '', value: '' }]);
            }
            
            if (productData.features && productData.features.length > 0) {
              setFeatures(productData.features);
            } else {
              setFeatures(['']);
            }
            
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
    
    setNewImages(prev => [...prev, ...validFiles])
    
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveNewImage = (index: number) => {
    const newImagesList = newImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setNewImages(newImagesList)
    setImagePreviews(newPreviews)
    toast.success('Image removed from upload list')
  }

  const handleRemoveExistingImage = (index: number) => {
    const imageToRemove = existingImages[index]
    console.log('🗑️ Marking image for deletion:', imageToRemove)
    
    // Store the image ID and URL for deletion
    if (imageToRemove._id) {
      setImagesToDeleteIds(prev => [...prev, imageToRemove._id!])
    }
    if (imageToRemove.url) {
      setImagesToDelete(prev => [...prev, imageToRemove.url])
    }
    
    // Remove from UI immediately
    setExistingImages(prev => prev.filter((_, i) => i !== index))
    toast.success(`Image will be deleted when you save the product`)
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }])
  }

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const newSpecs = specifications.filter((_, i) => i !== index)
      setSpecifications(newSpecs)
      setValue('specifications', newSpecs)
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
  }

  const removeFeature = (index: number) => {
    if (features.length > 1) {
      const newFeatures = features.filter((_, i) => i !== index)
      setFeatures(newFeatures)
      setValue('features', newFeatures, { shouldValidate: true })
    }
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features]
    newFeatures[index] = value
    setFeatures(newFeatures)
    setValue('features', newFeatures, { shouldValidate: true })
  }

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);
      
      // Validate category
      if (!data.categoryId) {
        toast.error('Please select a valid category');
        setIsSubmitting(false);
        return;
      }
      
      // Prepare form data
      const formData = new FormData();
      
      // Handle tags
      let tagsArray = [];
      if (data.tags) {
        if (Array.isArray(data.tags)) {
          tagsArray = data.tags;
        } else if (typeof data.tags === 'string') {
          tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(Boolean);
        }
      }
      
      // Basic fields
      const fields = [
        'name', 'description', 'shortDescription', 'price',
        'categoryId', 'brand', 'sku', 'stock', 'isFeatured', 'isActive'
      ];
      
      fields.forEach(field => {
        const value = data[field as keyof ProductFormData];
        if (value !== undefined && value !== null) {
          formData.append(field, value.toString());
        }
      });
      
      // Handle discountPrice
      if (data.discountPrice && data.discountPrice > 0) {
        formData.append('discountPrice', data.discountPrice.toString());
      }
      
      // Add tags
      formData.append('tags', JSON.stringify(tagsArray));
      
      // Add specifications
      const validSpecs = specifications.filter(spec => spec.key.trim() && spec.value.trim());
      formData.append('specifications', JSON.stringify(validSpecs));
      
      // Add features
      const validFeatures = features.filter(feature => feature.trim());
      formData.append('features', JSON.stringify(validFeatures));
      
      // IMPORTANT: Add images to delete
      if (imagesToDelete.length > 0 || imagesToDeleteIds.length > 0) {
        const deletionData = {
          urls: imagesToDelete,
          ids: imagesToDeleteIds
        };
        formData.append('imagesToDelete', JSON.stringify(deletionData));
        console.log('🗑️ Sending deletion data:', deletionData);
      } else {
        console.log('✅ No images to delete');
      }
      
      // Add new images
      newImages.forEach((image) => {
        formData.append('images', image);
        console.log('📤 Adding new image:', image.name);
      });
      
      // Add existing images that remain
      const remainingImages = existingImages.map(img => ({
        url: img.url,
        _id: img._id
      }));
      
      if (remainingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(remainingImages));
        console.log('📤 Remaining images:', remainingImages.length);
      }
      
      console.log('📤 Submitting update with:', {
        imagesToDeleteCount: imagesToDelete.length,
        imagesToDeleteIdsCount: imagesToDeleteIds.length,
        newImagesCount: newImages.length,
        remainingImagesCount: remainingImages.length
      });
      
      // Update product
      const response = await adminService.updateProduct(id!, formData);
      
      console.log('📥 Update response:', response);
      
      if (response.success) {
        toast.success('✅ Product updated successfully!');
        // Clear all states
        setImagesToDelete([]);
        setImagesToDeleteIds([]);
        setNewImages([]);
        setImagePreviews([]);
        navigate('/admin/products');
      } else {
        toast.error(response.message || 'Failed to update product');
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
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/products')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <X className="h-6 w-6 text-red-500 mr-3" />
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

  const allImagePreviews = [
    ...existingImages.map(img => img.url),
    ...imagePreviews
  ]

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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-2">Update product details</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              ID: {product._id || id}
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
                        {loadingCategories || isLoading ? (
                          <div className="flex items-center px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                            <Loader size="sm" />
                            <span className="ml-2 text-gray-500">Loading categories...</span>
                          </div>
                        ) : (
                          <select
                            {...register('categoryId', { 
                              required: 'Category is required'
                            })}
                            value={selectedCategoryId || watch('categoryId') || ''}
                            onChange={(e) => {
                              setSelectedCategoryId(e.target.value);
                              setValue('categoryId', e.target.value, { shouldValidate: true });
                            }}
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
                    {allImagePreviews.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (index < existingImages.length) {
                              handleRemoveExistingImage(index)
                            } else {
                              handleRemoveNewImage(index - existingImages.length)
                            }
                          }}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg md:opacity-0 md:group-hover:opacity-100 active:opacity-100 focus:opacity-100"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 right-2 md:hidden">
                          <span className="text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                            Tap to delete
                          </span>
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
                    {(imagesToDelete.length > 0 || imagesToDeleteIds.length > 0) && (
                      <p className="text-orange-600 mt-1 font-medium">
                        ⚠️ {imagesToDelete.length + imagesToDeleteIds.length} image(s) will be permanently deleted when you click "Update Product"
                      </p>
                    )}
                    {newImages.length > 0 && (
                      <p className="text-green-600 mt-1">
                        ✓ {newImages.length} new image(s) will be uploaded when you save
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
                      setValueAs: (value) => {
                        if (!value) return [];
                        
                        if (typeof value === 'string') {
                          return value.split(',').map(tag => tag.trim()).filter(Boolean);
                        } else if (Array.isArray(value)) {
                          return value;
                        } else {
                          return [String(value).trim()];
                        }
                      }
                    })}
                    defaultValue={product.tags ? (Array.isArray(product.tags) ? product.tags.join(', ') : product.tags) : ''}
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
              <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                        disabled={isSubmitting}
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

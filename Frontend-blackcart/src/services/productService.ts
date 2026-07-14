
// // src/services/productService.ts
// import api from './api'

// export const productService = {
//   // ✅ FIXED: getProducts method
//   getProducts: async (params?: any) => {
//     try {
//       console.log('🚀 [PRODUCT SERVICE] Fetching products with params:', params)
      
//       // Clean params
//       const cleanParams: any = {}
      
//       if (params) {
//         Object.keys(params).forEach(key => {
//           const value = params[key]
//           if (value !== undefined && value !== null && value !== '') {
//             if (['category', 'brand'].includes(key) && value === 'all') {
//               return
//             }
//             cleanParams[key] = value
//           }
//         })
//       }
      
//       console.log('📤 Clean params sent:', cleanParams)
      
//       const response = await api.get('/products', { 
//         params: cleanParams,
//         timeout: 30000
//       })
      
//       console.log('✅ API Response:', {
//         success: response.data?.success,
//         productsCount: response.data?.data?.products?.length || 0,
//         total: response.data?.data?.pagination?.total || 0
//       })
      
//       const products = response.data?.data?.products || []
//       const pagination = response.data?.data?.pagination || {
//         page: params?.page || 1,
//         limit: params?.limit || 12,
//         total: products.length,
//         pages: Math.ceil(products.length / (params?.limit || 12))
//       }
      
//       console.log(`📊 Returning ${products.length} products`)
      
//       return {
//         success: true,
//         data: {
//           products,
//           pagination
//         },
//         message: products.length > 0 ? 'Products fetched successfully' : 'No products found'
//       }
      
//     } catch (error: any) {
//       console.error('❌ [PRODUCT SERVICE] Error:', {
//         message: error.message,
//         status: error.response?.status,
//         data: error.response?.data
//       })
      
//       return {
//         success: false,
//         data: {
//           products: [],
//           pagination: {
//             page: params?.page || 1,
//             limit: params?.limit || 12,
//             total: 0,
//             pages: 0
//           }
//         },
//         message: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch products'
//       }
//     }
//   },

//   // ✅ SOLID FIX: getProduct method that works with your backend
//   getProduct: async (identifier: string) => {
//     try {
//       console.log('🔍 [PRODUCT SERVICE] Fetching product:', identifier)
      
//       // Check if identifier is empty
//       if (!identifier || identifier.trim() === '') {
//         console.error('❌ Empty identifier provided')
//         return {
//           success: false,
//           data: { product: null },
//           message: 'Invalid product identifier'
//         }
//       }
      
//       // TRY MULTIPLE APPROACHES:
      
//       // 1. First try the standard endpoint
//       try {
//         console.log('🔄 Attempt 1: Standard endpoint /products/:identifier')
//         const response = await api.get(`/products/${identifier}`, {
//           timeout: 10000,
//           headers: {
//             'Accept': 'application/json'
//           }
//         })
        
//         console.log('✅ Standard endpoint success:', {
//           status: response.status,
//           hasProduct: !!response.data?.data?.product,
//           productId: response.data?.data?.product?._id
//         })
        
//         if (response.data?.data?.product || response.data?.product) {
//           return {
//             success: true,
//             data: {
//               product: response.data?.data?.product || response.data?.product
//             },
//             message: 'Product fetched successfully'
//           }
//         }
//       } catch (error1: any) {
//         console.log('⚠️ Standard endpoint failed:', {
//           status: error1.response?.status,
//           message: error1.message
//         })
//       }
      
//       // 2. Try with query parameter
//       try {
//         console.log('🔄 Attempt 2: Query parameter /products?id=:identifier')
//         const response = await api.get('/products', {
//           params: { id: identifier },
//           timeout: 10000
//         })
        
//         console.log('✅ Query parameter response:', {
//           productsCount: response.data?.data?.products?.length || 0
//         })
        
//         const products = response.data?.data?.products || response.data?.products || []
//         if (products.length > 0) {
//           // Find exact match
//           const product = products.find((p: any) => p._id === identifier)
//           if (product) {
//             return {
//               success: true,
//               data: { product },
//               message: 'Product fetched successfully'
//             }
//           }
//         }
//       } catch (error2: any) {
//         console.log('⚠️ Query parameter failed:', error2.message)
//       }
      
//       // 3. Try getting all products and filtering locally
//       try {
//         console.log('🔄 Attempt 3: Get all products and filter')
//         const allProductsResponse = await productService.getProducts({ limit: 100 })
        
//         if (allProductsResponse.success && allProductsResponse.data?.products) {
//           const allProducts = allProductsResponse.data.products
          
//           // Try to find by ID
//           let product = allProducts.find((p: any) => p._id === identifier)
          
//           // If not found by ID, try by slug
//           if (!product) {
//             product = allProducts.find((p: any) => p.slug === identifier)
//           }
          
//           // If not found, try case-insensitive search in name
//           if (!product) {
//             const searchTerm = identifier.toLowerCase()
//             product = allProducts.find((p: any) => 
//               p.name?.toLowerCase().includes(searchTerm) ||
//               p._id?.toLowerCase() === searchTerm
//             )
//           }
          
//           if (product) {
//             console.log('✅ Found product in products list:', product._id)
//             return {
//               success: true,
//               data: { product },
//               message: 'Product fetched successfully'
//             }
//           }
//         }
//       } catch (error3: any) {
//         console.log('⚠️ Get all products failed:', error3.message)
//       }
      
//       // 4. Try alternative endpoints
//       const alternativeEndpoints = [
//         `/products/id/${identifier}`,
//         `/products/find/${identifier}`,
//         `/products/get/${identifier}`,
//         `/products/product/${identifier}`
//       ]
      
//       for (const endpoint of alternativeEndpoints) {
//         try {
//           console.log(`🔄 Attempt 4: Trying endpoint ${endpoint}`)
//           const response = await api.get(endpoint, { timeout: 5000 })
          
//           if (response.data?.success || response.data?.product) {
//             const product = response.data?.data?.product || response.data?.product
//             if (product) {
//               console.log(`✅ Success with endpoint ${endpoint}`)
//               return {
//                 success: true,
//                 data: { product },
//                 message: 'Product fetched successfully'
//               }
//             }
//           }
//         } catch (endpointError) {
//           console.log(`⚠️ Endpoint ${endpoint} failed`)
//           continue
//         }
//       }
      
//       // All attempts failed
//       console.error('❌ All attempts failed for product:', identifier)
//       return {
//         success: false,
//         data: { product: null },
//         message: 'Product not found'
//       }
      
//     } catch (error: any) {
//       console.error('❌ Error in getProduct:', {
//         identifier,
//         message: error.message,
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         data: error.response?.data
//       })
      
//       return {
//         success: false,
//         data: { product: null },
//         message: error.response?.data?.message || error.message || 'Failed to fetch product'
//       }
//     }
//   },

//   // ✅ NEW: Get multiple products by IDs
//   getProductsByIds: async (productIds: string[]) => {
//     try {
//       console.log('🔍 [PRODUCT SERVICE] Fetching multiple products:', productIds)
      
//       if (!productIds || productIds.length === 0) {
//         return {
//           success: true,
//           data: { products: [] },
//           message: 'No product IDs provided'
//         }
//       }
      
//       // Filter out invalid IDs
//       const validIds = productIds.filter(id => id && id.trim() !== '')
      
//       if (validIds.length === 0) {
//         return {
//           success: true,
//           data: { products: [] },
//           message: 'No valid product IDs'
//         }
//       }
      
//       // Try to get all products and filter
//       const response = await productService.getProducts({ limit: 1000 })
      
//       if (response.success && response.data?.products) {
//         const allProducts = response.data.products
//         const foundProducts = allProducts.filter((product: any) => 
//           validIds.includes(product._id)
//         )
        
//         console.log(`✅ Found ${foundProducts.length} out of ${validIds.length} products`)
        
//         return {
//           success: true,
//           data: { products: foundProducts },
//           message: `Found ${foundProducts.length} products`
//         }
//       }
      
//       return {
//         success: false,
//         data: { products: [] },
//         message: 'Failed to fetch products'
//       }
      
//     } catch (error: any) {
//       console.error('❌ Error fetching multiple products:', error)
//       return {
//         success: false,
//         data: { products: [] },
//         message: error.message || 'Failed to fetch products'
//       }
//     }
//   },

//   getFeaturedProducts: async (limit?: number) => {
//     console.log('🎯 Getting featured products')
//     const result = await productService.getProducts({ 
//       featured: true, 
//       limit: limit || 8 
//     })
//     console.log(`🎯 Featured products found: ${result.data.products.length}`)
//     return result
//   },

//   getNewArrivals: async (limit?: number) => {
//     console.log('🆕 Getting new arrivals')
//     const result = await productService.getProducts({ 
//       newArrivals: true, 
//       limit: limit || 8 
//     })
//     console.log(`🆕 New arrivals found: ${result.data.products.length}`)
//     return result
//   },

//   getTrendingProducts: async (limit?: number) => {
//     console.log('📈 Getting trending products')
//     const result = await productService.getProducts({ 
//       trending: true, 
//       limit: limit || 8 
//     })
//     console.log(`📈 Trending products found: ${result.data.products.length}`)
//     return result
//   },
  
//   searchProducts: async (keyword: string, params?: any) => {
//     return await productService.getProducts({ 
//       search: keyword,
//       ...params 
//     })
//   },

//   getAllCategories: async () => {
//     try {
//       const response = await api.get('/products/categories/all')
//       const categories = response.data?.data?.categories || response.data?.categories || []
      
//       return {
//         success: true,
//         data: { categories: Array.isArray(categories) ? categories : [] },
//         message: 'Categories fetched successfully'
//       }
//     } catch (error: any) {
//       console.error('Error fetching categories:', error)
//       return {
//         success: false,
//         data: { categories: [] },
//         message: error.message || 'Failed to fetch categories'
//       }
//     }
//   },

//   getFilterOptions: async () => {
//     try {
//       const response = await api.get('/products/filters/options')
//       const responseData = response.data
      
//       return {
//         success: true,
//         data: {
//           categories: responseData?.data?.categories || responseData?.categories || [],
//           brands: responseData?.data?.brands || responseData?.brands || [],
//           priceRange: responseData?.data?.priceRange || responseData?.priceRange || { minPrice: 0, maxPrice: 100000 }
//         },
//         message: 'Filter options fetched successfully'
//       }
//     } catch (error: any) {
//       console.error('Error fetching filter options:', error)
      
//       return {
//         success: false,
//         data: {
//           categories: [],
//           brands: [],
//           priceRange: { minPrice: 0, maxPrice: 100000 }
//         },
//         message: error.response?.data?.message || error.message || 'Failed to fetch filter options'
//       }
//     }
//   },

//   // ✅ FIXED: Get first image URL for a product
//   getFirstImageUrl: (product: any): string => {
//     if (!product) return '/images/placeholder.png'
    
//     if (productService.getImageUrl) {
//       if (product.images && Array.isArray(product.images) && product.images.length > 0) {
//         return productService.getImageUrl(product.images[0])
//       }
      
//       if (product.image) {
//         return productService.getImageUrl(product.image)
//       }
      
//       if (product.thumbnail) {
//         return productService.getImageUrl(product.thumbnail)
//       }
//     }
    
//     return '/images/placeholder.png'
//   },

//   // ✅ FIXED: CORRECT IMAGE URL CONSTRUCTION
//   getImageUrl: (imageData: any): string => {
//     const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
//     const placeholder = '/images/placeholder.png'
    
//     if (!imageData) return placeholder
    
//     if (typeof imageData === 'string') {
//       const url = imageData.trim()
      
//       if (url.startsWith('http://') || url.startsWith('https://')) {
//         return url
//       }
      
//       if (url.startsWith('/')) {
//         return `${baseUrl}${url}`
//       }
      
//       return `${baseUrl}/uploads/${url}`
//     }
    
//     if (imageData && typeof imageData === 'object') {
//       if (imageData.url && typeof imageData.url === 'string') {
//         return productService.getImageUrl(imageData.url)
//       }
      
//       const possibleProps = ['public_id', 'path', 'src', 'secure_url']
//       for (const prop of possibleProps) {
//         if (imageData[prop] && typeof imageData[prop] === 'string') {
//           return productService.getImageUrl(imageData[prop])
//         }
//       }
      
//       return placeholder
//     }
    
//     if (Array.isArray(imageData)) {
//       if (imageData.length > 0) {
//         return productService.getImageUrl(imageData[0])
//       }
//       return placeholder
//     }
    
//     return placeholder
//   },

//   formatPrice: (price: number, currency: string = 'PKR'): string => {
//     return `${currency} ${price.toLocaleString('en-PK', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     })}`
//   },

//   getStockStatus: (stock: number) => {
//     if (stock === 0) {
//       return {
//         text: 'Out of Stock',
//         color: 'text-red-600',
//         bgColor: 'bg-red-100'
//       }
//     } else if (stock < 10) {
//       return {
//         text: 'Low Stock',
//         color: 'text-yellow-600',
//         bgColor: 'bg-yellow-100'
//       }
//     } else {
//       return {
//         text: 'In Stock',
//         color: 'text-green-600',
//         bgColor: 'bg-green-100'
//       }
//     }
//   },

//   calculateDiscountPercentage: (price: number, discountPrice?: number): number => {
//     if (!discountPrice || discountPrice >= price) return 0
//     return Math.round(((price - discountPrice) / price) * 100)
//   },

//   getProductsByCategory: async (category: string, params?: any) => {
//     return await productService.getProducts({ 
//       category,
//       ...params 
//     })
//   },

//   // ✅ ADDED: Get category info from product
//   getCategoryInfo: (product: any) => {
//     if (!product) return { name: 'Uncategorized', slug: '' };
    
//     console.log('🔍 Getting category info from product:', {
//       hasCategory: !!product.category,
//       categoryType: typeof product.category,
//       hasCategoryId: !!product.categoryId,
//       categoryIdType: typeof product.categoryId,
//       categoryIdIsObject: product.categoryId && typeof product.categoryId === 'object'
//     });
    
//     // Handle both old and new structures
//     if (product.category && typeof product.category === 'string') {
//       return { 
//         name: product.category, 
//         slug: product.category.toLowerCase().replace(/\s+/g, '-') 
//       };
//     }
    
//     if (product.categoryId && typeof product.categoryId === 'object') {
//       const categoryName = product.categoryId.name || 'Uncategorized';
//       const categorySlug = product.categoryId.slug || categoryName.toLowerCase().replace(/\s+/g, '-');
      
//       return {
//         name: categoryName,
//         slug: categorySlug,
//         image: product.categoryId.image,
//         id: product.categoryId._id
//       };
//     }
    
//     // If categoryId is just a string (ID), we can't get the name without fetching
//     if (product.categoryId && typeof product.categoryId === 'string') {
//       return { 
//         name: 'Category ID: ' + product.categoryId.substring(0, 8) + '...', 
//         slug: '',
//         id: product.categoryId
//       };
//     }
    
//     return { name: 'Uncategorized', slug: '' };
//   }
// }

//update for advance search

/* eslint-disable @typescript-eslint/no-explicit-any */
// The legacy product API supports several historical payload shapes. New methods are fully typed.
// src/services/productService.ts
import { isAxiosError } from 'axios'
import api from './api'
import type { Category, StorefrontProduct } from '../types'

export interface HomeProductSection {
  title: string
  products: StorefrontProduct[]
}

export interface HomeCategorySection {
  category: Pick<Category, '_id' | 'name' | 'slug'>
  products: StorefrontProduct[]
}

export interface HomeSectionsData {
  justLaunched: HomeProductSection
  bestSellers: HomeProductSection
  bestOffers: HomeProductSection
  recommended: HomeProductSection
  categorySections: HomeCategorySection[]
  categories: Pick<Category, '_id' | 'name' | 'slug'>[]
}

export interface HomeSectionsResponse {
  success: boolean
  data: HomeSectionsData
  message?: string
}

export interface HomeSectionsParams {
  recentCategories?: string[]
  limit?: number
}

export const productService = {
  getHomeSections: async ({ recentCategories = [], limit = 12 }: HomeSectionsParams = {}): Promise<HomeSectionsResponse> => {
    try {
      const response = await api.get<HomeSectionsResponse>('/products/home-sections', {
        params: {
          recentCategories: recentCategories.slice(0, 3).join(','),
          limit: Math.min(Math.max(limit, 1), 16),
        },
        timeout: 20000,
      })
      return response.data
    } catch (error: unknown) {
      const apiMessage = isAxiosError<{ message?: string; error?: string }>(error)
        ? error.response?.data?.message || error.response?.data?.error
        : undefined
      throw new Error(apiMessage || (error instanceof Error ? error.message : 'Failed to load homepage products'))
    }
  },

  getProducts: async (params?: any) => {
    try {
      console.log('🚀 [PRODUCT SERVICE] Fetching products with params:', params)
      
      const cleanParams: any = {}
      
      if (params) {
        Object.keys(params).forEach(key => {
          const value = params[key]
          if (value !== undefined && value !== null && value !== '') {
            if (['category', 'brand'].includes(key) && value === 'all') {
              return
            }
            cleanParams[key] = value
          }
        })
      }
      
      console.log('📤 Clean params sent:', cleanParams)
      
      const response = await api.get('/products', { 
        params: cleanParams,
        timeout: 30000
      })
      
      console.log('✅ API Response:', {
        success: response.data?.success,
        productsCount: response.data?.data?.products?.length || 0,
        total: response.data?.data?.pagination?.total || 0
      })
      
      const products = response.data?.data?.products || []
      const pagination = response.data?.data?.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 12,
        total: products.length,
        pages: Math.ceil(products.length / (params?.limit || 12))
      }
      
      console.log(`📊 Returning ${products.length} products`)
      
      return {
        success: true,
        data: { products, pagination },
        message: products.length > 0 ? 'Products fetched successfully' : 'No products found'
      }
      
    } catch (error: any) {
      console.error('❌ [PRODUCT SERVICE] Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      return {
        success: false,
        data: {
          products: [],
          pagination: {
            page: params?.page || 1,
            limit: params?.limit || 12,
            total: 0,
            pages: 0
          }
        },
        message: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch products'
      }
    }
  },

  getProduct: async (identifier: string) => {
    try {
      console.log('🔍 [PRODUCT SERVICE] Fetching product:', identifier)
      
      if (!identifier || identifier.trim() === '') {
        console.error('❌ Empty identifier provided')
        return {
          success: false,
          data: { product: null },
          message: 'Invalid product identifier'
        }
      }
      
      try {
        console.log('🔄 Attempt 1: Standard endpoint /products/:identifier')
        const response = await api.get(`/products/${identifier}`, {
          timeout: 10000,
          headers: { 'Accept': 'application/json' }
        })
        
        console.log('✅ Standard endpoint success:', {
          status: response.status,
          hasProduct: !!response.data?.data?.product,
          productId: response.data?.data?.product?._id
        })
        
        if (response.data?.data?.product || response.data?.product) {
          return {
            success: true,
            data: { product: response.data?.data?.product || response.data?.product },
            message: 'Product fetched successfully'
          }
        }
      } catch (error1: any) {
        console.log('⚠️ Standard endpoint failed:', {
          status: error1.response?.status,
          message: error1.message
        })
      }
      
      try {
        console.log('🔄 Attempt 2: Query parameter /products?id=:identifier')
        const response = await api.get('/products', {
          params: { id: identifier },
          timeout: 10000
        })
        
        const products = response.data?.data?.products || response.data?.products || []
        if (products.length > 0) {
          const product = products.find((p: any) => p._id === identifier)
          if (product) {
            return { success: true, data: { product }, message: 'Product fetched successfully' }
          }
        }
      } catch (error2: any) {
        console.log('⚠️ Query parameter failed:', error2.message)
      }
      
      try {
        console.log('🔄 Attempt 3: Get all products and filter')
        const allProductsResponse = await productService.getProducts({ limit: 100 })
        
        if (allProductsResponse.success && allProductsResponse.data?.products) {
          const allProducts = allProductsResponse.data.products
          let product = allProducts.find((p: any) => p._id === identifier)
          if (!product) product = allProducts.find((p: any) => p.slug === identifier)
          if (!product) {
            const searchTerm = identifier.toLowerCase()
            product = allProducts.find((p: any) => 
              p.name?.toLowerCase().includes(searchTerm) ||
              p._id?.toLowerCase() === searchTerm
            )
          }
          if (product) {
            console.log('✅ Found product in products list:', product._id)
            return { success: true, data: { product }, message: 'Product fetched successfully' }
          }
        }
      } catch (error3: any) {
        console.log('⚠️ Get all products failed:', error3.message)
      }
      
      const alternativeEndpoints = [
        `/products/id/${identifier}`,
        `/products/find/${identifier}`,
        `/products/get/${identifier}`,
        `/products/product/${identifier}`
      ]
      
      for (const endpoint of alternativeEndpoints) {
        try {
          console.log(`🔄 Attempt 4: Trying endpoint ${endpoint}`)
          const response = await api.get(endpoint, { timeout: 5000 })
          if (response.data?.success || response.data?.product) {
            const product = response.data?.data?.product || response.data?.product
            if (product) {
              console.log(`✅ Success with endpoint ${endpoint}`)
              return { success: true, data: { product }, message: 'Product fetched successfully' }
            }
          }
        } catch {
          console.log(`⚠️ Endpoint ${endpoint} failed`)
          continue
        }
      }
      
      console.error('❌ All attempts failed for product:', identifier)
      return { success: false, data: { product: null }, message: 'Product not found' }
      
    } catch (error: any) {
      console.error('❌ Error in getProduct:', {
        identifier,
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      return {
        success: false,
        data: { product: null },
        message: error.response?.data?.message || error.message || 'Failed to fetch product'
      }
    }
  },

  getProductsByIds: async (productIds: string[]) => {
    try {
      console.log('🔍 [PRODUCT SERVICE] Fetching multiple products:', productIds)
      
      if (!productIds || productIds.length === 0) {
        return { success: true, data: { products: [] }, message: 'No product IDs provided' }
      }
      
      const validIds = productIds.filter(id => id && id.trim() !== '')
      
      if (validIds.length === 0) {
        return { success: true, data: { products: [] }, message: 'No valid product IDs' }
      }
      
      const response = await productService.getProducts({ limit: 1000 })
      
      if (response.success && response.data?.products) {
        const allProducts = response.data.products
        const foundProducts = allProducts.filter((product: any) => validIds.includes(product._id))
        console.log(`✅ Found ${foundProducts.length} out of ${validIds.length} products`)
        return {
          success: true,
          data: { products: foundProducts },
          message: `Found ${foundProducts.length} products`
        }
      }
      
      return { success: false, data: { products: [] }, message: 'Failed to fetch products' }
      
    } catch (error: any) {
      console.error('❌ Error fetching multiple products:', error)
      return { success: false, data: { products: [] }, message: error.message || 'Failed to fetch products' }
    }
  },

  getFeaturedProducts: async (limit?: number) => {
    console.log('🎯 Getting featured products')
    const result = await productService.getProducts({ featured: true, limit: limit || 8 })
    console.log(`🎯 Featured products found: ${result.data.products.length}`)
    return result
  },

  getNewArrivals: async (limit?: number) => {
    console.log('🆕 Getting new arrivals')
    const result = await productService.getProducts({ newArrivals: true, limit: limit || 8 })
    console.log(`🆕 New arrivals found: ${result.data.products.length}`)
    return result
  },

  getTrendingProducts: async (limit?: number) => {
    console.log('📈 Getting trending products')
    const result = await productService.getProducts({ trending: true, limit: limit || 8 })
    console.log(`📈 Trending products found: ${result.data.products.length}`)
    return result
  },

  // ✅ NEW — Search suggestions for the live dropdown
  getSearchSuggestions: async (keyword: string, limit: number = 6) => {
    try {
      if (!keyword || keyword.trim().length < 1) {
        return {
          success: true,
          data: { products: [], categories: [], total: 0 },
        }
      }
      const response = await api.get('/products/search/suggestions', {
        params: { q: keyword.trim(), limit },
        timeout: 8000,
      })
      return {
        success: true,
        data: response.data?.data || { products: [], categories: [], total: 0 },
      }
    } catch (error: any) {
      console.error('❌ getSearchSuggestions error:', error.message)
      return {
        success: false,
        data: { products: [], categories: [], total: 0 },
        message: error.message,
      }
    }
  },

  searchProducts: async (keyword: string, params?: any) => {
    return await productService.getProducts({ 
      search: keyword,
      ...params 
    })
  },

  getAllCategories: async () => {
    try {
      const response = await api.get('/products/categories/all')
      const categories = response.data?.data?.categories || response.data?.categories || []
      return {
        success: true,
        data: { categories: Array.isArray(categories) ? categories : [] },
        message: 'Categories fetched successfully'
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error)
      return {
        success: false,
        data: { categories: [] },
        message: error.message || 'Failed to fetch categories'
      }
    }
  },

  getFilterOptions: async () => {
    try {
      const response = await api.get('/products/filters/options')
      const responseData = response.data
      return {
        success: true,
        data: {
          categories: responseData?.data?.categories || responseData?.categories || [],
          brands: responseData?.data?.brands || responseData?.brands || [],
          priceRange: responseData?.data?.priceRange || responseData?.priceRange || { minPrice: 0, maxPrice: 100000 }
        },
        message: 'Filter options fetched successfully'
      }
    } catch (error: any) {
      console.error('Error fetching filter options:', error)
      return {
        success: false,
        data: {
          categories: [],
          brands: [],
          priceRange: { minPrice: 0, maxPrice: 100000 }
        },
        message: error.response?.data?.message || error.message || 'Failed to fetch filter options'
      }
    }
  },

  getFirstImageUrl: (product: any): string => {
    if (!product) return '/images/placeholder.png'
    if (productService.getImageUrl) {
      if (product.images && Array.isArray(product.images) && product.images.length > 0) {
        return productService.getImageUrl(product.images[0])
      }
      if (product.image) return productService.getImageUrl(product.image)
      if (product.thumbnail) return productService.getImageUrl(product.thumbnail)
    }
    return '/images/placeholder.png'
  },

  getImageUrl: (imageData: any): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    const placeholder = '/images/placeholder.png'
    
    if (!imageData) return placeholder
    
    if (typeof imageData === 'string') {
      const url = imageData.trim()
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/uploads/${url}`
    }
    
    if (imageData && typeof imageData === 'object') {
      if (imageData.url && typeof imageData.url === 'string') {
        return productService.getImageUrl(imageData.url)
      }
      const possibleProps = ['public_id', 'path', 'src', 'secure_url']
      for (const prop of possibleProps) {
        if (imageData[prop] && typeof imageData[prop] === 'string') {
          return productService.getImageUrl(imageData[prop])
        }
      }
      return placeholder
    }
    
    if (Array.isArray(imageData)) {
      if (imageData.length > 0) return productService.getImageUrl(imageData[0])
      return placeholder
    }
    
    return placeholder
  },

  formatPrice: (price: number, currency: string = 'PKR'): string => {
    return `${currency} ${price.toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  },

  getStockStatus: (stock: number) => {
    if (stock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600', bgColor: 'bg-red-100' }
    } else if (stock < 10) {
      return { text: 'Low Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    } else {
      return { text: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' }
    }
  },

  calculateDiscountPercentage: (price: number, discountPrice?: number): number => {
    if (!discountPrice || discountPrice >= price) return 0
    return Math.round(((price - discountPrice) / price) * 100)
  },

  getProductsByCategory: async (category: string, params?: any) => {
    return await productService.getProducts({ category, ...params })
  },

  getCategoryInfo: (product: any) => {
    if (!product) return { name: 'Uncategorized', slug: '' }
    
    console.log('🔍 Getting category info from product:', {
      hasCategory: !!product.category,
      categoryType: typeof product.category,
      hasCategoryId: !!product.categoryId,
      categoryIdType: typeof product.categoryId,
      categoryIdIsObject: product.categoryId && typeof product.categoryId === 'object'
    })
    
    if (product.category && typeof product.category === 'string') {
      return { 
        name: product.category, 
        slug: product.category.toLowerCase().replace(/\s+/g, '-') 
      }
    }
    
    if (product.categoryId && typeof product.categoryId === 'object') {
      const categoryName = product.categoryId.name || 'Uncategorized'
      const categorySlug = product.categoryId.slug || categoryName.toLowerCase().replace(/\s+/g, '-')
      return {
        name: categoryName,
        slug: categorySlug,
        image: product.categoryId.image,
        id: product.categoryId._id
      }
    }
    
    if (product.categoryId && typeof product.categoryId === 'string') {
      return { 
        name: 'Category ID: ' + product.categoryId.substring(0, 8) + '...', 
        slug: '',
        id: product.categoryId
      }
    }
    
    return { name: 'Uncategorized', slug: '' }
  }
}

// // src/utils/imageUtils.ts
// const API_URL = import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";
// const PLACEHOLDER_URL = "/placeholder.png";

// // Helper to extract URL from various image formats (string, object with url property, etc.)
// const extractImageUrl = (image: any): string => {
//   if (!image) return '';
  
//   // If it's already a string, return it
//   if (typeof image === 'string') return image;
  
//   // If it's an object with url property (your database format)
//   if (typeof image === 'object') {
//     // Check for common image URL properties
//     if (image.url && typeof image.url === 'string') return image.url;
//     if (image.src && typeof image.src === 'string') return image.src;
//     if (image.path && typeof image.path === 'string') return image.path;
//     if (image.filename && typeof image.filename === 'string') return image.filename;
    
//     // If it has a secure_url (Cloudinary format)
//     if (image.secure_url && typeof image.secure_url === 'string') return image.secure_url;
    
//     // If it's an array, take the first item and extract from that
//     if (Array.isArray(image) && image.length > 0) {
//       return extractImageUrl(image[0]);
//     }
    
//     // If it has a url property that's an object? try to stringify as last resort
//     console.warn('Unknown image object format:', image);
//   }
  
//   return '';
// };

// // Cache for image URLs to avoid repeated processing
// const imageUrlCache = new Map<string, string>();

// export const getImageUrl = (image: any): string => {
//   // Handle null/undefined
//   if (!image) return PLACEHOLDER_URL;
  
//   try {
//     // Create a cache key
//     const cacheKey = typeof image === 'string' ? image : JSON.stringify(image);
    
//     // Check cache first
//     if (imageUrlCache.has(cacheKey)) {
//       return imageUrlCache.get(cacheKey) || PLACEHOLDER_URL;
//     }
    
//     // Extract the URL string from whatever format we have
//     const imagePath = extractImageUrl(image);
    
//     if (!imagePath) return PLACEHOLDER_URL;
    
//     // If it's already a full URL, return as is
//     if (imagePath.startsWith("http")) {
//       imageUrlCache.set(cacheKey, imagePath);
//       return imagePath;
//     }
    
//     // Clean the path - remove any leading slashes
//     const cleanPath = imagePath.replace(/^\/+/, "");
    
//     // Extract filename for fallback
//     const filename = cleanPath.split('/').pop() || '';
    
//     // Determine if it's a logo
//     const isLogo = cleanPath.includes('logo');
    
//     // Try direct uploads path first
//     let finalUrl = '';
    
//     if (isLogo) {
//       finalUrl = `${API_URL}/uploads/logo/${filename}`;
//     } else if (cleanPath.startsWith("uploads/")) {
//       finalUrl = `${API_URL}/${cleanPath}`;
//     } else {
//       finalUrl = `${API_URL}/uploads/${cleanPath}`;
//     }
    
//     // Cache and return
//     imageUrlCache.set(cacheKey, finalUrl);
//     return finalUrl;
    
//   } catch (error) {
//     console.error('Error in getImageUrl:', error, 'for image:', image);
//     return PLACEHOLDER_URL;
//   }
// };

// // For debugging - use this temporarily to see what's being passed
// export const getImageUrlWithDebug = (image: any): string => {
//   console.group('🔍 Image URL Debug');
//   console.log('Raw image:', image);
//   console.log('Image type:', typeof image);
//   if (image && typeof image === 'object') {
//     console.log('Image keys:', Object.keys(image));
//     console.log('Image url property:', image.url);
//     console.log('Has url property?', image.url ? 'Yes' : 'No');
//   }
//   const url = getImageUrl(image);
//   console.log(`Final URL: "${url}"`);
//   console.groupEnd();
//   return url;
// };

// // Force clear cache (useful for testing)
// export const clearImageCache = (): void => {
//   imageUrlCache.clear();
//   console.log('Image cache cleared');
// };

//fixing the image showing in all devices

// src/utils/imageUtils.ts

// Get the base URL with proper protocol detection
const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

const API_URL = import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";
const PLACEHOLDER_URL = "/placeholder.png";

// Ensure URLs are absolute and use correct protocol
const ensureAbsoluteUrl = (url: string): string => {
  if (!url) return PLACEHOLDER_URL;
  
  // If it's already a full URL with protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a protocol-relative URL (starts with //)
  if (url.startsWith('//')) {
    return window.location.protocol + url;
  }
  
  // If it's a root-relative URL (starts with /)
  if (url.startsWith('/')) {
    const baseUrl = getBaseUrl();
    if (baseUrl) {
      return baseUrl + url;
    }
    // For backend paths
    if (url.startsWith('/uploads')) {
      return API_URL + url;
    }
  }
  
  // If it's a relative URL without leading slash
  return API_URL + '/' + url;
};

// Helper to extract URL from various image formats
const extractImageUrl = (image: any): string => {
  if (!image) return '';
  
  // If it's already a string, return it
  if (typeof image === 'string') return image;
  
  // If it's an object with url property
  if (typeof image === 'object') {
    // Check for common image URL properties
    if (image.url && typeof image.url === 'string') return image.url;
    if (image.src && typeof image.src === 'string') return image.src;
    if (image.path && typeof image.path === 'string') return image.path;
    if (image.filename && typeof image.filename === 'string') return image.filename;
    
    // If it has a secure_url (Cloudinary format)
    if (image.secure_url && typeof image.secure_url === 'string') return image.secure_url;
    
    // If it's an array, take the first item
    if (Array.isArray(image) && image.length > 0) {
      return extractImageUrl(image[0]);
    }
    
    console.warn('Unknown image object format:', image);
  }
  
  return '';
};

// Cache for image URLs
const imageUrlCache = new Map<string, string>();

// Preload image function for mobile
const preloadImage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      console.log(`✅ Image preloaded successfully: ${url.substring(0, 50)}...`);
      resolve(url);
    };
    img.onerror = () => {
      console.warn(`❌ Image preload failed: ${url.substring(0, 50)}...`);
      reject(url);
    };
    img.src = url;
  });
};

// Main function to get image URL
export const getImageUrl = (image: any): string => {
  // Handle null/undefined
  if (!image) return PLACEHOLDER_URL;
  
  try {
    // Create cache key
    const cacheKey = typeof image === 'string' ? image : JSON.stringify(image);
    
    // Check cache
    if (imageUrlCache.has(cacheKey)) {
      return imageUrlCache.get(cacheKey) || PLACEHOLDER_URL;
    }
    
    // Extract the URL string
    const imagePath = extractImageUrl(image);
    
    if (!imagePath) return PLACEHOLDER_URL;
    
    // If it's already a full URL with protocol, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      imageUrlCache.set(cacheKey, imagePath);
      return imagePath;
    }
    
    // Clean the path - remove any leading slashes
    const cleanPath = imagePath.replace(/^\/+/, "");
    
    // Extract filename
    const filename = cleanPath.split('/').pop() || '';
    
    // Determine if it's a logo
    const isLogo = cleanPath.includes('logo');
    
    // Build the URL
    let finalUrl = '';
    
    if (isLogo) {
      finalUrl = `${API_URL}/uploads/logo/${filename}`;
    } else if (cleanPath.startsWith("uploads/")) {
      finalUrl = `${API_URL}/${cleanPath}`;
    } else {
      finalUrl = `${API_URL}/uploads/${cleanPath}`;
    }
    
    // Ensure URL is absolute and properly formatted for mobile
    finalUrl = ensureAbsoluteUrl(finalUrl);
    
    // Cache and return
    imageUrlCache.set(cacheKey, finalUrl);
    return finalUrl;
    
  } catch (error) {
    console.error('Error in getImageUrl:', error);
    return PLACEHOLDER_URL;
  }
};

// Async version that preloads the image (essential for mobile)
export const getImageUrlAsync = async (image: any): Promise<string> => {
  const url = getImageUrl(image);
  
  // Don't preload placeholder
  if (url === PLACEHOLDER_URL) return url;
  
  try {
    await preloadImage(url);
    return url;
  } catch (error) {
    console.warn('Image preload failed, using placeholder:', url);
    return PLACEHOLDER_URL;
  }
};

// Get multiple image URLs with preloading
export const getImageUrlsAsync = async (images: any[]): Promise<string[]> => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [PLACEHOLDER_URL];
  }
  
  const urls = images.map(img => getImageUrl(img));
  
  try {
    await Promise.all(urls.map(url => preloadImage(url).catch(() => null)));
    return urls;
  } catch (error) {
    console.warn('Some images failed to preload');
    return urls;
  }
};

// For debugging
export const getImageUrlWithDebug = (image: any): string => {
  console.group('🔍 Image URL Debug');
  console.log('Raw image:', image);
  console.log('Image type:', typeof image);
  if (image && typeof image === 'object') {
    console.log('Image keys:', Object.keys(image));
    console.log('Image url property:', image.url);
    console.log('Has url property?', image.url ? 'Yes' : 'No');
  }
  console.log('Environment:', {
    apiUrl: API_URL,
    origin: typeof window !== 'undefined' ? window.location.origin : 'server',
    protocol: typeof window !== 'undefined' ? window.location.protocol : 'unknown',
    isSecure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : false
  });
  const url = getImageUrl(image);
  console.log(`Final URL: "${url}"`);
  console.groupEnd();
  return url;
};

// Clear cache
export const clearImageCache = (): void => {
  imageUrlCache.clear();
  console.log('Image cache cleared');
};

// Check if device is mobile
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Also check screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  return isMobile || isSmallScreen;
};

// Get optimized image URL for mobile (with size parameter if supported)
export const getOptimizedImageUrl = (image: any, width?: number): string => {
  const url = getImageUrl(image);
  
  // If it's a placeholder, return as is
  if (url === PLACEHOLDER_URL) return url;
  
  // Add width parameter if supported by your backend
  if (width && url.includes(API_URL)) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}`;
  }
  
  return url;
};

// Batch preload images (useful for product listings)
export const preloadImages = async (images: any[]): Promise<void> => {
  if (!images || images.length === 0) return;
  
  const urls = images.map(img => getImageUrl(img)).filter(url => url !== PLACEHOLDER_URL);
  
  // Preload in batches of 5 to avoid overwhelming the network
  const batchSize = 5;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(batch.map(url => preloadImage(url).catch(() => null)));
  }
  
  console.log(`✅ Preloaded ${urls.length} images`);
};

// Get image with retry logic for poor connections
export const getImageUrlWithRetry = async (image: any, retries: number = 3): Promise<string> => {
  const url = getImageUrl(image);
  
  if (url === PLACEHOLDER_URL) return url;
  
  for (let i = 0; i < retries; i++) {
    try {
      await preloadImage(url);
      return url;
    } catch (error) {
      console.warn(`Retry ${i + 1}/${retries} failed for: ${url}`);
      if (i === retries - 1) break;
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  return PLACEHOLDER_URL;
};

// Also export as default for convenience
const imageUtils = {
  getImageUrl,
  getImageUrlAsync,
  getImageUrlsAsync,
  getImageUrlWithDebug,
  getOptimizedImageUrl,
  isMobileDevice,
  clearImageCache,
  preloadImages,
  getImageUrlWithRetry
};

export default imageUtils;
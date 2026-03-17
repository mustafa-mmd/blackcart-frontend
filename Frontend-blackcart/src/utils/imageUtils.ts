// src/utils/imageUtils.ts
const API_URL = import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";
const PLACEHOLDER_URL = "/placeholder.png";

// Helper to extract URL from various image formats (string, object with url property, etc.)
const extractImageUrl = (image: any): string => {
  if (!image) return '';
  
  // If it's already a string, return it
  if (typeof image === 'string') return image;
  
  // If it's an object with url property (your database format)
  if (typeof image === 'object') {
    // Check for common image URL properties
    if (image.url && typeof image.url === 'string') return image.url;
    if (image.src && typeof image.src === 'string') return image.src;
    if (image.path && typeof image.path === 'string') return image.path;
    if (image.filename && typeof image.filename === 'string') return image.filename;
    
    // If it has a secure_url (Cloudinary format)
    if (image.secure_url && typeof image.secure_url === 'string') return image.secure_url;
    
    // If it's an array, take the first item and extract from that
    if (Array.isArray(image) && image.length > 0) {
      return extractImageUrl(image[0]);
    }
    
    // If it has a url property that's an object? try to stringify as last resort
    console.warn('Unknown image object format:', image);
  }
  
  return '';
};

export const getImageUrl = (image: any): string => {
  // Handle null/undefined
  if (!image) return PLACEHOLDER_URL;
  
  try {
    // Extract the URL string from whatever format we have
    const imagePath = extractImageUrl(image);
    
    if (!imagePath) return PLACEHOLDER_URL;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith("http")) return imagePath;
    
    // Clean the path - remove any leading slashes
    const cleanPath = imagePath.replace(/^\/+/, "");
    
    // If it already starts with 'uploads/', don't add it again
    if (cleanPath.startsWith("uploads/")) {
      return `${API_URL}/${cleanPath}`;
    } else {
      return `${API_URL}/uploads/${cleanPath}`;
    }
  } catch (error) {
    console.error('Error in getImageUrl:', error, 'for image:', image);
    return PLACEHOLDER_URL;
  }
};

// For debugging - use this temporarily to see what's being passed
export const getImageUrlWithDebug = (image: any): string => {
  console.group('🔍 Image URL Debug');
  console.log('Raw image:', image);
  console.log('Image type:', typeof image);
  if (image && typeof image === 'object') {
    console.log('Image keys:', Object.keys(image));
    console.log('Image url property:', image.url);
    console.log('Has url property?', image.url ? 'Yes' : 'No');
  }
  const url = getImageUrl(image);
  console.log(`Final URL: "${url}"`);
  console.groupEnd();
  return url;
};
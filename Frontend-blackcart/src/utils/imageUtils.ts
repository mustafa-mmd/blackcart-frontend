// src/utils/imageUtils.ts
const API_URL = import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";
const PLACEHOLDER_URL = "/placeholder.png";

// Helper function to safely convert any value to string
const safeToString = (value: any): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  
  // Handle arrays - take the first element if it exists
  if (Array.isArray(value)) {
    return value.length > 0 ? safeToString(value[0]) : '';
  }
  
  // Handle objects - try to extract common image properties
  if (typeof value === 'object') {
    // Check for common image URL properties
    if (value.url && typeof value.url === 'string') return value.url;
    if (value.src && typeof value.src === 'string') return value.src;
    if (value.path && typeof value.path === 'string') return value.path;
    if (value.filename && typeof value.filename === 'string') return value.filename;
    
    // If it has a toString method that returns something useful
    try {
      const str = JSON.stringify(value);
      if (str && str !== '{}' && str !== '[]') return str;
    } catch {
      // Ignore JSON.stringify errors
    }
  }
  
  return '';
};

export const getImageUrl = (imagePath: any): string => {
  // Handle null/undefined
  if (!imagePath) return PLACEHOLDER_URL;
  
  try {
    // Convert to string safely
    const path = safeToString(imagePath);
    
    // If conversion resulted in empty string, return placeholder
    if (!path) return PLACEHOLDER_URL;
    
    // If it's already a full URL, return as is
    if (path.startsWith("http")) return path;
    
    // Clean the path - remove any leading slashes
    const cleanPath = path.replace(/^\/+/, "");
    
    // Handle different possible path formats
    if (cleanPath.startsWith("uploads/")) {
      return `${API_URL}/${cleanPath}`;
    } else if (cleanPath.startsWith("products/")) {
      return `${API_URL}/uploads/${cleanPath}`;
    } else {
      // Default: assume it's just the filename
      return `${API_URL}/uploads/${cleanPath}`;
    }
  } catch (error) {
    console.error('Error in getImageUrl:', error, 'for value:', imagePath);
    return PLACEHOLDER_URL;
  }
};

// For debugging - use this temporarily to see what's being passed
export const getImageUrlWithDebug = (imagePath: any): string => {
  console.log('🔍 Raw imagePath:', imagePath);
  console.log('🔍 Type:', typeof imagePath);
  if (imagePath && typeof imagePath === 'object') {
    console.log('🔍 Keys:', Object.keys(imagePath));
  }
  const url = getImageUrl(imagePath);
  console.log(`🔍 Final URL: "${url}"`);
  return url;
};
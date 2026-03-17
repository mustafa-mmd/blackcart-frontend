const API_URL = import.meta.env.VITE_API_URL || "https://blackcart-backend.onrender.com";

// Use local placeholder instead of external URL
const PLACEHOLDER_URL = "/placeholder.png";

export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return PLACEHOLDER_URL;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) return imagePath;
  
  // Clean the path - remove any leading slashes
  const cleanPath = imagePath.replace(/^\/+/, "");
  
  // Handle different possible path formats
  if (cleanPath.startsWith("uploads/")) {
    return `${API_URL}/${cleanPath}`;
  } else if (cleanPath.startsWith("products/")) {
    return `${API_URL}/uploads/${cleanPath}`;
  } else {
    // Default: assume it's just the filename
    return `${API_URL}/uploads/${cleanPath}`;
  }
};

// For debugging
export const getImageUrlWithDebug = (imagePath: string | null | undefined): string => {
  const url = getImageUrl(imagePath);
  console.log(`🔍 Image path: "${imagePath}" -> URL: "${url}"`);
  return url;
};

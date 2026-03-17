// src/utils/avatarUtils.ts

/**
 * Get the avatar URL for a user, handling various sources and fallbacks
 */
export const getAvatarUrl = (user: any): string => {
  if (!user) return '';
  
  // Check all possible avatar fields from different auth sources
  const avatarUrl = user.avatar || user.picture || user.photoURL || user.image || user.profilePicture || user.photo;
  
  if (avatarUrl) {
    // Process Google Photos URLs to get optimal size
    if (typeof avatarUrl === 'string') {
      // Handle Google Photos URLs
      if (avatarUrl.includes('googleusercontent.com')) {
        // Remove size constraints and get a good quality image
        return avatarUrl.replace(/=s\d+(-c)?/, '=s400-c');
      }
      
      // Handle local uploads (from your server)
      if (avatarUrl.startsWith('/uploads')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Ensure we're using HTTP, not HTTPS for localhost
        const cleanBaseUrl = baseUrl.replace(/^https:\/\/(localhost|127\.0\.0\.1)/, 'http://$1');
        return `${cleanBaseUrl}${avatarUrl}`;
      }
      
      // Handle protocol-relative URLs (//example.com/image.jpg)
      if (avatarUrl.startsWith('//')) {
        return `http:${avatarUrl}`;
      }
      
      // If it's already a full URL but using HTTPS on localhost, fix it
      if (avatarUrl.includes('https://localhost') || avatarUrl.includes('https://127.0.0.1')) {
        return avatarUrl.replace('https://', 'http://');
      }
    }
    
    return avatarUrl;
  }
  
  // Return empty string if no avatar found (will show initials instead)
  return '';
};

/**
 * Check if a user has a custom avatar (not the default)
 */
export const hasCustomAvatar = (user: any): boolean => {
  if (!user) return false;
  
  const avatarUrl = user.avatar || user.picture || user.photoURL || user.image || user.profilePicture;
  
  if (!avatarUrl) return false;
  
  // Check if it's not the default avatar
  return !avatarUrl.includes('default-avatar.png') && 
         !avatarUrl.includes('gravatar.com/avatar') &&
         !avatarUrl.includes('placeholder');
};

/**
 * Get user initials for avatar fallback
 */
export const getUserInitials = (name: string): string => {
  if (!name) return 'U';
  
  const names = name.split(' ').filter(part => part.length > 0);
  
  if (names.length >= 2) {
    // Get first letter of first and last name
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }
  
  if (names.length === 1 && names[0].length >= 2) {
    // Single name - take first two letters
    return names[0].substring(0, 2).toUpperCase();
  }
  
  if (names.length === 1) {
    // Single short name - take first letter
    return names[0].charAt(0).toUpperCase();
  }
  
  return 'U';
};

/**
 * Generate a consistent color based on user ID or name
 * For avatar backgrounds and UI elements
 */
export const getUserColor = (userId?: string, name?: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-sky-500',
  ];
  
  const seed = userId || name || '';
  if (!seed) return colors[0];
  
  // Simple hash function for consistent color
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get lighter background color for initials container
 * Returns a Tailwind class string for background and text color
 */
export const getInitialsBgColor = (userId?: string, name?: string): string => {
  const colors = [
    'bg-red-100 text-red-600',
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-yellow-100 text-yellow-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
    'bg-teal-100 text-teal-600',
    'bg-orange-100 text-orange-600',
    'bg-cyan-100 text-cyan-600',
    'bg-emerald-100 text-emerald-600',
    'bg-rose-100 text-rose-600',
    'bg-amber-100 text-amber-600',
    'bg-lime-100 text-lime-600',
    'bg-sky-100 text-sky-600',
  ];
  
  const seed = userId || name || '';
  if (!seed) return colors[0];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get a random avatar color (useful for testing or when you don't need consistency)
 */
export const getRandomAvatarColor = (): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Get initials with background color (combined utility)
 */
export const getInitialsWithColor = (user: any): { initials: string; colorClass: string; bgClass: string } => {
  const initials = getUserInitials(user?.name || '');
  const colorClass = getUserColor(user?._id, user?.name);
  const bgClass = getInitialsBgColor(user?._id, user?.name);
  
  return {
    initials,
    colorClass,
    bgClass
  };
};
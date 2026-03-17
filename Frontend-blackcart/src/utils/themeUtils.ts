// src/utils/themeUtils.ts

export interface ThemeSettings {
  darkMode: boolean
  compactView: boolean
  reducedMotion: boolean
  highContrast: boolean
}

// Apply theme to document
export const applyTheme = (settings: ThemeSettings) => {
  // Dark mode
  if (settings.darkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  
  // Compact view
  if (settings.compactView) {
    document.documentElement.classList.add('compact-view')
  } else {
    document.documentElement.classList.remove('compact-view')
  }
  
  // Reduced motion
  if (settings.reducedMotion) {
    document.documentElement.classList.add('reduced-motion')
  } else {
    document.documentElement.classList.remove('reduced-motion')
  }
  
  // High contrast
  if (settings.highContrast) {
    document.documentElement.classList.add('high-contrast')
  } else {
    document.documentElement.classList.remove('high-contrast')
  }
  
  // Save to localStorage
  localStorage.setItem('theme', JSON.stringify(settings))
}

// Load theme from localStorage
export const loadTheme = (): ThemeSettings | null => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    try {
      return JSON.parse(savedTheme)
    } catch (e) {
      console.error('Failed to parse saved theme')
    }
  }
  return null
}

// Default theme settings
export const defaultTheme: ThemeSettings = {
  darkMode: false,
  compactView: false,
  reducedMotion: false,
  highContrast: false,
}
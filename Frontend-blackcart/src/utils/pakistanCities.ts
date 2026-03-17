export interface City {
  id: string
  name: string
  province: string
  shippingZone: string
  shippingCost: number
  deliveryDays: number
  minDeliveryDays: number
  maxDeliveryDays: number
  isActive: boolean
  codAvailable: boolean
  codMaxAmount?: number
  expressShippingAvailable: boolean
  expressShippingCost?: number
  expressDeliveryDays?: number
}

export const pakistanCities: City[] = [
  // Punjab - Major Cities
  { 
    id: 'lahore', 
    name: 'Lahore', 
    province: 'Punjab', 
    shippingZone: 'Central', 
    shippingCost: 200, 
    deliveryDays: 2,
    minDeliveryDays: 1,
    maxDeliveryDays: 3,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 400,
    expressDeliveryDays: 1
  },
  { 
    id: 'faisalabad', 
    name: 'Faisalabad', 
    province: 'Punjab', 
    shippingZone: 'Central', 
    shippingCost: 250, 
    deliveryDays: 3,
    minDeliveryDays: 2,
    maxDeliveryDays: 4,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 450,
    expressDeliveryDays: 2
  },
  { 
    id: 'rawalpindi', 
    name: 'Rawalpindi', 
    province: 'Punjab', 
    shippingZone: 'North', 
    shippingCost: 300, 
    deliveryDays: 3,
    minDeliveryDays: 2,
    maxDeliveryDays: 4,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 500,
    expressDeliveryDays: 2
  },
  { 
    id: 'islamabad', 
    name: 'Islamabad', 
    province: 'Punjab', 
    shippingZone: 'North', 
    shippingCost: 300, 
    deliveryDays: 3,
    minDeliveryDays: 2,
    maxDeliveryDays: 4,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 500,
    expressDeliveryDays: 2
  },
  { 
    id: 'multan', 
    name: 'Multan', 
    province: 'Punjab', 
    shippingZone: 'South', 
    shippingCost: 350, 
    deliveryDays: 4,
    minDeliveryDays: 3,
    maxDeliveryDays: 5,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 40000,
    expressShippingAvailable: true,
    expressShippingCost: 550,
    expressDeliveryDays: 3
  },
  { 
    id: 'gujranwala', 
    name: 'Gujranwala', 
    province: 'Punjab', 
    shippingZone: 'Central', 
    shippingCost: 250, 
    deliveryDays: 3,
    minDeliveryDays: 2,
    maxDeliveryDays: 4,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 450,
    expressDeliveryDays: 2
  },
  
  // Sindh
  { 
    id: 'karachi', 
    name: 'Karachi', 
    province: 'Sindh', 
    shippingZone: 'South', 
    shippingCost: 500, 
    deliveryDays: 5,
    minDeliveryDays: 4,
    maxDeliveryDays: 6,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 800,
    expressDeliveryDays: 3
  },
  { 
    id: 'hyderabad', 
    name: 'Hyderabad', 
    province: 'Sindh', 
    shippingZone: 'South', 
    shippingCost: 450, 
    deliveryDays: 4,
    minDeliveryDays: 3,
    maxDeliveryDays: 5,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 40000,
    expressShippingAvailable: true,
    expressShippingCost: 700,
    expressDeliveryDays: 3
  },
  
  // KPK
  { 
    id: 'peshawar', 
    name: 'Peshawar', 
    province: 'KPK', 
    shippingZone: 'North', 
    shippingCost: 400, 
    deliveryDays: 4,
    minDeliveryDays: 3,
    maxDeliveryDays: 5,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 40000,
    expressShippingAvailable: true,
    expressShippingCost: 600,
    expressDeliveryDays: 3
  },
  
  // Balochistan
  { 
    id: 'quetta', 
    name: 'Quetta', 
    province: 'Balochistan', 
    shippingZone: 'West', 
    shippingCost: 600, 
    deliveryDays: 7,
    minDeliveryDays: 6,
    maxDeliveryDays: 8,
    isActive: true,
    codAvailable: false,
    codMaxAmount: 0,
    expressShippingAvailable: false,
    expressShippingCost: 0,
    expressDeliveryDays: 0
  },
  
  // Punjab - Additional Cities
  { 
    id: 'sialkot', 
    name: 'Sialkot', 
    province: 'Punjab', 
    shippingZone: 'North', 
    shippingCost: 300, 
    deliveryDays: 3,
    minDeliveryDays: 2,
    maxDeliveryDays: 4,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 500,
    expressDeliveryDays: 2
  },
  { 
    id: 'bahawalpur', 
    name: 'Bahawalpur', 
    province: 'Punjab', 
    shippingZone: 'South', 
    shippingCost: 400, 
    deliveryDays: 5,
    minDeliveryDays: 4,
    maxDeliveryDays: 6,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 30000,
    expressShippingAvailable: true,
    expressShippingCost: 600,
    expressDeliveryDays: 4
  },
  { 
    id: 'sargodha', 
    name: 'Sargodha', 
    province: 'Punjab', 
    shippingZone: 'Central', 
    shippingCost: 350, 
    deliveryDays: 4,
    minDeliveryDays: 3,
    maxDeliveryDays: 5,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 40000,
    expressShippingAvailable: true,
    expressShippingCost: 550,
    expressDeliveryDays: 3
  },
  { 
    id: 'jhang', 
    name: 'Jhang', 
    province: 'Punjab', 
    shippingZone: 'Central', 
    shippingCost: 400, 
    deliveryDays: 5,
    minDeliveryDays: 4,
    maxDeliveryDays: 6,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 30000,
    expressShippingAvailable: true,
    expressShippingCost: 600,
    expressDeliveryDays: 4
  },
  { 
    id: 'gujrat', 
    name: 'Gujrat', 
    province: 'Punjab', 
    shippingZone: 'North', 
    shippingCost: 350, 
    deliveryDays: 4,
    minDeliveryDays: 3,
    maxDeliveryDays: 5,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 40000,
    expressShippingAvailable: true,
    expressShippingCost: 550,
    expressDeliveryDays: 3
  },
  { 
    id: 'kasur', 
    name: 'Kasur', 
    province: 'Punjab', 
    shippingZone: 'Central', 
    shippingCost: 300, 
    deliveryDays: 3,
    minDeliveryDays: 2,
    maxDeliveryDays: 4,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 50000,
    expressShippingAvailable: true,
    expressShippingCost: 500,
    expressDeliveryDays: 2
  },
  
  // Sindh - Additional Cities
  { 
    id: 'sukkur', 
    name: 'Sukkur', 
    province: 'Sindh', 
    shippingZone: 'South', 
    shippingCost: 550, 
    deliveryDays: 6,
    minDeliveryDays: 5,
    maxDeliveryDays: 7,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 30000,
    expressShippingAvailable: true,
    expressShippingCost: 800,
    expressDeliveryDays: 4
  },
  { 
    id: 'larkana', 
    name: 'Larkana', 
    province: 'Sindh', 
    shippingZone: 'South', 
    shippingCost: 500, 
    deliveryDays: 6,
    minDeliveryDays: 5,
    maxDeliveryDays: 7,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 30000,
    expressShippingAvailable: true,
    expressShippingCost: 750,
    expressDeliveryDays: 4
  },
  { 
    id: 'mirpurkhas', 
    name: 'Mirpur Khas', 
    province: 'Sindh', 
    shippingZone: 'South', 
    shippingCost: 600, 
    deliveryDays: 7,
    minDeliveryDays: 6,
    maxDeliveryDays: 8,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 25000,
    expressShippingAvailable: false,
    expressShippingCost: 0,
    expressDeliveryDays: 0
  },
  { 
    id: 'nawabshah', 
    name: 'Nawabshah', 
    province: 'Sindh', 
    shippingZone: 'South', 
    shippingCost: 550, 
    deliveryDays: 6,
    minDeliveryDays: 5,
    maxDeliveryDays: 7,
    isActive: true,
    codAvailable: true,
    codMaxAmount: 30000,
    expressShippingAvailable: true,
    expressShippingCost: 800,
    expressDeliveryDays: 4
  },
]

// Helper function to get city by ID
export const getCityById = (id: string): City | undefined => {
  return pakistanCities.find(city => city.id === id && city.isActive)
}

// Helper function to get city by name
export const getCityByName = (name: string): City | undefined => {
  return pakistanCities.find(city => 
    city.name.toLowerCase() === name.toLowerCase() && city.isActive
  )
}

// Get cities by province
export const getCitiesByProvince = (province: string): City[] => {
  return pakistanCities.filter(city => 
    city.province === province && city.isActive
  )
}

// Get all provinces
export const getProvinces = (): string[] => {
  return [...new Set(pakistanCities
    .filter(city => city.isActive)
    .map(city => city.province)
  )]
}

// Calculate shipping cost
export const calculateShipping = (
  cityId: string, 
  orderAmount: number, 
  isExpress: boolean = false
): { cost: number; deliveryDays: string; available: boolean } => {
  const city = getCityById(cityId)
  
  if (!city) {
    return { cost: 0, deliveryDays: '7-10 business days', available: false }
  }
  
  // Free shipping for orders above 5000 (standard shipping only)
  if (orderAmount >= 5000 && !isExpress) {
    return { 
      cost: 0, 
      deliveryDays: `${city.minDeliveryDays}-${city.maxDeliveryDays} business days`,
      available: true 
    }
  }
  
  const shippingCost = isExpress && city.expressShippingAvailable
    ? city.expressShippingCost || city.shippingCost * 1.5
    : city.shippingCost
  
  const deliveryDays = isExpress && city.expressShippingAvailable
    ? `${city.expressDeliveryDays || city.minDeliveryDays} business days`
    : `${city.minDeliveryDays}-${city.maxDeliveryDays} business days`
  
  return {
    cost: shippingCost,
    deliveryDays,
    available: true
  }
}

// Get delivery estimate
export const getDeliveryEstimate = (cityId: string, isExpress: boolean = false): string => {
  const city = getCityById(cityId)
  if (!city) return '5-7 business days'
  
  if (isExpress && city.expressShippingAvailable) {
    return `${city.expressDeliveryDays || city.minDeliveryDays} business days`
  }
  
  return `${city.minDeliveryDays}-${city.maxDeliveryDays} business days`
}

// Check if COD is available for city and amount
export const isCODAvailable = (cityId: string, orderAmount: number): boolean => {
  const city = getCityById(cityId)
  if (!city || !city.codAvailable) return false
  
  if (city.codMaxAmount && orderAmount > city.codMaxAmount) return false
  
  return true
}

// Get city suggestions for search
export const searchCities = (query: string): City[] => {
  const searchTerm = query.toLowerCase()
  return pakistanCities.filter(city =>
    city.isActive && (
      city.name.toLowerCase().includes(searchTerm) ||
      city.province.toLowerCase().includes(searchTerm) ||
      city.shippingZone.toLowerCase().includes(searchTerm)
    )
  )
}

// Get shipping zones
export const getShippingZones = (): string[] => {
  return [...new Set(pakistanCities
    .filter(city => city.isActive)
    .map(city => city.shippingZone)
  )]
}

// Get cities by shipping zone
export const getCitiesByShippingZone = (zone: string): City[] => {
  return pakistanCities.filter(city => 
    city.shippingZone === zone && city.isActive
  )
}

// Validate city for shipping
export const validateCityForShipping = (cityId: string, amount: number): {
  isValid: boolean
  message: string
  shippingCost: number
  deliveryDays: string
  codAvailable: boolean
  expressAvailable: boolean
} => {
  const city = getCityById(cityId)
  
  if (!city) {
    return {
      isValid: false,
      message: 'City not found or shipping not available',
      shippingCost: 0,
      deliveryDays: '',
      codAvailable: false,
      expressAvailable: false
    }
  }
  
  const shipping = calculateShipping(cityId, amount)
  const expressShipping = calculateShipping(cityId, amount, true)
  
  return {
    isValid: true,
    message: 'City is valid for shipping',
    shippingCost: shipping.cost,
    deliveryDays: shipping.deliveryDays,
    codAvailable: isCODAvailable(cityId, amount),
    expressAvailable: city.expressShippingAvailable
  }
}

// Get all active cities
export const getActiveCities = (): City[] => {
  return pakistanCities.filter(city => city.isActive)
}

// Sort cities by name
export const getSortedCities = (): City[] => {
  return [...pakistanCities]
    .filter(city => city.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
}

// Get popular cities (major cities)
export const getPopularCities = (): City[] => {
  const popularCityIds = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar']
  return pakistanCities.filter(city => 
    popularCityIds.includes(city.id) && city.isActive
  )
}
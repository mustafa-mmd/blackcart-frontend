import api from './api';

export interface Logo {
  url: string;
  alt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  // Logo
  logo: Logo;
  
  // General settings
  general: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCurrency: string;
    timezone: string;
    dateFormat: string;
  };
  
  // Payment settings
  payment: {
    codEnabled: boolean;
    easypaisaEnabled: boolean;
    jazzcashEnabled: boolean;
    bankTransferEnabled: boolean;
    cardEnabled: boolean;
    codMaxAmount: number;
    codCharges: number;
    bankTransferInstructions: string;
  };
  
  // Shipping settings
  shipping: {
    freeShippingThreshold: number;
    standardShippingCharges: number;
    expressShippingCharges: number;
    estimatedDeliveryDays: string;
    returnPolicyDays: number;
    shippingZones: Array<{
      city: string;
      cost: number;
      deliveryDays: string;
    }>;
  };
  
  // Notification settings
  notifications: {
    newOrder: boolean;
    newUser: boolean;
    lowStock: boolean;
    orderUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  
  // Security settings
  security: {
    requireEmailVerification: boolean;
    requireStrongPasswords: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    recaptchaEnabled: boolean;
  };
}

class SettingService {
  private cache: SiteSettings | null = null;
  private cacheTime: number = 0;
  private cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  // Get public settings (with caching)
  async getSettings(forceRefresh = false): Promise<SiteSettings> {
    if (!forceRefresh && this.cache && (Date.now() - this.cacheTime) < this.cacheDuration) {
      console.log('📦 Using cached settings:', this.cache.logo?.url);
      return this.cache;
    }

    try {
      console.log('📡 Fetching settings from API...');
      const response = await api.get('/settings/public');
      console.log('✅ API Response:', response.data);
      
      this.cache = response.data.data;
      this.cacheTime = Date.now();
      
      console.log('💾 Settings cached:', {
        logoUrl: this.cache.logo?.url,
        storeName: this.cache.general?.storeName
      });
      
      return this.cache;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return this.getDefaultSettings();
    }
  }

  // Get default settings
  getDefaultSettings(): SiteSettings {
    return {
      logo: {
        url: '/uploads/logo/default-logo.png',
        alt: 'BlackCart Logo'
      },
      general: {
        storeName: 'BlackCart',
        storeEmail: 'admin@blackcart.com',
        storePhone: '+92 300 1234567',
        storeAddress: '123 Main Street, City',
        storeCurrency: 'PKR',
        timezone: 'Asia/Karachi',
        dateFormat: 'DD/MM/YYYY',
      },
      payment: {
        codEnabled: true,
        easypaisaEnabled: true,
        jazzcashEnabled: true,
        bankTransferEnabled: true,
        cardEnabled: false,
        codMaxAmount: 50000,
        codCharges: 200,
        bankTransferInstructions: 'Please transfer the exact amount to HBL Bank: 1234567890',
      },
      shipping: {
        freeShippingThreshold: 5000,
        standardShippingCharges: 200,
        expressShippingCharges: 500,
        estimatedDeliveryDays: '3-5',
        returnPolicyDays: 14,
        shippingZones: [],
      },
      notifications: {
        newOrder: true,
        newUser: true,
        lowStock: true,
        orderUpdates: true,
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: false,
      },
      security: {
        requireEmailVerification: true,
        requireStrongPasswords: true,
        twoFactorAuth: false,
        sessionTimeout: 24,
        maxLoginAttempts: 5,
        recaptchaEnabled: false,
      },
    };
  }

  // Admin: Get all settings
  async getAllSettings(): Promise<any> {
    const response = await api.get('/admin/settings');
    return response.data.data;
  }

  // Admin: Update settings
  async updateSettings(section: string, data: any): Promise<any> {
    const response = await api.put('/admin/settings', { section, data });
    this.cache = null; // Invalidate cache
    return response.data.data;
  }

  // Admin: Upload logo
  async uploadLogo(file: File, alt?: string): Promise<Logo> {
    const formData = new FormData();
    formData.append('logo', file);
    if (alt) formData.append('alt', alt);

    const response = await api.post('/admin/settings/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    this.cache = null; // Invalidate cache
    return response.data.data;
  }

  // Admin: Reset section
  async resetSection(section: string): Promise<any> {
    const response = await api.post(`/admin/settings/reset/${section}`);
    this.cache = null;
    return response.data.data;
  }
}

export default new SettingService();
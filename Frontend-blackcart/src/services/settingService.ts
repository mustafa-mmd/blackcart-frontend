// src/services/settingService.ts
import api from './api';

export interface Logo {
  url: string;
  alt: string;
  updatedAt?: string;
}

export interface SiteSettings {
  logo: Logo;
  general: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCurrency: string;
    timezone: string;
    dateFormat: string;
  };
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
  notifications: {
    newOrder: boolean;
    newUser: boolean;
    lowStock: boolean;
    orderUpdates: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  security: {
    requireEmailVerification: boolean;
    requireStrongPasswords: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    recaptchaEnabled: boolean;
  };
}

// ─── Helper: is this URL safe to display? ────────────────────────────────────
// Returns false for local /uploads/ paths (they 404 on Render after restart)
// Returns true for Cloudinary URLs and empty/null values
export function isValidLogoUrl(url: string | undefined | null): boolean {
  if (!url || url.trim() === '') return false;
  // Cloudinary URL — always valid
  if (url.startsWith('https://res.cloudinary.com')) return true;
  // Any other absolute HTTPS URL — valid
  if (url.startsWith('https://') || url.startsWith('http://')) return true;
  // Local /uploads/ paths are NOT reliable on Render — treat as invalid
  if (url.startsWith('/uploads/')) return false;
  return false;
}

class SettingService {
  private cache: SiteSettings | null = null;
  private cacheTime: number = 0;
  private readonly cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  // ── Get public settings (with caching) ──────────────────────────────────────
  async getSettings(forceRefresh = false): Promise<SiteSettings> {
    if (
      !forceRefresh &&
      this.cache &&
      Date.now() - this.cacheTime < this.cacheDuration
    ) {
      console.log('📦 Using cached settings:', this.cache.logo?.url);
      return this.cache;
    }

    try {
      console.log('📡 Fetching settings from API...');
      const response = await api.get('/settings/public');

      const data: SiteSettings = response.data.data;

      // ── Sanitize logo URL ──────────────────────────────────────────────────
      // If the stored URL is a local /uploads/ path it will 404 on Render.
      // Clear it so the frontend falls back to the text/initial placeholder.
      if (data.logo && !isValidLogoUrl(data.logo.url)) {
        console.warn(
          '⚠️  Logo URL is a local path — clearing so fallback renders:',
          data.logo.url
        );
        data.logo = { ...data.logo, url: '' };
      }

      this.cache = data;
      this.cacheTime = Date.now();

      console.log('💾 Settings cached:', {
        logoUrl: this.cache.logo?.url,
        storeName: this.cache.general?.storeName,
      });

      return this.cache;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return this.getDefaultSettings();
    }
  }

  // ── Default settings ────────────────────────────────────────────────────────
  getDefaultSettings(): SiteSettings {
    return {
      // Empty URL — Header.tsx already handles this gracefully by showing
      // the text/initial fallback when logo.url is falsy.
      logo: {
        url: '',
        alt: 'BlackCart Logo',
      },
      general: {
        storeName: 'BlackCart.store',
        storeEmail: 'blackcart.ak25@gmail.com',
        storePhone: '+92 3146965599',
        storeAddress: 'Islamia Town Street# 3rd, Peshawar, Khyber Pakhtunkhwa, Pakistan',
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
        bankTransferInstructions:
          'Please transfer the exact amount to HBL Bank: 1234567890',
      },
      shipping: {
        freeShippingThreshold: 5000,
        standardShippingCharges: 200,
        expressShippingCharges: 500,
        estimatedDeliveryDays: '4-6',
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

  // ── Admin: Get all settings ──────────────────────────────────────────────────
  async getAllSettings(): Promise<any> {
    const response = await api.get('/admin/settings');
    return response.data.data;
  }

  // ── Admin: Update settings section ──────────────────────────────────────────
  async updateSettings(section: string, data: unknown): Promise<unknown> {
    const response = await api.put('/admin/settings', { section, data });
    this.cache = null; // Invalidate cache
    return response.data.data;
  }

  // ── Admin: Upload logo ───────────────────────────────────────────────────────
  // ROOT CAUSE OF 400 WAS HERE:
  // The old code passed { headers: { 'Content-Type': 'multipart/form-data' } }
  // which sets the header WITHOUT the required boundary string, making busboy
  // unable to parse the request body → req.file is undefined → 400 "Please upload logo".
  //
  // FIX: Do NOT set Content-Type manually for FormData. Let axios + the browser
  // generate it automatically with the correct boundary, e.g.:
  //   Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ
  // The api.ts interceptor already handles this (it deletes Content-Type for
  // FormData), so no extra headers object is needed here at all.
  async uploadLogo(file: File, alt?: string): Promise<Logo> {
    const formData = new FormData();
    formData.append('logo', file);
    if (alt) formData.append('alt', alt);

    // ✅ NO explicit Content-Type header — axios sets it automatically with boundary
    const response = await api.post('/admin/settings/logo', formData);

    this.cache = null; // Invalidate cache so next read gets fresh data
    return response.data.data;
  }

  // ── Admin: Remove logo ───────────────────────────────────────────────────────
  async removeLogo(): Promise<any> {
    const response = await api.delete('/admin/settings/logo');
    this.cache = null;
    return response.data;
  }

  // ── Admin: Reset section ────────────────────────────────────────────────────
  async resetSection(section: string): Promise<any> {
    const response = await api.post(`/admin/settings/reset/${section}`);
    this.cache = null;
    return response.data.data;
  }

  // ── Invalidate cache manually (call after any mutation) ─────────────────────
  invalidateCache(): void {
    this.cache = null;
    this.cacheTime = 0;
  }
}

export default new SettingService();

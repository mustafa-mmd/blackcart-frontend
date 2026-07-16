import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Bell, 
  Shield, 
  CreditCard,
  Truck,
  Globe,
  RefreshCw,
  CheckCircle,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { adminService } from '../../services/adminServiceMethods';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

interface Settings {
  logo?: {
    url: string;
    alt: string;
    updatedAt?: string;
  };
  general: {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCurrency: string;
    timezone: string;
    dateFormat: string;
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
  security: {
    requireEmailVerification: boolean;
    requireStrongPasswords: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    recaptchaEnabled: boolean;
  };
}

const AdminSettings: React.FC = () => {
  const { settings: contextSettings, refreshSettings, uploadLogo: contextUploadLogo } = useSettings();
  const [activeSection, setActiveSection] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(Date.now());
  const [settings, setSettings] = useState<Settings>({
    logo: {
      url: '',
      alt: 'Store Logo'
    },
    general: {
      storeName: '',
      storeEmail: '',
      storePhone: '',
      storeAddress: '',
      storeCurrency: 'PKR',
      timezone: 'Asia/Karachi',
      dateFormat: 'DD/MM/YYYY',
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
      expressShippingCharges: 350,
      estimatedDeliveryDays: '4-6',
      returnPolicyDays: 3,
      shippingZones: [],
    },
    security: {
      requireEmailVerification: true,
      requireStrongPasswords: true,
      twoFactorAuth: false,
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      recaptchaEnabled: false,
    },
  });

  // Update local settings when context settings change (for logo)
  useEffect(() => {
    if (contextSettings?.logo) {
      setSettings(prev => ({
        ...prev,
        logo: {
          url: contextSettings.logo.url,
          alt: contextSettings.logo.alt,
          updatedAt: contextSettings.logo.updatedAt
        }
      }));
      setImageKey(Date.now()); // Force image reload
      setImageError(false);
    }
  }, [contextSettings]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSettings();
      
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error(error.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async (section: keyof Settings) => {
    try {
      setSaving(true);
      
      const response = await adminService.updateSettings({
        section,
        data: settings[section]
      });
      
      if (response.success) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
        // Refresh context settings to update header
        await refreshSettings();
      } else {
        toast.error(response.message || 'Failed to save settings');
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (section: keyof Settings) => {
    if (!window.confirm(`Are you sure you want to reset ${section} settings to default?`)) {
      return;
    }

    try {
      const response = await adminService.resetSettings(section);
      
      if (response.success) {
        toast.success(`${section} settings reset to default`);
        await fetchSettings();
        await refreshSettings(); // Refresh context
      } else {
        toast.error(response.message || 'Failed to reset settings');
      }
    } catch (error: any) {
      console.error('Error resetting settings:', error);
      toast.error(error.response?.data?.message || 'Failed to reset settings');
    }
  };

  // ========== LOGO UPLOAD HANDLERS ==========
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select an image file (JPEG, PNG, GIF, WEBP, SVG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    try {
      setSaving(true);
      setUploadProgress(0);
      setImageError(false);
      
      // Get alt text from user
      const alt = prompt('Enter logo alt text (optional):', settings.general?.storeName || 'Store Logo');
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Use context uploadLogo function
      const logoData = await contextUploadLogo(file, alt || undefined);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (logoData) {
        toast.success('Logo uploaded successfully');
        
        // Update local settings with new logo
        setSettings(prev => ({
          ...prev,
          logo: logoData
        }));
        
        setImageKey(Date.now()); // Force image reload
        
        // Reset progress after success
        setTimeout(() => setUploadProgress(0), 1000);
      }
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload logo');
      setUploadProgress(0);
    } finally {
      setSaving(false);
      // Clear input
      e.target.value = '';
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Are you sure you want to remove the logo?')) return;
    
    try {
      setSaving(true);
      
      // Call API to remove logo
      const response = await adminService.removeLogo();
      
      if (response.success) {
        toast.success('Logo removed successfully');
        
        // Update local settings
        setSettings(prev => ({
          ...prev,
          logo: { url: '', alt: 'Store Logo' }
        }));
        
        setImageKey(Date.now());
        await refreshSettings(); // Refresh context
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove logo');
    } finally {
      setSaving(false);
    }
  };

  const handleImageError = () => {
    console.log('❌ Logo preview failed to load');
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log('✅ Logo preview loaded successfully');
    setImageError(false);
  };

  // Construct full image URL
  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${API_URL}${url}`;
  };

  const sections = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // ========== LOGO SETTINGS COMPONENT ==========
  const renderLogoSettings = () => {
    const imageUrl = settings.logo?.url ? getFullImageUrl(settings.logo.url) : '';
    const shouldShowImage = settings.logo?.url && !imageError;

    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Logo</h3>
        
        <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
          {/* Logo Preview - FIXED FOR CLEAR DISPLAY */}
          <div className="relative group">
            <div className="w-48 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden p-2">
              {shouldShowImage ? (
                <img 
                  key={imageKey}
                  src={imageUrl}
                  alt={settings.logo?.alt || 'Site Logo'} 
                  className="max-w-full max-h-full object-contain"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  crossOrigin="anonymous"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              ) : (
                <Camera className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            {/* Upload overlay on hover */}
            {!settings.logo?.url && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all flex items-center justify-center">
                <label className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={saving}
                  />
                  <span className="px-3 py-1 bg-white text-gray-700 rounded-lg text-sm">Upload</span>
                </label>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">
              Recommended: PNG or SVG, max 2MB
            </p>
            
            {/* Upload Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={saving}
                />
                <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer disabled:opacity-50">
                  <Upload className="h-4 w-4 mr-2" />
                  {saving ? 'Uploading...' : 'Upload New Logo'}
                </span>
              </label>
              
              {settings.logo?.url && (
                <button
                  onClick={handleRemoveLogo}
                  disabled={saving}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 inline-flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Logo
                </button>
              )}
            </div>
            
            {settings.logo?.updatedAt && (
              <p className="text-xs text-gray-400 mt-2">
                Last updated: {new Date(settings.logo.updatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGeneralSection = () => (
    <div className="space-y-6">
      {/* Logo Settings */}
      {renderLogoSettings()}
      
      {/* Store Information */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Store Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Name *
            </label>
            <input
              type="text"
              value={settings.general.storeName}
              onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      placeholder="BlackCart.store"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Email *
            </label>
            <input
              type="email"
              value={settings.general.storeEmail}
              onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="blackcart.ak25@gmail.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Phone
            </label>
            <input
              type="tel"
              value={settings.general.storePhone}
              onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="+92 3146965599"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Address
            </label>
            <input
              type="text"
              value={settings.general.storeAddress}
              onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Islamia Town Street# 3rd, Peshawar, Khyber Pakhtunkhwa, Pakistan"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={settings.general.storeCurrency}
              onChange={(e) => handleInputChange('general', 'storeCurrency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="PKR">Pakistani Rupee (PKR)</option>
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.general.timezone}
              onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="Asia/Karachi">Pakistan (Asia/Karachi)</option>
              <option value="Asia/Dubai">Dubai (Asia/Dubai)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleReset('general')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          disabled={saving}
        >
          Reset to Default
        </button>
        <button
          onClick={() => handleSave('general')}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save General Settings
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Email Notifications</h4>
            <div className="space-y-4">
              {[
                { key: 'newOrder', label: 'New Order', description: 'Receive email when new order is placed' },
                { key: 'newUser', label: 'New User Registration', description: 'Get notified when new users register' },
                { key: 'lowStock', label: 'Low Stock Alert', description: 'Receive alerts for products below threshold' },
                { key: 'orderUpdates', label: 'Order Status Updates', description: 'Get updates on order status changes' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[item.key as keyof typeof settings.notifications] as boolean}
                      onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Channels</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Enable/disable all email notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive browser push notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleInputChange('notifications', 'pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive SMS alerts (additional charges may apply)</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleReset('notifications')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          disabled={saving}
        >
          Reset to Default
        </button>
        <button
          onClick={() => handleSave('notifications')}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Notification Settings
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderPaymentSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'codEnabled', label: 'Cash on Delivery (COD)' },
              { key: 'easypaisaEnabled', label: 'EasyPaisa' },
              { key: 'jazzcashEnabled', label: 'JazzCash' },
              { key: 'bankTransferEnabled', label: 'Bank Transfer' },
              { key: 'cardEnabled', label: 'Credit/Debit Card' },
            ].map((method) => (
              <div key={method.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <span className="font-medium text-gray-900">{method.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment[method.key as keyof typeof settings.payment] as boolean}
                    onChange={(e) => handleInputChange('payment', method.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">COD Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Order Amount (PKR)
                </label>
                <input
                  type="number"
                  value={settings.payment.codMaxAmount}
                  onChange={(e) => handleInputChange('payment', 'codMaxAmount', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum order amount allowed for COD</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  COD Charges (PKR)
                </label>
                <input
                  type="number"
                  value={settings.payment.codCharges}
                  onChange={(e) => handleInputChange('payment', 'codCharges', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="0"
                  step="50"
                />
                <p className="text-xs text-gray-500 mt-1">Additional charges for COD orders</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Bank Transfer Instructions</h4>
            <textarea
              value={settings.payment.bankTransferInstructions}
              onChange={(e) => handleInputChange('payment', 'bankTransferInstructions', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter bank transfer instructions for customers..."
            />
            <p className="text-xs text-gray-500 mt-1">These instructions will be shown to customers when they select bank transfer</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleReset('payment')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          disabled={saving}
        >
          Reset to Default
        </button>
        <button
          onClick={() => handleSave('payment')}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Payment Settings
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderShippingSection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Normal Delivery (PKR)
              </label>
              <input
                type="number"
                value={settings.shipping.standardShippingCharges}
                onChange={(e) => handleInputChange('shipping', 'standardShippingCharges', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min="0"
                step="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Express Delivery (PKR)
              </label>
              <input
                type="number"
                value={settings.shipping.expressShippingCharges}
                onChange={(e) => handleInputChange('shipping', 'expressShippingCharges', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min="0"
                step="50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery (days)
              </label>
              <input
                type="text"
                value={settings.shipping.estimatedDeliveryDays}
                onChange={(e) => handleInputChange('shipping', 'estimatedDeliveryDays', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="4-6"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Return Policy (days)
              </label>
              <input
                type="number"
                value={settings.shipping.returnPolicyDays}
                onChange={(e) => handleInputChange('shipping', 'returnPolicyDays', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                min="0"
                max="90"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleReset('shipping')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          disabled={saving}
        >
          Reset to Default
        </button>
        <button
          onClick={() => handleSave('shipping')}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Shipping Settings
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        
        <div className="space-y-6">
          <div className="space-y-4">
            {[
              { key: 'requireEmailVerification', label: 'Require Email Verification', description: 'Users must verify email before accessing account' },
              { key: 'requireStrongPasswords', label: 'Require Strong Passwords', description: 'Enforce strong password requirements' },
              { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Enable 2FA for admin accounts' },
              { key: 'recaptchaEnabled', label: 'reCAPTCHA Protection', description: 'Enable reCAPTCHA on login/registration' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security[item.key as keyof typeof settings.security] as boolean}
                    onChange={(e) => handleInputChange('security', item.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Session & Login Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (hours)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="1"
                  max="72"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="1"
                  max="10"
                />
                <p className="text-xs text-gray-500 mt-1">Account locks after failed attempts</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => handleReset('security')}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          disabled={saving}
        >
          Reset to Default
        </button>
        <button
          onClick={() => handleSave('security')}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Security Settings
            </>
          )}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Configure your store settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-2 sticky top-24">
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`
                      w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                      ${activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <section.icon className={`h-5 w-5 mr-3 ${
                      activeSection === section.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mt-6">
              <h3 className="font-medium text-gray-900 mb-3">System Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Version</span>
                  <span className="font-medium">2.1.0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Environment</span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">Production</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="pt-2 mt-2 border-t">
                  <div className="flex items-center text-xs text-gray-500">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    All systems operational
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeSection === 'general' && renderGeneralSection()}
            {activeSection === 'notifications' && renderNotificationsSection()}
            {activeSection === 'payment' && renderPaymentSection()}
            {activeSection === 'shipping' && renderShippingSection()}
            {activeSection === 'security' && renderSecuritySection()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

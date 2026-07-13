/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import settingService, { SiteSettings, Logo } from '../services/settingService';
import toast from 'react-hot-toast';

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (section: string, data: unknown) => Promise<void>;
  uploadLogo: (file: File, alt?: string) => Promise<Logo>;
  resetSection: (section: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(settingService.getDefaultSettings());
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      const data = await settingService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (section: string, data: unknown) => {
    try {
      await settingService.updateSettings(section, data);
      await refreshSettings();
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      throw error;
    }
  };

  const uploadLogo = async (file: File, alt?: string) => {
    try {
      const logoData = await settingService.uploadLogo(file, alt);
      await refreshSettings();
      toast.success('Logo uploaded successfully');
      return logoData;
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      throw error;
    }
  };

  const resetSection = async (section: string) => {
    try {
      await settingService.resetSection(section);
      await refreshSettings();
      toast.success(`${section} settings reset to default`);
    } catch (error) {
      console.error('Error resetting section:', error);
      toast.error('Failed to reset settings');
      throw error;
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      refreshSettings,
      updateSettings,
      uploadLogo,
      resetSection
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// src/context/AddressContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import addressService from '../services/address.service';
import { useAuth } from './AuthContext'; 
import { IAddress, IAddressFormData, IAddressError } from '../types/address.types';
import toast from 'react-hot-toast';

interface AddressContextType {
  addresses: IAddress[];
  loading: boolean;
  error: IAddressError | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (addressData: IAddressFormData) => Promise<{ success: boolean; data?: IAddress; error?: string }>;
  updateAddress: (id: string, addressData: Partial<IAddressFormData>) => Promise<{ success: boolean; data?: IAddress; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (id: string) => Promise<{ success: boolean; data?: IAddress; error?: string }>;
  getDefaultAddress: () => IAddress | undefined;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

interface AddressProviderProps {
  children: ReactNode;
}

export const useAddress = (): AddressContextType => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

export const AddressProvider: React.FC<AddressProviderProps> = ({ children }) => {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<IAddressError | null>(null);
  const { user } = useAuth(); // ✅ Now this will work

  const fetchAddresses = useCallback(async () => {
    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await addressService.getUserAddresses();
      setAddresses(data);
    } catch (err) {
      const error = err as IAddressError;
      setError(error);
      toast.error(error.message || 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (addressData: IAddressFormData) => {
    try {
      const data = await addressService.createAddress(addressData);
      
      if (addressData.isDefault) {
        setAddresses(prev => prev.map(addr => ({
          ...addr,
          isDefault: false
        })));
      }
      
      setAddresses(prev => [...prev, data]);
      toast.success('Address added successfully');
      return { success: true, data };
    } catch (err) {
      const error = err as IAddressError;
      toast.error(error.message || 'Failed to add address');
      return { success: false, error: error.message };
    }
  };

  const updateAddress = async (id: string, addressData: Partial<IAddressFormData>) => {
    try {
      const data = await addressService.updateAddress(id, addressData);
      
      setAddresses(prev => prev.map(addr => {
        if (addr._id === id) {
          return data;
        }
        if (addressData.isDefault) {
          return { ...addr, isDefault: false };
        }
        return addr;
      }));
      
      toast.success('Address updated successfully');
      return { success: true, data };
    } catch (err) {
      const error = err as IAddressError;
      toast.error(error.message || 'Failed to update address');
      return { success: false, error: error.message };
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      await addressService.deleteAddress(id);
      setAddresses(prev => prev.filter(addr => addr._id !== id));
      toast.success('Address deleted successfully');
      return { success: true };
    } catch (err) {
      const error = err as IAddressError;
      toast.error(error.message || 'Failed to delete address');
      return { success: false, error: error.message };
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      const data = await addressService.setDefaultAddress(id);
      
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr._id === id
      })));
      
      toast.success('Default address updated');
      return { success: true, data };
    } catch (err) {
      const error = err as IAddressError;
      toast.error(error.message || 'Failed to set default address');
      return { success: false, error: error.message };
    }
  };

  const getDefaultAddress = useCallback((): IAddress | undefined => {
    return addresses.find(addr => addr.isDefault) || addresses[0];
  }, [addresses]);

  const value: AddressContextType = {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
  };

  return (
    <AddressContext.Provider value={value}>
      {children}
    </AddressContext.Provider>
  );
};
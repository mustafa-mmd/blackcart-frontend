// src/hooks/useAddressForm.ts
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { IAddress, IAddressFormData, AddressType } from '../types/address.types';
import { validateAddress } from '../utils/addressValidators';

interface UseAddressFormProps {
  initialData?: IAddress | null;
  onSubmit: (data: IAddressFormData) => Promise<{ success: boolean; data?: IAddress; error?: string }>; // ✅ FIX: Add return type
}

interface UseAddressFormReturn {
  formData: IAddressFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void; // ✅ FIX: Add TextArea
  handleTypeChange: (type: AddressType) => void;
  handleCheckboxChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  resetForm: () => void;
  setFormData: React.Dispatch<React.SetStateAction<IAddressFormData>>;
}

const defaultFormData: IAddressFormData = {
  type: 'home',
  name: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  postalCode: '',
  country: 'Pakistan',
  isDefault: false
};

export const useAddressForm = ({ initialData, onSubmit }: UseAddressFormProps): UseAddressFormReturn => {
  const [formData, setFormData] = useState<IAddressFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type,
        name: initialData.name,
        phone: initialData.phone,
        address: initialData.address,
        city: initialData.city,
        province: initialData.province,
        postalCode: initialData.postalCode || '',
        country: initialData.country || 'Pakistan',
        isDefault: initialData.isDefault
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [initialData]);

  // ✅ FIX: Handle textarea as well
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleTypeChange = (type: AddressType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateAddress(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(formData);
      if (result?.success) {
        // Optionally reset form on success
        // resetForm();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(initialData ? {
      type: initialData.type,
      name: initialData.name,
      phone: initialData.phone,
      address: initialData.address,
      city: initialData.city,
      province: initialData.province,
      postalCode: initialData.postalCode || '',
      country: initialData.country || 'Pakistan',
      isDefault: initialData.isDefault
    } : defaultFormData);
    setErrors({});
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleTypeChange,
    handleCheckboxChange,
    handleSubmit,
    resetForm,
    setFormData
  };
};
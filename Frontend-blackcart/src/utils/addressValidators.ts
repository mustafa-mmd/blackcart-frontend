// src/utils/addressValidators.ts
import { IAddressFormData } from '../types/address.types';

export const validateAddress = (data: IAddressFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'Full name is required';
  } else if (data.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters';
  }

  // Phone validation (Pakistan format)
  if (!data.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else {
    const cleanPhone = data.phone.replace(/\s/g, '');
    const phoneRegex = /^(?:\+92|0|92)?[0-9]{10}$/;
    if (!phoneRegex.test(cleanPhone)) {
      errors.phone = 'Please enter a valid Pakistan phone number (e.g., 03001234567)';
    }
  }

  // Address validation
  if (!data.address?.trim()) {
    errors.address = 'Street address is required';
  } else if (data.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters';
  }

  // City validation
  if (!data.city?.trim()) {
    errors.city = 'City is required';
  }

  // Province validation
  if (!data.province) {
    errors.province = 'Please select a province';
  }

  // Postal code validation (optional but must be 5 digits if provided)
  if (data.postalCode?.trim()) {
    const postalRegex = /^\d{5}$/;
    if (!postalRegex.test(data.postalCode.trim())) {
      errors.postalCode = 'Postal code must be 5 digits';
    }
  }

  return errors;
};
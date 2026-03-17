// src/types/address.types.ts
export type AddressType = 'home' | 'office' | 'other';

export interface IAddress {
  _id: string;
  type: AddressType;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IAddressFormData {
  type: AddressType;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface IAddressError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}
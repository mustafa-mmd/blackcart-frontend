import api from './api';
import { IAddress, IAddressFormData } from '../types/address.types';
import { AxiosError } from 'axios';

class AddressService {
  private baseUrl = '/addresses';

  // Transform frontend data to backend format
  private toBackendFormat(data: IAddressFormData) {
    return {
      type: data.type,
      name: data.name,
      fullName: data.name, // Send name as fullName for backend
      phone: data.phone,
      address: data.address,
      city: data.city,
      province: data.province,
      postalCode: data.postalCode,
      country: data.country,
      isDefault: data.isDefault
    };
  }

  // Transform backend data to frontend format
  private toFrontendFormat(data: any): IAddress {
    if (!data) {
      throw new Error('No data to transform');
    }
    
    return {
      _id: data._id || '',
      type: data.type || 'home',
      name: data.fullName || data.name || '', // Prefer fullName from backend
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      province: data.province || '',
      postalCode: data.postalCode || '',
      country: data.country || 'Pakistan',
      isDefault: data.isDefault || false,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  }

  private extractData<T>(response: any): T {
    return response.data?.data || response.data;
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      const status = error.response?.status;
      const data = error.response?.data;
      
      console.error('Address Service Error:', {
        status,
        data,
        message,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Throw a more detailed error
      const errorMessage = data?.errors ? data.errors.join(', ') : (data?.message || message || 'Request failed');
      throw new Error(errorMessage);
    }
    throw error;
  }

  async getUserAddresses(): Promise<IAddress[]> {
    try {
      const response = await api.get(this.baseUrl);
      const data = this.extractData<any[]>(response);
      return Array.isArray(data) ? data.map(item => this.toFrontendFormat(item)) : [];
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAddressById(id: string): Promise<IAddress> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      const data = this.extractData<any>(response);
      return this.toFrontendFormat(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createAddress(data: IAddressFormData): Promise<IAddress> {
    try {
      console.log('📍 Creating address with data:', data);
      const backendData = this.toBackendFormat(data);
      console.log('📍 Backend data:', backendData);
      
      const response = await api.post(this.baseUrl, backendData);
      console.log('📍 Create response:', response.data);
      
      const responseData = this.extractData<any>(response);
      return this.toFrontendFormat(responseData);
    } catch (error) {
      console.error('❌ Create address error:', error);
      return this.handleError(error);
    }
  }

  async updateAddress(id: string, data: Partial<IAddressFormData>): Promise<IAddress> {
    try {
      console.log('📍 Updating address:', id, 'with data:', data);
      const backendData = this.toBackendFormat(data as IAddressFormData);
      
      const response = await api.put(`${this.baseUrl}/${id}`, backendData);
      console.log('📍 Update response:', response.data);
      
      const responseData = this.extractData<any>(response);
      return this.toFrontendFormat(responseData);
    } catch (error) {
      console.error('❌ Update address error:', error);
      return this.handleError(error);
    }
  }

  async deleteAddress(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      this.handleError(error);
    }
  }

  async setDefaultAddress(id: string): Promise<IAddress> {
    try {
      console.log('📍 Setting default address:', id);
      const response = await api.patch(`${this.baseUrl}/${id}/default`);
      console.log('✅ Set default response:', response.data);
      
      const responseData = this.extractData<any>(response);
      return this.toFrontendFormat(responseData);
    } catch (error) {
      console.error('❌ Set default error:', error);
      return this.handleError(error);
    }
  }
}

export default new AddressService();
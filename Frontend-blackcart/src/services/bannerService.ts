import api from './api';

export interface HeroBanner {
  _id: string;
  url: string;
  public_id: string;
  mobileUrl?: string;
  mobilePublicId?: string;
  title: string;
  link: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

class BannerService {
  // Get active banners for public display
  async getBanners(): Promise<HeroBanner[]> {
    const response = await api.get('/banners');
    return response.data.data || [];
  }

  // Get all banners for admin panel
  async getAdminBanners(): Promise<HeroBanner[]> {
    const response = await api.get('/banners/admin');
    return response.data.data || [];
  }

  // Create a new banner (admin only)
  async createBanner(formData: FormData): Promise<HeroBanner> {
    const response = await api.post('/banners/admin', formData);
    return response.data.data;
  }

  // Update metadata and/or either responsive image (admin only)
  async updateBanner(id: string, data: FormData | Partial<Omit<HeroBanner, '_id' | 'url' | 'public_id'>>): Promise<HeroBanner> {
    const response = await api.put(`/banners/admin/${id}`, data);
    return response.data.data;
  }

  // Delete a banner (admin only)
  async deleteBanner(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/banners/admin/${id}`);
    return response.data;
  }
}

export default new BannerService();

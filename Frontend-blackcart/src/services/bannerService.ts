import api from './api';

export type BannerType = 'homepage' | 'category' | 'promotion' | 'announcement' | 'popup';
export type BannerStatus = 'draft' | 'active' | 'scheduled' | 'disabled';
export type TextAlignment = 'left' | 'center' | 'right';

export interface HeroBanner {
  _id: string;
  type: BannerType;
  status: BannerStatus;
  effectiveStatus?: BannerStatus;
  name: string;
  internalName?: string;
  description?: string;
  category?: string | null;
  categoryName?: string;
  url: string;
  public_id: string;
  mobileUrl?: string;
  mobilePublicId?: string;
  title: string;
  headline?: string;
  subheading?: string;
  buttonText?: string;
  link: string;
  buttonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  overlayEnabled?: boolean;
  overlayOpacity?: number;
  overlayColor?: string;
  textAlignment?: TextAlignment;
  textColor?: string;
  startAt?: string | null;
  endAt?: string | null;
  altText?: string;
  accessibilityLabel?: string;
  isActive: boolean;
  order: number;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerFilters {
  type?: BannerType | 'all';
  status?: BannerStatus | 'all';
  search?: string;
  sort?: 'newest' | 'oldest' | 'priority' | 'category' | 'name';
}

class BannerService {
  async getBanners(params?: { type?: BannerType; category?: string }): Promise<HeroBanner[]> {
    const response = await api.get('/banners', { params });
    return response.data.data || [];
  }

  async getAdminBanners(filters?: BannerFilters): Promise<HeroBanner[]> {
    const response = await api.get('/banners/admin', { params: filters });
    return response.data.data || [];
  }

  async createBanner(formData: FormData): Promise<HeroBanner> {
    const response = await api.post('/banners/admin', formData);
    return response.data.data;
  }

  async updateBanner(id: string, data: FormData | Partial<HeroBanner>): Promise<HeroBanner> {
    const response = await api.put(`/banners/admin/${id}`, data);
    return response.data.data;
  }

  async duplicateBanner(id: string): Promise<HeroBanner> {
    const response = await api.post(`/banners/admin/${id}/duplicate`);
    return response.data.data;
  }

  async reorderBanners(items: Array<{ id: string; priority: number }>): Promise<void> {
    await api.put('/banners/admin/reorder', { items });
  }

  async bulkAction(action: 'activate' | 'disable' | 'delete' | 'duplicate', ids: string[]): Promise<void> {
    await api.post('/banners/admin/bulk', { action, ids });
  }

  async deleteBanner(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/banners/admin/${id}`);
    return response.data;
  }
}

export default new BannerService();

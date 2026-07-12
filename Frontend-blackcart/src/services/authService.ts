import { api } from './api';
import type { LoginFormData, User } from '../types';

type AdminAuthResponse = {
  success: boolean;
  message: string;
  data: User & { token: string };
};

export const authService = {
  login: async (data: LoginFormData): Promise<AdminAuthResponse> => {
    const response = await api.post<AdminAuthResponse>('/auth/login', data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common.Authorization;
    }
  },
};

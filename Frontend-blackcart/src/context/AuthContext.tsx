import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';
import { api, clearAuthData } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const applyToken = (token: string) => {
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  localStorage.setItem('token', cleanToken);
  api.defaults.headers.common.Authorization = `Bearer ${cleanToken}`;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    try {
      const parsed = storedUser ? JSON.parse(storedUser) as User : null;
      if (token && parsed?.role === 'admin') {
        applyToken(token);
        setUser(parsed);
      } else if (token || storedUser) {
        // Customer accounts are no longer part of the storefront.
        clearAuthData();
      }
    } catch {
      clearAuthData();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      if (result.data.role !== 'admin') {
        clearAuthData();
        throw new Error('Access denied. Admin privileges required.');
      }
      const { token, ...adminUser } = result.data;
      applyToken(token);
      localStorage.setItem('user', JSON.stringify(adminUser));
      setUser(adminUser as User);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      clearAuthData();
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    loading,
    isLoading: loading,
    isAuthenticated: Boolean(user),
    login,
    logout,
    isAdmin: () => user?.role === 'admin',
  }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import { io } from 'socket.io-client';
import api from './api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  data: any;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  recommendations: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

class NotificationService {
  private socket: any = null;
  private listeners: Map<string, Function[]> = new Map();
  private userId: string | null = null;

  // Initialize socket connection
  connectSocket(userId: string) {
    this.userId = userId;
    
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    console.log('🔌 Connecting to socket server at:', API_URL);
    
    this.socket = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully with ID:', this.socket.id);
      if (this.userId) {
        this.socket.emit('join-user-room', this.userId);
        console.log('👤 Joined user room:', this.userId);
      }
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('❌ Socket connection error:', error.message);
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('🔌 Socket disconnected. Reason:', reason);
    });

    this.socket.on('notification', (notification: Notification) => {
      console.log('📨 New notification received via socket:', notification);
      this.emit('notification', notification);
    });

    this.socket.on('notification-read', (data: { id: string }) => {
      console.log('📖 Notification read via socket:', data);
      this.emit('notification-read', data);
    });

    this.socket.on('notification-deleted', (data: { id: string }) => {
      console.log('🗑️ Notification deleted via socket:', data);
      this.emit('notification-deleted', data);
    });

    this.socket.on('all-notifications-read', () => {
      console.log('📚 All notifications read via socket');
      this.emit('all-notifications-read');
    });

    this.socket.on('notifications-cleared', () => {
      console.log('🧹 All notifications cleared via socket');
      this.emit('notifications-cleared');
    });
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect socket
  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      console.log('🔌 Socket disconnected manually');
    }
  }

  // Event emitter
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  // API calls
  async getNotifications(page = 1, limit = 20, type?: string) {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    
    const response = await api.get(`/notifications?${params}`);
    return response.data.data;
  }

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.unreadCount;
  }

  async markAsRead(notificationId: string) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data.data;
  }

  async markAllAsRead() {
    const response = await api.put('/notifications/read-all');
    return response.data.data;
  }

  async deleteNotification(notificationId: string) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  async clearAllNotifications() {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  }

  async getPreferences() {
    const response = await api.get('/notifications/preferences');
    return response.data.data;
  }

  async updatePreferences(preferences: NotificationPreferences) {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data.data;
  }
}

// Create and export a single instance
const notificationServiceInstance = new NotificationService();
export default notificationServiceInstance;
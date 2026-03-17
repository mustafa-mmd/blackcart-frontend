import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../services/notificationService';
import { Notification } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (page?: number) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  hasMore: boolean;
  currentPage: number;
  socketConnected: boolean;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch initial unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      if (isMountedRef.current) {
        setUnreadCount(count);
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
    }
  }, []);

  // Refresh all notifications
  const refreshNotifications = useCallback(async () => {
    if (!user || !isMountedRef.current) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(1, 20);
      if (isMountedRef.current) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
        setCurrentPage(data.pagination.page);
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Fetch notifications with pagination
  const fetchNotifications = useCallback(async (page = 1) => {
    if (!user || !isMountedRef.current) return;
    
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(page, 20);
      
      if (isMountedRef.current) {
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        
        setUnreadCount(data.unreadCount);
        setCurrentPage(data.pagination.page);
        setHasMore(data.pagination.page < data.pagination.pages);
      }
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [user]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    if (!isMountedRef.current) return;
    
    try {
      await notificationService.markAsRead(id);
      
      if (isMountedRef.current) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      await notificationService.markAllAsRead();
      
      if (isMountedRef.current) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error marking all as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!isMountedRef.current) return;
    
    try {
      await notificationService.deleteNotification(id);
      
      if (isMountedRef.current) {
        setNotifications(prev => {
          const deleted = prev.find(n => n._id === id);
          if (deleted && !deleted.read) {
            setUnreadCount(prev => prev - 1);
          }
          return prev.filter(n => n._id !== id);
        });
      }
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, []);

  // Clear all
  const clearAll = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      await notificationService.clearAllNotifications();
      
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }, []);

  // Monitor socket connection
  const checkSocketConnection = useCallback(() => {
    const connected = notificationService.isConnected();
    setSocketConnected(connected);
    return connected;
  }, []);

  // Set up socket listeners and connection monitoring
  useEffect(() => {
    if (!user) {
      return;
    }

    // Connect socket
    notificationService.connectSocket(user._id);
    
    // Check connection status immediately
    const initialCheck = setTimeout(() => {
      checkSocketConnection();
    }, 1000);

    // Monitor connection status every 5 seconds
    const connectionInterval = setInterval(() => {
      checkSocketConnection();
    }, 5000);

    // Socket event handlers
    const handleNewNotification = (notification: Notification) => {
      if (isMountedRef.current) {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleNotificationRead = (data: { id: string }) => {
      if (isMountedRef.current) {
        setNotifications(prev =>
          prev.map(n => n._id === data.id ? { ...n, read: true } : n)
        );
      }
    };

    const handleNotificationDeleted = (data: { id: string }) => {
      if (isMountedRef.current) {
        setNotifications(prev => {
          const filtered = prev.filter(n => n._id !== data.id);
          const deleted = prev.find(n => n._id === data.id);
          if (deleted && !deleted.read) {
            setUnreadCount(prev => prev - 1);
          }
          return filtered;
        });
      }
    };

    const handleAllNotificationsRead = () => {
      if (isMountedRef.current) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      }
    };

    const handleNotificationsCleared = () => {
      if (isMountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    // Register event listeners
    notificationService.on('notification', handleNewNotification);
    notificationService.on('notification-read', handleNotificationRead);
    notificationService.on('notification-deleted', handleNotificationDeleted);
    notificationService.on('all-notifications-read', handleAllNotificationsRead);
    notificationService.on('notifications-cleared', handleNotificationsCleared);

    // Fetch initial data
    fetchUnreadCount();
    fetchNotifications(1);

    // Cleanup
    return () => {
      clearTimeout(initialCheck);
      clearInterval(connectionInterval);
      
      notificationService.off('notification', handleNewNotification);
      notificationService.off('notification-read', handleNotificationRead);
      notificationService.off('notification-deleted', handleNotificationDeleted);
      notificationService.off('all-notifications-read', handleAllNotificationsRead);
      notificationService.off('notifications-cleared', handleNotificationsCleared);
    };
  }, [user, fetchNotifications, fetchUnreadCount, checkSocketConnection]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    hasMore,
    currentPage,
    socketConnected,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
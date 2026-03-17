import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  ArrowLeft,
  Loader
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    hasMore,
    currentPage
  } = useNotifications();

  const observer = useRef<IntersectionObserver>();
  const lastNotificationRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchNotifications(currentPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, currentPage, fetchNotifications]
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    if (notification.data?.orderId) {
      navigate(`/orders/${notification.data.orderId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-lg section-padding">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <span className="ml-3 px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-primary-600 hover:text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors flex items-center"
                >
                  <CheckCheck className="h-5 w-5 mr-2" />
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex items-center"
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {notifications.length === 0 && !loading ? (
            <div className="py-16 text-center">
              <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500">
                When you get notifications, they'll appear here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification, index) => (
                <div
                  key={notification._id}
                  ref={index === notifications.length - 1 ? lastNotificationRef : undefined}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary-600 rounded-full"></span>
                          )}
                        </h4>
                        <span className="text-sm text-gray-400">
                          {format(new Date(notification.createdAt), 'PPP p')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">
                        {notification.message}
                      </p>
                      
                      {notification.data?.orderId && (
                        <div className="flex items-center text-sm text-primary-600">
                          <span>View Order Details →</span>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="p-8 text-center">
                  <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
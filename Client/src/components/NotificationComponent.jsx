import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { notificationAPI } from '../lib/api';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ArrowDownLeft, 
  ArrowUpRight,
  Receipt,
  Zap,
  Smartphone,
  CreditCard,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';

const NotificationComponent = ({ onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // Fetch notifications from backend and auto-mark as read
  useEffect(() => {
    const initializeNotifications = async () => {
      await fetchNotifications();
      await fetchUnreadCount();
      await autoMarkAllAsRead();
    };
    
    initializeNotifications();
  }, []);

  // Separate effect for filter changes
  useEffect(() => {
    if (filter !== 'all') {
      fetchNotifications();
    }
  }, [filter]);

  // Auto-mark all notifications as read when panel opens
  const autoMarkAllAsRead = async () => {
    try {
      const countResponse = await notificationAPI.getUnreadCount();
      if (countResponse.success && countResponse.data.unreadCount > 0) {
        await notificationAPI.markAllAsRead();
        setUnreadCount(0);
        
        // Update local notifications state
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        
        // Dispatch event to update Dashboard count
        const event = new CustomEvent('notificationsViewed');
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error auto-marking notifications as read:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1,
        limit: 50,
        ...(filter === 'unread' && { isRead: false }),
        ...(filter === 'transaction' && { type: 'transaction' }),
        ...(filter === 'success' && { type: 'success' })
      };
      
      const response = await notificationAPI.getNotifications(params);
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      } else {
        setError('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diff = now - notificationTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getNotificationIcon = (type, metadata) => {
    switch (type) {
      case 'transaction':
        if (metadata?.transactionType === 'money_received') {
          return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
        } else if (metadata?.transactionType === 'money_sent') {
          return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
        } else if (metadata?.transactionType === 'wallet_topup') {
          return <DollarSign className="w-5 h-5 text-green-600" />;
        }
        return <Receipt className="w-5 h-5 text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'success':
        return { bgColor: 'bg-green-50', borderColor: 'border-green-200' };
      case 'warning':
        return { bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
      case 'error':
        return { bgColor: 'bg-red-50', borderColor: 'border-red-200' };
      case 'transaction':
        return { bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
      default:
        return { bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle money request notifications
    if (notification.type === 'money_request' || 
        (notification.metadata && notification.metadata.type === 'money_request')) {
      // Navigate to money request component with received tab
      const event = new CustomEvent('navigateToMoneyRequest', { 
        detail: { tab: 'received' } 
      });
      window.dispatchEvent(event);
      return;
    }

    // Handle other notification types here if needed
    // For example, transaction notifications could navigate to transaction history
    if (notification.type === 'transaction') {
      // Could navigate to specific transaction details
      console.log('Transaction notification clicked:', notification);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'transaction') return notif.type === 'transaction';
    if (filter === 'success') return notif.type === 'success';
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-96 bg-white h-full shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Notifications</h2>
                <p className="text-purple-100 text-sm">
                  {unreadCount} unread notifications
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: notifications.length },
              { key: 'unread', label: 'Unread', count: unreadCount },
              { key: 'transaction', label: 'Transfers', count: notifications.filter(n => n.type === 'transaction').length },
              { key: 'success', label: 'Success', count: notifications.filter(n => n.type === 'success').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        {unreadCount > 0 && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <button
              onClick={markAllAsRead}
              className="text-sm text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-gray-600">Loading notifications...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4 text-center p-6">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load notifications</h3>
                <p className="text-sm text-gray-500 mb-4">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  const icon = getNotificationIcon(notification.type, notification.metadata);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${style.bgColor} border ${style.borderColor}`}>
                          {icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-sm font-medium ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          
                          {/* Show amount for transaction notifications */}
                          {notification.metadata?.amount && (
                            <div className="mt-2">
                              <span className={`text-sm font-semibold ${
                                notification.metadata.transactionType === 'money_received' || 
                                notification.metadata.transactionType === 'wallet_topup'
                                  ? 'text-green-600' 
                                  : 'text-red-600'
                              }`}>
                                {notification.metadata.transactionType === 'money_received' || 
                                 notification.metadata.transactionType === 'wallet_topup' ? '+' : '-'}
                                ₹{Math.abs(notification.metadata.amount).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-sm text-gray-500">
                  {filter === 'all' 
                    ? "You're all caught up! No new notifications." 
                    : `No ${filter} notifications found.`
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            <button 
              onClick={fetchNotifications}
              className="text-purple-600 font-medium hover:text-purple-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
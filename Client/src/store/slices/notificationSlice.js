import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';

// Async thunks for notification operations
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notification');
    }
  }
);

// Helper function to create notifications from transactions
export const createTransactionNotification = (transaction, user) => {
  const isIncoming = transaction.amount > 0;
  const amount = Math.abs(transaction.amount);
  
  if (isIncoming) {
    return {
      id: `txn_${transaction.id}_${Date.now()}`,
      type: 'money_received',
      title: 'Money Received',
      message: `You received ₹${amount.toLocaleString()} from ${transaction.beneficiaryName || 'Unknown'}`,
      amount: amount,
      timestamp: new Date(transaction.createdAt),
      isRead: false,
      icon: 'money_received',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      transaction: transaction
    };
  } else {
    return {
      id: `txn_${transaction.id}_${Date.now()}`,
      type: 'money_sent',
      title: 'Payment Successful',
      message: `You sent ₹${amount.toLocaleString()} to ${transaction.beneficiaryName || 'Unknown'}`,
      amount: -amount,
      timestamp: new Date(transaction.createdAt),
      isRead: false,
      icon: 'money_sent',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      transaction: transaction
    };
  }
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      const notification = action.payload;
      // Add to beginning of array (most recent first)
      state.notifications.unshift(notification);
      // Update unread count
      if (!notification.isRead) {
        state.unreadCount += 1;
      }
      // Keep only last 50 notifications to prevent memory issues
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    markAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsReadLocal: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
      state.unreadCount = 0;
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(notificationIndex, 1);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    // Add mock notifications for demo purposes
    initializeMockNotifications: (state) => {
      const mockNotifications = [
        {
          id: 'bill_due_1',
          type: 'bill_due',
          title: 'Bill Payment Due',
          message: 'Your Electricity bill of ₹1,245 is due tomorrow',
          amount: 1245,
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          isRead: false,
          icon: 'bill_due',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        },
        {
          id: 'bill_reminder_1',
          type: 'bill_reminder',
          title: 'Upcoming Bill Reminder',
          message: 'Your DTH bill of ₹350 is due in 3 days',
          amount: 350,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          isRead: false,
          icon: 'bill_reminder',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        },
        {
          id: 'security_alert_1',
          type: 'security_alert',
          title: 'Security Alert',
          message: 'New device login detected from Chrome on Windows',
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), // 18 hours ago
          isRead: false,
          icon: 'security_alert',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        },
        {
          id: 'kyc_update_1',
          type: 'kyc_update',
          title: 'KYC Verification',
          message: 'Your KYC documents are under review. We\'ll update you soon.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          isRead: true,
          icon: 'kyc_update',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        }
      ];
      
      // Only add mock notifications if there are none
      if (state.notifications.length === 0) {
        state.notifications = mockNotifications;
        state.unreadCount = mockNotifications.filter(n => !n.isRead).length;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure we always have an array
        const notifications = Array.isArray(action.payload.data) ? action.payload.data : 
                            Array.isArray(action.payload) ? action.payload : [];
        state.notifications = notifications;
        state.unreadCount = notifications.filter(n => !n.isRead).length;
      })
      .addCase(getNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Mark as Read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notificationId = action.meta.arg;
        const notification = state.notifications.find(n => n.id === notificationId);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Mark All as Read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.isRead = true;
        });
        state.unreadCount = 0;
      })
      
      // Delete Notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notificationIndex = state.notifications.findIndex(n => n.id === notificationId);
        if (notificationIndex !== -1) {
          const notification = state.notifications[notificationIndex];
          if (!notification.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
          state.notifications.splice(notificationIndex, 1);
        }
      });
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsReadLocal, 
  removeNotification, 
  clearError,
  initializeMockNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
import axios from 'axios';

// Centralized API Configuration - Change backend URL only here!
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://nexus-pay-fintech-application-mx5y.vercel.app/api/v1';

// Create a single axios instance that all store slices will use
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Set auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      // Optionally redirect to login page or dispatch logout action
    }
    return Promise.reject(error);
  }
);

// Function to display current API URL in console for debugging
export const logCurrentAPIUrl = () => {
  console.log('🌐 Current API Base URL:', API_BASE_URL);
  console.log('🔗 Full API URL will be:', `${API_BASE_URL}/[endpoint]`);
};

// Call this on app start to show which server we're connecting to
logCurrentAPIUrl();

// Notification API endpoints
export const notificationAPI = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 20,
      ...(params.type && { type: params.type }),
      ...(params.isRead !== undefined && { isRead: params.isRead })
    });
    
    const response = await fetch(`${API_BASE_URL}/notifications?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }
    
    return response.json();
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return response.json();
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    return response.json();
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
    
    return response.json();
  }
};

// Money Request API functions
export const moneyRequestAPI = {
  // Create a money request
  createRequest: async (requestData) => {
    const response = await fetch(`${API_BASE_URL}/money-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(requestData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create money request');
    }
    
    return response.json();
  },

  // Get money requests
  getRequests: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/money-requests?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch money requests');
    }
    
    return response.json();
  },

  // Pay a money request
  payRequest: async (requestId, mpin) => {
    const response = await fetch(`${API_BASE_URL}/money-requests/${requestId}/pay`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ mpin }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to pay money request');
    }
    
    return response.json();
  },

  // Decline a money request
  declineRequest: async (requestId, reason) => {
    const response = await fetch(`${API_BASE_URL}/money-requests/${requestId}/decline`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ reason }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to decline money request');
    }
    
    return response.json();
  },

  // Cancel a money request
  cancelRequest: async (requestId) => {
    const response = await fetch(`${API_BASE_URL}/money-requests/${requestId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to cancel money request');
    }
    
    return response.json();
  },

  // Get money request statistics
  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/money-requests/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch money request statistics');
    }
    
    return response.json();
  },

  // Get pending requests count
  getPendingCount: async () => {
    const response = await fetch(`${API_BASE_URL}/money-requests?type=received&status=pending&limit=1`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pending requests count');
    }
    
    const data = await response.json();
    return { success: true, count: data.data.pagination.total };
  }
};
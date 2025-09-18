import { Bell, Menu, Shield, LogOut, CheckCircle, AlertTriangle, ArrowDownLeft, ArrowUpRight, Receipt, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { notificationAPI } from '../lib/api';

const CollapsibleSidebar = ({ 
  user, 
  balance, 
  loading, 
  menuItems, 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed, 
  currentUnreadCount, 
  setShowNotifications, 
  handleLogout 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  // Fetch notifications for sidebar
  useEffect(() => {
    fetchRecentNotifications();
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const params = {
        page: 1,
        limit: sidebarCollapsed ? 3 : 5, // Show fewer when collapsed
      };
      
      const response = await notificationAPI.getNotifications(params);
      
      if (response.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const getNotificationIcon = (type, metadata) => {
    switch (type) {
      case 'transaction':
        if (metadata?.transactionType === 'money_received') {
          return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
        } else if (metadata?.transactionType === 'money_sent') {
          return <ArrowUpRight className="w-4 h-4 text-blue-600" />;
        } else if (metadata?.transactionType === 'wallet_topup') {
          return <DollarSign className="w-4 h-4 text-green-600" />;
        }
        return <Receipt className="w-4 h-4 text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning':
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
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
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      return `${days}d`;
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
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className={`${sidebarCollapsed ? 'w-20' : 'w-80'} bg-white shadow-xl flex flex-col flex-shrink-0 fixed left-0 top-20 h-[calc(100vh-5rem)] transition-all duration-300 z-30`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900 text-lg">{user?.fullName || 'User'}</p>
            </div>
          </div>
        )}
        
        {/* Toggle Button */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium rounded-xl transition-colors relative group ${
                  activeTab === item.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className={`${sidebarCollapsed ? '' : 'mr-3'} text-lg`}>{item.icon}</span>
                {!sidebarCollapsed && item.label}
                
                {/* Tooltip for collapsed mode */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
        
        {/* Simple Notifications Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {!sidebarCollapsed && (
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Notifications</h4>
          )}
          
          <button 
            onClick={() => setShowNotifications(true)}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors relative group`}
            title={sidebarCollapsed ? 'Notifications' : ''}
          >
            <div className={`${sidebarCollapsed ? '' : 'mr-3'} text-lg relative`}>
              <Bell />
            
            </div>
            {!sidebarCollapsed && (
              <>
                Notifications
                {currentUnreadCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center font-medium">
                    {currentUnreadCount}
                  </span>
                )}
              </>
            )}
            
            {/* Tooltip for collapsed mode */}
            {sidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Notifications {currentUnreadCount > 0 && `(${currentUnreadCount})`}
              </div>
            )}
          </button>
        </div>

        {/* Additional Menu Items */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {!sidebarCollapsed && (
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</h4>
          )}
          <ul className="space-y-2">
            <li>
              <button 
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors relative group`}
                title={sidebarCollapsed ? 'Security' : ''}
              >
                <Shield className={`${sidebarCollapsed ? '' : 'mr-3'} text-lg`} />
                {!sidebarCollapsed && 'Security'}
                
                {/* Tooltip for collapsed mode */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Security
                  </div>
                )}
              </button>
            </li>
            <li>
              <button 
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors relative group`}
                title={sidebarCollapsed ? 'Help & Support' : ''}
              >
                <svg className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {!sidebarCollapsed && 'Help & Support'}
                
                {/* Tooltip for collapsed mode */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Help & Support
                  </div>
                )}
              </button>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors relative group`}
                title={sidebarCollapsed ? 'Logout' : ''}
              >
                <LogOut className={`${sidebarCollapsed ? '' : 'mr-3'} text-lg`} />
                {!sidebarCollapsed && 'Logout'}
                
                {/* Tooltip for collapsed mode */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    Logout
                  </div>
                )}
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* Balance Card - Only show when expanded */}
      {!sidebarCollapsed && (
        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-medium">Wallet Balance</h3>
            <p className="text-3xl font-bold mt-2">
              {loading ? '...' : `₹${balance?.toFixed(2) || '0.00'}`}
            </p>
            <p className="text-purple-100 text-sm mt-1">Available Balance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleSidebar;
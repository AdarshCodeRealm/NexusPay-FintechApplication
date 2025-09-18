import { Bell, QrCode } from 'lucide-react';

const FixedNavbar = ({ user, balance, currentUnreadCount, setShowQRCode, setShowNotifications }) => {
  return (
    <div className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Brand/Logo */}
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">N</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">NexasPay</h1>
        </div>
        
        {/* Center: Search */}
        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search transactions, bills, or contacts..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Right: Quick Actions & User */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowQRCode(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <QrCode className="w-6 h-6 text-gray-600" />
          </button>
          
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {currentUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {currentUnreadCount}
              </span>
            )}
          </button>
          
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-500">₹{balance?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedNavbar;
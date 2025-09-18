import { useState, useEffect } from 'react';
import { 
  Plus, 
  QrCode, 
  Smartphone, 
  Building, 
  User, 
  History, 
  Download, 
  Send,
  Shield,
  ArrowDownLeft,
  Wallet
} from 'lucide-react';
import { moneyRequestAPI } from '../lib/api.js';

const BalanceCard = ({ 
  balance, 
  user, 
  handleTopUpWallet, 
  handleTransferOption 
}) => {
  const [pendingRequests, setPendingRequests] = useState(0);

  // Get pending money requests count
  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await moneyRequestAPI.getPendingCount();
        if (response.success) {
          setPendingRequests(response.count);
        }
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        setPendingRequests(0); // Set to 0 on error
      }
    };

    fetchPendingRequests();
  }, []);

  return (
    <div className="md:grid md:grid-cols-4 md:gap-6 md:mb-6">
      {/* Main Balance Card - Mobile: Full width, Desktop: Spans 3 columns (smaller) */}
      <div className="balance-card md:col-span-3">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-purple-100 text-sm">Total balance</p>
            <h2 className="text-3xl md:text-2xl lg:text-3xl font-bold text-white">
              ₹{balance?.toFixed(2) || '1000.00'}
            </h2>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleTopUpWallet}
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 text-white hover:bg-white/30 transition-all border border-white/20 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Money</span>
            </button>
            <button 
              onClick={() => handleTransferOption('shortcut')}
              className="flex items-center space-x-2 bg-purple-600 rounded-xl px-4 py-2 text-white hover:bg-purple-700 transition-all text-sm"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Pay</span>
            </button>
          </div>
        </div>

        {/* Desktop: Transfer Options - Single Row with 5 icons */}
        <div className="hidden md:grid md:grid-cols-5 gap-3 mb-4">
          <button 
            onClick={() => handleTransferOption('scan')}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2 group"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">Scan & Pay</span>
          </button>

          <button 
            onClick={() => handleTransferOption('mobile')}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2 group"
          >
            <div className="w-8 h-8 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">To Mobile</span>
          </button>

          <button 
            onClick={() => handleTransferOption('bank')}
            className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2 group"
          >
            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">To Bank A/c</span>
          </button>

          <button 
            onClick={() => handleTransferOption('history')}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2 group"
          >
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <History className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">History</span>
          </button>

          <button 
            onClick={() => handleTransferOption('moneyRequests')}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2 group relative"
          >
            <div className="w-8 h-8 bg-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-4 h-4 text-white" />
            </div>
            <span className="text-white text-xs font-medium text-center">Money Requests</span>
            {/* Badge for pending requests */}
            {pendingRequests > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                {pendingRequests}
              </div>
            )}
          </button>
        </div>

        {/* Mobile: Transfer Options - Grid Layout */}
        <div className="md:hidden">
          {/* Top Row - Main Transfer Options with Self A/c added */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <button 
              onClick={() => handleTransferOption('scan')}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">Scan & Pay</span>
            </button>

            <button 
              onClick={() => handleTransferOption('mobile')}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">To Mobile</span>
            </button>

            <button 
              onClick={() => handleTransferOption('bank')}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">To Bank A/c</span>
            </button>

            <button 
              onClick={() => handleTransferOption('self')}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">Self A/c</span>
            </button>
          </div>

          {/* Bottom Row Additional Options - Balance, History, Money Requests, What's New */}
          <div className="grid grid-cols-4 gap-3">
            <button 
              onClick={() => handleTransferOption('balance')}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">Balance</span>
            </button>

            <button 
              onClick={() => handleTransferOption('history')}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <History className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">History</span>
            </button>

            <button 
              onClick={() => handleTransferOption('moneyRequests')}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2 relative"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center">
                <Send className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">Money Requests</span>
              {/* Badge for pending requests */}
              {pendingRequests > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                  {pendingRequests}
                </div>
              )}
            </button>

            <button 
              onClick={() => handleTransferOption('whats-new')}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xs font-medium text-center">What&apos;s New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Stats Card - Takes 1 column */}
      <div className="hidden md:block bg-white rounded-2xl p-3 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Only Three Compact Rows */}
        <div className="space-y-2">
          {/* KYC Status - Horizontal Row */}
          <div className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                user?.kycStatus === 'verified' ? 'bg-emerald-100' : 
                user?.kycStatus === 'pending' ? 'bg-amber-100' : 
                'bg-red-100'
              }`}>
                <Shield className={`w-3 h-3 ${
                  user?.kycStatus === 'verified' ? 'text-emerald-600' : 
                  user?.kycStatus === 'pending' ? 'text-amber-600' : 
                  'text-red-600'
                }`} />
              </div>
              <span className="text-xs font-medium text-gray-700">KYC</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              user?.kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 
              user?.kycStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {user?.kycStatus === 'verified' && '✓ Verified'}
              {user?.kycStatus === 'pending' && '⏳ Review'}
              {user?.kycStatus === 'rejected' && '✗ Rejected'}
              {!user?.kycStatus && '⚠ Review'}
            </span>
          </div>
          
          {/* Payment Request - Horizontal Row */}
          <div className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                pendingRequests > 0 ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                <Send className={`w-3 h-3 ${pendingRequests > 0 ? 'text-orange-600' : 'text-gray-500'}`} />
              </div>
              <span className="text-xs font-medium text-gray-700">Payment Request</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`text-sm font-bold ${pendingRequests > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                {pendingRequests}
              </span>
              {pendingRequests > 0 && (
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
          
          {/* Account Type - Horizontal Row */}
          <div className="flex items-center justify-between p-2 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                user?.userType === 'distributor' ? 'bg-purple-100' : 
                user?.userType === 'retailer' ? 'bg-blue-100' : 
                'bg-gray-100'
              }`}>
                <User className={`w-3 h-3 ${
                  user?.userType === 'distributor' ? 'text-purple-600' : 
                  user?.userType === 'retailer' ? 'text-blue-600' : 
                  'text-gray-500'
                }`} />
              </div>
              <span className="text-xs font-medium text-gray-700">Type</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              user?.userType === 'distributor' ? 'bg-purple-100 text-purple-800' : 
              user?.userType === 'retailer' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'
            }`}>
              {user?.userType ? user.userType.charAt(0).toUpperCase() + user.userType.slice(1) : 'User'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
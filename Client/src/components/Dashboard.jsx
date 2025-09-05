import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletBalance, getTransactionHistory } from '../store/slices/walletSlice';
import { logoutUser } from '../store/slices/authSlice';
import { Button } from './ui/button';
import WalletComponent from './WalletComponent';
import TransferComponent from './TransferComponent';
import RechargeComponent from './RechargeComponent';
import ProfileComponent from './ProfileComponent';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, loading } = useSelector((state) => state.wallet);
  
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user) {
      dispatch(getWalletBalance());
      dispatch(getTransactionHistory({ page: 1, limit: 5 }));
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: '🏠' },
    { id: 'wallet', label: 'Cards', icon: '💳' },
    { id: 'transfer', label: 'Transfers', icon: '↔️' },
    { id: 'profile', label: 'More', icon: '⋯' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletComponent />;
      case 'transfer':
        return <TransferComponent />;
      case 'recharge':
        return <RechargeComponent />;
      case 'profile':
        return <ProfileComponent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 md:bg-gradient-to-br md:from-slate-100 md:via-gray-50 md:to-zinc-100">
      {/* Mobile Header */}
      <header className="md:hidden bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm text-gray-600">Hello,</p>
                <p className="font-semibold text-gray-900">{user?.fullName || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="hidden md:flex md:min-h-screen">
        {/* Desktop Sidebar */}
        <div className="w-80 bg-white shadow-xl flex flex-col">
          {/* Desktop Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900 text-lg">{user?.fullName || 'User'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      activeTab === item.id
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Quick Balance Card */}
          <div className="p-6 border-t border-gray-200">
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-medium">Wallet Balance</h3>
              <p className="text-3xl font-bold mt-2">
                {loading ? '...' : `₹${balance?.toFixed(2) || '0.00'}`}
              </p>
              <p className="text-purple-100 text-sm mt-1">Available Balance</p>
            </div>
          </div>
        </div>

        {/* Desktop Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden max-w-md mx-auto px-4 pb-20">
        {renderContent()}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200/50">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around items-center">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

const DashboardContent = () => {
  const { user } = useSelector((state) => state.auth);
  const { balance, transactions, transactionLoading } = useSelector((state) => state.wallet);

  return (
    <div className="space-y-6 py-6">
      {/* Desktop Welcome Section */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Balance Section - Responsive */}
      <div className="md:grid md:grid-cols-3 md:gap-6 md:mb-8">
        {/* Main Balance Card - Mobile: Full width, Desktop: Spans 2 columns */}
        <div className="balance-card md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-purple-100 text-sm">Total balance</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                ₹{balance?.toFixed(2) || '8,600'}
              </h2>
            </div>
            <div className="flex space-x-2">
              <button className="action-button">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Virtual Cards Preview - Only on Mobile */}
          <div className="md:hidden space-y-3">
            <p className="text-purple-100 text-sm">CARDS</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white/80 text-xs">Salary</p>
                    <p className="text-white font-semibold text-sm">₹2,230</p>
                  </div>
                  <div className="text-white/60 text-lg">💳</div>
                </div>
                <p className="text-white/60 text-xs">** 6017</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/30 to-purple-600/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white/80 text-xs">Credit card</p>
                    <p className="text-white font-semibold text-sm">₹5,230</p>
                  </div>
                  <div className="text-white/60 text-lg">💳</div>
                </div>
                <p className="text-white/60 text-xs">** 4123</p>
              </div>
              <div className="bg-pink-500/30 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white/80 text-xs">Savings</p>
                    <p className="text-white font-semibold text-sm">₹980</p>
                  </div>
                  <div className="text-white/60 text-lg">💳</div>
                </div>
                <p className="text-white/60 text-xs">** 7891</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/20">
            <button className="flex flex-col items-center space-y-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">+</span>
              </div>
              <span className="text-white/80 text-xs">Add money</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">⏸</span>
              </div>
              <span className="text-white/80 text-xs">Freeze</span>
            </button>
            
            <button className="flex flex-col items-center space-y-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">⚙️</span>
              </div>
              <span className="text-white/80 text-xs">Settings</span>
            </button>
          </div>
        </div>

        {/* Desktop Stats Cards */}
        <div className="hidden md:block space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-xl p-3">
                <span className="text-green-600 text-2xl">📈</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">KYC Status</p>
                <p className="text-xl font-bold text-gray-900">{user?.kyc?.status || 'Pending'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-xl p-3">
                <span className="text-blue-600 text-2xl">👤</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <p className="text-xl font-bold text-gray-900">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finance Section - Mobile only */}
      <div className="md:hidden space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">FINANCE</h3>
        <div className="grid grid-cols-4 gap-4">
          <button className="flex flex-col items-center space-y-2 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-purple-600 text-lg">📊</span>
            </div>
            <span className="text-xs text-gray-600 text-center">My bonuses</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-lg">📈</span>
            </div>
            <span className="text-xs text-gray-600 text-center">Finance analysis</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-600 text-lg">💰</span>
            </div>
            <span className="text-xs text-gray-600 text-center">Payment</span>
          </button>
          
          <button className="flex flex-col items-center space-y-2 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-orange-600 text-lg">📱</span>
            </div>
            <span className="text-xs text-gray-600 text-center">Investment</span>
          </button>
        </div>
      </div>

      {/* Desktop Quick Actions Grid */}
      <div className="hidden md:grid md:grid-cols-4 md:gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-xl p-3">
              <span className="text-purple-600 text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">My Bonuses</p>
              <p className="text-sm text-gray-500">View rewards</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-xl p-3">
              <span className="text-blue-600 text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">Analytics</p>
              <p className="text-sm text-gray-500">Financial insights</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-xl p-3">
              <span className="text-green-600 text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">Payments</p>
              <p className="text-sm text-gray-500">Bill payments</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="bg-orange-100 rounded-xl p-3">
              <span className="text-orange-600 text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">Investments</p>
              <p className="text-sm text-gray-500">Portfolio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">LAST TRANSACTIONS</h3>
          <button className="text-purple-600 text-sm font-medium">See all</button>
        </div>
        
        {transactionLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <div className="space-y-3 md:bg-white md:rounded-2xl md:p-6 md:shadow-sm md:border md:border-gray-200">
            {transactions.slice(0, 3).map((transaction, index) => (
              <div key={index} className="transaction-item md:bg-gray-50 md:border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-lg ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '📥' : '📤'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description || 'Transaction'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20 md:bg-white md:shadow-sm md:border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <p className="text-gray-600 font-medium">No transaction yet</p>
            <p className="text-gray-400 text-sm mt-1">Your transactions will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
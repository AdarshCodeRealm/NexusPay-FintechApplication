import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletBalance, getTransactionHistory, generateBulkReceipt } from '../store/slices/walletSlice';
import { logoutUser } from '../store/slices/authSlice';
import { getNotifications } from '../store/slices/notificationSlice';
import { notificationAPI } from '../lib/api';
import WalletComponent from './WalletComponent';
import TransferComponent from './TransferComponent';
import RechargeComponent from './RechargeComponent';
import ProfileComponent from './ProfileComponent';
import KYCComponent from './KYCComponent';
import SecurityComponent from './SecurityComponent';
import MobileTransferComponent from './MobileTransferComponent';
import BBPSComponent from './BBPSComponent';
import TransactionHistoryComponent from './TransactionHistoryComponent';
import QRCodeComponent from './QRCodeComponent';
import NotificationComponent from './NotificationComponent';
import MoneyRequestComponent from './MoneyRequestComponent';
import FixedNavbar from './FixedNavbar';
import CollapsibleSidebar from './CollapsibleSidebar';
import BalanceCard from './BalanceCard';
import { 
  Bell, 
  QrCode, 
  Smartphone, 
  Building, 
  User, 
  History, 
  Download, 
  Plus, 
  Lightbulb,
  LogOut,
  Home,
  Wallet,
  TrendingUp,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Receipt,
  Menu
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, loading } = useSelector((state) => state.wallet);
  const { unreadCount } = useSelector((state) => state.notifications);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileTransfer, setShowMobileTransfer] = useState(false);
  const [showWalletTopup, setShowWalletTopup] = useState(false);
  const [showMoneyRequest, setShowMoneyRequest] = useState(false);
  const [moneyRequestInitialTab, setMoneyRequestInitialTab] = useState('create');
  const [selectedBBPSCategory, setSelectedBBPSCategory] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      dispatch(getWalletBalance());
      dispatch(getTransactionHistory({ page: 1, limit: 5 }));
      dispatch(getNotifications());
      fetchUnreadCount();
    }
  }, [dispatch, user]);

  // Fetch unread notification count
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.success) {
        setCurrentUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Update count when Redux state changes
  useEffect(() => {
    if (unreadCount !== undefined) {
      setCurrentUnreadCount(unreadCount);
    }
  }, [unreadCount]);

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigateToWallet = () => {
      setActiveTab('wallet');
    };

    const handleNavigateToBBPS = (event) => {
      setSelectedBBPSCategory(event.detail?.category || null);
      setActiveTab('bbps');
    };

    // Handle money request notification navigation
    const handleNavigateToMoneyRequest = (event) => {
      const { tab = 'received' } = event.detail || {};
      setMoneyRequestInitialTab(tab);
      setShowMoneyRequest(true);
      setShowNotifications(false); // Close notifications panel
    };

    window.addEventListener('navigateToWallet', handleNavigateToWallet);
    window.addEventListener('navigateToBBPS', handleNavigateToBBPS);
    window.addEventListener('navigateToMoneyRequest', handleNavigateToMoneyRequest);
    
    return () => {
      window.removeEventListener('navigateToWallet', handleNavigateToWallet);
      window.removeEventListener('navigateToBBPS', handleNavigateToBBPS);
      window.removeEventListener('navigateToMoneyRequest', handleNavigateToMoneyRequest);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Function to handle wallet top-up
  const handleTopUpWallet = () => {
    setShowWalletTopup(true);
  };

  // Simplified menu items
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { id: 'bbps', label: 'Bill Pay', icon: <Receipt className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <History className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  // Helper function to get KYC status info
  const getKYCStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" />, text: 'KYC Verified' };
      case 'submitted':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Clock className="w-4 h-4" />, text: 'KYC Under Review' };
      case 'rejected':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: <AlertTriangle className="w-4 h-4" />, text: 'KYC Rejected' };
      default:
        return { color: 'text-orange-600', bg: 'bg-orange-100', icon: <AlertTriangle className="w-4 h-4" />, text: 'KYC Pending' };
    }
  };

  const kycStatus = getKYCStatusInfo(user?.kyc?.status);

  // Function to handle transfer option clicks
  const handleTransferOption = (option) => {
    switch (option) {
      case 'scan':
        setShowQRCode(true);
        localStorage.setItem('qrCodeActiveTab', 'scan');
        break;
      case 'mobile':
        setShowMobileTransfer(true);
        break;
      case 'bank':
        setActiveTab('transfer');
        break;
      case 'history':
        setActiveTab('transactions');
        break;
      case 'receive':
        setShowQRCode(true);
        localStorage.setItem('qrCodeActiveTab', 'generate');
        break;
      case 'moneyRequests':
        setShowMoneyRequest(true);
        setMoneyRequestInitialTab('create'); // Default to create tab
        break;
      case 'shortcut':
        setShowQRCode(true);
        localStorage.setItem('qrCodeActiveTab', 'scan');
        break;
      case 'whats-new':
        console.log('What&apos;s New clicked');
        break;
      default:
        break;
    }
  };

  const renderContent = () => {
    // Show WalletComponent for top-up if wallet top-up is active
    if (showWalletTopup) {
      return <WalletComponent onBack={() => setShowWalletTopup(false)} />;
    }
    
    // Show MobileTransferComponent if mobile transfer is active
    if (showMobileTransfer) {
      return <MobileTransferComponent onBack={() => setShowMobileTransfer(false)} />;
    }

    // Show MoneyRequestComponent if money request is active
    if (showMoneyRequest) {
      return <MoneyRequestComponent 
        onBack={() => setShowMoneyRequest(false)} 
        initialTab={moneyRequestInitialTab}
      />;
    }

    // Show QRCodeComponent if QR code is active
    if (showQRCode) {
      return <QRCodeComponent onClose={() => setShowQRCode(false)} />;
    }
    
    switch (activeTab) {
      case 'wallet':
        return <WalletComponent />;
      case 'transfer':
        return <TransferComponent />;
      case 'bbps':
        return <BBPSComponent selectedCategory={selectedBBPSCategory} onBack={() => {
          setActiveTab('dashboard');
          setSelectedBBPSCategory(null);
        }} />;
      case 'recharge':
        return <RechargeComponent />;
      case 'profile':
        return <ProfileComponent />;
      case 'kyc':
        return <KYCComponent />;
      case 'security':
        return <SecurityComponent />;
      case 'transactions':
        return <TransactionHistoryComponent />;
      case 'notifications':
        return <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Notifications will be shown in the sidebar on desktop</p>
        </div>;
      default:
        return <DashboardContent 
          setShowMobileTransfer={setShowMobileTransfer} 
          handleTopUpWallet={handleTopUpWallet} 
          setActiveTab={setActiveTab} 
          setShowQRCode={setShowQRCode}
          handleTransferOption={handleTransferOption}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Top Navbar - Desktop Only */}
      <FixedNavbar 
        user={user}
        balance={balance}
        currentUnreadCount={currentUnreadCount}
        setShowQRCode={setShowQRCode}
        setShowNotifications={setShowNotifications}
      />

      {/* Mobile Header - Existing */}
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="px-4 py-3 w-full max-w-full">
          <div className="flex justify-between items-center w-full">
            {/* Left: User Profile Image - Clickable to open menu */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-1 transition-colors flex-shrink-0"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm text-gray-500 truncate">Welcome back</p>
                <p className="font-semibold text-gray-900 truncate">{user?.fullName || 'User'}</p>
              </div>
            </button>

            {/* Right: QR Code and Notifications */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button 
                onClick={() => setShowQRCode(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <QrCode className="w-6 h-6 text-gray-700" />
              </button>
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {currentUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="fixed left-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-xl transform transition-transform flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              
              {/* Mobile Sidebar Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-white/80 text-sm">Welcome back,</p>
                      <p className="font-semibold text-white text-lg">{user?.fullName || 'User'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Balance Display */}
                <div className="mt-4 bg-white/20 rounded-xl p-4">
                  <p className="text-white/80 text-sm">Available Balance</p>
                  <p className="text-2xl font-bold text-white">
                    {loading ? '...' : `₹${balance?.toFixed(2) || '0.00'}`}
                  </p>
                </div>
              </div>

              {/* Mobile Navigation Menu */}
              <nav className="flex-1 p-6">
                <ul className="space-y-3">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
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

                {/* Additional Menu Items */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Account</h4>
                  <ul className="space-y-3">
                    <li>
                      <button 
                        onClick={() => {
                          setActiveTab('security');
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                      >
                        <Shield className="mr-3 text-lg" />
                        Security
                      </button>
                    </li>
                    
                    <li>
                      <button 
                        onClick={() => {
                          setShowNotifications(true);
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                      >
                        <div className="mr-3 text-lg relative">
                          <Bell />
                          {currentUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                              {currentUnreadCount}
                            </span>
                          )}
                        </div>
                        Notifications
                      </button>
                    </li>
                    
                    <li>
                      <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help & Support
                      </button>
                    </li>
                    
                    <li>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="mr-3 text-lg" />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>

                {/* KYC Status */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className={`flex items-center p-3 rounded-xl ${kycStatus.bg}`}>
                    <div className={`${kycStatus.color} mr-3`}>
                      {kycStatus.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${kycStatus.color}`}>
                        {kycStatus.text}
                      </p>
                      {user?.kyc?.status !== 'approved' && (
                        <button 
                          onClick={() => {
                            setActiveTab('kyc');
                            setSidebarOpen(false);
                          }}
                          className="text-xs text-blue-600 font-medium hover:text-blue-700"
                        >
                          Complete KYC
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </nav>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-xs">N</span>
                    </div>
                    <span className="text-gray-900 font-semibold">NexasPay</span>
                  </div>
                  <p className="text-xs text-gray-500">Version 2.1.0</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Layout with Fixed Navbar */}
        <div className="hidden md:flex w-full pt-20">
          {/* Desktop Sidebar - Fixed Position */}
          <CollapsibleSidebar 
            user={user}
            balance={balance}
            loading={loading}
            menuItems={menuItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            currentUnreadCount={currentUnreadCount}
            setShowNotifications={setShowNotifications}
            handleLogout={handleLogout}
          />

          {/* Desktop Main Content - Scrollable with dynamic margin */}
          <div className={`flex-1 min-w-0 overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
            <div className="w-full max-w-none p-6 lg:p-8">
              <div className="w-full max-w-7xl mx-auto">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="md:hidden w-full max-w-full overflow-x-hidden">
          <div className="px-4 pb-20 w-full">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Notification Sidebar */}
      {showNotifications && (
        <NotificationComponent onClose={() => setShowNotifications(false)} />
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="px-4 py-2">
          <div className="flex justify-around items-center">
            {menuItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-blue-600 bg-blue-50'
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

// Simplified DashboardContent component
const DashboardContent = ({ setShowMobileTransfer, handleTopUpWallet, setActiveTab, setShowQRCode, handleTransferOption }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, transactions, transactionLoading, operationLoading } = useSelector((state) => state.wallet);

  // Function to handle bulk report generation
  const handleGenerateBulkReport = async () => {
    if (!transactions || transactions.length === 0) {
      alert('No transactions available to generate report');
      return;
    }

    try {
      await dispatch(generateBulkReceipt({
        transactions,
        user,
        dateRange: 'Recent Transactions'
      }));
      
      alert(`Transaction report generated successfully! (${transactions.length} transactions)`);
    } catch (error) {
      console.error('Failed to generate bulk report:', error);
      alert('Failed to generate transaction report. Please try again.');
    }
  };

  // Top 4 most popular BBPS categories for dashboard
  const popularBillCategories = [
    {
      id: 'electricity',
      name: 'Electricity',
      icon: '⚡',
      color: 'bg-yellow-500',
      description: 'Pay electricity bills',
      count: '150+ Providers'
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: '📱',
      color: 'bg-blue-500',
      description: 'Mobile postpaid bills',
      count: '25+ Operators'
    },
    {
      id: 'dth',
      name: 'DTH/Cable',
      icon: '📺',
      color: 'bg-purple-500',
      description: 'DTH & Cable TV',
      count: '15+ Providers'
    },
    {
      id: 'gas',
      name: 'Gas',
      icon: '🔥',
      color: 'bg-orange-500',
      description: 'LPG & PNG bills',
      count: '12+ Companies'
    }
  ];

  // All BBPS categories
  const allBillCategories = [
    ...popularBillCategories,
    {
      id: 'water',
      name: 'Water',
      icon: '💧',
      color: 'bg-cyan-500',
      description: 'Municipal water bills',
      count: '50+ Boards'
    },
    {
      id: 'fastag',
      name: 'FASTag',
      icon: '🚗',
      color: 'bg-green-500',
      description: 'Insurance premiums',
      count: '30+ Companies'
    },
    {
      id: 'education',
      name: 'Education',
      icon: '🎓',
      color: 'bg-indigo-500',
      description: 'School & college fees',
      count: '100+ Institutions'
    },
    {
      id: 'municipal',
      name: 'Municipal',
      icon: '🏛️',
      color: 'bg-gray-500',
      description: 'Municipal taxes',
      count: '75+ Corporations'
    },
    {
      id: 'health',
      name: 'Health',
      icon: '❤️',
      color: 'bg-pink-500',
      description: 'Health insurance',
      count: '20+ Providers'
    },
    {
      id: 'broadband',
      name: 'Broadband',
      icon: '📶',
      color: 'bg-teal-500',
      description: 'Internet & broadband',
      count: '40+ ISPs'
    },
    {
      id: 'creditcard',
      name: 'Credit Card',
      icon: '💳',
      color: 'bg-violet-500',
      description: 'Credit card bills',
      count: '25+ Banks'
    }
  ];

  // Function to handle "See all" transactions click
  const handleSeeAllTransactions = () => {
    setActiveTab('transactions');
  };

  // Function to handle bill payment category click
  const handleBillCategoryClick = (category) => {
    const event = new CustomEvent('navigateToBBPS', { detail: { category } });
    window.dispatchEvent(event);
  };

  return (
    <div className="space-y-6 py-2 md:py-4">
      {/* Balance Section */}
      <BalanceCard 
        balance={balance}
        user={user}
        handleTopUpWallet={handleTopUpWallet}
        handleTransferOption={handleTransferOption}
      />

      {/* BBPS Bill Payment Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">BBPS Bill Payment</h3>
            <p className="text-sm text-gray-600">Pay all your bills instantly & securely</p>
          </div>
          <button 
            onClick={() => handleBillCategoryClick(null)}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors flex items-center space-x-1"
          >
            <span>Show More</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Bill Categories - Responsive Grid with Scrollable Row for Desktop */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          {/* Mobile: Simple Grid */}
          <div className="md:hidden grid grid-cols-4 gap-3">
            {popularBillCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleBillCategoryClick(category)}
                className="bg-gray-50 hover:bg-gray-100 rounded-xl p-3 transition-all group border border-gray-100 hover:border-blue-200 hover:shadow-sm"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h4 className="font-medium text-gray-900 text-xs">{category.name}</h4>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop: Scrollable Row with All Categories */}
          <div className="hidden md:block">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">All Categories</h4>
              <span className="text-sm text-gray-500">{allBillCategories.length} services available</span>
            </div>
            
            {/* Scrollable Categories Row */}
            <div className="overflow-x-auto scrollbar-hide w-full">
              <div className="flex space-x-4 pb-2 w-max">
                {allBillCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleBillCategoryClick(category)}
                    className="flex-shrink-0 bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all group border border-gray-100 hover:border-blue-200 hover:shadow-md w-[140px]"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                        {category.icon}
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">{category.name}</h4>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{category.description}</p>
                      <p className="text-xs text-blue-600 font-medium">{category.count}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bills Section - Desktop Enhanced */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-600" />
                Recent Bills
              </h4>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                View All
              </button>
            </div>
            
            {/* Desktop: Enhanced Recent Bills Grid */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { id: 1, category: 'electricity', provider: 'Adani Electricity', amount: '₹1,245', due: 'Jan 25', status: 'due', icon: '⚡', color: 'bg-yellow-100 text-yellow-600' },
                { id: 2, category: 'mobile', provider: 'Airtel Postpaid', amount: '₹599', due: 'Jan 28', status: 'due', icon: '📱', color: 'bg-blue-100 text-blue-600' },
                { id: 3, category: 'gas', provider: 'Indane Gas', amount: '₹850', due: 'Feb 02', status: 'paid', icon: '🔥', color: 'bg-orange-100 text-orange-600' },
                { id: 4, category: 'dth', provider: 'Tata Play', amount: '₹350', due: 'Feb 05', status: 'due', icon: '📺', color: 'bg-purple-100 text-purple-600' }
              ].map((bill) => (
                <div key={bill.id} className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all border border-gray-100 hover:border-blue-200 hover:shadow-sm cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bill.color}`}>
                      <span className="text-lg">{bill.icon}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bill.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {bill.status === 'paid' ? 'Paid' : 'Due'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 text-sm">{bill.provider}</p>
                    <p className="text-xs text-gray-500">Due: {bill.due}</p>
                    <p className="font-bold text-gray-900">{bill.amount}</p>
                    {bill.status === 'due' && (
                      <button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 px-3 rounded-lg transition-colors">
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: Original Simple Layout */}
            <div className="md:hidden grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">⚡</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Adani Electricity</p>
                    <p className="text-xs text-gray-500">Due: Jan 25</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹1,245</p>
                  <button className="text-xs text-blue-600 font-medium">Pay Now</button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📱</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Airtel Postpaid</p>
                    <p className="text-xs text-gray-500">Due: Jan 28</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹599</p>
                  <button className="text-xs text-blue-600 font-medium">Pay Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* Saved Billers Section - Desktop Only */}
          <div className="hidden md:block mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900 flex items-center">
                <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved Billers
              </h4>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                Manage
              </button>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 1, name: 'Home Electricity', provider: 'Adani Electricity', number: '***789', icon: '⚡', color: 'bg-yellow-100' },
                { id: 2, name: 'Personal Mobile', provider: 'Airtel', number: '***210', icon: '📱', color: 'bg-blue-100' },
                { id: 3, name: 'Home DTH', provider: 'Tata Play', number: '***321', icon: '📺', color: 'bg-purple-100' },
                { id: 4, name: 'Gas Connection', provider: 'Indane', number: '***456', icon: '🔥', color: 'bg-orange-100' }
              ].map((biller) => (
                <button key={biller.id} className="bg-gray-50 hover:bg-gray-100 rounded-xl p-3 transition-all border border-gray-100 hover:border-blue-200 text-left">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${biller.color}`}>
                      <span className="text-sm">{biller.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{biller.name}</p>
                      <p className="text-xs text-gray-500 truncate">{biller.provider}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">{biller.number}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions - Desktop */}
          <div className="hidden md:block mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
            <div className="grid grid-cols-3 gap-4">
              <button className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl p-4 transition-all border border-blue-200 hover:border-blue-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="font-semibold text-blue-900 text-sm">Auto Pay</p>
                  <p className="text-xs text-blue-700">Set up automatic payments</p>
                </div>
              </button>

              <button className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl p-4 transition-all border border-green-200 hover:border-green-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-green-900 text-sm">Bill Reminder</p>
                  <p className="text-xs text-green-700">Never miss a due date</p>
                </div>
              </button>

              <button className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl p-4 transition-all border border-purple-200 hover:border-purple-300">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 0 0 1-2-2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-purple-900 text-sm">Bill Analysis</p>
                  <p className="text-xs text-purple-700">Track your spending</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Quick Actions Grid */}
      <div className="hidden md:grid md:grid-cols-4 md:gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-xl p-3">
              <BarChart3 className="text-purple-600 text-2xl" />
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
              <TrendingUp className="text-blue-600 text-2xl" />
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
              <DollarSign className="text-green-600 text-2xl" />
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
              <Smartphone className="text-orange-600 text-2xl" />
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
          <button onClick={handleSeeAllTransactions} className="text-purple-600 text-sm font-medium">See all</button>
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
                      {transaction.amount > 0 ? <ArrowDownLeft /> : <ArrowUpRight />}
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
              <BarChart3 className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600 font-medium">No transaction yet</p>
            <p className="text-gray-400 text-sm mt-1">Your transactions will appear here</p>
          </div>
        )}
      </div>

      {/* Bulk Report Generation Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleGenerateBulkReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={operationLoading}
        >
          {operationLoading ? 'Generating Report...' : 'Generate Bulk Report'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
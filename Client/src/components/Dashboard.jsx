import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getWalletBalance, getTransactionHistory, generateBulkReceipt } from '../store/slices/walletSlice';
import { logoutUser } from '../store/slices/authSlice';
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
  Receipt
} from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, loading } = useSelector((state) => state.wallet);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMobileTransfer, setShowMobileTransfer] = useState(false);
  const [showWalletTopup, setShowWalletTopup] = useState(false);
  const [selectedBBPSCategory, setSelectedBBPSCategory] = useState(null);
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (user) {
      dispatch(getWalletBalance());
      dispatch(getTransactionHistory({ page: 1, limit: 5 }));
    }
  }, [dispatch, user]);

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigateToWallet = () => {
      setActiveTab('wallet');
    };

    const handleNavigateToBBPS = (event) => {
      setSelectedBBPSCategory(event.detail?.category || null);
      setActiveTab('bbps');
    };

    window.addEventListener('navigateToWallet', handleNavigateToWallet);
    window.addEventListener('navigateToBBPS', handleNavigateToBBPS);
    
    return () => {
      window.removeEventListener('navigateToWallet', handleNavigateToWallet);
      window.removeEventListener('navigateToBBPS', handleNavigateToBBPS);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  // Function to handle wallet top-up
  const handleTopUpWallet = () => {
    setShowWalletTopup(true);
  };

  // Simplified menu items based on the image design
  const menuItems = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallet', icon: <Wallet className="w-5 h-5" /> },
    { id: 'bbps', label: 'Bill Pay', icon: <Receipt className="w-5 h-5" /> },
    { id: 'transactions', label: 'Transactions', icon: <History className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  // Add QR Code as a special menu item in sidebar
  const specialMenuItems = [
    { id: 'qrcode', label: 'QR Code', icon: <QrCode />, action: () => setShowQRCode(true) }
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

  const renderContent = () => {
    // Show WalletComponent for top-up if wallet top-up is active
    if (showWalletTopup) {
      return <WalletComponent onBack={() => setShowWalletTopup(false)} />;
    }
    
    // Show MobileTransferComponent if mobile transfer is active
    if (showMobileTransfer) {
      return <MobileTransferComponent onBack={() => setShowMobileTransfer(false)} />;
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
      default:
        return <DashboardContent setShowMobileTransfer={setShowMobileTransfer} handleTopUpWallet={handleTopUpWallet} setActiveTab={setActiveTab} setShowQRCode={setShowQRCode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header with Profile and Bell */}
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Left: User Profile Image - Clickable to open menu */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-1 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="font-semibold text-gray-900">{user?.fullName || 'User'}</p>
              </div>
            </button>

            {/* Right: QR Code and Notifications */}
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowQRCode(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <QrCode className="w-6 h-6 text-gray-700" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Sidebar Header - Fixed */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-600">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm relative">
                    {user?.fullName?.charAt(0) || 'U'}
                    {/* KYC Status Indicator */}
                    {user?.kyc?.status !== 'approved' && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
                        <AlertTriangle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">{user?.fullName || 'User'}</p>
                    <p className="text-sm text-purple-100">{user?.phone}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-purple-200">Balance: ₹{balance?.toFixed(2) || '0.00'}</p>
                      {/* KYC Status Badge */}
                      {user?.kyc?.status !== 'approved' && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${kycStatus.bg} border border-white/20`}>
                          <span className={kycStatus.color}>{kycStatus.icon}</span>
                          <span className={`text-xs font-medium ${kycStatus.color}`}>
                            {kycStatus.text.replace('KYC ', '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* KYC Alert Banner in Menu */}
              {user?.kyc?.status !== 'approved' && (
                <div className={`${kycStatus.bg} ${kycStatus.color} rounded-lg p-3 border border-white/20`}>
                  <div className="flex items-center space-x-2">
                    {kycStatus.icon}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{kycStatus.text}</p>
                      <p className="text-xs opacity-80">
                        {user?.kyc?.status === 'submitted' 
                          ? 'Review in progress...' 
                          : 'Complete verification for full access'
                        }
                      </p>
                    </div>
                    {user?.kyc?.status !== 'submitted' && (
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setSidebarOpen(false);
                        }}
                        className="text-xs bg-white/20 text-white px-2 py-1 rounded hover:bg-white/30 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Menu - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <nav className="p-6">
                <ul className="space-y-2">
                  {menuItems.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                          activeTab === item.id
                            ? 'bg-purple-100 text-purple-700 shadow-sm'
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
                  <ul className="space-y-2">
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
                      <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors">
                        <Bell className="mr-3 text-lg" />
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
                  </ul>
                </div>
              </nav>
            </div>

            {/* Sidebar Footer - Fixed */}
            <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
              <LogOut className="w-4 h-4" />
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
      <div className="md:hidden px-4 pb-20">
        {renderContent()}
      </div>

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

const DashboardContent = ({ setShowMobileTransfer, handleTopUpWallet, setActiveTab, setShowQRCode }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, transactions, transactionLoading, operationLoading } = useSelector((state) => state.wallet);
  // Removed showAllBillCategories state as we don't need show/hide functionality

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
    // Navigate to transactions tab instead of wallet
    setActiveTab('transactions');
  };

  // Function to handle bill payment category click
  const handleBillCategoryClick = (category) => {
    // This would navigate to the full BBPS component with pre-selected category
    // For now, we'll navigate to the BBPS page
    const event = new CustomEvent('navigateToBBPS', { detail: { category } });
    window.dispatchEvent(event);
  };

  // Function to handle transfer option clicks
  const handleTransferOption = (option) => {
    switch (option) {
      case 'scan':
        // Handle scan & pay - Open QR scanner with scan tab active
        setShowQRCode(true);
        // Set a flag to indicate we want scan tab active
        localStorage.setItem('qrCodeActiveTab', 'scan');
        break;
      case 'mobile':
        // Handle transfer to mobile - Show MobileTransferComponent
        setShowMobileTransfer(true);
        break;
      case 'bank':
        // Handle transfer to bank account - Navigate to transfer component
        setActiveTab('transfer');
        break;
      case 'self':
        // Handle transfer to self account
        console.log('To Self A/c clicked');
        break;
      case 'history':
        // Handle balance & history - Navigate to transactions
        setActiveTab('transactions');
        break;
      case 'receive':
        // Handle receive money - Open QR code to show user's payment QR (generate tab)
        setShowQRCode(true);
        // Set flag for generate tab
        localStorage.setItem('qrCodeActiveTab', 'generate');
        break;
      case 'shortcut':
        // Handle add scan shortcut - Open QR scanner
        setShowQRCode(true);
        localStorage.setItem('qrCodeActiveTab', 'scan');
        break;
      case 'whats-new':
        // Handle what's new
        console.log('What&apos;s New clicked');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6 py-6">
      {/* Desktop Welcome Section */}
      <div className="hidden md:block">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here&apos;s your financial overview.</p>
      </div>

      {/* Balance Section - Responsive */}
      <div className="md:grid md:grid-cols-3 md:gap-6 md:mb-8">
        {/* Main Balance Card - Mobile: Full width, Desktop: Spans 2 columns */}
        <div className="balance-card md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-purple-100 text-sm">Total balance</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                ₹{balance?.toFixed(2) || '1000.00'}
              </h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleTopUpWallet}
                className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20 hover:bg-white/30 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Top Up Wallet</span>
              </button>
            </div>
          </div>
          
          {/* Money Transfer Options - Mobile */}
          <div className="md:hidden space-y-4">
            <h3 className="text-white font-medium text-sm">MONEY TRANSFER</h3>
            
            {/* Top Row Transfer Options */}
            <div className="grid grid-cols-4 gap-3">
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
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center">To Mobile</span>
              </button>

              <button 
                onClick={() => handleTransferOption('bank')}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center">To Bank A/c</span>
              </button>

              <button 
                onClick={() => handleTransferOption('self')}
                className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/30 transition-all flex flex-col items-center space-y-2"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center">To Self A/c</span>
              </button>
            </div>

            {/* Bottom Row Additional Options */}
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => handleTransferOption('history')}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <History className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center">Balance & History</span>
              </button>

              <button 
                onClick={() => handleTransferOption('receive')}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center">Receive Money</span>
              </button>

              <button 
                onClick={() => handleTransferOption('shortcut')}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center">Add Scan Shortcut</span>
              </button>

              <button 
                onClick={() => handleTransferOption('whats-new')}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/20 transition-all flex flex-col items-center space-y-2 relative"
              >
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium text-center">What&apos;s New</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Stats Cards */}
        <div className="hidden md:block space-y-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-xl p-3">
                <TrendingUp className="text-green-600 text-2xl" />
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
                <User className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <p className="text-xl font-bold text-gray-900">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        
        {/* Bill Categories Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-4 gap-3">
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

          {/* Recent Bills Quick Access */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-600" />
              Recent Bills
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
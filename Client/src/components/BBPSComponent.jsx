import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { 
  Zap, 
  Smartphone, 
  Tv, 
  Droplets, 
  Flame, 
  Car, 
  Shield, 
  GraduationCap,
  Building,
  Heart,
  Wifi,
  CreditCard,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Receipt,
  Calendar,
  MapPin,
  Star,
  Bookmark,
  Filter,
  RotateCcw
} from 'lucide-react';

const BBPSComponent = ({ selectedCategory: initialCategory = null, onBack = null }) => {
  const dispatch = useDispatch();
  const { balance } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [billDetails, setBillDetails] = useState({
    billerId: '',
    consumerNumber: '',
    amount: '',
    customerName: '',
    dueDate: '',
    billAmount: ''
  });
  const [step, setStep] = useState(initialCategory ? 'billers' : 'categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentBills, setRecentBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedBillers, setSavedBillers] = useState([]);

  // Update step when initialCategory changes
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      setStep('billers');
    }
  }, [initialCategory]);

  // BBPS Categories with comprehensive list
  const bbpsCategories = [
    {
      id: 'electricity',
      name: 'Electricity',
      icon: <Zap className="w-6 h-6" />,
      color: 'bg-yellow-500',
      description: 'Pay electricity bills instantly',
      count: '150+ Providers'
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: 'Mobile postpaid bills',
      count: '25+ Operators'
    },
    {
      id: 'dth',
      name: 'DTH/Cable',
      icon: <Tv className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: 'DTH & Cable TV bills',
      count: '15+ Providers'
    },
    {
      id: 'water',
      name: 'Water',
      icon: <Droplets className="w-6 h-6" />,
      color: 'bg-cyan-500',
      description: 'Municipal water bills',
      count: '50+ Boards'
    },
    {
      id: 'gas',
      name: 'Gas',
      icon: <Flame className="w-6 h-6" />,
      color: 'bg-orange-500',
      description: 'LPG & PNG bills',
      count: '12+ Companies'
    },
    {
      id: 'fastag',
      name: 'FASTag',
      icon: <Car className="w-6 h-6" />,
      color: 'bg-green-500',
      description: 'FASTag recharge',
      count: '20+ Banks'
    },
    {
      id: 'insurance',
      name: 'Insurance',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-red-500',
      description: 'Insurance premiums',
      count: '30+ Companies'
    },
    {
      id: 'education',
      name: 'Education',
      icon: <GraduationCap className="w-6 h-6" />,
      color: 'bg-indigo-500',
      description: 'School & college fees',
      count: '100+ Institutions'
    },
    {
      id: 'municipal',
      name: 'Municipal',
      icon: <Building className="w-6 h-6" />,
      color: 'bg-gray-500',
      description: 'Municipal taxes',
      count: '75+ Corporations'
    },
    {
      id: 'health',
      name: 'Health',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-pink-500',
      description: 'Health insurance',
      count: '20+ Providers'
    },
    {
      id: 'broadband',
      name: 'Broadband',
      icon: <Wifi className="w-6 h-6" />,
      color: 'bg-teal-500',
      description: 'Internet & broadband',
      count: '40+ ISPs'
    },
    {
      id: 'creditcard',
      name: 'Credit Card',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-violet-500',
      description: 'Credit card bills',
      count: '25+ Banks'
    }
  ];

  // Sample billers for each category
  const sampleBillers = {
    electricity: [
      { id: 'adani_electricity_mumbai', name: 'Adani Electricity Mumbai Ltd', logo: '⚡', rating: 4.5 },
      { id: 'tata_power_delhi', name: 'Tata Power Delhi Distribution Ltd', logo: '🔌', rating: 4.3 },
      { id: 'bses_rajdhani', name: 'BSES Rajdhani Power Ltd', logo: '💡', rating: 4.2 },
      { id: 'bses_yamuna', name: 'BSES Yamuna Power Ltd', logo: '⚡', rating: 4.1 },
      { id: 'cesc_kolkata', name: 'Calcutta Electric Supply Corporation', logo: '🔋', rating: 4.0 }
    ],
    mobile: [
      { id: 'airtel', name: 'Bharti Airtel Ltd', logo: '📱', rating: 4.4 },
      { id: 'jio', name: 'Reliance Jio Infocomm Ltd', logo: '📲', rating: 4.5 },
      { id: 'vi', name: 'Vodafone Idea Ltd', logo: '📞', rating: 4.2 },
      { id: 'bsnl', name: 'Bharat Sanchar Nigam Ltd', logo: '📶', rating: 3.9 }
    ],
    dth: [
      { id: 'tata_sky', name: 'Tata Play (Tata Sky)', logo: '📺', rating: 4.3 },
      { id: 'dish_tv', name: 'Dish TV India Ltd', logo: '📡', rating: 4.1 },
      { id: 'airtel_dth', name: 'Bharti Telemedia Ltd', logo: '📻', rating: 4.2 },
      { id: 'sun_direct', name: 'Sun Direct TV Pvt Ltd', logo: '🛰️', rating: 4.0 }
    ],
    water: [
      { id: 'delhi_jal_board', name: 'Delhi Jal Board', logo: '💧', rating: 3.8 },
      { id: 'mumbai_water', name: 'Brihanmumbai Municipal Corporation', logo: '🚰', rating: 3.9 },
      { id: 'bangalore_water', name: 'Bangalore Water Supply', logo: '💦', rating: 3.7 },
      { id: 'chennai_water', name: 'Chennai Metro Water', logo: '🏛️', rating: 3.6 }
    ],
    gas: [
      { id: 'indane', name: 'Indian Oil - Indane', logo: '🔥', rating: 4.2 },
      { id: 'hp_gas', name: 'Hindustan Petroleum - HP Gas', logo: '⛽', rating: 4.1 },
      { id: 'bharat_gas', name: 'Bharat Petroleum - Bharat Gas', logo: '🛢️', rating: 4.0 },
      { id: 'adani_gas', name: 'Adani Gas Ltd', logo: '💨', rating: 4.3 }
    ]
  };

  // Load recent bills and saved billers on component mount
  useEffect(() => {
    // In real app, this would be API calls
    setRecentBills([
      { id: 1, category: 'electricity', biller: 'Adani Electricity Mumbai Ltd', amount: 1250, date: '2025-01-10', status: 'paid' },
      { id: 2, category: 'mobile', biller: 'Bharti Airtel Ltd', amount: 599, date: '2025-01-08', status: 'paid' },
      { id: 3, category: 'dth', biller: 'Tata Play', amount: 350, date: '2025-01-05', status: 'paid' },
      { id: 4, category: 'gas', biller: 'Indian Oil - Indane', amount: 850, date: '2025-01-03', status: 'paid' },
      { id: 5, category: 'water', biller: 'Delhi Jal Board', amount: 420, date: '2024-12-28', status: 'paid' }
    ]);

    setSavedBillers([
      { id: 1, category: 'electricity', biller: 'Adani Electricity Mumbai Ltd', consumerNumber: '123456789', nickname: 'Home Electricity' },
      { id: 2, category: 'mobile', biller: 'Bharti Airtel Ltd', consumerNumber: '9876543210', nickname: 'Personal Mobile' },
      { id: 3, category: 'dth', biller: 'Tata Play (Tata Sky)', consumerNumber: '987654321', nickname: 'Home DTH' },
      { id: 4, category: 'gas', biller: 'Indian Oil - Indane', consumerNumber: '456789123', nickname: 'Home Gas' }
    ]);
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep('billers');
    setError('');
  };

  const handleBillerSelect = (biller) => {
    setSelectedBiller(biller);
    setStep('details');
    setBillDetails({
      billerId: biller.id,
      consumerNumber: '',
      amount: '',
      customerName: '',
      dueDate: '',
      billAmount: ''
    });
  };

  const handleFetchBill = async () => {
    if (!billDetails.consumerNumber) {
      setError('Consumer number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call to fetch bill details
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock bill data
      setBillDetails(prev => ({
        ...prev,
        customerName: 'John Doe',
        dueDate: '2025-01-25',
        billAmount: '1,245.50'
      }));
      
      setStep('confirm');
    } catch (err) {
      setError('Failed to fetch bill details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayBill = async () => {
    setLoading(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('categories');
    setSelectedCategory(null);
    setSelectedBiller(null);
    setBillDetails({
      billerId: '',
      consumerNumber: '',
      amount: '',
      customerName: '',
      dueDate: '',
      billAmount: ''
    });
    setError('');
  };

  const handleBackToCategories = () => {
    if (onBack && step === 'categories') {
      // If we have an onBack callback and we're at categories, go back to dashboard
      onBack();
    } else if (step === 'billers' && initialCategory) {
      // If we came from dashboard with a pre-selected category, go back to dashboard
      onBack();
    } else {
      // Normal back navigation within BBPS
      setStep('categories');
    }
    setSelectedCategory(null);
    setError('');
  };

  const filteredBillers = selectedCategory && sampleBillers[selectedCategory.id] 
    ? sampleBillers[selectedCategory.id].filter(biller => 
        biller.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Categories View
  if (step === 'categories') {
    return (
      <div className="space-y-6 py-6">
        {/* Header - Compact and modern */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Bill Payments</h1>
          <p className="text-sm text-gray-500">Pay your bills instantly</p>
        </div>

        {/* Balance Card - Compact */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-xs">Available Balance</p>
              <p className="text-xl font-bold">₹{balance?.toFixed(2) || '1,000.00'}</p>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Categories Grid - Always show all categories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">All BBPS Categories</h3>
              <p className="text-sm text-gray-600">Choose from all available bill payment services</p>
            </div>
          </div>
          
          {/* Bill Categories Grid - Responsive grid showing all categories */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bbpsCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category)}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-all group border border-gray-100 hover:border-blue-200 hover:shadow-sm"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {category.id === 'electricity' && '⚡'}
                      {category.id === 'mobile' && '📱'}
                      {category.id === 'dth' && '📺'}
                      {category.id === 'water' && '💧'}
                      {category.id === 'gas' && '🔥'}
                      {category.id === 'fastag' && '🚗'}
                      {category.id === 'insurance' && '🛡️'}
                      {category.id === 'education' && '🎓'}
                      {category.id === 'municipal' && '🏛️'}
                      {category.id === 'health' && '❤️'}
                      {category.id === 'broadband' && '📶'}
                      {category.id === 'creditcard' && '💳'}
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{category.name}</h4>
                    <p className="text-xs text-gray-500 mb-2">{category.description}</p>
                    <p className="text-xs text-blue-600 font-medium">{category.count}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Why Choose BBPS?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900 mb-1">Secure & Safe</p>
              <p className="text-sm text-gray-600">RBI approved payment system</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900 mb-1">Instant Payments</p>
              <p className="text-sm text-gray-600">Real-time bill settlements</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900 mb-1">Instant Receipt</p>
              <p className="text-sm text-gray-600">Digital receipt & confirmation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Billers Selection View
  if (step === 'billers') {
    return (
      <div className="space-y-6 py-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={handleBackToCategories}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name} Bills</h2>
            <p className="text-gray-600">Select your service provider</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search billers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Billers List */}
        <div className="space-y-3">
          {filteredBillers.map((biller) => (
            <button
              key={biller.id}
              onClick={() => handleBillerSelect(biller)}
              className="w-full bg-white rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    {biller.logo}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{biller.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(biller.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{biller.rating}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          ))}
        </div>

        {filteredBillers.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No billers found</h3>
            <p className="text-gray-600">Try searching with different keywords</p>
          </div>
        )}
      </div>
    );
  }

  // Bill Details Input View
  if (step === 'details') {
    return (
      <div className="space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setStep('billers')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bill Details</h2>
            <p className="text-gray-600">{selectedBiller.name}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consumer Number / Account Number
              </label>
              <input
                type="text"
                value={billDetails.consumerNumber}
                onChange={(e) => setBillDetails(prev => ({ ...prev, consumerNumber: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your consumer number"
              />
            </div>

            {selectedCategory.id === 'mobile' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={billDetails.consumerNumber}
                  onChange={(e) => setBillDetails(prev => ({ ...prev, consumerNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mobile number"
                />
              </div>
            )}

            <Button
              onClick={handleFetchBill}
              disabled={loading || !billDetails.consumerNumber}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>Fetching Bill...</span>
                </div>
              ) : (
                'Fetch Bill Details'
              )}
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Information</p>
              <p className="text-sm text-blue-800 mt-1">
                Enter your consumer number as mentioned on your bill. We'll fetch the latest bill details for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bill Confirmation View
  if (step === 'confirm') {
    return (
      <div className="space-y-6 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setStep('details')}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Confirm Payment</h2>
            <p className="text-gray-600">Review your bill details</p>
          </div>
        </div>

        {/* Bill Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${selectedCategory.color} rounded-xl flex items-center justify-center`}>
                {selectedCategory.icon}
              </div>
              <div>
                <h3 className="font-semibold">{selectedBiller.name}</h3>
                <p className="text-blue-100 text-sm">{selectedCategory.name} Bill</p>
              </div>
            </div>
          </div>

          {/* Bill Info */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Consumer Number</p>
                <p className="font-medium text-gray-900">{billDetails.consumerNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium text-gray-900">{billDetails.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                  {billDetails.dueDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bill Amount</p>
                <p className="font-medium text-gray-900">₹{billDetails.billAmount}</p>
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Amount</span>
                  <span className="text-gray-900">₹{billDetails.billAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Convenience Fee</span>
                  <span className="text-gray-900">₹0.00</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
                  <span className="text-gray-900">Total Amount</span>
                  <span className="text-gray-900">₹{billDetails.billAmount}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-2">Payment Method</h4>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">NexasPay Wallet</p>
                  <p className="text-sm text-gray-600">Balance: ₹{balance?.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePayBill}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>Processing Payment...</span>
                </div>
              ) : (
                `Pay ₹${billDetails.billAmount}`
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success View
  if (step === 'success') {
    return (
      <div className="space-y-6 py-6 text-center">
        {/* Success Animation */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your {selectedCategory.name.toLowerCase()} bill has been paid successfully</p>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-left max-w-md mx-auto">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">Transaction Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID</span>
              <span className="font-medium text-gray-900">TXN123456789</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium text-gray-900">₹{billDetails.billAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium text-gray-900">{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-green-600">Success</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 max-w-md mx-auto">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            <Receipt className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
          <Button
            onClick={resetFlow}
            variant="outline"
            className="w-full"
          >
            Pay Another Bill
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default BBPSComponent;
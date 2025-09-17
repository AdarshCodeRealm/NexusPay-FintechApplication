import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { 
  Flame, 
  ArrowLeft, 
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Receipt,
  Calendar,
  Star,
  Bookmark,
  RotateCcw,
  CreditCard,
  Shield,
  Fuel
} from 'lucide-react';

const GasComponent = ({ onBack }) => {
  const dispatch = useDispatch();
  const { balance } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedBiller, setSelectedBiller] = useState(null);
  const [billDetails, setBillDetails] = useState({
    billerId: '',
    consumerNumber: '',
    amount: '',
    customerName: '',
    dueDate: '',
    billAmount: ''
  });
  const [step, setStep] = useState('providers'); // 'providers', 'details', 'confirm', 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Gas-specific data
  const gasBillers = [
    { id: 'indane', name: 'Indian Oil - Indane', logo: '🔥', rating: 4.2, popular: true },
    { id: 'hp_gas', name: 'Hindustan Petroleum - HP Gas', logo: '⛽', rating: 4.1, popular: true },
    { id: 'bharat_gas', name: 'Bharat Petroleum - Bharat Gas', logo: '🛢️', rating: 4.0, popular: true },
    { id: 'adani_gas', name: 'Adani Gas Ltd', logo: '💨', rating: 4.3, popular: true },
    { id: 'igl', name: 'Indraprastha Gas Ltd', logo: '🔥', rating: 4.2, popular: false },
    { id: 'gail', name: 'GAIL (India) Limited', logo: '💨', rating: 4.0, popular: false }
  ];

  // Gas-specific recent bills
  const recentGasBills = [
    { 
      id: 1, 
      biller: 'Indian Oil - Indane', 
      amount: 850, 
      date: '2025-01-03', 
      status: 'paid',
      consumerNumber: '456789123'
    },
    { 
      id: 2, 
      biller: 'Hindustan Petroleum - HP Gas', 
      amount: 890, 
      date: '2024-12-28', 
      status: 'paid',
      consumerNumber: '789123456'
    },
    { 
      id: 3, 
      biller: 'Adani Gas Ltd', 
      amount: 1200, 
      date: '2024-12-25', 
      status: 'paid',
      consumerNumber: '321654987'
    }
  ];

  // Gas-specific saved billers
  const savedGasBillers = [
    { 
      id: 1, 
      biller: 'Indian Oil - Indane', 
      consumerNumber: '456789123', 
      nickname: 'Home Gas',
      lastAmount: 850,
      dueDate: '2025-01-30'
    },
    { 
      id: 2, 
      biller: 'Adani Gas Ltd', 
      consumerNumber: '321654987', 
      nickname: 'Office Gas Connection',
      lastAmount: 1200,
      dueDate: '2025-02-02'
    }
  ];

  const filteredBillers = gasBillers.filter(biller => 
    biller.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularBillers = gasBillers.filter(biller => biller.popular);

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

  const handleSavedBillerSelect = (savedBiller) => {
    const biller = gasBillers.find(b => b.name === savedBiller.biller);
    if (biller) {
      setSelectedBiller(biller);
      setBillDetails({
        billerId: biller.id,
        consumerNumber: savedBiller.consumerNumber,
        amount: '',
        customerName: '',
        dueDate: '',
        billAmount: ''
      });
      setStep('details');
    }
  };

  const handleFetchBill = async () => {
    if (!billDetails.consumerNumber) {
      setError('Consumer number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBillDetails(prev => ({
        ...prev,
        customerName: 'John Doe',
        dueDate: '2025-01-30',
        billAmount: '850.00'
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
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep('success');
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Providers View (Main View)
  if (step === 'providers') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Gas</h1>
                  <p className="text-sm text-gray-600">LPG & PNG bills</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">12+ Companies</p>
              <p className="text-lg font-bold text-orange-600">Pay Now</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-orange-100 text-sm">Available Balance</p>
                <p className="text-2xl font-bold">₹{balance?.toFixed(2) || '1,000.00'}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Actions - Recent Bills */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Recent Bills
              </p>
              <button className="text-blue-600 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-3">
              {recentGasBills.slice(0, 2).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔥</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{bill.biller}</p>
                      <p className="text-xs text-gray-600">{bill.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">₹{bill.amount}</p>
                    <span className="text-xs text-green-600 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Billers */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900 flex items-center">
                <Bookmark className="w-5 h-5 mr-2 text-gray-600" />
                Saved Billers
              </p>
              <button className="text-blue-600 text-sm font-medium">Manage</button>
            </div>
            <div className="space-y-3">
              {savedGasBillers.map((biller) => (
                <div key={biller.id} 
                     onClick={() => handleSavedBillerSelect(biller)}
                     className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100 cursor-pointer hover:bg-orange-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Fuel className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{biller.nickname}</p>
                      <p className="text-xs text-gray-600">{biller.biller}</p>
                      <p className="text-xs text-orange-600">Due: {biller.dueDate}</p>
                    </div>
                  </div>
                  <button className="text-white text-sm font-medium px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors">
                    Pay Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search gas providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Popular Providers */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-orange-500" />
              Popular Providers
            </h3>
            <div className="space-y-2">
              {popularBillers.map((biller) => (
                <button
                  key={biller.id}
                  onClick={() => handleBillerSelect(biller)}
                  className="w-full bg-orange-50 hover:bg-orange-100 rounded-lg p-3 border border-orange-100 hover:border-orange-200 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-xl">
                        {biller.logo}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{biller.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(biller.rating) ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
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
          </div>

          {/* All Providers */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">All Gas Providers</h3>
            <div className="space-y-2">
              {filteredBillers.filter(biller => !biller.popular).map((biller) => (
                <button
                  key={biller.id}
                  onClick={() => handleBillerSelect(biller)}
                  className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                        {biller.logo}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{biller.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(biller.rating) ? 'text-orange-400 fill-current' : 'text-gray-300'}`}
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
          </div>

          {/* Features */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Why Pay Gas Bills with NexasPay?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-6 h-6 text-orange-600" />
                </div>
                <p className="font-medium text-gray-900 mb-1">LPG & PNG</p>
                <p className="text-sm text-gray-600">Support for all gas types</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-medium text-gray-900 mb-1">Safe Payment</p>
                <p className="text-sm text-gray-600">Secure transactions</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-medium text-gray-900 mb-1">Instant Receipt</p>
                <p className="text-sm text-gray-600">Digital confirmation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bill Details Input View
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center space-x-4 p-4">
            <button
              onClick={() => setStep('providers')}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Bill Details</h2>
              <p className="text-sm text-gray-600">{selectedBiller.name}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Consumer Number / LPG ID
                </label>
                <input
                  type="text"
                  value={billDetails.consumerNumber}
                  onChange={(e) => setBillDetails(prev => ({ ...prev, consumerNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your consumer number or LPG ID"
                />
              </div>

              <Button
                onClick={handleFetchBill}
                disabled={loading || !billDetails.consumerNumber}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
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

          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-start space-x-3">
              <Flame className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">Gas Bill Information</p>
                <p className="text-sm text-orange-800 mt-1">
                  Enter your consumer number or LPG ID as mentioned on your gas bill or cylinder booking.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rest of the views would follow similar pattern...
  return <div>Other views (confirm, success) would follow similar pattern...</div>;
};

export default GasComponent;
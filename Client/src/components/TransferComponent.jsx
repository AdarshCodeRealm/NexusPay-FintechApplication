import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { transferMoney, clearError } from '../store/slices/walletSlice';
import { getBeneficiaries } from '../store/slices/userSlice';

const TransferComponent = () => {
  const dispatch = useDispatch();
  const { balance, operationLoading, error } = useSelector((state) => state.wallet);
  const { beneficiaries, beneficiaryLoading } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('quick-transfer');
  const [transferForm, setTransferForm] = useState({
    recipientPhone: '',
    amount: '',
    description: ''
  });

  useEffect(() => {
    dispatch(getBeneficiaries());
  }, [dispatch]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(transferMoney({
      recipientPhone: transferForm.recipientPhone,
      amount: parseFloat(transferForm.amount),
      description: transferForm.description
    }));
    setTransferForm({ recipientPhone: '', amount: '', description: '' });
  };

  const recentContacts = [
    { name: 'Mark Rivera', avatar: '👨', phone: '+91-9876543210' },
    { name: 'Anna L.', avatar: '👩', phone: '+91-9876543211' },
    { name: 'Penny K.', avatar: '👱‍♀️', phone: '+91-9876543212' },
    { name: 'Mark', avatar: '👨‍💼', phone: '+91-9876543213' }
  ];

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transfers</h1>
        <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Desktop Grid Layout */}
      <div className="md:grid md:grid-cols-3 md:gap-8">
        {/* Main Transfer Section - Mobile: Full width, Desktop: 2 columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts or phone numbers"
              className="w-full px-4 py-3 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 md:bg-white md:shadow-sm"
            />
            <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Recent Contacts */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Contacts</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
              {recentContacts.map((contact, index) => (
                <button
                  key={index}
                  onClick={() => setTransferForm({...transferForm, recipientPhone: contact.phone})}
                  className="flex-shrink-0 flex flex-col items-center space-y-2 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 min-w-[80px] hover:bg-white/90 transition-all md:bg-white md:shadow-sm md:hover:shadow-md"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                    {contact.avatar}
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center">{contact.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 md:bg-white md:shadow-lg md:border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Send Money</h3>
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-purple-600">
                  Balance: ₹{balance?.toFixed(0) || '0'}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0 space-y-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 md:bg-white"
                    placeholder="Enter phone number"
                    value={transferForm.recipientPhone}
                    onChange={(e) => setTransferForm({...transferForm, recipientPhone: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={balance}
                    required
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 md:bg-white"
                    placeholder="Enter amount"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 md:bg-white"
                    placeholder="Enter description"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={operationLoading}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {operationLoading ? 'Sending...' : 'Send Money'}
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Side Panel */}
        <div className="hidden md:block space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Transfer Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <span className="text-green-600 text-lg">📤</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sent Today</p>
                    <p className="text-xs text-gray-500">₹1,200</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Received</p>
                    <p className="text-xs text-gray-500">₹25,000</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-purple-600 text-lg">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Beneficiaries</p>
                    <p className="text-xs text-gray-500">{beneficiaries?.length || 0} contacts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-lg">👥</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Add Beneficiary</p>
                  <p className="text-sm text-gray-500">Save frequent contacts</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🏦</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bank Transfer</p>
                  <p className="text-sm text-gray-500">Send to bank account</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-lg">📱</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">UPI Transfer</p>
                  <p className="text-sm text-gray-500">Instant payments</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions - Full width */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">RECENT TRANSACTIONS</h3>
        <div className="space-y-3 md:bg-white md:rounded-2xl md:p-6 md:shadow-sm md:border md:border-gray-200">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="transaction-item md:bg-gray-50 md:border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                  👨
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mark Rivero</p>
                  <p className="text-sm text-gray-500">Today • 2:30 PM</p>
                </div>
              </div>
              <p className="font-semibold text-red-600">-₹1,200</p>
            </div>
            
            <div className="transaction-item md:bg-gray-50 md:border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white">
                  💰
                </div>
                <div>
                  <p className="font-medium text-gray-900">Salary Credit</p>
                  <p className="text-sm text-gray-500">Yesterday • 9:00 AM</p>
                </div>
              </div>
              <p className="font-semibold text-green-600">+₹25,000</p>
            </div>
            
            <div className="transaction-item md:bg-gray-50 md:border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
                  👩
                </div>
                <div>
                  <p className="font-medium text-gray-900">Anna L.</p>
                  <p className="text-sm text-gray-500">2 days ago • 4:15 PM</p>
                </div>
              </div>
              <p className="font-semibold text-red-600">-₹850</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions - Only on mobile */}
      <div className="md:hidden flex space-x-4">
        <button className="flex-1 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center font-medium text-gray-700 hover:bg-white/90 transition-all">
          View All
        </button>
        <button className="flex-1 bg-purple-600 text-white rounded-xl p-3 text-center font-medium hover:bg-purple-700 transition-colors">
          Add Contact
        </button>
      </div>
    </div>
  );
};

export default TransferComponent;
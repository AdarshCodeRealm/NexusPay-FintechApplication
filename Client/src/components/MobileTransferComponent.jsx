import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUserByPhone, clearSearchedUser, clearError } from '../store/slices/userSlice';
import { transferMoney } from '../store/slices/walletSlice';
import { ArrowLeft, X, Star } from 'lucide-react';

const MobileTransferComponent = ({ onBack }) => {
  const dispatch = useDispatch();
  const { searchedUser, searchLoading, error } = useSelector((state) => state.user);
  const { balance, operationLoading } = useSelector((state) => state.wallet);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState('enter-phone'); // 'enter-phone', 'user-found', 'enter-amount'

  // Recent contacts data matching your image
  const recentContacts = [
    { name: 'Papa', phone: '9970379560', avatar: 'P', received: '1,100', date: '24 Aug' },
    { name: 'Bhaskar', phone: '9970379560', avatar: 'B', received: '500', date: '15 Aug', verified: true },
    { name: 'Bhaskar', phone: '9970379560', avatar: 'B', received: '1', date: '03 Dec 2024', verified: true }
  ];

  const contacts = [
    { name: 'Papa', phone: '9970379560', avatar: 'P' }
  ];

  useEffect(() => {
    return () => {
      dispatch(clearSearchedUser());
      dispatch(clearError());
    };
  }, [dispatch]);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      
      // Auto-search when 10 digits are entered
      if (value.length === 10) {
        dispatch(searchUserByPhone(value));
        setStep('user-found');
      } else {
        dispatch(clearSearchedUser());
        setStep('enter-phone');
      }
    }
  };

  const handleContactSelect = (contact) => {
    setPhoneNumber(contact.phone);
    dispatch(searchUserByPhone(contact.phone));
    setStep('user-found');
  };

  const handleTransfer = async () => {
    if (!amount || !phoneNumber) return;
    
    const transferData = {
      recipientPhone: phoneNumber,
      amount: parseFloat(amount),
      description: description || `Transfer to ${searchedUser?.fullName || phoneNumber}`
    };
    
    const result = await dispatch(transferMoney(transferData));
    if (result.type === 'wallet/transferMoney/fulfilled') {
      onBack(); // Go back to dashboard on success
    }
  };

  const clearInput = () => {
    setPhoneNumber('');
    setAmount('');
    setDescription('');
    setStep('enter-phone');
    dispatch(clearSearchedUser());
    dispatch(clearError());
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Send Money</h1>
      </div>
      <div className="text-sm text-gray-500">
        Pay to any UPI app
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-blue-600 font-bold">paytm</span>
          <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">₹</span>
          <span className="w-6 h-6 bg-red-500 rounded-full"></span>
          <span className="text-gray-600 font-bold">BHIM</span>
        </div>
      </div>
    </div>
  );

  const renderPhoneInput = () => (
    <div className="p-4">
      <div className="relative">
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="9970379560"
          className="w-full px-4 py-4 text-2xl font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          maxLength={10}
        />
        {phoneNumber && (
          <button
            onClick={clearInput}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <div className="absolute right-16 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <button className="px-3 py-1 bg-black text-white text-sm rounded-full font-medium">
            ABC
          </button>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full font-medium">
            123
          </button>
        </div>
      </div>
      
      {searchLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Searching...</span>
        </div>
      )}
    </div>
  );

  const renderUserFound = () => {
    if (!searchedUser && !searchLoading) {
      return (
        <div className="p-4 text-center">
          <div className="text-gray-500 text-sm">
            {phoneNumber.length === 10 ? 'User not found with this number' : 'Enter 10-digit mobile number'}
          </div>
        </div>
      );
    }

    if (searchedUser) {
      return (
        <div className="p-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {searchedUser.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{searchedUser.fullName}</h3>
                <p className="text-sm text-gray-600">+91 {phoneNumber}</p>
              </div>
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Amount Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max={balance}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available Balance: ₹{balance?.toFixed(2) || '0.00'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Note (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this for?"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button
              onClick={handleTransfer}
              disabled={!amount || operationLoading || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {operationLoading ? 'Sending...' : `Send ₹${amount || '0'}`}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderRecents = () => (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recents</h3>
      <div className="space-y-3">
        {recentContacts.map((contact, index) => (
          <div
            key={index}
            onClick={() => handleContactSelect(contact)}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
              {contact.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{contact.name}</h4>
                {contact.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600">+91 {contact.phone}</p>
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <span className="text-green-600">₹{contact.received} Received on {contact.date}</span>
              </div>
            </div>
            <Star className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">In Your Contacts</h3>
      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <div
            key={index}
            onClick={() => handleContactSelect(contact)}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
              {contact.avatar}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{contact.name}</h4>
              <p className="text-sm text-gray-600">+91 {contact.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      
      {renderPhoneInput()}
      
      {step === 'user-found' && renderUserFound()}
      
      {step === 'enter-phone' && (
        <>
          {renderRecents()}
          {renderContacts()}
        </>
      )}
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center py-3">
          <button className="flex flex-col items-center space-y-1 p-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <span className="text-xs text-gray-600">Suggested</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">↻</span>
            </div>
            <span className="text-xs text-blue-600 font-medium">Recents</span>
          </button>
          <button className="flex flex-col items-center space-y-1 p-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm">📅</span>
            </div>
            <span className="text-xs text-gray-600">Reminders</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileTransferComponent;
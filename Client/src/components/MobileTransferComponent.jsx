import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { transferMoney, clearError, getWalletBalance, getTransactionHistory } from '../store/slices/walletSlice';
import { Button } from './ui/button';
import { ArrowLeft, X, Star, Eye, EyeOff, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

const MobileTransferComponent = ({ onBack }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, operationLoading, error: walletError, transactions } = useSelector((state) => state.wallet);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [step, setStep] = useState('enter-phone'); // 'enter-phone', 'user-found', 'enter-amount', 'mpin-verify', 'success'
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [transferResult, setTransferResult] = useState(null);
  const [recentTransfers, setRecentTransfers] = useState([]);

  // Static contacts for demonstration
  const contacts = [
    { name: 'Alex Smith', phone: '9876543210', avatar: 'A' },
    { name: 'Sarah Johnson', phone: '9876543211', avatar: 'S' },
    { name: 'Mike Wilson', phone: '9876543212', avatar: 'M' }
  ];

  // Clear wallet errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
      setError('');
      setSearchedUser(null);
    };
  }, [dispatch]);

  // Listen for wallet errors
  useEffect(() => {
    if (walletError) {
      setError(walletError);
    }
  }, [walletError]);

  // Load transaction history on component mount
  useEffect(() => {
    dispatch(getTransactionHistory({ page: 1, limit: 5, type: 'transfer' }));
  }, [dispatch]);

  // Update recent transfers from actual transaction history
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const transferTransactions = transactions
        .filter(txn => txn.transactionType === 'transfer' && txn.amount < 0) // Only outgoing transfers
        .slice(0, 3) // Get last 3 transfers
        .map(txn => {
          const metadata = txn.transactionMetadata ? JSON.parse(txn.transactionMetadata) : {};
          return {
            name: txn.beneficiaryName || 'Unknown',
            phone: txn.beneficiaryAccount || 'Unknown',
            avatar: (txn.beneficiaryName || 'U').charAt(0).toUpperCase(),
            amount: Math.abs(txn.amount).toFixed(0),
            date: new Date(txn.createdAt).toLocaleDateString('en-US', { 
              day: 'numeric', 
              month: 'short' 
            }),
            verified: true
          };
        });
      setRecentTransfers(transferTransactions);
    }
  }, [transactions]);

  // Simulate user search API call
  const searchUserByPhone = async (phone) => {
    setSearchLoading(true);
    setError('');
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - in real app, this would be an API call
      const mockUsers = {
        '9970379560': { fullName: 'Papa Sharma', phone: '9970379560', verified: true },
        '9970379561': { fullName: 'Bhaskar Kumar', phone: '9970379561', verified: true },
        '9970379562': { fullName: 'Priya Singh', phone: '9970379562', verified: true },
        '9970379563': { fullName: 'Rohit Patel', phone: '9970379563', verified: false },
        '9970379564': { fullName: 'Anita Mehta', phone: '9970379564', verified: true },
        '9876543210': { fullName: 'John Doe', phone: '9876543210', verified: true }, // Test user
        '9876543211': { fullName: 'Jane Smith', phone: '9876543211', verified: true }, // Test user
      };
      
      const foundUser = mockUsers[phone];
      
      if (foundUser) {
        setSearchedUser(foundUser);
        setStep('user-found');
      } else {
        setError('User not found with this phone number');
        setSearchedUser(null);
      }
    } catch (err) {
      setError('Failed to search user. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) {
      setPhoneNumber(value);
      setError('');
      
      // Auto-search when 10 digits are entered
      if (value.length === 10) {
        searchUserByPhone(value);
      } else {
        setSearchedUser(null);
        setStep('enter-phone');
      }
    }
  };

  const handleContactSelect = (contact) => {
    setPhoneNumber(contact.phone);
    searchUserByPhone(contact.phone);
  };

  const handleAmountSubmit = () => {
    const transferAmount = parseFloat(amount);
    
    if (!transferAmount || transferAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (transferAmount > balance) {
      setError('Insufficient balance');
      return;
    }
    
    // Check if amount is ≤ ₹10,000 for MPIN requirement
    if (transferAmount <= 10000) {
      setStep('mpin-verify');
    } else {
      setError('Amount exceeds ₹10,000 limit. Maximum allowed is ₹10,000 per transaction.');
    }
  };

  const handleMpinSubmit = async () => {
    if (mpin.length !== 4) {
      setError('Please enter a valid 4-digit MPIN');
      return;
    }

    // Clear any previous errors
    setError('');
    dispatch(clearError());
    
    try {
      // Call the actual transfer API
      const transferData = {
        recipientPhone: phoneNumber,
        amount: parseFloat(amount),
        description: description || `Transfer to ${searchedUser.fullName}`,
        mpin: mpin // In real implementation, this should be encrypted
      };

      console.log('Initiating transfer:', transferData);
      
      const result = await dispatch(transferMoney(transferData));
      
      if (result.type === 'wallet/transfer/fulfilled') {
        // Transfer successful
        const responseData = result.payload.data;
        
        const successData = {
          referenceId: responseData.referenceId || responseData.transactionDetails?.senderTransactionId || `TXN${Date.now()}`,
          recipientPhone: phoneNumber,
          recipientName: searchedUser.fullName,
          amount: parseFloat(amount),
          description: description || `Transfer to ${searchedUser.fullName}`,
          timestamp: new Date().toISOString(),
          newBalance: responseData.senderNewBalance || responseData.newBalance
        };
        
        setTransferResult(successData);
        setStep('success');
        
        // Refresh wallet balance and transaction history to get the updated data
        dispatch(getWalletBalance());
        dispatch(getTransactionHistory({ page: 1, limit: 5, type: 'transfer' }));
        
        console.log('Transfer completed successfully:', successData);
      } else {
        // Transfer failed
        const errorMessage = result.payload || 'Transfer failed. Please try again.';
        setError(errorMessage);
        console.error('Transfer failed:', errorMessage);
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setError('Transfer failed. Please try again.');
    }
  };

  const clearInput = () => {
    setPhoneNumber('');
    setAmount('');
    setDescription('');
    setMpin('');
    setStep('enter-phone');
    setSearchedUser(null);
    setError('');
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          {step === 'success' ? 'Transfer Complete' : 'Send Money'}
        </h1>
      </div>
      {step !== 'success' && (
        <div className="text-sm text-gray-500">
          Pay to any UPI app
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-blue-600 font-bold">paytm</span>
            <span className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">₹</span>
            <span className="w-6 h-6 bg-red-500 rounded-full"></span>
            <span className="text-gray-600 font-bold">BHIM</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderPhoneInput = () => (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter Mobile Number</h2>
        <p className="text-sm text-gray-600">Enter 10-digit mobile number to search user</p>
      </div>
      
      <div className="relative">
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="9876543210"
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
          <span className="ml-2 text-sm text-gray-600">Searching user...</span>
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
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {searchedUser.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{searchedUser.fullName}</h3>
                <p className="text-sm text-gray-600">+91 {phoneNumber}</p>
                {searchedUser.verified && (
                  <div className="flex items-center space-x-1 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Verified User</span>
                  </div>
                )}
              </div>
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          <Button
            onClick={() => setStep('enter-amount')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
          >
            Continue to Amount
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderAmountInput = () => (
    <div className="p-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {searchedUser.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{searchedUser.fullName}</h3>
            <p className="text-sm text-gray-600">+91 {phoneNumber}</p>
          </div>
        </div>
      </div>

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
              className="w-full pl-8 pr-4 py-4 text-2xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              max="10000"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Available: ₹{balance?.toFixed(2) || '0.00'}</span>
            <span>Max: ₹10,000</span>
          </div>
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
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Payment Limit</p>
              <p className="text-xs text-yellow-700">
                Maximum ₹10,000 per transaction. MPIN required for verification.
              </p>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleAmountSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > 10000 || parseFloat(amount) > balance}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );

  const renderMpinVerification = () => (
    <div className="p-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {searchedUser.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{searchedUser.fullName}</h3>
            <p className="text-sm text-gray-600">+91 {phoneNumber}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-lg font-bold text-gray-900">₹{parseFloat(amount).toLocaleString()}</span>
          </div>
          {description && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-600">Note:</span>
              <span className="text-sm text-gray-900">{description}</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter MPIN</h3>
          <p className="text-sm text-gray-600">Enter your 4-digit MPIN to confirm payment</p>
        </div>
        
        <div className="relative">
          <input
            type={showMpin ? "text" : "password"}
            value={mpin}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              if (value.length <= 4) {
                setMpin(value);
                setError('');
              }
            }}
            placeholder="••••"
            className="w-full px-4 py-4 text-center text-2xl font-bold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 tracking-widest"
            maxLength={4}
          />
          <button
            type="button"
            onClick={() => setShowMpin(!showMpin)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
          >
            {showMpin ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center">
          Demo MPIN: 1234 (For testing purposes)
        </p>
        
        <div className="flex space-x-3">
          <Button
            onClick={() => setStep('enter-amount')}
            variant="outline"
            className="flex-1 py-3"
          >
            Back
          </Button>
          <Button
            onClick={handleMpinSubmit}
            disabled={mpin.length !== 4 || operationLoading}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 font-semibold"
          >
            {operationLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              'Pay Now'
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="p-4 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
      <p className="text-gray-600 mb-6">
        ₹{parseFloat(amount).toLocaleString()} sent to {searchedUser.fullName}
      </p>
      
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Reference ID:</span>
            <span className="font-medium text-gray-900">{transferResult?.referenceId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To:</span>
            <span className="font-medium text-gray-900">{searchedUser.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium text-gray-900">₹{parseFloat(amount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New Balance:</span>
            <span className="font-medium text-gray-900">₹{transferResult?.newBalance?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium text-gray-900">
              {new Date(transferResult?.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button
          onClick={() => {
            // Reset all states and go back to phone input
            clearInput();
            setTransferResult(null);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          Send to Another Contact
        </Button>
        
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full py-3"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  const renderRecents = () => (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recents</h3>
      <div className="space-y-3">
        {recentTransfers.map((contact, index) => (
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
                <span className="text-green-600">₹{contact.amount} Sent on {contact.date}</span>
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
      
      {step === 'enter-phone' && (
        <>
          {renderPhoneInput()}
          {renderRecents()}
          {renderContacts()}
        </>
      )}
      
      {step === 'user-found' && renderUserFound()}
      {step === 'enter-amount' && renderAmountInput()}
      {step === 'mpin-verify' && renderMpinVerification()}
      {step === 'success' && renderSuccess()}
      
      {/* Bottom Navigation */}
      {step === 'enter-phone' && (
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
      )}
    </div>
  );
};

export default MobileTransferComponent;
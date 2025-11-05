import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getWalletBalance, 
  getTransactionHistory,
  clearError,
  initiatePhonePePayment,
  checkPaymentStatus,
  transferMoney
} from '../store/slices/walletSlice';
import { Button } from './ui/button';
import { Plus, Send, ArrowUpDown, Eye, EyeOff, MoreHorizontal, ArrowUpRight, ArrowDownLeft, Filter, X, Shield, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';

const WalletComponent = () => {
  const dispatch = useDispatch();
  const { 
    balance, 
    transactions, 
    operationLoading, 
    paymentLoading,
    error, 
    transactionsPagination,
    pendingTransactionId
  } = useSelector((state) => state.wallet);
  
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [showBalance, setShowBalance] = useState(true);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('LAST 3 MONTHS');
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showSendMoneyModal, setShowSendMoneyModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: '',
    paymentMethod: 'phonepe'
  });
  
  // Send Money States
  const [sendMoneyStep, setSendMoneyStep] = useState('enter-phone'); // 'enter-phone', 'user-found', 'enter-amount', 'mpin-verify', 'success'
  const [sendMoneyForm, setSendMoneyForm] = useState({
    phoneNumber: '',
    amount: '',
    description: '',
    mpin: ''
  });
  const [searchedUser, setSearchedUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sendMoneyError, setSendMoneyError] = useState('');
  const [transferResult, setTransferResult] = useState(null);
  const [showMpin, setShowMpin] = useState(false);
  const [recentTransfers, setRecentTransfers] = useState([]);
  
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [paymentPollingActive, setPaymentPollingActive] = useState(false);

  // Static contacts for demonstration
  const contacts = [
    { name: 'Alex Smith', phone: '9876543210', avatar: 'A' },
    { name: 'Sarah Johnson', phone: '9876543211', avatar: 'S' },
    { name: 'Mike Wilson', phone: '9876543212', avatar: 'M' }
  ];

  useEffect(() => {
    dispatch(getWalletBalance());
    dispatch(getTransactionHistory({ page: 1, limit: 10 }));
    
    // Add message listener for payment popup communication
    const handleMessage = (event) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }
      
      if (event.data.type === 'PAYMENT_COMPLETED') {
        console.log('Received payment completion message:', event.data);
        
        // Stop polling immediately
        setPaymentPollingActive(false);
        setPaymentProcessing(false);
        
        // Close payment window if still open
        if (paymentWindow && !paymentWindow.closed) {
          paymentWindow.close();
        }
        setPaymentWindow(null);
        
        if (event.data.status === 'success') {
          setPaymentResult({
            success: true,
            message: `Payment completed successfully!`,
            transactionId: event.data.transactionId
          });
          
          // Reset form and refresh wallet data
          setAddMoneyForm({ amount: '', paymentMethod: 'phonepe' });
          dispatch(getWalletBalance());
          dispatch(getTransactionHistory({ page: 1, limit: 10 }));
        } else {
          setPaymentResult({
            success: false,
            message: event.data.error || 'Payment failed. Please try again.'
          });
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [dispatch, paymentWindow]);

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

  // Send Money Functions
  const searchUserByPhone = async (phone) => {
    setSearchLoading(true);
    setSendMoneyError('');
    
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
        '9876543210': { fullName: 'John Doe', phone: '9876543210', verified: true },
        '9876543211': { fullName: 'Jane Smith', phone: '9876543211', verified: true },
      };
      
      const foundUser = mockUsers[phone];
      
      if (foundUser) {
        setSearchedUser(foundUser);
        setSendMoneyStep('user-found');
      } else {
        setSendMoneyError('User not found with this phone number');
        setSearchedUser(null);
      }
    } catch (err) {
      setSendMoneyError('Failed to search user. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 10) {
      setSendMoneyForm(prev => ({ ...prev, phoneNumber: value }));
      setSendMoneyError('');
      
      // Auto-search when 10 digits are entered
      if (value.length === 10) {
        searchUserByPhone(value);
      } else {
        setSearchedUser(null);
        setSendMoneyStep('enter-phone');
      }
    }
  };

  const handleContactSelect = (contact) => {
    setSendMoneyForm(prev => ({ ...prev, phoneNumber: contact.phone }));
    searchUserByPhone(contact.phone);
  };

  const handleSendAmountSubmit = () => {
    const transferAmount = parseFloat(sendMoneyForm.amount);
    
    if (!transferAmount || transferAmount <= 0) {
      setSendMoneyError('Please enter a valid amount');
      return;
    }
    
    if (transferAmount > balance) {
      setSendMoneyError('Insufficient balance');
      return;
    }
    
    // Check if amount is ≤ ₹10,000 for MPIN requirement
    if (transferAmount <= 10000) {
      setSendMoneyStep('mpin-verify');
    } else {
      setSendMoneyError('Amount exceeds ₹10,000 limit. Maximum allowed is ₹10,000 per transaction.');
    }
  };

  const handleSendMoneyMpinSubmit = async () => {
    if (sendMoneyForm.mpin.length !== 4) {
      setSendMoneyError('Please enter a valid 4-digit MPIN');
      return;
    }

    // Clear any previous errors
    setSendMoneyError('');
    dispatch(clearError());
    
    try {
      // Call the actual transfer API
      const transferData = {
        recipientPhone: sendMoneyForm.phoneNumber,
        amount: parseFloat(sendMoneyForm.amount),
        description: sendMoneyForm.description || `Transfer to ${searchedUser.fullName}`,
        mpin: sendMoneyForm.mpin // In real implementation, this should be encrypted
      };

      console.log('Initiating transfer:', transferData);
      
      const result = await dispatch(transferMoney(transferData));
      
      if (result.type === 'wallet/transfer/fulfilled') {
        // Transfer successful
        const responseData = result.payload.data;
        
        const successData = {
          referenceId: responseData.referenceId || responseData.transactionDetails?.senderTransactionId || `TXN${Date.now()}`,
          recipientPhone: sendMoneyForm.phoneNumber,
          recipientName: searchedUser.fullName,
          amount: parseFloat(sendMoneyForm.amount),
          description: sendMoneyForm.description || `Transfer to ${searchedUser.fullName}`,
          timestamp: new Date().toISOString(),
          newBalance: responseData.senderNewBalance || responseData.newBalance
        };
        
        setTransferResult(successData);
        setSendMoneyStep('success');
        
        // Refresh wallet balance and transaction history to get the updated data
        dispatch(getWalletBalance());
        dispatch(getTransactionHistory({ page: 1, limit: 10 }));
        
        console.log('Transfer completed successfully:', successData);
      } else {
        // Transfer failed
        const errorMessage = result.payload || 'Transfer failed. Please try again.';
        setSendMoneyError(errorMessage);
        console.error('Transfer failed:', errorMessage);
      }
    } catch (err) {
      console.error('Transfer error:', err);
      setSendMoneyError('Transfer failed. Please try again.');
    }
  };

  const clearSendMoneyForm = () => {
    setSendMoneyForm({
      phoneNumber: '',
      amount: '',
      description: '',
      mpin: ''
    });
    setSendMoneyStep('enter-phone');
    setSearchedUser(null);
    setSendMoneyError('');
    setTransferResult(null);
  };

  // Calculate transaction totals for the selected period
  const calculateTotals = () => {
    if (!transactions) return { totalIn: 0, totalOut: 0 };
    
    const totalIn = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOut = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return { totalIn, totalOut };
  };

  const { totalIn, totalOut } = calculateTotals();

  // Add Money Function
  const handleAddMoney = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(addMoneyForm.amount);
    
    if (!amount || amount <= 0) {
      setPaymentResult({
        success: false,
        message: 'Please enter a valid amount'
      });
      return;
    }
    
    if (amount < 1) {
      setPaymentResult({
        success: false,
        message: 'Minimum amount is ₹1'
      });
      return;
    }
    
    if (amount > 50000) {
      setPaymentResult({
        success: false,
        message: 'Maximum amount is ₹50,000'
      });
      return;
    }

    // Check if user data is available
    if (!user || !user.phone) {
      setPaymentResult({
        success: false,
        message: 'User phone number not available. Please refresh and try again.'
      });
      return;
    }

    try {
      setShowAddMoneyModal(false);
      setPaymentProcessing(true);
      setPaymentPollingActive(true);

      // Create payment data with all required fields for PhonePe API
      const paymentData = {
        amount: amount,
        currency: 'INR',
        paymentMethod: addMoneyForm.paymentMethod,
        mobileNumber: user.phone, // Required by PhonePe API
        name: user.fullName || 'User', // Optional but helpful
        description: `Wallet topup - ₹${amount}`, // Optional description
        userId: user.id // Optional user ID
      };

      console.log('Initiating payment:', paymentData);
      
      // Call the payment initiation API
      const result = await dispatch(initiatePhonePePayment(paymentData));
      
      if (result.type === 'wallet/initiatePhonePePayment/fulfilled') {
        const paymentResponse = result.payload.data;
        
        if (paymentResponse.paymentUrl) {
          // Open payment window
          const popup = window.open(
            paymentResponse.paymentUrl,
            'phonepe_payment',
            'width=600,height=700,scrollbars=yes,resizable=yes'
          );
          
          setPaymentWindow(popup);
          setPaymentDetails(paymentResponse);
          
          // Start polling for payment status
          const pollPaymentStatus = async () => {
            try {
              const statusResult = await dispatch(checkPaymentStatus(paymentResponse.transactionId));
              
              if (statusResult.type === 'wallet/checkPaymentStatus/fulfilled') {
                const statusData = statusResult.payload.data;
                
                if (statusData.status === 'SUCCESS') {
                  setPaymentProcessing(false);
                  setPaymentPollingActive(false);
                  
                  if (popup && !popup.closed) {
                    popup.close();
                  }
                  
                  setPaymentResult({
                    success: true,
                    message: `₹${amount} added successfully to your wallet!`,
                    transactionId: statusData.transactionId || paymentResponse.transactionId
                  });
                  
                  // Reset form and refresh wallet data
                  setAddMoneyForm({ amount: '', paymentMethod: 'phonepe' });
                  dispatch(getWalletBalance());
                  dispatch(getTransactionHistory({ page: 1, limit: 10 }));
                  
                } else if (statusData.status === 'FAILED') {
                  setPaymentProcessing(false);
                  setPaymentPollingActive(false);
                  
                  if (popup && !popup.closed) {
                    popup.close();
                  }
                  
                  setPaymentResult({
                    success: false,
                    message: statusData.message || 'Payment failed. Please try again.'
                  });
                } else if (statusData.status === 'PENDING') {
                  // Continue polling if still pending
                  if (paymentPollingActive) {
                    setTimeout(pollPaymentStatus, 3000); // Poll every 3 seconds
                  }
                }
              } else {
                // API call failed, continue polling for a bit more
                if (paymentPollingActive) {
                  setTimeout(pollPaymentStatus, 3000);
                }
              }
            } catch (err) {
              console.error('Error checking payment status:', err);
              if (paymentPollingActive) {
                setTimeout(pollPaymentStatus, 3000);
              }
            }
          };
          
          // Start polling after a short delay
          setTimeout(pollPaymentStatus, 2000);
          
          // Set a timeout to stop polling after 10 minutes
          setTimeout(() => {
            if (paymentPollingActive) {
              setPaymentProcessing(false);
              setPaymentPollingActive(false);
              
              if (popup && !popup.closed) {
                popup.close();
              }
              
              setPaymentResult({
                success: false,
                message: 'Payment timeout. Please check your transaction history or try again.'
              });
            }
          }, 600000); // 10 minutes
          
        } else {
          setPaymentProcessing(false);
          setPaymentResult({
            success: false,
            message: 'Failed to initiate payment. Please try again.'
          });
        }
      } else {
        setPaymentProcessing(false);
        const errorMessage = result.payload || 'Failed to initiate payment';
        setPaymentResult({
          success: false,
          message: errorMessage
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentProcessing(false);
      setPaymentResult({
        success: false,
        message: 'An error occurred. Please try again.'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('₹', '');
  };

  const getTransactionIcon = (transaction) => {
    if (transaction.amount > 0) {
      return (
        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
          <ArrowDownLeft className="w-5 h-5 text-green-600" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
          <ArrowUpRight className="w-5 h-5 text-red-600" />
        </div>
      );
    }
  };

  const getTransactionCategory = (transaction) => {
    const categories = {
      'deposit': 'Energy',
      'transfer': 'Transfer',
      'withdrawal': 'Withdrawal',
      'payment': 'Payment'
    };
    
    return categories[transaction.transactionType] || 'Transaction';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Payment Processing Overlay */}
      {paymentProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please complete your payment in the popup window</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                <span>Payment window opened</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                <span>Monitoring payment status...</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setPaymentProcessing(false);
                setPaymentPollingActive(false);
                if (paymentWindow && !paymentWindow.closed) {
                  paymentWindow.close();
                }
                setPaymentWindow(null);
              }}
              className="mt-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment Result Overlay */}
      {paymentResult && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                paymentResult.success 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {paymentResult.success ? (
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              
              <h3 className={`text-xl font-bold mb-2 ${
                paymentResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
              </h3>
              
              <p className="text-gray-600">{paymentResult.message}</p>
              
              {paymentResult.success && paymentResult.transactionId && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-xs text-gray-800 break-all">{paymentResult.transactionId}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {paymentResult.success && (
                <button 
                  onClick={() => setPaymentResult(null)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-colors"
                >
                  Continue
                </button>
              )}
              
              <button 
                onClick={() => {
                  setPaymentResult(null);
                  if (!paymentResult.success) {
                    setShowAddMoneyModal(true);
                  }
                }}
                className={`w-full py-3 rounded-2xl font-medium transition-colors ${
                  paymentResult.success 
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {paymentResult.success ? 'Close' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-white border border-green-200 rounded-2xl shadow-lg p-4 max-w-sm">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">Success!</h4>
                <p className="text-gray-600 text-sm mt-1">{successMessage}</p>
              </div>
              <button onClick={() => setShowSuccessToast(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      {/* <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back,</h1>
          <p className="text-gray-600">{user?.fullName || 'User'}! 👋</p>
          <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}</p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">{user?.fullName?.charAt(0) || 'U'}</span>
        </div>
      </div> */}

      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl p-6 shadow-lg text-white mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <h2 className="text-4xl font-bold text-white">
                {showBalance ? `₹${formatCurrency(balance || 0)}` : '₹••••••'}
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-1 text-white/80 hover:text-white"
              >
                {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-sm text-white/80 uppercase tracking-wide">ACCOUNT BALANCE</p>
          </div>
          <button className="p-2 text-white/80 hover:text-white">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setShowAddMoneyModal(true)}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl hover:bg-white/30 transition-colors border border-white/20"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add</span>
          </button>
          <button
            onClick={() => setShowSendMoneyModal(true)}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-colors border border-white/10"
          >
            <Send className="w-5 h-5" />
            <span className="font-medium">Send</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition-colors border border-white/10">
            <ArrowUpDown className="w-5 h-5" />
            <span className="font-medium">Exchange</span>
          </button>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Transactions</h3>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeFilter}
              onChange={(e) => setSelectedTimeFilter(e.target.value)}
              className="text-sm text-gray-600 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              <option>LAST 3 MONTHS</option>
              <option>LAST MONTH</option>
              <option>LAST WEEK</option>
            </select>
            <button className="p-2 text-gray-400 hover:text-purple-600">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">In</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalIn)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Out</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalOut)}</p>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        {transactions && transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.slice(0, 8).map((transaction, index) => (
              <div key={index} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction)}
                  <div>
                    <p className="font-medium text-gray-900">{getTransactionCategory(transaction)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })} - {transaction.description || 'Transaction'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : '-'}₹{formatCurrency(Math.abs(transaction.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowUpDown className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No transactions yet</p>
            <p className="text-gray-400 text-sm">Your transaction history will appear here</p>
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Add Money to Wallet</h2>
              <button
                onClick={() => setShowAddMoneyModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-600 mb-2">You're adding</p>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max="50000"
                    required
                    className="w-full text-2xl font-bold text-gray-900 bg-transparent border-none outline-none"
                    placeholder="0"
                    value={addMoneyForm.amount}
                    onChange={(e) => setAddMoneyForm({...addMoneyForm, amount: e.target.value})}
                  />
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-6 h-4 bg-purple-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">₹</span>
                    </div>
                    <span className="text-sm text-gray-600">INR</span>
                  </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-gray-600 mb-2">You'll get</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {addMoneyForm.amount ? parseFloat(addMoneyForm.amount).toFixed(2) : '0.00'}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="w-6 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">₹</span>
                    </div>
                    <span className="text-sm text-gray-600">INR</span>
                  </div>
                </div>
              </div>

              {addMoneyForm.amount && parseFloat(addMoneyForm.amount) > (balance || 0) && (
                <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="w-4 h-4 bg-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-sm">Large amount - Please ensure you have sufficient funds</span>
                </div>
              )}

              <div className="space-y-3 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between">
                  <span>Processing fee</span>
                  <span>₹10.04</span>
                </div>
                <div className="flex justify-between font-medium text-gray-900">
                  <span>Total amount</span>
                  <span>₹{addMoneyForm.amount ? (parseFloat(addMoneyForm.amount) + 10.04).toFixed(2) : '10.04'}</span>
                </div>
              </div>

              <p className="text-center text-sm text-gray-600">
                Money will be added instantly to your NEXASPAY wallet
              </p>
              <p className="text-center text-xs text-purple-600 font-medium">Secured by NEXASPAY</p>

              <button
                type="submit"
                disabled={!addMoneyForm.amount || paymentLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Add Money'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Send Money Modal - Complete Implementation */}
      {showSendMoneyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Send Money Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {sendMoneyStep !== 'enter-phone' && (
                  <button 
                    onClick={() => {
                      if (sendMoneyStep === 'user-found') setSendMoneyStep('enter-phone');
                      else if (sendMoneyStep === 'enter-amount') setSendMoneyStep('user-found');
                      else if (sendMoneyStep === 'mpin-verify') setSendMoneyStep('enter-amount');
                      setSendMoneyError('');
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <h1 className="text-xl font-bold text-gray-900">
                  {sendMoneyStep === 'success' ? 'Transfer Complete' : 'Send Money'}
                </h1>
              </div>
              <button
                onClick={() => {
                  setShowSendMoneyModal(false);
                  clearSendMoneyForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Error Display */}
            {sendMoneyError && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{sendMoneyError}</p>
              </div>
            )}

            {/* Step 1: Enter Phone Number */}
            {sendMoneyStep === 'enter-phone' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Enter Mobile Number</h2>
                  <p className="text-sm text-gray-600">Enter 10-digit mobile number to search user</p>
                </div>
                
                <div className="relative mb-6">
                  <input
                    type="tel"
                    value={sendMoneyForm.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="9876543210"
                    className="w-full px-4 py-4 text-2xl font-medium border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    maxLength={10}
                  />
                  {sendMoneyForm.phoneNumber && (
                    <button
                      onClick={clearSendMoneyForm}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  )}
                </div>
                
                {searchLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Searching user...</span>
                  </div>
                )}

                {/* Recent Transfers */}
                {recentTransfers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transfers</h3>
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
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600">+91 {contact.phone}</p>
                            <p className="text-xs text-gray-500">₹{contact.amount} • {contact.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Contacts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Contacts</h3>
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
              </div>
            )}

            {/* Step 2: User Found */}
            {sendMoneyStep === 'user-found' && searchedUser && (
              <div className="p-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {searchedUser.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{searchedUser.fullName}</h3>
                      <p className="text-sm text-gray-600">+91 {sendMoneyForm.phoneNumber}</p>
                      {searchedUser.verified && (
                        <div className="flex items-center space-x-1 mt-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">Verified User</span>
                        </div>
                      )}
                    </div>
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => setSendMoneyStep('enter-amount')}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg font-semibold"
                >
                  Continue to Amount
                </Button>
              </div>
            )}

            {/* Step 3: Enter Amount */}
            {sendMoneyStep === 'enter-amount' && (
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {searchedUser.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{searchedUser.fullName}</h3>
                      <p className="text-sm text-gray-600">+91 {sendMoneyForm.phoneNumber}</p>
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
                        value={sendMoneyForm.amount}
                        onChange={(e) => setSendMoneyForm(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0"
                        className="w-full pl-8 pr-4 py-4 text-2xl font-semibold border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                      value={sendMoneyForm.description}
                      onChange={(e) => setSendMoneyForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="What's this for?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                    onClick={handleSendAmountSubmit}
                    disabled={!sendMoneyForm.amount || parseFloat(sendMoneyForm.amount) <= 0 || parseFloat(sendMoneyForm.amount) > 10000 || parseFloat(sendMoneyForm.amount) > balance}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50"
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: MPIN Verification */}
            {sendMoneyStep === 'mpin-verify' && (
              <div className="p-6">
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {searchedUser.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{searchedUser.fullName}</h3>
                      <p className="text-sm text-gray-600">+91 {sendMoneyForm.phoneNumber}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-lg font-bold text-gray-900">₹{parseFloat(sendMoneyForm.amount).toLocaleString()}</span>
                    </div>
                    {sendMoneyForm.description && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Note:</span>
                        <span className="text-sm text-gray-900">{sendMoneyForm.description}</span>
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
                      value={sendMoneyForm.mpin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 4) {
                          setSendMoneyForm(prev => ({ ...prev, mpin: value }));
                          setSendMoneyError('');
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
                      onClick={() => setSendMoneyStep('enter-amount')}
                      variant="outline"
                      className="flex-1 py-3 border-2 border-gray-200"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSendMoneyMpinSubmit}
                      disabled={sendMoneyForm.mpin.length !== 4 || operationLoading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 font-semibold"
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
            )}

            {/* Step 5: Success */}
            {sendMoneyStep === 'success' && transferResult && (
              <div className="p-6 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">
                  ₹{parseFloat(sendMoneyForm.amount).toLocaleString()} sent to {searchedUser.fullName}
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
                      <span className="font-medium text-gray-900">₹{parseFloat(sendMoneyForm.amount).toLocaleString()}</span>
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
                      clearSendMoneyForm();
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3"
                  >
                    Send to Another Contact
                  </Button>
                  
                  <Button
                    onClick={() => {
                      setShowSendMoneyModal(false);
                      clearSendMoneyForm();
                    }}
                    variant="outline"
                    className="w-full py-3 border-2 border-gray-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletComponent;
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { ArrowUpRight, Shield, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const SecureTransferComponent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance, operationLoading, error } = useSelector((state) => state.wallet);

  const [transferForm, setTransferForm] = useState({
    recipientPhone: '',
    amount: '',
    description: '',
    otpCode: ''
  });

  const [transferLimits, setTransferLimits] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(null);

  // Fetch transfer limits on component mount
  useEffect(() => {
    fetchTransferLimits();
  }, []);

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const fetchTransferLimits = async () => {
    try {
      const response = await fetch('/api/v1/wallet/transfer-limits', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransferLimits(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch transfer limits:', error);
    }
  };

  const handleInputChange = (e) => {
    setTransferForm({
      ...transferForm,
      [e.target.name]: e.target.value
    });
  };

  const validateTransfer = () => {
    const { recipientPhone, amount } = transferForm;
    
    if (!recipientPhone || recipientPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit phone number');
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      throw new Error('Please enter a valid amount');
    }
    
    const transferAmount = parseFloat(amount);
    
    if (transferLimits) {
      if (transferAmount > transferLimits.limits.maxTransferAmount) {
        throw new Error(`Maximum transfer amount is ₹${transferLimits.limits.maxTransferAmount}`);
      }
      
      if (transferAmount < transferLimits.limits.minTransferAmount) {
        throw new Error(`Minimum transfer amount is ₹${transferLimits.limits.minTransferAmount}`);
      }
      
      if (transferAmount > transferLimits.balance.available) {
        throw new Error(`Insufficient balance. Available: ₹${transferLimits.balance.available}`);
      }
      
      if (transferLimits.usage.dailySpent + transferAmount > transferLimits.limits.dailyLimit) {
        throw new Error(`Daily limit exceeded. Remaining: ₹${transferLimits.usage.dailyRemaining}`);
      }
      
      if (transferLimits.usage.monthlySpent + transferAmount > transferLimits.limits.monthlyLimit) {
        throw new Error(`Monthly limit exceeded. Remaining: ₹${transferLimits.usage.monthlyRemaining}`);
      }
    }
  };

  const handleGenerateOTP = async (e) => {
    e.preventDefault();
    
    try {
      validateTransfer();
      
      const response = await fetch('/api/v1/wallet/transfer-otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientPhone: transferForm.recipientPhone,
          amount: transferForm.amount
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setShowOtpForm(true);
        setOtpTimer(600); // 10 minutes
        
        // For development, show OTP in console
        if (data.data.otp) {
          console.log('Transfer OTP:', data.data.otp);
        }
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSecureTransfer = async (e) => {
    e.preventDefault();
    
    try {
      if (!transferForm.otpCode || transferForm.otpCode.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }
      
      const response = await fetch('/api/v1/wallet/secure-transfer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transferForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransferSuccess(data.data);
        setTransferForm({
          recipientPhone: '',
          amount: '',
          description: '',
          otpCode: ''
        });
        setOtpSent(false);
        setShowOtpForm(false);
        setOtpTimer(0);
        fetchTransferLimits(); // Refresh limits
      } else {
        throw new Error(data.message || 'Transfer failed');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (transferSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Transfer Successful!</h3>
          <p className="text-gray-600 mb-4">
            ₹{transferSuccess.transferAmount} has been successfully transferred to {transferSuccess.recipient.name}
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600">
              <p><strong>Reference ID:</strong> {transferSuccess.referenceId}</p>
              <p><strong>Recipient:</strong> {transferSuccess.recipient.phone}</p>
              <p><strong>New Balance:</strong> ₹{transferSuccess.senderNewBalance}</p>
              <p><strong>Time:</strong> {new Date(transferSuccess.transactionDetails.timestamp).toLocaleString()}</p>
            </div>
          </div>
          <Button 
            onClick={() => setTransferSuccess(null)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Make Another Transfer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Secure Transfer</h3>
          <p className="text-gray-600">Send money with enhanced security</p>
        </div>
      </div>

      {/* Transfer Limits Info */}
      {transferLimits && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-blue-900 mb-2">Transfer Limits</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Daily Remaining</p>
              <p className="font-semibold text-blue-900">₹{transferLimits.usage.dailyRemaining.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-blue-700">Available Balance</p>
              <p className="font-semibold text-blue-900">₹{transferLimits.balance.available.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {!showOtpForm ? (
        <form onSubmit={handleGenerateOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              name="recipientPhone"
              value={transferForm.recipientPhone}
              onChange={handleInputChange}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500">₹</span>
              <input
                type="number"
                name="amount"
                value={transferForm.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="1"
                max="50000"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min: ₹1 | Max: ₹50,000 per transaction
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <input
              type="text"
              name="description"
              value={transferForm.description}
              onChange={handleInputChange}
              placeholder="Transfer purpose"
              maxLength="100"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button
            type="submit"
            disabled={operationLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {operationLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Generating OTP...
              </div>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Generate Secure OTP
              </>
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSecureTransfer} className="space-y-4">
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h4 className="font-medium text-yellow-800">OTP Verification Required</h4>
                <p className="text-sm text-yellow-700">
                  Enter the OTP sent to verify this secure transfer
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>To:</strong> {transferForm.recipientPhone}</p>
              <p><strong>Amount:</strong> ₹{parseFloat(transferForm.amount).toLocaleString()}</p>
              {transferForm.description && <p><strong>Purpose:</strong> {transferForm.description}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              name="otpCode"
              value={transferForm.otpCode}
              onChange={handleInputChange}
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
              required
            />
            {otpTimer > 0 && (
              <div className="flex items-center justify-center mt-2">
                <Clock className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-600">
                  OTP expires in {formatTime(otpTimer)}
                </span>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={() => {
                setShowOtpForm(false);
                setOtpSent(false);
                setOtpTimer(0);
                setTransferForm(prev => ({ ...prev, otpCode: '' }));
              }}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={operationLoading || otpTimer === 0}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {operationLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  Complete Transfer
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};

export default SecureTransferComponent;
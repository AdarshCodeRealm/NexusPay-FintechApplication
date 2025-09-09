import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkPaymentStatus, getWalletBalance } from '../store/slices/walletSlice';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isPopup, setIsPopup] = useState(false);
  const maxRetries = 5;

  useEffect(() => {
    // Check if this page is opened as a popup
    const isOpenedAsPopup = window.opener !== null && window.opener !== window;
    setIsPopup(isOpenedAsPopup);
    
    console.log('PaymentSuccess page loaded as popup:', isOpenedAsPopup);
    
    // Get transaction details from URL parameters
    const transactionId = searchParams.get('id');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');
    
    console.log('PaymentSuccess page loaded with params:', {
      transactionId,
      status,
      amount,
      isPopup: isOpenedAsPopup
    });
    
    if (transactionId) {
      // If we already have status=success from backend, show success immediately
      if (status === 'success' && amount) {
        const successData = {
          transactionId,
          status: 'SUCCESS',
          amount: parseFloat(amount)
        };
        setPaymentDetails(successData);
        setLoading(false);
        
        // Send success message to parent window if opened as popup
        if (isOpenedAsPopup) {
          console.log('Sending payment success message to parent window');
          window.opener.postMessage({
            type: 'PAYMENT_COMPLETED',
            transactionId,
            status: 'success',
            data: successData
          }, window.location.origin);
          
          // Auto-close popup after 3 seconds
          setTimeout(() => {
            console.log('Auto-closing payment popup window');
            window.close();
          }, 3000);
        }
        
        // Still refresh wallet balance
        dispatch(getWalletBalance());
      } else {
        // Otherwise check payment status
        checkPaymentStatusWithRetry(transactionId);
      }
    } else {
      setError('No transaction ID found in URL');
      setLoading(false);
      
      // Send error message to parent if popup
      if (isOpenedAsPopup) {
        window.opener.postMessage({
          type: 'PAYMENT_COMPLETED',
          status: 'failed',
          error: 'No transaction ID found'
        }, window.location.origin);
      }
    }
  }, [searchParams, dispatch]);

  const checkPaymentStatusWithRetry = async (transactionId, currentRetry = 0) => {
    try {
      console.log(`Checking payment status for transaction ${transactionId}, attempt ${currentRetry + 1}`);
      
      const result = await dispatch(checkPaymentStatus(transactionId));
      
      if (result.payload && result.payload.success) {
        const paymentData = result.payload.data;
        
        console.log('Payment status check result:', paymentData);
        
        if (paymentData.status === 'SUCCESS') {
          setPaymentDetails(paymentData);
          // Refresh wallet balance
          dispatch(getWalletBalance());
          setLoading(false);
          console.log('✅ Payment verified as successful');
          
          // Send success message to parent window if opened as popup
          if (isPopup) {
            console.log('Sending payment success message to parent window');
            window.opener.postMessage({
              type: 'PAYMENT_COMPLETED',
              transactionId,
              status: 'success',
              data: paymentData
            }, window.location.origin);
            
            // Auto-close popup after 3 seconds
            setTimeout(() => {
              console.log('Auto-closing payment popup window');
              window.close();
            }, 3000);
          }
        } else if (paymentData.status === 'FAILED') {
          setError('Payment failed. Please try again.');
          setLoading(false);
          console.log('❌ Payment failed');
          
          // Send failure message to parent if popup
          if (isPopup) {
            window.opener.postMessage({
              type: 'PAYMENT_COMPLETED',
              transactionId,
              status: 'failed',
              error: 'Payment failed'
            }, window.location.origin);
          }
        } else if (paymentData.status === 'INITIATED' || paymentData.status === 'PENDING') {
          // Payment is still in progress, retry after a delay
          if (currentRetry < maxRetries) {
            console.log(`Payment still pending, retrying in 3 seconds... (${currentRetry + 1}/${maxRetries})`);
            setTimeout(() => {
              setRetryCount(currentRetry + 1);
              checkPaymentStatusWithRetry(transactionId, currentRetry + 1);
            }, 3000);
          } else {
            setError('Payment verification timed out. Please check your transaction status in the dashboard.');
            setLoading(false);
            console.log('Payment verification timed out');
            
            // Send timeout message to parent if popup
            if (isPopup) {
              window.opener.postMessage({
                type: 'PAYMENT_COMPLETED',
                transactionId,
                status: 'timeout',
                error: 'Payment verification timed out'
              }, window.location.origin);
            }
          }
        } else {
          setError(`Unknown payment status: ${paymentData.status}`);
          setLoading(false);
          console.log('Unknown payment status:', paymentData.status);
          
          // Send error message to parent if popup
          if (isPopup) {
            window.opener.postMessage({
              type: 'PAYMENT_COMPLETED',
              transactionId,
              status: 'failed',
              error: `Unknown payment status: ${paymentData.status}`
            }, window.location.origin);
          }
        }
      } else {
        console.error('Failed to get payment status:', result);
        setError('Failed to verify payment status');
        setLoading(false);
        
        // Send error message to parent if popup
        if (isPopup) {
          window.opener.postMessage({
            type: 'PAYMENT_COMPLETED',
            transactionId,
            status: 'failed',
            error: 'Failed to verify payment status'
          }, window.location.origin);
        }
      }
    } catch (err) {
      console.error('Payment status check error:', err);
      
      // Retry on error if we haven't reached max retries
      if (currentRetry < maxRetries) {
        console.log(`Error checking payment status, retrying in 3 seconds... (${currentRetry + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(currentRetry + 1);
          checkPaymentStatusWithRetry(transactionId, currentRetry + 1);
        }, 3000);
      } else {
        setError('Failed to verify payment status after multiple attempts');
        setLoading(false);
        
        // Send error message to parent if popup
        if (isPopup) {
          window.opener.postMessage({
            type: 'PAYMENT_COMPLETED',
            transactionId,
            status: 'failed',
            error: 'Failed to verify payment status after multiple attempts'
          }, window.location.origin);
        }
      }
    }
  };

  const handleGoToDashboard = () => {
    if (isPopup) {
      // If it's a popup, close it and send message to parent
      window.opener.postMessage({
        type: 'NAVIGATE_TO_DASHBOARD'
      }, window.location.origin);
      window.close();
    } else {
      navigate('/dashboard');
    }
  };

  const handleClosePopup = () => {
    if (isPopup) {
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Verifying payment...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Checking status... ({retryCount}/{maxRetries})
            </p>
          )}
          {isPopup && (
            <p className="text-xs text-purple-600 mt-4">
              This window will close automatically when verification is complete
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={handleGoToDashboard}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                {isPopup ? 'Go to Dashboard' : 'Go to Dashboard'}
              </button>
              {isPopup && (
                <button
                  onClick={handleClosePopup}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Close Window
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">Your wallet has been topped up successfully</p>
          
          {paymentDetails && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">₹{paymentDetails.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{paymentDetails.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-semibold">{paymentDetails.status}</span>
                </div>
              </div>
            </div>
          )}
          
          {isPopup && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                🎉 Success! This window will close automatically in a few seconds.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={handleGoToDashboard}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              {isPopup ? 'Go to Dashboard' : 'Go to Dashboard'}
            </button>
            {isPopup && (
              <button
                onClick={handleClosePopup}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Close Window
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
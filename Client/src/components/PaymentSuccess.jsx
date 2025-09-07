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
  const maxRetries = 10; // Maximum number of status check retries

  useEffect(() => {
    // Check if this is opened in a popup window
    const isPopup = window.opener && window.opener !== window;
    
    const transactionId = searchParams.get('id');
    
    if (transactionId) {
      checkPaymentStatusWithRetry(transactionId, isPopup);
    } else {
      setError('No transaction ID found');
      setLoading(false);
      
      // If this is a popup and no transaction ID, close it
      if (isPopup) {
        setTimeout(() => {
          window.close();
        }, 2000);
      }
    }

    // Listen for messages from parent window (if this is a popup)
    const handleMessage = (event) => {
      if (event.data.type === 'CLOSE_POPUP') {
        window.close();
      }
    };

    if (isPopup) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      if (isPopup) {
        window.removeEventListener('message', handleMessage);
      }
    };
  }, [searchParams, dispatch]);

  const checkPaymentStatusWithRetry = async (transactionId, isPopup, currentRetry = 0) => {
    try {
      const result = await dispatch(checkPaymentStatus(transactionId));
      
      if (result.payload && result.payload.success) {
        const paymentData = result.payload.data;
        
        // Check if payment is actually successful
        if (paymentData.status === 'SUCCESS') {
          setPaymentDetails(paymentData);
          // Refresh wallet balance
          dispatch(getWalletBalance());
          
          // If this is a popup, notify parent window and close
          if (isPopup) {
            const sendMessage = () => {
              try {
                window.opener.postMessage({
                  type: 'PAYMENT_SUCCESS',
                  data: paymentData
                }, window.location.origin);
                
                window.opener.postMessage({
                  type: 'PAYMENT_SUCCESS',
                  data: paymentData
                }, '*');
              } catch (error) {
                console.error('Error sending message to parent:', error);
              }
            };
            
            sendMessage();
            setTimeout(sendMessage, 100);
            
            setTimeout(() => {
              window.close();
            }, 500);
          }
          setLoading(false);
        } else if (paymentData.status === 'FAILED') {
          // Payment explicitly failed
          setError('Payment failed. Please try again.');
          setLoading(false);
          
          if (isPopup) {
            try {
              window.opener.postMessage({
                type: 'PAYMENT_ERROR',
                error: 'Payment failed'
              }, window.location.origin);
              
              window.opener.postMessage({
                type: 'PAYMENT_ERROR',
                error: 'Payment failed'
              }, '*');
            } catch (error) {
              console.error('Error sending error message to parent:', error);
            }
            
            setTimeout(() => {
              window.close();
            }, 1000);
          }
        } else if (paymentData.status === 'INITIATED' || paymentData.status === 'PENDING') {
          // Payment is still in progress, retry after a delay
          if (currentRetry < maxRetries) {
            setTimeout(() => {
              setRetryCount(currentRetry + 1);
              checkPaymentStatusWithRetry(transactionId, isPopup, currentRetry + 1);
            }, 2000); // Wait 2 seconds before retrying
          } else {
            // Max retries reached, show error
            setError('Payment verification timed out. Please check your transaction status.');
            setLoading(false);
            
            if (isPopup) {
              try {
                window.opener.postMessage({
                  type: 'PAYMENT_ERROR',
                  error: 'Payment verification timed out'
                }, window.location.origin);
                
                window.opener.postMessage({
                  type: 'PAYMENT_ERROR',
                  error: 'Payment verification timed out'
                }, '*');
              } catch (error) {
                console.error('Error sending error message to parent:', error);
              }
              
              setTimeout(() => {
                window.close();
              }, 2000);
            }
          }
        } else {
          // Unknown status
          setError(`Unknown payment status: ${paymentData.status}`);
          setLoading(false);
        }
      } else {
        setError('Payment verification failed');
        setLoading(false);
        
        if (isPopup) {
          try {
            window.opener.postMessage({
              type: 'PAYMENT_ERROR',
              error: 'Payment verification failed'
            }, window.location.origin);
            
            window.opener.postMessage({
              type: 'PAYMENT_ERROR',
              error: 'Payment verification failed'
            }, '*');
          } catch (error) {
            console.error('Error sending error message to parent:', error);
          }
          
          setTimeout(() => {
            window.close();
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Payment status check error:', err);
      
      // Retry on error if we haven't reached max retries
      if (currentRetry < maxRetries) {
        setTimeout(() => {
          setRetryCount(currentRetry + 1);
          checkPaymentStatusWithRetry(transactionId, isPopup, currentRetry + 1);
        }, 2000);
      } else {
        setError('Failed to verify payment status');
        setLoading(false);
        
        if (isPopup) {
          try {
            window.opener.postMessage({
              type: 'PAYMENT_ERROR',
              error: 'Payment verification failed'
            }, window.location.origin);
            
            window.opener.postMessage({
              type: 'PAYMENT_ERROR',
              error: 'Payment verification failed'
            }, '*');
          } catch (error) {
            console.error('Error sending error message to parent:', error);
          }
          
          setTimeout(() => {
            window.close();
          }, 1000);
        }
      }
    }
  };

  const handleGoToWallet = () => {
    // If this is a popup, close it and let parent handle navigation
    if (window.opener && window.opener !== window) {
      window.opener.postMessage({
        type: 'NAVIGATE_TO_WALLET'
      }, window.location.origin);
      window.close();
    } else {
      navigate('/dashboard');
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
            <button
              onClick={handleGoToWallet}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Go to Dashboard
            </button>
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
          
          <button
            onClick={handleGoToWallet}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            {window.opener ? 'Close & Go to Wallet' : 'Go to Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('Payment failed');

  useEffect(() => {
    // Check if this is opened in a popup window
    const isPopup = window.opener && window.opener !== window;
    
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam.replace(/_/g, ' '));
    }

    // If this is a popup, notify parent window
    if (isPopup) {
      window.opener.postMessage({
        type: 'PAYMENT_ERROR',
        error: error
      }, window.location.origin);
      
      // Auto-close popup after 3 seconds
      setTimeout(() => {
        window.close();
      }, 3000);
    }

    // Listen for messages from parent window (if this is a popup)
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      
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
  }, [searchParams, error]);

  const handleRetry = () => {
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

  const handleGoHome = () => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-6 capitalize">{error}</p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-sm">
              Your payment could not be processed. No amount has been charged from your account.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              {window.opener ? 'Close & Go to Dashboard' : 'Go to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
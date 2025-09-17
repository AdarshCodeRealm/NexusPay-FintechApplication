import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Eye, Clock, CheckCircle, AlertCircle, Building } from 'lucide-react';
import { API_BASE_URL } from '../lib/api';

const PublicReceiptViewer = () => {
  const { shareToken } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        // Use direct fetch for public endpoints to avoid authentication headers
        const response = await fetch(`${API_BASE_URL}/payments/public-receipt/${shareToken}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to load receipt');
        }
        
        const data = await response.json();
        setReceipt(data.data);
      } catch (err) {
        console.error('Failed to fetch receipt:', err);
        setError(err.message || 'Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    if (shareToken) {
      fetchReceipt();
    }
  }, [shareToken]);

  const handleDownloadReceipt = async () => {
    try {
      setDownloading(true);
      
      // Use direct fetch for public download endpoint
      const response = await fetch(`${API_BASE_URL}/payments/public-receipt/${shareToken}/download`, {
        method: 'GET',
        headers: {
          // No authentication headers for public endpoints
        }
      });
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      // Get the blob data
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NEXASPAY-Receipt-${receipt?.transaction?.referenceId || shareToken}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('Receipt downloaded successfully');
    } catch (err) {
      console.error('Download failed:', err);
      alert(`Failed to download receipt: ${err.message}. Please try again.`);
    } finally {
      setDownloading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return amount >= 0 ? `+₹${absAmount.toLocaleString()}` : `-₹${absAmount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Receipt Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">The receipt link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const transaction = receipt?.transaction;
  const isExpired = receipt?.expiresAt && new Date(receipt.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NEXASPAY</h1>
          <p className="text-gray-600">Digital Wallet Transaction Receipt</p>
          {isExpired && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">⚠️ This receipt link has expired</p>
            </div>
          )}
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Transaction Status Banner */}
          <div className={`px-6 py-4 ${
            transaction?.status === 'completed' || transaction?.status === 'success' 
              ? 'bg-green-50 border-b border-green-200' 
              : transaction?.status === 'pending'
              ? 'bg-yellow-50 border-b border-yellow-200'
              : 'bg-red-50 border-b border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(transaction?.status)}
                <span className={`font-medium ${
                  transaction?.status === 'completed' || transaction?.status === 'success'
                    ? 'text-green-800'
                    : transaction?.status === 'pending'
                    ? 'text-yellow-800'
                    : 'text-red-800'
                }`}>
                  Transaction {transaction?.status === 'completed' || transaction?.status === 'success' ? 'Successful' : transaction?.status?.toUpperCase()}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {formatDate(transaction?.createdAt)}
              </span>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="p-6">
            {/* Amount Section */}
            <div className="text-center mb-8 p-6 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-2">Transaction Amount</p>
              <p className={`text-4xl font-bold mb-2 ${
                transaction?.amount >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatAmount(transaction?.amount || 0)}
              </p>
              <p className="text-sm text-gray-500">
                {transaction?.amount >= 0 ? 'Credit Transaction' : 'Debit Transaction'}
              </p>
            </div>

            {/* Transaction Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Transaction Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Transaction ID</p>
                    <p className="font-mono text-sm">{transaction?.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Reference ID</p>
                    <p className="font-mono text-sm">{transaction?.referenceId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Type</p>
                    <p className="text-sm">{transaction?.type?.replace('_', ' ').toUpperCase() || 'Transaction'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Description</p>
                    <p className="text-sm">{transaction?.description || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Account Holder</p>
                    <p className="text-sm">{transaction?.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Phone Number</p>
                    <p className="text-sm font-mono">{transaction?.user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Balance After Transaction</p>
                    <p className="text-sm font-medium">₹{transaction?.balanceAfter?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Transaction Date</p>
                    <p className="text-sm">{formatDate(transaction?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownloadReceipt}
                  disabled={downloading}
                  className={`flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 ${
                    downloading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Download className={`w-5 h-5 ${downloading ? 'animate-spin' : ''}`} />
                  <span>{downloading ? 'Downloading...' : 'Download PDF Receipt'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Print Receipt</span>
                </button>
              </div>
            </div>

            {/* Receipt Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm flex items-center justify-center space-x-2">
                  <Building className="w-4 h-4" />
                  <span>This is a computer-generated receipt and does not require a signature.</span>
                </p>
              </div>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>NEXASPAY Digital Wallet Solutions</p>
                <p>Secure • Fast • Reliable</p>
                {receipt?.sharedAt && (
                  <p>Shared on: {formatDate(receipt.sharedAt)}</p>
                )}
                {receipt?.expiresAt && (
                  <p>Link expires: {formatDate(receipt.expiresAt)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicReceiptViewer;
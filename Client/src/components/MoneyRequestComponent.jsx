import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { moneyRequestAPI } from '../lib/api';
import { getWalletBalance } from '../store/slices/walletSlice';
import { 
  ArrowLeft, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  DollarSign,
  X
} from 'lucide-react';
import PropTypes from 'prop-types';

const MoneyRequestComponent = ({ onBack, initialTab = 'create' }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { balance } = useSelector((state) => state.wallet);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create request state
  const [createForm, setCreateForm] = useState({
    payerPhone: '',
    amount: '',
    description: '',
    expiresIn: '168' // 7 days in hours
  });

  // Requests state
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [stats, setStats] = useState(null);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState({
    show: false,
    request: null,
    mpin: ''
  });

  const fetchRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      const params = {
        type: activeTab === 'sent' ? 'sent' : activeTab === 'received' ? 'received' : 'all',
        limit: 50
      };
      
      const response = await moneyRequestAPI.getRequests(params);
      
      if (response.success) {
        setRequests(response.data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  }, [activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await moneyRequestAPI.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== 'create') {
      fetchRequests();
      fetchStats();
    }
  }, [activeTab, fetchRequests, fetchStats]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!createForm.payerPhone || !createForm.amount) {
      setError('Phone number and amount are required');
      return;
    }

    if (createForm.payerPhone === user?.phone) {
      setError('Cannot request money from yourself');
      return;
    }

    const amount = parseFloat(createForm.amount);
    if (amount < 1 || amount > 50000) {
      setError('Amount must be between ₹1 and ₹50,000');
      return;
    }

    try {
      setLoading(true);
      const response = await moneyRequestAPI.createRequest({
        payerPhone: createForm.payerPhone,
        amount: amount,
        description: createForm.description,
        expiresIn: parseInt(createForm.expiresIn)
      });

      if (response.success) {
        setSuccess(`Money request sent successfully! Reference: ${response.data.moneyRequest.requestReference}`);
        setCreateForm({
          payerPhone: '',
          amount: '',
          description: '',
          expiresIn: '168'
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to create money request');
    } finally {
      setLoading(false);
    }
  };

  const handlePayRequest = async () => {
    if (!paymentModal.mpin || paymentModal.mpin.length !== 4) {
      setError('Please enter a valid 4-digit MPIN');
      return;
    }

    try {
      setLoading(true);
      const response = await moneyRequestAPI.payRequest(paymentModal.request.id, paymentModal.mpin);
      
      if (response.success) {
        setSuccess('Payment completed successfully!');
        setPaymentModal({ show: false, request: null, mpin: '' });
        fetchRequests();
        dispatch(getWalletBalance());
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRequest = async (requestId, reason = '') => {
    try {
      const response = await moneyRequestAPI.declineRequest(requestId, reason);
      if (response.success) {
        setSuccess('Request declined successfully');
        fetchRequests();
      }
    } catch (err) {
      setError(err.message || 'Failed to decline request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const response = await moneyRequestAPI.cancelRequest(requestId);
      if (response.success) {
        setSuccess('Request cancelled successfully');
        fetchRequests();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-gray-600" />;
      case 'expired':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'declined':
        return 'text-red-600 bg-red-50';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50';
      case 'expired':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Money Requests</h1>
                <p className="text-sm text-gray-500">Request or pay money easily</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-lg font-semibold text-gray-900">₹{balance?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'create', label: 'Request Money', icon: Send },
              { id: 'sent', label: 'Sent Requests', icon: ArrowLeft },
              { id: 'received', label: 'Received Requests', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Request Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Request Money</h2>
                  <p className="text-gray-600">Send a payment request to someone</p>
                </div>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payer&apos;s Phone Number
                  </label>
                  <input
                    type="tel"
                    value={createForm.payerPhone}
                    onChange={(e) => setCreateForm({ ...createForm, payerPhone: e.target.value })}
                    placeholder="Enter phone number (10 digits)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength="10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={createForm.amount}
                    onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                    max="50000"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: ₹1, Maximum: ₹50,000</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    placeholder="What's this request for?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    maxLength="200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires In
                  </label>
                  <select
                    value={createForm.expiresIn}
                    onChange={(e) => setCreateForm({ ...createForm, expiresIn: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="24">1 Day</option>
                    <option value="72">3 Days</option>
                    <option value="168">1 Week</option>
                    <option value="336">2 Weeks</option>
                    <option value="720">1 Month</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Sending Request...</span>
                    </div>
                  ) : (
                    'Send Money Request'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Requests List */}
        {activeTab !== 'create' && (
          <div>
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Pending {activeTab === 'sent' ? 'Sent' : 'Received'}</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {activeTab === 'sent' ? stats.sent?.pending || 0 : stats.received?.pending || 0}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {activeTab === 'sent' ? stats.sent?.paid || 0 : stats.received?.paid || 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-purple-600">
                        ₹{(activeTab === 'sent' ? stats.sent?.totalAmountReceived || 0 : stats.received?.totalAmountPaid || 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Requests List */}
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'sent' ? 'Sent Requests' : 'Received Requests'}
                </h3>
              </div>

              <div className="divide-y divide-gray-200">
                {requestsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading requests...</p>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                    <p className="text-gray-500">
                      {activeTab === 'sent' 
                        ? "You haven't sent any money requests yet" 
                        : "You haven't received any money requests yet"
                      }
                    </p>
                  </div>
                ) : (
                  requests.map((request) => {
                    const isRequester = request.requesterId === user?.id;
                    const otherUser = isRequester ? request.payer : request.requester;
                    
                    return (
                      <div key={request.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {otherUser?.fullName || 'Unknown User'}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{otherUser?.phone}</p>
                              <p className="text-2xl font-bold text-gray-900 mt-2">₹{parseFloat(request.amount).toLocaleString()}</p>
                              {request.description && (
                                <p className="text-gray-600 mt-1">{request.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                <span>Ref: {request.requestReference}</span>
                                <span>•</span>
                                <span>{formatDate(request.createdAt)}</span>
                                {request.expiresAt && (
                                  <>
                                    <span>•</span>
                                    <span>Expires: {formatDate(request.expiresAt)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            
                            {/* Action buttons */}
                            {request.status === 'pending' && (
                              <div className="flex items-center space-x-2 ml-4">
                                {!isRequester ? (
                                  // Received request - can pay or decline
                                  <>
                                    <button
                                      onClick={() => setPaymentModal({ show: true, request, mpin: '' })}
                                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      Pay Now
                                    </button>
                                    <button
                                      onClick={() => handleDeclineRequest(request.id)}
                                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                      Decline
                                    </button>
                                  </>
                                ) : (
                                  // Sent request - can cancel
                                  <button
                                    onClick={() => handleCancelRequest(request.id)}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {paymentModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Pay Money Request</h3>
              <button
                onClick={() => setPaymentModal({ show: false, request: null, mpin: '' })}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Amount to Pay</p>
                <p className="text-3xl font-bold text-gray-900">₹{parseFloat(paymentModal.request?.amount || 0).toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">
                  To: {paymentModal.request?.requester?.fullName}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter MPIN
              </label>
              <input
                type="password"
                value={paymentModal.mpin}
                onChange={(e) => setPaymentModal({ ...paymentModal, mpin: e.target.value })}
                placeholder="Enter 4-digit MPIN"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-lg tracking-widest"
                maxLength="4"
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setPaymentModal({ show: false, request: null, mpin: '' })}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayRequest}
                disabled={loading || paymentModal.mpin.length !== 4}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MoneyRequestComponent.propTypes = {
  onBack: PropTypes.func.isRequired,
  initialTab: PropTypes.oneOf(['create', 'sent', 'received'])
};

export default MoneyRequestComponent;
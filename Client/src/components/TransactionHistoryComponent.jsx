import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getTransactionHistory, 
  generateBulkReceipt,
  generateIndividualReceiptAction,
  shareTransactionReceiptAction,
  printTransactionReceiptAction
} from '../store/slices/walletSlice';
import { Button } from './ui/button';
import { 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft,
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Printer,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Building,
  TrendingUp,
  TrendingDown,
  Receipt
} from 'lucide-react';
import PropTypes from 'prop-types';

const TransactionHistoryComponent = ({ onBack }) => {
  const dispatch = useDispatch();
  const { 
    transactions, 
    transactionLoading, 
    transactionsPagination, 
    balance,
    error,
    operationLoading
  } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);

  // State for filters and search
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    amountFrom: '',
    amountTo: ''
  });
  
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  // Filter transactions locally for better performance
  const applyFilters = useCallback(() => {
    if (!transactions) {
      setFilteredTransactions([]);
      return;
    }

    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(transaction => 
        (transaction.description || '').toLowerCase().includes(searchTerm) ||
        (transaction.referenceId || transaction.referenceNumber || '').toLowerCase().includes(searchTerm) ||
        (transaction.beneficiaryName || '').toLowerCase().includes(searchTerm) ||
        (transaction.beneficiaryAccount || '').toLowerCase().includes(searchTerm)
      );
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => {
        const transactionType = (transaction.transactionType || transaction.type || '').toLowerCase();
        return transactionType === filters.type.toLowerCase() || 
               transactionType.includes(filters.type.toLowerCase());
      });
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => 
        (transaction.status || '').toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(transaction => 
        new Date(transaction.createdAt) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(transaction => 
        new Date(transaction.createdAt) <= toDate
      );
    }

    // Amount range filter
    if (filters.amountFrom) {
      const minAmount = parseFloat(filters.amountFrom);
      filtered = filtered.filter(transaction => 
        Math.abs(transaction.amount) >= minAmount
      );
    }

    if (filters.amountTo) {
      const maxAmount = parseFloat(filters.amountTo);
      filtered = filtered.filter(transaction => 
        Math.abs(transaction.amount) <= maxAmount
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  // Apply filters whenever transactions or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Load transactions on component mount
  const loadTransactions = useCallback(() => {
    const params = {
      page: 1,
      limit: 100, // Load more transactions for better filtering
    };
    
    dispatch(getTransactionHistory(params));
  }, [dispatch]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const loadMoreTransactions = () => {
    const nextPage = transactionsPagination.page + 1;
    if (nextPage <= transactionsPagination.pages) {
      const params = {
        page: nextPage,
        limit: transactionsPagination.limit,
      };
      dispatch(getTransactionHistory(params));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      amountFrom: '',
      amountTo: ''
    });
  };

  // Individual receipt download
  const handleDownloadReceipt = async (transaction) => {
    try {
      await dispatch(generateIndividualReceiptAction({ transaction, user })).unwrap();
      // Show success notification
      alert(`Receipt downloaded successfully for transaction ${transaction.referenceId || transaction.id}`);
    } catch (error) {
      console.error('Failed to download receipt:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  // Share receipt functionality
  const handleShareReceipt = async (transaction) => {
    try {
      await dispatch(shareTransactionReceiptAction({ transaction, user })).unwrap();
    } catch (error) {
      console.error('Failed to share receipt:', error);
      alert('Failed to share receipt. Please try again.');
    }
  };

  // Print receipt functionality
  const handlePrintReceipt = async (transaction) => {
    try {
      await dispatch(printTransactionReceiptAction({ transaction, user })).unwrap();
    } catch (error) {
      console.error('Failed to print receipt:', error);
      alert('Failed to print receipt. Please try again.');
    }
  };

  const handleGenerateCompleteReport = async () => {
    if (!filteredTransactions || filteredTransactions.length === 0) {
      alert('No transactions available to generate report');
      return;
    }

    try {
      const dateRange = filters.dateFrom && filters.dateTo 
        ? `${filters.dateFrom} to ${filters.dateTo}`
        : 'All Time';
      
      await dispatch(generateBulkReceipt({
        transactions: filteredTransactions,
        user,
        dateRange
      })).unwrap();
      
      // Show success message
      alert(`Complete transaction report generated successfully! (${filteredTransactions.length} transactions)`);
    } catch (error) {
      console.error('Failed to generate complete report:', error);
      alert('Failed to generate complete report. Please try again.');
    }
  };

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId)
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  const selectAllTransactions = () => {
    if (selectedTransactions.length === filteredTransactions?.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(filteredTransactions?.map(t => t.id) || []);
    }
  };

  // Debug logging
  console.log('Transaction History Debug:', {
    transactions: transactions?.length || 0,
    filtered: filteredTransactions?.length || 0,
    loading: transactionLoading,
    error: error,
    pagination: transactionsPagination,
    filters: filters
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ArrowDownLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-sm text-gray-500">
                  Showing {filteredTransactions?.length || 0} of {transactions?.length || 0} transactions
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleGenerateCompleteReport}
                disabled={operationLoading || !filteredTransactions || filteredTransactions.length === 0}
                className="flex items-center space-x-2"
              >
                <Receipt className="w-4 h-4" />
                <span>
                  {operationLoading ? 'Generating...' : `Generate Report (${filteredTransactions?.length || 0})`}
                </span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                className="flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>{viewMode === 'card' ? 'Table' : 'Cards'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={loadTransactions}
                disabled={transactionLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${transactionLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards - Compact for mobile, regular for desktop */}
        <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-6 mb-6">
          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 rounded-lg md:rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-2 md:mb-0">
                <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
              </div>
              <div className="text-center md:text-left md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  <span className="md:hidden">Income</span>
                  <span className="hidden md:inline">Total Income</span>
                </p>
                <p className="text-sm md:text-2xl font-bold text-gray-900">
                  ₹{filteredTransactions?.filter(t => t.amount > 0)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                    .toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-red-100 rounded-lg md:rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-2 md:mb-0">
                <TrendingDown className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
              </div>
              <div className="text-center md:text-left md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  <span className="md:hidden">Expenses</span>
                  <span className="hidden md:inline">Total Expenses</span>
                </p>
                <p className="text-sm md:text-2xl font-bold text-gray-900">
                  ₹{filteredTransactions?.filter(t => t.amount < 0)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                    .toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-2 md:mb-0">
                <FileText className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
              </div>
              <div className="text-center md:text-left md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  <span className="md:hidden">Filtered</span>
                  <span className="hidden md:inline">Filtered Transactions</span>
                </p>
                <p className="text-sm md:text-2xl font-bold text-gray-900">{filteredTransactions?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-100 rounded-lg md:rounded-xl flex items-center justify-center mx-auto md:mx-0 mb-2 md:mb-0">
                <CreditCard className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
              </div>
              <div className="text-center md:text-left md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">
                  <span className="md:hidden">Balance</span>
                  <span className="hidden md:inline">Current Balance</span>
                </p>
                <p className="text-sm md:text-2xl font-bold text-gray-900">₹{balance?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 mb-6">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by description, reference ID, beneficiary..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="transfer">Transfers</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="payment">Payments</option>
                  <option value="recharge">Recharges</option>
                  <option value="wallet_topup">Wallet Top-up</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                  <span>More Filters</span>
                  {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <input
                  type="checkbox"
                  checked={selectedTransactions.length === filteredTransactions?.length && filteredTransactions?.length > 0}
                  onChange={selectAllTransactions}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-600">Select All ({selectedTransactions.length})</span>
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={filters.amountFrom}
                    onChange={(e) => handleFilterChange('amountFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                  <input
                    type="number"
                    placeholder="₹10,000"
                    value={filters.amountTo}
                    onChange={(e) => handleFilterChange('amountTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredTransactions?.length || 0} of {transactions?.length || 0} transactions
                </div>
                <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-700 font-medium">Error loading transactions: {error}</p>
            </div>
          </div>
        )}

        {/* Transaction List */}
        <div className="space-y-4">
          {transactionLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            <>
              {filteredTransactions.map((transaction) => (
                <TransactionCard 
                  key={transaction.id || transaction.referenceNumber || Math.random()} 
                  transaction={transaction} 
                  onToggleSelection={toggleTransactionSelection}
                  selectedTransactions={selectedTransactions}
                  onExpandToggle={setExpandedTransaction}
                  expandedTransaction={expandedTransaction}
                  onDownloadReceipt={handleDownloadReceipt}
                  onShareReceipt={handleShareReceipt}
                  onPrintReceipt={handlePrintReceipt}
                  operationLoading={operationLoading}
                />
              ))}
              
              {/* Load More Button */}
              {transactionsPagination?.page < transactionsPagination?.pages && (
                <div className="text-center py-6">
                  <Button
                    onClick={loadMoreTransactions}
                    variant="outline"
                    disabled={transactionLoading}
                    className="px-8"
                  >
                    {transactionLoading ? 'Loading...' : 'Load More Transactions'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Transactions Found</h3>
              <p className="text-gray-500 mb-6">
                {transactions?.length === 0 
                  ? "You haven't made any transactions yet." 
                  : "No transactions match your current filters."
                }
              </p>
              {transactions?.length > 0 && (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced TransactionCard component with working receipt actions
const TransactionCard = ({ 
  transaction, 
  onToggleSelection, 
  selectedTransactions, 
  onExpandToggle, 
  expandedTransaction,
  onDownloadReceipt,
  onShareReceipt, 
  onPrintReceipt,
  operationLoading
}) => {
  const getTransactionIcon = (transaction) => {
    const type = transaction.transactionType || transaction.type;
    const amount = transaction.amount;

    if (type === 'deposit' || type === 'wallet_topup' || amount > 0) {
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    } else if (type === 'transfer' || type === 'wallet_transfer') {
      return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
    } else if (type === 'withdrawal') {
      return <Building className="w-5 h-5 text-orange-600" />;
    } else if (type === 'payment' || type === 'recharge') {
      return <CreditCard className="w-5 h-5 text-purple-600" />;
    }
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return amount >= 0 ? `+₹${absAmount.toLocaleString()}` : `-₹${absAmount.toLocaleString()}`;
  };

  // Parse metadata safely
  let metadata = {};
  try {
    metadata = JSON.parse(transaction.transactionMetadata || '{}');
  } catch (e) {
    metadata = {};
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedTransactions.includes(transaction.id)}
                onChange={() => onToggleSelection(transaction.id)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                {getTransactionIcon(transaction)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {transaction.description || `${(transaction.transactionType || transaction.type || 'Transaction').replace('_', ' ').toUpperCase()}`}
                </h3>
                {getStatusIcon(transaction.status)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{new Date(transaction.createdAt).toLocaleDateString('en-IN')}</span>
                <span>{new Date(transaction.createdAt).toLocaleTimeString('en-IN')}</span>
                <span className="font-mono text-xs">
                  ID: {transaction.referenceId || transaction.referenceNumber || transaction.id}
                </span>
              </div>
              {/* Show beneficiary info if available */}
              {(transaction.beneficiaryName || transaction.beneficiaryAccount) && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <span>To:</span>
                  <span className="font-medium">
                    {transaction.beneficiaryName || transaction.beneficiaryAccount}
                  </span>
                  {transaction.beneficiaryAccount && transaction.beneficiaryName && (
                    <span className="font-mono text-xs">({transaction.beneficiaryAccount})</span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold text-lg ${
              transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatAmount(transaction.amount)}
            </p>
            <p className="text-sm text-gray-500">
              Balance: ₹{(transaction.balanceAfter || transaction.closingBalance || 0).toLocaleString()}
            </p>
            {/* Show transaction fees if available */}
            {transaction.transactionMetadata && metadata.fee && (
              <p className="text-xs text-gray-400">
                Fee: ₹{metadata.fee}
              </p>
            )}
          </div>
        </div>

        {/* Expandable details */}
        {expandedTransaction === transaction.id && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 font-medium">Transaction Type</p>
                <p className="text-gray-900">
                  {(transaction.transactionType || transaction.type || 'Unknown').replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Reference ID</p>
                <p className="text-gray-900 font-mono text-xs">
                  {transaction.referenceId || transaction.referenceNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Payment Method</p>
                <p className="text-gray-900">
                  {metadata.paymentMethod || 'WALLET'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 font-medium">Processing Time</p>
                <p className="text-gray-900">{new Date(transaction.createdAt).toLocaleString('en-IN')}</p>
              </div>
              
              {/* Additional metadata if available */}
              {transaction.openingBalance !== undefined && (
                <div>
                  <p className="text-gray-500 font-medium">Opening Balance</p>
                  <p className="text-gray-900">₹{transaction.openingBalance.toLocaleString()}</p>
                </div>
              )}
              
              {transaction.transactionMetadata && metadata.authMethod && (
                <div>
                  <p className="text-gray-500 font-medium">Auth Method</p>
                  <p className="text-gray-900">{metadata.authMethod.toUpperCase()}</p>
                </div>
              )}
            </div>
            
            {/* Receipt Actions */}
            <div className="flex items-center space-x-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDownloadReceipt(transaction)}
                disabled={operationLoading}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>{operationLoading ? 'Downloading...' : 'Download Receipt'}</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onShareReceipt(transaction)}
                disabled={operationLoading}
                className="flex items-center space-x-1"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPrintReceipt(transaction)}
                disabled={operationLoading}
                className="flex items-center space-x-1"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </Button>
            </div>
          </div>
        )}

        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => onExpandToggle(expandedTransaction === transaction.id ? null : transaction.id)}
            className="text-purple-600 text-sm font-medium flex items-center space-x-1 hover:text-purple-700 transition-colors"
          >
            <span>{expandedTransaction === transaction.id ? 'Less' : 'More'} details</span>
            {expandedTransaction === transaction.id ? 
              <ChevronUp className="w-4 h-4" /> : 
              <ChevronDown className="w-4 h-4" />
            }
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onDownloadReceipt(transaction)}
              disabled={operationLoading}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
              title="Download Receipt"
            >
              <Download className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onShareReceipt(transaction)}
              disabled={operationLoading}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
              title="Share Receipt"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onPrintReceipt(transaction)}
              disabled={operationLoading}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onExpandToggle(expandedTransaction === transaction.id ? null : transaction.id)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced PropTypes for better type checking
TransactionHistoryComponent.propTypes = {
  onBack: PropTypes.func
};

TransactionCard.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
    amount: PropTypes.number,
    status: PropTypes.string,
    createdAt: PropTypes.string,
    transactionType: PropTypes.string,
    type: PropTypes.string,
    referenceId: PropTypes.string,
    referenceNumber: PropTypes.string,
    balanceAfter: PropTypes.number,
    closingBalance: PropTypes.number,
    openingBalance: PropTypes.number,
    paymentMethod: PropTypes.string,
    transactionMetadata: PropTypes.string,
    beneficiaryName: PropTypes.string,
    beneficiaryAccount: PropTypes.string
  }).isRequired,
  onToggleSelection: PropTypes.func.isRequired,
  selectedTransactions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])).isRequired,
  onExpandToggle: PropTypes.func.isRequired,
  expandedTransaction: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onDownloadReceipt: PropTypes.func.isRequired,
  onShareReceipt: PropTypes.func.isRequired,
  onPrintReceipt: PropTypes.func.isRequired,
  operationLoading: PropTypes.bool.isRequired
};

export default TransactionHistoryComponent;
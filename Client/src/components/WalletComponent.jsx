import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getWalletBalance, 
  addMoneyToWallet, 
  withdrawMoney, 
  getTransactionHistory,
  clearError 
} from '../store/slices/walletSlice';
import { Button } from './ui/button';

const WalletComponent = () => {
  const dispatch = useDispatch();
  const { balance, transactions, loading, operationLoading, error, transactionsPagination } = useSelector((state) => state.wallet);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [addMoneyForm, setAddMoneyForm] = useState({
    amount: '',
    paymentMethod: 'upi'
  });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    bankAccount: '',
    ifscCode: '',
    accountHolderName: ''
  });

  useEffect(() => {
    dispatch(getWalletBalance());
    dispatch(getTransactionHistory({ page: 1, limit: 10 }));
  }, [dispatch]);

  const handleAddMoney = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(addMoneyToWallet({
      amount: parseFloat(addMoneyForm.amount),
      paymentMethod: addMoneyForm.paymentMethod,
      paymentDetails: {
        gatewayName: addMoneyForm.paymentMethod,
        gatewayTransactionId: `TEST_${Date.now()}`
      }
    }));
    setAddMoneyForm({ amount: '', paymentMethod: 'upi' });
    dispatch(getWalletBalance());
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(withdrawMoney(withdrawForm));
    setWithdrawForm({
      amount: '',
      bankAccount: '',
      ifscCode: '',
      accountHolderName: ''
    });
    dispatch(getWalletBalance());
  };

  const loadMoreTransactions = () => {
    const nextPage = transactionsPagination.page + 1;
    if (nextPage <= transactionsPagination.pages) {
      dispatch(getTransactionHistory({ 
        page: nextPage, 
        limit: transactionsPagination.limit 
      }));
    }
  };

  const cards = [
    {
      id: 1,
      type: 'Salary',
      number: '** 6017',
      balance: 2230,
      gradient: 'bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600'
    },
    {
      id: 2,
      type: 'Credit card',
      number: '** 4123',
      balance: 5230,
      gradient: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600'
    },
    {
      id: 3,
      type: 'Savings',
      number: '** 7891',
      balance: 980,
      gradient: 'bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600'
    }
  ];

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cards</h1>
        <button className="p-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Desktop Grid Layout */}
      <div className="md:grid md:grid-cols-3 md:gap-8">
        {/* Main Card Display - Mobile: Full width, Desktop: First 2 columns */}
        <div className="md:col-span-2">
          <div className={`${cards[0].gradient} rounded-3xl p-6 md:p-8 text-white shadow-2xl`}>
            {/* Card Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/80 text-sm">{cards[0].type}</p>
                <h2 className="text-4xl md:text-5xl font-bold mt-1">₹{(balance || cards[0].balance).toFixed(0)}</h2>
              </div>
              <div className="text-white/60 text-2xl">💳</div>
            </div>

            {/* Card Number */}
            <div className="mb-6">
              <p className="text-white/80 text-lg tracking-wider">{cards[0].number}</p>
            </div>

            {/* Visa Logo */}
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="h-1 w-8 bg-white/30 rounded"></div>
                <div className="h-1 w-12 bg-white/50 rounded"></div>
              </div>
              <div className="text-white/90 font-bold text-xl tracking-wider">VISA</div>
            </div>

            {/* Quick Actions */}
            <div className="flex justify-center space-x-8 mt-8 pt-6 border-t border-white/20">
              <button 
                onClick={() => setActiveTab('add-money')}
                className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">+</span>
                </div>
                <span className="text-white/80 text-sm">Add money</span>
              </button>
              
              <button className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⏸</span>
                </div>
                <span className="text-white/80 text-sm">Freeze</span>
              </button>
              
              <button className="flex flex-col items-center space-y-2 hover:scale-105 transition-transform">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⚙️</span>
                </div>
                <span className="text-white/80 text-sm">Settings</span>
              </button>
            </div>
          </div>

          {/* Desktop Add Money Form - Positioned below main card */}
          {activeTab === 'add-money' && (
            <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 md:bg-white md:shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Add Money</h3>
              <form onSubmit={handleAddMoney} className="space-y-4">
                <div className="md:grid md:grid-cols-2 md:gap-4 md:space-y-0 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 md:bg-white"
                      placeholder="Enter amount"
                      value={addMoneyForm.amount}
                      onChange={(e) => setAddMoneyForm({...addMoneyForm, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 md:bg-white"
                      value={addMoneyForm.paymentMethod}
                      onChange={(e) => setAddMoneyForm({...addMoneyForm, paymentMethod: e.target.value})}
                    >
                      <option value="upi">UPI</option>
                      <option value="netbanking">Net Banking</option>
                      <option value="card">Debit/Credit Card</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {operationLoading ? 'Processing...' : 'Add Money'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Desktop Side Panel - Other Cards */}
        <div className="hidden md:block space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Cards</h3>
          {cards.slice(1).map((card, index) => (
            <div key={card.id} className={`${card.gradient} rounded-2xl p-4 text-white shadow-lg hover:shadow-xl transition-shadow cursor-pointer`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-white/80 text-xs">{card.type}</p>
                  <p className="text-white font-semibold text-lg">₹{card.balance.toFixed(0)}</p>
                </div>
                <div className="text-white/60 text-lg">💳</div>
              </div>
              <p className="text-white/60 text-sm">{card.number}</p>
            </div>
          ))}
          
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Quick Stats</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Balance</span>
                <span className="font-semibold text-gray-900">₹{(balance || 8440).toFixed(0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Cards</span>
                <span className="font-semibold text-gray-900">{cards.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transactions</span>
                <span className="font-semibold text-gray-900">{transactions?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions - Responsive */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
          <button 
            onClick={() => setActiveTab('transactions')}
            className="text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors"
          >
            See all
          </button>
        </div>
        
        {transactions && transactions.length > 0 ? (
          <div className="space-y-3 md:bg-white md:rounded-2xl md:p-6 md:shadow-sm md:border md:border-gray-200">
            {transactions.slice(0, 5).map((transaction, index) => (
              <div key={index} className="transaction-item md:bg-gray-50 md:border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-xl ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'wallet_topup' ? '💰' : 
                       transaction.type === 'wallet_transfer' ? '💸' : 
                       transaction.type === 'withdrawal' ? '🏦' : '📱'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-8 text-center border border-white/20 md:bg-white md:shadow-sm md:border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <p className="text-gray-600 font-medium">No transaction yet</p>
            <p className="text-gray-400 text-sm mt-1">Your transactions will appear here</p>
          </div>
        )}
      </div>

      {/* All Transactions Modal/View - Full width on desktop */}
      {activeTab === 'transactions' && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 md:bg-white md:shadow-lg md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">All Transactions</h3>
            <button 
              onClick={() => setActiveTab('overview')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {transactions && transactions.length > 0 ? (
            <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
              {transactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <span className={`text-xl ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'wallet_topup' ? '💰' : 
                         transaction.type === 'wallet_transfer' ? '💸' : 
                         transaction.type === 'withdrawal' ? '🏦' : '📱'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()} • {transaction.status}
                      </p>
                      <p className="text-xs text-gray-400">ID: {transaction.referenceId}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${
                    transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
          
          {transactionsPagination?.page < transactionsPagination?.pages && (
            <div className="text-center pt-6">
              <button 
                onClick={loadMoreTransactions}
                className="px-6 py-2 bg-purple-100 text-purple-600 rounded-xl font-medium hover:bg-purple-200 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletComponent;
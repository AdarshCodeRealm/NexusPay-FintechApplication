import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-one-sooty.vercel.app/api/v1';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Set auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Async thunks for wallet operations
export const getWalletBalance = createAsyncThunk(
  'wallet/getBalance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wallet/balance');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch balance');
    }
  }
);

export const addMoneyToWallet = createAsyncThunk(
  'wallet/addMoney',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/add-money', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add money');
    }
  }
);

export const transferMoney = createAsyncThunk(
  'wallet/transfer',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/transfer', transferData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Transfer failed');
    }
  }
);

export const withdrawMoney = createAsyncThunk(
  'wallet/withdraw',
  async (withdrawalData, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/withdraw', withdrawalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Withdrawal failed');
    }
  }
);

export const getTransactionHistory = createAsyncThunk(
  'wallet/getTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/wallet/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

export const mobileRecharge = createAsyncThunk(
  'wallet/mobileRecharge',
  async (rechargeData, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/mobile-recharge', rechargeData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Mobile recharge failed');
    }
  }
);

export const initiatePhonePePayment = createAsyncThunk(
  'wallet/initiatePhonePePayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/initiate', paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to initiate payment');
    }
  }
);

export const checkPaymentStatus = createAsyncThunk(
  'wallet/checkPaymentStatus',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/check/${transactionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check payment status');
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'wallet/getPaymentHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/payments/history?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment history');
    }
  }
);

export const downloadTransactionReceipt = createAsyncThunk(
  'wallet/downloadReceipt',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payments/receipt/${transactionId}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { transactionId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download receipt');
    }
  }
);

export const secureTransferMoney = createAsyncThunk(
  'wallet/secureTransfer',
  async (transferData, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/secure-transfer', transferData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Secure transfer failed');
    }
  }
);

export const generateTransferOTP = createAsyncThunk(
  'wallet/generateTransferOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/transfer-otp', otpData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate OTP');
    }
  }
);

export const getTransferLimits = createAsyncThunk(
  'wallet/getTransferLimits',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wallet/transfer-limits');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transfer limits');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    frozenBalance: 0,
    transactions: [],
    transactionsPagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
    loading: false,
    transactionLoading: false,
    operationLoading: false,
    error: null,
    lastTransaction: null,
    paymentUrl: null,
    pendingTransactionId: null,
    paymentHistory: [],
    paymentLoading: false,
    transferLimits: null,
    otpSent: false,
    secureTransferLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearLastTransaction: (state) => {
      state.lastTransaction = null;
    },
    updateBalance: (state, action) => {
      state.balance = action.payload.balance;
      state.frozenBalance = action.payload.frozenBalance || 0;
    },
    clearPaymentUrl: (state) => {
      state.paymentUrl = null;
      state.pendingTransactionId = null;
    },
    setPendingTransaction: (state, action) => {
      state.pendingTransactionId = action.payload;
    },
    clearTransferOTP: (state) => {
      state.otpSent = false;
    },
    setTransferLimits: (state, action) => {
      state.transferLimits = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Wallet Balance
      .addCase(getWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.data.balance;
        state.frozenBalance = action.payload.data.frozenBalance || 0;
      })
      .addCase(getWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add Money to Wallet
      .addCase(addMoneyToWallet.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(addMoneyToWallet.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.balance = action.payload.data.newBalance;
        state.lastTransaction = action.payload.data.transaction;
      })
      .addCase(addMoneyToWallet.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Transfer Money
      .addCase(transferMoney.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(transferMoney.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.balance = action.payload.data.newBalance;
        state.lastTransaction = action.payload.data.transaction;
      })
      .addCase(transferMoney.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Withdraw Money
      .addCase(withdrawMoney.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(withdrawMoney.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.balance = action.payload.data.newBalance;
        state.lastTransaction = action.payload.data.transaction;
      })
      .addCase(withdrawMoney.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Get Transaction History
      .addCase(getTransactionHistory.pending, (state) => {
        state.transactionLoading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.transactionLoading = false;
        state.transactions = action.payload.data.transactions;
        state.transactionsPagination = action.payload.data.pagination;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.transactionLoading = false;
        state.error = action.payload;
      })
      
      // Mobile Recharge
      .addCase(mobileRecharge.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(mobileRecharge.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.balance = action.payload.data.newBalance;
        state.lastTransaction = action.payload.data.transaction;
      })
      .addCase(mobileRecharge.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Initiate PhonePe Payment
      .addCase(initiatePhonePePayment.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(initiatePhonePePayment.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentUrl = action.payload.data.paymentUrl;
        state.pendingTransactionId = action.payload.data.transactionId;
      })
      .addCase(initiatePhonePePayment.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })
      
      // Check Payment Status
      .addCase(checkPaymentStatus.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(checkPaymentStatus.fulfilled, (state, action) => {
        state.paymentLoading = false;
        // Remove the automatic balance addition here since the backend already updates the wallet
        // and we refresh the balance from the server
        // REMOVED: state.balance = action.payload.data.amount + state.balance;
        
        // The wallet balance will be updated when getWalletBalance is called
        // This prevents double addition of the payment amount
      })
      .addCase(checkPaymentStatus.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })
      
      // Get Payment History
      .addCase(getPaymentHistory.pending, (state) => {
        state.paymentLoading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.paymentHistory = action.payload.data.payments;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.paymentLoading = false;
        state.error = action.payload;
      })
      
      // Secure Transfer Money
      .addCase(secureTransferMoney.pending, (state) => {
        state.secureTransferLoading = true;
        state.error = null;
      })
      .addCase(secureTransferMoney.fulfilled, (state, action) => {
        state.secureTransferLoading = false;
        state.balance = action.payload.data.senderNewBalance;
        state.lastTransaction = action.payload.data;
        state.otpSent = false;
      })
      .addCase(secureTransferMoney.rejected, (state, action) => {
        state.secureTransferLoading = false;
        state.error = action.payload;
      })
      
      // Generate Transfer OTP
      .addCase(generateTransferOTP.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(generateTransferOTP.fulfilled, (state) => {
        state.operationLoading = false;
        state.otpSent = true;
      })
      .addCase(generateTransferOTP.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Get Transfer Limits
      .addCase(getTransferLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransferLimits.fulfilled, (state, action) => {
        state.loading = false;
        state.transferLimits = action.payload.data;
      })
      .addCase(getTransferLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearLastTransaction, 
  updateBalance, 
  clearPaymentUrl, 
  setPendingTransaction,
  clearTransferOTP,
  setTransferLimits
} = walletSlice.actions;
export default walletSlice.reducer;
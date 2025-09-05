import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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
      });
  },
});

export const { clearError, clearLastTransaction, updateBalance } = walletSlice.actions;
export default walletSlice.reducer;
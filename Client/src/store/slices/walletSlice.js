import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../lib/api.js';
import { generateBulkTransactionPDF, generateIndividualReceipt, shareTransactionReceipt, printTransactionReceipt } from '../../lib/pdfUtils.jsx';
import { addNotification, createTransactionNotification } from './notificationSlice.js';

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
  async (transferData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.post('/wallet/transfer', transferData);
      
      // Create notification for successful transfer (sender side)
      if (response.data.success) {
        const { user } = getState().auth;
        const transferResult = response.data.data;
        
        // Create notification for money sent
        const notification = {
          id: `transfer_${Date.now()}`,
          type: 'money_sent',
          title: 'Payment Successful',
          message: `You sent ₹${transferResult.transferAmount?.toLocaleString() || transferData.amount.toLocaleString()} to ${transferResult.recipient?.name || 'recipient'}`,
          amount: -(transferResult.transferAmount || transferData.amount),
          timestamp: new Date(),
          isRead: false,
          icon: 'money_sent',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          transaction: transferResult
        };
        
        dispatch(addNotification(notification));
      }
      
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
      link.setAttribute('download', `NEXASPAY-Receipt-${transactionId}.pdf`);
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

export const createReceiptShareLink = createAsyncThunk(
  'wallet/createReceiptShareLink',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/payments/receipt/${transactionId}/share`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create share link');
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

export const generateBulkReceipt = createAsyncThunk(
  'wallet/generateBulkReceipt',
  async ({ transactions, user, dateRange }, { rejectWithValue }) => {
    try {
      // Use client-side PDF generation for bulk receipts
      const fileName = await generateBulkTransactionPDF(transactions, user, dateRange);
      return { fileName, transactionCount: transactions.length };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate bulk receipt');
    }
  }
);

// Update existing individual receipt action with fallback to client-side generation
export const generateIndividualReceiptAction = createAsyncThunk(
  'wallet/generateIndividualReceipt',
  async ({ transaction, user }, { rejectWithValue }) => {
    try {
      // First try server-side receipt generation
      try {
        const response = await api.get(`/payments/receipt/${transaction.id}`, {
          responseType: 'blob'
        });
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `NEXASPAY-Receipt-${transaction.referenceId || transaction.id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        return { fileName: `Receipt-${transaction.id}`, transactionId: transaction.id, method: 'server' };
      } catch (serverError) {
        console.warn('Server-side receipt generation failed, falling back to client-side:', serverError);
        
        // Fallback to client-side receipt generation
        const { generateIndividualReceipt } = await import('../../lib/pdfUtils.jsx');
        const fileName = await generateIndividualReceipt(transaction, user);
        return { fileName, transactionId: transaction.id, method: 'client' };
      }
    } catch (error) {
      console.error('All receipt generation methods failed:', error);
      return rejectWithValue(error.message || 'Failed to download receipt');
    }
  }
);

// Enhanced share receipt functionality with public link
export const shareTransactionReceiptAction = createAsyncThunk(
  'wallet/shareTransactionReceipt',
  async ({ transaction, user }, { rejectWithValue }) => {
    try {
      // First create a share link
      const shareResponse = await api.post(`/payments/receipt/${transaction.id}/share`);
      const shareData = shareResponse.data.data;
      
      // Try to use Web Share API if available (mobile)
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'NEXASPAY Transaction Receipt',
            text: `Transaction Receipt for ₹${Math.abs(transaction.amount)} - ${transaction.description || 'Payment'}`,
            url: shareData.shareUrl
          });
          return { success: true, method: 'native_share', shareUrl: shareData.shareUrl };
        } catch (shareError) {
          // If native share fails, fall back to clipboard
          console.log('Native share failed, falling back to clipboard');
        }
      }
      
      // Fallback: Copy link to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareData.shareUrl);
        alert('Receipt link copied to clipboard! Valid for 7 days.');
        return { success: true, method: 'clipboard', shareUrl: shareData.shareUrl };
      }
      
      // Final fallback: Show the link in a prompt
      const userAction = prompt(
        'Receipt share link (valid for 7 days). Copy this link to share:',
        shareData.shareUrl
      );
      
      return { success: true, method: 'manual', shareUrl: shareData.shareUrl };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share receipt');
    }
  }
);

// Remove print functionality since we're removing the print button
// Keep the action but make it redirect to download instead
export const printTransactionReceiptAction = createAsyncThunk(
  'wallet/printTransactionReceipt',
  async ({ transaction, user }, { rejectWithValue }) => {
    try {
      // Redirect print to download functionality
      const response = await api.get(`/payments/receipt/${transaction.id}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NEXASPAY-Receipt-${transaction.referenceId || transaction.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, transactionId: transaction.id };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download receipt');
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
    shareLinks: {} // Store share links by transaction ID
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
    clearShareLink: (state, action) => {
      const transactionId = action.payload;
      delete state.shareLinks[transactionId];
    }
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
      })
      
      // Generate Bulk Receipt
      .addCase(generateBulkReceipt.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(generateBulkReceipt.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Can add success message or notification here if needed
      })
      .addCase(generateBulkReceipt.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Generate Individual Receipt - Updated
      .addCase(generateIndividualReceiptAction.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(generateIndividualReceiptAction.fulfilled, (state, action) => {
        state.operationLoading = false;
      })
      .addCase(generateIndividualReceiptAction.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Share Transaction Receipt - Enhanced
      .addCase(shareTransactionReceiptAction.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(shareTransactionReceiptAction.fulfilled, (state, action) => {
        state.operationLoading = false;
        // Store the share URL for future reference
        const { shareUrl } = action.payload;
        if (shareUrl && action.meta.arg.transaction?.id) {
          state.shareLinks[action.meta.arg.transaction.id] = {
            url: shareUrl,
            method: action.payload.method,
            createdAt: new Date().toISOString()
          };
        }
      })
      .addCase(shareTransactionReceiptAction.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Print Transaction Receipt - Modified to download
      .addCase(printTransactionReceiptAction.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(printTransactionReceiptAction.fulfilled, (state, action) => {
        state.operationLoading = false;
      })
      .addCase(printTransactionReceiptAction.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Download Receipt
      .addCase(downloadTransactionReceipt.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(downloadTransactionReceipt.fulfilled, (state, action) => {
        state.operationLoading = false;
      })
      .addCase(downloadTransactionReceipt.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Create Share Link
      .addCase(createReceiptShareLink.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(createReceiptShareLink.fulfilled, (state, action) => {
        state.operationLoading = false;
        const { transaction, shareUrl } = action.payload.data;
        state.shareLinks[transaction.id] = {
          url: shareUrl,
          expiresAt: action.payload.data.expiresAt,
          createdAt: new Date().toISOString()
        };
      })
      .addCase(createReceiptShareLink.rejected, (state, action) => {
        state.operationLoading = false;
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
  setTransferLimits,
  clearShareLink
} = walletSlice.actions;
export default walletSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Async thunks for auth operations
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-otp', { phone });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-otp', otpData);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('accessToken');
      return {};
    } catch (error) {
      localStorage.removeItem('accessToken');
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('accessToken');
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    otpSent: false,
    otpLoading: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOtpState: (state) => {
      state.otpSent = false;
      state.otpLoading = false;
    },
    setAuthHeader: (state) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.data.accessToken}`;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload;
      })
      
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.otpSent = false;
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.data.accessToken}`;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        delete api.defaults.headers.common['Authorization'];
      })
      
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        delete api.defaults.headers.common['Authorization'];
      });
  },
});

export const { clearError, clearOtpState, setAuthHeader } = authSlice.actions;
export default authSlice.reducer;
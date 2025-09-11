import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { REHYDRATE } from 'redux-persist';

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

export const loginWithPhone = createAsyncThunk(
  'auth/loginWithPhone',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login-phone', credentials);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Phone login failed');
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

export const sendDummyOTP = createAsyncThunk(
  'auth/sendDummyOTP',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-dummy-otp', { phone });
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
      const response = await api.post('/auth/verify-2fa-otp', otpData);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

export const sendRegistrationOTP = createAsyncThunk(
  'auth/sendRegistrationOTP',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/send-registration-otp', userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send registration OTP');
    }
  }
);

export const verifyRegistrationOTP = createAsyncThunk(
  'auth/verifyRegistrationOTP',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/verify-registration-otp', otpData);
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration OTP verification failed');
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
    passwordVerified: false, // Track if password step is complete
    tempUserData: null, // Store user data temporarily until OTP verified
    currentPhone: null, // Store the current phone number being used
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearOtpState: (state) => {
      state.otpSent = false;
      state.otpLoading = false;
    },
    resetPasswordVerification: (state) => {
      state.passwordVerified = false;
      state.tempUserData = null;
      state.currentPhone = null;
    },
    setCurrentPhone: (state, action) => {
      state.currentPhone = action.payload;
    },
    setAuthHeader: () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.otpSent = false;
      state.passwordVerified = false;
      state.tempUserData = null;
      state.currentPhone = null;
      localStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle rehydration - restore auth header when state is restored
      .addCase(REHYDRATE, (state, action) => {
        if (action.payload?.auth?.isAuthenticated) {
          const token = localStorage.getItem('accessToken');
          if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          }
        }
      })
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

      // Phone Login - Modified for 2FA flow
      .addCase(loginWithPhone.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithPhone.fulfilled, (state, action) => {
        state.loading = false;
        // Store user data temporarily, don't authenticate yet
        state.passwordVerified = true;
        state.tempUserData = action.payload.data.user;
        // Store the phone number for OTP verification
        state.currentPhone = action.payload.data.user.phone;
        // DON'T set isAuthenticated = true yet! Wait for OTP verification
      })
      .addCase(loginWithPhone.rejected, (state, action) => {
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

      // Send Dummy OTP
      .addCase(sendDummyOTP.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendDummyOTP.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
      })
      .addCase(sendDummyOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload;
      })
      
      // Verify OTP - Complete authentication with temp user data
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        // Use temporary user data from password verification, or fallback to response
        state.user = state.tempUserData || action.payload.data.user;
        state.isAuthenticated = true;
        state.otpSent = false;
        state.passwordVerified = false;
        state.tempUserData = null;
        state.currentPhone = null;
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.data.accessToken}`;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Send Registration OTP
      .addCase(sendRegistrationOTP.pending, (state) => {
        state.otpLoading = true;
        state.error = null;
      })
      .addCase(sendRegistrationOTP.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
      })
      .addCase(sendRegistrationOTP.rejected, (state, action) => {
        state.otpLoading = false;
        state.error = action.payload;
      })

      // Verify Registration OTP
      .addCase(verifyRegistrationOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegistrationOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.isAuthenticated = true;
        state.otpSent = false;
        api.defaults.headers.common['Authorization'] = `Bearer ${action.payload.data.accessToken}`;
      })
      .addCase(verifyRegistrationOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Logout - Handle both success and failure cases
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.passwordVerified = false;
        state.tempUserData = null;
        state.currentPhone = null;
        localStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
      })
      .addCase(logoutUser.rejected, (state) => {
        state.loading = false;
        // Even if logout fails on server, clear local state
        state.user = null;
        state.isAuthenticated = false;
        state.otpSent = false;
        state.passwordVerified = false;
        state.tempUserData = null;
        state.currentPhone = null;
        localStorage.removeItem('accessToken');
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

export const { clearError, clearOtpState, resetPasswordVerification, setCurrentPhone, setAuthHeader, logout } = authSlice.actions;
export default authSlice.reducer;
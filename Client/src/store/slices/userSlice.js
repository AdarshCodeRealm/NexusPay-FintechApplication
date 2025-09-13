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

// Async thunks for user operations
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/users/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const submitKYC = createAsyncThunk(
  'user/submitKYC',
  async (kycData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('aadhar', kycData.aadhar);
      formData.append('pan', kycData.pan);
      formData.append('address', kycData.address);
      
      const response = await api.post('/users/kyc/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit KYC');
    }
  }
);

export const getBeneficiaries = createAsyncThunk(
  'user/getBeneficiaries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/beneficiaries');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch beneficiaries');
    }
  }
);

export const addBeneficiary = createAsyncThunk(
  'user/addBeneficiary',
  async (beneficiaryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/beneficiaries', beneficiaryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add beneficiary');
    }
  }
);

export const updateBeneficiary = createAsyncThunk(
  'user/updateBeneficiary',
  async ({ beneficiaryId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/beneficiaries/${beneficiaryId}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update beneficiary');
    }
  }
);

export const deleteBeneficiary = createAsyncThunk(
  'user/deleteBeneficiary',
  async (beneficiaryId, { rejectWithValue }) => {
    try {
      await api.delete(`/beneficiaries/${beneficiaryId}`);
      return beneficiaryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete beneficiary');
    }
  }
);

export const getRetailers = createAsyncThunk(
  'user/getRetailers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/retailers');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch retailers');
    }
  }
);

export const addRetailer = createAsyncThunk(
  'user/addRetailer',
  async (retailerData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/retailers', retailerData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add retailer');
    }
  }
);

export const searchUserByPhone = createAsyncThunk(
  'user/searchUserByPhone',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/search/${phone}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'User not found');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    profile: null,
    beneficiaries: [],
    retailers: [],
    searchedUser: null,
    kycStatus: 'pending',
    loading: false,
    beneficiaryLoading: false,
    retailerLoading: false,
    operationLoading: false,
    searchLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSearchedUser: (state) => {
      state.searchedUser = null;
    },
    updateKYCStatus: (state, action) => {
      state.kycStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Submit KYC
      .addCase(submitKYC.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(submitKYC.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.kycStatus = action.payload.data.status;
      })
      .addCase(submitKYC.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Get Beneficiaries
      .addCase(getBeneficiaries.pending, (state) => {
        state.beneficiaryLoading = true;
        state.error = null;
      })
      .addCase(getBeneficiaries.fulfilled, (state, action) => {
        state.beneficiaryLoading = false;
        state.beneficiaries = action.payload.data;
      })
      .addCase(getBeneficiaries.rejected, (state, action) => {
        state.beneficiaryLoading = false;
        state.error = action.payload;
      })
      
      // Add Beneficiary
      .addCase(addBeneficiary.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(addBeneficiary.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.beneficiaries.push(action.payload.data);
      })
      .addCase(addBeneficiary.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Update Beneficiary
      .addCase(updateBeneficiary.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(updateBeneficiary.fulfilled, (state, action) => {
        state.operationLoading = false;
        const index = state.beneficiaries.findIndex(b => b._id === action.payload.data._id);
        if (index !== -1) {
          state.beneficiaries[index] = action.payload.data;
        }
      })
      .addCase(updateBeneficiary.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Delete Beneficiary
      .addCase(deleteBeneficiary.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(deleteBeneficiary.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.beneficiaries = state.beneficiaries.filter(b => b._id !== action.payload);
      })
      .addCase(deleteBeneficiary.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Get Retailers
      .addCase(getRetailers.pending, (state) => {
        state.retailerLoading = true;
        state.error = null;
      })
      .addCase(getRetailers.fulfilled, (state, action) => {
        state.retailerLoading = false;
        state.retailers = action.payload.data;
      })
      .addCase(getRetailers.rejected, (state, action) => {
        state.retailerLoading = false;
        state.error = action.payload;
      })
      
      // Add Retailer
      .addCase(addRetailer.pending, (state) => {
        state.operationLoading = true;
        state.error = null;
      })
      .addCase(addRetailer.fulfilled, (state, action) => {
        state.operationLoading = false;
        state.retailers.push(action.payload.data);
      })
      .addCase(addRetailer.rejected, (state, action) => {
        state.operationLoading = false;
        state.error = action.payload;
      })
      
      // Search User by Phone
      .addCase(searchUserByPhone.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
        state.searchedUser = null;
      })
      .addCase(searchUserByPhone.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchedUser = action.payload.data;
      })
      .addCase(searchUserByPhone.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
        state.searchedUser = null;
      });
  },
});

export const { clearError, clearSearchedUser, updateKYCStatus } = userSlice.actions;
export default userSlice.reducer;
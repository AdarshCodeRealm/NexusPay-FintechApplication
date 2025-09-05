import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import walletReducer from './slices/walletSlice'
import userReducer from './slices/userSlice'
import counterReducer from './slices/counterSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    wallet: walletReducer,
    user: userReducer,
    counter: counterReducer, // Keep existing counter for compatibility
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store
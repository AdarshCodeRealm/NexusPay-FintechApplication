import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import walletReducer from './slices/walletSlice'
import userReducer from './slices/userSlice'
import counterReducer from './slices/counterSlice'
import notificationReducer from './slices/notificationSlice'

// Configure persistence for auth slice only
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'isAuthenticated'] // Only persist user data and auth status
}

// Configure persistence for the root reducer
const rootPersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Only persist auth slice
}

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  wallet: walletReducer,
  user: userReducer,
  counter: counterReducer,
  notifications: notificationReducer,
})

const persistedReducer = persistReducer(rootPersistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)
export default store
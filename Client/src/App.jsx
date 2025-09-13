import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, setAuthHeader } from './store/slices/authSlice';
import AuthComponent from './components/AuthComponent';
import Dashboard from './components/Dashboard';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailure from './components/PaymentFailure';
import LoadingScreen from './components/LoadingScreen';
import DatabaseStatus from './components/DatabaseStatus';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is already logged in on app start
    const token = localStorage.getItem('accessToken');
    if (token && !isAuthenticated) {
      dispatch(setAuthHeader());
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated]);

  // Show loading screen while checking authentication
  if (loading && !user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Database Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <DatabaseStatus />
        </div>
      </div>
      
      <Router>
        <Routes>
          {/* Public routes for payment callbacks */}
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failure" element={<PaymentFailure />} />
          <Route path="/payment-callback" element={<PaymentSuccess />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" replace />} 
          />
          
          {/* Auth route */}
          <Route 
            path="/auth" 
            element={!isAuthenticated ? <AuthComponent /> : <Navigate to="/dashboard" replace />} 
          />
          
          {/* Default route */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
            } 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/auth" replace />
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

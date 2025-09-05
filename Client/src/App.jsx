import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, setAuthHeader } from './store/slices/authSlice';
import AuthComponent from './components/AuthComponent';
import Dashboard from './components/Dashboard';
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Temporarily skip authentication - go directly to Dashboard
  return <Dashboard />;

  // Original authentication flow (commented out for now)
  // Show authentication component if not logged in
  // if (!isAuthenticated) {
  //   return <AuthComponent />;
  // }

  // Show dashboard if authenticated
  // return <Dashboard />;
}

export default App;

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginUser, sendOTP, verifyOTP, clearError } from '../store/slices/authSlice';
import { Button } from './ui/button';

const AuthComponent = () => {
  const dispatch = useDispatch();
  const { loading, error, otpSent, otpLoading, isAuthenticated } = useSelector((state) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [useOTP, setUseOTP] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    otp: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(registerUser({
      fullName: formData.fullName,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      phone: formData.phone
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(sendOTP(formData.phone));
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(verifyOTP({
      phone: formData.phone,
      otp: formData.otp
    }));
  };

  if (isAuthenticated) {
    return null; // Will be handled by main app routing
  }

  return (
    <div className="min-h-screen flex items-center justify-center auth-container py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center mb-6">
            <h1 className="nexaspay-logo text-4xl mb-2">NexasPay</h1>
            <p className="text-white/80 text-sm">Digital Wallet & Fintech Platform</p>
          </div>
          <div className="auth-card rounded-lg p-8">
            <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Join NexasPay'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin ? 'Sign in to your NexasPay account' : 'Create your NexasPay account'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="auth-card rounded-lg p-8 space-y-6">
          {/* Toggle between Login/Register */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={isLogin ? "default" : "outline"}
              onClick={() => {
                setIsLogin(true);
                setUseOTP(false);
                dispatch(clearError());
              }}
              className="flex-1"
            >
              Login
            </Button>
            <Button
              type="button"
              variant={!isLogin ? "default" : "outline"}
              onClick={() => {
                setIsLogin(false);
                setUseOTP(false);
                dispatch(clearError());
              }}
              className="flex-1"
            >
              Register
            </Button>
          </div>

          {isLogin && (
            <div className="flex space-x-4">
              <Button
                type="button"
                variant={!useOTP ? "default" : "outline"}
                onClick={() => setUseOTP(false)}
                className="flex-1"
              >
                Password
              </Button>
              <Button
                type="button"
                variant={useOTP ? "default" : "outline"}
                onClick={() => setUseOTP(true)}
                className="flex-1"
              >
                OTP
              </Button>
            </div>
          )}

          {/* Registration Form */}
          {!isLogin && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <input
                  name="fullName"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="username"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="phone"
                  type="tel"
                  required
                  className="form-input"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating Account...' : 'Create NexasPay Account'}
              </Button>
            </form>
          )}

          {/* Login with Password */}
          {isLogin && !useOTP && (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  name="email"
                  type="email"
                  required
                  className="form-input"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <input
                  name="password"
                  type="password"
                  required
                  className="form-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Signing in...' : 'Sign in to NexasPay'}
              </Button>
            </form>
          )}

          {/* Login with OTP */}
          {isLogin && useOTP && (
            <div className="space-y-6">
              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div>
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="form-input"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={otpLoading}
                    className="btn-primary w-full"
                  >
                    {otpLoading ? 'Sending OTP...' : 'Send OTP'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <input
                      name="otp"
                      type="text"
                      required
                      maxLength="6"
                      className="form-input text-center text-lg tracking-widest"
                      placeholder="Enter 6-digit OTP"
                      value={formData.otp}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    OTP sent to {formData.phone}
                  </p>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOTP}
                    disabled={otpLoading}
                    className="w-full"
                  >
                    {otpLoading ? 'Resending...' : 'Resend OTP'}
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
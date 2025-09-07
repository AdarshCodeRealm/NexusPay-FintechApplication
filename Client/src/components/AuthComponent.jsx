import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, loginWithPhone, sendDummyOTP, verifyOTP, clearError, setCurrentPhone } from '../store/slices/authSlice';
import { Button } from './ui/button';

const AuthComponent = () => {
  const dispatch = useDispatch();
  const { loading, error, otpSent, otpLoading, isAuthenticated, passwordVerified, currentPhone } = useSelector((state) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  const [showPassword, setShowPassword] = useState(false);
  const [loginStep, setLoginStep] = useState('credentials'); // 'credentials' or 'otp'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    otp: ''
  });

  // Quick login test users for development
  const testUsers = [
    { name: 'John Doe (User)', phone: '9876543210', password: 'password123', role: 'User' },
    { name: 'Jane Smith (Retailer)', phone: '9876543211', password: 'jane2024', role: 'Retailer' },
    { name: 'Mike Wilson (Distributor)', phone: '9876543212', password: 'mike@secure123', role: 'Distributor' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickLogin = (user) => {
    setFormData({
      ...formData,
      phone: user.phone,
      password: user.password
    });
    setLoginMethod('password');
    setLoginStep('credentials');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(registerUser({
      fullName: formData.fullName,
      phone: formData.phone,
      password: formData.password
    }));
  };

  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    // Just dispatch the login action - Redux state will handle the flow
    await dispatch(loginWithPhone({
      phone: formData.phone,
      password: formData.password
    }));
  };

  // Auto-transition to OTP step when password is verified
  React.useEffect(() => {
    if (passwordVerified && !isAuthenticated && loginMethod === 'password') {
      setLoginStep('otp');
      // Auto-send OTP for verification using currentPhone from Redux
      const phoneToUse = formData.phone || currentPhone;
      if (phoneToUse) {
        dispatch(sendDummyOTP(phoneToUse));
      }
    }
  }, [passwordVerified, isAuthenticated, loginMethod, formData.phone, currentPhone, dispatch]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    const phoneToUse = formData.phone || currentPhone;
    
    if (!phoneToUse) {
      dispatch({ type: 'auth/sendDummyOTP/rejected', payload: 'Phone number is required' });
      return;
    }
    
    // Store the phone number in Redux state
    dispatch(setCurrentPhone(phoneToUse));
    
    await dispatch(sendDummyOTP(phoneToUse));
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    
    // Use phone from form data first, then fallback to currentPhone from Redux state
    const phoneToUse = formData.phone || currentPhone;
    
    if (!phoneToUse) {
      dispatch({ type: 'auth/verifyOTP/rejected', payload: 'Phone number is missing' });
      return;
    }
    
    console.log('Sending OTP verification with:', { phone: phoneToUse, otp: formData.otp });
    
    await dispatch(verifyOTP({
      phone: phoneToUse,
      otp: formData.otp
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const resetToCredentials = () => {
    setLoginStep('credentials');
    setFormData({ ...formData, otp: '' });
  };

  if (isAuthenticated) {
    return null; // Will be handled by main app routing
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">₹</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">NexasPay</h1>
          <p className="text-blue-200 text-sm">Secure Digital Wallet & Payments</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Toggle Login/Register */}
          <div className="flex bg-white/10 rounded-lg p-1 mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setLoginMethod('password');
                setLoginStep('credentials');
                dispatch(clearError());
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isLogin 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setLoginStep('credentials');
                dispatch(clearError());
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isLogin 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <div className="space-y-6">
              {/* Step 1: Credentials */}
              {loginStep === 'credentials' && (
                <>
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-blue-200 text-sm">Enter your mobile number to continue</p>
                  </div>

                  {/* Login Method Toggle */}
                  <div className="flex bg-white/5 rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setLoginMethod('password')}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                        loginMethod === 'password' 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      Password
                    </button>
                    <button
                      onClick={() => setLoginMethod('otp')}
                      className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all ${
                        loginMethod === 'otp' 
                          ? 'bg-white/20 text-white' 
                          : 'text-white/60 hover:text-white/80'
                      }`}
                    >
                      OTP Only
                    </button>
                  </div>

                  {/* Quick Login for Testing */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                    <p className="text-blue-200 text-sm font-medium mb-3">Quick Login (Testing):</p>
                    <div className="space-y-2">
                      {testUsers.map((user, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickLogin(user)}
                          className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg border border-white/10 transition-all text-left"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white text-sm font-medium">{user.name}</p>
                              <p className="text-blue-200 text-xs">{user.phone}</p>
                            </div>
                            <span className="text-xs text-blue-300 bg-blue-500/20 px-2 py-1 rounded">
                              {user.role}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password Login */}
                  {loginMethod === 'password' && (
                    <form onSubmit={handlePhoneLogin} className="space-y-4">
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <input
                            name="phone"
                            type="tel"
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                            placeholder="Enter your mobile number"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                          <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5 text-white/40 hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-white/40 hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Signing in...
                          </div>
                        ) : (
                          'Continue with Password'
                        )}
                      </Button>
                    </form>
                  )}

                  {/* OTP Only Login */}
                  {loginMethod === 'otp' && (
                    <div className="space-y-4">
                      {!otpSent ? (
                        <form onSubmit={handleSendOTP} className="space-y-4">
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Mobile Number
                            </label>
                            <div className="relative">
                              <input
                                name="phone"
                                type="tel"
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                                placeholder="Enter your mobile number"
                                value={formData.phone}
                                onChange={handleInputChange}
                              />
                              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <p className="text-yellow-200 text-sm">
                              <span className="font-medium">Testing Mode:</span> Use dummy OTP <code className="bg-yellow-500/20 px-2 py-1 rounded text-xs">123456</code>
                            </p>
                          </div>
                          <Button
                            type="submit"
                            disabled={otpLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {otpLoading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Sending OTP...
                              </div>
                            ) : (
                              'Send OTP'
                            )}
                          </Button>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Enter OTP
                            </label>
                            <input
                              name="otp"
                              type="text"
                              required
                              maxLength="6"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-center text-lg tracking-widest"
                              placeholder="123456"
                              value={formData.otp}
                              onChange={handleInputChange}
                            />
                          </div>
                          <p className="text-blue-200 text-sm text-center">
                            OTP sent to {formData.phone || currentPhone}
                          </p>
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-green-200 text-sm text-center">
                              <span className="font-medium">Dummy OTP:</span> <code className="bg-green-500/20 px-2 py-1 rounded">123456</code>
                            </p>
                          </div>
                          <div className="space-y-3">
                            <Button
                              type="submit"
                              disabled={loading}
                              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loading ? (
                                <div className="flex items-center justify-center">
                                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                  Verifying...
                                </div>
                              ) : (
                                'Verify OTP'
                              )}
                            </Button>
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={otpLoading}
                              className="w-full py-2 text-blue-200 hover:text-white text-sm transition-colors disabled:opacity-50"
                            >
                              {otpLoading ? 'Resending...' : 'Resend OTP'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Step 2: OTP Verification after Password Login */}
              {loginStep === 'otp' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verify Your Identity</h2>
                    <p className="text-blue-200 text-sm">Please enter the OTP sent to your mobile number</p>
                  </div>

                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Enter OTP
                      </label>
                      <input
                        name="otp"
                        type="text"
                        required
                        maxLength="6"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm text-center text-lg tracking-widest"
                        placeholder="123456"
                        value={formData.otp}
                        onChange={handleInputChange}
                      />
                    </div>
                    <p className="text-blue-200 text-sm text-center">
                      OTP sent to {formData.phone || currentPhone}
                    </p>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                      <p className="text-green-200 text-sm text-center">
                        <span className="font-medium">Dummy OTP:</span> <code className="bg-green-500/20 px-2 py-1 rounded">123456</code>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                            Verifying...
                          </div>
                        ) : (
                          'Complete Login'
                        )}
                      </Button>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={handleSendOTP}
                          disabled={otpLoading}
                          className="flex-1 py-2 text-blue-200 hover:text-white text-sm transition-colors disabled:opacity-50"
                        >
                          {otpLoading ? 'Resending...' : 'Resend OTP'}
                        </button>
                        <button
                          type="button"
                          onClick={resetToCredentials}
                          className="flex-1 py-2 text-gray-300 hover:text-white text-sm transition-colors"
                        >
                          Back to Login
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Registration Form */
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-blue-200 text-sm">Join NexasPay and start managing your finances</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Mobile Number
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter your mobile number"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-white/40 hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white/40 hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-xs">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>

        {/* Bottom Links */}
        <div className="text-center">
          <p className="text-blue-200 text-sm">
            Need help? <a href="#" className="text-white hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;
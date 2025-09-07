import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, submitKYC, clearError } from '../store/slices/userSlice';
import { Button } from './ui/button';
import { 
  Camera, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Shield, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Smartphone,
  Video,
  Upload,
  Eye,
  Settings,
  Lock,
  Bell
} from 'lucide-react';

const ProfileComponent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { operationLoading, error } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Check if user can edit full name (KYC not completed)
  const canEditFullName = user?.kyc?.status !== 'approved';

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(updateProfile(profileForm));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getKYCStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { 
          color: 'text-green-600', 
          bg: 'bg-green-100', 
          border: 'border-green-200',
          icon: <CheckCircle className="w-5 h-5" />, 
          text: 'KYC Verified',
          description: 'Your identity has been successfully verified'
        };
      case 'submitted':
        return { 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-100', 
          border: 'border-yellow-200',
          icon: <Clock className="w-5 h-5" />, 
          text: 'Under Review',
          description: 'Your documents are being reviewed by our team'
        };
      case 'rejected':
        return { 
          color: 'text-red-600', 
          bg: 'bg-red-100', 
          border: 'border-red-200',
          icon: <AlertTriangle className="w-5 h-5" />, 
          text: 'KYC Rejected',
          description: 'Please re-submit your documents with corrections'
        };
      default:
        return { 
          color: 'text-orange-600', 
          bg: 'bg-orange-100', 
          border: 'border-orange-200',
          icon: <AlertTriangle className="w-5 h-5" />, 
          text: 'KYC Pending',
          description: 'Complete your KYC to unlock all features'
        };
    }
  };

  const kycStatus = getKYCStatusInfo(user?.kyc?.status);

  const kycBenefits = [
    { icon: <CreditCard className="w-5 h-5" />, title: 'Higher Transaction Limits', description: 'Send up to ₹1,00,000 per transaction' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Investment Features', description: 'Access to mutual funds and trading' },
    { icon: <Users className="w-5 h-5" />, title: 'Business Account', description: 'Upgrade to merchant account features' },
    { icon: <Shield className="w-5 h-5" />, title: 'Enhanced Security', description: 'Additional security and fraud protection' },
  ];

  return (
    <div className="space-y-6 py-6">
      {/* Enhanced Header with Avatar Upload */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold backdrop-blur-sm">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.fullName?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{user?.fullName}</h2>
            <p className="text-purple-100">{user?.email}</p>
            <p className="text-sm text-purple-200 mt-1">{user?.phone}</p>
            <div className="flex items-center space-x-3 mt-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${kycStatus.bg} ${kycStatus.border} border`}>
                <span className={kycStatus.color}>{kycStatus.icon}</span>
                <span className={`text-sm font-medium ${kycStatus.color}`}>{kycStatus.text}</span>
              </div>
              <span className="px-3 py-1 text-xs font-medium bg-white/20 text-white rounded-full">
                {user?.role?.toUpperCase() || 'USER'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KYC Benefits Banner - Show only if KYC not approved */}
      {user?.kyc?.status !== 'approved' && (
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="bg-orange-100 rounded-xl p-3">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">Complete Your KYC Verification</h3>
              <p className="text-orange-700 text-sm mb-4">{kycStatus.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {kycBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm text-orange-800">
                    <span className="text-orange-600">{benefit.icon}</span>
                    <div>
                      <p className="font-medium">{benefit.title}</p>
                      <p className="text-orange-600">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {user?.kyc?.status !== 'submitted' && (
                <button 
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Start KYC Verification
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Enhanced Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
          
          {/* Profile Form */}
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                  {!canEditFullName && (
                    <span className="ml-2 text-xs text-orange-600 font-medium">
                      (Cannot be changed after KYC verification)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    !canEditFullName ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
                  }`}
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                  disabled={!canEditFullName}
                />
                {!canEditFullName && (
                  <p className="text-xs text-orange-600 mt-1">
                    Full name cannot be changed once KYC verification is completed for security reasons.
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                  value={user?.phone || ''}
                />
                <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500"
                  value={user?.username || ''}
                />
                <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={operationLoading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium"
            >
              {operationLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
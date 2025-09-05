import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, submitKYC, clearError } from '../store/slices/userSlice';
import { Button } from './ui/button';

const ProfileComponent = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { operationLoading, error } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  const [kycFiles, setKycFiles] = useState({
    aadhar: null,
    pan: null,
    address: null
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(updateProfile(profileForm));
  };

  const handleKYCSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(submitKYC(kycFiles));
    setKycFiles({ aadhar: null, pan: null, address: null });
  };

  const handleFileChange = (docType, file) => {
    setKycFiles({
      ...kycFiles,
      [docType]: file
    });
  };

  const getKYCStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'submitted': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user?.fullName}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKYCStatusColor(user?.kyc?.status)}`}>
                KYC: {user?.kyc?.status?.toUpperCase() || 'PENDING'}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {user?.role?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'kyc', label: 'KYC Documents' },
              { id: 'security', label: 'Security' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Update Profile</h3>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    value={user?.phone || ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    value={user?.username || ''}
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>
                <Button
                  type="submit"
                  disabled={operationLoading}
                  className="w-full"
                >
                  {operationLoading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </div>
          )}

          {/* KYC Tab */}
          {activeTab === 'kyc' && (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-6">KYC Documents</h3>
              
              {/* Current KYC Status */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Current Status</p>
                    <p className={`text-sm font-medium ${getKYCStatusColor(user?.kyc?.status)}`}>
                      {user?.kyc?.status?.toUpperCase() || 'PENDING'}
                    </p>
                  </div>
                  <div className="text-right">
                    {user?.kyc?.submittedAt && (
                      <p className="text-xs text-gray-500">
                        Submitted: {new Date(user.kyc.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                    {user?.kyc?.approvedAt && (
                      <p className="text-xs text-green-600">
                        Approved: {new Date(user.kyc.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                {user?.kyc?.status === 'rejected' && user?.kyc?.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-700">
                      <strong>Rejection Reason:</strong> {user.kyc.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* KYC Upload Form */}
              {user?.kyc?.status !== 'approved' && (
                <form onSubmit={handleKYCSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aadhar Card
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required={!user?.kyc?.documents?.aadhar}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleFileChange('aadhar', e.target.files[0])}
                    />
                    {user?.kyc?.documents?.aadhar && (
                      <p className="text-xs text-green-600 mt-1">✓ Already uploaded</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PAN Card
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required={!user?.kyc?.documents?.pan}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleFileChange('pan', e.target.files[0])}
                    />
                    {user?.kyc?.documents?.pan && (
                      <p className="text-xs text-green-600 mt-1">✓ Already uploaded</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Proof
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      required={!user?.kyc?.documents?.address}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => handleFileChange('address', e.target.files[0])}
                    />
                    {user?.kyc?.documents?.address && (
                      <p className="text-xs text-green-600 mt-1">✓ Already uploaded</p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> Please ensure all documents are clear and readable. 
                      Supported formats: JPG, PNG, PDF (max 5MB each)
                    </p>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={operationLoading}
                    className="w-full"
                  >
                    {operationLoading ? 'Uploading...' : 'Submit KYC Documents'}
                  </Button>
                </form>
              )}

              {user?.kyc?.status === 'approved' && (
                <div className="text-center py-8">
                  <div className="text-green-500 text-6xl mb-4">✅</div>
                  <p className="text-green-600 font-medium">KYC Approved</p>
                  <p className="text-sm text-gray-500">Your documents have been verified successfully</p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
              
              <div className="space-y-6">
                {/* Phone Verification */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Phone Verification</p>
                    <p className="text-sm text-gray-500">{user?.phone}</p>
                  </div>
                  <div className={`px-3 py-1 text-xs font-medium rounded-full ${
                    user?.phoneVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user?.phoneVerified ? 'Verified' : 'Not Verified'}
                  </div>
                </div>

                {/* Change Password */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-500">Change your account password</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Change
                    </Button>
                  </div>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Enable
                    </Button>
                  </div>
                </div>

                {/* Login History */}
                <div className="p-4 border rounded-lg">
                  <p className="font-medium text-gray-900 mb-3">Recent Login Activity</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current session</span>
                      <span className="text-green-600">Active now</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Last login</span>
                      <span>Today at 2:30 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
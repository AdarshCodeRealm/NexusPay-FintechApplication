import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Shield, 
  CreditCard, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText 
} from 'lucide-react';

const KYCComponent = () => {
  const { user } = useSelector((state) => state.auth);

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
          description: 'Complete your KYC to unlock all benefits'
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
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">KYC Verification</h1>
            <p className="text-blue-100">Know Your Customer verification</p>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className={`rounded-xl p-6 ${kycStatus.bg} ${kycStatus.border} border`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-white ${kycStatus.color}`}>
              {kycStatus.icon}
            </div>
            <div className="flex-1">
              <h4 className={`font-semibold ${kycStatus.color}`}>{kycStatus.text}</h4>
              <p className={`text-sm ${kycStatus.color} opacity-80`}>{kycStatus.description}</p>
            </div>
          </div>
        </div>
      </div>

      {user?.kyc?.status === 'approved' ? (
        /* KYC Approved */
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-2">KYC Verified!</h3>
            <p className="text-gray-600 mb-6">Your identity has been successfully verified. You now have access to all premium features.</p>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700">
                🎉 Congratulations! You can now enjoy all the benefits of a verified account.
              </p>
            </div>
          </div>
        </div>
      ) : user?.kyc?.status === 'submitted' ? (
        /* KYC Under Review */
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-yellow-600 mb-2">Under Review</h3>
            <p className="text-gray-600 mb-6">Your KYC documents are being reviewed. This usually takes 24-48 hours.</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                We'll notify you once the verification is complete.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* KYC Pending - Show Benefits */
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete KYC Verification</h3>
            <p className="text-gray-600 mb-6">Unlock all benefits by completing your KYC verification</p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {kycBenefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">{benefit.icon}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 text-center">
            <h4 className="font-semibold text-orange-900 mb-2">Ready to get started?</h4>
            <p className="text-orange-700 text-sm mb-4">
              Complete your KYC verification to unlock higher limits, investment features, and enhanced security.
            </p>
            <button className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-700 transition-colors">
              Start KYC Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCComponent;
import React from 'react';
import { 
  Lock, 
  CreditCard, 
  ArrowRightLeft, 
  TrendingUp, 
  Users, 
  Smartphone, 
  Receipt, 
  History, 
  FileCheck 
} from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Lock,
      title: 'Secure OTP Login & Registration',
      description: 'Multi-layer authentication with OTP verification for maximum security.'
    },
    {
      icon: CreditCard,
      title: 'Instant Wallet Top-up',
      description: 'Add money instantly via credit/debit cards with real-time processing.'
    },
    {
      icon: ArrowRightLeft,
      title: 'Quick Withdrawals & Transfers',
      description: 'Lightning-fast money transfers to any bank account or wallet.'
    },
    {
      icon: TrendingUp,
      title: 'Dynamic Commission Structure',
      description: 'Flexible commission rates for distributors and business partners.'
    },
    {
      icon: Users,
      title: 'Account Beneficiary Management',
      description: 'Manage and organize your frequent payment recipients easily.'
    },
    {
      icon: Smartphone,
      title: 'Mobile & DTH Recharge',
      description: 'Recharge all mobile networks and DTH services instantly.'
    },
    {
      icon: Receipt,
      title: 'Credit Card Bill Payments',
      description: 'Pay all your credit card bills and utility payments seamlessly.'
    },
    {
      icon: History,
      title: 'Real-time Transaction History',
      description: 'Track all your transactions with detailed history and receipts.'
    },
    {
      icon: FileCheck,
      title: 'KYC & Document Verification',
      description: 'Complete KYC process with easy document upload and verification.'
    }
  ];

  return (
    <section id="features" className="section-spacing bg-white/50">
      <div className="section-container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Everything You Need in{' '}
            <span className="text-gradient">One App</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple. Secure. Smart.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="feature-card group">
              <div className="feature-card-icon">
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Feature Highlight */}
        <div className="mt-16 glass-card-strong rounded-3xl p-8 md:p-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Built for{' '}
                <span className="text-gradient">Everyone</span>
              </h3>
              <p className="text-lg text-gray-600">
                Whether you're an individual looking for convenient digital payments 
                or a business seeking comprehensive financial solutions, NEXASPAY 
                adapts to your needs with powerful features and intuitive design.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Personal Use</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Business Solutions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Enterprise Ready</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-purple-50 to-blue-50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Monthly Transactions</span>
                    <span className="text-2xl font-bold text-purple-600">₹2.5L+</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">99.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Response Time</span>
                    <span className="text-2xl font-bold text-blue-600">&lt;2s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
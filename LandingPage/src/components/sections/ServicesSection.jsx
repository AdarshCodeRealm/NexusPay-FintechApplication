import React from 'react';
import { 
  QrCode, 
  Wallet, 
  Building2, 
  CreditCard, 
  Smartphone, 
  Zap, 
  TrendingUp, 
  Settings, 
  Code, 
  Crown,
  BarChart3,
  Shield
} from 'lucide-react';

const ServicesSection = () => {
  const serviceCategories = [
    {
      title: 'Digital Payments',
      description: 'Complete payment solutions for modern transactions',
      icon: QrCode,
      color: 'from-purple-500 to-purple-600',
      services: [
        'UPI Payments & QR Codes',
        'Wallet to Wallet Transfers', 
        'Bank Account Transfers',
        'Payment Gateway Integration'
      ]
    },
    {
      title: 'Bill Payments & Recharges',
      description: 'All your bills and recharges in one place',
      icon: Smartphone,
      color: 'from-blue-500 to-blue-600',
      services: [
        'Mobile Recharge (All Networks)',
        'DTH & Cable TV',
        'Electricity & Water Bills',
        'Gas & Broadband Bills'
      ]
    },
    {
      title: 'Business Solutions',
      description: 'Comprehensive tools for businesses of all sizes',
      icon: Building2,
      color: 'from-indigo-500 to-indigo-600',
      services: [
        'Distributor & Retailer Network',
        'Commission Management',
        'Transaction Reporting',
        'API Integration'
      ]
    },
    {
      title: 'Financial Services',
      description: 'Advanced financial management and analytics',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      services: [
        'Secure Wallet Management',
        'Transaction Analytics',
        'Multi-level User Management',
        'KYC Verification'
      ]
    }
  ];

  return (
    <section id="services" className="section-spacing">
      <div className="section-container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Comprehensive{' '}
            <span className="text-gradient">Financial Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            All your payment needs under one roof
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {serviceCategories.map((category, index) => (
            <div key={index} className="service-card group">
              <div className="flex items-start space-x-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.color} text-white`}>
                  <category.icon className="w-8 h-8" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {category.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {category.services.map((service, serviceIndex) => (
                      <li key={serviceIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-gray-700">{service}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Services Highlight */}
        <div className="glass-card-strong rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Why Choose{' '}
              <span className="text-gradient">NEXASPAY</span>
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our comprehensive suite of financial services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Premium Experience</h4>
              <p className="text-sm text-gray-600">Enterprise-grade solutions with personal touch</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-sm text-gray-600">Process transactions in under 2 seconds</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <BarChart3 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Advanced Analytics</h4>
              <p className="text-sm text-gray-600">Detailed insights and reporting tools</p>
            </div>

            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100">
              <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">Bank-Grade Security</h4>
              <p className="text-sm text-gray-600">256-bit encryption and multi-layer protection</p>
            </div>
          </div>

          {/* API Integration Highlight */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-purple-600">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-600 rounded-xl text-white">
                <Code className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Developer-Friendly APIs
                </h4>
                <p className="text-gray-600 mb-4">
                  Integrate NEXASPAY services into your applications with our comprehensive 
                  RESTful APIs. Complete documentation, SDKs, and 24/7 developer support.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    REST API
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    Webhooks
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    SDKs Available
                  </span>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    24/7 Support
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
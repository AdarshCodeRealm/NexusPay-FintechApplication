import React from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  Building, 
  Award, 
  Search,
  CheckCircle,
  Clock
} from 'lucide-react';

const SecuritySection = () => {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Multi-layer Security',
      description: 'Advanced security protocols protecting your transactions'
    },
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: '256-bit SSL encryption for all data transmission'
    },
    {
      icon: Eye,
      title: 'Biometric Authentication',
      description: 'Fingerprint and face recognition for secure access'
    },
    {
      icon: Building,
      title: 'RBI Compliant',
      description: 'Fully compliant with Reserve Bank of India regulations'
    },
    {
      icon: Award,
      title: 'PCI DSS Certified',
      description: 'Payment Card Industry Data Security Standard certified'
    },
    {
      icon: Search,
      title: 'Real-time Fraud Detection',
      description: 'AI-powered monitoring for suspicious activities'
    }
  ];

  const trustIndicators = [
    {
      title: 'ISO 27001 Certified',
      description: 'International standard for information security management'
    },
    {
      title: 'SSL Secured',
      description: 'All communications encrypted with latest SSL technology'
    },
    {
      title: 'Regular Security Audits',
      description: 'Quarterly security assessments by third-party experts'
    },
    {
      title: '24/7 Monitoring',
      description: 'Round-the-clock security monitoring and incident response'
    }
  ];

  return (
    <section id="security" className="section-spacing">
      <div className="section-container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Your Money, Our{' '}
            <span className="text-gradient">Responsibility</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bank-grade security with 256-bit encryption ensures your financial data 
            and transactions are always protected
          </p>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
            <div key={index} className="glass-card rounded-2xl p-6 text-center group hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust & Compliance Section */}
        <div className="glass-card-strong rounded-3xl p-8 md:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Trusted by{' '}
                  <span className="text-gradient">Thousands</span>
                </h3>
                <p className="text-lg text-gray-600">
                  Our commitment to security and compliance has earned the trust of 
                  users, businesses, and regulatory authorities across India.
                </p>
              </div>

              <div className="space-y-4">
                {trustIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {indicator.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {indicator.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {/* Security Dashboard Mockup */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Security Status</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-600">All Systems Secure</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-sm text-gray-600">Account Security</span>
                    <span className="text-sm font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-sm text-gray-600">Transaction Safety</span>
                    <span className="text-sm font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                    <span className="text-sm text-gray-600">Data Protection</span>
                    <span className="text-sm font-semibold text-green-600">100%</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-2xl font-bold text-purple-600 mb-1">99.99%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 mb-1">&lt;1s</div>
                  <div className="text-sm text-gray-600">Response</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-2xl font-bold text-green-600 mb-1">0</div>
                  <div className="text-sm text-gray-600">Breaches</div>
                </div>
                <div className="text-center p-4 bg-white rounded-2xl shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Monitoring</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Promise */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-purple-600 rounded-xl text-white">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Our Security Promise
                </h4>
                <p className="text-gray-600">
                  We guarantee the highest level of security for your financial data and transactions. 
                  In the unlikely event of unauthorized access due to our security failure, we provide 
                  100% protection with immediate resolution and compensation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
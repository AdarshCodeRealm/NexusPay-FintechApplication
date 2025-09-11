import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Users, FileText, Globe, Phone } from 'lucide-react';
import { Button } from './ui/button';

const PrivacyPolicy = ({ onBack }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Privacy Policy</h1>
                <p className="text-blue-100">NexasPay Digital Wallet & Fintech Platform</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-blue-100">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            {/* Introduction */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Introduction</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Welcome to NexasPay. We are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our digital wallet 
                and fintech services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Full name and contact information</li>
                    <li>• Phone number and email address</li>
                    <li>• Government-issued ID documents (Aadhar, PAN)</li>
                    <li>• Bank account details for transactions</li>
                    <li>• Biometric data for KYC verification</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Financial Information</h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Transaction history and patterns</li>
                    <li>• Wallet balance and account statements</li>
                    <li>• Payment preferences and linked accounts</li>
                    <li>• Credit and risk assessment data</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Technical Information</h3>
                  <ul className="text-gray-700 space-y-1 text-sm">
                    <li>• Device information and identifiers</li>
                    <li>• IP address and location data</li>
                    <li>• App usage analytics and preferences</li>
                    <li>• Security logs and authentication data</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Service Provision</h3>
                  <ul className="text-purple-800 space-y-1 text-sm">
                    <li>• Processing payments and transfers</li>
                    <li>• Maintaining wallet balances</li>
                    <li>• Providing customer support</li>
                    <li>• Account verification and KYC</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Security & Compliance</h3>
                  <ul className="text-blue-800 space-y-1 text-sm">
                    <li>• Fraud detection and prevention</li>
                    <li>• Regulatory compliance (RBI, PMLA)</li>
                    <li>• Risk assessment and monitoring</li>
                    <li>• Identity verification</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Improvement</h3>
                  <ul className="text-green-800 space-y-1 text-sm">
                    <li>• Service enhancement and optimization</li>
                    <li>• Personalized user experience</li>
                    <li>• Product development insights</li>
                    <li>• Performance analytics</li>
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">Communication</h3>
                  <ul className="text-orange-800 space-y-1 text-sm">
                    <li>• Transaction notifications</li>
                    <li>• Security alerts and updates</li>
                    <li>• Marketing communications (with consent)</li>
                    <li>• Policy and service updates</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-bold text-gray-900">Data Security</h2>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-800 mb-4">
                  We implement industry-standard security measures to protect your information:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-red-900">Encryption</h4>
                    <p className="text-sm text-red-700">256-bit SSL encryption for all data transmission</p>
                  </div>
                  <div className="text-center">
                    <Lock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-red-900">Access Control</h4>
                    <p className="text-sm text-red-700">Multi-factor authentication and role-based access</p>
                  </div>
                  <div className="text-center">
                    <Eye className="w-8 h-8 text-red-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-red-900">Monitoring</h4>
                    <p className="text-sm text-red-700">24/7 security monitoring and threat detection</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Information Sharing</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">We may share your information with:</h3>
                  <ul className="text-yellow-800 space-y-1 text-sm">
                    <li>• Payment processors and banking partners</li>
                    <li>• Regulatory authorities (RBI, FIU-IND) when required</li>
                    <li>• KYC verification agencies</li>
                    <li>• Legal authorities under court orders</li>
                    <li>• Service providers under strict confidentiality agreements</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">We do NOT share your information with:</h3>
                  <ul className="text-green-800 space-y-1 text-sm">
                    <li>• Third-party marketers without your consent</li>
                    <li>• Social media platforms for advertising</li>
                    <li>• Data brokers or aggregators</li>
                    <li>• Any unauthorized external parties</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-teal-600" />
                <h2 className="text-xl font-bold text-gray-900">Your Rights</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-teal-50 rounded-lg p-4">
                  <h3 className="font-semibold text-teal-900 mb-2">Data Access Rights</h3>
                  <ul className="text-teal-800 space-y-1 text-sm">
                    <li>• Access your personal information</li>
                    <li>• Request data portability</li>
                    <li>• View transaction history</li>
                    <li>• Download account statements</li>
                  </ul>
                </div>
                <div className="bg-teal-50 rounded-lg p-4">
                  <h3 className="font-semibold text-teal-900 mb-2">Data Control Rights</h3>
                  <ul className="text-teal-800 space-y-1 text-sm">
                    <li>• Correct inaccurate information</li>
                    <li>• Delete your account</li>
                    <li>• Opt-out of marketing communications</li>
                    <li>• Withdraw consent (where applicable)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Data Retention</h2>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 mb-3">
                  We retain your information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• <strong>Transaction records:</strong> 10 years (as per RBI guidelines)</li>
                  <li>• <strong>KYC documents:</strong> 5 years after account closure</li>
                  <li>• <strong>Account information:</strong> Until account deletion + 90 days</li>
                  <li>• <strong>Marketing data:</strong> Until consent withdrawal</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-blue-800 mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">General Inquiries</h4>
                    <p className="text-blue-800 text-sm">Email: privacy@nexaspay.com</p>
                    <p className="text-blue-800 text-sm">Phone: +91-80-1234-5678</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Data Protection Officer</h4>
                    <p className="text-blue-800 text-sm">Email: dpo@nexaspay.com</p>
                    <p className="text-blue-800 text-sm">Address: Bangalore, Karnataka, India</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Updates */}
            <section className="mb-8">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Policy Updates</h3>
                <p className="text-purple-800 text-sm">
                  We may update this Privacy Policy from time to time. We will notify you of any significant changes 
                  through the app, email, or by posting a notice on our website. Your continued use of our services 
                  after the effective date constitutes acceptance of the updated policy.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={scrollToTop}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
        >
          <ArrowLeft className="w-5 h-5 transform rotate-90" />
        </Button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
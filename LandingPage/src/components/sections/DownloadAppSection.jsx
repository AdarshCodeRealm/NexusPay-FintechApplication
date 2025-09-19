import React from 'react';
import { Smartphone, Download, QrCode, Apple, Play, Star } from 'lucide-react';
import nexaspayIcon from '../../assets/nexaspay-favicon.svg';

const DownloadAppSection = () => {
  const appFeatures = [
    'Lightning-fast transactions',
    'Biometric security',
    'Offline transaction history',
    'Push notifications',
    'Dark mode support',
    'Multi-language support'
  ];

  const appScreenshots = [
    {
      title: 'Dashboard',
      description: 'Clean and intuitive home screen'
    },
    {
      title: 'Send Money',
      description: 'Quick money transfer interface'
    },
    {
      title: 'Bill Payments',
      description: 'Easy bill payment options'
    },
    {
      title: 'Transaction History',
      description: 'Detailed transaction records'
    }
  ];

  return (
    <section className="section-spacing">
      <div className="section-container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Take <span className="text-gradient">NEXASPAY</span> Everywhere
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Download our mobile app for iOS and Android and enjoy seamless 
            payments on the go with enhanced mobile features
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* App Information */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                Everything you need in your pocket
              </h3>
              <p className="text-lg text-gray-600">
                Our mobile app brings all the power of NEXASPAY to your smartphone 
                with exclusive mobile features and an optimized user experience.
              </p>
            </div>

            {/* App Features */}
            <div className="grid md:grid-cols-2 gap-4">
              {appFeatures.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-4 rounded-2xl hover:bg-gray-800 transition-colors">
                  <Apple className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </button>

                <button className="flex items-center justify-center space-x-3 bg-black text-white px-6 py-4 rounded-2xl hover:bg-gray-800 transition-colors">
                  <Play className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs">Get it on</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </button>
              </div>

              {/* QR Code Section */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Scan to Download
                    </h4>
                    <p className="text-sm text-gray-600">
                      Scan this QR code with your phone camera to download the app instantly
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* App Rating */}
            <div className="flex items-center space-x-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">4.8/5</span>
              </div>
              <div className="text-sm text-gray-600">
                Based on 10,000+ reviews
              </div>
            </div>
          </div>

          {/* App Screenshots/Mockup */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Phone Mockup */}
              <div className="mx-auto max-w-sm">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl">
                    <div className="bg-white rounded-2xl overflow-hidden">
                      {/* Screen Content */}
                      <div className="aspect-[9/16] bg-gradient-to-br from-purple-50 to-blue-50 p-6">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-6">
                          <div className="text-sm font-medium">9:41</div>
                          <div className="flex space-x-1">
                            <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
                            <div className="w-4 h-2 bg-gray-300 rounded-full"></div>
                            <div className="w-4 h-2 bg-green-500 rounded-full"></div>
                          </div>
                        </div>

                        {/* App Header */}
                        <div className="text-center mb-8">
                          <img 
                            src={nexaspayIcon} 
                            alt="NEXASPAY" 
                            className="w-12 h-12 mx-auto mb-3"
                          />
                          <h3 className="font-bold text-lg">NEXASPAY</h3>
                          <p className="text-sm text-gray-600">Digital Wallet</p>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Wallet Balance</span>
                              <span className="text-lg font-bold text-purple-600">₹15,847</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                              <div className="text-xs font-medium text-gray-600">Send</div>
                            </div>
                            <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                              <div className="text-xs font-medium text-gray-600">Pay Bills</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 glass-card rounded-xl p-3 animate-bounce">
                    <div className="flex items-center space-x-2">
                      <Download className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium">Download Now</span>
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -left-4 glass-card rounded-xl p-3 animate-pulse">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium">Mobile Optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>
          </div>
        </div>

        {/* App Screenshots Showcase */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Designed for the Best User Experience
          </h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            {appScreenshots.map((screenshot, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-28 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  {screenshot.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {screenshot.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Features */}
        <div className="mt-16 glass-card-strong rounded-3xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Coming Soon</h3>
            <p className="text-gray-600">
              Exciting new features coming to the mobile app
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <h4 className="font-semibold text-gray-900 mb-2">Voice Commands</h4>
              <p className="text-sm text-gray-600">Control payments with voice</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <h4 className="font-semibold text-gray-900 mb-2">AI Assistant</h4>
              <p className="text-sm text-gray-600">Smart transaction suggestions</p>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100">
              <h4 className="font-semibold text-gray-900 mb-2">Offline Mode</h4>
              <p className="text-sm text-gray-600">Access history without internet</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
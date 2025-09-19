import React from 'react';
import { UserPlus, Wallet, Send, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      step: '01',
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Download the app or visit our website',
      details: [
        'Register with mobile number and OTP verification',
        'Complete your profile setup',
        'Verify your identity with KYC documents'
      ]
    },
    {
      step: '02',
      icon: Wallet,
      title: 'Add Money',
      description: 'Top-up your wallet using multiple methods',
      details: [
        'Top-up your wallet using credit/debit cards',
        'Link bank accounts for seamless transfers',
        'Set up auto-reload for convenience'
      ]
    },
    {
      step: '03',
      icon: Send,
      title: 'Start Transacting',
      description: 'Begin your digital payment journey',
      details: [
        'Pay bills, recharge mobiles, transfer money',
        'Scan QR codes for instant payments',
        'Track all transactions in real-time'
      ]
    }
  ];

  return (
    <section id="how-it-works" className="section-spacing bg-white/50">
      <div className="section-container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Get Started in{' '}
            <span className="text-gradient">3 Simple Steps</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who trust NEXASPAY for their digital payment needs
          </p>
        </div>

        <div className="relative">
          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 transform translate-x-6 z-0">
                    <ArrowRight className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                  </div>
                )}

                <div className="relative z-10 text-center">
                  {/* Step Number */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold text-xl mb-6 mx-auto">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-purple-600" />
                  </div>

                  {/* Content */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="text-lg text-gray-600 font-medium">
                      {step.description}
                    </p>
                    
                    <ul className="space-y-2 text-left max-w-xs mx-auto">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm text-gray-600">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="glass-card-strong rounded-3xl p-8 md:p-12 max-w-4xl mx-auto">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Join the growing community of users who have made NEXASPAY their 
                preferred digital payment solution. Start your journey today!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary-lg group">
                  Create Account Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="btn-outline px-8 py-4 text-lg rounded-2xl">
                  Learn More
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    RBI Compliant
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    256-bit Encryption
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
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

export default HowItWorksSection;
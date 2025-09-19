import React from 'react';
import { ArrowRight, Play, Shield, Users, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import nexaspayIcon from '../../assets/nexaspay-favicon.svg';

const HeroSection = () => {
  return (
    <section id="home" className="hero-container pt-20">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your Gateway to{' '}
                <span className="text-gradient">Smarter Digital</span>{' '}
                Payments
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                Experience the future of seamless, secure, and instant digital transactions. 
                NEXASPAY empowers everyone from individuals to businesses with innovative 
                financial solutions.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" className="group">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">
                  Trusted by 50,000+ Users
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">
                  99.9% Uptime
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">
                  Bank-Grade Security
                </span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Main Phone Mockup */}
              <div className="glass-card-strong rounded-3xl p-8 mx-auto max-w-sm floating-element">
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">NEXASPAY Wallet</h3>
                      <img 
                        src={nexaspayIcon} 
                        alt="NEXASPAY" 
                        className="w-8 h-8"
                      />
                    </div>
                    
                    <div className="text-center py-6">
                      <div className="text-3xl font-bold">₹25,847</div>
                      <div className="text-white/80 text-sm">Available Balance</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-sm font-medium">Send Money</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-sm font-medium">Pay Bills</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-sm font-medium">Recharge</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <div className="text-sm font-medium">QR Pay</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 glass-card rounded-2xl p-4 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Payment Success</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 glass-card rounded-2xl p-4 animate-pulse animation-delay-1000">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Instant Transfer</span>
                </div>
              </div>
            </div>

            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full blur-3xl opacity-30 -z-10"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-blue-200 rounded-full blur-3xl opacity-20 -z-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
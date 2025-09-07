import React from 'react';

const LoadingScreen = () => {
  // Define the CSS as a string for injection
  const customStyles = `
    @keyframes loading-bar {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    
    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
      }
      50% {
        transform: translateY(-20px) rotate(10deg);
      }
    }
    
    .animate-loading-bar {
      animation: loading-bar 2s ease-in-out infinite;
    }
    
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
  `;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Inject custom styles */}
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-400/10 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-40 w-20 h-20 bg-purple-400/10 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-40 w-28 h-28 bg-indigo-400/5 rounded-full animate-bounce delay-700"></div>
      </div>

      {/* Main Loading Content */}
      <div className="text-center z-10">
        {/* Logo Section */}
        <div className="mb-8">
          <div className="relative mx-auto">
            {/* Outer Rotating Ring */}
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-white border-r-white rounded-full animate-spin"></div>
              
              {/* Inner Logo */}
              <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">₹</span>
              </div>
            </div>
          </div>
          
          {/* Brand Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              NexasPay
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-blue-200 text-lg font-medium">
            Secure Digital Wallet & Payments
          </p>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          {/* Pulsing Dots */}
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse delay-200"></div>
            <div className="w-3 h-3 bg-purple-300 rounded-full animate-pulse delay-400"></div>
          </div>
          
          {/* Loading Text */}
          <p className="text-white/80 text-sm mt-4 animate-pulse">
            Loading your wallet...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="bg-white/20 rounded-full h-1 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-400 to-purple-400 h-full rounded-full animate-loading-bar"></div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12">
          <p className="text-white/60 text-xs">
            Powered by NexasPay Technologies
          </p>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 text-white/10 text-6xl animate-float">
        💳
      </div>
      <div className="absolute top-1/3 right-1/4 text-white/10 text-4xl animate-float delay-1000">
        💰
      </div>
      <div className="absolute bottom-1/3 left-1/3 text-white/10 text-5xl animate-float delay-2000">
        📱
      </div>
    </div>
  );
};

export default LoadingScreen;
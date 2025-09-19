import React from 'react';
import HeroSection from './sections/HeroSection';
import FeaturesSection from './sections/FeaturesSection';
import ServicesSection from './sections/ServicesSection';
import HowItWorksSection from './sections/HowItWorksSection';
import SecuritySection from './sections/SecuritySection';
import StatsSection from './sections/StatsSection';
import TestimonialsSection from './sections/TestimonialsSection';
import DownloadAppSection from './sections/DownloadAppSection';
import ContactSection from './sections/ContactSection';

const LandingPage = () => {
  return (
    <main className="relative">
      <HeroSection />
      <FeaturesSection />
      <ServicesSection />
      <HowItWorksSection />
      <SecuritySection />
      <StatsSection />
      <TestimonialsSection />
      <DownloadAppSection />
      <ContactSection />
    </main>
  );
};

export default LandingPage;
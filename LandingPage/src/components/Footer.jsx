import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight,
  Shield,
  Award,
  CheckCircle
} from 'lucide-react';
import nexaspayIcon from '../assets/nexaspay-favicon.svg';

const Footer = () => {
  const quickLinks = [
    { name: 'About Us', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Services', href: '#services' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Security', href: '#security' },
    { name: 'Contact', href: '#contact' }
  ];

  const services = [
    { name: 'Digital Payments', href: '#' },
    { name: 'Bill Payments', href: '#' },
    { name: 'Mobile Recharge', href: '#' },
    { name: 'Money Transfer', href: '#' },
    { name: 'QR Payments', href: '#' },
    { name: 'Business Solutions', href: '#' }
  ];

  const support = [
    { name: 'Help Center', href: '#' },
    { name: 'FAQ', href: '#' },
    { name: 'User Guide', href: '#' },
    { name: 'API Documentation', href: '#' },
    { name: 'Video Tutorials', href: '#' },
    { name: 'Contact Support', href: '#contact' }
  ];

  const legal = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' },
    { name: 'Refund Policy', href: '#' },
    { name: 'Compliance', href: '#' },
    { name: 'Grievance Policy', href: '#' }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', name: 'Facebook' },
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Instagram, href: '#', name: 'Instagram' },
    { icon: Linkedin, href: '#', name: 'LinkedIn' }
  ];

  const certifications = [
    { name: 'RBI Compliant', icon: CheckCircle },
    { name: 'PCI DSS Certified', icon: Shield },
    { name: 'ISO 27001', icon: Award }
  ];

  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-5"></div>
      
      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="border-b border-gray-800">
          <div className="section-container py-12">
            <div className="glass-card-dark rounded-3xl p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">
                    Stay Updated with{' '}
                    <span className="text-gradient-alt">NEXASPAY</span>
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Get the latest updates on new features, security enhancements, 
                    and special offers delivered straight to your inbox.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button className="btn-primary-lg whitespace-nowrap">
                      Subscribe
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    No spam, unsubscribe at any time. Read our{' '}
                    <a href="#" className="text-purple-400 hover:text-purple-300">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="section-container py-16">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center space-x-3">
                <img 
                  src={nexaspayIcon} 
                  alt="NEXASPAY" 
                  className="w-12 h-12"
                />
                <div>
                  <h3 className="text-2xl font-bold text-gradient-alt">NEXASPAY</h3>
                  <p className="text-sm text-gray-400">Digital Payment Solutions</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                Your trusted partner for secure, fast, and convenient digital payments. 
                Experience the future of financial transactions with NEXASPAY's 
                comprehensive suite of payment services.
              </p>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">1800-XXX-XXXX</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">support@nexaspay.com</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-purple-400 mt-1" />
                  <span className="text-gray-300">
                    Block A, Tech Park Complex<br />
                    Sector 62, Noida - 201309<br />
                    Uttar Pradesh, India
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-purple-600 transition-colors group"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a
                      href={service.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                {support.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legal Links */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-wrap justify-center gap-6 mb-6">
              {legal.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="section-container py-8">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              {/* Copyright */}
              <div className="text-center lg:text-left">
                <p className="text-gray-400">
                  © 2024 NEXASPAY Technologies Pvt. Ltd. All rights reserved.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Made with ❤️ in India for the Digital Future
                </p>
              </div>

              {/* Certifications */}
              <div className="flex flex-wrap items-center gap-6">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <cert.icon className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-gray-400">{cert.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* App Download Links */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="text-center">
                <p className="text-gray-400 mb-4">Download NEXASPAY Mobile App</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">🍎</span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </button>

                  <button className="flex items-center justify-center space-x-3 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition-colors">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold text-sm">📱</span>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-600/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full blur-3xl"></div>
    </footer>
  );
};

export default Footer;
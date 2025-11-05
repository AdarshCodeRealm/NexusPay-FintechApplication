import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Customer Support',
      details: '1800-XXX-XXXX',
      description: 'Toll-free support line',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      details: 'support@nexaspay.com',
      description: 'Get help via email',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      details: 'Available 24/7',
      description: 'Instant chat support',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: '24/7 Support',
      description: 'Round-the-clock assistance',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  return (
    <section id="contact" className="section-spacing bg-white/50">
      <div className="section-container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Get in{' '}
            <span className="text-gradient">Touch</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions or need support? We're here to help you 24/7. 
            Reach out to us through any of the channels below.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">
                Multiple Ways to Reach Us
              </h3>
              <p className="text-lg text-gray-600 mb-8">
                Choose the most convenient way to get in touch with our support team. 
                We're committed to providing quick and helpful responses.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="grid md:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center text-white mb-4`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {info.title}
                  </h4>
                  
                  <div className="text-purple-600 font-medium mb-1">
                    {info.details}
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Office Location */}
            <div className="glass-card-strong rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl text-white">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Head Office
                  </h4>
                  <address className="text-gray-600 not-italic leading-relaxed">
                    NEXASPAY Technologies Pvt. Ltd.<br />
                    Block A, Tech Park Complex<br />
                    Sector 62, Noida - 201309<br />
                    Uttar Pradesh, India
                  </address>
                </div>
              </div>
            </div>

            {/* Response Time Promise */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center space-x-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold text-gray-900">
                  Our Response Promise
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Live Chat: Instant response</li>
                <li>• Phone Support: Under 2 minutes</li>
                <li>• Email Support: Within 4 hours</li>
                <li>• Critical Issues: Immediate escalation</li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-card-strong rounded-3xl p-8">
            <h3 className="text-2xl font-bold mb-6">
              Send us a Message
            </h3>
            
            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Message Sent!
                </h4>
                <p className="text-gray-600">
                  Thank you for contacting us. We'll get back to you within 4 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="business">Business Partnership</option>
                      <option value="billing">Billing Issue</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" className="w-full group">
                  Send Message
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ Quick Links */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-bold mb-4">
            Looking for Quick Answers?
          </h3>
          <p className="text-gray-600 mb-6">
            Check out our comprehensive help center for instant solutions
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-gray-700 hover:text-purple-700">
              FAQ
            </button>
            <button className="px-6 py-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-gray-700 hover:text-purple-700">
              User Guide
            </button>
            <button className="px-6 py-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-gray-700 hover:text-purple-700">
              API Documentation
            </button>
            <button className="px-6 py-3 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 text-gray-700 hover:text-purple-700">
              Video Tutorials
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
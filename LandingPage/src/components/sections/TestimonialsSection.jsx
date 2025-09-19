import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      location: 'Mumbai, Maharashtra',
      rating: 5,
      text: 'NEXASPAY has completely transformed how I handle my daily payments. The app is incredibly fast and the security features give me complete peace of mind. Highly recommended!',
      role: 'Small Business Owner',
      avatar: 'RK'
    },
    {
      name: 'Priya Sharma',
      location: 'Delhi, NCR',
      rating: 5,
      text: 'As a working professional, I need quick and reliable payment solutions. NEXASPAY delivers exactly that with lightning-fast transfers and excellent customer support.',
      role: 'Software Engineer',
      avatar: 'PS'
    },
    {
      name: 'Arjun Patel',
      location: 'Ahmedabad, Gujarat',
      rating: 5,
      text: 'The business features in NEXASPAY are outstanding. Managing my distributor network and tracking commissions has never been easier. Great job team!',
      role: 'Distributor',
      avatar: 'AP'
    },
    {
      name: 'Sneha Reddy',
      location: 'Hyderabad, Telangana',
      rating: 5,
      text: 'I love how simple it is to pay all my bills through NEXASPAY. From electricity to mobile recharge, everything is just a few taps away. Very convenient!',
      role: 'Teacher',
      avatar: 'SR'
    },
    {
      name: 'Vikram Singh',
      location: 'Jaipur, Rajasthan',
      rating: 5,
      text: 'The QR code payments feature is fantastic. My customers can pay instantly and I receive the money immediately. Perfect for my retail business.',
      role: 'Retail Shop Owner',
      avatar: 'VS'
    },
    {
      name: 'Meera Nair',
      location: 'Kochi, Kerala',
      rating: 5,
      text: 'NEXASPAY has made managing my family finances so much easier. The transaction history and analytics help me track our spending perfectly.',
      role: 'Homemaker',
      avatar: 'MN'
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToTestimonial = (index) => {
    setCurrentTestimonial(index);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="section-spacing bg-white/50">
      <div className="section-container">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            What Our{' '}
            <span className="text-gradient">Users Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers 
            have to say about their NEXASPAY experience
          </p>
        </div>

        {/* Main Testimonial Display */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="glass-card-strong rounded-3xl p-8 md:p-12 relative">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
              <Quote className="w-6 h-6 text-purple-600" />
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* User Info */}
              <div className="text-center md:text-left">
                <div className="w-20 h-20 mx-auto md:mx-0 mb-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                  {testimonials[currentTestimonial].avatar}
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {testimonials[currentTestimonial].name}
                </h4>
                
                <p className="text-purple-600 font-medium mb-2">
                  {testimonials[currentTestimonial].role}
                </p>
                
                <p className="text-sm text-gray-500 mb-4">
                  {testimonials[currentTestimonial].location}
                </p>
                
                <div className="flex justify-center md:justify-start">
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
              </div>

              {/* Testimonial Text */}
              <div className="md:col-span-2">
                <blockquote className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial
                    ? 'bg-purple-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                  {testimonial.avatar}
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {testimonial.location}
                  </p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-gray-600 text-sm line-clamp-3">
                "{testimonial.text}"
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs font-medium text-purple-600">
                  {testimonial.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating Summary */}
        <div className="mt-16 glass-card-strong rounded-3xl p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-6">
              Overall Customer Satisfaction
            </h3>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">4.8</div>
                <div className="flex justify-center mb-2">
                  {renderStars(5)}
                </div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">98%</div>
                <div className="text-sm text-gray-600">Recommend to Others</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">5K+</div>
                <div className="text-sm text-gray-600">Happy Reviews</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">24hrs</div>
                <div className="text-sm text-gray-600">Support Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
import React, { useState, useEffect, useRef } from 'react';
import { Users, TrendingUp, Award, MapPin, Building, Clock } from 'lucide-react';

const StatsSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    users: 0,
    transactions: 0,
    successRate: 0,
    merchants: 0
  });

  const sectionRef = useRef(null);

  const stats = [
    {
      icon: Users,
      label: 'Active Users',
      value: 50000,
      suffix: '+',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Transactions Processed',
      value: 10,
      suffix: '+ Crores',
      prefix: '₹',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Award,
      label: 'Success Rate',
      value: 99.9,
      suffix: '%',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Building,
      label: 'Partner Merchants',
      value: 500,
      suffix: '+',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const achievements = [
    {
      icon: Clock,
      title: '24/7 Customer Support',
      description: 'Round-the-clock assistance for all your queries'
    },
    {
      icon: MapPin,
      title: 'All States Covered',
      description: 'Nationwide presence across all Indian states and territories'
    },
    {
      icon: Award,
      title: 'Industry Recognition',
      description: 'Multiple awards for innovation and customer satisfaction'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateCounters();
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const animateCounters = () => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;

      setCounters({
        users: Math.floor(stats[0].value * progress),
        transactions: Math.floor(stats[1].value * progress),
        successRate: (stats[2].value * progress).toFixed(1),
        merchants: Math.floor(stats[3].value * progress)
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounters({
          users: stats[0].value,
          transactions: stats[1].value,
          successRate: stats[2].value,
          merchants: stats[3].value
        });
      }
    }, stepDuration);
  };

  const formatStatValue = (stat, index) => {
    let value;
    switch (index) {
      case 0:
        value = counters.users;
        break;
      case 1:
        value = counters.transactions;
        break;
      case 2:
        value = counters.successRate;
        break;
      case 3:
        value = counters.merchants;
        break;
      default:
        value = 0;
    }

    return `${stat.prefix || ''}${value}${stat.suffix || ''}`;
  };

  return (
    <section ref={sectionRef} className="section-spacing bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-pattern opacity-10"></div>
      
      <div className="section-container relative z-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Trusted by Thousands{' '}
            <span className="text-blue-200">Across India</span>
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Join the growing community of satisfied customers who have made NEXASPAY 
            their preferred digital payment solution
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="stats-card bg-white/10 backdrop-blur-sm border border-white/20 text-center">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="text-4xl font-bold mb-2">
                {formatStatValue(stat, index)}
              </div>
              
              <div className="text-purple-100 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Achievements */}
        <div className="glass-card-dark rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Why Customers Choose Us
            </h3>
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              Our commitment to excellence has earned recognition and trust nationwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <achievement.icon className="w-8 h-8 text-white" />
                </div>
                
                <h4 className="text-xl font-semibold mb-3">
                  {achievement.title}
                </h4>
                
                <p className="text-purple-100">
                  {achievement.description}
                </p>
              </div>
            ))}
          </div>

          {/* Customer Satisfaction Metrics */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-green-300 mb-2">4.8/5</div>
                <div className="text-purple-100">Customer Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-300 mb-2">98%</div>
                <div className="text-purple-100">Customer Retention</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-300 mb-2">&lt;2min</div>
                <div className="text-purple-100">Average Response Time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Join 50,000+ satisfied customers</span>
          </div>
          
          <div className="space-x-4">
            <button className="btn-primary-lg bg-white text-purple-700 hover:bg-gray-100">
              Get Started Today
            </button>
            <button className="px-8 py-4 text-lg font-semibold rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400/20 to-transparent rounded-full blur-3xl translate-x-48 translate-y-48"></div>
    </section>
  );
};

export default StatsSection;
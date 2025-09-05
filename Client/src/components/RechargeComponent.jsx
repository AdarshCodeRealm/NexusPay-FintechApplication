import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mobileRecharge, clearError } from '../store/slices/walletSlice';
import { Button } from './ui/button';

const RechargeComponent = () => {
  const dispatch = useDispatch();
  const { balance, operationLoading, error } = useSelector((state) => state.wallet);
  
  const [activeService, setActiveService] = useState('mobile');
  const [rechargeForm, setRechargeForm] = useState({
    operator: '',
    circle: '',
    number: '',
    amount: '',
    plan: ''
  });

  const operators = {
    mobile: [
      { value: 'airtel', label: 'Airtel' },
      { value: 'jio', label: 'Jio' },
      { value: 'vi', label: 'Vi (Vodafone Idea)' },
      { value: 'bsnl', label: 'BSNL' }
    ],
    dth: [
      { value: 'tata-sky', label: 'Tata Sky' },
      { value: 'dish-tv', label: 'Dish TV' },
      { value: 'airtel-digital', label: 'Airtel Digital TV' },
      { value: 'sun-direct', label: 'Sun Direct' }
    ]
  };

  const circles = [
    'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad',
    'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur'
  ];

  const popularPlans = {
    mobile: [
      { amount: 199, validity: '28 days', benefits: '1.5GB/day, Unlimited calls' },
      { amount: 399, validity: '56 days', benefits: '2.5GB/day, Unlimited calls' },
      { amount: 599, validity: '84 days', benefits: '2GB/day, Unlimited calls' },
      { amount: 719, validity: '90 days', benefits: '1.5GB/day, Unlimited calls' }
    ],
    dth: [
      { amount: 299, validity: '30 days', benefits: 'Base pack + 20 channels' },
      { amount: 499, validity: '30 days', benefits: 'Base pack + 50 channels' },
      { amount: 799, validity: '30 days', benefits: 'Premium pack + 100 channels' }
    ]
  };

  const handleRecharge = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    await dispatch(mobileRecharge({
      operator: rechargeForm.operator,
      circle: rechargeForm.circle,
      number: rechargeForm.number,
      amount: parseFloat(rechargeForm.amount),
      plan: rechargeForm.plan
    }));
    setRechargeForm({
      operator: '',
      circle: '',
      number: '',
      amount: '',
      plan: ''
    });
  };

  const selectPlan = (plan) => {
    setRechargeForm({
      ...rechargeForm,
      amount: plan.amount.toString(),
      plan: `${plan.amount} - ${plan.validity} - ${plan.benefits}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mobile & DTH Recharge</h2>
        <p className="text-gray-600">Instant recharge for mobile and DTH services</p>
        <div className="mt-4 bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Available Balance:</span> ₹{balance?.toFixed(2) || '0.00'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Service Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeService === 'mobile' ? 'default' : 'outline'}
            onClick={() => setActiveService('mobile')}
            className="flex items-center space-x-2"
          >
            <span>📱</span>
            <span>Mobile Recharge</span>
          </Button>
          <Button
            variant={activeService === 'dth' ? 'default' : 'outline'}
            onClick={() => setActiveService('dth')}
            className="flex items-center space-x-2"
          >
            <span>📺</span>
            <span>DTH Recharge</span>
          </Button>
        </div>

        {/* Recharge Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {activeService === 'mobile' ? 'Mobile' : 'DTH'} Recharge Details
            </h3>
            <form onSubmit={handleRecharge} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {activeService === 'mobile' ? 'Mobile Number' : 'Customer ID'}
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={activeService === 'mobile' ? 'Enter mobile number' : 'Enter customer ID'}
                  value={rechargeForm.number}
                  onChange={(e) => setRechargeForm({...rechargeForm, number: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Operator
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={rechargeForm.operator}
                  onChange={(e) => setRechargeForm({...rechargeForm, operator: e.target.value})}
                >
                  <option value="">Select Operator</option>
                  {operators[activeService].map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
              </div>

              {activeService === 'mobile' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Circle
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={rechargeForm.circle}
                    onChange={(e) => setRechargeForm({...rechargeForm, circle: e.target.value})}
                  >
                    <option value="">Select Circle</option>
                    {circles.map((circle) => (
                      <option key={circle} value={circle}>{circle}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min="10"
                  max={balance}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  value={rechargeForm.amount}
                  onChange={(e) => setRechargeForm({...rechargeForm, amount: e.target.value})}
                />
              </div>

              <Button
                type="submit"
                disabled={operationLoading}
                className="w-full"
              >
                {operationLoading ? 'Processing...' : 'Recharge Now'}
              </Button>
            </form>
          </div>

          {/* Popular Plans */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Popular {activeService === 'mobile' ? 'Mobile' : 'DTH'} Plans
            </h3>
            <div className="space-y-3">
              {popularPlans[activeService].map((plan, index) => (
                <div 
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => selectPlan(plan)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-blue-600">₹{plan.amount}</p>
                      <p className="text-sm text-gray-600">{plan.validity}</p>
                      <p className="text-sm text-gray-500 mt-1">{plan.benefits}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Recharges */}
            <div className="mt-8">
              <h4 className="text-md font-medium text-gray-900 mb-3">Recent Recharges</h4>
              <div className="space-y-2">
                <div className="text-center py-4 text-gray-500">
                  <div className="text-4xl mb-2">📱</div>
                  <p className="text-sm">No recent recharges</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Recharge</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[99, 199, 399, 599].map((amount) => (
            <Button
              key={amount}
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
              onClick={() => setRechargeForm({...rechargeForm, amount: amount.toString()})}
            >
              <span className="text-lg font-bold">₹{amount}</span>
              <span className="text-xs text-gray-500">Quick</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RechargeComponent;
import React, { useState } from 'react';
import { subscriptionApi } from '../services/api';

interface SubscriptionModalProps {
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      setIsLoading(true);
      const { url } = await subscriptionApi.createCheckoutSession(plan);
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-8 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Upgrade to Continue
            </h2>
            <p className="text-gray-300">
              You've used your free generation. Subscribe to create unlimited AI agents.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Monthly Plan */}
          <div className="bg-gray-700 rounded-lg p-6 border-2 border-gray-600 hover:border-indigo-500 transition-colors">
            <h3 className="text-2xl font-bold text-white mb-2">Monthly</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">$4.99</span>
              <span className="text-gray-300 ml-2">per month</span>
            </div>
            <ul className="mb-6 space-y-3">
              <Feature text="Unlimited agent generations" />
              <Feature text="Access to all AI models" />
              <Feature text="Smart AI routing" />
              <Feature text="Priority support" />
              <Feature text="Export all configurations" />
            </ul>
            <button
              onClick={() => handleSubscribe('monthly')}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-6 border-2 border-indigo-400 relative">
            <div className="absolute -top-3 right-4 bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
              Save $50/year
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Yearly</h3>
            <div className="mb-4">
              <span className="text-4xl font-bold text-white">$99.99</span>
              <span className="text-gray-100 ml-2">per year</span>
            </div>
            <ul className="mb-6 space-y-3">
              <Feature text="Everything in Monthly" />
              <Feature text="2 months free ($10 savings)" />
              <Feature text="Extended support" />
              <Feature text="Early access to features" />
              <Feature text="Best value for power users" />
            </ul>
            <button
              onClick={() => handleSubscribe('yearly')}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-indigo-600 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <p className="text-gray-300 text-sm">
            Secure payment powered by Stripe • Cancel anytime • No hidden fees
          </p>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start">
    <svg
      className="h-5 w-5 text-green-400 mr-2 mt-0.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M5 13l4 4L19 7"></path>
    </svg>
    <span className="text-white">{text}</span>
  </li>
);

export default SubscriptionModal;

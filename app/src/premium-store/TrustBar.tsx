import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

const trustItems = [
  {
    icon: Truck,
    title: 'Free Shipping',
    subtitle: 'On orders over $50',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    subtitle: '100% safe & encrypted',
  },
  {
    icon: RefreshCw,
    title: 'Easy Returns',
    subtitle: '30-day return policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    subtitle: 'Always here to help',
  },
];

export const TrustBar = () => {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 mb-2">
                  <Icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm">{item.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

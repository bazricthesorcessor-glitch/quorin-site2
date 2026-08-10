import React from 'react';
import { motion } from 'framer-motion';

export const PremiumHero = () => {
  return (
    <section className="px-4 py-8 md:px-8 max-w-7xl mx-auto">
      <div className="bg-gray-50 rounded-[2rem] overflow-hidden relative flex flex-col md:flex-row items-center min-h-[600px] px-8 md:px-16 py-12">
        
        {/* Left Side: Content */}
        <div className="w-full md:w-1/2 z-10 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
          >
            Discover Products <br className="hidden md:block"/> You'll Love
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-500 max-w-md"
          >
            Elevate your everyday with our curated collection of premium goods. Designed for modern living.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4 pt-4"
          >
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-8 py-4 rounded-full transition-all duration-300 shadow-lg shadow-orange-500/25">
              Shop Collection
            </button>
            <button className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-medium px-8 py-4 rounded-full transition-all duration-300">
              View Lookbook
            </button>
          </motion.div>
        </div>

        {/* Right Side: Images */}
        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative h-[400px] md:h-[500px]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full rounded-3xl overflow-hidden shadow-2xl relative"
          >
            <img 
              src="https://images.unsplash.com/photo-1576625807498-892b157bd9d8?q=80&w=1470&auto=format&fit=crop" 
              alt="Artisan Candles" 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Floating Product Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="absolute -left-12 md:-left-24 bottom-12 bg-white p-4 rounded-2xl shadow-2xl w-64 border border-gray-100 hidden md:block"
          >
            <div className="w-full h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden">
               <img src="https://images.unsplash.com/photo-1602874801007-bd458cb6c507?q=80&w=1399&auto=format&fit=crop" alt="Soy Candle" className="w-full h-full object-cover"/>
            </div>
            <h3 className="font-semibold text-gray-900">Organic Soy Candle</h3>
            <p className="text-gray-500 text-sm mb-2">Premium Series</p>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">$249</span>
              <button className="bg-gray-900 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                +
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

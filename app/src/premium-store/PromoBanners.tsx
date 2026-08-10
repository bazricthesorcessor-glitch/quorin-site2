import React from 'react';

export const PromoBanners = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Banner: Flash Sale */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-400 to-rose-600 p-8 md:p-12 min-h-[340px] flex flex-col justify-center text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 mix-blend-multiply opacity-50"></div>
          
          <div className="relative z-10 space-y-6">
            <div>
              <p className="font-bold tracking-widest text-white/90 uppercase text-sm mb-2">Limited Time Offer</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Flash Sale<br/>Up to 50% Off</h2>
            </div>
            
            {/* Static Countdown Timer */}
            <div className="flex gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 text-center border border-white/10">
                <div className="text-2xl font-bold">12</div>
                <div className="text-[10px] uppercase tracking-wider text-white/80">Hours</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 text-center border border-white/10">
                <div className="text-2xl font-bold">45</div>
                <div className="text-[10px] uppercase tracking-wider text-white/80">Mins</div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 text-center border border-white/10">
                <div className="text-2xl font-bold">30</div>
                <div className="text-[10px] uppercase tracking-wider text-white/80">Secs</div>
              </div>
            </div>

            <button className="bg-white text-orange-600 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors shadow-lg mt-2">
              Shop Sale
            </button>
          </div>
        </div>

        {/* Right Banner: New Collection */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 p-8 md:p-12 min-h-[340px] flex flex-col justify-center text-white">
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1480&auto=format&fit=crop')] bg-cover bg-center"></div>
          
          <div className="relative z-10 space-y-6">
            <div>
              <p className="font-bold tracking-widest text-gray-400 uppercase text-sm mb-2">Just Arrived</p>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white">New<br/>Collection</h2>
            </div>
            
            <p className="text-gray-300 max-w-xs">
              Discover our latest premium craft supplies designed for perfect results every time.
            </p>

            <button className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white hover:text-slate-900 transition-colors mt-2">
              Explore Now
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

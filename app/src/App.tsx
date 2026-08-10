import React from 'react';
import { PremiumHero } from './premium-store/PremiumHero';
import { TrustBar } from './premium-store/TrustBar';
import { ProductGrid } from './premium-store/ProductGrid';
import { PromoBanners } from './premium-store/PromoBanners';

function App() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Simple Header for completeness */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight">PREMIUM.</div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="#" className="hover:text-gray-900 transition-colors">Shop</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Collections</a>
            <a href="#" className="hover:text-gray-900 transition-colors">About</a>
          </nav>
          <div className="flex gap-4">
            <button className="text-gray-600 hover:text-gray-900 transition-colors">Search</button>
            <button className="text-gray-600 hover:text-gray-900 transition-colors">Cart (0)</button>
          </div>
        </div>
      </header>

      <main>
        <PremiumHero />
        <TrustBar />
        <ProductGrid />
        <PromoBanners />
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Premium Store. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

import React from 'react';
import { ProductCard } from './ProductCard';

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Premium Eco Resin Starter Kit',
    category: 'Eco Resin',
    price: 85,
    rating: 5,
    reviews: 124,
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=1470&auto=format&fit=crop',
    imageAlt: 'https://images.unsplash.com/photo-1577918544976-96a9282361b7?q=80&w=1470&auto=format&fit=crop',
    isNew: true
  },
  {
    id: 2,
    name: 'Eco Create Beginner Kit',
    category: 'Eco Create Kits',
    price: 45,
    oldPrice: 60,
    discount: 25,
    rating: 4,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1605234123565-d6d7b2909403?q=80&w=1470&auto=format&fit=crop',
  },
  {
    id: 3,
    name: 'Organic Soy Candle Wax 5lbs',
    category: 'Candle Wax',
    price: 32,
    rating: 5,
    reviews: 256,
    image: 'https://images.unsplash.com/photo-1602874801007-bd458cb6c507?q=80&w=1374&auto=format&fit=crop',
  },
  {
    id: 4,
    name: 'Geode Coaster Silicone Molds',
    category: 'Silicone Molds',
    price: 18,
    rating: 4,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=1480&auto=format&fit=crop',
    isNew: true
  },
  {
    id: 5,
    name: 'Shea Butter Soap Base',
    category: 'Soap Bases',
    price: 24,
    oldPrice: 30,
    discount: 20,
    rating: 5,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=1470&auto=format&fit=crop',
  }
];

export const ProductGrid = () => {
  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 md:px-8 bg-gray-50/50">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">New Arrivals</h2>
        </div>
        <a href="#" className="hidden md:inline-block text-gray-900 font-medium border-b border-gray-900 pb-0.5 hover:text-orange-500 hover:border-orange-500 transition-colors">
          View All
        </a>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {MOCK_PRODUCTS.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      <div className="mt-12 text-center md:hidden">
        <button className="border-2 border-gray-900 text-gray-900 font-medium px-8 py-3 rounded-full w-full">
          View All
        </button>
      </div>
    </section>
  );
};

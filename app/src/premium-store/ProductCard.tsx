import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';

export const ProductCard = ({ product }: { product: any }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="group cursor-pointer bg-white rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
        {/* Badges */}
        {product.isNew && (
          <div className="absolute top-3 left-3 z-10 bg-black text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md">
            New
          </div>
        )}
        {product.discount && (
          <div className="absolute top-3 left-3 z-10 bg-orange-500 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md">
            -{product.discount}%
          </div>
        )}

        {/* Image */}
        <img 
          src={isHovered && product.imageAlt ? product.imageAlt : product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="space-y-1 relative pr-12">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
        <h3 className="font-semibold text-gray-900 leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-bold text-gray-900">${product.price}</span>
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">${product.oldPrice}</span>
          )}
        </div>
        
        {/* Star Rating */}
        <div className="flex items-center gap-1 pt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-3 h-3 ${i < product.rating ? 'fill-orange-400 text-orange-400' : 'fill-gray-200 text-gray-200'}`} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviews})</span>
        </div>
      </div>

      {/* Circular Add to Cart Button */}
      <button className="absolute bottom-4 right-4 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-orange-500 hover:scale-110 transition-all duration-300 shadow-md z-10">
        <ShoppingCart className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

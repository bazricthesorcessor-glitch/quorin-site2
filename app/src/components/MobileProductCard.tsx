import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/data/products';
import { getProductId } from '@/data/products';
import { toast } from 'sonner';

interface MobileProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
}

const fallbackImage = 'http://localhost:9000/product-resin-kit.webp';

function getProductImage(product: Product): string {
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === 'string' ? img : img?.url || 'http://localhost:9000/product-resin-kit.webp';
  }
  return fallbackImage;
}

export default function MobileProductCard({
  product,
  onAddToCart,
  onClick,
}: MobileProductCardProps) {
  const dragX = useMotionValue(0);
  
  // Transform drag distance to background opacity and scale
  const backgroundOpacity = useTransform(dragX, [0, 80], [0, 1]);
  const backgroundScale = useTransform(dragX, [0, 80], [0.8, 1]);
  const cardX = useTransform(dragX, [0, 120], [0, 120]);
  
  const discount = parseInt(product.discount ?? '0');
  const image = getProductImage(product);

  const handleDragEnd = (event: any, info: any) => {
    // If dragged right past the threshold (80px), trigger add to cart
    if (info.offset.x > 80) {
      onAddToCart(product);
      toast.success(`Added ${product.name} to cart!`);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-[0_4px_16px_var(--shadow-card)] h-full">
      {/* Background Swipe Action Indicator */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-[var(--color-action)] flex items-center justify-start pl-6 rounded-l-2xl z-0 pointer-events-none"
        style={{
          width: '100%',
          opacity: backgroundOpacity,
          scale: backgroundScale,
          transformOrigin: 'left center',
        }}
      >
        <div className="flex flex-col items-center gap-0.5 text-white">
          <ShoppingCart size={20} className="text-white" />
          <span className="text-[9px] font-bold tracking-wider">ADD</span>
        </div>
      </motion.div>

      {/* Draggable Card Top Layer */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 120 }}
        dragElastic={{ left: 0, right: 0.15 }}
        style={{ x: cardX }}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        className="bg-[var(--color-surface)] p-3 z-10 relative flex flex-col h-full cursor-pointer select-none active:scale-[0.98] transition-transform duration-100"
      >
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[var(--color-background)]">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
          {discount > 0 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[var(--color-accent)] text-white shadow-sm">
              {product.discount} OFF
            </div>
          )}
        </div>

        {/* Title */}
        <h4 className="text-xs font-semibold line-clamp-2 text-[var(--color-text-primary)] mb-1 flex-grow">
          {product.name}
        </h4>

        {/* Price & Swipe Hint */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[var(--color-text-primary)]">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-[9px] line-through text-[var(--color-text-muted)]">
                ₹{product.mrp}
              </span>
            )}
          </div>
          <span className="text-[8px] font-medium tracking-wider text-[var(--color-accent)] border border-[var(--color-accent-soft)] px-2 py-0.5 rounded-full bg-[var(--color-accent-soft)]">
            Swipe ➔
          </span>
        </div>
      </motion.div>
    </div>
  );
}

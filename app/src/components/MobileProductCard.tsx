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

const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="#F8F5EF"><rect width="400" height="400"/><text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="48" fill="#C9A96E">Q</text></svg>')}`;

function getProductImage(product: Product): string {
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    const url = typeof img === 'string' ? img : img?.url;
    if (url && !url.includes('localhost:9000')) return url;
  }
  return PLACEHOLDER_IMAGE;
}

export default function MobileProductCard({
  product,
  onAddToCart,
  onClick,
}: MobileProductCardProps) {
  const dragX = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Transform drag distance to background opacity and scale
  const backgroundOpacity = useTransform(dragX, [0, 80], [0, 1]);
  const backgroundScale = useTransform(dragX, [0, 80], [0.8, 1]);
  
  const discount = parseInt(product.discount ?? '0');
  const image = getProductImage(product);

  const handleDragEnd = (_event: any, info: any) => {
    setIsDragging(false);
    // If dragged right past the threshold (80px), trigger add to cart
    if (info.offset.x > 80) {
      onAddToCart(product);
      toast.success(`Added ${product.name} to cart!`);
    }
  };

  const handleClick = () => {
    // Don't trigger click if we were dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border-subtle)] shadow-[0_4px_16px_var(--shadow-card)] h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
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
        dragSnapToOrigin
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={handleClick}
        className="bg-[var(--color-surface)] p-3 z-10 relative flex flex-col h-full cursor-pointer select-none active:scale-[0.98] transition-transform duration-100"
      >
        {/* Product Image */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-[var(--color-background)]">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.dataset.fallback) {
                target.dataset.fallback = 'true';
                target.src = PLACEHOLDER_IMAGE;
              }
            }}
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
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ArrowRight } from 'lucide-react';
import type { Product } from '@/data/products';
import { getProductId } from '@/data/products';
import { toast } from 'sonner';

interface MobileProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: () => void;
  onToggleWishlist?: (product: Product) => void;
  inWishlist?: boolean;
}

const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" fill="#F8F5EF"><rect width="400" height="400"/><text x="200" y="200" text-anchor="middle" dominant-baseline="central" font-family="sans-serif" font-size="48" fill="#C9A96E">Q</text></svg>')}`;

function getProductImage(product: Product): string {
  // Prefer local product photos over stock/Unsplash images
  if (product.images_local && product.images_local.length > 0) {
    return product.images_local[0];
  }
  if (product.images && product.images.length > 0) {
    const img = product.images[0];
    const url = typeof img === 'string' ? img : img?.url;
    if (url && !url.includes('localhost:9000') && !url.includes('unsplash')) return url;
  }
  return PLACEHOLDER_IMAGE;
}

export default function MobileProductCard({
  product,
  onAddToCart,
  onClick,
  onToggleWishlist,
  inWishlist,
}: MobileProductCardProps) {
  const image = getProductImage(product);
  
  const discount = parseInt(product.discount ?? '0');

  return (
    <motion.div
      className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div onClick={onClick} className="cursor-pointer select-none">
        <div className="relative aspect-[4/4.6] w-full overflow-hidden bg-[#E9E0D7]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {discount > 0 && (
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-semibold bg-white/85 text-black backdrop-blur">
              {product.discount} OFF
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist?.(product);
            }}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/85 backdrop-blur grid place-items-center"
            style={{ color: inWishlist ? 'var(--color-accent)' : 'black' }}
          >
            <Heart size={15} fill={inWishlist ? 'var(--color-accent)' : 'none'} />
          </button>

          <div className="absolute left-4 right-4 bottom-4 flex items-end justify-between gap-3 text-white">
            <div className="max-w-[70%]">
              <div className="text-[10px] uppercase tracking-[0.24em] text-white/70">Featured Starter Product</div>
              <h4 className="quorin-brand text-2xl leading-none mt-1">{product.name}</h4>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">₹{product.price}</div>
              {product.mrp > product.price && (
                <div className="text-xs text-white/70 line-through">₹{product.mrp}</div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            {product.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-[#F5F0EA] px-3 py-1 text-[10px] font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
                toast.success(`Added ${product.name} to cart!`);
              }}
              className="flex-1 rounded-full bg-black px-4 py-3 text-sm font-medium text-white"
            >
              Add to Cart
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className="h-12 w-12 rounded-full border border-black/10 bg-white flex items-center justify-center"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

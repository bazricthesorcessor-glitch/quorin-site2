import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ArrowLeft } from 'lucide-react';
import { quorinData, getProductId, type Category, type Product } from '@/data/products';
import MobileProductCard from '@/components/MobileProductCard';
import { useIsMobile } from '@/hooks/use-mobile';
import type { AccountRecord } from '@/data/accounts';

interface WishlistPageProps {
  currentAccount: AccountRecord | null;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  categories?: Category[];
}

export default function WishlistPage({ currentAccount, onToggleWishlist, onAddToCart, categories }: WishlistPageProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const source = categories ?? quorinData.categories;
  const allProducts = source.flatMap((c) => c.products);

  const wishlistProducts = (currentAccount?.wishlist ?? [])
    .map((id) => allProducts.find((p) => getProductId(p) === id))
    .filter((p): p is Product => p !== undefined);

  if (isMobile) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen pt-16 pb-24 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] mb-4 cursor-pointer"
          style={{ position: 'relative', zIndex: 100 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        
        <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)]">My Wishlist</h1>
        
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border-subtle)] p-6">
            <Heart size={40} className="text-[var(--color-text-muted)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {wishlistProducts.map((product) => (
              <div key={getProductId(product)} className="relative">
                <MobileProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onClick={() => navigate(`/product/${getProductId(product)}`)}
                />
                {/* Remove button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(getProductId(product));
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-md text-red-500 z-20 cursor-pointer"
                >
                  <Heart size={12} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-dominant)', minHeight: '100vh', position: 'relative' }}>
      <div className="max-w-7xl mx-auto px-6 pt-6 py-12">
        <motion.button
          className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
          style={{ 
            position: 'absolute',
            left: '4cm',
            top: '40px',
            zIndex: 100,
            background: 'var(--color-surface-hover)', 
            border: '1px solid var(--color-border-subtle)', 
            color: 'var(--color-text-primary)' 
          }}
          whileHover={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </motion.button>

        <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Heart size={24} fill="var(--color-accent)" color="var(--color-accent)" />
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              My Wishlist
            </h1>
            {wishlistProducts.length > 0 && (
              <span className="text-sm px-2.5 py-0.5 rounded-full" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                {wishlistProducts.length}
              </span>
            )}
          </div>

          {wishlistProducts.length === 0 ? (
            <div className="text-center py-20">
              <Heart size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
              <p className="text-lg mb-2" style={{ color: 'var(--color-text-muted)' }}>Your wishlist is empty</p>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Save products you love — they'll appear here.</p>
              <motion.button
                className="px-6 py-3 rounded-full text-sm font-medium"
                style={{ background: 'var(--color-accent)', color: 'white' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
              >
                Browse Products
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistProducts.map((product) => (
                <motion.div
                  key={getProductId(product)}
                  className="flex gap-4 p-4 rounded-xl cursor-pointer"
                  style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}
                  whileHover={{ y: -2, borderColor: 'var(--color-accent)' }}
                  onClick={() => navigate(`/product/${getProductId(product)}`)}
                >
                  <img
                    src={typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url ?? '/product-resin-kit.webp'}
                    alt={product.name}
                    className="w-20 h-20 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {product.name}
                    </h4>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>
                      {product.description}
                    </p>
                    <p className="text-sm font-bold mt-2" style={{ color: 'var(--color-accent)' }}>₹{product.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        className="text-xs font-medium underline"
                        style={{ color: 'var(--color-accent)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(getProductId(product));
                        }}
                      >
                        Remove
                      </button>
                      <button
                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: 'var(--color-accent)', color: 'white' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                      >
                        <ShoppingCart size={12} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

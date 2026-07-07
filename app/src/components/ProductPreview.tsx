import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2, ExternalLink, Heart } from 'lucide-react';
import { getProductId, type Product, type ProductReview } from '@/data/products';

interface ProductPreviewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onOpenFullProduct?: (productId: string) => void;
  onNavigateFromProduct?: (productId: string) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export default function ProductPreview({ product, isOpen, onClose, onAddToCart, onOpenFullProduct, onNavigateFromProduct, onToggleWishlist, isInWishlist }: ProductPreviewProps) {
  const navigate = useNavigate();
  const [showReviews, setShowReviews] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [showWrite, setShowWrite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (isOpen && product) {
      setDescriptionText(product.description || 'Premium quality crafting supply from QUORIN. Carefully selected materials for the best results in your creative projects.');
      setReviews(product.reviews ? [...product.reviews] : []);
      setShowWrite(false);
      setNewReviewText('');
      setSelectedImage(0);
    }
  }, [isOpen, product]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Full Product Mode triggers: F key, double-click, expand button
  const triggerFullProduct = useCallback(() => {
    if (product) {
      onOpenFullProduct?.(getProductId(product));
    }
  }, [product, onOpenFullProduct]);

  const [lastClickTime, setLastClickTime] = useState(0);

  const handleDoubleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime < 350) {
      triggerFullProduct();
    }
    setLastClickTime(now);
  }, [lastClickTime, triggerFullProduct]);

  // F key handler for full product mode (only when preview is open, not in inputs)
  useEffect(() => {
    if (!isOpen || !product) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        triggerFullProduct();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, product, triggerFullProduct]);

  // prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: 'rgba(42, 33, 24, 0.25)' }}
        >
          <motion.div
            className="relative max-w-5xl w-full rounded-2xl overflow-hidden"
            initial={{ y: 32, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 32, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleDoubleClick}
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-shrink-0 w-full md:w-2/5 h-56 md:h-[420px] rounded-xl overflow-hidden bg-[var(--color-ivory)]">
                  {product.images && product.images.length > 1 ? (
                    <div className="relative w-full h-full">
                      <motion.img
                        key={selectedImage}
                        src={typeof product.images[selectedImage] === 'string' ? (product.images[selectedImage] as string) : product.images[selectedImage]?.url || '/product-resin-kit.webp'}
                        alt={`${product.name} - Image ${selectedImage + 1}`}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === 0 ? product.images!.length - 1 : prev - 1); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedImage(prev => prev === product.images!.length - 1 ? 0 : prev + 1); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight size={16} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {product.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(idx); }}
                            className={`w-2 h-2 rounded-full transition-all ${idx === selectedImage ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <motion.img
                      src={typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url || '/product-resin-kit.webp'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </div>
                <div className="flex-1 md:w-3/5">
                  <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{product.name}</h3>

                  <label className="text-sm mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Description</label>
                  <div className="w-full p-4 mb-4 rounded-xl bg-[var(--color-ivory)] text-sm" style={{ color: 'var(--color-text-primary)', minHeight: 120, whiteSpace: 'pre-wrap', border: '1px solid var(--color-border-subtle)' }}>
                    {descriptionText}
                  </div>

                  <div className="mb-4">
                    <span className="text-xl font-semibold" style={{ color: 'var(--color-accent)' }}>₹{product.price}</span>
                    <span className="text-sm ml-3" style={{ color: 'var(--color-text-muted)' }}>MRP ₹{product.mrp}</span>
                  </div>

                  <div className="flex gap-3 items-center flex-wrap">
                    <button
                      className="px-6 py-3 rounded-full text-sm tracking-wider"
                      style={{ background: 'var(--color-accent)', color: 'white' }}
                      onClick={() => {
                        if (onAddToCart) {
                          onAddToCart(product);
                        } else {
                          window.dispatchEvent(new CustomEvent('quorin:addToCart', { detail: product }));
                        }
                      }}
                    >
                      Add to Bag
                    </button>

                    <button
                      className="px-6 py-3 rounded-full text-sm tracking-wider"
                      style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }}
                      onClick={() => setShowReviews((s) => !s)}
                    >
                      {showReviews ? 'Hide Reviews' : 'Reviews'}
                    </button>

                    <button
                      className="px-6 py-3 rounded-full text-sm tracking-wider"
                      style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }}
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>

                  {showReviews && (
                    <div className="mt-6 p-5 rounded-xl bg-[var(--color-ivory)] max-h-72 overflow-y-auto" style={{ border: '1px solid var(--color-border-subtle)' }}>
                      <div className="flex items-center justify-between mb-4">
                        <strong style={{ color: 'var(--color-text-primary)' }}>Customer Reviews</strong>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 rounded-md text-sm"
                            style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }}
                            onClick={() => { setShowWrite((s) => !s); }}
                          >
                            {showWrite ? 'Cancel' : 'Write Review'}
                          </button>
                        </div>
                      </div>

                      {showWrite && (
                        <div className="mb-4">
                          <textarea
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[var(--color-surface)] outline-none"
                            placeholder="Share your experience..."
                            rows={4}
                            style={{ border: '1px solid var(--color-border-subtle)' }}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              className="px-4 py-2 rounded-full text-sm"
                              style={{ background: 'var(--color-accent)', color: 'white' }}
                              onClick={() => {
                                if (!newReviewText.trim()) return;
                                const r = { author: 'You', text: newReviewText.trim(), date: new Date().toISOString() };
                                setReviews((s) => [...s, r]);
                                window.dispatchEvent(new CustomEvent('quorin:reviewAdded', { detail: { productId: getProductId(product), review: r } }));
                                setNewReviewText('');
                                setShowWrite(false);
                              }}
                            >
                              Submit Review
                            </button>
                          </div>
                        </div>
                      )}

                      {reviews && reviews.length > 0 ? (
                        reviews.map((r: any, i: number) => (
                          <div key={i} className="mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: 'var(--color-border-subtle)' }}>
                            <div>
                              <strong className="block" style={{ color: 'var(--color-text-primary)' }}>{r.author || 'Anonymous'}</strong>
                              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{r.text || r.comment || '—'}</span>
                            </div>
                            <div className="flex-shrink-0 mt-1">
                              <button
                                className="px-2 py-1 text-xs"
                                style={{ color: 'var(--color-text-muted)', background: 'transparent' }}
                                onClick={() => {
                                  setReviews((prev) => prev.filter((_, idx) => idx !== i));
                                  window.dispatchEvent(new CustomEvent('quorin:reviewRemoved', { detail: { productId: getProductId(product), index: i } }));
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No reviews yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* close X */}
            <motion.button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full"
              style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={18} />
            </motion.button>

            {/* Navigate to full product page — left button (opens full-screen mode) */}
            <motion.button
              aria-label="Open full product page"
              onClick={(e) => { e.stopPropagation(); onOpenFullProduct?.(getProductId(product)); }}
              className="absolute top-4 left-4 p-2 rounded-full"
              style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
              whileHover={{ scale: 1.1, background: 'var(--color-action)', color: 'white' }}
              whileTap={{ scale: 0.9 }}
            >
              <Maximize2 size={18} />
            </motion.button>

            {/* Wishlist heart — moved to avoid overlapping close (top-right area, offset) */}
            <motion.button
              aria-label="Toggle wishlist"
              onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(getProductId(product)); }}
              className="absolute top-4 left-16 p-2 rounded-full"
              style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border-subtle)', color: isInWishlist ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
              whileHover={{ scale: 1.1, background: isInWishlist ? 'var(--color-accent-soft)' : 'var(--color-surface-hover)' }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={18} fill={isInWishlist ? 'var(--color-accent)' : 'none'} />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

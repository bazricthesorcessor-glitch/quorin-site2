import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/data/products';

interface ProductPreviewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductPreview({ product, isOpen, onClose }: ProductPreviewProps) {
  const [showReviews, setShowReviews] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const [reviews, setReviews] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [showWrite, setShowWrite] = useState(false);


  useEffect(() => {
    if (isOpen && product) {
      const random = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia, nunc non posuere luctus, justo nulla convallis urna, nec fermentum nibh sapien a nunc.';
      setDescriptionText((product.description ? product.description + ' ' : '') + random);
      setReviews(product.reviews ? [...product.reviews] : []);
      setShowWrite(false);
      setNewReviewText('');
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
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ background: 'rgba(8,8,13,0.9)' }}
        >
          <motion.div
            className="relative max-w-6xl w-full mx-4 md:mx-8 rounded-2xl overflow-hidden"
            initial={{ y: 40, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ background: 'var(--color-secondary)' }} className="p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 w-full md:w-2/5 h-64 md:h-[520px] bg-black rounded-lg overflow-hidden">
                  <img src={product.images?.[0] || '/product-resin-kit.jpg'} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 md:w-3/5">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{product.name}</h3>

                  <label className="text-sm mb-2 block" style={{ color: 'var(--color-text-muted)' }}>Description</label>
                  <div className="w-full p-3 mb-4 rounded-md bg-[rgba(255,255,255,0.02)] text-sm" style={{ color: 'var(--color-text-primary)', minHeight: 120, whiteSpace: 'pre-wrap' }}>
                    {descriptionText}
                  </div>

                  <div className="mb-4">
                    <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>₹{product.price}</span>
                    <span className="text-sm line-through ml-3" style={{ color: 'var(--color-text-muted)' }}>₹{product.mrp}</span>
                  </div>

                  <div className="flex gap-3 items-center">
                    <button
                      className="px-6 py-3 rounded-full"
                      style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }}
                      onClick={() => {
                        // trigger add-to-cart via custom event so App can handle it (keeps component decoupled)
                        window.dispatchEvent(new CustomEvent('quorin:addToCart', { detail: product }));
                      }}
                    >
                      Add to Cart
                    </button>

                    <button
                      className="px-6 py-3 rounded-full border"
                      style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }}
                      onClick={() => setShowReviews((s) => !s)}
                    >
                      {showReviews ? 'Hide Reviews' : 'Reviews'}
                    </button>

                    <button
                      className="px-6 py-3 rounded-full border"
                      style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }}
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>

                  {showReviews && (
                    <div className="mt-4 p-4 bg-[rgba(255,255,255,0.02)] rounded-md max-h-72 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <strong style={{ color: 'var(--color-text-primary)' }}>Customer Reviews</strong>
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 rounded-md border text-sm"
                            style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }}
                            onClick={() => { setShowWrite((s) => !s); }}
                          >
                            {showWrite ? 'Cancel' : 'Write Review'}
                          </button>
                        </div>
                      </div>

                      {showWrite && (
                        <div className="mb-3">
                          <textarea
                            value={newReviewText}
                            onChange={(e) => setNewReviewText(e.target.value)}
                            className="w-full p-2 rounded-md bg-[rgba(0,0,0,0.2)]"
                            placeholder="Write your review here..."
                            rows={4}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              className="px-4 py-2 rounded-full"
                              style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }}
                              onClick={() => {
                                if (!newReviewText.trim()) return;
                                const r = { author: 'You', text: newReviewText.trim(), date: new Date().toISOString() };
                                setReviews((s) => [...s, r]);
                                // emit event so app or parent can persist or react
                                window.dispatchEvent(new CustomEvent('quorin:reviewAdded', { detail: { productId: product.id, review: r } }));
                                setNewReviewText('');
                                setShowWrite(false);
                              }}
                            >
                              Send Review
                            </button>
                          </div>
                        </div>
                      )}

                      {reviews && reviews.length > 0 ? (
                        reviews.map((r: any, i: number) => (
                          <div key={i} className="mb-3 flex items-start justify-between gap-4">
                            <div>
                              <strong className="block" style={{ color: 'var(--color-text-primary)' }}>{r.author || 'Anonymous'}</strong>
                              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{r.text || r.comment || '—'}</span>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                className="px-2 py-1 text-xs rounded-md border"
                                style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }}
                                onClick={() => {
                                  // remove review by index
                                  setReviews((prev) => prev.filter((_, idx) => idx !== i));
                                  window.dispatchEvent(new CustomEvent('quorin:reviewRemoved', { detail: { productId: product.id, index: i } }));
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
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

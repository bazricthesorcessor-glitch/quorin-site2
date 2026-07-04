import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Maximize2, ShoppingCart,
  Heart, Truck, ShieldCheck, RotateCcw, Gift, Star, ExternalLink,
} from 'lucide-react';
import { useFullProductMode } from '@/contexts/FullProductModeContext';
import { getProductId, type Category, type Product, type ProductReview } from '@/data/products';
import FullscreenImageViewer from '@/components/FullscreenImageViewer';

interface FullProductOverlayProps {
  productId: string;
  categories: Category[];
  productsById: Map<string, Product>;
  onAddToCart: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
  onClose: () => void;
  canReview?: boolean;
}

const fallbackImage = '/product-resin-kit.webp';

const resolveImages = (product: Product | undefined): string[] => {
  if (!product) return [fallbackImage];
  const local = product.images_local && product.images_local.length > 0 
    ? product.images_local 
    : null;
  const main = product.images && product.images.length > 0 
    ? product.images.map(img => typeof img === 'string' ? img : img?.url || fallbackImage) 
    : null;
  const list = local ?? main ?? [fallbackImage];
  return list.length > 0 ? list : [fallbackImage];
};

export default function FullProductOverlay({
  productId,
  categories,
  productsById,
  onAddToCart,
  onToggleWishlist,
  isInWishlist,
  onClose,
  canReview,
}: FullProductOverlayProps) {
  const navigate = useNavigate();
  const { close, closeImmediately } = useFullProductMode();
  const [activeImage, setActiveImage] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quorin.reviews') ?? '{}');
      return stored[productId] ?? [];
    } catch { return []; }
  });

  const product = useMemo(() => {
    if (!productId) return undefined;
    // Direct lookup by product id, then by computed getProductId (handles slugified keys).
    return productsById.get(productId)
      ?? Array.from(productsById.values()).find((p) => getProductId(p) === productId);
  }, [productId, productsById]);

  const allProducts = useMemo(() => categories.flatMap((c) => c.products), [categories]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  const images = useMemo(() => resolveImages(product), [product]);

  useEffect(() => {
    setActiveImage(0);
    setFullscreenOpen(false);
    setAddedFeedback(false);
  }, [productId]);

  // Keyboard: Esc closes, arrows navigate images.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        onClose();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [images.length, close, onClose]);

  const handleAddToCart = () => {
    if (!product) return;
    onAddToCart(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleBack = () => {
    close();
    onClose();
  };

  const handleOpenFullPage = () => {
    if (!product) return;
    const id = getProductId(product);
    closeImmediately();
    navigate(`/product/${encodeURIComponent(id)}`);
  };

  const openRelated = (related: Product) => {
    const id = getProductId(related);
    navigate(`/product/${encodeURIComponent(id)}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim() || !product) return;
    const allReviews = { ...JSON.parse(localStorage.getItem('quorin.reviews') ?? '{}') };
    const productReviews = allReviews[productId] ?? [];
    const newReview: ProductReview = {
      author: 'You',
      text: reviewText.trim(),
      date: new Date().toISOString().slice(0, 10),
      rating: reviewRating,
    };
    let updated: ProductReview[];
    if (editingIndex !== null) {
      updated = [...productReviews];
      updated[editingIndex] = newReview;
    } else {
      updated = [...productReviews, newReview];
    }
    allReviews[productId] = updated;
    localStorage.setItem('quorin.reviews', JSON.stringify(allReviews));
    setLocalReviews(updated);
    setReviewText('');
    setReviewRating(5);
    setEditingIndex(null);
    setReviewSubmitted(true);
  };

  const handleEditReview = (index: number) => {
    const review = localReviews[index];
    if (!review) return;
    setReviewText(review.text);
    setReviewRating(review.rating ?? 5);
    setEditingIndex(index);
    setReviewSubmitted(false);
  };

  const handleRemoveReview = (target: ProductReview) => {
    const allReviews = { ...JSON.parse(localStorage.getItem('quorin.reviews') ?? '{}') };
    const productReviews = allReviews[productId] ?? [];
    const filtered = productReviews.filter(
      (r: ProductReview) => !(r.author === target.author && r.text === target.text && r.rating === target.rating)
    );
    allReviews[productId] = filtered;
    localStorage.setItem('quorin.reviews', JSON.stringify(allReviews));
    setLocalReviews(filtered);
    setEditingIndex(null);
    setReviewSubmitted(false);
  };

  const discount = product && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[200] overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: 'var(--color-background)' }}
        >
          {/* Back button (top-left) */}
          <motion.button
            className="fixed top-4 left-2 z-[210] flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Back</span>
          </motion.button>

          {/* Open Full Page button (top-right) */}
          <motion.button
            className="fixed top-4 right-4 z-[210] flex items-center gap-2 px-4 py-2.5 rounded-full"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenFullPage}
          >
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Open Full Page</span>
            <ExternalLink size={16} style={{ color: 'var(--color-text-primary)' }} />
          </motion.button>

          <div className="max-w-7xl mx-auto px-6 pt-6 pb-24" onDoubleClick={handleOpenFullPage}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-20">
              {/* Image gallery */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <motion.div
                  className="relative overflow-hidden rounded-2xl mb-4 cursor-pointer"
                  style={{ height: 520, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                  whileHover={{ boxShadow: '0 20px 60px var(--shadow-deep)' }}
                  onClick={() => setFullscreenOpen(true)}
                >
                  <motion.img
                    key={activeImage}
                    src={images[activeImage] || fallbackImage}
                    alt={`${product.name} - Image ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 px-4 py-2 rounded-full" style={{ background: 'var(--color-accent)', color: 'white' }}>
                      <span className="text-sm font-bold">-{discount}% OFF</span>
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-4 right-4 px-4 py-2 rounded-full flex items-center gap-1" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Star size={14} color="white" fill="white" /> Featured
                    </div>
                  )}
                  {/* Fullscreen zoom button */}
                  <motion.button
                    className="absolute bottom-4 right-4 p-3 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                    whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.25)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); setFullscreenOpen(true); }}
                  >
                    <Maximize2 size={20} color="white" />
                  </motion.button>
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                      <span className="text-white text-xs font-medium">{activeImage + 1} / {images.length}</span>
                    </div>
                  )}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1)); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1)); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.4)', color: 'white' }}
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                </motion.div>

                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <motion.button
                        key={idx}
                        className={`rounded-xl overflow-hidden ${idx === activeImage ? 'ring-2 ring-amber-400' : ''}`}
                        style={{ height: 80 }}
                        onClick={() => setActiveImage(idx)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Product info */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs tracking-[0.15em] mb-4" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)', border: '1px solid var(--color-accent-medium)' }}>
                  {product.category}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {product.name}
                </h1>
                <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                  {product.description}
                </p>

                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>₹{product.price}</span>
                  {discount > 0 && (
                    <>
                      <span className="text-lg line-through" style={{ color: 'var(--color-text-muted)' }}>₹{product.mrp}</span>
                      <span className="text-sm" style={{ color: 'var(--color-success)' }}>Save ₹{product.mrp - product.price}</span>
                    </>
                  )}
                </div>

                {product.variant && (
                  <div className="mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Variant: <span style={{ color: 'var(--color-text-primary)' }}>{product.variant}</span>
                    {product.size ? ` · ${product.size}` : ''}
                  </div>
                )}

                <div className="flex gap-3 mb-6">
                  <motion.button
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-semibold"
                    style={{
                      background: addedFeedback ? 'var(--color-success)' : 'var(--color-accent)',
                      color: 'white',
                    }}
                    whileHover={{ scale: addedFeedback ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                  >
                    {addedFeedback ? <>✓ Added to Bag</> : <><ShoppingCart size={20} /> Add to Bag</>}
                  </motion.button>
                  <motion.button
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'var(--color-surface)',
                      border: `2px solid ${isInWishlist ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleWishlist?.(getProductId(product))}
                  >
                    <Heart size={20} color={isInWishlist ? 'var(--color-accent)' : 'var(--color-text-secondary)'} fill={isInWishlist ? 'var(--color-accent)' : 'none'} />
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[
                    { icon: Truck, label: 'Fast Delivery', desc: '2-4 days across India' },
                    { icon: ShieldCheck, label: 'Secure Payment', desc: 'Protected checkout' },
                    { icon: RotateCcw, label: 'Easy Returns', desc: '7-day return policy' },
                    { icon: Gift, label: 'Gift Wrapping', desc: 'Available at checkout' },
                  ].map((f, i) => (
                    <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}>
                      <f.icon size={18} style={{ color: 'var(--color-accent)', marginBottom: 6 }} />
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{f.label}</div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</div>
                    </div>
                  ))}
                </div>

                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm tracking-[0.15em] mb-2" style={{ color: 'var(--color-text-muted)' }}>FEATURES</h3>
                    <ul className="space-y-1">
                      {product.features.map((f, i) => (
                        <li key={i} className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                          <span style={{ color: 'var(--color-accent)' }}>•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-xs tracking-wider" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Reviews */}
            <motion.section
              className="mt-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
                Customer <span style={{ color: 'var(--color-accent)' }}>Reviews</span>
              </h2>

              {(() => {
                const allReviews = [...(product.reviews ?? []), ...localReviews];
                return allReviews.length > 0 ? (
                  <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                    {allReviews.map((review, i) => {
                      const localIdx = localReviews.findIndex(
                        (lr) => lr.author === review.author && lr.text === review.text && lr.rating === review.rating
                      );
                      return (
                      <div
                        key={i}
                        className="p-5 rounded-xl"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                            {review.author}
                          </span>
                          <div className="flex items-center gap-2">
                            {review.date && (
                              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {review.date}
                              </span>
                            )}
                            {localIdx !== -1 && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  className="text-xs underline"
                                  style={{ color: 'var(--color-accent)' }}
                                  onClick={() => handleEditReview(localIdx)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="text-xs underline"
                                  style={{ color: 'var(--color-destructive)' }}
                                  onClick={() => handleRemoveReview(review)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {review.rating && (
                          <div className="flex items-center gap-0.5 mb-2">
                            {Array.from({ length: 5 }).map((_, si) => (
                              <Star
                                key={si}
                                size={14}
                                fill={si < review.rating! ? 'var(--color-accent)' : 'none'}
                                color="var(--color-accent)"
                              />
                            ))}
                          </div>
                        )}
                        {review.text && (
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                            {review.text}
                          </p>
                        )}
                        {review.comment && (
                          <p className="text-xs mt-1 italic" style={{ color: 'var(--color-text-secondary)' }}>
                            “{review.comment}”
                          </p>
                        )}
                      </div>
                    );
                  })}
                  </div>
                ) : (
                  <div
                    className="p-8 rounded-xl text-center"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
                  >
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      No reviews yet.
                    </p>
                  </div>
                );
              })()}

              {canReview && !reviewSubmitted && (
                <div className="mt-6">
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-xs mr-2" style={{ color: 'var(--color-text-muted)' }}>Rating:</span>
                    {Array.from({ length: 5 }).map((_, si) => (
                      <button
                        key={si}
                        type="button"
                        onClick={() => setReviewRating(si + 1)}
                        className="p-0.5"
                      >
                        <Star
                          size={20}
                          fill={si < reviewRating ? 'var(--color-accent)' : 'none'}
                          color="var(--color-accent)"
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="w-full rounded-xl p-4 text-sm outline-none resize-none"
                    rows={3}
                    placeholder="Write your review…"
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-5 py-2.5 rounded-full text-sm font-medium"
                      style={{ background: 'var(--color-accent)', color: 'white' }}
                      onClick={handleSubmitReview}
                    >
                      {editingIndex !== null ? 'Update Review' : 'Submit Review'}
                    </button>
                    {editingIndex !== null && (
                      <button
                        className="px-5 py-2.5 rounded-full text-sm font-medium"
                        style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                        onClick={() => { setEditingIndex(null); setReviewText(''); setReviewRating(5); }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

              {reviewSubmitted && (
                <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }}>
                  Thank you for your review!
                </p>
              )}
            </motion.section>

            {/* You might also like */}
            {relatedProducts.length > 0 && (
              <motion.section
                className="mt-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
                  You might also <span style={{ color: 'var(--color-accent)' }}>like</span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {relatedProducts.map((rp, idx) => {
                    const rpImages = resolveImages(rp);
                    const rpDiscount = rp.mrp > rp.price ? Math.round(((rp.mrp - rp.price) / rp.mrp) * 100) : 0;
                    return (
                      <motion.div
                        key={rp.id}
                        className="relative overflow-hidden rounded-2xl cursor-pointer"
                        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08 }}
                        whileHover={{ y: -5, boxShadow: '0 15px 40px var(--shadow-deep)' }}
                        onClick={() => openRelated(rp)}
                      >
                        <div className="relative" style={{ height: 180 }}>
                          <img src={rpImages[0]} alt={rp.name} className="w-full h-full object-cover" />
                          {rpDiscount > 0 && (
                            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--color-accent)', color: 'white' }}>
                              -{rpDiscount}%
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>{rp.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold" style={{ color: 'var(--color-accent)' }}>₹{rp.price}</span>
                            {rpDiscount > 0 && <span className="text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>₹{rp.mrp}</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            )}
          </div>

          {/* Fullscreen image viewer */}
          <FullscreenImageViewer
            isOpen={fullscreenOpen}
            images={images}
            title={product.name}
            onClose={() => setFullscreenOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Heart, Minus, Plus, Star, ArrowRight, Maximize2, ExternalLink, Truck, ShieldCheck, RotateCcw, Gift } from 'lucide-react';
import { quorinData, getProductId, type Category, type Product, type ProductReview } from '@/data/products';
import FullscreenImageViewer from '@/components/FullscreenImageViewer';
import type { AccountRecord } from '@/data/accounts';

interface ProductDetailPageProps {
  currentAccount: AccountRecord | null;
  onAddToCart: (product: Product, quantity: number) => void;
  openPreview: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  categories?: Category[];
}

const productCategories = [
  { id: 'resin-art', label: 'Resin Art', color: 'from-amber-500/20 to-amber-900/10' },
  { id: 'candle-making', label: 'Candle Making', color: 'from-orange-500/20 to-orange-900/10' },
  { id: 'soap-making', label: 'Soap Making', color: 'from-pink-500/20 to-pink-900/10' },
  { id: 'tools', label: 'Tools', color: 'from-slate-500/20 to-slate-900/10' },
  { id: 'supplies', label: 'Craft Supplies', color: 'from-emerald-500/20 to-emerald-900/10' },
];

export default function ProductDetailPage({ currentAccount, onAddToCart, openPreview, onToggleWishlist, categories }: ProductDetailPageProps) {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const source = categories ?? quorinData.categories;
  const allProducts = source.flatMap((c) => c.products);
  const findProduct = (id: string) => allProducts.find((p) => getProductId(p) === id) ?? allProducts[0];
  const getProductById = (id: string) => allProducts.find((p) => p.id === id);
  const [product, setProduct] = useState<Product>(findProduct(productId ?? ''));
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('resin-art');
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [localReviews, setLocalReviews] = useState<ProductReview[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('quorin.reviews') ?? '{}');
      return stored[productId ?? ''] ?? [];
    } catch { return []; }
  });

  useEffect(() => {
    const p = productId ? findProduct(productId) : getProductById('resin');
    setProduct(p ?? allProducts[0]);
    setActiveImage(0);
    setWishlist(false);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  // Check if product is in current account's wishlist
  useEffect(() => {
    if (currentAccount) {
      setWishlist(currentAccount.wishlist?.includes(getProductId(product)) ?? false);
    }
  }, [currentAccount, product]);

  const allImages = product.images_local && product.images_local.length > 0
    ? product.images_local
    : product.images;

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleWishlistToggle = () => {
    const productId = getProductId(product);
    setWishlist(!wishlist);
    onToggleWishlist?.(productId);
  };

  const handleSubmitReview = () => {
    if (!reviewText.trim() || !product) return;
    const newReview: ProductReview = {
      author: currentAccount?.profile.displayName ?? 'You',
      text: reviewText.trim(),
      date: new Date().toISOString().slice(0, 10),
      rating: reviewRating,
    };
    const allReviews = { ...JSON.parse(localStorage.getItem('quorin.reviews') ?? '{}') };
    const productReviews = allReviews[getProductId(product)] ?? [];
    let updated: ProductReview[];
    if (editingIndex !== null) {
      updated = [...productReviews];
      updated[editingIndex] = newReview;
    } else {
      updated = [...productReviews, newReview];
    }
    allReviews[getProductId(product)] = updated;
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
    const productReviews = allReviews[getProductId(product)] ?? [];
    const filtered = productReviews.filter(
      (r: ProductReview) => !(r.author === target.author && r.text === target.text && r.rating === target.rating)
    );
    allReviews[getProductId(product)] = filtered;
    localStorage.setItem('quorin.reviews', JSON.stringify(allReviews));
    setLocalReviews(filtered);
    setEditingIndex(null);
    setReviewSubmitted(false);
  };

  const getCategory = (catId: string) => productCategories.find((c) => c.id === catId);
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="bg-[var(--color-background)] min-h-screen pb-32">
        {/* Floating Header / Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="fixed top-4 left-4 z-40 p-3 rounded-full bg-black/60 text-white backdrop-blur-md shadow-md cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Swipable Image Gallery */}
        <div className="relative w-full h-[45vh] bg-[var(--color-surface)] border-b border-[var(--color-border-subtle)]">
          <div
            className="flex overflow-x-auto snap-x snap-mandatory h-full scrollbar-none scroll-smooth"
            onScroll={(e) => {
              const scrollLeft = (e.target as HTMLElement).scrollLeft;
              const width = (e.target as HTMLElement).clientWidth;
              setActiveImage(Math.round(scrollLeft / width));
            }}
          >
            {allImages.map((img, idx) => (
              <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
                <img src={img} alt={product.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          
          {/* Indicator dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
              {allImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeImage ? 'bg-white w-3' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="px-5 py-6">
          {/* Category Tag */}
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-accent)]">
            {getCategory(product.category)?.label ?? product.category}
          </span>
          
          {/* Title */}
          <h1 className="text-2xl font-bold mt-1.5 mb-3 text-[var(--color-text-primary)]">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-[var(--color-text-primary)]">
              ₹{product.price}
            </span>
            {discount > 0 && (
              <>
                <span className="text-sm line-through text-[var(--color-text-muted)]">
                  ₹{product.mrp}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          {/* Variant / Size selection */}
          {(product.variant || product.size) && (
            <div className="mb-6">
              <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-3">Variants & Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.variant && (
                  <span className="px-3 py-1.5 rounded-full text-xs bg-[var(--color-surface)] border border-[var(--color-accent)] text-[var(--color-text-primary)] font-semibold">
                    {product.variant}
                  </span>
                )}
                {product.size && (
                  <span className="px-3 py-1.5 rounded-full text-xs bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] font-medium">
                    {product.size}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-xs font-bold tracking-wider text-[var(--color-text-muted)] uppercase mb-2">Description</h3>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Trust features */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { icon: Truck, label: 'Fast Delivery', desc: '2-4 days' },
              { icon: ShieldCheck, label: 'Secure Checkout', desc: '100% protected' },
            ].map((f, i) => (
              <div key={i} className="p-3 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-xl flex items-start gap-2.5">
                <f.icon size={18} className="text-[var(--color-accent)] mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">{f.label}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-8 border-t border-[var(--color-border-subtle)] pt-6">
            <h2 className="text-lg font-bold mb-4 text-[var(--color-text-primary)]">
              Customer Reviews
            </h2>
            
            {/* Reviews display */}
            {localReviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {localReviews.map((review, idx) => (
                  <div key={idx} className="p-4 bg-[var(--color-surface)] border border-[var(--color-border-subtle)] rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">{review.author}</span>
                      <span className="text-[10px] text-[var(--color-text-muted)]">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-2 text-amber-500">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" className="stroke-none" />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--color-text-muted)] italic">No reviews yet. Be the first to write one!</p>
            )}
          </div>
        </div>

        {/* Floating Bottom Purchase Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-md border-t border-[var(--color-border-subtle)] p-4 flex items-center justify-between gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-extrabold text-[var(--color-text-muted)] tracking-wider">Total Price</span>
            <span className="text-lg font-extrabold text-[var(--color-text-primary)]">₹{product.price}</span>
          </div>
          
          <div className="flex items-center gap-2.5">
            {/* Quantity Selector */}
            <div className="flex items-center bg-[var(--color-background)] rounded-full border border-[var(--color-border-subtle)] px-1.5 py-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1 text-[var(--color-text-primary)]"
              >
                <Minus size={12} />
              </button>
              <span className="px-2 text-xs font-bold text-[var(--color-text-primary)] min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-1 text-[var(--color-text-primary)]"
              >
                <Plus size={12} />
              </button>
            </div>
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="px-6 py-2.5 bg-[var(--color-accent)] text-white font-bold rounded-full text-xs shadow-[0_4px_12px_rgba(201,169,110,0.3)] active:scale-95 transition-transform"
            >
              Add to Cart
            </button>

            {/* Wishlist Button */}
            <button
              onClick={handleWishlistToggle}
              className={`p-2.5 rounded-full border ${
                wishlist ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--color-border-subtle)]'
              }`}
            >
              <Heart size={16} color={wishlist ? 'var(--color-accent)' : 'var(--color-text-secondary)'} fill={wishlist ? 'var(--color-accent)' : 'none'} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-dominant)' }}>
      <div className="max-w-7xl mx-auto pt-6 py-12" style={{ paddingLeft: 0, paddingRight: '1.5rem' }}>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full mb-6 ml-6"
          style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', position: 'relative', zIndex: 10 }}
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Main Image */}
            <motion.div
              className="relative overflow-hidden rounded-2xl mb-4 cursor-pointer"
              style={{ height: '500px', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
              whileHover={{ boxShadow: '0 20px 60px var(--shadow-deep)' }}
              onClick={() => setFullscreenOpen(true)}
            >
              <motion.img
                src={allImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              />
              {/* Discount badge */}
              {discount > 0 && (
                <motion.div
                  className="absolute top-4 left-4 px-4 py-2 rounded-full"
                  style={{ background: 'var(--color-accent)', color: 'white' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  <span className="text-sm font-bold">-{discount}% OFF</span>
                </motion.div>
              )}
              {/* Featured badge */}
              {product.featured && (
                <motion.div
                  className="absolute top-4 right-4 px-4 py-2 rounded-full flex items-center gap-1"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                >
                  <Star size={14} color="white" fill="white" /> Featured
                </motion.div>
              )}
              {/* Fullscreen button */}
              <motion.button
                className="absolute bottom-4 right-4 p-3 rounded-full"
                style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.25)' }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setFullscreenOpen(true); }}
              >
                <Maximize2 size={20} color="white" />
              </motion.button>
              {/* Image counter */}
              {allImages.length > 1 && (
                <motion.div
                  className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <span className="text-white text-xs font-medium">{activeImage + 1} / {allImages.length}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {allImages.map((img, idx) => (
                  <motion.button
                    key={idx}
                    className={`rounded-xl overflow-hidden ${idx === activeImage ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#1e150f]' : ''}`}
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

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Category tag */}
            <motion.div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs tracking-[0.15em]"
              style={{
                background: getCategory(product.category)?.label === 'Resin Art' ? 'rgba(217, 171, 79, 0.15)' : 'var(--color-accent-soft)',
                color: 'var(--color-accent)',
                border: '1px solid var(--color-accent-medium)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {getCategory(product.category)?.label ?? product.category}
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-4xl md:text-5xl font-bold mt-4 mb-3"
              style={{ color: 'var(--color-text-primary)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {product.name}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="text-lg leading-relaxed mb-8"
              style={{ color: 'var(--color-text-secondary)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {product.description}
            </motion.p>

            {/* Price */}
            <motion.div
              className="flex items-baseline gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <span className="text-4xl font-bold" style={{ color: 'var(--color-accent)' }}>
                ₹{product.price}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-xl line-through" style={{ color: 'var(--color-text-muted)' }}>
                    ₹{product.mrp}
                  </span>
                  <span className="text-sm font-medium text-green-400">
                    You save ₹{product.mrp - product.price}
                  </span>
                </>
              )}
            </motion.div>

            {/* Quantity */}
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <span className="text-sm tracking-[0.15em]" style={{ color: 'var(--color-text-secondary)' }}>QUANTITY</span>
              <div className="flex items-center gap-0 rounded-full" style={{ border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <motion.button
                  className="px-4 py-2"
                  style={{ background: 'var(--color-surface)', border: 'none', cursor: 'pointer' }}
                  whileHover={{ background: 'var(--color-surface-hover)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus size={16} style={{ color: 'var(--color-text-primary)' }} />
                </motion.button>
                <span className="px-6 py-2 text-lg font-bold text-center" style={{ color: 'var(--color-text-primary)', minWidth: 50 }}>
                  {quantity}
                </span>
                <motion.button
                  className="px-4 py-2"
                  style={{ background: 'var(--color-surface)', border: 'none', cursor: 'pointer' }}
                  whileHover={{ background: 'var(--color-surface-hover)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus size={16} style={{ color: 'var(--color-text-primary)' }} />
                </motion.button>
              </div>
            </motion.div>

            {/* Add to cart */}
            <motion.div
              className="flex gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <motion.button
                className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-sm tracking-[0.15em] font-semibold"
                style={{
                  background: addedFeedback ? 'linear-gradient(135deg, #4ade80, #22c55e)' : 'var(--color-accent)',
                  color: addedFeedback ? '#000' : '#fff',
                  border: 'none',
                }}
                whileHover={{ scale: addedFeedback ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
              >
                {addedFeedback ? (
                  <>
                    <span>Added!</span>
                    <motion.span
                      className="inline-block"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      ✓
                    </motion.span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={20} /> Add to Cart
                  </>
                )}
              </motion.button>
              <motion.button
                className="p-4 rounded-2xl"
                style={{
                  background: 'var(--color-surface)',
                  border: `2px solid ${wishlist ? 'var(--color-accent)' : 'var(--color-border-subtle)'}`,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleWishlistToggle}
              >
                <Heart size={20} color={wishlist ? 'var(--color-accent)' : 'var(--color-text-secondary)'} fill={wishlist ? 'var(--color-accent)' : 'none'} />
              </motion.button>
            </motion.div>

            {/* Features */}
            <motion.div
              className="grid grid-cols-2 gap-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {[
                { icon: Truck, label: 'Fast Delivery', desc: '2-4 days across India' },
                { icon: ShieldCheck, label: 'Secure Payment', desc: '100% protected checkout' },
                { icon: RotateCcw, label: 'Easy Returns', desc: '7-day return policy' },
                { icon: Gift, label: 'Gift Wrapping', desc: 'Available on checkout' },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }}
                >
                  <f.icon size={20} style={{ color: 'var(--color-accent)', marginBottom: 8 }} />
                  <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{f.label}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</div>
                </div>
              ))}
            </motion.div>

            {/* Tags */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs tracking-wider"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-muted)' }}
                >
                  #{tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Fullscreen Image Viewer */}
        <FullscreenImageViewer
          isOpen={fullscreenOpen}
          images={allImages}
          title={product.name}
          onClose={() => setFullscreenOpen(false)}
        />

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

          {currentAccount && !reviewSubmitted && (
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

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            className="mt-24"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Related <span style={{ color: 'var(--color-accent)' }}>Products</span>
              </h2>
              <motion.button
                className="flex items-center gap-2 text-sm tracking-[0.15em]"
                style={{ color: 'var(--color-accent)' }}
                whileHover={{ x: 5 }}
                onClick={() => navigate(`/category/${product.category}`)}
              >
                View All <ArrowRight size={16} />
              </motion.button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((rp, idx) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5, boxShadow: '0 15px 40px var(--shadow-deep)' }}
                >
                  <CategoryProductCard product={rp} currentAccount={currentAccount} onAddToCart={onAddToCart} openPreview={openPreview} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* All Categories Quick Nav */}
        <motion.section
          className="mt-24 mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text-primary)' }}>
            Browse <span style={{ color: 'var(--color-accent)' }}>All Categories</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {productCategories.map((cat, idx) => (
              <motion.button
                key={cat.id}
                className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all ${cat.id === selectedCategory ? 'ring-2 ring-amber-400' : ''}`}
                style={{
                  background: `linear-gradient(135deg, ${cat.id === selectedCategory ? 'var(--color-accent)' : 'var(--color-surface)'}, ${cat.id === selectedCategory ? 'var(--color-accent-medium)' : 'var(--color-surface-hover)'})`,
                  border: '1px solid var(--color-border-subtle)',
                  height: 120,
                }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <span className="relative z-10 text-sm font-bold tracking-[0.15em]" style={{ color: cat.id === selectedCategory ? 'white' : 'var(--color-text-primary)' }}>
                  {cat.label}
                </span>
                <motion.div
                  className="absolute inset-0 opacity-10"
                  style={{ background: `linear-gradient(135deg, ${cat.color}, transparent)` }}
                />
              </motion.button>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

// Mini card for related products
function CategoryProductCard({ product, onAddToCart }: {
  product: Product;
  currentAccount: AccountRecord | null;
  onAddToCart: (product: Product, qty: number) => void;
  openPreview: (product: Product) => void;
}) {
  const navigate = useNavigate();
  const productImage = product.images_local && product.images_local.length > 0
    ? product.images_local[0]
    : (typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url || '/product-resin-kit.webp');

  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl cursor-pointer"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      onClick={() => navigate(`/product/${getProductId(product)}`)}
      whileHover={{ borderColor: 'var(--color-accent)', boxShadow: '0 20px 60px var(--shadow-deep)' }}
    >
      <div className="relative" style={{ height: 200 }}>
        <img src={productImage} alt={product.name} className="w-full h-full object-cover" />
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'var(--color-accent)', color: 'white' }}>
            -{discount}%
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-sm font-semibold mb-2 line-clamp-2" style={{ color: 'var(--color-text-primary)' }}>
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold" style={{ color: 'var(--color-accent)' }}>₹{product.price}</span>
          {discount > 0 && (
            <span className="text-sm line-through" style={{ color: 'var(--color-text-muted)' }}>₹{product.mrp}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

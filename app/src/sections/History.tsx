import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import ProductPreview from '@/components/ProductPreview';
import { X } from 'lucide-react';
import type { AccountOrder, AccountRecord } from '@/data/accounts';
import type { Product } from '@/data/products';
import { getProductId } from '@/data/products';

interface HistorySectionProps {
  currentAccount: AccountRecord | null;
  onUpdateOrder: (orderId: string, patch: Partial<AccountOrder>) => void;
  productsById: Map<string, Product>;
}

const resolveThumbnail = (order: AccountOrder, productsById: Map<string, Product>): string => {
  const liveProduct = productsById.get(order.productId);
  if (liveProduct?.images?.[0]) {
    return liveProduct.images[0];
  }
  return order.snapshot.thumbnail || '/product-resin-kit.webp';
};

const resolveProduct = (order: AccountOrder, productsById: Map<string, Product>): Product => {
  const liveProduct = productsById.get(order.productId);

  if (liveProduct) {
    return {
      ...order.snapshot,
      id: order.productId,
      description: liveProduct.description || order.snapshot.name,
      mrp: liveProduct.mrp ?? Math.round(order.snapshot.price * 1.8),
      images: liveProduct.images?.[0]?.startsWith('http')
        ? [liveProduct.images[0]]
        : [order.snapshot.thumbnail],
      category: liveProduct.category || '',
      tags: liveProduct.tags || [],
      featured: liveProduct.featured,
      discount: liveProduct.discount,
    };
  }

  return {
    id: order.productId,
    name: order.snapshot.name,
    description: order.snapshot.name,
    price: order.snapshot.price,
    mrp: Math.round(order.snapshot.price * 1.8),
    images: [order.snapshot.thumbnail, '/product-resin-kit.webp'],
    category: '',
    tags: [],
  };
};

export default function HistorySection({ currentAccount, onUpdateOrder, productsById }: HistorySectionProps) {
  const navigate = useNavigate();
  const orders = currentAccount?.orders ?? [];
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [commenting, setCommenting] = useState<{ id: string; text: string } | null>(null);
  const [confirmReturn, setConfirmReturn] = useState<{ id: string } | null>(null);
  const [customOrderOpen, setCustomOrderOpen] = useState(false);
  const [customOrderText, setCustomOrderText] = useState('');
  const [customOrderSubmitted, setCustomOrderSubmitted] = useState<string | null>(null);
  const [returnFlow, setReturnFlow] = useState<{
    id: string;
    reason: string;
    availableFrom: string;
    images: string[];
  } | null>(null);
  const [reviewing, setReviewing] = useState<{ id: string; productId: string; name: string; text: string; submitted: boolean } | null>(null);

  const canReturn = (orderDate: string) => {
    const d = new Date(orderDate);
    const diff = Date.now() - d.getTime();
    return diff <= 3 * 24 * 60 * 60 * 1000; // 3 days
  };

  const requestReturn = (id: string) => {
    onUpdateOrder(id, { status: 'returned' });
    setConfirmReturn(null);
  };

  const submitComment = (id: string, text: string) => {
    onUpdateOrder(id, { comment: text });
    setCommenting(null);
  };

  const navigateToProduct = useCallback((product: Product) => {
    navigate(`/product/${encodeURIComponent(getProductId(product))}`);
  }, [navigate]);

  const submitReview = (id: string, productId: string, text: string) => {
    // Save review to localStorage (backend integration point)
    try {
      const reviews = JSON.parse(localStorage.getItem('quorin.reviews') ?? '{}');
      const productReviews = reviews[productId] || [];
      productReviews.push({
        text,
        date: new Date().toISOString(),
        orderId: id,
      });
      reviews[productId] = productReviews;
      localStorage.setItem('quorin.reviews', JSON.stringify(reviews));
    } catch { /* silently fail */ }
    setReviewing(null);
  };

  return (
    <section id="orders" data-section="orders" className="py-24 px-4 md:px-8" style={{ background: 'var(--color-dominant)' }}>
      <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Your Orders</h2>

      {!currentAccount ? (
        <div className="rounded-xl border p-6" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-ivory)' }}>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Sign in to view your orders</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Each account sees its own past orders only.
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border p-6" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-ivory)' }}>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No orders yet</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {currentAccount.profile.displayName} has no past orders right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()).map((o) => (
            <div key={o.id} className="p-5 rounded-xl cursor-pointer" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)' }} onClick={() => navigateToProduct(resolveProduct(o, productsById))}>
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={resolveThumbnail(o, productsById)}
                    alt={o.snapshot.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/product-resin-kit.webp';
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 style={{ color: 'var(--color-text-primary)' }}>{o.snapshot.name}</h3>
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{new Date(o.orderDate).toLocaleDateString()}</span>
                  </div>

                  <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{o.comment || 'No comment'}</p>

                  <div className="mt-4 flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                    <button className="px-3 py-2 rounded-full text-sm" style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }} onClick={() => { setPreviewProduct(resolveProduct(o, productsById)); setPreviewOpen(true); }}>Preview</button>

                    <button className="px-3 py-2 rounded-full text-sm" style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }} onClick={() => setCommenting({ id: o.id, text: o.comment || '' })}>Comment</button>

                    <button className="px-3 py-2 rounded-full text-sm" style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }} onClick={() => setReviewing({ id: o.id, productId: o.productId, name: o.snapshot.name, text: '', submitted: false })}>Write Review</button>

                      {o.status === 'delivered' && canReturn(o.orderDate) && (
                        <button
                          className="px-3 py-2 rounded-full text-sm"
                          style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }}
                          onClick={() => setConfirmReturn({ id: o.id })}
                        >
                          Return
                        </button>
                      )}

                     <button
                        className="px-3 py-2 rounded-full text-sm"
                        style={{ border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)', background: 'var(--color-surface)' }}
                        onClick={() => setCustomOrderOpen(true)}
                      >
                        Custom Order
                      </button>
                  </div>
                  {customOrderSubmitted && (
                    <p className="mt-3 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                      Custom request saved: {customOrderSubmitted}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* modals */}
      <ProductPreview product={previewProduct} isOpen={previewOpen} onClose={() => setPreviewOpen(false)} />

      {commenting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(42, 33, 24, 0.25)' }} onClick={() => setCommenting(null)}>
          <div className="bg-white p-6 rounded-2xl" onClick={(e) => e.stopPropagation()} style={{ minWidth: 320 }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Leave a comment</h3>
            <textarea className="w-full h-32 p-3 rounded-lg" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }} value={commenting.text} onChange={(e) => setCommenting({ ...commenting!, text: e.target.value })} />
            <div className="mt-3 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-full text-sm" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }} onClick={() => setCommenting(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-full text-sm" style={{ background: 'var(--color-accent)', color: 'white' }} onClick={() => submitComment(commenting.id, commenting.text)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {confirmReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(42, 33, 24, 0.25)' }} onClick={() => setConfirmReturn(null)}>
          <div className="bg-white p-6 rounded-2xl" onClick={(e) => e.stopPropagation()} style={{ minWidth: 320 }}>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Confirm Return</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Are you sure you want to request a return for this item? Returns allowed within 3 days of order.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-full text-sm" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }} onClick={() => setConfirmReturn(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-full text-sm" style={{ background: 'var(--color-accent)', color: 'white' }} onClick={() => {
                setReturnFlow({ id: confirmReturn.id, reason: '', availableFrom: '', images: [] });
                setConfirmReturn(null);
              }}>Request Return</button>
            </div>
          </div>
        </div>
      )}

      {customOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(42, 33, 24, 0.25)' }} onClick={() => setCustomOrderOpen(false)}>
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6" onClick={(e) => e.stopPropagation()} style={{ border: '1px solid var(--color-border-subtle)' }}>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Custom Order</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Tell us exactly what you want and we will shape the order around your request.
            </p>
            <textarea
              className="w-full min-h-36 rounded-xl p-4 outline-none"
              placeholder="Write your custom order request here..."
              value={customOrderText}
              onChange={(e) => setCustomOrderText(e.target.value)}
              style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
            />
            <div className="mt-6 flex items-center justify-between gap-3">
              <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setCustomOrderOpen(false)}>
                Cancel
              </button>
              <button
                className="px-5 py-3 rounded-full text-sm tracking-wider"
                style={{ background: 'var(--color-accent)', color: 'white' }}
                onClick={() => {
                  setCustomOrderSubmitted(customOrderText.trim());
                  setCustomOrderText('');
                  setCustomOrderOpen(false);
                }}
              >
                Send request
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {returnFlow && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(42, 33, 24, 0.25)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReturnFlow(null)}
          >
            <motion.div
              className="w-full max-w-2xl bg-white rounded-2xl p-6"
              style={{ border: '1px solid var(--color-border-subtle)' }}
              initial={{ y: 30, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                We are so sorry to hear that
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Tell us what went wrong, when you'll be available for pickup/return, and attach any photos from your device.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  className="md:col-span-2 min-h-28 rounded-xl p-4 outline-none"
                  placeholder="Why do you want to return this item?"
                  value={returnFlow.reason}
                  onChange={(e) => setReturnFlow({ ...returnFlow, reason: e.target.value })}
                  style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                />

                <div className="space-y-2">
                  <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Available for return from</label>
                  <input
                    type="date"
                    className="w-full rounded-lg px-4 py-3 outline-none"
                    value={returnFlow.availableFrom}
                    onChange={(e) => setReturnFlow({ ...returnFlow, availableFrom: e.target.value })}
                    style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Upload images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full rounded-lg px-4 py-3 outline-none"
                    onChange={(e) => setReturnFlow({ ...returnFlow, images: Array.from(e.target.files || []).map((f) => f.name) })}
                    style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              {returnFlow.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {returnFlow.images.map((name) => (
                    <span key={name} className="px-3 py-1 rounded-full text-xs" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-muted)' }}>
                      {name}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setReturnFlow(null)}>
                  Cancel
                </button>
                <button
                  className="px-5 py-3 rounded-full text-sm tracking-wider"
                  style={{ background: 'var(--color-accent)', color: 'white' }}
                  onClick={() => {
                    requestReturn(returnFlow.id);
                    setReturnFlow(null);
                  }}
                >
                  Submit return request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review popup — unique modal with X close button */}
      {reviewing && (
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(42, 33, 24, 0.25)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReviewing(null)}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl p-6"
              style={{ border: '1px solid var(--color-border-subtle)' }}
              initial={{ y: 30, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* X close button */}
              <button
                className="absolute top-4 right-4 p-1.5 rounded-full"
                style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
                onClick={() => setReviewing(null)}
              >
                <X size={18} />
              </button>

              <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Share your experience with {reviewing.name}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                We'd love to know what you thought! Your review helps other makers make better choices.
              </p>

              <textarea
                className="w-full min-h-36 rounded-xl p-4 outline-none"
                placeholder="Tell us about your experience — what you loved, what could be better..."
                value={reviewing.text}
                onChange={(e) => setReviewing({ ...reviewing, text: e.target.value })}
                style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-text-primary)' }}
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setReviewing(null)}>
                  Cancel
                </button>
                <button
                  className="px-5 py-3 rounded-full text-sm tracking-wider"
                  style={{ background: reviewing.text.trim() ? 'var(--color-accent)' : 'var(--color-surface-hover)', color: reviewing.text.trim() ? 'white' : 'var(--color-text-muted)' }}
                  disabled={!reviewing.text.trim()}
                  onClick={() => reviewing.text.trim() && submitReview(reviewing.id, reviewing.productId, reviewing.text)}
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

    </section>
  );
}

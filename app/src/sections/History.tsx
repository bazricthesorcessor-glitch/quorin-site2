import { motion, AnimatePresence } from 'framer-motion';
import ProductPreview from '@/components/ProductPreview';
import { useState } from 'react';
import type { AccountOrder, AccountRecord } from '@/data/accounts';
import type { Product } from '@/data/products';

interface HistorySectionProps {
  currentAccount: AccountRecord | null;
  onUpdateOrder: (orderId: string, patch: Partial<AccountOrder>) => void;
}

export default function HistorySection({ currentAccount, onUpdateOrder }: HistorySectionProps) {
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

  return (
    <section id="orders" data-section="orders" className="py-24 px-4 md:px-8" style={{ background: 'var(--color-dominant)' }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>Your Orders</h2>

        {!currentAccount ? (
          <div className="rounded-3xl border p-6" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Sign in to view your orders</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Each account sees its own past orders only.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border p-6" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>No orders yet</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              {currentAccount.profile.displayName} has no past orders right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((o) => (
              <div key={o.id} className="p-4 rounded-xl" style={{ background: 'var(--color-secondary)', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-black rounded overflow-hidden">
                    <img src={o.product.images?.[0] || '/product-resin-kit.jpg'} alt={o.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 style={{ color: 'var(--color-text-primary)' }}>{o.product.name}</h3>
                      <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{new Date(o.orderDate).toLocaleString()}</span>
                    </div>

                    <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>{o.comment || 'No comment'}</p>

                    <div className="mt-4 flex gap-3 flex-wrap">
                      <button className="px-3 py-2 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }} onClick={() => { setPreviewProduct(o.product); setPreviewOpen(true); }}>Preview Again</button>

                      <button className="px-3 py-2 rounded-full border" style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }} onClick={() => setCommenting({ id: o.id, text: o.comment || '' })}>Leave Comment</button>

                        {o.status === 'delivered' && canReturn(o.orderDate) && (
                          <button
                            className="px-3 py-2 rounded-full border"
                            style={{
                              borderColor: 'rgba(255,255,255,0.06)',
                              color: 'var(--color-text-primary)',
                            }}
                            onClick={() => setConfirmReturn({ id: o.id })}
                          >
                            Return
                          </button>
                        )}

                       <button
                         className="px-3 py-2 rounded-full border"
                         style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }}
                         onClick={() => setCustomOrderOpen(true)}
                       >
                         Custom Order
                       </button>
                    </div>
                    {customOrderSubmitted && (
                      <p className="mt-3 text-sm" style={{ color: 'var(--color-teal)' }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8,8,13,0.8)' }} onClick={() => setCommenting(null)}>
          <div className="bg-[var(--color-secondary)] p-6 rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-2">Leave a comment</h3>
            <textarea className="w-96 h-48 p-3 rounded-md bg-[rgba(255,255,255,0.02)]" value={commenting.text} onChange={(e) => setCommenting({ ...commenting!, text: e.target.value })} />
            <div className="mt-3 flex justify-end gap-3">
              <button className="px-4 py-2 rounded-full border" onClick={() => setCommenting(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-full" style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }} onClick={() => submitComment(commenting.id, commenting.text)}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {confirmReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8,8,13,0.8)' }} onClick={() => setConfirmReturn(null)}>
          <div className="bg-[var(--color-secondary)] p-6 rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold mb-2">Confirm Return</h3>
                <p className="text-sm mb-4">Are you sure you want to request a return for this item? Returns allowed within 3 days of order.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-full border" onClick={() => setConfirmReturn(null)}>Cancel</button>
              <button className="px-4 py-2 rounded-full" style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }} onClick={() => {
                setReturnFlow({ id: confirmReturn.id, reason: '', availableFrom: '', images: [] });
                setConfirmReturn(null);
              }}>Request Return</button>
            </div>
          </div>
        </div>
      )}

      {customOrderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(8,8,13,0.8)' }} onClick={() => setCustomOrderOpen(false)}>
          <div className="w-full max-w-2xl rounded-3xl border p-6" style={{ background: 'rgba(16,16,24,0.98)', borderColor: 'rgba(255,255,255,0.08)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>Custom Order</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
              Tell us exactly what you want and we will shape the order around your request.
            </p>
            <textarea
              className="w-full min-h-40 rounded-2xl p-4 outline-none"
              placeholder="Write your custom order request here..."
              value={customOrderText}
              onChange={(e) => setCustomOrderText(e.target.value)}
              style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
            />
            <div className="mt-6 flex items-center justify-between gap-3">
              <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setCustomOrderOpen(false)}>
                Cancel
              </button>
              <button
                className="px-5 py-3 rounded-full text-sm tracking-wider"
                style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }}
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
            style={{ background: 'rgba(8,8,13,0.82)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReturnFlow(null)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-3xl border p-6"
              style={{ background: 'rgba(16, 16, 24, 0.98)', borderColor: 'rgba(255,255,255,0.08)' }}
              initial={{ y: 30, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                We are so sorry to hear that
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Tell us what went wrong, when you’ll be available for pickup/return, and attach any photos from your device.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  className="md:col-span-2 min-h-36 rounded-2xl p-4 outline-none"
                  placeholder="Why do you want to return this item?"
                  value={returnFlow.reason}
                  onChange={(e) => setReturnFlow({ ...returnFlow, reason: e.target.value })}
                  style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                />

                <div className="space-y-2">
                  <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Available for return from</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl px-4 py-3 outline-none"
                    value={returnFlow.availableFrom}
                    onChange={(e) => setReturnFlow({ ...returnFlow, availableFrom: e.target.value })}
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Upload images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="w-full rounded-2xl px-4 py-3 outline-none"
                    onChange={(e) => setReturnFlow({ ...returnFlow, images: Array.from(e.target.files || []).map((f) => f.name) })}
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                  />
                </div>
              </div>

              {returnFlow.images.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {returnFlow.images.map((name) => (
                    <span key={name} className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--color-teal)' }}>
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
                  style={{ background: 'linear-gradient(135deg,#ff1a3c,#ff0044)', color: 'white' }}
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
    </section>
  );
}

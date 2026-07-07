import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import type { Product } from '@/data/products';
import { getProductCostPrice, type CheckoutGiftOffer } from '@/data/gifts';

interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartIdKey: string, quantity: number) => void;
  onRemove: (cartIdKey: string) => void;
  xpLevel: number;
  xpDiscountPercent: number;
  giftOffer: CheckoutGiftOffer | null;
  selectedGiftCartId: string | null;
  onSelectGiftCartId: (cartId: string | null) => void;
  selectedGiftDiscount: number;
  onCheckout: () => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
  xpLevel,
  xpDiscountPercent,
  giftOffer,
  selectedGiftCartId,
  onSelectGiftCartId,
  selectedGiftDiscount,
  onCheckout,
}: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = totalMrp - total;
  const selectedGiftItem = giftOffer ? items.find((item) => item.cartId === selectedGiftCartId) ?? items[0] ?? null : null;
  const giftUnitPrice = selectedGiftItem?.price ?? 0;
  const xpDiscountBase = Math.max(0, total - giftUnitPrice);
  const xpDiscount = Math.round((xpDiscountBase * xpDiscountPercent) / 100);
  const giftDiscount = giftOffer && selectedGiftItem ? Math.min(selectedGiftDiscount, giftUnitPrice) : 0;
  const payable = Math.max(0, total - xpDiscount - giftDiscount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(42, 33, 24, 0.25)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{
              background: 'var(--color-surface)',
              borderLeft: '1px solid var(--color-border-subtle)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} style={{ color: 'var(--color-accent)' }} />
                <h2
                  className="text-lg font-semibold tracking-wide"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Shopping Bag
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--color-accent-soft)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </span>
              </div>
              <motion.button
                className="p-2 rounded-full"
                style={{
                  background: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border-subtle)',
                }}
                whileHover={{ scale: 1.05, background: 'var(--color-ivory)' }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
              >
                <X size={18} style={{ color: 'var(--color-text-primary)' }} />
              </motion.button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{
                      background: 'var(--color-ivory)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  >
                    <ShoppingCart size={32} style={{ color: 'var(--color-text-muted)' }} />
                  </motion.div>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Your bag is empty
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Discover our curated collection
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.cartId}
                      layout
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      className="mb-4 p-4 rounded-xl"
                      style={{
                        background: 'var(--color-ivory)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                    >
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div
                          className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                          style={{ background: 'var(--color-background)', border: '1px solid var(--color-border-subtle)' }}
                        >
                          {item.image ? (
                            <img
                              src={typeof item.image === 'string' ? item.image : item.image?.[0] || ''}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--color-accent)] text-lg font-bold">
                              Q
                            </div>
                          )}
                        </div>
                        {/* Product Info */}
                        <div className="flex-1">
                          <h4
                            className="text-sm font-medium mb-1"
                            style={{ color: 'var(--color-text-primary)' }}
                          >
                            {item.name}
                          </h4>
                          {item.variant && (
                            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                              {item.variant}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                              ₹{item.price}
                            </span>
                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              MRP ₹{item.mrp}
                            </span>
                          </div>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex flex-col items-end gap-2">
                          <motion.button
                            className="p-1.5 rounded-lg"
                            style={{
                              background: 'var(--color-surface-hover)',
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemove(item.cartId)}
                          >
                            <Trash2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                          </motion.button>
                          <div className="flex items-center gap-2">
                            <motion.button
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{
                                background: 'var(--color-ivory)',
                                border: '1px solid var(--color-border-subtle)',
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                            >
                              <Minus size={12} style={{ color: 'var(--color-text-primary)' }} />
                            </motion.button>
                            <span
                              className="text-sm font-medium w-6 text-center"
                              style={{ color: 'var(--color-text-primary)' }}
                            >
                              {item.quantity}
                            </span>
                            <motion.button
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{
                                background: 'var(--color-ivory)',
                                border: '1px solid var(--color-border-subtle)',
                              }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                            >
                              <Plus size={12} style={{ color: 'var(--color-text-primary)' }} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div
                className="p-6"
                style={{
                  borderTop: '1px solid var(--color-border-subtle)',
                  background: 'var(--color-ivory)',
                }}
              >
                {/* Price Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Subtotal (MRP)</span>
                    <span>₹{totalMrp}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-accent)' }}>
                    <span>You Save</span>
                    <span>-₹{savings}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    <span>XP Discount (Level {xpLevel})</span>
                    <span>-₹{xpDiscount} ({xpDiscountPercent.toFixed(1)}%)</span>
                  </div>
                  {giftOffer && (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm" style={{ color: 'var(--color-accent)' }}>
                        <span>{giftOffer.label}</span>
                        <span>-₹{giftDiscount}</span>
                      </div>
                      <div className="rounded-xl border p-4" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}>
                        <p className="text-xs tracking-[0.2em] mb-3" style={{ color: 'var(--color-text-muted)' }}>
                          CHOOSE A GIFT
                        </p>
                        <div className="space-y-2">
                          {items.map((item) => {
                            const costPrice = getProductCostPrice(item);
                            const isSelected = selectedGiftItem?.cartId === item.cartId;
                            return (
                              <button
                                key={item.cartId}
                                className="w-full rounded-lg border px-3 py-2 text-left"
                                style={{
                                  background: isSelected ? 'var(--color-accent-soft)' : 'var(--color-ivory)',
                                  borderColor: isSelected ? 'var(--color-accent)' : 'var(--color-border-subtle)',
                                  color: 'var(--color-text-primary)',
                                }}
                                onClick={() => onSelectGiftCartId(item.cartId)}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{item.name}</p>
                                    <p className="text-[11px] text-[var(--color-text-muted)]">Complimentary gift</p>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-sm font-semibold">₹{item.price}</p>
                                    <p className="text-[10px] tracking-[0.18em] text-[var(--color-text-muted)]">GIFT</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  <div
                    className="h-[1px] my-2"
                    style={{ background: 'var(--color-border-subtle)' }}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Total
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      ₹{payable}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <p className="mb-3 text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  XP discount applies to non-gift items. Your chosen gift remains at no extra cost.
                </p>
                <motion.button
                  className="w-full py-4 rounded-xl text-sm font-medium tracking-wider"
                  style={{
                    background: 'var(--color-accent)',
                    color: 'white',
                    boxShadow: '0 2px 12px var(--halo-gold)',
                  }}
                  whileHover={{
                    scale: 1.01,
                    boxShadow: '0 4px 20px var(--halo-gold-strong)',
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCheckout}
                >
                  Proceed to Checkout
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

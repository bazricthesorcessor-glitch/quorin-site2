import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import type { Product } from '@/data/products';

interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartId: string, quantity: number) => void;
  onRemove: (cartId: string) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemove,
}: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMrp = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = totalMrp - total;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(10px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #0d0d14 0%, #08080d 100%)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} style={{ color: 'var(--color-accent)' }} />
                <h2
                  className="text-lg font-bold tracking-wider"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  YOUR CART
                </h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(255, 26, 60, 0.15)',
                    color: 'var(--color-accent)',
                  }}
                >
                  {items.length} items
                </span>
              </div>
              <motion.button
                className="p-2 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                whileHover={{ scale: 1.1, background: 'rgba(255, 26, 60, 0.1)' }}
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
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <ShoppingCart size={32} style={{ color: 'var(--color-text-muted)' }} />
                  </motion.div>
                  <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Your cart is empty
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Start shopping to add items
                  </p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.cartId}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="mb-4 p-4 rounded-xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <div className="flex gap-4">
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
                            <span className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                              ₹{item.price}
                            </span>
                            <span className="text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
                              ₹{item.mrp}
                            </span>
                          </div>
                        </div>

                        {/* Quantity & Remove */}
                        <div className="flex flex-col items-end gap-2">
                          <motion.button
                            className="p-1.5 rounded-lg"
                            style={{
                              background: 'rgba(255, 26, 60, 0.1)',
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onRemove(item.cartId)}
                          >
                            <Trash2 size={14} style={{ color: 'var(--color-accent)' }} />
                          </motion.button>
                          <div className="flex items-center gap-2">
                            <motion.button
                              className="w-7 h-7 rounded-lg flex items-center justify-center"
                              style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  background: 'rgba(8, 8, 13, 0.9)',
                }}
              >
                {/* Price Summary */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <span>Subtotal (MRP)</span>
                    <span>₹{totalMrp}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: 'var(--color-teal)' }}>
                    <span>You Save</span>
                    <span>-₹{savings}</span>
                  </div>
                  <div
                    className="h-[1px] my-2"
                    style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <div className="flex justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      Total
                    </span>
                    <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                      ₹{total}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <motion.button
                  className="w-full py-4 rounded-xl text-sm font-medium tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #ff1a3c, #ff0044)',
                    color: 'white',
                    boxShadow: '0 4px 30px rgba(255, 26, 60, 0.3)',
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 6px 40px rgba(255, 26, 60, 0.4)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  PROCEED TO CHECKOUT
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

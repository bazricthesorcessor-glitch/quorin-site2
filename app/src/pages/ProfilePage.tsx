import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { LogOut, Edit3, ShieldCheck, Star, Package, User, Mail, Phone, MapPin, Calendar, FileText, CheckCircle, AlertCircle, RotateCcw, Heart, ExternalLink } from 'lucide-react';
import type { AccountRecord, AccountProfile, AccountOrder } from '@/data/accounts';
import { quorinData, getProductId } from '@/data/products';
import type { Product } from '@/data/products';

interface ProfilePageProps {
  currentAccount: AccountRecord | null;
  onSignOut: () => void;
  onSave: (profile: AccountProfile) => { ok: boolean; message?: string };
}

export default function ProfilePage({ currentAccount, onSignOut, onSave }: ProfilePageProps) {
  const navigate = useNavigate();
  const experience = currentAccount ? Math.min(100, currentAccount.orders.length * 16.5) : 0;
  const [draft, setDraft] = useState<AccountProfile | null>(currentAccount?.profile ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>('profile');

  useEffect(() => {
    setDraft(currentAccount?.profile ?? null);
    setSaveError(null);
    setSaveMessage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentAccount]);

  const handleSave = useCallback(() => {
    if (!draft) return;
    const result = onSave(draft);
    if (result.ok) {
      setSaveError(null);
      setSaveMessage('Profile saved!');
      window.setTimeout(() => setSaveMessage(null), 2000);
    } else {
      setSaveError(result.message ?? 'Could not save profile.');
    }
  }, [draft, onSave]);

  if (!currentAccount || !draft) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" style={{ background: 'var(--color-dominant)' }}>
        <p className="text-xl" style={{ color: 'var(--color-text-muted)' }}>Sign in to view your profile</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-dominant)' }}>
      {/* Breadcrumb */}
      <motion.div
        className="sticky top-[72px] z-30 px-6 py-3 backdrop-blur-xl"
        style={{ background: 'rgba(42, 33, 24, 0.85)', borderBottom: '1px solid var(--color-border-subtle)' }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'var(--color-surface-hover)', border: '1px solid var(--color-border-subtle)' }}
            whileHover={{ background: 'var(--color-accent-soft)', borderColor: 'var(--color-accent)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
          >
            <LogOut size={16} /> Back
          </motion.button>
          <span className="text-xs tracking-[0.2em]" style={{ color: 'var(--color-text-muted)' }}>
            QUORIN / PROFILE
          </span>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            {/* Profile Card */}
            <div
              className="rounded-2xl p-6 mb-6"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                  style={{ background: 'var(--color-accent)', color: 'white' }}
                >
                  {draft.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{draft.displayName}</h2>
                  <p className="text-xs tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>{draft.id}</p>
                  {draft.role === 'admin' && (
                    <div className="inline-flex items-center gap-1 text-xs mt-1" style={{ color: 'var(--color-accent)' }}>
                      <ShieldCheck size={12} /> Admin Access
                    </div>
                  )}
                </div>
              </div>

              {/* Loyalty */}
              <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loyalty</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{currentAccount.orders.length} orders completed</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{Math.round(experience)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(42, 33, 24, 0.1)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${experience}%`, background: 'var(--color-accent)' }} />
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 text-sm">
                {[
                  { icon: Mail, label: draft.email, sub: 'Email' },
                  { icon: Phone, label: draft.phone || 'Not set', sub: 'Phone' },
                  { icon: MapPin, label: `${draft.address}${draft.city ? ', ' + draft.city : ''}`, sub: 'Address' },
                  { icon: Calendar, label: draft.birthday || 'Not set', sub: 'Birthday' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <item.icon size={16} style={{ color: 'var(--color-accent)', marginTop: 2 }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{item.sub}</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bio */}
              {draft.bio && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}>
                  <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>ABOUT</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{draft.bio}</p>
                </div>
              )}

              {/* Sign Out */}
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm"
                style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                onClick={onSignOut}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            {/* Tabs */}
            <div className="flex gap-1 mb-6 rounded-full overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', padding: 4, width: 'fit-content' }}>
              {(['profile', 'orders', 'wishlist'] as const).map((tab) => (
                <button
                  key={tab}
                  className="px-5 py-2.5 text-sm rounded-full font-medium transition-all"
                  style={{
                    background: activeTab === tab ? 'var(--color-accent)' : 'transparent',
                    color: activeTab === tab ? 'white' : 'var(--color-text-muted)',
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'profile' ? 'Edit Profile' : tab === 'orders' ? `Orders (${currentAccount.orders.length})` : `Wishlist (${currentAccount.wishlist?.length ?? 0})`}
                </button>
              ))}
            </div>

            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Profile Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>DISPLAY NAME</label>
                      <input
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        value={draft.displayName}
                        onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                        placeholder="Name"
                      />
                    </div>
                    <div>
                      <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>EMAIL</label>
                      <input
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>PHONE</label>
                      <input
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        value={draft.phone}
                        onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                        placeholder="Phone"
                      />
                    </div>
                    <div>
                      <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>BIRTHDAY</label>
                      <input
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        type="date"
                        value={draft.birthday ?? ''}
                        onChange={(e) => setDraft({ ...draft, birthday: e.target.value })}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>ADDRESS</label>
                      <input
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        value={draft.address}
                        onChange={(e) => setDraft({ ...draft, address: e.target.value })}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                        placeholder="Address"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>CITY</label>
                      <input
                        className="w-full rounded-lg px-4 py-3 outline-none"
                        value={draft.city}
                        onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                        placeholder="City"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>BIO</label>
                      <textarea
                        className="w-full min-h-28 rounded-lg px-4 py-3 outline-none"
                        value={draft.bio}
                        onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                        placeholder="About you"
                      />
                    </div>
                  </div>
                  <p className="text-xs mb-6" style={{ color: 'var(--color-text-muted)' }}>Birthday can be updated once per year.</p>
                  <button
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm tracking-wider font-semibold"
                    style={{ background: 'var(--color-accent)', color: 'white' }}
                    onClick={handleSave}
                  >
                    <Edit3 size={16} /> Save Profile
                  </button>
                  {saveMessage && <p className="mt-4 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{saveMessage}</p>}
                  {saveError && <p className="mt-4 text-sm" style={{ color: '#f87171' }}>{saveError}</p>}
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                  <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>Order History</h3>
                  {currentAccount.orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} />
                      <p className="text-lg mb-2" style={{ color: 'var(--color-text-muted)' }}>No orders yet</p>
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Your orders will appear here once you make a purchase.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentAccount.orders.map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'wishlist' && (
              <WishlistTab currentAccount={currentAccount} />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: AccountOrder }) {
  const statusConfig = {
    delivered: { label: 'Delivered', color: '#4ade80', icon: CheckCircle },
    return_requested: { label: 'Return Requested', color: '#facc15', icon: AlertCircle },
    returned: { label: 'Returned', color: '#f87171', icon: RotateCcw },
  };
  const config = statusConfig[order.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      className="flex gap-4 p-4 rounded-xl"
      style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}
      whileHover={{ y: -2, borderColor: 'var(--color-accent)' }}
    >
      {order.snapshot.thumbnail && (
        <img src={order.snapshot.thumbnail} alt="" className="w-20 h-20 rounded-lg object-cover" />
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{order.snapshot.name}</h4>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Order date: {order.orderDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon size={14} color={config.color} />
            <span className="text-xs font-medium" style={{ color: config.color }}>{config.label}</span>
          </div>
        </div>
        <p className="text-lg font-bold mt-2" style={{ color: 'var(--color-accent)' }}>₹{order.snapshot.price}</p>
        {order.comment && <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{order.comment}</p>}
      </div>
    </motion.div>
  );
}

// Wishlist tab — shows all wishlisted products with remove option
function WishlistTab({ currentAccount }: { currentAccount: AccountRecord }) {
  const navigate = useNavigate();
  const allProducts = quorinData.categories.flatMap((c) => c.products);

  const wishlistProducts = (currentAccount.wishlist ?? [])
    .map((productId) => allProducts.find((p) => getProductId(p) === productId))
    .filter((p): p is Product => p !== undefined);

  const handleRemoveFromWishlist = (productId: string) => {
    // Will be connected to backend state via App.tsx
    // For now, local only — the real removal happens via App.tsx onAddToWishlist
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="rounded-2xl p-6 md:p-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>My Wishlist</h3>
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} />
            <p className="text-lg mb-2" style={{ color: 'var(--color-text-muted)' }}>Your wishlist is empty</p>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Save products you love — they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{product.name}</h4>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{product.description?.slice(0, 60)}...</p>
                  <p className="text-sm font-bold mt-2" style={{ color: 'var(--color-accent)' }}>₹{product.price}</p>
                  <button
                    className="mt-2 text-xs font-medium underline"
                    style={{ color: 'var(--color-accent)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWishlist(getProductId(product));
                    }}
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

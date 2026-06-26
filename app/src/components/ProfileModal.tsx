import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, LogOut, ShieldCheck, Star } from 'lucide-react';
import type { AccountProfile } from '@/data/accounts';

interface ProfileModalProps {
  isOpen: boolean;
  profile: AccountProfile | null;
  orderCount: number;
  onClose: () => void;
  onSave: (profile: AccountProfile) => { ok: boolean; message?: string };
  onSignOut: () => void;
}

export default function ProfileModal({
  isOpen,
  profile,
  orderCount,
  onClose,
  onSave,
  onSignOut,
}: ProfileModalProps) {
  const experience = Math.min(100, orderCount * 16.5);
  const [draft, setDraft] = useState<AccountProfile | null>(profile);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraft(profile);
    setSaveError(null);
    setSaveMessage(null);
  }, [profile, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && draft && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-surface)' }}
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 18, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 md:p-8 pb-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs tracking-[0.2em] mb-2" style={{ color: 'var(--color-accent)' }}>
                    <Star size={12} />
                    Profile
                  </div>
                  <h3 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {draft.displayName}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {draft.id} · {draft.role === 'admin' ? 'Admin account' : 'Customer account'}
                  </p>
                </div>
                <button className="px-4 py-2 text-sm rounded-full" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={onClose}>
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* Experience */}
              <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--color-ivory)', border: '1px solid var(--color-border-subtle)' }}>
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Loyalty</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{orderCount} orders completed</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>{Math.round(experience)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${experience}%`, background: 'var(--color-accent)' }} />
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <input className="rounded-lg px-4 py-3 outline-none transition" value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Name" />
                <input className="rounded-lg px-4 py-3 outline-none transition" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Email" />
                <input className="rounded-lg px-4 py-3 outline-none transition" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Phone" />
                <input className="rounded-lg px-4 py-3 outline-none transition" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="Address" />
                <input className="rounded-lg px-4 py-3 outline-none transition" type="date" value={draft.birthday ?? ''} onChange={(e) => setDraft({ ...draft, birthday: e.target.value })} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} />
                <input className="md:col-span-2 rounded-lg px-4 py-3 outline-none transition" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="City" />
                <textarea className="md:col-span-2 min-h-28 rounded-lg px-4 py-3 outline-none transition" value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} placeholder="About you" />
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Birthday can be updated once per year.
              </p>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm" style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }} onClick={onSignOut}>
                  <LogOut size={16} />
                  Sign out
                </button>
                <button className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm tracking-wider" style={{ background: 'var(--color-accent)', color: 'white' }} onClick={() => {
                  const result = onSave(draft);
                  if (result.ok) {
                    setSaveError(null);
                    setSaveMessage('Saved');
                    window.setTimeout(() => {
                      setSaveMessage(null);
                      onClose();
                    }, 500);
                    return;
                  }

                  setSaveMessage(null);
                  setSaveError(result.message ?? 'Could not save profile.');
                }}>
                  <Edit3 size={16} />
                  Save profile
                </button>
              </div>

              {saveMessage && (
                <p className="mt-4 text-sm font-medium" style={{ color: 'var(--color-accent)' }}>
                  {saveMessage}
                </p>
              )}

              {saveError && (
                <p className="mt-4 text-sm">
                  {saveError}
                </p>
              )}

              {draft.role === 'admin' && (
                <div className="mt-4 inline-flex items-center gap-2 text-xs tracking-[0.15em]" style={{ color: 'var(--color-text-muted)', background: 'var(--color-ivory)', padding: '6px 12px', borderRadius: 999 }}>
                  <ShieldCheck size={12} />
                  Admin Access
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

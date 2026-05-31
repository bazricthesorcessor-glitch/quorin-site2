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
          style={{ background: 'rgba(8, 8, 13, 0.78)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-2xl rounded-3xl border p-6"
            style={{
              background: 'rgba(16, 16, 24, 0.98)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
            initial={{ y: 24, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 18, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs tracking-[0.3em] mb-3" style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--color-teal)' }}>
                  <Star size={12} />
                  PROFILE
                </div>
                <h3 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {draft.displayName}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {draft.id} · {draft.role === 'admin' ? 'Admin account' : 'Customer account'}
                </p>
              </div>
              <button className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }} onClick={onClose}>
                Close
              </button>
            </div>

            <div className="rounded-3xl border p-4 mb-5" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center justify-between gap-4 mb-3">
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Experience</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{orderCount} orders completed</p>
                </div>
                <span className="text-sm" style={{ color: 'var(--color-teal)' }}>{Math.round(experience)}%</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full rounded-full" style={{ width: `${experience}%`, background: 'linear-gradient(90deg, #ff1a3c, #00d4ff)' }} />
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="rounded-2xl px-4 py-3 outline-none" value={draft.displayName} onChange={(e) => setDraft({ ...draft, displayName: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }} placeholder="Name" />
                <input className="rounded-2xl px-4 py-3 outline-none" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }} placeholder="Email" />
                <input className="rounded-2xl px-4 py-3 outline-none" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }} placeholder="Phone" />
                <input className="rounded-2xl px-4 py-3 outline-none" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }} placeholder="Address" />
                <input className="rounded-2xl px-4 py-3 outline-none" type="date" value={draft.birthday ?? ''} onChange={(e) => setDraft({ ...draft, birthday: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }} placeholder="Birthday" />
                <input className="md:col-span-2 rounded-2xl px-4 py-3 outline-none" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }} placeholder="City" />
                <textarea className="md:col-span-2 min-h-28 rounded-2xl px-4 py-3 outline-none" value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }} placeholder="About you" />
              </div>
              <p className="mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Birthday can be updated once per year.
              </p>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-primary)' }} onClick={onSignOut}>
                <LogOut size={16} />
                Sign out
              </button>
                <button className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm" style={{ background: 'linear-gradient(135deg, #ff1a3c, #ff0044)', color: 'white' }} onClick={() => {
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
              <p className="mt-4 text-sm" style={{ color: 'var(--color-teal)' }}>
                {saveMessage}
              </p>
            )}

            {saveError && (
              <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }}>
                {saveError}
              </p>
            )}

            {draft.role === 'admin' && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs tracking-[0.2em]" style={{ background: 'rgba(255,26,60,0.1)', color: 'var(--color-accent)' }}>
                <ShieldCheck size={12} />
                ADMIN ACCESS
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

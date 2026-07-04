import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [email, setEmail] = useState('admin@quorin.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message || 'Sign-in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--color-structure-dark)' }}>
      <motion.div
        className="w-full max-w-md rounded-3xl p-8"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--color-accent)' }}>
            <ShieldCheck size={28} color="white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>QUORIN Admin</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Sign in to the management console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>EMAIL</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-3 outline-none"
                style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                placeholder="admin@quorin.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs tracking-[0.15em] mb-2 block" style={{ color: 'var(--color-text-muted)' }}>PASSWORD</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl pl-10 pr-4 py-3 outline-none"
                style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm rounded-xl px-4 py-3" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-destructive)', border: '1px solid var(--color-border-subtle)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-opacity"
            style={{ background: 'var(--color-accent)', color: 'white', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Authorized administrators only. All actions are persisted server-side.
        </p>
      </motion.div>
    </div>
  );
}

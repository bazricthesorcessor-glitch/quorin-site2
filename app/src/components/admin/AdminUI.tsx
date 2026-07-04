import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Loader2 } from 'lucide-react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: ReactNode; icon: typeof Loader2; accent?: boolean }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs tracking-[0.15em]" style={{ color: 'var(--color-text-muted)' }}>{label.toUpperCase()}</div>
          <div className="text-2xl font-bold mt-1" style={{ color: accent ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{value}</div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: accent ? 'var(--color-accent)' : 'var(--color-surface-hover)' }}>
          <Icon size={18} color={accent ? 'white' : 'var(--color-text-muted)'} />
        </div>
      </div>
    </Card>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20" style={{ color: 'var(--color-text-muted)' }}>
      <Loader2 size={28} className="animate-spin mb-3" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-start gap-3 rounded-2xl p-5"
      style={{ background: 'var(--color-accent-soft)', border: '1px solid var(--color-border-subtle)', color: 'var(--color-destructive)' }}
    >
      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
      <div className="text-sm">{message}</div>
    </motion.div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-lg font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{title}</div>
      {description && <p className="text-sm max-w-sm" style={{ color: 'var(--color-text-muted)' }}>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function PrimaryButton({ children, onClick, type, disabled, className = '' }: { children: ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; className?: string }) {
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity ${className}`}
      style={{ background: 'var(--color-accent)', color: 'white', opacity: disabled ? 0.6 : 1 }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${className}`}
      style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'accent' }) {
  const bg = {
    neutral: 'var(--color-surface-hover)',
    success: 'var(--color-accent-soft)',
    warning: 'rgba(250, 204, 21, 0.15)',
    danger: 'rgba(248, 113, 113, 0.15)',
    accent: 'var(--color-accent)',
  }[tone];
  const color = tone === 'accent' ? 'white' : tone === 'success' ? 'var(--color-success)' : tone === 'danger' ? 'var(--color-destructive)' : tone === 'warning' ? '#b45309' : 'var(--color-text-secondary)';
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: bg, color }}>
      {children}
    </span>
  );
}

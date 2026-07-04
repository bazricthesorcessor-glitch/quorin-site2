import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Wallet } from 'lucide-react';
import type { AccountRecord, AccountOrder } from '@/data/accounts';
import { getXpLevel, xpLevelLadder, XP_MAX_ORDER_VALUE, XP_LEVEL_COUNT } from '@/data/xp';
import { rgba, getThemeColors } from '@/lib/theme';
import { useIsMobile } from '@/hooks/use-mobile';

const colors = getThemeColors();

interface XpPageProps {
  currentAccount: AccountRecord | null;
  onBackHome: () => void;
  resolveOrderPrice: (order: AccountOrder) => number;
}

const formatRupees = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function XpPage({ currentAccount, onBackHome, resolveOrderPrice }: XpPageProps) {
  const totalSpend = useMemo(
    () => currentAccount?.orders.reduce((sum, order) => sum + (order.status === 'returned' ? 0 : resolveOrderPrice(order)), 0) ?? 0,
    [currentAccount, resolveOrderPrice]
  );

  const currentLevel = useMemo(() => {
    return getXpLevel(totalSpend);
  }, [totalSpend]);

  const currentLevelData = xpLevelLadder[currentLevel - 1];
  const nextLevelData = xpLevelLadder[currentLevel] ?? null;
  const progressStart = currentLevelData?.cumulative ?? 0;
  const progressEnd = nextLevelData?.cumulative ?? XP_MAX_ORDER_VALUE;
  const progress = Math.max(0, Math.min(1, (totalSpend - progressStart) / Math.max(1, progressEnd - progressStart)));

  const isMobile = useIsMobile();

  return (
    <main className={isMobile ? "pt-16 pb-24 bg-[var(--color-background)] min-h-screen" : "pt-28 pb-14"}>
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm"
          style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
          whileHover={{ x: -4 }}
          onClick={onBackHome}
        >
          <ArrowLeft size={16} />
          Back Home
        </motion.button>

        <div className="rounded-2xl p-6 md:p-8"           style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)', boxShadow: '0 2px 8px var(--shadow-card)' }}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.15em] text-[var(--color-text-muted)]">LOYALTY PROGRAM</p>
              <h1 className="mt-3 text-3xl md:text-5xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Your Journey</h1>
              <p className="mt-3 max-w-2xl" style={{ color: 'var(--color-text-muted)' }}>
                Your purchases unlock exclusive tiers, with Level 2 starting at {formatRupees(xpLevelLadder[1].cumulative)} and the full journey capping at {formatRupees(XP_MAX_ORDER_VALUE)}.
              </p>
            </div>

            <div className="rounded-xl border px-5 py-4" style={{ background: 'var(--color-ivory)', borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center gap-3">
                <Wallet size={18} style={{ color: 'var(--color-accent)' }} />
                <div>
                  <p className="text-xs tracking-[0.15em] text-[var(--color-text-muted)]">Current Spend</p>
                  <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatRupees(totalSpend)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-xl border p-5 md:p-6" style={{ background: 'var(--color-ivory)', borderColor: 'var(--color-border-subtle)' }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.15em] text-[var(--color-text-muted)]">Current Tier</p>
                  <p className="mt-1 text-3xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Level {currentLevel}</p>
                </div>
                <div className="rounded-full px-4 py-2 text-sm" style={{ background: 'var(--color-accent)', color: 'white' }}>
                  {currentLevel === XP_LEVEL_COUNT ? 'Completed' : `Next: Level ${currentLevel + 1}`}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatRupees(progressStart)}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatRupees(progressEnd)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(42, 33, 24, 0.1)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'var(--color-accent)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="mt-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {currentLevel === XP_LEVEL_COUNT
                      ? `You've reached the final tier at ${formatRupees(XP_MAX_ORDER_VALUE)}.`
                      : `${formatRupees(Math.max(0, progressEnd - totalSpend))} more to reach Level ${currentLevel + 1}.`}
                </p>
              </div>

              {currentAccount ? (
                <div className="mt-6 rounded-xl border p-4 md:p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}>
                  <div className="flex items-center gap-3">
                    <Crown size={18} style={{ color: 'var(--color-accent)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-text-primary)' }}>Signed in as {currentAccount.profile.displayName}</p>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Your rewards are driven by the total value of your orders.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border p-4 md:p-5" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Sign in to see your personal journey and rewards.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-xl border p-5 md:p-6" style={{ background: 'var(--color-ivory)', borderColor: 'var(--color-border-subtle)' }}>
              <p className="text-xs tracking-[0.15em] text-[var(--color-text-muted)]">Tier Breakdown</p>
              <div className="mt-4 space-y-3">
                {xpLevelLadder.map((item) => {
                  const active = item.level <= currentLevel;
                  return (
                    <div
                      key={item.level}
                      className="rounded-lg border px-4 py-3"
                      style={{
                        background: active ? 'var(--color-surface)' : 'rgba(42, 33, 24, 0.04)',
                        borderColor: active ? 'var(--color-accent)' : 'var(--color-border-subtle)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold" style={{ color: active ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>Level {item.level}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            +{formatRupees(item.increment)} this tier
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{formatRupees(item.cumulative)}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Starts at</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
              { label: 'Tiers', value: '10 levels' },
              { label: 'Total cap', value: formatRupees(XP_MAX_ORDER_VALUE) },
              { label: 'Growth style', value: 'Progressive' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border px-4 py-3"
                style={{ background: 'var(--color-ivory)', borderColor: 'var(--color-border-subtle)' }}
              >
                <p className="text-xs tracking-[0.15em] text-[var(--color-text-muted)]">{item.label}</p>
                <p className="mt-1 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

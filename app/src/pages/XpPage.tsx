import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Wallet } from 'lucide-react';
import type { AccountRecord } from '@/data/accounts';
import { getXpLevel, xpLevelLadder, XP_MAX_ORDER_VALUE, XP_LEVEL_COUNT } from '@/data/xp';

interface XpPageProps {
  currentAccount: AccountRecord | null;
  onBackHome: () => void;
}

const formatRupees = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

export default function XpPage({ currentAccount, onBackHome }: XpPageProps) {
  const totalSpend = useMemo(
    () => currentAccount?.orders.reduce((sum, order) => sum + (order.product.price ?? 0), 0) ?? 0,
    [currentAccount]
  );

  const currentLevel = useMemo(() => {
    return getXpLevel(totalSpend);
  }, [totalSpend]);

  const currentLevelData = xpLevelLadder[currentLevel - 1];
  const nextLevelData = xpLevelLadder[currentLevel] ?? null;
  const progressStart = currentLevelData?.cumulative ?? 0;
  const progressEnd = nextLevelData?.cumulative ?? XP_MAX_ORDER_VALUE;
  const progress = Math.max(0, Math.min(1, (totalSpend - progressStart) / Math.max(1, progressEnd - progressStart)));

  return (
    <main className="pt-28 pb-14">
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-primary)' }}
          whileHover={{ x: -4 }}
          onClick={onBackHome}
        >
          <ArrowLeft size={16} />
          Back Home
        </motion.button>

        <div className="rounded-[2rem] border p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs tracking-[0.35em] text-[var(--color-text-muted)]">XP MODE</p>
              <h1 className="mt-3 text-4xl md:text-6xl font-black">Order ladder</h1>
              <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
                Spend grows through 10 levels, with Level 2 starting at {formatRupees(xpLevelLadder[1].cumulative)} and the full ladder capping at {formatRupees(XP_MAX_ORDER_VALUE)}.
              </p>
            </div>

            <div className="rounded-3xl border px-5 py-4" style={{ background: 'rgba(0, 212, 255, 0.06)', borderColor: 'rgba(0, 212, 255, 0.14)' }}>
              <div className="flex items-center gap-3">
                <Wallet size={18} style={{ color: 'var(--color-teal)' }} />
                <div>
                  <p className="text-xs tracking-[0.3em] text-[var(--color-text-muted)]">CURRENT SPEND</p>
                  <p className="text-2xl font-bold">{formatRupees(totalSpend)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.8rem] border p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.3em] text-[var(--color-text-muted)]">CURRENT LEVEL</p>
                  <p className="mt-1 text-3xl font-black">Level {currentLevel}</p>
                </div>
                <div className="rounded-full px-4 py-2 text-sm tracking-wider" style={{ background: 'rgba(255,26,60,0.1)', color: 'var(--color-text-primary)' }}>
                  {currentLevel === XP_LEVEL_COUNT ? 'MAX LEVEL' : `NEXT: Level ${currentLevel + 1}`}
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatRupees(progressStart)}</span>
                  <span style={{ color: 'var(--color-text-muted)' }}>{formatRupees(progressEnd)}</span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #ff1a3c, #00d4ff)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <p className="mt-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {currentLevel === XP_LEVEL_COUNT
                      ? `You reached the final tier at ${formatRupees(XP_MAX_ORDER_VALUE)}.`
                      : `Spend ${formatRupees(Math.max(0, progressEnd - totalSpend))} more to reach Level ${currentLevel + 1}.`}
                </p>
              </div>

              {currentAccount ? (
                <div className="mt-6 rounded-3xl border p-4 md:p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    <Crown size={18} style={{ color: 'var(--color-accent)' }} />
                    <p className="text-sm tracking-wider">Signed in as {currentAccount.profile.displayName}</p>
                  </div>
                  <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Your XP is driven by the total value of your orders.
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-3xl border p-4 md:p-5" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Login to see your personal XP track and account-based progress.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[1.8rem] border p-5 md:p-6" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs tracking-[0.35em] text-[var(--color-text-muted)]">LEVEL LADDER</p>
              <div className="mt-4 space-y-3">
                {xpLevelLadder.map((item) => {
                  const active = item.level <= currentLevel;
                  return (
                    <div
                      key={item.level}
                      className="rounded-2xl border px-4 py-3"
                      style={{
                        background: active ? 'rgba(0, 212, 255, 0.08)' : 'rgba(255,255,255,0.03)',
                        borderColor: active ? 'rgba(0, 212, 255, 0.18)' : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">Level {item.level}</p>
                          <p className="text-xs tracking-[0.22em] text-[var(--color-text-muted)]">
                             +{formatRupees(item.increment)} THIS STEP
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatRupees(item.cumulative)}</p>
                           <p className="text-[10px] tracking-[0.22em] text-[var(--color-text-muted)]">LEVEL STARTS AT</p>
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
              { label: 'Level cap', value: '10 tiers' },
              { label: 'Total cap', value: formatRupees(XP_MAX_ORDER_VALUE) },
              { label: 'Growth style', value: '1:2:3:4:5:6:7:8:9:10' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border px-4 py-3"
                style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p className="text-[10px] tracking-[0.3em] text-[var(--color-text-muted)]">{item.label}</p>
                <p className="mt-1 text-lg font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

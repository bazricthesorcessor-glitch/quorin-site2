import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { quorinData } from '@/data/products';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = 'bazricthesorcessor@gmail.com';

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('Unable to copy email to clipboard', error);
    }
  };

  return (
    <footer
      className="relative pt-24 pb-8 px-4 md:px-8"
      style={{
        background: 'linear-gradient(to bottom, var(--color-dominant), #040408)',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
      }}
    >
      {/* Large Brand Watermark */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none opacity-[0.02]">
        <span className="quorin-brand text-[20vw] font-black">{quorinData.brand}</span>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <motion.h3
              className="quorin-brand text-3xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #ff1a3c, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {quorinData.brand}
            </motion.h3>
            <p className="text-sm leading-relaxed max-w-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Premium crafting supplies for makers who refuse to compromise.
              From resin art to candle making, we provide everything you need
              to transform your creative vision into reality.
            </p>
            <p className="text-xs tracking-[0.3em]" style={{ color: 'var(--color-text-secondary)' }}>
              MADE FOR MAKERS
            </p>
          </div>

          {/* Categories Column */}
          <div>
            <h4
              className="text-xs tracking-[0.2em] mb-6 font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              CATEGORIES
            </h4>
            <ul className="space-y-3">
              {quorinData.categories.map((cat) => (
                <li key={cat.id}>
                  <motion.button
                    className="text-sm flex items-center gap-1 group"
                    style={{ color: 'var(--color-text-muted)' }}
                    onClick={() => navigate(`/category/${cat.id}`)}
                    whileHover={{ x: 5, color: 'var(--color-accent)' }}
                  >
                    {cat.title}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </motion.button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4
              className="text-xs tracking-[0.2em] mb-6 font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              CONTACT
            </h4>
            <ul className="space-y-3">
              <li className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                support@quorin.com
              </li>
              <li className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                +91 98765 43210
              </li>
              <li className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Mumbai, India
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-[1px] mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }}
        />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              &copy; {new Date().getFullYear()} {quorinData.brand}. All rights reserved.
            </p>
            <button
              className="relative inline-flex items-center text-xs tracking-[0.2em] transition-colors hover:text-[var(--color-accent)]"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={() => setShowEmail(true)}
              onMouseLeave={() => setShowEmail(false)}
              onFocus={() => setShowEmail(true)}
              onBlur={() => setShowEmail(false)}
              onClick={copyEmail}
            >
              MADE BY DIVYANSH MISHRA
              <AnimatePresence>
                {showEmail && (
                  <motion.span
                    className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[10px] tracking-[0.22em]"
                    style={{
                      background: 'rgba(8, 8, 13, 0.95)',
                      borderColor: 'rgba(255,255,255,0.08)',
                      color: 'var(--color-text-primary)',
                    }}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  >
                    {copied ? 'Copied to clipboard' : email}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

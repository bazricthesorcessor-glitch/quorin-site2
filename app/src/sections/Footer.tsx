import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { quorinData } from '@/data/products';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const [showEmail, setShowEmail] = useState(false);
  const [copied, setCopied] = useState(false);
  const email = 'support@quorin.com';

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
      className="relative pt-16 pb-8 px-4 md:px-8"
      style={{
        background: 'var(--color-ivory)',
        borderTop: '1px solid var(--color-border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto relative">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <motion.h3
              className="text-3xl font-semibold mb-4"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {quorinData.brand}
            </motion.h3>
            <p className="text-sm leading-relaxed max-w-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Premium crafting supplies for makers who value quality and design.
              From resin art to candle making, we provide everything you need
              to bring your creative vision to life.
            </p>
          </div>

          {/* Categories Column */}
          <div>
            <h4 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Categories
            </h4>
            <ul className="space-y-3">
              {quorinData.categories.map((cat) => (
                <li key={cat.id}>
                  <motion.button
                    className="text-sm flex items-center gap-1 group"
                    style={{ color: 'var(--color-text-muted)' }}
                    onClick={() => navigate(`/category/${cat.id}`)}
                    whileHover={{ color: 'var(--color-accent)' }}
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
            <h4 className="text-sm font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Contact
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
        <div className="h-[1px] mb-6" style={{ background: 'var(--color-border-subtle)' }} />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-3">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              &copy; {new Date().getFullYear()} {quorinData.brand}. All rights reserved.
            </p>
            <button
              className="relative inline-flex items-center text-xs transition-colors hover:text-[var(--color-accent)]"
              style={{ color: 'var(--color-text-secondary)' }}
              onMouseEnter={() => setShowEmail(true)}
              onMouseLeave={() => setShowEmail(false)}
              onFocus={() => setShowEmail(true)}
              onBlur={() => setShowEmail(false)}
              onClick={copyEmail}
            >
              by Divyansh Mishra
              <AnimatePresence>
                {showEmail && (
                  <motion.span
                    className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg border px-3 py-1 text-xs"
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: 'var(--color-border-subtle)',
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

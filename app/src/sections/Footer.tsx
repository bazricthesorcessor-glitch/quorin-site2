import { motion } from 'framer-motion';
import { quorinData } from '@/data/products';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
        <span className="text-[20vw] font-black tracking-wider">QUORIN</span>
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <motion.h3
              className="text-3xl font-bold tracking-[0.2em] mb-4"
              style={{
                background: 'linear-gradient(135deg, #ff1a3c, #00d4ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              QUORIN
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
                    onClick={() => scrollToSection(cat.id)}
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
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            &copy; {new Date().getFullYear()} QUORIN. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Shipping Info'].map((item) => (
              <motion.button
                key={item}
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
                whileHover={{ color: 'var(--color-accent)' }}
              >
                {item}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

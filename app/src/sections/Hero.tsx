import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { quorinData } from '@/data/products';

const brandLetters = quorinData.brand.split('');

const luxuryParticles = [
  { size: 4, delay: 0, duration: 8 },
  { size: 3, delay: 0.5, duration: 10 },
  { size: 5, delay: 1, duration: 12 },
  { size: 3, delay: 1.5, duration: 9 },
  { size: 4, delay: 2, duration: 11 },
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Soft ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, var(--color-accent-soft) 0%, transparent 60%)`,
        }}
      />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 0v60M0 30h60' stroke='var(--color-accent-medium)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating gold particles */}
      {isVisible && luxuryParticles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: particle.size,
            height: particle.size,
            background: 'var(--color-accent-soft)',
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 15}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.1, 0.4, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4">
        {/* Decorative line */}
        <motion.div
          className="w-16 h-[1px] mx-auto mb-8"
          style={{ background: 'var(--color-accent)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />

        {/* Brand Typography */}
        <motion.div
          className="flex justify-center items-center mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {brandLetters.map((letter, index) => (
            <motion.span
              key={index}
              className="quorin-brand text-[12vw] md:text-[10vw] lg:text-[8vw] leading-none select-none logo-gold"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1 * index,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{ scale: 1.05 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        {/* Decorative separator */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="w-8 h-[1px]" style={{ background: 'var(--color-accent-medium)' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} />
          <div className="w-8 h-[1px]" style={{ background: 'var(--color-accent-medium)' }} />
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-sm md:text-base tracking-[0.5em] mb-8"
          style={{ color: 'var(--color-text-secondary)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          {quorinData.tagline.toUpperCase()}
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="text-sm md:text-base max-w-xl mx-auto mb-12 leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
        >
          Premium crafting supplies for resin art, candle making, and soap making.
          Everything you need to bring your creative vision to life.
        </motion.p>

        {/* CTA Button */}
        <motion.button
          className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wider"
          style={{
            background: 'var(--color-accent)',
            color: 'white',
            boxShadow: '0 4px 24px rgba(201, 169, 110, 0.3)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          whileHover={{
            scale: 1.05,
            boxShadow: '0 8px 32px rgba(201, 169, 110, 0.5)',
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const el = document.getElementById('resin-art');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          EXPLORE COLLECTION
        </motion.button>

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-6 h-10 rounded-full flex items-start justify-center pt-2 mx-auto"
            style={{ border: '1px solid var(--color-accent-medium)' }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--color-accent)' }}
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
}

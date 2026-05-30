import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { quorinData } from '@/data/products';

interface NavigationProps {
  cartCount: number;
  onCartClick: () => void;
  onHomeClick?: () => void;
}

export default function Navigation({ cartCount, onCartClick, onHomeClick }: NavigationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 80) {
        setIsVisible(true);
      } else if (!menuOpen && e.clientY > 200) {
        setIsVisible(false);
      }
    };

    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
      if (window.scrollY > 100) {
        setIsVisible(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [menuOpen]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top hover detection zone indicator */}
      <AnimatePresence>
        {isVisible && !hasScrolled && (
          <motion.div
            className="fixed top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full z-50"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
              opacity: 0.5,
            }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 0.5, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Main Navigation */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            ref={navRef}
            className="fixed top-0 left-0 right-0 z-40 px-6 py-4"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div
              className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl"
              style={{
                background: hasScrolled ? 'rgba(8, 8, 13, 0.85)' : 'rgba(8, 8, 13, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: hasScrolled ? '0 4px 30px rgba(0, 0, 0, 0.3)' : 'none',
              }}
            >
              {/* Logo */}
              <motion.a
                href="#"
                className="text-xl font-bold tracking-[0.2em]"
                style={{
                  background: 'linear-gradient(135deg, #ff1a3c, #00d4ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                whileHover={{ scale: 1.05 }}
                onClick={(e) => {
                  e.preventDefault();
                  if (onHomeClick) onHomeClick();
                  else window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                QUORIN
              </motion.a>

              {/* Center links - hidden on mobile */}
              <div className="hidden md:flex items-center gap-8">
                {quorinData.categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    className="relative text-sm tracking-wider transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = 'var(--color-text-secondary)';
                    }}
                    whileHover={{ y: -2 }}
                    onClick={() => scrollToSection(cat.id)}
                  >
                    {cat.title.toUpperCase()}
                    <motion.div
                      className="absolute -bottom-1 left-0 h-[1px]"
                      style={{ background: 'var(--color-accent)' }}
                      initial={{ width: 0 }}
                      whileHover={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                ))}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Cart button */}
                <motion.button
                  className="relative p-2 rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  whileHover={{
                    scale: 1.1,
                    background: 'rgba(255, 26, 60, 0.1)',
                    borderColor: 'rgba(255, 26, 60, 0.3)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCartClick}
                >
                  <ShoppingCart size={18} style={{ color: 'var(--color-text-primary)' }} />
                  {cartCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold"
                      style={{
                        background: 'var(--color-accent)',
                        color: 'white',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </motion.button>

                {/* Menu button */}
                <motion.button
                  className="p-2 rounded-full md:hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? (
                    <X size={18} style={{ color: 'var(--color-text-primary)' }} />
                  ) : (
                    <Menu size={18} style={{ color: 'var(--color-text-primary)' }} />
                  )}
                </motion.button>

                {/* Desktop menu button */}
                <motion.button
                  className="hidden md:flex p-2 rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  whileHover={{
                    scale: 1.1,
                    background: 'rgba(255, 26, 60, 0.1)',
                    borderColor: 'rgba(255, 26, 60, 0.3)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  {menuOpen ? (
                    <X size={18} style={{ color: 'var(--color-text-primary)' }} />
                  ) : (
                    <Menu size={18} style={{ color: 'var(--color-text-primary)' }} />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex items-center justify-center"
            style={{
              background: 'rgba(8, 8, 13, 0.95)',
              backdropFilter: 'blur(30px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Menu content */}
            <div className="flex flex-col items-center gap-8">
              {quorinData.categories.map((cat, index) => (
                <motion.button
                  key={cat.id}
                  className="text-4xl md:text-6xl font-bold tracking-wider"
                  style={{ color: 'var(--color-text-primary)' }}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{
                    scale: 1.1,
                    color: '#ff1a3c',
                    textShadow: '0 0 40px rgba(255, 26, 60, 0.5)',
                  }}
                  onClick={() => scrollToSection(cat.id)}
                >
                  {cat.title}
                </motion.button>
              ))}

              <motion.div
                className="mt-8 flex gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <motion.button
                  className="px-8 py-3 rounded-full text-sm tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #ff1a3c, #ff0044)',
                    color: 'white',
                    boxShadow: '0 0 30px rgba(255, 26, 60, 0.3)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 0 50px rgba(255, 26, 60, 0.5)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setMenuOpen(false);
                    scrollToSection('resin-art');
                  }}
                >
                  SHOP NOW
                </motion.button>
              </motion.div>
            </div>

            {/* Decorative elements */}
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
              style={{ color: 'var(--color-text-muted)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs tracking-[0.3em]">SCROLL TO EXPLORE</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

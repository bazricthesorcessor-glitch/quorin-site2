import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'framer-motion';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
import type { AccountRecord } from '@/data/accounts';

interface MobileNavigationProps {
  cartCount: number;
  onCartClick: () => void;
  currentAccount: AccountRecord | null;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export default function MobileNavigation({ cartCount, onCartClick, currentAccount, onOpenProfile, onOpenLogin }: MobileNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const delta = current - lastScrollY.current;
      if (current < 24 || delta < -8) setIsVisible(true);
      else if (delta > 14 && current > 96) setIsVisible(false);
      lastScrollY.current = current;
    };
    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsVisible(true); }, [location.pathname]);

  const activeTab = location.pathname === '/' ? 'home' : location.pathname === '/search' ? 'search' : location.pathname === '/wishlist' ? 'wishlist' : '';
  const handleProfileClick = () => currentAccount ? onOpenProfile() : onOpenLogin();
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, onClick: () => navigate('/') },
    { id: 'search', label: 'Search', icon: Search, onClick: () => navigate('/search') },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, onClick: () => currentAccount ? navigate('/wishlist') : onOpenLogin() },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, onClick: onCartClick, badge: cartCount },
    { id: 'profile', label: 'Account', icon: User, onClick: handleProfileClick },
  ];

  return <motion.nav
    aria-label="Primary mobile navigation"
    className="fixed left-1/2 z-[9999] w-[calc(100%-1.5rem)] max-w-[400px] rounded-[22px] px-2 py-2 flex items-center justify-between pointer-events-auto md:hidden"
    style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))', background: 'linear-gradient(135deg, rgba(31,24,18,.94), rgba(42,33,24,.97))', border: '1px solid rgba(201,169,110,.28)', boxShadow: '0 14px 40px rgba(42,33,24,.38), inset 0 1px rgba(253,248,240,.07)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)' }}
    initial={reduceMotion ? false : { y: 100, x: '-50%', opacity: 0, scale: .94 }}
    animate={{ y: isVisible ? 0 : 120, x: '-50%', opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : .96 }}
    transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 26, stiffness: 320 }}
  >
    <div className="absolute top-0 left-5 right-5 h-px rounded-full bg-gradient-to-r from-transparent via-[rgba(201,169,110,.48)] to-transparent" aria-hidden="true" />
    {navItems.map((item) => {
      const Icon = item.icon;
      const active = activeTab === item.id;
      return <button key={item.id} type="button" onClick={item.onClick} aria-current={active ? 'page' : undefined} aria-label={item.badge ? `${item.label}, ${item.badge} items` : item.label} className="relative min-w-0 flex-1 min-h-12 flex flex-col items-center justify-center gap-0.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-bright)] active:scale-95" style={{ background: active ? 'rgba(201,169,110,.15)' : 'transparent', color: active ? 'var(--color-action-bright)' : 'rgba(253,248,240,.58)' }}>
        <motion.span animate={reduceMotion ? undefined : { scale: active ? 1.1 : 1 }} transition={{ type: 'spring', stiffness: 360, damping: 24 }}><Icon size={19} strokeWidth={active ? 2.5 : 1.8} /></motion.span>
        <span className="text-[9px] font-semibold tracking-[0.08em]">{item.label}</span>
        {active && <motion.span layoutId={reduceMotion ? undefined : 'mobileNavIndicator'} className="absolute top-0 w-5 h-0.5 rounded-full bg-[var(--color-action)]" />}
        {item.badge !== undefined && item.badge > 0 && <span className="absolute top-0.5 right-[16%] min-w-[18px] h-[18px] rounded-full px-1 flex items-center justify-center text-[9px] font-bold bg-[var(--color-action)] text-white shadow-lg" aria-hidden="true">{item.badge > 99 ? '99+' : item.badge}</span>}
      </button>;
    })}
  </motion.nav>;
}

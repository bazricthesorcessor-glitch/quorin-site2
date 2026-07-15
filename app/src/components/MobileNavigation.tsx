import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, User, ShoppingBag } from 'lucide-react';
import type { AccountRecord } from '@/data/accounts';

interface MobileNavigationProps {
  cartCount: number;
  onCartClick: () => void;
  currentAccount: AccountRecord | null;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export default function MobileNavigation({
  cartCount,
  onCartClick,
  currentAccount,
  onOpenProfile,
  onOpenLogin,
}: MobileNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll detection to hide/show on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Don't trigger near top
      if (currentScrollY < 10) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 10) {
        setIsVisible(false); // scrolling down fast
      } else if (lastScrollY - currentScrollY > 5) {
        setIsVisible(true); // scrolling up
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const activeTab = (() => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/search') return 'search';
    if (path === '/wishlist') return 'wishlist';
    if (path.startsWith('/product/')) return 'explore';
    return '';
  })();

  const handleProfileClick = () => {
    if (currentAccount) {
      onOpenProfile();
    } else {
      onOpenLogin();
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, onClick: () => navigate('/') },
    { id: 'search', label: 'Search', icon: Search, onClick: () => navigate('/search') },
    { id: 'explore', label: 'Shop', icon: ShoppingBag, onClick: () => navigate('/search') },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, onClick: () => {
        if (!currentAccount) {
          onOpenLogin();
        } else {
          navigate('/wishlist');
        }
      } 
    },
    { id: 'profile', label: 'Account', icon: User, onClick: handleProfileClick },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-[420px] backdrop-blur-2xl rounded-[30px] py-2 px-2 flex items-center justify-between pointer-events-auto"
          style={{
            background: 'rgba(250, 246, 240, 0.92)',
            border: '1px solid rgba(201, 169, 110, 0.22)',
            boxShadow: '0 18px 40px rgba(42, 33, 24, 0.15), 0 0 0 1px rgba(255,255,255,0.35) inset',
          }}
          initial={{ y: 100, x: '-50%', opacity: 0, scale: 0.9 }}
          animate={{ y: 0, x: '-50%', opacity: 1, scale: 1 }}
          exit={{ y: 100, x: '-50%', opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        >
          {/* Subtle gold top border */}
          <div 
            className="absolute top-0 left-4 right-4 h-[1px] rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(201, 169, 110, 0.5), transparent)' }}
          />

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl cursor-pointer active:scale-90 transition-all duration-150"
                style={{
                  background: item.id === 'explore'
                    ? 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), rgba(201,169,110,0.95) 55%, rgba(201,169,110,0.85) 100%)'
                    : isActive ? 'rgba(201,169,110,0.10)' : 'transparent',
                  transform: item.id === 'explore' ? 'translateY(-18px)' : 'none',
                  width: item.id === 'explore' ? 58 : undefined,
                  height: item.id === 'explore' ? 58 : undefined,
                  borderRadius: item.id === 'explore' ? '9999px' : undefined,
                  boxShadow: item.id === 'explore' ? '0 14px 30px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15) inset' : undefined,
                }}
              >
                <motion.div
                  animate={{
                    color: isActive || item.id === 'explore' ? 'var(--color-text-primary)' : 'rgba(91, 80, 69, 0.7)',
                    scale: isActive || item.id === 'explore' ? 1.15 : 1,
                  }}
                  transition={{ duration: 0.2, type: 'spring', stiffness: 300 }}
                >
                  <Icon size={item.id === 'explore' ? 24 : 19} strokeWidth={isActive || item.id === 'explore' ? 2.5 : 1.8} />
                </motion.div>
                
                {/* Label */}
                <motion.span
                  className="text-[9px] font-semibold tracking-wider mt-0.5"
                  animate={{
                    color: isActive || item.id === 'explore' ? 'var(--color-text-primary)' : 'rgba(91, 80, 69, 0.6)',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div
                    className="absolute -top-0.5 w-5 h-[2px] rounded-full"
                    style={{ background: 'var(--color-action)' }}
                    layoutId="mobileNavIndicator"
                    transition={{ type: 'spring', damping: 18, stiffness: 350 }}
                  />
                )}

                {/* Badge for Cart */}
                {item.badge !== undefined && item.badge > 0 && item.id !== 'explore' && (
                  <motion.span
                    className="absolute -top-1 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center px-1"
                    style={{
                      background: 'var(--color-action)',
                      color: 'white',
                      boxShadow: '0 2px 8px rgba(201, 169, 110, 0.5)',
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    {item.badge}
                  </motion.span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

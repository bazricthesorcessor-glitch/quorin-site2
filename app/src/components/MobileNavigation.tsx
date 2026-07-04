import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, ShoppingCart, User } from 'lucide-react';
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

      if (currentScrollY > lastScrollY) {
        setIsVisible(false); // scrolling down
      } else {
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
    { id: 'wishlist', label: 'Wishlist', icon: Heart, onClick: () => {
        if (!currentAccount) {
          onOpenLogin();
        } else {
          navigate('/wishlist');
        }
      } 
    },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, onClick: onCartClick, badge: cartCount },
    { id: 'profile', label: 'Profile', icon: User, onClick: handleProfileClick },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[380px] bg-black/85 backdrop-blur-xl border border-white/10 rounded-full py-2.5 px-4 flex items-center justify-between shadow-[0_12px_40px_rgba(0,0,0,0.4)] pointer-events-auto"
          initial={{ y: 80, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 80, x: '-50%', opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className="relative flex flex-col items-center justify-center p-2 rounded-full cursor-pointer group active:scale-95 transition-transform"
              >
                <motion.div
                  animate={{
                    color: isActive ? 'var(--color-action)' : 'rgba(255, 255, 255, 0.6)',
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={20} />
                </motion.div>
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[var(--color-action)]"
                    layoutId="mobileNavIndicator"
                    transition={{ type: 'spring', damping: 15, stiffness: 300 }}
                  />
                )}

                {/* Badge for Cart */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full bg-[var(--color-action)] text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-[0_2px_8px_rgba(201,169,110,0.4)]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

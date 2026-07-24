import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router';
import { Menu, X, ShoppingCart, UserRound, User, Package, MessageSquare, Zap, ArrowLeft, Shield, Heart, Search, Sparkles, ShoppingBag } from 'lucide-react';
import { quorinData } from '@/data/products';
import { useMedusaCatalog } from '@/lib/useMedusaCatalog';
import type { AccountRecord } from '@/data/accounts';
import { defaultPhoneCountry, phoneCountries, findPhoneCountry, searchPhoneCountries } from '@/data/phoneCountries';
import { appendCustomRequest } from '@/lib/quorinStore';

interface NavigationProps {
  cartCount: number;
  onCartClick: () => void;
  onHomeClick?: () => void;
  currentAccount: AccountRecord | null;
  onAuthenticate: (identifier: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  onRegister: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  onOpenProfile: () => void;
  onToggleAdminMode: () => void;
}

export default function Navigation({
  cartCount,
  onCartClick,
  onHomeClick,
  currentAccount,
  onAuthenticate,
  onRegister,
  onOpenProfile,
  onToggleAdminMode,
}: NavigationProps) {
  const navigate = useNavigate();
  const { categories: medusaCategories } = useMedusaCatalog();
  const [isVisible, setIsVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const navHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<'google' | 'email' | 'phone'>('google');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [countryLabel, setCountryLabel] = useState(defaultPhoneCountry.label);
  const [countryQuery, setCountryQuery] = useState(defaultPhoneCountry.label);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'register'>('login');
  const [registerFirstName, setRegisterFirstName] = useState('');
  const [registerLastName, setRegisterLastName] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [activeSigil, setActiveSigil] = useState<string | null>(null);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [customRequestText, setCustomRequestText] = useState('');
  const [customRequestSent, setCustomRequestSent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const menuCloseTimer = useRef<number | null>(null);
  const sigilHideTimer = useRef<number | null>(null);

  const isMobile = useIsMobile();

  const extraLinks = [
    { title: 'Kits', onClick: () => navigate('/kits') },
    { title: 'New Arrivals', onClick: () => navigate('/new-arrivals') },

  ];

  useEffect(() => {
    const handleOpenLogin = () => {
      setLoginMode('email');
      setLoginOpen(true);
    };
    window.addEventListener('quorin:openLogin', handleOpenLogin);
    return () => window.removeEventListener('quorin:openLogin', handleOpenLogin);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setHasScrolled(currentScrollY > 100);

      if (currentScrollY > lastScrollY.current + 5) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current - 5) {
        setIsVisible(false);
      }
      lastScrollY.current = currentScrollY;

      if (navHideTimer.current) clearTimeout(navHideTimer.current);
      navHideTimer.current = setTimeout(() => setIsVisible(true), 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (navHideTimer.current) clearTimeout(navHideTimer.current);
    };
  }, []);

  const openCategory = (id: string) => {
    navigate(`/category/${id}`);
    setMenuOpen(false);
  };

  const openSection = (id: string) => {
    setMenuOpen(false);
    navigate('/');
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const clearMenuCloseTimer = () => {
    if (menuCloseTimer.current) {
      window.clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }
  };

  const clearSigilHideTimer = () => {
    if (sigilHideTimer.current) {
      window.clearTimeout(sigilHideTimer.current);
      sigilHideTimer.current = null;
    }
  };

  const showSigilLabel = (label: string) => {
    clearSigilHideTimer();
    setActiveSigil(label);
  };

  const hideSigilLabel = () => {
    clearSigilHideTimer();
    sigilHideTimer.current = window.setTimeout(() => {
      setActiveSigil(null);
    }, 5000);
  };

  useEffect(() => {
    if (!menuOpen) {
      clearSigilHideTimer();
      setActiveSigil(null);
    }
  }, [menuOpen]);

  useEffect(() => {
    return () => {
      clearMenuCloseTimer();
      clearSigilHideTimer();
    };
  }, []);

  const scheduleMenuClose = () => {
    clearMenuCloseTimer();
    menuCloseTimer.current = window.setTimeout(() => {
      setMenuOpen(false);
    }, 5000);
  };

  const openMenu = () => {
    clearMenuCloseTimer();
    setMenuOpen(true);
  };

  const handleEmailLogin = async () => {
    if (!emailAddress.trim() || !emailPassword) {
      setLoginError('Enter your email address and password.');
      return;
    }

    setAuthSubmitting(true);
    setLoginError(null);

    try {
      const result = await onAuthenticate(
        emailAddress.trim(),
        emailPassword
      );

      if (!result.ok) {
        setLoginError(result.message ?? 'Login failed.');
        return;
      }

      setLoginOpen(false);
      onOpenProfile();
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleEmailRegistration = async () => {
    if (
      !registerFirstName.trim() ||
      !registerLastName.trim() ||
      !emailAddress.trim() ||
      !emailPassword
    ) {
      setLoginError('Complete all registration fields.');
      return;
    }

    if (emailPassword.length < 6) {
      setLoginError('Password must contain at least 6 characters.');
      return;
    }

    if (emailPassword !== registerConfirmPassword) {
      setLoginError('Passwords do not match.');
      return;
    }

    setAuthSubmitting(true);
    setLoginError(null);

    try {
      const result = await onRegister({
        firstName: registerFirstName.trim(),
        lastName: registerLastName.trim(),
        email: emailAddress.trim(),
        password: emailPassword,
      });

      if (!result.ok) {
        setLoginError(result.message ?? 'Registration failed.');
        return;
      }

      setLoginOpen(false);
      onOpenProfile();
    } finally {
      setAuthSubmitting(false);
    }
  };

  const saveCustomRequest = (message: string) => {
    const entry = {
      id: crypto.randomUUID(),
      accountId: currentAccount?.profile.id ?? 'guest',
      message,
      createdAt: new Date().toISOString(),
    };

    appendCustomRequest(entry);
  };

  const selectedCountry = findPhoneCountry(countryLabel) ?? defaultPhoneCountry;
  const filteredCountries = useMemo(() => searchPhoneCountries(countryQuery).slice(0, 24), [countryQuery]);
  const activeCountry = filteredCountries[0] ?? selectedCountry;

  const menuItems = [
    {
      icon: User,
      label: 'Account',
      onClick: () => {
        if (currentAccount) {
          onOpenProfile();
          return;
        }
        setLoginMode('email');
        setEmailAddress('');
        setEmailPassword('');
        setPhoneNumber('');
        setCountryLabel(defaultPhoneCountry.label);
        setCountryQuery(defaultPhoneCountry.label);
        setCountryPickerOpen(false);
        setOtpSent(false);
        setLoginError(null);
        setLoginOpen(true);
      },
    },
    { icon: Package, label: 'Orders', onClick: () => openSection('orders') },
    { icon: Heart, label: 'Wishlist', onClick: () => {
        if (!currentAccount) {
          setLoginMode('email');
          setEmailAddress('');
          setEmailPassword('');
          setPhoneNumber('');
          setCountryLabel(defaultPhoneCountry.label);
          setCountryQuery(defaultPhoneCountry.label);
          setCountryPickerOpen(false);
          setOtpSent(false);
          setLoginError(null);
          setLoginOpen(true);
          return;
        }
        setMenuOpen(false);
        navigate('/wishlist');
      }
    },
    {
      icon: MessageSquare,
      label: 'Custom Requests',
      onClick: () => {
        setMenuOpen(false);
        setCustomRequestText('');
        setCustomRequestOpen(true);
      },
    },
    {
      icon: ShoppingBag,
      label: 'Kits',
      onClick: () => { setMenuOpen(false); navigate('/kits'); },
    },
    {
      icon: Sparkles,
      label: 'New Arrivals',
      onClick: () => { setMenuOpen(false); navigate('/new-arrivals'); },
    },
    {
      icon: Zap,
      label: 'XP',
      onClick: () => {
        navigate('/xp');
        setMenuOpen(false);
      },
    },
    {
      icon: ArrowLeft,
      label: 'Back to Home',
      onClick: () => {
        setMenuOpen(false);
        if (onHomeClick) onHomeClick();
        else navigate('/');
      },
    },
    {
      icon: Shield,
      label: 'Admin',
      onClick: () => {
        if (currentAccount?.profile.role === 'admin') {
          navigate('/admin');
          return;
        }
        if (currentAccount?.profile.role === 'customer') {
          setAccessNotice('This space is reserved for admin members.');
          window.setTimeout(() => setAccessNotice(null), 2200);
          return;
        }
        setLoginMode('email');
        setEmailAddress('admin909');
        setEmailPassword('');
        setCountryLabel(defaultPhoneCountry.label);
        setCountryQuery(defaultPhoneCountry.label);
        setCountryPickerOpen(false);
        setOtpSent(false);
        setLoginError(null);
        setLoginOpen(true);
      },
    },
  ];

  return (
    <>
      {/* Main Navigation */}
      <AnimatePresence>
        {isVisible && (
          <motion.nav
            ref={navRef}
            className="fixed top-0 left-0 right-0 z-40 px-3 pt-3 md:px-6 md:pt-4"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div
              className="mx-auto flex items-center justify-between px-4 py-2.5 rounded-[30px]"
              style={{
                background: 'rgba(250, 246, 240, 0.92)',
                border: '1px solid rgba(201, 169, 110, 0.22)',
                boxShadow: '0 18px 40px rgba(42, 33, 24, 0.15), 0 0 0 1px rgba(255,255,255,0.35) inset',
              }}
            >
              {/* Animated content: normal mode vs search mode */}
              <AnimatePresence mode="wait">
                {searchMode ? (
                  <motion.div
                    key="search-bar"
                    className="flex items-center gap-3 w-full"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button
                      className="p-2 rounded-full flex-shrink-0"
                      style={{
                        background: 'var(--color-surface-hover)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSearchMode(false);
                        setSearchQuery('');
                      }}
                    >
                      <ArrowLeft size={18} style={{ color: 'var(--color-text-primary)' }} />
                    </motion.button>
                    <div
                      className="flex-1 flex items-center rounded-full px-4 py-2.5 border transition-all"
                      style={{
                        background: 'var(--color-surface)',
                        borderColor: 'var(--color-accent)',
                      }}
                    >
                      <Search size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search premium craft supplies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            setSearchMode(false);
                            setSearchQuery('');
                          }
                          if (e.key === 'Enter' && searchQuery.trim()) {
                            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                            setSearchMode(false);
                            setSearchQuery('');
                          }
                        }}
                        className="w-full bg-transparent outline-none text-sm ml-3"
                        style={{ color: 'var(--color-text-primary)' }}
                        autoFocus
                      />
                    </div>
                    <motion.button
                      className="p-2 rounded-full flex-shrink-0"
                      style={{
                        background: 'var(--color-accent)',
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (searchQuery.trim()) {
                          navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchMode(false);
                          setSearchQuery('');
                        }
                      }}
                    >
                      <Search size={18} style={{ color: 'white' }} />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="normal-nav"
                    className="flex items-center w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Logo */}
                    <motion.a
                      href="#"
                      className="quorin-brand text-xl tracking-wide logo-gold flex-shrink-0"
                      style={{
                        textShadow: '0 0 20px rgba(200, 155, 82, 0.2)',
                      }}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onHomeClick) onHomeClick();
                        else window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      {quorinData.brand}
                    </motion.a>

                    {/* Center links - hidden on mobile */}
                    <div className="hidden md:flex items-center justify-center flex-1 gap-8">
                      {medusaCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          className="relative text-sm tracking-[0.15em] uppercase transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.color = 'var(--color-text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.color = 'var(--color-text-secondary)';
                          }}
                          whileHover={{ y: -1 }}
                          onClick={() => openCategory(cat.id)}
                        >
                          {cat.title}
                          <motion.div
                            className="absolute -bottom-1 left-0 h-[1px]"
                            style={{ background: 'var(--color-accent)' }}
                            initial={{ width: 0 }}
                            whileHover={{ width: '100%' }}
                            transition={{ duration: 0.4 }}
                          />
                        </motion.button>
                      ))}
                      {extraLinks.map((link) => (
                        <motion.button
                          key={link.title}
                          className="relative text-sm tracking-[0.15em] uppercase transition-colors"
                          style={{ color: 'var(--color-text-secondary)' }}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.color = 'var(--color-text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.color = 'var(--color-text-secondary)';
                          }}
                          whileHover={{ y: -1 }}
                          onClick={link.onClick}
                        >
                          {link.title}
                          <motion.div
                            className="absolute -bottom-1 left-0 h-[1px]"
                            style={{ background: 'var(--color-accent)' }}
                            initial={{ width: 0 }}
                            whileHover={{ width: '100%' }}
                            transition={{ duration: 0.4 }}
                          />
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Right side */}
              <div className="flex items-center gap-4">
                {/* Search button */}
                <motion.button
                  className="relative p-2 rounded-full"
                  style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    background: 'var(--color-accent-soft)',
                    borderColor: 'var(--color-accent)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    navigate('/search');
                  }}
                >
                  <Search size={18} style={{ color: 'var(--color-text-primary)' }} />
                </motion.button>
                {/* Cart button */}
                <motion.button
                  className="relative p-2 rounded-full"
                  style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    background: 'var(--color-accent-soft)',
                    borderColor: 'var(--color-accent)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCartClick}
                >
                  <ShoppingCart size={18} style={{ color: 'var(--color-text-primary)' }} />
                  {cartCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold"
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

                {/* Wishlist button */}
                <motion.button
                  className="relative p-2 rounded-full"
                  style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    background: 'var(--color-accent-soft)',
                    borderColor: 'var(--color-accent)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!currentAccount) {
                      setLoginMode('email');
                      setLoginOpen(true);
                      return;
                    }
                    navigate('/wishlist');
                  }}
                >
                  <Heart size={18} style={{ color: currentAccount && (currentAccount.wishlist?.length ?? 0) > 0 ? 'var(--color-accent)' : 'var(--color-text-primary)' }} fill={currentAccount && (currentAccount.wishlist?.length ?? 0) > 0 ? 'var(--color-accent)' : 'none'} />
                  {currentAccount && (currentAccount.wishlist?.length ?? 0) > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-semibold"
                      style={{
                        background: 'var(--color-accent)',
                        color: 'white',
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      {currentAccount.wishlist.length}
                    </motion.span>
                  )}
                </motion.button>

                <motion.button
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm tracking-[0.12em]"
                  style={{
                    background: currentAccount ? 'var(--color-accent-soft)' : 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                  }}
                  whileHover={{
                    scale: 1.03,
                    background: currentAccount ? 'var(--color-accent-medium)' : 'var(--color-surface-hover)',
                    borderColor: 'var(--color-accent)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (currentAccount) onOpenProfile();
                    else {
                      setLoginMode('email');
                      setLoginOpen(true);
                    }
                  }}
                >
                  <UserRound size={16} />
                  {currentAccount ? currentAccount.profile.displayName : 'Sign In'}
                </motion.button>

                {/* Menu button */}
                <motion.button
                  className="p-2 rounded-full md:hidden"
                  style={{
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
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
                    background: 'var(--color-surface-hover)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    background: 'var(--color-accent-soft)',
                    borderColor: 'var(--color-accent)',
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => (menuOpen ? setMenuOpen(false) : openMenu())}
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

      {/* Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-30"
            style={{
              background: 'rgba(42, 33, 24, 0.9)',
              backdropFilter: 'blur(20px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onMouseEnter={clearMenuCloseTimer}
            onMouseLeave={scheduleMenuClose}
          >
            <button
              className="absolute inset-0 z-0 cursor-default"
              aria-label="Close menu overlay"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              className="fixed inset-[16px] z-10 rounded-[2rem] border overflow-hidden"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border-subtle)',
                boxShadow: '0 12px 40px var(--shadow-deep)',
              }}
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onMouseEnter={clearMenuCloseTimer}
              onMouseLeave={scheduleMenuClose}
            >
              <div className="grid h-full grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="h-full p-5 border-b lg:border-b-0 lg:border-r flex flex-col items-center justify-center gap-4" style={{ borderColor: 'var(--color-border-subtle)' }}>
                  <p className="text-xs tracking-[0.25em] w-full text-center" style={{ color: 'var(--color-text-muted)' }}>
                    NAVIGATION
                  </p>

                  <div className="flex flex-col gap-3 items-center pt-3">
                    {menuItems.map((item, index) => (
                      <motion.button
                        key={item.label}
                        className="group relative flex items-center justify-center w-14 h-14 rounded-xl overflow-visible"
                        style={{
                          background: 'transparent',
                          border: '1px solid transparent',
                        }}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ delay: index * 0.06 }}
                        whileHover={{
                          x: 4,
                          background: 'var(--color-surface-hover)',
                          borderColor: 'var(--color-border-subtle)',
                        }}
                        whileTap={{ scale: 0.95 }}
                        onMouseEnter={() => {
                          showSigilLabel(item.label);
                        }}
                        onMouseLeave={hideSigilLabel}
                        onFocus={() => showSigilLabel(item.label)}
                        onBlur={hideSigilLabel}
                        onClick={item.onClick}
                      >
                        <span
                          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full"
                          style={{
                            background: 'var(--color-surface-hover)',
                          }}
                        >
                          {React.createElement(item.icon, { size: 20, style: { color: 'var(--color-accent)' } })}
                        </span>
                        <AnimatePresence>
                          {activeSigil === item.label && (
                            <motion.span
                              className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-20 flex -translate-y-1/2 items-center justify-start rounded-xl whitespace-nowrap px-3 py-1 text-left text-[11px] font-medium leading-none tracking-[0.18em]"
                              style={{
                                top: 'calc(50% - 3px)',
                                background: 'var(--color-surface)',
                                border: '1px solid var(--color-border-subtle)',
                                color: 'var(--color-text-primary)',
                                boxShadow: '0 4px 12px var(--shadow-card)',
                                minWidth: 'max-content',
                              }}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="h-full p-5 flex items-center justify-center min-w-0">
                  <div className="w-full max-w-4xl min-w-0 rounded-2xl border p-5 md:p-6" style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-ivory)' }}>
                    <div className="text-center mb-5">
                      <p className="text-xs tracking-[0.25em]" style={{ color: 'var(--color-text-muted)' }}>
                        SHOP BY CATEGORY
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">
                      {medusaCategories.map((cat, index) => (
                        <motion.button
                          key={cat.id}
                          className="group min-w-0 rounded-xl px-4 py-5 text-center"
                          style={{
                            background: 'var(--color-surface)',
                            border: '1px solid var(--color-border-subtle)',
                          }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          whileHover={{ y: -3, background: 'var(--color-ivory)', borderColor: 'var(--color-accent)' }}
                          onClick={() => openCategory(cat.id)}
                        >
                          <span className="block text-base md:text-lg font-semibold tracking-wider leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                            {cat.title}
                          </span>
                          <span className="mt-3 block text-lg" style={{ color: 'var(--color-accent)' }}>
                            {'◇'}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {loginOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(42, 33, 24, 0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setLoginOpen(false);
              setLoginError(null);
            }}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border p-6"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border-subtle)',
              }}
              initial={{ y: 24, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 16, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                  <UserRound size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Sign In</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Access your account, orders, and preferences</p>
                </div>
              </div>

              <div className="flex gap-2 mb-5">
                <button
                  className="flex-1 rounded-xl px-4 py-3 text-sm tracking-wider"
                  style={{
                    background: loginMode === 'google' ? 'var(--color-accent-soft)' : 'var(--color-ivory)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                    onClick={() => {
                      setLoginMode('google');
                      setOtpSent(false);
                      setPhoneNumber('');
                      setCountryLabel(defaultPhoneCountry.label);
                      setCountryQuery(defaultPhoneCountry.label);
                      setCountryPickerOpen(false);
                      setOtpCode(['', '', '', '']);
                      setEmailAddress('');
                      setEmailPassword('');
                      setLoginError(null);
                    }}
                >
                  Google
                </button>
                <button
                  className="flex-1 rounded-xl px-4 py-3 text-sm tracking-wider"
                  style={{
                    background: loginMode === 'email' ? 'var(--color-surface-hover)' : 'var(--color-ivory)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  onClick={() => {
                    setLoginMode('email');
                    setLoginError(null);
                  }}
                >
                  Email
                </button>
                <button
                  className="flex-1 rounded-xl px-4 py-3 text-sm tracking-wider"
                  style={{
                    background: loginMode === 'phone' ? 'var(--color-accent-soft)' : 'var(--color-ivory)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  onClick={() => {
                    setLoginMode('phone');
                    setLoginError(null);
                    setCountryLabel(defaultPhoneCountry.label);
                    setCountryQuery(defaultPhoneCountry.label);
                    setCountryPickerOpen(false);
                  }}
                >
                  Phone
                </button>
              </div>

              {loginMode === 'google' ? (
                <div className="space-y-3">
                  <button
                    className="w-full rounded-xl px-4 py-3 flex items-center justify-center gap-3"
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                    onClick={async () => {
                      try {
                        setLoginError(null);
                        const { medusaApi } = await import('@/lib/medusa');
                        const callbackUrl =
                          window.location.origin +
                          '/auth/google/callback';
                        const result =
                          await medusaApi.googleAuthLogin(callbackUrl);
                        if (result.location) {
                          window.location.href = result.location;
                        }
                      } catch {
                        setLoginError(
                          'Failed to start Google login. Please try again.'
                        );
                      }
                    }}
                  >
                    <span className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>G</span>
                    Continue with Google
                  </button>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Use your Google account for account access and admin mode.
                  </p>
                </div>
              ) : loginMode === 'email' ? (
                <div className="space-y-3">
                  {emailAuthMode === 'register' && (
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        placeholder="First name"
                        value={registerFirstName}
                        onChange={(e) => setRegisterFirstName(e.target.value)}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                      />
                      <input
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        placeholder="Last name"
                        value={registerLastName}
                        onChange={(e) => setRegisterLastName(e.target.value)}
                        style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                      />
                    </div>
                  )}

                  <input
                    className="w-full rounded-xl px-4 py-3 outline-none"
                    placeholder="Email address"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />

                  <input
                    className="w-full rounded-xl px-4 py-3 outline-none"
                    placeholder="Password"
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                  />

                  {emailAuthMode === 'register' && (
                    <input
                      className="w-full rounded-xl px-4 py-3 outline-none"
                      placeholder="Confirm password"
                      type="password"
                      value={registerConfirmPassword}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  )}

                  <button
                    type="button"
                    disabled={authSubmitting}
                    className="w-full rounded-xl px-4 py-3 text-sm tracking-wider disabled:opacity-60"
                    style={{
                      background: 'var(--color-accent)',
                      color: 'white',
                    }}
                    onClick={
                      emailAuthMode === 'login'
                        ? handleEmailLogin
                        : handleEmailRegistration
                    }
                  >
                    {authSubmitting
                      ? 'Please wait...'
                      : emailAuthMode === 'login'
                        ? 'Continue with Email'
                        : 'Create Account'}
                  </button>

                  <button
                    type="button"
                    className="w-full text-center text-sm underline underline-offset-4"
                    style={{ color: 'var(--color-text-secondary)' }}
                    onClick={() => {
                      setLoginError(null);
                      setEmailPassword('');
                      setRegisterConfirmPassword('');
                      setEmailAuthMode(
                        emailAuthMode === 'login' ? 'register' : 'login'
                      );
                    }}
                  >
                    {emailAuthMode === 'login'
                      ? 'New to QUORIN? Create account'
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      className="w-full rounded-xl px-4 py-3 outline-none"
                      placeholder="Search country or code"
                      value={countryQuery}
                      onFocus={() => setCountryPickerOpen(true)}
                      onChange={(e) => {
                        const next = e.target.value;
                        setCountryQuery(next);
                        setCountryPickerOpen(true);

                        const exact = phoneCountries.find((country) => country.name.toLowerCase() === next.trim().toLowerCase() || country.label.toLowerCase() === next.trim().toLowerCase() || country.code === next.trim());
                        if (exact) {
                          setCountryLabel(exact.label);
                        }
                      }}
                      onBlur={() => {
                        window.setTimeout(() => setCountryPickerOpen(false), 120);
                      }}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs"
                      style={{ background: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setCountryQuery(selectedCountry.label);
                        setCountryPickerOpen(true);
                      }}
                    >
                      {selectedCountry.code}
                    </button>
                    <AnimatePresence>
                      {countryPickerOpen && (
                        <motion.div
                          className="quorin-scrollbox absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-y-auto rounded-xl border p-2"
                          style={{
                            maxHeight: 260,
                            background: 'var(--color-surface)',
                            borderColor: 'var(--color-border-subtle)',
                            boxShadow: '0 12px 32px var(--shadow-deep)',
                          }}
                          initial={{ opacity: 0, y: -4, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        >
                          {filteredCountries.length ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country.label}
                                className="w-full rounded-lg px-4 py-3 text-left transition-colors"
                                style={{
                                  color: country.label === selectedCountry.label ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                  background: country.label === selectedCountry.label ? 'var(--color-accent-soft)' : 'transparent',
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setCountryLabel(country.label);
                                  setCountryQuery(country.label);
                                  setCountryPickerOpen(false);
                                }}
                              >
                                <span className="block">{country.label}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              No countries found
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      className="w-full rounded-xl px-4 py-3 outline-none mt-2"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      className="w-full rounded-xl px-4 py-3 text-sm tracking-wider"
                      style={{
                        background: 'var(--color-accent)',
                        color: 'white',
                      }}
                      onClick={() => {
                        if (!phoneNumber.trim()) return;
                        setOtpSent(true);
                        setOtpCode(['', '', '', '']);
                      }}
                    >
                      Send OTP
                    </button>
                  ) : (
                    <motion.div
                      className="rounded-xl p-4 border"
                      style={{ borderColor: 'var(--color-border-subtle)', background: 'var(--color-ivory)' }}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <motion.span
                          className="h-3 w-3 rounded-full"
                          style={{ background: 'var(--color-accent)' }}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          OTP sent to {activeCountry.label} {phoneNumber}
                        </p>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {otpCode.map((digit, index) => (
                          <input
                            key={index}
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const next = [...otpCode];
                              next[index] = e.target.value.replace(/\D/g, '').slice(-1);
                              setOtpCode(next);
                            }}
                            className="h-12 rounded-xl text-center text-lg outline-none"
                            style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
                          />
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setOtpSent(false)}>
                          Change number
                        </button>
                        <button
                          className="px-5 py-2 rounded-full text-sm tracking-wider"
                          style={{
                            background: 'var(--color-accent)',
                            color: 'white',
                          }}
                          onClick={async () => {
                            const result = await onAuthenticate(phoneNumber.trim(), otp.join(''));
                            if (!result.ok) {
                              setLoginError(result.message ?? 'Login failed.');
                              return;
                            }
                            setLoginError(null);
                            setLoginOpen(false);
                            onOpenProfile();
                          }}
                        >
                          Verify OTP
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {loginError && (
                <p className="mt-4 text-sm" style={{ color: 'var(--color-destructive)' }}>
                  {loginError}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                  <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => { setLoginOpen(false); setLoginError(null); }}>
                    Close
                  </button>
                <button
                  className="px-5 py-2 rounded-full text-sm tracking-wider"
                  style={{
                    background: 'var(--color-surface-hover)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                  onClick={() => {
                    setLoginMode('google');
                    setOtpSent(false);
                    setPhoneNumber('');
                    setCountryLabel(defaultPhoneCountry.label);
                    setCountryQuery(defaultPhoneCountry.label);
                    setCountryPickerOpen(false);
                    setOtpCode(['', '', '', '']);
                  }}
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {customRequestOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(42, 33, 24, 0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCustomRequestOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-2xl border p-6"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)' }}
              initial={{ y: 20, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 14, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs tracking-[0.2em] mb-4" style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}>
                ⟡ Bespoke Request
              </div>
              <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Message to the Manager
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Share your vision, and our artisans will craft something extraordinary for you.
              </p>

              <textarea
                className="w-full min-h-40 rounded-xl p-4 outline-none"
                placeholder="Describe your bespoke order..."
                value={customRequestText}
                onChange={(e) => setCustomRequestText(e.target.value)}
                style={{ background: 'var(--color-ivory)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-subtle)' }}
              />

              {customRequestSent && (
                <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }}>
                  Request received: {customRequestSent}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setCustomRequestOpen(false)}>
                  Cancel
                </button>
                <button
                  className="px-5 py-2 rounded-full text-sm tracking-wider"
                  style={{ background: 'var(--color-accent)', color: 'white' }}
                  onClick={() => {
                    const message = customRequestText.trim();
                    if (!message) return;

                    if (!currentAccount) {
                      setLoginMode('email');
                      setCustomRequestOpen(false);
                      window.setTimeout(() => setLoginOpen(true), 250);
                      return;
                    }

                    saveCustomRequest(message);
                    setCustomRequestSent(message);
                    setCustomRequestText('');
                    setCustomRequestOpen(false);
                  }}
                >
                  Send Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {accessNotice && (
          <motion.div
            className="fixed top-24 right-6 z-50 rounded-xl border px-4 py-3"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border-subtle)', color: 'var(--color-text-primary)', boxShadow: '0 4px 16px var(--shadow-card)' }}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
          >
            {accessNotice}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

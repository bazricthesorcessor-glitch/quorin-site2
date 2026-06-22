import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Menu, X, ShoppingCart, UserRound } from 'lucide-react';
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
  onAuthenticate: (identifier: string, password: string) => { ok: boolean; message?: string };
  onOpenProfile: () => void;
  onToggleAdminMode: () => void;
}

export default function Navigation({
  cartCount,
  onCartClick,
  onHomeClick,
  currentAccount,
  onAuthenticate,
  onOpenProfile,
  onToggleAdminMode,
}: NavigationProps) {
  const navigate = useNavigate();
  const { categories: medusaCategories } = useMedusaCatalog();
  const [isVisible, setIsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [activeSigil, setActiveSigil] = useState<string | null>(null);
  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [customRequestText, setCustomRequestText] = useState('');
  const [customRequestSent, setCustomRequestSent] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const menuCloseTimer = useRef<number | null>(null);
  const sigilHideTimer = useRef<number | null>(null);

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
    }, 2000);
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
    }, 2000);
  };

  const openMenu = () => {
    clearMenuCloseTimer();
    setMenuOpen(true);
  };

  const handleEmailLogin = () => {
    const result = onAuthenticate(emailAddress.trim(), emailPassword.trim());

    if (!result.ok) {
      setLoginError(result.message ?? 'Login failed.');
      return;
    }

    setLoginError(null);
    setLoginOpen(false);
    onOpenProfile();
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
      glyph: '✦',
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
    { glyph: '✶', label: 'Orders', onClick: () => openSection('orders') },
     {
       glyph: '⟡',
       label: 'Custom Requests',
       onClick: () => {
         setMenuOpen(false);
         setCustomRequestText('');
         setCustomRequestOpen(true);
       },
     },
    {
      glyph: '◈',
      label: 'XP',
      onClick: () => {
        navigate('/xp');
        setMenuOpen(false);
      },
    },
    {
      glyph: '✧',
      label: 'Back to Home',
      onClick: () => {
        setMenuOpen(false);
        if (onHomeClick) onHomeClick();
        else navigate('/');
      },
    },
    {
      glyph: '⟁',
      label: 'Admin Mode',
      onClick: () => {
        if (currentAccount?.profile.role === 'admin') {
          onToggleAdminMode();
          return;
        }
        if (currentAccount?.profile.role === 'customer') {
          setAccessNotice('You do not have access to these powers.');
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
                className="quorin-brand text-xl font-bold"
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
                {quorinData.brand}
              </motion.a>

              {/* Center links - hidden on mobile */}
              <div className="hidden md:flex items-center gap-8">
                {medusaCategories.map((cat) => (
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
                    onClick={() => openCategory(cat.id)}
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

                <motion.button
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm tracking-wider"
                  style={{
                    background: currentAccount ? 'rgba(0, 212, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'var(--color-text-primary)',
                  }}
                  whileHover={{
                    scale: 1.05,
                    background: currentAccount ? 'rgba(0, 212, 255, 0.14)' : 'rgba(0, 212, 255, 0.08)',
                    borderColor: 'rgba(0, 212, 255, 0.25)',
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
                  {currentAccount ? currentAccount.profile.displayName : 'Login'}
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
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  whileHover={{
                    scale: 1.1,
                    background: 'rgba(255, 26, 60, 0.1)',
                    borderColor: 'rgba(255, 26, 60, 0.3)',
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

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-30"
            style={{
              background: 'rgba(8, 8, 13, 0.95)',
              backdropFilter: 'blur(30px)',
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
              className="fixed inset-[12px] z-10 rounded-[2rem] border overflow-hidden"
              style={{
                background: 'rgba(12, 12, 20, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
              }}
              initial={{ y: 20, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onMouseEnter={clearMenuCloseTimer}
              onMouseLeave={scheduleMenuClose}
            >
              <div className="grid h-full grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="h-full p-5 border-b lg:border-b-0 lg:border-r flex flex-col items-center justify-center gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-xs tracking-[0.35em] w-full text-center" style={{ color: 'var(--color-text-muted)' }}>
                    MENU SIGILS
                  </p>

                  <div className="flex flex-col gap-3 items-center pt-3">
                    {menuItems.map((item, index) => (
                      <motion.button
                        key={item.label}
                        className="group relative flex items-center justify-center w-16 h-16 rounded-2xl overflow-visible"
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          boxShadow: item.label === 'Admin Mode'
                            ? '0 0 0 1px rgba(186, 85, 255, 0.18), 0 0 22px rgba(186, 85, 255, 0.22)'
                            : 'none',
                        }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={
                          item.label === 'Admin Mode'
                            ? {
                                opacity: 1,
                                x: 0,
                                boxShadow: [
                                  '0 0 0 1px rgba(186, 85, 255, 0.18), 0 0 22px rgba(186, 85, 255, 0.22)',
                                  '0 0 0 1px rgba(186, 85, 255, 0.38), 0 0 32px rgba(186, 85, 255, 0.52)',
                                  '0 0 0 1px rgba(186, 85, 255, 0.18), 0 0 22px rgba(186, 85, 255, 0.22)',
                                ],
                              }
                            : { opacity: 1, x: 0 }
                        }
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.06 }}
                        whileHover={{
                          x: 6,
                          y: -2,
                          background: item.label === 'Admin Mode' ? 'rgba(186, 85, 255, 0.12)' : 'rgba(255, 26, 60, 0.09)',
                          borderColor: item.label === 'Admin Mode' ? 'rgba(186, 85, 255, 0.5)' : 'rgba(255, 26, 60, 0.25)',
                          boxShadow: item.label === 'Admin Mode'
                            ? '0 0 0 1px rgba(186, 85, 255, 0.34), 0 0 32px rgba(186, 85, 255, 0.55)'
                            : '0 0 0 1px rgba(255, 26, 60, 0.2), 0 0 24px rgba(0, 212, 255, 0.28)',
                        }}
                        onMouseEnter={() => {
                          showSigilLabel(item.label);
                        }}
                        onMouseLeave={hideSigilLabel}
                        onFocus={() => showSigilLabel(item.label)}
                        onBlur={hideSigilLabel}
                        onClick={item.onClick}
                        >
                        <span
                          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-2xl"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: item.label === 'Admin Mode' ? '#d77bff' : 'var(--color-teal)',
                            fontFamily: 'serif',
                            textShadow: '0 0 18px rgba(0,0,0,0.6)',
                          }}
                        >
                          {item.glyph}
                        </span>
                        <AnimatePresence>
                          {activeSigil === item.label && (
                            <motion.span
                              className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-20 flex -translate-y-1/2 items-center justify-start rounded-2xl whitespace-nowrap px-3 py-1 text-left text-[11px] font-semibold leading-none tracking-[0.22em]"
                              style={{
                                top: 'calc(50% - 3px)',
                                background: item.label === 'Admin Mode'
                                  ? 'rgba(186, 85, 255, 0.16)'
                                  : 'rgba(255,255,255,0.08)',
                                border: item.label === 'Admin Mode'
                                  ? '1px solid rgba(186, 85, 255, 0.35)'
                                  : '1px solid rgba(255,255,255,0.1)',
                                color: item.label === 'Admin Mode' ? '#f0c6ff' : 'var(--color-text-primary)',
                                boxShadow: item.label === 'Admin Mode'
                                  ? '0 0 22px rgba(186, 85, 255, 0.55)'
                                  : '0 8px 20px rgba(0,0,0,0.3)',
                                backdropFilter: 'blur(10px)',
                                minWidth: 'max-content',
                              }}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
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
                  <div className="w-full max-w-4xl min-w-0 rounded-[2rem] border p-5 md:p-6" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="text-center mb-5">
                      <p className="text-xs tracking-[0.35em]" style={{ color: 'var(--color-text-muted)' }}>
                        SHOP BY CATEGORY
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-w-0">
                      {medusaCategories.map((cat, index) => (
                        <motion.button
                          key={cat.id}
                          className="group min-w-0 rounded-[1.6rem] px-4 py-5 text-center"
                          style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.05 * index }}
                          whileHover={{ y: -4, background: 'rgba(0,212,255,0.08)', borderColor: 'rgba(0,212,255,0.18)' }}
                          onClick={() => openCategory(cat.id)}
                        >
                          <span className="block text-lg md:text-2xl font-black tracking-[0.18em] leading-tight break-words" style={{ color: 'var(--color-text-primary)' }}>
                            {cat.title.toUpperCase()}
                          </span>
                          <span className="mt-3 block text-xl" style={{ color: 'var(--color-accent)' }}>
                            {['✦', '✶', '⟡'][index % 3]}
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
            style={{ background: 'rgba(8, 8, 13, 0.75)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setLoginOpen(false);
              setLoginError(null);
            }}
          >
            <motion.div
              className="w-full max-w-md rounded-3xl border p-6"
              style={{
                background: 'rgba(16, 16, 24, 0.96)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
              initial={{ y: 30, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--color-teal)' }}>
                  <UserRound size={18} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Login</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Access account, orders, and admin mode</p>
                </div>
              </div>

              <div className="flex gap-2 mb-5">
                <button
                  className="flex-1 rounded-2xl px-4 py-3 text-sm tracking-wider"
                  style={{
                    background: loginMode === 'google' ? 'rgba(0, 212, 255, 0.12)' : 'rgba(255,255,255,0.04)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid rgba(255,255,255,0.08)',
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
                  className="flex-1 rounded-2xl px-4 py-3 text-sm tracking-wider"
                  style={{
                    background: loginMode === 'email' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255,255,255,0.04)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onClick={() => {
                    setLoginMode('email');
                    setLoginError(null);
                  }}
                >
                  Email
                </button>
                <button
                  className="flex-1 rounded-2xl px-4 py-3 text-sm tracking-wider"
                  style={{
                    background: loginMode === 'phone' ? 'rgba(255, 26, 60, 0.12)' : 'rgba(255,255,255,0.04)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid rgba(255,255,255,0.08)',
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
                    className="w-full rounded-2xl px-4 py-3 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
                      color: 'var(--color-text-primary)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    onClick={() => {
                      setLoginOpen(false);
                      setLoginError(null);
                    }}
                  >
                    <span className="h-5 w-5 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">G</span>
                    Continue with Google
                  </button>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    Use your Google account for account access and admin mode.
                  </p>
                </div>
              ) : loginMode === 'email' ? (
                <div className="space-y-3">
                  <input
                    className="w-full rounded-2xl px-4 py-3 outline-none"
                    placeholder="Email address or account ID"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                  />
                  <input
                    className="w-full rounded-2xl px-4 py-3 outline-none"
                    placeholder="Password"
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                  />
                  <button
                    className="w-full rounded-2xl px-4 py-3 text-sm tracking-wider"
                    style={{
                      background: 'linear-gradient(135deg, #ff1a3c, #ff0044)',
                      color: 'white',
                    }}
                    onClick={handleEmailLogin}
                  >
                    Continue with Email
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      className="w-full rounded-2xl px-4 py-3 outline-none"
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
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-3 py-1 text-xs"
                      style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}
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
                          className="quorin-scrollbox absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-y-auto rounded-3xl border p-2"
                          style={{
                            maxHeight: 260,
                            background: 'rgba(14, 14, 20, 0.98)',
                            borderColor: 'rgba(255,255,255,0.08)',
                            boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                          }}
                          initial={{ opacity: 0, y: -6, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        >
                          {filteredCountries.length ? (
                            filteredCountries.map((country) => (
                              <button
                                key={country.label}
                                className="w-full rounded-2xl px-4 py-3 text-left transition-colors"
                                style={{
                                  color: country.label === selectedCountry.label ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                  background: country.label === selectedCountry.label ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
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
                      className="w-full rounded-2xl px-4 py-3 outline-none mt-2"
                      placeholder="Phone number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                    />
                  </div>

                  {!otpSent ? (
                    <button
                      className="w-full rounded-2xl px-4 py-3 text-sm tracking-wider"
                      style={{
                        background: 'linear-gradient(135deg, #ff1a3c, #ff0044)',
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
                      className="rounded-2xl p-4 border"
                      style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <motion.span
                          className="h-3 w-3 rounded-full"
                          style={{ background: 'var(--color-teal)' }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
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
                            className="h-14 rounded-2xl text-center text-lg outline-none"
                            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
                          />
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setOtpSent(false)}>
                          Change number
                        </button>
                        <button
                          className="px-5 py-3 rounded-full text-sm tracking-wider"
                          style={{
                            background: 'linear-gradient(135deg, #ff1a3c, #ff0044)',
                            color: 'white',
                          }}
                          onClick={() => {
                            const result = onAuthenticate(phoneNumber.trim(), 'Asdfg909');
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
                <p className="mt-4 text-sm" style={{ color: 'var(--color-accent)' }}>
                  {loginError}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-3">
                  <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => { setLoginOpen(false); setLoginError(null); }}>
                    Close
                  </button>
                <button
                  className="px-5 py-3 rounded-full text-sm tracking-wider"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--color-text-primary)',
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
            style={{ background: 'rgba(8, 8, 13, 0.78)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCustomRequestOpen(false)}
          >
            <motion.div
              className="w-full max-w-2xl rounded-3xl border p-6"
              style={{ background: 'rgba(16,16,24,0.98)', borderColor: 'rgba(255,255,255,0.08)' }}
              initial={{ y: 24, scale: 0.97 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 18, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs tracking-[0.3em] mb-4" style={{ background: 'rgba(0,212,255,0.08)', color: 'var(--color-teal)' }}>
                ⟡ CUSTOM REQUEST
              </div>
              <h3 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Message to seller
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Write exactly what you want, and keep it in the same {quorinData.brand} theme.
              </p>

              <textarea
                className="w-full min-h-44 rounded-3xl p-4 outline-none"
                placeholder="Describe your custom order here..."
                value={customRequestText}
                onChange={(e) => setCustomRequestText(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-primary)' }}
              />

              {customRequestSent && (
                <p className="mt-4 text-sm" style={{ color: 'var(--color-teal)' }}>
                  Request ready: {customRequestSent}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button className="text-sm" style={{ color: 'var(--color-text-muted)' }} onClick={() => setCustomRequestOpen(false)}>
                  Cancel
                </button>
                <button
                  className="px-5 py-3 rounded-full text-sm tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #ff1a3c, #ff0044)', color: 'white' }}
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
                  Send request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {accessNotice && (
          <motion.div
            className="fixed top-24 right-6 z-50 rounded-2xl border px-4 py-3"
            style={{ background: 'rgba(16,16,24,0.98)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--color-text-primary)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {accessNotice}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

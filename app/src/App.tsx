import { useState, useEffect, useRef, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Routes, Route, useLocation, useNavigate } from 'react-router';

import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import ProductPreview from '@/components/ProductPreview';
import CookieBanner from '@/components/CookieBanner';
import ProfileModal from '@/components/ProfileModal';
import AdminCenter, { type AdminTheme } from '@/components/AdminCenter';
import CustomCursor from '@/components/CustomCursor';
import Hero from '@/sections/Hero';
import CategorySection from '@/sections/CategorySection';
import WhyShop from '@/sections/WhyShop';
import HistorySection from '@/sections/History';
import Footer from '@/sections/Footer';
import ProductShowcase from '@/sections/ProductShowcase';
import CategoryPage from '@/pages/CategoryPage';
import XpPage from '@/pages/XpPage';
import { getProductId, quorinData, type Category, type Product } from '@/data/products';
import {
  demoAccounts,
  findAccountByIdentifierInAccounts,

  type AccountProfile,
  type AccountRecord,
} from '@/data/accounts';
import { getXpDiscountPercent, getXpLevel } from '@/data/xp';
import { getCheckoutGiftOffer, getGiftDiscountForProduct, getGiftLockKey, redeemCheckoutGift } from '@/data/gifts';
import {

  loadAccounts,
  loadCatalog,
  loadCheckoutLocks,
  loadClientFingerprint,
  loadCurrentAccountId,
  loadTheme,
  saveAccounts,
  saveCatalog,
  saveCheckoutLocks,
  saveCurrentAccountId,
  saveTheme,
} from '@/lib/quorinStore';
import { useMedusaCart } from '@/lib/useMedusaCart';
import { useMedusaCatalog } from '@/lib/useMedusaCatalog';
import { medusaApi } from '@/lib/medusa';

gsap.registerPlugin(ScrollTrigger);

const defaultTheme: AdminTheme = {
  brand: quorinData.brand,
  tagline: quorinData.tagline,
  accent: '#ff1a3c',
  teal: '#00d4ff',
  dominant: '#08080d',
  textPrimary: '#f0f0f5',
  textSecondary: '#8a8a9a',
  fontFamily: '"Copperplate", "Gill Sans", "Trebuchet MS", sans-serif',
};

const findProductById = (id: string) => {
  let found: Product | undefined;
  quorinData.categories.forEach((cat) => {
    cat.products.forEach((product) => {
      if (getProductId(product) === id) found = product;
    });
  });
  return found;
};

const getInitialPreviewProduct = () => {
  try {
    const match = window.location.pathname.match(/^\/product\/(.+)$/);
    if (!match) return null;
    return findProductById(decodeURIComponent(match[1])) ?? null;
  } catch {
    return null;
  }
};

interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

type UpdateOrderFn = (orderId: string, patch: Partial<AccountRecord['orders'][number]>) => void;

interface HomeScreenProps {
  currentAccount: AccountRecord | null;
  onUpdateOrder: UpdateOrderFn;
  categories: Category[];
  addToCart: (product: Product) => void;
  openPreview: (product: Product) => void;
}

function HomeScreen({ currentAccount, onUpdateOrder, categories, addToCart, openPreview }: HomeScreenProps) {
  return (
    <main>
      <Hero />
      <CategorySection />
      <WhyShop />
      <ProductShowcase categories={categories} onAddToCart={addToCart} onPreview={openPreview} />
      <HistorySection
        currentAccount={currentAccount}
        onUpdateOrder={onUpdateOrder}
      />
      <Footer />
    </main>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const [accounts, setAccounts] = useState<Record<string, AccountRecord>>(() => loadAccounts() ?? demoAccounts);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(() => loadCurrentAccountId());
  const [catalogVersion, setCatalogVersion] = useState(() => {
    const persistedCatalog = loadCatalog();
    if (persistedCatalog) {
      Object.assign(quorinData, persistedCatalog);
    }
    return 0;
  });
  const [theme, setTheme] = useState<AdminTheme>(() => loadTheme(defaultTheme));
  const [adminOpen, setAdminOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedGiftCartId, setSelectedGiftCartId] = useState<string | null>(null);
  const [clientFingerprint] = useState(() => loadClientFingerprint());
  const [checkoutLocks, setCheckoutLocks] = useState<Record<string, boolean>>(() => loadCheckoutLocks());
  const [localCartItems, setLocalCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('quorin.localCart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { categories: medusaCategories, refetch: refetchMedusaCatalog } = useMedusaCatalog();
  const { cart: medusaCart, cartId, addItem: medusaAddItem, updateItem: medusaUpdateItem, removeItem: medusaRemoveItem } = useMedusaCart();

  useEffect(() => {
    console.log('[App] medusaCategories.length =', medusaCategories.length, 'categories:', medusaCategories.map(c => c.id));
  }, [medusaCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('quorin.localCart', JSON.stringify(localCartItems));
    } catch {
      // Storage full or unavailable
    }
  }, [localCartItems]);

  const cartItems: CartItem[] = medusaCart.length > 0
    ? medusaCart.map((item) => ({
        cartId: item.lineId,
        name: item.name,
        variant: undefined,
        size: undefined,
        price: item.price,
        mrp: item.mrp,
        discount: '0',
        description: undefined,
        images: item.image ? [item.image] : [],
        features: undefined,
        tags: [],
        type: '',
        quantity: item.quantity,
      }))
    : localCartItems;

  const [previewProduct, setPreviewProduct] = useState<Product | null>(() => getInitialPreviewProduct());
  const [previewOpen, setPreviewOpen] = useState(() => Boolean(getInitialPreviewProduct()));
  const openedViaPushRef = useRef(false);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      allowNestedScroll: true,
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;

    if (adminOpen) {
      lenisRef.current?.stop();
    } else {
      lenisRef.current?.start();
    }

    return () => {
      lenisRef.current?.start();
    };
  }, [adminOpen, isLoading]);

  // Cart functions - Medusa-backed with fallback to local state
  const addToCart = useCallback((product: Product) => {
    if (cartId && medusaCategories.length > 0) {
      // Try Medusa first - find matching product by name
      const match = medusaCategories
        .flatMap((c) => c.products)
        .find((p) => p.name === product.name);
      if (match && match.id) {
        // Medusa products don't have variants in the mapped type, so use placeholder
        medusaAddItem(match.id, 'placeholder_variant', match.name, match.price, match.mrp);
        setCartOpen(true);
        window.dispatchEvent(new CustomEvent('quorin:addedToCart', { detail: product }));
        return;
      }
    }
    // Fallback: local cart
    const existing = localCartItems.find((item) => item.name === product.name && item.variant === product.variant);
    if (existing) {
      setLocalCartItems((prev) =>
        prev.map((item) =>
          item.cartId === existing.cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setLocalCartItems((prev) => [...prev, { ...product, cartId: `${product.name}-${Date.now()}`, quantity: 1 }]);
    }
    setCartOpen(true);
    window.dispatchEvent(new CustomEvent('quorin:addedToCart', { detail: product }));
  }, [cartId, medusaCategories, medusaAddItem, localCartItems]);

  const updateQuantity = useCallback((cartIdKey: string, quantity: number) => {
    // Check if this is a Medusa cart item
    const medusaItem = medusaCart.find((item) => item.lineId === cartIdKey);
    if (medusaItem) {
      medusaUpdateItem(cartIdKey, quantity);
      return;
    }
    // Fallback: local cart
    if (quantity <= 0) {
      setLocalCartItems((prev) => prev.filter((item) => item.cartId !== cartIdKey));
    } else {
      setLocalCartItems((prev) =>
        prev.map((item) => (item.cartId === cartIdKey ? { ...item, quantity } : item))
      );
    }
  }, [medusaCart, medusaUpdateItem]);

  const removeFromCart = useCallback((cartIdKey: string) => {
    const medusaItem = medusaCart.find((item) => item.lineId === cartIdKey);
    if (medusaItem) {
      medusaRemoveItem(cartIdKey);
      return;
    }
    setLocalCartItems((prev) => prev.filter((item) => item.cartId !== cartIdKey));
  }, [medusaCart, medusaRemoveItem]);

  const cartCount = medusaCart.length > 0
    ? medusaCart.reduce((sum, item) => sum + item.quantity, 0)
    : localCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const currentAccount = currentAccountId ? accounts[currentAccountId] ?? null : null;
  const currentOrders = currentAccount?.orders ?? [];
  const currentSpend = currentOrders.reduce(
    (sum, order) => sum + (order.status === 'returned' ? 0 : (order.product.price ?? 0)),
    0
  );
  const xpLevel = getXpLevel(currentSpend);
  const xpDiscountPercent = getXpDiscountPercent(xpLevel);
  const giftOffer = getCheckoutGiftOffer(currentAccount, xpLevel, clientFingerprint, checkoutLocks);
  const resolvedSelectedGiftCartId = giftOffer && cartItems.length > 0
    ? (cartItems.some((item) => item.cartId === selectedGiftCartId) ? selectedGiftCartId : cartItems[0]?.cartId ?? null)
    : null;
  const selectedGiftItem = giftOffer
    ? cartItems.find((item) => item.cartId === resolvedSelectedGiftCartId) ?? null
    : null;
  const selectedGiftDiscount = giftOffer && selectedGiftItem ? getGiftDiscountForProduct(selectedGiftItem) : 0;

  useEffect(() => {
    saveAccounts(accounts);
  }, [accounts]);

  useEffect(() => {
    saveCurrentAccountId(currentAccountId);
  }, [currentAccountId]);

  useEffect(() => {
    saveCheckoutLocks(checkoutLocks);
  }, [checkoutLocks]);

  useEffect(() => {
    saveCatalog(quorinData);
  }, [catalogVersion]);

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-teal', theme.teal);
    root.style.setProperty('--color-dominant', theme.dominant);
    root.style.setProperty('--color-text-primary', theme.textPrimary);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
  }, [theme.accent, theme.teal, theme.dominant, theme.textPrimary, theme.textSecondary]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontFamily = theme.fontFamily;
    document.body.style.fontFamily = theme.fontFamily;
  }, [theme.fontFamily]);

  const syncCatalogToMedusa = useCallback(async () => {
    try {
      const existing = await medusaApi.getProducts({ limit: 200 });
      const existingMap = new Map<string, unknown>();
      existing?.products?.forEach((p: Record<string, unknown>) => {
        existingMap.set(p.title as string, p);
      });

      for (const category of quorinData.categories) {
        for (const product of category.products) {
          const name = product.name;
          const existing = existingMap.get(name) as Record<string, unknown> | undefined;

          const productData: Record<string, unknown> = {
            title: name,
            description: (product.description as string) ?? '',
            status: 'publishable',
          };

          if (product.images && product.images.length > 0) {
            productData.thumbnail = product.images[0] as string;
          }

          if (existing?.id) {
            await medusaApi.updateProduct(existing.id as string, productData);
          } else {
            await medusaApi.createProduct(productData);
          }
        }
      }
    } catch (err) {
      console.warn('Catalog sync to Medusa failed (backend may be offline):', err);
    }
  }, []);

  const updateCatalog = useCallback(async (mutator: (catalog: typeof quorinData) => void) => {
    const nextCatalog = JSON.parse(JSON.stringify(quorinData)) as typeof quorinData;
    mutator(nextCatalog);
    Object.assign(quorinData, nextCatalog);
    setCatalogVersion((value) => value + 1);
    await syncCatalogToMedusa();
    refetchMedusaCatalog();
  }, [syncCatalogToMedusa, refetchMedusaCatalog]);

  const updateTheme = useCallback((nextTheme: AdminTheme) => {
    quorinData.brand = nextTheme.brand;
    quorinData.tagline = nextTheme.tagline;
    setTheme(nextTheme);
  }, []);

  const toggleAdminMode = useCallback(() => {
    if (currentAccount?.profile.role !== 'admin') return;
    setAdminOpen((value) => !value);
  }, [currentAccount]);

  const signOut = () => {
    setCurrentAccountId(null);
    setProfileOpen(false);
    setAdminOpen(false);
  };

  const saveProfile = (profile: AccountProfile) => {
    if (!currentAccountId) return { ok: false, message: 'No active account.' };
    const existing = accounts[currentAccountId];
    if (!existing) return { ok: false, message: 'Account not found.' };

    const currentYear = new Date().getFullYear();
    const birthdayChanged = (existing.profile.birthday ?? '') !== (profile.birthday ?? '');
    if (birthdayChanged && existing.giftUsage.birthdayChangeYears.includes(currentYear)) {
      return { ok: false, message: 'Birthday can only be changed once per year.' };
    }

    setAccounts((prev) => ({
      ...prev,
      [currentAccountId]: {
        ...prev[currentAccountId],
        profile,
        giftUsage: {
          ...prev[currentAccountId].giftUsage,
          birthdayChangeYears: birthdayChanged
            ? [...prev[currentAccountId].giftUsage.birthdayChangeYears, currentYear]
            : prev[currentAccountId].giftUsage.birthdayChangeYears,
        },
      },
    }));
    return { ok: true };
  };

  const updateCurrentOrder = (orderId: string, patch: Partial<AccountRecord['orders'][number]>) => {
    if (!currentAccountId) return;

    setAccounts((prev) => {
      const account = prev[currentAccountId];
      if (!account) return prev;

      return {
        ...prev,
        [currentAccountId]: {
          ...account,
          orders: account.orders.map((order) => (order.id === orderId ? { ...order, ...patch } : order)),
        },
      };
    });
  };

  const handleCheckout = () => {
    if (!currentAccount || !giftOffer) {
      setCartOpen(false);
      return;
    }

    const lockKey = getGiftLockKey(giftOffer.source, clientFingerprint);

    setAccounts((prev) => {
      const account = prev[currentAccount.profile.id];
      if (!account) return prev;

      return {
        ...prev,
        [currentAccount.profile.id]: redeemCheckoutGift(account, giftOffer),
      };
    });

    setCheckoutLocks((prev) => ({
      ...prev,
      [lockKey]: true,
    }));

    setCartOpen(false);
  };

  const authenticate = useCallback((identifier: string, password: string) => {
    // Try local accounts first (fast, sync)
    const account = findAccountByIdentifierInAccounts(accounts, identifier) ?? findAccountByIdentifierInAccounts(demoAccounts, identifier);

    if (!account || account.password !== password) {
      return { ok: false, message: 'Invalid account or password.' };
    }

    setAccounts((prev) => ({
      ...prev,
      [account.profile.id]: prev[account.profile.id] ?? account,
    }));
    setCurrentAccountId(account.profile.id);

    // Try Medusa auth in background (non-blocking)
    medusaApi.authenticate(identifier, password).catch(() => {
      // Medusa backend may be offline; local auth succeeded
    });

    return { ok: true, account };
  }, [accounts]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [location.pathname]);

  // Scroll expand animations with GSAP
  useEffect(() => {
    if (isLoading) return;

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      // Scroll-expand elements
      gsap.utils.toArray<HTMLElement>('.scroll-expand').forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.85, opacity: 0.5 },
          {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'top 40%',
              scrub: 1,
            },
          }
        );
      });

      // Section reveals
      gsap.utils.toArray<HTMLElement>('.section-reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // Parallax images
      gsap.utils.toArray<HTMLElement>('.parallax-bg').forEach((el) => {
        gsap.to(el, {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Preview helpers: open/close and history handling
  useEffect(() => {
    const onPop = () => {
      // if the URL now points to a product, open it, otherwise close preview
      try {
        const m = window.location.pathname.match(/^\/product\/(.+)$/);
        if (m) {
          const id = decodeURIComponent(m[1]);
          const found = findProductById(id);
          if (found) {
            setPreviewProduct(found);
            setPreviewOpen(true);
            openedViaPushRef.current = false; // navigation via history
            return;
          }
        }
      } catch { /* ignore */ }

      // otherwise close
      setPreviewOpen(false);
      setPreviewProduct(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openPreview = (product: Product) => {
    try {
      const productId = getProductId(product);
      const url = `/product/${encodeURIComponent(productId)}`;
      window.history.pushState({ preview: productId }, '', url);
      openedViaPushRef.current = true;
    } catch {
      window.location.hash = `preview-${getProductId(product)}`;
      openedViaPushRef.current = true;
    }
    setPreviewProduct(product);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    if (openedViaPushRef.current) {
      try { window.history.back(); } catch { /* ignore */ }
    } else {
      try { window.history.replaceState({}, '', '/'); } catch { /* ignore */ }
    }
    setPreviewOpen(false);
    setPreviewProduct(null);
    openedViaPushRef.current = false;
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <div
          className="relative"
          style={{
            '--color-dominant': theme.dominant,
            '--color-accent': theme.accent,
            '--color-teal': theme.teal,
            '--color-text-primary': theme.textPrimary,
            '--color-text-secondary': theme.textSecondary,
            fontFamily: theme.fontFamily,
          } as CSSProperties}
        >
          {/* Custom cursor */}
          <CustomCursor />

          {/* Navigation */}
          <Navigation
            cartCount={cartCount}
            onCartClick={() => setCartOpen(true)}
            currentAccount={currentAccount}
            onAuthenticate={authenticate}
            onOpenProfile={() => setProfileOpen(true)}
            onToggleAdminMode={toggleAdminMode}
            onHomeClick={() => {
              closePreview();
              navigate('/');
            }}
          />

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            xpLevel={xpLevel}
            xpDiscountPercent={xpDiscountPercent}
            giftOffer={giftOffer}
            selectedGiftCartId={resolvedSelectedGiftCartId}
            onSelectGiftCartId={setSelectedGiftCartId}
            selectedGiftDiscount={selectedGiftDiscount}
            onCheckout={handleCheckout}
          />

          {/* Main Content */}
          <Routes>
            <Route path="/" element={<HomeScreen currentAccount={currentAccount} onUpdateOrder={updateCurrentOrder} categories={medusaCategories.length > 0 ? medusaCategories : quorinData.categories} addToCart={addToCart} openPreview={openPreview} />} />
            <Route
              path="/category/:categoryId"
              element={<CategoryPage onAddToCart={addToCart} onPreview={openPreview} categories={medusaCategories.length > 0 ? medusaCategories : quorinData.categories} />}
            />
            <Route
              path="/xp"
              element={<XpPage currentAccount={currentAccount} onBackHome={() => navigate('/')} />}
            />
            <Route path="*" element={<HomeScreen currentAccount={currentAccount} onUpdateOrder={updateCurrentOrder} categories={medusaCategories.length > 0 ? medusaCategories : quorinData.categories} addToCart={addToCart} openPreview={openPreview} />} />
          </Routes>

          {/* Product preview modal */}
          <ProductPreview product={previewProduct} isOpen={previewOpen} onClose={closePreview} />

          {/* Cookie banner */}
          <CookieBanner />

          <AdminCenter
            isOpen={adminOpen && currentAccount?.profile.role === 'admin'}
            onClose={() => setAdminOpen(false)}
            onThemeChange={updateTheme}
            onCatalogUpdate={updateCatalog}
          />

          <ProfileModal
            isOpen={profileOpen && !!currentAccount}
            profile={currentAccount?.profile ?? null}
            orderCount={currentOrders.length}
            onClose={() => setProfileOpen(false)}
            onSave={saveProfile}
            onSignOut={signOut}
          />

        </div>
      )}
    </>
  );
}

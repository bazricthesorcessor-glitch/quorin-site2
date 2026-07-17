import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Routes, Route, useLocation, useNavigate } from 'react-router';

import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';
import MobileProductCard from '@/components/MobileProductCard';
import MobileNavigation from '@/components/MobileNavigation';
import CartDrawer from '@/components/CartDrawer';
import ProductPreview from '@/components/ProductPreview';
import CookieBanner from '@/components/CookieBanner';
import ProfileModal from '@/components/ProfileModal';
import AdminCenter, { type AdminTheme } from '@/components/AdminCenter';
import CustomCursor from '@/components/CustomCursor';
import Hero from '@/sections/Hero';
import Footer from '@/sections/Footer';
import ProductShowcase from '@/sections/ProductShowcase';
import CategoryPage from '@/pages/CategoryPage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import XpPage from '@/pages/XpPage';
import WishlistPage from '@/pages/WishlistPage';
import SearchPage from '@/pages/SearchPage';
import NewArrivalsPage from '@/pages/NewArrivalsPage';
import ToolsPage from '@/pages/ToolsPage';
import CraftSuppliesPage from '@/pages/CraftSuppliesPage';
import KitsPage from '@/pages/KitsPage';

import AuthGoogleCallback from '@/pages/AuthGoogleCallback';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from '@/components/ui/sonner';
import { Search, ArrowRight } from 'lucide-react';
import { getProductId, quorinData, type Category, type Product } from '@/data/products';
import {
  findAccountByIdentifierInAccounts,
  type AccountOrder,
  type AccountProfile,
  type AccountRecord,
} from '@/data/accounts';
import { getXpDiscountPercent, getXpLevel } from '@/data/xp';
import { getCheckoutGiftOffer, getGiftDiscountForProduct, getGiftLockKey, redeemCheckoutGift } from '@/data/gifts';
import { getCssVar } from '@/lib/theme';
import {
  appendActivityLog,
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
import { FullProductModeProvider, useFullProductMode } from '@/contexts/FullProductModeContext';
import FullProductOverlay from '@/components/FullProductOverlay';
import { useMedusaCart } from '@/lib/useMedusaCart';
import { useMedusaCatalog } from '@/lib/useMedusaCatalog';
import { medusaApi } from '@/lib/medusa';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/admin/AdminGuard';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { AdminProductsPage } from '@/pages/admin/AdminProductsPage';
import {
  AdminCategoriesPage, AdminCollectionsPage, AdminOrdersPage, AdminCustomersPage,
  AdminInventoryPage, AdminCouponsPage, AdminAnalyticsPage, AdminMediaPage,
  AdminSettingsPage, AdminAdminsPage, AdminActivityPage,
} from '@/pages/admin/AdminPages';

gsap.registerPlugin(ScrollTrigger);

const defaultTheme: AdminTheme = {
  brand: quorinData.brand,
  tagline: quorinData.tagline,
  
  /* Colors */
  background: getCssVar('--color-background') || '#F8F5EF',
  surface: getCssVar('--color-surface') || '#FFFDF7',
  surfaceHover: getCssVar('--color-surface-hover') || 'rgba(255, 253, 247, 0.6)',
  ivory: getCssVar('--color-ivory') || '#FDF8F0',
  structure: getCssVar('--color-structure') || '#2A2118',
  structureDark: getCssVar('--color-structure-dark') || '#1F1812',
  structureLight: getCssVar('--color-structure-light') || '#3D2B1F',
  action: getCssVar('--color-action') || '#C9A96E',
  actionBright: getCssVar('--color-action-bright') || '#D8B97A',
  accent: getCssVar('--color-action') || '#C9A96E',
  accentSoft: getCssVar('--color-accent-soft') || 'rgba(201, 169, 110, 0.1)',
  accentMedium: getCssVar('--color-accent-medium') || 'rgba(201, 169, 110, 0.15)',
  logoColor: getCssVar('--color-logo') || '#C89B52',
  decorative: getCssVar('--color-decorative') || '#BFC2C8',
  
  /* Text */
  textPrimary: getCssVar('--color-text-primary') || '#1A1410',
  textOnCream: getCssVar('--color-text-on-cream') || '#1A1410',
  textOnWhite: getCssVar('--color-text-on-white') || '#1A1410',
  textSecondary: getCssVar('--color-text-secondary') || '#3D2B1F',
  textMuted: getCssVar('--color-text-muted') || '#5B5045',
  
  /* Borders & Inputs */
  border: getCssVar('--color-border') || '#E8E2D9',
  borderSubtle: getCssVar('--color-border-subtle') || 'rgba(232, 226, 217, 0.5)',
  borderHover: getCssVar('--color-border-hover') || '#C9A96E',
  input: getCssVar('--color-input') || '#FFFDF7',
  dominant: getCssVar('--color-structure') || '#2A2118',
  
  /* Shadows */
  shadowCard: getCssVar('shadow-card') || 'rgba(42, 33, 24, 0.06)',
  shadowHover: getCssVar('shadow-hover') || 'rgba(201, 169, 110, 0.12)',
  shadowDeep: getCssVar('shadow-deep') || 'rgba(42, 33, 24, 0.1)',
  
  /* Halos */
  haloGold: getCssVar('halo-gold') || 'rgba(201, 169, 110, 0.2)',
  haloGoldStrong: getCssVar('halo-gold-strong') || 'rgba(201, 169, 110, 0.3)',
  
  /* Status */
  destructive: getCssVar('--color-destructive') || '#8B4513',
  destructiveHover: getCssVar('--color-destructive-hover') || '#A0522D',
  success: getCssVar('--color-success') || '#6B8E5A',
  
  /* Typography */
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

interface CartItem extends Omit<Product, 'images'> {
  cartId: string;
  quantity: number;
  images: string[];
}

type UpdateOrderFn = (orderId: string, patch: Partial<AccountRecord['orders'][number]>) => void;

interface HomeScreenProps {
  currentAccount: AccountRecord | null;
  onUpdateOrder: UpdateOrderFn;
  categories: Category[];
  cartCount: number;
  productsById: Map<string, Product>;
  addToCart: (product: Product) => void;
  openPreview: (product: Product) => void;
  navigateToProduct?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  currentAccountWishlist?: string[];
}

const getCategoryPreviewImage = (category: Category) => {
  const product = category.products[0];
  return product?.images_local?.[0] ?? product?.images?.[0] ?? '';
};

function HomeScreen({ currentAccount, onUpdateOrder, categories, cartCount, productsById, addToCart, openPreview, navigateToProduct, onToggleWishlist, currentAccountWishlist }: HomeScreenProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const topCategories = categories.slice(0, 3);

  if (isMobile) {
    return (
      <main>
        <Hero />
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Hero />
      <Footer />
    </main>
  );
}

/**
 * This component sits inside FullProductModeProvider so it can access open/close.
 * It handles:
 *  1. Opening full product mode from ProductPreview (F key, double-click, expand button)
 *  2. Keeping preview + full-product in sync
 */
function FullProductManager({
  previewProduct,
  previewOpen,
}: {
  previewProduct: Product | null;
  previewOpen: boolean;
}) {
  const { open, isFullProductMode } = useFullProductMode();

  // When preview opens for a product, also open full-product mode if user is already in it
  const prevPreviewOpenRef = useRef(previewOpen);
  useEffect(() => {
    if (previewOpen && prevPreviewOpenRef.current === false) {
      // Preview just opened – do nothing special; preview stays as overlay
    }
    prevPreviewOpenRef.current = previewOpen;
  }, [previewOpen]);

  // Keyboard: F in preview → full product mode
  useEffect(() => {
    if (!previewOpen || !previewProduct) return;
    const handler = (e: KeyboardEvent) => {
      // Don't fire if user is in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        open(getProductId(previewProduct));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [previewOpen, previewProduct, open]);

  // Listen for explicit requests to open full-screen product mode
  // (e.g. the expand button in ProductPreview / ProductDetailPage).
  useEffect(() => {
    const onRequest = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (detail) open(detail);
    };
    window.addEventListener('quorin:openFullProduct', onRequest as EventListener);
    return () => window.removeEventListener('quorin:openFullProduct', onRequest as EventListener);
  }, [open]);

  // Close full product → also close preview
  useEffect(() => {
    if (!isFullProductMode && previewOpen) {
      // full product was closed; close preview too
      // handled by parent via closePreview
    }
  }, [isFullProductMode, previewOpen]);

  return null; // no visual output
}

/**
 * Wrapper that passes preview state down to FullProductManager.
 * This is needed because the manager lives inside the provider but needs
 * to react to preview opens from outside.
 */
function FullProductSync({
  previewProduct,
  previewOpen,
  categories,
  productsById,
  addToCart,
  onToggleWishlist,
  currentAccountWishlist,
  currentOrders,
}: {
  previewProduct: Product | null;
  previewOpen: boolean;
  categories: Category[];
  productsById: Map<string, Product>;
  addToCart: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  currentAccountWishlist?: string[];
  currentOrders: AccountOrder[];
}) {
  const { isFullProductMode } = useFullProductMode();
  const navigate = useNavigate();

  // FullProductOverlay renders the full-page experience
  if (!isFullProductMode) return null;

  const activeId = previewProduct ? getProductId(previewProduct) : '';
  const inWishlist = activeId ? currentAccountWishlist?.includes(activeId) : false;
  const canReview = !!activeId && currentOrders.some((o) => o.productId === activeId && o.status === 'delivered');

  return (
    <FullProductOverlay
      productId={activeId}
      categories={categories}
      productsById={productsById}
      onAddToCart={addToCart}
      onToggleWishlist={onToggleWishlist}
      isInWishlist={inWishlist}
      onClose={() => {
        navigate(-1);
      }}
      canReview={canReview}
    />
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const [accounts, setAccounts] = useState<Record<string, AccountRecord>>(() => loadAccounts() ?? {});
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
    const handleOpenCart = () => setCartOpen(true);
    window.addEventListener('quorin:openCart', handleOpenCart);
    return () => window.removeEventListener('quorin:openCart', handleOpenCart);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('quorin.localCart', JSON.stringify(localCartItems));
    } catch {
      // Storage full or unavailable
    }
  }, [localCartItems]);

  const cartItems: CartItem[] = medusaCart.length > 0
    ? medusaCart.map((item) => ({
        id: item.lineId,
        cartId: item.lineId,
        name: item.name,
        variant: undefined,
        size: undefined,
        price: item.price,
        mrp: item.mrp,
        discount: '0',
        description: '',
        images: item.image ? [item.image] : [],
        features: undefined,
        tags: [],
        type: '',
        category: '',
        quantity: item.quantity,
      }))
    : localCartItems;

  const [previewProduct, setPreviewProduct] = useState<Product | null>(() => getInitialPreviewProduct());
  const [previewOpen, setPreviewOpen] = useState(() => Boolean(getInitialPreviewProduct()));

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
      if (match && match.variantId) {
        medusaAddItem(match.variantId, match.variantId, match.name, match.price, match.mrp);
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

  // Wishlist state & toggle
  const toggleWishlist = useCallback((productId: string) => {
    if (!currentAccountId) return;
    setAccounts((prev) => {
      const account = prev[currentAccountId];
      if (!account) return prev;
      const wishlist = account.wishlist ?? [];
      const exists = wishlist.includes(productId);
      const updated = exists
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId];
      // Sync to Medusa customer metadata in background
      medusaApi.updateCustomer({ metadata: { wishlist: updated } }).catch(() => {});
      return {
        ...prev,
        [currentAccountId]: {
          ...account,
          wishlist: updated,
        },
      };
    });
  }, [currentAccountId]);

  const cartCount = medusaCart.length > 0
    ? medusaCart.reduce((sum, item) => sum + item.quantity, 0)
    : localCartItems.reduce((sum, item) => sum + item.quantity, 0);

  const activeCategories = medusaCategories.length > 0 ? medusaCategories : quorinData.categories;
  const productsById = useMemo(() => {
    const map = new Map<string, Product>();
    activeCategories.forEach((cat) => {
      cat.products.forEach((p) => map.set(p.id, p));
    });
    return map;
  }, [activeCategories]);

  const resolveOrderPrice = (order: { productId: string; snapshot?: { price?: number } }): number => {
    const live = productsById.get(order.productId);
    return live?.price ?? order.snapshot?.price ?? 0;
  };

  const currentAccount = currentAccountId ? accounts[currentAccountId] ?? null : null;
  const currentOrders = currentAccount?.orders ?? [];
  const currentSpend = useMemo(
    () => currentOrders.reduce(
      (sum, order) => sum + (order.status === 'returned' ? 0 : resolveOrderPrice(order)),
      0
    ),
    [currentOrders, resolveOrderPrice]
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
    
    /* Colors */
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--color-surface-hover', theme.surfaceHover);
    root.style.setProperty('--color-ivory', theme.ivory);
    root.style.setProperty('--color-structure', theme.structure);
    root.style.setProperty('--color-structure-dark', theme.structureDark);
    root.style.setProperty('--color-structure-light', theme.structureLight);
    root.style.setProperty('--color-action', theme.action);
    root.style.setProperty('--color-action-bright', theme.actionBright);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-soft', theme.accentSoft);
    root.style.setProperty('--color-accent-medium', theme.accentMedium);
    root.style.setProperty('--color-logo', theme.logoColor);
    root.style.setProperty('--color-decorative', theme.decorative);
    
    /* Text */
    root.style.setProperty('--color-text-primary', theme.textPrimary);
    root.style.setProperty('--color-text-on-cream', theme.textOnCream);
    root.style.setProperty('--color-text-on-white', theme.textOnWhite);
    root.style.setProperty('--color-text-secondary', theme.textSecondary);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    
    /* Borders & Inputs */
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-border-subtle', theme.borderSubtle);
    root.style.setProperty('--color-border-hover', theme.borderHover);
    root.style.setProperty('--color-input', theme.input);
    
    /* Shadows */
    root.style.setProperty('--shadow-card', theme.shadowCard);
    root.style.setProperty('--shadow-hover', theme.shadowHover);
    root.style.setProperty('--shadow-deep', theme.shadowDeep);
    
    /* Halos */
    root.style.setProperty('--halo-gold', theme.haloGold);
    root.style.setProperty('--halo-gold-strong', theme.haloGoldStrong);
    
    /* Status */
    root.style.setProperty('--color-destructive', theme.destructive);
    root.style.setProperty('--color-destructive-hover', theme.destructiveHover);
    root.style.setProperty('--color-success', theme.success);
    
  }, [
    theme.background, theme.surface, theme.surfaceHover, theme.ivory,
    theme.structure, theme.structureDark, theme.structureLight,
    theme.action, theme.actionBright, theme.accent, theme.accentSoft, theme.accentMedium,
    theme.logoColor, theme.decorative,
    theme.textPrimary, theme.textOnCream, theme.textOnWhite,
    theme.textSecondary, theme.textMuted,
    theme.border, theme.borderSubtle, theme.borderHover, theme.input,
    theme.shadowCard, theme.shadowHover, theme.shadowDeep,
    theme.haloGold, theme.haloGoldStrong,
    theme.destructive, theme.destructiveHover, theme.success,
  ]);

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
            productData.thumbnail = typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url || '/product-resin-kit.webp';
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
    appendActivityLog({
      type: 'catalog',
      title: 'Catalog updated',
      detail: `Catalog now includes ${nextCatalog.categories.length} categories.`,
      actor: 'admin',
    });
    await syncCatalogToMedusa();
    refetchMedusaCatalog();
  }, [syncCatalogToMedusa, refetchMedusaCatalog]);

  const updateTheme = useCallback((nextTheme: AdminTheme) => {
    quorinData.brand = nextTheme.brand;
    quorinData.tagline = nextTheme.tagline;
    setTheme(nextTheme);
    appendActivityLog({
      type: 'theme',
      title: 'Brand theme updated',
      detail: `${nextTheme.brand} visual settings saved.`,
      actor: 'admin',
    });
  }, []);

  const toggleAdminMode = useCallback(() => {
    if (currentAccount?.profile.role !== 'admin') return;
    setAdminOpen((value) => !value);
  }, [currentAccount]);

  const signOut = () => {
    if (currentAccount) {
      appendActivityLog({
        type: 'auth',
        title: 'Customer signed out',
        detail: currentAccount.profile.displayName,
        actor: currentAccount.profile.email,
      });
    }
    setCurrentAccountId(null);
    setProfileOpen(false);
    setAdminOpen(false);
    medusaApi.clearAuth();
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
    appendActivityLog({
      type: 'profile',
      title: 'Profile updated',
      detail: profile.displayName,
      actor: profile.email,
    });
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
    appendActivityLog({
      type: 'order',
      title: 'Order updated',
      detail: orderId,
      actor: currentAccount?.profile.email,
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

    appendActivityLog({
      type: 'checkout',
      title: 'Checkout gift redeemed',
      detail: giftOffer.source,
      actor: currentAccount.profile.email,
    });

    setCartOpen(false);
  };

  const authenticate = useCallback(async (identifier: string, password: string) => {
    // Try Medusa backend auth
    try {
      await medusaApi.authenticate(identifier, password);
    } catch {
      // Check local accounts as fallback
      const account = findAccountByIdentifierInAccounts(accounts, identifier);
      if (account && account.password === password) {
        setCurrentAccountId(account.profile.id);
        appendActivityLog({
          type: 'auth',
          title: 'Customer signed in',
          detail: account.profile.displayName,
          actor: account.profile.email,
        });
        return { ok: true };
      }
      return { ok: false, message: 'Invalid email or password.' };
    }

    // Medusa auth succeeded — create/update local account from Medusa data
    try {
      const customer = await medusaApi.getCustomer();
      if (customer) {
        const id = customer.id;
        const existing = accounts[id];
        const meta = customer.metadata ?? {};
        setAccounts((prev) => ({
          ...prev,
          [id]: {
            password,
            profile: {
              id,
              role: 'customer' as const,
              displayName: (meta.displayName ?? [customer.first_name, customer.last_name].filter(Boolean).join(' ')) || customer.email,
              email: customer.email,
              phone: customer.phone ?? meta.phone ?? '',
              address: meta.address ?? '',
              city: meta.city ?? '',
              bio: meta.bio ?? '',
            },
            orders: meta.orders ?? existing?.orders ?? [],
            giftUsage: meta.giftUsage ?? existing?.giftUsage ?? {
              level10GiftRedeemed: false,
              birthdayGiftYears: [],
              birthdayChangeYears: [],
            },
            wishlist: meta.wishlist ?? existing?.wishlist ?? [],
          },
        }));
        setCurrentAccountId(id);
        appendActivityLog({
          type: 'auth',
          title: 'Medusa customer linked',
          detail: customer.email,
          actor: customer.email,
        });
      }
    } catch {
      // Medusa customer fetch failed
    }

    return { ok: true };
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

  // Preview helpers: open/close
  useEffect(() => {
    const onPop = () => {
      setPreviewOpen(false);
      setPreviewProduct(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openPreview = (product: Product) => {
    setPreviewProduct(product);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewProduct(null);
  };

  return (
    <FullProductModeProvider>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <>
        {location.pathname.startsWith('/admin') ? (
          <AdminAuthProvider>
            <Routes>
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route
                path="/admin"
                element={<AdminGuard><AdminLayout /></AdminGuard>}
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="collections" element={<AdminCollectionsPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="customers" element={<AdminCustomersPage />} />
                <Route path="coupons" element={<AdminCouponsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
                <Route path="admins" element={<AdminAdminsPage />} />
                <Route path="activity" element={<AdminActivityPage />} />
              </Route>
            </Routes>
          </AdminAuthProvider>
        ) : (
        <div
          className="relative"
          style={{
            '--color-background': theme.background,
            '--color-surface': theme.surface,
            '--color-ivory': theme.ivory,
            '--color-structure': theme.structure,
            '--color-action': theme.action,
            '--color-accent': theme.accent,
            '--color-decorative': theme.decorative,
            '--color-text-primary': theme.textPrimary,
            '--color-text-secondary': theme.textSecondary,
            '--color-text-muted': theme.textMuted,
            '--color-border': theme.border,
            '--color-border-subtle': theme.borderSubtle,
            '--color-logo': theme.logoColor,
            fontFamily: theme.fontFamily,
          } as CSSProperties}
        >
          {/* Custom cursor - disabled */}
          {/* <CustomCursor /> */}

          <Toaster position="top-center" />

          {/* Navigation - hidden on search page */}
          {location.pathname !== '/search' && (
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
          )}

          {isMobile && (
            <MobileNavigation
              cartCount={cartCount}
              onCartClick={() => setCartOpen(true)}
              currentAccount={currentAccount}
              onOpenProfile={() => setProfileOpen(true)}
              onOpenLogin={() => window.dispatchEvent(new CustomEvent('quorin:openLogin'))}
            />
          )}

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
            <Route path="/auth/google/callback" element={<AuthGoogleCallback />} />
            <Route path="/" element={<HomeScreen currentAccount={currentAccount} onUpdateOrder={updateCurrentOrder} categories={activeCategories} cartCount={cartCount} productsById={productsById} addToCart={addToCart} openPreview={openPreview} onToggleWishlist={toggleWishlist} currentAccountWishlist={currentAccount?.wishlist} />} />
            <Route
              path="/product/:productId"
              element={<ProductDetailPage currentAccount={currentAccount} onAddToCart={addToCart} openPreview={openPreview} onToggleWishlist={toggleWishlist} categories={activeCategories} />}
            />
            <Route
              path="/category/:categoryId"
              element={<CategoryPage onAddToCart={addToCart} onPreview={openPreview} categories={activeCategories} onToggleWishlist={(p) => toggleWishlist(getProductId(p))} currentAccountWishlist={currentAccount?.wishlist} />}
            />
            <Route
              path="/xp"
              element={<XpPage currentAccount={currentAccount} onBackHome={() => navigate('/')} resolveOrderPrice={resolveOrderPrice} />}
            />
            <Route
              path="/wishlist"
              element={<WishlistPage currentAccount={currentAccount} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} categories={activeCategories} />}
            />
            <Route path="/search" element={<SearchPage onAddToCart={addToCart} onToggleWishlist={(p) => toggleWishlist(getProductId(p))} currentAccountWishlist={currentAccount?.wishlist} />} />
            <Route path="/new-arrivals" element={<NewArrivalsPage onAddToCart={addToCart} onPreview={openPreview} categories={activeCategories} />} />
            <Route path="/tools" element={<ToolsPage onAddToCart={addToCart} onPreview={openPreview} categories={activeCategories} />} />
            <Route path="/craft-supplies" element={<CraftSuppliesPage onAddToCart={addToCart} onPreview={openPreview} categories={activeCategories} />} />
            <Route path="/kits" element={<KitsPage onAddToCart={addToCart} onPreview={openPreview} categories={activeCategories} />} />

            <Route path="*" element={<HomeScreen currentAccount={currentAccount} onUpdateOrder={updateCurrentOrder} categories={activeCategories} cartCount={cartCount} productsById={productsById} addToCart={addToCart} openPreview={openPreview} onToggleWishlist={toggleWishlist} currentAccountWishlist={currentAccount?.wishlist} />} />
          </Routes>

          <ProductPreview
            product={previewProduct}
            isOpen={previewOpen && !isMobile}
            onClose={closePreview}
            onAddToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            isInWishlist={currentAccount?.wishlist?.includes(previewProduct ? getProductId(previewProduct) : '') ?? false}
            onOpenFullProduct={(id) => {
              setPreviewOpen(false);
              setPreviewProduct(null);
              navigate(`/product/${id}`, { replace: true });
            }}
          />

          {/* Full Product Mode sync & overlay */}
          <FullProductManager previewProduct={previewProduct} previewOpen={previewOpen} />
          <FullProductSync
            previewProduct={previewProduct}
            previewOpen={previewOpen}
            categories={activeCategories}
            productsById={productsById}
            addToCart={addToCart}
            onToggleWishlist={toggleWishlist}
            currentAccountWishlist={currentAccount?.wishlist}
            currentOrders={currentOrders}
          />

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
      )}
    </FullProductModeProvider>
  );
}

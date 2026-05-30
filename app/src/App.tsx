import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import LoadingScreen from '@/components/LoadingScreen';
import CustomCursor from '@/components/CustomCursor';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import ProductPreview from '@/components/ProductPreview';
import ExplosionLayer from '@/components/ExplosionLayer';
import PaintPoolLayer from '@/components/PaintPoolLayer';
import CookieBanner from '@/components/CookieBanner';
import Hero from '@/sections/Hero';
import CategorySection from '@/sections/CategorySection';
import ProductShowcase from '@/sections/ProductShowcase';
import WhyShop from '@/sections/WhyShop';
import HistorySection from '@/sections/History';
import Footer from '@/sections/Footer';
import type { Product } from '@/data/products';

gsap.registerPlugin(ScrollTrigger);

interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const lenisRef = useRef<Lenis | null>(null);

  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const openedViaPushRef = useRef(false);

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
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

  // Cart functions
  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.name === product.name && item.variant === product.variant);
      if (existing) {
        return prev.map((item) =>
          item.cartId === existing.cartId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, cartId: `${product.name}-${Date.now()}`, quantity: 1 }];
    });
    setCartOpen(true);

    // fire small event for explosion/particles
    window.dispatchEvent(new CustomEvent('quorin:addedToCart', { detail: product }));
  }, []);

  const updateQuantity = useCallback((cartId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
      );
    }
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Mouse glow effect
  useEffect(() => {
    if (isLoading) return;

    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);

    const handleMouseMove = (e: MouseEvent) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      glow.remove();
    };
  }, [isLoading]);

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
    // on mount, check url for direct product links
    try {
      const m = window.location.pathname.match(/^\/product\/(.+)$/);
      if (m) {
        const id = decodeURIComponent(m[1]);
        // find product by id
        let found: Product | undefined;
        // quorinData is imported above
        quorinData.categories.forEach((cat) => cat.products.forEach((p) => { if (String(p.id) === id) found = p; }));
        if (found) {
          setPreviewProduct(found);
          setPreviewOpen(true);
          openedViaPushRef.current = false; // direct open
        }
      }
    } catch (e) { /* ignore */ }

    const onPop = () => {
      // if the URL now points to a product, open it, otherwise close preview
      try {
        const m = window.location.pathname.match(/^\/product\/(.+)$/);
        if (m) {
          const id = decodeURIComponent(m[1]);
          let found: Product | undefined;
          quorinData.categories.forEach((cat) => cat.products.forEach((p) => { if (String(p.id) === id) found = p; }));
          if (found) {
            setPreviewProduct(found);
            setPreviewOpen(true);
            openedViaPushRef.current = false; // navigation via history
            return;
          }
        }
      } catch (e) { /* ignore */ }

      // otherwise close
      setPreviewOpen(false);
      setPreviewProduct(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openPreview = (product: Product) => {
    try {
      const url = `/product/${encodeURIComponent(String(product.id))}`;
      window.history.pushState({ preview: product.id }, '', url);
      openedViaPushRef.current = true;
    } catch (e) {
      window.location.hash = `preview-${product.id}`;
      openedViaPushRef.current = true;
    }
    setPreviewProduct(product);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    if (openedViaPushRef.current) {
      try { window.history.back(); } catch (e) { /* ignore */ }
    } else {
      try { window.history.replaceState({}, '', '/'); } catch (e) { /* ignore */ }
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
        <div className="relative">
          {/* Custom Cursor */}
          <CustomCursor />

          {/* Navigation */}
          <Navigation cartCount={cartCount} onCartClick={() => setCartOpen(true)} onHomeClick={() => { closePreview(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

          {/* Cart Drawer */}
          <CartDrawer
            isOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            items={cartItems}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
          />

          {/* Main Content */}
          <main>
            <Hero />
            <CategorySection />
            <ProductShowcase onAddToCart={addToCart} onPreview={openPreview} />
            <WhyShop />
            <HistorySection />
            <Footer />
          </main>

          {/* Product preview modal */}
          <ProductPreview product={previewProduct} isOpen={previewOpen} onClose={closePreview} />

          {/* Explosion / star overlay */}
          <ExplosionLayer />

          {/* Cookie banner */}
          <CookieBanner />

          {/* Paint pool overlay */}
          <PaintPoolLayer />
        </div>
      )}
    </>
  );
}

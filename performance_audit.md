# Performance Audit — QUORIN

## 1. Animation Stack

### Libraries in use
| Library | Version | Files | Usage |
|---------|---------|-------|-------|
| `framer-motion` | ^12.40.0 | 16 files | Primary animation engine |
| `gsap` | ^3.15.0 | 1 file (App.tsx) | ScrollTrigger + ticker |
| `lenis` | 1.3.23 (imported as `lenis`, package is `@studio-freight/lenis`) | 1 file (App.tsx) | Smooth scrolling |

### Framer Motion breakdown
| File | Motion features used |
|------|---------------------|
| `App.tsx` | `AnimatePresence` |
| `Navigation.tsx` | `motion.nav`, `motion.a`, `motion.button`, `motion.span`, `AnimatePresence` — ~40 animated elements |
| `LoadingScreen.tsx` | `motion.div`, `AnimatePresence` — loading frame sequence |
| `CustomCursor.tsx` | `motion.div`, `useSpring`, `useMotionValue` — spring-animated cursor elements |
| `CartDrawer.tsx` | `motion.div`, `AnimatePresence` — slide-in drawer |
| `ProductPreview.tsx` | `motion.div`, `AnimatePresence` — modal preview |
| `ProfileModal.tsx` | `motion.div`, `AnimatePresence` — profile dialog |
| `AdminCenter.tsx` | `motion.div`, `motion.button` — admin panel |
| `Hero.tsx` | `motion.h1`, `motion.p`, `motion.button` — hero text + CTA |
| `CategorySection.tsx` | `motion.div`, `useInView`, `useScroll`, `useTransform` — parallax cards |
| `ProductShowcase.tsx` | `motion.div`, `useInView`, `useScroll`, `useTransform` — scroll-linked product cards |
| `WhyShop.tsx` | `motion.div`, `useInView` — fade-in benefit cards |
| `History.tsx` | `motion.div`, `AnimatePresence` — timeline |
| `Footer.tsx` | `motion.div`, `AnimatePresence` — social links |
| `CategoryPage.tsx` | `motion.button` — back button |
| `XpPage.tsx` | `motion.div` — XP progress bar |

### GSAP usage (App.tsx only)
| Feature | Lines | Target selectors |
|---------|-------|-----------------|
| `gsap.ticker` for Lenis RAF | 177-181 | N/A |
| `.scroll-expand` animations | 424-442 | Elements with class `scroll-expand` |
| `.section-reveal` animations | 444-461 | Elements with class `section-reveal` |
| `.parallax-bg` animations | 463-480 | Elements with class `parallax-bg` |

### Lenis usage (App.tsx only)
- Initializes `new Lenis({ smooth: true })` on mount
- Connects to GSAP via `lenis.on('scroll', ScrollTrigger.update)`
- RAF loop synced with `gsap.ticker`
- Manual start/stop on navigation
- Scroll-to-top on category navigation

---

## 2. Performance Hotspots

### High impact
1. **Navigation component — 40+ framer-motion animated elements** (`Navigation.tsx`)
   - Uses `AnimatePresence` for nav visibility, menu overlay, login modal, custom request modal, and access notice
   - Each `AnimatePresence` block creates independent animation contexts
   - 6 menu sigils with spring animations + hover effects + label tooltips
   - Country picker dropdown with search filtering rendered inside AnimatePresence
   - **Recommendation:** Consider reducing `AnimatePresence` nesting. Multiple concurrent presence contexts can cause layout thrashing.

2. **Category cards — `useScroll` + `useTransform` per card** (`CategorySection.tsx:30-37`)
   - Each card creates its own `useScroll`/`useTransform` pair (3 cards = 6 scroll observers)
   - Mouse tracking on hover (`handleMouseMove`) + spring animation per card
   - **Recommendation:** Use a single `useScroll` on the section and `useTransform` with relative progress for cards.

3. **ProductShowcase — `useScroll` + `useTransform` per card** (`ProductShowcase.tsx`)
   - Similar pattern to CategorySection, but potentially more cards per category
   - Each product card has its own scroll observer + transform pipeline
   - **Recommendation:** Batch scroll observations at the container level.

4. **CustomCursor — `useSpring` + `useMotionValue`** (`CustomCursor.tsx`)
   - Runs continuously on every frame
   - Spring physics on two motion values (x, y) + scale spring
   - Hidden by `body { cursor: none; }` globally in `index.css`
   - Component is **not rendered** in `App.tsx` — dead code, but CSS rule persists
   - **Recommendation:** Remove `CustomCursor.tsx`, `CustomCursor` import, and `body { cursor: none; }` from CSS.

5. **GSAP ScrollTrigger + Lenis integration** (`App.tsx:158-480`)
   - Lenis RAF loop runs every frame via `gsap.ticker`
   - Three separate GSAP animation batches on every render: `.scroll-expand`, `.section-reveal`, `.parallax-bg`
   - Recreated on each `useEffect` trigger (location path changes)
   - **Recommendation:** Cache GSAP timelines and clean them properly on unmount.

### Medium impact
6. **No code splitting** — All routes load in a single bundle. `CategoryPage`, `XpPage`, and section components are all in the main bundle.
7. **Hero section loads with full page** — No lazy loading strategy for below-fold sections.
8. **LoadingScreen is always rendered** — Blocks interaction until loading completes, but no skeleton/progress feedback beyond the 7-frame sequence.
9. **`useMedusaCatalog` called by Navigation + CategorySection** — Two independent React Query calls to the same endpoint. Could be deduplicated.

### Low impact
10. **GSAP ticker lag smoothing disabled** (`gsap.ticker.lagSmoothing(0)`) — No automatic compensation for frame drops.
11. **Resize handler is no-op** (`starManager.ts:25`) — Listens for resize but does nothing.
12. **Inline styles throughout** — No CSS class reuse for animation states, preventing browser-level optimization.

---

## 3. Bundle Size Indicators

| Metric | Value |
|--------|-------|
| Total TSX/TS source files | 87 |
| Framer Motion imports | 16 files |
| Framer Motion advanced hooks | `useInView`(5), `useScroll`(4), `useTransform`(4), `useSpring`(1), `useMotionValue`(1) |
| GSAP usage | 1 file (App.tsx) |
| Lenis usage | 1 file (App.tsx) |
| Vite cache | 11MB |

---

## 4. Recommendations

### Priority 1 — Remove dead code
- **CustomCursor** not rendered → remove component, import, and `body { cursor: none; }` CSS rule
- **ExplosionLayer** not rendered → remove or implement
- **PaintPoolLayer** not rendered → remove or implement

### Priority 2 — Performance optimizations
- Implement **route-based code splitting** for `CategoryPage` and `XpPage`
- Deduplicate **`useMedusaCatalog`** calls using a shared hook or React Query cache
- Replace per-card `useScroll`/`useTransform` with a **section-level scroll observer**
- Add `React.memo` to expensive components (`Navigation`, `CategoryCard`, `ProductShowcase`)

### Priority 3 — Animation improvements
- Enable GSAP lag smoothing (change `lagSmoothing(0)` to `lagSmoothing(true)`)
- Cache GSAP timelines to prevent recreation on every route change
- Add `prefers-reduced-motion` media query support for all framer-motion animations
- Consider replacing inline spring animations with CSS transitions where possible

### Priority 4 — Loading strategy
- Add **skeleton screens** for category cards and product grids
- Implement **lazy loading** for below-fold sections (Hero is above fold, keep eager)
- Add **progressive loading** for product images (blur-up or lazy)

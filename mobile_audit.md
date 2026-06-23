# Mobile Audit — QUORIN

## 1. Viewport & Meta

| Setting | Value |
|---------|-------|
| `width=device-width` | Yes |
| `initial-scale=1.0` | Yes |
| `maximum-scale` | Not set (pinch-zoom enabled) |
| `user-scalable` | Not set (default: user can zoom) |

**Verdict:** Standard viewport. No progressive enhancement or accessibility barriers.

---

## 2. Responsive Breakpoints

### Breakpoints used
| Breakpoint | Usage count (active files) |
|------------|---------------------------|
| `md:` (768px) | 34 utility classes across 6 active sections/components |
| `sm:` (640px) | 2 utility classes (Navigation user button `hidden sm:flex`) |
| `lg:` (1024px) | 5 utility classes (Menu overlay grid, XpPage layout) |

### Mobile-specific detection
| Hook/Pattern | File | Purpose |
|--------------|------|---------|
| `useIsMobile()` (768px breakpoint) | `hooks/use-mobile.ts` | Available but **not imported by any active page/section** |
| `window.innerWidth <= 768` | `utils/starManager.ts` | Star particle count cap (25 mobile / 100 desktop) |
| `md:hidden` / `hidden md:flex` | Navigation.tsx | Hide category links, toggle menu buttons |
| `sm:hidden` / `sm:flex` | Navigation.tsx | Hide user button on small screens |
| `md:grid-cols-3` | CategorySection, ProductShowcase, WhyShop | Grid column scaling |
| `md:text-6xl` / `md:text-2xl` | Hero, CategorySection, History, XpPage | Font size scaling |

---

## 3. Mobile Navigation

### Desktop nav bar
- Category links hidden (`hidden md:flex`)
- User button hidden (`hidden sm:flex`)
- Separate hamburger button for desktop (`hidden md:flex`)

### Mobile nav bar
- Hamburger button visible at `Navigation.tsx:393-408`
- Shows cart icon + hamburger (no user button)

### Full-screen menu overlay
- **Fully responsive** — uses same overlay on both mobile and desktop
- Two-column grid on `lg:` (240px sigils + content)
- Single column on mobile (sigils stack vertically above content)
- Menu auto-closes after 2 seconds of mouse inactivity
- **Issue:** Mobile doesn't have mouse hover — sigil label tooltips (`showSigilLabel`) fire on `focus` instead, but mobile tap-to-focus is unreliable. Users on mobile never see sigil labels.

---

## 4. Touch Interactions

### Cursor-dependent features
| Feature | Mobile behavior |
|---------|-----------------|
| **Mouse tracking** on category cards (`CategorySection.tsx:39-45`) | `mousemove` doesn't fire on touch → parallax tilt effect is dead on mobile. Hover state also never activates. |
| **Hover border glow** (`CategorySection.tsx:191-199`) | `isHovered` never true on touch → no glow effect on mobile |
| **Hover underline animation** on nav category links | Never triggers on mobile |
| **CustomCursor** | Component not rendered, but `body { cursor: none; }` removes default cursor → **mobile users have no visible cursor** |

### Touch-friendly elements
| Element | Touch handling |
|---------|---------------|
| Navigation buttons | No `min-height: 44px` / `min-width` specified — tap targets may be small |
| Menu sigil buttons (16x16 grid, 48x48 button area) | Adequate for tap |
| Login modal inputs | Standard inputs, adequate sizing |
| Country picker dropdown | Click-to-select, no touch-optimized scroll |
| Product cards | `cursor-pointer` class on Hero section, `onClick` handlers |
| Cart drawer | Swipe-to-close not implemented |
| Custom request modal | Standard tap dismiss |

---

## 5. Section-by-Section Mobile Review

### Hero (`Hero.tsx`)
| Aspect | Status |
|--------|--------|
| Responsive font sizes | Yes (`text-4xl` → `md:text-6xl`) |
| Responsive image sizing | Yes (`aspect-video` → `md:aspect-[2/1]`) |
| Parallax background | Yes (`md:parallax-bg`) |
| Touch interaction | None — purely scroll/animation driven |
| CTA button | Adequate padding |

### CategorySection (`CategorySection.tsx`)
| Aspect | Status |
|--------|--------|
| Grid layout | 1 col mobile → 3 col desktop |
| Card height | Fixed `500px` — may be too tall on mobile (scrolls off viewport) |
| Parallax tilt | Dead on mobile (no mouse move) |
| Scroll animations | Active (useInView triggers on scroll) |
| Category images | Missing files (`/category-resin.jpg`, etc.) — shows broken image |
| Touch tap targets | Card is clickable, adequate area |

### ProductShowcase (`ProductShowcase.tsx`)
| Aspect | Status |
|--------|--------|
| Grid layout | 2 col mobile → 4 col desktop |
| Card heights | Uniform via flex |
| Image aspect | `h-56` (224px) on mobile — reasonable |
| Scroll animations | Active |
| Touch tap targets | Card clickable, adequate area |

### WhyShop (`WhyShop.tsx`)
| Aspect | Status |
|--------|--------|
| Grid layout | 1 col mobile → 3 col desktop |
| Glow effect | Runs continuously (background gradient, not hover-dependent) — works on mobile |
| Scroll animations | Active |

### History (`History.tsx`)
| Aspect | Status |
|--------|--------|
| Layout | Timeline — stacks vertically on mobile |
| Font sizes | Scaled down on mobile |
| Scroll animations | Active |

### Footer (`Footer.tsx`)
| Aspect | Status |
|--------|--------|
| Layout | Stacks vertically on mobile |
| Social links | Icon buttons — adequate tap targets |
| Responsive font sizes | Yes |

---

## 6. Issues & Findings

### Critical
1. **CustomCursor CSS hides default cursor globally** (`index.css:body { cursor: none; }`)
   - `CustomCursor` component is **not rendered** in `App.tsx`
   - Mobile users have no visible cursor
   - Any browser that ignores the CSS will show the default cursor, creating inconsistent behavior
   - **Fix:** Remove `body { cursor: none; }` from `index.css` and remove `CustomCursor.tsx` or render it.

2. **Category section card images missing** — `CategorySection.tsx:8-12` references 3 image files that don't exist in `app/public/`. Mobile users see broken image placeholders.

3. **Mouse-tracking parallax on category cards is dead on mobile** — 3D tilt effect requires `mousemove`. On touch devices, cards have no interactive hover state.

### Moderate
4. **Fixed 500px card height** on mobile — Category cards are 500px tall regardless of screen size. On a 640px phone, a single card takes up almost the entire viewport height.
5. **No swipe gestures** — Cart drawer, menu overlay, and modals have no swipe-to-dismiss.
6. **Menu sigil tooltips invisible on mobile** — `showSigilLabel` relies on hover (falls back to focus), but mobile tap-to-focus is unreliable. The 6 sigil glyphs are labeled but never shown on mobile.
7. **No `prefers-reduced-motion` support** — All animations run regardless of user motion preferences.
8. **Tap targets below 44px** — Navigation buttons, sigil buttons, and some UI elements don't meet WCAG 2.5.5 target size guidelines.

### Low
9. **No touch-optimized scrolling** — Lenis smooth scroll may conflict with native mobile momentum scrolling, causing janky behavior on some devices.
10. **Country picker dropdown** uses click handlers with `onMouseDown preventDefault` — works but not touch-optimized.
11. **No image lazy loading** — All section images load immediately, increasing initial page load on mobile.

---

## 7. Recommendations

### Priority 1 — Fix cursor bug
- **Remove `body { cursor: none; }` from `index.css`** OR render `CustomCursor` in `App.tsx`
- This is a blocking UX issue for mobile users.

### Priority 2 — Mobile-specific layout fixes
- **Reduce category card height on mobile** (e.g., `h-[350px] md:h-[500px]`)
- **Add `prefers-reduced-motion` media query** to disable animations for users who prefer it
- **Add minimum tap target sizes** (44x44px) to interactive elements

### Priority 3 — Touch enhancements
- **Implement swipe-to-dismiss** on CartDrawer, login modal, and menu overlay
- **Add `touch-action: manipulation`** to prevent double-tap zoom on buttons
- **Optimize Lenis for mobile** — consider disabling or adjusting smooth scroll on touch devices

### Priority 4 — Missing assets
- **Add category hero images** (`/category-resin.jpg`, `/category-candle.jpg`, `/category-soap.jpg`) to `app/public/`
- **Add fallback placeholders** so broken images don't display

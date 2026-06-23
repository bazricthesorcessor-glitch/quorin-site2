# Dead Code Report

## Executive Summary

The QUORIN site has significant dead code across components, UI library, CSS, images, and entire duplicate directories. The **ui/ directory (53 shadcn components) is entirely unused** by active application code. There's also a **missing import bug** (`ProductShowcase` not imported in App.tsx).

---

## 1. DEAD COMPONENTS (3 files)

| Component | Size | Reason |
|---|---|---|
| `CustomCursor.tsx` | 4,983 B | Never imported by any active file |
| `ExplosionLayer.tsx` | 5,090 B | Never imported (imports `starManager` from utils, which is also dead) |
| `PaintPoolLayer.tsx` | 5,171 B | Never imported |

**Total dead component code: ~15,244 B**

---

## 2. DEAD UI DIRECTORY (53 files — ENTIRELY UNUSED)

ALL 53 shadcn/ui components in `/app/src/components/ui/` are dead code. The active application uses Tailwind CSS utility classes directly, not these components.

| Component | External Dependency |
|---|---|
| accordion.tsx | @radix-ui/react-accordion |
| alert-dialog.tsx | @radix-ui/react-alert-dialog, button |
| aspect-ratio.tsx | @radix-ui/react-aspect-ratio |
| avatar.tsx | @radix-ui/react-avatar |
| badge.tsx | @radix-ui/react-slot |
| breadcrumb.tsx | @radix-ui/react-slot |
| button-group.tsx | @radix-ui/react-slot, separator |
| button.tsx | @radix-ui/react-slot |
| calendar.tsx | button, date-fns, react-day-picker, lucide-react |
| carousel.tsx | button, embla-carousel-react, lucide-react |
| checkbox.tsx | @radix-ui/react-checkbox, lucide-react |
| collapsible.tsx | @radix-ui/react-collapsible |
| command.tsx | dialog, cmdk, lucide-react |
| context-menu.tsx | @radix-ui/react-context-menu, lucide-react |
| dialog.tsx | @radix-ui/react-dialog, lucide-react |
| drawer.tsx | vaul, lucide-react |
| dropdown-menu.tsx | @radix-ui/react-dropdown-menu, lucide-react |
| field.tsx | label, separator |
| form.tsx | label, react-hook-form |
| hover-card.tsx | @radix-ui/react-hover-card |
| input-group.tsx | button, input, textarea |
| input-otp.tsx | input-otp, lucide-react |
| input.tsx | (none) |
| item.tsx | separator, lucide-react |
| kbd.tsx | (none) |
| label.tsx | @radix-ui/react-label |
| menubar.tsx | @radix-ui/react-menubar, lucide-react |
| navigation-menu.tsx | @radix-ui/react-navigation-menu, lucide-react |
| pagination.tsx | button, lucide-react |
| popover.tsx | @radix-ui/react-popover |
| progress.tsx | @radix-ui/react-progress |
| radio-group.tsx | @radix-ui/react-radio-group, lucide-react |
| resizable.tsx | react-resizable-panels, lucide-react |
| scroll-area.tsx | @radix-ui/react-scroll-area |
| select.tsx | @radix-ui/react-select, lucide-react |
| separator.tsx | @radix-ui/react-separator |
| sheet.tsx | @radix-ui/react-dialog, vaul, lucide-react |
| sidebar.tsx | button, input, separator, sheet, skeleton, tooltip |
| skeleton.tsx | (none) |
| slider.tsx | @radix-ui/react-slider |
| sonner.tsx | sonner, next-themes, lucide-react |
| spinner.tsx | lucide-react |
| switch.tsx | @radix-ui/react-switch |
| table.tsx | (none) |
| tabs.tsx | @radix-ui/react-tabs |
| textarea.tsx | (none) |
| toggle-group.tsx | toggle |
| toggle.tsx | @radix-ui/react-toggle |
| tooltip.tsx | @radix-ui/react-tooltip |
| chart.tsx | recharts, lucide-react |

**Total dead component code: ~53,000 B (53 KB)**

---

## 3. DEAD NPM DEPENDENCIES

### Dependencies only used by dead ui/ components

| Package | Used By |
|---|---|
| @radix-ui/react-accordion | ui/accordion.tsx |
| @radix-ui/react-alert-dialog | ui/alert-dialog.tsx |
| @radix-ui/react-aspect-ratio | ui/aspect-ratio.tsx |
| @radix-ui/react-avatar | ui/avatar.tsx |
| @radix-ui/react-checkbox | ui/checkbox.tsx |
| @radix-ui/react-collapsible | ui/collapsible.tsx |
| @radix-ui/react-context-menu | ui/context-menu.tsx |
| @radix-ui/react-dropdown-menu | ui/dropdown-menu.tsx |
| @radix-ui/react-hover-card | ui/hover-card.tsx |
| @radix-ui/react-label | ui/label.tsx |
| @radix-ui/react-menubar | ui/menubar.tsx |
| @radix-ui/react-navigation-menu | ui/navigation-menu.tsx |
| @radix-ui/react-popover | ui/popover.tsx |
| @radix-ui/react-progress | ui/progress.tsx |
| @radix-ui/react-radio-group | ui/radio-group.tsx |
| @radix-ui/react-scroll-area | ui/scroll-area.tsx |
| @radix-ui/react-select | ui/select.tsx |
| @radix-ui/react-separator | ui/separator.tsx |
| @radix-ui/react-slider | ui/slider.tsx |
| @radix-ui/react-slot | ui/button.tsx, ui/button-group.tsx |
| @radix-ui/react-switch | ui/switch.tsx |
| @radix-ui/react-tabs | ui/tabs.tsx |
| @radix-ui/react-toggle | ui/toggle.tsx |
| @radix-ui/react-toggle-group | ui/toggle-group.tsx |
| @radix-ui/react-tooltip | ui/tooltip.tsx |
| recharts | ui/chart.tsx |
| sonner | ui/sonner.tsx |
| cmdk | ui/command.tsx |
| vaul | ui/drawer.tsx, ui/sheet.tsx |
| embla-carousel-react | ui/carousel.tsx |
| react-day-picker | ui/calendar.tsx |
| input-otp | ui/input-otp.tsx |
| react-resizable-panels | ui/resizable.tsx |
| next-themes | ui/sonner.tsx |
| date-fns | ui/calendar.tsx |
| @hookform/resolvers | ui/form.tsx |
| react-hook-form | ui/form.tsx |
| class-variance-authority | ui/button.tsx |
| zod | not used in source at all |

**~38 dead npm packages** — removal would reduce node_modules significantly.

### Note: @radix-ui/react-dialog
`@radix-ui/react-dialog` is used by both `ui/sheet.tsx` and `ui/dialog.tsx`, both dead. No active code uses it.

---

## 4. DEAD UTILITIES

| File | Size | Reason |
|---|---|---|
| `lib/utils.ts` | 166 B | Exports `cn()` helper used only by dead ui/ components |

---

## 5. DEAD CSS CLASSES (index.css — 28 of 30 classes unused)

| CSS Class / Keyframe | Used In Source? |
|---|---|
| `.text-roll` + variants | NO |
| `.glass-card` + hover | NO |
| `.parallax-card` + inner | NO |
| `.scroll-expand` | **YES** (App.tsx line 424 via gsap.utils.toArray) |
| `.scroll-expand.in-view` | NO |
| `@keyframes neon-rotate` | NO |
| `.neon-ring` | NO |
| `@keyframes float-particle` | NO (commented out) |
| `@keyframes shimmer` | NO |
| `.shimmer-text` | NO |
| `.magnetic-btn` | NO |
| `.ring-segment` | NO |
| `.particle-letter` + hover | NO |
| `.quorin-brand` | NO |
| `.quorin-scrollbox` + scrollbar styles | NO |
| `.quorin-no-scrollbar` + scrollbar | NO |

**Only 1 class (`.scroll-expand`) is actually used. ~28 classes are dead code.**

---

## 6. DEAD IMAGES

### Duplicate images/ folder
| Path | Files | Total Size | Status |
|---|---|---|---|
| `/home/dmannu/quorin-site/images/` | 7 PNGs | ~44 MB | DEAD (duplicate, not referenced in source) |

### Loading frame images
| Path | Files | Total Size | Status |
|---|---|---|---|
| `/home/dmannu/quorin-site/app/public/loading-frames/` | 7 PNGs | ~47 MB | ACTIVE (used by LoadingScreen, conditionally rendered) |

**Note**: Loading frames are only shown during initial page load (~3 seconds total, ~430ms per frame). If LoadingScreen is removed, all 7 frames become dead (~47 MB).

### Product/category images (ALL ACTIVE)
- 13 product/category JPG files in `/app/public/` — all referenced in source code
- `medusa-product-map.ts` references one for fallback
- `ProductPreview.tsx` has a local fallback image
- None are dead

---

## 7. DEAD DUPLICATE DIRECTORY

| Path | Approx Size | Status |
|---|---|---|
| `/home/dmannu/quorin-site/app_copy/` | ~300+ MB (includes node_modules, dist) | DEAD — complete duplicate of app/ |

---

## 8. BUG: MISSING IMPORT

| File | Line | Issue |
|---|---|---|
| `App.tsx` | 104 | `<ProductShowcase>` used in JSX but **never imported** — would cause `ReferenceError: ProductShowcase is not defined` at runtime |

The import `import ProductShowcase from '@/sections/ProductShowcase'` is missing from App.tsx.

---

## 9. ESTIMATED SAVINGS

| Category | Size | Type |
|---|---|---|
| ui/ directory (53 components) | ~53 KB | Bundle size |
| Dead npm deps (~38 packages) | ~100-200 KB (tree-shaken) | Bundle size |
| lib/utils.ts | 166 B | Bundle size |
| Unused CSS classes | ~3 KB | Bundle size |
| Duplicate images/ folder | ~44 MB | Disk space |
| Loading frames (if removed) | ~47 MB | Bundle size |
| Duplicate app_copy/ | ~300+ MB | Disk space |
| **Total bundle savings** | **~350-450 KB** | — |
| **Total disk savings** | **~390+ MB** | — |

---

## 10. SUMMARY TABLE

| Category | Items | Dead? |
|---|---|---|
| `CustomCursor.tsx` | 1 | YES |
| `ExplosionLayer.tsx` | 1 | YES |
| `PaintPoolLayer.tsx` | 1 | YES |
| `components/ui/` | 53 | YES (entire directory) |
| `lib/utils.ts` | 1 | YES |
| CSS classes in index.css | 30 | 28 dead |
| `images/` (root) | 7 PNGs | YES (duplicate) |
| `app_copy/` | entire directory | YES |
| `@radix-ui/*` packages | 23 | YES |
| recharts, sonner, cmdk, vaul, etc. | 15 | YES |
| Loading frames | 7 PNGs | YES (if LoadingScreen removed) |
| Product/category images | 13 JPGs | NO (all active) |

**Bugs Found:**
1. `ProductShowcase` is used in App.tsx line 104 but never imported (ReferenceError)
2. `@studio-freight/lenis` in package.json but only `lenis` is actually imported
3. `Home.tsx` is a Vite template default, not part of the active app

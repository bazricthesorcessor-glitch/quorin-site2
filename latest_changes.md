# QUORIN — Audit Report & Latest Changes
**Date: 2026-06-23**
**Phase 1: Full Project Audit — COMPLETE**

---

## 1. Repository Overview

| Metric | Value |
|--------|-------|
| Total repo size | 3.2GB |
| node_modules total | ~1.1GB (3 locations) |
| Source files (TS/TSX) | 87 files, 4851 lines in TSX |
| shadcn/ui components | 53 |
| Public assets | 48MB (13 product images + 8 loading frames) |
| .md documentation | 25 files (many outdated) |
| Zip archives in root | 3 large zips |

---

## 2. .md File Classification

### USED / CURRENT (Keep)
| File | Status | Notes |
|------|--------|-------|
| Phase-3-Admin-System.md | Used | Admin planning — still relevant |
| Phase-4-Branding.md | Used | Branding guidelines — still relevant |
| Phase-5-Product-Experience.md | Used | Product experience planning |
| Phase-6-Mobile.md | Used | Mobile optimization plans |
| Phase-7-Performance.md | Used | Performance engineering plans |
| Phase-8-SEO.md | Used | SEO & discoverability plans |
| Phase-9-Commerce.md | Used | Commerce & conversion plans |
| Phase-10-Production.md | Used | Production deployment plans |
| TRADEMARK.md | Used | Legal notice |
| GIFT_RULES.md | Used | Business rules (XP, birthday gifts) |
| app/README.md | Used | Standard Vite template docs |
| app/info.md | Used | Project setup reference |

### OUTDATED (Mark for review/deletion)
| File | Why Outdated |
|------|-------------|
| Overview.md | Describes old "cool frontend → real business" narrative; doesn't match current Medusa state |
| Phase-1-Foundation.md | Express.js/Prisma plan — replaced by Medusa v2 |
| Phase-2-Database.md | Express.js/Prisma DB schema — replaced by Medusa |
| Phase-3-Admin-System.md (completion) | PHASE-3-COMPLETE.md — Express.js implementation |
| PHASE-1-COMPLETE.md | Express.js/Prisma backend completion docs |
| PHASE-2-COMPLETE.md | Express.js/Prisma database completion docs |
| BUILD-PROGRESS.md | Tracks Express.js/Prisma plan, not current Medusa state |
| BACKEND-SUMMARY.md | Express.js API reference — replaced by Medusa |
| README-BACKEND.md | Express.js setup guide — replaced by Medusa |
| MANIFEST.md | Express.js/Prisma implementation manifest |
| IMPLEMENTATION-COMPLETE.txt | Express.js/Prisma completion report |
| QUICKSTART.md | Express.js/Prisma setup — replaced by Medusa |
| ENV-SETUP.md | Express.js/Prisma environment guide — replaced by Medusa |

---

## 3. Frontend Architecture Issues

### 3.1 Admin System — Critical Bug
**Problem**: `AdminCenter.tsx` uses purely frontend state (localStorage). Changes disappear after page refresh.
- No integration with any backend API
- Medusa backend exists but is completely disconnected from admin UI
- Owner previously reported: "save changes disappear after refresh"

### 3.2 State Management — Fragmented
- `quorinStore.ts` manages localStorage for accounts, catalog, themes, checkout locks
- `useMedusaCatalog.ts` and `useMedusaCart.ts` use Medusa hooks but are disconnected from primary state
- No single source of truth — catalog data lives in localStorage, not in Medusa
- No sync between frontend state and backend data

### 3.3 Heavy Animation Dependencies
| Dependency | Used In | Impact |
|-----------|---------|--------|
| `gsap` + `ScrollTrigger` | `App.tsx` | Heavy — parallax, scroll animations, ticker loop |
| `lenis` | `App.tsx` | Heavy — smooth scrolling with ticker integration |
| `@studio-freight/lenis` | package.json | Duplicate of lenis |
| `framer-motion` | 14+ files | Moderate — page transitions, animations |
| `embla-carousel-react` | `carousel.tsx` | Moderate |
| `cmdk` | `command.tsx` | Low — command palette |

### 3.4 CSS Bloat (`index.css`)
- Extensive custom animations (shimmer, glow, pulse, float)
- Glassmorphism effects with backdrop-filter
- Neon/gradient text utilities
- Custom cursor overrides and mouse-glow
- Hidden cursor on body
- Heavy pseudo-element effects

### 3.5 Navigation
- Contains "Menu Sigils" (Unicode glyphs: ✦, ✶, ⟡, ◈) — too decorative for business
- No scroll-hide/show behavior implemented yet
- Search is a permanent homepage element (should be a dedicated page)

---

## 4. Backend Architecture (Medusa v2.16.0)

### Current State
- `@medusajs/medusa` v2.16.0 and `@medusajs/js-sdk` installed in `app/package.json`
- Express.js + Prisma backend exists but is the original plan (pre-Medusa)
- Medusa integration is declared but not wired into the frontend
- Admin UI does not use Medusa APIs

### What This Means
The backend architecture evolved from Express.js/Prisma → Medusa v2.
The frontend still references the old Express API patterns.
The admin system needs to connect to Medusa, not Express.

---

## 5. Mobile Experience Issues

### Current Problems
- No dedicated mobile navigation (bottom dock)
- Desktop navigation shown on mobile without adaptation
- Search is a homepage element, not a dedicated page
- Bottom sheet product preview not implemented
- Product page order doesn't match priority:
  1. Images
  2. Product Story
  3. Trust
  4. Variants
  5. Quantity
  6. Add to Cart

### Required Mobile Flow
- Bottom floating dock with max 5 icons: Home, Search, Wishlist, Cart, Profile
- Search = dedicated page
- Navigation hides on scroll down, shows on scroll up
- Product card tap → smooth bottom sheet

---

## 6. Performance Risks

### Bundle Size
- 50+ dependencies including heavy animation libraries
- GSAP + Lenis + Framer Motion = ~300KB+ of animation code
- 40+ shadcn/ui components loaded (many unused)
- 48MB public assets with no image optimization pipeline

### Rendering Pressure
- GSAP ticker loop runs continuously
- Lenis smooth scrolling adds JS overhead every frame
- Framer Motion AnimatePresence on many components
- No `React.memo` or `useMemo` optimization visible

### Asset Delivery
- Product images served directly from public/ (no CDN)
- No lazy loading for images below fold
- No responsive image variants (srcset/webp)

---

## 7. Account System Issues

### Account Deletion
- No 7-day grace period implemented
- No warnings about data loss (XP, coupons, orders)
- No soft-delete pattern

### Gift Rules (from GIFT_RULES.md)
- XP level discount applies only to normal cart items (gift stays at cost)
- Level 10 gift: one-time per account
- Birthday gift: one per year per account
- Frontend-only fingerprint enforcement (no server-side check)

---

## 8. Business Priority Checklist

| Priority | Issue | Status |
|----------|-------|--------|
| 1. Business | Admin changes persist after refresh | BROKEN |
| 2. Conversion | Product page doesn't match priority order | NEEDS FIX |
| 3. Trust | No reviews/testimonials system | MISSING |
| 4. UX | Mobile navigation not implemented | MISSING |
| 5. Performance | GSAP/Lenis/Framer bundle bloat | NEEDS CLEANUP |
| 6. Design | Cyberpunk/gaming aesthetics still present | IN PROGRESS |

---

## 9. Changes Made in This Session

### Visual Cleanup (Completed)
- Removed `CustomCursor` from `App.tsx`
- Removed `ExplosionLayer` from `App.tsx`
- Removed `mouse-glow` CSS from `index.css`
- Default OS cursor is now active

### Documentation (Completed)
- Full audit of all 25 .md files
- Classification into Used / Outdated
- This report created

---

## 10. Next Actions (Awaiting Instruction)

1. Remove or archive outdated .md files (13 files identified)
2. Audit dependency tree for bundle bloat cleanup
3. Plan admin system overhaul (connect to real backend)
4. Design mobile navigation flow
5. Fix product page priority order

---

*Audit conducted on QUORIN repository — Production handcrafted resin commerce platform.*

# Navigation Audit — QUORIN

## 1. Route Structure

### Defined in `App.tsx`
| Path | Component | Status |
|------|-----------|--------|
| `/` | `HomeScreen` | Active — all content renders here |
| `*` (catch-all) | `HomeScreen` | Active — 404s fall back to home |

### File-based page components (NOT routable)
| File | Component | Route Defined? |
|------|-----------|----------------|
| `app/src/pages/Home.tsx` | `HomeScreen` | Yes (same component used by `/` route) |
| `app/src/pages/CategoryPage.tsx` | `CategoryPage` | **No** — dead route target |
| `app/src/pages/XpPage.tsx` | `XpPage` | **No** — dead route target |

### Navigation link targets that don't exist as routes
| Target | From | Actual behavior |
|--------|------|-----------------|
| `/category/[id]` | `Navigation.tsx:81`, `CategorySection.tsx:27`, `CategoryPage.tsx:43` | Navigates to a URL that routes to `HomeScreen` (via catch-all `*`). `CategoryPage` component never mounts. |
| `/xp` | `Navigation.tsx:208` | Navigates to a URL that routes to `HomeScreen` (via catch-all `*`). `XpPage` component never mounts. |

**Verdict:** Category and XP pages are dead routes. Users clicking these links are silently redirected to the home page. The components exist and are fully implemented but unreachable.

---

## 2. Menu Structure & Sigils

### Desktop nav bar (top, `Navigation.tsx:306-331`)
- Displays category links dynamically from `useMedusaCatalog()`
- Links navigate to `/category/[id]` (dead routes — see above)
- Hidden on mobile (`hidden md:flex`)

### Hamburger menu button (desktop + mobile)
- Desktop: `hidden md:flex` button at `Navigation.tsx:411-430`
- Mobile: visible hamburger at `Navigation.tsx:393-408`
- Both open the same full-screen overlay menu

### Full-screen overlay menu (`Navigation.tsx:438-604`)
Two-column layout (lg): 240px left sigil column + content area.

**Left column — Menu Sigils:**
| Sigil Glyph | Label | Action |
|-------------|-------|--------|
| `✦` | Account | Opens login modal (or profile if logged in) |
| `✶` | Orders | Scrolls to `#orders` section on home page |
| `⟡` | Custom Requests | Opens custom request modal |
| `◈` | XP | Navigates to `/xp` (dead route) |
| `✧` | Back to Home | Scrolls to top of home page |
| `⟁` | Admin Mode | Opens login modal (pre-fills `admin909`) |

**Right column — Shop by Category:**
- Shows `useMedusaCatalog()` categories in a 3-column grid
- Clicking navigates to `/category/[id]` (dead route)
- Uses same category data as desktop nav bar links

### Auto-close behavior
- Menu closes after 2 seconds of inactivity on mouse leave (`Navigation.tsx:133-138`)
- Clears on mouse enter
- Immediate close on clicking background overlay

### Login modal (`Navigation.tsx:607-944`)
Three tabs:
| Tab | Implementation |
|-----|---------------|
| Google | Placeholder button — does nothing except close modal |
| Email | Calls `onAuthenticate(email, password)` — uses `quorinStore` validation |
| Phone | Phone number input with country picker → OTP entry (hardcoded password `Asdfg909`) |

---

## 3. Sigil System

**Hover labels** (`showSigilLabel` / `hideSigilLabel` at `Navigation.tsx:107-124`):
- On hover/focus: sets `activeSigil` state
- 2-second timeout then clears `activeSigil`
- Cleared when menu closes
- Renders as a tooltip to the right of the sigil button

**Admin Mode special styling:**
- Purple glow border (`rgba(186, 85, 255, ...)`)
- Pulsing box-shadow animation on render
- Purple text color for the glyph

---

## 4. Scroll-Based Nav Visibility

**Visibility toggle** (`Navigation.tsx:55-78`):
| Condition | Visibility |
|-----------|------------|
| Mouse Y < 80px | Visible |
| Mouse Y > 200px && menu closed | Hidden |
| Scroll Y > 100px | Visible (forced) |
| Default (no scroll, mouse in middle) | Hidden |

**Visual states:**
- Scrolled: opaque background (`rgba(8, 8, 13, 0.85)`), shadow
- Not scrolled: semi-transparent (`rgba(8, 8, 13, 0.6)`)
- Top indicator bar: gradient accent line shown when visible and not scrolled

---

## 5. Footer Navigation (`Footer.tsx`)
- Uses `useNavigate` from react-router
- Links to `#` anchors (social: Instagram, YouTube, X/Twitter, WhatsApp)
- Brand logo links to `#` (same scroll-to-top behavior as nav)

---

## 6. Mobile Behavior

| Feature | Mobile (< 768px) | Desktop (≥ 768px) |
|---------|------------------|-------------------|
| Category links | Not shown in nav bar | Shown in nav bar |
| User button | Hidden (`hidden sm:flex`) | Shown with display name |
| Hamburger menu | Visible (Menu/X icon) | Hidden (separate dot button) |
| Menu overlay | Full screen | Full screen |
| Category cards grid | 1 column | 3 columns |

---

## 7. Issues & Findings

### Critical
1. **Dead routes** — `/category/[id]` and `/xp` routes not defined in `App.tsx`. Navigation links to these URLs silently fall through to `HomeScreen` via catch-all `*` route. Users see the home page, not the intended category/XP views.
2. **Two components for same thing** — `Home.tsx` and `App.tsx` both define `HomeScreen`. The one in `Home.tsx` is the one actually used by the route.
3. **Category navigation mismatch** — Desktop nav links to `/category/[id]` which doesn't route to `CategoryPage`. `CategorySection.tsx` also navigates to the same dead URL from homepage cards.

### Moderate
4. **Google login is dead code** — The Google tab in the login modal shows a button that does nothing except close the modal. No OAuth integration.
5. **XP page unreachable** — `XpPage.tsx` is fully implemented but has no route. The `◈ XP` menu item navigates to a non-existent `/xp` route.
6. **Orders scrolls to non-existent anchor** — `openSection('orders')` at `Navigation.tsx:194` scrolls to `#orders` but the home page has no section with `id="orders"` (sections are `#hero`, `#categories`, `#why-shop`, `#history`, `#footer`).

### Low
7. **No breadcrumbs** — Users have no way to know they're on a category or XP page since those routes don't exist.
8. **Category images reference missing files** — `CategorySection.tsx:8-12` references `/category-resin.jpg`, `/category-candle.jpg`, `/category-soap.jpg` which do not exist in `app/public/`.
9. **Country picker blur behavior** — `setTimeout` delay of 120ms at `Navigation.tsx:765` to close picker is fragile; clicking a country in the dropdown may trigger the blur before the click.

---

## 8. Recommended Navigation Structure

```
Routes:
  /                 → HomeScreen (current)
  /category/:id     → CategoryPage (currently dead — needs route)
  /xp               → XpPage (currently dead — needs route)
  *                 → HomeScreen (404 fallback, keep as-is)

Menu items:
  ◈ XP              → /xp (works once route is added)
  ✶ Orders          → scroll to #orders (add id="orders" section OR change to a dedicated /orders route)
  Category links    → /category/[id] (works once route is added)

Category images:
  Add /category-resin.jpg, /category-candle.jpg, /category-soap.jpg to app/public/
  OR replace with placeholder/fallback images.
```

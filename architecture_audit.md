# Architecture Audit — QUORIN

**Version:** 1 (frozen — awaiting owner answers)
**Freeze Note:** Do not modify this document until owner answers `owner_questions.md`. If findings emerge, append to `architecture_review_notes.md`.

## Executive Summary

The QUORIN application is a **hybrid frontend architecture** where most data lives in `localStorage` on the client, with Medusa partially wired in as a secondary data source. No persistent backend database is actively used by the frontend. The application has two competing data layers:

1. **localStorage layer** — Primary source of truth for catalog, accounts, orders, theme, custom requests, and checkout locks.
2. **Medusa layer** — SDK and hooks exist, categories partially connected, cart partially connected, but products, orders, accounts, and admin settings are **not driven by Medusa**.

No Prisma or Express backend from `backend-backup/` is connected to the frontend.

---

## System-by-System Source of Truth

### 1. Products

| Aspect | Value |
|--------|-------|
| **Source of truth** | **Hybrid** |
| **Default data** | `app/src/data/products.ts` — `quorinData` object (lines 33-270), 3 categories, ~24 products |
| **Override storage** | `localStorage['quorin.catalog']` — written by `saveCatalog()` in `quorinStore.ts:62-66` |
| **Admin writes** | `AdminCenter.tsx` → `onCatalogUpdate(mutator)` → `Object.assign(quorinData, nextCatalog)` → `setCatalogVersion(v+1)` → `useEffect` → `saveCatalog(quorinData)` → localStorage |
| **Medusa fallback** | `useMedusaCatalog.ts:19` — `medusaClient.products.list({ limit: 100 })` — used only in `Navigation.tsx:31` and `CategorySection.tsx:206` |
| **Product rendering** | `app/src/App.tsx:22` — imports `quorinData` from `products.ts` directly; **Medusa products not used in rendering** |
| **Image mapping** | `ProductShowcase.tsx:6-27` — `productImageMap` static path mapping |

**Verdict:** Hybrid with strong localStorage bias. Medusa provides a fallback for categories only. Product display uses static `quorinData` from `products.ts`.

---

### 2. Categories

| Aspect | Value |
|--------|-------|
| **Source of truth** | **Hybrid** |
| **Default categories** | `products.ts:42,149,233` — `resin-art`, `candle-making`, `soap-making` defined inline |
| **Override storage** | `localStorage['quorin.catalog']` — same key as products |
| **Medusa source** | `useMedusaCatalog.ts:26` — `buildCategoriesFromProducts(products)` → `medusa-product-map.ts:59+` |
| **Where used** | `Navigation.tsx:31` — `useMedusaCatalog()` categories in nav bar; `CategorySection.tsx:206` — `useMedusaCatalog()` for section cards |
| **Admin editing** | `AdminCenter.tsx:433` — save category writes to `localStorage['quorin.catalog']` via `onCatalogUpdate` |

**Verdict:** Hybrid. Medusa feeds the navigation bar and category section. Admin editing writes to localStorage only. Default categories are hardcoded in `products.ts`.

---

### 3. Cart

| Aspect | Value |
|--------|-------|
| **Source of truth** | **Medusa (primary) + localStorage (identity)** |
| **SDK client** | `app/src/lib/medusa.ts:5-10` — `new Client({ url: ..., token: localStorage["medusa_auth_token"] })` |
| **Cart ID storage** | `useMedusaCart.ts:29` — `STORAGE_KEY = 'quorin_medusa_cart_id'` |
| **Create cart** | `useMedusaCart.ts:100` — `medusaApi.createCart()` — called when no local cart ID exists |
| **Add item** | `useMedusaCart.ts:116` — `medusaApi.addCartItem(targetCartId, variantId, 1)` |
| **Update item** | `useMedusaCart.ts:136` — `medusaApi.updateCartItem(cartId, lineId, quantity)` |
| **Remove item** | `useMedusaCart.ts:150` — `medusaApi.removeCartItem(cartId, lineId)` |
| **Complete purchase** | `useMedusaCart.ts:76` — `medusaClient.checkout.completeCart(cartId)` |
| **React state** | `App.tsx:137` — `const { cart: medusaCart, cartId, addItem: medusaAddItem, ... } = useMedusaCart()` |
| **Cart UI** | `CartDrawer.tsx` — displays `medusaCart` items |

**Verdict:** Medusa-backed cart with localStorage for cart identity persistence. This is the only system where Medusa is the primary data source.

---

### 4. Orders

| Aspect | Value |
|--------|-------|
| **Source of truth** | **localStorage** |
| **Storage key** | `localStorage['quorin.accounts']` — orders live as `AccountRecord.orders[]` |
| **Definition** | `data/accounts.ts:17-23` — `AccountOrder` type: `{ id, product, orderDate, status, comment? }` |
| **Demo orders** | `data/accounts.ts:111-118` — `customer909` has 6 orders with dates relative to `2026-05-31T10:03:43.000Z` |
| **Order display** | `sections/History.tsx:12-43` — renders `currentAccount.orders` |
| **Return window** | `History.tsx:29-32` — `(Date.now() - Date.parse(order.orderDate)) / 86400000 <= 3` (3-day window) |
| **Order status** | `accounts.ts:21` — `'delivered' | 'return_requested' | 'returned'` |
| **Medusa integration** | **None** — orders are never created via Medusa API |

**Verdict:** localStorage-only. Orders are client-side state within the account record. No backend persistence. No Medusa integration.

---

### 5. Accounts

| Aspect | Value |
|--------|-------|
| **Source of truth** | **localStorage** |
| **Storage key** | `localStorage['quorin.accounts']` |
| **Current account** | `localStorage['quorin.currentAccountId']` — `quorinStore.ts:8` |
| **Account data** | `data/accounts.ts:25-34` — `AccountRecord` type: `{ password, profile, orders, giftUsage }` |
| **Demo accounts** | `data/accounts.ts:97-165` — `customer909`, `customer809`, `admin909` (all with hardcoded passwords `'Asdfg909'`) |
| **Authentication** | `Navigation.tsx:607-944` — login modal validates against `quorin.accounts` localStorage via `findAccountByIdentifierInAccounts` |
| **Account switching** | `quorinStore.ts:47-60` — `switchAccount()` reads from localStorage, sets `currentAccountId` |
| **Role check** | `App.tsx:317` — `if (currentAccount?.profile.role !== 'admin') return;` — client-side only |
| **Medusa auth** | `medusa.ts:14-15` — `medusaClient.auth.createToken(email, password)` exists but **never called by the frontend login flow** |

**Verdict:** localStorage-only with hardcoded demo accounts. Medusa auth SDK exists (`medusa.ts:15`) but is never wired to the login UI. Admin access is purely client-side with no server validation.

---

### 6. XP / Loyalty

| Aspect | Value |
|--------|-------|
| **Source of truth** | **Computed (React state)** |
| **Constants** | `data/xp.ts:1-2` — `XP_MAX_ORDER_VALUE = 100000`, `XP_LEVEL_COUNT = 10` |
| **Level ladder** | `xp.ts:10-18` — cumulative spend thresholds from 0 → 100,000 |
| **Level calculation** | `xp.ts:20-24` — `getXpLevel(totalSpend)` — binary search through thresholds |
| **Discount formula** | `xp.ts:26-28` — `getXpDiscountPercent(level)` → `((level - 1) / 9) * 5` (0% at level 1, 5% at level 10) |
| **Spend source** | `App.tsx:~128-131` — `totalSpend` = sum of `currentAccount.orders[].product.price` |
| **XP display** | `pages/XpPage.tsx:20-27` — `totalSpend` → `getXpLevel()` → progress bar |
| **Persistence** | **None** — XP is calculated fresh on every render from orders |

**Verdict:** Purely computed. XP level and discount are derived from the orders array in localStorage. No XP data is stored or persisted independently.

---

### 7. Rewards

| Aspect | Value |
|--------|-------|
| **Source of truth** | **Computed + localStorage** |
| **Constants** | `data/gifts.ts:4-11` — `GiftSource: 'level10' | 'birthday'`, `CheckoutGiftOffer` type |
| **Level 10 gift** | `gifts.ts:22-23` — `canRedeemLevel10Gift(account, level)` — checks `level >= 10 && !level10GiftRedeemed` |
| **Birthday gift** | `gifts.ts:25-29` — `canRedeemBirthdayGift(account, now)` — checks birthday match + not redeemed this year |
| **Discount calculation** | `gifts.ts:31,33` — `getProductCostPrice(product)` → `getGiftDiscountForProduct(product)` |
| **Gift locks** | `gifts.ts:35-41` — `getGiftLockKey(source, fingerprint, now)` — `quorin.checkoutLocks` + `quorin.clientFingerprint` |
| **Redemption** | `gifts.ts:67-88` — `redeemCheckoutGift(account, offer, now)` — returns updated account |
| **UI display** | `CartDrawer.tsx:40-48` — XP discount and gift discount applied at checkout |

**Verdict:** Computed logic with localStorage for redemption state. Gifts are not persisted to Medusa or any backend.

---

### 8. Reviews

| Aspect | Value |
|--------|-------|
| **Source of truth** | **Component state (ephemeral)** |
| **Type** | `products.ts:20-24` — `ProductReview` type: `{ author, text, date }` |
| **Default data** | **None** — no `reviews` field on any product in `quorinData` |
| **Add review** | `ProductPreview.tsx:23` — `setReviews([...product.reviews, { ... }])` — local state only |
| **Display** | `ProductPreview.tsx:101-118` — renders reviews list |
| **Persistence** | **None** — reviews are lost on page refresh |
| **Medusa integration** | **None** |

**Verdict:** Non-existent as a persistent system. Reviews can be added in the `ProductPreview` modal but are lost on refresh. No storage backend.

---

### 9. Theme (Brand Settings)

| Aspect | Value |
|--------|-------|
| **Source of truth** | **localStorage** |
| **Storage key** | `localStorage['quorin.theme']` |
| **Default values** | `app/src/App.tsx:128` — `loadTheme()` reads from localStorage, spreads over `defaultTheme` |
| **Theme interface** | `AdminCenter.tsx:6-15` — `{ primaryColor, secondaryColor, accentColor, fontFamily, bgStyle }` |
| **Read snapshot** | `AdminCenter.tsx:40-52` — `readThemeSnapshot()` reads `localStorage['quorin.theme']` |
| **Admin editing** | `AdminCenter.tsx:635-638` — `onThemeChange(nextTheme)` → `updateTheme()` → `setTheme(nextTheme)` → `useEffect` → `saveTheme(theme)` → localStorage |
| **CSS application** | `index.css` — CSS custom properties for theming |

**Verdict:** localStorage-only. Theme changes persist across refresh via localStorage. No backend endpoint for theme.

---

### 10. Admin Settings (Catalog + Theme)

| Aspect | Value |
|--------|-------|
| **Source of truth** | **localStorage** |
| **Theme fields** | Brand name, tagline, font family, accent color, teal, background, primary text, secondary text — all in `quorin.theme` |
| **Category fields** | Category id, title, description — stored in `quorin.catalog` |
| **Product fields** | Name, type, variant, size, price, cost price, MRP, discount, description, image URLs (comma-separated), tags (comma-separated) — all in `quorin.catalog` |
| **Admin UI** | `AdminCenter.tsx` (657 lines) — 4 tabs: Theme, Categories, Products, Bulk |
| **Save operations** | `AdminCenter.tsx:433,631-642` — save category, save item, save theme, save all |
| **Draft behavior** | `AdminCenter.tsx:82-92` — opens reset to current state; `setDirty(true)` on field changes |
| **Persistence** | `quorinStore.ts:62-75` — `saveCatalog()` and `saveTheme()` write to localStorage |
| **Backend sync** | **None** — no API calls from AdminCenter |

**Verdict:** localStorage-only. Admin can edit everything, but changes only persist to the user's browser localStorage. No backend sync, no multi-user sharing, no versioning.

---

## Additional Systems

### Custom Requests
| Aspect | Value |
|--------|-------|
| **Storage** | `localStorage['quorin.customRequests']` |
| **Definition** | `quorinStore.ts:15` — STORAGE_KEYS entry |
| **UI** | `Navigation.tsx:83` — `appendCustomRequest()` on form submit |

### Cookie Consent
| Aspect | Value |
|--------|-------|
| **Storage** | `localStorage['quorin:cookies']` |
| **Component** | `CookieBanner.tsx:6` — `'accepted' | 'declined'` |

### Client Fingerprint
| Aspect | Value |
|--------|-------|
| **Storage** | `localStorage['quorin.clientFingerprint']` |
| **Purpose** | Gift lock keys (level10, birthday) |
| **Definition** | `quorinStore.ts:8` |

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────┐
│                     Frontend (React)                          │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  localStorage (Browser)                                │   │
│  │  quorin.catalog     ── Products/Categories (overrides)│   │
│  │  quorin.accounts    ── Accounts + Orders + Gifts      │   │
│  │  quorin.currentAccountId  ── Logged-in user ID        │   │
│  │  quorin.theme       ── Brand/theme settings           │   │
│  │  quorin.checkoutLocks ── Gift redemption locks        │   │
│  │  quorin.clientFingerprint ── Gift lock identity       │   │
│  │  quorin.customRequests ── Custom product requests     │   │
│  │  quorin:cookies     ── Cookie consent                 │   │
│  │  medusa_auth_token  ── Medusa auth token              │   │
│  │  quorin_medusa_cart_id  ── Medusa cart identity       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Medusa SDK (partial integration)                      │   │
│  │  medusa.ts ── Client wrapper → localhost:9000          │   │
│  │  useMedusaCatalog.ts ── Fetches products/categories    │   │
│  │  useMedusaCart.ts ── Cart CRUD + checkout              │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Computed (no storage)                                 │   │
│  │  XP/Levels ── derived from orders (data/xp.ts)         │   │
│  │  Rewards/Gifts ── derived from account (data/gifts.ts) │   │
│  │  Reviews ── ephemeral component state                  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐   │
│  │  Static defaults                                       │   │
│  │  products.ts ── quorinData (3 categories, ~24 products)│   │
│  │  accounts.ts ── demo accounts (customer909, admin909)  │   │
│  │  xp.ts ── level ladder constants                       │   │
│  │  gifts.ts ── gift eligibility logic                    │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
          │
          │ (PARTIAL)
          ▼
┌───────────────────────────────────────────────────────────────┐
│  Medusa Backend (localhost:9000)                               │
│  @medusajs/medusa v2.16.0                                      │
│  ├── Categories: FEEDS → Navigation, CategorySection          │
│  ├── Cart: READ/WRITE (useMedusaCart)                         │
│  ├── Products: READ only (not used in product display)        │
│  └── Auth: SDK exists, NOT wired to login UI                  │
└───────────────────────────────────────────────────────────────┘
          │
          │ (NOT CONNECTED)
          ▼
┌───────────────────────────────────────────────────────────────┐
│  backend-backup/ (Prisma + Express)                            │
│  NOT used by any frontend code                                 │
│  Legacy/backup only                                            │
└───────────────────────────────────────────────────────────────┘
```

---

## Source of Truth Summary Table

| System | Primary Source | Persisted? | Medusa? | Backend DB? |
|--------|---------------|------------|---------|-------------|
| Products | `localStorage['quorin.catalog']` + `products.ts` | localStorage | Partial (fallback only) | No |
| Categories | `localStorage['quorin.catalog']` | localStorage | Yes (Navigation, CategorySection) | No |
| Cart | **Medusa API** | localStorage (cart ID only) | **Yes (primary)** | No |
| Orders | `localStorage['quorin.accounts']` | localStorage | No | No |
| Accounts | `localStorage['quorin.accounts']` | localStorage | No (SDK exists, unused) | No |
| XP/Levels | Computed from orders | **Never persisted** | No | No |
| Rewards/Gifts | Computed + `quorin.checkoutLocks` | localStorage (locks) | No | No |
| Reviews | Component state (ephemeral) | **Never persisted** | No | No |
| Theme | `localStorage['quorin.theme']` | localStorage | No | No |
| Admin Settings | `localStorage['quorin.catalog']` + `quorin.theme` | localStorage | No | No |
| Custom Requests | `localStorage['quorin.customRequests']` | localStorage | No | No |

---

## Critical Architectural Issues

### 1. No Persistent Backend
All data except the cart lives in `localStorage`. If a user clears their browser data, or switches devices, everything is lost. There is no server-side persistence for products, orders, accounts, or settings.

### 2. Two Catalog Sources, No Merge Strategy
`products.ts` defines 3 categories with ~24 products. `useMedusaCatalog()` fetches from Medusa and builds categories. They are never merged. Admin edits go to `localStorage` but not Medusa. Medusa products never appear in product display.

### 3. Admin Is Client-Side Only
`AdminCenter.tsx:317` — role check is `currentAccount?.profile.role !== 'admin'`. Anyone who knows the demo password `Asdfg909` or can edit localStorage can access admin mode. No server-side validation.

### 4. Cart Is the Only True Medusa System
The cart system (`useMedusaCart.ts`) is the only flow that reads and writes to Medusa. Everything else is localStorage or static data.

### 5. Orders Have No Creation Flow
Orders are hardcoded in `data/accounts.ts` demo data or manually added via localStorage. There is no "place order" flow that creates a real order record anywhere.

# Medusa Connectivity Evidence Report

## Executive Summary

Medusa is **partially wired** but **functionally disconnected** from the primary frontend state. The backend exists and has API methods defined, but the main shopping flow relies on `localStorage` with static product data (`products.ts`), not Medusa products or backend-powered cart.

**Status: D — Medusa hooks exist and connect to backend, but are not the primary data source.**

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                    │
│                                                          │
│  quorinStore.ts (localStorage)                           │
│  ├── quorin.catalog  ── static data from products.ts    │
│  ├── quorin.accounts   ── localStorage only             │
│  ├── quorin.theme        ── localStorage only           │
│  └── quorin.checkoutLocks  ── localStorage only         │
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │  App.tsx:136-137  ← Medusa hooks imported│           │
│  │  const medusaCategories = useMedusaCatalog()  │        │
│  │  const medusaCart = useMedusaCart()            │        │
│  └──────────────────────────────────────────┘           │
│         │                         │                      │
│         ▼ (used in Navigation)  ▼ (in App, not yet      │
│  Navigation.tsx:31           consumed for checkout)      │
│         │                                                  │
│  Medusa categories displayed in nav menus                 │
│  (but static products.ts still drives product pages)      │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  medusa.ts:5-10 — Medusa JS SDK Client                  │
│  URL: http://localhost:9000 (VITE_MEDUSA_BACKEND_URL)    │
│  Auth: localStorage["medusa_auth_token"]                 │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Medusa Backend (Express)                                │
│  @medusajs/medusa v2.16.0                                │
│  Port: 9000                                              │
│  Location: /home/dmannu/quorin-site/backend/             │
└─────────────────────────────────────────────────────────┘
```

---

## Evidence A: Medusa Backend Exists and Is Properly Configured

| File | Evidence |
|---|---|
| `backend/package.json` | Uses `@medusajs/medusa` v2.16.0 |
| `app/src/lib/medusa.ts:3` | `MEDUSA_BACKEND_URL = import.meta.env.VITE_MEDUSA_BACKEND_URL \|\| "http://localhost:9000"` |
| `app/src/lib/medusa.ts:5-10` | `new Client({ url: ..., auth: { token: localStorage.getItem("medusa_auth_token") \|\| "" } })` |
| `app/src/lib/medusa.ts:14`-151 | Full API wrapper: `getProducts`, `getProduct`, `getRegions`, `createCart`, `getCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `updateCart`, `completeCart`, `createCustomer`, `authenticate` |
| `app/src/lib/medusa.ts:141-143` | Auth token persisted: `localStorage.setItem("medusa_auth_token", data.token)` |

---

## Evidence B: Medusa Hooks Exist and Fetch from Backend

### useMedusaCatalog (`app/src/lib/useMedusaCatalog.ts`)
| Line | Evidence |
|---|---|
| `22-23` | `medusaStore.products.list({ limit: 100, order: '-created_at' })` |
| `26` | `buildCategoriesFromProducts(products)` — maps Medusa products → Category[] |
| `30` | Error message: `'Failed to load products. Is the backend running?'` |
| `36-38` | Auto-fetches on mount via `useEffect` |

### useMedusaCart (`app/src/lib/useMedusaCart.ts`)
| Line | Evidence |
|---|---|
| `87` | `medusaStore.carts.retrieve(cartId)` |
| `100` | `medusaApi.createCart()` |
| `116` | `medusaApi.addCartItem(targetCartId, variantId, 1)` |
| `136` | `medusaApi.updateCartItem(cartId, lineId, quantity)` |
| `150` | `medusaApi.removeCartItem(cartId, lineId)` |
| `29` | Cart ID stored in `localStorage['quorin_medusa_cart_id']` |
| `96-105` | Creates Medusa cart if no local cart ID exists |

---

## Evidence C: Where Medusa Is Actually Used

| File | Lines | Usage |
|---|---|---|
| `App.tsx` | `47-48` | Imports `useMedusaCart`, `useMedusaCatalog` |
| `App.tsx` | `136` | `const { categories: medusaCategories, loading: catalogLoading } = useMedusaCatalog()` |
| `App.tsx` | `137` | `const { cart: medusaCart, cartId, addItem: medusaAddItem, ... } = useMedusaCart()` |
| `Navigation.tsx` | `6,31` | `useMedusaCatalog()` — displays categories in nav menu |
| `CategorySection.tsx` | `5,206` | `useMedusaCatalog()` — fetches categories |

---

## Evidence D: Where Medusa Is NOT Used (Disconnect Points)

### 1. Product Display (PRIMARY DATA SOURCE)
| File | Line | Reality |
|---|---|---|
| `App.tsx` | `22` | `import { getProductId, quorinData, type Category, type Product } from '@/data/products'` |
| `App.tsx` | All product rendering | Uses `quorinData` from `products.ts` (static JSON, 270 lines) |
| `CategorySection.tsx` | `206` | Only section using `useMedusaCatalog` — but even here, `quorinData` drives the initial/default state |
| `History.tsx` | `2` | Imports `ProductPreview` — uses `quorinData` products |
| `ProductPreview.tsx` | All | Displays products from static data — no Medusa product fields used |

### 2. Account/Auth System
| File | Line | Reality |
|---|---|---|
| `quorinStore.ts` | `6,40-61` | Accounts stored entirely in `localStorage['quorin.accounts']` |
| `quorinStore.ts` | `47-60` | Account switching via `localStorage['quorin.currentAccountId']` |
| `data/accounts.ts` | All | Static account hydration — no Medusa auth API calls |

### 3. Checkout/Payment
| File | Line | Reality |
|---|---|---|
| `quorinStore.ts` | `8,90-95` | Checkout locks in `localStorage['quorin.checkoutLocks']` |
| `App.tsx` | `137` | `medusaCart` imported but not actively used in checkout flow — `quorinStore` checkoutLocks used instead |

### 4. Theme/Catalog Customization (Admin)
| File | Line | Reality |
|---|---|---|
| `AdminCenter.tsx` | All | Mutates `JSON.parse(JSON.stringify(quorinData))` — local clone only |
| `quorinStore.ts` | `62-66` | `saveCatalog()` writes to `localStorage['quorin.catalog']` only |
| `quorinStore.ts` | `68-75` | `saveTheme()` writes to `localStorage['quorin.theme']` only |

---

## Connectivity Status: D (Hooks Connected, UI Disconnected)

| Component | Connected to Medusa? | Primary Data Source |
|---|---|---|
| Navigation menu categories | Yes (`useMedusaCatalog`) | Medusa backend |
| Product pages/categories | No | `products.ts` static JSON |
| Cart | Partial (hooks exist) | `quorinStore` localStorage |
| Accounts/Auth | No | `products.ts` + localStorage |
| Admin catalog editing | No | `products.ts` + localStorage |
| Theme customization | No | localStorage |
| Checkout | No | localStorage + custom flow |

---

## What Needs to Happen for Full Medusa Integration

1. **Product pages** — Replace `quorinData` imports with `medusaStore.products.list()` or `useMedusaCatalog` results
2. **Cart flow** — Replace `quorinStore` checkout logic with `medusaApi.completeCart()` and Stripe/payment integration
3. **Accounts** — Replace localStorage accounts with Medusa `medusaApi.authenticate()` flow
4. **Admin changes** — Write catalog/theme updates to Medusa instead of localStorage

## Estimated Effort
- Navigation: Already connected (0 effort)
- Product display: Medium — needs data mapping from Medusa product schema to Quorin's `Product` interface
- Cart/checkout: Medium-Hard — needs payment gateway integration
- Accounts: Medium — needs auth flow wiring
- Admin: Medium — needs backend write endpoints

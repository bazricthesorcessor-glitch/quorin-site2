# Migration Plan — QUORIN

## Goal
Establish a **single source of truth** for all data systems, migrating from a fragmented localStorage + static data hybrid to a coherent backend-driven architecture. This plan covers the migration path from the current state documented in `architecture_audit.md` to a unified target state.

---

## 1. Current Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Frontend (React SPA)                                     │
│                                                           │
│  Products    → localStorage['quorin.catalog']            │
│  Categories  → localStorage['quorin.catalog']            │
│  Cart        → Medusa API (cart CRUD)                    │
│  Orders      → localStorage['quorin.accounts']           │
│  Accounts    → localStorage['quorin.accounts']           │
│  XP/Levels   → Computed (no storage)                     │
│  Rewards     → Computed + localStorage['quorin.checkoutLocks'] │
│  Reviews     → Component state (ephemeral)               │
│  Theme       → localStorage['quorin.theme']              │
│  Admin       → localStorage['quorin.catalog'] +          │
│                localStorage['quorin.theme']              │
│  Custom RQs  → localStorage['quorin.customRequests']     │
│                                                           │
│  Medusa Backend → Categories (read) + Cart (read/write)  │
│  backend-backup/ (Prisma)   → NOT connected              │
└──────────────────────────────────────────────────────────┘
```

**Problems:**
- No persistent backend for most data
- Two catalog sources with no merge strategy
- Admin changes are browser-local only
- Orders are hardcoded demo data, never created via a flow
- Reviews are ephemeral
- XP is computed but the spend data (orders) is localStorage-only
- Cart is the only Medusa-backed system

---

## 2. Target Architecture

```
┌──────────────────────────────────────────────────────────┐
│  Frontend (React SPA)                                     │
│                                                           │
│  Products    → Medusa (read) / Admin API (write)         │
│  Categories  → Medusa (read) / Admin API (write)         │
│  Cart        → Medusa API (read/write) [unchanged]       │
│  Orders      → Admin API (create/read)                    │
│  Accounts    → Medusa auth (authenticate)                 │
│  XP/Levels   → Computed from Admin API orders             │
│  Rewards     → Computed + Admin API gift tracking         │
│  Reviews     → Admin API (create/read)                    │
│  Theme       → Admin API settings endpoint                │
│  Admin       → Admin API (all writes)                     │
│  Custom RQs  → Admin API                                │
│                                                           │
│  Medusa Backend → Products, Categories, Cart, Auth       │
│  Custom API (Express/Fastify/etc) → Orders, Accounts,    │
│    Reviews, Theme Settings, Custom Requests, Gift Tracking   │
└──────────────────────────────────────────────────────────┘
```

**Principles:**
- **Medusa** handles commerce data: products, categories, cart, checkout, auth
- **Custom API** handles business logic: orders, accounts, reviews, theme settings, custom requests, gifts
- **Computed values** (XP, discounts, gift eligibility) stay in React but read from the API layer
- **localStorage** is removed as a persistence layer (except for non-critical UX prefs like cookie consent)

---

## 3. Migration Order

### Phase 1: Foundation (No user impact)
**Goal:** Set up the custom backend API and data models without touching frontend behavior.

1. **Schema design** — Define Prisma/SQL models for: orders, accounts, reviews, theme_settings, custom_requests, gift_tracking
2. **API scaffolding** — Set up Express/Fastify/Next.js API routes with the endpoints listed below
3. **Authentication layer** — Replace localStorage account auth with Medusa auth (`medusa.ts:15` auth flow wired to login UI)
4. **Data export utility** — Script to read `localStorage['quorin.accounts']`, `quorin.catalog`, `quorin.theme` and seed the new database

**No frontend changes.** This phase is purely backend setup and data migration tooling.

### Phase 2: Accounts & Auth
**Goal:** Replace localStorage accounts with Medusa auth + custom API account profiles.

1. Wire `medusa.ts:15` (`medusaClient.auth.createToken`) to the login modal in `Navigation.tsx:607-944`
2. Create `/api/accounts` endpoints: `POST /api/accounts` (register), `GET /api/accounts/:id` (profile), `PATCH /api/accounts/:id` (update profile)
3. Replace `data/accounts.ts` demo accounts with real accounts
4. Replace `quorinStore.ts` account functions with API calls
5. Keep localStorage for `quorin.currentAccountId` (session token) during transition

**User impact:** Login flow changes, but existing localStorage accounts are migrated to the backend.

### Phase 3: Orders
**Goal:** Replace hardcoded demo orders with a real order creation flow.

1. Create `/api/orders` endpoints: `POST /api/orders` (create order), `GET /api/orders` (list), `PATCH /api/orders/:id` (status/comment)
2. Modify `CartDrawer.tsx:40-48` — after Medusa `completeCart()`, create an order via `POST /api/orders`
3. Move `AccountOrder` type from `data/accounts.ts` to the new orders table (no longer nested in accounts)
4. `History.tsx:12-43` reads from API instead of `currentAccount.orders`

**User impact:** Orders persist across devices and refresh. Return window logic in `History.tsx:29-32` stays the same.

### Phase 4: Products & Categories (Admin writes)
**Goal:** Admin edits persist to backend instead of localStorage.

1. Create `/api/products` endpoints: `GET`, `POST`, `PATCH`, `DELETE`
2. Create `/api/categories` endpoints: `GET`, `POST`, `PATCH`, `DELETE`
3. `AdminCenter.tsx:433,631-642` — replace localStorage writes with API calls
4. Keep Medusa as the source of truth for product data (Admin writes sync to both Medusa and custom API)
5. `useMedusaCatalog.ts:19` becomes the **primary** data fetch (not fallback)
6. `products.ts:33-270` `quorinData` becomes a seed/default, not the runtime source

**User impact:** Admin changes now affect all users. Product display reads from Medusa instead of static data.

### Phase 5: Reviews
**Goal:** Make reviews persistent and linked to accounts.

1. Create `/api/reviews` endpoints: `POST /api/reviews`, `GET /api/products/:id/reviews`
2. `ProductPreview.tsx:23` — replace local `setReviews` with API call
3. Store: `productId`, `accountId`, `author`, `text`, `date`, `rating`

**User impact:** Reviews survive refresh and are visible to all users.

### Phase 6: Theme & Settings
**Goal:** Admin theme changes persist to backend.

1. Create `/api/settings` endpoint: `PATCH /api/settings` (theme), `GET /api/settings` (read)
2. `AdminCenter.tsx:635-638` — replace localStorage theme writes with API call
3. `App.tsx:128` — load theme from API on mount instead of localStorage

**User impact:** Theme changes apply site-wide, not just per-user.

### Phase 7: Cleanup
**Goal:** Remove localStorage persistence layer.

1. Remove `quorinStore.ts` localStorage functions (except cookie consent)
2. Remove `localStorage['quorin.catalog']`, `quorin.accounts`, `quorin.theme`, `quorin.checkoutLocks`, `quorin.customRequests`
3. Remove `data/accounts.ts` demo accounts
4. Clean up `products.ts` — keep as seed data only, remove from runtime imports
5. Replace `Object.assign(quorinData, nextCatalog)` with API-driven state updates

**User impact:** No behavioral change — all data is now API-driven.

---

## 4. Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Data loss during migration** | Critical | Phase 1 includes a data export utility that backs up all localStorage before writing to the new DB |
| **Admin changes lost during transition** | High | Admin localStorage data is read once during migration and written to the API. After migration, localStorage is cleared |
| **Cart data inconsistency** | Medium | Cart lives on Medusa and is unaffected by most migration steps. Only `quorin_medusa_cart_id` localStorage key remains |
| **User accounts locked out** | High | Demo accounts (`customer909`, `admin909`) are migrated with their passwords to the new account system. Fallback to localStorage auth during transition |
| **Orders created during migration** | Medium | Orders created after Phase 3 start go to the new API. Orders created before Phase 3 go to the migration script |
| **Medusa backend unavailable** | Medium | During migration, all Medusa calls should have fallback to static data (current behavior). Flag Medusa connectivity status |
| **Custom backend downtime** | High | API should have graceful fallbacks — show cached data or error state if API is unavailable |
| **Breaking existing navigation** | Medium | Navigation already uses `useMedusaCatalog()` for categories. Phase 4 makes this the primary source — no breaking changes if done incrementally |

---

## 5. Rollback Plan

### Trigger conditions
- Data migration fails (localStorage → API import)
- Custom backend cannot handle production load
- Medusa integration causes checkout failures
- Admin changes break product display

### Rollback steps
1. **Stop the custom backend API** — frontend falls back to localStorage
2. **Restore localStorage** — migration script created a backup before any writes. Restore from backup
3. **Revert frontend changes** — Git revert the migration commits, keep `products.ts` and `quorinStore.ts` as-is
4. **Medusa fallback** — If Medusa is down, `useMedusaCatalog.ts:30` error message triggers. Keep `products.ts` as the fallback data source

### Rollback timeline
- Phase 1 (backend setup): No rollback needed — nothing frontend changes
- Phase 2-6: Each phase can be individually rolled back by reverting that phase's commits
- Phase 7 (cleanup): If rolled back, localStorage functions remain in `quorinStore.ts`

### Data safety
- All localStorage data is backed up before migration begins
- No data is deleted from localStorage until Phase 7 cleanup
- Medusa cart data is never touched by the migration

---

## 6. Data Migration Strategy

### Migration Script: `migrate-localstorage-to-api`

**Input:** All localStorage keys defined in `quorinStore.ts:5-13`

**Process:**

| Source (localStorage) | Destination (API/DB) | Transformation |
|----------------------|---------------------|----------------|
| `quorin.accounts` | `accounts` table + `orders` table | Each `AccountRecord` → account row + order rows (extract `orders[]`) |
| `quorin.catalog` | `products` + `categories` tables | Parse `quorinData` categories → category rows, products → product rows |
| `quorin.theme` | `settings` table | Flat key-value store |
| `quorin.customRequests` | `custom_requests` table | Each request → row with account reference |
| `quorin.checkoutLocks` | `gift_tracking` table | Parse lock keys → gift redemption records |
| `medusa_auth_token` | — | Not migrated (session-scoped, expires) |
| `quorin_medusa_cart_id` | — | Not migrated (Medusa-side cart identity) |

**Execution:**
1. Read all localStorage keys
2. Create a JSON backup file in the admin tool
3. Send bulk inserts to the custom API
4. Verify counts match (e.g., "3 accounts migrated, 6 orders migrated, 24 products migrated")
5. Log success/failure for each entity type

**Post-migration:**
- Admin panel shows "Migration Complete" banner
- localStorage keys are cleared (except cookie consent)
- Frontend switches to API-driven data fetching

---

## 7. Admin Migration Strategy

### Current state
- `AdminCenter.tsx:433,631-642` writes to localStorage
- No backend sync
- Changes only affect the current browser
- No versioning or rollback

### Migration steps for admin
1. **Add API layer to AdminCenter** — Each "Save" button (save category, save item, save theme, save all) sends a PATCH/POST to the corresponding API endpoint
2. **Keep localStorage as draft buffer** — Admin edits still hold in React state until saved. On save, write to API + optionally keep a localStorage copy as a draft buffer during transition
3. **Add conflict detection** — If two admins edit the same product, the last write wins (no locking required initially). Add a `updatedAt` field to detect stale edits
4. **Add audit log** — Log every admin write: `{ action, field, userId, timestamp }`
5. **Add versioning** — Store previous catalog versions in the API (simple JSON column or separate version table)
6. **Add role enforcement** — Admin route guarded by API auth, not just `currentAccount?.profile.role`

### Admin data flow (post-migration)
```
AdminCenter (draft state)
    │
    ├── Save category ──→ PATCH /api/categories/:id ──→ DB
    │                    ──→ Sync to Medusa (if product data changed)
    │
    ├── Save item ──→ PATCH /api/products/:id ──→ DB
    │                 ──→ Sync to Medusa (product data)
    │
    ├── Save theme ──→ PATCH /api/settings ──→ DB
    │
    └── Save all ──→ Batch PATCH to all endpoints ──→ DB + Medusa sync
```

### Admin migration considerations
- The existing `quorinData` object (from `products.ts`) should be used as the **seed** for the product database
- Admin edits to `quorin.catalog` should be merged into the new database
- Theme settings from `quorin.theme` should be migrated to the settings table

---

## 8. Product Migration Strategy

### Current state
- Default catalog: `products.ts:33-270` (3 categories, ~24 products)
- Admin edits: `localStorage['quorin.catalog']`
- Medusa: Read-only for categories (`useMedusaCatalog.ts:19`)
- Product display: Uses `quorinData` directly from `products.ts`
- Image mapping: `ProductShowcase.tsx:6-27` (static paths)

### Migration steps for products

1. **Seed the product database** — Parse `quorinData` from `products.ts` and create product rows in the custom API
2. **Sync with Medusa** — Products should be dual-stored:
   - Custom API: for admin-managed metadata (MRP, discount, tags, features)
   - Medusa: for commerce data (variants, pricing, inventory, regions)
   - `medusa-product-map.ts` already maps product slugs to categories — use this for alignment
3. **Update product display** — Replace `import { quorinData }` in `App.tsx:22` with `useMedusaCatalog()` results
4. **Update image handling** — `ProductShowcase.tsx:6-27` `productImageMap` should read image URLs from the product database/Medusa instead of static mapping
5. **Admin writes** — `AdminCenter.tsx` writes to the custom API (metadata) AND Medusa (commerce data)
6. **Keep `products.ts` as seed** — Remove from runtime imports, keep as a migration/seed script

### Product data flow (post-migration)
```
┌─────────────────────────────────────────────────┐
│  Product Display (frontend)                       │
│                                                   │
│  useMedusaCatalog() ──→ Medusa products          │
│         │                                           │
│         ├─→ Name, price, images, variants          │
│         ├─→ Categories from medusa-product-map.ts  │
│         └─→ Fallback: products.ts (if Medusa down) │
│                                                   │
│  AdminCenter ──→ PATCH /api/products/:id ──→ DB   │
│         │                                          │
│         └─→ PATCH products on Medusa ──→ Medusa    │
└─────────────────────────────────────────────────┘
```

### Product migration considerations
- `ProductShowcase.tsx:6-27` `productImageMap` references 20+ static image paths — these should be migrated to the product database
- Missing category images (`/category-resin.jpg`, `/category-candle.jpg`, `/category-soap.jpg` noted in `navigation_audit.md`) should be added during migration
- `medusa-product-map.ts` slug-to-category mapping should be the single source of truth for category assignment

---

## 9. Endpoint Specification

### Custom API Endpoints

| Method | Path | Purpose | Admin? |
|--------|------|---------|--------|
| `POST` | `/api/auth/login` | Login via Medusa credentials | No |
| `POST` | `/api/accounts` | Register new account | No |
| `GET` | `/api/accounts/:id` | Get account profile + orders | Authenticated |
| `PATCH` | `/api/accounts/:id` | Update account profile | Authenticated |
| `POST` | `/api/orders` | Create order (post-checkout) | Authenticated |
| `GET` | `/api/orders` | List user orders | Authenticated |
| `PATCH` | `/api/orders/:id` | Update order status/comment | Admin |
| `POST` | `/api/products` | Create product (admin) | Admin |
| `PATCH` | `/api/products/:id` | Update product (admin) | Admin |
| `DELETE` | `/api/products/:id` | Delete product (admin) | Admin |
| `GET` | `/api/products` | List products | Public |
| `POST` | `/api/categories` | Create category (admin) | Admin |
| `PATCH` | `/api/categories/:id` | Update category (admin) | Admin |
| `DELETE` | `/api/categories/:id` | Delete category (admin) | Admin |
| `GET` | `/api/categories` | List categories | Public |
| `POST` | `/api/reviews` | Submit product review | Authenticated |
| `GET` | `/api/products/:id/reviews` | Get product reviews | Public |
| `PATCH` | `/api/settings` | Update theme/settings (admin) | Admin |
| `GET` | `/api/settings` | Read current settings | Public |
| `POST` | `/api/custom-requests` | Submit custom request | Public |
| `GET` | `/api/custom-requests` | List custom requests | Admin |
| `POST` | `/api/gifts/redeem` | Redeem a gift (level 10, birthday) | Authenticated |

### Medusa Endpoints (already in use)

| Method | Path | Used By |
|--------|------|---------|
| `POST` | `/store/auth` | `medusa.ts:15` (auth token creation) |
| `GET` | `/store/products` | `useMedusaCatalog.ts:19` |
| `GET` | `/store/products/:id` | `useMedusaCatalog.ts:20` |
| `POST` | `/store/carts` | `useMedusaCart.ts:100` |
| `GET` | `/store/carts/:id` | `useMedusaCart.ts:87` |
| `POST` | `/store/carts/:id/line-items` | `useMedusaCart.ts:116` |
| `POST` | `/store/carts/:id/line-items/:line_id` | `useMedusaCart.ts:136` |
| `DELETE` | `/store/carts/:id/line-items/:line_id` | `useMedusaCart.ts:150` |
| `POST` | `/store/carts/:id/payment-sessions` | `useMedusaCart.ts:75` |
| `POST` | `/store/carts/:id/complete` | `useMedusaCart.ts:76` |

---

## 10. Timeline Estimate

| Phase | Scope | Estimate |
|-------|-------|----------|
| 1. Foundation | Schema, API scaffolding, data export tool | 1-2 weeks |
| 2. Accounts & Auth | Login flow, account API, Medusa auth wiring | 1 week |
| 3. Orders | Order API, checkout integration, History page | 1 week |
| 4. Products & Categories | Product API, admin writes, Medusa sync | 1-2 weeks |
| 5. Reviews | Reviews API, ProductPreview integration | 3-5 days |
| 6. Theme & Settings | Settings API, admin theme writes | 3-5 days |
| 7. Cleanup | Remove localStorage, clean up imports | 3-5 days |

**Total estimated: 5-7 weeks**

---

## 11. Pre-Migration Checklist

- [ ] Backup all localStorage data (create export utility first)
- [ ] Verify Medusa backend is running and accessible at `localhost:9000`
- [ ] Confirm `backend-backup/` is not being used by any process
- [ ] Document current product count, category count, order count from localStorage
- [ ] Prepare rollback plan documentation
- [ ] Set up the custom backend API project (or extend `backend-backup/`)
- [ ] Define the database schema and run migrations
- [ ] Create all API endpoints listed in Section 9
- [ ] Build the data export/import tool
- [ ] Test migration on a staging copy of the data
- [ ] Verify Medusa API connectivity

---

## 12. Post-Migration Validation

After each phase completes:

| Check | How to Verify |
|-------|--------------|
| Accounts work | Login with `customer909`/`Asdfg909` — profile loads from API |
| Orders persist | Create order → refresh page → order still visible in History |
| Products load | Homepage products render from Medusa (check network tab) |
| Admin saves | Edit a product in AdminCenter → save → verify in API + Medusa |
| Reviews persist | Add a review → refresh → review still visible |
| Theme saves | Change accent color in AdminCenter → save → verify site-wide |
| Cart works | Add items → verify in Medusa backend via `/store/carts/:id` |
| No localStorage leakage | DevTools → Application → Local Storage → only `quorin:cookies` should remain |

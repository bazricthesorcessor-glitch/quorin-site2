# Implementation Roadmap — QUORIN

## Goal
Convert QUORIN from multi-source-of-truth (localStorage + static data + partial Medusa) to single-source-of-truth (Medusa for commerce, custom API for business data).

**Business priority order:**
1. Product editing (Products & Categories)
2. Admin persistence (Admin settings, theme, catalog)
3. Orders (real order creation flow)
4. Accounts (Medusa auth, real accounts)
5. Reviews (persistent, visible to all)

---

## Phase 1: Products & Categories

### Objective
Make the product catalog authoritative and admin-editable. Admin changes persist to a backend database and sync to Medusa. Product display reads from Medusa, not from `products.ts`.

### Files Affected

| File | Role | Change |
|------|------|--------|
| `app/src/data/products.ts` | Static default catalog | Becomes seed data only, removed from runtime imports |
| `app/src/lib/useMedusaCatalog.ts` | Fetches from Medusa | Becomes **primary** data fetch (not fallback) |
| `app/src/lib/medusa-product-map.ts` | Slug-to-category mapping | Single source of truth for category assignment |
| `app/src/sections/ProductShowcase.tsx` | Product grid rendering | Reads image URLs from Medusa product data instead of `productImageMap` |
| `app/src/sections/CategorySection.tsx` | Category cards | Uses `useMedusaCatalog()` results as primary (already partially connected) |
| `app/src/components/Navigation.tsx` | Nav category links | Already uses `useMedusaCatalog()` — no change needed |
| `app/src/App.tsx:22` | Product import | `import { quorinData }` replaced by `useMedusaCatalog()` results |
| `app/src/App.tsx:136` | Catalog state | Replaced by Medusa catalog from hook |

### Estimated Complexity
**Medium-High** — This is the most impactful phase. It changes the primary data source for the most visible part of the application. Requires:
- Backend product/category API
- Medusa product sync (write path, not just read)
- Image URL migration from static paths to database
- `products.ts` removal from runtime imports

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Medusa backend unavailable during migration | High | Fallback to `products.ts` static data until sync is confirmed |
| Product display breaks if Medusa products don't match Quorin schema | High | Schema alignment step: map Medusa product fields to Quorin `Product` interface before switching display |
| Image paths change from static `public/` to Medusa storage URLs | Medium | Add image URL mapping layer during migration; verify all 20+ image paths in `ProductShowcase.tsx:6-27` |
| Two catalog sources conflict during transition | Medium | During transition, localStorage catalog takes precedence; after cutover, localStorage is disabled |

### Rollback Plan
- Revert to `products.ts` runtime import in `App.tsx:22`
- Keep `localStorage['quorin.catalog']` as fallback until Phase 7 cleanup
- Keep `useMedusaCatalog()` as read-only (no write path)
- No data loss — products still in `products.ts`

### Database Tables / Models

#### `products`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Custom API internal ID |
| `medusa_product_id` | UUID (FK) | Link to Medusa product |
| `name` | string | |
| `slug` | string (unique) | From `getProductId()` in `products.ts:278-288` |
| `type` | string | e.g. "kit", "set" |
| `variant` | string | |
| `size` | string | |
| `price` | decimal | |
| `mrp` | decimal | |
| `cost_price` | decimal | |
| `discount` | string | |
| `description` | text | |
| `image_urls` | jsonb | Array of image URLs (migrated from `productImageMap`) |
| `tags` | jsonb | Array of strings |
| `features` | jsonb | Array of strings |
| `pieces` | integer | |
| `compatible_with` | jsonb | Array of strings |
| `category_id` | FK → categories | |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

#### `categories`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Custom API internal ID |
| `medusa_category_id` | UUID (FK) | Link to Medusa product category |
| `slug` | string (unique) | `resin-art`, `candle-making`, `soap-making` |
| `title` | string | |
| `description` | text | |
| `hero_image` | string | (migrated from `productImageMap` references) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/products` | Public | List all products (with category + image data) |
| `GET` | `/api/products/:slug` | Public | Single product by slug |
| `POST` | `/api/products` | Admin | Create product |
| `PATCH` | `/api/products/:slug` | Admin | Update product (syncs to Medusa) |
| `DELETE` | `/api/products/:slug` | Admin | Delete product (marks as soft-delete in Medusa) |
| `GET` | `/api/categories` | Public | List categories with product counts |
| `GET` | `/api/categories/:slug` | Public | Single category with products |
| `POST` | `/api/categories` | Admin | Create category |
| `PATCH` | `/api/categories/:slug` | Admin | Update category |
| `DELETE` | `/api/categories/:slug` | Admin | Delete category |

---

## Phase 2: Admin Persistence

### Objective
Move AdminCenter from localStorage writes to API writes. Admin changes now persist across all users and devices. Theme settings and catalog edits are server-backed.

### Files Affected

| File | Role | Change |
|------|------|--------|
| `app/src/components/AdminCenter.tsx` | Admin dashboard UI | Replace `saveCatalog()` and `saveTheme()` localStorage calls with API PATCH/POST |
| `app/src/lib/quorinStore.ts:62-75` | localStorage save functions | Deprecated — replaced by API calls |
| `app/src/App.tsx:296` | `saveCatalog()` useEffect | Calls API instead of localStorage |
| `app/src/App.tsx:300` | `saveTheme()` useEffect | Calls API instead of localStorage |
| `app/src/App.tsx:128` | `loadTheme()` | Loads from API on mount instead of localStorage |
| `app/src/index.css` | CSS custom properties | Theme applied via CSS vars — no change, only data source changes |

### Estimated Complexity
**Medium** — Heavily concentrated in `AdminCenter.tsx:433,631-642`. The UI is already built; only the persistence layer changes.

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Admin saves fail silently if API is down | High | Show error toast from AdminCenter; fall back to localStorage temporarily |
| Theme changes only apply to current user during transition | Medium | Theme API endpoint serves globally — after cutover, all users see new theme |
| Conflict: two admins edit same product simultaneously | Medium | Last-write-wins with `updatedAt` check; stale edit warning shown to the second admin |
| `AdminCenter.tsx` 657 lines — large change surface | Low | Changes are isolated to 3 save paths; UI state management unchanged |

### Rollback Plan
- Revert `AdminCenter.tsx` save handlers to call `quorinStore.ts` localStorage functions
- Theme still loads from localStorage (`App.tsx:128`)
- All current admin edits remain in localStorage
- No data loss — localStorage is not cleared until Phase 7

### Database Tables / Models

#### `settings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | Single row (singleton) |
| `brand_name` | string | |
| `tagline` | string | |
| `font_family` | string | |
| `accent_color` | string | |
| `teal_color` | string | |
| `bg_style` | jsonb | `{ dominant, textPrimary, textSecondary }` |
| `updated_at` | timestamp | |

### API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `GET` | `/api/settings` | Public | Read current theme/settings |
| `PATCH` | `/api/settings` | Admin | Update theme/settings |
| `GET` | `/api/admin/audit-log` | Admin | List admin edit history |

### Frontend Components Affected
- `AdminCenter.tsx` — save handlers (primary change)
- `App.tsx` — `loadTheme()`, `saveCatalog()`, `saveTheme()` data flow
- No other components — AdminCenter is self-contained

---

## Phase 3: Orders

### Objective
Replace hardcoded demo orders in `data/accounts.ts` with a real order creation flow. Orders are created after checkout via Medusa `completeCart()`, persisted to the custom API, and displayed in `History.tsx`.

### Files Affected

| File | Role | Change |
|------|------|--------|
| `app/src/sections/History.tsx:12-43` | Order display | Reads from API (`GET /api/orders`) instead of `currentAccount.orders` |
| `app/src/sections/History.tsx:29-32` | Return window logic | Unchanged — still `3-day window` check on order date |
| `app/src/components/CartDrawer.tsx:40-48` | Checkout completion | After `medusaApi.completeCart()`, call `POST /api/orders` |
| `app/src/data/accounts.ts:17-23` | `AccountOrder` type | Moved to API response type; no longer nested in account record |
| `app/src/data/accounts.ts:111-118` | Demo orders | Migrated to API database; demo data removed from runtime |
| `app/src/App.tsx:137` | Cart state | After `useMedusaCart` completeCart, trigger order creation |
| `app/src/lib/quorinStore.ts:62-66` | `saveCatalog()` | Not directly affected, but `quorin.accounts` no longer contains orders |

### Estimated Complexity
**Medium** — Requires wiring the checkout completion flow to the new order API. The `AccountOrder` type definition moves but the data shape is mostly the same.

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Order created before checkout completes (race condition) | High | Order creation only triggered after `completeCart()` resolves successfully |
| Demo orders lost during migration | Critical | Migration script reads `quorin.accounts` → extracts `orders[]` → creates order rows in DB |
| History page shows nothing if API is down | Medium | Fallback: show demo orders from a cached version during transition |
| Return flow changes from localStorage to API | Low | `PATCH /api/orders/:id` handles status/comment updates; same UI in `History.tsx:29-32` |

### Rollback Plan
- `History.tsx` falls back to `currentAccount.orders` (localStorage)
- Orders still nested in account records during transition
- Demo data in `accounts.ts` not removed until Phase 7
- No order creation flow active until cutover — cart completes normally on Medusa

### Database Tables / Models

#### `orders`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `account_id` | FK → accounts | |
| `medusa_cart_id` | UUID | Link to Medusa cart that was completed |
| `product` | jsonb | Snapshot of product at time of order (from Medusa product data) |
| `product_price` | decimal | Locked at time of purchase |
| `order_date` | timestamp | |
| `status` | enum | `'pending' | 'processing' | 'delivered' | 'return_requested' | 'returned'` |
| `comment` | text | User-provided return comment |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

#### Migration note
The `AccountOrder` type in `accounts.ts:17-23` has `product: Product` — the new `orders` table stores the product as a JSON snapshot (not a FK to products table) to preserve the state at time of purchase.

### API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/orders` | Authenticated | Create order after checkout |
| `GET` | `/api/orders` | Authenticated | List user's orders |
| `PATCH` | `/api/orders/:id` | Authenticated | Update order status/comment (return flow) |
| `PATCH` | `/api/orders/:id` | Admin | Admin order management (status override) |

### Frontend Components Affected
- `History.tsx` — order list rendering and return flow
- `CartDrawer.tsx` — trigger order creation after checkout
- `App.tsx` — connect `useMedusaCart` completeCart to order creation
- `data/accounts.ts` — remove demo orders from runtime

---

## Phase 4: Accounts

### Objective
Replace localStorage-only accounts with Medusa authentication + custom API account profiles. Real account registration, login, and profile management. Admin access enforced server-side.

### Files Affected

| File | Role | Change |
|------|------|--------|
| `app/src/components/Navigation.tsx:607-944` | Login modal | Replaces localStorage validation with Medusa auth (`medusa.ts:15`) + API account profile fetch |
| `app/src/lib/medusa.ts:14-15` | Medusa auth SDK | Wired to login flow (currently unused) |
| `app/src/data/accounts.ts` | Demo accounts + types | Migrated to DB; demo data removed from runtime |
| `app/src/lib/quorinStore.ts:40-61` | Account load/switch | Replaced with API calls |
| `app/src/App.tsx:317` | Admin role check | Server-enforced via API, not client-side `profile.role` check |
| `app/src/App.tsx:~115` | `currentAccount` state | Loaded from API instead of localStorage |
| `app/src/components/ProfileModal.tsx` | Profile display | Fetches from API |

### Estimated Complexity
**Medium** — Requires wiring Medusa auth SDK to the login UI, creating the account profile API, and migrating demo accounts.

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Demo accounts (`customer909`, `admin909`) locked out after migration | High | Migrate demo account credentials to new account table; add temporary localStorage auth fallback |
| Medusa auth flow doesn't match current login UX | Medium | Map Medusa auth response to Quorin account profile shape |
| Admin role check moves from client to server | Medium | API returns role in account profile; client still uses `currentAccount.profile.role` for UI gating |
| Session persistence (token) handling | Medium | Keep `medusa_auth_token` in localStorage; add token refresh logic |

### Rollback Plan
- Login modal falls back to localStorage validation (`findAccountByIdentifierInAccounts`)
- `quorin.accounts` localStorage still populated during transition
- `currentAccount` loaded from localStorage if API fails
- Demo accounts not removed until Phase 7

### Database Tables / Models

#### `accounts`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `medusa_customer_id` | UUID (FK) | Link to Medusa customer |
| `identifier` | string | ID, email, or phone used to login |
| `role` | enum | `'customer' | 'admin'` |
| `display_name` | string | |
| `email` | string | |
| `phone` | string | |
| `address` | string | |
| `city` | string | |
| `bio` | text | |
| `birthday` | date | |
| `level10_gift_redeemed` | boolean | |
| `birthday_gift_years` | jsonb | Array of years |
| `birthday_change_years` | jsonb | Array of years |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/auth/login` | Public | Login via Medusa credentials, returns session token + account profile |
| `POST` | `/api/accounts` | Public | Register new account (creates Medusa customer + profile) |
| `GET` | `/api/accounts/me` | Authenticated | Get current account profile + orders + XP |
| `PATCH` | `/api/accounts/me` | Authenticated | Update account profile |

### Frontend Components Affected
- `Navigation.tsx` — login modal auth flow
- `ProfileModal.tsx` — profile data source
- `App.tsx` — `currentAccount` initialization
- `AdminCenter.tsx` — admin role check (unchanged logic, different data source)

---

## Phase 5: Reviews

### Objective
Make reviews persistent and visible to all users. Reviews are linked to accounts and products, stored in the custom API.

### Files Affected

| File | Role | Change |
|------|------|--------|
| `app/src/components/ProductPreview.tsx:23` | Add review | `setReviews([...product.reviews, ...])` replaced with API POST |
| `app/src/components/ProductPreview.tsx:101-118` | Review display | Fetches from API (`GET /api/products/:id/reviews`) instead of local state |
| `app/src/data/products.ts:20-24` | `ProductReview` type | Kept as response type; removed from product object |
| `app/src/sections/ProductShowcase.tsx` | Product rendering | No reviews field on products from Medusa — reviews fetched separately |

### Estimated Complexity
**Low-Medium** — Simple CRUD on a single entity. The UI already exists in `ProductPreview.tsx:101-118`; only the data layer changes.

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Reviews disappear if API is temporarily down | Low | Cache last-known reviews in React state during transition |
| Spam / abuse | Low | Add rate limiting and simple moderation (no admin approval required initially) |
| No rating system in current UI | Low | `ProductReview` type only has `author`, `text`, `date` — no star rating. Add rating field in DB schema if needed later |

### Rollback Plan
- `ProductPreview.tsx:23` falls back to local `setReviews`
- Reviews ephemeral but not lost — just per-session
- No DB dependency until cutover

### Database Tables / Models

#### `reviews`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID (PK) | |
| `product_slug` | string | FK or reference to products table |
| `account_id` | FK → accounts | |
| `author` | string | From account profile |
| `text` | text | |
| `rating` | integer (nullable) | Optional — not in current UI |
| `created_at` | timestamp | |

### API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/reviews` | Authenticated | Submit product review |
| `GET` | `/api/products/:slug/reviews` | Public | Get product reviews |

### Frontend Components Affected
- `ProductPreview.tsx` — review form + display

---

## Phase 6: Cleanup

### Objective
Remove localStorage as a persistence layer. All data is now API-driven. Remove dead localStorage keys, demo data, and static runtime imports.

### Files Affected

| File | Role | Change |
|------|------|--------|
| `app/src/lib/quorinStore.ts` | localStorage functions | Remove `saveCatalog`, `loadCatalog`, `saveAccounts`, `loadAccounts`, `saveTheme`, `loadTheme`, `saveCheckoutLocks`, `loadCheckoutLocks`, `saveCustomRequest`, `loadCustomRequests` |
| `app/src/App.tsx:22` | Product import | `import { quorinData }` removed — replaced by `useMedusaCatalog()` |
| `app/src/App.tsx:122-137` | Data loading | All `load*()` calls replaced with API fetches |
| `app/src/App.tsx:296-300` | Data saving | All `save*()` useEffects replaced with API calls |
| `app/src/data/accounts.ts` | Demo accounts | Removed from runtime; kept as migration seed reference |
| `app/src/data/products.ts` | Static catalog | Removed from runtime; kept as migration seed reference |
| `app/src/lib/quorinStore.ts:5-15` | STORAGE_KEYS | Remove all keys except `quorin:cookies` |

### Estimated Complexity
**Medium** — Large surface area but low risk if previous phases are validated. The risk is in breaking references.

### Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Removing localStorage breaks pages still using it | High | Each localStorage key is removed one at a time, only after its phase is validated |
| Breaking `quorinStore.ts` | Medium | Keep `cn()` utility and `quorin:cookies` key; remove everything else |
| Breaking XP computation (depends on orders) | Medium | XP computation reads from API orders; verify `App.tsx:~128-131` after orders phase |
| Gift system breaks (depends on checkoutLocks) | Medium | Gift locks migrate to `gift_tracking` table in Phase 2 |

### Rollback Plan
- localStorage functions restored from git
- `products.ts` and `accounts.ts` re-imported into runtime
- All localStorage keys reactivated in `quorinStore.ts`
- Each key can be reactivated individually without full rollback

### Database Tables / Models
No new tables. This phase removes client-side state that was previously backed by the tables created in Phases 1-5.

### API Endpoints
No new endpoints. This phase removes client-side fallbacks that made API non-critical.

### Frontend Components Affected
- `App.tsx` — large refactor of data loading/saving flow
- `quorinStore.ts` — remove localStorage functions
- `products.ts` — remove from runtime imports
- `accounts.ts` — remove from runtime imports
- `Navigation.tsx` — remove localStorage account auth fallback
- `CartDrawer.tsx` — remove localStorage checkout lock fallback

---

## Cross-Phase Considerations

### Data Migration (Pre-Phase 1)
Before Phase 1 begins, run the data export/import tool:
- Read all localStorage keys
- Back up to JSON
- Import into custom API database
- Verify counts match

### Shared Dependencies
| Dependency | Used In Phases | Notes |
|-----------|---------------|-------|
| Medusa SDK (`medusa.ts`) | 1, 4 | Already imported; auth wired in Phase 4, product sync in Phase 1 |
| `useMedusaCatalog.ts` | 1, 2 | Becomes primary data source in Phase 1 |
| `useMedusaCart.ts` | 3 | Unchanged — already Medusa-backed |
| `data/xp.ts` | 3, 4 | XP computation unchanged — still derived from orders |
| `data/gifts.ts` | 3, 4 | Gift logic unchanged — still derived from account/orders |
| `data/accounts.ts` | 3, 4, 6 | Demo data used through Phase 4, removed in Phase 6 |
| `data/products.ts` | 1, 2, 6 | Seed data through Phase 2, removed from runtime in Phase 6 |

### Auth Flow Throughout Migration

| Phase | Auth Mechanism |
|-------|---------------|
| 1 (Products) | Public read; Admin write (client-side role check during transition) |
| 2 (Admin) | Admin write (client-side role check during transition) |
| 3 (Orders) | Authenticated (localStorage token during transition) |
| 4 (Accounts) | Medusa auth (wired in this phase) |
| 5 (Reviews) | Authenticated (Medusa token after Phase 4) |
| 6 (Cleanup) | Same as active phases — no change |

### Validation Checkpoints

| After Phase | Validation |
|-------------|-----------|
| 1 | Products render from API/Medusa, admin can edit via API, localStorage catalog still works as fallback |
| 2 | Admin theme changes persist site-wide, localStorage theme still loads if API unavailable |
| 3 | Orders created after checkout, History page shows API orders, demo orders still visible during transition |
| 4 | Login with Medusa credentials, account profile loads from API, demo accounts migrated |
| 5 | Reviews persist after refresh, visible to all users, ProductPreview shows API reviews |
| 6 | No localStorage keys in DevTools except `quorin:cookies`, all pages work without localStorage |

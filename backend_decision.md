# Backend Decision: Medusa vs Custom Backend

**Date:** 2026-06-23
**Version:** 1 (frozen — awaiting owner answers)
**Status:** Decision required — no implementation started
**Freeze Note:** Do not modify this document until owner answers `owner_questions.md`. If findings emerge, append to `architecture_review_notes.md`.

---

## 1. Medusa's Native Capabilities

Medusa v2.x is a headless commerce engine. Below is a factual assessment of whether each required domain is handled natively, via plugin, or requires a custom module.

| Domain | Supported? | How? | Evidence |
|--------|-----------|------|----------|
| **Products** | YES | Native core | `medusa-store.ts:18-29`: `medusaClient.products.list()` / `retrieve()`. Seed script has 16 products. Supports variants, prices, images, tags, categories, sales channels. |
| **Categories** | YES | Native core | `useMedusaCatalog.ts:22`: products are fetched and grouped by tags. Medusa has a native `product-categories` API (not currently used by frontend). |
| **Orders** | YES | Native core | `medusa-store.ts:114-121`: `completeCart()` triggers order creation. Medusa's cart → order workflow is built-in. |
| **Accounts** | YES | Native core | `medusa-store.ts:125-150`: `createCustomer()`, `authenticate()`. Medusa has customer entities, auth, profiles, addresses. |
| **Reviews** | NO | Requires custom module | No native reviews entity or API. Must be built as a custom module inside Medusa or added to Express backend. |
| **Settings** | NO | Requires custom module | No settings entity in Medusa. Must be built as a custom module or added to Express backend. |
| **Custom Requests** | NO | Requires custom module | No custom entity support. Must be built as a custom module or added to Express backend. |

**Verdict:** Medusa handles **4 of 7** domains natively (Products, Categories, Orders, Accounts). **3 domains** (Reviews, Settings, Custom Requests) require custom data models.

---

## 2. Architecture Options

### Option A: Medusa-First (Single Backend)

Build a single Medusa instance with custom modules for the 3 domains Medusa doesn't cover.

**How:**
- Medusa core handles: Products, Categories, Orders, Customers, Payments, Regions, Sales Channels
- Medusa custom modules (inside `backend/src/modules/`) handle: Reviews, Settings, CustomRequests
- Frontend talks to ONE API: the Medusa backend at `localhost:9000`

**Pros:**
| Factor | Assessment |
|--------|-----------|
| **Complexity** | Low-Medium. One codebase, one server, one database. Custom modules follow Medusa's module pattern (well-documented). |
| **Maintenance** | Low. One backend to deploy, monitor, backup. One connection string. One Docker container. |
| **Owner usability** | High. Medusa has a built-in admin dashboard (already at `localhost:9000` or `localhost:3000`). Admins use the Medusa Admin UI for products, orders, customers. Custom modules can add their own admin endpoints. |
| **Migration difficulty** | Medium. Frontend already has `useMedusaCatalog.ts`, `useMedusaCart.ts`, `medusa.ts` — all wired to Medusa. Only need to add custom module endpoints. |
| **Future scalability** | High. Medusa is designed for this: commerce is core, custom data extends it. Supports plugins, multi-region, multi-currency, webhooks, and headless storefronts. |

**Cons:**
| Factor | Assessment |
|--------|-----------|
| Learning curve | Custom modules in Medusa v2 use a different pattern than Express. Requires reading Medusa's module documentation. |
| Reviews/Settings are not commerce data | These are non-commerce features. Building them as Medusa modules feels slightly unnatural but is technically correct per Medusa's architecture. |

**What changes in this option:**
- `backend/` (Medusa) — **ACTIVE**. Add 3 custom modules: `review`, `settings`, `custom-request`.
- `backend-backup/` (Express) — **DECOMMISSIONED**. Not needed.
- Frontend `medusa.ts` — extend with calls to custom module endpoints: `GET /api/custom/reviews`, `PATCH /api/custom/settings`, etc.

---

### Option B: Custom Prisma Backend (Express)

Build a separate Express + Prisma API for ALL 7 domains. Medusa backend becomes a dead end.

**How:**
- `backend-backup/` is extended with full CRUD for all 7 domains.
- Medusa (at `backend/`) is either discarded or used only as an order-processing backend behind the Express API.
- Frontend talks to the Express API for everything.

**Pros:**
| Factor | Assessment |
|--------|-----------|
| **Simplicity of data** | All data in one Prisma schema. No Medura module patterns to learn. |
| **Full control** | No Medusa constraints. Every table, every field, every query is Express/Prisma. |

**Cons:**
| Factor | Assessment |
|--------|-----------|
| **Complexity** | High. You're rebuilding everything Medusa already does: products, categories, variants, cart, orders, customers, payments, regions. |
| **Maintenance** | High. Two backends to maintain (Medusa for commerce + Express for everything else). Two servers, two databases, two deploy pipelines. |
| **Owner usability** | Low. Medusa's admin dashboard (for products/orders) and Express admin (for everything else) are separate. The owner needs to log into two different admin panels. |
| **Migration difficulty** | High. Frontend already uses Medusa SDK. Replacing it requires rewriting `medusa.ts`, `useMedusaCatalog.ts`, `useMedusaCart.ts` — the entire cart/order/checkout flow. |
| **Future scalability** | Low. You'd need to rebuild everything Medusa provides: payment integrations, shipping, taxes, multi-currency, inventory management, webhooks. |

**What changes in this option:**
- `backend/` (Medusa) — **DECOMMISSIONED** (or kept as a "black box" order processor with zero frontend integration).
- `backend-backup/` — **ACTIVATED** with all 7 domains.
- Frontend — **major rewrite**. Remove Medusa SDK dependency. Replace all `medusaClient` calls with Express API calls.

---

### Option C: Hybrid (Medusa + Separate Custom API)

Use Medusa for commerce (products, orders, accounts) + a separate Express API for non-commerce data (reviews, settings, custom requests).

**How:**
- `backend/` (Medusa) — handles Products, Categories, Orders, Customers.
- `backend-backup/` (Express) — handles Reviews, Settings, CustomRequests.
- Frontend talks to TWO APIs: Medusa at `:9000` for commerce, Express at `:3000` for non-commerce.

**Pros:**
| Factor | Assessment |
|--------|-----------|
| **Clear separation** | Commerce stays in Medusa. Non-commerce stays in Express. |
| **No custom module learning** | Express is simpler than Medusa custom modules. |

**Cons:**
| Factor | Assessment |
|--------|-----------|
| **Complexity** | HIGH. TWO servers, TWO databases, TWO deployment pipelines, TWO sets of logs, TWO health checks. |
| **Maintenance** | High. Every fix must be applied to both backends. Auth, CORS, deployment — doubled overhead. |
| **Owner usability** | Medium. Products/orders via Medusa admin. Reviews/settings via Express admin. Two places for the owner. |
| **Migration difficulty** | Medium. Frontend already uses Medusa SDK. Express routes are already written (but need to be wired). |
| **Future scalability** | Medium. Scales independently — but that's not useful at QUORIN's size (one owner, one storefront). |

**What changes in this option:**
- `backend/` (Medusa) — **ACTIVE** for commerce only.
- `backend-backup/` — **ACTIVATED** with Reviews, Settings, CustomRequests (products/orders stay in Medusa).
- Frontend — **dual-API**. Medusa calls for commerce, Express calls for non-commerce.

---

## 3. Comparison Matrix

| Factor | Option A: Medusa-First | Option B: Custom Prisma | Option C: Hybrid |
|--------|----------------------|------------------------|-------------------|
| **Codebases** | 1 | 2 (Medusa + Express) | 2 (Medusa + Express) |
| **Databases** | 1 (PostgreSQL) | 2 (PostgreSQL + PostgreSQL) | 2 (PostgreSQL + PostgreSQL) |
| **Servers** | 1 | 2 | 2 |
| **Existing code reused** | 90% (all Medusa hooks stay) | 0% (all Medusa hooks discarded) | 50% (Medusa hooks stay, Express extended) |
| **Frontend changes needed** | Minor (add custom API calls) | Major (rewrite entire `medusa.ts` + hooks) | Medium (dual-API client) |
| **Owner admin panels** | 1 (Medusa Admin) | 2 (Medusa Admin + Express Admin) | 2 (Medusa Admin + Express Admin) |
| **Learning curve** | Medium (custom modules) | Low (Express) | Medium (both) |
| **Maintenance overhead** | Low | High | High |
| **Scalability** | High (Medusa-native) | Low (reinventing everything) | Medium (split responsibility) |
| **Payment/shipping/tax** | Built-in (Stripe, PayPal, etc.) | Must build from scratch | Built-in (via Medusa) |
| **Risk of data inconsistency** | Low (single database) | Medium (two databases, sync risk) | Medium (two databases, sync risk) |
| **Implementation time** | ~3-4 weeks | ~8-10 weeks | ~4-6 weeks |

---

## 4. Recommendation

### **Option A: Medusa-First** is the correct choice.

**Evidence:**

1. **Frontend already uses Medusa** — `useMedusaCatalog.ts`, `useMedusaCart.ts`, `medusa.ts` are all wired and working. The cart flow already touches Medusa. Categories already read from Medusa. Replacing this would undo months of work.

2. **4 of 7 domains are native to Medusa** — Products, Categories, Orders, and Accounts are all handled by Medusa core. Only Reviews, Settings, and Custom Requests need custom modules.

3. **Medusa already has a seed script** with 16 products ready to go. The Medusa backend (`backend/`) is a clean install, ready for custom module development.

4. **Express backend (`backend-backup/`) only has Products, Inquiries, and Admin** — it doesn't have Reviews, Settings, or Custom Requests either. It would need to be rebuilt from scratch for all 7 domains.

5. **Two backends = double everything** — deployment, monitoring, debugging, backups, CORS, authentication, database connections. At QUORIN's scale (one store, one owner), there is no justification for two servers.

6. **Medusa custom modules are the correct pattern** — Medusa v2 was designed exactly for this: commerce data in core, custom data in modules. The `review`, `settings`, and `custom-request` modules would follow the same pattern as Medusa's product, cart, and order modules.

7. **Single admin panel** — the QUORIN owner already gets a Medusa Admin UI for products and orders. Custom modules can add their own admin endpoints inside that same UI.

---

## 5. Decision Required

### Questions for the QUORIN owner:

1. **Are you comfortable with Medusa custom modules?** (This means writing a small amount of Node.js code inside the Medusa backend following Medura's module pattern.)

2. **Or would you prefer Express + Prisma for everything?** (This means discarding the Medusa integration and rebuilding the entire commerce flow in Express. Significantly more work.)

3. **Do you have any preference about the admin panel?** (Medusa Admin is a pre-built React app. Express Admin would need to be built from scratch or use something like Refine/Superplate.)

---

## 6. Implementation Path (if Option A is chosen)

Once the decision is made (presumably Option A), the next steps are:

### Phase 1: Custom Modules in Medusa
- Create `backend/src/modules/review/` — Reviews module with CRUD API
- Create `backend/src/modules/settings/` — Settings module with singleton API
- Create `backend/src/modules/custom-request/` — Custom Requests module with CRUD API

### Phase 2: Frontend Integration
- Extend `medusa.ts` with custom API calls: `POST /api/custom/reviews`, `GET /api/custom/settings`, `PATCH /api/custom/settings`, `POST /api/custom/custom-requests`
- Wire `ProductPreview.tsx` reviews form to the reviews module
- Wire `AdminCenter.tsx` settings to the settings module
- Wire `Navigation.tsx` custom request modal to the custom-requests module

### Phase 3: Admin Panel
- Add custom admin routes in Medusa Admin for reviewing custom requests and editing settings
- (Alternatively, build a minimal Express admin panel — but still inside the Medusa backend)

### Phase 4: Product/Admin Sync
- Admin edits to products flow through Medusa's product API (already implemented)
- No custom backend needed for products — Medusa handles it natively

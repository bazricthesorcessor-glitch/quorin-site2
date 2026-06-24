# Backend Inventory

**Date:** 2026-06-23
**Version:** 1 (frozen — awaiting owner answers)
**Freeze Note:** Do not modify this document until owner answers `owner_questions.md`. If findings emerge, append to `architecture_review_notes.md`.

---

## Overview

QUORIN has two backend implementations in the repository:

| Directory | Technology | Status | Frontend Wire-Up |
|-----------|-----------|--------|------------------|
| `backend/` | Medusa v2.16.0 | **Active (clean install)** — seed script ready, no custom endpoints | Partially wired |
| `backend-backup/` | Express.js + Prisma | **Currently unused and disconnected from the frontend** — prototype only | Not connected |

---

## `backend/` — Medusa Backend

### Version
- `@medusajs/medusa`: 2.16.0
- `@medusajs/js-sdk`: (in frontend, not in backend package.json)

### Package.json
```json
{
  "dependencies": {
    "@medusajs/medusa": "^2.16.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "@types/pg": "^8.10.9",
    "typescript": "^5.3.3"
  },
  "scripts": {
    "build": "medusa build",
    "start": "medusa start",
    "dev": "medusa develop",
    "seed": "medusa execute src/scripts/seed.ts"
  }
}
```

### medusa-config.js
- Database: PostgreSQL (via `DATABASE_URL`)
- CORS: `localhost:5173` (frontend dev server)
- Modules: `[]` (empty — no custom modules)
- Plugins: `[]` (empty — no plugins)
- Feature flags: `{}` (empty)

### Directory Structure
```
backend/
├── medusa-config.js          — Configuration (minimal, no modules/plugins)
├── package.json              — Medusa + pg only
├── node_modules/             — Installed (Medusa + all dependencies)
├── tsconfig.json             — TypeScript config
└── src/
    ├── api/
    │   └── admin/            — Default Medusa admin scaffolding (no custom routes)
    └── scripts/
        └── seed.ts           — Product seed data (16 products)
```

### What's Implemented

#### Seed Script (`src/scripts/seed.ts`)
Creates the following in Medusa:

| Entity | Status | Details |
|--------|--------|---------|
| Region | YES | "India" — INR currency, countries: ["in"] |
| Sales Channel | YES | "QUORIN Store" |
| Categories | NO | Category IDs referenced (`resin-art`, `candle-making`, `soap-making`) but no explicit category creation |
| Products | YES | 16 products across 3 categories |

**Product categories in seed:**
| Category | Product Count | Product IDs |
|----------|--------------|-------------|
| `resin-art` | 11 | Crystal Clear Epoxy Kit, Liquid Pigment Combo, Eco Tones Pigment, Eco Resin, Tools Kit (23pc), 15pc Tool Kit, Hand Drill, Tools Combo, Glitter, Crushed Glass |
| `candle-making` | 4 | Candle Colour Set, Candle Wicks, Blow Torch, Fragrance Oil Set |
| `soap-making` | 2 | DIY Soap Colour Kit, Liquid Soap Colour Kit with Mold |
| `candle-making` + `soap-making` | 1 | Fragrance Oil Set (cross-category) |

**Product data model in seed:**
- title, description, price, originalPrice
- categoryIds (array)
- type (string)
- tags (array of strings)
- images (empty array — images not uploaded to Medusa storage)
- options (variant options)
- variants (price + options per variant)
- status: "published"
- sales_channel_ids (linked to "QUORIN Store")

### What's NOT Implemented

| Feature | Status |
|---------|--------|
| Custom API endpoints | NO — `api/admin/` is empty |
| Custom modules | NO — `modules: []` in config |
| Admin routes | NO — no custom routes |
| Product images stored | NO — `images: []` in seed |
| Category entities | NO — categories are referenced by ID but never created as entities |
| Reviews | NO |
| Settings | NO |
| Custom Requests | NO |
| Orders | NO — only cart flow is possible |
| Customers | NO — only auth methods exist in SDK |
| Payments | NO — Stripe/PayPal not configured |
| Shipping | NO |

### Frontend Integration

**What's wired from the frontend:**

| File | What it does | Medusa API used |
|------|-------------|-----------------|
| `app/src/lib/medusa.ts` | SDK client setup + store API + auth API | `products.list()`, `products.retrieve()`, `regions.list()`, `carts.create()`, `carts.retrieve()`, `carts.createLineItem()`, `carts.updateLineItem()`, `carts.deleteLineItem()`, `carts.update()`, `carts.complete()`, `auth.createCustomerEmailPassAccount()` |
| `app/src/lib/useMedusaCatalog.ts` | Fetches products, builds categories from tags | `medusaStore.products.list()` |
| `app/src/lib/useMedusaCart.ts` | Cart state management | `medusaApi.createCart()`, `medusaApi.addCartItem()`, `medusaApi.updateCartItem()`, `medusaApi.removeCartItem()` |
| `app/src/App.tsx` | Integrates both hooks into React state | Both hooks |

**What's NOT wired:**
- Admin product editing (no write path to Medusa products)
- Orders (cart completes but order is not persisted beyond Medusa)
- Customer registration/login (auth methods exist in SDK but not wired to UI)
- Reviews
- Settings
- Custom requests

---

## `backend-backup/` — Express + Prisma

### Package.json
```json
{
  "dependencies": {
    "express": "^4.x",
    "prisma": "^5.x",
    "@prisma/client": "^5.x",
    "cors": "^2.x",
    "dotenv": "^16.x",
    "bcryptjs": "^2.x",
    "uuid": "^9.x"
  }
}
```

### Prisma Schema (`prisma/schema.prisma`)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Product {
  id, title, description, price, mrp, discount, stock, featured, images[], category, tags[]
  inquiries[]
}

model Inquiry {
  id, productId?, customerName, customerEmail, customerPhone, customerMessage, status
  product? @relation
}

model Admin {
  id, username (unique), email (unique), passwordHash
}
```

**Total models:** 3 (Product, Inquiry, Admin)
**Total tables in schema:** 3

### Directory Structure
```
backend-backup/
├── prisma/
│   ├── schema.prisma       — 3 models: Product, Inquiry, Admin
│   └── seed.ts             — (exists but not reviewed)
├── src/
│   ├── index.ts            — Express app, routes mounted
│   ├── config/
│   │   └── database.ts     — PrismaClient singleton
│   ├── routes/
│   │   ├── products.ts     — GET / (all), GET /:id, GET /category/:category
│   │   ├── inquiries.ts    — POST /, GET /, GET /:id
│   │   ├── admin.ts        — POST /login, POST /register, verifyAdminToken middleware
│   │   └── admin-dashboard.ts — (not reviewed)
│   ├── middleware/         — (exists but empty or not reviewed)
│   ├── services/           — (exists but not reviewed)
│   └── utils/
│       └── auth.ts         — hashPassword, verifyPassword
├── tsconfig.json
└── package.json
```

### What's Implemented

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/products` | GET | None | List all products (ordered by createdAt desc) |
| `/api/products/:id` | GET | None | Single product with inquiries |
| `/api/products/category/:category` | GET | None | Products by category |
| `/api/inquiries` | POST | None | Create inquiry (requires name, email, phone, message) |
| `/api/inquiries` | GET | None | List all inquiries (with product data) |
| `/api/inquiries/:id` | GET | None | Single inquiry |
| `/api/admin/login` | POST | None | Admin login (username + password) |
| `/api/admin/register` | POST | None | Create first admin (one-time setup) |
| `/api/admin` (dashboard) | — | Bearer token (admin id) | (routes file exists but content not reviewed) |

### What's NOT Implemented

| Feature | Status |
|---------|--------|
| Product create/update/delete | NO — only GET routes |
| Settings | NO — no Settings table or routes |
| Custom Requests | NO — no CustomRequest table or routes |
| Reviews | NO — no Reviews table or routes |
| Accounts/Customers | NO — no account system |
| Orders | NO — only product inquiry flow |
| Category CRUD | NO — categories are a string field on Product |
| Authentication (non-admin) | NO — only admin auth exists |
| Webhooks | NO |
| Medusa integration | NO — this is a standalone Express API |

### Frontend Integration

**Not wired at all.** No file in the frontend references `backend-backup/`. The frontend uses:
- `medusa.ts` → Medusa SDK → `localhost:9000`
- `quorinStore.ts` → localStorage

---

## Summary Comparison

| Feature | Medusa (`backend/`) | Express (`backend-backup/`) |
|---------|-------------------|---------------------------|
| **Technology** | Node.js commerce engine | Express.js + Prisma |
| **Products** | Seed with 16 products (read-only via frontend) | CRUD routes (GET only in frontend) |
| **Categories** | Referenced by ID in seed (not created as entities) | String field on Product |
| **Cart** | Cart API (via frontend hooks) | NOT IMPLEMENTED |
| **Orders** | Cart completion possible (not wired) | NOT IMPLEMENTED |
| **Customers/Accounts** | Auth methods in SDK (not wired) | NOT IMPLEMENTED |
| **Inquiries** | NOT IMPLEMENTED | Full CRUD |
| **Admin auth** | NOT IMPLEMENTED | Login/register + token middleware |
| **Reviews** | NOT IMPLEMENTED | NOT IMPLEMENTED |
| **Settings** | NOT IMPLEMENTED | NOT IMPLEMENTED |
| **Custom Requests** | NOT IMPLEMENTED | NOT IMPLEMENTED |
| **Payments** | NOT CONFIGURED | NOT IMPLEMENTED |
| **Frontend connected** | YES (partial) | NO |
| **Admin UI** | Built-in (Medusa Admin) | None (routes exist but no UI) |
| **Database** | PostgreSQL (Medura-managed) | PostgreSQL (Prisma-managed) |

---

## Key Findings

1. **Medusa backend (`backend/`) is a clean install with a seed script.** It has 16 products prepped but no custom endpoints, no custom modules, and no plugins configured. The frontend has partial integration via hooks.

2. **Express backend (`backend-backup/`) is currently unused and disconnected from the frontend.** It has basic CRUD for products and inquiries plus admin auth. It is NOT wired to the frontend and does NOT have reviews, settings, custom requests, orders, or customer accounts.

3. **The frontend Medusa hooks (`useMedusaCatalog.ts`, `useMedusaCart.ts`, `medusa.ts`) are the ONLY active backend integration.** They are fully functional but limited to:
   - Product listing (read)
   - Cart operations (create, add, update, remove, complete)
   - Customer authentication (exists in SDK, not wired to UI)

4. **All 7 required domains (Products, Categories, Orders, Accounts, Reviews, Settings, Custom Requests) are missing full implementation in BOTH backends.** The gap exists in both, but Medusa provides the foundation for 4 of them natively.

5. **The Medusa seed script is the most complete "data preparation" artifact.** It has all 16 QUORIN products with proper structure. The Express backend has none of this — it only has a generic Product model with no relation to QUORIN products.

# Quorin Medusa Backend Architecture

This document provides a comprehensive architectural overview of the Medusa backend located in the `backend` directory.

## 1. Codebase Overview

- **Total Core Files:** 51 files (excluding `node_modules`, `dist`, `.cache`, `.git`, and build outputs).
- **Medusa Version:** `^2.16.0`
- **Database:** PostgreSQL (`pg`) with optional Redis for caching/events.

## 2. Directory Structure

The backend follows a standard Medusa v2 folder structure, focusing primarily on custom API endpoints and initialization scripts.

```text
backend/
├── src/
│   ├── api/
│   │   ├── auth/
│   │   │   └── customer/
│   │   │       └── google/
│   │   │           └── callback-plus/
│   │   │               └── route.js          # Custom Google OAuth callback handler
│   │   ├── store/
│   │   │   └── ai/
│   │   │       ├── brand/
│   │   │       │   └── route.ts              # AI brand/marketing endpoints
│   │   │       ├── catalog/
│   │   │       │   └── route.ts              # AI product catalog interactions
│   │   │       ├── manifest/
│   │   │       │   └── route.ts              # AI manifest definitions
│   │   │       ├── policies/
│   │   │       │   └── route.ts              # AI compliance and policies
│   │   │       └── recommendations/
│   │   │           └── route.ts              # AI-driven product recommendations
│   │   └── middlewares/
│   │       ├── middlewares.js                # Core API middleware registrations
│   │       ├── ensure-calculated-price-field.js # Pricing enforcement middleware
│   │       └── static-files.js               # Static file serving middleware
│   └── scripts/
│       ├── seed.ts                           # Main database seeder script
│       └── ...                               # Additional maintenance/setup scripts
├── medusa-config.js                          # Core Medusa engine configuration
├── package.json                              # Dependencies and build scripts
└── tsconfig.json                             # TypeScript compiler configuration
```

## 3. Custom API Routes

The backend heavily utilizes custom route handlers under `src/api` to extend Medusa's default functionality, particularly for AI integrations and authentication:

### Authentication Endpoints
- **`[POST/GET] /auth/customer/google/callback-plus`**
  A customized extension of the standard Google OAuth callback, likely handling extended user mapping, metadata extraction, or custom onboarding flows immediately after Google authentication succeeds.

### Storefront AI Integrations
- **`[GET/POST] /store/ai/brand`**: Endpoints for brand-related AI data generation or retrieval.
- **`[GET/POST] /store/ai/catalog`**: Endpoints extending the product catalog with AI-powered search, vector mapping, or metadata parsing.
- **`[GET/POST] /store/ai/manifest`**: Handlers for dynamic AI agent instruction manifests.
- **`[GET/POST] /store/ai/policies`**: Exposes store policies formatted or queried specifically for AI agents.
- **`[GET/POST] /store/ai/recommendations`**: An AI recommendation engine endpoint that serves dynamically personalized product suggestions to the storefront.

### Middlewares
- **`middlewares.js`**: Registers standard middleware pipeline.
- **`static-files.js`**: Exposes `/public` for local uploads or static assets.
- **`ensure-calculated-price-field.js`**: Custom middleware likely used to guarantee that dynamic or regional calculated prices are present on product responses before reaching the frontend.

## 4. Configuration & Services (medusa-config.js)

The `medusa-config.js` file is well-structured for production readiness, leveraging environment variables and conditional logic. 

**Key Registered Modules:**
- **Authentication (`@medusajs/auth`)**:
  - Configured with the core `emailpass` provider.
  - Dynamically injects the `google` provider (`@medusajs/auth-google`) if `GOOGLE_CLIENT_ID` is present in the environment.
- **Storage (`@medusajs/file`)**:
  - Uses local storage (`@medusajs/file-local`) mapping to `public/uploads`.
- **Commerce Modules**:
  - All standard Medusa v2 modules are explicitly registered (e.g., `store`, `product`, `cart`, `order`, `pricing`, `inventory`, `fulfillment`, `payment`, `promotion`).
- **Caching & Events (Redis)**:
  - Conditionally uses `@medusajs/event-bus-redis`, `@medusajs/workflow-engine-redis`, and `@medusajs/cache-redis` if a `REDIS_URL` is provided, otherwise falls back to local memory.
- **Security**:
  - SSL/TLS enforcement is dynamically configured for the PostgreSQL database (`NODE_TLS_REJECT_UNAUTHORIZED` logic).

**Admin Dashboard:**
- Configured to serve at `/app` (i.e., `admin.path = "/app"`).

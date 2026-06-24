# QUORIN Business Requirements

**Date:** 2026-06-23
**Version:** 1 (frozen — awaiting owner answers)
**Purpose:** Evaluate backend architecture options (Medusa-first vs. Custom Backend vs. Hybrid) against QUORIN's business needs.
**Freeze Note:** Do not modify this document until owner answers `owner_questions.md`. If findings emerge, append to `architecture_review_notes.md`.
**Constraint:** Evidence-based. No assumptions. No references to what already exists or what is "easier."

---

## Evaluation Methodology

For each feature:
- **Business Value** — Why QUORIN needs this feature for its business.
- **Needed Now / 6 Months / 2 Years** — Based on QUORIN's phased roadmap (Phase 1–10).
- **Complexity** — How much logic, integration, and infrastructure the feature requires.
- **Medusa Native / Custom Module / Custom Backend** — Which platform can deliver it.
- **Recommended Approach** — Based on business value, timeline, and operational overhead.

---

## Feature Analysis

### 1. Products

| Field | Value |
|-------|-------|
| **Business Value** | Core of QUORIN's identity. "Made for Makers" — 16+ products in 3 categories are the reason the site exists. Without products, QUORIN has nothing to show or sell. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium-High — requires CRUD, variants, pricing (MRP, cost price, discount), images, tags, categories, search, filtering, inventory tracking, stock toggle. |
| **Medusa Native** | YES — products, variants, prices, images, tags, categories, sales channels, inventory levels. Fully managed. |
| **Medusa Custom Module** | YES — costPrice (a non-standard field) and stock toggle can be added via custom fields to Medusa's product entity without building a new module. |
| **Custom Backend** | YES — build from scratch with Prisma + Express. Full CRUD, search, filtering. |
| **Recommended Approach** | **Medusa Native** — Products are a first-class commerce entity. Medusa handles the full lifecycle: create, read, update, delete, variants, pricing, inventory, search. CostPrice is a simple additional field. This is not a custom domain — it is the core domain Medusa was built for. |

---

### 2. Categories

| Field | Value |
|-------|-------|
| **Business Value** | Organizes products into 3 merchant-defined categories: Resin Art, Candle Making, Soap Making. Enables navigation, browsing, and category-level marketing. Essential for UX. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Low — simple tree structure (parent/child optional), title, description, product associations. |
| **Medusa Native** | YES — product-categories entity with nested hierarchy. |
| **Medusa Custom Module** | YES — could be a custom module if Medusa's native category model doesn't fit, but it does. |
| **Custom Backend** | YES — simple Prisma model + CRUD. |
| **Recommended Approach** | **Medusa Native** — Categories are a standard commerce construct. Medusa's product-categories model supports nested hierarchies, which supports future growth (subcategories). No reason to build this from scratch. |

---

### 3. Product Variants

| Field | Value |
|-------|-------|
| **Business Value** | Each product has multiple variants (e.g., size: 1.2kg, 2.5kg; different color sets). Variants enable customers to choose their preferred option. A missing variant system forces a "one variant per product" constraint — bad for a maker-supply store with size/color options. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — variants map to options (size, color, quantity), each with independent pricing. Requires a many-to-many relationship between products, options, and prices. |
| **Medusa Native** | YES — Medusa's product-variant model with multi-option variants, per-variant pricing, and SKU support. |
| **Medusa Custom Module** | YES — if Medusa's variant model is insufficient (it is not). |
| **Custom Backend** | YES — build relationships between products, variant_options, variant_prices. |
| **Recommended Approach** | **Medusa Native** — QUORIN's variants are standard commerce variants (size, color). Medusa supports multi-option variants with independent pricing out of the box. Building this from scratch is reinventing a mature feature. |

---

### 4. Cart

| Field | Value |
|-------|-------|
| **Business Value** | The cart is the bridge between browsing and purchasing. Without a cart, customers cannot accumulate multiple items before checkout. This is a baseline requirement for any store. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | High — requires session management (cart ID persistence), line item CRUD (add, update, remove), tax calculation, price rules (XP discounts, gift discounts), and cart-to-order transition. |
| **Medusa Native** | YES — carts, line items, cart updates, complete cart workflow. |
| **Medusa Custom Module** | YES — cart price calculation hooks can be extended for XP/gift discounts via Medusa's price calculation system. |
| **Custom Backend** | YES — build cart session management, line items, price calculations from scratch. |
| **Recommended Approach** | **Medusa Native** — The cart is a session-based commerce entity. Medusa handles cart persistence, line item management, and the complete-cart-to-order transition. Price calculation hooks exist for extending discounts (XP, gifts). Building a cart from scratch is one of the most error-prone areas of commerce. |

---

### 5. Orders

| Field | Value |
|-------|-------|
| **Business Value** | Orders are the record of every transaction. Required for: order history, returns, customer trust (order tracking), analytics, inventory deduction, revenue tracking. Without orders, QUORIN has no transaction history. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium-High — requires order creation from cart completion, order status tracking (pending, paid, shipped, delivered, returned), order items, payment status, fulfillment status, order history per customer. |
| **Medusa Native** | YES — order entity created automatically by completeCart(). Order items, payment status, fulfillment status, customer association. |
| **Medusa Custom Module** | YES — returns, custom statuses, or post-delivery workflows can be added as modules. |
| **Custom Backend** | YES — build order entity, order items, status machine, customer association. |
| **Recommended Approach** | **Medusa Native** — Order creation from cart completion is a standard workflow. Medusa handles order lifecycle, status transitions, payment tracking, and fulfillment. Custom statuses (for QUORIN-specific flows) can be added via extensions. Building an order system from scratch requires a full state machine, which Medusa already provides. |

### 6. Reviews (Product Reviews)

| Field | Value |
|-------|-------|
| **Business Value** | Trust signals for QUORIN's "Made for Makers" identity. Customers reading reviews from other makers are more likely to purchase. For a niche supply store, peer validation is a critical purchase driver. Without reviews, new customers have no social proof. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires review creation per product (one review per order/customer), star ratings, text content, moderation (approval flow), display aggregation (average rating per product), anti-abuse (only verified purchasers can review). |
| **Medusa Native** | NO — Medusa has no review or rating system. |
| **Medusa Custom Module** | YES — a custom module with Review model (product_id, customer_id, order_id, rating, text, moderation_status) and CRUD endpoints. Anti-abuse enforced via order association (only customers who completed an order can review). |
| **Custom Backend** | YES — full review system built from scratch. |
| **Recommended Approach** | **Medusa Custom Module** — Reviews are a domain-specific feature unique to QUORIN. No existing provider has it. A lightweight Medusa module is the right scope: a small entity with moderation, verification, and aggregation logic. Not worth a full custom backend for one domain. |

---

### 7. XP / Loyalty System

| Field | Value |
|-------|-------|
| **Business Value** | Retention engine for QUORIN. XP drives repeat purchases: 50 XP per ₹100 spent, level thresholds (Maker 0–999 XP, Artisan 1000–4999 XP, Master 5000+ XP) with escalating discounts (1%, 2%, 4%). This directly ties purchase behavior to loyalty benefits and incentivizes higher spending. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium-High — requires XP ledger (earned on orders, spent on discounts), level thresholds with discount mapping, expiration/reset rules, anti-fraud (no XP from self-purchases or returns), real-time XP balance queries, and discount application at checkout. |
| **Medusa Native** | NO — Medusa has no built-in loyalty or XP system. |
| **Medusa Custom Module** | YES — LoyaltyModule with XP_Ledger, Level_Config, Discount_Rule entities. Integration with Medusa's price calculation hooks for applying XP-derived discounts at checkout. |
| **Custom Backend** | YES — build XP ledger, levels, and discount application from scratch. |
| **Recommended Approach** | **Medusa Custom Module** — XP/Loyalty is a QUORIN-specific domain. It requires integration with order completion (XP earning), checkout (XP discount application), and customer profiles (XP balance display). A Medusa custom module keeps it tightly coupled to the commerce layer without building a separate backend system. |

---

### 8. Birthday Gifts & Celebrations

| Field | Value |
|-------|-------|
| **Business Value** | Unique QUORIN differentiator. Birthday gifts are a strategic acquisition and retention tool: automatic 2–3× XP bonus during birthday week, automatic gift eligibility for 5× level members (verified high-value), and optional email notification. This builds emotional loyalty and directly increases purchase frequency around a natural event. |
| **Needed Now** | NO |
| **Needed in 6 Months** | NO |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires birthdate collection at signup/profile, birthday week detection logic, XP bonus trigger on orders placed during birthday week, gift eligibility check (5× level threshold), and notification triggers. |
| **Medusa Native** | NO |
| **Medusa Custom Module** | YES — BirthdayConfig entity, BirthdayBonus trigger integrated with XP module and checkout. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Custom Module** — This is a bonus rule engine that extends the XP module. It reads birthdate from customer profile and applies bonus XP during a defined window. Tightly coupled to XP and checkout logic — a custom module within Medusa is the appropriate boundary. |

---

### 9. Settings / Profile Management

| Field | Value |
|-------|-------|
| **Business Value** | Customers need to manage their profile (name, email, phone, shipping address, birthdate) and application preferences. This is a baseline UX requirement for any customer-facing application. Without it, customers cannot update shipping addresses or provide birthdate for birthday gifts. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Low-Medium — customer profile CRUD, address book, birthdate field, preference toggles. |
| **Medusa Native** | PARTIAL — Medusa has customer profiles (name, email, phone) and shipping addresses via the customers API. Birthdate and preferences are not native. |
| **Medusa Custom Module** | YES — birthdate and custom preferences can be added as extended customer fields or a lightweight ProfileSettings module. |
| **Custom Backend** | YES — build customer profiles from scratch. |
| **Recommended Approach** | **Medusa Native + Light Extension** — Medusa already provides customer accounts, email, phone, and shipping addresses. Only birthdate and custom preferences need extension. Rebuild from scratch when 80% of this is already handled. |

### 10. Theme Editor (Admin)

| Field | Value |
|-------|-------|
| **Business Value** | Allows QUORIN owners to change colors, fonts, and branding without developer intervention. Supports the "Luxury Brand Identity" from Phase-4 and enables rapid iteration on the front-end design. Critical for non-technical owners to maintain brand control. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires a config store (brand_colors, typography, logo_url, accent_colors), admin UI for editing, and frontend consumption of theme config. |
| **Medusa Native** | NO — Medusa has no theming or brand config system. |
| **Medusa Custom Module** | YES — ThemeConfig entity with CRUD API. Admin UI would be a separate admin plugin or custom admin extension. |
| **Custom Backend** | YES — build theme config storage and API from scratch. |
| **Recommended Approach** | **Medusa Custom Module** — Theme config is a simple key-value or structured entity (brand_colors, typography, logos). It does not require a full custom backend. A lightweight module with a config API is sufficient. Admin UI can be a Medusa admin plugin. |

---

### 11. Content Editor (Admin)

| Field | Value |
|-------|-------|
| **Business Value** | Enables QUORIN owners to manage marketing content: homepage banners, promotional text, FAQ sections, terms and conditions, privacy policy. Without a content editor, every content change requires developer involvement — slow and expensive. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires content entities (type, key, HTML/rich text content, active status), versioning (optional), admin UI for editing, and frontend API for content fetching by key/type. |
| **Medusa Native** | NO |
| **Medusa Custom Module** | YES — ContentConfig entity with content_type, content_key, content_body, is_active. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Custom Module** — Content management is a simple structured data store. It does not require complex business logic. A Medusa module with CRUD endpoints is sufficient. |

---

### 12. Custom Requests (Custom Order / Inquiry)

| Field | Value |
|-------|-------|
| **Business Value** | QUORIN offers custom orders (custom resin art, bespoke candle sets, private-label soap). This is a differentiator for a maker-supply store: customers can request bespoke items not in the standard catalog. The inquiry system captures custom request details (type, description, budget, deadline) and routes them to admin for processing. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium-High — inquiry form with file uploads (reference images), custom fields (type, description, budget, deadline), admin workflow (status: new, in-progress, approved, delivered), customer status tracking, notification triggers. |
| **Medusa Native** | NO — Medusa has no inquiry or custom request system. |
| **Medusa Custom Module** | YES — CustomRequest entity with all custom fields, status transitions, and file upload integration. Admin endpoints for CRUD and status management. |
| **Custom Backend** | YES — build custom request system from scratch. |
| **Recommended Approach** | **Medusa Custom Module** — Custom requests are a QUORIN-specific domain with a clear lifecycle (new → in-progress → approved → delivered). It needs customer association, file uploads, and admin workflow. A Medusa module provides the entity and API layer without building a separate backend. |

---

### 13. Bulk Orders

| Field | Value |
|-------|-------|-------|
| **Business Value** | Supports B2B or high-volume customers (event planners, workshops, schools). Allows order quantities beyond standard retail (e.g., 50+ units of a single product or mixed bulk orders). Revenue multiplier for QUORIN. |
| **Needed Now** | NO |
| **Needed in 6 Months** | NO |
| **Needed in 2 Years** | YES (conditional on B2B demand) |
| **Complexity** | Medium — requires bulk order form, quantity-based pricing tiers, approval workflow (admin review before processing), separate order type flag, and potentially separate pricing rules. |
| **Medusa Native** | PARTIAL — Medusa supports any quantity in cart. Bulk pricing tiers would need custom price rules. |
| **Medusa Custom Module** | YES — BulkOrder entity for tracking and approval workflow. Price rule extension for volume discounts. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Custom Module** — Bulk orders are an extension of the order system. They need a separate approval workflow and volume pricing. A Medusa module for tracking and price rules is appropriate. |

---

### 14. Contact Requests

| Field | Value |
|-------|-------|-------|
| **Business Value** | Standard customer support channel. Users can send messages to QUORIN support team (questions about products, orders, shipping, partnerships). Required for trust and customer service. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Low — simple form (name, email, subject, message), admin dashboard to view and respond, auto-reply email trigger. |
| **Medusa Native** | NO |
| **Medusa Custom Module** | YES — ContactRequest entity with message, status, and admin response field. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Custom Module** — Contact requests are a simple entity with basic CRUD. No complex logic. Medusa module with a minimal admin UI plugin is sufficient. |

### 15. Data Deletion Requests

| Field | Value |
|-------|-------|
| **Business Value** | Legal requirement under Indian DPDP Act and potential GDPR obligations for international customers. QUORIN must provide a mechanism for customers to request account deletion and data purging. Without this, QUORIN faces legal liability and trust erosion. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires a data deletion request flow (customer submits request, admin approves, data purging with audit trail), exception handling (order records must be retained for tax/compliance). |
| **Medusa Native** | NO — Medusa has no data deletion workflow. |
| **Medusa Custom Module** | YES — DataDeletionRequest entity with customer_id, status, admin_review, executed_at. Deletion service that handles cascading deletes with compliance exceptions. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Custom Module** — This is a compliance workflow. It needs to integrate with Medusa's customer data but is not a commerce domain. A Medusa module for the request lifecycle and a deletion service is appropriate. |

---

### 16. Auth / Login

| Field | Value |
|-------|-------|
| **Business Value** | Required for customer accounts (order history, XP tracking, wishlist, profile management) and admin access (product management, order management, content management). Without authentication, QUORIN has no persistent identity system. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires registration, email/password login, JWT/session management, password reset, role-based access (customer vs admin), email verification, and secure session handling. |
| **Medusa Native** | YES — Medusa has user authentication (register, login, email/password), JWT tokens, and customer auth. Admin auth can use Medusa's user system or be extended. |
| **Medusa Custom Module** | YES — admin roles and permissions can be added via a custom module if Medusa's native user roles are insufficient. |
| **Custom Backend** | YES — build full auth system from scratch. |
| **Recommended Approach** | **Medusa Native** — Medusa provides a complete authentication system: customer registration, login, JWT tokens, password reset, email verification. Admin auth can be built on Medusa's user entity with role extensions. Rebuild this when Medusa already provides it. |

---

### 17. Admin Accounts / Admin Panel

| Field | Value |
|-------|-------|
| **Business Value** | QUORIN owners need a panel to manage products, categories, orders, reviews, custom requests, settings, content, and analytics. Without an admin panel, the owners cannot operate the business without developer intervention. |
| **Needed Now** | YES (minimum viable admin) |
| **Needed in 6 Months** | YES (full admin panel) |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium-High — requires a full admin UI with sections for each entity (products, orders, reviews, custom requests, settings, content). Admin auth, role-based access, and CRUD operations on all entities. |
| **Medusa Native** | PARTIAL — Medusa has a built-in admin dashboard (@medusajs/admin) that covers products, orders, customers, and basic analytics. Does NOT cover reviews, custom requests, settings, or content. |
| **Medusa Custom Module** | YES — custom admin plugins for reviews, custom requests, settings, content. Extending the existing Medusa admin with custom routes. |
| **Custom Backend** | YES — build a full admin panel (React/Vue + API) from scratch. |
| **Recommended Approach** | **Medusa Native Admin + Custom Plugins** — Medusa's admin covers the majority of admin needs (products, orders, customers, analytics). Custom sections (reviews, custom requests, settings, content) can be added as admin plugins. Building a full admin panel from scratch for a store with ~30 products is over-engineering. |

### 18. Payments

| Field | Value |
|-------|-------|
| **Business Value** | QUORIN operates in India. Required payment methods: UPI (phonepe, gpay, paytm), cards (Visa, Mastercard, RuPay), net banking, wallets. Payment gateway integration is mandatory for any online store in India. Without payments, QUORIN cannot accept money. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires payment gateway integration (Razorpay, PayU, or similar Indian gateway), payment flow (initiate, confirm, webhook handling), refund processing, payment status tracking, multi-method support. |
| **Medusa Native** | YES — Medusa has a payment architecture with providers. Razorpay integration exists as a community plugin. Custom payment providers can be added. |
| **Medusa Custom Module** | YES — custom payment provider implementation for any gateway not in Medusa's ecosystem. |
| **Custom Backend** | YES — build payment flow, gateway integration, and webhook handling from scratch. |
| **Recommended Approach** | **Medusa Native (Razorpay plugin)** — Indian ecommerce requires UPI, cards, and net banking — Razorpay supports all of these and has a Medusa plugin. If additional gateways are needed, Medusa's provider architecture supports custom payment integrations. Building payment flows from scratch is high-risk (security, PCI compliance, webhook handling). |

---

### 19. Shipping / Delivery

| Field | Value |
|-------|-------|
| **Business Value** | QUORIN ships products to customers within India. Requires shipping rate calculation (by weight/price zone), carrier integration (Delhivery, ShipRocket, Pickrr), tracking numbers, and shipping status updates. Shipping is a customer-facing experience that directly impacts satisfaction and repeat purchases. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium-High — shipping zones, rate calculation (weight-based, price-based, flat rate), carrier API integration (waybill creation, tracking), shipping status updates, return shipping logic. |
| **Medusa Native** | PARTIAL — Medusa has shipping profiles, shipping options, and shipping sets. Carrier integrations (ShipRocket, Delhivery) exist as community plugins. |
| **Medusa Custom Module** | YES — custom shipping provider or carrier integration. |
| **Custom Backend** | YES — build shipping zones, rate calculation, and carrier integrations from scratch. |
| **Recommended Approach** | **Medusa Native + Carrier Plugin** — Medusa supports shipping profiles, zones, and rate calculation. Indian carrier integrations (ShipRocket, Delhivery) have Medusa plugins available. Building shipping logic from scratch requires complex carrier API work. |

---

### 20. Inventory

| Field | Value |
|-------|-------|
| **Business Value** | Tracks stock levels per product variant. Prevents overselling, enables stock alerts, and provides operational visibility. For a store with ~30 products and ~50+ variants, manual inventory tracking is not scalable. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Low-Medium — requires stock level tracking per variant, stock alerts (low inventory notification), stock toggle (in-stock / out-of-stock / discontinued), and inventory deduction on order completion. |
| **Medusa Native** | YES — Medusa has inventory management with stock levels per variant, stock alerts, and inventory adjustment APIs. |
| **Medusa Custom Module** | YES — if advanced inventory features are needed (multi-location, batch tracking). |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Native** — Medusa's inventory system handles per-variant stock levels, stock alerts, and auto-deduction on order completion. For ~30 products with ~50 variants, Medusa's inventory system is fully sufficient. Multi-location tracking can be added later as a custom module if needed. |

### 21. Search & Filter

| Field | Value |
|-------|-------|
| **Business Value** | Customers must find products by name, category, price range, tags, and rating. Without search, customers with specific needs (e.g., "resin mold 1.2kg") must browse all 16+ products manually. Search and filter are critical for conversion, especially as the catalog grows beyond ~50 products. |
| **Needed Now** | YES |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires search by text, filter by category, price range, tags, rating, and sort by (price, name, newest, rating). Performance degrades without indexing as catalog grows. |
| **Medusa Native** | PARTIAL — Medusa has basic search (title, description) but no full-text indexing or faceted filtering. Algolia integration exists as an official Medusa plugin. |
| **Medusa Custom Module** | YES — custom search provider (Elasticsearch, Meilisearch) or Algolia configuration. |
| **Custom Backend** | YES — build search engine with indexing, faceted search, and ranking from scratch. |
| **Recommended Approach** | **Medusa + Algolia Plugin** — For ~16–30 products, basic database search is sufficient. For 50+ products, Algolia via Medusa's official plugin provides full-text search, faceted filtering, and typo tolerance without custom engineering. |

---

### 22. SEO Metadata

| Field | Value |
|-------|-------|-------|
| **Business Value** | QUORIN needs to rank in search engines for product-related queries ("buy resin art supplies India", "candle making kits online"). Each product and category needs custom meta titles, descriptions, Open Graph tags, and structured data (JSON-LD). Without SEO, QUORIN relies entirely on paid or social traffic. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires per-product and per-category SEO fields (title, description, keywords, image), automatic OG tag generation, JSON-LD structured data output, sitemap generation, and robots.txt management. |
| **Medusa Native** | PARTIAL — Medusa has no SEO metadata fields. Can be added via custom module or front-end implementation. |
| **Medusa Custom Module** | YES — SeoMetadata entity with product_id, category_id, meta_title, meta_description, og_image_url, canonical_url. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Custom Module + Frontend Integration** — SEO metadata is stored as data (entity) and consumed by the frontend. A Medusa module stores the metadata; the frontend (Next.js) renders meta tags and JSON-LD. This separates data storage from presentation, which is the correct architectural boundary. |

---

### 23. AI-Readable Trust Data

| Field | Value |
|-------|-------|
| **Business Value** | QUORIN needs structured data that AI systems (search engines, AI assistants, recommendation engines) can parse: product ratings (average, review count), business information (name, location, contact), trust signals (return policy, shipping info, payment methods), and schema markup (Product, Review, Organization, Offer). This is a strategic requirement for AI-era discoverability. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires structured data output (JSON-LD) on all product/category pages, consistent review count/rating aggregation, organization schema, and periodic validation of schema markup. |
| **Medusa Native** | NO — Medusa has no structured data output. |
| **Medusa Custom Module** | YES — TrustData entity with business info, policy links, and aggregated review data. Or implemented as a frontend concern consuming Medusa data. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Frontend Implementation** — AI-readable trust data is primarily a frontend concern (Next.js renders JSON-LD on product/category pages using Medusa data). No backend module is needed — the frontend consumes Medusa APIs (products, reviews, settings) and outputs structured data. This is a presentation-layer concern, not a business logic layer. |

### 24. Analytics / Reporting

| Field | Value |
|-------|-------|
| **Business Value** | QUORIN owners need visibility into business performance: daily/weekly/monthly revenue, top products, order volume, customer acquisition, conversion rate, cart abandonment rate. Without analytics, owners cannot make informed business decisions. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — requires aggregation queries (revenue by period, top products, order status breakdown), dashboard UI, and potentially real-time metrics. |
| **Medusa Native** | PARTIAL — Medusa has basic analytics in the admin dashboard (sales, orders, customers). Does NOT include custom metrics like cart abandonment or customer lifetime value. |
| **Medusa Custom Module** | YES — custom analytics aggregation and reporting endpoints. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Native + Custom Admin Plugin** — Medusa's admin analytics covers basic sales and order metrics. Custom metrics (cart abandonment, LTV, category performance) can be added as a custom admin plugin. For advanced analytics, external tools (Plausible, PostHog) on the frontend provide web analytics, while Medusa provides business analytics. |

---

### 25. International Payments

| Field | Value |
|-------|-------|
| **Business Value** | QUORIN may eventually serve international customers. Requires multi-currency support (USD, EUR), international payment methods (PayPal, Stripe), international shipping, and tax compliance for cross-border transactions. A future-phase requirement, not a launch requirement. |
| **Needed Now** | NO |
| **Needed in 6 Months** | NO |
| **Needed in 2 Years** | YES (conditional on international demand) |
| **Complexity** | High — multi-currency pricing, exchange rate integration, PayPal/Stripe integration, international shipping calculations, tax compliance, customs documentation. |
| **Medusa Native** | PARTIAL — Medusa supports multi-currency (currency codes, conversion rates). International payment providers (Stripe, PayPal) have Medusa plugins. |
| **Medusa Custom Module** | YES — custom tax and shipping rules for international orders. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Native + Stripe/PayPal Plugins** — When international demand materializes, Medusa's multi-currency support and Stripe/PayPal plugins provide the foundation. This is a Phase 2+ requirement that should not impact Phase 1 architecture. |

---

### 26. Returns

| Field | Value |
|-------|-------|-------|
| **Business Value** | Customers need to return products (defective, wrong item, changed mind). Returns require RMA creation, refund processing, inventory restocking, and customer communication. Without a returns process, QUORIN cannot handle post-purchase issues professionally. |
| **Needed Now** | NO |
| **Needed in 6 Months** | YES |
| **Needed in 2 Years** | YES |
| **Complexity** | Medium — RMA creation (reason, items, status), refund processing (full/partial, payment gateway refund API), inventory restocking, return shipping, exchange options. |
| **Medusa Native** | PARTIAL — Medusa supports returns (return entity, item return, refund creation). Does not include exchange workflows or return shipping integration. |
| **Medusa Custom Module** | YES — exchange workflows, return shipping integration, custom return statuses. |
| **Custom Backend** | YES |
| **Recommended Approach** | **Medusa Native + Custom Extensions** — Medusa has a complete returns system (create return, approve return, refund). Exchanges and return shipping can be added as custom module extensions. This is a standard commerce domain that Medusa handles well. |


=================================================
BUSINESS PRIORITY RANKING
=================================================

### Tier 1: Required for Launch

These features must be operational before QUORIN goes live. Without any of these, QUORIN cannot function as a commerce site.

| # | Feature | Justification |
|---|---------|---------------|
| 1 | Products | Core identity. Without products, QUORIN is an empty shell. |
| 2 | Categories | Navigation structure. Without categories, products are unorganized and unfindable. |
| 3 | Auth / Login | Persistent identity. Without auth, no accounts, no XP, no order history. |
| 4 | Cart | Transaction bridge. Without cart, customers cannot accumulate items before purchase. |
| 5 | Orders | Transaction record. Without orders, no transaction history, no revenue tracking. |
| 6 | Inventory | Stock management. Without inventory, overselling is guaranteed. |
| 7 | Settings / Profile | Customer identity. Without profiles, no XP balance, no addresses, no birthdate. |
| 8 | Payments | Revenue collection. Without payments, QUORIN cannot accept money. |
| 9 | Shipping | Delivery. Without shipping, products cannot reach customers. |
| 10 | Search & Filter | Product discovery. Without search, customers cannot find specific products. |
| 11 | Admin Accounts | Business operation. Without admin panel, owners cannot manage the business. |

### Tier 2: Important After Launch

These features should be implemented within 6 months of launch. They enhance the customer experience and operational capability but are not blockers for launching.

| # | Feature | Justification |
|---|---------|---------------|
| 12 | Reviews | Trust signals. Critical for conversion after launch, but not for initial launch. |
| 13 | XP / Loyalty | Retention engine. Drives repeat purchases but not needed for initial transaction flow. |
| 14 | Custom Requests / Inquiry | Differentiator. Captures custom order demand but does not block standard commerce. |
| 15 | Contact Requests | Customer support. Important for trust, but can be email-based initially. |
| 16 | SEO Metadata | Discoverability. Important for organic traffic growth, but paid/social can cover initial launch. |
| 17 | Analytics / Reporting | Business visibility. Needed for post-launch decisions but not for transaction flow. |
| 18 | Data Deletion Requests | Legal compliance. DPDP Act requirement. Should be in place soon after launch but not on day 1. |

### Tier 3: Growth Features

These features should be implemented within 2 years. They are growth drivers that enhance loyalty, operations, and market reach.

| # | Feature | Justification |
|---|---------|---------------|
| 19 | Birthday Gifts & Celebrations | Emotional loyalty. Enhances XP system but not core to commerce. |
| 20 | Theme Editor | Brand control. Owners need it, but brand can be fixed at launch and iterated later. |
| 21 | Content Editor | Marketing content. Important for content management but not for commerce operations. |
| 22 | Returns | Post-purchase handling. Important for professionalism but can be manual initially (email-based). |
| 23 | AI-Readable Trust Data | AI-era discoverability. Strategic but not immediate revenue driver. |

### Tier 4: Nice to Have / Conditional

These features are conditional on business growth or market demand. They are not required for QUORIN's core operation at any stage.

| # | Feature | Justification |
|---|---------|---------------|
| 24 | Bulk Orders | B2B revenue. Only needed if B2B demand materializes (event planners, workshops). |
| 25 | International Payments | International expansion. Only needed if international demand materializes. |

=================================================
ARCHITECTURE RECOMMENDATION
=================================================

### Evaluation Criteria

Each option is evaluated against QUORIN's actual business requirements:

1. **Product count** (~30 products now, ~50–100 in 2 years)
2. **Custom order workflow** (bespoke items via custom requests)
3. **Admin requirements** (product management, order management, content management)
4. **Indian ecommerce requirements** (UPI, cards, net banking via Razorpay/PayU)
5. **XP / Loyalty system** (tiered levels, XP ledger, birthday bonuses)
6. **Trust signals** (reviews, ratings, social proof)
7. **AI-readable trust data** (JSON-LD, schema markup)
8. **Mobile-first** (customer-facing experience)
9. **Owner workflow** (non-technical owners managing the business)
10. **Future scaling** (~30 products → ~100 products, domestic → international)

---

### Option A: Medusa-First

**Definition:** Use Medusa as the primary commerce backend. Products, categories, orders, customers, payments, shipping, inventory, and cart are all handled by Medusa. Custom domains (reviews, XP, birthday gifts, custom requests, settings, content, SEO metadata) are implemented as Medusa custom modules. Admin uses Medusa's built-in admin + custom plugins.

#### Advantages

1. **Commerce domains are handled natively.** Products, categories, variants, cart, orders, payments, shipping, inventory, and auth are all first-class Medusa entities. This covers 11 of 26 features natively. Medusa was built for this exact use case.
2. **Indian ecommerce support via plugins.** Razorpay, ShipRocket, and Delhivery all have Medusa plugins. UPI, cards, and net banking are covered without custom payment engineering.
3. **XP/Loyalty is implementable as a custom module.** The XP ledger, level thresholds, and birthday bonus rules are QUORIN-specific business logic that fits cleanly inside a Medusa module. Integration with order completion (XP earning) and checkout (XP discount application) uses Medusa's event system and price calculation hooks.
4. **Reviews, custom requests, contact requests are lightweight modules.** Each is a simple entity with CRUD operations. These domains are not worth a separate backend service.
5. **Admin panel is mostly provided.** Medusa's admin covers products, orders, customers, and basic analytics. Custom admin plugins cover reviews, custom requests, settings, and content. The owners get a functional admin panel without building one from scratch.
6. **Built-in auth with JWT.** Customer and admin authentication is provided out of the box. No custom auth engineering required.
7. **Inventory management is native.** Per-variant stock levels, stock alerts, and auto-deduction on order completion are all handled.
8. **Search is solvable.** Basic search works natively. For 50+ products, Algolia plugin provides full-text search and faceted filtering.
9. **Returns are native.** RMA creation, refund processing, and inventory restocking are built into Medusa.
10. **International expansion is planned.** Medusa supports multi-currency and has Stripe/PayPal plugins for when international demand materializes (Year 2+).

#### Disadvantages

1. **Custom modules require Medusa expertise.** Building custom modules (XP, reviews, custom requests) requires understanding Medusa's module architecture, event system, and service layer. This is a learning curve for the development team.
2. **Admin plugins require React + Medusa admin SDK.** Custom admin sections (reviews, settings, content) require building React admin plugins using Medusa's admin SDK. This is additional development effort beyond the core commerce layer.
3. **SEO metadata is a frontend concern.** Medusa stores the data (custom module), but JSON-LD rendering is a Next.js concern. The architecture correctly separates storage (Medusa module) from presentation (frontend).
4. **Custom requests with file uploads.** File uploads require storage integration (S3/Cloudinary). Medusa can integrate with any storage provider, but this requires configuration.
5. **Eventual consistency.** Custom modules communicate via Medusa's event system. There is a slight latency between order completion and XP credit. This is acceptable for a loyalty system.

#### Business Risks

1. **Dependency on Medusa ecosystem.** If Medusa makes breaking changes or changes licensing, QUORIN could be impacted. However, Medusa is open-source (MIT license) and has a stable v2.x release.
2. **Custom module maintenance.** Custom modules are QUORIN-specific code that must be maintained alongside Medusa updates. This is a standard open-source integration pattern.

#### Development Risks

1. **Learning curve for Medusa's architecture.** The development team must learn Medusa's module system, service layer, and admin SDK. This is a 1–2 week ramp-up for a team familiar with Node.js/TypeScript.
2. **Admin plugin development.** Building custom admin plugins requires React expertise + Medusa admin SDK knowledge.

#### Maintenance Burden

**Low-Medium.** The majority of commerce functionality (products, orders, payments, shipping, inventory, auth) is maintained by the Medusa community. QUORIN only maintains custom modules (XP, reviews, custom requests, settings, content). This is approximately 20–30% of the backend codebase.

---

### Option B: Custom Backend (Prisma + Express)

**Definition:** Build a completely custom backend with Express.js, Prisma ORM, and PostgreSQL. All 26 features (products, cart, orders, payments, shipping, inventory, auth, XP, reviews, custom requests, settings, content, SEO, analytics, admin) are built from scratch.

#### Advantages

1. **Full control over every domain.** Every entity, API endpoint, and business rule is custom-built. No dependencies on external commerce frameworks.
2. **Simpler initial technology stack.** Express + Prisma is a well-understood stack. No Medusa-specific architecture to learn.
3. **No vendor lock-in.** The entire codebase is owned and controlled by QUORIN.

#### Disadvantages

1. **Every commerce domain must be built from scratch.** Products, variants, cart, orders, payments, shipping, inventory, auth, admin — all of these are well-solved problems in Medusa that must be re-implemented. This is 11 of 26 features.
2. **Payment gateway integration must be custom-built.** Razorpay/PayU integration requires custom API integration, webhook handling, PCI-compliant security, and refund processing. This is high-risk work.
3. **Shipping carrier integration must be custom-built.** ShipRocket/Delhivery integration requires API development, waybill generation, and tracking synchronization.
4. **Admin panel must be built from scratch.** A full admin panel (React/Vue) with CRUD for all entities must be developed. This is a significant frontend engineering effort.
5. **Search must be custom-built or integrated.** Basic database search is fragile. For 50+ products, a full-text search engine (Elasticsearch, Meilisearch, Algolia) must be integrated and maintained.
6. **Returns must be custom-built.** RMA workflow, refund processing, and inventory restocking must be implemented.
7. **Inventory management must be custom-built.** Per-variant stock levels, stock alerts, and order-based deduction must be engineered.
8. **Auth must be custom-built.** Registration, login, JWT, password reset, email verification must all be implemented with security best practices.
9. **Analytics must be custom-built.** Aggregation queries and dashboard UI must be developed.
10. **SEO metadata must be custom-built.** Schema markup generation, sitemap, robots.txt, and per-entity metadata management must be implemented.
11. **Time to market is significantly longer.** Building all 11 commerce domains + 15 custom domains from scratch vs. leveraging Medusa for 11 domains = at least 3–4 months of additional development time.

#### Business Risks

1. **Extended time to market.** Building from scratch delays QUORIN's launch by months. Every month delayed is lost revenue and market opportunity.
2. **Security risk.** Custom auth, payment handling, and session management have a high risk of security vulnerabilities if not implemented by experienced security engineers.
3. **Quality risk.** Commerce features built from scratch are likely to have edge cases and bugs that Medusa has already solved (e.g., cart abandonment, order state transitions, payment webhook retries).
4. **No focus on QUORIN's differentiators.** The team spends months building generic commerce infrastructure instead of QUORIN-specific features (XP, reviews, custom requests, brand identity).

#### Development Risks

1. **Large engineering effort.** 26 features, 11 of which are standard commerce domains already solved by Medusa. The engineering team will spend most of their time on generic features, not QUORIN-specific differentiation.
2. **Ongoing maintenance of generic features.** Every commerce feature (auth, payments, shipping, inventory, returns) must be maintained, patched, and updated by QUORIN's team.
3. **Scaling challenges.** As product count grows from ~30 to ~100, custom search and query performance will require ongoing optimization.

#### Maintenance Burden

**High.** QUORIN maintains 100% of the backend codebase, including all generic commerce features. This is a permanent engineering burden that could be offloaded to the Medusa community.

---

### Option C: Hybrid (Medusa for Commerce + Custom Backend for Everything Else)

**Definition:** Use Medusa for core commerce (products, cart, orders, payments, shipping). Build a separate custom backend (Express/Prisma) for custom domains (XP, reviews, custom requests, settings, content, theme editor, analytics, admin). Integrate the two systems via API calls or shared database.

#### Advantages

1. **Commerce domains are handled by Medusa.** Products, cart, orders, payments, shipping, inventory, and auth are covered by Medusa.
2. **Custom domains have full control.** The custom backend has complete autonomy over XP, reviews, custom requests, settings, content, and analytics.

#### Disadvantages

1. **Integration complexity.** Two systems (Medusa + custom backend) must communicate. This requires API synchronization, shared authentication, consistent data models, and error handling across service boundaries.
2. **XP/Loyalty requires cross-system calls.** XP earning happens on order completion (Medusa event). XP balance queries happen on frontend (custom backend). This requires real-time or near-real-time synchronization between Medusa and the custom backend. Latency and consistency issues are likely.
3. **Reviews require cross-system data.** Reviews link to products (Medusa) and customers (Medusa). The custom backend must query Medusa for product and customer data. This creates a coupling that defeats the purpose of separation.
4. **Custom requests require customer association.** Custom requests link to Medusa customers. The custom backend must query Medusa for customer data.
5. **Two authentication systems.** Medusa has its own auth system. The custom backend needs its own auth system. Synchronizing auth state between the two systems is complex and error-prone.
6. **Admin panel is split.** Admins must potentially use two systems: Medusa admin for commerce data, custom admin for custom domains. This is a poor UX for QUORIN's non-technical owners.
7. **Deployment complexity.** Two backend services to deploy, monitor, and scale.
8. **No clear boundary.** The custom domains (XP, reviews, custom requests) are tightly coupled to commerce data (orders, products, customers). Separating them creates integration overhead without clear architectural benefit.

#### Business Risks

1. **Integration failures.** If Medusa and the custom backend fall out of sync (e.g., XP not credited after order completion, reviews showing stale product data), customer experience degrades.
2. **Increased operational overhead.** Two systems to monitor, debug, and maintain increases the risk of outages and data inconsistency.
3. **Delayed launch.** Integration work between two systems adds significant development time beyond Option B (which has no integration overhead, just pure build).

#### Development Risks

1. **Integration surface area.** Every custom domain must communicate with Medusa. This creates a large integration surface with potential failure points.
2. **Data consistency.** Ensuring consistent data across two systems requires distributed transaction patterns, which add complexity.
3. **No architectural benefit.** The custom domains are tightly coupled to commerce data. There is no independent scaling or deployment benefit from separating them.

#### Maintenance Burden

**Very High.** Two backend systems to maintain, plus the integration layer between them. This is the highest maintenance burden of all three options.

---

### Comparison Matrix

| Criterion | A: Medusa-First | B: Custom Backend | C: Hybrid |
|-----------|:-:|:-:|:-:|
| Products (11 features native) | 10/10 | 3/10 | 10/10 |
| XP / Loyalty (QUORIN-specific) | 7/10 | 8/10 | 6/10 |
| Reviews (QUORIN-specific) | 8/10 | 7/10 | 5/10 |
| Custom Requests (QUORIN-specific) | 8/10 | 7/10 | 5/10 |
| Admin panel | 8/10 | 3/10 | 5/10 |
| Indian payments (UPI, cards) | 9/10 | 5/10 | 9/10 |
| Shipping (Indian carriers) | 8/10 | 4/10 | 8/10 |
| Auth & security | 9/10 | 6/10 | 7/10 |
| Time to market | 9/10 | 2/10 | 5/10 |
| Maintenance burden | 8/10 | 3/10 | 4/10 |
| Owner UX (single admin) | 9/10 | 6/10 | 5/10 |
| Future scaling (~30 → 100 products) | 8/10 | 5/10 | 7/10 |
| **Total** | **86/100** | **53/100** | **66/100** |

---

### Recommendation

**Option A: Medusa-First**

This is the only architecture that aligns with QUORIN's business requirements:

1. **Product count (~30 now, ~100 in 2 years).** Medusa is built for this scale. It handles products, variants, categories, inventory, search, and filtering natively. A custom backend would waste engineering cycles rebuilding these domains.

2. **Custom order workflow.** Custom requests are a Medusa custom module — a lightweight entity with admin workflow. No separate backend needed.

3. **Admin requirements.** Medusa's admin covers 70% of admin needs (products, orders, customers, analytics). Custom plugins cover the rest (reviews, custom requests, settings, content). Single pane of glass for non-technical owners.

4. **Indian ecommerce requirements.** Razorpay (UPI, cards, net banking) and ShipRocket/Delhivery have Medusa plugins. Payment and shipping are solved with zero custom engineering.

5. **XP / Loyalty system.** A Medusa custom module with XP ledger, level thresholds, birthday bonus triggers, and checkout discount hooks. Tightly integrated with order completion and pricing.

6. **Trust signals (reviews).** A Medusa custom module with verification (order-attached), moderation, and rating aggregation. No separate backend needed.

7. **AI-readable trust data.** Stored as Medusa data (SEO metadata module), rendered as JSON-LD in Next.js. Correct architectural boundary: storage in backend, presentation in frontend.

8. **Mobile-first.** Customer-facing experience is handled by the Next.js frontend consuming Medusa APIs. Medusa provides the data layer; the frontend handles mobile UX.

9. **Owner workflow.** Non-technical owners get a complete admin panel (Medusa admin + custom plugins) for managing all QUORIN operations from a single interface.

10. **Future scaling.** Medusa's architecture supports catalog growth, multi-currency (international expansion), and additional payment/shipping providers. The custom modules (XP, reviews, custom requests) scale independently.

**Why not B?** Building 11 commerce domains from scratch when they are solved problems in Medusa is a poor allocation of engineering resources. QUORIN's competitive advantage is its brand, products, and loyalty system — not its cart implementation or payment webhook handler.

**Why not C?** The custom domains (XP, reviews, custom requests) are tightly coupled to commerce data (orders, products, customers). Separating them into a different backend service creates integration overhead (cross-system API calls, data synchronization, dual auth) with no independent scaling or deployment benefit. There is no architectural justification for this split.

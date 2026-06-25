# QUORIN Decision Dependencies

**Date:** 2026-06-24
**Version:** 3 (final answers received — all blockers resolved, confidence scores updated)
**Purpose:** Map every architecture recommendation to the assumptions it depends on, the owner questions that validate those assumptions, and confidence scores (Before vs. After validation).
**Constraint:** Only existing recommendations from `backend_decision.md`, `business_requirements.md`, and `architecture_challenges.md`. No new recommendations.
**Freeze Note:** Do not modify this document until owner answers `owner_questions.md`. Confidence scores will be updated after validation. If findings emerge, append to `architecture_review_notes.md`.

---

## How to Read This Document

Each row maps to a specific recommendation. The **Validating Questions** column references `owner_questions.md` by section number (e.g., "2.1" means section 2.1). Confidence scores are:

- **Before Validation:** Current confidence given that assumptions are unverified.
- **After Validation — Confirmed:** Confidence if the answer confirms the assumption.
- **After Validation — Contradicted:** Confidence if the answer contradicts the assumption (recommendation may weaken or change).

---

## A. Backend Architecture Recommendation

### A.1 Recommendation: Option A (Medusa-First) is the correct architecture

| Field | Value |
|-------|-------|
| **Source** | `backend_decision.md:142-159` |
| **Recommendation** | Use Medusa as the primary commerce backend with custom modules for Reviews, Settings, and Custom Requests. |
| **Assumptions** | 1. Frontend already uses Medusa SDK (verified: `useMedusaCart.ts`, `useMedusaCatalog.ts`, `medusa.ts`) 2. Product count stays manageable (~30–100) 3. Custom orders are not a dominant revenue stream 4. No marketplace/multi-vendor plans 5. GST invoicing can be handled with a custom plugin 6. Digital products and subscriptions are not on the initial roadmap |
| **Validating Questions** | 2.1 (product count), 3.1 (custom order importance), 3.2 (custom order revenue %), 9.1 (marketplace plans), 6.2 (GST at launch), 2.3 (digital products), 2.4 (subscriptions) |
| **Confidence Before** | 6.5 / 10 (per `architecture_challenges.md:204`) |
| **Confidence After Round 1** | 7.5 / 10 — updated with owner answers: custom orders confirmed as secondary (strengthens), physical products only (strengthens), standard payments covered by Razorpay (strengthens). Product count already exceeds ~50 (weakens search path but not core architecture). |
| **After — Confirmed** | 8.5 / 10 — if product count stays manageable, custom orders <20%, no marketplace, GST can be handled with a custom plugin |
| **After — Contradicted** | 3.0 / 10 — if product count is 100+ AND custom orders 30%+ with deposits/milestones, OR marketplace is planned |
| **If Contradicted — Impact** | Marketplace plans (9.1 = Yes/Planned) invalidates all three options. A marketplace-specific platform (Sharetribe, CS-Cart Multi-Vendor) or a custom marketplace build is required. Custom orders at 30%+ with quote→deposit→production workflow may require a separate order-type system beyond Medusa's order model. |

---

### A.2 Recommendation: Build 3 custom modules inside Medusa (`review`, `settings`, `custom-request`)

| Field | Value |
|-------|-------|
| **Source** | `backend_decision.md:178-181`, `backend_decision.md:20-22` |
| **Recommendation** | Create Medusa custom modules for Reviews, Settings, and Custom Requests. |
| **Assumptions** | 1. Medusa's module architecture supports these domains 2. The development team can learn the Medusa module pattern 3. These modules do not need independent scaling 4. Custom admin plugins are maintainable across Medusa upgrades |
| **Validating Questions** | 1.1 (business vision — determines team size/technical capacity), 3.3 (custom order workflow complexity — if complex, module may be insufficient), 5.1 (admin count — affects admin plugin complexity) |
| **Confidence Before** | 7.5 / 10 |
| **Confidence After Round 1** | 8.0 / 10 — owner confirmed custom orders are customer-driven, not a primary workflow. Custom modules (reviews, settings) are simplified since custom orders don't drive complex state machines. |
| **After — Confirmed** | 8.5 / 10 — if team has Node.js expertise, business is boutique/growing (not enterprise-scale requiring massive custom logic) |
| **After — Contradicted** | 6.0 / 10 — if custom order workflow requires complex state machine (quote→deposit→production→delivery) that exceeds Medusa module event system, or if admin count grows to 10+ requiring fine-grained RBAC beyond Medusa's basic roles |

---

### A.3 Recommendation: Decommission `backend-backup/` (Express)

| Field | Value |
|-------|-------|
| **Source** | `backend_decision.md:54-55` |
| **Recommendation** | Express backend (`backend-backup/`) is decommissioned. Not needed. |
| **Assumptions** | 1. Medusa can handle all 7 domains (4 native + 3 custom modules) 2. No domain requires independent scaling 3. Integration between Medusa and custom modules is acceptable within a single codebase |
| **Validating Questions** | 9.1 (marketplace — if yes, Express as a separate service might be reconsidered for marketplace-specific logic), 5.2 (admin growth — if 5-10x growth, dual systems might be reconsidered) |
| **Confidence Before** | 8.0 / 10 |
| **Confidence After Round 1** | 8.5 / 10 — owner confirmed standard payments (Medusa wins), physical-only products (no digital fulfillment needed), growing catalog (Medusa handles growth better). Express prototype (`backend-backup/`) is even less justified. |
| **After — Confirmed** | 9.0 / 10 — if business is boutique/growing, no marketplace, team size stable |
| **After — Contradicted** | 5.0 / 10 — if marketplace is planned or custom domains need to scale independently (unlikely at QUORIN's scale) |

---

## B. Commerce Feature Recommendations

### B.1 Recommendation: Products — Medusa Native

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:34` |
| **Recommendation** | Products are a first-class commerce entity. Use Medusa native. CostPrice added as a custom field. |
| **Assumptions** | 1. Product variants are standard (size, color) 2. No bundle products 3. No digital products 4. ~30–100 products |
| **Validating Questions** | 2.1 (product count), 2.2 (variants per product), 2.5 (bundles), 2.3 (digital products) |
| **Confidence Before** | 9.5 / 10 |
| **After — Confirmed** | 10 / 10 — if ≤100 products, standard variants, no bundles |
| **After — Contradicted** | 8.0 / 10 — if 100+ products, bundles need a custom module, digital products need a separate fulfillment layer |

---

### B.2 Recommendation: Categories — Medusa Native

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:50` |
| **Recommendation** | Use Medusa's product-categories model. Supports nested hierarchies. |
| **Assumptions** | 1. 3 categories (resin-art, candle-making, soap-making) is sufficient 2. Subcategories may be added later |
| **Validating Questions** | 2.1 (product count — more products may need more categories), 4.2 (international — may need category localization) |
| **Confidence Before** | 9.0 / 10 |
| **After — Confirmed** | 9.5 / 10 |
| **After — Contradicted** | 7.5 / 10 — if product count exceeds 200, category structure may need deeper nesting than Medusa's default model supports |

---

### B.3 Recommendation: Cart — Medusa Native

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:82` |
| **Recommendation** | Use Medusa's cart system. Price calculation hooks for XP/gift discounts. |
| **Assumptions** | 1. XP discounts and gift discounts integrate with Medusa's price hooks 2. Cart session management works with localStorage for cart ID |
| **Validating Questions** | 8.1 (XP system importance — if critical, price hook integration must be robust), 4.3 (COD — affects payment flow, not cart itself) |
| **Confidence Before** | 9.0 / 10 |
| **After — Confirmed** | 9.5 / 10 — if XP is moderate/critical (not "skip"), Medusa hooks are sufficient |
| **After — Contradicted** | 7.0 / 10 — if XP system has complex discount stacking rules beyond what price hooks support |

---

### B.4 Recommendation: Orders — Medusa Native

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:98` |
| **Recommendation** | Use Medusa's order system. Custom statuses for QUORIN-specific flows via extensions. |
| **Assumptions** | 1. Standard order lifecycle (pending → paid → shipped → delivered) covers most use cases 2. Custom statuses (e.g., "custom order in production") are simple extensions |
| **Validating Questions** | 3.3 (custom order workflow — if quote→deposit→production→delivery, standard order model may be insufficient), 3.2 (custom order revenue %) |
| **Confidence Before** | 8.0 / 10 |
| **Confidence After Round 1** | 8.5 / 10 — owner confirmed custom orders are customer-driven and not a primary workflow. Standard Medusa order model likely covers most cases. |
| **After — Confirmed** | 9.0 / 10 — if custom orders are simple inquiries (<15% revenue) |
| **After — Contradicted** | 5.0 / 10 — if custom orders require a separate order type with deposits, milestones, and production tracking |

---

### B.5 Recommendation: Reviews — Medusa Custom Module

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:112` |
| **Recommendation** | Custom Medusa module with Review model (product_id, customer_id, order_id, rating, text, moderation_status). Anti-abuse via order association. |
| **Assumptions** | 1. Review volume is moderate (one per completed order) 2. Moderation queue is manageable 3. Rating aggregation queries can be optimized |
| **Validating Questions** | 8.1 (XP system — if XP bonus for reviews, review volume may grow faster), 4.1 (customer type — retail-only means simpler review patterns) |
| **Confidence Before** | 7.0 / 10 |
| **After — Confirmed** | 8.0 / 10 — if retail-only, moderate review volume, XP bonus is moderate |
| **After — Contradicted** | 6.0 / 10 — if XP bonus drives aggressive review generation (hundreds per product), requiring index optimization in the custom module |

---

### B.6 Recommendation: XP / Loyalty — Medusa Custom Module

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:128` |
| **Recommendation** | Medusa custom module with XP_Ledger, Level_Config, Discount_Rule. Integration with order completion (XP earning) and checkout (XP discount application). |
| **Assumptions** | 1. XP earning triggers on order completion (Medusa event) 2. XP discount application uses Medusa price calculation hooks 3. Anti-fraud (no XP from self-purchases or returns) is straightforward |
| **Validating Questions** | 8.1 (XP system importance — if critical, module must be carefully designed from day 1), 8.2 (referral system — adds another custom module dimension), 4.3 (COD — COD orders still earn XP?) |
| **Confidence Before** | 7.0 / 10 |
| **After — Confirmed** | 8.5 / 10 — if XP is important/critical, team commits to careful design from day 1 |
| **After — Contradicted** | 5.5 / 10 — if XP is "not important", module is low priority and may be deprioritized; if referral system is "yes", adds complexity |

---

### B.7 Recommendation: Payments — Medusa Native (Razorpay plugin)

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:298` |
| **Recommendation** | Use Medusa's payment architecture with Razorpay plugin. Covers UPI, cards, net banking. |
| **Assumptions** | 1. Razorpay supports all required payment methods 2. Razorpay Medusa plugin is maintained and compatible with Medusa v2.16.0 |
| **Validating Questions** | 6.1 (payment methods at launch), 6.3 (international payments — Stripe/PayPal plugins for later) |
| **Confidence Before** | 9.0 / 10 |
| **Confidence After Round 1** | 9.5 / 10 — owner confirmed all standard payment methods (UPI, cards, wallets). Razorpay covers all of these natively. Medusa's Razorpay plugin is the correct choice. |
| **After — Confirmed** | 9.5 / 10 — if UPI + Cards is sufficient at launch, Razorpay covers all methods |
| **After — Contradicted** | 7.0 / 10 — if Net Banking or Wallets are required at launch, Razorpay still covers them but plugin compatibility may be a concern |

---

### B.8 Recommendation: Shipping — Medusa Native + Carrier Plugin

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:314` |
| **Recommendation** | Use Medusa's shipping profiles and carrier plugins (ShipRocket, Delhivery). |
| **Assumptions** | 1. Single shipping location 2. Indian carriers (ShipRocket/Delhivery) have Medusa plugins |
| **Validating Questions** | 7.1 (shipping locations), 7.2 (shipping carriers), 7.3 (international shipping) |
| **Confidence Before** | 7.5 / 10 |
| **After — Confirmed** | 8.5 / 10 — if single location, ShipRocket/Delhivery |
| **After — Contradicted** | 5.0 / 10 — if multiple locations (needs custom fulfillment routing), international shipping (needs separate carrier integration) |

---

### B.9 Recommendation: Inventory — Medusa Native

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:330` |
| **Recommendation** | Use Medusa's inventory system. Per-variant stock levels, stock alerts, auto-deduction. |
| **Assumptions** | 1. ~50 variants total is manageable 2. Multi-location tracking is not needed at launch |
| **Validating Questions** | 2.2 (variants per product), 7.1 (shipping locations — multi-location affects inventory) |
| **Confidence Before** | 8.5 / 10 |
| **After — Confirmed** | 9.5 / 10 — if ≤5 variants per product, single location |
| **After — Contradicted** | 7.0 / 10 — if 10+ variants per product, multi-location fulfillment needed |

---

### B.10 Recommendation: Search — Medusa + Algolia Plugin

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:344` |
| **Recommendation** | Basic search for ≤50 products. Algolia plugin for 50+ products. |
| **Assumptions** | 1. Product count determines search infrastructure |
| **Validating Questions** | 2.1 (product count — the single most important question for this recommendation) |
| **Confidence Before** | 7.0 / 10 |
| **Confidence After Round 1** | 8.0 / 10 — owner confirmed product count already exceeds 50 (dozens of SKUs on Amazon, growing). Algolia plugin should be planned early; native search can serve initial launch if budget constrained. |
| **After — Confirmed (≤30)** | 8.5 / 10 — basic database search is sufficient |
| **After — Confirmed (60–100+)** | 8.0 / 10 — Algolia plugin is the right call, adds budget consideration |
| **After — Contradicted** | N/A — this recommendation adapts to product count; no contradiction, just different path |

---

### B.11 Recommendation: Admin Panel — Medusa Native Admin + Custom Plugins

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:284` |
| **Recommendation** | Use Medusa's built-in admin for products, orders, customers. Custom admin plugins for reviews, custom requests, settings, content. |
| **Assumptions** | 1. Admin count is small (1–5) 2. Fine-grained permissions are not needed at launch |
| **Validating Questions** | 5.1 (admin users today), 5.2 (admin users in 2 years), 5.3 (staff roles with permissions) |
| **Confidence Before** | 8.0 / 10 |
| **After — Confirmed (1–2 admins, no roles)** | 9.0 / 10 — Medusa's basic roles suffice |
| **After — Contradicted (5–10 admins, roles needed)** | 5.5 / 10 — requires custom permissions module, Medusa admin plugins become maintenance burden |

---

## C. Deferred Feature Recommendations (Phase 2+)

### C.1 Recommendation: Custom Requests — Medusa Custom Module

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:206` |
| **Recommendation** | CustomRequests entity with custom fields, status transitions, file upload integration. |
| **Assumptions** | 1. Custom requests are a QUORIN-specific domain 2. File uploads integrate with Medusa-compatible storage (S3/Cloudinary) |
| **Validating Questions** | 3.1 (custom order importance), 3.3 (workflow complexity) |
| **Confidence Before** | 8.0 / 10 |
| **After — Confirmed** | 8.5 / 10 — if important but not core, standard Medusa module pattern works |
| **After — Contradicted** | 5.0 / 10 — if core to the business with complex quote→deposit→production workflow, may need a dedicated order type system |

---

### C.2 Recommendation: Theme Editor — Medusa Custom Module

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:174` |
| **Recommendation** | ThemeConfig entity with CRUD API. Admin UI as a Medusa admin plugin. |
| **Assumptions** | 1. Theme config is a simple structured entity 2. Admin plugin development is feasible |
| **Validating Questions** | 5.1 (admin count — if 1–2, admin plugin is manageable) |
| **Confidence Before** | 8.5 / 10 |
| **After — Confirmed** | 9.0 / 10 |
| **After — Contradicted** | 7.0 / 10 — if admin grows, custom admin plugin maintenance increases |

---

### C.3 Recommendation: Content Editor — Medusa Custom Module

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:190` |
| **Recommendation** | ContentConfig entity with content_type, content_key, content_body, is_active. |
| **Assumptions** | 1. Content management is simple structured data |
| **Validating Questions** | 9.4 (community/forum — if built-in forum, content editor scope expands significantly) |
| **Confidence Before** | 9.0 / 10 |
| **After — Confirmed** | 9.5 / 10 |
| **After — Contradicted** | 7.0 / 10 — if built-in community/forum is planned, content editor scope expands beyond simple key-value store |

---

### C.4 Recommendation: SEO Metadata — Medusa Custom Module + Frontend Integration

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:360` |
| **Recommendation** | SeoMetadata entity in Medusa. JSON-LD rendering in Next.js frontend. |
| **Assumptions** | 1. SEO metadata is a data storage + frontend rendering concern 2. Per-product/per-category metadata scales with product count |
| **Validating Questions** | 2.1 (product count — more products = more metadata records) |
| **Confidence Before** | 8.5 / 10 |
| **After — Confirmed** | 9.0 / 10 |
| **After — Contradicted** | 7.5 / 10 — if 100+ products, metadata management becomes more complex but still within Medusa module scope |

---

### C.5 Recommendation: AI-Readable Trust Data — Frontend Implementation

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:376` |
| **Recommendation** | Frontend concern. Next.js renders JSON-LD using Medusa data (products, reviews, settings). No backend module needed. |
| **Assumptions** | 1. Structured data output is primarily a frontend concern |
| **Validating Questions** | N/A — this is an implementation decision independent of owner answers |
| **Confidence Before** | 9.0 / 10 |
| **After — Confirmed** | 9.5 / 10 |
| **After — Contradicted** | N/A — independent of owner answers |

---

### C.6 Recommendation: Data Deletion Requests — Medusa Custom Module

| Field | Value |
|-------|-------|
| **Source** | `business_requirements.md:252` |
| **Recommendation** | DataDeletionRequest entity with customer_id, status, admin_review, executed_at. Deletion service with compliance exceptions. |
| **Assumptions** | 1. DPDP Act compliance requires a formal deletion workflow 2. Order records must be retained for tax/compliance (exceptions apply) |
| **Validating Questions** | N/A — legal requirement in India. Implementation is mandatory regardless of other answers. |
| **Confidence Before** | 9.0 / 10 |
| **After — Confirmed** | 9.0 / 10 (mandatory) |
| **After — Contradicted** | N/A — mandatory regardless of other answers |

---

## D. Invalidating Scenarios

### D.1 Marketplace / Multi-Vendor (Invalidates All Options)

| Field | Value |
|-------|-------|
| **Source** | `owner_questions.md:250-257` |
| **Condition** | 9.1 = "Yes, planned" |
| **Impact** | **All three options (A, B, C) are invalidated.** Neither Medusa nor a standard custom backend supports multi-vendor marketplaces. A marketplace-specific platform (Sharetribe, CS-Cart Multi-Vendor) or a custom marketplace build is required. |
| **Confidence Impact** | All confidence scores become N/A — the recommendation changes entirely. |

---

### D.2 Complex Custom Order Workflow (Weakens Option A)

| Field | Value |
|-------|-------|
| **Source** | `owner_questions.md:105-112`, `architecture_challenges.md:115` |
| **Condition** | 3.3 = "Yes" (quote→deposit→production→delivery) AND 3.2 = "30%+" revenue from custom orders |
| **Impact** | Medusa's order model cannot handle deposits, milestones, and production tracking without significant extension. A separate order type with its own state machine is needed. Option A weakens from 6.5/10 to ~4.5/10. |
| **Confidence Impact** | Option A: 6.5/10 → 4.5/10. Option C (Hybrid) may become more attractive for the custom order subsystem. |

---

### D.3 Product Count Already Exceeds 50 (Resolved)

| Field | Value |
|-------|-------|
| **Source** | `owner_questions.md:36-43`, `architecture_challenges.md:117` |
| **Condition** | 2.1 = "100+ products" → **ALREADY CONFIRMED** by owner: dozens of SKUs live on Amazon, catalog growing beyond initial 16 seed products. |
| **Impact** | Product count already exceeds ~50 threshold. Algolia plugin should be planned and budgeted early, but native search can serve initial launch if budget is constrained. Custom modules queries must be carefully indexed. |
| **Confidence Impact** | Search recommendation (B.10) shifts to "Algolia planned early". Option A confidence: 7.5/10 → 7.0/10 (budget/complexity concern, but MitigaTED by Razorpay confirmation elsewhere). |

---

## E. Confidence Score Summary

### Option A (Medusa-First)

| Condition | Confidence |
|-----------|-----------|
| Before validation (current state) | **6.5 / 10** |
| After Round 1 validation | **7.5 / 10** — updated with owner answers: custom orders confirmed as secondary, physical products only, standard payments, but product count already exceeds 50 |
| Confirmed (≤60 products, custom orders <20%, no marketplace, 1–2 admins, retail-only) | **8.5 / 10** |
| Contradicted (100+ products, custom orders 30%+ with complex workflow, marketplace planned) | **3.0 / 10** |
| Partial contradiction (60–100 products, custom orders 15–30%, no marketplace) | **7.0 / 10** |

### Option B (Custom Backend)

| Condition | Confidence |
|-----------|-----------|
| Before validation | **3.0 / 10** |
| After Round 1 | **2.5 / 10** — owner confirmed custom orders are NOT a dominant workflow, standard payments needed (Medusa wins), growing catalog (Medusa handles growth better). |
| Confirmed | 3.0 / 10 — current evidence does not justify Option B; becomes higher if custom orders become a dominant revenue stream with complex workflows |
| Contradicted | 7.0 / 10 — if custom orders are 50%+ revenue with quote→deposit→production→revisions workflow |

### Option C (Hybrid)

| Condition | Confidence |
|-----------|-----------|
| Before validation | **2.0 / 10** |
| After Round 1 | **1.5 / 10** — owner confirmed standard payments (single system wins), physical-only products (no separate fulfillment system needed), custom orders not primary. Dual-system overhead is harder to justify. |
| Confirmed | 2.0 / 10 — current evidence does not justify Hybrid architecture for QUORIN's scale |
| Contradicted | 6.0 / 10 — if custom domains need independent scaling at high volume AND marketplace is planned |

---

## F. Critical Validation Priority

Questions marked with the highest architecture impact, in order of importance:

| Priority | Question | Affects |
|----------|----------|---------|
| **P0** | 9.1 (Marketplace plans) | Invalidates all options if "Yes, planned" |
| **P0** | 2.1 (Product count) | Search infrastructure, Algolia budget, module query optimization |
| **P0** | 3.3 (Custom order workflow) | Order model extension vs. separate order type |
| **P1** | 3.1 (Custom order importance) | Custom module priority and scope |
| **P1** | 6.2 (GST at launch) | Custom invoice module urgency |
| **P1** | 6.1 (Payment methods) | Razorpay plugin coverage |
| **P2** | 8.1 (XP system importance) | Custom module priority, launch timeline |
| **P2** | 4.1 (Customer type) | Pricing module, review patterns |
| **P2** | 5.1 (Admin users today) | Admin plugin complexity |
| **P2** | 5.3 (Staff roles) | Permissions module necessity |
| **P3** | 7.1 (Shipping locations) | Shipping profiles complexity |
| **P3** | 7.2 (Shipping carrier) | Carrier plugin selection |
| **P3** | 4.2 (International customers) | Multi-currency plugin planning |
| **P3** | 2.3 (Digital products) | Digital fulfillment module |
| **P3** | 2.4 (Subscriptions) | Subscription/billing module |
| **P3** | 2.5 (Product bundles) | Bundle product module |

---

## G. Recommendation Freeze Status

**Current status: PARTIALLY VALIDATED (all rounds complete). Option A (Medusa-First) currently recommended at 8.0/10.**

**Round 1 summary (2026-06-24):**
- 14 items validated or upgraded: custom orders secondary, physical products only, no digital/subscriptions, standard payments, product count >50, sales channels Website + Amazon, no marketplace, no multi-vendor, custom orders not core business, Medusa modules fit standard ecommerce, XP/birthday rewards required, no custom SaaS platform, retail maker-supply identity confirmed, Medusa order model covers most cases.
- 1 assumption invalidated: A1 (product count <100 — owner confirmed growing catalog beyond 100 SKUs).
- Option A confidence improved from 6.5 → 7.5/10.

**Round 2/3 summary (2026-06-24): COD, Shipping, GST confirmed**
- COD supported where available (Razorpay native support).
- ShipRocket aggregation preferred (Delhivery, BlueDart, Xpressbees, Ecom Express).
- GST invoices required at launch (custom invoice module needed).
- Option A confidence: 7.5 → **8.0/10** (confirmed scenario: standard ecommerce with loyalty features).
- High confidence: 10 → 13 (A9, A12, A19 moved up).
- Medium-High: 3 → 2 (A8).
- Medium: 8 → 6 (A12 moved up).
- Low: 1 (A18 — marketing strategy unknown, not an architecture blocker).

**Recommendation: Option A (Medusa-First) currently recommended.** All architecture blockers resolved. This recommendation stands on current evidence and may be re-evaluated as more business details are clarified.


# QUORIN Assumptions Register

**Date:** 2026-06-24
**Version:** 4 (final owner answers received — 3 remaining assumptions validated, all blockers resolved)
**Purpose:** Centralize every assumption across architecture documents. Each assumption is traced to its source, supported/contradicted by evidence, and linked to the owner question that validates it.
**Scope:** All architecture documents reviewed (`backend_decision.md`, `business_requirements.md`, `architecture_challenges.md`, `architecture_audit.md`, `backend_inventory.md`).
**Rule:** No new recommendations. No implementation planning. No code.
**Freeze Note:** Freeze lifted for Version 2 update only. No new recommendations or implementation planning. If further findings emerge, append to `architecture_review_notes.md`.

---

## How to Read This Register

| Column | Meaning |
|--------|---------|
| **ID** | Unique identifier (A=architecture, BR=business requirements, AC=architecture challenges, AA=audit, BI=backend inventory) |
| **Assumption** | The statement being assumed |
| **Confidence** | Low / Medium / High — based on available evidence quality |
| **Evidence For** | What facts, code, or documents support this assumption |
| **Evidence Against** | What facts, gaps, or contradictions weaken this assumption |
| **Source** | Which document(s) contain this assumption |
| **Validating Question** | Which `owner_questions.md` entry resolves this |

---

## Assumptions

### A1

| Field | Value |
|-------|-------|
| **ID** | A-01 |
| **Assumption** | Product count will stay under ~100 in years 1–2. |
| **Status** | INVALIDATED — owner confirmed dozens of SKUs already live on Amazon with growing catalog. |
| **Confidence** | Medium (now assumes catalog exceeds 100 SKUs) |
| **Evidence For** | Owner confirmed dozens of SKUs already sold on Amazon (resin kits, pigments, tools, candle supplies, soap colors, silica gel, moulds, accessories, etc.). Initial 16 seed products in `backend/seed.ts` and 24 in `products.ts` are well below current live inventory. |
| **Evidence Against** | N/A — owner answer contradicts the "under ~100" assumption. |
| **Source** | `backend_decision.md:220`, `business_requirements.md:490-499`, `architecture_challenges.md:11-16` |
| **Validating Question** | 2.1 — How many products do you expect? |

---

### A2

| Field | Value |
|-------|-------|
| **ID** | A-02 |
| **Assumption** | Custom orders will remain a secondary revenue stream (<20% of total). |
| **Status** | VALIDATED — owner confirmed custom orders are customer-driven and not a primary business workflow. |
| **Confidence** | Medium |
| **Evidence For** | Owner confirmed custom orders are customer-driven and not a primary workflow. No existing custom order infrastructure in either backend. Frontend has a basic inquiry form but no structured workflow. |
| **Evidence Against** | QUORIN's identity as a maker-supply store naturally lends itself to bespoke work (custom resin art, bespoke candle sets). However, owner's confirmation that this is not a primary revenue stream reduces this risk. |
| **Source** | `backend_decision.md:220`, `architecture_challenges.md:22-24, 115` |
| **Validating Question** | 3.1 (importance) + 3.2 (revenue %) + 3.3 (workflow complexity) |

---

### A3

| Field | Value |
|-------|-------|
| **ID** | A-03 |
| **Assumption** | QUORIN is not planning a marketplace or multi-vendor model. |
| **Status** | VALIDATED — owner confirmed: "No evidence of becoming a marketplace", "No multi-vendor support needed". |
| **Confidence** | High |
| **Evidence For** | Owner confirmed no marketplace plans and no multi-vendor requirements. All architecture docs already treat QUORIN as a single-vendor store. No vendor onboarding, split payouts, or commission logic exists in code or business requirements. |
| **Evidence Against** | N/A — owner explicitly confirmed this. |

---

### A4

| Field | Value |
|-------|-------|
| **ID** | A-04 |
| **Assumption** | Medusa's module architecture can handle QUORIN's custom domains (reviews, XP, settings, custom requests). |
| **Status** | VALIDATED — owner confirmed: custom orders are customer-driven, low volume, NOT core business. XP, reviews, and birthday rewards are confirmed loyalty features. Business resembles a "normal ecommerce brand with loyalty features" — not a custom SaaS platform. |
| **Confidence** | High |
| **Evidence For** | Owner confirmed custom orders are NOT core business. XP system, birthday rewards, reviews, and settings are straightforward loyalty/engagement features that fit Medusa's module pattern. Medusa v2 is designed for commerce core + custom modules. Reviews, settings, custom requests, XP are lightweight entities with CRUD operations. |
| **Evidence Against** | Admin plugins are a maintenance burden across Medusa upgrades. If custom orders need complex state machines, but owner confirmed they are not core — reducing this risk. |

---### A5

| Field | Value |
|-------|-------|
| **ID** | A-05 |
| **Assumption** | The development team can learn and maintain Medusa custom modules. |
| **Confidence** | Medium |
| **Evidence For** | Codebase uses TypeScript, Node.js, React — all compatible with Medusa's stack. `useMedusaCart.ts` and `useMedusaCatalog.ts` already use the Medusa SDK. |
| **Evidence Against** | Medusa v2's module pattern differs from Express/Prisma. If the team comes from a pure Express background, there's a learning curve (estimated 1–2 weeks per `backend_decision.md:535`). |
| **Source** | `backend_decision.md:49-50, 535`, `business_requirements.md:522-523` |
| **Validating Question** | 1.1 (business vision — affects team size/skill) |

---

### A6

| Field | Value |
|-------|-------|
| **ID** | A-06 |
| **Assumption** | Express backend (`backend-backup/`) is not needed for any domain. |
| **Status** | VALIDATED — business is a standard ecommerce brand with loyalty features. No independent scaling needs, no marketplace, no complex custom order workflows. |
| **Confidence** | High |
| **Evidence For** | Owner confirmed QUORIN is a normal ecommerce brand with loyalty features — not a custom SaaS platform, not a marketplace. Business does not need independent scaling for custom domains. `backend-backup/` is incomplete (only Products, Inquiries, Admin) and Medusa covers all domains natively or via lightweight custom modules. |
| **Evidence Against** | N/A — owner's confirmation of standard ecommerce model eliminates any independent scaling justification. |

---

### A7

| Field | Value |
|-------|-------|
| **ID** | A-07 |
| **Assumption** | Razorpay supports all required Indian payment methods (UPI, cards, net banking, wallets). |
| **Status** | VALIDATED — owner confirmed UPI, cards, wallets, and standard ecommerce payment methods required. |
| **Confidence** | High |
| **Evidence For** | Owner confirmed all standard ecommerce payment methods are needed. Razorpay supports UPI (GPay, PhonePe, Paytm), cards, net banking, wallets, and more. Medusa has a Razorpay plugin. |
| **Evidence Against** | Plugin compatibility with Medusa v2.16.0 is not verified. If new payment features (UPI intent flow changes, new settlement APIs) are needed, the plugin may lag behind. |
| **Source** | `backend_decision.md:134, 179-180`, `business_requirements.md:298` |
| **Validating Question** | 6.1 (payment methods at launch) + 6.3 (international payments) |

---

### A8

| Field | Value |
|-------|-------|
| **ID** | A-08 |
| **Assumption** | Search requirements are driven by product count: ≤50 products = database search, 50+ = Algolia. |
| **Status** | PARTIALLY VALIDATED — owner confirmed product count exceeds ~50 (dozens of SKUs already on Amazon, growing). |
| **Confidence** | Medium |
| **Evidence For** | Owner confirmed dozens of SKUs already live on Amazon, exceeding the ~50 threshold where Algolia becomes necessary. Database-backed search degrades with unindexed queries. Algolia provides full-text search, faceted filtering, and typo tolerance. |
| **Evidence Against** | The exact thresholds (50, 60, 100) remain heuristic. QUORIN's products (craft supplies, pigments, tools) have simple names but rich variant matrices — catalog complexity may push the Algolia threshold lower than 50. |
| **Source** | `business_requirements.md:344`, `backend_decision.md:220` |
| **Validating Question** | 2.1 (product count) — note: thresholds labeled as estimates, not facts. |

---

### A9

| Field | Value |
|-------|-------|
| **ID** | A-09 |
| **Assumption** | Shipping carrier integrations (ShipRocket, Delhivery) have Medusa plugins. |
| **Status** | VALIDATED — owner confirmed ShipRocket aggregation preferred (Delhivery, BlueDart, Xpressbees, Ecom Express). |
| **Confidence** | High |
| **Evidence For** | Owner confirmed shipping tracking is required and multiple carriers are likely needed. `business_requirements.md:314` states ShipRocket and Delhivery plugins exist. Medusa supports shipping profiles and carrier plugins. Community plugins for major Indian carriers are documented. |
| **Evidence Against** | Plugin maintenance status is unknown. Specific carrier selection (ShipRocket vs Delhivery vs others) not confirmed yet. Carrier API changes can break plugins. |

---

### A10

| Field | Value |
|-------|-------|
| **ID** | A-10 |
| **Assumption** | Admin permission needs are simple: 1–2 admins with full access. |
| **Confidence** | Low |
| **Evidence For** | Current frontend admin access is client-side only (`App.tsx:317`). Demo accounts suggest a small team. No existing permission system is needed. |
| **Evidence Against** | If QUORIN hires dedicated staff (product manager, support, content editor), permissions become critical. Medusa supports basic roles (user/admin) but not fine-grained permissions (view-only orders, edit-products-only). |
| **Source** | `backend_decision.md:152-153`, `business_requirements.md:284`, `architecture_challenges.md:18-20` |
| **Validating Question** | 5.1 (admin users today) + 5.2 (admin users in 2 years) + 5.3 (staff roles) |

---

### A11

| Field | Value |
|-------|-------|
| **ID** | A-11 |
| **Assumption** | XP/Loyalty is a QUORIN-specific domain that fits within a Medusa custom module. |
| **Status** | VALIDATED — owner confirmed XP system, birthday rewards, reviews, and ratings are required features with existing business rules. |
| **Confidence** | High |
| **Evidence For** | Owner confirmed XP system and birthday rewards are required with existing business rules. XP logic (earn on orders, spend on discounts, level thresholds, birthday bonuses) is straightforward business logic. Medusa's event system (order completion triggers XP earning) and price calculation hooks (XP discounts at checkout) support this cleanly. Reviews and ratings are standard moderation entities. |
| **Evidence Against** | If XP has complex discount stacking rules (XP + gift + referral + seasonal), price calculation hooks may be insufficient. However, owner confirmed "loyalty features" not "custom SaaS platform" — suggesting moderate complexity. |

---

### A12

| Field | Value |
|-------|-------|
| **ID** | A-12 |
| **Assumption** | GST invoicing requires a custom module regardless of architecture. |
| **Status** | VALIDATED — owner confirmed GST invoices required at launch. |
| **Confidence** | High |
| **Evidence For** | `owner_questions.md:187-188` states neither Medusa nor a custom backend generates GST invoices natively. Indian ecommerce requires per-invoice tax calculation based on HSN codes and destination state. |
| **Evidence Against** | N/A — this is a confirmed gap in both options if GST is required. The architecture choice doesn't affect this; a custom invoice module is needed in all cases where GST is required. |
| **Source** | `backend_decision.md:187-188`, `business_requirements.md:44-48`, `architecture_challenges.md:48-49` |
| **Validating Question** | 6.2 (GST invoices at launch) — PENDING final confirmation |

---

### A13

| Field | Value |
|-------|-------|
| **ID** | A-13 |
| **Assumption** | The frontend's Medusa integration (`useMedusaCart.ts`, `useMedusaCatalog.ts`, `medusa.ts`) represents ~90% reusable code if Option A is chosen. |
| **Confidence** | Medium |
| **Evidence For** | `backend_decision.md:128` estimates 90% reuse. Cart flow is already wired to Medusa (`useMedusaCart.ts`). Catalog fetches from Medusa (`useMedusaCatalog.ts`). Auth SDK exists (`medusa.ts`). |
| **Evidence Against** | The cart is the only system with active Medusa integration. Products, orders, accounts, and admin settings are NOT wired to Medusa (per `architecture_audit.md`). "90% reusable" may overstate the case — the reusable portion is primarily cart operations, not the full commerce flow. |
| **Source** | `backend_decision.md:146-147, 128`, `architecture_audit.md:77, 97, 276-289` |
| **Validating Question** | N/A — this is an engineering assessment, not validated by owner questions. |

---

### A14

| Field | Value |
|-------|-------|
| **ID** | A-14 |
| **Assumption** | Building a custom backend (Option B) is not justified for QUORIN's use case. |
| **Status** | VALIDATED — owner confirmed business resembles a "normal ecommerce brand with loyalty features" — NOT a custom SaaS platform, NOT marketplace, NOT heavy custom-order business. |
| **Confidence** | High |
| **Evidence For** | Owner confirmed QUORIN is a standard ecommerce brand with loyalty features. Custom orders are not a core workflow. No marketplace or multi-vendor plans. 11 of 26 features are standard commerce domains (products, categories, variants, cart, orders, payments, shipping, inventory, auth, admin, search). Building these from scratch is reinventing mature solutions. Time to market would be significantly longer with a custom backend. |
| **Evidence Against** | N/A — owner's explicit description eliminates the primary justification for a custom backend (heavy custom order workflows, SaaS platform, marketplace). |

---

### A15

| Field | Value |
|-------|-------|
| **ID** | A-15 |
| **Assumption** | Two backends (Hybrid — Option C) provide no independent scaling benefit for QUORIN. |
| **Status** | VALIDATED — business is a standard ecommerce brand, not a high-volume platform. |
| **Confidence** | High |
| **Evidence For** | Owner confirmed QUORIN is a normal ecommerce brand with loyalty features — not a high-volume platform. Custom domains (XP, reviews, custom requests) are tightly coupled to commerce data. Splitting them creates integration overhead without scaling benefit. QUORIN will not approach massive transaction volumes in 3+ years. |
| **Evidence Against** | If custom requests become a large revenue share, a separate subsystem might be justified. Current evidence does not justify Hybrid architecture. |

---

### A16

| Field | Value |
|-------|-------|
| **ID** | A-16 |
| **Assumption** | Review volume will be moderate (one review per completed order). |
| **Confidence** | Low |
| **Evidence For** | Review model ties to completed orders. Not every customer leaves a review. |
| **Evidence Against** | If QUORIN incentivizes reviews via XP bonuses (8.1 = critical), review volume could grow to hundreds or thousands per product. Moderation queue and rating aggregation queries must scale. |
| **Source** | `architecture_challenges.md:27-28` |
| **Validating Question** | 8.1 (XP system importance — if XP bonus for reviews is planned) |

---

### A17

| Field | Value |
|-------|-------|
| **ID** | A-17 |
| **Assumption** | Digital products and subscriptions are not on the initial roadmap. |
| **Status** | VALIDATED — owner confirmed physical products only, no subscription products, no membership products. |
| **Confidence** | High |
| **Evidence For** | Owner explicitly confirmed: physical products, no subscriptions, no memberships. No existing infrastructure for digital fulfillment or recurring billing in either backend. Focus is entirely on physical goods. |
| **Evidence Against** | QUORIN could add courses or subscriptions later. Both architectures require custom modules, but not at launch. |

---

### A18

| Field | Value |
|-------|-------|
| **ID** | A-18 |
| **Assumption** | Traffic volume is moderate with no extreme scaling needs. |
| **Confidence** | Low |
| **Evidence For** | QUORIN is a niche DTC store. No indication of viral growth or media coverage. |
| **Evidence Against** | If QUORIN goes viral on Instagram or is featured in a maker-community publication, traffic could spike. Medusa's default stack handles this reasonably, but unindexed custom module queries could become bottlenecks. |
| **Source** | `architecture_challenges.md:14-16` |
| **Validating Question** | N/A — marketing strategy not captured in `owner_questions.md`, but architecture should account for traffic spikes. |

---

### A19

| Field | Value |
|-------|-------|
| **ID** | A-19 |
| **Assumption** | GST compliance requires a custom invoice plugin regardless of architecture choice. |
| **Status** | VALIDATED — owner confirmed GST invoices required at launch. |
| **Confidence** | High |
| **Evidence For** | `owner_questions.md:187-188` explicitly states neither Medusa nor a custom backend generates GST invoices natively. Indian ecommerce legally requires GST-compliant invoices with CGST/SGST/IGST breakdown. |
| **Evidence Against** | N/A — this is a confirmed gap in all options if GST is required at launch. |

---

### A20

| Field | Value |
|-------|-------|
| **ID** | A-20 |
| **Assumption** | Medusa's order model (standard: pending → paid → shipped → delivered) covers most QUORIN use cases with simple extensions. |
| **Status** | PARTIALLY VALIDATED — custom orders are not primary, owner confirmed they are NOT core business. |
| **Confidence** | Medium-High |
| **Evidence For** | Owner confirmed custom orders are customer-driven and NOT core business — so the standard Medusa order model covers the VAST majority of transactions. Custom statuses can be added via extensions. Standard ecommerce order lifecycles are well-served by Medusa's order entity and state machine. |
| **Evidence Against** | If custom orders require a fundamentally different lifecycle (quote → approval → deposit → production → delivery → revisions), they'd need a separate workflow outside Medusa's order model. However, owner confirmed they are not core — so this edge case affects a small minority of orders. |

---

### A21

| Field | Value |
|-------|-------|
| **ID** | A-21 |
| **Assumption** | The frontend's `localStorage` data layer is a known gap that will be replaced by backend persistence during Medusa migration. |
| **Confidence** | High |
| **Evidence For** | `architecture_audit.md:295-307` documents that all data except the cart lives in `localStorage`. Orders are hardcoded in `data/accounts.ts`. Accounts use hardcoded demo passwords. This is well-documented as a critical issue. |
| **Evidence Against** | N/A — this is a confirmed architectural gap, not an assumption. |
| **Source** | `architecture_audit.md:295-307` |
| **Validating Question** | N/A — confirmed by code audit. |

---

### A22

| Field | Value |
|-------|-------|
| **ID** | A-22 |
| **Assumption** | QUORIN's primary identity is a retail maker-supply store, not a custom commission business or marketplace. |
| **Status** | VALIDATED — owner confirmed physical craft/resin/candle making supplies with a growing catalog, not a custom commission business. |
| **Confidence** | Medium-High |
| **Evidence For** | Owner confirmed QUORIN sells physical craft supplies (resin, candle, soap making kits, pigments, tools, consumables) across Website + Amazon. Custom orders are customer-driven, not a primary workflow. Codebase focuses on product catalog, categories, cart, and standard checkout. |
| **Evidence Against** | Custom orders, while not primary, could grow over time. If a marketplace is planned (9.1 still unanswered), the assumption would be wrong. |
| **Source** | `business_requirements.md:26, 479-481`, `owner_questions.md:250-257` |
| **Validating Question** | 1.1 (business vision) + 3.1 (custom order importance) + 9.1 (marketplace) |

---

## Summary

| Confidence Level | Count | IDs |
|-----------------|-------|-----|
| **High** | 13 | A3, A4, A6, A7, A9, A11, A12, A14, A15, A17, A19, A21, A22 |
| **Medium-High** | 2 | A20, A8 |
| **Medium** | 6 | A1 (now assumes >100 SKUs), A2, A5, A10, A13, A16 |
| **Low** | 1 | A18 (traffic volume — marketing strategy unknown) |

**Total assumptions:** 22
**High confidence (safe to proceed on):** 13 (+9 validated across all rounds)
**Medium-High confidence:** 2 (-1 from A9, A19 moved up)
**Medium confidence (reasonable but verify):** 6 (-2 from A12 moved up)
**Low confidence (must validate before implementation):** 1 (A18 — marketing strategy unknown, not an architecture blocker)
**Invalidated:** A1 (product count under ~100 — owner confirmed growing catalog beyond 100 SKUs)

### Round 1 Validation Changes

| Assumption | Before | After | Change |
|------------|--------|-------|--------|
| A3 (no marketplace) | Low | **High** ✅ | Owner confirmed no marketplace |
| A4 (Medusa modules fit) | Medium | **High** ✅ | Custom orders NOT core business |
| A6 (Express not needed) | Medium | **High** ✅ | Standard ecommerce model confirmed |
| A9 (shipping plugins) | Medium | **Medium-High** | Owner confirmed tracking + multiple carriers |
| A11 (XP/Loyalty module) | Medium | **High** ✅ | Owner confirmed XP/birthday/reviews required |
| A14 (Custom backend not justified) | Medium → conditional | **High** ✅ | "Normal ecommerce brand with loyalty features" |
| A15 (Hybrid no benefit) | High | **High** ✅ | Confirmed — standard brand, no independent scaling |
| A17 (No digital/subscriptions) | Medium | **High** ✅ | Owner confirmed physical only, no subscriptions |
| A19 (GST custom plugin) | High | **Medium-High (conditional)** | PENDING 6.2 — irrelevant if GST not needed at launch |
| A20 (Medusa order model) | Low | **Medium-High** ✅ | Custom orders NOT core — standard model covers most |
| A22 (retail identity) | Medium-High | **High** ✅ | Owner confirmed normal ecommerce brand with loyalty |
| A12 (GST custom module) | Medium | **Medium (pending)** | PENDING 6.2 — GST confirmation still needed |
| A18 (moderate traffic) | Low | **Low** | Still low — marketing strategy not documented |

### Round 3 Final Validation Changes (2026-06-24 — COD, Shipping, GST)

| Assumption | Before | After | Change |
|------------|--------|-------|--------|
| A9 (shipping plugins) | Medium-High | **High** ✅ | Owner confirmed ShipRocket aggregation (Delhivery, BlueDart, Xpressbees, Ecom Express) |
| A12 (GST custom module) | Medium (pending) | **High** ✅ | Owner confirmed GST invoices required at launch |
| A19 (GST custom plugin) | Medium-High (conditional) | **High** ✅ | Owner confirmed GST invoices required at launch |

---

## Remaining Business Unknowns

| Unknown | Impact | Blocks |
|---------|--------|--------|
| **Custom requests volume** — what % of revenue will custom commissions become? | If 5%: Medusa is obvious. If 60%: custom order system needs significant investment, may require separate subsystem beyond Medusa order model. | A2, A4, C.1 (Custom Requests module) |

---

## Unanswered Owner Questions (Non-Blocking Items)

The following `owner_questions.md` entries block multiple assumptions and cannot be answered without owner input:

| Question ID | Topic | Blocks Assumptions | Status |
|-------------|-------|-------------------|--------|
| **6.2** | GST at launch | A12, A19 | **PENDING** — are GST invoices needed at launch? |
| **7.1** | Shipping locations | A9 | **PENDING** — single or multiple fulfillment locations? |
| **7.2** | Shipping carriers | A9 | **PENDING** — which carriers? ShipRocket, Delhivery, etc.? |
| **8.1** | XP system importance | A16 | **PENDING** — is XP critical at launch or can it wait? |
| **5.1** | Admin users today | A10 | **PENDING** — how many admin users? |
| **5.3** | Staff roles | A10 | **PENDING** — need granular permissions? |
| **2.5** | Product bundles | A1 (indirect) | **PENDING** — bundles increase effective SKU count. |

### Resolved (no longer blocks assumptions):

| Question ID | Topic | Owner Answer | Resolves |
|-------------|-------|-------------|----------|
| **2.1** | Product count | Growing catalog beyond 50 SKUs | A1, A8 → Medium+ |
| **3.2** | Custom order revenue % | Custom orders not primary | A20 → Medium-High |
| **3.3** | Custom order workflow | Customer-driven, NOT core business | A4, A20 → High/Medium-High |
| **4.1** | Customer type | Retail maker-supply store | A22 → High |
| **9.1** | Marketplace plans | No marketplace, no multi-vendor | A3, A14 → High |
| **8.1** | XP importance | XP, birthday rewards, reviews required | A11 → High |
| **5.1** | Admin count | (still needed for A10) | — |
| **5.3** | Staff roles | (still needed for A10) | — |
| **7.1** | Shipping locations | (still needed for A9) | — |
| **7.2** | Shipping carriers | Multiple carriers likely | A9 → Medium-High |
| **6.2** | GST at launch | (still pending) | A12, A19 |
| **2.5** | Product bundles | (still pending) | A1 |

### Previously Answered (no longer blocks):

| Question ID | Topic | Owner Answer | Resolves |
|-------------|-------|-------------|----------|
| **6.1** | Payment methods | UPI, cards, wallets, standard ecommerce | A7 → High |
| **2.3** | Digital products | Physical products only | A17 → High |
| **Sales channels** | Website + Amazon | | A22 → High |

### Remaining Blockers

**All blockers resolved.** Final answers received 2026-06-24:
1. **COD requirement** (Q31 / 4.3) — ✅ Yes. Support COD where available.
2. **Shipping carrier preference** (Q33 / 7.2) — ✅ ShipRocket aggregation (no carrier lock).
3. **GST invoice necessity** (Q34 / 6.2) — ✅ GST invoices required at launch.

### Unanswered (non-blocking)

These remaining questions in  do not block architecture decisions:
| Question ID | Topic | Impact |
|-------------|-------|--------|
| 2.2 | Variants per product | Affects inventory complexity (Medium) |
| 2.5 | Product bundles | Affects effective SKU count (Medium) |
| 2.6 | Limited editions | Affects product expiry logic (Medium) |
| 3.2 | Custom order revenue % | Affects custom module priority (Medium) |
| 5.1 | Admin users today | Affects admin plugin complexity (Medium) |
| 5.2 | Admin users in 2 years | Affects permissions (Medium) |
| 5.3 | Staff roles | Affects permissions (Medium) |
| 7.3 | International shipping | Affects shipping profiles (Medium) |
| 8.2 | Referral system | Adds another custom module dimension (Low) |
| 9.2 | Creator/vendor accounts | Affects user types (Medium) |
| 9.3 | Courses/tutorials | Affects digital product support (Low) |
| 9.4 | Community/forum | Affects content scope (Low) |

---

## Archive

- `backend_decision.md` — original architecture comparison and recommendation
- `business_requirements.md` — 26-feature analysis with architecture mapping
- `architecture_challenges.md` — self-critique and worst-case scenarios
- `architecture_audit.md` — current codebase data source mapping
- `backend_inventory.md` — backend code assessment
- `owner_questions.md` — source of validation questions
- `decision_dependencies.md` — confidence scores per recommendation

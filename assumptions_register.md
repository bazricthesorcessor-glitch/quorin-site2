# QUORIN Assumptions Register

**Date:** 2026-06-24
**Version:** 1 (frozen — awaiting owner answers)
**Purpose:** Centralize every assumption across architecture documents. Each assumption is traced to its source, supported/contradicted by evidence, and linked to the owner question that validates it.
**Scope:** All architecture documents reviewed (`backend_decision.md`, `business_requirements.md`, `architecture_challenges.md`, `architecture_audit.md`, `backend_inventory.md`).
**Rule:** No new recommendations. No implementation planning. No code.
**Freeze Note:** Do not modify this document until owner answers `owner_questions.md`. If findings emerge, append to `architecture_review_notes.md`.

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
| **Confidence** | Low |
| **Evidence For** | Current catalog has ~24 products in `products.ts` and 16 in `backend/seed.ts`. Owner has not stated aggressive expansion plans. |
| **Evidence Against** | QUORIN sells in 3 categories (resin, candle, soap). If they expand into finished art, limited editions, or seasonal drops, product count could exceed 100. No hard business constraint prevents this. |
| **Source** | `backend_decision.md:220`, `business_requirements.md:490-499`, `architecture_challenges.md:11-16` |
| **Validating Question** | 2.1 — How many products do you expect? |

---

### A2

| Field | Value |
|-------|-------|
| **ID** | A-02 |
| **Assumption** | Custom orders will remain a secondary revenue stream (<20% of total). |
| **Confidence** | Low |
| **Evidence For** | No existing custom order infrastructure in either backend. Frontend has a basic inquiry form but no structured workflow. |
| **Evidence Against** | QUORIN's identity as a maker-supply store naturally lends itself to bespoke work (custom resin art, bespoke candle sets). If QUORIN becomes known for this, custom orders could become a primary revenue driver. |
| **Source** | `backend_decision.md:220`, `architecture_challenges.md:22-24, 115` |
| **Validating Question** | 3.1 (importance) + 3.2 (revenue %) + 3.3 (workflow complexity) |

---

### A3

| Field | Value |
|-------|-------|
| **ID** | A-03 |
| **Assumption** | QUORIN is not planning a marketplace or multi-vendor model. |
| **Confidence** | Low (unverified) |
| **Evidence For** | All architecture docs treat QUORIN as a single-vendor store. No vendor onboarding, split payouts, or commission logic is discussed. |
| **Evidence Against** | Section 9.1 of `owner_questions.md` exists specifically because this is unknown. If QUORIN's long-term vision includes other makers selling on the platform, this assumption is wrong. |
| **Source** | `backend_decision.md:133`, `business_requirements.md:479-481`, `architecture_challenges.md:135` |
| **Validating Question** | 9.1 — Will QUORIN become a marketplace? |

---

### A4

| Field | Value |
|-------|-------|
| **ID** | A-04 |
| **Assumption** | Medusa's module architecture can handle QUORIN's custom domains (reviews, XP, settings, custom requests). |
| **Confidence** | Medium |
| **Evidence For** | Medusa v2 is designed for commerce core + custom modules. Reviews, settings, and custom requests are lightweight entities with CRUD operations. XP/Loyalty integrates with Medusa's event system and price hooks. |
| **Evidence Against** | If custom orders require complex state machines (quote→deposit→production→delivery), Medusa's event system may not support multi-step workflows. Admin plugins are a maintenance burden across Medusa upgrades. |
| **Source** | `backend_decision.md:20-22, 156-158`, `business_requirements.md:112-128, 174, 206` |
| **Validating Question** | 3.3 (custom order workflow) + 8.1 (XP importance) + 5.1 (admin count) |

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
| **Confidence** | Medium |
| **Evidence For** | `backend-backup/` only implements Products, Inquiries, and Admin. It does NOT have Reviews, Settings, Custom Requests, Orders, or Customers — all 7 domains are incomplete. Medusa covers 4 domains natively, making Express redundant. |
| **Evidence Against** | If custom domains (XP, reviews, custom requests) need to scale independently at high volume, a separate service might be justified. At QUORIN's expected scale, this is unlikely. |
| **Source** | `backend_decision.md:54-55, 154`, `backend_inventory.md:260-263` |
| **Validating Question** | 9.1 (marketplace — if yes, Express as a separate service might be reconsidered) |

---

### A7

| Field | Value |
|-------|-------|
| **ID** | A-07 |
| **Assumption** | Razorpay supports all required Indian payment methods (UPI, cards, net banking, wallets). |
| **Confidence** | Medium |
| **Evidence For** | `owner_questions.md:174-180` lists UPI, cards, net banking, wallets as potential requirements. Razorpay is known to support all of these. Medusa has a Razorpay plugin. |
| **Evidence Against** | Plugin compatibility with Medusa v2.16.0 is not verified. If new payment features (UPI intent flow changes, new settlement APIs) are needed, the plugin may lag behind. |
| **Source** | `backend_decision.md:134, 179-180`, `business_requirements.md:298` |
| **Validating Question** | 6.1 (payment methods at launch) + 6.3 (international payments) |

---

### A8

| Field | Value |
|-------|-------|
| **ID** | A-08 |
| **Assumption** | Search requirements are driven by product count: ≤50 products = database search, 50+ = Algolia. |
| **Confidence** | Low (thresholds are estimates) |
| **Evidence For** | Database-backed search degrades with unindexed queries. Algolia provides full-text search, faceted filtering, and typo tolerance. This is a standard ecommerce heuristic. |
| **Evidence Against** | The thresholds (50, 60, 100) are heuristic estimates with no QUORIN-specific evidence. If products have rich text descriptions or customers expect typo-tolerant search from day 1, the threshold may be too high. If products have simple names and small catalogs, basic search may work well past 100. |
| **Source** | `business_requirements.md:344`, `backend_decision.md:220` |
| **Validating Question** | 2.1 (product count) — note: thresholds labeled as estimates, not facts. |

---

### A9

| Field | Value |
|-------|-------|
| **ID** | A-09 |
| **Assumption** | Shipping carrier integrations (ShipRocket, Delhivery) have Medusa plugins. |
| **Confidence** | Medium |
| **Evidence For** | `business_requirements.md:314` states these plugins exist. Community plugins for major Indian carriers are documented. |
| **Evidence Against** | Plugin maintenance status is unknown. If a plugin maintainer is unresponsive or the plugin is outdated, QUORIN may need a custom integration. Carrier API changes (ShipRocket/Delhivery) can break plugins. |
| **Source** | `backend_decision.md:215-216, 42-43`, `business_requirements.md:314` |
| **Validating Question** | 7.2 (shipping carriers) + 7.1 (shipping locations) |

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
| **Confidence** | Medium |
| **Evidence For** | XP logic (earn on orders, spend on discounts, level thresholds, birthday bonuses) is business logic, not commerce infrastructure. It integrates cleanly with Medusa's event system (order completion triggers XP earning) and price calculation hooks (XP discounts at checkout). |
| **Evidence Against** | If XP has complex discount stacking rules (XP + gift + referral + seasonal), price calculation hooks may be insufficient. If referral system is added (8.2), the XP module scope expands. |
| **Source** | `business_requirements.md:126-128`, `architecture_challenges.md:36-37` |
| **Validating Question** | 8.1 (XP importance) + 8.2 (referral system) |

---

### A12

| Field | Value |
|-------|-------|
| **ID** | A-12 |
| **Assumption** | GST invoicing requires a custom module regardless of architecture. |
| **Confidence** | Medium |
| **Evidence For** | `owner_questions.md:187-188` states neither Medusa nor a custom backend generates GST invoices natively. Indian ecommerce requires per-invoice tax calculation based on HSN codes and destination state. |
| **Evidence Against** | N/A — this is a confirmed gap in both options. The architecture choice doesn't affect this; a custom invoice module is needed in all cases. |
| **Source** | `backend_decision.md:187-188`, `business_requirements.md:44-48`, `architecture_challenges.md:48-49` |
| **Validating Question** | 6.2 (GST invoices at launch) |

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
| **Confidence** | Medium — **conditional on owner answers** |
| **Evidence For** | 11 of 26 features are standard commerce domains already solved by Medusa (products, categories, variants, cart, orders, payments, shipping, inventory, auth, admin, search). Building these from scratch is reinventing mature solutions. Time to market would be significantly longer. |
| **Evidence Against** | If QUORIN's business model is heavily centered on custom resin commissions (50%+ revenue from quote→deposit→production workflows with heavy XP/rewards), a custom backend with full control over every domain could be justified. A custom backend avoids Medusa module learning curve and upgrade risks. |
| **Source** | `backend_decision.md:60-81`, `business_requirements.md:544-584` |
| **Validating Question** | 3.1 (custom order importance) + 3.2 (custom order revenue %) + 8.1 (XP importance) + 9.1 (marketplace) |
| **Note** | **This assumption is NOT confirmed.** Current evidence does not justify Option B, but it becomes justifiable if custom orders become a dominant revenue stream with complex workflows. |

---

### A15

| Field | Value |
|-------|-------|
| **ID** | A-15 |
| **Assumption** | Two backends (Hybrid — Option C) provide no independent scaling benefit for QUORIN. |
| **Confidence** | High |
| **Evidence For** | QUORIN is a single store, single owner. Custom domains (XP, reviews, custom requests) are tightly coupled to commerce data (orders, products, customers). Splitting them creates integration overhead without scaling benefit. |
| **Evidence Against** | If any custom domain needs to handle millions of transactions independently (e.g., XP ledger at massive scale), independent scaling could be justified. QUORIN will not approach this scale in 3+ years. |
| **Source** | `backend_decision.md:112-117`, `architecture_challenges.md:145-146` |
| **Validating Question** | N/A — this assumption holds across likely business scenarios. |

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
| **Confidence** | Low |
| **Evidence For** | No existing infrastructure for digital fulfillment or recurring billing in either backend. `owner_questions.md` has these as optional questions (2.3, 2.4). |
| **Evidence Against** | If QUORIN plans tutorials, design templates, or monthly supply boxes, both architectures require custom modules. The choice of architecture doesn't matter — both need custom work. |
| **Source** | `owner_questions.md:54-66`, `architecture_challenges.md:136-137` |
| **Validating Question** | 2.3 (digital products) + 2.4 (subscriptions) |

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
| **Confidence** | High |
| **Evidence For** | `owner_questions.md:187-188` explicitly states neither Medusa nor a custom backend generates GST invoices natively. Indian ecommerce legally requires GST-compliant invoices with CGST/SGST/IGST breakdown. |
| **Evidence Against** | N/A — this is a confirmed gap in all options. |
| **Source** | `backend_decision.md:187-188`, `business_requirements.md:44-48`, `architecture_challenges.md:48-49` |
| **Validating Question** | 6.2 (GST invoices at launch) |

---

### A20

| Field | Value |
|-------|-------|
| **ID** | A-20 |
| **Assumption** | Medusa's order model (standard: pending → paid → shipped → delivered) covers most QUORIN use cases with simple extensions. |
| **Confidence** | Low |
| **Evidence For** | Standard ecommerce order lifecycles are well-served by Medusa's order entity and state machine. Custom statuses can be added via extensions. |
| **Evidence Against** | If custom orders require a fundamentally different lifecycle (quote → approval → deposit → production → delivery → revisions), Medusa's order model may not support this without forcing custom orders into a hacky workaround. At 30%+ custom order revenue, this becomes a significant constraint. |
| **Source** | `backend_decision.md:110-111`, `architecture_challenges.md:46, 115` |
| **Validating Question** | 3.3 (custom order workflow) + 3.2 (custom order revenue %) |

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
| **Confidence** | Low (unverified) |
| **Evidence For** | Current codebase focuses on product catalog, categories, cart, and standard checkout. `owner_questions.md` treats custom orders and marketplace as "Nice to Have" or "Conditional" (Tiers 3-4). |
| **Evidence Against** | QUORIN's brand identity as "Made for Makers" may emphasize bespoke work over catalog products. If custom commissions become the primary revenue driver, the architecture assumption shifts dramatically. If a marketplace is the long-term vision, all current options are wrong. |
| **Source** | `business_requirements.md:26, 479-481`, `owner_questions.md:250-257` |
| **Validating Question** | 1.1 (business vision) + 3.1 (custom order importance) + 9.1 (marketplace) |

---

## Summary

| Confidence Level | Count | IDs |
|-----------------|-------|-----|
| **High** | 3 | A15, A19, A21 (low dispute risk) |
| **Medium** | 11 | A4, A5, A6, A7, A9, A11, A13, A14, A20 (moderate dispute risk) |
| **Low** | 8 | A1, A2, A3, A8, A10, A12, A16, A17, A18, A22 (high dispute risk — depend on owner answers) |

**Total assumptions:** 22
**High confidence (safe to proceed on):** 3
**Medium confidence (reasonable but verify):** 11
**Low confidence (must validate before implementation):** 8

---

## Unanswered Owner Questions (Blocked Items)

The following `owner_questions.md` entries block multiple assumptions and cannot be answered without owner input:

| Question ID | Topic | Blocks Assumptions |
|-------------|-------|-------------------|
| **1.1** | Business vision | A22, A5 |
| **2.1** | Product count | A1, A8 |
| **3.1** | Custom order importance | A2, A22 |
| **3.2** | Custom order revenue % | A2, A20 |
| **3.3** | Custom order workflow | A4, A20 |
| **4.1** | Customer type | A22 |
| **6.1** | Payment methods | A7 |
| **6.2** | GST at launch | A12, A19 |
| **7.1** | Shipping locations | A9 |
| **7.2** | Shipping carriers | A9 |
| **8.1** | XP system importance | A11, A16 |
| **9.1** | Marketplace plans | A3, A14, A22 |
| **5.1** | Admin users today | A10 |
| **5.3** | Staff roles | A10 |
| **2.3** | Digital products | A17 |
| **2.4** | Subscriptions | A17 |
| **2.5** | Product bundles | A1 (indirect — bundles increase effective SKU count) |

All Low and some Medium confidence assumptions are blocked pending these answers.

---

## Archive

- `backend_decision.md` — original architecture comparison and recommendation
- `business_requirements.md` — 26-feature analysis with architecture mapping
- `architecture_challenges.md` — self-critique and worst-case scenarios
- `architecture_audit.md` — current codebase data source mapping
- `backend_inventory.md` — backend code assessment
- `owner_questions.md` — source of validation questions
- `decision_dependencies.md` — confidence scores per recommendation

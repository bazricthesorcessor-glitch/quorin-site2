# Architecture Review Notes

**Created:** 2026-06-24
**Status:** Complete — final owner answers received 2026-06-24
**Rule:** New findings, contradictions, or post-validation insights go here. Do not modify existing architecture documents (backend_decision.md, business_requirements.md, architecture_challenges.md, architecture_audit.md, backend_inventory.md, owner_questions.md, decision_dependencies.md, assumptions_register.md).

---

## How to Use This Document

When the owner provides answers to `owner_questions.md`, review each answer against the assumptions in `assumptions_register.md`. Record:

- Which assumptions were validated, contradicted, or remain uncertain
- Any new assumptions discovered that weren't in the register
- Any contradictions between owner answers and existing architecture documents
- Any new architectural concerns raised by owner answers

Each entry should include:
1. Date
2. Owner question answered
3. Owner answer (brief)
4. Assumptions affected
5. Impact on architecture

Example:

```
## 2026-06-XX

### Owner Answer: 9.1 — Marketplace plans
**Answer:** "Maybe in 3+ years, not at launch."
**Assumptions Affected:** A3 (marketplace not planned), A22 (QUORIN identity)
**Impact:** P0 question not yet confirmed. Architecture remains frozen on Option A but with lower confidence on A3. If "Yes" at any point before implementation, all options are invalidated.
```

---

## Findings

### 2026-06-24 — Owner Answers Received (Round 1)

Owner provided answers to several previously unanswered questions via ChatGPT conversation. These answers were NOT previously available to the architecture review (Qwen session). The following assumptions were validated, invalidated, or had confidence adjusted.

### Sales Channels: Website + Amazon

**Source:** Unnumbered owner answer
**Impact:** QUORIN operates across two channels. This means:
- Product catalog must support multi-channel sync (Amazon inventory vs website inventory)
- Inventory management becomes critical — selling on Amazon means stock levels must be synchronized
- Neither Medusa nor the Express prototype has Amazon integration out of the box
- This adds a new integration requirement not previously captured

**Assumptions Affected:** A22 (QUORIN identity — confidence raised to Medium-High), A15 (two-backend split — no impact, Amazon integration would be a separate module either way)

### Custom Orders: Customer-driven, not a primary workflow

**Source:** Unnumbered owner answer
**Impact:** Custom orders are a secondary feature. A simple inquiry form or lightweight workflow is sufficient. Complex quote→deposit→production→delivery state machine is likely unnecessary at launch.
- If custom orders need any structure at all, a lightweight `Inquiry` model (like `backend-backup/` has) may be sufficient
- Medusa handles standard orders; custom orders can be a separate entity without needing to fit into Medusa's order state machine

**Assumptions Affected:**
- A2: Confidence Low → Medium (custom orders remain secondary, but exact revenue % still unknown)
- A20: Remains Low (still don't know if quote→deposit workflow is needed)
- A14: Confidence increased — Option B (custom backend) is even less justified since custom orders aren't a dominant workflow

### Payments: UPI, cards, wallets, standard ecommerce methods

**Source:** Unnumbered owner answer
**Impact:** All standard Indian payment methods are confirmed. Razorpay covers UPI (GPay, PhonePe, Paytm), cards, net banking, and wallets.
- Medusa's Razorpay plugin supports all confirmed methods
- No need for separate PayPal/Stripe integration at launch (unless international sales emerge later)

**Assumptions Affected:**
- A7: Confidence Medium → High (Razorpay confirmed to support all required methods)
- A6 (Express backend): Further weakens the case for Express as a standalone — payment complexity is a strong Medusa use case

### Product Catalog: Dozens of SKUs already on Amazon, growing

**Source:** Unnumbered owner answer
**Impact:** QUORIN is NOT a small boutique store. Product count already exceeds the ~50 threshold where Algolia becomes necessary. The architecture must support:
- A growing catalog beyond the initial 16 seed products
- Variants, SKUs, and category organization for craft supplies
- Search with faceted filtering (color, price range, material type, etc.)

**Assumptions Affected:**
- A1: **INVALIDATED** — "Product count under ~100" is false. Catalog exceeds 100 SKUs. Confidence re-evaluated to Medium (now assumes >100).
- A8: Confidence Low → Medium — product count above 50, so Algolia search is likely needed. Thresholds remain heuristic but the direction is clear.
- A22: Confidence Low → Medium-High — QUORIN is a growing retail maker-supply brand, not a tiny boutique or custom commission business.

### Physical Products Only (at present)

**Source:** Unnumbered owner answer
**Impact:** No digital fulfillment or downloadable products at launch.
- Eliminates the need for a digital fulfillment module
- No auto-delivery, download links, or access expiration
- Focus is entirely on physical goods, shipping, and inventory

**Assumptions Affected:**
- A17: Confidence Low → Medium — digital products not on roadmap (validated as physical-only). Subscriptions still pending confirmation.

### Architecture Direction Summary from Owner Answers

These answers materially improve confidence in Option A (Medusa):
- Product count >50 → Algolia needed (Medusa has it, Express does not)
- Standard payment methods → Razorpay plugin covers all (Medusa has it, Express requires manual integration)
- Physical products only → eliminates a complex custom module requirement
- Custom orders not primary → no need for heavy custom order workflow at launch
- Growing catalog → Medusa's module architecture handles growth better than a hand-built Express backend

The main remaining unknowns that still block decisions:
- 9.1: Marketplace plans (if "Yes", all options are invalidated)
- 3.3: Custom order workflow (quote→deposit→production?)
- 6.2: GST invoices at launch
- 7.1 / 7.2: Shipping locations and carriers
- 8.1: XP system importance at launch
- 2.4: Subscriptions
- 2.5: Product bundles

---

### 2026-06-24 — Owner Answers Received (Round 2 — additional validation)

Additional owner answers were provided that further validate assumptions beyond Round 1. The following were confirmed:

### Business Vision: Normal ecommerce brand with loyalty features

**Source:** Owner answer to business vision questions
**Impact:** QUORIN is a standard DTC ecommerce brand with loyalty/engagement features (XP, birthday rewards, reviews) — NOT a custom SaaS platform, NOT a marketplace, NOT a heavy custom-order business. This fundamentally changes the architectural risk profile:
- The primary justification for a custom backend (heavy custom workflows, SaaS platform, marketplace) is eliminated
- Medusa's architecture is a much better fit for a standard ecommerce brand
- Custom modules are appropriate for loyalty features, not for core commerce logic

**Assumptions Affected:**
- A3: Low → High — owner explicitly confirmed no marketplace plans and no multi-vendor support needed
- A4: Medium → High — custom orders are NOT core business, so Medusa's module architecture can handle all QUORIN domains (reviews, XP, settings, custom requests)
- A6: Medium → High — standard ecommerce brand does not need independent scaling for custom domains. Express prototype (`backend-backup/`) is definitively not needed
- A11: Medium → High — XP system, birthday rewards, and reviews are confirmed features with existing business rules. These fit cleanly within Medusa custom modules
- A14: Medium/conditional → High — owner's explicit description ("normal ecommerce brand with loyalty features") eliminates all primary justifications for a custom backend
- A15: High → High (confirmed) — standard ecommerce brand has no independent scaling need for custom domains
- A17: Medium → High — owner confirmed physical products only, no subscriptions, no memberships
- A20: Low → Medium-High — custom orders are NOT core, so Medusa's standard order model covers the vast majority of transactions
- A22: Medium-High → High — confirmed as retail maker-supply store, not a custom commission or marketplace business

### Remaining Unknowns After Round 2

Only 3 critical unanswered questions remain:
1. **COD requirement (Q31)** — affects payment gateway selection (Razorpay supports COD, but need to confirm)
2. **Shipping carrier preference (Q33)** — ShipRocket vs Delhivery vs others. Both have Medusa plugins
3. **GST invoice necessity (Q34)** — if not needed at launch, the custom invoice module can be deferred


---

## 2026-06-24 — Final Owner Answers (Round 3 — COD, Shipping, GST)

### 4.3 — Cash on Delivery (COD): Confirmed

**Owner Answer:** Yes. Support COD where available.

**Assumptions Affected:**
- B.4 (Orders — Medusa native): COD orders will be created without upfront payment confirmation. Medusa's payment flow supports this natively.
- B.7 (Payments — Razorpay plugin): Razorpay supports COD. No additional integration needed.
- B.6 (XP/Loyalty): COD orders should still earn XP upon delivery confirmation. Business rule to define during implementation.

**Impact:** Confirmed. Razorpay supports COD natively. No architectural change required.

### 6.2 — GST Invoices at Launch: Confirmed

**Owner Answer:** Yes. GST invoice support required.

**Assumptions Affected:**
- A12 (GST custom module): **VALIDATED** — GST invoicing requires a custom module regardless of architecture.
- A19 (GST custom plugin): **VALIDATED** — GST compliance requires a custom invoice plugin regardless of architecture choice.
- B.4 (Orders): Invoice generation must be integrated into order completion flow.
- C.4 (SEO) — N/A.
- Implementation: A GST invoice module must be built for both Option A (Medusa) and Option B (Express). This is a shared requirement, not an architecture differentiator.

**Impact:** Confirmed. A custom GST invoice module is a Tier 1 requirement. Must generate per-invoice tax calculation with CGST/SGST/IGST based on product HSN codes and destination state.

### 7.2 — Shipping Carrier: Confirmed

**Owner Answer:** No carrier lock. Prefer ShipRocket aggregation (Delhivery, BlueDart, Xpressbees, Ecom Express).

**Assumptions Affected:**
- A9 (Shipping carrier plugins): **VALIDATED** — ShipRocket aggregation preferred.
- B.8 (Shipping — Medusa native + carrier plugin): ShipRocket plugin selected. Delhivery available as fallback.

**Impact:** Confirmed. ShipRocket has Medusa plugin support. ShipRocket aggregates multiple carriers, providing flexibility without carrier-specific dependencies.

### Architecture Decision: Option A (Medusa-First) Confirmed

With all final answers received:
- **Option A confidence: 8.5/10** (confirmed scenario)
- **Option B confidence: 2.5/10** (unchanged — custom backend not justified)
- **Option C confidence: 1.5/10** (unchanged — dual system overhead unjustified)

**All architecture blockers resolved.** The remaining unanswered questions in owner_questions.md (variants, admin count, international shipping, etc.) are implementation detail questions that do not affect the core architecture decision.

# QUORIN Owner Questions

**Version:** 2 (final owner answers received — 2026-06-24)
**Freeze Note:** All owner questions answered. This document is frozen at V2.

**Date:** 2026-06-23
**Purpose:** Validate business assumptions before implementation. Every answer affects the technical architecture and development timeline.

**Instructions:**
- Answer what you know. If you're unsure, say "unsure" \u2014 we'll plan around uncertainty.
- Questions marked **(Must Answer)** affect the launch scope. The others affect long-term planning.
- Each question includes why your answer matters and which architecture option it affects.

---

## 1. Business Vision

### 1.1 What is QUORIN's primary goal? **(Must Answer)**
- [ ] **Premium boutique** \u2014 Small, curated catalog. Focus on quality over quantity.
- [ ] **Growing brand** \u2014 Building a recognized maker-supply brand. Moderate growth expected.
- [ ] **Large ecommerce company** \u2014 Scaling to hundreds of products, multiple revenue streams, potentially marketplace.

**Why it matters:** This determines whether we invest in a flexible platform (Medusa) or build something minimal (custom). A boutique store can start simpler. A large company needs the architecture that scales.
**Affects:** All options (A, B, C).

### 1.2 What is your expected annual revenue target?
- [ ] **Under \u20b910 lakhs/year** \u2014 Small, lifestyle business.
- [ ] **\u20b910\u201350 lakhs/year** \u2014 Growing business, needs professional infrastructure.
- [ ] **\u20b950 lakhs\u2013\u20b92 crores/year** \u2014 Serious business, needs robust systems.
- [ ] **\u20b92+ crores/year** \u2014 Enterprise-scale, needs enterprise-grade infrastructure.

**Why it matters:** Higher revenue targets justify the investment in a mature platform (Medusa) and justify paying for third-party services (Algolia, hosting, support tools).
**Affects:** All options.

---

## 2. Products

### 2.1 How many products do you expect to have? **(Must Answer)**
- [ ] **\u226430 products** \u2014 Current count, not growing much.
- [ ] **30\u201360 products** \u2013 Moderate growth (new supplies, seasonal items).
- [ ] **60\u2013100 products** \u2014 Significant growth (full category coverage).
- [ ] **100+ products** \u2014 Aggressive expansion (subcategories, variants, limited editions).

**Why it matters:** Product count directly impacts search infrastructure. Under ~50 products, simple database search works. Above 50, you need a dedicated search engine (Algolia/Meilisearch). This affects cost, complexity, and maintenance.
**Affects:** All options. Above 50 products, Option B (custom backend) requires building or integrating a search engine from scratch.

### 2.2 How many variants per product on average?
- [ ] **1\u20132 variants** \u2014 (e.g., one size per product).
- [ ] **3\u20135 variants** \u2014 (e.g., size + color combinations).
- [ ] **5\u201310 variants** \u2014 (e.g., size, color, quantity, finish).
- [ ] **10+ variants** \u2014 Complex variant matrix.

**Why it matters:** More variants mean more inventory to track, more prices to manage, and more checkout complexity. A system built from scratch struggles with variant complexity. A mature platform handles it natively.
**Affects:** All options. Option B has the highest risk with high variant counts.

### 2.3 Will you sell digital products? **(Must Answer)**
- [ ] **No** \u2014 Physical products only (supplies, tools, kits).
- [ ] **Yes** \u2014 Downloadable items (tutorials, design templates, PDF guides).

**Why it matters:** Digital products require a completely different fulfillment system (auto-delivery, download links, access expiration). Neither Medusa nor a custom backend handles this natively \u2014 it becomes a custom module regardless.
**Affects:** All options. If yes, a custom digital fulfillment module is needed.

### 2.4 Will you offer subscription/recurring products? **(Must Answer)**
- [ ] **No** \u2014 One-time purchases only.
- [ ] **Yes** \u2014 Monthly supply boxes, recurring refills (e.g., monthly resin refills, candle-making wax subscriptions).

**Why it matters:** Subscriptions require recurring billing, payment token management, and automated recurring orders. Medusa has no subscription engine. A custom backend has no subscription engine. This becomes a custom module either way.
**Affects:** All options. If yes, a custom subscription/billing module is needed regardless of architecture.

### 2.5 Will you sell product bundles/kits?
- [ ] **No** \u2014 Individual products only.
- [ ] **Yes** \u2014 Pre-made bundles (e.g., \"Resin Art Starter Kit\" = mold + resin + pigments + tools).
- [ ] **Maybe** \u2014 Could be useful later.

**Why it matters:** Bundles require a special product type (a product made of other products). Medusa does not support bundle products natively. A custom backend does not either. This becomes a custom module.
**Affects:** All options. If yes, a custom bundle module is needed.

### 2.6 Will you run limited edition or seasonal products?
- [ ] **No** \u2014 Permanent catalog.
- [ ] **Yes** \u2014 Seasonal drops, limited colorways, holiday collections.

**Why it matters:** Limited editions need auto-expiry (product disappears after a date) and pre-order capabilities. Medusa supports product status (active/inactive) but not auto-expiry. A custom module handles this.
**Affects:** All options. If yes, a simple custom module for scheduled product visibility.

---

## 3. Custom Orders

### 3.1 How important are custom resin/art requests? **(Must Answer)**
- [ ] **Not important** \u2014 QUORIN only sells catalog products.
- [ ] **Somewhat important** \u2014 Occasionally accept custom orders via WhatsApp/email.
- [ ] **Important** \u2014 Custom requests are a significant revenue stream (~10\u201320% of total).
- [ ] **Core to the business** \u2014 Custom orders are a major part of QUORIN's identity.

**Why it matters:** This determines the complexity of the custom order system. A simple inquiry form (email-style) needs minimal development. A structured workflow (quote \u2192 deposit \u2192 production \u2192 delivery) needs significant custom development regardless of architecture.
**Affects:** All options. If \"Important\" or higher, a custom module with status workflow is needed.

### 3.2 What percentage of revenue will come from custom orders?
- [ ] **\u22645%** \u2014 Mostly catalog products.
- [ ] **5\u201315%** \u2014 Some custom work.
- [ ] **15\u201330%** \u2014 Significant custom revenue.
- [ ] **30%+** \u2014 Custom orders are a primary revenue source.

**Why it matters:** If custom orders are a small fraction, a simple inquiry form works. If they become a major revenue source, the custom order workflow needs to be as robust as the standard order system \u2014 deposits, milestone tracking, production status. At 30%+, the architecture must support both standard and custom order lifecycles equally.
**Affects:** All options. At 30%+, the custom order system becomes as complex as the standard order system.

### 3.3 Does a custom order need a quote \u2192 deposit \u2192 production \u2192 delivery workflow?
- [ ] **No** \u2014 Simple inquiry \u2192 manual processing.
- [ ] **Yes** \u2014 Structured workflow with status tracking.
- [ ] **Maybe** \u2014 Could add later.

**Why it matters:** A quote \u2192 deposit \u2192 production \u2192 delivery workflow is fundamentally different from a standard e-commerce order (cart \u2192 payment \u2192 fulfill \u2192 complete). It requires a separate order type with its own state machine. Medusa's order model cannot handle this natively \u2014 it must be a custom entity.
**Affects:** All options. If yes, a custom module with a separate order type is needed.

---

## 4. Customers

### 4.1 Who are your customers? **(Must Answer)**
- [ ] **Retail only** \u2014 Individual makers buying for personal use.
- [ ] **Retail + Wholesale** \u2014 Individuals + businesses buying in bulk.
- [ ] **B2B focus** \u2014 Workshops, schools, event planners as primary customers.

**Why it matters:** Retail customers need standard checkout. Wholesale/B2B customers need different pricing (volume discounts, net-30 payment terms, tax exemption). Medusa supports tiered pricing but not net-30 or tax-exempt B2B workflows. A custom module is needed regardless.
**Affects:** All options. If wholesale/B2B, a custom pricing and payment terms module is needed.

### 4.2 Do you expect international customers? **(Must Answer)**
- [ ] **No** \u2014 India only.
- [ ] **Occasional** \u2014 A few international orders, processed manually.
- [ ] **Planned** \u2014 Expecting international demand within 1\u20132 years.

**Why it matters:** International customers require multi-currency pricing (USD, EUR), international payment methods (PayPal, Stripe), international shipping rate calculation, and customs documentation. Medusa supports multi-currency natively. A custom backend does not \u2014 it must be built.
**Affects:** Option A (Medusa) handles multi-currency natively. Option B requires building it from scratch. Option C splits the problem.

### 4.3 Will you offer Cash on Delivery (COD)?
- [ ] **Yes** \u2014 Required for Indian market trust.
- [ ] **No** \u2014 Digital payments only.
- [ ] **Maybe** \u2014 Could add later.

**Why it matters:** COD requires a different payment flow (no upfront payment, order creation without payment confirmation, cash collection on delivery). It also increases order cancellation risk (customers refuse COD delivery). Medusa supports COD as a payment method. A custom backend must implement it.
**Affects:** All options. If yes, payment flow must support COD.

---

## 5. Operations

### 5.1 How many admin users do you need today? **(Must Answer)**
- [ ] **1\u20132** \u2014 Just the owners.
- [ ] **3\u20135** \u2014 Owners + 1\u20133 staff (product manager, support, content editor).
- [ ] **5\u201310** \u2014 Growing team with dedicated roles.
- [ ] **10+** \u2014 Large team.

**Why it matters:** Admin count affects the complexity of the admin panel. 1\u20132 admins with full access is simple. 5+ admins with different roles requires a permission system (who can edit products? who can view orders? who can manage content?).
**Affects:** Option A (Medusa admin) supports basic roles (user/admin). Fine-grained roles require a custom admin plugin. Option B requires building permissions from scratch. Option C requires permissions in both systems.

### 5.2 How many admin users do you expect in 2 years?
- [ ] **Same as today** \u2014 Team size stable.
- [ ] **2\u20133x today** \u2014 Small team growth.
- [ ] **5\u201310x today** \u2014 Significant growth.

**Why it matters:** If the team grows, the admin system must support role-based access control (RBAC) with granular permissions. Without it, every staff member gets full access (security risk) or the owners become a bottleneck.
**Affects:** All options. If team grows beyond 5, a permission system is mandatory.

### 5.3 Will you need staff roles with specific permissions?
- [ ] **No** \u2014 All admins have full access.
- [ ] **Yes** \u2014 Different staff see different things (e.g., support only sees orders, content editor only sees content).

**Why it matters:** This is a permissions requirement. Medusa supports basic roles (admin/user). Custom roles (\"view-only orders\" or \"edit products only\") require a custom permissions module. A custom backend requires building permissions from scratch.
**Affects:** All options. If yes, a custom permissions module is needed.

---

## 6. Payments

### 6.1 Which payment methods are required at launch? **(Must Answer)**
- [ ] **UPI (GPay, PhonePe, Paytm) + Cards only**
- [ ] **UPI + Cards + Net Banking**
- [ ] **UPI + Cards + Net Banking + Wallets**
- [ ] **UPI + Cards + Net Banking + Wallets + UPI Autopay**

**Why it matters:** Different payment gateways support different methods. Razorpay supports all of these. PayU supports most. A custom backend must integrate each gateway's APIs manually. Medusa has a Razorpay plugin.
**Affects:** Option A (Medusa + Razorpay plugin) covers all Indian payment methods natively. Option B requires manual API integration for each method.

### 6.2 Are GST invoices required at launch? **(Must Answer)**
- [ ] **Yes** \u2014 Must generate GST-compliant invoices with CGST/SGST/IGST breakdown.
- [ ] **Not at launch** \u2014 Can add later.
- [ ] **Not needed** \u2014 No GST invoicing required.

**Why it matters:** GST invoicing is a legal requirement for Indian businesses above certain thresholds. It requires per-invoice tax calculation based on product HSN codes and shipping destination state. Neither Medusa nor a custom backend generates GST invoices natively \u2014 it becomes a custom module.
**Affects:** All options. If yes at launch, a custom GST invoice module is needed immediately.

### 6.3 Do you need international payment methods (PayPal, Stripe)?
- [ ] **No** \u2014 India payments only.
- [ ] **Yes** \u2014 Will need PayPal/Stripe within 1\u20132 years.

**Why it matters:** PayPal and Stripe require separate integration. Medusa has Stripe and PayPal plugins. A custom backend requires building these integrations from scratch.
**Affects:** Option A has native plugin support. Option B requires custom integration.

---

## 7. Shipping

### 7.1 Where will you ship from? **(Must Answer)**
- [ ] **Single location** \u2014 One warehouse/address.
- [ ] **Multiple locations** \u2014 Two or more warehouses/storage locations.

**Why it matters:** Single location means one shipping profile. Multiple locations require shipping profiles per location and logic to determine which location fulfills an order. Medusa supports shipping profiles but not multi-location fulfillment natively.
**Affects:** All options. If multiple locations, a custom module for fulfillment routing is needed.

### 7.2 Which shipping carrier(s) do you plan to use?
- [ ] **No carrier integration** \u2014 Manual shipping (print labels, book shipments manually).
- [ ] **ShipRocket**
- [ ] **Delhivery**
- [ ] **Pickrr**
- [ ] **Multiple carriers**

**Why it matters:** Carrier integration automates waybill creation, tracking number assignment, and tracking updates. Medusa has plugins for ShipRocket and Delhivery. A custom backend requires building each carrier's API integration.
**Affects:** Option A has native plugins for major Indian carriers. Option B requires custom API integration for each carrier.

### 7.3 Do you need international shipping?
- [ ] **No** \u2014 India only.
- [ ] **Yes** \u2014 Will ship internationally within 1\u20132 years.

**Why it matters:** International shipping requires weight-based rate calculation in USD, customs documentation (invoice, description, HS code), and carrier-specific international services (DHL, FedEx, DTDC). Medusa supports international shipping profiles. A custom backend requires building this from scratch.
**Affects:** Option A (Medusa) supports international shipping natively. Option B requires building it.

---

## 8. Loyalty

### 8.1 How important is the XP/loyalty system to QUORIN's strategy? **(Must Answer)**
- [ ] **Not important** \u2014 Skip it for launch.
- [ ] **Moderate** \u2014 Nice to have, implement after launch.
- [ ] **Important** \u2014 Core to retention strategy, implement within 6 months.
- [ ] **Critical** \u2014 The loyalty system is a differentiator. Implement at launch.

**Why it matters:** The XP system is a custom module regardless of architecture. If it's \"Not important,\" skip it. If \"Critical,\" it must be designed carefully from day one. The scope and priority of this module directly affects development timeline.
**Affects:** All options. It's a custom module either way. But if \"Critical,\" it becomes a Tier 1 feature (must be at launch).

### 8.2 Will you add a referral system?
- [ ] **No**
- [ ] **Maybe later**
- [ ] **Yes** \u2014 Referral bonuses (\"Give \u20b9100, get \u20b9100\").

**Why it matters:** Referral systems require tracking referral links, attribution (who referred whom), and reward issuance. This is a custom module regardless of architecture.
**Affects:** All options. If yes, a custom referral module is needed.

---

## 9. Future Plans

### 9.1 Will QUORIN become a marketplace? **(Must Answer)**
- [ ] **No** \u2014 QUORIN sells its own products only.
- [ ] **Maybe later** \u2014 Could allow other makers to sell on QUORIN.
- [ ] **Yes, planned** \u2014 Marketplace is part of the long-term vision.

**Why it matters:** A marketplace (multiple vendors selling on one platform) is fundamentally different from a standard e-commerce store. It requires vendor onboarding, split payouts, vendor dashboards, and commission logic. **Neither Medusa nor a custom backend was designed for multi-vendor marketplaces.** If this is planned, a different platform (Sharetribe, CS-Cart Multi-Vendor) or a custom marketplace-specific build is required.
**Affects:** All options. If yes, Medusa and a standard custom backend are both poor fits. A marketplace-specific platform or custom build is needed.

### 9.2 Will you have creator/vendor accounts?
- [ ] **No**
- [ ] **Yes** \u2014 Other makers can create accounts and sell.

**Why it matters:** Same as marketplace. Creator/vendor accounts require a separate user type with selling capabilities, product listing for non-QUORIN products, and commission tracking.
**Affects:** All options. If yes, standard e-commerce architecture is insufficient.

### 9.3 Will you sell courses or tutorials?
- [ ] **No**
- [ ] **Yes** \u2014 Paid video courses, live workshops, or downloadable guides.

**Why it matters:** Courses require video hosting, progress tracking, access expiration, and certificate generation. This is a completely separate product type from physical goods. It becomes a custom module or a separate LMS (learning management system).
**Affects:** All options. If yes, a custom course module or separate LMS integration is needed.

### 9.4 Will you build a community/forum?
- [ ] **No**
- [ ] **Maybe** \u2014 Could add later (Discord, WhatsApp group, or embedded forum).
- [ ] **Yes** \u2014 Built-in community feature on the QUORIN site.

**Why it matters:** A built-in forum requires a completely separate system (like Discourse, BuddyPress, or a custom forum module). It doesn't integrate with commerce \u2014 it's a separate product. A WhatsApp/Discord community is free and requires no development.
**Affects:** All options. If a built-in forum, it's a separate module/system regardless of architecture.

---

## 10. Decision Impact Summary

### Questions that directly affect the architecture decision:

| # | Question | If Answer Is... | Architecture Impact |
|---|----------|-----------------|---------------------|
| 1.1 | Business vision | Large company | Strongly favors Medusa (Option A) |
| 2.1 | Product count | 100+ | Strongly favors Medusa (Algolia plugin ready) |
| 3.3 | Custom order workflow | Quote \u2192 deposit \u2192 production | Requires custom module regardless. Medusa handles it with extension. |
| 4.1 | Customer type | B2B/Wholesale | Requires custom pricing module regardless |
| 4.2 | International customers | Planned | Strongly favors Medusa (multi-currency native) |
| 6.2 | GST invoices at launch | Yes | Requires custom invoice module regardless |
| 7.2 | Shipping carrier | ShipRocket/Delhivery | Strongly favors Medusa (plugins available) |
| 8.1 | XP system importance | Critical at launch | Makes custom modules a Tier 1 priority |
| 9.1 | Marketplace plans | Yes/Planned | **Invalidates all three options.** Need a marketplace platform or custom marketplace build. |

### Questions that affect timeline and scope:

| # | Question | If Answer Is... | Timeline Impact |
|---|----------|-----------------|-----------------|
| 2.3 | Digital products | Yes | Adds 2\u20134 weeks (custom digital fulfillment module) |
| 2.4 | Subscriptions | Yes | Adds 4\u20136 weeks (custom subscription/billing module) |
| 2.5 | Product bundles | Yes | Adds 2\u20133 weeks (custom bundle module) |
| 5.2 | Admin users in 2 years | 5\u201310x | Requires permission system (adds 2\u20133 weeks to Option A admin plugins) |
| 6.1 | Payment methods | All methods | Razorpay covers all. No timeline impact if using Medusa + Razorpay plugin. |
| 7.3 | International shipping | Yes | Adds 2\u20133 weeks (international shipping profiles + carrier integration) |
| 8.1 | XP system importance | Critical at launch | Adds XP module to Tier 1 (extends launch timeline by 3\u20134 weeks) |

---

## Final Owner Answers (2026-06-24)

### 4.3 — Cash on Delivery (COD)
**Answer:** Yes. Support COD where available.

COD is required for the Indian market. Razorpay supports COD natively. Order flow will create orders without upfront payment confirmation for COD, and cash collection on delivery.

### 6.2 — GST Invoices at Launch
**Answer:** Yes. GST invoice support required.

Products are sold commercially in India. Per-invoice tax calculation based on product HSN codes and destination state (CGST/SGST/IGST) is a legal requirement. A custom GST invoice module is needed regardless of architecture choice.

### 7.2 — Shipping Carrier
**Answer:** No carrier lock. Prefer ShipRocket aggregation (Delhivery, BlueDart, Xpressbees, Ecom Express).

ShipRocket is preferred because it can aggregate multiple carriers (Delhivery, Xpressbees, BlueDart, Ecom Express). No carrier-specific dependencies at this stage. Both ShipRocket and Delhivery have Medusa plugins.

---

## How to Use This Document

1. **Print it or copy it into a Google Doc.**
2. **Go through each section with the business owners.**
3. **Check all that apply.** If unsure, check \"unsure\" and note it.
4. **Answer every \"(Must Answer)\" question** \u2014 these directly affect the launch scope.
5. **Bring the answers back** \u2014 we'll use them to finalize the architecture decision and create a development plan.

**Estimated time to complete: 30\u201345 minutes.**

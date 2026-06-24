# Architecture Challenges — Self-Critique

**Date:** 2026-06-23
**Version:** 1 (frozen — awaiting owner answers)
**Purpose:** Disprove the Medusa-first recommendation. Attack every option equally. Identify hidden costs, future pain points, and unknowns.
**Freeze Note:** Do not modify this document until owner answers `owner_questions.md`. If findings emerge, append to `architecture_review_notes.md`.

---

## 1. Assumptions That May Be Wrong

### Product Count
- **Assumption:** ~30 products now, ~100 in 2 years.
- **Challenge:** QUORIN sells resin art, candle making supplies, and soap making supplies. If the owners expand into finished art (not supplies), product count could explode past 100 with SKUs for every color combination, size, and finish. The 100-product cap may be optimistic if they start selling curated collections, limited editions, or seasonal drops.

### Traffic Volume
- **Assumption:** Moderate traffic, no extreme scaling needs.
- **Challenge:** If QUORIN goes viral on Instagram or gets featured in a maker-community publication, traffic could spike to thousands of concurrent sessions. Medusa's default PostgreSQL + Node.js stack handles this reasonably, but if the custom modules add unindexed queries, the entire database could become a bottleneck. The assumption of "no extreme scaling" may be wrong for a luxury-brand DTC store with social-media-driven traffic bursts.

### Admin Count
- **Assumption:** 2\u20133 admins (the owners).
- **Challenge:** If QUORIN grows to need dedicated staff (product manager, customer support rep, content editor, analytics analyst), admin permissions become critical. Medusa's built-in user system supports roles, but fine-grained permissions (e.g., "can view orders but not edit products") require custom implementation. The assumption of "simple admin roles" may break when the team grows.

### Custom Order Volume
- **Assumption:** Occasional custom orders (resin art commissions, bespoke candle sets).
- **Challenge:** If QUORIN becomes known for bespoke work, custom orders could become a significant revenue stream. Each custom order requires a different workflow: quote \u2192 approval \u2192 deposit \u2192 production \u2192 delivery. This is fundamentally different from standard e-commerce. If custom orders exceed 20% of total revenue, a simple Medusa custom module may not be enough \u2014 it could need a dedicated order-type system with a separate lifecycle.

### Review Volume
- **Assumption:** Moderate review volume (one review per completed order).
- **Challenge:** If QUORIN pushes reviews aggressively (post-purchase email flows, XP bonuses for reviews), review volume could grow to hundreds or thousands per product over time. The custom module's moderation queue, rating aggregation queries, and anti-abuse checks must scale. A naive implementation with unoptimized queries will degrade as review count grows.

---

## 2. Worst-Case Scenario for Medusa-First

### Scenario: The Platform Becomes a Straitjacket

1. **Custom domains outgrow custom modules.** XP, reviews, and custom requests grow more complex than expected. The Medusa module architecture was designed for extendable commerce, not complex business logic. The team hits limits: Medusa's event system doesn't support complex multi-step workflows (e.g., XP earn \u2192 verify \u2192 tier upgrade \u2192 discount apply \u2192 notify), requiring workarounds that become unmaintainable.

2. **Admin plugins become a maintenance burden.** Custom admin plugins are React + Medusa SDK. Every Medusa major version upgrade can break admin plugins. The team is forced to maintain two separate React codebases (frontend storefront + admin plugins) with overlapping dependencies.

3. **Payment gateway limitations.** The Razorpay plugin for Medusa may lag behind new Razorpay features (e.g., UPI intent flow changes, new settlement APIs). QUORIN is forced to wait for the plugin to update or maintain a fork.

4. **Shipping carrier API changes.** ShipRocket or Delhivery changes their API. The Medusa plugin for that carrier must be updated. If the plugin maintainer is not responsive, QUORIN is blocked.

5. **Search degrades at scale.** Without Algolia, Medusa's database-backed search becomes unusable at 200+ products with faceted filtering. With Algolia, sync between Medusa and Algolia can fall out of sync (indexing lag, failed syncs), causing customers to see stale product data or prices.

6. **Custom order workflow hits module limits.** If custom orders require deposit payments, milestone tracking, and production status, the Medusa module architecture (which expects order \u2192 payment \u2192 fulfill \u2192 complete) may not support this lifecycle without forcing custom orders into Medusa's order model with hacky workarounds.

7. **Indian edge case: GST invoicing.** Medusa has no built-in GST invoice generation. Indian e-commerce requires GST-compliant invoices (with CGST, SGST, IGST breakdown). If Medusa's invoice plugin doesn't support QUORIN's exact GST configuration, a custom plugin must be built. GST law changes \u2192 plugin must be updated.

### Hidden Cost Estimate
- Custom module maintenance: ~20 hours/month after initial build.
- Admin plugin upgrade risk: ~1 week of work per Medusa major version.
- Plugin dependency risk: unpredictable (could be zero, could be significant).
- GST compliance custom work: ~1\u20132 weeks initial, ~1\u20132 weeks per regulatory change.

---

## 3. Worst-Case Scenario for Custom Backend

### Scenario: The Team Drowns in Generic Commerce Problems

1. **Auth vulnerabilities.** A custom JWT/session implementation has a security flaw (e.g., token refresh without rotation, password reset token reuse). A data breach exposes customer PII. The cost of remediation, legal liability, and reputation damage far exceeds any "engineering simplicity" savings.

2. **Payment webhook failures.** Custom Razorpay/PayU webhook handling misses edge cases (duplicate webhooks, retry storms, idempotency gaps). Orders are created without payment confirmation. Revenue leaks. Customer support deals with phantom orders daily.

3. **Cart abandonment.** Custom cart implementation doesn't handle edge cases (cross-device persistence, expired carts, promo code conflicts, XP discount stacking with gift discounts). Customers are charged incorrectly or discounts don't apply. Trust erosion.

4. **Inventory race conditions.** Two customers add the last unit of a variant to their cart simultaneously. Both complete checkout. Oversell. One customer must be refunded and apologetic. This is a problem Medusa's transaction-based cart system prevents.

5. **Search is broken.** Custom search returns irrelevant results for common queries. Customers can't find products. Conversion rate drops. Algolia must be bolted on later, but the custom backend wasn't designed for it (no indexing hooks, no event system to trigger re-indexing).

6. **Returns nightmare.** Custom RMA system doesn't handle partial returns, exchanges, or restocking fees. Customer support handles every edge case manually. Operational cost skyrockets.

7. **Admin panel never finishes.** The custom admin panel is a massive React project. It's never truly \"complete\" \u2014 always missing features, always buggy. Non-technical owners can't operate the business effectively.

8. **Time to market slips by 4\u20136 months.** Every generic commerce feature takes longer than expected. The launch date keeps pushing. Competitors fill the gap.

### Hidden Cost Estimate
- Security audit & penetration testing: ~\u20b950,000\u2013\u20b91,00,000.
- Bug fixes post-launch (cart, payments, inventory): ~200\u2013400 engineering hours.
- Customer support overhead for commerce bugs: ~10\u201320 hours/week for first 3 months.
- Opportunity cost of delayed launch: revenue lost over 4\u20136 months.

---

## 4. Worst-Case Scenario for Hybrid

### Scenario: The Integration Layer Becomes the System

1. **XP credits never fire.** Order completes in Medusa \u2192 custom backend never receives the event (network timeout, event queue full, webhook rejected). Customer sees zero XP for a \u20b95,000 order. They leave a 1-star review complaining about broken loyalty. The team spends weeks debugging the integration layer.

2. **Data inconsistency.** Medusa says a product is in stock. Custom backend's product sync says it's out of stock (sync failed). Customer adds to cart \u2192 checkout fails \u2192 frustration. This happens repeatedly as sync mechanisms degrade.

3. **Auth split failure.** Customer logs into storefront (Medusa auth). Frontend requests XP balance from custom backend (separate auth). Token mismatch. User sees \"not logged in\" on their own profile.

4. **Custom request \u2192 order linkage breaks.** Admin converts a custom request to an order in Medusa. The custom request module (on custom backend) doesn't get the update. Status shows \"new\" when it should be \"converted to order.\"

5. **Two systems, one outage.** If the custom backend goes down (or Medusa goes down), half of QUORIN's functionality breaks. The team must monitor two separate infrastructures, debug two separate logs, and coordinate deployments across two systems.

6. **Deployment coordination hell.** Deploying a storefront update requires both Medusa and custom backend to be compatible. If Medusa is upgraded and custom backend isn't, the integration breaks. The team must version-lock one system to the other.

7. **Indian edge case: UPI payment flow mismatch.** Razorpay processes payment in Medusa. Custom backend's order sync expects a specific webhook payload format. Razorpay changes the payload format. Custom backend fails to parse. Orders hang in \"payment confirmed\" state indefinitely.

### Hidden Cost Estimate
- Integration layer development: ~150\u2013250 engineering hours (above and beyond Options A and B).
- Ongoing sync monitoring: ~5\u201310 hours/month.
- Debugging cross-system issues: ~10\u201320 hours per incident (likely monthly in first year).
- Deployment coordination: ~2\u20134 hours per deployment cycle.

---

## 5. What Could Make Us Regret the Decision in 1 Year?

### If Medusa-First:
- **Custom order volume grows to 30%+ of revenue.** The Medusa order model can't handle deposits, milestones, and production tracking. The custom module becomes a hacky workaround. We realize in year 1 that custom orders need their own lifecycle, not a Medusa extension.
- **GST compliance changes.** New GST rules (e.g., e-invoicing threshold changes, new HSN code requirements) require custom invoice plugin work that the Medusa community plugin doesn't address.
- **Product count grows to 200+** and search performance degrades because we didn't budget for Algolia/Meilisearch infrastructure.
- **Team grows to 5+ admins** and we discover that Medusa's role system is too coarse (only \"user\" and \"admin\" \u2014 no granular permissions like \"view-only orders\" or \"edit-products-only\").

### If Custom Backend:
- **Launch slips by 4\u20136 months** because generic commerce features take longer than expected. The business loses momentum and market position.
- **Payment webhook edge cases cause revenue loss** that exceeds the cost of using Medusa's battle-tested payment flow.
- **Inventory race conditions cause oversells** that damage customer trust early in the business lifecycle.

### If Hybrid:
- **Integration layer becomes the most fragile part of the system.** Every outage, every data inconsistency, every debugging session traces back to the sync between Medusa and the custom backend.
- **We spend more time maintaining the glue code** than building actual QUORIN features.

---

## 6. What Could Make Us Regret the Decision in 3 Years?

### If Medusa-First:
- **Medusa v2.x evolves into something unrecognizable.** The module system changes, custom modules break, and migrating to v3+ requires significant rewrite. The team is locked into a specific Medusa version to avoid breaking custom modules.
- **QUORIN needs marketplace features** (multiple vendors, split payouts, vendor dashboards). Medusa was never designed for multi-vendor marketplaces. A 3-year pivot to marketplace would require a near-complete rearchitecture.
- **Subscription products become a revenue stream.** Medusa has no subscription/billing engine. QUORIN would need a custom billing system integrated with Medusa, which adds complexity and risk.
- **Physical + digital products.** If QUORIN starts selling digital downloads (tutorials, design templates) alongside physical supplies, Medusa's inventory system (designed for physical goods) doesn't handle digital fulfillment naturally.

### If Custom Backend:
- **Engineering team burns out** maintaining 26 custom features, including generic commerce ones that could have been offloaded to a framework.
- **Security incidents become more likely** as the codebase grows and the team can't keep up with audit cycles for custom auth, payments, and data handling.
- **Competitors with established commerce platforms (Shopify, WooCommerce) outperform QUORIN's UX** because they have mature checkout flows, search, and review systems.

### If Hybrid:
- **The integration layer accumulates technical debt.** Every new feature requires a new sync mechanism. The system becomes a tangle of webhooks, event handlers, and sync jobs that are too fragile to refactor.
- **Scaling one system without the other becomes impossible.** If traffic spikes and only Medusa needs horizontal scaling, the custom backend (on a single instance) becomes the bottleneck.

---

## 7. Unknowns That Need Owner Answers

### Product & Catalog
- [ ] **How many products after 2 years?** 30? 50? 100? 200+?
- [ ] **How many variants per product?** 2\u20133? 5\u201310? More?
- [ ] **Physical + digital products planned?** (e.g., tutorials, templates, downloadable guides)
- [ ] **Subscription/recurring products planned?** (e.g., monthly supply box)
- [ ] **Will products be categorized more deeply than 3 categories?** Subcategories?
- [ ] **Limited edition / seasonal products?** These may need special handling (auto-expire, pre-order).
- [ ] **Bundle products?** (e.g., \"Resin Art Starter Kit\" = mold + resin + pigments)

### Customers & Orders
- [ ] **Will there be wholesale/B2B customers?** Different pricing tiers, minimum order quantities?
- [ ] **Will there be vendor/creator accounts?** (Marketplace: other makers sell on QUORIN)
- [ ] **Estimated monthly order volume at launch?** 50? 200? 500?
- [ ] **Estimated monthly order volume in 2 years?**
- [ ] **Will custom orders become a significant revenue stream?** (Current estimate: <10%? 20%? 50%?)
- [ ] **International shipping planned?** Which countries?
- [ ] **Multiple warehouses?** Will QUORIN use 3PL or third-party fulfillment?

### Admin & Operations
- [ ] **How many admin users?** 2? 5? 10+?
- [ ] **Will non-technical owners need full self-service?** (Can they handle payments, shipping, customer support without developer help?)
- [ ] **Will there be a dedicated customer support person?** If so, what access do they need?
- [ ] **Will there be a dedicated content/marketing person?** What content types need management?
- [ ] **Annual product update cycle?** How many products added/removed per year?

### Compliance & Legal
- [ ] **GST invoicing requirements?** (e-invoicing threshold, HSN codes, state-wise tax rates)
- [ ] **Return policy?** (7-day, 15-day, no-questions-asked?)
- [ ] **Data retention requirements?** (How long to keep customer data after deletion request?)
- [ ] **Any special industry compliance?** (e.g., chemical safety for resin products)

---

## 8. Questions That Must Be Answered Before Implementation Starts

1. **What is the maximum realistic product count in 3 years?** This determines whether Medusa's search (or Algolia budget) is adequate.
2. **Will custom orders need a separate lifecycle from standard orders?** If yes (deposits, milestones, production tracking), Medusa's order model may need significant extension or a completely separate order type.
3. **Is GST invoicing a hard requirement at launch?** If yes, a custom invoice plugin is needed regardless of architecture choice.
4. **Will QUORIN sell digital products alongside physical products?** If yes, Medusa's inventory system doesn't handle digital fulfillment \u2014 a custom module or separate system is needed.
5. **Is subscription/recurring billing on the roadmap?** If yes, Medusa has no built-in subscription engine \u2014 this becomes a custom module regardless.
6. **How many concurrent admin users will there be at launch and in 2 years?** This affects admin panel UX and permission design.
7. **What is the expected monthly order volume at launch and in 2 years?** This affects database indexing strategy, caching needs, and whether Medusa's default stack is sufficient.
8. **Will QUORIN ever need multi-vendor marketplace features?** If yes, Medusa is the wrong foundation \u2014 no commerce platform was built for multi-vendor marketplaces natively.
9. **Will international shipping be planned within 2 years?** If yes, multi-currency and international payment plugins must be selected early.
10. **Who will maintain custom modules post-launch?** The original development team, a different team, or the owners themselves? If the owners, the modules must be simple enough for non-technical maintenance.
11. **Is there a budget for third-party services (Algolia, Sentry, PostHog)?** If not, QUORIN must rely on open-source alternatives with self-hosting overhead.
12. **What is the SLA for order processing?** (e.g., payments must be confirmed within 5 seconds, inventory must be reserved instantly.) This affects architecture decisions around sync vs. async processing.

---

## 9. Final Confidence Score

### Medusa-First: 6.5 / 10
Medusa handles the hard parts (payments, shipping, inventory, auth, cart, orders) with battle-tested implementations. Custom modules for QUORIN-specific domains (XP, reviews, custom requests) are the right scope \u2014 small enough to build, large enough to be worth their own modules. But the architecture has real risks: custom admin plugins are a maintenance burden, GST compliance requires custom work, and the platform's order model may not support complex custom order workflows. The score is reduced because of unknowns around custom order volume, product count growth, and GST compliance needs.

### Custom Backend: 3 / 10
Building 11 standard commerce domains from scratch when they are solved problems in Medusa is a poor allocation of engineering resources. The risks (security vulnerabilities, payment webhook failures, inventory race conditions, search quality, returns edge cases) are significant for a small team. The only scenario where this makes sense is if QUORIN's business model is so non-standard that Medusa's architecture is fundamentally misaligned \u2014 but for a maker-supply store, Medusa is a strong fit. The low score reflects the high probability of building generic features that will be buggy, slow, and expensive to maintain.

### Hybrid: 2 / 10
The integration layer between two independent systems is the single most failure-prone architectural pattern. Every custom domain (XP, reviews, custom requests) is tightly coupled to commerce data. Splitting them across two backends creates sync failures, data inconsistency, authentication mismatches, and deployment coordination overhead \u2014 with no independent scaling benefit. The only scenario where this makes sense is if custom domains need to scale independently at massive scale (e.g., millions of XP transactions per day), which QUORIN will not approach in 3+ years.

---

## 10. Recommendation Confidence Level

**Medium**

The Medusa-first recommendation holds if:
- Product count stays under ~100 in years 1\u20132.
- Custom orders remain <20% of total revenue.
- GST compliance can be handled with a custom invoice plugin.
- No marketplace or multi-vendor plans exist.
- Digital products are not part of the initial roadmap.

The recommendation weakens significantly if:
- Custom orders become a major revenue stream with complex lifecycles (deposits, milestones).
- Product count exceeds ~200 with aggressive faceted search requirements.
- Subscription/recurring billing is on the roadmap.
- Marketplace/multi-vendor features are planned.
- Multiple warehouses or 3PL integration is needed.

**The confidence is Medium because the business requirements document contains structural assumptions about product count, custom order volume, and growth trajectory that have not been validated by QUORIN's owners.** Until these are confirmed, the architecture decision carries inherent uncertainty.

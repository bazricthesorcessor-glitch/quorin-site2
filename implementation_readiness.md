# QUORIN Implementation Readiness

**Date:** 2026-06-24
**Version:** 1
**Purpose:** Snapshot of confirmed decisions, open unknowns, required integrations, and migration blockers before implementation planning begins.
**Constraint:** No implementation plan. No code. No schema design.

---

## 1. Confirmed Decisions

### Architecture
| Decision | Value | Confidence |
|----------|-------|------------|
| Backend framework | Medusa v2.x | 8.0/10 |
| Payment gateway | Razorpay | 9.5/10 |
| Shipping aggregator | ShipRocket (aggregates Delhivery, BlueDart, Xpressbees, Ecom Express) | 8.5/10 |
| Search | Native search at launch; Algolia planned for when product count warrants it | 7.0/10 |
| Frontend | Next.js (existing codebase) | 8.0/10 |
| Custom modules | Reviews, XP/Loyalty, Settings, Custom Requests | 8.5/10 |
| GST invoicing | Custom module required | 9.0/10 |

### Business Scope
| Decision | Value |
|----------|-------|
| Product type | Physical products only |
| Sales channels | Website + Amazon |
| Subscriptions/memberships | No |
| Digital products | No |
| Marketplace / multi-vendor | No |
| COD | Yes, supported where available |
| Custom orders | Customer-driven, not a primary revenue stream |
| Loyalty | XP system + birthday rewards + reviews (confirmed required) |
| Customer accounts | Yes |
| Guest checkout | Yes |
| Admin users | Small team (1-5), no granular RBAC at launch |

### Assumptions at High Confidence (13)
A3 (no marketplace), A4 (Medusa modules fit), A6 (Express not independently needed), A7 (Razorpay covers all methods), A9 (ShipRocket plugin exists), A11 (XP/Loyalty module), A12 (GST custom module), A14 (current evidence does not justify custom backend), A15 (current evidence does not justify Hybrid), A17 (no digital/subscriptions), A19 (GST compliance requires custom plugin), A21 (localStorage is a known gap to be replaced), A22 (QUORIN is a retail maker-supply store).

---

## 2. Remaining Business Unknowns

| Unknown | Impact | Priority |
|---------|--------|----------|
| **Custom requests volume** — what % of revenue will custom commissions become? | If ~5%: Medusa handles it via lightweight CustomRequests module. If ~60%: custom order system needs significant investment, may require separate subsystem beyond Medusa order model. | High |
| **Product variant complexity** — average variants per product | Affects inventory tracking complexity and admin UX. | Medium |
| **Admin user count in 2 years** — current vs projected team size | If growing beyond 5, a permission system becomes more important. | Medium |
| **Product bundles** — will QUORIN sell pre-made kits? | If yes, a bundle product type is needed (not native to Medusa). | Medium |
| **International customers/shipping** — planned or unlikely | If yes: multi-currency, international shipping profiles, customs docs. | Medium |
| **Limited editions / seasonal drops** | Needs auto-expiry logic (scheduled product visibility). | Low |
| **Referral system** | Adds another custom module dimension. | Low |
| **Courses/tutorials / community forum** | If yes: separate product type or external system (Discord, etc). | Low |

---

## 3. Required Integrations

### At Launch
| Integration | Type | Status | Notes |
|-------------|------|--------|-------|
| Razorpay | Payment | Provider selected | Supports UPI, cards, net banking, wallets, COD |
| ShipRocket | Shipping | Provider selected | Aggregates Delhivery, BlueDart, Xpressbees, Ecom Express |
| GST Invoice Generator | Custom module | Not built | Must generate per-invoice CGST/SGST/IGST by HSN code and destination state |
| XP/Loyalty | Custom module | Not built | Existing business rules in `GIFT_RULES.md` |
| Reviews | Custom module | Not built | Order-anchored, moderation queue, anti-abuse |

### Deferred / Future
| Integration | Type | Trigger | Notes |
|-------------|------|---------|-------|
| Algolia Search | Search | Product count >50 or native search degrades | Can start with native, migrate later |
| Stripe/PayPal | Payment | International sales demand | Not needed at launch |
| Amazon sync module | Inventory | Current Amazon presence | Neither Medusa nor Express prototype has this out of the box |
| Referral system | Custom module | When loyalty matures | Adds XP referral bonuses |
| Subscription engine | Custom module | If recurring products added | Not on current roadmap |
| Bundle product type | Custom module | If QUORIN sells pre-made kits | Not native to Medusa |

---

## 4. Migration Blockers

### Critical (must resolve before implementation)
| Blocker | Details | Effort Estimate |
|---------|---------|-----------------|
| **Cart reconciliation** | `app/src/App.tsx` has a dual cart path: Medusa SDK (`useMedusaCart.ts`) vs. local state (`quorinStore.ts`). Must determine which path wins and migrate localStorage cart data to Medusa sessions. | Medium |
| **Account migration** | `data/accounts.ts` has hardcoded demo accounts with demo passwords. Must migrate to Medusa customers with proper auth flow. | Medium |
| **Order migration** | `data/orders.ts` has hardcoded demo orders. Must determine if historical order data needs to be imported or if launch resets all orders. | Low-Medium |
| **GST invoice module** | Required at launch. No existing implementation in either backend. Must be built as a Medusa custom module. | High |

### Medium (can plan but not block)
| Blocker | Details | Effort Estimate |
|---------|---------|-----------------|
| **Amazon sync** | QUORIN sells on Amazon but neither backend has sync. Inventory must be kept consistent between channels. May need a separate sync service or manual process initially. | Medium |
| **Frontend Medusa SDK integration** | `medusa.ts` client exists but cart/product flows in `App.tsx` still reference localStorage for non-cart data. Major frontend refactor needed to wire everything to Medusa. | High |
| **XP/Loyalty frontend integration** | XP logic currently in `data/xp.ts` and `GIFT_RULES.md` as hardcoded rules. Must be moved to Medusa custom module with API endpoints for the frontend to consume. | Medium-High |
| **Review system migration** | Reviews currently hardcoded in `data/products.ts`. Must be moved to Medusa custom module with moderation workflow. | Medium |

---

## 5. Data Sources

### Current Data Locations
| Domain | Current Source | Target (Medusa) | Migration Required |
|--------|---------------|-----------------|-------------------|
| Products | `app/src/data/products.ts` (static JSON) + `backend/seed.ts` | Medusa product API | Yes — migrate static products to Medusa seed |
| Categories | `app/src/data/categories.ts` (static JSON) | Medusa categories API | Yes — migrate to Medusa |
| Cart | `quorinStore.ts` (localStorage) | Medusa cart API | Yes — migrate localStorage cart to Medusa sessions |
| Orders | `data/orders.ts` (hardcoded) | Medusa orders API | No — launch resets orders, or import if historical needed |
| Customers | `data/accounts.ts` (hardcoded demo accounts) | Medusa customers API | Yes — migrate demo accounts to Medusa customers |
| XP/Loyalty | `data/xp.ts`, `GIFT_RULES.md` (hardcoded rules) | Custom Medusa module | Yes — build module, migrate rules to config |
| Reviews | `data/products.ts` (hardcoded in product objects) | Custom Medusa module | Yes — build module, migrate review data |
| Gifts | `data/gifts.ts` (hardcoded gift rules) | Custom Medusa module | Yes — migrate to module config |
| Admin settings | `data/adminSettings.ts` (hardcoded) | Custom Medusa module | Yes — build Settings module |
| Shipping rates | `app/src/data/shipping.ts` (hardcoded) | Medusa shipping profiles | Yes — configure Medusa profiles, remove hardcoded rates |
| Payment config | Hardcoded in `App.tsx` | Razorpay Medusa plugin | Yes — install and configure plugin |

### Data to Preserve
- Product catalog (names, descriptions, images, prices, variants)
- Category hierarchy
- Existing customer accounts (if migration is done)
- XP rules and business logic from `GIFT_RULES.md`
- Gift rules from `data/gifts.ts`

### Data to Discard at Launch
- Hardcoded demo orders (unless historical import is planned)
- Hardcoded demo payment methods (replace with live Razorpay)
- Hardcoded shipping rates (replace with Medusa shipping profiles)

---

## 6. Quick Reference: What Still Needs Owner Answers

These do not block architecture (Option A is recommended), but will shape implementation scope:

| Question | Section | Topic |
|----------|---------|-------|
| 2.2 | Variants per product | Inventory complexity |
| 2.5 | Product bundles | Bundle product module |
| 2.6 | Limited editions | Auto-expiry logic |
| 3.2 | Custom order revenue % | Custom module priority |
| 5.1 | Admin users today | Admin plugin scope |
| 5.2 | Admin users in 2 years | Permissions planning |
| 5.3 | Staff roles | Permissions planning |
| 7.3 | International shipping | Shipping profiles |
| 8.2 | Referral system | Loyalty module scope |
| 9.2 | Creator/vendor accounts | User types |
| 9.3 | Courses/tutorials | Digital product support |
| 9.4 | Community/forum | Content scope |

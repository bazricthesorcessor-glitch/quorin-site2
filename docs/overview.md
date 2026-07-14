# QUORIN — Project Overview

Last updated: 2026-07-15

## Mission

Build QUORIN as a coherent premium commerce product rather than a collection of attractive pages.

## System map

### Customer experience
- Home and discovery.
- Search and category browsing.
- Product detail.
- Wishlist.
- Cart and checkout.
- Customer account and orders.
- Responsive/mobile-specific experience.

### Commerce engine
- Medusa backend.
- Products and variants.
- Pricing.
- Inventory.
- Customers.
- Carts and orders.
- Fulfillment/payment integrations as configured.

### Operational admin
- Dashboard and alerts.
- Orders.
- Catalog management.
- Customers.
- Inventory.
- Analytics.
- Profitability/cost data.
- Marketing.
- Payments, shipping and taxes.
- Users, roles, permissions and audit logs.

### AI-readable commerce
- Structured brand identity.
- Canonical catalog data.
- Explainable recommendation interfaces.
- Policy and trust evidence.
- Future review provenance and product safety/use-case data.

## Architecture principles

1. One source of truth per domain.
2. Typed API boundaries.
3. No fabricated operational data.
4. Responsive behavior is part of feature completion.
5. Sensitive actions require server-side authorization.
6. Shared UI primitives should reduce duplication without flattening the QUORIN visual identity.
7. Documentation is living project state, not an abandoned specification folder.

## Project documents

- `phase.md` — what is being worked on now and phase exit criteria.
- `completed.md` — durable ledger of completed capabilities.
- `fixed.md` — meaningful defects and architectural corrections.
- `mobileview.md` — mobile design rules and validation checklist.
- `memory.md` — durable cross-chat project memory.
- `overview.md` — high-level system map and principles.
- `ADMIN_PRODUCT_SCOPE.md` — detailed expanded admin scope.

## Cleanup policy

Do not permanently delete uncertain files merely because they look old.

When a file is clearly unnecessary but deletion confidence is not high:
1. move/recreate it under `delete-me/` while preserving enough path context to identify its origin,
2. record why it was quarantined,
3. let Bazric review and remove it permanently.

Files that are confidently generated junk, secrets, build artifacts already covered by ignore rules, or provably dead duplicates may be deleted directly when safe.

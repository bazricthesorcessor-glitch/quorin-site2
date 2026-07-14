# QUORIN Admin Product Scope

## Purpose

The expanded QUORIN target is not a collection of disconnected admin mockups. It is one operational commerce system backed by Medusa and presented through a coherent QUORIN admin experience.

## Product areas

### 1. Command center
- Dashboard with revenue, orders, customers, conversion and inventory signals.
- Date-range controls and comparison periods.
- Actionable alerts instead of decorative metrics.
- Recent orders and operational shortcuts.

### 2. Orders
- Search, filter and status views.
- Order detail with customer, payment, fulfillment, timeline and line items.
- Fulfillment and cancellation actions gated by backend capability and permissions.

### 3. Catalog
- Products and product creation/editing.
- Categories.
- Collections.
- Attributes/options.
- Tags.
- Inventory and stock alerts.
- Media management.

### 4. Customers
- Searchable customer directory.
- Customer detail workspace.
- Orders, addresses, spend and account metadata.
- No fabricated lifetime-value or behavioral claims when data is unavailable.

### 5. Analytics and profitability
- Revenue and order analytics from canonical order data.
- Product performance.
- Inventory movement.
- Cost/profitability features only when raw-material and cost inputs are explicitly stored.
- Never infer profit from selling price alone.

### 6. Marketing
- Promotions/coupons.
- Campaign workspace.
- Segmentation only from fields and consent states actually stored.
- Email delivery requires a configured provider; UI must expose provider/configuration state.

### 7. Operations
- Payment provider configuration status.
- Shipping regions, methods and rates.
- Tax regions/rules.
- Store settings.

### 8. Security and governance
- Admin users.
- Roles and permissions.
- Activity/audit logs.
- Sensitive actions enforced server-side, never by hidden buttons alone.

## Architecture rules

1. Medusa remains canonical for products, prices, inventory, customers, carts and orders.
2. QUORIN-specific modules may store data Medusa does not own, such as raw-material costing, campaign drafts, role metadata and audit events.
3. Admin pages consume typed API clients; pages do not directly embed backend implementation assumptions.
4. Every data screen must define loading, empty, error and permission-denied states.
5. Destructive operations require explicit confirmation and backend authorization.
6. Dashboard metrics must identify their source and time window.
7. Mobile admin is responsive and task-focused, but storefront mobile UX remains a separate design system.
8. Reference screenshots define information architecture and interaction intent, not fake production data.

## Delivery sequence

### Phase A — Admin foundation
- Normalize admin shell/navigation.
- Create shared table, filter, drawer, modal, form and status primitives.
- Split the current multi-page admin implementation into feature modules.

### Phase B — Core operations
- Orders.
- Products.
- Categories and collections.
- Customers.
- Inventory.

### Phase C — Business intelligence
- Analytics.
- Profitability/cost model.
- Stock alerts.

### Phase D — Growth and configuration
- Promotions.
- Campaigns.
- Payments, shipping and tax settings.

### Phase E — Governance
- Users.
- Roles and permissions.
- Activity logs.
- Production validation and audit.

## Acceptance bar

A feature is not counted as complete because a route renders. It must have:
- a real data contract,
- meaningful loading/empty/error states,
- permission behavior where applicable,
- responsive behavior,
- mutation feedback,
- and validation against the approved reference intent.

# QUORIN V3 Architecture

## Architecture decision

QUORIN V3 is a clean storefront rebuild that preserves Medusa v2 as the canonical commerce backend.

The existing implementation is treated as a source of reusable assets, verified configuration and business knowledge—not as a structure that the new storefront must imitate.

## System boundaries

### Storefront

Responsibilities:
- Rendering and responsive composition
- Customer interactions
- Accessibility
- Local ephemeral UI state
- Safe optimistic UI
- Server-state caching
- Navigation and state restoration

Must not authoritatively decide:
- Product prices
- Inventory
- Discounts
- Admin authorization
- Order validity
- XP awards

### Medusa backend

Canonical commerce responsibilities:
- Products
- Variants
- Pricing
- Inventory
- Categories/collections
- Carts
- Customers
- Orders
- Promotions

### QUORIN custom domain modules

Only for requirements that do not belong cleanly to native Medusa commerce capabilities, including approved implementations of:
- Loyalty/XP ledger
- Theme/content configuration
- Specialized operational integrations

### Admin

Desktop-first management experience. It must operate on canonical backend/domain data rather than maintaining a second product database.

Authorization is server-side. The customer-facing glowing Admin entry is only a navigation affordance.

## Storefront target structure

The rebuild should converge toward:

```text
app/
  src/
    app/
      providers/
      router/
      styles/
    components/
      primitives/
      commerce/
      navigation/
      feedback/
    features/
      home/
      catalog/
      search/
      product/
      wishlist/
      cart/
      account/
      loyalty/
    lib/
      medusa/
      formatting/
      validation/
      accessibility/
    state/
      ui/
    types/
```

Feature folders own feature composition. Shared primitives remain intentionally small and reusable.

## State model

### Server state
Use a dedicated server-state/query layer for Medusa-backed and QUORIN API data.

Examples:
- Products
- Categories
- Cart synchronization
- Customer
- Orders
- Loyalty history

### Local UI state
Keep local unless cross-route persistence is genuinely required.

Examples:
- Open sheet
- Selected gallery image
- Temporary hover/focus state

### Preserved navigation state
Intentionally preserve:
- Search query
- Filters
- Sort
- Scroll position
- Selected variant where useful
- Recently viewed products

Do not create one giant global store.

## Responsive composition model

Shared domain state feeds distinct desktop and mobile compositions when interaction architecture differs materially.

Examples:
- Desktop quick view: modal
- Mobile quick view: draggable bottom sheet
- Desktop filters: sidebar/panel
- Mobile filters: sheet
- Desktop navigation: horizontal header
- Mobile navigation: adaptive floating dock

Avoid duplicating business logic between these compositions.

## Design system

All runtime-customizable visual values must flow through semantic tokens.

Protected engineering constraints include:
- Layout architecture
- Responsive rules
- Minimum contrast
- Touch target minimums
- Typography hierarchy
- Critical structural spacing
- Navigation behavior

Admin-customizable properties may include approved:
- Brand/accent colors
- Background/surface palette
- Text colors within contrast constraints
- Glass tint/intensity
- Content
- Images/media
- Promotional content

## Motion

Motion must communicate state and spatial relationships. Prefer CSS transitions for simple interactions and one deliberate motion system for complex gestures/transitions.

Avoid carrying multiple overlapping animation/smooth-scroll libraries into V3 without a demonstrated need.

## Data integrity

The frontend never becomes authoritative for:
- Price
- Inventory
- Promotion eligibility
- Order totals
- Admin role
- XP balance mutations

Safe optimistic UI is allowed only when rollback is understandable.

## Migration strategy

1. Preserve legacy implementation on `main` during rebuild.
2. Build V3 on `quorin-v3-rebuild`.
3. Reuse verified media/assets and backend configuration selectively.
4. Establish the V3 shell and design system.
5. Calibrate visual fidelity on Home.
6. Build discovery and product flows.
7. Replace fixture data with canonical Medusa data progressively.
8. Complete customer, loyalty and admin flows.
9. Run visual, functional, accessibility, performance and security audits.
10. Merge only after explicit acceptance.

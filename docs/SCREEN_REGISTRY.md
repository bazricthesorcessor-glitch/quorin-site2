# QUORIN Screen Registry

This registry translates the approved reference screenshots into implementation targets. Screenshots are visual acceptance references, not absolute-positioned canvases.

## Global rules

- Desktop and mobile are related compositions, not scaled copies.
- Long screenshots represent scrollable pages, not single physical viewports.
- Approved layout structure is protected.
- Dynamic commerce data must come from Medusa-backed domain state.
- Content and safe theme tokens may be admin-configurable.
- Every customer-facing route must define loading, empty, error, interaction, and responsive states.

## Screen families

### HOME

**Route:** `/`

**Desktop:** approved reference exists.
**Mobile:** approved reference exists.

Core sections:
1. Global navigation
2. Hero
3. Category discovery
4. Why shop from QUORIN / trust value
5. Best sellers
6. Testimonials / social proof
7. Social gallery
8. Community/newsletter CTA
9. Footer

Reusable systems:
- Site header
- Mobile header
- Mobile floating dock
- Category card
- Product card
- Section heading
- Testimonial card
- Community CTA
- Footer

### CATEGORY / COLLECTION

**Routes:** category and collection handles, including Resin Art, Candle Making, Soap Making, Kits, New Arrivals and Best Sellers as approved.

**Desktop:** approved references exist for multiple category experiences.
**Mobile:** approved references exist for category experience.

Core capabilities:
- Category identity/hero
- Subcategory discovery
- Featured products
- Product grids/rails
- Editorial content where approved
- Shared trust/community/footer systems

Implementation rule: use one configurable category/collection composition system rather than hardcoding unrelated pages.

### SEARCH / PRODUCT DISCOVERY

**Route:** `/search`

**Desktop:** approved reference exists.
**Mobile:** approved reference exists.

Core capabilities:
- Search query
- Suggestions/autocomplete
- Product results
- Category suggestions
- Filters
- Sorting
- Result count
- Empty state
- Pagination or intentional progressive loading
- Query/filter/sort/scroll restoration after returning from product detail

Desktop composition: filter/sidebar-capable dense discovery layout.
Mobile composition: focused search, chips/controls, filter sheet, touch-friendly product grid.

### PRODUCT DETAIL

**Route:** `/products/:handle`

**Desktop:** approved reference exists.
**Mobile:** approved reference exists.

Primary hierarchy:
1. Product media
2. Product identity
3. Rating/review summary
4. Price
5. Variant/options
6. Stock
7. Quantity
8. Add to Bag
9. Wishlist

Secondary content may include:
- Product information
- How to use
- Specifications
- Shipping/returns
- Video/media
- Complementary products
- Reviews
- FAQ
- Recently viewed

Mobile must use progressive disclosure and context-aware purchase controls rather than vertically dumping the desktop layout.

### PRODUCT QUICK VIEW

**Desktop:** large modal.
**Mobile:** draggable bottom sheet.

Shared capabilities:
- Product media
- Product identity
- Price
- Stock
- Variant selection
- Quantity where appropriate
- Add to Bag
- Wishlist
- Open full product page

### WISHLIST

**Route:** `/wishlist`

**Desktop:** approved reference exists.
**Mobile:** approved reference exists.

Capabilities:
- Saved products
- Remove
- Variant/quantity handling where approved
- Add to Bag
- Empty state
- Recommendations where approved

### BAG / CART

**Route:** `/bag` or canonical cart route selected by architecture.

**Desktop:** approved reference exists.
**Mobile:** approved reference exists.

Capabilities:
- Line items
- Variant information
- Quantity changes
- Remove
- Move/save to wishlist where approved
- Promotions/discount entry
- Shipping progress/context
- XP/loyalty discount integration where approved
- Recommendations
- Order summary
- Checkout entry

### LOYALTY / XP

**Route:** account loyalty route selected by architecture.

**Desktop:** approved reference exists.
**Mobile:** mobile adaptation required using established QUORIN mobile UX rules.

Primary mobile priority:
1. Current level
2. Current XP
3. Progress to next level
4. Primary benefit/reward context

Secondary information should use progressive disclosure.

## Shared responsive acceptance widths

Implementation must be tested at minimum across:
- Compact mobile: ~360px
- Standard mobile: ~390–430px
- Tablet/intermediate: ~768–1024px
- Laptop: ~1280–1440px
- Large desktop: reference viewport and wider layouts

Exact screenshot viewport dimensions should be recorded when available during visual calibration.

## Visual acceptance method

For each implemented screen:
1. Render at the target reference viewport.
2. Compare composition, hierarchy, spacing, typography, image crops, radii, borders and shadows.
3. Correct systemic differences in tokens/components before adding page-specific exceptions.
4. Verify intermediate widths.
5. Verify interaction states and real data behavior.

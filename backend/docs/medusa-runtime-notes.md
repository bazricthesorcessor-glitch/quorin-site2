# Medusa Runtime Notes — Known Issues & Fixes

## Runtime Patch Inventory

| File | Why patched | Remove when |
|------|-------------|-------------|
| `core-flows/.../prepare-confirm-inventory-input.js` | Missing `stock_locations` query graph — fallback for `location_levels` | Proper Medusa link module or upstream fix |
| `core-flows/.../update-cart.js` | Case-sensitive country comparison (`IN` vs `in`) | Upstream fix or client-side normalization |
| `core-flows/.../acquire-lock.js` | Missing `@medusajs/locking` module | Proper locking configuration |
| `core-flows/.../release-lock.js` | Missing `@medusajs/locking` module | Proper locking configuration |
| `medusa/dist/api/**/[14 files]` | `Modules.WORKFLOW_ENGINE` undefined — hardcoded `"workflow_engine"` string | Medusa version upgrade |

All patches are inside `node_modules/`. They will be lost on `npm install` or Medusa upgrade.

## Patch Status

| Patch                                | Status      | Permanent Fix                  |
| ------------------------------------ | ----------- | ------------------------------ |
| `prepare-confirm-inventory-input.js` | Temporary   | Medusa extension / upstream fix |
| `WORKFLOW_ENGINE` in 14 route files  | Temporary   | Upgrade Medusa                 |
| `LOCKING` acquire/release            | Temporary   | Proper module configuration    |
| `inventory_level raw_*` NULL columns  | Permanent   | SQL migration (already applied) |
| `region_country` India linking        | Permanent   | Fix seed/provisioning script   |

| Patch                                | Status      | Permanent Fix                  |
| ------------------------------------ | ----------- | ------------------------------ |
| `prepare-confirm-inventory-input.js` | Temporary   | Medusa extension / upstream fix |
| `WORKFLOW_ENGINE` in 14 route files  | Temporary   | Upgrade Medusa                 |
| `LOCKING` acquire/release            | Temporary   | Proper module configuration    |
| `inventory_level raw_*` NULL columns  | Permanent   | SQL migration (already applied) |

All patches are inside `node_modules/`. They will be lost on `npm install` / Medusa upgrade.

---

## INSUFFICIENT_INVENTORY false positive

**Discovered:** 2026-06-25

### Symptom
Adding a valid variant (`pv_001`, qty 1) to a cart returned:
```json
{"code":"insufficient_inventory","type":"not_allowed","message":"Some variant does not have the required inventory"}
```

Inventory items had 100 stocked units, 0 reserved. The variant and sales channel were correctly linked.

### Actual Root Cause
Two issues compounded:

**1. `raw_*` columns were NULL** (`inventory_level` table)

Medusa's `getAvailableQuantity()` in `inventory-level.js` reads `raw_stocked_quantity` and `raw_reserved_quantity` (JSONB columns). These were NULL because the data was inserted via a path that only set the text columns (`stocked_quantity`, `reserved_quantity`).

```
NULL → MathBN.sub(NULL, NULL) → NaN
NaN < 1 → true → throw "insufficient_inventory"
```

**Fix (permanent):**
```sql
UPDATE inventory_level
SET raw_stocked_quantity = stocked_quantity::text::jsonb,
    raw_reserved_quantity = reserved_quantity::text::jsonb,
    raw_incoming_quantity = incoming_quantity::text::jsonb
WHERE raw_stocked_quantity IS NULL AND deleted_at IS NULL;
```

**2. Missing `stock_locations` query graph relation**

Medusa's query graph could not traverse `inventory_level → stock_location`. The fallback in `prepare-confirm-inventory-input.js` was added to extract `location_levels` directly.

**Temporary patch:** `node_modules/@medusajs/core-flows/dist/cart/utils/prepare-confirm-inventory-input.js`
**Permanent fix:** Create a proper Medusa link module between `inventory_level` and `stock_location`.

### Why This Was Hard to Diagnose
The error message `insufficient_inventory` implied a business-logic problem (not enough stock, wrong sales channel). The real problem was a data-integrity issue in the `raw_*` JSONB columns — the calculation silently produced `NaN`.

### Upgrade Warning
The patch in `node_modules/core-flows/` will be lost on:
- `npm install` / `npm update`
- Medusa version upgrades
- CI/CD deployments / Docker rebuilds

These are diagnostic patches, not production-safe.

---

## WORKFLOW_ENGINE module registration mismatch

**Discovered:** 2026-06-24

### Symptom
```
TypeError: Cannot read properties of undefined (reading 'run')
```

### Root Cause
Medusa 2.16.0 registers the workflow engine internally, but route files reference it via `Modules.WORKFLOW_ENGINE` which is `undefined`.

**Temporary patch:** Hardcoded `"workflow_engine"` string in 14 route files.
**Permanent fix:** Upgrade Medusa or wait for upstream fix.

---

## LOCKING module missing

**Discovered:** 2026-06-24

### Symptom
Cart creation failed during inventory confirmation because `acquire-lock.js` and `release-lock.js` threw on undefined `locking` module.

**Temporary fix:** `try/catch` wrappers in `core-flows/dist/locking/steps/acquire-lock.js` and `release-lock.js`.

### Permanent fix
Ensure `@medusajs/locking` is installed and configured in `medusa-config.js`.

---

## Region-country validation: case-sensitivity + caching

**Discovered:** 2026-06-25

### Symptom
```
POST /store/carts/{id}
{"shipping_address": {"country_code": "in"}}

→ "Country with code in is not within region India"
```

### Root Cause (two-layer issue)

**1. India not linked to region**

The `region_country` join table had all `region_id` values as `NULL`. India ("IN") existed as a country but was not associated with `reg_india`.

**Fix (permanent):**
```sql
INSERT INTO region_country (iso_2, iso_3, num_code, name, display_name, region_id)
VALUES ('IN', 'IND', '356', 'INDIA', 'India', 'reg_india')
ON CONFLICT (iso_2) DO UPDATE SET region_id = 'reg_india';
```

**2. Case-sensitive comparison**

Medusa's `prepare-cart-to-update-step` does:
```js
data.region.countries.find((c) => c.iso_2 === shippingAddress.country_code)
```

DB stores `"IN"` (uppercase). API requests typically send `"in"` (lowercase). Match fails.

**Temporary patch:** `node_modules/@medusajs/core-flows/dist/cart/workflows/update-cart.js` line 31
```js
// Before: c.iso_2 === shippingAddress.country_code
// After:  c.iso_2.toLowerCase() === shippingAddress.country_code.toLowerCase()
```

**3. Redis cache**

The region query (line 168-170) has `cache: { enable: true }`. After DB changes, the cached region must be cleared:
```
redis-cli FLUSHALL
```
Or clear via node: `redis.flushall()`

### Why This Was Hard
Three independent issues compounded: missing DB link → case mismatch → Redis cache holding stale data. Each alone might have been noticeable; together they made debugging difficult.

### Upgrade Warning
The case-sensitivity patch in `node_modules/core-flows/` will be lost on:
- `npm install` / `npm update`
- Medusa version upgrades
- CI/CD deployments / Docker rebuilds

---

## Verification Matrix (2026-06-25)

| Feature              | Status                          |
| -------------------- | ------------------------------- |
| Product retrieval    | ✅                               |
| Cart creation        | ✅                               |
| Add line item        | ✅                               |
| Update quantity      | ✅                               |
| Remove line item     | ✅                               |
| Inventory validation | ✅                               |
| Shipping address     | ✅                               |
| Billing address      | ✅                               |
| Region validation    | ✅                               |
| Customer creation    | ⚠️ Store API auth/configuration |
| Shipping methods     | ⬜                               |
| Payment session      | ⬜                               |
| Complete order       | ⬜                               |
| Inventory decrement  | ⬜                               |
| Order creation       | ⬜                               |

### Next milestone: Checkout completion

```text
Shipping methods
        ↓
Payment session
        ↓
Complete cart
        ↓
Order creation
        ↓
Inventory decrement
        ↓
Order retrieval
```


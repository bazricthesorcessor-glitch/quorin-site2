# QUORIN Asset Audit

## Confirmed reusable product media

The legacy catalog references repository-hosted media under `/PHOTOS/`. V3 intentionally reuses those stable public paths while the catalog is migrated to Medusa-backed data.

Confirmed examples:
- Resin: `/PHOTOS/Resin/1.webp`
- Resin pigment: `/PHOTOS/resin pigment/6/7.webp`
- Candle pigment: `/PHOTOS/candle pigments/candle colour for canldle making (1).webp`
- Fragrance oils: `/PHOTOS/Fragrances/variation 1/1.webp`
- Soap pigment: `/PHOTOS/Soap dye/1.webp`
- Soap kit: `/PHOTOS/Soap Dye + mould/1.webp`

## Migration rule

- Reuse repository-hosted product photography when it represents a real QUORIN product.
- Do not make third-party placeholder imagery authoritative.
- V3 fixture data is temporary presentation data only.
- Medusa will become the canonical source for product identity, variants, price and inventory.
- Media paths should be normalized during Medusa integration.

## Current calibration use

The V3 homepage now uses real existing QUORIN product media for hero/category/product-card calibration rather than abstract CSS placeholders.

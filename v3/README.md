# QUORIN V3 Storefront

Clean customer storefront rebuild for QUORIN.

## Local development

```bash
cd v3
npm install
cp .env.example .env
npm run dev
```

## Build

```bash
npm run build
```

## Architecture

- React + TypeScript + Vite
- Medusa v2 remains the canonical commerce backend
- Semantic CSS design tokens
- Separate mobile/desktop compositions where interaction architecture differs
- Approved reference screenshots are visual acceptance targets

See `../docs/ARCHITECTURE_V3.md` and `../docs/SCREEN_REGISTRY.md`.

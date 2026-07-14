# QUORIN Project State

## Current status

- Rebuild mode: active
- Current phase: Phase 0 — safe repository audit and rebuild preparation
- Canonical branch for existing implementation: `main`
- Rebuild branch: pending creation
- Storefront: React 19 + TypeScript + Vite
- Commerce backend: Medusa v2
- Visual source of truth: approved desktop and mobile reference screenshots supplied by the owner
- Layout policy: approved layout is protected; content and safe theme tokens may be admin-configurable

## Confirmed repository baseline

### Storefront

The existing storefront lives under `app/` and currently uses React 19, TypeScript, Vite 7, React Router, Tailwind CSS, Radix primitives, Framer Motion, Vaul, Embla, Lucide, Zod, React Hook Form, and the Medusa JS SDK.

### Backend

The existing backend lives under `backend/` and uses Medusa v2.16.x with PostgreSQL support.

## Rebuild strategy

1. Preserve `main` as the recoverable legacy implementation during the rebuild.
2. Build the replacement on a dedicated rebuild branch.
3. Audit and reuse valuable product/media assets and proven backend configuration.
4. Rebuild the storefront architecture and design system cleanly rather than incrementally patching screenshot-specific code.
5. Keep Medusa as the canonical commerce source of truth.
6. Establish screenshot-to-route acceptance criteria before full page implementation.
7. Calibrate visual fidelity on the homepage before expanding across all customer routes.

## Immediate next actions

- Create the dedicated rebuild branch.
- Complete repository structure and asset audit.
- Create the screen registry and architecture documents.
- Establish the clean storefront foundation.

## Non-negotiable rules

- Do not destructively rewrite `main` during rebuild development.
- Do not create a second source of truth for products, prices, inventory, carts, customers, or orders.
- Do not treat mobile as a shrunken desktop layout.
- Do not implement screenshots as absolute-positioned canvases.
- Do not expose admin authorization as a client-side-only decision.
- Do not claim a phase is complete without validation evidence.

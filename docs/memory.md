# QUORIN — Working Memory

Last updated: 2026-07-15

This is durable project memory for future chats and long implementation sessions. Update it when decisions change.

## Repository

- Repository: `bazricthesorcessor-glitch/quorin-site2`
- Active branch: `quorin-v3-rebuild`
- Main existing application source is under `app/`.
- Medusa backend is under `backend/`.
- Direct GitHub path reads are preferred when connector search indexing is stale.

## Product identity

QUORIN is a premium ecommerce experience for handcrafted/creator-oriented products and creative materials. The website is being developed by Bazric for a friend.

The current product target includes:
1. premium customer storefront,
2. Medusa-backed commerce operations,
3. full QUORIN operational admin system,
4. AI-readable commerce/discovery interfaces.

## Design direction

- Premium, warm, tactile and editorial rather than generic SaaS ecommerce.
- Preserve the established QUORIN color direction unless explicitly changed.
- Desktop references guide structure and information architecture.
- Mobile must be deliberately redesigned for touch and perceived smoothness.
- Selective glassmorphism is allowed and should eventually be admin-configurable where practical.

## Data rules

- Medusa is canonical for products, variants, prices, inventory, customers, carts and orders.
- Do not fabricate policies, reviews, metrics, trust claims, profitability or stock.
- Trust is evidence-based.
- Profit requires explicit cost data.
- Reference screenshot numbers are visual examples, not production facts.

## Admin target

Admin scope includes:
- dashboard,
- orders,
- products,
- product creation/editing,
- customers,
- analytics,
- categories,
- collections,
- attributes/options,
- tags,
- campaigns,
- promotions,
- payment methods/configuration,
- shipping,
- taxes,
- profitability/raw-material costing,
- users,
- roles and permissions,
- activity logs,
- settings.

## AI commerce target

Machine clients should be able to obtain structured factual information about:
- QUORIN identity,
- catalog,
- current prices/variants,
- availability when available,
- product use cases,
- safety information,
- policies,
- reviews with provenance,
- explainable recommendations.

Public JSON endpoints alone do not guarantee automatic discovery by ChatGPT or other assistants. Public deployment, indexing, structured metadata and explicit tool/agent integrations may also be required.

## Scoring

- Original smaller storefront scope reached 90/100.
- Expanded product scope reset the score to 62/100.
- Current score: 63/100.
- Do not inflate scores for planning alone.

## Chat continuity rule

If the conversation becomes too long, tool reliability degrades, or important implementation context risks being lost, explicitly tell Bazric that it is a good time to start a new chat. Before doing so, update this file plus `phase.md`, `completed.md` and `fixed.md` so the next chat can resume from the repository itself.

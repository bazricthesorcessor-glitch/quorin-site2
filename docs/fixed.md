# QUORIN — Fix Ledger

Last updated: 2026-07-15

This file records meaningful defects and architectural problems that have been fixed. It should not become a dump of trivial edits.

## Fixed

### Repository/connector workflow
- Confirmed that direct GitHub branch reads and writes work even when repository code search or branch indexing is stale.
- Standardized continued work on branch `quorin-v3-rebuild` using direct path reads when search is unreliable.

### Scope integrity
- Corrected the earlier assumption that the project was only a storefront rebuild.
- Expanded the tracked product scope to include operational admin, analytics, governance and AI-readable commerce.
- Reset scoring rather than pretending the smaller-scope 90/100 still represented the expanded product.

### Trust/data integrity
- Established that AI-facing trust information must be evidence-based.
- Missing policy data must not be fabricated.
- Profitability must not be inferred from selling price without explicit cost data.
- Reference screenshots are used for information architecture and interaction intent, not as a source of fake production metrics.

## Pending fixes

- Reduce oversized monolithic application/admin files where decomposition improves maintainability.
- Audit all admin routes for loading, empty, error and permission states.
- Verify navigation consistency and dead routes.
- Validate backend authorization for destructive and sensitive admin operations.
- Add production build/typecheck/test confidence.

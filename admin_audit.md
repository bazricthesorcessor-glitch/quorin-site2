# Admin Center Audit Report

## Overview

`AdminCenter.tsx` (657 lines) is a full-featured admin dashboard for editing brand theme and product catalog. It is accessible only to users with `role: 'admin'` in their account profile.

---

## Access Control

| File | Line | Check |
|---|---|---|
| `App.tsx` | `317` | `if (currentAccount?.profile.role !== 'admin') return;` |

Only accounts with `profile.role === 'admin'` can toggle the admin panel via `toggleAdminMode()`.

---

## What Admin Edits

### 1. Brand Theme (7 fields)
| Field | Input Type | Storage |
|---|---|---|
| Brand name | Text input | `localStorage['quorin.theme'].brand` |
| Tagline | Text input | `localStorage['quorin.theme'].tagline` |
| Font family | Text input | `localStorage['quorin.theme'].fontFamily` |
| Accent color | Color picker | `localStorage['quorin.theme'].accent` |
| Teal glow | Color picker | `localStorage['quorin.theme'].teal` |
| Background | Color picker | `localStorage['quorin.theme'].dominant` |
| Primary text | Color picker | `localStorage['quorin.theme'].textPrimary` |
| Secondary text | Color picker | `localStorage['quorin.theme'].textSecondary` |

### 2. Categories (3 fields)
| Field | Input Type | Persistence |
|---|---|---|
| Category id | Text input (slug) | localStorage |
| Category title | Text input | localStorage |
| Category description | Textarea | localStorage |

Actions: Save category, New category, Delete category

### 3. Products (11 fields)
| Field | Input Type | Persistence |
|---|---|---|
| Name | Text input | localStorage |
| Type | Text input | localStorage |
| Variant | Text input | localStorage |
| Size | Text input | localStorage |
| Price | Number input | localStorage |
| Cost price | Number input | localStorage |
| MRP | Number input | localStorage |
| Discount | Text input | localStorage |
| Description | Textarea | localStorage |
| Image URLs | Textarea (comma-separated) | localStorage |
| Tags | Textarea (comma-separated) | localStorage |

Actions: Save item, Add item, Delete item

### 4. Bulk Operations
| Button | What it does | Lines |
|---|---|---|
| Save theme | Applies only theme changes | 635-638 |
| Save item | Saves only current product | 631-634 |
| Save category | Saves only current category | 433 |
| Save all | Applies theme + full catalog in one atomic operation | 639-642 |

---

## Data Flow & Persistence

```
AdminCenter UI (local state: draftTheme, draftCatalog)
    │
    ├── Save category ──→ onCatalogUpdate(mutator) ──→ updateCatalog() ──→ Object.assign(quorinData, nextCatalog)
    │                                                                    │
    │                                                                    ├── setCatalogVersion(v + 1) ──→ useEffect → saveCatalog(quorinData) → localStorage
    │                                                                    └── Re-render via catalogVersion
    │
    ├── Save item ──→ onCatalogUpdate(mutator) ──→ same flow as above
    │
    ├── Save theme ──→ onThemeChange(nextTheme) ──→ updateTheme() ──→ quorinData.brand/tagline = nextTheme
    │                                                    └── setTheme(nextTheme) ──→ useEffect → saveTheme(theme) → localStorage
    │
    └── Save all ──→ onThemeChange + onCatalogUpdate ──→ Both theme and catalog updated atomically
```

### Key Finding: Changes DO Persist Across Refreshes

| Data | Persisted? | Where |
|---|---|---|
| Theme (colors, brand, tagline, font) | **Yes** | `localStorage['quorin.theme']` |
| Catalog (categories, products, prices) | **Yes** | `localStorage['quorin.catalog']` |
| Accounts | **Yes** | `localStorage['quorin.accounts']` |
| Checkout locks | **Yes** | `localStorage['quorin.checkoutLocks']` |
| Custom requests | **Yes** | `localStorage['quorin.customRequests']` |
| Client fingerprint | **Yes** | `localStorage['quorin.clientFingerprint']` |

**BUT**: None of this data goes to the Medusa backend. All persistence is browser-local.

### Rehydration on Load

| File | Lines | What happens |
|---|---|---|
| `App.tsx` | `122-126` | `loadCatalog()` reads `quorin.catalog` from localStorage, then `Object.assign(quorinData, persistedCatalog)` merges it into the live product data object |
| `App.tsx` | `128` | `loadTheme()` reads persisted theme from localStorage and spreads it over `defaultTheme` |
| `App.tsx` | `296` | `saveCatalog(quorinData)` fires whenever `catalogVersion` changes |
| `App.tsx` | `300` | `saveTheme(theme)` fires whenever `theme` state changes |

**Result**: Admin changes survive page refresh via localStorage → quorinData object mutation.

---

## Draft/Save Behavior

| Feature | Details |
|---|---|
| Draft mode | Changes are held in React local state (`draftTheme`, `draftCatalog`) until explicitly saved |
| Dirty tracking | `setDirty(true)` on every field change; shows "Unsaved draft changes are active." at bottom |
| Open resets | Opening AdminCenter resets all draft state to current `quorinData` + `defaultTheme` (lines 82-92) |
| No auto-save | Must manually click "Save item", "Save category", "Save theme", or "Save all" |
| Close discards | Closing AdminCenter without saving discards all draft changes in memory (but persisted data remains in localStorage) |

---

## Scroll/UX Behavior

| Feature | Details |
|---|---|
| Body scroll lock | `document.body.style.overflow = 'hidden'` when open (line 99) |
| Lenis prevention | `data-lenis-prevent` on overlay, panel, sidebar, and content areas (lines 280, 293, 319, 440) |
| Overscroll | `document.documentElement.style.overscrollBehavior = 'none'` when open (line 100) |
| Panel z-index | `z-[60]` (above most UI elements) |
| Panel layout | 2-column: 360px sidebar (theme+category forms) + main area (product form + live preview) |
| Panel max-height | `max-h-[88vh]` with internal scrolling |

---

## Live Preview

The AdminCenter includes a live preview card showing:
- Brand name (with selected font family)
- Tagline
- Accent and teal color swatches

---

## Issues & Concerns

### 1. Direct Object Mutation
`App.tsx:306` uses `Object.assign(quorinData, nextCatalog)` to mutate the shared `quorinData` object directly. This is a singleton from `products.ts` — changes affect all consumers immediately, bypassing React's reactivity for non-admin parts of the app.

### 2. No Backend Sync
All admin changes live in localStorage only. There is no Medusa integration for:
- Writing catalog changes to backend
- Pushing theme changes to a settings endpoint
- Versioning or rollback

### 3. No Role-Based Middleware
Admin access is a client-side check (`profile.role !== 'admin'`). No server-side validation.

### 4. No Validation
- Price/MRP: No min/max bounds, no negative checks
- Discount: Free-text field (should be auto-calculated or validated)
- Tags: No deduplication, no case normalization
- Image URLs: No URL validation, no upload to storage

### 5. "Save All" Atomicity
`applyAll()` at line 264-272 calls both `onThemeChange` and `onCatalogUpdate` but these are sequential, not atomic. If `onCatalogUpdate` fails after theme is set, state is inconsistent.

---

## Summary Table

| Action | Persists to localStorage? | Persists to Medusa backend? | Survives refresh? |
|---|---|---|---|
| Save theme | Yes | No | Yes |
| Save item | Yes | No | Yes |
| Save category | Yes | No | Yes |
| Save all | Yes | No | Yes |
| Close without saving | No (in-memory draft) | No | N/A — draft lost but localStorage unchanged |

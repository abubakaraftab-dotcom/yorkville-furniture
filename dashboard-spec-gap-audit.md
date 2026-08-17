# Dashboard Specification Gap Audit

## Attached requirements to preserve

The attached reusable specification requires a local `/admin/products` dashboard with environment-configured password authentication, session-only login state, baseline products plus a Git-published dashboard overlay, safe merge behavior, stable unique IDs, pending changes count, recent exported records, add/edit/delete/hide controls, image alt text, up to three normalized images, province/city availability, province-specific CAD pricing, delivery and pickup options, bed/mattress multi-size controls, media replacement slots, and test-first deployment.

The overlay format must be separate from `src/data/products.json` and must contain `format`, `version`, `exportedAt`, `records`, and `deletedIds`. The storefront must merge the overlay over baseline products; an overlay must never replace the baseline catalogue wholesale. New IDs must not collide with baseline or prior local records. Deletes must be represented as `deletedIds` and must be reversible locally before export.

## Current implementation findings

The existing dashboard is at `/dashboard`, not `/admin/products`. It currently has a client-side password gate that accepts any non-empty password, rather than an environment-configured password. It stores catalog changes locally in `yorkville_local_catalog_v1` with only `records` and `deletedIds`; it does not yet persist `pendingIds`, `recentExportedIds`, or last export metadata. It does already merge local records over baseline products in the browser and supports local edit/delete, image normalization, media records, up to three images, colours, dimensions, categories/subcategories, and province availability fields.

The current export is a full `products` array package with a `changes` object. The import helper currently writes the exported products back into `src/data/products.json`, which violates the required baseline-plus-overlay rule and can remove baseline products if a package is incomplete. The import helper also needs a dedicated `dashboard-products.json` overlay output and a merge-aware storefront loader.

The current dashboard creates IDs using `prod-${Date.now()}` and therefore does not follow the attached numeric, collision-safe ID rule. Existing dashboard fields also need explicit image alt text, per-province price fields, per-province city selection, delivery/pickup checkboxes, and a clearer filtered catalogue behavior that starts empty until a category, subcategory, or search is selected.

The public storefront already has province/city routes, shared product location helpers, a Shop by Province header menu, product availability notices, and checkout location restrictions. These should be retained and connected to the overlay-aware catalog loader rather than rewritten unnecessarily.

## Implementation priorities

1. Add a proper `/admin/products` alias and retain `/dashboard` only as a compatibility route.
2. Add `NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD` or a local-only environment variable with `.env.example`; never commit a real password.
3. Extend local state with pending IDs, recent five exports, and export timestamp.
4. Implement stable numeric dashboard IDs above the maximum baseline/overlay ID.
5. Change export/import to `dashboard-products.json` overlay format and preserve baseline products.
6. Add missing checklist fields: alt text, stock state/count, province-specific prices, city availability, delivery/pickup, bed/mattress multi-size choices, and media slot metadata.
7. Add regression tests for merge safety, ID generation, delete behavior, province/city filtering, and checkout restrictions.
8. Keep test-first deployment and require explicit user approval before live deployment.

Source: user-provided attachment `pasted_content.txt`, lines 32–519; no external sources used.

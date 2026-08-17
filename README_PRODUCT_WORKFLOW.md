# Yorkville Furniture Product Dashboard Workflow

## Purpose

Yorkville uses a **local password-protected product dashboard** and a versioned JSON overlay. The baseline catalogue remains in `src/data/products.json`. Dashboard changes are stored in `src/data/dashboard-products.json` and are merged over the baseline by `src/lib/products.ts`. This means an overlay containing one new product never replaces or hides the existing catalogue.

## Start the dashboard locally

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_LOCAL_ADMIN_PASSWORD` to a private password. Never commit `.env.local`.
3. Run `npm install` once, then run `npm run dev`, or double-click `start-dashboard.bat` on Windows.
4. Open `http://127.0.0.1:3000/admin/products`.
5. The login is stored only in browser `sessionStorage` and is cleared when the browser session ends.

The hosted storefront does not expose this dashboard in the public header. This dashboard is intended for the administrator's local computer.

## Add or edit a product

Use **Add product** for a new record, or search by title/category/subcategory and press **Edit** for an existing one. The form includes title, description, image Alt Text, category, optional subcategory, product ID, stock state/count, dimensions in full-word inches, uploaded colour textures, bed/mattress multi-size options, province prices, city availability, delivery, pickup, and up to three product images.

A new product must have at least one selected province and a valid CAD price for every selected province. Selecting a province initially preselects its supported cities; individual cities can then be unchecked. Leave all cities selected for province-wide availability. A product is shown only on the matching province/city pages.

## Image sizes and placement

Product uploads accept JPEG, PNG, and WebP. The dashboard scales the longest edge to no more than **1600 px**, preserves aspect ratio, and uses `object-fit: contain` so furniture is not cropped. Recommended source sizes are:

| Asset | Recommended size | Dashboard behavior |
|---|---:|---|
| Product image | 1600 px maximum on the longest edge | Up to 3 images, contained without cropping |
| Hero banner | 2400 × 900 px | Stored under `public/images/Hero/` |
| Category image | 1200 × 900 px | Stored under `public/images/categories/` |
| Subcategory image | 1200 × 900 px | Stored under `public/images/subcategories/` |
| Colour texture | At least 512 × 512 px | Existing texture assets remain the source of truth |
| Logo | Transparent PNG/SVG, approximately 1200 px wide | Stored under `public/images/` |

When an exported package is imported, product images are placed under `public/images/products/{category}/{subcategory}/` with names such as `modern-sofa-01.jpg`, `modern-sofa-02.jpg`, and `modern-sofa-03.jpg`.

## Save, export, and publish

Press **Save product locally**. The record stays in browser storage and is counted under Pending changes. Press **Export update package** when the batch is ready. The download is `yorkville-dashboard-package.json`.

Copy that file into the repository root and run:

```bash
npm run import-dashboard -- yorkville-dashboard-package.json
npm run build
```

The importer writes only `src/data/dashboard-products.json` and normalized image assets. It does **not** replace `src/data/products.json`. Review `git diff`, then commit and push using GitHub Desktop or Git:

```bash
git add src/data/dashboard-products.json public/images

git commit -m "Update product catalogue from dashboard"
git push origin main
```

The existing GitHub Actions test workflow runs after the push. Review the TEST Hostinger subfolder before triggering the separate live workflow. Keep each dashboard package and GitHub commit as an audit/rollback point.

## Existing product deletion

The dashboard Delete action creates a `deletedIds` overlay entry. It does not destroy the baseline JSON. To restore a hidden baseline product later, remove its ID from the overlay or add a restore control in a future dashboard revision.

## Overlay format

```json
{
  "format": "yorkville-dashboard-catalog",
  "version": 1,
  "exportedAt": "2026-08-17T20:00:00.000Z",
  "records": {
    "1001": { "id": 1001, "title": "Example product" }
  },
  "deletedIds": []
}
```

`records` can edit a baseline product or add a new numeric ID. New IDs are generated above the numeric IDs currently present in the baseline and local overlay. The merge utility prevents duplicate additions and keeps the baseline visible.

## Regional storefront behavior

Ontario is the default storefront location. The header provides Shop by Province, province pages, and city pages. Product details show exact available provinces/cities. Checkout disables locations that do not work for every cart item and shows an availability/WhatsApp guidance message when an unavailable location is attempted. The centralized helpers in `src/lib/products.ts` support both province codes and full province names so dashboard exports remain compatible.

## Safety notes

Do not place real passwords, private FTP credentials, or private contact data in source files. Do not overwrite `src/data/products.json` with an overlay. Always run a local build and review the TEST deployment before any live release.

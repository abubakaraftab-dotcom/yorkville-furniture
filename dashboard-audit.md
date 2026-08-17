# Yorkville Dashboard Audit

## Existing architecture

Yorkville is a Next.js static-export storefront. The build produces `out/`, and GitHub Actions deploy `out/` to Hostinger via FTP. Existing workflows are `.github/workflows/deploy-test.yml` for `/public_html/test-deploy/` and `.github/workflows/deploy-live.yml` for `/public_html/`.

## Existing Yorkville data and media

Products are stored in `src/data/products.json`; category hierarchy is stored in `src/data/categories.json`. Product assets are under `public/images/`, including `public/images/products/`, `public/images/categories/`, `public/images/colours/`, `public/images/Hero/`, `public/images/hero-banner.jpg`, and brand/logo assets. Product types are defined in `src/types/product.ts`.

## Reusable Sky implementation

Sky Furniture already contains `frontend/src/pages/LocalProductDashboard.jsx` and `frontend/src/utils/localProductCatalog.js`. It provides a local-password-gated product CRUD UI, localStorage catalog overlays, product creation/edit/hide behavior, up to three image uploads, automatic image normalization to a maximum 1600-pixel longest edge, dimensions, category/subcategory selection, province/city checklists, and delivery/pickup toggles. This is a proven baseline to port and extend rather than rebuild from zero.

## Important implementation constraint

Because Yorkville is a static export, browser code cannot directly write files into the user's local Git repository or securely push to GitHub. The safe workflow should therefore support local browser drafts and JSON/image package export, plus a repository-side publish helper that a user can run to import the package, commit, push, and trigger the test workflow. Never place a GitHub token in the public storefront.

## New requested features to add beyond Sky baseline

- Yorkville visual styling matching Sky's dashboard.
- Add/edit/delete existing products, with soft delete and reset/restore behavior.
- Up to 3 product images, plus replaceable category, subcategory, colour, hero, logo, and other storefront media.
- Image placement guidance, accepted formats, recommended sizes, automatic containment/aspect-ratio fitting, and deterministic category/subcategory naming.
- Per-province and per-city delivery/pickup availability.
- Province-specific prices for the same product.
- Bed and mattress multi-select sizes: Single/Twin, Double, Queen, and King.
- Checklist-based completion and validation for title, description, dimensions, colours, stock state/count, delivery/pickup, category, subcategory, and media.
- Local package export/import to make handoff easy for non-technical operators.
- Test deploy first; live deploy remains a deliberate manual approval step.

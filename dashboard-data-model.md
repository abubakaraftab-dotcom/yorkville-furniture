# Yorkville Product Dashboard Data Model

## Product record

Every product will retain the existing Yorkville fields and add dashboard-managed fields. The dashboard will use a stable string `id` and generated `slug`; the title and description remain operator-entered text. The primary image will be the first item in `images`, while the storefront may display up to three images.

| Field | Dashboard behavior |
|---|---|
| `title` | Required free-text field. |
| `description` | Required rich multi-line text field. |
| `categorySlug` | Required selection from `src/data/categories.json`. |
| `subcategorySlug` | Required selection filtered by the chosen category. |
| `images` | Up to three uploaded images; first image is the primary image. |
| `colours` | Multi-select from the existing texture assets in `public/images/colours/`; custom colour entries may be added only with an uploaded texture. |
| `inStock` and `stockQuantity` | Required stock status and quantity; quantity is constrained to the storefront's current inventory convention. |
| `dimensions` | Required Height, Width, and Depth values entered in inches; storefront converts and displays centimetres. |
| `sizes` | Multi-select for beds and mattresses: Single/Twin, Double, Queen, King. Other categories use the normal dimension fields. |
| `deliveryOptions` | Delivery and pickup checkboxes. |
| `availability` | Province records, each with selected cities, delivery/pickup flags, and an optional province-specific price. |
| `material`, `assembly`, `deliveryEstimate` | Controlled text/options matching Yorkville storefront language: general wood terminology, ready to use/already assembled, and 1–3 days where applicable. |

## Province and city availability

Availability is modeled per province rather than as a single global list. A product appears on a province page only when that province record exists and is enabled. If cities are selected, the product is shown only for those city views; an empty city list means the product is available throughout the selected province. Each province record can carry its own CAD price, delivery flag, pickup flag, and city list, so the same product can have different prices in Ontario, Alberta, British Columbia, or Quebec.

```json
{
  "province": "ontario",
  "priceCAD": 799,
  "delivery": true,
  "pickup": true,
  "cities": ["Toronto", "Mississauga"],
  "notes": "Available for delivery in selected cities"
}
```

## Image placement and naming

Product images should be placed in `public/images/products/<category-slug>/<subcategory-slug>/`. The recommended file pattern is `<product-slug>-01.<ext>`, `<product-slug>-02.<ext>`, and `<product-slug>-03.<ext>`. The dashboard will also accept uploads directly and generate this deterministic path in the exported package. Category images belong in `public/images/categories/<category-slug>.<ext>`, subcategory images in `public/images/categories/<category-slug>/<subcategory-slug>.<ext>`, colour textures in `public/images/colours/<ColourName>.png`, and hero slides in `public/images/Hero/hero-<sequence>-<slug>.<ext>`.

| Asset type | Recommended source size | Display fitting rule |
|---|---:|---|
| Product primary/detail image | 1600 × 1600 px maximum canvas; subject may be portrait or landscape | Contain inside the product frame; never crop the furniture. |
| Product secondary image | 1600 px maximum longest edge | Contain, preserve aspect ratio. |
| Category/subcategory tile | 1200 × 900 px, 4:3 | Cover inside the tile with focal-point center. |
| Hero banner | 2400 × 900 px, approximately 8:3 | Cover, with safe text area centered-left. |
| Colour texture | 512 × 512 px square or larger | Cover the circular swatch without stretching. |
| Logo/brand image | Transparent PNG/SVG, at least 1200 px wide | Contain; preserve transparency. |

The browser dashboard will resize uploaded images to a maximum 1600-pixel longest edge while preserving aspect ratio, reject unsupported formats, and preview the exact contained result before saving. The exported package will include the normalized asset files and a manifest mapping each file to its category, subcategory, product, or storefront slot.

## Safe publishing model

Local browser storage is used for drafts and immediate storefront preview on the operator's computer. A downloadable catalog package contains `products.json`, `media-manifest.json`, and normalized images. A repository-side publish helper imports that package into the repository, validates slugs and availability, creates a branch and commit, and pushes it to GitHub. The test workflow is triggered first; the live workflow remains a separate manual approval action. No GitHub token is stored in the public dashboard.

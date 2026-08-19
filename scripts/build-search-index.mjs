// Build a client-friendly search index for site-wide + province-aware product search.
// Output: public/search-index.json (shipped with the static export).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

const baseline = JSON.parse(readFileSync(join(root, "src/data/products.json"), "utf8"));
const overlayPath = join(root, "src/data/dashboard-products.json");
let overlay = { records: {}, deletedIds: [] };
try {
  const raw = JSON.parse(readFileSync(overlayPath, "utf8"));
  overlay = raw.format === "yorkville-dashboard-catalog" ? raw : overlay;
} catch {
  // Overlay missing — use baseline only.
}

function resolveValue(record, key) {
  return record?.[key] !== undefined ? record[key] : undefined;
}

const records = {};
for (const [id, record] of Object.entries(overlay.records ?? {})) {
  records[id] = record;
}

const baselineProducts = baseline.products ?? baseline;

// Mirrors the same merge logic as src/lib/catalogMerge.ts so the client
// search index matches exactly what the storefront renders.
function mergeProducts() {
  const deleted = new Set((overlay.deletedIds || []).map(String));
  const recs = overlay.records || {};
  const baseIds = new Set(baselineProducts.map((p) => String(p.id)));
  const merged = [];
  for (const product of baselineProducts) {
    if (!product.id || deleted.has(String(product.id))) continue;
    const rec = recs[String(product.id)];
    merged.push(rec ? { ...product, ...rec } : product);
  }
  for (const [id, record] of Object.entries(recs)) {
    if (deleted.has(id) || baseIds.has(id)) continue;
    merged.push(record);
  }
  return merged;
}

function provinceCodesFor(merged) {
  // Dashboard records store provinces like { ON: { delivery:true, cities:[...], price:123 } }
  const p = merged.provinces;
  if (!p) return [];
  if (Array.isArray(p)) return p;
  return Object.keys(p).filter((code) => {
    const cfg = p[code];
    if (cfg && typeof cfg === "object") {
      if (cfg.hidden === true) return false;
      if (cfg.delivery === false && cfg.pickup === false) return false;
    }
    return true;
  });
}

const merged = mergeProducts();
const entries = [];
for (const product of merged) {
  const id = String(product.id ?? "");
  if (!id) continue;
  const images = product.images || [];
  const title = String(product.title || "").trim();
  if (!title) continue;
  entries.push({
    id,
    slug: String(product.slug || id),
    title,
    description: String(product.description || "").trim(),
    tags: Array.isArray(product.tags) ? product.tags : [],
    categorySlug: String(product.categorySlug || ""),
    subcategorySlug: String(product.subcategorySlug || ""),
    image: Array.isArray(images) && images.length ? images[0] : "",
    provinces: provinceCodesFor(product),
  });
}

// Categories taxonomy for category-aware search.
let categories = [];
try {
  const raw = JSON.parse(readFileSync(join(root, "src/data/categories.json"), "utf8"));
  categories = Array.isArray(raw) ? raw : raw.categories || [];
} catch {
  categories = [];
}

const index = {
  generatedAt: new Date().toISOString(),
  categories,
  products: entries,
};

const publicDir = join(root, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "search-index.json"), JSON.stringify(index));

console.log(`Search index built: ${entries.length} product(s), ${categories.length} categories.`);

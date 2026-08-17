#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = process.argv[2] || path.join(root, "yorkville-dashboard-package.json");
const outputPath = path.join(root, "src/data/dashboard-products.json");

if (!fs.existsSync(packagePath)) {
  console.error(`Dashboard package not found: ${packagePath}`);
  console.error("Download yorkville-dashboard-package.json from /admin/products and place it in the repository root.");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const records = payload.records || payload.changes?.records;
if (!records || typeof records !== "object") throw new Error("Invalid dashboard package: records object is missing.");

const decodeDataUrl = (dataUrl) => {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
};
const extension = (mime) => mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
const slugify = (value) => String(value || "asset").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const safeName = (value, fallback) => path.basename(String(value || fallback)).replace(/[^a-zA-Z0-9._-]/g, "-");
let mediaCount = 0;

const publishedRecords = {};
for (const [id, rawRecord] of Object.entries(records)) {
  const record = { ...rawRecord };
  const productSlug = slugify(record.slug || record.title || id);
  const category = slugify(record.categorySlug || "uncategorized");
  const subcategory = slugify(record.subcategorySlug || "general");
  const directory = path.join(root, "public/images/products", category, subcategory);
  fs.mkdirSync(directory, { recursive: true });
  const imagePaths = [];
  for (let index = 0; index < (record.images || []).length && index < 3; index += 1) {
    const decoded = decodeDataUrl(record.images[index]);
    if (!decoded) { imagePaths.push(record.images[index]); continue; }
    const filename = `${productSlug}-${String(index + 1).padStart(2, "0")}.${extension(decoded.mime)}`;
    fs.writeFileSync(path.join(directory, filename), decoded.buffer);
    imagePaths.push(`/images/products/${category}/${subcategory}/${filename}`);
    mediaCount += 1;
  }
  if (imagePaths.length) record.images = imagePaths;
  publishedRecords[String(id)] = record;
}

const overlay = {
  format: "yorkville-dashboard-catalog",
  version: 1,
  exportedAt: payload.exportedAt || payload.generatedAt || new Date().toISOString(),
  records: publishedRecords,
  deletedIds: (payload.deletedIds || payload.changes?.deletedIds || []).map(String),
};
fs.writeFileSync(outputPath, `${JSON.stringify(overlay, null, 2)}\n`);

for (const media of payload.media || []) {
  const decoded = decodeDataUrl(media.dataUrl);
  if (!decoded) continue;
  const slot = media.slot || "category";
  const directory = slot === "hero" ? "public/images/Hero" : slot === "logo" ? "public/images" : slot === "subcategory" ? "public/images/subcategories" : "public/images/categories";
  const filename = safeName(media.path, `${slugify(media.title)}.${extension(decoded.mime)}`);
  fs.mkdirSync(path.join(root, directory), { recursive: true });
  fs.writeFileSync(path.join(root, directory, filename), decoded.buffer);
  mediaCount += 1;
}

console.log(`Published ${Object.keys(publishedRecords).length} dashboard records to src/data/dashboard-products.json.`);
console.log(`Wrote ${mediaCount} normalized image/media files without replacing baseline products.json.`);
console.log("Next steps: review git diff, run npm run build, commit the overlay and assets, then use the TEST deployment workflow.");

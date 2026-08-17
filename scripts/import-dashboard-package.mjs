#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = process.argv[2] || path.join(root, "yorkville-dashboard-package.json");
if (!fs.existsSync(packagePath)) {
  console.error(`Dashboard package not found: ${packagePath}`);
  console.error("Download yorkville-dashboard-package.json from /dashboard and place it in the repository root, then run: npm run import-dashboard -- yorkville-dashboard-package.json");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(packagePath, "utf8"));
if (!Array.isArray(payload.products)) throw new Error("Invalid dashboard package: products array is missing.");
const dataFile = path.join(root, "src/data/products.json");
const current = JSON.parse(fs.readFileSync(dataFile, "utf8"));
const deletedIds = new Set((payload.changes?.deletedIds || []).map(String));
const products = payload.products.filter((product) => !deletedIds.has(String(product.id)));
fs.writeFileSync(dataFile, `${JSON.stringify({ products }, null, 2)}\n`);

const decodeDataUrl = (dataUrl) => {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(dataUrl || "");
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
};
const extension = (mime) => mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
let mediaCount = 0;
for (const product of products) {
  const productSlug = product.slug || String(product.id);
  const category = product.categorySlug || "uncategorized";
  const subcategory = product.subcategorySlug || "general";
  const directory = path.join(root, "public/images/products", category, subcategory);
  fs.mkdirSync(directory, { recursive: true });
  const imagePaths = [];
  for (let index = 0; index < (product.images || []).length && index < 3; index += 1) {
    const decoded = decodeDataUrl(product.images[index]);
    if (!decoded) { imagePaths.push(product.images[index]); continue; }
    const filename = `${productSlug}-${String(index + 1).padStart(2, "0")}.${extension(decoded.mime)}`;
    const absolute = path.join(directory, filename);
    fs.writeFileSync(absolute, decoded.buffer);
    const publicPath = `/images/products/${category}/${subcategory}/${filename}`;
    imagePaths.push(publicPath);
    mediaCount += 1;
  }
  product.images = imagePaths;
}
fs.writeFileSync(dataFile, `${JSON.stringify({ products }, null, 2)}\n`);

for (const media of payload.media || []) {
  const decoded = decodeDataUrl(media.dataUrl);
  if (!decoded) continue;
  const safeName = path.basename(media.path || `${media.id}.${extension(decoded.mime)}`);
  const relative = media.slot === "hero" ? path.join("public/images/Hero", safeName) : path.join("public/images/categories", safeName);
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), decoded.buffer);
  mediaCount += 1;
}

console.log(`Imported ${products.length} products from ${current.products.length} base products.`);
console.log(`Wrote ${mediaCount} normalized image/media files.`);
console.log("Next steps: review git diff, run npm run build, commit to a branch, and open/merge the pull request to trigger the test deployment.");

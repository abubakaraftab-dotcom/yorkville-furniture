#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ---- Robust package path resolution ----
// 1. Use the explicit path argument if it exists on disk (spaces/parentheses are fine).
// 2. If the argument is missing or wrong, automatically hunt the newest
//    "yorkville-dashboard-package*.json" in the user's Downloads folder
//    (handles "(2)", "(5)" etc. naming automatically).
// 3. Fall back to a repo-root copy.
function findCandidateFiles(folder) {
  if (!fs.existsSync(folder)) return [];
  return fs
    .readdirSync(folder)
    .filter((name) => /^yorkville-dashboard-package.*\.json$/i.test(name))
    .map((name) => path.join(folder, name))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
}

let packagePath = null;
const explicit = process.argv[2] ? process.argv[2].trim().replace(/^"(.*)"$/, "$1") : null;
if (explicit) {
  if (fs.existsSync(explicit)) {
    packagePath = explicit;
  } else {
    console.log(`Given path not found: ${explicit}. Auto-searching instead...`);
  }
}
if (!packagePath) {
  const downloads = path.join(
    process.env.USERPROFILE || process.env.HOME || "",
    "Downloads",
  );
  const found = findCandidateFiles(downloads)[0];
  if (found) {
    packagePath = found;
    console.log(`Found dashboard package automatically in your Downloads folder:`);
  } else {
    const repoCopy = path.join(root, "yorkville-dashboard-package.json");
    if (fs.existsSync(repoCopy)) {
      packagePath = repoCopy;
      console.log(`Using dashboard package from the repository root:`);
    }
  }
}
if (!packagePath) {
  console.error("");
  console.error("Dashboard package not found anywhere.");
  console.error("");
  console.error("How to fix (30 seconds):");
  console.error(" 1. Open your dashboard at http://localhost:3000/admin/products/");
  console.error(" 2. Add / edit a product, press 'Save product locally' (green tick must appear)");
  console.error(" 3. Press 'Export update package' - a json file will download to your Downloads folder");
  console.error(" 4. Come back to this PowerShell window and run the same command again.");
  console.error("    (npm run import-dashboard works WITHOUT typing any file name.)");
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(packagePath, "utf8"));
console.log(`Importing: ${packagePath}`);
console.log(`   (${(fs.statSync(packagePath).size / 1024).toFixed(1)} KB, newest file from: ${new Date(fs.statSync(packagePath).mtimeMs).toLocaleString()})`);

// ---- Accept BOTH the current format and the legacy format ----
// Current:  { format, version, exportedAt, records, deletedIds, media }
// Legacy 1: { version, generatedAt, products: { id: record }, changes, media, instructions }
// Legacy 2: { version, changes: { id: { record } | deletedIds }, media }
const outputPath = path.join(root, "src/data/dashboard-products.json");
let records = payload.records;
let deletedIds = payload.deletedIds || [];

if (!records && payload.changes && typeof payload.changes === "object") {
  const legacyProductIds = Object.keys(payload.changes).filter((key) => key !== "deletedIds");
  if (legacyProductIds.length) {
    console.log("Legacy dashboard package detected (" + legacyProductIds.length + " product(s)). Converting to the current format automatically.");
    records = {};
    for (const id of legacyProductIds) {
      const entry = payload.changes[id];
      records[String(id)] = entry && typeof entry === "object" ? (entry.record || entry) : entry;
    }
    deletedIds = payload.changes.deletedIds || [];
  }
} else if (!records && payload.products && typeof payload.products === "object") {
  const keys = Object.keys(payload.products).filter((key) => key !== "deletedIds");
  console.log("Legacy dashboard package detected (" + keys.length + " product(s)). Converting to the current format automatically.");
  records = {};
  for (const key of keys) {
    const entry = payload.products[key];
    records[String(key)] = entry && typeof entry === "object" ? (entry.record || entry) : entry;
  }
  deletedIds = payload.changes?.deletedIds || payload.products.deletedIds || [];
}

const recordCount = records && typeof records === "object" ? Object.keys(records).length : 0;
const mediaCountInPackage = (payload.media || []).length;
const format = payload.format || (payload.products ? "legacy" : "unknown");
const version = payload.version;
console.log(`Package format: ${format} version ${version}, records: ${recordCount}, media slots: ${mediaCountInPackage}`);
if (!records || typeof records !== "object" || recordCount === 0) {
  if (mediaCountInPackage > 0) {
    console.log("No product records found in this package, but media slots were exported. Processing media only.");
  } else {
    console.error("");
    console.error("This package has no product records.");
    console.error("");
    console.error("Most likely reason: the product was NOT saved before export.");
    console.error("On the dashboard, 'Pending changes' must show 1 or more before pressing 'Export update package'.");
    console.error("");
    console.error("Quick retry:");
    console.error(" 1. On the dashboard click the product under 'Recent exported products' (Edit ID)");
    console.error(" 2. Press 'Save product locally' and wait for the green tick");
    console.error(" 3. Press 'Export update package' (a newer json will download)");
    console.error(" 4. Run this command again - the newest file is picked up automatically.");
    process.exit(1);
  }
}

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
  deletedIds: deletedIds.map(String),
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

console.log("");
console.log("=== IMPORT SUCCESSFUL ===");
console.log(`Published ${Object.keys(publishedRecords).length} dashboard record(s) to src/data/dashboard-products.json`);
console.log(`Wrote ${mediaCount} image/media file(s). Baseline products.json is untouched.`);
console.log("Next: build, then commit src/data/dashboard-products.json + public/images to GitHub.");
console.log("===========================");

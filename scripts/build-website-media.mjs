/* eslint-disable no-console */
// Generates src/data/website-media.json: a static inventory of changeable
// storefront media slots (hero, logo, province hero images, category images).
// Dashboard renders these with live previews so the operator can replace any
// of them from the dashboard. Product images live under public/images/products
// and are managed per product, so they are excluded here.

import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const imagesRoot = path.join(repoRoot, "public", "images");
const outFile = path.join(repoRoot, "src", "data", "website-media.json");

const slots = [
  {
    group: "Hero banners",
    title: "Main hero banner",
    slot: "hero-banner",
    path: "hero-banner.jpg",
  },
  {
    group: "Hero banners",
    title: "Hero image (alternate slot)",
    slot: "hero-alt",
    path: "Hero.png",
  },
  {
    group: "Hero banners",
    title: "Hero furniture image",
    slot: "hero-furniture",
    path: "Hero/hero-furniture.jpg",
  },
  {
    group: "Hero banners",
    title: "Ontario hero image",
    slot: "province-ontario",
    path: "provinces/on.jpg",
  },
  {
    group: "Hero banners",
    title: "Quebec hero image",
    slot: "province-quebec",
    path: "provinces/qc.jpg",
  },
  {
    group: "Hero banners",
    title: "British Columbia hero image",
    slot: "province-british-columbia",
    path: "provinces/bc.jpg",
  },
  {
    group: "Hero banners",
    title: "Alberta hero image",
    slot: "province-alberta",
    path: "provinces/ab.jpg",
  },
  {
    group: "Brand",
    title: "Primary logo",
    slot: "logo",
    path: "logo.png",
  },
  {
    group: "Brand",
    title: "Transparent logo",
    slot: "logo-transparent",
    path: "logo-transparent.png",
  },
  {
    group: "Brand",
    title: "Full brand logo",
    slot: "brand-full",
    path: "brand/brand-logo-full.png",
  },
];

// Discover every category image so each can be replaced individually.
const categoriesDir = path.join(imagesRoot, "categories");
const categoryFiles = fs
  .readdirSync(categoriesDir)
  .filter((file) => /\.(jpe?g|png|webp|avif)$/i.test(file))
  .map((file) => ({
    group: "Category images",
    title: file
      .replace(/\.(jpe?g|png|webp|avif)$/i, "")
      .replaceAll("-", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    slot: `category-${file.toLowerCase().replace(/\s+/g, "-")}`,
    path: `categories/${file}`,
  }));

const media = [...slots, ...categoryFiles];

fs.writeFileSync(outFile, JSON.stringify({ media }, null, 2) + "\n");
console.log(
  `Wrote ${media.length} media slots to src/data/website-media.json`,
);

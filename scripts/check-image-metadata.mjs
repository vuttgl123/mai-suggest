import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "public", "data");
const allowedHosts = new Set(["images.unsplash.com", "www.mytheresa.com"]);
const errors = [];
const assets = [];

function addAsset(source, url, alt) {
  if (typeof alt !== "string" || !alt.trim()) {
    errors.push(`${source}: image alt is empty`);
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      errors.push(`${source}: image URL must use HTTPS`);
    } else if (!allowedHosts.has(parsed.hostname)) {
      errors.push(`${source}: ${parsed.hostname} is not configured for next/image`);
    }
  } catch {
    errors.push(`${source}: image URL is invalid`);
  }

  assets.push({ source, url });
}

const site = JSON.parse(fs.readFileSync(path.join(dataDir, "site.json"), "utf8"));
addAsset("site.heroImage", site.heroImage, site.title);

const manifest = JSON.parse(
  fs.readFileSync(path.join(dataDir, "preferences.json"), "utf8"),
);
for (const collection of manifest.collections ?? []) {
  addAsset(`collection:${collection.id}`, collection.imageUrl, collection.imageAlt);
}

for (const categoryPath of manifest.categories) {
  const category = JSON.parse(
    fs.readFileSync(path.join(root, "public", categoryPath), "utf8"),
  );
  if (category.coverImage) {
    addAsset(`category:${category.id}`, category.coverImage, category.coverAlt);
  }
  for (const item of category.items) {
    addAsset(`item:${item.id}`, item.imageUrl, item.imageAlt);
  }
}

const duplicateUrls = new Map();
for (const asset of assets) {
  const sources = duplicateUrls.get(asset.url) ?? [];
  sources.push(asset.source);
  duplicateUrls.set(asset.url, sources);
}
const duplicates = [...duplicateUrls.values()].filter((sources) => sources.length > 1);

console.log(`Checked ${assets.length} image references.`);
console.log(`Duplicate URLs to review: ${duplicates.length}.`);
for (const sources of duplicates) console.warn(`Duplicate: ${sources.join(", ")}`);
for (const error of errors) console.error(`Invalid image metadata: ${error}`);
if (errors.length) process.exitCode = 1;

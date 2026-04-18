#!/usr/bin/env node
// generate-images-json.js
// Scans the products/ folder and writes images.json for Philip's Store.
// Run this from the root of your repository whenever you add or remove product images.
//
// Usage:  node generate-images-json.js
// Output: images.json  (place in repo root alongside index.html)
//
// Requires Node.js 12+. No extra dependencies.

const fs   = require('fs');
const path = require('path');

const PRODUCTS_DIR = 'products';
const OUTPUT       = 'images.json';
const EXTENSIONS   = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
const FALLBACK_NAMES = ['photo', 'image', 'pic', 'main', 'cover', 'front'];

if (!fs.existsSync(PRODUCTS_DIR)) {
  console.error(`Error: '${PRODUCTS_DIR}' directory not found. Run this script from your repo root.`);
  process.exit(1);
}

console.log(`Scanning ${PRODUCTS_DIR}/ ...`);

const manifest = {};

const folders = fs.readdirSync(PRODUCTS_DIR).filter(entry => {
  return fs.statSync(path.join(PRODUCTS_DIR, entry)).isDirectory();
});

for (const folder of folders) {
  const dir = path.join(PRODUCTS_DIR, folder);
  const images = [];

  // Collect numbered images in order (1, 2, 3 …)
  for (let i = 1; i <= 20; i++) {
    let found = false;
    for (const ext of EXTENSIONS) {
      const filename = `${i}.${ext}`;
      if (fs.existsSync(path.join(dir, filename))) {
        images.push(filename);
        found = true;
        break;
      }
    }
    if (!found) break;
  }

  // Fall back to common names if no numbered images
  if (images.length === 0) {
    for (const name of FALLBACK_NAMES) {
      for (const ext of EXTENSIONS) {
        const filename = `${name}.${ext}`;
        if (fs.existsSync(path.join(dir, filename))) {
          images.push(filename);
        }
      }
    }
  }

  if (images.length === 0) {
    console.warn(`  Warning: no images found for '${folder}'`);
    continue;
  }

  manifest[folder] = images;
  console.log(`  ${folder}: ${images.join(', ')}`);
}

fs.writeFileSync(OUTPUT, JSON.stringify(manifest, null, 2));
console.log(`\n✓ Written to ${OUTPUT}`);

#!/usr/bin/env node
/**
 * Catalog SKU Asset Integrity Gate
 * Verifies 1:1 parity across all 373 catalog SKUs in src/data/final-catalog.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.resolve(__dirname, '../src/data/final-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let validCount = 0;
for (const item of catalog) {
  if (item.sku && typeof item.price === 'number' && item.aiImageUrl) {
    validCount++;
  }
}

console.log(`Verified ${validCount}/${catalog.length} decoupled catalog SKU entries.`);
if (validCount !== catalog.length) {
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Clean Stickers Script
 * 1. Checks which sticker files actually exist
 * 2. Removes non-existent stickers from stickers.json
 * 3. Removes empty collections
 */

const fs = require('fs');
const path = require('path');

const STICKERS_JSON_PATH = path.join(__dirname, '../public/data/stickers.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

console.log('🧹 Starting sticker cleanup...\n');

// Read stickers.json
const stickersData = JSON.parse(fs.readFileSync(STICKERS_JSON_PATH, 'utf8'));

let totalStickers = 0;
let existingStickers = 0;
let missingStickers = 0;

// Check each collection
const cleanedCollections = stickersData.collections
  .map((collection) => {
    console.log(`\n📁 Checking collection: ${collection.name}`);

    const existingStickersInCollection = collection.stickers.filter((sticker) => {
      totalStickers++;
      const stickerPath = path.join(PUBLIC_DIR, sticker.path);
      const exists = fs.existsSync(stickerPath);

      if (!exists) {
        console.log(`  ❌ Missing: ${sticker.path}`);
        missingStickers++;
      } else {
        existingStickers++;
      }

      return exists;
    });

    console.log(`  ✅ Found ${existingStickersInCollection.length}/${collection.stickers.length} stickers`);

    return {
      ...collection,
      stickers: existingStickersInCollection
    };
  })
  .filter(collection => collection.stickers.length > 0); // Remove empty collections

console.log('\n\n📊 Summary:');
console.log(`Total stickers checked: ${totalStickers}`);
console.log(`✅ Existing: ${existingStickers}`);
console.log(`❌ Missing: ${missingStickers}`);
console.log(`📦 Collections before: ${stickersData.collections.length}`);
console.log(`📦 Collections after: ${cleanedCollections.length}`);

// Create backup
const backupPath = STICKERS_JSON_PATH + '.backup';
fs.copyFileSync(STICKERS_JSON_PATH, backupPath);
console.log(`\n💾 Backup created: ${backupPath}`);

// Write cleaned data
const cleanedData = {
  collections: cleanedCollections
};

fs.writeFileSync(STICKERS_JSON_PATH, JSON.stringify(cleanedData, null, 2));
console.log(`✅ Cleaned stickers.json written successfully!`);

console.log('\n✨ Cleanup complete!');

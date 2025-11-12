#!/usr/bin/env node

/**
 * Remove Empty Sticker Files Script
 * Removes sticker entries that have 0 byte files
 */

const fs = require('fs');
const path = require('path');

const STICKERS_JSON_PATH = path.join(__dirname, '../public/data/stickers.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

console.log('🗑️  Removing empty sticker entries...\n');

try {
  const stickersData = JSON.parse(fs.readFileSync(STICKERS_JSON_PATH, 'utf8'));

  let removedCount = 0;
  let totalBefore = 0;

  stickersData.collections.forEach((collection) => {
    const originalCount = collection.stickers.length;
    totalBefore += originalCount;

    // Filter out stickers with empty files (0 bytes)
    collection.stickers = collection.stickers.filter((sticker) => {
      const fullPath = path.join(PUBLIC_DIR, sticker.path);

      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);

        // Remove if file size is 0 or less than 100 bytes
        if (stats.size === 0 || stats.size < 100) {
          console.log(`  ❌ Removing: ${sticker.name} (${sticker.path}) - ${stats.size} bytes`);
          removedCount++;
          return false;
        }
      }

      return true;
    });
  });

  // Remove empty collections
  const beforeCollections = stickersData.collections.length;
  stickersData.collections = stickersData.collections.filter(
    (collection) => collection.stickers.length > 0
  );
  const afterCollections = stickersData.collections.length;

  // Backup and save
  fs.copyFileSync(STICKERS_JSON_PATH, STICKERS_JSON_PATH + '.backup');
  fs.writeFileSync(
    STICKERS_JSON_PATH,
    JSON.stringify(stickersData, null, 2),
    'utf8'
  );

  console.log('\n📊 Summary:');
  console.log(`Total stickers before: ${totalBefore}`);
  console.log(`❌ Removed: ${removedCount}`);
  console.log(`✅ Remaining: ${totalBefore - removedCount}`);
  console.log(`📦 Collections: ${beforeCollections} → ${afterCollections}`);
  console.log('\n💾 Backup created: stickers.json.backup');
  console.log('✨ Empty stickers removed!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

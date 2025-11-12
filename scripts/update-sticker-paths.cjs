#!/usr/bin/env node

/**
 * Update Sticker Paths Script
 * Changes all .jpg/.jpeg paths to .png in stickers.json
 */

const fs = require('fs');
const path = require('path');

const STICKERS_JSON_PATH = path.join(__dirname, '../public/data/stickers.json');

console.log('🔄 Updating sticker paths from JPG to PNG...\n');

try {
  // Read stickers.json
  const stickersData = JSON.parse(fs.readFileSync(STICKERS_JSON_PATH, 'utf8'));

  let updatedCount = 0;

  // Update all paths
  stickersData.collections.forEach((collection) => {
    collection.stickers.forEach((sticker) => {
      // Check if path ends with .jpg or .jpeg (case insensitive)
      if (/\.(jpg|jpeg)$/i.test(sticker.path)) {
        // Replace .jpg/.jpeg with .png
        sticker.path = sticker.path.replace(/\.(jpg|jpeg)$/i, '.png');
        updatedCount++;
      }
    });
  });

  // Write back to file with proper formatting
  fs.writeFileSync(
    STICKERS_JSON_PATH,
    JSON.stringify(stickersData, null, 2),
    'utf8'
  );

  console.log(`✅ Updated ${updatedCount} sticker paths from JPG/JPEG to PNG`);
  console.log(`📁 File saved: ${STICKERS_JSON_PATH}`);
  console.log('\n✨ Path update complete!');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

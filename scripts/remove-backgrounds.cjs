#!/usr/bin/env node

/**
 * Remove White Backgrounds from Stickers
 * Converts white backgrounds to transparent
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STICKERS_JSON_PATH = path.join(__dirname, '../public/data/stickers.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

console.log('🎨 Background Removal Script\n');

// Check if sharp is installed
try {
  require.resolve('sharp');
  console.log('✅ sharp library found\n');
} catch (e) {
  console.log('📦 Installing sharp library...');
  try {
    execSync('npm install sharp', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Failed to install sharp. Please run: npm install sharp');
    process.exit(1);
  }
}

const sharp = require('sharp');

// Read stickers.json
const stickersData = JSON.parse(fs.readFileSync(STICKERS_JSON_PATH, 'utf8'));

let processed = 0;
let skipped = 0;
let errors = 0;

async function removeWhiteBackground(imagePath) {
  try {
    const fullPath = path.join(PUBLIC_DIR, imagePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`  ⏭️  Skipped (not found): ${imagePath}`);
      skipped++;
      return;
    }

    // Create backup directory
    const backupDir = path.join(path.dirname(fullPath), 'originals');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup original
    const backupPath = path.join(backupDir, path.basename(fullPath));
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(fullPath, backupPath);
    }

    // Process image
    const image = sharp(fullPath);
    const metadata = await image.metadata();

    // Convert white to transparent
    await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        const threshold = 240; // Adjust this to control what counts as "white"

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is close to white, make it transparent
          if (r >= threshold && g >= threshold && b >= threshold) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        return sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
          .png()
          .toFile(fullPath);
      });

    console.log(`  ✅ Processed: ${imagePath}`);
    processed++;
  } catch (error) {
    console.error(`  ❌ Error processing ${imagePath}:`, error.message);
    errors++;
  }
}

async function processAllStickers() {
  console.log('🔄 Processing stickers...\n');

  for (const collection of stickersData.collections) {
    console.log(`\n📁 ${collection.name}`);

    for (const sticker of collection.stickers) {
      await removeWhiteBackground(sticker.path);
    }
  }

  console.log('\n\n📊 Summary:');
  console.log(`✅ Processed: ${processed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('\n💾 Original images backed up in ./originals/ folders');
  console.log('\n✨ Background removal complete!');
}

processAllStickers().catch(console.error);

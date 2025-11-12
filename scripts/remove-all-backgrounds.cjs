#!/usr/bin/env node

/**
 * Advanced Background Removal Script
 * Removes ALL backgrounds (white, colored, etc.)
 * Works better than simple white removal
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const STICKERS_JSON_PATH = path.join(__dirname, '../public/data/stickers.json');
const PUBLIC_DIR = path.join(__dirname, '../public');

console.log('🎨 Advanced Background Removal (All Colors)\n');

let processed = 0;
let skipped = 0;
let errors = 0;

async function removeAllBackgrounds(imagePath) {
  try {
    const fullPath = path.join(PUBLIC_DIR, imagePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`  ⏭️  Skipped (not found): ${imagePath}`);
      skipped++;
      return;
    }

    // Create backup directory
    const backupDir = path.join(path.dirname(fullPath), 'originals-full');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup original
    const backupPath = path.join(backupDir, path.basename(fullPath));
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(fullPath, backupPath);
    }

    // Get image data
    const image = sharp(fullPath);
    const metadata = await image.metadata();

    // Method 1: Edge-based background removal
    // This works better for complex backgrounds
    const buffer = await image
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = buffer;
    const width = info.width;
    const height = info.height;

    // Detect background color from corners
    const corners = [
      { x: 0, y: 0 }, // Top-left
      { x: width - 1, y: 0 }, // Top-right
      { x: 0, y: height - 1 }, // Bottom-left
      { x: width - 1, y: height - 1 } // Bottom-right
    ];

    let bgColors = corners.map(({ x, y }) => {
      const idx = (y * width + x) * 4;
      return {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2]
      };
    });

    // Average background color
    const avgBg = {
      r: Math.round(bgColors.reduce((sum, c) => sum + c.r, 0) / bgColors.length),
      g: Math.round(bgColors.reduce((sum, c) => sum + c.g, 0) / bgColors.length),
      b: Math.round(bgColors.reduce((sum, c) => sum + c.b, 0) / bgColors.length)
    };

    // Remove similar colors with tolerance
    const tolerance = 60; // Adjust this for more/less aggressive removal

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate color difference
      const diff = Math.sqrt(
        Math.pow(r - avgBg.r, 2) +
        Math.pow(g - avgBg.g, 2) +
        Math.pow(b - avgBg.b, 2)
      );

      // If color is similar to background, make transparent
      if (diff < tolerance) {
        data[i + 3] = 0; // Set alpha to 0
      }

      // Also remove pure white and near-white
      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0;
      }
    }

    // Save processed image
    await sharp(data, {
      raw: {
        width: width,
        height: height,
        channels: 4
      }
    })
      .png()
      .toFile(fullPath.replace(/\.(jpg|jpeg)$/i, '.png'));

    // If original was JPG, delete it and update path
    if (/\.(jpg|jpeg)$/i.test(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`  ✅ Converted & Processed: ${imagePath} (JPG → PNG)`);
    } else {
      console.log(`  ✅ Processed: ${imagePath}`);
    }

    processed++;
  } catch (error) {
    console.error(`  ❌ Error: ${imagePath} - ${error.message}`);
    errors++;
  }
}

async function processAllStickers() {
  const stickersData = JSON.parse(fs.readFileSync(STICKERS_JSON_PATH, 'utf8'));

  console.log('🔄 Processing all stickers...\n');

  for (const collection of stickersData.collections) {
    console.log(`\n📁 ${collection.name}`);

    for (const sticker of collection.stickers) {
      await removeAllBackgrounds(sticker.path);
    }
  }

  console.log('\n\n📊 Summary:');
  console.log(`✅ Processed: ${processed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('\n💾 Original images backed up in ./originals-full/ folders');
  console.log('\n✨ Advanced background removal complete!');
}

processAllStickers().catch(console.error);

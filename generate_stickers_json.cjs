#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = '/home/zubii/Desktop/stachecups/public';
const outputFile = path.join(publicDir, 'data', 'stickers.json');

// Helper to recursively get all files
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);

    // Skip __MACOSX and hidden files
    if (file.startsWith('__MACOSX') || file.startsWith('.')) return;

    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      // Only include image files
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext)) {
        fileList.push(filePath);
      }
    }
  });

  return fileList;
}

// Generate collection tags based on path
function getCollectionTags(filePath) {
  const tags = [];

  if (filePath.includes('/stickers/general/')) {
    tags.push('general', 'shared');
  } else if (filePath.includes('/stickers/greek/')) {
    tags.push('greek');

    // Add specific greek organization tag
    const match = filePath.match(/\/greek\/([^\/]+)\//);
    if (match) {
      tags.push(match[1].toLowerCase());
    }
  } else if (filePath.includes('/stickers/furman/')) {
    tags.push('furman');
  }

  return tags;
}

// Get category from path
function getCategory(filePath) {
  // Extract category from path
  const parts = filePath.split('/');

  // Find category name
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === 'general' || parts[i] === 'greek' || parts[i] === 'furman') {
      // Next part is usually the category
      if (i + 1 < parts.length) {
        return parts[i + 1]
          .replace(/ Stickers?/gi, '')
          .replace(/_/g, ' ')
          .trim();
      }
    }
  }

  return 'Uncategorized';
}

// Generate descriptive tags from filename
function getDescriptiveTags(filename) {
  const tags = [];
  const name = filename
    .replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, '')
    .replace(/[-_]/g, ' ')
    .toLowerCase();

  // Common keywords
  const keywords = [
    'cat', 'dog', 'animal', 'book', 'coffee', 'food', 'drink', 'travel',
    'nature', 'flower', 'tree', 'sport', 'holiday', 'pride', 'love',
    'christmas', 'halloween', 'valentine', 'birthday', 'party'
  ];

  keywords.forEach(keyword => {
    if (name.includes(keyword)) {
      tags.push(keyword);
    }
  });

  return tags;
}

console.log('🔍 Scanning asset directories...\n');

const stickers = {
  collections: []
};

// Scan General Collection
console.log('📁 Scanning General collection...');
const generalFiles = getAllFiles(path.join(publicDir, 'stickers', 'general'));
const generalCategories = {};

generalFiles.forEach(filePath => {
  const category = getCategory(filePath);
  const relativePath = filePath.replace(publicDir, '');
  const filename = path.basename(filePath);
  const id = path.basename(filePath, path.extname(filePath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  if (!generalCategories[category]) {
    generalCategories[category] = [];
  }

  generalCategories[category].push({
    id,
    path: relativePath,
    name: filename.replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, ''),
    tags: [...new Set([...getCollectionTags(filePath), ...getDescriptiveTags(filename)])]
  });
});

Object.keys(generalCategories).forEach(categoryName => {
  stickers.collections.push({
    id: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: categoryName,
    collection: 'general',
    stickers: generalCategories[categoryName]
  });
});

console.log(`✅ Found ${generalFiles.length} general stickers in ${Object.keys(generalCategories).length} categories`);

// Scan Greek Collection
console.log('\n📁 Scanning Greek Life collection...');
const greekFiles = getAllFiles(path.join(publicDir, 'stickers', 'greek'));
const greekOrgs = {};

greekFiles.forEach(filePath => {
  const match = filePath.match(/\/greek\/([^\/]+)\//);
  const org = match ? match[1] : 'Other';
  const relativePath = filePath.replace(publicDir, '');
  const filename = path.basename(filePath);
  const id = path.basename(filePath, path.extname(filePath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  if (!greekOrgs[org]) {
    greekOrgs[org] = [];
  }

  greekOrgs[org].push({
    id,
    path: relativePath,
    name: filename.replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, ''),
    tags: getCollectionTags(filePath)
  });
});

Object.keys(greekOrgs).forEach(orgName => {
  stickers.collections.push({
    id: orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    name: orgName.replace(/-/g, ' '),
    collection: 'greek',
    stickers: greekOrgs[orgName]
  });
});

console.log(`✅ Found ${greekFiles.length} Greek Life assets in ${Object.keys(greekOrgs).length} organizations`);

// Scan Furman Collection
console.log('\n📁 Scanning Furman collection...');
const furmanFiles = getAllFiles(path.join(publicDir, 'stickers', 'furman'));
const furmanAssets = [];

furmanFiles.forEach(filePath => {
  const relativePath = filePath.replace(publicDir, '');
  const filename = path.basename(filePath);
  const id = path.basename(filePath, path.extname(filePath))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  furmanAssets.push({
    id,
    path: relativePath,
    name: filename.replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, ''),
    tags: getCollectionTags(filePath)
  });
});

if (furmanAssets.length > 0) {
  stickers.collections.push({
    id: 'furman-university',
    name: 'Furman University',
    collection: 'furman',
    stickers: furmanAssets
  });

  console.log(`✅ Found ${furmanAssets.length} Furman assets`);
}

// Write to file
console.log('\n💾 Writing to', outputFile);
fs.writeFileSync(outputFile, JSON.stringify(stickers, null, 2));

console.log('\n✅ Successfully generated stickers.json!');
console.log(`📊 Total: ${generalFiles.length + greekFiles.length + furmanFiles.length} assets across ${stickers.collections.length} categories`);

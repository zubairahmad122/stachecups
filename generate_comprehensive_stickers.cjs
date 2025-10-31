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

    // Skip __MACOSX, hidden files, and non-image files at root
    if (file.startsWith('__MACOSX') || file.startsWith('.') || file.endsWith('.psd')) return;

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
  const relativePath = filePath.replace(publicDir, '');

  // Dynasty, Rae, Need to Be Stickered = General only
  if (relativePath.includes('/stickers/Dynasty/') ||
      relativePath.includes('/stickers/Rae/') ||
      relativePath.includes('/stickers/Need to Be Stickered/')) {
    tags.push('general');
  }

  // Anastasia (except Furman subfolder) = General only
  else if (relativePath.includes('/stickers/anastasia water color/')) {
    if (relativePath.includes('/Furman/')) {
      tags.push('furman');
    } else {
      tags.push('general');
    }
  }

  // General folder = General only
  else if (relativePath.includes('/stickers/general/')) {
    tags.push('general');
  }

  // Greek folders = Greek + Organization
  else if (relativePath.includes('/stickers/greek/')) {
    tags.push('greek');

    // Extract organization name
    const match = relativePath.match(/\/greek\/([^\/]+)\//);
    if (match) {
      const orgName = match[1].toLowerCase().replace(/-/g, '_');
      tags.push(orgName);
    }
  }

  // Furman folder = Furman
  else if (relativePath.includes('/stickers/furman/')) {
    tags.push('furman');
  }

  // Shared folder = Shared (available in all)
  else if (relativePath.includes('/stickers/shared/')) {
    tags.push('shared', 'general', 'greek', 'furman');
  }

  return tags;
}

// Get category from path
function getCategory(filePath) {
  const parts = filePath.split('/');

  // Find the deepest meaningful folder name
  for (let i = parts.length - 2; i >= 0; i--) {
    const folder = parts[i];

    // Skip these folders
    if (folder === 'stickers' || folder === 'public' ||
        folder === 'Dynasty' || folder === 'Rae' ||
        folder === 'Need to Be Stickered' || folder === 'anastasia water color' ||
        folder === 'general' || folder === 'greek' || folder === 'furman' ||
        folder === 'shared' || folder.includes('MACOSX')) {
      continue;
    }

    return folder.replace(/ Stickers?/gi, '').replace(/_/g, ' ').trim();
  }

  return 'General';
}

// Generate descriptive tags from filename and path
function getDescriptiveTags(filePath, filename) {
  const tags = [];
  const name = filename
    .replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, '')
    .replace(/[-_]/g, ' ')
    .toLowerCase();

  const fullPath = filePath.toLowerCase();

  // Category-based tags (descriptive only, not for collection filtering)
  const categoryKeywords = {
    'animals': ['cat', 'dog', 'bird', 'bear', 'horse', 'pet', 'animal'],
    'books': ['book', 'read', 'library', 'notebook'],
    'coffee': ['coffee', 'tea', 'drink', 'cup'],
    'food': ['food', 'pizza', 'burger', 'cake'],
    'travel': ['travel', 'plane', 'map', 'world', 'landmark'],
    'nature': ['tree', 'flower', 'leaf', 'plant', 'nature'],
    'sports': ['sport', 'ball', 'game', 'soccer', 'basketball'],
    'holiday': ['christmas', 'halloween', 'valentine', 'birthday', 'holiday'],
    'pride': ['pride', 'rainbow', 'lgbtq'],
    'religion': ['cross', 'church', 'faith', 'religion'],
    'marine': ['fish', 'ocean', 'sea', 'marine', 'whale', 'dolphin'],
    'states': ['state', 'usa', 'america'],
    'logos': ['logo', 'brand']
  };

  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    if (keywords.some(keyword => name.includes(keyword) || fullPath.includes(keyword))) {
      tags.push(category);
    }
  });

  return tags;
}

console.log('🔍 Scanning comprehensive sticker directories...\n');

const stickers = {
  collections: []
};

const collectionMap = {
  'Dynasty': [],
  'Rae': [],
  'Need to Be Stickered': [],
  'Anastasia Water Color': [],
  'Anastasia Furman': [],
  'General Categories': {},
  'Greek Organizations': {},
  'Furman University': []
};

// Scan all stickers
const stickerDirs = [
  'Dynasty',
  'Rae',
  'Need to Be Stickered',
  'anastasia water color',
  'general',
  'greek',
  'furman',
  'shared'
];

stickerDirs.forEach(dirName => {
  const dirPath = path.join(publicDir, 'stickers', dirName);
  if (!fs.existsSync(dirPath)) return;

  console.log(`📁 Scanning ${dirName}...`);
  const files = getAllFiles(dirPath);

  files.forEach(filePath => {
    const relativePath = filePath.replace(publicDir, '');
    const filename = path.basename(filePath);
    const category = getCategory(filePath);
    const collectionTags = getCollectionTags(filePath);
    const descriptiveTags = getDescriptiveTags(filePath, filename);

    const id = path.basename(filePath, path.extname(filePath))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const stickerObj = {
      id: `${dirName.toLowerCase().replace(/\s+/g, '-')}-${id}`,
      path: relativePath,
      name: filename.replace(/\.(png|jpg|jpeg|svg|webp|gif)$/i, ''),
      category: category,
      tags: [...new Set([...collectionTags, ...descriptiveTags])]
    };

    // Categorize by collection
    if (dirName === 'Dynasty') {
      collectionMap.Dynasty.push(stickerObj);
    } else if (dirName === 'Rae') {
      collectionMap.Rae.push(stickerObj);
    } else if (dirName === 'Need to Be Stickered') {
      collectionMap['Need to Be Stickered'].push(stickerObj);
    } else if (dirName === 'anastasia water color') {
      if (relativePath.includes('/Furman/')) {
        collectionMap['Anastasia Furman'].push(stickerObj);
      } else {
        collectionMap['Anastasia Water Color'].push(stickerObj);
      }
    } else if (dirName === 'general') {
      const subCategory = category || 'General';
      if (!collectionMap['General Categories'][subCategory]) {
        collectionMap['General Categories'][subCategory] = [];
      }
      collectionMap['General Categories'][subCategory].push(stickerObj);
    } else if (dirName === 'greek') {
      const match = relativePath.match(/\/greek\/([^\/]+)\//);
      const orgName = match ? match[1] : 'Other';
      if (!collectionMap['Greek Organizations'][orgName]) {
        collectionMap['Greek Organizations'][orgName] = [];
      }
      collectionMap['Greek Organizations'][orgName].push(stickerObj);
    } else if (dirName === 'furman') {
      collectionMap['Furman University'].push(stickerObj);
    }
  });

  console.log(`  ✅ Found ${files.length} stickers`);
});

// Build final collections array
// Dynasty
if (collectionMap.Dynasty.length > 0) {
  stickers.collections.push({
    id: 'dynasty',
    name: 'Dynasty Collection',
    collection: 'general',
    description: 'Dynasty designer stickers',
    stickers: collectionMap.Dynasty
  });
}

// Rae
if (collectionMap.Rae.length > 0) {
  stickers.collections.push({
    id: 'rae',
    name: 'Rae Collection',
    collection: 'general',
    description: 'Rae designer stickers',
    stickers: collectionMap.Rae
  });
}

// Need to Be Stickered
if (collectionMap['Need to Be Stickered'].length > 0) {
  stickers.collections.push({
    id: 'need-to-be-stickered',
    name: 'Need to Be Stickered',
    collection: 'general',
    description: 'Curated sticker collection',
    stickers: collectionMap['Need to Be Stickered']
  });
}

// Anastasia Water Color
if (collectionMap['Anastasia Water Color'].length > 0) {
  stickers.collections.push({
    id: 'anastasia-watercolor',
    name: 'Anastasia Water Color',
    collection: 'general',
    description: 'Beautiful watercolor stickers',
    stickers: collectionMap['Anastasia Water Color']
  });
}

// Anastasia Furman
if (collectionMap['Anastasia Furman'].length > 0) {
  stickers.collections.push({
    id: 'anastasia-furman',
    name: 'Anastasia Furman Collection',
    collection: 'furman',
    description: 'Furman University watercolor designs',
    stickers: collectionMap['Anastasia Furman']
  });
}

// General Categories
Object.entries(collectionMap['General Categories']).forEach(([catName, catStickers]) => {
  stickers.collections.push({
    id: catName.toLowerCase().replace(/\s+/g, '-'),
    name: catName,
    collection: 'general',
    description: `${catName} stickers`,
    stickers: catStickers
  });
});

// Greek Organizations
Object.entries(collectionMap['Greek Organizations']).forEach(([orgName, orgStickers]) => {
  stickers.collections.push({
    id: orgName.toLowerCase().replace(/\s+/g, '-'),
    name: orgName.replace(/-/g, ' '),
    collection: 'greek',
    description: `${orgName.replace(/-/g, ' ')} Greek organization`,
    stickers: orgStickers
  });
});

// Furman University
if (collectionMap['Furman University'].length > 0) {
  stickers.collections.push({
    id: 'furman-university',
    name: 'Furman University',
    collection: 'furman',
    description: 'Official Furman University branding',
    stickers: collectionMap['Furman University']
  });
}

// Calculate totals
const totalStickers = stickers.collections.reduce((sum, col) => sum + col.stickers.length, 0);
const generalStickers = stickers.collections.filter(c => c.collection === 'general').reduce((sum, col) => sum + col.stickers.length, 0);
const greekStickers = stickers.collections.filter(c => c.collection === 'greek').reduce((sum, col) => sum + col.stickers.length, 0);
const furmanStickers = stickers.collections.filter(c => c.collection === 'furman').reduce((sum, col) => sum + col.stickers.length, 0);

// Write to file
console.log('\n💾 Writing to', outputFile);
fs.writeFileSync(outputFile, JSON.stringify(stickers, null, 2));

console.log('\n✅ Successfully generated comprehensive stickers.json!');
console.log('\n📊 Statistics:');
console.log(`   Total Stickers: ${totalStickers}`);
console.log(`   General Collection: ${generalStickers}`);
console.log(`   Greek Collection: ${greekStickers}`);
console.log(`   Furman Collection: ${furmanStickers}`);
console.log(`   Total Categories: ${stickers.collections.length}`);

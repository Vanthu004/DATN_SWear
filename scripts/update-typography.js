#!/usr/bin/env node

/**
 * Script to update Typography components in HomeScreen
 * This will replace remaining Text components with appropriate Typography components
 */

const fs = require('fs');
const path = require('path');

const HOMESCREEN_PATH = path.join(__dirname, '..', 'app', 'Screens', 'HomeScreen.js');

console.log('🔧 Updating Typography in HomeScreen...\n');

if (!fs.existsSync(HOMESCREEN_PATH)) {
  console.log('❌ HomeScreen.js not found');
  process.exit(1);
}

let content = fs.readFileSync(HOMESCREEN_PATH, 'utf8');

// Replace remaining Text components with appropriate Typography components
const replacements = [
  // Loading text
  { from: '<Text style={{ color: \'#888\', marginLeft: 16 }}>Đang tải...</Text>', to: '<CaptionText style={{ color: \'#888\', marginLeft: 16 }}>Đang tải...</CaptionText>' },
  
  // Category names
  { from: '<Text style={{ marginTop: 8, fontSize: 15, fontWeight: \'500\' }}>{item.name}</Text>', to: '<BodyText style={{ marginTop: 8, fontSize: 15, fontWeight: \'500\' }}>{item.name}</BodyText>' },
  
  // Cart badge text
  { from: '<Text style={styles.cartBadgeText}>{cartCount}</Text>', to: '<BodyText style={styles.cartBadgeText}>{cartCount}</BodyText>' },
  
  // User name
  { from: '<Text style={{ marginLeft: 8, color: "#666" }}>', to: '<BodyText style={{ marginLeft: 8, color: "#666" }}>' },
  
  // See all text
  { from: '<Text style={styles.seeAll}>Xem tất cả</Text>', to: '<BodyText style={styles.seeAll}>Xem tất cả</BodyText>' },
  
  // Category names in list
  { from: '<Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>', to: '<BodyText style={styles.categoryName} numberOfLines={1}>{item.name}</BodyText>' },
];

let updatedCount = 0;

replacements.forEach(({ from, to }) => {
  if (content.includes(from)) {
    content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
    updatedCount++;
    console.log(`✅ Replaced: ${from.substring(0, 50)}...`);
  }
});

// Write updated content back to file
fs.writeFileSync(HOMESCREEN_PATH, content, 'utf8');

console.log(`\n✅ Updated ${updatedCount} Text components in HomeScreen.js`);
console.log('💡 Font changes should now be visible!');
console.log('\n🚀 Restart your app to see the new typography!');

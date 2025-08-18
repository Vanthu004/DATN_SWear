#!/usr/bin/env node

/**
 * Script to fix font loading issues
 * This script will help diagnose and fix common font problems
 */

const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');

console.log('🔧 Font Issue Fixer\n');

// Check if fonts directory exists
if (!fs.existsSync(FONTS_DIR)) {
  console.log('❌ Fonts directory not found');
  console.log('💡 Creating fonts directory...');
  fs.mkdirSync(FONTS_DIR, { recursive: true });
  console.log('✅ Fonts directory created');
}

// Check existing font files
console.log('\n📁 Checking existing font files...');
const existingFonts = fs.readdirSync(FONTS_DIR).filter(file => file.endsWith('.ttf'));

if (existingFonts.length === 0) {
  console.log('❌ No font files found');
  console.log('💡 Run "npm run install-fonts" to download fonts');
} else {
  console.log(`✅ Found ${existingFonts.length} font files:`);
  existingFonts.forEach(file => {
    const filepath = path.join(FONTS_DIR, file);
    const stats = fs.statSync(filepath);
    const size = (stats.size / 1024).toFixed(1);
    console.log(`   ${file} (${size} KB)`);
    
    // Check if file is corrupted (very small files)
    if (stats.size < 1000) {
      console.log(`   ⚠️  ${file} seems corrupted (too small)`);
    }
  });
}

// Check for common issues
console.log('\n🔍 Checking for common issues...');

// Issue 1: Check if fonts are corrupted
const corruptedFonts = [];
existingFonts.forEach(file => {
  const filepath = path.join(FONTS_DIR, file);
  const stats = fs.statSync(filepath);
  if (stats.size < 1000) {
    corruptedFonts.push(file);
  }
});

if (corruptedFonts.length > 0) {
  console.log('❌ Corrupted fonts detected:');
  corruptedFonts.forEach(file => console.log(`   - ${file}`));
  console.log('💡 These fonts should be re-downloaded');
}

// Issue 2: Check for missing fonts
const requiredFonts = [
  'Montserrat-Bold.ttf',
  'DIN-Bold.ttf', 
  'Futura-Bold.ttf',
  'Roboto-Regular.ttf',
  'OpenSans-Regular.ttf',
  'HelveticaNeue-Regular.ttf',
  'Inter-Regular.ttf',
  'SFPro-Regular.ttf'
];

const missingFonts = requiredFonts.filter(font => !existingFonts.includes(font));

if (missingFonts.length > 0) {
  console.log('❌ Missing fonts:');
  missingFonts.forEach(font => console.log(`   - ${font}`));
  console.log('💡 Run "npm run install-fonts" to download missing fonts');
}

// Issue 3: Check file permissions
console.log('\n🔐 Checking file permissions...');
existingFonts.forEach(file => {
  const filepath = path.join(FONTS_DIR, file);
  try {
    fs.accessSync(filepath, fs.constants.R_OK);
    console.log(`✅ ${file} is readable`);
  } catch (error) {
    console.log(`❌ ${file} is not readable`);
  }
});

// Recommendations
console.log('\n📋 Recommendations:');

if (corruptedFonts.length > 0 || missingFonts.length > 0) {
  console.log('1. Delete corrupted fonts:');
  corruptedFonts.forEach(file => {
    const filepath = path.join(FONTS_DIR, file);
    try {
      fs.unlinkSync(filepath);
      console.log(`   ✅ Deleted ${file}`);
    } catch (error) {
      console.log(`   ❌ Failed to delete ${file}: ${error.message}`);
    }
  });
  
  console.log('\n2. Re-download fonts:');
  console.log('   npm run install-fonts');
  
  console.log('\n3. Clear Metro cache:');
  console.log('   npx expo start --clear');
} else {
  console.log('✅ All fonts appear to be in good condition');
  console.log('💡 If you still have issues, try:');
  console.log('   1. Restart Metro bundler');
  console.log('   2. Clear app cache');
  console.log('   3. Rebuild app');
}

console.log('\n🚀 Font system should now work with system fonts as fallback');
console.log('📚 For more information, see FONT_SYSTEM_README.md');

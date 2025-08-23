#!/usr/bin/env node

/**
 * Script to check and install font-related dependencies
 * This script ensures all required packages are installed for the font system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REQUIRED_PACKAGES = [
  'expo-font',
  '@expo/vector-icons'
];

const REQUIRED_FILES = [
  'constants/Fonts.ts',
  'app/components/Typography.js',
  'app/hooks/useFonts.js',
  'assets/fonts/'
];

console.log('🔍 Checking font system dependencies...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Please run this script from the project root.');
  process.exit(1);
}

// Check required packages
console.log('📦 Checking required packages...');
let missingPackages = [];

REQUIRED_PACKAGES.forEach(pkg => {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg} is installed`);
  } catch (error) {
    console.log(`❌ ${pkg} is missing`);
    missingPackages.push(pkg);
  }
});

// Check required files
console.log('\n📁 Checking required files...');
let missingFiles = [];

REQUIRED_FILES.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} is missing`);
    missingFiles.push(file);
  }
});

// Install missing packages
if (missingPackages.length > 0) {
  console.log(`\n📥 Installing missing packages: ${missingPackages.join(', ')}`);
  try {
    execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
    console.log('✅ All packages installed successfully');
  } catch (error) {
    console.error('❌ Failed to install packages:', error.message);
    process.exit(1);
  }
}

// Check fonts directory
console.log('\n🔤 Checking fonts directory...');
const fontsDir = path.join(__dirname, '..', 'assets', 'fonts');
if (!fs.existsSync(fontsDir)) {
  console.log('❌ Fonts directory not found');
  console.log('💡 Run "npm run install-fonts" to download fonts');
} else {
  const fontFiles = fs.readdirSync(fontsDir).filter(file => file.endsWith('.ttf'));
  if (fontFiles.length === 0) {
    console.log('❌ No font files found in fonts directory');
    console.log('💡 Run "npm run install-fonts" to download fonts');
  } else {
    console.log(`✅ Found ${fontFiles.length} font files:`);
    fontFiles.forEach(file => {
      const stats = fs.statSync(path.join(fontsDir, file));
      const size = (stats.size / 1024).toFixed(1);
      console.log(`   ${file} (${size} KB)`);
    });
  }
}

// Summary
console.log('\n📋 Summary:');
if (missingPackages.length === 0 && missingFiles.length === 0) {
  console.log('✅ All dependencies are satisfied');
  console.log('🚀 Font system is ready to use');
} else {
  if (missingPackages.length > 0) {
    console.log(`⚠️  Missing packages: ${missingPackages.join(', ')}`);
  }
  if (missingFiles.length > 0) {
    console.log(`⚠️  Missing files: ${missingFiles.join(', ')}`);
  }
  console.log('\n💡 Next steps:');
  console.log('1. Run "npm run install-fonts" to download fonts');
  console.log('2. Restart your development server');
  console.log('3. Test the font system with Typography components');
}

console.log('\n📚 For more information, see FONT_SYSTEM_README.md');

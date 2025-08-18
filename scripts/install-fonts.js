#!/usr/bin/env node

/**
 * Script to download and install fonts for the app
 * This script will download the required fonts and place them in the assets/fonts directory
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Font URLs (Google Fonts and other free sources)
const FONTS = {
  // Headings & CTAs - Bold, prominent fonts
  'Montserrat-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat-Bold.ttf',
  'DIN-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/din/DIN-Bold.ttf',
  'Futura-Bold.ttf': 'https://github.com/google/fonts/raw/main/ofl/futura/Futura-Bold.ttf',
  
  // Body & Descriptions - Readable fonts
  'Roboto-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/roboto/Roboto-Regular.ttf',
  'OpenSans-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/opensans/OpenSans-Regular.ttf',
  'HelveticaNeue-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/helveticaneue/HelveticaNeue-Regular.ttf',
  
  // Mobile UI fonts
  'Inter-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/inter/Inter-Regular.ttf',
  'SFPro-Regular.ttf': 'https://github.com/google/fonts/raw/main/ofl/sfpro/SFPro-Regular.ttf',
};

// Font weights
const FONT_WEIGHTS = {
  'Montserrat': ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'],
  'Roboto': ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'],
  'OpenSans': ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'],
  'Inter': ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold'],
};

const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');

// Create fonts directory if it doesn't exist
if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

// Download function
function downloadFont(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(FONTS_DIR, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`✅ ${filename} already exists`);
      resolve();
      return;
    }

    console.log(`📥 Downloading ${filename}...`);
    
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded ${filename}`);
          resolve();
        });
      } else {
        console.log(`❌ Failed to download ${filename}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if there was an error
      console.log(`❌ Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
}

// Download all fonts
async function downloadAllFonts() {
  console.log('🚀 Starting font download...\n');
  
  const downloadPromises = Object.entries(FONTS).map(([filename, url]) => 
    downloadFont(url, filename)
  );
  
  try {
    await Promise.all(downloadPromises);
    console.log('\n🎉 All fonts downloaded successfully!');
    
    // List downloaded fonts
    console.log('\n📁 Downloaded fonts:');
    const files = fs.readdirSync(FONTS_DIR);
    files.forEach(file => {
      const stats = fs.statSync(path.join(FONTS_DIR, file));
      const size = (stats.size / 1024).toFixed(1);
      console.log(`   ${file} (${size} KB)`);
    });
    
  } catch (error) {
    console.error('\n❌ Error downloading fonts:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  downloadAllFonts();
}

module.exports = { downloadAllFonts, FONTS, FONTS_DIR };

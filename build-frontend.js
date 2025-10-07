const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting custom build process...');

// Change to frontend directory
process.chdir('frontend');

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm ci', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Verify index.html exists
const indexPath = path.join('public', 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found in public directory');
  process.exit(1);
}
console.log('✅ index.html found in public directory');

// Run React build
console.log('Running React build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ React build completed successfully');
} catch (error) {
  console.error('❌ React build failed:', error.message);
  process.exit(1);
}

// Verify build output
const buildIndexPath = path.join('build', 'index.html');
if (!fs.existsSync(buildIndexPath)) {
  console.error('❌ index.html not found in build directory');
  console.log('Build directory contents:');
  try {
    const buildContents = fs.readdirSync('build');
    console.log(buildContents);
  } catch (error) {
    console.log('Build directory does not exist');
  }
  process.exit(1);
}

console.log('✅ Build completed successfully with index.html');

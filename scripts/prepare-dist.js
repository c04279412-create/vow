const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'out');

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('--- Preparing PHP + React Production Bundle ---');

// 1. Copy api/ -> out/api/
if (fs.existsSync(path.join(rootDir, 'api'))) {
  copyDirRecursive(path.join(rootDir, 'api'), path.join(outDir, 'api'));
  console.log('✓ Copied api/ (PHP backend) -> out/api/');
}

// 2. Copy data/ -> out/data/
if (fs.existsSync(path.join(rootDir, 'data'))) {
  copyDirRecursive(path.join(rootDir, 'data'), path.join(outDir, 'data'));
  console.log('✓ Copied data/ (JSON data store) -> out/data/');
}

// 3. Copy .htaccess -> out/.htaccess
if (fs.existsSync(path.join(rootDir, '.htaccess'))) {
  fs.copyFileSync(path.join(rootDir, '.htaccess'), path.join(outDir, '.htaccess'));
  console.log('✓ Copied .htaccess -> out/.htaccess');
}

// 4. Ensure public uploads directory exists in out
const outUploads = path.join(outDir, 'uploads');
if (!fs.existsSync(outUploads)) {
  fs.mkdirSync(outUploads, { recursive: true });
}

console.log('✓ Production bundle ready in /out directory!');

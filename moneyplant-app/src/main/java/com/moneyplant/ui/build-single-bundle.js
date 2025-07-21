const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Angular app with single bundle configuration...');

try {
  // Check if webpack.config.js exists in the current directory
  if (fs.existsSync('./webpack.config.js')) {
    console.log('Using custom webpack configuration for single bundle...');

    // Run Angular build with production configuration and custom webpack config
    execSync('ng build --configuration production --output-hashing none', { stdio: 'inherit' });

    console.log('Build completed successfully');

    // Get the browser directory path
    const distDir = path.resolve('./dist/money-plant-frontend/browser');

    if (fs.existsSync(distDir)) {
      // List all JS files in the dist directory
      const jsFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));
      console.log('JS files in dist directory:', jsFiles);

      // Rename files to remove hashes if needed
      jsFiles.forEach(file => {
        if (file.includes('main')) {
          fs.renameSync(
            path.join(distDir, file),
            path.join(distDir, 'main.js')
          );
        } else if (file.includes('vendor')) {
          fs.renameSync(
            path.join(distDir, file),
            path.join(distDir, 'vendor.js')
          );
        } else if (file.includes('polyfills')) {
          fs.renameSync(
            path.join(distDir, file),
            path.join(distDir, 'polyfills.js')
          );
        } else if (file.includes('runtime')) {
          fs.renameSync(
            path.join(distDir, file),
            path.join(distDir, 'runtime.js')
          );
        }
      });

      console.log('Files renamed successfully');
    } else {
      console.log('Dist directory not found:', distDir);
    }
  } else {
    console.log('No custom webpack configuration found, using default Angular build...');
    execSync('ng build --configuration production', { stdio: 'inherit' });
    console.log('Build completed successfully');
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Angular app with single bundle configuration...');

try {
  // Run Angular build with production configuration and no output hashing
  // Angular 20 uses a different build command syntax
  console.log('Running Angular build with production configuration and no output hashing for Angular 20...');
  execSync('npx ng build --configuration=production --output-hashing=none --project=money-plant-frontend', { stdio: 'inherit' });
  console.log('Build completed successfully');

  // Get the output directory path (Angular 20 doesn't use a browser subdirectory)
  const distDir = path.resolve('./dist/money-plant-frontend');

  if (fs.existsSync(distDir)) {
    // List all JS files in the dist directory
    const jsFiles = fs.readdirSync(distDir).filter(file => file.endsWith('.js'));
    console.log('JS files in dist directory:', jsFiles);

    // Combine all JS files into a single bundle
    console.log('Combining all JS files into a single bundle...');

    let combinedContent = '';

    // Process files in a specific order: runtime, polyfills, vendor, main
    const fileOrder = ['runtime', 'polyfills', 'vendor', 'main'];

    // First, sort files according to our preferred order
    const sortedFiles = [];
    fileOrder.forEach(prefix => {
      const matchingFiles = jsFiles.filter(file => file.includes(prefix));
      sortedFiles.push(...matchingFiles);
    });

    // Add any remaining JS files that don't match our prefixes
    const remainingFiles = jsFiles.filter(file => !fileOrder.some(prefix => file.includes(prefix)));
    sortedFiles.push(...remainingFiles);

    // Combine all files
    sortedFiles.forEach(file => {
      const content = fs.readFileSync(path.join(distDir, file), 'utf8');
      combinedContent += content + '\n';

      // Remove the individual file as we're combining them
      fs.unlinkSync(path.join(distDir, file));
    });

    // Write the combined content to a single bundle file
    fs.writeFileSync(path.join(distDir, 'app.js'), combinedContent);

    console.log('Created single app.js file successfully');

    // Update index.html to reference the single bundle file
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');

      // Remove all modulepreload links
      const modulepreloadRegex = /<link[^>]*rel="modulepreload"[^>]*>/g;
      indexContent = indexContent.replace(modulepreloadRegex, '');

      // Replace all script tags referencing JS files with a single script tag for app.js
      const scriptRegex = /<script[^>]*src="[^"]*\.js"[^>]*><\/script>/g;
      const scriptTags = indexContent.match(scriptRegex) || [];

      if (scriptTags.length > 0) {
        // Replace the first script tag with our app.js and remove the rest
        indexContent = indexContent.replace(scriptRegex, '<script src="app.js"></script>');
        // Remove any additional script tags
        indexContent = indexContent.replace(scriptRegex, '');
      } else {
        // If no script tags found, add one before the closing body tag
        indexContent = indexContent.replace('</body>', '<script src="app.js"></script></body>');
      }

      fs.writeFileSync(indexPath, indexContent);
      console.log('Updated index.html to use single app.js');
    }
  } else {
    console.log('Dist directory not found:', distDir);
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

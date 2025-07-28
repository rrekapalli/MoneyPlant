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

  // Get the output directory path (Angular 20 uses a browser subdirectory)
  const distDir = path.resolve('./dist/money-plant-frontend/browser');

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
      let content = fs.readFileSync(path.join(distDir, file), 'utf8');

      // Check if this is not the first file and contains a declaration of 'xe'
      if (combinedContent.includes('c as xe') && content.includes('c as xe')) {
        // Replace 'c as xe' with 'c as xe2' to avoid duplicate declaration
        content = content.replace(/c as xe/g, 'c as xe2');

        // Also replace all usages of 'xe' with 'xe2' in this file
        // First handle cases where xe is surrounded by non-alphanumeric characters
        content = content.replace(/([^a-zA-Z0-9_])xe([^a-zA-Z0-9_])/g, '$1xe2$2');

        // Handle cases where xe is at the beginning of a line or statement
        content = content.replace(/^xe([^a-zA-Z0-9_])/gm, 'xe2$1');

        // Handle cases where xe is used as a property accessor (e.g., obj.xe or obj["xe"])
        content = content.replace(/\.xe([^a-zA-Z0-9_])/g, '.xe2$1');
        content = content.replace(/\["xe"\]/g, '["xe2"]');
        content = content.replace(/\['xe'\]/g, "['xe2']");
      }

      combinedContent += content + '\n';

      // Remove the individual file as we're combining them
      fs.unlinkSync(path.join(distDir, file));
    });

    // Write the combined content to a single bundle file
    fs.writeFileSync(path.join(distDir, 'app.jsm'), combinedContent);

    console.log('Created single app.jsm file successfully');

    // Update index.html to reference the single bundle file
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let indexContent = fs.readFileSync(indexPath, 'utf8');

      // Remove all modulepreload links
      const modulepreloadRegex = /<link[^>]*rel="modulepreload"[^>]*>/g;
      indexContent = indexContent.replace(modulepreloadRegex, '');

      // Remove any existing script tags (Angular 20 might use different formats)
      const scriptRegex = /<script[^>]*src="[^"]*\.js[^"]*"[^>]*>[\s\S]*?<\/script>/g;
      indexContent = indexContent.replace(scriptRegex, '');

      // Also remove any type="module" script tags that Angular 20 might use
      const moduleScriptRegex = /<script[^>]*type="module"[^>]*>[\s\S]*?<\/script>/g;
      indexContent = indexContent.replace(moduleScriptRegex, '');

      // Always add our app.jsm script tag before the closing body tag
      // Make sure it doesn't already exist and ensure we add type="module"
      if (!indexContent.includes('<script src="app.jsm" type="module"></script>')) {
        indexContent = indexContent.replace('</body>', '<script src="app.jsm" type="module"></script></body>');
      }
      // Ensure the type="module" attribute is present for app.jsm script tag
      indexContent = indexContent.replace('<script src="app.jsm"></script>', '<script src="app.jsm" type="module"></script>');

      fs.writeFileSync(indexPath, indexContent);
      console.log('Updated index.html to use single app.jsm');
    }
  } else {
    console.log('Dist directory not found:', distDir);
  }
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

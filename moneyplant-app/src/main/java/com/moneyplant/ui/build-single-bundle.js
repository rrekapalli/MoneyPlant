const { execSync } = require('child_process');
console.log('Building Angular app with single bundle configuration...');
try {
  // Run Angular build with specific flags to create a single bundle
  execSync('ng build --configuration production --output-hashing=all --source-map=false --named-chunks=false --vendor-chunk=false --build-optimizer=true', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}

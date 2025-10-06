#!/usr/bin/env node

/**
 * Package validation script for criteria-builder library
 * Validates the built package structure and metadata
 */

const fs = require('fs');
const path = require('path');

// Configuration
const projectRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(projectRoot, '../../dist/criteria-builder');

/**
 * Validate package.json structure
 */
function validatePackageJson() {
  console.log('📦 Validating package.json...');
  
  const packageJsonPath = path.join(distPath, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('package.json not found in dist directory');
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  // Required fields
  const requiredFields = [
    'name',
    'version',
    'description',
    'main',
    'module',
    'typings',
    'peerDependencies',
    'exports'
  ];
  
  for (const field of requiredFields) {
    if (!packageJson[field]) {
      throw new Error(`Missing required field in package.json: ${field}`);
    }
  }
  
  // Validate exports
  if (!packageJson.exports['.']) {
    throw new Error('Missing main export in package.json exports');
  }
  
  // Validate peer dependencies
  const expectedPeerDeps = [
    '@angular/common',
    '@angular/core',
    '@angular/forms',
    '@angular/cdk',
    'primeng',
    'rxjs'
  ];
  
  for (const dep of expectedPeerDeps) {
    if (!packageJson.peerDependencies[dep]) {
      throw new Error(`Missing peer dependency: ${dep}`);
    }
  }
  
  console.log('✅ package.json validation passed');
  return packageJson;
}

/**
 * Validate file structure
 */
function validateFileStructure() {
  console.log('📁 Validating file structure...');
  
  const requiredFiles = [
    'package.json',
    'index.d.ts',
    'fesm2022/projects-criteria-builder.mjs'
  ];
  
  const requiredDirectories = [
    'fesm2022'
  ];
  
  // Check required files
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing required file: ${file}`);
    }
  }
  
  // Check required directories
  for (const dir of requiredDirectories) {
    const dirPath = path.join(distPath, dir);
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
      throw new Error(`Missing required directory: ${dir}`);
    }
  }
  
  console.log('✅ File structure validation passed');
}

/**
 * Validate TypeScript definitions
 */
function validateTypeScriptDefinitions() {
  console.log('📝 Validating TypeScript definitions...');
  
  const indexDtsPath = path.join(distPath, 'index.d.ts');
  const publicApiDtsPath = path.join(distPath, 'public-api.d.ts');
  
  // Check main index.d.ts
  const indexContent = fs.readFileSync(indexDtsPath, 'utf8');
  if (!indexContent.includes('export')) {
    throw new Error('index.d.ts does not contain any exports');
  }
  
  // Check if public-api.d.ts exists (optional in newer ng-packagr versions)
  if (fs.existsSync(publicApiDtsPath)) {
    const publicApiContent = fs.readFileSync(publicApiDtsPath, 'utf8');
    if (!publicApiContent.includes('export')) {
      throw new Error('public-api.d.ts does not contain any exports');
    }
  }
  
  // Validate that main exports are present in index.d.ts
  const expectedExports = [
    'CriteriaBuilderModule',
    'AcCriteriaBuilderComponent',
    'CriteriaSerializerService',
    'CriteriaDSL',
    'FieldMeta',
    'FunctionMeta'
  ];
  
  for (const exportName of expectedExports) {
    if (!indexContent.includes(exportName)) {
      console.warn(`⚠️  Expected export not found in index.d.ts: ${exportName}`);
    }
  }
  
  console.log('✅ TypeScript definitions validation passed');
}

/**
 * Validate bundle integrity
 */
function validateBundles() {
  console.log('📦 Validating bundle integrity...');
  
  // Check ESM bundle
  const esmPath = path.join(distPath, 'fesm2022/projects-criteria-builder.mjs');
  const esmContent = fs.readFileSync(esmPath, 'utf8');
  
  if (!esmContent.includes('export')) {
    throw new Error('ESM bundle does not contain exports');
  }
  
  console.log('✅ Bundle integrity validation passed');
}

/**
 * Validate bundle sizes
 */
function validateBundleSizes() {
  console.log('📏 Validating bundle sizes...');
  
  const sizeThresholds = {
    'fesm2022/projects-criteria-builder.mjs': 500 * 1024, // 500KB
    'index.d.ts': 50 * 1024 // 50KB
  };
  
  for (const [file, maxSize] of Object.entries(sizeThresholds)) {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.size > maxSize) {
      console.warn(`⚠️  Bundle size warning: ${file} is ${Math.round(stats.size / 1024)}KB (max: ${Math.round(maxSize / 1024)}KB)`);
    } else {
      console.log(`✅ ${file}: ${Math.round(stats.size / 1024)}KB`);
    }
  }
  
  console.log('✅ Bundle size validation completed');
}

/**
 * Generate validation report
 */
function generateValidationReport() {
  console.log('📊 Generating validation report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    validation: {
      packageJson: true,
      fileStructure: true,
      typeScriptDefinitions: true,
      bundles: true,
      bundleSizes: true
    },
    files: {},
    summary: {
      totalFiles: 0,
      totalSize: 0
    }
  };
  
  // Collect file information
  function collectFiles(dir, basePath = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const relativePath = path.join(basePath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        collectFiles(filePath, relativePath);
      } else {
        report.files[relativePath] = {
          size: stats.size,
          sizeKB: Math.round(stats.size / 1024 * 100) / 100
        };
        report.summary.totalFiles++;
        report.summary.totalSize += stats.size;
      }
    }
  }
  
  collectFiles(distPath);
  report.summary.totalSizeKB = Math.round(report.summary.totalSize / 1024 * 100) / 100;
  
  // Write report
  fs.writeFileSync(
    path.join(distPath, 'validation-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('✅ Validation report generated');
  console.log(`📊 Total files: ${report.summary.totalFiles}`);
  console.log(`📊 Total size: ${report.summary.totalSizeKB}KB`);
}

/**
 * Main validation function
 */
function validatePackage() {
  console.log('🚀 Starting package validation...');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist directory not found. Run build first.');
    process.exit(1);
  }
  
  try {
    validatePackageJson();
    validateFileStructure();
    validateTypeScriptDefinitions();
    validateBundles();
    validateBundleSizes();
    generateValidationReport();
    
    console.log('🎉 Package validation completed successfully!');
  } catch (error) {
    console.error('❌ Package validation failed:', error.message);
    process.exit(1);
  }
}

// Run validation if called directly
if (require.main === module) {
  validatePackage();
}

module.exports = { validatePackage };
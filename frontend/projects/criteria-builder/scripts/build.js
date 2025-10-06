#!/usr/bin/env node

/**
 * Build script for criteria-builder library
 * Handles development and production builds with proper validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = require('../build.config.js');
const projectRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(projectRoot, '../../dist/criteria-builder');

// Build modes
const BUILD_MODES = {
  development: 'development',
  production: 'production'
};

/**
 * Validate peer dependencies
 */
function validatePeerDependencies() {
  console.log('🔍 Validating peer dependencies...');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'));
  const peerDeps = packageJson.peerDependencies || {};
  
  // Check if all required peer dependencies are present
  for (const [dep, version] of Object.entries(config.peerDependencies)) {
    if (!peerDeps[dep]) {
      throw new Error(`Missing peer dependency: ${dep}@${version}`);
    }
    
    if (peerDeps[dep] !== version) {
      console.warn(`⚠️  Peer dependency version mismatch: ${dep} expected ${version}, found ${peerDeps[dep]}`);
    }
  }
  
  console.log('✅ Peer dependencies validated');
}

/**
 * Clean build directory
 */
function cleanBuild() {
  console.log('🧹 Cleaning build directory...');
  
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  
  console.log('✅ Build directory cleaned');
}

/**
 * Run Angular build
 */
function runBuild(mode = BUILD_MODES.production) {
  console.log(`🏗️  Building library in ${mode} mode...`);
  
  try {
    const buildCommand = `ng build criteria-builder --configuration ${mode}`;
    execSync(buildCommand, { 
      stdio: 'inherit', 
      cwd: path.resolve(projectRoot, '../..') 
    });
    
    console.log('✅ Library build completed');
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

/**
 * Validate build output
 */
function validateBuildOutput() {
  console.log('🔍 Validating build output...');
  
  const requiredFiles = [
    'package.json',
    'index.d.ts',
    'fesm2022/projects-criteria-builder.mjs'
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing build output file: ${file}`);
    }
  }
  
  // Check package.json exports
  const distPackageJson = JSON.parse(fs.readFileSync(path.join(distPath, 'package.json'), 'utf8'));
  if (!distPackageJson.exports || !distPackageJson.exports['.']) {
    throw new Error('Missing exports configuration in built package.json');
  }
  
  console.log('✅ Build output validated');
}

/**
 * Generate build report
 */
function generateBuildReport() {
  console.log('📊 Generating build report...');
  
  const stats = {
    timestamp: new Date().toISOString(),
    version: config.version,
    files: {}
  };
  
  // Get file sizes
  const files = fs.readdirSync(distPath, { recursive: true });
  for (const file of files) {
    const filePath = path.join(distPath, file);
    if (fs.statSync(filePath).isFile()) {
      stats.files[file] = {
        size: fs.statSync(filePath).size,
        sizeKB: Math.round(fs.statSync(filePath).size / 1024 * 100) / 100
      };
    }
  }
  
  // Write report
  fs.writeFileSync(
    path.join(distPath, 'build-report.json'),
    JSON.stringify(stats, null, 2)
  );
  
  console.log('✅ Build report generated');
}

/**
 * Main build function
 */
function build() {
  const mode = process.argv[2] || BUILD_MODES.production;
  
  if (!Object.values(BUILD_MODES).includes(mode)) {
    console.error(`❌ Invalid build mode: ${mode}. Use 'development' or 'production'`);
    process.exit(1);
  }
  
  console.log(`🚀 Starting criteria-builder library build (${mode})...`);
  
  try {
    validatePeerDependencies();
    cleanBuild();
    runBuild(mode);
    validateBuildOutput();
    generateBuildReport();
    
    console.log('🎉 Build completed successfully!');
    console.log(`📦 Output: ${distPath}`);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build if called directly
if (require.main === module) {
  build();
}

module.exports = { build, validatePeerDependencies, validateBuildOutput };
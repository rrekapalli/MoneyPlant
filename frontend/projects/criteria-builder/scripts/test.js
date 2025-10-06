#!/usr/bin/env node

/**
 * Test script for criteria-builder library
 * Handles unit tests, integration tests, and coverage reporting
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const projectRoot = path.resolve(__dirname, '..');
const coverageDir = path.resolve(projectRoot, 'coverage');

/**
 * Run unit tests
 */
function runUnitTests(options = {}) {
  console.log('🧪 Running unit tests...');
  
  const {
    watch = false,
    coverage = true,
    browsers = 'ChromeHeadless'
  } = options;
  
  try {
    let testCommand = 'ng test criteria-builder';
    
    if (!watch) {
      testCommand += ' --watch=false --browsers=' + browsers;
    }
    
    if (coverage) {
      testCommand += ' --code-coverage';
    }
    
    execSync(testCommand, { 
      stdio: 'inherit', 
      cwd: path.resolve(projectRoot, '../..') 
    });
    
    console.log('✅ Unit tests completed');
  } catch (error) {
    console.error('❌ Unit tests failed:', error.message);
    process.exit(1);
  }
}

/**
 * Run lint checks
 */
function runLint() {
  console.log('🔍 Running lint checks...');
  
  try {
    execSync('ng lint criteria-builder', { 
      stdio: 'inherit', 
      cwd: path.resolve(projectRoot, '../..') 
    });
    
    console.log('✅ Lint checks passed');
  } catch (error) {
    console.error('❌ Lint checks failed:', error.message);
    process.exit(1);
  }
}

/**
 * Generate test coverage report
 */
function generateCoverageReport() {
  console.log('📊 Generating coverage report...');
  
  if (!fs.existsSync(coverageDir)) {
    console.warn('⚠️  No coverage data found');
    return;
  }
  
  // Coverage thresholds
  const thresholds = {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  };
  
  try {
    // Read coverage summary if available
    const summaryPath = path.join(coverageDir, 'coverage-summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      const total = summary.total;
      
      console.log('\n📈 Coverage Summary:');
      console.log(`  Statements: ${total.statements.pct}% (threshold: ${thresholds.statements}%)`);
      console.log(`  Branches: ${total.branches.pct}% (threshold: ${thresholds.branches}%)`);
      console.log(`  Functions: ${total.functions.pct}% (threshold: ${thresholds.functions}%)`);
      console.log(`  Lines: ${total.lines.pct}% (threshold: ${thresholds.lines}%)`);
      
      // Check thresholds
      const failed = [];
      if (total.statements.pct < thresholds.statements) failed.push('statements');
      if (total.branches.pct < thresholds.branches) failed.push('branches');
      if (total.functions.pct < thresholds.functions) failed.push('functions');
      if (total.lines.pct < thresholds.lines) failed.push('lines');
      
      if (failed.length > 0) {
        console.warn(`⚠️  Coverage thresholds not met for: ${failed.join(', ')}`);
      } else {
        console.log('✅ All coverage thresholds met');
      }
    }
    
    console.log('✅ Coverage report generated');
  } catch (error) {
    console.error('❌ Failed to generate coverage report:', error.message);
  }
}

/**
 * Run build tests (test the built library)
 */
function runBuildTests() {
  console.log('🏗️  Running build tests...');
  
  const distPath = path.resolve(projectRoot, '../../dist/criteria-builder');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Built library not found. Run build first.');
    process.exit(1);
  }
  
  try {
    // Test package.json structure
    const packageJson = JSON.parse(fs.readFileSync(path.join(distPath, 'package.json'), 'utf8'));
    
    const requiredFields = ['name', 'version', 'main', 'module', 'typings', 'peerDependencies'];
    for (const field of requiredFields) {
      if (!packageJson[field]) {
        throw new Error(`Missing required field in package.json: ${field}`);
      }
    }
    
    // Test exports
    if (!packageJson.exports || !packageJson.exports['.']) {
      throw new Error('Missing exports configuration');
    }
    
    // Test TypeScript definitions
    const typingsPath = path.join(distPath, packageJson.typings);
    if (!fs.existsSync(typingsPath)) {
      throw new Error(`TypeScript definitions not found: ${packageJson.typings}`);
    }
    
    console.log('✅ Build tests passed');
  } catch (error) {
    console.error('❌ Build tests failed:', error.message);
    process.exit(1);
  }
}

/**
 * Main test function
 */
function test() {
  const args = process.argv.slice(2);
  const options = {
    watch: args.includes('--watch'),
    coverage: !args.includes('--no-coverage'),
    lint: !args.includes('--no-lint') && !args.includes('--build-test'),
    buildTest: args.includes('--build-test')
  };
  
  console.log('🚀 Starting criteria-builder library tests...');
  
  try {
    if (options.lint) {
      runLint();
    }
    
    if (options.buildTest) {
      runBuildTests();
    } else {
      runUnitTests(options);
      
      if (options.coverage) {
        generateCoverageReport();
      }
    }
    
    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  test();
}

module.exports = { test, runUnitTests, runLint, runBuildTests };
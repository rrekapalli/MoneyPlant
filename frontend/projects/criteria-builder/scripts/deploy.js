#!/usr/bin/env node

/**
 * Deployment script for criteria-builder library
 * Handles building, testing, validation, and publishing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const projectRoot = path.resolve(__dirname, '..');
const distPath = path.resolve(projectRoot, '../../dist/criteria-builder');

/**
 * Create readline interface for user input
 */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Check if user is logged into npm
 */
function checkNpmAuth() {
  console.log('🔐 Checking npm authentication...');
  
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
    console.log(`✅ Logged in as: ${whoami}`);
    return whoami;
  } catch (error) {
    throw new Error('Not logged into npm. Run "npm login" first.');
  }
}

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

/**
 * Update version in package.json
 */
function updateVersion(newVersion) {
  console.log(`📝 Updating version to ${newVersion}...`);
  
  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.version = newVersion;
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('✅ Version updated');
}

/**
 * Run full build and test pipeline
 */
function runBuildPipeline() {
  console.log('🏗️  Running build pipeline...');
  
  try {
    // Clean and build
    console.log('Building library...');
    execSync('npm run build', { 
      stdio: 'inherit', 
      cwd: projectRoot 
    });
    
    // Validate package
    console.log('Validating package...');
    execSync('npm run validate', { 
      stdio: 'inherit', 
      cwd: projectRoot 
    });
    
    // Run tests
    console.log('Running tests...');
    execSync('npm run test:build', { 
      stdio: 'inherit', 
      cwd: projectRoot 
    });
    
    console.log('✅ Build pipeline completed');
  } catch (error) {
    throw new Error(`Build pipeline failed: ${error.message}`);
  }
}

/**
 * Create git tag for version
 */
function createGitTag(version) {
  console.log(`🏷️  Creating git tag v${version}...`);
  
  try {
    execSync(`git add .`, { cwd: projectRoot });
    execSync(`git commit -m "chore: release v${version}"`, { cwd: projectRoot });
    execSync(`git tag v${version}`, { cwd: projectRoot });
    
    console.log('✅ Git tag created');
  } catch (error) {
    console.warn(`⚠️  Git operations failed: ${error.message}`);
  }
}

/**
 * Publish to npm
 */
function publishToNpm(tag = 'latest') {
  console.log(`📦 Publishing to npm with tag "${tag}"...`);
  
  try {
    const publishCommand = `npm publish --access public --tag ${tag}`;
    execSync(publishCommand, { 
      stdio: 'inherit', 
      cwd: distPath 
    });
    
    console.log('✅ Published to npm');
  } catch (error) {
    throw new Error(`npm publish failed: ${error.message}`);
  }
}

/**
 * Generate release notes
 */
function generateReleaseNotes(version) {
  console.log('📝 Generating release notes...');
  
  const releaseNotes = {
    version,
    date: new Date().toISOString().split('T')[0],
    changes: [
      'Library packaging and build pipeline configuration',
      'Automated testing and validation',
      'CI/CD pipeline setup',
      'Comprehensive build scripts and validation'
    ],
    breaking: [],
    features: [
      'Complete Angular v20 library structure',
      'PrimeNG v20 integration',
      'TypeScript definitions',
      'Multiple bundle formats (ESM, UMD)',
      'Automated build validation'
    ],
    fixes: []
  };
  
  const releaseNotesPath = path.join(distPath, 'RELEASE_NOTES.md');
  const content = `# Release Notes - v${version}

**Release Date:** ${releaseNotes.date}

## Features
${releaseNotes.features.map(f => `- ${f}`).join('\n')}

## Changes
${releaseNotes.changes.map(c => `- ${c}`).join('\n')}

${releaseNotes.breaking.length > 0 ? `## Breaking Changes\n${releaseNotes.breaking.map(b => `- ${b}`).join('\n')}\n` : ''}

${releaseNotes.fixes.length > 0 ? `## Bug Fixes\n${releaseNotes.fixes.map(f => `- ${f}`).join('\n')}\n` : ''}

## Installation

\`\`\`bash
npm install @projects/criteria-builder@${version}
\`\`\`

## Peer Dependencies

- @angular/common: ^20.0.0
- @angular/core: ^20.0.0
- @angular/forms: ^20.0.0
- @angular/cdk: ^20.0.0
- primeng: ^20.0.0
- primeicons: ^7.0.0
- primeflex: ^4.0.0
- rxjs: ~7.8.0
`;
  
  fs.writeFileSync(releaseNotesPath, content);
  console.log('✅ Release notes generated');
}

/**
 * Main deployment function
 */
async function deploy() {
  console.log('🚀 Starting criteria-builder library deployment...');
  
  try {
    // Check npm authentication
    const npmUser = checkNpmAuth();
    
    // Get current version
    const currentVersion = getCurrentVersion();
    console.log(`📋 Current version: ${currentVersion}`);
    
    // Ask for new version
    const newVersion = await prompt(`Enter new version (current: ${currentVersion}): `);
    if (!newVersion || newVersion === currentVersion) {
      console.log('❌ Invalid or same version. Deployment cancelled.');
      rl.close();
      return;
    }
    
    // Ask for npm tag
    const tag = await prompt('Enter npm tag (default: latest): ') || 'latest';
    
    // Confirm deployment
    const confirm = await prompt(`Deploy v${newVersion} with tag "${tag}" as ${npmUser}? (y/N): `);
    if (confirm.toLowerCase() !== 'y' && confirm.toLowerCase() !== 'yes') {
      console.log('❌ Deployment cancelled.');
      rl.close();
      return;
    }
    
    rl.close();
    
    // Update version
    updateVersion(newVersion);
    
    // Run build pipeline
    runBuildPipeline();
    
    // Generate release notes
    generateReleaseNotes(newVersion);
    
    // Create git tag
    createGitTag(newVersion);
    
    // Publish to npm
    publishToNpm(tag);
    
    console.log('🎉 Deployment completed successfully!');
    console.log(`📦 Package: @projects/criteria-builder@${newVersion}`);
    console.log(`🏷️  Tag: ${tag}`);
    console.log(`👤 Published by: ${npmUser}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

/**
 * Dry run deployment (build and validate only)
 */
async function dryRun() {
  console.log('🧪 Running deployment dry run...');
  
  try {
    const currentVersion = getCurrentVersion();
    console.log(`📋 Current version: ${currentVersion}`);
    
    // Run build pipeline
    runBuildPipeline();
    
    // Generate release notes (without publishing)
    generateReleaseNotes(currentVersion);
    
    console.log('🎉 Dry run completed successfully!');
    console.log('📦 Package is ready for deployment');
    
  } catch (error) {
    console.error('❌ Dry run failed:', error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes('--dry-run')) {
  dryRun();
} else if (args.includes('--help')) {
  console.log(`
Criteria Builder Library Deployment Script

Usage:
  node scripts/deploy.js [options]

Options:
  --dry-run    Run build and validation without publishing
  --help       Show this help message

Interactive Mode:
  Run without options to start interactive deployment
  `);
} else {
  deploy();
}

module.exports = { deploy, dryRun };
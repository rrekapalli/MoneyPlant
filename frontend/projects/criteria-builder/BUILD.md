# Criteria Builder Library - Build Guide

This document provides comprehensive instructions for building, testing, and packaging the Criteria Builder UI Library.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Angular CLI >= 20.0.0

## Build Commands

### Development Build

```bash
# Build in development mode (with source maps)
npm run build:dev

# Or using Angular CLI directly
ng build criteria-builder --configuration development
```

### Production Build

```bash
# Build in production mode (optimized)
npm run build

# Or using Angular CLI directly
ng build criteria-builder --configuration production
```

### Watch Mode

```bash
# Build and watch for changes
ng build criteria-builder --watch
```

## Testing

### Unit Tests

```bash
# Run tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests without coverage
npm run test -- --no-coverage
```

### Build Tests

```bash
# Test the built library
npm run test:build
```

### Lint

```bash
# Run ESLint
npm run lint
```

## Build Output

The build process generates the following files in `../../dist/criteria-builder/`:

```
dist/criteria-builder/
├── package.json              # Package metadata with exports
├── index.d.ts               # Main TypeScript definitions
├── public-api.d.ts          # Public API definitions
├── fesm2022/                # Flat ES modules
│   └── criteria-builder.mjs
├── esm2022/                 # ES2022 modules
│   └── criteria-builder.mjs
├── bundles/                 # UMD bundles
│   └── criteria-builder.umd.js
└── build-report.json        # Build statistics
```

## Package Configuration

### Peer Dependencies

The library requires the following peer dependencies:

- `@angular/common: ^20.0.0`
- `@angular/core: ^20.0.0`
- `@angular/forms: ^20.0.0`
- `@angular/cdk: ^20.0.0`
- `primeng: ^20.0.0`
- `primeicons: ^7.0.0`
- `primeflex: ^4.0.0`
- `rxjs: ~7.8.0`

### Exports Configuration

The library provides multiple export formats:

```json
{
  "exports": {
    "./package.json": {
      "default": "./package.json"
    },
    ".": {
      "types": "./index.d.ts",
      "esm2022": "./esm2022/criteria-builder.mjs",
      "esm": "./esm2022/criteria-builder.mjs",
      "default": "./fesm2022/criteria-builder.mjs"
    }
  }
}
```

## Build Scripts

### Custom Build Script

The library includes a custom build script (`scripts/build.js`) that:

1. Validates peer dependencies
2. Cleans the build directory
3. Runs the Angular build
4. Validates build output
5. Generates build reports

### Test Script

The test script (`scripts/test.js`) provides:

1. Unit test execution
2. Lint checking
3. Coverage reporting
4. Build validation

## CI/CD Pipeline

The library includes GitHub Actions workflows for:

### Continuous Integration

- **Test Job**: Runs on Node.js 18.x and 20.x
  - Installs dependencies
  - Runs lint checks
  - Executes unit tests with coverage
  - Uploads coverage reports

- **Build Job**: 
  - Builds the library
  - Runs build tests
  - Uploads build artifacts

- **Security Job**:
  - Runs npm audit
  - Checks license compatibility

### Continuous Deployment

- **Publish Job**: (on main branch)
  - Builds and publishes to npm registry
  - Requires `NPM_TOKEN` secret

## Build Validation

The build process includes comprehensive validation:

### Peer Dependency Validation
- Checks all required peer dependencies are present
- Validates version compatibility
- Warns about version mismatches

### Output Validation
- Verifies all required files are generated
- Checks package.json exports configuration
- Validates TypeScript definitions

### Coverage Thresholds
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Packaging

### Local Package Testing

```bash
# Create a local package
npm run pack

# This generates criteria-builder-0.0.1.tgz
```

### Publishing

```bash
# Publish to npm (requires authentication)
cd ../../dist/criteria-builder
npm publish --access public
```

## Troubleshooting

### Common Issues

1. **Peer Dependency Warnings**
   - Ensure host application has compatible versions
   - Check Angular and PrimeNG version compatibility

2. **Build Failures**
   - Clear node_modules and reinstall
   - Check TypeScript configuration
   - Verify all imports are correct

3. **Test Failures**
   - Ensure all test dependencies are installed
   - Check for circular dependencies
   - Verify mock configurations

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run build

# Check build configuration
node scripts/build.js --dry-run
```

## Performance Optimization

### Bundle Size Optimization

The production build includes:
- Tree shaking for unused code elimination
- Minification and compression
- Bundle size budgets and warnings

### Build Performance

- Uses Angular's Ivy renderer
- Implements partial compilation mode
- Leverages ng-packagr optimizations

## Security Considerations

- All dependencies are audited for vulnerabilities
- License compatibility is checked
- No sensitive information in build artifacts
- Secure peer dependency validation
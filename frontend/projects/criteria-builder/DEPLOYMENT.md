# Criteria Builder Library - Deployment Guide

This document provides comprehensive instructions for deploying the Criteria Builder UI Library to npm and other package registries.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- npm account with publish permissions
- Git repository access

## Quick Deployment

### Automated Deployment

```bash
# Interactive deployment (recommended)
npm run deploy

# Dry run (test without publishing)
npm run deploy:dry-run
```

### Manual Deployment

```bash
# 1. Build the library
npm run build

# 2. Validate the package
npm run validate

# 3. Run tests
npm run test:build

# 4. Publish to npm
cd ../../dist/criteria-builder
npm publish --access public
```

## Deployment Process

### 1. Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Version number updated
- [ ] CHANGELOG.md updated
- [ ] No breaking changes (or properly documented)
- [ ] Peer dependencies verified

### 2. Version Management

The library follows [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (0.X.0): New features (backward compatible)
- **PATCH** (0.0.X): Bug fixes (backward compatible)

```bash
# Update version manually
npm version patch   # 0.0.1 -> 0.0.2
npm version minor   # 0.0.1 -> 0.1.0
npm version major   # 0.0.1 -> 1.0.0
```

### 3. Build Pipeline

The automated build pipeline includes:

1. **Dependency Validation**
   - Checks peer dependency compatibility
   - Validates version constraints

2. **Clean Build**
   - Removes previous build artifacts
   - Ensures fresh build environment

3. **Angular Build**
   - Compiles TypeScript to JavaScript
   - Generates type definitions
   - Creates multiple bundle formats

4. **Package Validation**
   - Verifies required files exist
   - Checks package.json structure
   - Validates TypeScript definitions
   - Tests bundle integrity

5. **Testing**
   - Runs build tests
   - Validates package structure
   - Checks for common issues

### 4. Publishing Options

#### Production Release

```bash
# Publish to latest tag (default)
npm run deploy
```

#### Beta Release

```bash
# Publish to beta tag
npm run deploy
# When prompted, enter "beta" as the tag
```

#### Alpha/Development Release

```bash
# Publish to alpha tag
npm run deploy
# When prompted, enter "alpha" as the tag
```

## CI/CD Integration

### GitHub Actions

The library includes a complete CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
- Test on Node.js 18.x and 20.x
- Run lint checks
- Execute unit tests with coverage
- Build library
- Validate package
- Publish on main branch
```

### Environment Variables

Required secrets for CI/CD:

- `NPM_TOKEN`: npm authentication token

### Branch Strategy

- **main**: Production releases
- **develop**: Beta releases
- **feature/***: Development branches

## Package Registry Configuration

### npm Registry (Default)

```bash
# Login to npm
npm login

# Publish
npm publish --access public
```

### Private Registry

```bash
# Configure registry
npm config set registry https://your-registry.com

# Login
npm login --registry https://your-registry.com

# Publish
npm publish --registry https://your-registry.com
```

### GitHub Packages

```bash
# Configure for GitHub Packages
npm config set @your-org:registry https://npm.pkg.github.com

# Login with GitHub token
npm login --registry https://npm.pkg.github.com

# Publish
npm publish
```

## Deployment Validation

### Pre-publish Validation

The deployment script automatically validates:

- Package structure and metadata
- TypeScript definitions
- Bundle integrity and sizes
- Peer dependency compatibility
- Export configurations

### Post-publish Validation

```bash
# Test installation
npm install @projects/criteria-builder@latest

# Verify in test project
ng add @projects/criteria-builder
```

## Rollback Procedures

### npm Unpublish (within 24 hours)

```bash
# Unpublish specific version
npm unpublish @projects/criteria-builder@1.0.0

# Unpublish entire package (dangerous)
npm unpublish @projects/criteria-builder --force
```

### Deprecate Version

```bash
# Deprecate version with message
npm deprecate @projects/criteria-builder@1.0.0 "This version has critical bugs"
```

### Emergency Patch

```bash
# Quick patch release
npm version patch
npm run deploy
```

## Monitoring and Analytics

### npm Statistics

- Download counts: https://npm-stat.com/charts.html?package=@projects/criteria-builder
- Package info: https://www.npmjs.com/package/@projects/criteria-builder

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer dist/criteria-builder/fesm2022/projects-criteria-builder.mjs
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   ```bash
   npm login
   npm whoami  # Verify login
   ```

2. **Version Conflicts**
   ```bash
   npm version --help
   git tag -l  # List existing tags
   ```

3. **Build Failures**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Peer Dependency Warnings**
   - Update peer dependencies in package.json
   - Test with target Angular version

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* npm run deploy:dry-run

# Check npm configuration
npm config list
```

## Security Considerations

### Package Security

- Regular dependency audits: `npm audit`
- License compatibility checks
- No sensitive information in package
- Secure peer dependency validation

### Access Control

- Use npm teams for organization packages
- Implement 2FA for npm account
- Regular access review and rotation

### Supply Chain Security

- Verify package integrity after publish
- Monitor for unauthorized changes
- Use package-lock.json for reproducible builds

## Best Practices

### Release Management

1. **Semantic Versioning**: Follow semver strictly
2. **Changelog**: Maintain detailed changelog
3. **Testing**: Comprehensive test coverage
4. **Documentation**: Keep docs up to date
5. **Backward Compatibility**: Minimize breaking changes

### Performance Optimization

1. **Bundle Size**: Monitor and optimize bundle size
2. **Tree Shaking**: Ensure proper tree shaking support
3. **Lazy Loading**: Support lazy loading where possible
4. **Peer Dependencies**: Minimize peer dependency footprint

### Quality Assurance

1. **Automated Testing**: Comprehensive test suite
2. **Code Coverage**: Maintain high coverage
3. **Linting**: Consistent code style
4. **Type Safety**: Full TypeScript coverage
/**
 * Build configuration for criteria-builder library
 */
module.exports = {
  // Library metadata
  libraryName: '@projects/criteria-builder',
  version: '0.0.1',
  
  // Build targets
  targets: {
    development: {
      sourceMap: true,
      optimization: false,
      extractLicenses: false,
      namedChunks: true,
      vendorChunk: true
    },
    production: {
      sourceMap: false,
      optimization: true,
      extractLicenses: true,
      namedChunks: false,
      vendorChunk: false,
      budgets: [
        {
          type: 'initial',
          maximumWarning: '500kb',
          maximumError: '1mb'
        },
        {
          type: 'anyComponentStyle',
          maximumWarning: '10kb',
          maximumError: '20kb'
        }
      ]
    }
  },
  
  // Peer dependencies validation
  peerDependencies: {
    '@angular/common': '^20.0.0',
    '@angular/core': '^20.0.0',
    '@angular/forms': '^20.0.0',
    '@angular/cdk': '^20.0.0',
    'primeng': '^20.0.0',
    'primeicons': '^7.0.0',
    'primeflex': '^4.0.0',
    'rxjs': '~7.8.0'
  },
  
  // Build output configuration
  output: {
    formats: ['esm2022', 'fesm2022', 'umd'],
    bundleFormats: ['esm', 'umd'],
    generateTypings: true,
    generateSourceMaps: true
  }
};
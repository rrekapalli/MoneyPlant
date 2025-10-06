# Import/Export and Preset Management

This document describes the import/export and preset management functionality implemented in the Criteria Builder UI Library.

## Features

### JSON Import/Export with Validation

The `CriteriaImportExportService` provides comprehensive import/export functionality with validation:

#### Export Features
- **Metadata Enhancement**: Automatically adds export metadata including timestamp, version, and user information
- **Validation**: Validates DSL before export (can be disabled with `allowInvalid` option)
- **Flexible Options**: Support for minified output, validation inclusion, and custom metadata
- **File Download**: Direct export to downloadable JSON files

#### Import Features
- **Comprehensive Validation**: Multi-layer validation including structure, content, and security checks
- **Version Compatibility**: Checks schema version compatibility and provides warnings/errors
- **Security Validation**: Prevents import of potentially malicious content
- **Error Reporting**: Detailed error messages with specific paths and descriptions
- **File Support**: Direct import from JSON files with size and type validation

#### Usage Example

```typescript
import { CriteriaImportExportService } from '@projects/criteria-builder';

// Export DSL
const exportResult = importExportService.exportToJson(dsl, {
  includeValidation: true,
  exportedBy: 'user@example.com',
  additionalMetadata: { source: 'my-app' }
});

if (exportResult.success) {
  console.log('Exported JSON:', exportResult.data);
}

// Import DSL
const importResult = importExportService.importFromJson(jsonString, {
  validateContent: true,
  allowInvalid: false
});

if (importResult.success) {
  console.log('Imported DSL:', importResult.dsl);
} else {
  console.error('Import errors:', importResult.errors);
}

// Import from file
const fileResult = await importExportService.importFromFile(file);
```

### Preset Management with Local Storage

The `CriteriaPresetService` provides full preset lifecycle management:

#### Features
- **Local Storage Persistence**: Automatic persistence to browser localStorage
- **Metadata Calculation**: Automatic calculation of complexity, condition count, and field/function usage
- **Search and Filtering**: Search presets by name, description, or tags
- **Import/Export**: Share presets between users or applications
- **Validation**: Ensures preset integrity and DSL validity
- **Version Management**: Tracks preset versions and updates

#### Preset Structure

```typescript
interface CriteriaPreset {
  id: string;
  name: string;
  description: string;
  dsl: CriteriaDSL;
  createdAt: string;
  updatedAt: string;
  version: number;
  tags: string[];
  metadata: {
    conditionCount: number;
    complexity: 'simple' | 'medium' | 'complex';
    hasGroups: boolean;
    fieldIds: string[];
    functionIds: string[];
  };
}
```

#### Usage Example

```typescript
import { CriteriaPresetService } from '@projects/criteria-builder';

// Save preset
const saveResult = presetService.savePreset(
  'My Filter',
  dsl,
  'Filter for high-value stocks'
);

// Load preset
const loadResult = presetService.loadPreset(presetId);
if (loadResult.success) {
  // Use loadResult.dsl
}

// Search presets
const results = presetService.searchPresets('stock');

// Export preset
const exportResult = presetService.exportPreset(presetId);
if (exportResult.success) {
  // Download exportResult.data as exportResult.filename
}

// Import preset
const importResult = presetService.importPreset(jsonString);
```

### Enhanced Toolbar Integration

The `AcBuilderToolbarComponent` has been enhanced with:

#### Import/Export Features
- **Loading States**: Visual feedback during import/export operations
- **Error Handling**: Comprehensive error display with detailed messages
- **Validation Results**: Shows import warnings and errors in a dialog
- **File Type Validation**: Ensures only JSON files are accepted

#### Preset Management Features
- **Enhanced Preset Display**: Shows complexity, condition count, and metadata
- **Preset Actions**: Export individual presets, delete with confirmation
- **Import Presets**: Import presets from files with validation
- **Preset Descriptions**: Support for preset descriptions and tags

## Security Considerations

### Import Validation
- **Structure Validation**: Ensures imported data has valid DSL structure
- **Content Validation**: Validates field IDs, function IDs, and values
- **Security Scanning**: Detects potentially malicious content patterns
- **Size Limits**: Enforces file size limits (default 10MB)

### Suspicious Content Detection
The system detects and blocks content containing:
- Script tags or JavaScript code
- HTML injection attempts
- Template injection patterns
- Eval or function calls

### Safe Practices
- Always validate imported content
- Use the `allowInvalid: false` option for production imports
- Implement additional sanitization in the UI layer
- Monitor for suspicious import attempts

## Error Handling

### Import Errors
- **JSON Parse Errors**: Invalid JSON format
- **Structure Errors**: Missing or invalid DSL structure
- **Validation Errors**: DSL content validation failures
- **Security Errors**: Suspicious content detected
- **File Errors**: Invalid file type or size

### Export Errors
- **Validation Errors**: Invalid DSL cannot be exported (unless `allowInvalid: true`)
- **Serialization Errors**: JSON serialization failures
- **File System Errors**: File download failures

### Preset Errors
- **Duplicate Names**: Preset name already exists
- **Storage Errors**: localStorage quota exceeded or unavailable
- **Validation Errors**: Invalid DSL in preset
- **Limit Errors**: Maximum preset count reached (50 presets)

## Performance Considerations

### Large DSL Structures
- The system can handle DSL structures with hundreds of conditions
- Export/import operations are synchronous but fast for typical use cases
- Consider chunking for extremely large DSL structures

### Storage Limits
- localStorage has browser-specific limits (typically 5-10MB)
- Preset service enforces a maximum of 50 presets
- Large presets with complex DSL structures consume more storage

### Memory Usage
- Import operations create deep copies of DSL structures
- Validation processes traverse the entire DSL tree
- Consider memory usage for applications with many concurrent operations

## Browser Compatibility

### localStorage Support
- Supported in all modern browsers
- Graceful degradation when localStorage is unavailable
- Automatic cleanup of corrupted data

### File API Support
- File import/export requires modern browser File API support
- Blob and URL.createObjectURL support required for downloads
- FileReader API required for file imports

## Migration and Versioning

### Schema Versioning
- Current schema version: 1.0
- Forward compatibility for minor version changes
- Breaking changes require major version updates

### Data Migration
- Automatic cleanup of invalid presets on load
- Version compatibility checking on import
- Graceful handling of legacy data formats

## Testing

### Unit Tests
- Comprehensive test coverage for all services
- Mock localStorage for consistent testing
- Security validation test cases
- Error condition testing

### Integration Tests
- End-to-end import/export workflows
- Preset lifecycle testing
- File operation simulation
- Performance testing with large datasets

## Best Practices

### For Developers
1. Always handle import/export errors gracefully
2. Provide user feedback during operations
3. Validate DSL before export operations
4. Use appropriate options for your use case
5. Implement proper error logging

### For Users
1. Export presets regularly as backups
2. Use descriptive names and descriptions for presets
3. Tag presets for better organization
4. Validate imported criteria before use
5. Be cautious with files from unknown sources

## API Reference

### CriteriaImportExportService

#### Methods
- `exportToJson(dsl, options?)`: Export DSL to JSON string
- `importFromJson(jsonString, options?)`: Import DSL from JSON string
- `exportToFile(dsl, filename?, options?)`: Export DSL to downloadable file
- `importFromFile(file, options?)`: Import DSL from file

#### Options
- `ExportOptions`: minify, includeValidation, allowInvalid, exportedBy, additionalMetadata
- `ImportOptions`: validateContent, allowInvalid, maxFileSize, importedBy

### CriteriaPresetService

#### Methods
- `savePreset(name, dsl, description?)`: Save new preset
- `loadPreset(id)`: Load preset by ID
- `updatePreset(id, updates)`: Update existing preset
- `deletePreset(id)`: Delete preset
- `exportPreset(id)`: Export preset to JSON
- `importPreset(jsonString, options?)`: Import preset from JSON
- `searchPresets(query)`: Search presets
- `getPresets()`: Get all presets
- `clearAllPresets()`: Clear all presets

#### Observable Streams
- `presets$`: Observable of current presets array
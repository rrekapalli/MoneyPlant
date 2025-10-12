import { Injectable } from '@angular/core';
import { CriteriaDSL, ValidationResult, ValidationError } from '../models/criteria-dsl.interface';
import { CriteriaSerializerService } from './criteria-serializer.service';

/**
 * Enhanced service for import/export functionality with comprehensive validation
 * Implements Requirements 10.1, 10.2, 10.3
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaImportExportService {

  constructor(private serializerService: CriteriaSerializerService) {}

  /**
   * Export DSL to JSON string with metadata inclusion
   * Requirement 10.1: Implement CriteriaDSL JSON serialization and deserialization
   * Requirement 10.3: Create export functionality with metadata inclusion
   */
  exportToJson(dsl: CriteriaDSL, options?: ExportOptions): ExportResult {
    try {
      // Validate DSL before export
      const validation = this.serializerService.validateDSL(dsl);
      if (!validation.isValid && !options?.allowInvalid) {
        return {
          success: false,
          errors: ['Cannot export invalid criteria. Please fix validation errors first.'],
          warnings: validation.errors.map(e => e.message)
        };
      }

      // Prepare export data with enhanced metadata
      const exportData: CriteriaDSL = {
        ...dsl,
        meta: {
          ...dsl.meta,
          exportedAt: new Date().toISOString(),
          exportedBy: options?.exportedBy || 'criteria-builder-ui',
          version: dsl.meta?.version || 1,
          exportVersion: '1.0.0',
          schemaVersion: '1.0',
          tags: dsl.meta?.tags || [],
          ...(options?.additionalMetadata || {})
        }
      };

      // Add validation results if requested
      if (options?.includeValidation) {
        exportData.validation = validation;
      }

      const jsonString = JSON.stringify(exportData, null, options?.minify ? 0 : 2);
      
      return {
        success: true,
        data: jsonString,
        metadata: exportData.meta
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Import DSL from JSON string with comprehensive validation
   * Requirement 10.1: Implement CriteriaDSL JSON serialization and deserialization
   * Requirement 10.2: Add import validation with error reporting
   */
  importFromJson(jsonString: string, options?: ImportOptions): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Parse JSON
      let parsed: any;
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        return {
          success: false,
          errors: [`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Parse error'}`]
        };
      }

      // Basic structure validation
      const structureValidation = this.validateImportStructure(parsed);
      if (!structureValidation.isValid) {
        return {
          success: false,
          errors: structureValidation.errors,
          warnings: structureValidation.warnings
        };
      }

      // Version compatibility check
      const versionCheck = this.checkVersionCompatibility(parsed);
      if (!versionCheck.compatible) {
        if (versionCheck.severity === 'error') {
          return {
            success: false,
            errors: [versionCheck.message]
          };
        } else {
          warnings.push(versionCheck.message);
        }
      }

      // Create DSL object
      const dsl: CriteriaDSL = {
        root: parsed.root,
        meta: {
          ...parsed.meta,
          importedAt: new Date().toISOString(),
          importedBy: options?.importedBy || 'criteria-builder-ui',
          originalExportedAt: parsed.meta?.exportedAt,
          originalExportedBy: parsed.meta?.exportedBy
        },
        validation: parsed.validation
      };

      // Perform comprehensive validation if requested
      if (options?.validateContent !== false) {
        const contentValidation = this.serializerService.validateDSL(dsl);
        if (!contentValidation.isValid) {
          if (options?.allowInvalid) {
            warnings.push('Imported criteria contains validation errors');
            warnings.push(...contentValidation.errors.map(e => e.message));
          } else {
            return {
              success: false,
              errors: ['Imported criteria is invalid'],
              validationErrors: contentValidation.errors,
              warnings: contentValidation.warnings?.map(w => w.message) || []
            };
          }
        }
      }

      // Security validation
      const securityCheck = this.performSecurityValidation(dsl);
      if (!securityCheck.safe) {
        return {
          success: false,
          errors: securityCheck.errors
        };
      }

      return {
        success: true,
        dsl,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: dsl.meta
      };

    } catch (error) {
      return {
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Export DSL to downloadable file
   * Requirement 10.3: Create export functionality with metadata inclusion
   */
  exportToFile(dsl: CriteriaDSL, filename?: string, options?: ExportOptions): boolean {
    const exportResult = this.exportToJson(dsl, options);
    
    if (!exportResult.success || !exportResult.data) {
      console.error('Export failed:', exportResult.errors);
      return false;
    }

    try {
      const blob = new Blob([exportResult.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || this.generateFileName(dsl);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('File download failed:', error);
      return false;
    }
  }

  /**
   * Import DSL from file
   * Requirement 10.2: Add import validation with error reporting
   */
  importFromFile(file: File, options?: ImportOptions): Promise<ImportResult> {
    return new Promise((resolve) => {
      if (!file) {
        resolve({
          success: false,
          errors: ['No file provided']
        });
        return;
      }

      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        resolve({
          success: false,
          errors: ['Invalid file type. Please select a JSON file.']
        });
        return;
      }

      if (file.size > (options?.maxFileSize || 10 * 1024 * 1024)) { // 10MB default
        resolve({
          success: false,
          errors: ['File too large. Maximum size is 10MB.']
        });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (!content) {
          resolve({
            success: false,
            errors: ['Failed to read file content']
          });
          return;
        }

        const result = this.importFromJson(content, options);
        resolve(result);
      };

      reader.onerror = () => {
        resolve({
          success: false,
          errors: ['Failed to read file']
        });
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate import structure
   */
  private validateImportStructure(data: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if data is an object
    if (!data || typeof data !== 'object') {
      errors.push('Invalid file format: Expected JSON object');
      return { isValid: false, errors, warnings };
    }

    // Check for required root property
    if (!data.root) {
      errors.push('Invalid criteria format: Missing root group');
      return { isValid: false, errors, warnings };
    }

    // Validate root structure
    if (!data.root.operator || !Array.isArray(data.root.children)) {
      errors.push('Invalid root group structure');
      return { isValid: false, errors, warnings };
    }

    // Check for valid operators
    if (!['AND', 'OR', 'NOT'].includes(data.root.operator)) {
      errors.push(`Invalid root operator: ${data.root.operator}`);
      return { isValid: false, errors, warnings };
    }

    // Validate metadata if present
    if (data.meta && typeof data.meta !== 'object') {
      warnings.push('Invalid metadata format, ignoring metadata');
    }

    return { isValid: true, errors, warnings };
  }

  /**
   * Check version compatibility
   */
  private checkVersionCompatibility(data: any): { compatible: boolean; message: string; severity: 'error' | 'warning' } {
    const currentSchemaVersion = '1.0';
    const dataSchemaVersion = data.meta?.schemaVersion;

    if (!dataSchemaVersion) {
      return {
        compatible: true,
        message: 'No schema version found, assuming compatibility',
        severity: 'warning'
      };
    }

    if (dataSchemaVersion !== currentSchemaVersion) {
      const [dataMajor] = dataSchemaVersion.split('.').map(Number);
      const [currentMajor] = currentSchemaVersion.split('.').map(Number);

      if (dataMajor > currentMajor) {
        return {
          compatible: false,
          message: `Incompatible schema version: ${dataSchemaVersion}. This version supports up to ${currentSchemaVersion}`,
          severity: 'error'
        };
      } else if (dataMajor < currentMajor) {
        return {
          compatible: true,
          message: `Older schema version detected: ${dataSchemaVersion}. Some features may not be available.`,
          severity: 'warning'
        };
      }
    }

    return {
      compatible: true,
      message: 'Schema version compatible',
      severity: 'warning'
    };
  }

  /**
   * Perform security validation to prevent malicious content
   */
  private performSecurityValidation(dsl: CriteriaDSL): { safe: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for suspicious patterns in field IDs and function IDs
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /eval/i,
      /function/i,
      /<.*>/,
      /\$\{.*\}/
    ];

    const checkValue = (value: any, path: string) => {
      if (typeof value === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            errors.push(`Suspicious content detected at ${path}: ${value}`);
          }
        }
      }
    };

    // Recursively check the DSL structure
    const checkGroup = (group: any, path: string) => {
      if (group.children && Array.isArray(group.children)) {
        group.children.forEach((child: any, index: number) => {
          const childPath = `${path}.children[${index}]`;
          
          if (child.left?.fieldId) {
            checkValue(child.left.fieldId, `${childPath}.left.fieldId`);
          }
          
          if (child.left?.functionId) {
            checkValue(child.left.functionId, `${childPath}.left.functionId`);
          }
          
          if (child.right?.value) {
            checkValue(child.right.value, `${childPath}.right.value`);
          }
          
          if (child.operator) {
            checkGroup(child, childPath);
          }
        });
      }
    };

    checkGroup(dsl.root, 'root');

    return {
      safe: errors.length === 0,
      errors
    };
  }

  /**
   * Generate filename for export
   */
  private generateFileName(dsl: CriteriaDSL): string {
    const name = dsl.meta?.name || 'criteria';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
    return `${sanitizedName}-${timestamp}.json`;
  }
}

// Type definitions for import/export operations

export interface ExportOptions {
  minify?: boolean;
  includeValidation?: boolean;
  allowInvalid?: boolean;
  exportedBy?: string;
  additionalMetadata?: Record<string, any>;
}

export interface ImportOptions {
  validateContent?: boolean;
  allowInvalid?: boolean;
  maxFileSize?: number;
  importedBy?: string;
}

export interface ExportResult {
  success: boolean;
  data?: string;
  metadata?: any;
  errors?: string[];
  warnings?: string[];
}

export interface ImportResult {
  success: boolean;
  dsl?: CriteriaDSL;
  metadata?: any;
  errors?: string[];
  warnings?: string[];
  validationErrors?: ValidationError[];
}
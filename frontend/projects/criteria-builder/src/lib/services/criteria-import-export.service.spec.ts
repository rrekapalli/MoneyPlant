import { TestBed } from '@angular/core/testing';
import { CriteriaImportExportService } from './criteria-import-export.service';
import { CriteriaSerializerService } from './criteria-serializer.service';
import { CriteriaDSL } from '../models/criteria-dsl.interface';

describe('CriteriaImportExportService', () => {
  let service: CriteriaImportExportService;
  let mockSerializerService: jasmine.SpyObj<CriteriaSerializerService>;

  const mockDSL: CriteriaDSL = {
    root: {
      operator: 'AND',
      children: [
        {
          left: { fieldId: 'price' },
          op: '>',
          right: { type: 'number', value: 100 }
        }
      ]
    },
    meta: {
      name: 'Test Criteria',
      version: 1
    }
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CriteriaSerializerService', ['validateDSL']);

    TestBed.configureTestingModule({
      providers: [
        CriteriaImportExportService,
        { provide: CriteriaSerializerService, useValue: spy }
      ]
    });

    service = TestBed.inject(CriteriaImportExportService);
    mockSerializerService = TestBed.inject(CriteriaSerializerService) as jasmine.SpyObj<CriteriaSerializerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportToJson', () => {
    it('should export valid DSL to JSON string', () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const result = service.exportToJson(mockDSL);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.metadata).toBeDefined();
      
      if (result.data) {
        const parsed = JSON.parse(result.data);
        expect(parsed.root).toEqual(mockDSL.root);
        expect(parsed.meta.exportedAt).toBeDefined();
        expect(parsed.meta.exportedBy).toBe('criteria-builder-ui');
      }
    });

    it('should fail to export invalid DSL when allowInvalid is false', () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: false,
        errors: [
          {
            id: '1',
            type: 'field_not_found',
            message: 'Field not found',
            path: '$.root.children[0].left',
            severity: 'error'
          }
        ],
        warnings: []
      });

      const result = service.exportToJson(mockDSL);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Cannot export invalid criteria. Please fix validation errors first.');
    });

    it('should export invalid DSL when allowInvalid is true', () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: false,
        errors: [
          {
            id: '1',
            type: 'field_not_found',
            message: 'Field not found',
            path: '$.root.children[0].left',
            severity: 'error'
          }
        ],
        warnings: []
      });

      const result = service.exportToJson(mockDSL, { allowInvalid: true });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should include validation results when requested', () => {
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };
      mockSerializerService.validateDSL.and.returnValue(validationResult);

      const result = service.exportToJson(mockDSL, { includeValidation: true });

      expect(result.success).toBe(true);
      if (result.data) {
        const parsed = JSON.parse(result.data);
        expect(parsed.validation).toEqual(validationResult);
      }
    });
  });

  describe('importFromJson', () => {
    it('should import valid JSON string', () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const jsonString = JSON.stringify(mockDSL);
      const result = service.importFromJson(jsonString);

      expect(result.success).toBe(true);
      expect(result.dsl).toBeDefined();
      expect(result.dsl?.root).toEqual(mockDSL.root);
      expect(result.dsl?.meta?.importedAt).toBeDefined();
    });

    it('should fail to import invalid JSON', () => {
      const invalidJson = '{ invalid json }';
      const result = service.importFromJson(invalidJson);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('Invalid JSON format');
    });

    it('should fail to import JSON with missing root', () => {
      const invalidDSL = { meta: { name: 'Test' } };
      const jsonString = JSON.stringify(invalidDSL);
      const result = service.importFromJson(jsonString);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Missing root group in DSL');
    });

    it('should fail to import JSON with invalid root structure', () => {
      const invalidDSL = { root: { invalid: 'structure' } };
      const jsonString = JSON.stringify(invalidDSL);
      const result = service.importFromJson(jsonString);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid root group structure');
    });

    it('should fail content validation when DSL is invalid', () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: false,
        errors: [
          {
            id: '1',
            type: 'field_not_found',
            message: 'Field not found',
            path: '$.root.children[0].left',
            severity: 'error'
          }
        ],
        warnings: []
      });

      const jsonString = JSON.stringify(mockDSL);
      const result = service.importFromJson(jsonString);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Imported criteria is invalid');
    });

    it('should import invalid DSL when allowInvalid is true', () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: false,
        errors: [
          {
            id: '1',
            type: 'field_not_found',
            message: 'Field not found',
            path: '$.root.children[0].left',
            severity: 'error'
          }
        ],
        warnings: []
      });

      const jsonString = JSON.stringify(mockDSL);
      const result = service.importFromJson(jsonString, { allowInvalid: true });

      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings).toContain('Imported criteria contains validation errors');
    });

    it('should skip content validation when validateContent is false', () => {
      const jsonString = JSON.stringify(mockDSL);
      const result = service.importFromJson(jsonString, { validateContent: false });

      expect(result.success).toBe(true);
      expect(mockSerializerService.validateDSL).not.toHaveBeenCalled();
    });
  });

  describe('importFromFile', () => {
    it('should import valid JSON file', async () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const jsonContent = JSON.stringify(mockDSL);
      const file = new File([jsonContent], 'test.json', { type: 'application/json' });

      const result = await service.importFromFile(file);

      expect(result.success).toBe(true);
      expect(result.dsl).toBeDefined();
    });

    it('should fail when no file is provided', async () => {
      const result = await service.importFromFile(null as any);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No file provided');
    });

    it('should fail when file type is not JSON', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      const result = await service.importFromFile(file);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid file type. Please select a JSON file.');
    });

    it('should fail when file is too large', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
      const file = new File([largeContent], 'test.json', { type: 'application/json' });

      const result = await service.importFromFile(file);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('File too large. Maximum size is 10MB.');
    });
  });

  describe('security validation', () => {
    it('should detect suspicious content in field IDs', () => {
      const maliciousDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [
            {
              left: { fieldId: '<script>alert("xss")</script>' },
              op: '=',
              right: { type: 'string', value: 'test' }
            }
          ]
        }
      };

      const jsonString = JSON.stringify(maliciousDSL);
      const result = service.importFromJson(jsonString, { validateContent: false });

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Suspicious content detected');
    });

    it('should detect suspicious content in function IDs', () => {
      const maliciousDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [
            {
              left: { functionId: 'eval(malicious_code)', params: [] },
              op: '=',
              right: { type: 'string', value: 'test' }
            }
          ]
        }
      };

      const jsonString = JSON.stringify(maliciousDSL);
      const result = service.importFromJson(jsonString, { validateContent: false });

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Suspicious content detected');
    });
  });

  describe('version compatibility', () => {
    it('should handle missing schema version', () => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const dslWithoutVersion = { ...mockDSL };
      delete dslWithoutVersion.meta;

      const jsonString = JSON.stringify(dslWithoutVersion);
      const result = service.importFromJson(jsonString);

      expect(result.success).toBe(true);
      expect(result.warnings).toContain('No schema version found, assuming compatibility');
    });

    it('should reject incompatible future versions', () => {
      const futureDSL = {
        ...mockDSL,
        meta: {
          ...mockDSL.meta,
          schemaVersion: '2.0'
        }
      };

      const jsonString = JSON.stringify(futureDSL);
      const result = service.importFromJson(jsonString);

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Incompatible schema version');
    });
  });
});
import { TestBed } from '@angular/core/testing';
import { CriteriaPresetService, CriteriaPreset } from './criteria-preset.service';
import { CriteriaSerializerService } from './criteria-serializer.service';
import { CriteriaDSL } from '../models/criteria-dsl.interface';

describe('CriteriaPresetService', () => {
  let service: CriteriaPresetService;
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
      version: 1,
      tags: ['test', 'price']
    }
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CriteriaSerializerService', ['validateDSL']);

    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        CriteriaPresetService,
        { provide: CriteriaSerializerService, useValue: spy }
      ]
    });

    service = TestBed.inject(CriteriaPresetService);
    mockSerializerService = TestBed.inject(CriteriaSerializerService) as jasmine.SpyObj<CriteriaSerializerService>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('savePreset', () => {
    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });
    });

    it('should save a valid preset', () => {
      const result = service.savePreset('Test Preset', mockDSL, 'Test description');

      expect(result.success).toBe(true);
      expect(result.preset).toBeDefined();
      expect(result.preset?.name).toBe('Test Preset');
      expect(result.preset?.description).toBe('Test description');
      expect(result.preset?.dsl).toEqual(mockDSL);
      expect(result.preset?.metadata.conditionCount).toBe(1);
      expect(result.preset?.metadata.complexity).toBe('simple');
    });

    it('should fail when name is empty', () => {
      const result = service.savePreset('', mockDSL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset name is required');
    });

    it('should fail when DSL is invalid', () => {
      const result = service.savePreset('Test', null as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid criteria data');
    });

    it('should fail when DSL validation fails', () => {
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

      const result = service.savePreset('Test Preset', mockDSL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot save invalid criteria as preset');
    });

    it('should fail when preset name already exists', () => {
      // Save first preset
      service.savePreset('Test Preset', mockDSL);

      // Try to save another with same name
      const result = service.savePreset('Test Preset', mockDSL);

      expect(result.success).toBe(false);
      expect(result.error).toBe('A preset with this name already exists');
    });

    it('should trim preset name and description', () => {
      const result = service.savePreset('  Test Preset  ', mockDSL, '  Test description  ');

      expect(result.success).toBe(true);
      expect(result.preset?.name).toBe('Test Preset');
      expect(result.preset?.description).toBe('Test description');
    });

    it('should calculate metadata correctly', () => {
      const complexDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [
            {
              left: { fieldId: 'price' },
              op: '>',
              right: { type: 'number', value: 100 }
            },
            {
              operator: 'OR',
              children: [
                {
                  left: { functionId: 'avg', params: [] },
                  op: '<',
                  right: { type: 'number', value: 50 }
                }
              ]
            }
          ]
        }
      };

      const result = service.savePreset('Complex Preset', complexDSL);

      expect(result.success).toBe(true);
      expect(result.preset?.metadata.conditionCount).toBe(2);
      expect(result.preset?.metadata.hasGroups).toBe(true);
      expect(result.preset?.metadata.fieldIds).toContain('price');
      expect(result.preset?.metadata.functionIds).toContain('avg');
    });
  });

  describe('loadPreset', () => {
    let savedPreset: CriteriaPreset;

    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const saveResult = service.savePreset('Test Preset', mockDSL);
      savedPreset = saveResult.preset!;
    });

    it('should load an existing preset', () => {
      const result = service.loadPreset(savedPreset.id);

      expect(result.success).toBe(true);
      expect(result.preset).toEqual(savedPreset);
      expect(result.dsl).toEqual(mockDSL);
    });

    it('should fail when preset does not exist', () => {
      const result = service.loadPreset('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset not found');
    });

    it('should fail when preset DSL is invalid', () => {
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

      const result = service.loadPreset(savedPreset.id);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset contains invalid criteria');
    });
  });

  describe('updatePreset', () => {
    let savedPreset: CriteriaPreset;

    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const saveResult = service.savePreset('Test Preset', mockDSL);
      savedPreset = saveResult.preset!;
    });

    it('should update preset name and description', () => {
      const result = service.updatePreset(savedPreset.id, {
        name: 'Updated Preset',
        description: 'Updated description'
      });

      expect(result.success).toBe(true);
      expect(result.preset?.name).toBe('Updated Preset');
      expect(result.preset?.description).toBe('Updated description');
      expect(result.preset?.version).toBe(savedPreset.version + 1);
    });

    it('should fail when preset does not exist', () => {
      const result = service.updatePreset('non-existent-id', { name: 'New Name' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset not found');
    });

    it('should fail when new name already exists', () => {
      // Save another preset
      service.savePreset('Another Preset', mockDSL);

      const result = service.updatePreset(savedPreset.id, { name: 'Another Preset' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('A preset with this name already exists');
    });

    it('should update DSL and recalculate metadata', () => {
      const newDSL: CriteriaDSL = {
        root: {
          operator: 'OR',
          children: [
            {
              left: { fieldId: 'volume' },
              op: '<',
              right: { type: 'number', value: 1000 }
            },
            {
              left: { fieldId: 'price' },
              op: '=',
              right: { type: 'number', value: 50 }
            }
          ]
        }
      };

      const result = service.updatePreset(savedPreset.id, { dsl: newDSL });

      expect(result.success).toBe(true);
      expect(result.preset?.dsl).toEqual(newDSL);
      expect(result.preset?.metadata.conditionCount).toBe(2);
      expect(result.preset?.metadata.fieldIds).toContain('volume');
      expect(result.preset?.metadata.fieldIds).toContain('price');
    });
  });

  describe('deletePreset', () => {
    let savedPreset: CriteriaPreset;

    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const saveResult = service.savePreset('Test Preset', mockDSL);
      savedPreset = saveResult.preset!;
    });

    it('should delete an existing preset', () => {
      const result = service.deletePreset(savedPreset.id);

      expect(result.success).toBe(true);
      expect(result.preset).toEqual(savedPreset);

      // Verify preset is removed
      const presets = service.getPresets();
      expect(presets.length).toBe(0);
    });

    it('should fail when preset does not exist', () => {
      const result = service.deletePreset('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset not found');
    });
  });

  describe('exportPreset', () => {
    let savedPreset: CriteriaPreset;

    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      const saveResult = service.savePreset('Test Preset', mockDSL);
      savedPreset = saveResult.preset!;
    });

    it('should export preset to JSON', () => {
      const result = service.exportPreset(savedPreset.id);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.filename).toBeDefined();

      if (result.data) {
        const parsed = JSON.parse(result.data);
        expect(parsed.name).toBe(savedPreset.name);
        expect(parsed.dsl).toEqual(savedPreset.dsl);
        expect(parsed.exportedAt).toBeDefined();
      }
    });

    it('should fail when preset does not exist', () => {
      const result = service.exportPreset('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Preset not found');
    });
  });

  describe('importPreset', () => {
    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });
    });

    it('should import valid preset JSON', () => {
      const presetData = {
        name: 'Imported Preset',
        description: 'Imported description',
        dsl: mockDSL,
        tags: ['imported']
      };

      const jsonString = JSON.stringify(presetData);
      const result = service.importPreset(jsonString);

      expect(result.success).toBe(true);
      expect(result.preset?.name).toBe('Imported Preset');
      expect(result.preset?.description).toBe('Imported description');
      expect(result.preset?.dsl).toEqual(mockDSL);
    });

    it('should fail with invalid JSON', () => {
      const result = service.importPreset('{ invalid json }');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON format');
    });

    it('should fail with invalid preset structure', () => {
      const invalidPreset = { name: 'Test' }; // Missing dsl
      const jsonString = JSON.stringify(invalidPreset);
      const result = service.importPreset(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid preset format');
    });

    it('should fail when preset name already exists', () => {
      // Save a preset first
      service.savePreset('Existing Preset', mockDSL);

      const presetData = {
        name: 'Existing Preset',
        dsl: mockDSL
      };

      const jsonString = JSON.stringify(presetData);
      const result = service.importPreset(jsonString);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    it('should overwrite existing preset when overwriteExisting is true', () => {
      // Save a preset first
      const saveResult = service.savePreset('Existing Preset', mockDSL);
      const originalId = saveResult.preset!.id;

      const presetData = {
        name: 'Existing Preset',
        description: 'Updated description',
        dsl: mockDSL
      };

      const jsonString = JSON.stringify(presetData);
      const result = service.importPreset(jsonString, { overwriteExisting: true });

      expect(result.success).toBe(true);
      expect(result.preset?.id).toBe(originalId);
      expect(result.preset?.description).toBe('Updated description');
    });
  });

  describe('searchPresets', () => {
    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });

      // Save multiple presets
      service.savePreset('Price Filter', mockDSL, 'Filter by price');
      service.savePreset('Volume Filter', mockDSL, 'Filter by volume');
      service.savePreset('Advanced Search', mockDSL, 'Complex filtering');
    });

    it('should return all presets when query is empty', () => {
      const results = service.searchPresets('');
      expect(results.length).toBe(3);
    });

    it('should search by name', () => {
      const results = service.searchPresets('price');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Price Filter');
    });

    it('should search by description', () => {
      const results = service.searchPresets('complex');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Advanced Search');
    });

    it('should be case insensitive', () => {
      const results = service.searchPresets('VOLUME');
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Volume Filter');
    });
  });

  describe('localStorage integration', () => {
    beforeEach(() => {
      mockSerializerService.validateDSL.and.returnValue({
        isValid: true,
        errors: [],
        warnings: []
      });
    });

    it('should persist presets to localStorage', () => {
      service.savePreset('Test Preset', mockDSL);

      const stored = localStorage.getItem('criteria-builder-presets');
      expect(stored).toBeDefined();

      if (stored) {
        const presets = JSON.parse(stored);
        expect(presets.length).toBe(1);
        expect(presets[0].name).toBe('Test Preset');
      }
    });

    it('should load presets from localStorage on initialization', () => {
      // Manually add preset to localStorage
      const preset: CriteriaPreset = {
        id: 'test-id',
        name: 'Stored Preset',
        description: '',
        dsl: mockDSL,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        tags: [],
        metadata: {
          conditionCount: 1,
          complexity: 'simple',
          hasGroups: false,
          fieldIds: ['price'],
          functionIds: []
        }
      };

      localStorage.setItem('criteria-builder-presets', JSON.stringify([preset]));

      // Create new service instance to trigger loading
      const newService = new CriteriaPresetService(mockSerializerService);
      const presets = newService.getPresets();

      expect(presets.length).toBe(1);
      expect(presets[0].name).toBe('Stored Preset');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('criteria-builder-presets', 'invalid json');

      // Create new service instance
      const newService = new CriteriaPresetService(mockSerializerService);
      const presets = newService.getPresets();

      expect(presets.length).toBe(0);
    });
  });
});
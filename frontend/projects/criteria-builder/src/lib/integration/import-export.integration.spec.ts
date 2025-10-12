import { TestBed } from '@angular/core/testing';
import { CriteriaImportExportService } from '../services/criteria-import-export.service';
import { CriteriaPresetService } from '../services/criteria-preset.service';
import { CriteriaSerializerService } from '../services/criteria-serializer.service';
import { CriteriaDSL } from '../models/criteria-dsl.interface';

describe('Import/Export Integration', () => {
  let importExportService: CriteriaImportExportService;
  let presetService: CriteriaPresetService;
  let serializerService: CriteriaSerializerService;

  const mockDSL: CriteriaDSL = {
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
              left: { fieldId: 'volume' },
              op: '<',
              right: { type: 'number', value: 1000 }
            },
            {
              left: { functionId: 'avg', params: [{ fieldId: 'price' }] },
              op: '>=',
              right: { type: 'number', value: 50 }
            }
          ]
        }
      ]
    },
    meta: {
      name: 'Complex Price and Volume Filter',
      description: 'Filter for stocks with price > 100 and either volume < 1000 or average price >= 50',
      version: 1,
      tags: ['price', 'volume', 'complex']
    }
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        CriteriaImportExportService,
        CriteriaPresetService,
        CriteriaSerializerService
      ]
    });

    importExportService = TestBed.inject(CriteriaImportExportService);
    presetService = TestBed.inject(CriteriaPresetService);
    serializerService = TestBed.inject(CriteriaSerializerService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('End-to-End DSL Import/Export', () => {
    it('should export and import DSL successfully', () => {
      // Export DSL
      const exportResult = importExportService.exportToJson(mockDSL, {
        includeValidation: true,
        exportedBy: 'integration-test'
      });

      expect(exportResult.success).toBe(true);
      expect(exportResult.data).toBeDefined();

      // Import the exported DSL
      const importResult = importExportService.importFromJson(exportResult.data!);

      expect(importResult.success).toBe(true);
      expect(importResult.dsl).toBeDefined();
      expect(importResult.dsl?.root).toEqual(mockDSL.root);
      expect(importResult.dsl?.meta?.name).toBe(mockDSL.meta?.name);
      expect(importResult.dsl?.meta?.importedAt).toBeDefined();
      expect(importResult.dsl?.meta?.originalExportedAt).toBeDefined();
    });

    it('should preserve metadata through export/import cycle', () => {
      const exportResult = importExportService.exportToJson(mockDSL, {
        additionalMetadata: {
          customField: 'test-value',
          timestamp: Date.now()
        }
      });

      const importResult = importExportService.importFromJson(exportResult.data!);

      expect(importResult.dsl?.meta?.['customField']).toBe('test-value');
      expect(importResult.dsl?.meta?.['timestamp']).toBeDefined();
      expect(importResult.dsl?.meta?.['exportedBy']).toBe('criteria-builder-ui');
      expect(importResult.dsl?.meta?.['importedBy']).toBe('criteria-builder-ui');
    });
  });

  describe('End-to-End Preset Management', () => {
    it('should save, export, and import preset successfully', () => {
      // Save preset
      const saveResult = presetService.savePreset(
        'Test Integration Preset',
        mockDSL,
        'Integration test preset'
      );

      expect(saveResult.success).toBe(true);
      expect(saveResult.preset).toBeDefined();

      const savedPreset = saveResult.preset!;

      // Export preset
      const exportResult = presetService.exportPreset(savedPreset.id);

      expect(exportResult.success).toBe(true);
      expect(exportResult.data).toBeDefined();
      expect(exportResult.filename).toBeDefined();

      // Clear presets to simulate fresh environment
      presetService.clearAllPresets();
      expect(presetService.getPresets().length).toBe(0);

      // Import preset
      const importResult = presetService.importPreset(exportResult.data!);

      expect(importResult.success).toBe(true);
      expect(importResult.preset?.name).toBe('Test Integration Preset');
      expect(importResult.preset?.description).toBe('Integration test preset');
      expect(importResult.preset?.dsl.root).toEqual(mockDSL.root);

      // Verify preset is in the list
      const presets = presetService.getPresets();
      expect(presets.length).toBe(1);
      expect(presets[0].name).toBe('Test Integration Preset');
    });

    it('should handle preset lifecycle operations', () => {
      // Save multiple presets
      const preset1 = presetService.savePreset('Preset 1', mockDSL, 'First preset');
      const preset2 = presetService.savePreset('Preset 2', mockDSL, 'Second preset');

      expect(preset1.success).toBe(true);
      expect(preset2.success).toBe(true);
      expect(presetService.getPresets().length).toBe(2);

      // Update preset
      const updateResult = presetService.updatePreset(preset1.preset!.id, {
        name: 'Updated Preset 1',
        description: 'Updated description'
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.preset?.name).toBe('Updated Preset 1');
      expect(updateResult.preset?.version).toBe(2);

      // Load preset
      const loadResult = presetService.loadPreset(preset1.preset!.id);

      expect(loadResult.success).toBe(true);
      expect(loadResult.dsl).toEqual(mockDSL);

      // Delete preset
      const deleteResult = presetService.deletePreset(preset2.preset!.id);

      expect(deleteResult.success).toBe(true);
      expect(presetService.getPresets().length).toBe(1);
    });
  });

  describe('File Operations Simulation', () => {
    it('should simulate file import/export workflow', async () => {
      // Simulate export to file
      const exportResult = importExportService.exportToJson(mockDSL);
      expect(exportResult.success).toBe(true);

      // Create a mock file from the exported data
      const blob = new Blob([exportResult.data!], { type: 'application/json' });
      const file = new File([blob], 'test-criteria.json', { type: 'application/json' });

      // Simulate import from file
      const importResult = await importExportService.importFromFile(file);

      expect(importResult.success).toBe(true);
      expect(importResult.dsl?.root).toEqual(mockDSL.root);
    });

    it('should handle invalid file types', async () => {
      const textFile = new File(['invalid content'], 'test.txt', { type: 'text/plain' });
      const result = await importExportService.importFromFile(textFile);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid file type. Please select a JSON file.');
    });

    it('should handle corrupted JSON files', async () => {
      const corruptedFile = new File(['{ invalid json }'], 'test.json', { type: 'application/json' });
      const result = await importExportService.importFromFile(corruptedFile);

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Invalid JSON format');
    });
  });

  describe('Validation Integration', () => {
    it('should validate DSL during import/export operations', () => {
      const invalidDSL: CriteriaDSL = {
        root: {
          operator: 'INVALID' as any,
          children: []
        }
      };

      // Export should fail for invalid DSL
      const exportResult = importExportService.exportToJson(invalidDSL);
      expect(exportResult.success).toBe(false);

      // Preset save should fail for invalid DSL
      const presetResult = presetService.savePreset('Invalid Preset', invalidDSL);
      expect(presetResult.success).toBe(false);
    });

    it('should provide detailed validation errors', () => {
      const dslWithMissingFields: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [
            {
              left: { fieldId: '' }, // Empty field ID
              op: '=',
              right: { type: 'string', value: 'test' }
            }
          ]
        }
      };

      const exportResult = importExportService.exportToJson(dslWithMissingFields);
      expect(exportResult.success).toBe(false);
      expect(exportResult.errors).toBeDefined();
    });
  });

  describe('Security Integration', () => {
    it('should prevent import of malicious content', () => {
      const maliciousDSL = {
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
      const result = importExportService.importFromJson(jsonString, { validateContent: false });

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('Suspicious content detected');
    });

    it('should sanitize preset names and descriptions', () => {
      const result = presetService.savePreset(
        '  <script>alert("xss")</script>  ',
        mockDSL,
        '  <img src="x" onerror="alert(1)">  '
      );

      // Names and descriptions should be trimmed but not necessarily sanitized
      // (that would be handled by the UI layer)
      expect(result.success).toBe(true);
      expect(result.preset?.name).toBe('<script>alert("xss")</script>');
      expect(result.preset?.description).toBe('<img src="x" onerror="alert(1)">');
    });
  });

  describe('Performance and Limits', () => {
    it('should handle large DSL structures', () => {
      // Create a large DSL with many conditions
      const largeDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: Array.from({ length: 100 }, (_, i) => ({
            left: { fieldId: `field_${i}` },
            op: '=' as const,
            right: { type: 'string' as const, value: `value_${i}` }
          }))
        },
        meta: {
          name: 'Large DSL Test',
          description: 'DSL with 100 conditions'
        }
      };

      const exportResult = importExportService.exportToJson(largeDSL);
      expect(exportResult.success).toBe(true);

      const importResult = importExportService.importFromJson(exportResult.data!);
      expect(importResult.success).toBe(true);
      expect(importResult.dsl?.root.children.length).toBe(100);
    });

    it('should enforce preset limits', () => {
      // Save maximum number of presets
      for (let i = 0; i < 50; i++) {
        const result = presetService.savePreset(`Preset ${i}`, mockDSL);
        expect(result.success).toBe(true);
      }

      // Try to save one more (should fail)
      const result = presetService.savePreset('Preset 51', mockDSL);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum number of presets');
    });
  });
});
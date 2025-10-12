import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CriteriaDSL } from '../models/criteria-dsl.interface';
import { CriteriaSerializerService } from './criteria-serializer.service';

/**
 * Service for preset management with local storage
 * Implements Requirements 10.4, 10.5
 */
@Injectable({
  providedIn: 'root'
})
export class CriteriaPresetService {
  private readonly STORAGE_KEY = 'criteria-builder-presets';
  private readonly MAX_PRESETS = 50;
  
  private presetsSubject = new BehaviorSubject<CriteriaPreset[]>([]);
  public presets$ = this.presetsSubject.asObservable();

  constructor(private serializerService: CriteriaSerializerService) {
    this.loadPresets();
  }

  /**
   * Get all presets
   * Requirement 10.4: Implement save/load preset functionality
   */
  getPresets(): CriteriaPreset[] {
    return this.presetsSubject.value;
  }

  /**
   * Save a new preset
   * Requirement 10.4: Implement save/load preset functionality
   */
  savePreset(name: string, dsl: CriteriaDSL, description?: string): PresetOperationResult {
    try {
      // Validate inputs
      if (!name || name.trim().length === 0) {
        return {
          success: false,
          error: 'Preset name is required'
        };
      }

      if (!dsl || !dsl.root) {
        return {
          success: false,
          error: 'Invalid criteria data'
        };
      }

      const trimmedName = name.trim();
      
      // Check for duplicate names
      const existingPresets = this.presetsSubject.value;
      if (existingPresets.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
        return {
          success: false,
          error: 'A preset with this name already exists'
        };
      }

      // Check preset limit
      if (existingPresets.length >= this.MAX_PRESETS) {
        return {
          success: false,
          error: `Maximum number of presets (${this.MAX_PRESETS}) reached. Please delete some presets first.`
        };
      }

      // Validate DSL
      const validation = this.serializerService.validateDSL(dsl);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Cannot save invalid criteria as preset',
          validationErrors: validation.errors
        };
      }

      // Create preset
      const preset: CriteriaPreset = {
        id: this.generateId(),
        name: trimmedName,
        description: description?.trim() || '',
        dsl: this.deepClone(dsl),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        tags: dsl.meta?.tags || [],
        metadata: {
          conditionCount: this.countConditions(dsl),
          complexity: this.calculateComplexity(dsl),
          hasGroups: this.hasNestedGroups(dsl),
          fieldIds: this.extractFieldIds(dsl),
          functionIds: this.extractFunctionIds(dsl)
        }
      };

      // Add to presets
      const updatedPresets = [...existingPresets, preset];
      this.presetsSubject.next(updatedPresets);
      this.saveToStorage(updatedPresets);

      return {
        success: true,
        preset
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save preset: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Load a preset by ID
   * Requirement 10.4: Implement save/load preset functionality
   */
  loadPreset(id: string): PresetOperationResult {
    try {
      const presets = this.presetsSubject.value;
      const preset = presets.find(p => p.id === id);
      
      if (!preset) {
        return {
          success: false,
          error: 'Preset not found'
        };
      }

      // Validate preset DSL before loading
      const validation = this.serializerService.validateDSL(preset.dsl);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Preset contains invalid criteria',
          validationErrors: validation.errors
        };
      }

      return {
        success: true,
        preset,
        dsl: this.deepClone(preset.dsl)
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to load preset: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update an existing preset
   * Requirement 10.4: Implement save/load preset functionality
   */
  updatePreset(id: string, updates: Partial<Pick<CriteriaPreset, 'name' | 'description' | 'dsl' | 'tags'>>): PresetOperationResult {
    try {
      const presets = this.presetsSubject.value;
      const presetIndex = presets.findIndex(p => p.id === id);
      
      if (presetIndex === -1) {
        return {
          success: false,
          error: 'Preset not found'
        };
      }

      const existingPreset = presets[presetIndex];
      
      // Validate name uniqueness if name is being updated
      if (updates.name && updates.name !== existingPreset.name) {
        const trimmedName = updates.name.trim();
        if (presets.some(p => p.id !== id && p.name.toLowerCase() === trimmedName.toLowerCase())) {
          return {
            success: false,
            error: 'A preset with this name already exists'
          };
        }
      }

      // Validate DSL if being updated
      if (updates.dsl) {
        const validation = this.serializerService.validateDSL(updates.dsl);
        if (!validation.isValid) {
          return {
            success: false,
            error: 'Cannot update preset with invalid criteria',
            validationErrors: validation.errors
          };
        }
      }

      // Create updated preset
      const updatedPreset: CriteriaPreset = {
        ...existingPreset,
        ...updates,
        name: updates.name?.trim() || existingPreset.name,
        description: updates.description?.trim() ?? existingPreset.description,
        updatedAt: new Date().toISOString(),
        version: existingPreset.version + 1,
        metadata: updates.dsl ? {
          conditionCount: this.countConditions(updates.dsl),
          complexity: this.calculateComplexity(updates.dsl),
          hasGroups: this.hasNestedGroups(updates.dsl),
          fieldIds: this.extractFieldIds(updates.dsl),
          functionIds: this.extractFunctionIds(updates.dsl)
        } : existingPreset.metadata
      };

      // Update presets array
      const updatedPresets = [...presets];
      updatedPresets[presetIndex] = updatedPreset;
      this.presetsSubject.next(updatedPresets);
      this.saveToStorage(updatedPresets);

      return {
        success: true,
        preset: updatedPreset
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update preset: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Delete a preset
   * Requirement 10.4: Implement save/load preset functionality
   */
  deletePreset(id: string): PresetOperationResult {
    try {
      const presets = this.presetsSubject.value;
      const presetIndex = presets.findIndex(p => p.id === id);
      
      if (presetIndex === -1) {
        return {
          success: false,
          error: 'Preset not found'
        };
      }

      const deletedPreset = presets[presetIndex];
      const updatedPresets = presets.filter(p => p.id !== id);
      
      this.presetsSubject.next(updatedPresets);
      this.saveToStorage(updatedPresets);

      return {
        success: true,
        preset: deletedPreset
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete preset: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Export preset to JSON
   * Requirement 10.5: Add preset sharing and import/export capabilities
   */
  exportPreset(id: string): PresetExportResult {
    try {
      const preset = this.presetsSubject.value.find(p => p.id === id);
      
      if (!preset) {
        return {
          success: false,
          error: 'Preset not found'
        };
      }

      const exportData = {
        ...preset,
        exportedAt: new Date().toISOString(),
        exportVersion: '1.0.0'
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      return {
        success: true,
        data: jsonString,
        filename: `preset-${preset.name.replace(/[^a-zA-Z0-9-_]/g, '_')}-${new Date().toISOString().slice(0, 10)}.json`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to export preset: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Import preset from JSON
   * Requirement 10.5: Add preset sharing and import/export capabilities
   */
  importPreset(jsonString: string, options?: { overwriteExisting?: boolean }): PresetOperationResult {
    try {
      let parsed: any;
      
      try {
        parsed = JSON.parse(jsonString);
      } catch (parseError) {
        return {
          success: false,
          error: 'Invalid JSON format'
        };
      }

      // Validate preset structure
      if (!this.isValidPresetStructure(parsed)) {
        return {
          success: false,
          error: 'Invalid preset format'
        };
      }

      // Check for existing preset with same name
      const existingPresets = this.presetsSubject.value;
      const existingPreset = existingPresets.find(p => p.name.toLowerCase() === parsed.name.toLowerCase());
      
      if (existingPreset && !options?.overwriteExisting) {
        return {
          success: false,
          error: `A preset named "${parsed.name}" already exists. Choose a different name or enable overwrite.`
        };
      }

      // Validate DSL
      const validation = this.serializerService.validateDSL(parsed.dsl);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Imported preset contains invalid criteria',
          validationErrors: validation.errors
        };
      }

      // Create or update preset
      const preset: CriteriaPreset = {
        id: existingPreset?.id || this.generateId(),
        name: parsed.name,
        description: parsed.description || '',
        dsl: parsed.dsl,
        createdAt: existingPreset?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: (existingPreset?.version || 0) + 1,
        tags: parsed.tags || [],
        metadata: {
          conditionCount: this.countConditions(parsed.dsl),
          complexity: this.calculateComplexity(parsed.dsl),
          hasGroups: this.hasNestedGroups(parsed.dsl),
          fieldIds: this.extractFieldIds(parsed.dsl),
          functionIds: this.extractFunctionIds(parsed.dsl)
        }
      };

      // Update presets
      let updatedPresets: CriteriaPreset[];
      if (existingPreset) {
        updatedPresets = existingPresets.map(p => p.id === preset.id ? preset : p);
      } else {
        updatedPresets = [...existingPresets, preset];
      }

      this.presetsSubject.next(updatedPresets);
      this.saveToStorage(updatedPresets);

      return {
        success: true,
        preset
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to import preset: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Search presets by name, description, or tags
   */
  searchPresets(query: string): CriteriaPreset[] {
    if (!query || query.trim().length === 0) {
      return this.presetsSubject.value;
    }

    const searchTerm = query.toLowerCase().trim();
    return this.presetsSubject.value.filter(preset => 
      preset.name.toLowerCase().includes(searchTerm) ||
      preset.description.toLowerCase().includes(searchTerm) ||
      preset.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get presets by tag
   */
  getPresetsByTag(tag: string): CriteriaPreset[] {
    return this.presetsSubject.value.filter(preset => 
      preset.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  /**
   * Clear all presets
   */
  clearAllPresets(): boolean {
    try {
      this.presetsSubject.next([]);
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear presets:', error);
      return false;
    }
  }

  // Private helper methods

  private loadPresets(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const presets = JSON.parse(stored) as CriteriaPreset[];
        // Validate each preset
        const validPresets = presets.filter(preset => this.isValidPresetStructure(preset));
        this.presetsSubject.next(validPresets);
        
        // If some presets were invalid, save the cleaned list
        if (validPresets.length !== presets.length) {
          this.saveToStorage(validPresets);
        }
      }
    } catch (error) {
      console.warn('Failed to load presets from storage:', error);
      this.presetsSubject.next([]);
    }
  }

  private saveToStorage(presets: CriteriaPreset[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error('Failed to save presets to storage:', error);
    }
  }

  private isValidPresetStructure(preset: any): preset is CriteriaPreset {
    return (
      preset &&
      typeof preset === 'object' &&
      typeof preset.name === 'string' &&
      preset.dsl &&
      typeof preset.dsl === 'object' &&
      preset.dsl.root &&
      typeof preset.dsl.root === 'object'
    );
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private countConditions(dsl: CriteriaDSL): number {
    let count = 0;
    
    const countInGroup = (group: any) => {
      if (group.children && Array.isArray(group.children)) {
        group.children.forEach((child: any) => {
          if (child.left && child.op) {
            count++;
          } else if (child.operator) {
            countInGroup(child);
          }
        });
      }
    };
    
    countInGroup(dsl.root);
    return count;
  }

  private calculateComplexity(dsl: CriteriaDSL): 'simple' | 'medium' | 'complex' {
    const conditionCount = this.countConditions(dsl);
    const hasGroups = this.hasNestedGroups(dsl);
    const hasFunctions = this.extractFunctionIds(dsl).length > 0;
    
    if (conditionCount <= 2 && !hasGroups && !hasFunctions) {
      return 'simple';
    } else if (conditionCount <= 5 && (!hasGroups || !hasFunctions)) {
      return 'medium';
    } else {
      return 'complex';
    }
  }

  private hasNestedGroups(dsl: CriteriaDSL): boolean {
    const checkNesting = (group: any, depth: number): boolean => {
      if (depth > 0 && group.operator) {
        return true;
      }
      
      if (group.children && Array.isArray(group.children)) {
        return group.children.some((child: any) => 
          child.operator && checkNesting(child, depth + 1)
        );
      }
      
      return false;
    };
    
    return checkNesting(dsl.root, 0);
  }

  private extractFieldIds(dsl: CriteriaDSL): string[] {
    const fieldIds = new Set<string>();
    
    const extractFromGroup = (group: any) => {
      if (group.children && Array.isArray(group.children)) {
        group.children.forEach((child: any) => {
          if (child.left?.fieldId) {
            fieldIds.add(child.left.fieldId);
          }
          if (child.right?.fieldId) {
            fieldIds.add(child.right.fieldId);
          }
          if (child.operator) {
            extractFromGroup(child);
          }
        });
      }
    };
    
    extractFromGroup(dsl.root);
    return Array.from(fieldIds);
  }

  private extractFunctionIds(dsl: CriteriaDSL): string[] {
    const functionIds = new Set<string>();
    
    const extractFromGroup = (group: any) => {
      if (group.children && Array.isArray(group.children)) {
        group.children.forEach((child: any) => {
          if (child.left?.functionId) {
            functionIds.add(child.left.functionId);
          }
          if (child.right?.functionId) {
            functionIds.add(child.right.functionId);
          }
          if (child.operator) {
            extractFromGroup(child);
          }
        });
      }
    };
    
    extractFromGroup(dsl.root);
    return Array.from(functionIds);
  }
}

// Type definitions

export interface CriteriaPreset {
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

export interface PresetOperationResult {
  success: boolean;
  preset?: CriteriaPreset;
  dsl?: CriteriaDSL;
  error?: string;
  validationErrors?: any[];
}

export interface PresetExportResult {
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}
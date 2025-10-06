import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CriteriaDSL, BuilderConfig } from '../../models';

/**
 * Builder Toolbar Component for mode switching and actions
 * Provides simple/advanced mode toggle, import/export functionality,
 * preset management, and SQL preview toggle
 */
@Component({
  selector: 'ac-builder-toolbar',
  standalone: false,
  templateUrl: './ac-builder-toolbar.component.html',
  styleUrls: ['./ac-builder-toolbar.component.scss']
})
export class AcBuilderToolbarComponent {
  @Input() currentDSL: CriteriaDSL | null = null;
  @Input() mode: 'simple' | 'advanced' | null = 'simple';
  @Input() config: BuilderConfig = {};
  
  @Output() modeChange = new EventEmitter<'simple' | 'advanced'>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() addCondition = new EventEmitter<void>();
  @Output() importDSL = new EventEmitter<CriteriaDSL>();
  @Output() exportDSL = new EventEmitter<void>();
  @Output() sqlPreviewToggle = new EventEmitter<boolean>();
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  // Preset management state
  presets: Array<{name: string, dsl: CriteriaDSL, createdAt: string}> = [];
  showPresetMenu = false;
  newPresetName = '';
  showSavePresetDialog = false;
  
  // SQL preview state
  showSqlPreview = false;
  
  constructor() {
    this.loadPresets();
    this.showSqlPreview = this.config.showSqlPreview || false;
  }
  
  /**
   * Toggle between simple and advanced modes
   */
  onModeToggle(): void {
    const newMode = this.mode === 'simple' ? 'advanced' : 'simple';
    this.modeChange.emit(newMode);
  }
  
  /**
   * Handle import functionality with JSON file handling
   */
  onImport(): void {
    this.fileInput.nativeElement.click();
  }
  
  /**
   * Process imported file
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedDSL = JSON.parse(content) as CriteriaDSL;
          
          // Basic validation of imported DSL structure
          if (this.isValidDSLStructure(importedDSL)) {
            this.importDSL.emit(importedDSL);
          } else {
            alert('Invalid criteria file format. Please select a valid criteria JSON file.');
          }
        } catch (error) {
          alert('Error reading file. Please ensure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please select a JSON file.');
    }
    
    // Reset file input
    input.value = '';
  }
  
  /**
   * Handle export functionality with JSON file download
   */
  onExport(): void {
    if (!this.currentDSL) {
      alert('No criteria to export.');
      return;
    }
    
    const exportData = {
      ...this.currentDSL,
      meta: {
        ...this.currentDSL.meta,
        exportedAt: new Date().toISOString(),
        exportedBy: 'criteria-builder-ui'
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `criteria-${this.generateFileName()}.json`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
    
    this.exportDSL.emit();
  }
  
  /**
   * Clear all conditions
   */
  onClearAll(): void {
    if (this.currentDSL && this.currentDSL.root.children.length > 0) {
      if (confirm('Are you sure you want to clear all conditions? This action cannot be undone.')) {
        this.clearAll.emit();
      }
    }
  }
  
  /**
   * Toggle SQL preview panel
   */
  onSqlPreviewToggle(): void {
    this.showSqlPreview = !this.showSqlPreview;
    this.sqlPreviewToggle.emit(this.showSqlPreview);
  }
  
  /**
   * Show save preset dialog
   */
  onSavePreset(): void {
    if (!this.currentDSL || this.currentDSL.root.children.length === 0) {
      alert('No criteria to save as preset.');
      return;
    }
    
    this.newPresetName = '';
    this.showSavePresetDialog = true;
  }
  
  /**
   * Save current criteria as preset
   */
  savePreset(): void {
    if (!this.newPresetName.trim()) {
      alert('Please enter a name for the preset.');
      return;
    }
    
    if (!this.currentDSL) {
      return;
    }
    
    const preset = {
      name: this.newPresetName.trim(),
      dsl: { ...this.currentDSL },
      createdAt: new Date().toISOString()
    };
    
    this.presets.push(preset);
    this.savePresets();
    this.showSavePresetDialog = false;
    this.newPresetName = '';
  }
  
  /**
   * Load a saved preset
   */
  loadPreset(preset: {name: string, dsl: CriteriaDSL, createdAt: string}): void {
    if (confirm(`Load preset "${preset.name}"? This will replace the current criteria.`)) {
      this.importDSL.emit(preset.dsl);
      this.showPresetMenu = false;
    }
  }
  
  /**
   * Delete a saved preset
   */
  deletePreset(index: number, event: Event): void {
    event.stopPropagation();
    
    const preset = this.presets[index];
    if (confirm(`Delete preset "${preset.name}"?`)) {
      this.presets.splice(index, 1);
      this.savePresets();
    }
  }
  
  /**
   * Cancel save preset dialog
   */
  cancelSavePreset(): void {
    this.showSavePresetDialog = false;
    this.newPresetName = '';
  }
  
  /**
   * Load presets from local storage
   */
  private loadPresets(): void {
    try {
      const stored = localStorage.getItem('criteria-builder-presets');
      if (stored) {
        this.presets = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load presets from local storage:', error);
      this.presets = [];
    }
  }
  
  /**
   * Save presets to local storage
   */
  private savePresets(): void {
    try {
      localStorage.setItem('criteria-builder-presets', JSON.stringify(this.presets));
    } catch (error) {
      console.warn('Failed to save presets to local storage:', error);
    }
  }
  
  /**
   * Generate filename for export
   */
  private generateFileName(): string {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    return `${timestamp}`;
  }
  
  /**
   * Basic validation of DSL structure
   */
  private isValidDSLStructure(dsl: any): dsl is CriteriaDSL {
    return (
      dsl &&
      typeof dsl === 'object' &&
      dsl.root &&
      typeof dsl.root === 'object' &&
      dsl.root.operator &&
      Array.isArray(dsl.root.children)
    );
  }
  
  /**
   * Check if current criteria has content
   */
  get hasContent(): boolean {
    return !!(this.currentDSL && this.currentDSL.root.children.length > 0);
  }
  
  /**
   * Get current mode display text
   */
  get modeDisplayText(): string {
    return this.mode === 'simple' ? 'Simple' : 'Advanced';
  }
  
  /**
   * Get toggle mode text
   */
  get toggleModeText(): string {
    return this.mode === 'simple' ? 'Advanced' : 'Simple';
  }
}
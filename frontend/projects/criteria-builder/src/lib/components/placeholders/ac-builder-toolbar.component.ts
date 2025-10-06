import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CriteriaDSL, BuilderConfig } from '../../models';
import { CriteriaImportExportService, ExportOptions, ImportOptions } from '../../services/criteria-import-export.service';
import { CriteriaPresetService, CriteriaPreset } from '../../services/criteria-preset.service';

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
export class AcBuilderToolbarComponent implements OnInit, OnDestroy {
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
  presets: CriteriaPreset[] = [];
  showPresetMenu = false;
  newPresetName = '';
  newPresetDescription = '';
  showSavePresetDialog = false;
  
  // Import/Export state
  importErrors: string[] = [];
  importWarnings: string[] = [];
  showImportErrors = false;
  isImporting = false;
  isExporting = false;
  
  // SQL preview state
  showSqlPreview = false;
  
  // Cleanup
  private destroy$ = new Subject<void>();
  
  constructor(
    private importExportService: CriteriaImportExportService,
    private presetService: CriteriaPresetService
  ) {
    this.showSqlPreview = this.config.showSqlPreview || false;
  }
  
  ngOnInit(): void {
    // Subscribe to presets changes
    this.presetService.presets$
      .pipe(takeUntil(this.destroy$))
      .subscribe(presets => {
        this.presets = presets;
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
   * Process imported file with enhanced validation
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) {
      return;
    }
    
    this.isImporting = true;
    this.importErrors = [];
    this.importWarnings = [];
    this.showImportErrors = false;
    
    try {
      const importOptions: ImportOptions = {
        validateContent: true,
        allowInvalid: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        importedBy: 'toolbar-import'
      };
      
      const result = await this.importExportService.importFromFile(file, importOptions);
      
      if (result.success && result.dsl) {
        this.importDSL.emit(result.dsl);
        
        if (result.warnings && result.warnings.length > 0) {
          this.importWarnings = result.warnings;
          this.showImportErrors = true;
        }
      } else {
        this.importErrors = result.errors || ['Unknown import error'];
        this.showImportErrors = true;
      }
    } catch (error) {
      this.importErrors = [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`];
      this.showImportErrors = true;
    } finally {
      this.isImporting = false;
      // Reset file input
      input.value = '';
    }
  }
  
  /**
   * Handle export functionality with enhanced validation and metadata
   */
  onExport(): void {
    if (!this.currentDSL) {
      alert('No criteria to export.');
      return;
    }
    
    this.isExporting = true;
    
    try {
      const exportOptions: ExportOptions = {
        minify: false,
        includeValidation: true,
        allowInvalid: false,
        exportedBy: 'toolbar-export',
        additionalMetadata: {
          exportSource: 'criteria-builder-toolbar',
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };
      
      const success = this.importExportService.exportToFile(this.currentDSL, undefined, exportOptions);
      
      if (success) {
        this.exportDSL.emit();
      } else {
        alert('Export failed. Please check the console for details.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.isExporting = false;
    }
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
   * Save current criteria as preset using enhanced preset service
   */
  savePreset(): void {
    if (!this.newPresetName.trim()) {
      alert('Please enter a name for the preset.');
      return;
    }
    
    if (!this.currentDSL) {
      return;
    }
    
    const result = this.presetService.savePreset(
      this.newPresetName.trim(),
      this.currentDSL,
      this.newPresetDescription.trim() || undefined
    );
    
    if (result.success) {
      this.showSavePresetDialog = false;
      this.newPresetName = '';
      this.newPresetDescription = '';
    } else {
      alert(result.error || 'Failed to save preset');
    }
  }
  
  /**
   * Load a saved preset using enhanced preset service
   */
  loadPreset(preset: CriteriaPreset): void {
    if (confirm(`Load preset "${preset.name}"? This will replace the current criteria.`)) {
      const result = this.presetService.loadPreset(preset.id);
      
      if (result.success && result.dsl) {
        this.importDSL.emit(result.dsl);
        this.showPresetMenu = false;
      } else {
        alert(result.error || 'Failed to load preset');
      }
    }
  }
  
  /**
   * Delete a saved preset using enhanced preset service
   */
  deletePreset(preset: CriteriaPreset, event: Event): void {
    event.stopPropagation();
    
    if (confirm(`Delete preset "${preset.name}"?`)) {
      const result = this.presetService.deletePreset(preset.id);
      
      if (!result.success) {
        alert(result.error || 'Failed to delete preset');
      }
    }
  }
  
  /**
   * Cancel save preset dialog
   */
  cancelSavePreset(): void {
    this.showSavePresetDialog = false;
    this.newPresetName = '';
    this.newPresetDescription = '';
  }
  
  /**
   * Export a preset to file
   */
  exportPreset(preset: CriteriaPreset, event: Event): void {
    event.stopPropagation();
    
    const result = this.presetService.exportPreset(preset.id);
    
    if (result.success && result.data && result.filename) {
      const blob = new Blob([result.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } else {
      alert(result.error || 'Failed to export preset');
    }
  }
  
  /**
   * Import preset from file
   */
  onImportPreset(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (content) {
            const result = this.presetService.importPreset(content);
            
            if (result.success) {
              alert(`Preset "${result.preset?.name}" imported successfully!`);
            } else {
              alert(result.error || 'Failed to import preset');
            }
          }
        };
        reader.readAsText(file);
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    
    input.click();
  }
  
  /**
   * Dismiss import errors
   */
  dismissImportErrors(): void {
    this.showImportErrors = false;
    this.importErrors = [];
    this.importWarnings = [];
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
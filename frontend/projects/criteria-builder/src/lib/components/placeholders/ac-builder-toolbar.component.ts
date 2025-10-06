import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CriteriaDSL, BuilderConfig } from '../../models';

/**
 * Placeholder for Builder Toolbar Component
 * Will be implemented in task 5
 */
@Component({
  selector: 'ac-builder-toolbar',
  standalone: false,
  template: `
    <div class="builder-toolbar-placeholder">
      <div class="toolbar-section">
        <span class="mode-indicator">Mode: {{ mode || 'simple' }}</span>
        <button type="button" (click)="onModeToggle()" [disabled]="!currentDSL">
          Switch to {{ mode === 'simple' ? 'Advanced' : 'Simple' }}
        </button>
      </div>
      <div class="toolbar-section">
        <button type="button" (click)="clearAll.emit()" [disabled]="!currentDSL">
          Clear All
        </button>
        <button type="button" (click)="addCondition.emit()">
          Add Condition
        </button>
      </div>
    </div>
  `,
  styles: [`
    .builder-toolbar-placeholder {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background-color: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      margin-bottom: 1rem;
    }
    
    .toolbar-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .mode-indicator {
      font-size: 0.9rem;
      color: #666;
      margin-right: 0.5rem;
    }
    
    button {
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    button:hover:not(:disabled) {
      background-color: #f8f9fa;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class AcBuilderToolbarComponent {
  @Input() currentDSL: CriteriaDSL | null = null;
  @Input() mode: 'simple' | 'advanced' | null = 'simple';
  @Input() config: BuilderConfig = {};
  
  @Output() modeChange = new EventEmitter<'simple' | 'advanced'>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() addCondition = new EventEmitter<void>();
  
  onModeToggle(): void {
    const newMode = this.mode === 'simple' ? 'advanced' : 'simple';
    this.modeChange.emit(newMode);
  }
}
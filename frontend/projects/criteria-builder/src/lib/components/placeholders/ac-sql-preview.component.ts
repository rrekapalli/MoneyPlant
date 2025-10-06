import { Component, Input } from '@angular/core';
import { CriteriaDSL } from '../../models';

/**
 * Placeholder for SQL Preview Component
 * Will be implemented in task 11
 */
@Component({
  selector: 'ac-sql-preview',
  standalone: false,
  template: `
    <div class="sql-preview-placeholder" [class.collapsed]="collapsed">
      <div class="preview-header" (click)="toggleCollapsed()">
        <h4>SQL Preview</h4>
        <i class="pi" [class.pi-chevron-down]="collapsed" [class.pi-chevron-up]="!collapsed"></i>
      </div>
      
      <div class="preview-content" *ngIf="!collapsed">
        <div class="sql-section" *ngIf="isValid; else invalidState">
          <div class="sql-query">
            <label>Generated SQL:</label>
            <pre class="sql-code">{{ getSampleSql() }}</pre>
            <button type="button" class="copy-btn" title="Copy SQL">
              <i class="pi pi-copy"></i>
            </button>
          </div>
          
          <div class="sql-params" *ngIf="getSampleParams()">
            <label>Parameters:</label>
            <pre class="params-code">{{ getSampleParams() }}</pre>
          </div>
        </div>
        
        <ng-template #invalidState>
          <div class="invalid-state">
            <i class="pi pi-exclamation-triangle"></i>
            <span>Cannot generate SQL: criteria contains validation errors</span>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .sql-preview-placeholder {
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background-color: #f8f9fa;
      margin-top: 1rem;
    }
    
    .preview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      cursor: pointer;
      border-bottom: 1px solid #e0e0e0;
      background-color: #f1f3f4;
    }
    
    .preview-header:hover {
      background-color: #e8eaed;
    }
    
    .preview-header h4 {
      margin: 0;
      font-size: 1rem;
      color: #333;
    }
    
    .preview-content {
      padding: 1rem;
    }
    
    .sql-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .sql-query, .sql-params {
      position: relative;
    }
    
    .sql-query label, .sql-params label {
      display: block;
      font-weight: 500;
      margin-bottom: 0.5rem;
      color: #555;
      font-size: 0.9rem;
    }
    
    .sql-code, .params-code {
      background-color: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.85rem;
      line-height: 1.4;
      margin: 0;
      overflow-x: auto;
      white-space: pre-wrap;
    }
    
    .copy-btn {
      position: absolute;
      top: 2rem;
      right: 0.5rem;
      padding: 0.25rem 0.5rem;
      border: 1px solid #4a5568;
      border-radius: 4px;
      background-color: #4a5568;
      color: white;
      cursor: pointer;
      font-size: 0.8rem;
    }
    
    .copy-btn:hover {
      background-color: #2d3748;
    }
    
    .invalid-state {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      color: #856404;
    }
    
    .invalid-state i {
      color: #f39c12;
    }
    
    .collapsed .preview-content {
      display: none;
    }
  `]
})
export class AcSqlPreviewComponent {
  @Input() dsl: CriteriaDSL | null = null;
  @Input() isValid: boolean | null = false;
  @Input() collapsed: boolean = false;
  
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
  
  getSampleSql(): string {
    if (!this.dsl || !this.dsl.root || this.dsl.root.children.length === 0) {
      return 'SELECT * FROM stocks WHERE 1=1';
    }
    
    // Generate a sample SQL based on the DSL structure
    const conditions = this.dsl.root.children.length;
    if (conditions === 1) {
      return 'SELECT * FROM stocks\nWHERE price = :p1';
    } else {
      return `SELECT * FROM stocks\nWHERE price = :p1\n  AND symbol = :p2`;
    }
  }
  
  getSampleParams(): string {
    if (!this.dsl || !this.dsl.root || this.dsl.root.children.length === 0) {
      return '';
    }
    
    const conditions = this.dsl.root.children.length;
    if (conditions === 1) {
      return '{\n  "p1": 100\n}';
    } else {
      return '{\n  "p1": 100,\n  "p2": "AAPL"\n}';
    }
  }
}
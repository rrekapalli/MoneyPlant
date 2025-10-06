import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CriteriaDSL, BuilderConfig, QueryToken, FieldMetaResp, FunctionMetaResp, OperatorInfo } from '../../models';

/**
 * Placeholder for Token Query Display Component
 * Will be implemented in task 6
 */
@Component({
  selector: 'ac-token-query-display',
  standalone: false,
  template: `
    <div class="token-query-display-placeholder">
      <div class="query-preview" *ngIf="dsl && dsl.root && dsl.root.children.length > 0; else emptyState">
        <div class="token-list">
          <div class="token-item" *ngFor="let token of tokens; let i = index">
            <span class="token" [class]="'token-' + token.type">
              {{ token.displayText }}
            </span>
            <span class="token-separator" *ngIf="i < (tokens?.length || 0) - 1">•</span>
          </div>
        </div>
        
        <div class="query-actions">
          <button type="button" (click)="addCondition()" [disabled]="disabled">
            <i class="pi pi-plus"></i> Add Condition
          </button>
        </div>
      </div>
      
      <ng-template #emptyState>
        <div class="empty-query-state">
          <i class="pi pi-search"></i>
          <p>No conditions defined</p>
          <button type="button" (click)="addCondition()" [disabled]="disabled">
            <i class="pi pi-plus"></i> Add First Condition
          </button>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .token-query-display-placeholder {
      min-height: 120px;
      padding: 1rem;
      background-color: white;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }
    
    .query-preview {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .token-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    
    .token-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .token {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.9rem;
      border: 1px solid;
    }
    
    .token-field {
      background-color: #e3f2fd;
      border-color: #2196f3;
      color: #1976d2;
    }
    
    .token-operator {
      background-color: #f5f5f5;
      border-color: #9e9e9e;
      color: #424242;
    }
    
    .token-value {
      background-color: #e8f5e8;
      border-color: #4caf50;
      color: #2e7d32;
    }
    
    .token-function {
      background-color: #f3e5f5;
      border-color: #9c27b0;
      color: #7b1fa2;
    }
    
    .token-logic {
      background-color: #fce4ec;
      border-color: #e91e63;
      color: #c2185b;
    }
    
    .token-separator {
      color: #999;
      font-weight: bold;
    }
    
    .query-actions {
      display: flex;
      gap: 0.5rem;
    }
    
    .empty-query-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100px;
      color: #666;
      text-align: center;
    }
    
    .empty-query-state i {
      font-size: 2rem;
      color: #ccc;
      margin-bottom: 0.5rem;
    }
    
    .empty-query-state p {
      margin: 0.5rem 0;
      font-size: 0.9rem;
    }
    
    button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #2196f3;
      color: white;
      cursor: pointer;
      font-size: 0.9rem;
    }
    
    button:hover:not(:disabled) {
      background-color: #1976d2;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class AcTokenQueryDisplayComponent {
  @Input() dsl: CriteriaDSL | null = null;
  @Input() tokens: QueryToken[] | null = null;
  @Input() fields: FieldMetaResp[] | null = null;
  @Input() functions: FunctionMetaResp[] | null = null;
  @Input() operators: OperatorInfo[] | null = null;
  @Input() config: BuilderConfig = {};
  @Input() mode: 'simple' | 'advanced' | null = 'simple';
  @Input() disabled: boolean = false;
  
  @Output() dslChange = new EventEmitter<CriteriaDSL>();
  @Output() tokenSelect = new EventEmitter<QueryToken>();
  
  addCondition(): void {
    // Emit a simple DSL change for now
    if (this.dsl) {
      const newCondition = {
        left: { fieldId: 'price' },
        op: '=' as const,
        right: { type: 'number' as const, value: 0 }
      };
      
      const updatedDSL = {
        ...this.dsl,
        root: {
          ...this.dsl.root,
          children: [...this.dsl.root.children, newCondition]
        }
      };
      
      this.dslChange.emit(updatedDSL);
    }
  }
}
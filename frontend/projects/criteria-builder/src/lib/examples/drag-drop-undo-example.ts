import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { 
  UserFeedbackService, 
  DragDropService, 
  UndoService,
  CriteriaDSL,
  ChipViewModel
} from '../public-api';

/**
 * Example component demonstrating enhanced drag-and-drop and undo functionality
 * Shows how to integrate the criteria builder with user feedback systems
 */
@Component({
  selector: 'app-drag-drop-undo-example',
  template: `
    <div class="example-container">
      <h2>Enhanced Drag & Drop with Undo Example</h2>
      
      <!-- Configuration Panel -->
      <div class="config-panel">
        <h3>Configuration</h3>
        <form [formGroup]="configForm">
          <div class="form-row">
            <label>
              <input type="checkbox" formControlName="enableDragDrop">
              Enable Drag & Drop
            </label>
          </div>
          <div class="form-row">
            <label>
              <input type="checkbox" formControlName="enableUndo">
              Enable Undo (5 second timeout)
            </label>
          </div>
          <div class="form-row">
            <label>
              <input type="checkbox" formControlName="enableConfirmations">
              Enable Confirmation Dialogs
            </label>
          </div>
          <div class="form-row">
            <label>
              <input type="checkbox" formControlName="enableToasts">
              Enable Toast Notifications
            </label>
          </div>
        </form>
      </div>

      <!-- Criteria Builder -->
      <div class="criteria-section">
        <h3>Criteria Builder</h3>
        <mp-criteria-builder
          [config]="criteriaConfig"
          [(ngModel)]="currentCriteria"
          [disabled]="false"
          (dragDropCompleted)="onDragDropCompleted($event)"
          (undoRequested)="onUndoRequested($event)">
        </mp-criteria-builder>
      </div>

      <!-- Undo Status -->
      <div class="undo-status" *ngIf="undoState.isActive">
        <div class="undo-info">
          <i class="pi pi-info-circle"></i>
          <span>{{ undoState.action?.description }}</span>
          <span class="time-remaining">{{ formatTimeRemaining(undoState.timeRemaining) }}</span>
        </div>
        <div class="undo-actions">
          <button 
            type="button" 
            class="undo-btn"
            (click)="executeUndo()">
            <i class="pi pi-undo"></i>
            Undo
          </button>
          <button 
            type="button" 
            class="dismiss-btn"
            (click)="dismissUndo()">
            <i class="pi pi-times"></i>
          </button>
        </div>
      </div>

      <!-- Action Log -->
      <div class="action-log">
        <h3>Action Log</h3>
        <div class="log-entries">
          <div 
            *ngFor="let entry of actionLog; trackBy: trackLogEntry"
            class="log-entry"
            [class]="'log-' + entry.type">
            <span class="timestamp">{{ entry.timestamp | date:'HH:mm:ss' }}</span>
            <span class="action">{{ entry.action }}</span>
            <span class="details">{{ entry.details }}</span>
          </div>
        </div>
        <button 
          type="button" 
          class="clear-log-btn"
          (click)="clearLog()">
          Clear Log
        </button>
      </div>

      <!-- Demo Actions -->
      <div class="demo-actions">
        <h3>Demo Actions</h3>
        <button 
          type="button" 
          (click)="addSampleCriteria()">
          Add Sample Criteria
        </button>
        <button 
          type="button" 
          (click)="clearAllCriteria()">
          Clear All Criteria
        </button>
        <button 
          type="button" 
          (click)="simulateValidationError()">
          Simulate Validation Error
        </button>
        <button 
          type="button" 
          (click)="testUndoSystem()">
          Test Undo System
        </button>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .config-panel {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .form-row {
      margin-bottom: 10px;
    }

    .criteria-section {
      margin-bottom: 20px;
    }

    .undo-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #e3f2fd;
      border: 1px solid #2196f3;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 20px;
    }

    .undo-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .time-remaining {
      font-weight: bold;
      color: #ff9800;
    }

    .undo-actions {
      display: flex;
      gap: 8px;
    }

    .action-log {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .log-entries {
      max-height: 200px;
      overflow-y: auto;
      margin-bottom: 10px;
    }

    .log-entry {
      display: flex;
      gap: 10px;
      padding: 5px;
      border-bottom: 1px solid #ddd;
      font-family: monospace;
      font-size: 12px;
    }

    .log-entry.log-success { color: #4caf50; }
    .log-entry.log-error { color: #f44336; }
    .log-entry.log-warning { color: #ff9800; }
    .log-entry.log-info { color: #2196f3; }

    .demo-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .demo-actions button {
      padding: 8px 16px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }

    .demo-actions button:hover {
      background: #f0f0f0;
    }
  `]
})
export class DragDropUndoExampleComponent implements OnInit, OnDestroy {
  configForm: FormGroup;
  currentCriteria: CriteriaDSL | null = null;
  undoState: any = { isActive: false, action: null, timeRemaining: 0 };
  actionLog: any[] = [];
  
  private subscriptions: Subscription[] = [];

  criteriaConfig = {
    maxDepth: 10,
    maxElements: 100,
    enableDragDrop: true,
    enableUndo: true,
    undoTimeout: 5000,
    showSqlPreview: true,
    validationMode: 'realtime' as const
  };

  constructor(
    private fb: FormBuilder,
    private userFeedbackService: UserFeedbackService,
    private dragDropService: DragDropService,
    private undoService: UndoService
  ) {
    this.configForm = this.fb.group({
      enableDragDrop: [true],
      enableUndo: [true],
      enableConfirmations: [true],
      enableToasts: [true]
    });
  }

  ngOnInit(): void {
    this.setupConfigWatcher();
    this.setupUndoStateWatcher();
    this.setupUserFeedbackService();
    this.logAction('info', 'Component Initialized', 'Drag & Drop Undo example loaded');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupConfigWatcher(): void {
    const configSub = this.configForm.valueChanges.subscribe(config => {
      this.criteriaConfig = {
        ...this.criteriaConfig,
        enableDragDrop: config.enableDragDrop,
        enableUndo: config.enableUndo
      };

      this.userFeedbackService.configure({
        enableUndo: config.enableUndo,
        enableConfirmations: config.enableConfirmations,
        enableToasts: config.enableToasts
      });

      this.logAction('info', 'Configuration Updated', JSON.stringify(config));
    });
    this.subscriptions.push(configSub);
  }

  private setupUndoStateWatcher(): void {
    const undoSub = this.undoService.undoState$.subscribe(state => {
      this.undoState = state;
      if (state.isActive && state.action) {
        this.logAction('info', 'Undo Available', state.action.description);
      }
    });
    this.subscriptions.push(undoSub);
  }

  private setupUserFeedbackService(): void {
    this.userFeedbackService.configure({
      enableUndo: true,
      enableConfirmations: true,
      enableToasts: true,
      undoTimeout: 5000,
      toastDefaults: {
        successLife: 3000,
        infoLife: 4000,
        warningLife: 5000,
        errorLife: 6000
      }
    });
  }

  onDragDropCompleted(result: any): void {
    this.logAction('success', 'Drag & Drop Completed', 
      `Moved item from ${result.fromIndex} to ${result.toIndex}`);
  }

  onUndoRequested(undoData: any): void {
    this.logAction('warning', 'Undo Executed', undoData.description || 'Undo action performed');
  }

  executeUndo(): void {
    const result = this.userFeedbackService.executeUndo();
    if (result) {
      this.logAction('success', 'Undo Executed', 'Action successfully undone');
    }
  }

  dismissUndo(): void {
    this.userFeedbackService.cancelUndo();
    this.logAction('info', 'Undo Dismissed', 'Undo notification dismissed');
  }

  formatTimeRemaining(timeMs: number): string {
    const seconds = Math.ceil(timeMs / 1000);
    return `${seconds}s`;
  }

  addSampleCriteria(): void {
    // Add sample criteria for testing
    this.currentCriteria = {
      version: '1.0',
      root: {
        operator: 'AND',
        children: [
          {
            left: { type: 'field', value: 'price' },
            operator: '>',
            right: { type: 'literal', value: 100 }
          }
        ]
      }
    };
    this.logAction('success', 'Sample Criteria Added', 'Added price > 100 condition');
  }

  async clearAllCriteria(): Promise<void> {
    const confirmed = await this.userFeedbackService.confirm({
      title: 'Clear All Criteria',
      message: 'Are you sure you want to clear all criteria?',
      acceptLabel: 'Clear All',
      rejectLabel: 'Cancel',
      severity: 'warn'
    });

    if (confirmed) {
      this.currentCriteria = null;
      this.logAction('warning', 'All Criteria Cleared', 'All criteria have been removed');
    }
  }

  async simulateValidationError(): Promise<void> {
    const errors = [
      'Field "invalid_field" does not exist',
      'Operator "INVALID_OP" is not supported',
      'Value type mismatch: expected number, got string'
    ];

    const canContinue = await this.userFeedbackService.handleValidationErrors(errors, true);
    
    if (canContinue) {
      this.logAction('warning', 'Validation Errors Ignored', 'User chose to continue despite errors');
    } else {
      this.logAction('error', 'Validation Failed', 'Operation cancelled due to validation errors');
    }
  }

  testUndoSystem(): void {
    // Simulate a delete action for testing
    const testData = {
      id: 'test-item',
      name: 'Test Item',
      type: 'condition'
    };

    this.userFeedbackService.handleDelete(
      'Test Item',
      'condition',
      testData,
      () => {
        this.logAction('info', 'Test Delete Executed', 'Simulated delete for undo testing');
      },
      true // Skip confirmation for demo
    );
  }

  clearLog(): void {
    this.actionLog = [];
  }

  trackLogEntry(index: number, entry: any): string {
    return entry.id || index;
  }

  private logAction(type: 'success' | 'error' | 'warning' | 'info', action: string, details: string): void {
    this.actionLog.unshift({
      id: Date.now(),
      timestamp: new Date(),
      type,
      action,
      details
    });

    // Keep only last 50 entries
    if (this.actionLog.length > 50) {
      this.actionLog = this.actionLog.slice(0, 50);
    }
  }
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CriteriaDSL, ValidationResult, SqlGenerationResult, CriteriaPreviewResult } from '../interfaces';
import { CriteriaValidators } from '../validators/criteria-validators';

/**
 * Example component demonstrating form integration with the criteria builder
 */
@Component({
  selector: 'app-criteria-form-example',
  template: `
    <form [formGroup]="criteriaForm" (ngSubmit)="onSubmit()">
      <div class="form-field">
        <label for="name">Screener Name</label>
        <input 
          id="name" 
          type="text" 
          formControlName="name" 
          placeholder="Enter screener name">
        
        <div *ngIf="criteriaForm.get('name')?.errors && criteriaForm.get('name')?.touched" 
             class="error-message">
          Name is required
        </div>
      </div>

      <div class="form-field">
        <label for="criteria">Criteria</label>
        <mp-criteria-builder
          id="criteria"
          formControlName="criteria"
          [config]="criteriaConfig"
          [disabled]="criteriaForm.get('criteria')?.disabled"
          placeholder="Click to build your screening criteria..."
          (criteriaChange)="onCriteriaChange($event)"
          (validationChange)="onValidationChange($event)"
          (sqlGenerated)="onSqlGenerated($event)"
          (previewGenerated)="onPreviewGenerated($event)"
          (touched)="onCriteriaTouched($event)"
          (dirty)="onCriteriaDirty($event)"
          (statusChange)="onCriteriaStatusChange($event)"
          (focus)="onCriteriaFocus()"
          (blur)="onCriteriaBlur()"
          (chipAdded)="onChipAdded($event)"
          (chipRemoved)="onChipRemoved($event)"
          (chipModified)="onChipModified($event)"
          (errorOccurred)="onCriteriaError($event)"
          (loadingStateChange)="onLoadingStateChange($event)">
        </mp-criteria-builder>
        
        <div *ngIf="criteriaForm.get('criteria')?.errors && criteriaForm.get('criteria')?.touched" 
             class="error-message">
          <div *ngFor="let error of getCriteriaErrors()">
            {{ error.message }}
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          (click)="resetForm()"
          [disabled]="!criteriaForm.dirty">
          Reset
        </button>
        
        <button 
          type="submit" 
          [disabled]="criteriaForm.invalid || isLoading">
          {{ isLoading ? 'Saving...' : 'Save Screener' }}
        </button>
      </div>

      <!-- Debug Information -->
      <div class="debug-info" *ngIf="showDebugInfo">
        <h4>Form State</h4>
        <ul>
          <li>Valid: {{ criteriaForm.valid }}</li>
          <li>Dirty: {{ criteriaForm.dirty }}</li>
          <li>Touched: {{ criteriaForm.touched }}</li>
          <li>Status: {{ criteriaForm.status }}</li>
        </ul>

        <h4>Criteria State</h4>
        <ul>
          <li>Has Criteria: {{ !!currentCriteria }}</li>
          <li>Validation Status: {{ validationResult?.isValid ? 'Valid' : 'Invalid' }}</li>
          <li>Errors: {{ validationResult?.errors?.length || 0 }}</li>
          <li>Warnings: {{ validationResult?.warnings?.length || 0 }}</li>
        </ul>

        <h4>SQL Preview</h4>
        <pre *ngIf="sqlResult">{{ sqlResult.sql }}</pre>

        <h4>Human Preview</h4>
        <p *ngIf="previewResult">{{ previewResult.description }}</p>
      </div>
    </form>
  `,
  styles: [`
    .form-field {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--surface-border);
      border-radius: var(--border-radius);
      font-size: 1rem;
    }

    .error-message {
      margin-top: 0.5rem;
      color: var(--red-600);
      font-size: 0.875rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: var(--border-radius);
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    button[type="submit"] {
      background: var(--primary-color);
      color: white;
    }

    button[type="button"] {
      background: var(--surface-200);
      color: var(--text-color);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .debug-info {
      margin-top: 2rem;
      padding: 1rem;
      background: var(--surface-100);
      border-radius: var(--border-radius);
      font-size: 0.875rem;
    }

    .debug-info h4 {
      margin: 0 0 0.5rem 0;
      color: var(--text-color);
    }

    .debug-info ul {
      margin: 0 0 1rem 0;
      padding-left: 1.5rem;
    }

    .debug-info pre {
      background: var(--surface-200);
      padding: 0.5rem;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 0.8rem;
    }
  `]
})
export class CriteriaFormExampleComponent implements OnInit {
  criteriaForm!: FormGroup;
  showDebugInfo = true;
  isLoading = false;

  // State tracking
  currentCriteria: CriteriaDSL | null = null;
  validationResult: ValidationResult | null = null;
  sqlResult: SqlGenerationResult | null = null;
  previewResult: CriteriaPreviewResult | null = null;

  // Configuration for criteria builder
  criteriaConfig = {
    showSqlPreview: true,
    enableRealTimeValidation: true,
    showValidationBadges: true,
    maxDepth: 5,
    maxElements: 50,
    enableDragDrop: true,
    enableUndo: true,
    validationDebounceMs: 300,
    sqlPreviewConfig: {
      showSqlTab: true,
      showPreviewTab: true,
      showValidationTab: true,
      enableSyntaxHighlighting: true,
      enableCopyToClipboard: true,
      autoRefresh: true
    }
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.criteriaForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      criteria: [
        null, 
        [
          Validators.required,
          CriteriaValidators.criteriaValidator({
            required: true,
            minConditions: 1,
            maxConditions: 20,
            maxDepth: 5,
            completeConditions: true
          })
        ]
      ]
    });

    // Watch form changes
    this.criteriaForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
    });

    this.criteriaForm.statusChanges.subscribe(status => {
      console.log('Form status changed:', status);
    });
  }

  // Event handlers for criteria builder

  onCriteriaChange(criteria: CriteriaDSL | null): void {
    console.log('Criteria changed:', criteria);
    this.currentCriteria = criteria;
  }

  onValidationChange(result: ValidationResult): void {
    console.log('Validation changed:', result);
    this.validationResult = result;
  }

  onSqlGenerated(result: SqlGenerationResult): void {
    console.log('SQL generated:', result);
    this.sqlResult = result;
  }

  onPreviewGenerated(result: CriteriaPreviewResult): void {
    console.log('Preview generated:', result);
    this.previewResult = result;
  }

  onCriteriaTouched(touched: boolean): void {
    console.log('Criteria touched:', touched);
  }

  onCriteriaDirty(dirty: boolean): void {
    console.log('Criteria dirty:', dirty);
  }

  onCriteriaStatusChange(status: 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'): void {
    console.log('Criteria status changed:', status);
  }

  onCriteriaFocus(): void {
    console.log('Criteria focused');
  }

  onCriteriaBlur(): void {
    console.log('Criteria blurred');
  }

  onChipAdded(event: {chipId: string, type: string}): void {
    console.log('Chip added:', event);
  }

  onChipRemoved(event: {chipId: string, type: string}): void {
    console.log('Chip removed:', event);
  }

  onChipModified(event: {chipId: string, type: string, changes: any}): void {
    console.log('Chip modified:', event);
  }

  onCriteriaError(event: {error: string, context?: any}): void {
    console.error('Criteria error:', event);
  }

  onLoadingStateChange(loading: boolean): void {
    console.log('Loading state changed:', loading);
    this.isLoading = loading;
  }

  // Form actions

  onSubmit(): void {
    if (this.criteriaForm.valid) {
      const formValue = this.criteriaForm.value;
      console.log('Submitting form:', formValue);
      
      // Simulate API call
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
        alert('Screener saved successfully!');
      }, 2000);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  resetForm(): void {
    this.criteriaForm.reset();
    this.currentCriteria = null;
    this.validationResult = null;
    this.sqlResult = null;
    this.previewResult = null;
  }

  getCriteriaErrors(): Array<{message: string}> {
    const criteriaControl = this.criteriaForm.get('criteria');
    if (!criteriaControl?.errors) {
      return [];
    }

    const errors: Array<{message: string}> = [];
    Object.keys(criteriaControl.errors).forEach(key => {
      const error = criteriaControl.errors![key];
      if (error && error.message) {
        errors.push({ message: error.message });
      }
    });

    return errors;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.criteriaForm.controls).forEach(key => {
      const control = this.criteriaForm.get(key);
      control?.markAsTouched();
    });
  }
}
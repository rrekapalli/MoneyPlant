import { Component, Input, Output, EventEmitter, forwardRef, OnInit, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { CriteriaDSL, BuilderConfig } from './models';

/**
 * Main Criteria Builder Component
 * Implements ControlValueAccessor for Angular Reactive Forms integration
 */
@Component({
  selector: 'mp-criteria-builder',
  imports: [CommonModule],
  template: `
    <div class="criteria-builder-container">
      <!-- Placeholder template - will be implemented in later tasks -->
      <div class="criteria-builder-placeholder">
        <p>Criteria Builder Component</p>
        <p>Current DSL: {{ (currentDSL$ | async) ? 'Loaded' : 'Empty' }}</p>
      </div>
    </div>
  `,
  styles: `
    .criteria-builder-container {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .criteria-builder-placeholder {
      text-align: center;
      color: #666;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CriteriaBuilderComponent),
      multi: true
    }
  ]
})
export class CriteriaBuilderComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() config: BuilderConfig = {};
  
  @Output() validityChange = new EventEmitter<boolean>();
  @Output() sqlPreviewChange = new EventEmitter<{sql: string, params: Record<string, any>}>();
  
  // ControlValueAccessor implementation
  private onChange = (value: CriteriaDSL | null) => {};
  private onTouched = () => {};
  
  // Internal state
  currentDSL$ = new BehaviorSubject<CriteriaDSL | null>(null);
  isValid$ = new BehaviorSubject<boolean>(false);
  
  ngOnInit(): void {
    // TODO: Initialize component in later tasks
  }
  
  ngOnDestroy(): void {
    // TODO: Cleanup subscriptions in later tasks
  }
  
  // ControlValueAccessor methods
  writeValue(value: CriteriaDSL | null): void {
    this.currentDSL$.next(value);
  }
  
  registerOnChange(fn: (value: CriteriaDSL | null) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    // TODO: Implement disabled state handling
  }
}

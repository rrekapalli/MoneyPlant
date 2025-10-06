import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';

import { ValidationResult, ValidationError, ValidationWarning } from '../models/criteria-dsl.interface';
import { PartialValidationResult } from '../models/api-responses.interface';
import { CriteriaApiService } from '../services/criteria-api.service';

/**
 * Error Banner Component for API-driven validation feedback
 * 
 * Features:
 * - Display server-side validation results using PrimeNG Messages
 * - Expandable error details with JSONPath references
 * - Error highlighting for problematic elements
 * - Warning display for performance and complexity issues
 * - Real-time partial validation integration
 * - Database constraint and parameter validation error display
 */
@Component({
  selector: 'ac-error-banner',
  standalone: false,
  templateUrl: './ac-error-banner.component.html',
  styleUrls: ['./ac-error-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideDown', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
        overflow: 'visible'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class AcErrorBannerComponent implements OnInit, OnDestroy {
  
  @Input() validationResult: ValidationResult | null = null;
  @Input() partialValidationResult: PartialValidationResult | null = null;
  @Input() showDetails: boolean = false;
  @Input() enablePartialValidation: boolean = true;
  @Input() debounceMs: number = 300;
  
  @Output() errorHighlight = new EventEmitter<ValidationError>();
  @Output() warningHighlight = new EventEmitter<ValidationWarning>();
  @Output() clearHighlight = new EventEmitter<void>();
  @Output() detailsToggle = new EventEmitter<boolean>();
  
  // Component state
  isExpanded = false;
  selectedError: ValidationError | null = null;
  selectedWarning: ValidationWarning | null = null;
  
  // Computed properties for template
  get hasErrors(): boolean {
    return this.getErrors().length > 0;
  }
  
  get hasWarnings(): boolean {
    return this.getWarnings().length > 0;
  }
  
  get hasIssues(): boolean {
    return this.hasErrors || this.hasWarnings;
  }
  
  get errorCount(): number {
    return this.getErrors().length;
  }
  
  get warningCount(): number {
    return this.getWarnings().length;
  }
  
  get severityLevel(): 'error' | 'warning' | 'info' {
    if (this.hasErrors) return 'error';
    if (this.hasWarnings) return 'warning';
    return 'info';
  }
  
  // PrimeNG Messages format
  get errorMessages(): any[] {
    const messages: any[] = [];
    
    // Add error summary
    if (this.hasErrors) {
      messages.push({
        severity: 'error',
        summary: `${this.errorCount} Validation Error${this.errorCount > 1 ? 's' : ''}`,
        detail: this.getErrorSummary(),
        closable: false
      });
    }
    
    // Add warning summary
    if (this.hasWarnings) {
      messages.push({
        severity: 'warn',
        summary: `${this.warningCount} Warning${this.warningCount > 1 ? 's' : ''}`,
        detail: this.getWarningSummary(),
        closable: false
      });
    }
    
    return messages;
  }
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private criteriaApiService: CriteriaApiService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit(): void {
    // Set initial expanded state based on showDetails input
    this.isExpanded = this.showDetails;
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  // Error and warning retrieval methods
  
  private getErrors(): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Get errors from main validation result
    if (this.validationResult?.errors) {
      errors.push(...this.validationResult.errors);
    }
    
    // Get errors from partial validation result
    if (this.partialValidationResult?.errors) {
      errors.push(...this.partialValidationResult.errors);
    }
    
    return errors;
  }
  
  private getWarnings(): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // Get warnings from main validation result
    if (this.validationResult?.warnings) {
      warnings.push(...this.validationResult.warnings);
    }
    
    // Get warnings from partial validation result
    if (this.partialValidationResult?.warnings) {
      warnings.push(...this.partialValidationResult.warnings);
    }
    
    return warnings;
  }
  
  // Summary generation methods
  
  getErrorSummary(): string {
    const errors = this.getErrors();
    if (errors.length === 0) return '';
    
    const errorTypes = [...new Set(errors.map(e => e.type))];
    if (errorTypes.length === 1) {
      return this.getErrorTypeDescription(errorTypes[0]);
    }
    
    return `Multiple validation issues found. Click "Show Details" to see specifics.`;
  }
  
  getWarningSummary(): string {
    const warnings = this.getWarnings();
    if (warnings.length === 0) return '';
    
    const warningTypes = [...new Set(warnings.map(w => w.type))];
    if (warningTypes.length === 1) {
      return this.getWarningTypeDescription(warningTypes[0]);
    }
    
    return `Multiple warnings detected. Click "Show Details" for more information.`;
  }
  
  private getErrorTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'field_not_found': 'One or more fields could not be found in the database',
      'function_not_found': 'One or more functions are not available',
      'type_mismatch': 'Data type conflicts detected',
      'operator_incompatible': 'Incompatible operators for field types',
      'required_parameter_missing': 'Required function parameters are missing',
      'invalid_operator': 'Invalid operators detected'
    };
    
    return descriptions[type] || 'Validation errors detected';
  }
  
  private getWarningTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
      'performance': 'Query may have performance implications',
      'complexity': 'Query complexity is high',
      'deprecated': 'Using deprecated functions or fields',
      'optimization': 'Query can be optimized'
    };
    
    return descriptions[type] || 'Warnings detected';
  }
  
  // Event handlers
  
  /**
   * Toggle error details visibility
   */
  toggleDetails(): void {
    this.isExpanded = !this.isExpanded;
    this.detailsToggle.emit(this.isExpanded);
    this.cdr.markForCheck();
  }
  
  /**
   * Highlight a specific error in the query display
   */
  highlightError(error: ValidationError): void {
    this.selectedError = error;
    this.selectedWarning = null;
    this.errorHighlight.emit(error);
    this.cdr.markForCheck();
  }
  
  /**
   * Highlight a specific warning in the query display
   */
  highlightWarning(warning: ValidationWarning): void {
    this.selectedWarning = warning;
    this.selectedError = null;
    this.warningHighlight.emit(warning);
    this.cdr.markForCheck();
  }
  
  /**
   * Clear all highlighting
   */
  clearAllHighlighting(): void {
    this.selectedError = null;
    this.selectedWarning = null;
    this.clearHighlight.emit();
    this.cdr.markForCheck();
  }
  
  /**
   * Get display text for error type
   */
  getErrorTypeDisplay(type: string): string {
    const displayNames: Record<string, string> = {
      'field_not_found': 'Field Not Found',
      'function_not_found': 'Function Not Found',
      'type_mismatch': 'Type Mismatch',
      'operator_incompatible': 'Incompatible Operator',
      'required_parameter_missing': 'Missing Required Parameter',
      'invalid_operator': 'Invalid Operator'
    };
    
    return displayNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  /**
   * Get display text for warning type
   */
  getWarningTypeDisplay(type: string): string {
    const displayNames: Record<string, string> = {
      'performance': 'Performance Warning',
      'complexity': 'Complexity Warning',
      'deprecated': 'Deprecated Usage',
      'optimization': 'Optimization Suggestion'
    };
    
    return displayNames[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  /**
   * Get icon class for error type
   */
  getErrorIcon(type: string): string {
    const icons: Record<string, string> = {
      'field_not_found': 'pi-question-circle',
      'function_not_found': 'pi-question-circle',
      'type_mismatch': 'pi-times-circle',
      'operator_incompatible': 'pi-times-circle',
      'required_parameter_missing': 'pi-exclamation-circle',
      'invalid_operator': 'pi-times-circle'
    };
    
    return icons[type] || 'pi-exclamation-triangle';
  }
  
  /**
   * Get icon class for warning type
   */
  getWarningIcon(type: string): string {
    const icons: Record<string, string> = {
      'performance': 'pi-clock',
      'complexity': 'pi-chart-line',
      'deprecated': 'pi-info-circle',
      'optimization': 'pi-lightbulb'
    };
    
    return icons[type] || 'pi-exclamation-triangle';
  }
  
  /**
   * Format JSONPath for display
   */
  formatPath(path: string): string {
    if (!path) return '';
    
    // Convert JSONPath to more readable format
    return path
      .replace(/\$\.root\./, '')
      .replace(/\.children\[(\d+)\]/g, ' > Condition $1')
      .replace(/\.left\.fieldId/g, ' > Field')
      .replace(/\.right\.value/g, ' > Value')
      .replace(/\.op/g, ' > Operator')
      .replace(/\.functionId/g, ' > Function')
      .replace(/\.params\[(\d+)\]/g, ' > Parameter $1');
  }
  
  /**
   * Check if error is selected
   */
  isErrorSelected(error: ValidationError): boolean {
    return this.selectedError?.id === error.id;
  }
  
  /**
   * Check if warning is selected
   */
  isWarningSelected(warning: ValidationWarning): boolean {
    return this.selectedWarning?.id === warning.id;
  }
  
  /**
   * Get all errors for template iteration
   */
  getAllErrors(): ValidationError[] {
    return this.getErrors();
  }
  
  /**
   * Get all warnings for template iteration
   */
  getAllWarnings(): ValidationWarning[] {
    return this.getWarnings();
  }
  
  /**
   * TrackBy function for error list
   */
  trackByErrorId(index: number, error: ValidationError): string {
    return error.id;
  }
  
  /**
   * TrackBy function for warning list
   */
  trackByWarningId(index: number, warning: ValidationWarning): string {
    return warning.id;
  }
}
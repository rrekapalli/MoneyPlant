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
import { CommonModule } from '@angular/common';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

// PrimeNG imports
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

import { 
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../../interfaces/validation.interface';
import { CriteriaValidationService } from '../../services/criteria-validation.service';

/**
 * Configuration for validation display
 */
export interface ValidationDisplayConfig {
  /** Whether to show error badges */
  showErrorBadges: boolean;
  
  /** Whether to show warning badges */
  showWarningBadges: boolean;
  
  /** Whether to show info badges */
  showInfoBadges: boolean;
  
  /** Whether to show tooltips on hover */
  showTooltips: boolean;
  
  /** Whether to show detailed overlay on click */
  showDetailedOverlay: boolean;
  
  /** Maximum number of items to show in tooltip */
  maxTooltipItems: number;
  
  /** Badge position */
  badgePosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

/**
 * Validation display component that shows validation status and errors for chips
 */
@Component({
  selector: 'mp-validation-display',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule,
    TooltipModule,

    MessageModule,
    ButtonModule
  ],
  templateUrl: './validation-display.component.html',
  styleUrls: ['./validation-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationDisplayComponent implements OnInit, OnDestroy {
  @Input() chipId: string = '';
  @Input() config: Partial<ValidationDisplayConfig> = {};
  @Input() validationResult: ValidationResult | null = null;

  @Output() errorClicked = new EventEmitter<ValidationError>();
  @Output() warningClicked = new EventEmitter<ValidationWarning>();
  @Output() autoFixRequested = new EventEmitter<ValidationError>();

  // Configuration with defaults
  readonly defaultConfig: ValidationDisplayConfig = {
    showErrorBadges: true,
    showWarningBadges: true,
    showInfoBadges: false,
    showTooltips: true,
    showDetailedOverlay: true,
    maxTooltipItems: 3,
    badgePosition: 'top-right'
  };

  // Component state
  private destroy$ = new Subject<void>();
  private validationSubject = new BehaviorSubject<ValidationResult | null>(null);
  
  // Computed properties
  mergedConfig!: ValidationDisplayConfig;
  chipErrors: ValidationError[] = [];
  chipWarnings: ValidationWarning[] = [];
  hasErrors = false;
  hasWarnings = false;
  hasInfo = false;
  
  // UI state
  overlayVisible = false;

  constructor(
    private validationService: CriteriaValidationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mergedConfig = { ...this.defaultConfig, ...this.config };
    this.setupValidationSubscription();
    
    // Initialize with provided validation result
    if (this.validationResult) {
      this.validationSubject.next(this.validationResult);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Update validation result
   */
  updateValidation(result: ValidationResult | null): void {
    this.validationResult = result;
    this.validationSubject.next(result);
  }

  /**
   * Get error count for this chip
   */
  getErrorCount(): number {
    return this.chipErrors.length;
  }

  /**
   * Get warning count for this chip
   */
  getWarningCount(): number {
    return this.chipWarnings.length;
  }

  /**
   * Get total issue count for this chip
   */
  getTotalIssueCount(): number {
    return this.getErrorCount() + this.getWarningCount();
  }

  /**
   * Get badge severity based on validation state
   */
  getBadgeSeverity(): 'danger' | 'warn' | 'info' | 'success' {
    if (this.hasErrors) {
      return 'danger';
    }
    if (this.hasWarnings) {
      return 'warn';
    }
    if (this.hasInfo) {
      return 'info';
    }
    return 'success';
  }

  /**
   * Get badge icon based on validation state
   */
  getBadgeIcon(): string {
    if (this.hasErrors) {
      return 'pi pi-times';
    }
    if (this.hasWarnings) {
      return 'pi pi-exclamation-triangle';
    }
    if (this.hasInfo) {
      return 'pi pi-info-circle';
    }
    return 'pi pi-check';
  }

  /**
   * Get tooltip text for validation issues
   */
  getTooltipText(): string {
    const issues: string[] = [];
    
    if (this.chipErrors.length > 0) {
      const errorMessages = this.chipErrors
        .slice(0, this.mergedConfig.maxTooltipItems)
        .map(error => error.message);
      issues.push(...errorMessages);
      
      if (this.chipErrors.length > this.mergedConfig.maxTooltipItems) {
        issues.push(`... and ${this.chipErrors.length - this.mergedConfig.maxTooltipItems} more errors`);
      }
    }
    
    if (this.chipWarnings.length > 0) {
      const warningMessages = this.chipWarnings
        .slice(0, this.mergedConfig.maxTooltipItems)
        .map(warning => warning.message);
      issues.push(...warningMessages);
      
      if (this.chipWarnings.length > this.mergedConfig.maxTooltipItems) {
        issues.push(`... and ${this.chipWarnings.length - this.mergedConfig.maxTooltipItems} more warnings`);
      }
    }
    
    return issues.join('\n');
  }

  /**
   * Handle badge click to show detailed overlay
   */
  onBadgeClick(event: Event): void {
    if (this.mergedConfig.showDetailedOverlay && this.getTotalIssueCount() > 0) {
      event.stopPropagation();
      this.overlayVisible = !this.overlayVisible;
    }
  }

  /**
   * Handle error item click
   */
  onErrorClick(error: ValidationError): void {
    this.errorClicked.emit(error);
  }

  /**
   * Handle warning item click
   */
  onWarningClick(warning: ValidationWarning): void {
    this.warningClicked.emit(warning);
  }

  /**
   * Handle auto-fix request
   */
  onAutoFixClick(error: ValidationError): void {
    this.autoFixRequested.emit(error);
  }

  /**
   * Get severity icon for validation items
   */
  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error':
        return 'pi pi-times-circle';
      case 'warning':
        return 'pi pi-exclamation-triangle';
      case 'info':
        return 'pi pi-info-circle';
      default:
        return 'pi pi-info';
    }
  }

  /**
   * Get severity class for styling
   */
  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'error':
        return 'severity-error';
      case 'warning':
        return 'severity-warning';
      case 'info':
        return 'severity-info';
      default:
        return 'severity-default';
    }
  }

  /**
   * Check if validation display should be visible
   */
  shouldShowValidation(): boolean {
    return (
      (this.hasErrors && this.mergedConfig.showErrorBadges) ||
      (this.hasWarnings && this.mergedConfig.showWarningBadges) ||
      (this.hasInfo && this.mergedConfig.showInfoBadges)
    );
  }

  // Private helper methods

  private setupValidationSubscription(): void {
    // Subscribe to validation service for real-time updates
    this.validationService.getCurrentValidation().pipe(
      takeUntil(this.destroy$),
      filter(result => result !== null)
    ).subscribe(result => {
      this.updateValidationState(result!);
    });

    // Subscribe to local validation subject
    this.validationSubject.pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.updateValidationState(result);
      } else {
        this.clearValidationState();
      }
    });
  }

  private updateValidationState(result: ValidationResult): void {
    // Filter errors and warnings for this specific chip
    this.chipErrors = result.errors.filter(error => 
      error.chipId === this.chipId || error.path.includes(this.chipId)
    );
    
    this.chipWarnings = result.warnings.filter(warning => 
      warning.chipId === this.chipId || warning.path.includes(this.chipId)
    );

    // Update state flags
    this.hasErrors = this.chipErrors.length > 0;
    this.hasWarnings = this.chipWarnings.length > 0;
    this.hasInfo = false; // Could be extended to support info messages

    this.cdr.markForCheck();
  }

  private clearValidationState(): void {
    this.chipErrors = [];
    this.chipWarnings = [];
    this.hasErrors = false;
    this.hasWarnings = false;
    this.hasInfo = false;
    this.overlayVisible = false;
    
    this.cdr.markForCheck();
  }
}
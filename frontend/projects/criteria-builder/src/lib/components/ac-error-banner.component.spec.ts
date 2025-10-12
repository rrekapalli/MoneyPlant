import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { AcErrorBannerComponent } from './ac-error-banner.component';
import { CriteriaApiService } from '../services/criteria-api.service';
import { ValidationResult, ValidationError, ValidationWarning } from '../models/criteria-dsl.interface';
import { PartialValidationResult } from '../models/api-responses.interface';

// Mock PrimeNG modules
const mockPrimeNGModules = {
  MessagesModule: class {},
  ButtonModule: class {},
  TooltipModule: class {}
};

describe('AcErrorBannerComponent', () => {
  let component: AcErrorBannerComponent;
  let fixture: ComponentFixture<AcErrorBannerComponent>;
  let mockCriteriaApiService: jasmine.SpyObj<CriteriaApiService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockValidationError: ValidationError = {
    id: 'error-1',
    type: 'field_not_found',
    message: 'Field "price" not found in database',
    path: '$.root.children[0].left.fieldId',
    severity: 'error'
  };

  const mockValidationWarning: ValidationWarning = {
    id: 'warning-1',
    type: 'performance',
    message: 'This query may have performance implications',
    path: '$.root.children[0]'
  };

  const mockValidationResult: ValidationResult = {
    isValid: false,
    errors: [mockValidationError],
    warnings: [mockValidationWarning]
  };

  const mockPartialValidationResult: PartialValidationResult = {
    isValid: false,
    errors: [mockValidationError],
    warnings: [mockValidationWarning],
    suggestions: [
      {
        type: 'optimization',
        message: 'Consider using an index on this field',
        action: 'Add Index'
      }
    ]
  };

  beforeEach(async () => {
    mockCriteriaApiService = jasmine.createSpyObj('CriteriaApiService', [
      'validateCriteria',
      'validatePartialCriteria'
    ]);

    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', [
      'markForCheck',
      'detectChanges'
    ]);

    await TestBed.configureTestingModule({
      declarations: [AcErrorBannerComponent],
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: CriteriaApiService, useValue: mockCriteriaApiService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcErrorBannerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.validationResult).toBeNull();
      expect(component.partialValidationResult).toBeNull();
      expect(component.showDetails).toBeFalse();
      expect(component.enablePartialValidation).toBeTrue();
      expect(component.debounceMs).toBe(300);
    });

    it('should set expanded state based on showDetails input', () => {
      component.showDetails = true;
      component.ngOnInit();
      expect(component.isExpanded).toBeTrue();
    });
  });

  describe('Error and Warning Detection', () => {
    it('should detect errors correctly', () => {
      component.validationResult = mockValidationResult;
      expect(component.hasErrors).toBeTrue();
      expect(component.errorCount).toBe(1);
    });

    it('should detect warnings correctly', () => {
      component.validationResult = mockValidationResult;
      expect(component.hasWarnings).toBeTrue();
      expect(component.warningCount).toBe(1);
    });

    it('should detect issues from partial validation result', () => {
      component.partialValidationResult = mockPartialValidationResult;
      expect(component.hasErrors).toBeTrue();
      expect(component.hasWarnings).toBeTrue();
    });

    it('should determine correct severity level', () => {
      component.validationResult = mockValidationResult;
      expect(component.severityLevel).toBe('error');

      component.validationResult = {
        isValid: true,
        errors: [],
        warnings: [mockValidationWarning]
      };
      expect(component.severityLevel).toBe('warning');

      component.validationResult = {
        isValid: true,
        errors: [],
        warnings: []
      };
      expect(component.severityLevel).toBe('info');
    });
  });

  describe('Message Generation', () => {
    it('should generate error messages for PrimeNG Messages', () => {
      component.validationResult = mockValidationResult;
      const messages = component.errorMessages;

      expect(messages).toHaveSize(2); // 1 error + 1 warning
      expect(messages[0].severity).toBe('error');
      expect(messages[0].summary).toContain('1 Validation Error');
      expect(messages[1].severity).toBe('warn');
      expect(messages[1].summary).toContain('1 Warning');
    });

    it('should handle plural forms correctly', () => {
      const multipleErrors: ValidationError[] = [
        mockValidationError,
        { ...mockValidationError, id: 'error-2' }
      ];

      component.validationResult = {
        isValid: false,
        errors: multipleErrors,
        warnings: []
      };

      const messages = component.errorMessages;
      expect(messages[0].summary).toContain('2 Validation Errors');
    });
  });

  describe('Event Handling', () => {
    it('should toggle details correctly', () => {
      spyOn(component.detailsToggle, 'emit');
      
      component.isExpanded = false;
      component.toggleDetails();
      
      expect(component.isExpanded).toBeTrue();
      expect(component.detailsToggle.emit).toHaveBeenCalledWith(true);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should highlight error correctly', () => {
      spyOn(component.errorHighlight, 'emit');
      
      component.highlightError(mockValidationError);
      
      expect(component.selectedError).toBe(mockValidationError);
      expect(component.selectedWarning).toBeNull();
      expect(component.errorHighlight.emit).toHaveBeenCalledWith(mockValidationError);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should highlight warning correctly', () => {
      spyOn(component.warningHighlight, 'emit');
      
      component.highlightWarning(mockValidationWarning);
      
      expect(component.selectedWarning).toBe(mockValidationWarning);
      expect(component.selectedError).toBeNull();
      expect(component.warningHighlight.emit).toHaveBeenCalledWith(mockValidationWarning);
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
    });

    it('should clear highlighting correctly', () => {
      spyOn(component.clearHighlight, 'emit');
      
      component.selectedError = mockValidationError;
      component.selectedWarning = mockValidationWarning;
      component.clearAllHighlighting();
      
      expect(component.selectedError).toBeNull();
      expect(component.selectedWarning).toBeNull();
      expect(component.clearHighlight.emit).toHaveBeenCalled();
      expect(mockChangeDetectorRef.markForCheck).toHaveBeenCalled();
    });
  });

  describe('Display Methods', () => {
    it('should format error type display correctly', () => {
      expect(component.getErrorTypeDisplay('field_not_found')).toBe('Field Not Found');
      expect(component.getErrorTypeDisplay('type_mismatch')).toBe('Type Mismatch');
      expect(component.getErrorTypeDisplay('custom_error')).toBe('Custom Error');
    });

    it('should format warning type display correctly', () => {
      expect(component.getWarningTypeDisplay('performance')).toBe('Performance Warning');
      expect(component.getWarningTypeDisplay('complexity')).toBe('Complexity Warning');
      expect(component.getWarningTypeDisplay('custom_warning')).toBe('Custom Warning');
    });

    it('should get correct error icons', () => {
      expect(component.getErrorIcon('field_not_found')).toBe('pi-question-circle');
      expect(component.getErrorIcon('type_mismatch')).toBe('pi-times-circle');
      expect(component.getErrorIcon('unknown_type')).toBe('pi-exclamation-triangle');
    });

    it('should get correct warning icons', () => {
      expect(component.getWarningIcon('performance')).toBe('pi-clock');
      expect(component.getWarningIcon('complexity')).toBe('pi-chart-line');
      expect(component.getWarningIcon('unknown_type')).toBe('pi-exclamation-triangle');
    });

    it('should format JSONPath correctly', () => {
      const path = '$.root.children[0].left.fieldId';
      const formatted = component.formatPath(path);
      expect(formatted).toBe('Condition 0 > Field');
    });

    it('should handle empty path', () => {
      expect(component.formatPath('')).toBe('');
      expect(component.formatPath(null as any)).toBe('');
    });
  });

  describe('Selection State', () => {
    it('should check error selection correctly', () => {
      component.selectedError = mockValidationError;
      expect(component.isErrorSelected(mockValidationError)).toBeTrue();
      
      const otherError = { ...mockValidationError, id: 'other-error' };
      expect(component.isErrorSelected(otherError)).toBeFalse();
    });

    it('should check warning selection correctly', () => {
      component.selectedWarning = mockValidationWarning;
      expect(component.isWarningSelected(mockValidationWarning)).toBeTrue();
      
      const otherWarning = { ...mockValidationWarning, id: 'other-warning' };
      expect(component.isWarningSelected(otherWarning)).toBeFalse();
    });
  });

  describe('TrackBy Functions', () => {
    it('should track errors by id', () => {
      const result = component.trackByErrorId(0, mockValidationError);
      expect(result).toBe(mockValidationError.id);
    });

    it('should track warnings by id', () => {
      const result = component.trackByWarningId(0, mockValidationWarning);
      expect(result).toBe(mockValidationWarning.id);
    });
  });

  describe('Data Retrieval', () => {
    it('should get all errors from both validation results', () => {
      component.validationResult = mockValidationResult;
      component.partialValidationResult = mockPartialValidationResult;
      
      const errors = component.getAllErrors();
      expect(errors).toHaveSize(2); // Same error from both sources
    });

    it('should get all warnings from both validation results', () => {
      component.validationResult = mockValidationResult;
      component.partialValidationResult = mockPartialValidationResult;
      
      const warnings = component.getAllWarnings();
      expect(warnings).toHaveSize(2); // Same warning from both sources
    });
  });
});
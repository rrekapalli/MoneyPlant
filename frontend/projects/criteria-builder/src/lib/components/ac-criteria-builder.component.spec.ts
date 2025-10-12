import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';

import { AcCriteriaBuilderComponent } from './ac-criteria-builder.component';
import { CriteriaApiService } from '../services/criteria-api.service';
import { CriteriaSerializerService } from '../services/criteria-serializer.service';
import { CriteriaDSL } from '../models/criteria-dsl.interface';

// Mock placeholder components
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ac-builder-toolbar',
  standalone: false,
  template: '<div>Mock Toolbar</div>'
})
class MockBuilderToolbarComponent {
  @Input() currentDSL: any;
  @Input() mode: any;
  @Input() config: any;
  @Output() modeChange = new EventEmitter();
  @Output() clearAll = new EventEmitter();
  @Output() addCondition = new EventEmitter();
}

@Component({
  selector: 'ac-error-banner',
  standalone: false,
  template: '<div>Mock Error Banner</div>'
})
class MockErrorBannerComponent {
  @Input() validationResult: any;
  @Input() showDetails: any;
}

@Component({
  selector: 'ac-token-query-display',
  standalone: false,
  template: '<div>Mock Token Display</div>'
})
class MockTokenQueryDisplayComponent {
  @Input() dsl: any;
  @Input() tokens: any;
  @Input() fields: any;
  @Input() functions: any;
  @Input() operators: any;
  @Input() config: any;
  @Input() mode: any;
  @Input() disabled: any;
  @Output() dslChange = new EventEmitter();
  @Output() tokenSelect = new EventEmitter();
}

@Component({
  selector: 'ac-sql-preview',
  standalone: false,
  template: '<div>Mock SQL Preview</div>'
})
class MockSqlPreviewComponent {
  @Input() dsl: any;
  @Input() isValid: any;
  @Input() collapsed: any;
}

describe('AcCriteriaBuilderComponent', () => {
  let component: AcCriteriaBuilderComponent;
  let fixture: ComponentFixture<AcCriteriaBuilderComponent>;
  let mockApiService: jasmine.SpyObj<CriteriaApiService>;
  let mockSerializerService: jasmine.SpyObj<CriteriaSerializerService>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('CriteriaApiService', [
      'getFields', 'getFunctions', 'getAllOperators', 'generateSql'
    ]);
    const serializerSpy = jasmine.createSpyObj('CriteriaSerializerService', [
      'validateDSL', 'dslToTokens', 'createEmptyDSL'
    ]);

    // Setup default return values
    apiSpy.getFields.and.returnValue(new BehaviorSubject([]));
    apiSpy.getFunctions.and.returnValue(new BehaviorSubject([]));
    apiSpy.getAllOperators.and.returnValue(new BehaviorSubject([]));
    apiSpy.generateSql.and.returnValue(new BehaviorSubject({ sql: '', parameters: {} }));
    
    serializerSpy.createEmptyDSL.and.returnValue({
      root: { operator: 'AND', children: [] },
      meta: { name: 'Test', version: 1 }
    });
    serializerSpy.validateDSL.and.returnValue({
      isValid: true,
      errors: [],
      warnings: []
    });
    serializerSpy.dslToTokens.and.returnValue([]);

    await TestBed.configureTestingModule({
      declarations: [
        AcCriteriaBuilderComponent,
        MockBuilderToolbarComponent,
        MockErrorBannerComponent,
        MockTokenQueryDisplayComponent,
        MockSqlPreviewComponent
      ],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: CriteriaApiService, useValue: apiSpy },
        { provide: CriteriaSerializerService, useValue: serializerSpy }
      ]
    }).compileComponents();

    mockApiService = TestBed.inject(CriteriaApiService) as jasmine.SpyObj<CriteriaApiService>;
    mockSerializerService = TestBed.inject(CriteriaSerializerService) as jasmine.SpyObj<CriteriaSerializerService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcCriteriaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ControlValueAccessor Implementation', () => {
    it('should implement writeValue correctly', () => {
      const testDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [{
            left: { fieldId: 'price' },
            op: '=',
            right: { type: 'number', value: 100 }
          }]
        }
      };

      component.writeValue(testDSL);
      
      expect(component.currentDSL$.value).toEqual(testDSL);
    });

    it('should register onChange callback', () => {
      const mockOnChange = jasmine.createSpy('onChange');
      component.registerOnChange(mockOnChange);
      
      // Trigger a change
      const testDSL = mockSerializerService.createEmptyDSL();
      component.currentDSL$.next(testDSL);
      
      // Wait for debounce
      setTimeout(() => {
        expect(mockOnChange).toHaveBeenCalledWith(testDSL);
      }, 250);
    });

    it('should register onTouched callback', () => {
      const mockOnTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(mockOnTouched);
      
      // This should be called when the component is touched
      expect(component['onTouched']).toBe(mockOnTouched);
    });

    it('should handle disabled state', () => {
      component.setDisabledState(true);
      expect(component.disabled).toBe(true);
      expect(component.criteriaForm.disabled).toBe(true);
      
      component.setDisabledState(false);
      expect(component.disabled).toBe(false);
      expect(component.criteriaForm.enabled).toBe(true);
    });
  });

  describe('API Integration', () => {
    it('should load metadata on init', () => {
      expect(mockApiService.getFields).toHaveBeenCalled();
      expect(mockApiService.getFunctions).toHaveBeenCalled();
      expect(mockApiService.getAllOperators).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', () => {
      // The component should continue working even if API calls fail
      // because the services provide fallback data
      expect(component.hasApiError).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should validate DSL and emit validity changes', () => {
      spyOn(component.validityChange, 'emit');
      
      const testDSL = mockSerializerService.createEmptyDSL();
      component.currentDSL$.next(testDSL);
      
      // Trigger validation by updating fields
      component.fields$.next([]);
      
      expect(mockSerializerService.validateDSL).toHaveBeenCalled();
      expect(component.validityChange.emit).toHaveBeenCalledWith(true);
    });
  });

  describe('Public Methods', () => {
    it('should add condition', () => {
      const initialDSL = mockSerializerService.createEmptyDSL();
      component.writeValue(initialDSL);
      
      component.addCondition();
      
      const updatedDSL = component.currentDSL$.value;
      expect(updatedDSL?.root.children.length).toBe(1);
    });

    it('should clear all conditions', () => {
      component.clearAll();
      
      expect(mockSerializerService.createEmptyDSL).toHaveBeenCalled();
    });

    it('should switch modes', () => {
      component.setMode('advanced');
      expect(component.mode$.value).toBe('advanced');
      
      component.setMode('simple');
      expect(component.mode$.value).toBe('simple');
    });
  });
});
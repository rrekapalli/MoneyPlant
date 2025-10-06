import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { of, throwError } from 'rxjs';

import { AcSqlPreviewComponent } from './ac-sql-preview.component';
import { CriteriaApiService } from '../services/criteria-api.service';
import { CriteriaDSL } from '../models/criteria-dsl.interface';
import { SqlGenerationResult } from '../models/api-responses.interface';

describe('AcSqlPreviewComponent', () => {
  let component: AcSqlPreviewComponent;
  let fixture: ComponentFixture<AcSqlPreviewComponent>;
  let mockCriteriaApiService: jasmine.SpyObj<CriteriaApiService>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockDSL: CriteriaDSL = {
    root: {
      operator: 'AND',
      children: [
        {
          left: { fieldId: 'price' },
          op: '>',
          right: { type: 'number', value: 100 }
        }
      ]
    }
  };

  const mockSqlResult: SqlGenerationResult = {
    sql: 'SELECT * FROM stocks WHERE price > :p1',
    parameters: { p1: 100 },
    generatedAt: '2024-01-01T12:00:00Z',
    generatedBy: 'test-user',
    dslHash: 'abc123'
  };

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('CriteriaApiService', ['generateSql']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      declarations: [AcSqlPreviewComponent],
      providers: [
        { provide: CriteriaApiService, useValue: apiServiceSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcSqlPreviewComponent);
    component = fixture.componentInstance;
    mockCriteriaApiService = TestBed.inject(CriteriaApiService) as jasmine.SpyObj<CriteriaApiService>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.dsl).toBeNull();
    expect(component.isValid).toBe(false);
    expect(component.collapsed).toBe(false);
    expect(component.isGenerating).toBe(false);
    expect(component.hasError).toBe(false);
    expect(component.errorMessage).toBe('');
  });

  it('should toggle collapsed state', () => {
    expect(component.collapsed).toBe(false);
    component.toggleCollapsed();
    expect(component.collapsed).toBe(true);
    component.toggleCollapsed();
    expect(component.collapsed).toBe(false);
  });

  it('should generate SQL when valid DSL is provided', fakeAsync(() => {
    mockCriteriaApiService.generateSql.and.returnValue(of(mockSqlResult));
    
    component.dsl = mockDSL;
    component.isValid = true;
    component.ngOnInit();
    component.ngOnChanges({ dsl: { currentValue: mockDSL, previousValue: null, firstChange: true, isFirstChange: () => true } });
    
    tick(300); // Wait for debounce
    
    expect(mockCriteriaApiService.generateSql).toHaveBeenCalledWith(mockDSL);
    expect(component.getCurrentSqlResult()).toEqual(mockSqlResult);
    expect(component.isGenerating).toBe(false);
    expect(component.hasError).toBe(false);
  }));

  it('should handle SQL generation errors', fakeAsync(() => {
    const error = new Error('SQL generation failed');
    mockCriteriaApiService.generateSql.and.returnValue(throwError(() => error));
    
    component.dsl = mockDSL;
    component.isValid = true;
    component.ngOnInit();
    component.ngOnChanges({ dsl: { currentValue: mockDSL, previousValue: null, firstChange: true, isFirstChange: () => true } });
    
    tick(300); // Wait for debounce
    
    expect(component.hasError).toBe(true);
    expect(component.errorMessage).toBe('SQL generation failed');
    expect(component.getCurrentSqlResult()).toBeNull();
  }));

  it('should not generate SQL when DSL is invalid', fakeAsync(() => {
    component.dsl = mockDSL;
    component.isValid = false;
    component.ngOnInit();
    component.ngOnChanges({ dsl: { currentValue: mockDSL, previousValue: null, firstChange: true, isFirstChange: () => true } });
    
    tick(300); // Wait for debounce
    
    expect(mockCriteriaApiService.generateSql).not.toHaveBeenCalled();
    expect(component.getCurrentSqlResult()).toBeNull();
  }));

  it('should not generate SQL when DSL is null', fakeAsync(() => {
    component.dsl = null;
    component.isValid = true;
    component.ngOnInit();
    component.ngOnChanges({ dsl: { currentValue: null, previousValue: null, firstChange: true, isFirstChange: () => true } });
    
    tick(300); // Wait for debounce
    
    expect(mockCriteriaApiService.generateSql).not.toHaveBeenCalled();
    expect(component.getCurrentSqlResult()).toBeNull();
  }));

  it('should format parameters correctly', () => {
    component.sqlResult$.next(mockSqlResult);
    
    const formatted = component.getFormattedParameters();
    expect(formatted).toContain('"p1": 100');
  });

  it('should return empty object for no parameters', () => {
    const resultWithoutParams: SqlGenerationResult = {
      ...mockSqlResult,
      parameters: {}
    };
    component.sqlResult$.next(resultWithoutParams);
    
    const formatted = component.getFormattedParameters();
    expect(formatted).toBe('{}');
  });

  it('should check if parameters exist', () => {
    component.sqlResult$.next(mockSqlResult);
    expect(component.hasParameters()).toBe(true);
    
    const resultWithoutParams: SqlGenerationResult = {
      ...mockSqlResult,
      parameters: {}
    };
    component.sqlResult$.next(resultWithoutParams);
    expect(component.hasParameters()).toBe(false);
  });

  it('should determine if SQL can be generated', () => {
    // Valid DSL with conditions
    component.dsl = mockDSL;
    component.isValid = true;
    expect(component.canGenerateSql()).toBe(true);
    
    // Invalid DSL
    component.isValid = false;
    expect(component.canGenerateSql()).toBe(false);
    
    // Null DSL
    component.dsl = null;
    component.isValid = true;
    expect(component.canGenerateSql()).toBe(false);
    
    // Empty DSL
    component.dsl = { root: { operator: 'AND', children: [] } };
    expect(component.canGenerateSql()).toBe(false);
  });

  it('should generate generation info text', () => {
    component.sqlResult$.next(mockSqlResult);
    
    const info = component.getGenerationInfo();
    expect(info).toContain('Generated at');
    expect(info).toContain('test-user');
  });

  it('should copy SQL to clipboard', async () => {
    component.sqlResult$.next(mockSqlResult);
    
    // Mock clipboard API
    const mockClipboard = {
      writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve())
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true
    });
    
    await component.copySqlToClipboard();
    
    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockSqlResult.sql);
  });

  it('should copy parameters to clipboard', async () => {
    component.sqlResult$.next(mockSqlResult);
    
    // Mock clipboard API
    const mockClipboard = {
      writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve())
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true
    });
    
    await component.copyParamsToClipboard();
    
    const expectedParams = JSON.stringify(mockSqlResult.parameters, null, 2);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedParams);
  });

  it('should copy all content to clipboard', async () => {
    component.sqlResult$.next(mockSqlResult);
    
    // Mock clipboard API
    const mockClipboard = {
      writeText: jasmine.createSpy('writeText').and.returnValue(Promise.resolve())
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true
    });
    
    await component.copyAllToClipboard();
    
    expect(mockClipboard.writeText).toHaveBeenCalled();
    const calledWith = mockClipboard.writeText.calls.mostRecent().args[0];
    expect(calledWith).toContain('-- Generated SQL');
    expect(calledWith).toContain(mockSqlResult.sql);
    expect(calledWith).toContain('-- Parameters');
    expect(calledWith).toContain('-- Generated at');
  });

  it('should handle clipboard errors gracefully', async () => {
    component.sqlResult$.next(mockSqlResult);
    
    // Mock clipboard API to throw error
    const mockClipboard = {
      writeText: jasmine.createSpy('writeText').and.returnValue(Promise.reject(new Error('Clipboard error')))
    };
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true
    });
    
    spyOn(component, 'fallbackCopyToClipboard' as any);
    
    await component.copySqlToClipboard();
    
    expect((component as any).fallbackCopyToClipboard).toHaveBeenCalledWith(mockSqlResult.sql);
  });

  it('should get user-friendly error messages', () => {
    const errorWithMessage = { error: { message: 'Custom error message' } };
    expect((component as any).getErrorMessage(errorWithMessage)).toBe('Custom error message');
    
    const errorWithDirectMessage = { message: 'Direct error message' };
    expect((component as any).getErrorMessage(errorWithDirectMessage)).toBe('Direct error message');
    
    const unknownError = {};
    expect((component as any).getErrorMessage(unknownError)).toBe('Failed to generate SQL. Please check your criteria and try again.');
  });

  it('should cleanup subscriptions on destroy', () => {
    spyOn((component as any).destroy$, 'next');
    spyOn((component as any).destroy$, 'complete');
    
    component.ngOnDestroy();
    
    expect((component as any).destroy$.next).toHaveBeenCalled();
    expect((component as any).destroy$.complete).toHaveBeenCalled();
  });
});
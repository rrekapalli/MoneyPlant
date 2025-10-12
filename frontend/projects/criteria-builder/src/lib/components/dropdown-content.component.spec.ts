import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { DropdownContentComponent } from './dropdown-content.component';
import { CriteriaApiService } from '../services/criteria-api.service';
import { FieldMetaResp, OperatorInfo, ValueSuggestion } from '../models/field-meta.interface';
import { FunctionMetaResp } from '../models/function-meta.interface';

describe('DropdownContentComponent', () => {
  let component: DropdownContentComponent;
  let fixture: ComponentFixture<DropdownContentComponent>;
  let mockApiService: jasmine.SpyObj<CriteriaApiService>;

  const mockFields: FieldMetaResp[] = [
    {
      id: 'price',
      label: 'Price',
      dbColumn: 'price',
      dataType: 'number',
      category: 'Financial',
      description: 'Stock price',
      example: '100.50'
    },
    {
      id: 'symbol',
      label: 'Symbol',
      dbColumn: 'symbol',
      dataType: 'string',
      category: 'Basic',
      description: 'Stock symbol',
      example: 'AAPL'
    }
  ];

  const mockFunctions: FunctionMetaResp[] = [
    {
      id: 'avg',
      label: 'Average',
      returnType: 'number',
      category: 'Math',
      description: 'Calculate average value',
      examples: ['AVG(price)'],
      paramCount: 1
    }
  ];

  const mockOperators: OperatorInfo[] = [
    {
      id: '=',
      label: 'Equals',
      description: 'Equal to',
      requiresRightSide: true,
      supportedTypes: ['string', 'number']
    },
    {
      id: '>',
      label: 'Greater Than',
      description: 'Greater than',
      requiresRightSide: true,
      supportedTypes: ['number']
    }
  ];

  const mockValueSuggestions: ValueSuggestion[] = [
    {
      label: 'Apple Inc.',
      value: 'AAPL',
      description: 'Apple Inc. stock'
    },
    {
      label: 'Microsoft Corp.',
      value: 'MSFT',
      description: 'Microsoft Corporation stock'
    }
  ];

  beforeEach(async () => {
    const apiServiceSpy = jasmine.createSpyObj('CriteriaApiService', [
      'getFields',
      'getFunctions',
      'getAllOperators',
      'getFieldOperators',
      'getFieldSuggestions'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        DropdownContentComponent,
        HttpClientTestingModule,
        FormsModule
      ],
      providers: [
        { provide: CriteriaApiService, useValue: apiServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DropdownContentComponent);
    component = fixture.componentInstance;
    mockApiService = TestBed.inject(CriteriaApiService) as jasmine.SpyObj<CriteriaApiService>;

    // Setup default mock responses
    mockApiService.getFields.and.returnValue(of(mockFields));
    mockApiService.getFunctions.and.returnValue(of(mockFunctions));
    mockApiService.getAllOperators.and.returnValue(of(mockOperators));
    mockApiService.getFieldOperators.and.returnValue(of(mockOperators));
    mockApiService.getFieldSuggestions.and.returnValue(of(mockValueSuggestions));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load fields from API when overlayType is field', () => {
    component.overlayType = 'field';
    component.loadFromApi = true;
    
    fixture.detectChanges();
    
    expect(mockApiService.getFields).toHaveBeenCalled();
    expect(component.apiFields).toEqual(mockFields);
  });

  it('should load functions from API when overlayType is function', () => {
    component.overlayType = 'function';
    component.loadFromApi = true;
    
    fixture.detectChanges();
    
    expect(mockApiService.getFunctions).toHaveBeenCalled();
    expect(component.apiFunctions).toEqual(mockFunctions);
  });

  it('should load field-specific operators when fieldId is provided', () => {
    component.overlayType = 'operator';
    component.fieldId = 'price';
    component.loadFromApi = true;
    
    fixture.detectChanges();
    
    expect(mockApiService.getFieldOperators).toHaveBeenCalledWith('price');
    expect(component.apiOperators).toEqual(mockOperators);
  });

  it('should load value suggestions when overlayType is value and fieldId is provided', () => {
    component.overlayType = 'value';
    component.fieldId = 'symbol';
    component.loadFromApi = true;
    
    fixture.detectChanges();
    
    expect(mockApiService.getFieldSuggestions).toHaveBeenCalledWith('symbol', '');
    expect(component.apiValueSuggestions).toEqual(mockValueSuggestions);
  });

  it('should build field options with proper categorization', () => {
    component.overlayType = 'field';
    component.apiFields = mockFields;
    component.loadFromApi = false;
    
    fixture.detectChanges();
    
    expect(component.filteredOptions.length).toBe(2);
    expect(component.filteredOptions[0].category).toBe('Financial');
    expect(component.filteredOptions[1].category).toBe('Basic');
  });

  it('should filter options based on search term', () => {
    component.overlayType = 'field';
    component.apiFields = mockFields;
    component.loadFromApi = false;
    
    fixture.detectChanges();
    
    // Simulate search
    component.searchTerm = 'price';
    component.onSearchChange({ target: { value: 'price' } } as any);
    
    // Wait for debounce
    setTimeout(() => {
      expect(component.filteredOptions.length).toBe(1);
      expect(component.filteredOptions[0].label).toBe('Price');
    }, 350);
  });

  it('should handle keyboard navigation', () => {
    component.overlayType = 'field';
    component.apiFields = mockFields;
    component.loadFromApi = false;
    
    fixture.detectChanges();
    
    // Test arrow down navigation
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    component.onKeyDown(event);
    
    expect(component.selectedIndex).toBe(0);
    
    // Test arrow up navigation
    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    component.onKeyDown(upEvent);
    
    expect(component.selectedIndex).toBe(1); // Should wrap to last option
  });

  it('should emit option selection', () => {
    spyOn(component.optionSelect, 'emit');
    
    const option = {
      label: 'Test Option',
      value: 'test',
      category: 'Test'
    };
    
    component.onOptionSelect(option);
    
    expect(component.optionSelect.emit).toHaveBeenCalledWith(option);
    expect(component.selectedValue).toBe('test');
  });

  it('should handle loading states correctly', () => {
    spyOn(component.loadingChange, 'emit');
    
    component.overlayType = 'field';
    component.loadFromApi = true;
    
    fixture.detectChanges();
    
    expect(component.loadingChange.emit).toHaveBeenCalledWith(true);
    expect(component.isLoading).toBe(false); // Should be false after successful load
  });

  it('should provide tooltip text for options', () => {
    const option = {
      label: 'Test',
      value: 'test',
      description: 'Test description',
      category: 'Test Category'
    };
    
    component.enableTooltips = true;
    
    const tooltip = component.getTooltipText(option);
    
    expect(tooltip).toBe('Test Category: Test description');
  });

  it('should clear search correctly', () => {
    component.searchTerm = 'test';
    
    component.clearSearch();
    
    expect(component.searchTerm).toBe('');
  });

  it('should refresh data when requested', () => {
    component.overlayType = 'field';
    component.loadFromApi = true;
    
    mockApiService.getFields.calls.reset();
    
    component.refreshData();
    
    expect(mockApiService.getFields).toHaveBeenCalled();
  });
});
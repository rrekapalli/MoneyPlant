import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MpCriteriaBuilderComponent } from './mp-criteria-builder.component';
import { CriteriaSerializerService } from '../services/criteria-serializer.service';
import { CriteriaValidationService } from '../services/criteria-validation.service';
import { FieldMeta, FunctionMeta, CriteriaDSL } from '../models/criteria.models';
import { DEFAULT_CONFIG } from '../utils/constants';

describe('MpCriteriaBuilderComponent', () => {
  let component: MpCriteriaBuilderComponent;
  let fixture: ComponentFixture<MpCriteriaBuilderComponent>;
  let mockSerializerService: jasmine.SpyObj<CriteriaSerializerService>;
  let mockValidationService: jasmine.SpyObj<CriteriaValidationService>;

  const mockFields: FieldMeta[] = [
    {
      id: 'close',
      label: 'Close Price',
      dbColumn: 'close_price',
      dataType: 'NUMBER',
      description: 'Closing price of the stock'
    },
    {
      id: 'volume',
      label: 'Volume',
      dbColumn: 'volume',
      dataType: 'INTEGER',
      description: 'Trading volume'
    },
    {
      id: 'symbol',
      label: 'Symbol',
      dbColumn: 'symbol',
      dataType: 'STRING',
      description: 'Stock symbol'
    }
  ];

  const mockFunctions: FunctionMeta[] = [
    {
      id: 'SMA',
      label: 'Simple Moving Average',
      parameters: [
        { name: 'field', type: 'NUMBER' },
        { name: 'period', type: 'INTEGER' }
      ],
      returnType: 'NUMBER',
      description: 'Calculate simple moving average'
    }
  ];

  beforeEach(async () => {
    const serializerSpy = jasmine.createSpyObj('CriteriaSerializerService', ['generateDSL', 'generateSQLPreview']);
    const validationSpy = jasmine.createSpyObj('CriteriaValidationService', ['validateCriteria']);

    await TestBed.configureTestingModule({
      declarations: [MpCriteriaBuilderComponent],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: CriteriaSerializerService, useValue: serializerSpy },
        { provide: CriteriaValidationService, useValue: validationSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MpCriteriaBuilderComponent);
    component = fixture.componentInstance;
    mockSerializerService = TestBed.inject(CriteriaSerializerService) as jasmine.SpyObj<CriteriaSerializerService>;
    mockValidationService = TestBed.inject(CriteriaValidationService) as jasmine.SpyObj<CriteriaValidationService>;

    // Setup component inputs
    component.fields = mockFields;
    component.functions = mockFunctions;
    component.config = DEFAULT_CONFIG;
  });

  beforeEach(() => {
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default state', () => {
    expect(component.state.dsl).toBeNull();
    expect(component.state.isValid).toBeFalse();
    expect(component.selectedField).toBeNull();
    expect(component.selectedOperator).toBeNull();
    expect(component.inputValue).toBeNull();
  });

  it('should have correct input properties', () => {
    expect(component.fields).toEqual(mockFields);
    expect(component.functions).toEqual(mockFunctions);
    expect(component.config).toEqual(DEFAULT_CONFIG);
    expect(component.disabled).toBeFalse();
    expect(component.readonly).toBeFalse();
  });

  it('should update available operators when field is selected', () => {
    component.onFieldSelected('close');
    
    expect(component.selectedField).toEqual(mockFields[0]);
    expect(component.availableOperators).toContain('=');
    expect(component.availableOperators).toContain('>');
    expect(component.availableOperators).toContain('<');
    expect(component.selectedOperator).toBeNull();
  });

  it('should reset operator when field changes', () => {
    component.selectedOperator = '>';
    component.onFieldSelected('close');
    
    expect(component.selectedOperator).toBeNull();
  });

  it('should clear selection when field is deselected', () => {
    component.selectedField = mockFields[0];
    component.selectedOperator = '>';
    component.availableOperators = ['=', '>', '<'];
    
    component.onFieldSelected('');
    
    expect(component.selectedField).toBeNull();
    expect(component.selectedOperator).toBeNull();
    expect(component.availableOperators).toEqual([]);
  });

  it('should update operator when selected', () => {
    component.onOperatorSelected('>');
    expect(component.selectedOperator).toBe('>');
  });

  it('should update input value when changed', () => {
    component.onValueChanged('100');
    expect(component.inputValue).toBe('100');
  });

  it('should not add condition with incomplete data', () => {
    spyOn(component, 'addConditionToDSL');
    
    // Missing field
    component.selectedOperator = '>';
    component.inputValue = '100';
    component.addCondition();
    expect(component.addConditionToDSL).not.toHaveBeenCalled();
    
    // Missing operator
    component.selectedField = mockFields[0];
    component.selectedOperator = null;
    component.addCondition();
    expect(component.addConditionToDSL).not.toHaveBeenCalled();
    
    // Missing value
    component.selectedOperator = '>';
    component.inputValue = null;
    component.addCondition();
    expect(component.addConditionToDSL).not.toHaveBeenCalled();
  });

  it('should add condition with complete data', () => {
    spyOn(component, 'addConditionToDSL');
    
    component.selectedField = mockFields[0];
    component.selectedOperator = '>';
    component.inputValue = '100';
    
    component.addCondition();
    
    expect(component.addConditionToDSL).toHaveBeenCalled();
  });

  it('should clear criteria and reset state', () => {
    const mockDSL: CriteriaDSL = {
      root: {
        operator: 'AND',
        children: []
      },
      version: '1.0'
    };
    
    mockSerializerService.generateDSL.and.returnValue(mockDSL);
    spyOn(component, 'emitChange');
    
    component.clearCriteria();
    
    expect(mockSerializerService.generateDSL).toHaveBeenCalledWith([]);
    expect(component.state.dsl).toEqual(mockDSL);
    expect(component.selectedField).toBeNull();
    expect(component.selectedOperator).toBeNull();
    expect(component.inputValue).toBeNull();
  });

  it('should return correct operator labels', () => {
    expect(component.getOperatorLabel('=')).toBe('equals');
    expect(component.getOperatorLabel('>')).toBe('greater than');
    expect(component.getOperatorLabel('LIKE')).toBe('contains');
    expect(component.getOperatorLabel('UNKNOWN')).toBe('UNKNOWN');
  });

  it('should return correct input types', () => {
    expect(component.getInputType('NUMBER')).toBe('number');
    expect(component.getInputType('DATE')).toBe('date');
    expect(component.getInputType('BOOLEAN')).toBe('checkbox');
    expect(component.getInputType('STRING')).toBe('text');
  });

  it('should return correct input placeholders', () => {
    expect(component.getInputPlaceholder('NUMBER')).toBe('Enter number...');
    expect(component.getInputPlaceholder('DATE')).toBe('Select date...');
    expect(component.getInputPlaceholder('STRING')).toBe('Enter text...');
  });

  it('should have correct utility getters', () => {
    expect(component.hasFields).toBeTrue();
    expect(component.hasFunctions).toBeTrue();
    expect(component.isDisabledState).toBeFalse();
    
    component.disabled = true;
    expect(component.isDisabledState).toBeTrue();
    
    component.disabled = false;
    component.readonly = true;
    expect(component.isDisabledState).toBeTrue();
  });

  it('should emit badge action events', () => {
    spyOn(component.badgeAction, 'emit');
    
    const mockEvent = {
      action: 'select',
      badgeId: 'test',
      badgeType: 'field-badge',
      data: {}
    };
    
    component.onBadgeAction(mockEvent);
    
    expect(component.badgeAction.emit).toHaveBeenCalledWith(mockEvent);
  });

  it('should implement ControlValueAccessor', () => {
    const mockDSL: CriteriaDSL = {
      root: {
        operator: 'AND',
        children: []
      },
      version: '1.0'
    };
    
    let onChangeValue: any;
    let onTouchedCalled = false;
    
    component.registerOnChange((value) => onChangeValue = value);
    component.registerOnTouched(() => onTouchedCalled = true);
    
    component.writeValue(mockDSL);
    
    expect(component.state.dsl).toEqual(mockDSL);
    
    component.setDisabledState(true);
    expect(component.isDisabledState).toBeTrue();
  });
});

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

  // Group functionality tests
  describe('Group Functionality', () => {
    it('should add AND group', () => {
      spyOn(component, 'emitChange');
      spyOn(component, 'requestValidation');
      spyOn(component, 'requestSQLPreview');
      
      component.addGroup('AND');
      
      expect(component.state.dsl).toBeTruthy();
      expect(component.state.dsl?.root.operator).toBe('AND');
      expect(component.state.dsl?.root.children).toEqual([]);
      expect(component.emitChange).toHaveBeenCalled();
    });

    it('should add OR group', () => {
      spyOn(component, 'emitChange');
      
      component.addGroup('OR');
      
      expect(component.state.dsl?.root.operator).toBe('OR');
    });

    it('should add NOT group', () => {
      spyOn(component, 'emitChange');
      
      component.addGroup('NOT');
      
      expect(component.state.dsl?.root.operator).toBe('NOT');
    });

    it('should add condition to specific group', () => {
      // Create initial group
      component.addGroup('AND');
      const groupId = component.state.dsl?.root.id;
      
      // Set up condition data
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      
      spyOn(component, 'emitChange');
      
      component.addConditionToGroup(groupId!);
      
      expect(component.state.dsl?.root.children.length).toBe(1);
      expect(component.selectedField).toBeNull(); // Should be cleared
    });

    it('should add group to specific group', () => {
      // Create initial group
      component.addGroup('AND');
      const parentGroupId = component.state.dsl?.root.id;
      
      spyOn(component, 'emitChange');
      
      component.addGroupToGroup(parentGroupId!, 'OR');
      
      expect(component.state.dsl?.root.children.length).toBe(1);
      const childGroup = component.state.dsl?.root.children[0] as any;
      expect(childGroup.operator).toBe('OR');
    });

    it('should remove element from group', () => {
      // Create group with condition
      component.addGroup('AND');
      const groupId = component.state.dsl?.root.id;
      
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addConditionToGroup(groupId!);
      
      const conditionId = component.state.dsl?.root.children[0].id;
      
      spyOn(component, 'emitChange');
      
      component.removeElement(conditionId!);
      
      expect(component.state.dsl?.root.children.length).toBe(0);
    });

    it('should handle group badge actions', () => {
      component.addGroup('AND');
      const groupId = component.state.dsl?.root.id;
      
      spyOn(component, 'addConditionToGroup');
      spyOn(component, 'addGroupToGroup');
      spyOn(component, 'removeElement');
      
      // Test add condition action
      const addConditionEvent = {
        action: 'add',
        badgeId: groupId!,
        badgeType: 'group-badge',
        data: { type: 'condition', groupId: groupId }
      };
      
      component.onGroupBadgeAction(addConditionEvent);
      expect(component.addConditionToGroup).toHaveBeenCalledWith(groupId);
      
      // Test add group action
      const addGroupEvent = {
        action: 'add',
        badgeId: groupId!,
        badgeType: 'group-badge',
        data: { type: 'group', groupId: groupId }
      };
      
      component.onGroupBadgeAction(addGroupEvent);
      expect(component.addGroupToGroup).toHaveBeenCalledWith(groupId, 'AND');
      
      // Test delete action
      const deleteEvent = {
        action: 'delete',
        badgeId: groupId!,
        badgeType: 'group-badge',
        data: {}
      };
      
      component.onGroupBadgeAction(deleteEvent);
      expect(component.removeElement).toHaveBeenCalledWith(groupId);
    });

    it('should track elements by ID', () => {
      const mockElement1 = { id: 'test1' };
      const mockElement2 = { id: 'test2' };
      
      expect(component.trackByElementId(0, mockElement1)).toBe('test1');
      expect(component.trackByElementId(1, mockElement2)).toBe('test2');
    });

    it('should detect element types correctly', () => {
      const condition = { left: {}, operator: '>' };
      const group = { operator: 'AND', children: [] };
      const unknown = { someProperty: 'value' };
      
      expect(component.getElementType(condition)).toBe('condition');
      expect(component.getElementType(group)).toBe('group');
      expect(component.getElementType(unknown)).toBe('unknown');
    });

    it('should get field from condition', () => {
      const condition = {
        left: { field: 'close' },
        operator: '>',
        right: { value: 100, type: 'NUMBER' }
      };
      
      const field = component.getFieldFromCondition(condition);
      expect(field).toEqual(mockFields[0]);
    });

    it('should return null for invalid condition', () => {
      const invalidCondition = {
        left: null,
        operator: '>',
        right: { value: 100, type: 'NUMBER' }
      };
      
      const field = component.getFieldFromCondition(invalidCondition);
      expect(field).toBeNull();
    });
  });
});

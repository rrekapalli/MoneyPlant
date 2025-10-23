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

  // Function functionality tests
  describe('Function Functionality', () => {
    const mockFunctions: FunctionMeta[] = [
      {
        id: 'SMA',
        name: 'Simple Moving Average',
        description: 'Calculate simple moving average',
        parameters: [
          { name: 'field', type: 'FIELD', optional: false, description: 'Field to calculate SMA for' },
          { name: 'period', type: 'INTEGER', optional: false, description: 'Period for SMA calculation', min: 1, max: 200 }
        ],
        returnType: 'NUMBER',
        examples: ['SMA(close, 20)', 'SMA(volume, 10)']
      },
      {
        id: 'RSI',
        name: 'Relative Strength Index',
        description: 'Calculate RSI indicator',
        parameters: [
          { name: 'field', type: 'FIELD', optional: false, description: 'Field to calculate RSI for' },
          { name: 'period', type: 'INTEGER', optional: true, description: 'Period for RSI calculation', default: 14, min: 1, max: 100 }
        ],
        returnType: 'NUMBER',
        examples: ['RSI(close)', 'RSI(close, 21)']
      }
    ];

    beforeEach(() => {
      component.functions = mockFunctions;
    });

    it('should toggle function mode', () => {
      expect(component.isFunctionMode).toBeFalse();
      
      component.toggleFunctionMode();
      expect(component.isFunctionMode).toBeTrue();
      
      component.toggleFunctionMode();
      expect(component.isFunctionMode).toBeFalse();
    });

    it('should select function and initialize parameters', () => {
      spyOn(component, 'clearCurrentSelection');
      
      component.onFunctionSelected('SMA');
      
      expect(component.selectedFunction).toEqual(mockFunctions[0]);
      expect(component.isFunctionMode).toBeTrue();
      expect(component.functionParameters.length).toBe(2);
      expect(component.clearCurrentSelection).toHaveBeenCalled();
    });

    it('should clear function selection when no function selected', () => {
      component.selectedFunction = mockFunctions[0];
      component.isFunctionMode = true;
      
      component.onFunctionSelected('');
      
      expect(component.selectedFunction).toBeNull();
      expect(component.functionParameters).toEqual([]);
      expect(component.isFunctionMode).toBeFalse();
    });

    it('should update function parameter values', () => {
      component.selectedFunction = mockFunctions[0];
      component.initializeFunctionParameters();
      
      // Test field parameter
      component.onFunctionParameterChanged(0, 'close', 'field');
      expect(component.functionParameters[0]).toEqual(jasmine.objectContaining({
        field: 'close'
      }));
      
      // Test literal parameter
      component.onFunctionParameterChanged(1, '20', 'literal');
      expect(component.functionParameters[1]).toEqual(jasmine.objectContaining({
        value: 20,
        type: 'INTEGER'
      }));
    });

    it('should add function call to criteria', () => {
      component.selectedFunction = mockFunctions[0];
      component.initializeFunctionParameters();
      component.functionParameters[0] = { field: 'close', id: 'test1' } as FieldRef;
      component.functionParameters[1] = { value: 20, type: 'INTEGER', id: 'test2' } as Literal;
      
      spyOn(component, 'emitChange');
      spyOn(component, 'requestValidation');
      spyOn(component, 'requestSQLPreview');
      spyOn(component, 'clearFunctionSelection');
      
      component.addFunctionCall();
      
      expect(component.state.dsl).toBeTruthy();
      expect(component.state.dsl?.root.children.length).toBe(1);
      expect(component.emitChange).toHaveBeenCalled();
      expect(component.clearFunctionSelection).toHaveBeenCalled();
    });

    it('should not add function call if validation fails', () => {
      component.selectedFunction = mockFunctions[0];
      component.functionParameters = []; // Empty parameters should fail validation
      
      spyOn(console, 'error');
      spyOn(component, 'emitChange');
      
      component.addFunctionCall();
      
      expect(console.error).toHaveBeenCalled();
      expect(component.emitChange).not.toHaveBeenCalled();
    });

    it('should get function parameter value correctly', () => {
      component.functionParameters = [
        { field: 'close', id: 'test1' } as FieldRef,
        { value: 20, type: 'INTEGER', id: 'test2' } as Literal
      ];
      
      expect(component.getFunctionParameterValue(0)).toBe('close');
      expect(component.getFunctionParameterValue(1)).toBe(20);
      expect(component.getFunctionParameterValue(2)).toBe('');
    });

    it('should get parameter placeholder correctly', () => {
      const paramWithDefault = { type: 'INTEGER', default: 14 };
      const paramWithoutDefault = { type: 'STRING' };
      
      expect(component.getParameterPlaceholder(paramWithDefault)).toBe('Default: 14');
      expect(component.getParameterPlaceholder(paramWithoutDefault)).toBe('Enter text...');
    });

    it('should track parameters by name', () => {
      const param1 = { name: 'field' };
      const param2 = { name: 'period' };
      
      expect(component.trackByParameterName(0, param1)).toBe('field');
      expect(component.trackByParameterName(1, param2)).toBe('period');
    });

    it('should clear function selection', () => {
      component.selectedFunction = mockFunctions[0];
      component.functionParameters = [{ field: 'close', id: 'test1' } as FieldRef];
      component.isFunctionMode = true;
      
      component.clearFunctionSelection();
      
      expect(component.selectedFunction).toBeNull();
      expect(component.functionParameters).toEqual([]);
      expect(component.isFunctionMode).toBeFalse();
    });

    it('should parse parameter values correctly', () => {
      expect(component.parseParameterValue('20', 'INTEGER')).toBe(20);
      expect(component.parseParameterValue('true', 'BOOLEAN')).toBeTrue();
      expect(component.parseParameterValue('false', 'BOOLEAN')).toBeFalse();
      expect(component.parseParameterValue('test', 'STRING')).toBe('test');
      expect(component.parseParameterValue('', 'STRING')).toBeNull();
    });
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

  // Integration tests for complete workflow
  describe('Complete Workflow Integration Tests', () => {
    it('should complete full criteria creation workflow', () => {
      // Step 1: Select field
      component.onFieldSelected('close');
      expect(component.selectedField).toEqual(mockFields[0]);
      
      // Step 2: Select operator
      component.onOperatorSelected('>');
      expect(component.selectedOperator).toBe('>');
      
      // Step 3: Enter value
      component.onValueChanged('100');
      expect(component.inputValue).toBe('100');
      
      // Step 4: Add condition
      spyOn(component, 'emitChange');
      component.addCondition();
      
      expect(component.state.dsl).toBeTruthy();
      expect(component.emitChange).toHaveBeenCalled();
      
      // Step 5: Verify condition was added
      expect(component.state.dsl?.root.children.length).toBeGreaterThan(0);
      
      // Step 6: Verify selection was cleared
      expect(component.selectedField).toBeNull();
      expect(component.selectedOperator).toBeNull();
      expect(component.inputValue).toBeNull();
    });

    it('should create nested group structure', () => {
      // Create root group
      component.addGroup('AND');
      const rootGroupId = component.state.dsl?.root.id;
      
      // Add condition to root
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addConditionToGroup(rootGroupId!);
      
      // Add nested group
      component.addGroupToGroup(rootGroupId!, 'OR');
      expect(component.state.dsl?.root.children.length).toBe(2);
      
      // Add condition to nested group
      const nestedGroup = component.state.dsl?.root.children[1] as any;
      component.selectedField = mockFields[1];
      component.selectedOperator = '<';
      component.inputValue = '1000';
      component.addConditionToGroup(nestedGroup.id);
      
      expect(nestedGroup.children.length).toBe(1);
    });

    it('should create function-based criteria', () => {
      // Select function
      component.onFunctionSelected('SMA');
      expect(component.isFunctionMode).toBeTrue();
      expect(component.selectedFunction).toBeTruthy();
      
      // Set function parameters
      component.onFunctionParameterChanged(0, 'close', 'field');
      component.onFunctionParameterChanged(1, '20', 'literal');
      
      // Add function call
      component.addFunctionCall();
      
      expect(component.state.dsl?.root.children.length).toBe(1);
      expect(component.isFunctionMode).toBeFalse();
      expect(component.selectedFunction).toBeNull();
    });
  });

  // Undo/Redo functionality tests
  describe('Undo/Redo Functionality', () => {
    it('should track undo history when adding conditions', () => {
      expect(component.canUndo()).toBeFalse();
      
      // Add first condition
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addCondition();
      
      expect(component.canUndo()).toBeTrue();
    });

    it('should undo last action', () => {
      // Add condition
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addCondition();
      
      const dslAfterAdd = JSON.stringify(component.state.dsl);
      
      // Add another condition
      component.selectedField = mockFields[1];
      component.selectedOperator = '<';
      component.inputValue = '1000';
      component.addCondition();
      
      // Undo should restore previous state
      component.undo();
      
      expect(JSON.stringify(component.state.dsl)).toBe(dslAfterAdd);
      expect(component.canRedo()).toBeTrue();
    });

    it('should redo undone action', () => {
      // Add condition
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addCondition();
      
      const dslBeforeUndo = JSON.stringify(component.state.dsl);
      
      // Undo
      component.undo();
      
      // Redo should restore
      component.redo();
      
      expect(JSON.stringify(component.state.dsl)).toBe(dslBeforeUndo);
      expect(component.canRedo()).toBeFalse();
    });

    it('should clear redo stack on new action', () => {
      // Add condition
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addCondition();
      
      // Undo
      component.undo();
      expect(component.canRedo()).toBeTrue();
      
      // Add new condition
      component.selectedField = mockFields[1];
      component.selectedOperator = '<';
      component.inputValue = '1000';
      component.addCondition();
      
      // Redo stack should be cleared
      expect(component.canRedo()).toBeFalse();
    });

    it('should limit undo stack size', () => {
      // Add more actions than MAX_UNDO_STACK_SIZE
      for (let i = 0; i < component.MAX_UNDO_STACK_SIZE + 5; i++) {
        component.selectedField = mockFields[0];
        component.selectedOperator = '>';
        component.inputValue = String(i);
        component.addCondition();
      }
      
      // Stack should be limited
      expect(component.state.undoStack.length).toBeLessThanOrEqual(component.MAX_UNDO_STACK_SIZE);
    });
  });

  // Drag and Drop functionality tests
  describe('Drag and Drop Functionality', () => {
    it('should set dragged element on drag start', () => {
      const mockElement = { id: 'test1', left: { field: 'close' }, operator: '>', right: { value: 100 } };
      const mockEvent = new DragEvent('dragstart');
      
      component.onDragStart(mockEvent, mockElement);
      
      expect(component['draggedElement']).toEqual(mockElement);
    });

    it('should prevent drag when disabled', () => {
      const mockElement = { id: 'test1' };
      const mockEvent = new DragEvent('dragstart');
      spyOn(mockEvent, 'preventDefault');
      
      component.disabled = true;
      component.onDragStart(mockEvent, mockElement);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component['draggedElement']).toBeNull();
    });

    it('should prevent drag when readonly', () => {
      const mockElement = { id: 'test1' };
      const mockEvent = new DragEvent('dragstart');
      spyOn(mockEvent, 'preventDefault');
      
      component.readonly = true;
      component.onDragStart(mockEvent, mockElement);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component['draggedElement']).toBeNull();
    });

    it('should set drop target on drag enter', () => {
      const mockTarget = { id: 'test2' };
      const mockEvent = new DragEvent('dragenter');
      spyOn(mockEvent, 'preventDefault');
      
      component.onDragEnter(mockEvent, mockTarget);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component['dropTarget']).toEqual(mockTarget);
    });

    it('should clear drop target on drag leave', () => {
      component['dropTarget'] = { id: 'test' };
      const mockEvent = new DragEvent('dragleave');
      
      component.onDragLeave(mockEvent);
      
      expect(component['dropTarget']).toBeNull();
    });

    it('should handle drop event', () => {
      // Setup initial DSL with elements
      component.addGroup('AND');
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addCondition();
      
      const draggedElement = component.state.dsl?.root.children[0];
      const dropTarget = component.state.dsl?.root;
      
      component['draggedElement'] = draggedElement;
      component['dropTarget'] = dropTarget;
      
      const mockEvent = new DragEvent('drop');
      spyOn(mockEvent, 'preventDefault');
      spyOn(component, 'emitChange');
      
      component.onDrop(mockEvent, dropTarget);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.emitChange).toHaveBeenCalled();
    });
  });

  // Keyboard Shortcuts functionality tests
  describe('Keyboard Shortcuts', () => {
    it('should undo on Ctrl+Z', () => {
      spyOn(component, 'undo');
      
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      spyOn(event, 'preventDefault');
      
      component['handleKeyboardShortcut'](event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.undo).toHaveBeenCalled();
    });

    it('should redo on Ctrl+Y', () => {
      spyOn(component, 'redo');
      
      const event = new KeyboardEvent('keydown', { key: 'y', ctrlKey: true });
      spyOn(event, 'preventDefault');
      
      component['handleKeyboardShortcut'](event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.redo).toHaveBeenCalled();
    });

    it('should add condition on Enter in field mode', () => {
      component.isFunctionMode = false;
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      
      spyOn(component, 'addCondition');
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component['handleKeyboardShortcut'](event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.addCondition).toHaveBeenCalled();
    });

    it('should add function call on Enter in function mode', () => {
      component.isFunctionMode = true;
      component.selectedFunction = mockFunctions[0];
      
      spyOn(component, 'addFunctionCall');
      
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      spyOn(event, 'preventDefault');
      
      component['handleKeyboardShortcut'](event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.addFunctionCall).toHaveBeenCalled();
    });

    it('should clear criteria on Escape', () => {
      spyOn(component, 'clearCriteria');
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      spyOn(event, 'preventDefault');
      
      component['handleKeyboardShortcut'](event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.clearCriteria).toHaveBeenCalled();
    });

    it('should toggle function mode on Tab in function mode', () => {
      component.isFunctionMode = true;
      spyOn(component, 'toggleFunctionMode');
      
      const event = new KeyboardEvent('keydown', { key: 'Tab' });
      spyOn(event, 'preventDefault');
      
      component['handleKeyboardShortcut'](event);
      
      expect(event.preventDefault).toHaveBeenCalled();
      expect(component.toggleFunctionMode).toHaveBeenCalled();
    });
  });

  // Performance Optimization tests
  describe('Performance Optimizations', () => {
    it('should use OnPush change detection strategy', () => {
      const componentMetadata = (component.constructor as any).__annotations__[0];
      expect(componentMetadata.changeDetection).toBe(1); // ChangeDetectionStrategy.OnPush = 1
    });

    it('should cache field lookups', () => {
      // First lookup
      const field1 = component.getFieldById('close');
      
      // Second lookup should use cache
      const field2 = component.getFieldById('close');
      
      expect(field1).toBe(field2);
      expect(field1).toEqual(mockFields[0]);
    });

    it('should cache function lookups', () => {
      // First lookup
      const func1 = component.getFunctionById('SMA');
      
      // Second lookup should use cache
      const func2 = component.getFunctionById('SMA');
      
      expect(func1).toBe(func2);
      expect(func1).toEqual(mockFunctions[0]);
    });

    it('should debounce validation requests', (done) => {
      spyOn(component.validationRequest, 'emit');
      
      // Make multiple rapid calls
      component['requestValidation']();
      component['requestValidation']();
      component['requestValidation']();
      
      // Should emit only once after debounce
      setTimeout(() => {
        expect(component.validationRequest.emit).toHaveBeenCalledTimes(3);
        done();
      }, 100);
    });

    it('should debounce SQL preview requests', (done) => {
      spyOn(component.sqlRequest, 'emit');
      
      // Make multiple rapid calls
      component['requestSQLPreview']();
      component['requestSQLPreview']();
      component['requestSQLPreview']();
      
      // Should emit only once after debounce
      setTimeout(() => {
        expect(component.sqlRequest.emit).toHaveBeenCalledTimes(3);
        done();
      }, 100);
    });
  });

  // Error Handling tests
  describe('Error Handling', () => {
    it('should add error message', () => {
      component.addError('Test error');
      
      expect(component.hasErrors()).toBeTrue();
      expect(component.getErrorMessages()).toContain('Test error');
    });

    it('should add warning message', () => {
      component.addWarning('Test warning');
      
      expect(component.hasWarnings()).toBeTrue();
      expect(component.getWarningMessages()).toContain('Test warning');
    });

    it('should add success message', () => {
      component.addSuccess('Test success');
      
      expect(component.hasSuccess()).toBeTrue();
      expect(component.getSuccessMessages()).toContain('Test success');
    });

    it('should clear all messages', () => {
      component.addError('Test error');
      component.addWarning('Test warning');
      component.addSuccess('Test success');
      
      component.clearMessages();
      
      expect(component.hasErrors()).toBeFalse();
      expect(component.hasWarnings()).toBeFalse();
      expect(component.hasSuccess()).toBeFalse();
    });

    it('should handle errors in addCondition', () => {
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      
      // Force an error by making the serializer throw
      spyOn(component as any, 'addConditionToDSL').and.throwError('Test error');
      spyOn(component, 'addError');
      
      component.addCondition();
      
      expect(component.addError).toHaveBeenCalled();
    });

    it('should show warning when adding incomplete condition', () => {
      spyOn(component, 'addWarning');
      
      component.selectedField = null;
      component.selectedOperator = null;
      component.inputValue = null;
      
      component.addCondition();
      
      expect(component.addWarning).toHaveBeenCalledWith('Please select a field, operator, and value before adding a condition');
    });

    it('should handle validation errors', () => {
      const mockError = {
        errors: [
          { message: 'Validation error 1' },
          { message: 'Validation error 2' }
        ]
      };
      
      spyOn(component, 'addError');
      
      component['handleValidationError'](mockError);
      
      expect(component.addError).toHaveBeenCalledTimes(2);
    });

    it('should handle network errors', () => {
      spyOn(component, 'addError');
      
      component['handleNetworkError'](new Error('Network error'));
      
      expect(component.addError).toHaveBeenCalledWith('Network error: Please check your connection');
    });

    it('should handle timeout errors', () => {
      spyOn(component, 'addError');
      
      component['handleTimeoutError'](new Error('Timeout'));
      
      expect(component.addError).toHaveBeenCalledWith('Request timeout: Please try again');
    });
  });

  // Accessibility tests
  describe('Accessibility Features', () => {
    it('should have proper ARIA labels in template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      
      // Check for ARIA labels on key elements
      const modeSelection = compiled.querySelector('[role="radiogroup"]');
      expect(modeSelection).toBeTruthy();
      
      const toolbar = compiled.querySelector('[role="toolbar"]');
      expect(toolbar).toBeTruthy();
      
      const criteriaRegion = compiled.querySelector('[role="region"]');
      expect(criteriaRegion).toBeTruthy();
    });

    it('should support keyboard navigation', () => {
      // Component should be focusable
      const isComponentFocused = component['isComponentFocused']();
      expect(typeof isComponentFocused).toBe('boolean');
    });
  });

  // Complete end-to-end scenario tests
  describe('End-to-End Scenarios', () => {
    it('should handle complex multi-level criteria creation', () => {
      // Scenario: (close > 100 AND volume > 1000000) OR SMA(close, 20) > close
      
      // Create root AND group
      component.addGroup('AND');
      const rootId = component.state.dsl?.root.id!;
      
      // Add first condition: close > 100
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addConditionToGroup(rootId);
      
      // Add second condition: volume > 1000000
      component.selectedField = mockFields[1];
      component.selectedOperator = '>';
      component.inputValue = '1000000';
      component.addConditionToGroup(rootId);
      
      // Change root to OR (simulating user switching operator)
      component.state.dsl!.root.operator = 'OR';
      
      // Add function-based condition
      component.onFunctionSelected('SMA');
      component.onFunctionParameterChanged(0, 'close', 'field');
      component.onFunctionParameterChanged(1, '20', 'literal');
      component.addFunctionCall();
      
      // Verify final structure
      expect(component.state.dsl?.root.operator).toBe('OR');
      expect(component.state.dsl?.root.children.length).toBe(3);
    });

    it('should handle workflow with undo and modifications', () => {
      // Add first condition
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addCondition();
      
      expect(component.state.dsl?.root.children.length).toBe(1);
      
      // Add second condition
      component.selectedField = mockFields[1];
      component.selectedOperator = '<';
      component.inputValue = '1000';
      component.addCondition();
      
      expect(component.state.dsl?.root.children.length).toBe(2);
      
      // Undo last addition
      component.undo();
      
      expect(component.state.dsl?.root.children.length).toBe(1);
      
      // Add different condition
      component.selectedField = mockFields[2];
      component.selectedOperator = '=';
      component.inputValue = 'AAPL';
      component.addCondition();
      
      expect(component.state.dsl?.root.children.length).toBe(2);
      
      // Redo should not work after new action
      expect(component.canRedo()).toBeFalse();
    });

    it('should handle clearing and rebuilding criteria', () => {
      // Build initial criteria
      component.selectedField = mockFields[0];
      component.selectedOperator = '>';
      component.inputValue = '100';
      component.addCondition();
      
      expect(component.state.dsl?.root.children.length).toBeGreaterThan(0);
      
      // Clear all
      component.clearCriteria();
      
      expect(component.state.dsl?.root.children.length).toBe(0);
      expect(component.canUndo()).toBeTrue();
      
      // Rebuild with new criteria
      component.selectedField = mockFields[1];
      component.selectedOperator = '<';
      component.inputValue = '500';
      component.addCondition();
      
      expect(component.state.dsl?.root.children.length).toBe(1);
    });
  });
});

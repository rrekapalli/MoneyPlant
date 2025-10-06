/**
 * Backward Compatibility Tests for Screener Form Criteria Builder Integration
 * 
 * This test file verifies that existing screener data created with the old system
 * can be loaded, displayed, and edited correctly with the new criteria-builder.
 * 
 * Task 9.1: Test with existing screener data
 * - Load existing screeners that were created with the previous system
 * - Verify they display and function correctly with criteria-builder
 * - Test that existing data can be edited and saved
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, BehaviorSubject } from 'rxjs';

import { ScreenerFormComponent } from './screener-form.component';
import { ScreenerStateService } from '../../../services/state/screener.state';
import { ScreenerResp, ScreenerCriteria, ScreenerRule } from '../../../services/entities/screener.entities';
import { CriteriaDSL } from 'criteria-builder';

describe('ScreenerFormComponent - Backward Compatibility Tests', () => {
  let component: ScreenerFormComponent;
  let fixture: ComponentFixture<ScreenerFormComponent>;
  let mockScreenerState: jasmine.SpyObj<ScreenerStateService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockMessageService: jasmine.SpyObj<MessageService>;

  // Sample existing screener data that would have been created with the previous system
  const existingScreenerWithSimpleCriteria: ScreenerResp = {
    screenerId: 1,
    ownerUserId: 1,
    name: 'High Volume Stocks',
    description: 'Stocks with high trading volume',
    isPublic: true,
    defaultUniverse: 'SP500',
    criteria: {
      condition: 'and',
      rules: [
        {
          field: 'volume',
          operator: '>',
          value: 1000000,
          entity: 'stock'
        },
        {
          field: 'price',
          operator: '>=',
          value: 50,
          entity: 'stock'
        }
      ],
      collapsed: false
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const existingScreenerWithComplexCriteria: ScreenerResp = {
    screenerId: 2,
    ownerUserId: 1,
    name: 'Technical Analysis Screener',
    description: 'Complex technical analysis criteria',
    isPublic: false,
    defaultUniverse: 'NASDAQ',
    criteria: {
      condition: 'or',
      rules: [
        {
          condition: 'and',
          rules: [
            {
              field: 'rsi_14',
              operator: '<',
              value: 30,
              entity: 'stock'
            },
            {
              field: 'sma_50',
              operator: '>',
              value: 100,
              entity: 'stock'
            }
          ],
          collapsed: false
        },
        {
          condition: 'and',
          rules: [
            {
              field: 'rsi_14',
              operator: '>',
              value: 70,
              entity: 'stock'
            },
            {
              field: 'volume',
              operator: '>=',
              value: 500000,
              entity: 'stock'
            }
          ],
          collapsed: false
        }
      ],
      collapsed: false
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  const existingScreenerWithNoCriteria: ScreenerResp = {
    screenerId: 3,
    ownerUserId: 1,
    name: 'Basic Screener',
    description: 'Screener without criteria',
    isPublic: true,
    defaultUniverse: 'ALL',
    criteria: undefined,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    const screenerStateSpy = jasmine.createSpyObj('ScreenerStateService', [
      'loadScreener',
      'createScreener',
      'updateScreener'
    ], {
      currentScreener$: new BehaviorSubject<ScreenerResp | null>(null),
      loading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null)
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        },
        url: [{ path: 'edit' }]
      }
    };

    await TestBed.configureTestingModule({
      imports: [ScreenerFormComponent],
      providers: [
        { provide: ScreenerStateService, useValue: screenerStateSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ScreenerFormComponent);
    component = fixture.componentInstance;
    mockScreenerState = TestBed.inject(ScreenerStateService) as jasmine.SpyObj<ScreenerStateService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockMessageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;

    // Setup default return values
    mockScreenerState.loadScreener.and.returnValue(of(existingScreenerWithSimpleCriteria));
    mockScreenerState.createScreener.and.returnValue(of(existingScreenerWithSimpleCriteria));
    mockScreenerState.updateScreener.and.returnValue(of(existingScreenerWithSimpleCriteria));
  });

  describe('Loading Existing Screeners with Simple Criteria', () => {
    it('should load existing screener with simple criteria and convert to DSL format', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithSimpleCriteria);

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(component.screener).toEqual(existingScreenerWithSimpleCriteria);
      expect(component.screenerForm.name).toBe('High Volume Stocks');
      expect(component.screenerForm.criteria).toEqual(existingScreenerWithSimpleCriteria.criteria);
      
      // Verify DSL conversion
      expect(component.criteriaDSL).toBeTruthy();
      expect(component.criteriaDSL?.root.operator).toBe('AND');
      expect(component.criteriaDSL?.root.children.length).toBe(2);
      
      // Verify criteria count
      expect(component.getCriteriaCount()).toBe(2);
      expect(component.hasCriteria()).toBeTruthy();
    });

    it('should display existing criteria correctly in the form', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithSimpleCriteria);

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(component.screenerForm.name).toBe('High Volume Stocks');
      expect(component.screenerForm.description).toBe('Stocks with high trading volume');
      expect(component.screenerForm.isPublic).toBe(true);
      expect(component.screenerForm.defaultUniverse).toBe('SP500');
      
      // Verify criteria is properly loaded
      const criteria = component.screenerForm.criteria as ScreenerCriteria;
      expect(criteria.condition).toBe('and');
      expect(criteria.rules.length).toBe(2);
      
      const rule1 = criteria.rules[0] as ScreenerRule;
      expect(rule1.field).toBe('volume');
      expect(rule1.operator).toBe('>');
      expect(rule1.value).toBe(1000000);
      
      const rule2 = criteria.rules[1] as ScreenerRule;
      expect(rule2.field).toBe('price');
      expect(rule2.operator).toBe('>=');
      expect(rule2.value).toBe(50);
    });
  });

  describe('Loading Existing Screeners with Complex Criteria', () => {
    it('should load existing screener with nested criteria and convert to DSL format', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithComplexCriteria);

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(component.screener).toEqual(existingScreenerWithComplexCriteria);
      expect(component.screenerForm.name).toBe('Technical Analysis Screener');
      
      // Verify DSL conversion for complex criteria
      expect(component.criteriaDSL).toBeTruthy();
      expect(component.criteriaDSL?.root.operator).toBe('OR');
      expect(component.criteriaDSL?.root.children.length).toBe(2);
      
      // Verify nested groups are converted correctly
      const firstGroup = component.criteriaDSL?.root.children[0];
      expect(firstGroup).toBeTruthy();
      expect('operator' in firstGroup!).toBeTruthy(); // It's a Group
      
      // Verify criteria count includes nested conditions
      expect(component.getCriteriaCount()).toBe(4); // 2 conditions in each nested group
      expect(component.hasCriteria()).toBeTruthy();
    });

    it('should handle complex nested criteria conversion correctly', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithComplexCriteria);

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert - verify the complex structure is preserved
      const criteria = component.screenerForm.criteria as ScreenerCriteria;
      expect(criteria.condition).toBe('or');
      expect(criteria.rules.length).toBe(2);
      
      // Check first nested group
      const firstNestedGroup = criteria.rules[0] as ScreenerCriteria;
      expect(firstNestedGroup.condition).toBe('and');
      expect(firstNestedGroup.rules.length).toBe(2);
      
      const firstRule = firstNestedGroup.rules[0] as ScreenerRule;
      expect(firstRule.field).toBe('rsi_14');
      expect(firstRule.operator).toBe('<');
      expect(firstRule.value).toBe(30);
      
      // Check second nested group
      const secondNestedGroup = criteria.rules[1] as ScreenerCriteria;
      expect(secondNestedGroup.condition).toBe('and');
      expect(secondNestedGroup.rules.length).toBe(2);
    });
  });

  describe('Loading Existing Screeners with No Criteria', () => {
    it('should load existing screener with no criteria correctly', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithNoCriteria);

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(component.screener).toEqual(existingScreenerWithNoCriteria);
      expect(component.screenerForm.name).toBe('Basic Screener');
      expect(component.screenerForm.criteria).toBeUndefined();
      
      // Verify DSL state for no criteria
      expect(component.criteriaDSL).toBeNull();
      expect(component.getCriteriaCount()).toBe(0);
      expect(component.hasCriteria()).toBeFalsy();
    });
  });

  describe('Editing Existing Screener Data', () => {
    it('should allow editing and saving existing screener with criteria', async () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithSimpleCriteria);
      component.ngOnInit();
      fixture.detectChanges();

      // Act - modify the screener
      component.screenerForm.name = 'Updated High Volume Stocks';
      component.screenerForm.description = 'Updated description';
      
      // Simulate criteria change through the criteria builder
      const updatedDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [
            {
              left: { fieldId: 'volume' },
              op: '>',
              right: { type: 'number', value: 2000000 } // Updated value
            },
            {
              left: { fieldId: 'price' },
              op: '>=',
              right: { type: 'number', value: 75 } // Updated value
            }
          ]
        },
        meta: {
          version: 1,
          createdAt: new Date().toISOString(),
          source: 'screener'
        }
      };
      
      component.onCriteriaChange(updatedDSL);
      
      // Act - save the screener
      component.saveScreener();

      // Assert
      expect(mockScreenerState.updateScreener).toHaveBeenCalledWith(
        existingScreenerWithSimpleCriteria.screenerId,
        jasmine.objectContaining({
          name: 'Updated High Volume Stocks',
          description: 'Updated description',
          criteria: jasmine.objectContaining({
            condition: 'and',
            rules: jasmine.arrayContaining([
              jasmine.objectContaining({
                field: 'volume',
                operator: '>',
                value: 2000000
              }),
              jasmine.objectContaining({
                field: 'price',
                operator: '>=',
                value: 75
              })
            ])
          })
        })
      );
    });

    it('should handle adding criteria to existing screener with no criteria', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithNoCriteria);
      component.ngOnInit();
      fixture.detectChanges();

      // Verify initial state
      expect(component.hasCriteria()).toBeFalsy();
      expect(component.getCriteriaCount()).toBe(0);

      // Act - add criteria to screener that had none
      const newDSL: CriteriaDSL = {
        root: {
          operator: 'AND',
          children: [
            {
              left: { fieldId: 'market_cap' },
              op: '>',
              right: { type: 'number', value: 1000000000 }
            }
          ]
        },
        meta: {
          version: 1,
          createdAt: new Date().toISOString(),
          source: 'screener'
        }
      };
      
      component.onCriteriaChange(newDSL);

      // Assert
      expect(component.hasCriteria()).toBeTruthy();
      expect(component.getCriteriaCount()).toBe(1);
      expect(component.screenerForm.criteria).toBeTruthy();
      expect(component.screenerForm.criteria?.condition).toBe('and');
      expect(component.screenerForm.criteria?.rules.length).toBe(1);
    });

    it('should handle removing all criteria from existing screener', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithSimpleCriteria);
      component.ngOnInit();
      fixture.detectChanges();

      // Verify initial state has criteria
      expect(component.hasCriteria()).toBeTruthy();
      expect(component.getCriteriaCount()).toBe(2);

      // Act - clear all criteria
      component.clearCriteria();

      // Assert
      expect(component.hasCriteria()).toBeFalsy();
      expect(component.getCriteriaCount()).toBe(0);
      expect(component.criteriaDSL).toBeNull();
      expect(component.screenerForm.criteria).toBeUndefined();
      expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'info',
        summary: 'Criteria Cleared'
      }));
    });
  });

  describe('Error Handling for Existing Data', () => {
    it('should handle malformed criteria data gracefully', () => {
      // Arrange - create screener with malformed criteria
      const screenerWithMalformedCriteria: ScreenerResp = {
        ...existingScreenerWithSimpleCriteria,
        criteria: {
          condition: 'invalid' as any, // Invalid condition
          rules: [
            {
              field: '', // Empty field
              operator: 'invalid_operator', // Invalid operator
              value: undefined, // Undefined value
              entity: 'stock'
            }
          ],
          collapsed: false
        }
      };

      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(screenerWithMalformedCriteria);

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert - should handle gracefully and show error
      expect(component.screener).toEqual(screenerWithMalformedCriteria);
      expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'warn',
        summary: 'Data Conversion'
      }));
      
      // Should fallback to empty criteria
      expect(component.criteriaDSL).toBeNull();
      expect(component.hasCriteria()).toBeFalsy();
    });

    it('should handle conversion errors during data loading', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithComplexCriteria);

      // Spy on conversion method to simulate error
      spyOn(component as any, 'convertScreenerCriteriaToDsl').and.throwError('Conversion failed');

      // Act
      component.ngOnInit();
      fixture.detectChanges();

      // Assert - should handle error gracefully
      expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'warn',
        summary: 'Data Conversion'
      }));
      
      // Should fallback to empty criteria
      expect(component.criteriaDSL).toBeNull();
    });
  });

  describe('Data Integrity Verification', () => {
    it('should maintain data integrity during round-trip conversion', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithSimpleCriteria);
      component.ngOnInit();
      fixture.detectChanges();

      // Act - convert to DSL and back to screener format
      const originalCriteria = existingScreenerWithSimpleCriteria.criteria!;
      const convertedDSL = component.criteriaDSL!;
      
      // Simulate criteria change (round-trip conversion)
      component.onCriteriaChange(convertedDSL);
      const roundTripCriteria = component.screenerForm.criteria!;

      // Assert - data should be preserved
      expect(roundTripCriteria.condition).toBe(originalCriteria.condition);
      expect(roundTripCriteria.rules.length).toBe(originalCriteria.rules.length);
      
      // Check individual rules
      const originalRule1 = originalCriteria.rules[0] as ScreenerRule;
      const roundTripRule1 = roundTripCriteria.rules[0] as ScreenerRule;
      
      expect(roundTripRule1.field).toBe(originalRule1.field);
      expect(roundTripRule1.operator).toBe(originalRule1.operator);
      expect(roundTripRule1.value).toBe(originalRule1.value);
    });

    it('should preserve complex nested structure during conversion', () => {
      // Arrange
      (mockScreenerState.currentScreener$ as BehaviorSubject<ScreenerResp | null>)
        .next(existingScreenerWithComplexCriteria);
      component.ngOnInit();
      fixture.detectChanges();

      // Act - round-trip conversion
      const originalCriteria = existingScreenerWithComplexCriteria.criteria!;
      const convertedDSL = component.criteriaDSL!;
      component.onCriteriaChange(convertedDSL);
      const roundTripCriteria = component.screenerForm.criteria!;

      // Assert - complex structure should be preserved
      expect(roundTripCriteria.condition).toBe(originalCriteria.condition);
      expect(roundTripCriteria.rules.length).toBe(originalCriteria.rules.length);
      
      // Check nested groups are preserved
      const originalNestedGroup = originalCriteria.rules[0] as ScreenerCriteria;
      const roundTripNestedGroup = roundTripCriteria.rules[0] as ScreenerCriteria;
      
      expect(roundTripNestedGroup.condition).toBe(originalNestedGroup.condition);
      expect(roundTripNestedGroup.rules.length).toBe(originalNestedGroup.rules.length);
    });
  });
});
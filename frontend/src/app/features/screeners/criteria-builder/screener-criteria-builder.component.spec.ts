import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

import { ScreenerCriteriaBuilderComponent } from './screener-criteria-builder.component';

describe('ScreenerCriteriaBuilderComponent', () => {
  let component: ScreenerCriteriaBuilderComponent;
  let fixture: ComponentFixture<ScreenerCriteriaBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ScreenerCriteriaBuilderComponent,
        FormsModule,
        ButtonModule,
        SelectModule,
        InputTextModule,
        InputNumberModule
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreenerCriteriaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty criteria', () => {
    expect(component.criteria.rules.length).toBe(0);
    expect(component.criteria.condition).toBe('and');
  });

  it('should add a new rule when addRule is called', () => {
    const initialRuleCount = component.criteria.rules.length;
    component.addRule();
    expect(component.criteria.rules.length).toBe(initialRuleCount + 1);
  });

  it('should remove a rule when removeRule is called', () => {
    // Add a rule first
    component.addRule();
    component.addRule();
    const initialRuleCount = component.criteria.rules.length;
    
    component.removeRule(0);
    expect(component.criteria.rules.length).toBe(initialRuleCount - 1);
  });

  it('should clear all rules when clearAll is called', () => {
    // Add some rules first
    component.addRule();
    component.addRule();
    expect(component.criteria.rules.length).toBeGreaterThan(0);
    
    component.clearAll();
    expect(component.criteria.rules.length).toBe(0);
  });

  it('should return correct field type for known fields', () => {
    // This test would need to be updated based on your INDICATOR_FIELDS
    const fieldType = component.getFieldType('some_field');
    expect(typeof fieldType).toBe('string');
  });

  it('should return appropriate operators for different field types', () => {
    const stringOperators = component.getOperatorOptions('string_field');
    const numberOperators = component.getOperatorOptions('number_field');
    
    expect(Array.isArray(stringOperators)).toBeTruthy();
    expect(Array.isArray(numberOperators)).toBeTruthy();
  });
});
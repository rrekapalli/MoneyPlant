import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AcTokenQueryDisplayComponent } from './ac-token-query-display.component';
import { CriteriaSerializerService } from '../../services/criteria-serializer.service';
import { CriteriaDSL } from '../../models/criteria-dsl.interface';

describe('AcTokenQueryDisplayComponent', () => {
  let component: AcTokenQueryDisplayComponent;
  let fixture: ComponentFixture<AcTokenQueryDisplayComponent>;
  let serializerService: jasmine.SpyObj<CriteriaSerializerService>;

  beforeEach(async () => {
    const serializerSpy = jasmine.createSpyObj('CriteriaSerializerService', ['dslToTokens']);

    await TestBed.configureTestingModule({
      declarations: [AcTokenQueryDisplayComponent],
      imports: [DragDropModule],
      providers: [
        { provide: CriteriaSerializerService, useValue: serializerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcTokenQueryDisplayComponent);
    component = fixture.componentInstance;
    serializerService = TestBed.inject(CriteriaSerializerService) as jasmine.SpyObj<CriteriaSerializerService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit dslChange when addCondition is called', () => {
    const emitSpy = spyOn(component.dslChange, 'emit');

    const initialDSL: CriteriaDSL = {
      root: {
        operator: 'AND',
        children: []
      }
    };

    component.dsl = initialDSL;
    component.addCondition();

    expect(emitSpy).toHaveBeenCalled();
    const emittedDSL = emitSpy.calls.mostRecent()?.args[0];
    expect(emittedDSL?.root.children.length).toBe(1);
  });

  it('should have addCondition method', () => {
    expect(typeof component.addCondition).toBe('function');
  });
});
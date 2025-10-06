import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriaBuilderComponent } from './criteria-builder';

describe('CriteriaBuilderComponent', () => {
  let component: CriteriaBuilderComponent;
  let fixture: ComponentFixture<CriteriaBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriteriaBuilderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriteriaBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

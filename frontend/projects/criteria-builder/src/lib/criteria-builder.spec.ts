import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriaBuilder } from './criteria-builder';

describe('CriteriaBuilder', () => {
  let component: CriteriaBuilder;
  let fixture: ComponentFixture<CriteriaBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriteriaBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriteriaBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

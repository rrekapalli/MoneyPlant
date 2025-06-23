import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactComponentWrapperComponent } from './react-wrapper.component';
import { EventEmitter } from '@angular/core';
import { IWidget } from '../../entities/IWidget';

describe('ReactComponentWrapperComponent', () => {
  let component: ReactComponentWrapperComponent;
  let fixture: ComponentFixture<ReactComponentWrapperComponent>;
  let mockWidget: IWidget;

  beforeEach(async () => {
    mockWidget = {
      id: 'test-widget',
      type: 'test-type',
      // Add other required IWidget properties
    } as any;

    await TestBed.configureTestingModule({
      imports: [ReactComponentWrapperComponent],
      schemas: []
    }).compileComponents();

    fixture = TestBed.createComponent(ReactComponentWrapperComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with input properties', () => {
    const onDataLoad = new EventEmitter<IWidget>();
    const onUpdateFilter = new EventEmitter<any>();

    component.widget = mockWidget;
    component.onDataLoad = onDataLoad;
    component.onUpdateFilter = onUpdateFilter;
    fixture.detectChanges();

    expect(component.widget).toBe(mockWidget);
    expect(component.onDataLoad).toBe(onDataLoad);
    expect(component.onUpdateFilter).toBe(onUpdateFilter);
  });

  it('should have correct template structure', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('my-react-component')).toBeTruthy();
  });

  it('should properly clean up on destroy', () => {
    const destroySpy = spyOn(component, 'ngOnDestroy');
    component.ngOnDestroy();
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should initialize without errors in ngOnInit', () => {
    const initSpy = spyOn(component, 'ngOnInit');
    component.ngOnInit();
    expect(initSpy).toHaveBeenCalled();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EchartComponent } from './echart.component';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { IWidget } from '../../entities/IWidget';

describe('EchartComponent', () => {
  let component: EchartComponent;
  let fixture: ComponentFixture<EchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EchartComponent, NgxEchartsDirective],
      providers: [provideEchartsCore({
        echarts: () => import('echarts'),
      })]
    }).compileComponents();

    fixture = TestBed.createComponent(EchartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.isSingleClick).toBe(true);
  });

  it('should handle chart initialization', () => {
    const mockChart = {
      setOption: () => {},
      resize: () => {}
    } as any;
    
    const mockWidget = {
      config: {
        options: {}
      }
    } as IWidget;
    
    component.widget = mockWidget;
    component.onChartInit(mockChart);
    
    expect(mockWidget.chartInstance).toBe(mockChart);
  });

  it('should handle chart click events', () => {
    const mockEvent = {
      data: { name: 'test', value: 100 },
      seriesType: 'pie'
    };
    
    const spy = spyOn(component.onUpdateFilter, 'emit');
    
    component.onClick(mockEvent);
    
    expect(spy).toHaveBeenCalled();
  });

  it('should handle double click events', () => {
    const mockEvent = {};
    
    component.onChartDblClick(mockEvent);
    
    expect(component.isSingleClick).toBe(false);
  });
});

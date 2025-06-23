import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EchartComponent } from './echart.component';
import { EventEmitter } from '@angular/core';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { IWidget } from '../../entities/IWidget';
import { ECharts } from 'echarts';

// Add ResizeObserver polyfill
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('EchartComponent', () => {
  let component: EchartComponent;
  let fixture: ComponentFixture<EchartComponent>;
  
  // Setup before all tests
  beforeAll(() => {
    global.ResizeObserver = ResizeObserverMock;
  });
  
  const mockWidget: any = {
    id: '1',
    type: 'chart',
    config: {
      options: {
        series: [{
          type: 'bar',
          data: [1, 2, 3]
        }]
      }
    }
  };

  const mockChartInstance = {
    setOption: jest.fn(),
    resize: jest.fn(),
  } as unknown as ECharts;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EchartComponent, NgxEchartsDirective],
      providers: [provideEcharts()]
    }).compileComponents();

    fixture = TestBed.createComponent(EchartComponent);
    component = fixture.componentInstance;
    
    // Setup input properties
    component.widget = mockWidget;
    component.onDataLoad = new EventEmitter<IWidget>();
    component.onUpdateFilter = new EventEmitter<any>();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct initial values', () => {
    expect(component.isSingleClick).toBe(true);
    expect(component.initOpts).toEqual({
      height: 300,
      rowHeightRatio: 0.25,
      fixedRowHeight: 30,
      width: 'auto',
      locale: 'en',
    });
  });

  describe('chartOptions getter', () => {
    it('should return chart options from widget config', () => {
      expect(component.chartOptions).toEqual(mockWidget.config.options);
    });

    it('should return undefined when widget is undefined', () => {
      component.widget = undefined as any;
      expect(component.chartOptions).toBeUndefined();
    });

    it('should return undefined when widget config is undefined', () => {
      component.widget = { id: '1' } as any;
      expect(component.chartOptions).toBeUndefined();
    });
  });

  describe('onChartInit', () => {
    it('should initialize chart and emit onDataLoad', () => {
      jest.useFakeTimers();
      const onDataLoadSpy = jest.spyOn(component.onDataLoad, 'emit');
      
      component.onChartInit(mockChartInstance);
      
      expect(component.widget.chartInstance).toBe(mockChartInstance);
      jest.runAllTimers();
      expect(onDataLoadSpy).toHaveBeenCalledWith(component.widget);
      
      jest.useRealTimers();
    });

    it('should not throw error if onDataLoad is undefined', () => {
      jest.useFakeTimers();
      component.onDataLoad = undefined as any;
      
      expect(() => {
        component.onChartInit(mockChartInstance);
        jest.runAllTimers();
      }).not.toThrow();
      
      jest.useRealTimers();
    });
  });

  describe('click handling', () => {
    it('should handle double click event', () => {
      component.isSingleClick = true;
      component.onChartDblClick({});
      expect(component.isSingleClick).toBe(false);
    });

    it('should handle click event and emit filter update', () => {
      jest.useFakeTimers();
      const mockClickEvent = { data: { value: 123 } };
      const onUpdateFilterSpy = jest.spyOn(component.onUpdateFilter, 'emit');
      
      component.onClick(mockClickEvent);
      
      expect(component.isSingleClick).toBe(true);
      jest.advanceTimersByTime(250);
      
      expect(onUpdateFilterSpy).toHaveBeenCalledWith({
        value: mockClickEvent.data,
        widget: component.widget
      });
      
      jest.useRealTimers();
    });

    it('should not emit filter update if double clicked', () => {
      jest.useFakeTimers();
      const mockClickEvent = { data: { value: 123 } };
      const onUpdateFilterSpy = jest.spyOn(component.onUpdateFilter, 'emit');
      
      // Simulate double click BEFORE the click event
      component.isSingleClick = false;
      component.onClick(mockClickEvent);
      
      jest.advanceTimersByTime(250);
      
      expect(onUpdateFilterSpy).not.toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    it('should not throw error if onUpdateFilter is undefined', () => {
      jest.useFakeTimers();
      component.onUpdateFilter = undefined as any;
      const mockClickEvent = { data: { value: 123 } };
      
      // Wrap only the onClick call in the expect
      expect(() => {
        component.onClick(mockClickEvent);
      }).not.toThrow();
      
      // Advance timers outside the expect
      jest.advanceTimersByTime(250);
      
      jest.useRealTimers();
    });

    it('should handle click event with undefined data', () => {
      jest.useFakeTimers();
      const mockClickEvent = {};
      const onUpdateFilterSpy = jest.spyOn(component.onUpdateFilter, 'emit');
      
      component.onClick(mockClickEvent);
      jest.advanceTimersByTime(250);
      
      expect(onUpdateFilterSpy).toHaveBeenCalledWith({
        value: undefined,
        widget: component.widget
      });
      
      jest.useRealTimers();
    });
  });
});

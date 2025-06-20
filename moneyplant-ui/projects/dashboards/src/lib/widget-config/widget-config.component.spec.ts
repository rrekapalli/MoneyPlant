import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WidgetConfigComponent } from './widget-config.component';
import { MessageService } from 'vis-storybook';
import { DashboardApi } from 'vis-services';
import { FormlyModule } from '@ngx-formly/core';
import { of, throwError } from 'rxjs';
import { IWidget } from '../entities/IWidget';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WidgetConfigComponent', () => {
  let component: WidgetConfigComponent;
  let fixture: ComponentFixture<WidgetConfigComponent>;
  let messageService: jest.Mocked<MessageService>;
  let dashboardApi: jest.Mocked<DashboardApi>;

  beforeEach(async () => {
    messageService = {
      add: jest.fn()
    } as any;

    dashboardApi = {
      updateByQuery: jest.fn()
    } as any;

    const mockEnvironment = {
      production: false,
    };

    await TestBed.configureTestingModule({
      imports: [
        FormlyModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        { provide: MessageService, useValue: messageService },
        { provide: DashboardApi, useValue: dashboardApi },
        { provide: 'environment', useValue: mockEnvironment }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WidgetConfigComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formModel on ngOnInit', () => {
    component.ngOnInit();
    expect(component.formModel).toEqual({});
  });

  it('should update activeItem on tab change', () => {
    const menuItem = { label: 'Test', value: 1 };
    component.onActiveTabItemChange(menuItem);
    expect(component.activeItem).toBe(menuItem);
  });

  it('should initialize formModel as empty object', () => {
    expect(component.formModel).toBeUndefined(); // Before init
    component.ngOnInit();
    expect(component.formModel).toBeDefined();
    expect(component.formModel).toEqual({});
  });

  it('should update activeItem when tab changes', () => {
    const previousItem = component.activeItem;
    const newMenuItem = { label: 'New Tab', value: 2 };
    
    component.onActiveTabItemChange(newMenuItem);
    
    expect(component.activeItem).not.toBe(previousItem);
    expect(component.activeItem).toBe(newMenuItem);
    expect(component.activeItem?.label).toBe('New Tab');
    expect(component.activeItem?.['value']).toBe(2);
  });

  it('should return widget title', () => {
    const mockWidget: IWidget = {
      id: 'test',
      position: { x: 0, y: 0, rows: 1, cols: 1 },
      config: {
        component: 'test',
        header: { title: 'Test Title' },
        options: {}
      },
      series: [{}]
    };
    component.widget = mockWidget;
    expect(component.title).toBe('Test Title');
  });

  it('should return undefined when widget is not set', () => {
    component.widget = undefined;
    expect(component.title).toBeUndefined();
  });

  describe('widget setter', () => {
    it('should patch form values after delay', fakeAsync(() => {
      const mockWidget: IWidget = {
        id: 'test',
        position: { x: 0, y: 0, rows: 1, cols: 1 },
        config: {
          component: 'test',
          header: { title: 'Test' },
          options: {}
        },
        series: [{}]
      };

      jest.spyOn(component.formWidgetOptions, 'patchValue');
      component.widget = mockWidget;

      tick(1000);

      expect(component.formWidgetOptions.patchValue).toHaveBeenCalledWith({
        position: mockWidget.position,
        config: mockWidget.config
      });
    }));
  });

  describe('onWidgetSave', () => {
    const mockWidget: IWidget = {
      id: 'test-id',
      config: {
        component: 'TestComponent',
        header: { title: 'Test Widget' },
        options: {}
      },
      position: { x: 0, y: 0, rows: 1, cols: 1 },
      series: [{}]
    };

    beforeEach(() => {
      component.widget = mockWidget;
      component.selectedDashboardId = 'dashboard-1';
      component.formModel = { series: [{ data: 'test' }] };
    });

    it('should emit updated widget', () => {
      jest.spyOn(component.onUpdate, 'emit');
      component.onWidgetSave();
      expect(component.onUpdate.emit).toHaveBeenCalled();
    });

    it('should handle successful API update', () => {
      const apiResponse = { id: 'new-id' };
      dashboardApi.updateByQuery.mockReturnValue(of(apiResponse as any));

      component.onWidgetSave();

      expect(dashboardApi.updateByQuery).toHaveBeenCalledWith(
        'dashboard-1/test-id/visualization',
        {
          name: 'Test Widget',
          category: 'TestComponent',
          description: 'TestComponent',
          placementOptions: JSON.stringify(mockWidget.position),
          chartOptions: JSON.stringify(mockWidget.config),
          otherOptions: JSON.stringify(mockWidget.series)
        }
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'SUCCESS',
        detail: 'Visualization created successfully',
        key: 'br',
        life: 3000
      });
    });

    it('should handle API error', () => {
      dashboardApi.updateByQuery.mockReturnValue(throwError(() => new Error('API Error')));

      component.onWidgetSave();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'ERROR',
        detail: 'Error creating visualization',
        key: 'br',
        life: 3000
      });
    });

    it('should handle empty series', () => {
      const widgetWithoutSeries: IWidget = {
        ...mockWidget,
        series: [] as any
      };
      component.widget = widgetWithoutSeries;
      dashboardApi.updateByQuery.mockReturnValue(of({ id: 'new-id' } as any));

      component.onWidgetSave();

      expect(widgetWithoutSeries.series).toEqual([{}]);
    });
  });

});

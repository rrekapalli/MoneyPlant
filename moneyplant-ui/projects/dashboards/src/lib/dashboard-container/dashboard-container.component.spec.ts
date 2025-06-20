import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DashboardContainerComponent} from "./dashboard-container.component";
import {GridsterComponent, GridsterItemComponent} from "angular-gridster2";
import {NgxPrintModule} from "ngx-print";
import {MessageService} from 'vis-storybook';

describe('Dashboard: DashboardContainerComponent', () => {
  let fixture: ComponentFixture<DashboardContainerComponent>;
  let dashboardContainerComponent: DashboardContainerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        GridsterComponent,
        GridsterItemComponent,
        NgxPrintModule,
        MessageService,
        {provide: 'environment', useValue: {}},
      ]
    });
    fixture = TestBed.createComponent(DashboardContainerComponent);
    dashboardContainerComponent = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('Should create an instance of component', () => {
    expect(dashboardContainerComponent).toBeTruthy();
  });

  it('Should update a widget in widgets array', () => {
    const widgets: any = [
      {id: 'Id1'},
      {id: 'Id2'},
    ];
    dashboardContainerComponent.widgets = widgets;
    const updatedWidget: any = {id: 'Id2', name: 'Updated Widget 2'};
    dashboardContainerComponent.onUpdateWidget(updatedWidget);
    expect(dashboardContainerComponent.widgets.length).toBe(2);
    expect(dashboardContainerComponent.widgets[0].id).toBe('Id1');
    expect(dashboardContainerComponent.widgets[1].id).toBe('Id2');
  });

  it('Should set containerTouched to true and editModeString to "[Edit Mode - Pending Changes]" on widget resize', () => {
    const item: any = {cols: 2, rows: 2, y: 0, x: 0};
    const itemComponent: any = {};
    DashboardContainerComponent.onWidgetResize(item, itemComponent);
    expect(DashboardContainerComponent.containerTouched).toBe(true);
    expect(DashboardContainerComponent.editModeString).toBe('[Edit Mode - Pending Changes]');
  });

  it('Should reset containerTouched and editModeString before calling onWidgetResize', () => {
    DashboardContainerComponent.containerTouched = false;
    DashboardContainerComponent.editModeString = '';
    const item: any = {cols: 2, rows: 2, y: 0, x: 0};
    const itemComponent: any = {};
    DashboardContainerComponent.onWidgetResize(item, itemComponent);
    expect(DashboardContainerComponent.containerTouched).toBe(true);
    expect(DashboardContainerComponent.editModeString).toBe('[Edit Mode - Pending Changes]');
  });

  it('Should set containerTouched to true and editModeString to "[Edit Mode - Pending Changes]" on widget change', () => {
    const item: any = {cols: 2, rows: 2, y: 0, x: 0};
    const itemComponent: any = {};
    DashboardContainerComponent.onWidgetChange(item, itemComponent);
    expect(DashboardContainerComponent.containerTouched).toBe(true);
    expect(DashboardContainerComponent.editModeString).toBe('[Edit Mode - Pending Changes]');
  });

  it('Should reset containerTouched and editModeString before calling onWidgetResize', () => {
    DashboardContainerComponent.containerTouched = false;
    DashboardContainerComponent.editModeString = '';
    const item: any = {cols: 2, rows: 2, y: 0, x: 0};
    const itemComponent: any = {};
    DashboardContainerComponent.onWidgetChange(item, itemComponent);
    expect(DashboardContainerComponent.containerTouched).toBe(true);
    expect(DashboardContainerComponent.editModeString).toBe('[Edit Mode - Pending Changes]');
  });

  it('Should emit editModeStringChange when updateString is called', () => {
    jest.spyOn(dashboardContainerComponent.editModeStringChange, 'emit');
    const editModeString = 'New Edit Mode String';
    dashboardContainerComponent.updateString(editModeString);
    expect(dashboardContainerComponent.editModeStringChange.emit).toHaveBeenCalledWith(editModeString);
  });

  it('Should log editModeString and return the static editModeString', () => {
    const testString = 'Test Edit Mode String';
    DashboardContainerComponent.editModeString = testString;
    const result = dashboardContainerComponent.getEditModeString(testString);
    expect(result).toBe(testString);
  });

  it('Should update the filter widget and emit the update event', () => {
    jest.spyOn(dashboardContainerComponent, 'onUpdateWidget');
    const mockEvent = {
      widget: {
        config: {
          state: {
            accessor: 'testAccessor'
          }
        }
      },
      value: 'testValue'
    };
    const filterWidget: any = {
      config: {
        component: 'filter',
        options: {
          values: []
        }
      }
    };
    dashboardContainerComponent.widgets = [filterWidget];
    dashboardContainerComponent.onUpdateFilter(mockEvent);
    const expectedUpdatedWidget = {
      ...filterWidget,
      config: {
        ...filterWidget.config,
        options: {
          ...filterWidget.config.options,
          values: [{
            accessor: 'testAccessor',
            testAccessor: 'testValue'
          }]
        }
      }
    };
    expect(dashboardContainerComponent.onUpdateWidget).toHaveBeenCalledWith(expectedUpdatedWidget);
  });

  it('should call onDashboardSelectionChanged and do nothing', () => {
    const mockEvent = {value: 'someValue'};
    const result = dashboardContainerComponent.onDashboardSelectionChanged(mockEvent);
    expect(result).toBeUndefined();
  });

  it('should delete the specified widget from the widgets array', () => {
    const widget1: any = {id: '1', config: {}};
    const widget2: any = {id: '2', config: {}};
    const widget3: any = {id: '3', config: {}};
    dashboardContainerComponent.widgets = [widget1, widget2, widget3];
    dashboardContainerComponent.onDeleteWidget(widget2);
    expect(dashboardContainerComponent.widgets).toEqual([widget1, widget3]);
  });

  it('should initialize with default values', () => {
    expect(dashboardContainerComponent.filterValues).toEqual([]);
    expect(dashboardContainerComponent.isEditMode).toBeFalsy();
    expect(dashboardContainerComponent.chartHeight).toBe(300);
    expect(dashboardContainerComponent.availableDashboards).toEqual([]);
    expect(dashboardContainerComponent.onShowConfirmation).toBeFalsy();
    expect(dashboardContainerComponent.onShowNewDashboardDialog).toBeFalsy();
  });

  it('should initialize gridster options correctly', () => {
    expect(dashboardContainerComponent.options.gridType).toBeDefined();
    expect(dashboardContainerComponent.options.draggable?.enabled).toBeFalsy();
    expect(dashboardContainerComponent.options.pushItems).toBeFalsy();
    expect(dashboardContainerComponent.options.maxCols).toBe(12);
  });

  it('should log dashboardId on ngOnInit', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    const testId = 'test-dashboard-id';
    dashboardContainerComponent.dashboardId = testId;
    
    dashboardContainerComponent.ngOnInit();
    
    expect(consoleSpy).toHaveBeenCalledWith('Id', testId);
  });

  it('should handle onDataLoad with empty widget data', async () => {
    const widget = {
      id: 'test',
      config: {
        component: 'chart',
        options: {
          series: []
        }
      }
    };

    await dashboardContainerComponent.onDataLoad(widget as any);
    expect(widget.config.options.series).toEqual([]);
  });

  it('should handle onDataLoad with non-empty widget data', async () => {
    const widget = {
      id: 'test',
      config: {
        component: 'chart',
        options: {
          series: [{
            encode: {
              x: 'table1.name1.col1.colName1',
              y: 'table2.name2.col2.colName2'
            }
          }]
        }
      }
    };

    await dashboardContainerComponent.onDataLoad(widget as any);
    // Add assertions based on your expected transformation
  });

  it('should emit containerTouchChanged event', () => {
    jest.spyOn(dashboardContainerComponent.containerTouchChanged, 'emit');
    
    dashboardContainerComponent.containerTouchChanged.emit(true);
    
    expect(dashboardContainerComponent.containerTouchChanged.emit).toHaveBeenCalledWith(true);
  });

  it('should emit changesMade event', () => {
    jest.spyOn(dashboardContainerComponent.changesMade, 'emit');
    const changes = 'test changes';
    
    dashboardContainerComponent.changesMade.emit(changes);
    
    expect(dashboardContainerComponent.changesMade.emit).toHaveBeenCalledWith(changes);
  });

  it('should handle onUpdateFilter with no filter widget', () => {
    dashboardContainerComponent.widgets = [];
    const event = {
      widget: {
        config: {
          state: {
            accessor: 'testAccessor'
          }
        }
      },
      value: 'testValue'
    };

    dashboardContainerComponent.onUpdateFilter(event);
    
    expect(dashboardContainerComponent.widgets).toEqual([]);
  });

  it('should handle MessageService when deleting widget', () => {
    const messageServiceSpy = jest.spyOn(TestBed.inject(MessageService), 'add');
    const widget = { id: '1', config: {} };
    dashboardContainerComponent.widgets = [widget as any];

    dashboardContainerComponent.onDeleteWidget(widget as any);

    expect(messageServiceSpy).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'ALERT',
      detail: 'Widget Deleted!',
      key: 'br',
      life: 3000
    });
  });

  describe('Static methods', () => {
    beforeEach(() => {
      DashboardContainerComponent.containerTouched = false;
      DashboardContainerComponent.editModeString = '';
    });

    it('should handle static onWidgetResize', () => {
      const item = { x: 0, y: 0, rows: 1, cols: 1 };
      const itemComponent: any = {};

      DashboardContainerComponent.onWidgetResize(item, itemComponent);

      expect(DashboardContainerComponent.containerTouched).toBeTruthy();
      expect(DashboardContainerComponent.editModeString).toBe('[Edit Mode - Pending Changes]');
    });

    it('should handle static onWidgetChange', () => {
      const item = { x: 0, y: 0, rows: 1, cols: 1 };
      const itemComponent: any = {};

      DashboardContainerComponent.onWidgetChange(item, itemComponent);

      expect(DashboardContainerComponent.containerTouched).toBeTruthy();
      expect(DashboardContainerComponent.editModeString).toBe('[Edit Mode - Pending Changes]');
    });
  });
});

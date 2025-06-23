import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {WidgetHeaderComponent} from "./widget-header.component";

describe('Dashboard: WidgetConfigComponent', () => {
  let fixture: ComponentFixture<WidgetHeaderComponent>;
  let widgetHeaderComponent: WidgetHeaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        {provide: 'environment', useValue: {}},
      ]
    });
    fixture = TestBed.createComponent(WidgetHeaderComponent);
    widgetHeaderComponent = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('Should create an instance of component', () => {
    expect(widgetHeaderComponent).toBeTruthy();
  });

  it('Should update widget options', () => {
    const data: any = {id: 'widgetId'};
    jest.spyOn(widgetHeaderComponent.onUpdateWidget, 'emit');
    widgetHeaderComponent.onUpdateOptions(data);
    expect(widgetHeaderComponent.onUpdateWidget.emit).toHaveBeenCalledWith(data);
    expect(widgetHeaderComponent.sidebarVisible).toBeFalsy();
  });

  it('Should update edit mode from true to false', () => {
    widgetHeaderComponent.onEditMode = true;
    widgetHeaderComponent.onEditModeClicked();
    expect(widgetHeaderComponent.onEditMode).toBe(false);
  });

  it('Should update edit mode from false to true', () => {
    widgetHeaderComponent.onEditMode = false;
    widgetHeaderComponent.onEditModeClicked();
    expect(widgetHeaderComponent.onEditMode).toBe(true);
  });

  it('Should emit the selected widget and delete it', () => {
    const event: any = [];
    const widget: any = {id: 'WidgetId'}
    widgetHeaderComponent.widget = widget;
    jest.spyOn(widgetHeaderComponent.onDeleteWidget, 'emit');
    widgetHeaderComponent.onDeleteWidgetClicked(event);
    expect(widgetHeaderComponent.onDeleteWidget.emit).toHaveBeenCalledWith(widget);
  });
});

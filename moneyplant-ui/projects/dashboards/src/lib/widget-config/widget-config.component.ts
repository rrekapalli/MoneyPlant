import {Component, EventEmitter, inject, Input, Output, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {IWidget} from '../entities/IWidget';
import {TabMenuModule} from 'primeng/tabmenu';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {ButtonModule} from 'primeng/button';
import {ToastModule} from 'primeng/toast';
import {CommonModule} from '@angular/common';
import {MenuItem, MessageService} from 'primeng/api';
import {merge} from "rxjs";
import {InputTextModule} from 'primeng/inputtext';
import {DropdownModule} from 'primeng/dropdown';
import {InputNumberModule} from 'primeng/inputnumber';
import {InputSwitchModule} from 'primeng/inputswitch';
import {InputTextarea} from 'primeng/inputtextarea';
import {WidgetPluginService} from '../services/widget-plugin.service';

@Component({
  selector: 'vis-widget-config',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule,
    ScrollPanelModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    InputSwitchModule,
    InputTextarea
  ],
  providers: [MessageService],
  templateUrl: './widget-config.component.html',
  styleUrls: ['./widget-config.component.scss'],
})
export class WidgetConfigComponent implements OnInit {
  // Visibility state
  sidebarVisible: boolean = true;

  // Widget data
  private _widget!: IWidget | undefined;
  private originalWidget: IWidget | undefined;

  // Event emitters
  @Output() onUpdate: EventEmitter<IWidget> = new EventEmitter();
  @Output() onCancel: EventEmitter<void> = new EventEmitter();

  // Inputs
  @Input() selectedDashboardId: any;
  @Input() set widget(value: IWidget | undefined) {
    this._widget = value;
    this.originalWidget = JSON.parse(JSON.stringify(value)); // Deep copy for reset functionality

    // Initialize forms when widget changes
    this.initForms();
  }

  get widget(): IWidget | undefined {
    return this._widget;
  }

  // Tab menu items
  items: MenuItem[] = [
    {label: 'General', value: 0},
    {label: 'Position', value: 1},
    {label: 'Options', value: 2},
    {label: 'Advanced', value: 3},
  ];

  activeItem: MenuItem = this.items[0];

  // Form groups
  generalForm: FormGroup;
  positionForm: FormGroup;
  optionsForm: FormGroup;
  filterForm: FormGroup;
  advancedForm: FormGroup;

  // Dropdown options
  availableComponents: any[] = [];
  chartTypes: any[] = [];
  chartThemes: any[] = [];
  filterTypes: any[] = [];

  // JSON validation
  isJsonInvalid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private widgetPluginService: WidgetPluginService
  ) {
    // Initialize form groups
    this.generalForm = this.fb.group({
      title: ['', Validators.required],
      component: ['', Validators.required]
    });

    this.positionForm = this.fb.group({
      x: [0, [Validators.required, Validators.min(0)]],
      y: [0, [Validators.required, Validators.min(0)]],
      cols: [6, [Validators.required, Validators.min(1), Validators.max(12)]],
      rows: [4, [Validators.required, Validators.min(1)]]
    });

    this.optionsForm = this.fb.group({
      chartType: ['bar'],
      chartTheme: ['default'],
      showLegend: [true],
      enableDataZoom: [false],
      chartTitle: ['']
    });

    this.filterForm = this.fb.group({
      filterType: ['dropdown'],
      multiSelect: [false],
      placeholder: ['Select...']
    });

    this.advancedForm = this.fb.group({
      jsonConfig: ['', this.validateJson]
    });
  }

  ngOnInit() {
    // Initialize available components
    this.availableComponents = [
      { label: 'Chart', value: 'echart' },
      { label: 'Filter', value: 'filter' },
      { label: 'Table', value: 'table' },
      { label: 'Markdown', value: 'markdown' },
      { label: 'Code', value: 'code' }
    ];

    // Initialize chart types
    this.chartTypes = [
      { label: 'Bar Chart', value: 'bar' },
      { label: 'Line Chart', value: 'line' },
      { label: 'Pie Chart', value: 'pie' },
      { label: 'Scatter Chart', value: 'scatter' },
      { label: 'Radar Chart', value: 'radar' }
    ];

    // Initialize chart themes
    this.chartThemes = [
      { label: 'Default', value: 'default' },
      { label: 'Dark', value: 'dark' },
      { label: 'Light', value: 'light' }
    ];

    // Initialize filter types
    this.filterTypes = [
      { label: 'Dropdown', value: 'dropdown' },
      { label: 'Multi-select', value: 'multiselect' },
      { label: 'Date Range', value: 'daterange' },
      { label: 'Slider', value: 'slider' }
    ];

    // Initialize forms with widget data
    this.initForms();
  }

  /**
   * Initializes all form groups with widget data
   */
  private initForms() {
    if (!this._widget) return;

    // General form
    this.generalForm.patchValue({
      title: this._widget.config?.header?.title || '',
      component: this._widget.config?.component || ''
    });

    // Position form
    this.positionForm.patchValue({
      x: this._widget.position?.x || 0,
      y: this._widget.position?.y || 0,
      cols: this._widget.position?.cols || 6,
      rows: this._widget.position?.rows || 4
    });

    // Options form - depends on widget type
    if (this.isEchartWidget()) {
      const options = this._widget.config?.options as echarts.EChartsOption;
      this.optionsForm.patchValue({
        chartType: this.getChartType(options),
        chartTheme: 'default',
        showLegend: options.legend !== undefined,
        enableDataZoom: options.dataZoom !== undefined,
        chartTitle: options.title ? (typeof options.title === 'object' ? (Array.isArray(options.title) ? (options.title[0]?.text || '') : options.title.text || '') : '') : ''
      });
    }

    // Filter form
    if (this.isFilterWidget()) {
      const options = this._widget.config?.options as any;
      this.filterForm.patchValue({
        filterType: options.type || 'dropdown',
        multiSelect: options.multiSelect || false,
        placeholder: options.placeholder || 'Select...'
      });
    }

    // Advanced form
    this.advancedForm.patchValue({
      jsonConfig: JSON.stringify(this._widget, null, 2)
    });
  }

  /**
   * Gets the widget title
   */
  get title() {
    return this.widget?.config?.header?.title || 'Configure Widget';
  }

  /**
   * Gets the widget type name for display
   */
  getWidgetTypeName(): string {
    const component = this.widget?.config?.component;
    if (!component) return 'New Widget';

    switch (component) {
      case 'echart': return 'Chart Widget';
      case 'filter': return 'Filter Widget';
      case 'table': return 'Table Widget';
      case 'markdown': return 'Markdown Widget';
      case 'code': return 'Code Widget';
      default: return component.charAt(0).toUpperCase() + component.slice(1) + ' Widget';
    }
  }

  /**
   * Checks if the widget is a new widget
   */
  get isNewWidget(): boolean {
    return !this.widget?.id;
  }

  /**
   * Checks if the widget is an EChart widget
   */
  isEchartWidget(): boolean {
    return this.widget?.config?.component === 'echart';
  }

  /**
   * Checks if the widget is a filter widget
   */
  isFilterWidget(): boolean {
    return this.widget?.config?.component === 'filter';
  }

  /**
   * Gets the chart type from ECharts options
   */
  private getChartType(options: echarts.EChartsOption): string {
    if (!options.series) return 'bar';

    const series = Array.isArray(options.series) ? options.series[0] : options.series;
    return (series as any).type || 'bar';
  }

  /**
   * Validates JSON input
   */
  private validateJson(control: any) {
    if (!control.value) {
      return null;
    }

    try {
      JSON.parse(control.value);
      return null;
    } catch (e) {
      return { invalidJson: true };
    }
  }

  /**
   * Checks if a field is invalid
   */
  isFieldInvalid(formName: string, fieldName: string): boolean {
    const form = this[formName as keyof this] as FormGroup;
    const field = form.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  /**
   * Formats the JSON in the advanced tab
   */
  formatJson() {
    try {
      const json = JSON.parse(this.advancedForm.get('jsonConfig')?.value);
      this.advancedForm.patchValue({
        jsonConfig: JSON.stringify(json, null, 2)
      });
      this.isJsonInvalid = false;
    } catch (e) {
      this.isJsonInvalid = true;
    }
  }

  /**
   * Checks if all forms are valid
   */
  isFormValid(): boolean {
    return this.generalForm.valid && this.positionForm.valid && 
           ((this.isEchartWidget() && this.optionsForm.valid) || 
            (this.isFilterWidget() && this.filterForm.valid) || 
            (!this.isEchartWidget() && !this.isFilterWidget())) &&
           !this.isJsonInvalid;
  }

  /**
   * Handles tab change
   */
  onActiveTabItemChange(event: MenuItem) {
    this.activeItem = event;
  }

  /**
   * Resets the form to the original widget state
   */
  onReset() {
    this._widget = JSON.parse(JSON.stringify(this.originalWidget));
    this.initForms();
    this.messageService.add({
      severity: 'info',
      summary: 'Reset',
      detail: 'Form has been reset to original values',
      key: 'br',
      life: 3000
    });
  }

  /**
   * Cancels editing and emits cancel event
   */
  handleCancel() {
    this.onCancel.emit();
  }

  /**
   * Saves the widget configuration
   */
  onWidgetSave() {
    if (!this.isFormValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the form errors before saving',
        key: 'br',
        life: 3000
      });
      return;
    }

    try {
      // Create updated widget from form values
      const updatedWidget: IWidget = this._widget ? {...this._widget} : {} as IWidget;

      // Update from general form
      if (!updatedWidget.config) {
        updatedWidget.config = {
          options: {}
        };
      }

      if (!updatedWidget.config.header) {
        updatedWidget.config.header = {
          title: ''
        };
      }

      updatedWidget.config.header.title = this.generalForm.value.title;
      updatedWidget.config.component = this.generalForm.value.component;

      // Update from position form
      if (!updatedWidget.position) {
        updatedWidget.position = {
          x: 0,
          y: 0,
          cols: 6,
          rows: 4
        };
      }

      updatedWidget.position.x = this.positionForm.value.x;
      updatedWidget.position.y = this.positionForm.value.y;
      updatedWidget.position.cols = this.positionForm.value.cols;
      updatedWidget.position.rows = this.positionForm.value.rows;

      // Update from options form based on widget type
      if (this.isEchartWidget()) {
        const options = updatedWidget.config.options as echarts.EChartsOption;

        // Create basic chart options if they don't exist
        if (!options.series) {
          options.series = [{
            type: this.optionsForm.value.chartType,
            data: []
          }];
        } else if (Array.isArray(options.series)) {
          options.series.forEach((series: any) => {
            series.type = this.optionsForm.value.chartType;
          });
        }

        // Update legend
        if (this.optionsForm.value.showLegend) {
          options.legend = options.legend || {};
        } else {
          delete options.legend;
        }

        // Update dataZoom
        if (this.optionsForm.value.enableDataZoom) {
          options.dataZoom = options.dataZoom || [{ type: 'inside' }];
        } else {
          delete options.dataZoom;
        }

        // Update title
        if (this.optionsForm.value.chartTitle) {
          options.title = {
            text: this.optionsForm.value.chartTitle
          };
        } else {
          delete options.title;
        }
      }

      // Update from filter form
      if (this.isFilterWidget()) {
        const options = updatedWidget.config.options as any;
        options.type = this.filterForm.value.filterType;
        options.multiSelect = this.filterForm.value.multiSelect;
        options.placeholder = this.filterForm.value.placeholder;
      }

      // Check if advanced JSON was modified and is valid
      if (this.advancedForm.value.jsonConfig && !this.isJsonInvalid) {
        try {
          const jsonConfig = JSON.parse(this.advancedForm.value.jsonConfig);

          // Only update if the JSON is valid and has the required structure
          if (jsonConfig.config && jsonConfig.position) {
            // Merge with the form values to ensure all changes are included
            updatedWidget.config = {...updatedWidget.config, ...jsonConfig.config};
            updatedWidget.position = {...updatedWidget.position, ...jsonConfig.position};
            if (jsonConfig.series) {
              updatedWidget.series = jsonConfig.series;
            }
          }
        } catch (e) {
          // JSON parsing error - already handled by validation
        }
      }

      // Emit the updated widget
      this.onUpdate.emit(updatedWidget);

      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'SUCCESS',
        detail: 'Widget configuration saved successfully',
        key: 'br',
        life: 3000
      });
    } catch (error) {
      console.error('Error saving widget configuration:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'ERROR',
        detail: 'Error saving widget configuration',
        key: 'br',
        life: 3000
      });
    }
  }
}

import * as i0 from '@angular/core';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { GridType, GridsterComponent, GridsterItemComponent } from 'angular-gridster2';
import buildQuery from 'odata-query';
import * as i1 from '@angular/common';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as i3 from 'primeng/panel';
import { PanelModule } from 'primeng/panel';
import * as i1$2 from 'primeng/sidebar';
import { SidebarModule } from 'primeng/sidebar';
import { TabMenuModule } from 'primeng/tabmenu';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import * as i1$1 from 'primeng/button';
import { ButtonModule, Button } from 'primeng/button';
import * as i2 from 'primeng/toast';
import { ToastModule, Toast } from 'primeng/toast';
import * as i2$1 from 'primeng/api';
import { MessageService } from 'primeng/api';
import { NgxPrintModule } from 'ngx-print';

class WidgetBuilder {
    constructor() {
        this.widget = {
            position: { x: 0, y: 0, cols: 1, rows: 1 },
            config: {
                options: {}
            }
        };
    }
    setId(id) {
        this.widget.id = id;
        return this;
    }
    setPosition(position) {
        this.widget.position = position;
        return this;
    }
    setComponent(component) {
        this.widget.config.component = component;
        return this;
    }
    setInitialState(initialState) {
        this.widget.config.initialState = initialState;
        return this;
    }
    setState(state) {
        this.widget.config.state = state;
        return this;
    }
    setHeader(title, options) {
        this.widget.config.header = { title, options };
        return this;
    }
    setSize(size) {
        this.widget.config.size = size;
        return this;
    }
    setEChartsOptions(options) {
        this.widget.config.options = options;
        return this;
    }
    setFilterOptions(options) {
        this.widget.config.options = options;
        return this;
    }
    setTileOptions(options) {
        this.widget.config.options = options;
        return this;
    }
    setMarkdownCellOptions(options) {
        this.widget.config.options = options;
        return this;
    }
    setCodeCellOptions(options) {
        this.widget.config.options = options;
        return this;
    }
    setTableOptions(options) {
        this.widget.config.options = options;
        return this;
    }
    setEvents(onChartOptions) {
        this.widget.config.events = { onChartOptions };
        return this;
    }
    setEventChartOptions(onChartOptions) {
        this.widget.config.events = { onChartOptions };
        return this;
    }
    setSeries(series) {
        this.widget.series = series;
        return this;
    }
    setChartInstance(chartInstance) {
        this.widget.chartInstance = chartInstance;
        return this;
    }
    setEChartsTitle(title) {
        if (!this.widget.config.options) {
            this.widget.config.options = {};
        }
        this.widget.config.options.title = title;
        return this;
    }
    setEChartsGrid(grid) {
        if (!this.widget.config.options) {
            this.widget.config.options = {};
        }
        this.widget.config.options.grid = grid;
        return this;
    }
    setEChartsTooltip(tooltip) {
        if (!this.widget.config.options) {
            this.widget.config.options = {};
        }
        this.widget.config.options.tooltip = tooltip;
        return this;
    }
    setEChartsLegend(legend) {
        if (!this.widget.config.options) {
            this.widget.config.options = {};
        }
        this.widget.config.options.legend = legend;
        return this;
    }
    setEChartsXAxis(xAxis) {
        if (!this.widget.config.options) {
            this.widget.config.options = {};
        }
        this.widget.config.options.xAxis = xAxis;
        return this;
    }
    setEChartsYAxis(yAxis) {
        if (!this.widget.config.options) {
            this.widget.config.options = {};
        }
        this.widget.config.options.yAxis = yAxis;
        return this;
    }
    setEChartsSeries(series) {
        if (!this.widget.config.options) {
            this.widget.config.options = {};
        }
        this.widget.config.options.series = series;
        return this;
    }
    build() {
        return this.widget;
    }
}

// Use require for echarts to avoid the module format conflict
const echarts = require('echarts');
class EchartComponent {
    constructor() {
        this.isSingleClick = true;
        this.initOpts = {
            height: 300,
            rowHeightRatio: 0.25,
            fixedRowHeight: 30,
            width: 'auto',
            locale: 'en',
        };
    }
    get chartOptions() {
        return (this.widget?.config?.options || {});
    }
    onChartInit(instance) {
        if (this.widget) {
            if (instance) {
                // @ts-ignore
                this.widget.chartInstance = instance;
                setTimeout(() => {
                    this.onDataLoad?.emit(this.widget);
                });
            }
        }
    }
    onChartDblClick(e) {
        this.isSingleClick = false;
    }
    onClick(e) {
        this.isSingleClick = true;
        setTimeout(() => {
            let selectedPoint = e.data;
            if (e.seriesType === "scatter" && Array.isArray(e.data) && this.widget.config.state?.accessor) {
                const scatterChartData = e.data.find(this.widget.config.state.accessor);
                if (scatterChartData) {
                    selectedPoint = {
                        ...selectedPoint,
                        ...scatterChartData
                    };
                }
            }
            this.onUpdateFilter?.emit({
                value: selectedPoint,
                widget: this.widget,
            });
        }, 250);
    }
    static { this.ɵfac = function EchartComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || EchartComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: EchartComponent, selectors: [["vis-echart"]], inputs: { widget: "widget", onDataLoad: "onDataLoad", onUpdateFilter: "onUpdateFilter" }, features: [i0.ɵɵProvidersFeature([provideEchartsCore({ echarts })])], decls: 1, vars: 2, consts: [["echarts", "", 3, "chartInit", "chartClick", "chartDblClick", "options", "initOpts"]], template: function EchartComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵlistener("chartInit", function EchartComponent_Template_div_chartInit_0_listener($event) { return ctx.onChartInit($event); })("chartClick", function EchartComponent_Template_div_chartClick_0_listener($event) { return ctx.onClick($event); })("chartDblClick", function EchartComponent_Template_div_chartDblClick_0_listener($event) { return ctx.onChartDblClick($event); });
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("options", ctx.chartOptions)("initOpts", ctx.initOpts);
        } }, dependencies: [CommonModule, NgxEchartsDirective], encapsulation: 2 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EchartComponent, [{
        type: Component,
        args: [{
                selector: 'vis-echart',
                standalone: true,
                template: `<div
    echarts
    [options]="chartOptions"
    (chartInit)="onChartInit($event)"
    (chartClick)="onClick($event)"
    (chartDblClick)="onChartDblClick($event)"
    [initOpts]="initOpts"
  ></div>`,
                imports: [CommonModule, NgxEchartsDirective],
                providers: [provideEchartsCore({ echarts })],
            }]
    }], null, { widget: [{
            type: Input
        }], onDataLoad: [{
            type: Input
        }], onUpdateFilter: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(EchartComponent, { className: "EchartComponent", filePath: "lib/widgets/echarts/echart.component.ts", lineNumber: 26 }); })();

function FilterComponent_Conditional_0_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 5);
    i0.ɵɵlistener("click", function FilterComponent_Conditional_0_For_5_Template_button_click_0_listener() { const item_r3 = i0.ɵɵrestoreView(_r2).$implicit; const ctx_r3 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r3.clearFilter(item_r3)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "uppercase");
    i0.ɵɵpipe(3, "uppercase");
    i0.ɵɵelement(4, "i", 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(2, 2, item_r3.accessor), " = ", i0.ɵɵpipeBind1(3, 4, item_r3[item_r3.accessor]), " ");
} }
function FilterComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 0)(1, "span", 2);
    i0.ɵɵtext(2, "Applied Filter(s):");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span");
    i0.ɵɵrepeaterCreate(4, FilterComponent_Conditional_0_For_5_Template, 5, 6, "button", 3, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 4);
    i0.ɵɵlistener("click", function FilterComponent_Conditional_0_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r1); const ctx_r3 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r3.clearAllFilters(true)); });
    i0.ɵɵtext(7, " Clear All ");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r3.filterValues);
} }
function FilterComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵtext(1, " Please click on any chart element to slice and dice data. You can use annotations to save a specific state of dashboard after applying filters. ");
    i0.ɵɵelementEnd();
} }
/**
 * Component for displaying and managing filter values
 */
class FilterComponent {
    constructor() {
        /** Internal storage for filter values to prevent infinite loops */
        this._filterValues = [];
    }
    /**
     * Initializes the component
     */
    ngOnInit() {
        // Initialize filter values from widget config
        const filters = this.widget.config.options;
        if (filters && filters.values && filters.values.length > 0) {
            this._filterValues = [...filters.values];
        }
    }
    /**
     * Gets the current filter values
     * @returns Array of filter values
     */
    get filterValues() {
        return this._filterValues;
    }
    /**
     * Sets the filter values and updates the widget configuration
     * @param values - The new filter values
     */
    set filterValues(values) {
        if (values && values.length > 0) {
            this._filterValues = [...values];
            this.widget.config.options.values = [...this._filterValues];
        }
        else {
            this._filterValues = [];
            this.widget.config.options.values = [];
        }
    }
    /**
     * Clears all filter values
     *
     * @param item - The item that triggered the clear action
     */
    clearAllFilters(item) {
        if (item) {
            this._filterValues = [];
            this.widget.config.options.values = [];
            this.onUpdateFilter.emit([]);
        }
    }
    /**
     * Clears a specific filter value
     *
     * @param item - The filter value to clear
     */
    clearFilter(item) {
        if (JSON.stringify(item).length > 0) {
            const index = this._filterValues.indexOf(item);
            if (index !== -1) {
                this._filterValues.splice(index, 1);
                this.widget.config.options.values = [...this._filterValues];
                this.onUpdateFilter.emit([...this._filterValues]);
            }
        }
    }
    static { this.ɵfac = function FilterComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FilterComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: FilterComponent, selectors: [["vis-filters"]], inputs: { widget: "widget", onUpdateFilter: "onUpdateFilter" }, decls: 2, vars: 1, consts: [[1, "filter-component"], [1, "filter-component", "pt-2", "pb-1"], [1, "ml-1", "mr-1"], [1, "btn-wide", "mt-1", "mb-1", "mr-1", "btn", "btn-outline-primary", "btn-sm", "chip"], [1, "btn-wide", "ml-2", "mt-1", "mb-1", "mr-1", "btn-outline-warning", "btn-sm", "chip", 3, "click"], [1, "btn-wide", "mt-1", "mb-1", "mr-1", "btn", "btn-outline-primary", "btn-sm", "chip", 3, "click"], [1, "pi", "pi-times-circle", "close-icon"]], template: function FilterComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, FilterComponent_Conditional_0_Template, 8, 0, "div", 0)(1, FilterComponent_Conditional_1_Template, 2, 0, "div", 1);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.filterValues && ctx.filterValues.length > 0 ? 0 : 1);
        } }, dependencies: [CommonModule, i1.UpperCasePipe], styles: [".chip[_ngcontent-%COMP%]{border-radius:50px;font-size:10px;font-weight:700!important;border:1px dashed #a6a6a6}.filter-component[_ngcontent-%COMP%]{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;vertical-align:middle;margin:.2rem;padding-left:1rem;font-size:.9rem;font-weight:600}.close-icon[_ngcontent-%COMP%]{vertical-align:middle;margin-left:3px}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FilterComponent, [{
        type: Component,
        args: [{ selector: 'vis-filters', standalone: true, imports: [CommonModule], template: "@if (filterValues && filterValues.length > 0) {\r\n  <div class=\"filter-component\">\r\n    <span class=\"ml-1 mr-1\">Applied Filter(s):</span>\r\n\r\n    <span>\r\n      @for (item of filterValues; track item) {\r\n        <button class=\"btn-wide mt-1 mb-1 mr-1 btn btn-outline-primary btn-sm chip\"\r\n                (click)=\"clearFilter(item)\">\r\n              {{ item.accessor | uppercase }} = {{ item[item.accessor] | uppercase }}\r\n          <i class=\"pi pi-times-circle close-icon\"></i>\r\n          </button>\r\n      }\r\n    </span>\r\n    \r\n    <button class=\"btn-wide ml-2 mt-1 mb-1 mr-1 btn-outline-warning btn-sm chip\" \r\n      (click)=\"clearAllFilters(true)\">\r\n      Clear All\r\n    </button>\r\n    \r\n    <!-- <button class=\"btn-wide ml-1 mt-1 mb-1 mr-1 btn btn-outline-warning btn-sm chip\"\r\n            (click)=\"chartOptions.callBackFunc(filters)\">\r\n      Add Annotation\r\n    </button>\r\n\r\n    <button class=\"btn-wide ml-1 mt-1 mb-1 mr-1 btn btn-outline-warning btn-sm chip\"\r\n            (click)=\"chartOptions.onClickViewOdata(filters)\">\r\n      View Data\r\n    </button> -->\r\n    \r\n  </div>\r\n} @else {\r\n  <div class=\"filter-component pt-2 pb-1\">\r\n    Please click on any chart element to slice and dice data. You can use annotations to save a specific state of\r\n    dashboard after applying filters.\r\n  </div>\r\n}\r\n", styles: [".chip{border-radius:50px;font-size:10px;font-weight:700!important;border:1px dashed #a6a6a6}.filter-component{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;vertical-align:middle;margin:.2rem;padding-left:1rem;font-size:.9rem;font-weight:600}.close-icon{vertical-align:middle;margin-left:3px}\n"] }]
    }], null, { widget: [{
            type: Input
        }], onUpdateFilter: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(FilterComponent, { className: "FilterComponent", filePath: "lib/widgets/filter/filter.component.ts", lineNumber: 17 }); })();

class TableComponent {
    static { this.ɵfac = function TableComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TableComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TableComponent, selectors: [["vis-table"]], inputs: { widget: "widget" }, decls: 0, vars: 0, template: function TableComponent_Template(rf, ctx) { }, dependencies: [CommonModule], encapsulation: 2 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TableComponent, [{
        type: Component,
        args: [{ selector: 'vis-table', standalone: true, imports: [CommonModule], template: "" }]
    }], null, { widget: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TableComponent, { className: "TableComponent", filePath: "lib/widgets/table/table.component.ts", lineNumber: 12 }); })();

class TileComponent {
    static { this.ɵfac = function TileComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TileComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TileComponent, selectors: [["vis-tile"]], inputs: { widget: "widget" }, decls: 0, vars: 0, template: function TileComponent_Template(rf, ctx) { }, dependencies: [CommonModule], encapsulation: 2 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TileComponent, [{
        type: Component,
        args: [{ selector: 'vis-tile', standalone: true, imports: [CommonModule], template: "" }]
    }], null, { widget: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TileComponent, { className: "TileComponent", filePath: "lib/widgets/tile/tile.component.ts", lineNumber: 12 }); })();

class MarkdownCellComponent {
    static { this.ɵfac = function MarkdownCellComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MarkdownCellComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MarkdownCellComponent, selectors: [["vis-markdown-cell"]], inputs: { widget: "widget" }, decls: 0, vars: 0, template: function MarkdownCellComponent_Template(rf, ctx) { }, dependencies: [CommonModule], encapsulation: 2 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MarkdownCellComponent, [{
        type: Component,
        args: [{ selector: 'vis-markdown-cell', standalone: true, imports: [CommonModule], template: "" }]
    }], null, { widget: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MarkdownCellComponent, { className: "MarkdownCellComponent", filePath: "lib/widgets/markdown-cell/markdown-cell.component.ts", lineNumber: 12 }); })();

class CodeCellComponent {
    static { this.ɵfac = function CodeCellComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CodeCellComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: CodeCellComponent, selectors: [["vis-code-cell"]], inputs: { widget: "widget" }, decls: 0, vars: 0, template: function CodeCellComponent_Template(rf, ctx) { }, dependencies: [CommonModule], encapsulation: 2 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CodeCellComponent, [{
        type: Component,
        args: [{ selector: 'vis-code-cell', standalone: true, imports: [CommonModule], template: "" }]
    }], null, { widget: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(CodeCellComponent, { className: "CodeCellComponent", filePath: "lib/widgets/code-cell/code-cell.component.ts", lineNumber: 12 }); })();

const _c0$1 = () => ({ height: "20vh" });
function WidgetComponent_Conditional_0_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function WidgetComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, WidgetComponent_Conditional_0_ng_container_1_Template, 1, 0, "ng-container", 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵstyleMap(i0.ɵɵpureFunction0(4, _c0$1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngComponentOutlet", ctx_r0.currentWidget.component)("ngComponentOutletInputs", ctx_r0.currentWidget.inputs);
} }
function WidgetComponent_Conditional_1_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function WidgetComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, WidgetComponent_Conditional_1_ng_container_1_Template, 1, 0, "ng-container", 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵstyleMap(i0.ɵɵpureFunction0(4, _c0$1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngComponentOutlet", ctx_r0.currentWidget.component)("ngComponentOutletInputs", ctx_r0.currentWidget.inputs);
} }
/**
 * Determines the appropriate component type based on the widget configuration
 *
 * @param widget - The widget configuration
 * @returns The component type to render
 */
const onGetWidget = (widget) => {
    switch (widget?.config?.component) {
        case 'echart':
            return EchartComponent;
        case 'filter':
            return FilterComponent;
        case 'table':
            return TableComponent;
        case 'tile':
            return TileComponent;
        case 'markdownCell':
            return MarkdownCellComponent;
        case 'codeCell':
            return CodeCellComponent;
        default:
            break;
    }
    return EchartComponent;
};
/**
 * A dynamic widget component that renders different widget types based on configuration
 */
class WidgetComponent {
    constructor() {
        /** Event emitted when data needs to be loaded for the widget */
        this.onDataLoad = new EventEmitter();
        /** Event emitted when filter values are updated */
        this.onUpdateFilter = new EventEmitter();
    }
    /**
     * Gets the current widget component and its inputs
     * @returns An object containing the component type and inputs
     */
    get currentWidget() {
        return {
            component: onGetWidget(this.widget),
            inputs: {
                widget: this.widget,
                onDataLoad: this.onDataLoad,
                onUpdateFilter: this.onUpdateFilter,
            },
        };
    }
    /**
     * Checks if the current widget is an EChart component
     * @returns True if the current widget is an EChart component
     */
    get isEchartComponent() {
        return this.currentWidget.component === EchartComponent;
    }
    static { this.ɵfac = function WidgetComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: WidgetComponent, selectors: [["vis-widget"]], inputs: { widget: "widget" }, outputs: { onDataLoad: "onDataLoad", onUpdateFilter: "onUpdateFilter" }, decls: 2, vars: 1, consts: [[3, "style"], [4, "ngComponentOutlet", "ngComponentOutletInputs"]], template: function WidgetComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, WidgetComponent_Conditional_0_Template, 2, 5, "div", 0)(1, WidgetComponent_Conditional_1_Template, 2, 5, "div", 0);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.isEchartComponent ? 0 : 1);
        } }, dependencies: [NgComponentOutlet], encapsulation: 2 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetComponent, [{
        type: Component,
        args: [{ selector: 'vis-widget', standalone: true, imports: [NgComponentOutlet], template: "@if(isEchartComponent) {\r\n    <div [style]=\"{ height: '20vh' }\">\r\n        <ng-container \r\n            *ngComponentOutlet=\"currentWidget.component; inputs: currentWidget.inputs\">\r\n        </ng-container>\r\n    </div>\r\n}\r\n@else {\r\n    <div [style]=\"{ height: '20vh' }\">\r\n        <ng-container \r\n            *ngComponentOutlet=\"currentWidget.component; inputs: currentWidget.inputs\">\r\n        </ng-container>\r\n    </div>\r\n}" }]
    }], null, { widget: [{
            type: Input
        }], onDataLoad: [{
            type: Output
        }], onUpdateFilter: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(WidgetComponent, { className: "WidgetComponent", filePath: "lib/widgets/widget/widget.component.ts", lineNumber: 46 }); })();

class WidgetConfigComponent {
    constructor() {
        this.sidebarVisible = true;
        this.onUpdate = new EventEmitter();
        this.formModel = {};
        this.items = [
            { label: 'Positions', value: 0 },
            { label: 'Options', value: 1 },
            { label: 'Data Options', value: 2 },
        ];
        this.activeItem = this.items[0];
        this.formWidgetOptions = new FormGroup({});
        this.form = new FormGroup({});
        this.formSeriesOptions = new FormGroup({});
    }
    set widget(value) {
        this._widget = value;
        // Use ngZone.runOutsideAngular to avoid triggering change detection
        // This ensures the form is patched after the component is fully initialized
        queueMicrotask(() => {
            this.formWidgetOptions.patchValue({
                position: value?.position,
                config: value?.config,
            });
        });
    }
    get title() {
        return this.widget?.config?.header?.title;
    }
    ngOnInit() {
        this.formModel = {};
    }
    onActiveTabItemChange(event) {
        this.activeItem = event;
    }
    onWidgetSave() {
        // const newOptions = merge(this._widget, this.formModel);
        // set(newOptions, 'config.options.series', this.formModel.series);
        // this.onUpdate.emit(newOptions);
        //
        // if(this._widget && this._widget){
        //   if(this._widget.series && this._widget.series.length < 1){
        //     this._widget.series?.push({});
        //   }
        // }
        //
        // const payload = {
        //   name: (this._widget?.config?.header?.title ?? this._widget?.id) ?? 'New Widget',
        //   category: this._widget?.config.component ?? 'BarChartVisual',
        //   description: this._widget?.config.component ?? 'BarChartVisual',
        //   placementOptions: JSON.stringify(this._widget?.position),
        //   chartOptions: JSON.stringify(this._widget?.config),
        //   otherOptions: JSON.stringify(this._widget?.series),
        // };
        // // Call the API to save the widget
        // this.dashboardApi.updateByQuery(`${this.selectedDashboardId}/${this._widget?.id}/visualization`, payload)
        // .subscribe({
        //   next: (res: any) => {
        //     if(res && this._widget) {
        //       this._widget.id = res.id;
        //     }
        //   },
        //   error: (error) => {
        //     console.error('Error saving visualization:', error);
        //     this.messageService.add({
        //       severity: 'error',
        //       summary: 'ERROR',
        //       detail: 'Error saving visualization',
        //       key: 'br',
        //       life: 3000
        //     });
        //   },
        //   complete: () => {
        //     this.messageService.add({
        //       severity: 'success',
        //       summary: 'SUCCESS',
        //       detail: 'Visualization saved successfully',
        //       key: 'br',
        //       life: 3000
        //     });
        //   }
        // });
    }
    static { this.ɵfac = function WidgetConfigComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetConfigComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: WidgetConfigComponent, selectors: [["vis-widget-config"]], inputs: { selectedDashboardId: "selectedDashboardId", widget: "widget" }, outputs: { onUpdate: "onUpdate" }, features: [i0.ɵɵProvidersFeature([MessageService])], decls: 9, vars: 3, consts: [["id", "panelId", 2, "height", "100%", "overflow-y", "visible"], [1, "form-buttons"], [1, "form-button"], ["type", "button", "label", "Save", 3, "click", "outlined"], ["type", "button", "label", "Edit", 1, "ui-button-warning", "ml-2", "mr-2", 3, "outlined"], ["type", "reset", "label", "Reset", 1, "ui-button-danger", 3, "outlined"], ["position", "bottom-right", "key", "br"]], template: function WidgetConfigComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "p-button", 3);
            i0.ɵɵlistener("click", function WidgetConfigComponent_Template_p_button_click_3_listener() { return ctx.onWidgetSave(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "div", 2);
            i0.ɵɵelement(5, "p-button", 4);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "div", 2);
            i0.ɵɵelement(7, "p-button", 5);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelement(8, "p-toast", 6);
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("outlined", true);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("outlined", true);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("outlined", true);
        } }, dependencies: [CommonModule,
            FormsModule,
            ReactiveFormsModule,
            TabMenuModule,
            ScrollPanelModule,
            ButtonModule, i1$1.Button, ToastModule, i2.Toast], styles: [".form-buttons[_ngcontent-%COMP%]{display:flex;justify-content:end;margin-top:2rem;padding:1.2rem;align-items:end;position:absolute;bottom:0;right:0}  .p-sidebar .p-sidebar-header .p-sidebar-close, .p-sidebar[_ngcontent-%COMP%]   .p-sidebar-header[_ngcontent-%COMP%]   .p-sidebar-icon[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{border-top-left-radius:5px;border-bottom-left-radius:5px;background:#fff;position:absolute;top:.625rem;padding:.4166666667rem!important;box-shadow:0 .125rem .25rem #00000014;z-index:20;left:-39px;height:3rem;width:3.25rem;color:red}  .form-alignment{margin-left:1rem;margin-right:1rem;width:86.2%}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetConfigComponent, [{
        type: Component,
        args: [{ selector: 'vis-widget-config', standalone: true, imports: [
                    CommonModule,
                    FormsModule,
                    ReactiveFormsModule,
                    TabMenuModule,
                    ScrollPanelModule,
                    ButtonModule,
                    ToastModule,
                ], providers: [MessageService], template: "<div id=\"panelId\" style=\"height:100%; overflow-y: visible;\">\r\n  <div class=\"form-buttons\">\r\n    <!-- Buttons in Footer -->\r\n    <div class=\"form-button\">\r\n      <p-button [outlined]=\"true\" type=\"button\" label=\"Save\" (click)=\"onWidgetSave()\"></p-button>\r\n    </div>\r\n    <div class=\"form-button\">\r\n      <p-button [outlined]=\"true\" type=\"button\" label=\"Edit\" class=\"ui-button-warning ml-2 mr-2\"></p-button>\r\n    </div>\r\n    <div class=\"form-button\">\r\n      <p-button [outlined]=\"true\" type=\"reset\" label=\"Reset\" class=\"ui-button-danger\"></p-button>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n\r\n<!-- Toast Message -->\r\n<p-toast position=\"bottom-right\" key=\"br\" />", styles: [".form-buttons{display:flex;justify-content:end;margin-top:2rem;padding:1.2rem;align-items:end;position:absolute;bottom:0;right:0}::ng-deep .p-sidebar .p-sidebar-header .p-sidebar-close,.p-sidebar .p-sidebar-header .p-sidebar-icon button{border-top-left-radius:5px;border-bottom-left-radius:5px;background:#fff;position:absolute;top:.625rem;padding:.4166666667rem!important;box-shadow:0 .125rem .25rem #00000014;z-index:20;left:-39px;height:3rem;width:3.25rem;color:red}::ng-deep .form-alignment{margin-left:1rem;margin-right:1rem;width:86.2%}\n"] }]
    }], null, { onUpdate: [{
            type: Output
        }], selectedDashboardId: [{
            type: Input
        }], widget: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(WidgetConfigComponent, { className: "WidgetConfigComponent", filePath: "lib/widget-config/widget-config.component.ts", lineNumber: 28 }); })();

const _c0 = () => ({ "width": "30%", height: "100%", padding: "0px", "padding-right": "2px" });
const _c1 = () => ["PROJECT_WRITE", "PROJECT_UPDATE", "PROJECTUSERS_DELETE"];
function WidgetHeaderComponent_ng_template_1_Conditional_0_p_button_0_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p-button", 7);
    i0.ɵɵlistener("click", function WidgetHeaderComponent_ng_template_1_Conditional_0_p_button_0_Template_p_button_click_0_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r2 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r2.onDeleteWidgetClicked($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("outlined", true)("outlined", true);
} }
function WidgetHeaderComponent_ng_template_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵtemplate(0, WidgetHeaderComponent_ng_template_1_Conditional_0_p_button_0_Template, 1, 2, "p-button", 5);
    i0.ɵɵelementStart(1, "p-button", 6);
    i0.ɵɵlistener("click", function WidgetHeaderComponent_ng_template_1_Conditional_0_Template_p_button_click_1_listener() { i0.ɵɵrestoreView(_r1); const ctx_r2 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r2.sidebarVisible = true); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵproperty("hasClaim", i0.ɵɵpureFunction0(3, _c1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("outlined", true)("outlined", true);
} }
function WidgetHeaderComponent_ng_template_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, WidgetHeaderComponent_ng_template_1_Conditional_0_Template, 2, 4);
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r2.onEditMode ? 0 : -1);
} }
function WidgetHeaderComponent_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r2.title, " Settings ");
} }
function WidgetHeaderComponent_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "vis-widget-config", 9);
    i0.ɵɵlistener("onUpdate", function WidgetHeaderComponent_ng_template_4_Template_vis_widget_config_onUpdate_0_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r2 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r2.onUpdateOptions($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r2 = i0.ɵɵnextContext();
    i0.ɵɵproperty("selectedDashboardId", ctx_r2.dashboardId)("widget", ctx_r2.widget);
} }
class WidgetHeaderComponent {
    constructor() {
        this.onUpdateWidget = new EventEmitter();
        this.onDeleteWidget = new EventEmitter();
        this.onEditMode = true;
        this.sidebarVisible = false;
    }
    get title() {
        return this.widget?.config?.header?.title;
    }
    onUpdateOptions(data) {
        this.onUpdateWidget.emit(data);
        this.sidebarVisible = false;
    }
    onEditModeClicked() {
        this.onEditMode = !this.onEditMode;
    }
    onDeleteWidgetClicked(event) {
        this.onDeleteWidget.emit(this.widget);
    }
    static { this.ɵfac = function WidgetHeaderComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetHeaderComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: WidgetHeaderComponent, selectors: [["vis-widget-header"]], inputs: { widget: "widget", onEditMode: "onEditMode", dashboardId: "dashboardId" }, outputs: { onUpdateWidget: "onUpdateWidget", onDeleteWidget: "onDeleteWidget" }, decls: 5, vars: 6, consts: [[3, "header"], ["pTemplate", "icons"], ["position", "right", "model", "false", 3, "visibleChange", "visible", "appendTo"], ["pTemplate", "header"], ["pTemplate", "content"], ["class", "p-button-sm mr-2", "type", "button", "icon", "pi pi-trash", 3, "outlined", "click", 4, "hasClaim"], ["type", "button", "icon", "pi pi-cog", 1, "p-button-sm", 3, "click", "outlined"], ["type", "button", "icon", "pi pi-trash", 1, "p-button-sm", "mr-2", 3, "click", "outlined"], [1, "font-bold", "ml-3", "mb-3", "text-lg"], [3, "onUpdate", "selectedDashboardId", "widget"]], template: function WidgetHeaderComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "p-panel", 0);
            i0.ɵɵtemplate(1, WidgetHeaderComponent_ng_template_1_Template, 1, 1, "ng-template", 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(2, "p-sidebar", 2);
            i0.ɵɵtwoWayListener("visibleChange", function WidgetHeaderComponent_Template_p_sidebar_visibleChange_2_listener($event) { i0.ɵɵtwoWayBindingSet(ctx.sidebarVisible, $event) || (ctx.sidebarVisible = $event); return $event; });
            i0.ɵɵtemplate(3, WidgetHeaderComponent_ng_template_3_Template, 2, 1, "ng-template", 3)(4, WidgetHeaderComponent_ng_template_4_Template, 1, 2, "ng-template", 4);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("header", ctx.title);
            i0.ɵɵadvance(2);
            i0.ɵɵstyleMap(i0.ɵɵpureFunction0(5, _c0));
            i0.ɵɵtwoWayProperty("visible", ctx.sidebarVisible);
            i0.ɵɵproperty("appendTo", "body");
        } }, dependencies: [CommonModule,
            SidebarModule, i1$2.Sidebar, i2$1.PrimeTemplate, PanelModule, i3.Panel, FormsModule,
            ReactiveFormsModule,
            WidgetConfigComponent,
            Button], styles: [".panel-button[_ngcontent-%COMP%]{display:flex;flex-direction:row;justify-content:end}[_nghost-%COMP%]     .p-panel .p-panel-content{display:none}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetHeaderComponent, [{
        type: Component,
        args: [{ selector: 'vis-widget-header', standalone: true, imports: [
                    CommonModule,
                    SidebarModule,
                    PanelModule,
                    FormsModule,
                    ReactiveFormsModule,
                    WidgetConfigComponent,
                    Button
                ], template: "<p-panel [header]=\"title\">\r\n  <ng-template pTemplate=\"icons\">\r\n    @if (onEditMode) {\r\n      <p-button *hasClaim=\"['PROJECT_WRITE','PROJECT_UPDATE','PROJECTUSERS_DELETE']\" [outlined]=\"true\" class=\"p-button-sm mr-2\" type=\"button\" (click)=\"onDeleteWidgetClicked($event)\"\r\n                [outlined]=\"true\"\r\n                icon=\"pi pi-trash\"></p-button>\r\n\r\n      <p-button [outlined]=\"true\" class=\"p-button-sm\" type=\"button\" (click)=\"sidebarVisible = true\" [outlined]=\"true\"\r\n                icon=\"pi pi-cog\"></p-button>\r\n    }\r\n  </ng-template>\r\n</p-panel>\r\n<p-sidebar [(visible)]=\"sidebarVisible\" position=\"right\" model=\"false\" [appendTo]=\"'body'\" [style]=\"{\r\n      'width': '30%',\r\n      height: '100%',\r\n      padding: '0px',\r\n      'padding-right': '2px',\r\n    }\">\r\n  <ng-template pTemplate=\"header\">\r\n    <div class=\"font-bold ml-3 mb-3 text-lg\">\r\n      {{ title }} Settings\r\n    </div>\r\n  </ng-template>\r\n  <ng-template pTemplate=\"content\">\r\n    <vis-widget-config [selectedDashboardId]=\"dashboardId\" [widget]=\"widget\" (onUpdate)=\"onUpdateOptions($event)\"/>\r\n  </ng-template>\r\n</p-sidebar>\r\n", styles: [".panel-button{display:flex;flex-direction:row;justify-content:end}:host ::ng-deep .p-panel .p-panel-content{display:none}\n"] }]
    }], null, { widget: [{
            type: Input
        }], onUpdateWidget: [{
            type: Output
        }], onDeleteWidget: [{
            type: Output
        }], onEditMode: [{
            type: Input
        }], dashboardId: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(WidgetHeaderComponent, { className: "WidgetHeaderComponent", filePath: "lib/widget-header/widget-header.component.ts", lineNumber: 26 }); })();

function DashboardContainerComponent_For_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "vis-widget-header", 8);
    i0.ɵɵlistener("onUpdateWidget", function DashboardContainerComponent_For_4_Conditional_1_Template_vis_widget_header_onUpdateWidget_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onUpdateWidget($event)); })("onDeleteWidget", function DashboardContainerComponent_For_4_Conditional_1_Template_vis_widget_header_onDeleteWidget_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onDeleteWidget($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("dashboardId", ctx_r1.dashboardId)("widget", item_r4)("onEditMode", ctx_r1.isEditMode);
} }
function DashboardContainerComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "gridster-item", 5);
    i0.ɵɵlistener("itemResize", function DashboardContainerComponent_For_4_Template_gridster_item_itemResize_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.updateString("[Edit Mode - Pending Changes]")); })("itemChange", function DashboardContainerComponent_For_4_Template_gridster_item_itemChange_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.updateString("[Edit Mode - Pending Changes]")); });
    i0.ɵɵconditionalCreate(1, DashboardContainerComponent_For_4_Conditional_1_Template, 1, 3, "vis-widget-header", 6);
    i0.ɵɵelementStart(2, "vis-widget", 7);
    i0.ɵɵlistener("onDataLoad", function DashboardContainerComponent_For_4_Template_vis_widget_onDataLoad_2_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onDataLoad($event)); })("onUpdateFilter", function DashboardContainerComponent_For_4_Template_vis_widget_onUpdateFilter_2_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onUpdateFilter($event)); });
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r4 = ctx.$implicit;
    i0.ɵɵproperty("item", item_r4.position);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r4.config.header ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("widget", item_r4);
} }
/**
 * A container component for dashboard widgets.
 *
 * This component provides a grid-based layout for dashboard widgets using angular-gridster2.
 * It handles widget positioning, resizing, data loading, and filtering.
 */
class DashboardContainerComponent {
    constructor() {
        /** Current filter values applied to the dashboard */
        this.filterValues = [];
        /** Current chart height in pixels */
        this.chartHeight = 300;
        /** Default chart height in pixels */
        this.defaultChartHeight = 300;
        /** Event emitted when the container is touched/modified */
        this.containerTouchChanged = new EventEmitter();
        /** Event emitted when the edit mode string changes */
        this.editModeStringChange = new EventEmitter();
        /** Event emitted when changes are made to the dashboard */
        this.changesMade = new EventEmitter();
        /** Available dashboards for selection */
        this.availableDashboards = [];
        /** Whether the dashboard is in edit mode */
        this.isEditMode = false;
        /** Whether to show confirmation dialog */
        this.onShowConfirmation = false;
        /** Whether to show new dashboard dialog */
        this.onShowNewDashboardDialog = false;
        /** Whether the container has been touched/modified */
        this.containerTouched = false;
        /** String representation of the current edit mode state */
        this.editModeString = '';
        /**
         * Gridster configuration options for the dashboard layout
         * @see https://github.com/tiberiuzuld/angular-gridster2
         */
        this.options = {
            gridType: GridType.ScrollVertical,
            draggable: {
                enabled: false,
            },
            pushItems: false,
            margin: 4,
            maxCols: 12,
            minCols: 12,
            rowHeightRatio: 0.15,
            swap: false,
            resizable: {
                enabled: false,
            },
            itemResizeCallback: (item, itemComponent) => this.onWidgetResize(item, itemComponent),
            itemChangeCallback: (item, itemComponent) => this.onWidgetChange(item, itemComponent)
        };
    }
    /**
     * Loads data for a widget and applies any filters
     *
     * @param widget - The widget to load data for
     */
    async onDataLoad(widget) {
        const filterWidget = this.widgets.find((item) => item.config.component === 'filter');
        let widgetData = widget.config.options.series;
        let seriesData;
        this.filterValues = filterWidget?.config?.options?.values;
        if (widgetData) {
            if (widgetData.series) {
                widgetData.map((item) => {
                    return {
                        x: {
                            table: {
                                id: item.encode?.x?.split('.')[0],
                                name: item.encode?.x?.split('.')[1],
                            },
                            column: {
                                id: item.encode?.x?.split('.')[2],
                                name: item.encode?.x?.split('.')[3],
                            },
                        },
                        y: {
                            table: {
                                id: item.encode?.y?.split('.')[0],
                                name: item.encode?.y?.split('.')[1],
                            },
                            column: {
                                id: item.encode?.y?.split('.')[2],
                                name: item.encode?.y?.split('.')[3],
                            },
                        },
                    };
                });
            }
            else {
                widgetData.seriesData = {};
            }
        }
        widget.chartInstance?.showLoading();
        if (widget.config.events?.onChartOptions) {
            const filter = widget.config.state?.isOdataQuery === true ? this.getFilterParams() : this.filterValues;
            widget?.config?.events?.onChartOptions(widget, widget.chartInstance ?? undefined, filter);
        }
    }
    /**
     * Builds OData query parameters from the current filter values
     *
     * @returns A string containing the OData query parameters
     */
    getFilterParams() {
        let params = '';
        if (this.filterValues.length !== 0) {
            const filtersParams = [];
            this.filterValues.map((item) => {
                filtersParams.push({
                    [item.accessor]: item[item.accessor]
                });
            });
            const filter = { and: filtersParams };
            params = buildQuery({ filter });
            params = params.replace('?$', '').replace('=', '') + '/';
        }
        return params;
    }
    /**
     * Updates a widget in the dashboard and reloads data for all widgets
     *
     * @param widget - The updated widget
     */
    onUpdateWidget(widget) {
        const widgetsWithNewOptions = this.widgets.map((item) => item.id === widget.id ? { ...widget } : item);
        this.widgets = widgetsWithNewOptions;
        this.widgets.forEach(widget => this.onDataLoad(widget));
    }
    /**
     * Callback when a widget is resized
     *
     * @param item - The gridster item being resized
     * @param itemComponent - The gridster item component
     */
    onWidgetResize(item, itemComponent) {
        this.containerTouched = true;
        this.editModeString = '[Edit Mode - Pending Changes]';
        this.editModeStringChange.emit(this.editModeString);
        this.containerTouchChanged.emit(this.containerTouched);
    }
    /**
     * Callback when a widget is moved or changed
     *
     * @param item - The gridster item being changed
     * @param itemComponent - The gridster item component
     */
    onWidgetChange(item, itemComponent) {
        this.containerTouched = true;
        this.editModeString = '[Edit Mode - Pending Changes]';
        this.editModeStringChange.emit(this.editModeString);
        this.containerTouchChanged.emit(this.containerTouched);
    }
    /**
     * Updates the edit mode string and emits the change
     *
     * @param editModeString - The new edit mode string
     */
    updateString(editModeString) {
        this.editModeString = editModeString;
        this.editModeStringChange.emit(this.editModeString);
    }
    /**
     * Gets the current edit mode string
     *
     * @returns The current edit mode string
     */
    getEditModeString() {
        return this.editModeString;
    }
    /**
     * Updates the filter widget with new filter values
     *
     * @param $event - The filter event containing the new filter values
     */
    onUpdateFilter($event) {
        const filterWidget = this.widgets.find((item) => item.config.component === 'filter');
        const newFilterWidget = { ...filterWidget };
        if (newFilterWidget) {
            if (Array.isArray($event)) {
                (newFilterWidget?.config?.options).values = $event;
            }
            else if ((newFilterWidget?.config?.options).values) {
                (newFilterWidget?.config?.options).values?.push({
                    accessor: $event.widget.config.state.accessor,
                    // [$event.widget.config.state.accessor]: $event.value,
                    ...$event.value
                });
            }
            this.onUpdateWidget(newFilterWidget);
        }
    }
    /**
     * Handles dashboard selection changes
     *
     * @param $event - The selection change event
     */
    onDashboardSelectionChanged($event) {
        return;
    }
    /**
     * Deletes a widget from the dashboard
     * Only available in edit mode
     *
     * @param widget - The widget to delete
     */
    onDeleteWidget(widget) {
        this.widgets.splice(this.widgets.indexOf(widget), 1);
    }
    /**
     * Calculates the appropriate chart height based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @param flag - Optional flag to adjust height calculation
     * @param baseHeight - Base height to use for calculation (defaults to defaultChartHeight)
     * @returns The calculated chart height in pixels
     */
    calculateChartHeight(cols, rows, flag = false, baseHeight = this.defaultChartHeight) {
        // Base height for a standard container
        const baseContainerHeight = baseHeight;
        // Calculate aspect ratio
        const aspectRatio = cols / rows;
        const area = cols * rows;
        // Adjust zoom based on area
        // Larger area = more zoom out (smaller zoom number)
        const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling
        // Apply margin reduction (2.5% top and bottom = 5% total)
        const marginReduction = 0.95; // 100% - 5%
        // Adjust height based on an aspect ratio:
        // - Taller containers (rows > cols) get proportionally more height
        // - Wider containers (cols > rows) maintain base height
        let heightAdjustment = aspectRatio < 1
            ? 1 / aspectRatio
            : 1;
        if (flag) {
            heightAdjustment = heightAdjustment * aspectRatio;
        }
        return Math.round(baseContainerHeight * heightAdjustment * marginReduction);
    }
    /**
     * Calculates the appropriate map center coordinates based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns An array of [longitude, latitude] for the map center
     */
    calculateMapCenter(cols, rows) {
        // Base center for a USA map
        const baseLongitude = -95;
        const baseLatitude = 38;
        // Adjust center based on an aspect ratio
        const aspectRatio = cols / rows;
        // Adjust longitude more for wider containers
        const longitudeAdjustment = (aspectRatio > 1) ? (aspectRatio - 1) * 5 : 0;
        // Adjust latitude more for taller containers
        const latitudeAdjustment = (aspectRatio < 1) ? ((1 / aspectRatio) - 1) * 2 : 0;
        return [
            baseLongitude + longitudeAdjustment,
            baseLatitude + latitudeAdjustment
        ];
    }
    /**
     * Calculates the appropriate map zoom level based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns The calculated zoom level for the map
     */
    calculateMapZoom(cols, rows) {
        // Base zoom level
        const baseZoom = 4.0;
        // Calculate area of grid
        const area = cols * rows;
        // Adjust zoom based on area
        // Larger area = more zoom out (smaller zoom number)
        const zoomAdjustment = Math.log(area) / Math.log(2); // logarithmic scaling
        // Calculate aspect ratio adjustment
        const aspectRatio = cols / rows;
        const aspectAdjustment = Math.abs(1 - aspectRatio) * 0.5;
        return baseZoom - (zoomAdjustment * 0.1) - aspectAdjustment;
    }
    static { this.ɵfac = function DashboardContainerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DashboardContainerComponent)(); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DashboardContainerComponent, selectors: [["vis-dashboard-container"]], inputs: { widgets: "widgets", filterValues: "filterValues", dashboardId: "dashboardId", isEditMode: "isEditMode", options: "options" }, outputs: { containerTouchChanged: "containerTouchChanged", editModeStringChange: "editModeStringChange", changesMade: "changesMade" }, decls: 6, vars: 1, consts: [[1, "gridster-container"], [1, "mt-2", "dashboard-gridster", 3, "options"], ["id", "dashboard", 1, "print-body"], [3, "item"], ["position", "bottom-right", "key", "br"], [3, "itemResize", "itemChange", "item"], [3, "dashboardId", "widget", "onEditMode"], [3, "onDataLoad", "onUpdateFilter", "widget"], [3, "onUpdateWidget", "onDeleteWidget", "dashboardId", "widget", "onEditMode"]], template: function DashboardContainerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "gridster", 1)(2, "div", 2);
            i0.ɵɵrepeaterCreate(3, DashboardContainerComponent_For_4_Template, 3, 3, "gridster-item", 3, i0.ɵɵrepeaterTrackByIdentity);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelement(5, "p-toast", 4);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("options", ctx.options);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.widgets);
        } }, dependencies: [CommonModule,
            FormsModule,
            GridsterComponent,
            GridsterItemComponent,
            WidgetComponent,
            WidgetHeaderComponent,
            NgxPrintModule,
            Toast], styles: [".vis-chart-container[_ngcontent-%COMP%]{background-color:#fff;min-height:2000px;width:100%;margin:0;padding:0}.gridster-container[_ngcontent-%COMP%]{width:100%;height:120vh}.editMode[_ngcontent-%COMP%]{color:red}.print-body[_ngcontent-%COMP%]{width:95%}@media print{#dashboard[_ngcontent-%COMP%]{width:95%;overflow-y:visible!important;position:relative}@page{size:landscape}}.vis-filter-component[_ngcontent-%COMP%]{font-size:.8rem!important;width:100%;height:40px}  .p-dropdown-custom{width:100%!important}  .p-dropdown-custom.p-dropdown .p-component{width:100%!important}[_nghost-%COMP%]     .p-dialog .p-dialog-content{padding:1rem 1.5rem}[_nghost-%COMP%]     .p-dialog .p-dialog-header, [_nghost-%COMP%]     .p-dialog .p-dialog-footer{background:#f8f9fa}.dashboard-gridster[_ngcontent-%COMP%]{background-color:var(--surface-100)}[_nghost-%COMP%]     .no-border .p-panel-content{border:none!important;background:transparent!important}[_nghost-%COMP%]     .hide-panel-header .p-panel-header{display:none!important}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DashboardContainerComponent, [{
        type: Component,
        args: [{ selector: 'vis-dashboard-container', standalone: true, imports: [
                    CommonModule,
                    FormsModule,
                    GridsterComponent,
                    GridsterItemComponent,
                    WidgetComponent,
                    WidgetHeaderComponent,
                    NgxPrintModule,
                    Toast
                ], template: "<div class=\"gridster-container\">\r\n  <gridster class=\"mt-2 dashboard-gridster\" [options]=\"options\">\r\n    <div id=\"dashboard\" class=\"print-body\">\r\n      @for (item of widgets; track item; let i = $index) {\r\n\r\n        <gridster-item \r\n            [item]=\"item.position\" \r\n            (itemResize)=\"updateString('[Edit Mode - Pending Changes]')\"\r\n            (itemChange)=\"updateString('[Edit Mode - Pending Changes]')\">\r\n\r\n            @if (item.config.header) {\r\n              <vis-widget-header \r\n                  [dashboardId]=\"dashboardId\" \r\n                  [widget]=\"item\" \r\n                  (onUpdateWidget)=\"onUpdateWidget($event)\"\r\n                  (onDeleteWidget)=\"onDeleteWidget($event)\" \r\n                  [onEditMode]=\"isEditMode\"/>\r\n            }\r\n\r\n            <vis-widget \r\n                [widget]=\"item\" \r\n                (onDataLoad)=\"onDataLoad($event)\" \r\n                (onUpdateFilter)=\"onUpdateFilter($event)\"/>\r\n\r\n        </gridster-item>\r\n\r\n      }\r\n    </div>\r\n  </gridster>\r\n</div>\r\n\r\n<!-- Toast Message -->\r\n<p-toast position=\"bottom-right\" key=\"br\" />\r\n", styles: [".vis-chart-container{background-color:#fff;min-height:2000px;width:100%;margin:0;padding:0}.gridster-container{width:100%;height:120vh}.editMode{color:red}.print-body{width:95%}@media print{#dashboard{width:95%;overflow-y:visible!important;position:relative}@page{size:landscape}}.vis-filter-component{font-size:.8rem!important;width:100%;height:40px}::ng-deep .p-dropdown-custom{width:100%!important}::ng-deep .p-dropdown-custom.p-dropdown .p-component{width:100%!important}:host ::ng-deep .p-dialog .p-dialog-content{padding:1rem 1.5rem}:host ::ng-deep .p-dialog .p-dialog-header,:host ::ng-deep .p-dialog .p-dialog-footer{background:#f8f9fa}.dashboard-gridster{background-color:var(--surface-100)}:host ::ng-deep .no-border .p-panel-content{border:none!important;background:transparent!important}:host ::ng-deep .hide-panel-header .p-panel-header{display:none!important}\n"] }]
    }], null, { widgets: [{
            type: Input
        }], filterValues: [{
            type: Input
        }], containerTouchChanged: [{
            type: Output
        }], editModeStringChange: [{
            type: Output
        }], changesMade: [{
            type: Output
        }], dashboardId: [{
            type: Input
        }], isEditMode: [{
            type: Input
        }], options: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DashboardContainerComponent, { className: "DashboardContainerComponent", filePath: "lib/dashboard-container/dashboard-container.component.ts", lineNumber: 49 }); })();

const formOptions = [
    {
        type: 'tabs',
        fieldGroup: [
            {
                props: {
                    label: 'Position',
                },
                fieldGroup: [
                    {
                        key: 'position.x',
                        type: 'number',
                        templateOptions: {
                            label: 'X-axis',
                            required: true,
                            attributes: {
                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                            },
                        },
                    },
                    {
                        key: 'position.y',
                        type: 'number',
                        templateOptions: {
                            label: 'Y-axis',
                            required: true,
                            attributes: {
                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                            },
                        },
                    },
                    {
                        key: 'position.cols',
                        type: 'number',
                        templateOptions: {
                            label: 'Columns',
                            required: true,
                            attributes: {
                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                            },
                        },
                    },
                    {
                        key: 'position.rows',
                        type: 'number',
                        templateOptions: {
                            label: 'Rows',
                            required: true,
                            attributes: {
                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                            },
                        },
                    },
                ],
            },
            {
                props: {
                    label: 'Config',
                },
                fieldGroup: [
                    {
                        key: 'config.component',
                        type: 'select',
                        templateOptions: {
                            label: 'Component',
                            options: [
                                { label: 'ScatterChartVisual', value: 'ScatterChartVisual' },
                                { label: 'PieChartVisual', value: 'PieChartVisual' },
                                { label: 'BarChartVisual', value: 'BarChartVisual' },
                                { label: 'EChart', value: 'echart' },
                                { label: 'NoteBook', value: 'react' }
                            ],
                            attributes: {
                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                                appendTo: 'body',
                            },
                        },
                    },
                    {
                        key: 'config.header',
                        type: 'accordion',
                        templateOptions: {
                            label: 'Header Options',
                        },
                        fieldGroup: [
                            {
                                key: 'title',
                                type: 'input',
                                templateOptions: {
                                    type: 'text',
                                    label: 'Title',
                                    placeholder: 'Enter the title',
                                    attributes: {
                                        style: 'display:grid; width: 100%; margin-bottom:1rem',
                                    },
                                },
                            },
                            {
                                key: 'options',
                                type: 'input',
                                templateOptions: {
                                    label: 'Options',
                                    attributes: {
                                        style: 'display:grid; width: 100%; margin-bottom:1rem',
                                    },
                                },
                            },
                        ],
                    },
                    {
                        key: 'config.options',
                        type: 'accordion',
                        templateOptions: {
                            label: 'Input Fields',
                        },
                        fieldGroup: [
                            {
                                key: 'xAxis',
                                type: 'accordion',
                                templateOptions: {
                                    label: 'XAxis Options',
                                },
                                fieldGroup: [
                                    {
                                        key: 'type',
                                        type: 'select',
                                        templateOptions: {
                                            label: 'XAxis Type',
                                            placeholder: '',
                                            options: [
                                                { label: 'value', value: 'value' },
                                                { label: 'category', value: 'category' },
                                                { label: 'time', value: 'time' },
                                                { label: 'log', value: 'log' },
                                            ],
                                            attributes: {
                                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                                            },
                                        },
                                    },
                                    {
                                        key: 'data',
                                        type: 'input',
                                        templateOptions: {
                                            label: 'Data',
                                            placeholder: '[]',
                                            attributes: {
                                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                                            },
                                        },
                                    },
                                ],
                            },
                            {
                                key: 'yAxis',
                                type: 'accordion',
                                templateOptions: {
                                    label: 'YAxis Options',
                                },
                                fieldGroup: [
                                    {
                                        key: 'type',
                                        type: 'select',
                                        templateOptions: {
                                            label: 'Y Axis Type',
                                            placeholder: '',
                                            options: [
                                                { label: 'value', value: 'value' },
                                                { label: 'category', value: 'category' },
                                                { label: 'time', value: 'time' },
                                                { label: 'log', value: 'log' },
                                            ],
                                            attributes: {
                                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                                            },
                                        },
                                    },
                                    {
                                        key: 'data',
                                        type: 'input',
                                        templateOptions: {
                                            label: 'Data',
                                            placeholder: '[]',
                                            attributes: {
                                                style: 'display:grid; width: 100%; margin-bottom:1rem',
                                            },
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        key: 'series',
                        type: 'series-accordion',
                        templateOptions: {
                            label: 'Series',
                        },
                        fieldArray: {
                            fieldGroup: [
                                {
                                    key: 'type',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Chart Type',
                                        placeholder: '',
                                        options: [
                                            { label: 'bar', value: 'bar' },
                                            { label: 'pie', value: 'pie' },
                                            { label: 'scatter', value: 'scatter' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'data',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Data',
                                        placeholder: '[]',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'encode',
                                    type: 'accordion',
                                    templateOptions: {
                                        label: 'Encode',
                                    },
                                    fieldGroup: [
                                        {
                                            key: 'x',
                                            type: 'series-encode',
                                            templateOptions: {
                                                label: 'Encode X',
                                                placeholder: '',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'y',
                                            type: 'series-encode',
                                            templateOptions: {
                                                label: 'Encode Y',
                                                placeholder: '',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                ],
            },
            {
                props: {
                    label: 'Code'
                },
                fieldGroup: [
                    {
                        key: 'code',
                        type: 'textarea',
                        templateOptions: {
                            label: 'Code',
                            required: true,
                            rows: 10,
                            attributes: {
                                style: 'display:grid; width: 100%; height:30rem; margin-bottom:1rem',
                            },
                        },
                    },
                ]
            },
        ],
    },
];

const dataOptions = [
    {
        key: 'series',
        type: 'series-accordion',
        templateOptions: {
            label: 'Series',
        },
        fieldArray: {
            fieldGroup: [
                {
                    key: 'type',
                    type: 'select',
                    templateOptions: {
                        label: 'Chart Type',
                        placeholder: '',
                        options: [
                            { label: 'bar', value: 'bar' },
                            { label: 'pie', value: 'pie' },
                            { label: 'scatter', value: 'scatter' },
                        ],
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'id',
                    type: 'input',
                    templateOptions: {
                        label: 'Id',
                        placeholder: '',
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'name',
                    type: 'input',
                    templateOptions: {
                        label: 'Name',
                        placeholder: '',
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'colorBy',
                    type: 'select',
                    templateOptions: {
                        label: 'Color By',
                        placeholder: '',
                        options: [
                            { label: 'Series', value: 'series' },
                            { label: 'Data', value: 'data' },
                        ],
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'legendHoverLink',
                    type: 'radio',
                    templateOptions: {
                        label: 'Legend Hover',
                        options: [
                            { label: 'True', value: true },
                            { label: 'False', value: false },
                        ],
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'coordinateSystem',
                    type: 'select',
                    templateOptions: {
                        label: 'Co-Ordinate System',
                        options: [
                            { label: 'cartesian2d', value: 'cartesian2d' },
                            { label: 'polar', value: 'polar' },
                        ],
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'roundedCap',
                    type: 'radio',
                    templateOptions: {
                        label: 'Rounded Cap',
                        options: [
                            { label: 'True', value: true },
                            { label: 'False', value: false },
                        ],
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'realtimeSort',
                    type: 'radio',
                    templateOptions: {
                        label: 'Real-Time Sort',
                        options: [
                            { label: 'True', value: true },
                            { label: 'False', value: false },
                        ],
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'showBackground',
                    type: 'radio',
                    templateOptions: {
                        label: 'Show Background',
                        options: [
                            { label: 'True', value: true },
                            { label: 'False', value: false },
                        ],
                        attributes: {
                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                        },
                    },
                },
                {
                    key: 'backgroundStyle',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Background Style',
                    },
                    fieldGroup: [
                        {
                            key: 'color',
                            type: 'input',
                            templateOptions: {
                                label: 'Color',
                                placeHhlder: '#fff',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderColor',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Color',
                                placeholder: '#fff',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderWidth',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Width',
                                placeHolder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderType',
                            type: 'select',
                            templateOptions: {
                                label: 'Border Type',
                                options: [
                                    { label: 'Solid', value: 'solid' },
                                    { label: 'Dashed', value: 'dashed' },
                                    { label: 'Dotted', value: 'dotted' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderRadius',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Radius',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'opacity',
                            type: 'input',
                            templateOptions: {
                                label: 'Opacity',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                    ],
                },
                {
                    key: 'label',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Label',
                    },
                    fieldGroup: [
                        {
                            key: 'show',
                            type: 'radio',
                            templateOptions: {
                                label: 'Show Label',
                                options: [
                                    { label: 'True', value: true },
                                    { label: 'False', value: false },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'formatter',
                            type: 'input',
                            templateOptions: {
                                label: 'formatter',
                                placeholder: '{ }',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'color',
                            type: 'input',
                            templateOptions: {
                                label: 'Color',
                                placeholder: '#fff',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'fontStyle',
                            type: 'select',
                            templateOptions: {
                                label: 'Font Style',
                                options: [
                                    { label: 'normal', value: 'normal' },
                                    { label: 'italic', value: 'italic' },
                                    { label: 'oblique', value: 'oblique' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'fontWeight',
                            type: 'select',
                            templateOptions: {
                                label: 'Font Weight',
                                options: [
                                    { label: 'normal', value: 'normal' },
                                    { label: 'bold', value: 'bold' },
                                    { label: 'lighter', value: 'lighter' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'fontSize',
                            type: 'input',
                            templateOptions: {
                                label: 'Font Size',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'align',
                            type: 'select',
                            templateOptions: {
                                label: 'Align',
                                options: [
                                    { label: 'left', value: 'left' },
                                    { label: 'center', value: 'center' },
                                    { label: 'right', value: 'right' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'verticalAlign',
                            type: 'select',
                            templateOptions: {
                                label: 'Vertical Align',
                                options: [
                                    { label: 'top', value: 'top' },
                                    { label: 'middle', value: 'middle' },
                                    { label: 'bottom', value: 'bottom' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'backgroundColor',
                            type: 'input',
                            templateOptions: {
                                label: 'Background Color',
                                placeholder: '#fff',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderColor',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Color',
                                placeholder: '#fff',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderWidth',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Width',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderType',
                            type: 'select',
                            templateOptions: {
                                label: 'Border Type',
                                options: [
                                    { label: 'Solid', value: 'solid' },
                                    { label: 'Dashed', value: 'dashed' },
                                    { label: 'Dotted', value: 'dotted' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderRadius',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Radius',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'padding',
                            type: 'input',
                            templateOptions: {
                                label: 'Padding',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'overFlow',
                            type: 'select',
                            templateOptions: {
                                label: 'OverFlow',
                                options: [
                                    { label: 'Truncate', value: 'truncate' },
                                    { label: 'Break', value: 'break' },
                                    { label: 'BreakAll', value: 'breakAll' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'position',
                            type: 'select',
                            templateOptions: {
                                label: 'Label Position',
                                placeholder: '',
                                options: [
                                    { label: 'top', value: 'top' },
                                    { label: 'left', value: 'left' },
                                    { label: 'right', value: 'right' },
                                    { label: 'bottom', value: 'bottom' },
                                    { label: 'inside', value: 'inside' },
                                    { label: 'insideLeft', value: 'insideLeft' },
                                    { label: 'insideRight', value: 'insideRight' },
                                    { label: 'insideTop', value: 'insideTop' },
                                    { label: 'insideBottom', value: 'insideBottom' },
                                    { label: 'insideTopLeft', value: 'insideTopLeft' },
                                    { label: 'insideBottomLeft', value: 'insideBottomLeft' },
                                    { label: 'insideTopRight', value: 'insideTopRight' },
                                    { label: 'insideBottomRight', value: 'insideBottomRight' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                    ],
                },
                {
                    key: 'labelLine',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Label Line',
                    },
                    fieldGroup: [
                        {
                            key: 'show',
                            type: 'radio',
                            templateOptions: {
                                label: 'Show Label',
                                options: [
                                    { label: 'True', value: true },
                                    { label: 'False', value: false },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'lineStyle',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Line Style',
                            },
                            fieldGroup: [
                                {
                                    key: 'color',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'width',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Width',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'type',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Type',
                                        options: [
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'cap',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Cap',
                                        options: [
                                            { label: 'butt', value: 'butt' },
                                            { label: 'round', value: 'round' },
                                            { label: 'square', value: 'square' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'join',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Join',
                                        options: [
                                            { label: 'bevel', value: 'bevel' },
                                            { label: 'round', value: 'round' },
                                            { label: 'miter', value: 'miter' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    key: 'itemStyle',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Item Style',
                    },
                    fieldGroup: [
                        {
                            key: 'color',
                            type: 'input',
                            templateOptions: {
                                label: 'Color',
                                placeHhlder: '#fff',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderColor',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Color',
                                placeholder: '#fff',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderWidth',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Width',
                                placeHolder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderType',
                            type: 'select',
                            templateOptions: {
                                label: 'Border Type',
                                options: [
                                    { label: 'Solid', value: 'solid' },
                                    { label: 'Dashed', value: 'dashed' },
                                    { label: 'Dotted', value: 'dotted' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'borderRadius',
                            type: 'input',
                            templateOptions: {
                                label: 'Border Radius',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'opacity',
                            type: 'input',
                            templateOptions: {
                                label: 'Opacity',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                    ],
                },
                {
                    key: 'labelLayout',
                    type: 'accordion',
                    templateOptions: {
                        label: 'labelLayout',
                    },
                    fieldGroup: [],
                },
                {
                    key: 'emphasis',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Emphasis',
                    },
                    fieldGroup: [
                        {
                            key: 'disabled',
                            type: 'radio',
                            templateOptions: {
                                label: 'Disabled',
                                options: [
                                    { label: 'True', value: true },
                                    { label: 'False', value: false },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'focus',
                            type: 'select',
                            templateOptions: {
                                label: 'Focus',
                                options: [
                                    { label: 'none', value: 'none' },
                                    { label: 'self', value: 'self' },
                                    { label: 'series', value: 'series' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'blurScope',
                            type: 'select',
                            templateOptions: {
                                label: 'Blur Scope',
                                options: [
                                    { label: 'coordinateSystem', value: 'coordinateSystem' },
                                    { label: 'series', value: 'series' },
                                    { label: 'global', value: 'global' },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'label',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Label',
                            },
                            fieldGroup: [
                                {
                                    key: 'show',
                                    type: 'radio',
                                    templateOptions: {
                                        label: 'Show Label',
                                        options: [
                                            { label: 'True', value: true },
                                            { label: 'False', value: false },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'formatter',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'formatter',
                                        placeholder: '{ }',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'color',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontStyle',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Font Style',
                                        options: [
                                            { label: 'normal', value: 'normal' },
                                            { label: 'italic', value: 'italic' },
                                            { label: 'oblique', value: 'oblique' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontWeight',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Font Weight',
                                        options: [
                                            { label: 'normal', value: 'normal' },
                                            { label: 'bold', value: 'bold' },
                                            { label: 'lighter', value: 'lighter' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontSize',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Font Size',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'align',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Align',
                                        options: [
                                            { label: 'left', value: 'left' },
                                            { label: 'center', value: 'center' },
                                            { label: 'right', value: 'right' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'verticalAlign',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Vertical Align',
                                        options: [
                                            { label: 'top', value: 'top' },
                                            { label: 'middle', value: 'middle' },
                                            { label: 'bottom', value: 'bottom' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'backgroundColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Background Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderWidth',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Width',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderType',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Border Type',
                                        options: [
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderRadius',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Radius',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'padding',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Padding',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'overFlow',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'OverFlow',
                                        options: [
                                            { label: 'Truncate', value: 'truncate' },
                                            { label: 'Break', value: 'break' },
                                            { label: 'BreakAll', value: 'breakAll' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'position',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Label Position',
                                        placeholder: '',
                                        options: [
                                            { label: 'top', value: 'top' },
                                            { label: 'left', value: 'left' },
                                            { label: 'right', value: 'right' },
                                            { label: 'bottom', value: 'bottom' },
                                            { label: 'inside', value: 'inside' },
                                            { label: 'insideLeft', value: 'insideLeft' },
                                            { label: 'insideRight', value: 'insideRight' },
                                            { label: 'insideTop', value: 'insideTop' },
                                            { label: 'insideBottom', value: 'insideBottom' },
                                            { label: 'insideTopLeft', value: 'insideTopLeft' },
                                            { label: 'insideBottomLeft', value: 'insideBottomLeft' },
                                            { label: 'insideTopRight', value: 'insideTopRight' },
                                            {
                                                label: 'insideBottomRight',
                                                value: 'insideBottomRight',
                                            },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            key: 'labelLine',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Label Line',
                            },
                            fieldGroup: [
                                {
                                    key: 'show',
                                    type: 'radio',
                                    templateOptions: {
                                        label: 'Show Label',
                                        options: [
                                            { label: 'True', value: true },
                                            { label: 'False', value: false },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'lineStyle',
                                    type: 'accordion',
                                    templateOptions: {
                                        label: 'Line Style',
                                    },
                                    fieldGroup: [
                                        {
                                            key: 'color',
                                            type: 'input',
                                            templateOptions: {
                                                label: 'Color',
                                                placeholder: '#fff',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'width',
                                            type: 'input',
                                            templateOptions: {
                                                label: 'Width',
                                                placeholder: '',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'type',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Type',
                                                options: [
                                                    { label: 'Solid', value: 'solid' },
                                                    { label: 'Dashed', value: 'dashed' },
                                                    { label: 'Dotted', value: 'dotted' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'cap',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Cap',
                                                options: [
                                                    { label: 'butt', value: 'butt' },
                                                    { label: 'round', value: 'round' },
                                                    { label: 'square', value: 'square' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'join',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Join',
                                                options: [
                                                    { label: 'bevel', value: 'bevel' },
                                                    { label: 'round', value: 'round' },
                                                    { label: 'miter', value: 'miter' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            key: 'itemStyle',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Item Style',
                            },
                            fieldGroup: [
                                {
                                    key: 'color',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Color',
                                        placeHhlder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderWidth',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Width',
                                        placeHolder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderType',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Border Type',
                                        options: [
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderRadius',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Radius',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'opacity',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Opacity',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    key: 'blur',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Blur',
                    },
                    fieldGroup: [
                        {
                            key: 'label',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Label',
                            },
                            fieldGroup: [
                                {
                                    key: 'show',
                                    type: 'radio',
                                    templateOptions: {
                                        label: 'Show Label',
                                        options: [
                                            { label: 'True', value: true },
                                            { label: 'False', value: false },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'formatter',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'formatter',
                                        placeholder: '{ }',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'color',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontStyle',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Font Style',
                                        options: [
                                            { label: 'normal', value: 'normal' },
                                            { label: 'italic', value: 'italic' },
                                            { label: 'oblique', value: 'oblique' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontWeight',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Font Weight',
                                        options: [
                                            { label: 'normal', value: 'normal' },
                                            { label: 'bold', value: 'bold' },
                                            { label: 'lighter', value: 'lighter' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontSize',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Font Size',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'align',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Align',
                                        options: [
                                            { label: 'left', value: 'left' },
                                            { label: 'center', value: 'center' },
                                            { label: 'right', value: 'right' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'verticalAlign',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Vertical Align',
                                        options: [
                                            { label: 'top', value: 'top' },
                                            { label: 'middle', value: 'middle' },
                                            { label: 'bottom', value: 'bottom' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'backgroundColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Background Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderWidth',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Width',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderType',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Border Type',
                                        options: [
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderRadius',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Radius',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'padding',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Padding',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'overFlow',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'OverFlow',
                                        options: [
                                            { label: 'Truncate', value: 'truncate' },
                                            { label: 'Break', value: 'break' },
                                            { label: 'BreakAll', value: 'breakAll' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'position',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Label Position',
                                        placeholder: '',
                                        options: [
                                            { label: 'top', value: 'top' },
                                            { label: 'left', value: 'left' },
                                            { label: 'right', value: 'right' },
                                            { label: 'bottom', value: 'bottom' },
                                            { label: 'inside', value: 'inside' },
                                            { label: 'insideLeft', value: 'insideLeft' },
                                            { label: 'insideRight', value: 'insideRight' },
                                            { label: 'insideTop', value: 'insideTop' },
                                            { label: 'insideBottom', value: 'insideBottom' },
                                            { label: 'insideTopLeft', value: 'insideTopLeft' },
                                            { label: 'insideBottomLeft', value: 'insideBottomLeft' },
                                            { label: 'insideTopRight', value: 'insideTopRight' },
                                            {
                                                label: 'insideBottomRight',
                                                value: 'insideBottomRight',
                                            },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            key: 'labelLine',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Label Line',
                            },
                            fieldGroup: [
                                {
                                    key: 'show',
                                    type: 'radio',
                                    templateOptions: {
                                        label: 'Show Label',
                                        options: [
                                            { label: 'True', value: true },
                                            { label: 'False', value: false },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'lineStyle',
                                    type: 'accordion',
                                    templateOptions: {
                                        label: 'Line Style',
                                    },
                                    fieldGroup: [
                                        {
                                            key: 'color',
                                            type: 'input',
                                            templateOptions: {
                                                label: 'Color',
                                                placeholder: '#fff',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'width',
                                            type: 'input',
                                            templateOptions: {
                                                label: 'Width',
                                                placeholder: '',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'type',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Type',
                                                options: [
                                                    { label: 'Solid', value: 'solid' },
                                                    { label: 'Dashed', value: 'dashed' },
                                                    { label: 'Dotted', value: 'dotted' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'cap',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Cap',
                                                options: [
                                                    { label: 'butt', value: 'butt' },
                                                    { label: 'round', value: 'round' },
                                                    { label: 'square', value: 'square' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'join',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Join',
                                                options: [
                                                    { label: 'bevel', value: 'bevel' },
                                                    { label: 'round', value: 'round' },
                                                    { label: 'miter', value: 'miter' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            key: 'itemStyle',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Item Style',
                            },
                            fieldGroup: [
                                {
                                    key: 'color',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Color',
                                        placeHhlder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderWidth',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Width',
                                        placeHolder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderType',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Border Type',
                                        options: [
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderRadius',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Radius',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'opacity',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Opacity',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    key: 'select',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Select',
                    },
                    fieldGroup: [
                        {
                            key: 'disabled',
                            type: 'radio',
                            templateOptions: {
                                label: 'Disabled',
                                options: [
                                    { label: 'True', value: true },
                                    { label: 'False', value: false },
                                ],
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'label',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Label',
                            },
                            fieldGroup: [
                                {
                                    key: 'show',
                                    type: 'radio',
                                    templateOptions: {
                                        label: 'Show Label',
                                        options: [
                                            { label: 'True', value: true },
                                            { label: 'False', value: false },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'formatter',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'formatter',
                                        placeholder: '{ }',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'color',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontStyle',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Font Style',
                                        options: [
                                            { label: 'normal', value: 'normal' },
                                            { label: 'italic', value: 'italic' },
                                            { label: 'oblique', value: 'oblique' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontWeight',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Font Weight',
                                        options: [
                                            { label: 'normal', value: 'normal' },
                                            { label: 'bold', value: 'bold' },
                                            { label: 'lighter', value: 'lighter' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'fontSize',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Font Size',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'align',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Align',
                                        options: [
                                            { label: 'left', value: 'left' },
                                            { label: 'center', value: 'center' },
                                            { label: 'right', value: 'right' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'verticalAlign',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Vertical Align',
                                        options: [
                                            { label: 'top', value: 'top' },
                                            { label: 'middle', value: 'middle' },
                                            { label: 'bottom', value: 'bottom' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'backgroundColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Background Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderWidth',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Width',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderType',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Border Type',
                                        options: [
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderRadius',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Radius',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'padding',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Padding',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'overFlow',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'OverFlow',
                                        options: [
                                            { label: 'Truncate', value: 'truncate' },
                                            { label: 'Break', value: 'break' },
                                            { label: 'BreakAll', value: 'breakAll' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'position',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Label Position',
                                        placeholder: '',
                                        options: [
                                            { label: 'top', value: 'top' },
                                            { label: 'left', value: 'left' },
                                            { label: 'right', value: 'right' },
                                            { label: 'bottom', value: 'bottom' },
                                            { label: 'inside', value: 'inside' },
                                            { label: 'insideLeft', value: 'insideLeft' },
                                            { label: 'insideRight', value: 'insideRight' },
                                            { label: 'insideTop', value: 'insideTop' },
                                            { label: 'insideBottom', value: 'insideBottom' },
                                            { label: 'insideTopLeft', value: 'insideTopLeft' },
                                            { label: 'insideBottomLeft', value: 'insideBottomLeft' },
                                            { label: 'insideTopRight', value: 'insideTopRight' },
                                            {
                                                label: 'insideBottomRight',
                                                value: 'insideBottomRight',
                                            },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            key: 'labelLine',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Label Line',
                            },
                            fieldGroup: [
                                {
                                    key: 'show',
                                    type: 'radio',
                                    templateOptions: {
                                        label: 'Show Label',
                                        options: [
                                            { label: 'True', value: true },
                                            { label: 'False', value: false },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'lineStyle',
                                    type: 'accordion',
                                    templateOptions: {
                                        label: 'Line Style',
                                    },
                                    fieldGroup: [
                                        {
                                            key: 'color',
                                            type: 'input',
                                            templateOptions: {
                                                label: 'Color',
                                                placeholder: '#fff',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'width',
                                            type: 'input',
                                            templateOptions: {
                                                label: 'Width',
                                                placeholder: '',
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'type',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Type',
                                                options: [
                                                    { label: 'Solid', value: 'solid' },
                                                    { label: 'Dashed', value: 'dashed' },
                                                    { label: 'Dotted', value: 'dotted' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'cap',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Cap',
                                                options: [
                                                    { label: 'butt', value: 'butt' },
                                                    { label: 'round', value: 'round' },
                                                    { label: 'square', value: 'square' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                        {
                                            key: 'join',
                                            type: 'select',
                                            templateOptions: {
                                                label: 'Join',
                                                options: [
                                                    { label: 'bevel', value: 'bevel' },
                                                    { label: 'round', value: 'round' },
                                                    { label: 'miter', value: 'miter' },
                                                ],
                                                attributes: {
                                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                                },
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            key: 'itemStyle',
                            type: 'accordion',
                            templateOptions: {
                                label: 'Item Style',
                            },
                            fieldGroup: [
                                {
                                    key: 'color',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Color',
                                        placeHhlder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderColor',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Color',
                                        placeholder: '#fff',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderWidth',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Width',
                                        placeHolder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderType',
                                    type: 'select',
                                    templateOptions: {
                                        label: 'Border Type',
                                        options: [
                                            { label: 'Solid', value: 'solid' },
                                            { label: 'Dashed', value: 'dashed' },
                                            { label: 'Dotted', value: 'dotted' },
                                        ],
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'borderRadius',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Border Radius',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                                {
                                    key: 'opacity',
                                    type: 'input',
                                    templateOptions: {
                                        label: 'Opacity',
                                        placeholder: '',
                                        attributes: {
                                            style: 'display:grid; width: 100%; margin-bottom:1rem',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    key: 'encode',
                    type: 'accordion',
                    templateOptions: {
                        label: 'Encode',
                    },
                    fieldGroup: [
                        {
                            key: 'x',
                            type: 'series-encode',
                            templateOptions: {
                                label: 'Encode X',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                        {
                            key: 'y',
                            type: 'series-encode',
                            templateOptions: {
                                label: 'Encode Y',
                                placeholder: '',
                                attributes: {
                                    style: 'display:grid; width: 100%; margin-bottom:1rem',
                                },
                            },
                        },
                    ],
                },
            ],
        },
    },
];

/*
 * Public API Surface of dashboards
 */
// Components

/**
 * Generated bundle index. Do not edit.
 */

export { DashboardContainerComponent, EchartComponent, FilterComponent, MarkdownCellComponent, TableComponent, TileComponent, WidgetBuilder, WidgetConfigComponent, WidgetHeaderComponent, dataOptions, formOptions };
//# sourceMappingURL=dashboards.mjs.map

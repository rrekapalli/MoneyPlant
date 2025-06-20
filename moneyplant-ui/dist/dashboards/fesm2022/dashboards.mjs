import * as i0 from '@angular/core';
import { Injectable, EventEmitter, Component, Output, Input, ChangeDetectionStrategy } from '@angular/core';
import { GridType, GridsterComponent, GridsterItemComponent } from 'angular-gridster2';
import * as i6 from '@angular/common';
import { NgComponentOutlet, CommonModule } from '@angular/common';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, fromEvent } from 'rxjs';
import { filter, map, takeUntil, debounceTime } from 'rxjs/operators';
import * as i3 from 'primeng/panel';
import { PanelModule } from 'primeng/panel';
import * as i1$1 from 'primeng/sidebar';
import { SidebarModule } from 'primeng/sidebar';
import { TabMenuModule } from 'primeng/tabmenu';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import * as i1 from 'primeng/button';
import { ButtonModule, Button } from 'primeng/button';
import * as i2 from 'primeng/toast';
import { ToastModule, Toast } from 'primeng/toast';
import * as i2$1 from 'primeng/api';
import { MessageService } from 'primeng/api';
import { NgxPrintModule } from 'ngx-print';
import buildQuery from 'odata-query';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts';

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

/**
 * Service for managing widget plugins in the dashboard framework
 *
 * This service provides methods for registering, retrieving, and managing
 * widget plugins, making it easier to add new widget types.
 */
class WidgetPluginService {
    constructor() {
        this.plugins = new Map();
        this.componentPromises = new Map();
        this.loadedComponents = new Map();
        this.registerDefaultPlugins();
    }
    /**
     * Registers a new widget plugin
     *
     * @param plugin - The widget plugin to register
     */
    registerPlugin(plugin) {
        if (this.plugins.has(plugin.type)) {
            console.warn(`Plugin with type ${plugin.type} already exists. Overwriting.`);
        }
        this.plugins.set(plugin.type, plugin);
    }
    /**
     * Gets a widget plugin by type
     *
     * @param type - The type of the widget plugin to retrieve
     * @returns The widget plugin if found, undefined otherwise
     */
    getPlugin(type) {
        return this.plugins.get(type);
    }
    /**
     * Gets all registered widget plugins
     *
     * @returns Array of all registered widget plugins
     */
    getAllPlugins() {
        return Array.from(this.plugins.values());
    }
    /**
     * Gets the component for a widget type
     *
     * @param type - The type of the widget
     * @returns The component for the widget type, or a promise that resolves to the component
     */
    getComponentForType(type) {
        // If the component is already loaded, return it
        if (this.loadedComponents.has(type)) {
            return this.loadedComponents.get(type);
        }
        // If the component is being loaded, return a placeholder component
        // The actual component will be loaded asynchronously
        if (!this.componentPromises.has(type)) {
            this.loadComponentForType(type);
        }
        // Return a placeholder component that will be replaced when the real component loads
        return this.getPlaceholderComponent();
    }
    /**
     * Loads a component for a widget type
     *
     * @param type - The type of the widget
     * @returns A promise that resolves to the component
     */
    async loadComponentForType(type) {
        if (!this.componentPromises.has(type)) {
            const promise = this.importComponentForType(type);
            this.componentPromises.set(type, promise);
            try {
                const component = await promise;
                this.loadedComponents.set(type, component);
                return component;
            }
            catch (error) {
                console.error(`Error loading component for type ${type}:`, error);
                this.componentPromises.delete(type);
                throw error;
            }
        }
        return this.componentPromises.get(type);
    }
    /**
     * Imports a component for a widget type
     *
     * @param type - The type of the widget
     * @returns A promise that resolves to the component
     */
    async importComponentForType(type) {
        switch (type) {
            case 'echart':
                const echartModule = await Promise.resolve().then(function () { return echart_component; });
                return echartModule.EchartComponent;
            case 'filter':
                const filterModule = await Promise.resolve().then(function () { return filter_component; });
                return filterModule.FilterComponent;
            case 'table':
                const tableModule = await Promise.resolve().then(function () { return table_component; });
                return tableModule.TableComponent;
            case 'tile':
                const tileModule = await Promise.resolve().then(function () { return tile_component; });
                return tileModule.TileComponent;
            case 'markdownCell':
                const markdownModule = await Promise.resolve().then(function () { return markdownCell_component; });
                return markdownModule.MarkdownCellComponent;
            case 'codeCell':
                const codeModule = await Promise.resolve().then(function () { return codeCell_component; });
                return codeModule.CodeCellComponent;
            default:
                // Default to EChart component
                const defaultModule = await Promise.resolve().then(function () { return echart_component; });
                return defaultModule.EchartComponent;
        }
    }
    /**
     * Gets a placeholder component to use while the real component is loading
     *
     * @returns A placeholder component
     */
    getPlaceholderComponent() {
        // This could be a simple loading component
        // For now, we'll just return a dummy object that won't cause errors
        return {
            __isPlaceholder: true,
            __componentType: 'placeholder'
        };
    }
    /**
     * Registers the default widget plugins
     */
    registerDefaultPlugins() {
        // Register EChart plugin
        this.registerPlugin({
            type: 'echart',
            displayName: 'Chart',
            description: 'Displays data using ECharts visualizations',
            icon: 'chart-bar',
            component: this.getPlaceholderComponent(), // Will be lazy loaded
            defaultConfig: {
                options: {}
            },
            supportsFiltering: true,
            canBeFilterSource: true
        });
        // Register Filter plugin
        this.registerPlugin({
            type: 'filter',
            displayName: 'Filter',
            description: 'Provides filtering capabilities for the dashboard',
            icon: 'filter',
            component: this.getPlaceholderComponent(), // Will be lazy loaded
            defaultConfig: {
                options: {
                    values: []
                }
            },
            supportsFiltering: false,
            canBeFilterSource: false
        });
        // Register Table plugin
        this.registerPlugin({
            type: 'table',
            displayName: 'Table',
            description: 'Displays data in a tabular format',
            icon: 'table',
            component: this.getPlaceholderComponent(), // Will be lazy loaded
            defaultConfig: {
                options: {}
            },
            supportsFiltering: true,
            canBeFilterSource: true
        });
        // Register Tile plugin
        this.registerPlugin({
            type: 'tile',
            displayName: 'Tile',
            description: 'Displays simple metric tiles',
            icon: 'square',
            component: this.getPlaceholderComponent(), // Will be lazy loaded
            defaultConfig: {
                options: {}
            },
            supportsFiltering: false,
            canBeFilterSource: false
        });
        // Register Markdown Cell plugin
        this.registerPlugin({
            type: 'markdownCell',
            displayName: 'Markdown',
            description: 'Displays markdown content',
            icon: 'markdown',
            component: this.getPlaceholderComponent(), // Will be lazy loaded
            defaultConfig: {
                options: {
                    content: ''
                }
            },
            supportsFiltering: false,
            canBeFilterSource: false
        });
        // Register Code Cell plugin
        this.registerPlugin({
            type: 'codeCell',
            displayName: 'Code',
            description: 'Displays code snippets',
            icon: 'code',
            component: this.getPlaceholderComponent(), // Will be lazy loaded
            defaultConfig: {
                options: {
                    code: '',
                    language: 'javascript'
                }
            },
            supportsFiltering: false,
            canBeFilterSource: false
        });
        // Preload commonly used components
        this.loadComponentForType('echart');
        this.loadComponentForType('filter');
    }
    static { this.ɵfac = function WidgetPluginService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetPluginService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: WidgetPluginService, factory: WidgetPluginService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetPluginService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], () => [], null); })();

/**
 * Event types supported by the event bus
 */
var EventType;
(function (EventType) {
    EventType["DATA_LOAD"] = "DATA_LOAD";
    EventType["FILTER_UPDATE"] = "FILTER_UPDATE";
    EventType["WIDGET_UPDATE"] = "WIDGET_UPDATE";
    EventType["DASHBOARD_CHANGE"] = "DASHBOARD_CHANGE";
    EventType["WIDGET_RESIZE"] = "WIDGET_RESIZE";
    EventType["WIDGET_MOVE"] = "WIDGET_MOVE";
    EventType["ERROR"] = "ERROR";
})(EventType || (EventType = {}));
/**
 * Service for handling events in the dashboard framework
 *
 * This service provides a decoupled approach for communication between components
 * using a publish-subscribe pattern.
 */
class EventBusService {
    constructor() {
        this.eventSubject = new Subject();
    }
    /**
     * Publishes an event to the event bus
     *
     * @param type - The type of event
     * @param payload - The event payload
     * @param source - Optional source identifier
     */
    publish(type, payload, source) {
        this.eventSubject.next({
            type,
            payload,
            source,
            timestamp: Date.now()
        });
    }
    /**
     * Subscribes to events of a specific type
     *
     * @param type - The type of events to subscribe to
     * @returns An observable of events of the specified type
     */
    on(type) {
        return this.eventSubject.asObservable().pipe(filter(event => event.type === type));
    }
    /**
     * Subscribes to all events
     *
     * @returns An observable of all events
     */
    onAll() {
        return this.eventSubject.asObservable();
    }
    /**
     * Publishes a data load event
     *
     * @param widget - The widget that needs data
     * @param source - Optional source identifier
     */
    publishDataLoad(widget, source) {
        this.publish(EventType.DATA_LOAD, widget, source);
    }
    /**
     * Subscribes to data load events
     *
     * @returns An observable of data load events
     */
    onDataLoad() {
        return this.on(EventType.DATA_LOAD).pipe(map(event => event.payload));
    }
    /**
     * Publishes a filter update event
     *
     * @param filterData - The updated filter data
     * @param source - Optional source identifier
     */
    publishFilterUpdate(filterData, source) {
        this.publish(EventType.FILTER_UPDATE, filterData, source);
    }
    /**
     * Subscribes to filter update events
     *
     * @returns An observable of filter update events
     */
    onFilterUpdate() {
        return this.on(EventType.FILTER_UPDATE).pipe(map(event => event.payload));
    }
    /**
     * Publishes a widget update event
     *
     * @param widget - The updated widget
     * @param source - Optional source identifier
     */
    publishWidgetUpdate(widget, source) {
        this.publish(EventType.WIDGET_UPDATE, widget, source);
    }
    /**
     * Subscribes to widget update events
     *
     * @returns An observable of widget update events
     */
    onWidgetUpdate() {
        return this.on(EventType.WIDGET_UPDATE).pipe(map(event => event.payload));
    }
    /**
     * Publishes an error event
     *
     * @param error - The error that occurred
     * @param source - Optional source identifier
     */
    publishError(error, source) {
        this.publish(EventType.ERROR, error, source);
    }
    /**
     * Subscribes to error events
     *
     * @returns An observable of error events
     */
    onError() {
        return this.on(EventType.ERROR).pipe(map(event => event.payload));
    }
    static { this.ɵfac = function EventBusService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || EventBusService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: EventBusService, factory: EventBusService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EventBusService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();

const _c0$1 = () => ({ height: "20vh" });
function WidgetComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 3)(1, "div", 4)(2, "div", 5);
    i0.ɵɵtext(3, "\u26A0\uFE0F");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 6)(5, "h3");
    i0.ɵɵtext(6, "Error loading widget");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "p");
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "button", 7);
    i0.ɵɵlistener("click", function WidgetComponent_Conditional_0_Template_button_click_9_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.retryLoad()); });
    i0.ɵɵtext(10, "Retry");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleMap(i0.ɵɵpureFunction0(3, _c0$1));
    i0.ɵɵadvance(8);
    i0.ɵɵtextInterpolate((ctx_r1.widget.error == null ? null : ctx_r1.widget.error.message) || "An unknown error occurred");
} }
function WidgetComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8)(1, "div", 9);
    i0.ɵɵelement(2, "div", 10);
    i0.ɵɵelementStart(3, "div", 11);
    i0.ɵɵtext(4, "Loading...");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵstyleMap(i0.ɵɵpureFunction0(2, _c0$1));
} }
function WidgetComponent_Conditional_2_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function WidgetComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, WidgetComponent_Conditional_2_ng_container_1_Template, 1, 0, "ng-container", 12);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleMap(i0.ɵɵpureFunction0(4, _c0$1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngComponentOutlet", ctx_r1.currentWidget.component)("ngComponentOutletInputs", ctx_r1.currentWidget.inputs);
} }
function WidgetComponent_Conditional_3_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function WidgetComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div");
    i0.ɵɵtemplate(1, WidgetComponent_Conditional_3_ng_container_1_Template, 1, 0, "ng-container", 12);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵstyleMap(i0.ɵɵpureFunction0(4, _c0$1));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngComponentOutlet", ctx_r1.currentWidget.component)("ngComponentOutletInputs", ctx_r1.currentWidget.inputs);
} }
/**
 * A dynamic widget component that renders different widget types based on configuration
 */
class WidgetComponent {
    constructor(widgetPluginService, eventBus) {
        this.widgetPluginService = widgetPluginService;
        this.eventBus = eventBus;
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
            component: this.widgetPluginService.getComponentForType(this.widget?.config?.component || ''),
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
        return this.widget?.config?.component === 'echart';
    }
    /**
     * Retries loading the widget data after an error
     */
    retryLoad() {
        if (!this.widget) {
            return;
        }
        // Clear the error state
        this.widget.error = null;
        // Set loading state
        this.widget.loading = true;
        // Emit the data load event
        this.onDataLoad.emit(this.widget);
        // Also publish through the event bus
        this.eventBus.publishDataLoad(this.widget, this.widget.id);
    }
    static { this.ɵfac = function WidgetComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetComponent)(i0.ɵɵdirectiveInject(WidgetPluginService), i0.ɵɵdirectiveInject(EventBusService)); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: WidgetComponent, selectors: [["vis-widget"]], inputs: { widget: "widget" }, outputs: { onDataLoad: "onDataLoad", onUpdateFilter: "onUpdateFilter" }, decls: 4, vars: 1, consts: [[1, "widget-error", 3, "style"], [1, "widget-loading", 3, "style"], [3, "style"], [1, "widget-error"], [1, "error-container"], [1, "error-icon"], [1, "error-message"], [1, "retry-button", 3, "click"], [1, "widget-loading"], [1, "loading-container"], [1, "loading-spinner"], [1, "loading-text"], [4, "ngComponentOutlet", "ngComponentOutletInputs"]], template: function WidgetComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, WidgetComponent_Conditional_0_Template, 11, 4, "div", 0)(1, WidgetComponent_Conditional_1_Template, 5, 3, "div", 1)(2, WidgetComponent_Conditional_2_Template, 2, 5, "div", 2)(3, WidgetComponent_Conditional_3_Template, 2, 5, "div", 2);
        } if (rf & 2) {
            i0.ɵɵconditional((ctx.widget == null ? null : ctx.widget.error) ? 0 : (ctx.widget == null ? null : ctx.widget.loading) ? 1 : ctx.isEchartComponent ? 2 : 3);
        } }, dependencies: [NgComponentOutlet], styles: [".widget-error[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center;height:100%;background-color:#ff00000d;border:1px solid rgba(255,0,0,.2);border-radius:4px}.error-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center;padding:16px;text-align:center}.error-icon[_ngcontent-%COMP%]{font-size:24px;margin-bottom:8px}.error-message[_ngcontent-%COMP%]   h3[_ngcontent-%COMP%]{margin:0 0 8px;color:#d32f2f}.error-message[_ngcontent-%COMP%]   p[_ngcontent-%COMP%]{margin:0 0 16px;color:#666}.retry-button[_ngcontent-%COMP%]{padding:8px 16px;background-color:#f44336;color:#fff;border:none;border-radius:4px;cursor:pointer}.retry-button[_ngcontent-%COMP%]:hover{background-color:#d32f2f}.widget-loading[_ngcontent-%COMP%]{display:flex;justify-content:center;align-items:center;height:100%;background-color:#00000005}.loading-container[_ngcontent-%COMP%]{display:flex;flex-direction:column;align-items:center}.loading-spinner[_ngcontent-%COMP%]{width:32px;height:32px;border:3px solid rgba(0,0,0,.1);border-radius:50%;border-top-color:#3498db;animation:_ngcontent-%COMP%_spin 1s ease-in-out infinite;margin-bottom:8px}@keyframes _ngcontent-%COMP%_spin{to{transform:rotate(360deg)}}.loading-text[_ngcontent-%COMP%]{color:#666}"] }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetComponent, [{
        type: Component,
        args: [{ selector: 'vis-widget', standalone: true, imports: [NgComponentOutlet], template: "@if(widget?.error) {\r\n    <div [style]=\"{ height: '20vh' }\" class=\"widget-error\">\r\n        <div class=\"error-container\">\r\n            <div class=\"error-icon\">\u26A0\uFE0F</div>\r\n            <div class=\"error-message\">\r\n                <h3>Error loading widget</h3>\r\n                <p>{{ widget.error?.message || 'An unknown error occurred' }}</p>\r\n            </div>\r\n            <button (click)=\"retryLoad()\" class=\"retry-button\">Retry</button>\r\n        </div>\r\n    </div>\r\n} @else if(widget?.loading) {\r\n    <div [style]=\"{ height: '20vh' }\" class=\"widget-loading\">\r\n        <div class=\"loading-container\">\r\n            <div class=\"loading-spinner\"></div>\r\n            <div class=\"loading-text\">Loading...</div>\r\n        </div>\r\n    </div>\r\n} @else if(isEchartComponent) {\r\n    <div [style]=\"{ height: '20vh' }\">\r\n        <ng-container \r\n            *ngComponentOutlet=\"currentWidget.component; inputs: currentWidget.inputs\">\r\n        </ng-container>\r\n    </div>\r\n} @else {\r\n    <div [style]=\"{ height: '20vh' }\">\r\n        <ng-container \r\n            *ngComponentOutlet=\"currentWidget.component; inputs: currentWidget.inputs\">\r\n        </ng-container>\r\n    </div>\r\n}\r\n", styles: [".widget-error{display:flex;justify-content:center;align-items:center;height:100%;background-color:#ff00000d;border:1px solid rgba(255,0,0,.2);border-radius:4px}.error-container{display:flex;flex-direction:column;align-items:center;padding:16px;text-align:center}.error-icon{font-size:24px;margin-bottom:8px}.error-message h3{margin:0 0 8px;color:#d32f2f}.error-message p{margin:0 0 16px;color:#666}.retry-button{padding:8px 16px;background-color:#f44336;color:#fff;border:none;border-radius:4px;cursor:pointer}.retry-button:hover{background-color:#d32f2f}.widget-loading{display:flex;justify-content:center;align-items:center;height:100%;background-color:#00000005}.loading-container{display:flex;flex-direction:column;align-items:center}.loading-spinner{width:32px;height:32px;border:3px solid rgba(0,0,0,.1);border-radius:50%;border-top-color:#3498db;animation:spin 1s ease-in-out infinite;margin-bottom:8px}@keyframes spin{to{transform:rotate(360deg)}}.loading-text{color:#666}\n"] }]
    }], () => [{ type: WidgetPluginService }, { type: EventBusService }], { widget: [{
            type: Input
        }], onDataLoad: [{
            type: Output
        }], onUpdateFilter: [{
            type: Output
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(WidgetComponent, { className: "WidgetComponent", filePath: "lib/widgets/widget/widget.component.ts", lineNumber: 95 }); })();

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
            ButtonModule, i1.Button, ToastModule, i2.Toast], styles: [".form-buttons[_ngcontent-%COMP%]{display:flex;justify-content:end;margin-top:2rem;padding:1.2rem;align-items:end;position:absolute;bottom:0;right:0}  .p-sidebar .p-sidebar-header .p-sidebar-close, .p-sidebar[_ngcontent-%COMP%]   .p-sidebar-header[_ngcontent-%COMP%]   .p-sidebar-icon[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]{border-top-left-radius:5px;border-bottom-left-radius:5px;background:#fff;position:absolute;top:.625rem;padding:.4166666667rem!important;box-shadow:0 .125rem .25rem #00000014;z-index:20;left:-39px;height:3rem;width:3.25rem;color:red}  .form-alignment{margin-left:1rem;margin-right:1rem;width:86.2%}"] }); }
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
            SidebarModule, i1$1.Sidebar, i2$1.PrimeTemplate, PanelModule, i3.Panel, FormsModule,
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

/**
 * Service for handling complex calculations related to dashboard widgets
 *
 * This service extracts calculation logic from components to improve maintainability
 * and reusability across the application.
 */
class CalculationService {
    constructor() {
        /** Default chart height in pixels */
        this.defaultChartHeight = 300;
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
    static { this.ɵfac = function CalculationService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || CalculationService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: CalculationService, factory: CalculationService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(CalculationService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();

/**
 * Service for handling filter-related operations in dashboards
 *
 * This service extracts filter logic from components to improve maintainability
 * and reusability across the application.
 */
class FilterService {
    /**
     * Builds OData query parameters from the current filter values
     *
     * @param filterValues - The current filter values to convert to OData parameters
     * @returns A string containing the OData query parameters
     */
    getFilterParams(filterValues) {
        let params = '';
        if (filterValues.length !== 0) {
            const filtersParams = [];
            filterValues.map((item) => {
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
     * Finds the filter widget in the dashboard
     *
     * @param widgets - Array of all widgets in the dashboard
     * @returns The filter widget if found, undefined otherwise
     */
    findFilterWidget(widgets) {
        return widgets.find((item) => item.config.component === 'filter');
    }
    /**
     * Gets the current filter values from the filter widget
     *
     * @param widgets - Array of all widgets in the dashboard
     * @returns Array of filter values if filter widget exists, empty array otherwise
     */
    getFilterValues(widgets) {
        const filterWidget = this.findFilterWidget(widgets);
        return filterWidget?.config?.options?.values || [];
    }
    /**
     * Updates a filter widget with new filter values
     *
     * @param filterWidget - The filter widget to update
     * @param filterEvent - The filter event containing the new filter values
     * @returns The updated filter widget
     */
    updateFilterWidget(filterWidget, filterEvent) {
        const newFilterWidget = { ...filterWidget };
        if (Array.isArray(filterEvent)) {
            newFilterWidget.config.options.values = filterEvent;
        }
        else if ((newFilterWidget?.config?.options).values) {
            newFilterWidget.config.options.values.push({
                accessor: filterEvent.widget.config.state.accessor,
                ...filterEvent.value
            });
        }
        return newFilterWidget;
    }
    static { this.ɵfac = function FilterService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || FilterService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: FilterService, factory: FilterService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(FilterService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], null, null); })();

/**
 * Service for caching widget data to improve performance
 *
 * This service provides methods for caching and retrieving widget data,
 * reducing the need for repeated data fetching.
 */
class WidgetDataCacheService {
    constructor() {
        this.cache = new Map();
        // Cache expiration time in milliseconds (default: 5 minutes)
        this.cacheExpirationTime = 5 * 60 * 1000;
    }
    /**
     * Sets the cache expiration time
     *
     * @param timeInMs - The cache expiration time in milliseconds
     */
    setCacheExpirationTime(timeInMs) {
        this.cacheExpirationTime = timeInMs;
    }
    /**
     * Gets the cache key for a widget and optional filters
     *
     * @param widget - The widget to get the cache key for
     * @param filters - Optional filter values
     * @returns The cache key
     */
    getCacheKey(widget, filters) {
        const widgetId = widget.id || '';
        const filterString = this.getFilterString(filters);
        return `${widgetId}:${filterString}`;
    }
    /**
     * Converts filters to a string for use in cache keys
     *
     * @param filters - The filters to convert
     * @returns A string representation of the filters
     */
    getFilterString(filters) {
        if (!filters) {
            return '';
        }
        if (typeof filters === 'string') {
            return filters;
        }
        return JSON.stringify(filters);
    }
    /**
     * Gets data from the cache for a widget and filters
     *
     * @param widget - The widget to get data for
     * @param filters - Optional filter values
     * @returns The cached data if available and not expired, undefined otherwise
     */
    getData(widget, filters) {
        const key = this.getCacheKey(widget, filters);
        const cachedItem = this.cache.get(key);
        if (!cachedItem) {
            return undefined;
        }
        // Check if the cache has expired
        const now = Date.now();
        if (now - cachedItem.timestamp > this.cacheExpirationTime) {
            this.cache.delete(key);
            return undefined;
        }
        return cachedItem.data;
    }
    /**
     * Stores data in the cache for a widget and filters
     *
     * @param widget - The widget to store data for
     * @param data - The data to store
     * @param filters - Optional filter values
     */
    setData(widget, data, filters) {
        const key = this.getCacheKey(widget, filters);
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            filters: this.getFilterString(filters)
        });
    }
    /**
     * Clears the cache for a specific widget
     *
     * @param widget - The widget to clear the cache for
     */
    clearWidgetCache(widget) {
        const widgetId = widget.id || '';
        // Delete all cache entries for this widget
        for (const key of this.cache.keys()) {
            if (key.startsWith(`${widgetId}:`)) {
                this.cache.delete(key);
            }
        }
    }
    /**
     * Clears the entire cache
     */
    clearAllCache() {
        this.cache.clear();
    }
    /**
     * Determines if a widget's data should be reloaded based on filter changes
     *
     * @param widget - The widget to check
     * @param oldFilters - The old filter values
     * @param newFilters - The new filter values
     * @returns True if the widget should be reloaded, false otherwise
     */
    shouldReloadWidget(widget, oldFilters, newFilters) {
        // If the widget doesn't support filtering, it doesn't need to be reloaded
        if (widget.config?.state?.supportsFiltering === false) {
            return false;
        }
        // If the widget has dependencies on specific filters, check if those have changed
        const dependencies = widget.config?.state?.filterDependencies;
        if (dependencies && Array.isArray(dependencies) && dependencies.length > 0) {
            // Check if any of the dependent filters have changed
            return dependencies.some(dep => {
                const oldFilter = oldFilters.find(f => f['id'] === dep);
                const newFilter = newFilters.find(f => f['id'] === dep);
                if (!oldFilter && !newFilter) {
                    return false;
                }
                if (!oldFilter || !newFilter) {
                    return true;
                }
                return JSON.stringify(oldFilter['value']) !== JSON.stringify(newFilter['value']);
            });
        }
        // By default, reload if any filter has changed
        if (oldFilters.length !== newFilters.length) {
            return true;
        }
        return JSON.stringify(oldFilters) !== JSON.stringify(newFilters);
    }
    static { this.ɵfac = function WidgetDataCacheService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WidgetDataCacheService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: WidgetDataCacheService, factory: WidgetDataCacheService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WidgetDataCacheService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], () => [], null); })();

/**
 * Service for implementing virtual scrolling for large dashboards
 *
 * This service provides methods for determining which widgets should be
 * rendered based on their position and the current viewport.
 */
class VirtualScrollService {
    constructor() {
        // Default viewport height in rows
        this.viewportHeight = 20;
        // Buffer size in rows (widgets this many rows outside the viewport will still be rendered)
        this.bufferSize = 5;
    }
    /**
     * Sets the viewport height
     *
     * @param rows - The viewport height in rows
     */
    setViewportHeight(rows) {
        this.viewportHeight = rows;
    }
    /**
     * Sets the buffer size
     *
     * @param rows - The buffer size in rows
     */
    setBufferSize(rows) {
        this.bufferSize = rows;
    }
    /**
     * Determines which widgets should be rendered based on the current scroll position
     *
     * @param widgets - All widgets in the dashboard
     * @param scrollTop - The current scroll position in rows
     * @returns The widgets that should be rendered
     */
    getVisibleWidgets(widgets, scrollTop) {
        if (!widgets || widgets.length === 0) {
            return [];
        }
        // Calculate the visible range with buffer
        const visibleRangeStart = Math.max(0, scrollTop - this.bufferSize);
        const visibleRangeEnd = scrollTop + this.viewportHeight + this.bufferSize;
        // Filter widgets to only include those in the visible range
        return widgets.filter(widget => {
            if (!widget.position) {
                return true; // Include widgets without position info
            }
            const widgetTop = widget.position.y;
            const widgetBottom = widget.position.y + widget.position.rows;
            // Widget is visible if any part of it is in the visible range
            return ((widgetTop >= visibleRangeStart && widgetTop <= visibleRangeEnd) || // Top edge in range
                (widgetBottom >= visibleRangeStart && widgetBottom <= visibleRangeEnd) || // Bottom edge in range
                (widgetTop <= visibleRangeStart && widgetBottom >= visibleRangeEnd) // Widget spans the entire range
            );
        });
    }
    /**
     * Calculates the total height of the dashboard in rows
     *
     * @param widgets - All widgets in the dashboard
     * @returns The total height in rows
     */
    getTotalHeight(widgets) {
        if (!widgets || widgets.length === 0) {
            return 0;
        }
        // Find the widget with the highest bottom edge
        return widgets.reduce((maxBottom, widget) => {
            if (!widget.position) {
                return maxBottom;
            }
            const bottom = widget.position.y + widget.position.rows;
            return Math.max(maxBottom, bottom);
        }, 0);
    }
    /**
     * Creates placeholder widgets for the virtual scroll
     *
     * @param totalHeight - The total height of the dashboard in rows
     * @returns A placeholder widget that takes up the required space
     */
    createPlaceholders(totalHeight) {
        return {
            id: 'virtual-scroll-placeholder',
            position: {
                x: 0,
                y: 0,
                cols: 12,
                rows: totalHeight
            },
            config: {
                component: 'placeholder',
                header: {
                    title: 'Virtual Scroll Placeholder'
                },
                options: {}
            }
        };
    }
    static { this.ɵfac = function VirtualScrollService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || VirtualScrollService)(); }; }
    static { this.ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: VirtualScrollService, factory: VirtualScrollService.ɵfac, providedIn: 'root' }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(VirtualScrollService, [{
        type: Injectable,
        args: [{
                providedIn: 'root'
            }]
    }], () => [], null); })();

const _forTrack0 = ($index, $item) => $item.id;
function DashboardContainerComponent_For_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "vis-widget-header", 9);
    i0.ɵɵlistener("onUpdateWidget", function DashboardContainerComponent_For_4_Conditional_1_Template_vis_widget_header_onUpdateWidget_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onUpdateWidget($event)); })("onDeleteWidget", function DashboardContainerComponent_For_4_Conditional_1_Template_vis_widget_header_onDeleteWidget_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onDeleteWidget($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r4 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("dashboardId", ctx_r1.dashboardId)("widget", item_r4)("onEditMode", ctx_r1.isEditMode);
} }
function DashboardContainerComponent_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "gridster-item", 6);
    i0.ɵɵlistener("itemResize", function DashboardContainerComponent_For_4_Template_gridster_item_itemResize_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.updateString("[Edit Mode - Pending Changes]")); })("itemChange", function DashboardContainerComponent_For_4_Template_gridster_item_itemChange_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.updateString("[Edit Mode - Pending Changes]")); });
    i0.ɵɵconditionalCreate(1, DashboardContainerComponent_For_4_Conditional_1_Template, 1, 3, "vis-widget-header", 7);
    i0.ɵɵelementStart(2, "vis-widget", 8);
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
function DashboardContainerComponent_div_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" Showing ", ctx_r1.visibleWidgets.length, " of ", ctx_r1.widgets.length, " widgets\n");
} }
/**
 * A container component for dashboard widgets.
 *
 * This component provides a grid-based layout for dashboard widgets using angular-gridster2.
 * It handles widget positioning, resizing, data loading, and filtering.
 */
class DashboardContainerComponent {
    constructor(calculationService, filterService, eventBus, widgetDataCache, virtualScrollService) {
        this.calculationService = calculationService;
        this.filterService = filterService;
        this.eventBus = eventBus;
        this.widgetDataCache = widgetDataCache;
        this.virtualScrollService = virtualScrollService;
        /** Current filter values applied to the dashboard */
        this.filterValues = [];
        /** Current chart height in pixels */
        this.chartHeight = 300;
        // Virtual scrolling properties
        this.currentScrollPosition = 0;
        this.visibleWidgets = [];
        this.totalDashboardHeight = 0;
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
        // Subscribe to events from the event bus
        this.subscribeToEvents();
    }
    /**
     * Lifecycle hook that is called after the component is initialized
     */
    ngOnInit() {
        // Initialize virtual scrolling
        this.initVirtualScrolling();
    }
    /**
     * Initializes virtual scrolling for the dashboard
     */
    initVirtualScrolling() {
        // Set initial viewport height based on screen size
        const viewportHeight = Math.floor(window.innerHeight / 50); // Approximate row height
        this.virtualScrollService.setViewportHeight(viewportHeight);
        // Update visible widgets whenever widgets array changes
        this.updateVisibleWidgets();
    }
    /**
     * Updates the list of visible widgets based on the current scroll position
     */
    updateVisibleWidgets() {
        if (!this.widgets || this.widgets.length === 0) {
            this.visibleWidgets = [];
            this.totalDashboardHeight = 0;
            return;
        }
        // Calculate total dashboard height
        this.totalDashboardHeight = this.virtualScrollService.getTotalHeight(this.widgets);
        // Get visible widgets
        this.visibleWidgets = this.virtualScrollService.getVisibleWidgets(this.widgets, this.currentScrollPosition);
        console.log(`Rendering ${this.visibleWidgets.length} of ${this.widgets.length} widgets`);
    }
    /**
     * Handles scroll events in the dashboard
     *
     * @param event - The scroll event
     */
    onDashboardScroll(event) {
        // Calculate current scroll position in rows
        const scrollTop = event.target.scrollTop;
        const rowHeight = 50; // Approximate row height in pixels
        this.currentScrollPosition = Math.floor(scrollTop / rowHeight);
        // Update visible widgets
        this.updateVisibleWidgets();
    }
    /**
     * Subscribes to events from the event bus
     */
    subscribeToEvents() {
        // Subscribe to data load events
        this.eventBus.onDataLoad().subscribe(widget => {
            this.onDataLoad(widget);
        });
        // Subscribe to filter update events
        this.eventBus.onFilterUpdate().subscribe(filterData => {
            this.onUpdateFilter(filterData);
        });
        // Subscribe to widget update events
        this.eventBus.onWidgetUpdate().subscribe(widget => {
            this.onUpdateWidget(widget);
        });
        // Subscribe to error events
        this.eventBus.onError().subscribe(error => {
            console.error('Dashboard error:', error);
            // TODO: Add error handling UI
        });
    }
    /**
     * Loads data for a widget and applies any filters
     *
     * @param widget - The widget to load data for
     */
    async onDataLoad(widget) {
        if (!widget) {
            console.error('Cannot load data for undefined widget');
            this.eventBus.publishError(new Error('Cannot load data for undefined widget'), 'dashboard-container');
            return;
        }
        try {
            // Set widget to loading state if possible
            widget.loading = true;
            widget.error = null;
            // Get the filter widget and update filter values
            const filterWidget = this.filterService.findFilterWidget(this.widgets);
            this.filterValues = this.filterService.getFilterValues(this.widgets);
            // Determine which filter format to use
            const filter = widget.config?.state?.isOdataQuery === true
                ? this.getFilterParams()
                : this.filterValues;
            // Check if we have cached data for this widget and filter combination
            const cachedData = this.widgetDataCache.getData(widget, filter);
            if (cachedData) {
                console.log(`Using cached data for widget ${widget.id}`);
                // Apply cached data to the widget
                if (widget.chartInstance) {
                    widget.chartInstance.setOption(cachedData);
                }
                // Set widget to not loading state
                widget.loading = false;
                return;
            }
            // Process widget data if available
            if (widget.config?.options) {
                let widgetData = widget.config.options.series;
                if (widgetData) {
                    if (widgetData.series) {
                        widgetData.map((item) => {
                            if (!item || !item.encode)
                                return {};
                            return {
                                x: {
                                    table: {
                                        id: item.encode?.x?.split('.')?.[0] ?? '',
                                        name: item.encode?.x?.split('.')?.[1] ?? '',
                                    },
                                    column: {
                                        id: item.encode?.x?.split('.')?.[2] ?? '',
                                        name: item.encode?.x?.split('.')?.[3] ?? '',
                                    },
                                },
                                y: {
                                    table: {
                                        id: item.encode?.y?.split('.')?.[0] ?? '',
                                        name: item.encode?.y?.split('.')?.[1] ?? '',
                                    },
                                    column: {
                                        id: item.encode?.y?.split('.')?.[2] ?? '',
                                        name: item.encode?.y?.split('.')?.[3] ?? '',
                                    },
                                },
                            };
                        });
                    }
                    else {
                        widgetData.seriesData = {};
                    }
                }
            }
            // Show loading indicator
            if (widget.chartInstance) {
                widget.chartInstance.showLoading();
            }
            // Call onChartOptions event handler if available
            if (widget.config?.events?.onChartOptions) {
                widget.config.events.onChartOptions(widget, widget.chartInstance ?? undefined, filter);
                // Cache the widget data if available
                if (widget.chartInstance) {
                    const chartOptions = widget.chartInstance.getOption();
                    this.widgetDataCache.setData(widget, chartOptions, filter);
                }
            }
            // Publish widget update event
            this.eventBus.publishWidgetUpdate(widget, 'dashboard-container');
            // Set widget to not loading state
            widget.loading = false;
        }
        catch (error) {
            console.error(`Error loading data for widget ${widget.id}:`, error);
            // Set error state on widget
            widget.loading = false;
            widget.error = error;
            // Hide loading indicator if it was shown
            if (widget.chartInstance) {
                widget.chartInstance.hideLoading();
            }
            // Publish error event
            this.eventBus.publishError(error, 'dashboard-container');
        }
    }
    /**
     * Builds OData query parameters from the current filter values
     *
     * @returns A string containing the OData query parameters
     */
    getFilterParams() {
        return this.filterService.getFilterParams(this.filterValues);
    }
    /**
     * Updates a widget in the dashboard and reloads data for all widgets
     *
     * @param widget - The updated widget
     */
    onUpdateWidget(widget) {
        if (!widget) {
            console.error('Cannot update undefined widget');
            this.eventBus.publishError(new Error('Cannot update undefined widget'), 'dashboard-container');
            return;
        }
        try {
            // Update the widget in the widgets array
            const widgetsWithNewOptions = this.widgets.map((item) => item.id === widget.id ? { ...widget } : item);
            this.widgets = widgetsWithNewOptions;
            // Update visible widgets for virtual scrolling
            this.updateVisibleWidgets();
            // Reload data for all widgets
            this.widgets.forEach(widget => {
                if (widget) {
                    this.onDataLoad(widget);
                }
            });
        }
        catch (error) {
            console.error(`Error updating widget ${widget.id}:`, error);
            this.eventBus.publishError(error, 'dashboard-container');
        }
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
        try {
            // Find the filter widget
            const filterWidget = this.filterService.findFilterWidget(this.widgets);
            if (filterWidget) {
                // Store the old filter values for comparison
                const oldFilterValues = [...this.filterValues];
                // Update the filter widget with the new values
                const newFilterWidget = this.filterService.updateFilterWidget(filterWidget, $event);
                // Update the widget in the dashboard
                this.updateWidgetWithoutReload(newFilterWidget);
                // Get the new filter values
                this.filterValues = this.filterService.getFilterValues(this.widgets);
                // Only reload widgets that are affected by the filter change
                this.widgets.forEach(widget => {
                    if (widget.id !== filterWidget.id &&
                        this.widgetDataCache.shouldReloadWidget(widget, oldFilterValues, this.filterValues)) {
                        console.log(`Reloading widget ${widget.id} due to filter change`);
                        this.onDataLoad(widget);
                    }
                });
                // Publish filter update event
                this.eventBus.publishFilterUpdate($event, 'dashboard-container');
            }
        }
        catch (error) {
            console.error('Error updating filter:', error);
            this.eventBus.publishError(error, 'dashboard-container');
        }
    }
    /**
     * Updates a widget in the dashboard without reloading data
     *
     * @param widget - The updated widget
     */
    updateWidgetWithoutReload(widget) {
        if (!widget) {
            console.error('Cannot update undefined widget');
            this.eventBus.publishError(new Error('Cannot update undefined widget'), 'dashboard-container');
            return;
        }
        try {
            // Update the widget in the widgets array
            this.widgets = this.widgets.map((item) => item.id === widget.id ? { ...widget } : item);
            // Publish widget update event
            this.eventBus.publishWidgetUpdate(widget, 'dashboard-container');
        }
        catch (error) {
            console.error(`Error updating widget ${widget.id}:`, error);
            this.eventBus.publishError(error, 'dashboard-container');
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
        if (!widget) {
            console.error('Cannot delete undefined widget');
            this.eventBus.publishError(new Error('Cannot delete undefined widget'), 'dashboard-container');
            return;
        }
        try {
            const index = this.widgets.indexOf(widget);
            if (index !== -1) {
                this.widgets.splice(index, 1);
                // Update visible widgets for virtual scrolling
                this.updateVisibleWidgets();
                // Clear the widget from cache
                this.widgetDataCache.clearWidgetCache(widget);
            }
            else {
                console.warn(`Widget with id ${widget.id} not found in dashboard`);
            }
        }
        catch (error) {
            console.error(`Error deleting widget ${widget.id}:`, error);
            this.eventBus.publishError(error, 'dashboard-container');
        }
    }
    /**
     * Calculates the appropriate chart height based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @param flag - Optional flag to adjust height calculation
     * @param baseHeight - Base height to use for calculation
     * @returns The calculated chart height in pixels
     */
    calculateChartHeight(cols, rows, flag = false, baseHeight) {
        return this.calculationService.calculateChartHeight(cols, rows, flag, baseHeight);
    }
    /**
     * Calculates the appropriate map center coordinates based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns An array of [longitude, latitude] for the map center
     */
    calculateMapCenter(cols, rows) {
        return this.calculationService.calculateMapCenter(cols, rows);
    }
    /**
     * Calculates the appropriate map zoom level based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns The calculated zoom level for the map
     */
    calculateMapZoom(cols, rows) {
        return this.calculationService.calculateMapZoom(cols, rows);
    }
    static { this.ɵfac = function DashboardContainerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DashboardContainerComponent)(i0.ɵɵdirectiveInject(CalculationService), i0.ɵɵdirectiveInject(FilterService), i0.ɵɵdirectiveInject(EventBusService), i0.ɵɵdirectiveInject(WidgetDataCacheService), i0.ɵɵdirectiveInject(VirtualScrollService)); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: DashboardContainerComponent, selectors: [["vis-dashboard-container"]], inputs: { widgets: "widgets", filterValues: "filterValues", dashboardId: "dashboardId", isEditMode: "isEditMode", options: "options" }, outputs: { containerTouchChanged: "containerTouchChanged", editModeStringChange: "editModeStringChange", changesMade: "changesMade" }, decls: 7, vars: 4, consts: [[1, "gridster-container", 3, "scroll"], [1, "mt-2", "dashboard-gridster", 3, "options"], ["id", "dashboard", 1, "print-body"], [3, "item"], ["class", "virtual-scroll-status", 4, "ngIf"], ["position", "bottom-right", "key", "br"], [3, "itemResize", "itemChange", "item"], [3, "dashboardId", "widget", "onEditMode"], [3, "onDataLoad", "onUpdateFilter", "widget"], [3, "onUpdateWidget", "onDeleteWidget", "dashboardId", "widget", "onEditMode"], [1, "virtual-scroll-status"]], template: function DashboardContainerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵlistener("scroll", function DashboardContainerComponent_Template_div_scroll_0_listener($event) { return ctx.onDashboardScroll($event); });
            i0.ɵɵelementStart(1, "gridster", 1)(2, "div", 2);
            i0.ɵɵrepeaterCreate(3, DashboardContainerComponent_For_4_Template, 3, 3, "gridster-item", 3, _forTrack0);
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(5, DashboardContainerComponent_div_5_Template, 2, 2, "div", 4);
            i0.ɵɵelement(6, "p-toast", 5);
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵproperty("options", ctx.options);
            i0.ɵɵadvance();
            i0.ɵɵstyleProp("height", ctx.totalDashboardHeight * 50, "px");
            i0.ɵɵadvance();
            i0.ɵɵrepeater(ctx.visibleWidgets);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.widgets.length > ctx.visibleWidgets.length);
        } }, dependencies: [CommonModule, i6.NgIf, FormsModule,
            GridsterComponent,
            GridsterItemComponent,
            WidgetComponent,
            WidgetHeaderComponent,
            NgxPrintModule,
            Toast], styles: [".vis-chart-container[_ngcontent-%COMP%]{background-color:#fff;min-height:2000px;width:100%;margin:0;padding:0}.gridster-container[_ngcontent-%COMP%]{width:100%;height:120vh}.editMode[_ngcontent-%COMP%]{color:red}.print-body[_ngcontent-%COMP%]{width:95%}@media print{#dashboard[_ngcontent-%COMP%]{width:95%;overflow-y:visible!important;position:relative}@page{size:landscape}}.vis-filter-component[_ngcontent-%COMP%]{font-size:.8rem!important;width:100%;height:40px}  .p-dropdown-custom{width:100%!important}  .p-dropdown-custom.p-dropdown .p-component{width:100%!important}[_nghost-%COMP%]     .p-dialog .p-dialog-content{padding:1rem 1.5rem}[_nghost-%COMP%]     .p-dialog .p-dialog-header, [_nghost-%COMP%]     .p-dialog .p-dialog-footer{background:#f8f9fa}.dashboard-gridster[_ngcontent-%COMP%]{background-color:var(--surface-100)}[_nghost-%COMP%]     .no-border .p-panel-content{border:none!important;background:transparent!important}[_nghost-%COMP%]     .hide-panel-header .p-panel-header{display:none!important}", ".gridster-container[_ngcontent-%COMP%]{height:100%;overflow-y:auto;overflow-x:hidden}.virtual-scroll-status[_ngcontent-%COMP%]{position:fixed;bottom:10px;left:10px;background-color:#000000b3;color:#fff;padding:5px 10px;border-radius:4px;font-size:12px;z-index:1000;opacity:.7;transition:opacity .3s}.virtual-scroll-status[_ngcontent-%COMP%]:hover{opacity:1}"], changeDetection: 0 }); }
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
                ], changeDetection: ChangeDetectionStrategy.OnPush, template: "<div class=\"gridster-container\" (scroll)=\"onDashboardScroll($event)\">\r\n  <gridster class=\"mt-2 dashboard-gridster\" [options]=\"options\">\r\n    <div id=\"dashboard\" class=\"print-body\" [style.height.px]=\"totalDashboardHeight * 50\">\r\n      @for (item of visibleWidgets; track item.id; let i = $index) {\r\n\r\n        <gridster-item \r\n            [item]=\"item.position\" \r\n            (itemResize)=\"updateString('[Edit Mode - Pending Changes]')\"\r\n            (itemChange)=\"updateString('[Edit Mode - Pending Changes]')\">\r\n\r\n            @if (item.config.header) {\r\n              <vis-widget-header \r\n                  [dashboardId]=\"dashboardId\" \r\n                  [widget]=\"item\" \r\n                  (onUpdateWidget)=\"onUpdateWidget($event)\"\r\n                  (onDeleteWidget)=\"onDeleteWidget($event)\" \r\n                  [onEditMode]=\"isEditMode\"/>\r\n            }\r\n\r\n            <vis-widget \r\n                [widget]=\"item\" \r\n                (onDataLoad)=\"onDataLoad($event)\" \r\n                (onUpdateFilter)=\"onUpdateFilter($event)\"/>\r\n\r\n        </gridster-item>\r\n\r\n      }\r\n    </div>\r\n  </gridster>\r\n</div>\r\n\r\n<!-- Virtual Scrolling Status -->\r\n<div class=\"virtual-scroll-status\" *ngIf=\"widgets.length > visibleWidgets.length\">\r\n  Showing {{ visibleWidgets.length }} of {{ widgets.length }} widgets\r\n</div>\r\n\r\n<!-- Toast Message -->\r\n<p-toast position=\"bottom-right\" key=\"br\" />\r\n", styles: [".vis-chart-container{background-color:#fff;min-height:2000px;width:100%;margin:0;padding:0}.gridster-container{width:100%;height:120vh}.editMode{color:red}.print-body{width:95%}@media print{#dashboard{width:95%;overflow-y:visible!important;position:relative}@page{size:landscape}}.vis-filter-component{font-size:.8rem!important;width:100%;height:40px}::ng-deep .p-dropdown-custom{width:100%!important}::ng-deep .p-dropdown-custom.p-dropdown .p-component{width:100%!important}:host ::ng-deep .p-dialog .p-dialog-content{padding:1rem 1.5rem}:host ::ng-deep .p-dialog .p-dialog-header,:host ::ng-deep .p-dialog .p-dialog-footer{background:#f8f9fa}.dashboard-gridster{background-color:var(--surface-100)}:host ::ng-deep .no-border .p-panel-content{border:none!important;background:transparent!important}:host ::ng-deep .hide-panel-header .p-panel-header{display:none!important}\n", ".gridster-container{height:100%;overflow-y:auto;overflow-x:hidden}.virtual-scroll-status{position:fixed;bottom:10px;left:10px;background-color:#000000b3;color:#fff;padding:5px 10px;border-radius:4px;font-size:12px;z-index:1000;opacity:.7;transition:opacity .3s}.virtual-scroll-status:hover{opacity:1}\n"] }]
    }], () => [{ type: CalculationService }, { type: FilterService }, { type: EventBusService }, { type: WidgetDataCacheService }, { type: VirtualScrollService }], { widgets: [{
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
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(DashboardContainerComponent, { className: "DashboardContainerComponent", filePath: "lib/dashboard-container/dashboard-container.component.ts", lineNumber: 80 }); })();

/**
 * Base component for all widget types
 *
 * This component provides common functionality for all widget types,
 * reducing code duplication and improving maintainability.
 */
class BaseWidgetComponent {
    constructor(eventBus) {
        this.eventBus = eventBus;
        /** Subject for handling component destruction */
        this.destroy$ = new Subject();
        /** Loading state of the widget */
        this.loading = false;
        /** Error state of the widget */
        this.error = null;
    }
    /**
     * Initializes the component
     */
    ngOnInit() {
        // Subscribe to relevant events
        this.subscribeToEvents();
    }
    /**
     * Cleans up resources when the component is destroyed
     */
    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
    /**
     * Subscribes to relevant events from the event bus
     */
    subscribeToEvents() {
        // Subscribe to widget update events for this widget
        this.eventBus.onWidgetUpdate()
            .pipe(takeUntil(this.destroy$))
            .subscribe(updatedWidget => {
            if (updatedWidget.id === this.widget.id) {
                this.widget = updatedWidget;
                this.onWidgetUpdated();
            }
        });
        // Subscribe to filter update events
        this.eventBus.onFilterUpdate()
            .pipe(takeUntil(this.destroy$))
            .subscribe(filterData => {
            this.onFilterUpdated(filterData);
        });
    }
    /**
     * Loads data for the widget
     */
    loadData() {
        this.loading = true;
        this.error = null;
        try {
            // Use the event bus to publish a data load event
            this.eventBus.publishDataLoad(this.widget, this.widget.id);
            // Also emit the legacy event for backward compatibility
            this.onDataLoad?.emit(this.widget);
        }
        catch (err) {
            this.handleError(err);
        }
    }
    /**
     * Handles errors that occur during data loading
     *
     * @param error - The error that occurred
     */
    handleError(error) {
        this.error = error;
        this.loading = false;
        this.eventBus.publishError(error, this.widget.id);
        console.error(`Error in widget ${this.widget.id}:`, error);
    }
    /**
     * Called when the widget is updated
     * Override in derived classes to handle widget updates
     */
    onWidgetUpdated() {
        // To be overridden by derived classes
    }
    /**
     * Called when filters are updated
     * Override in derived classes to handle filter updates
     *
     * @param filterData - The updated filter data
     */
    onFilterUpdated(filterData) {
        // To be overridden by derived classes
    }
    /**
     * Updates a filter value
     *
     * @param value - The new filter value
     */
    updateFilter(value) {
        const filterData = {
            value,
            widget: this.widget,
        };
        // Use the event bus to publish a filter update event
        this.eventBus.publishFilterUpdate(filterData, this.widget.id);
        // Also emit the legacy event for backward compatibility
        this.onUpdateFilter?.emit(filterData);
    }
    static { this.ɵfac = function BaseWidgetComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || BaseWidgetComponent)(i0.ɵɵdirectiveInject(EventBusService)); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: BaseWidgetComponent, selectors: [["ng-component"]], inputs: { widget: "widget", onDataLoad: "onDataLoad", onUpdateFilter: "onUpdateFilter" }, decls: 0, vars: 0, template: function BaseWidgetComponent_Template(rf, ctx) { }, encapsulation: 2 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(BaseWidgetComponent, [{
        type: Component,
        args: [{
                template: '',
            }]
    }], () => [{ type: EventBusService }], { widget: [{
            type: Input
        }], onDataLoad: [{
            type: Input
        }], onUpdateFilter: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(BaseWidgetComponent, { className: "BaseWidgetComponent", filePath: "lib/widgets/base-widget/base-widget.component.ts", lineNumber: 16 }); })();

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

class EchartComponent extends BaseWidgetComponent {
    constructor(eventBus, elementRef) {
        super(eventBus);
        this.eventBus = eventBus;
        this.elementRef = elementRef;
        this.isSingleClick = true;
        this.resizeSubject = new Subject();
        this.resizeObserver = null;
        this.initOpts = {
            height: 300,
            rowHeightRatio: 0.25,
            fixedRowHeight: 30,
            width: 'auto',
            locale: 'en',
            renderer: 'canvas' // Use canvas renderer for better performance
        };
    }
    /**
     * Gets the chart options with dataset API if available
     */
    get chartOptions() {
        const options = (this.widget?.config?.options || {});
        // Convert to dataset API if possible
        if (options.series && Array.isArray(options.series) && !options.dataset) {
            this.convertToDatasetAPI(options);
        }
        return options;
    }
    /**
     * Converts standard ECharts options to use the dataset API for better performance
     *
     * @param options - The ECharts options to convert
     */
    convertToDatasetAPI(options) {
        // Only convert if we have series data
        if (!options.series || !Array.isArray(options.series) || options.series.length === 0) {
            return;
        }
        // Check if the first series has data
        const firstSeries = options.series[0];
        if (!firstSeries.data || !Array.isArray(firstSeries.data)) {
            return;
        }
        // Create dataset from the first series data
        options.dataset = {
            source: firstSeries.data
        };
        // Update series to use the dataset
        options.series = options.series.map((series) => {
            const newSeries = { ...series };
            delete newSeries.data;
            return newSeries;
        });
    }
    /**
     * Lifecycle hook that is called after the component's view has been initialized
     */
    ngAfterViewInit() {
        // Set up resize handling
        this.setupResizeHandling();
        // Set up window resize listener
        fromEvent(window, 'resize')
            .pipe(debounceTime(200), takeUntil(this.destroy$))
            .subscribe(() => {
            this.resizeChart();
        });
    }
    /**
     * Lifecycle hook that is called when the component is destroyed
     */
    ngOnDestroy() {
        // Clean up resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
        // Clean up resize subject
        this.resizeSubject.complete();
        // Call parent ngOnDestroy
        super.ngOnDestroy();
    }
    /**
     * Sets up resize handling for the chart
     */
    setupResizeHandling() {
        // Use ResizeObserver if available
        if (typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(entries => {
                this.resizeSubject.next();
            });
            const container = this.elementRef.nativeElement.querySelector('.echart-container');
            if (container) {
                this.resizeObserver.observe(container);
            }
            // Debounce resize events
            this.resizeSubject
                .pipe(debounceTime(100), takeUntil(this.destroy$))
                .subscribe(() => {
                this.resizeChart();
            });
        }
    }
    /**
     * Resizes the chart to fit its container
     */
    resizeChart() {
        if (this.widget?.chartInstance) {
            this.widget.chartInstance.resize();
        }
    }
    /**
     * Initializes the chart instance
     *
     * @param instance - The ECharts instance
     */
    onChartInit(instance) {
        if (this.widget && instance) {
            this.widget.chartInstance = instance;
            // Set chart theme and renderer options
            instance.setOption({
                backgroundColor: 'transparent',
                textStyle: {
                    fontFamily: 'Arial, sans-serif'
                }
            }, false, false);
            // Load data after a short delay to ensure the chart is ready
            setTimeout(() => {
                this.loadData();
            });
        }
    }
    /**
     * Handles double-click events on the chart
     *
     * @param e - The double-click event
     */
    onChartDblClick(e) {
        this.isSingleClick = false;
    }
    /**
     * Handles click events on the chart
     *
     * @param e - The click event
     */
    onClick(e) {
        this.isSingleClick = true;
        setTimeout(() => {
            if (!this.isSingleClick)
                return; // Ignore if it was part of a double-click
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
            // Use the base class method to update the filter
            this.updateFilter(selectedPoint);
        }, 250);
    }
    /**
     * Called when the widget is updated
     * Reloads data if necessary
     */
    onWidgetUpdated() {
        // Reload data when the widget is updated
        this.loadData();
        // Resize the chart to ensure it fits properly
        setTimeout(() => {
            this.resizeChart();
        }, 0);
    }
    /**
     * Called when filters are updated
     * Reloads data if the widget supports filtering
     *
     * @param filterData - The updated filter data
     */
    onFilterUpdated(filterData) {
        // Only reload data if this widget supports filtering
        if (this.widget.config.state?.supportsFiltering !== false) {
            this.loadData();
        }
    }
    static { this.ɵfac = function EchartComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || EchartComponent)(i0.ɵɵdirectiveInject(EventBusService), i0.ɵɵdirectiveInject(i0.ElementRef)); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: EchartComponent, selectors: [["vis-echart"]], features: [i0.ɵɵProvidersFeature([provideEchartsCore({ echarts })]), i0.ɵɵInheritDefinitionFeature], decls: 1, vars: 2, consts: [["echarts", "", 1, "echart-container", 3, "chartInit", "chartClick", "chartDblClick", "options", "initOpts"]], template: function EchartComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0);
            i0.ɵɵlistener("chartInit", function EchartComponent_Template_div_chartInit_0_listener($event) { return ctx.onChartInit($event); })("chartClick", function EchartComponent_Template_div_chartClick_0_listener($event) { return ctx.onClick($event); })("chartDblClick", function EchartComponent_Template_div_chartDblClick_0_listener($event) { return ctx.onChartDblClick($event); });
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵproperty("options", ctx.chartOptions)("initOpts", ctx.initOpts);
        } }, dependencies: [CommonModule, NgxEchartsDirective], styles: [".echart-container[_ngcontent-%COMP%]{width:100%;height:100%}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(EchartComponent, [{
        type: Component,
        args: [{ selector: 'vis-echart', standalone: true, template: `<div
    echarts
    [options]="chartOptions"
    (chartInit)="onChartInit($event)"
    (chartClick)="onClick($event)"
    (chartDblClick)="onChartDblClick($event)"
    [initOpts]="initOpts"
    class="echart-container"
  ></div>`, imports: [CommonModule, NgxEchartsDirective], providers: [provideEchartsCore({ echarts })], changeDetection: ChangeDetectionStrategy.OnPush, styles: [".echart-container{width:100%;height:100%}\n"] }]
    }], () => [{ type: EventBusService }, { type: i0.ElementRef }], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(EchartComponent, { className: "EchartComponent", filePath: "lib/widgets/echarts/echart.component.ts", lineNumber: 33 }); })();

var echart_component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    EchartComponent: EchartComponent
});

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
        } }, dependencies: [CommonModule, i6.UpperCasePipe], styles: [".chip[_ngcontent-%COMP%]{border-radius:50px;font-size:10px;font-weight:700!important;border:1px dashed #a6a6a6}.filter-component[_ngcontent-%COMP%]{display:flex;flex-direction:row;flex-wrap:wrap;align-items:center;vertical-align:middle;margin:.2rem;padding-left:1rem;font-size:.9rem;font-weight:600}.close-icon[_ngcontent-%COMP%]{vertical-align:middle;margin-left:3px}"] }); }
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

var filter_component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    FilterComponent: FilterComponent
});

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

var table_component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TableComponent: TableComponent
});

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

var tile_component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    TileComponent: TileComponent
});

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

var markdownCell_component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    MarkdownCellComponent: MarkdownCellComponent
});

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

var codeCell_component = /*#__PURE__*/Object.freeze({
    __proto__: null,
    CodeCellComponent: CodeCellComponent
});

/*
 * Public API Surface of dashboards
 */
// Components

/**
 * Generated bundle index. Do not edit.
 */

export { BaseWidgetComponent, CalculationService, CodeCellComponent, DashboardContainerComponent, EchartComponent, EventBusService, EventType, FilterComponent, FilterService, MarkdownCellComponent, TableComponent, TileComponent, WidgetBuilder, WidgetConfigComponent, WidgetHeaderComponent, WidgetPluginService, dataOptions, formOptions };
//# sourceMappingURL=dashboards.mjs.map

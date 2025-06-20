import * as echarts from 'echarts';
import { EChartsOption, ECharts } from 'echarts';
import { GridsterItem, GridsterConfig, GridsterItemComponentInterface } from 'angular-gridster2';
import * as i0 from '@angular/core';
import { OnInit, OnDestroy, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MenuItem, MessageService } from 'primeng/api';

interface IState {
    accessor: string;
    column: string;
    isOdataQuery: boolean;
    supportsFiltering?: boolean;
    filterDependencies?: string[];
}

interface IFilterValues {
    accessor: string;
    [key: string]: string;
}

interface IFilterOptions {
    values: IFilterValues[];
}

interface ITileOptions {
    accessor: string;
}

interface IMarkdownCellOptions {
    accessor: string;
}

interface ICodeCellOptions {
    accessor: string;
}

interface ITableOptions {
    accessor: string;
}

/**
 * Interface for data grid widget options
 */
interface IDataGridOptions {
    /** Columns to display in the grid */
    columns?: string[];
    /** Initial sort field */
    sortField?: string;
    /** Initial sort order (1 for ascending, -1 for descending) */
    sortOrder?: number;
    /** Whether to enable pagination */
    pagination?: boolean;
    /** Default rows per page */
    rows?: number;
    /** Available rows per page options */
    rowsPerPageOptions?: number[];
    /** Whether to enable global filtering */
    globalFilter?: boolean;
    /** Whether to enable column filtering */
    columnFilters?: boolean;
    /** Whether to enable column resizing */
    resizableColumns?: boolean;
    /** Whether to enable column reordering */
    reorderableColumns?: boolean;
    /** Whether to enable row selection */
    selectionMode?: 'single' | 'multiple' | 'checkbox' | null;
    /** Whether to enable responsive mode */
    responsive?: boolean;
    /** Custom style class for the table */
    styleClass?: string;
    /** Data accessor function or path */
    accessor?: string;
}

/**
 * Interface for heatmap chart widget options
 */
interface IHeatmapOptions {
    /** Data for the heatmap */
    data?: Array<[number, number, number]>;
    /** X-axis data */
    xAxis?: string[];
    /** Y-axis data */
    yAxis?: string[];
    /** Minimum value for the color scale */
    min?: number;
    /** Maximum value for the color scale */
    max?: number;
    /** Color range for the heatmap */
    colors?: string[];
    /** Whether to show the color legend */
    showLegend?: boolean;
    /** Position of the legend */
    legendPosition?: 'top' | 'bottom' | 'left' | 'right';
    /** Whether to enable visual map */
    visualMap?: boolean;
    /** Whether to enable tooltip */
    tooltip?: boolean;
    /** Whether to enable label */
    label?: boolean;
    /** Whether to enable emphasis on hover */
    emphasis?: boolean;
    /** Data accessor function or path */
    accessor?: string;
}

/**
 * Interface for gauge chart widget options
 */
interface IGaugeOptions {
    /** Value for the gauge */
    value?: number;
    /** Minimum value for the gauge */
    min?: number;
    /** Maximum value for the gauge */
    max?: number;
    /** Title of the gauge */
    title?: string;
    /** Detail text format */
    detailFormat?: string;
    /** Whether to show the pointer */
    showPointer?: boolean;
    /** Whether to show progress */
    showProgress?: boolean;
    /** Whether to show the axis tick */
    showAxisTick?: boolean;
    /** Whether to show the axis label */
    showAxisLabel?: boolean;
    /** Color ranges for the gauge */
    ranges?: Array<{
        /** Minimum value for this range */
        min: number;
        /** Maximum value for this range */
        max: number;
        /** Color for this range */
        color: string;
    }>;
    /** Color of the gauge */
    color?: string | string[];
    /** Whether to enable animation */
    animation?: boolean;
    /** Whether to enable tooltip */
    tooltip?: boolean;
    /** Data accessor function or path */
    accessor?: string;
}

/**
 * Interface representing a widget in the dashboard
 */
interface IWidget {
    /** Unique identifier for the widget */
    id?: string;
    /** Position and size configuration for the gridster layout */
    position: GridsterItem;
    /** Original position and size before responsive adjustments */
    originalPosition?: GridsterItem;
    /** Number of rows the widget occupies in the grid */
    rows?: number;
    /** Widget configuration object */
    config: {
        /** Component type identifier */
        component?: string;
        /** Initial state of the widget */
        initialState?: IState;
        /** Current state of the widget */
        state?: IState;
        /** Header configuration */
        header?: {
            /** Widget title */
            title: string;
            /** Available options for the widget header */
            options?: string[];
        };
        /** Size configuration [width, height] */
        size?: number[];
        /** Height of the widget in pixels */
        height?: number;
        /** Widget-specific options based on the component type */
        options: echarts.EChartsOption | IFilterOptions | ITileOptions | IMarkdownCellOptions | ICodeCellOptions | ITableOptions | IDataGridOptions | IHeatmapOptions | IGaugeOptions;
        /** Event handlers */
        events?: {
            /** Callback function when chart options change
             * @param widget - The current widget instance
             * @param chart - Optional ECharts instance
             * @param filters - Optional filter values
             */
            onChartOptions?: (widget: IWidget, chart?: echarts.ECharts, filters?: string | IFilterValues[]) => void;
        };
    };
    /** Data series for the widget */
    series?: [{}];
    /** Reference to the ECharts instance if applicable */
    chartInstance?: echarts.ECharts | null;
    /** Whether the widget is currently loading data */
    loading?: boolean;
    /** Error that occurred during data loading, if any */
    error?: any;
}

declare class WidgetBuilder {
    private widget;
    setId(id: string): this;
    setPosition(position: GridsterItem): this;
    setComponent(component: string): this;
    setInitialState(initialState: IState): this;
    setState(state: IState): this;
    setHeader(title: string, options?: string[]): this;
    setSize(size: number[]): this;
    setEChartsOptions(options: EChartsOption): this;
    setFilterOptions(options: IFilterOptions): this;
    setTileOptions(options: ITileOptions): this;
    setMarkdownCellOptions(options: IMarkdownCellOptions): this;
    setCodeCellOptions(options: ICodeCellOptions): this;
    setTableOptions(options: ITableOptions): this;
    setEvents(onChartOptions: (widget: IWidget, chart?: ECharts, filters?: string | IFilterValues[]) => void): this;
    setEventChartOptions(onChartOptions: (widget: IWidget, chart?: ECharts, filters?: string | IFilterValues[]) => void): this;
    setSeries(series: [{}]): this;
    setChartInstance(chartInstance: ECharts | null): this;
    setEChartsTitle(title: any): this;
    setEChartsGrid(grid: any): this;
    setEChartsTooltip(tooltip: any): this;
    setEChartsLegend(legend: any): this;
    setEChartsXAxis(xAxis: any): this;
    setEChartsYAxis(yAxis: any): this;
    setEChartsSeries(series: any): this;
    build(): IWidget;
}

/**
 * Service for handling complex calculations related to dashboard widgets
 *
 * This service extracts calculation logic from components to improve maintainability
 * and reusability across the application.
 */
declare class CalculationService {
    /** Default chart height in pixels */
    readonly defaultChartHeight: number;
    /**
     * Calculates the appropriate chart height based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @param flag - Optional flag to adjust height calculation
     * @param baseHeight - Base height to use for calculation (defaults to defaultChartHeight)
     * @returns The calculated chart height in pixels
     */
    calculateChartHeight(cols: number, rows: number, flag?: boolean, baseHeight?: number): number;
    /**
     * Calculates the appropriate map center coordinates based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns An array of [longitude, latitude] for the map center
     */
    calculateMapCenter(cols: number, rows: number): number[];
    /**
     * Calculates the appropriate map zoom level based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns The calculated zoom level for the map
     */
    calculateMapZoom(cols: number, rows: number): number;
    static ɵfac: i0.ɵɵFactoryDeclaration<CalculationService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CalculationService>;
}

/**
 * Service for handling filter-related operations in dashboards
 *
 * This service extracts filter logic from components to improve maintainability
 * and reusability across the application.
 */
declare class FilterService {
    /**
     * Builds OData query parameters from the current filter values
     *
     * @param filterValues - The current filter values to convert to OData parameters
     * @returns A string containing the OData query parameters
     */
    getFilterParams(filterValues: IFilterValues[]): string;
    /**
     * Finds the filter widget in the dashboard
     *
     * @param widgets - Array of all widgets in the dashboard
     * @returns The filter widget if found, undefined otherwise
     */
    findFilterWidget(widgets: IWidget[]): IWidget | undefined;
    /**
     * Gets the current filter values from the filter widget
     *
     * @param widgets - Array of all widgets in the dashboard
     * @returns Array of filter values if filter widget exists, empty array otherwise
     */
    getFilterValues(widgets: IWidget[]): IFilterValues[];
    /**
     * Updates a filter widget with new filter values
     *
     * @param filterWidget - The filter widget to update
     * @param filterEvent - The filter event containing the new filter values
     * @returns The updated filter widget
     */
    updateFilterWidget(filterWidget: IWidget, filterEvent: any): IWidget;
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<FilterService>;
}

/**
 * Event types supported by the event bus
 */
declare enum EventType {
    DATA_LOAD = "DATA_LOAD",
    FILTER_UPDATE = "FILTER_UPDATE",
    WIDGET_UPDATE = "WIDGET_UPDATE",
    DASHBOARD_CHANGE = "DASHBOARD_CHANGE",
    WIDGET_RESIZE = "WIDGET_RESIZE",
    WIDGET_MOVE = "WIDGET_MOVE",
    ERROR = "ERROR"
}
/**
 * Interface for events published through the event bus
 */
interface Event {
    type: EventType;
    payload: any;
    source?: string;
    timestamp?: number;
}
/**
 * Service for handling events in the dashboard framework
 *
 * This service provides a decoupled approach for communication between components
 * using a publish-subscribe pattern.
 */
declare class EventBusService {
    private eventSubject;
    /**
     * Publishes an event to the event bus
     *
     * @param type - The type of event
     * @param payload - The event payload
     * @param source - Optional source identifier
     */
    publish(type: EventType, payload: any, source?: string): void;
    /**
     * Subscribes to events of a specific type
     *
     * @param type - The type of events to subscribe to
     * @returns An observable of events of the specified type
     */
    on(type: EventType): Observable<Event>;
    /**
     * Subscribes to all events
     *
     * @returns An observable of all events
     */
    onAll(): Observable<Event>;
    /**
     * Publishes a data load event
     *
     * @param widget - The widget that needs data
     * @param source - Optional source identifier
     */
    publishDataLoad(widget: IWidget, source?: string): void;
    /**
     * Subscribes to data load events
     *
     * @returns An observable of data load events
     */
    onDataLoad(): Observable<IWidget>;
    /**
     * Publishes a filter update event
     *
     * @param filterData - The updated filter data
     * @param source - Optional source identifier
     */
    publishFilterUpdate(filterData: any, source?: string): void;
    /**
     * Subscribes to filter update events
     *
     * @returns An observable of filter update events
     */
    onFilterUpdate(): Observable<any>;
    /**
     * Publishes a widget update event
     *
     * @param widget - The updated widget
     * @param source - Optional source identifier
     */
    publishWidgetUpdate(widget: IWidget, source?: string): void;
    /**
     * Subscribes to widget update events
     *
     * @returns An observable of widget update events
     */
    onWidgetUpdate(): Observable<IWidget>;
    /**
     * Publishes an error event
     *
     * @param error - The error that occurred
     * @param source - Optional source identifier
     */
    publishError(error: any, source?: string): void;
    /**
     * Subscribes to error events
     *
     * @returns An observable of error events
     */
    onError(): Observable<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<EventBusService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<EventBusService>;
}

/**
 * Service for caching widget data to improve performance
 *
 * This service provides methods for caching and retrieving widget data,
 * reducing the need for repeated data fetching.
 */
declare class WidgetDataCacheService {
    private cache;
    private cacheExpirationTime;
    constructor();
    /**
     * Sets the cache expiration time
     *
     * @param timeInMs - The cache expiration time in milliseconds
     */
    setCacheExpirationTime(timeInMs: number): void;
    /**
     * Gets the cache key for a widget and optional filters
     *
     * @param widget - The widget to get the cache key for
     * @param filters - Optional filter values
     * @returns The cache key
     */
    private getCacheKey;
    /**
     * Converts filters to a string for use in cache keys
     *
     * @param filters - The filters to convert
     * @returns A string representation of the filters
     */
    private getFilterString;
    /**
     * Gets data from the cache for a widget and filters
     *
     * @param widget - The widget to get data for
     * @param filters - Optional filter values
     * @returns The cached data if available and not expired, undefined otherwise
     */
    getData(widget: IWidget, filters?: string | IFilterValues[]): any;
    /**
     * Stores data in the cache for a widget and filters
     *
     * @param widget - The widget to store data for
     * @param data - The data to store
     * @param filters - Optional filter values
     */
    setData(widget: IWidget, data: any, filters?: string | IFilterValues[]): void;
    /**
     * Clears the cache for a specific widget
     *
     * @param widget - The widget to clear the cache for
     */
    clearWidgetCache(widget: IWidget): void;
    /**
     * Clears the entire cache
     */
    clearAllCache(): void;
    /**
     * Determines if a widget's data should be reloaded based on filter changes
     *
     * @param widget - The widget to check
     * @param oldFilters - The old filter values
     * @param newFilters - The new filter values
     * @returns True if the widget should be reloaded, false otherwise
     */
    shouldReloadWidget(widget: IWidget, oldFilters: IFilterValues[], newFilters: IFilterValues[]): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetDataCacheService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WidgetDataCacheService>;
}

/**
 * Service for implementing virtual scrolling for large dashboards
 *
 * This service provides methods for determining which widgets should be
 * rendered based on their position and the current viewport.
 */
declare class VirtualScrollService {
    private viewportHeight;
    private bufferSize;
    private scrollPosition;
    private scrollPositionSubject;
    scrollPosition$: Observable<number>;
    private visibleWidgetsSubject;
    visibleWidgets$: Observable<IWidget[]>;
    private widgetPositionCache;
    constructor();
    /**
     * Sets the viewport height
     *
     * @param rows - The viewport height in rows
     */
    setViewportHeight(rows: number): void;
    /**
     * Sets the buffer size
     *
     * @param rows - The buffer size in rows
     */
    setBufferSize(rows: number): void;
    /**
     * Updates the scroll position and recalculates visible widgets
     *
     * @param scrollTop - The new scroll position in rows
     * @param widgets - All widgets in the dashboard
     */
    updateScrollPosition(scrollTop: number, widgets: IWidget[]): void;
    /**
     * Gets the current scroll position
     *
     * @returns The current scroll position in rows
     */
    getScrollPosition(): number;
    /**
     * Gets an observable of the scroll position
     *
     * @returns An observable of the scroll position
     */
    getScrollPosition$(): Observable<number>;
    /**
     * Gets an observable of the visible widgets
     *
     * @returns An observable of the visible widgets
     */
    getVisibleWidgets$(): Observable<IWidget[]>;
    /**
     * Determines which widgets should be rendered based on the current scroll position
     *
     * @param widgets - All widgets in the dashboard
     * @param scrollTop - The current scroll position in rows
     * @returns The widgets that should be rendered
     */
    getVisibleWidgets(widgets: IWidget[], scrollTop: number): IWidget[];
    /**
     * Calculates the total height of the dashboard in rows
     *
     * @param widgets - All widgets in the dashboard
     * @returns The total height in rows
     */
    getTotalHeight(widgets: IWidget[]): number;
    /**
     * Updates the widget position cache
     *
     * @param widgets - All widgets in the dashboard
     */
    private updateWidgetPositionCache;
    /**
     * Creates placeholder widgets for the virtual scroll
     *
     * @param totalHeight - The total height of the dashboard in rows
     * @returns A placeholder widget that takes up the required space
     */
    createPlaceholders(totalHeight: number): IWidget;
    static ɵfac: i0.ɵɵFactoryDeclaration<VirtualScrollService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<VirtualScrollService>;
}

/**
 * Interface for dashboard state
 */
interface DashboardState {
    widgets: IWidget[];
    timestamp: number;
}
/**
 * Service for managing undo/redo functionality in the dashboard
 */
declare class UndoRedoService {
    /**
     * History of dashboard states
     */
    private history;
    /**
     * Current position in history
     */
    private currentIndex;
    /**
     * Subject for tracking can undo state
     */
    private canUndoSubject;
    /**
     * Subject for tracking can redo state
     */
    private canRedoSubject;
    /**
     * Subject for current state
     */
    private currentStateSubject;
    constructor();
    /**
     * Observable for can undo state
     */
    get canUndo$(): Observable<boolean>;
    /**
     * Observable for can redo state
     */
    get canRedo$(): Observable<boolean>;
    /**
     * Observable for current state
     */
    get currentState$(): Observable<DashboardState | null>;
    /**
     * Whether undo is available
     */
    get canUndo(): boolean;
    /**
     * Whether redo is available
     */
    get canRedo(): boolean;
    /**
     * Adds a new state to the history
     *
     * @param widgets - The current widgets array
     */
    addState(widgets: IWidget[]): void;
    /**
     * Undoes the last change
     *
     * @returns The previous state or null if no previous state exists
     */
    undo(): DashboardState | null;
    /**
     * Redoes the last undone change
     *
     * @returns The next state or null if no next state exists
     */
    redo(): DashboardState | null;
    /**
     * Clears the history
     */
    clearHistory(): void;
    /**
     * Updates the BehaviorSubjects with current state
     */
    private updateSubjects;
    static ɵfac: i0.ɵɵFactoryDeclaration<UndoRedoService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UndoRedoService>;
}

/**
 * Interface for dashboard templates
 */
interface IDashboardTemplate {
    /** Unique identifier for the template */
    id: string;
    /** Name of the template */
    name: string;
    /** Description of the template */
    description?: string;
    /** Category or tags for the template */
    category?: string[];
    /** Thumbnail image URL */
    thumbnailUrl?: string;
    /** Whether this is a pre-built template */
    isPreBuilt?: boolean;
    /** User ID of the creator (for user-created templates) */
    createdBy?: string;
    /** Creation date */
    createdAt?: Date;
    /** Last modified date */
    updatedAt?: Date;
    /** The actual dashboard configuration */
    dashboardConfig: {
        /** Layout settings */
        layout?: any;
        /** Widgets in the dashboard */
        widgets: any[];
        /** Global dashboard settings */
        settings?: any;
    };
}

/**
 * Service for managing dashboard templates
 */
declare class DashboardTemplateService {
    private http;
    private preBuiltTemplates;
    private readonly USER_TEMPLATES_KEY;
    constructor(http: HttpClient);
    /**
     * Gets all available templates (both pre-built and user-created)
     */
    getAllTemplates(): Observable<IDashboardTemplate[]>;
    /**
     * Gets all pre-built templates
     */
    getPreBuiltTemplates(): Observable<IDashboardTemplate[]>;
    /**
     * Gets user-created templates from local storage
     */
    getUserTemplates(): Observable<IDashboardTemplate[]>;
    /**
     * Gets a template by ID
     */
    getTemplateById(id: string): Observable<IDashboardTemplate>;
    /**
     * Saves a user template
     */
    saveTemplate(template: IDashboardTemplate): Observable<IDashboardTemplate>;
    /**
     * Deletes a user template
     */
    deleteTemplate(id: string): Observable<boolean>;
    /**
     * Generates a unique ID for a template
     */
    private generateId;
    static ɵfac: i0.ɵɵFactoryDeclaration<DashboardTemplateService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DashboardTemplateService>;
}

/**
 * A container component for dashboard widgets.
 *
 * This component provides a grid-based layout for dashboard widgets using angular-gridster2.
 * It handles widget positioning, resizing, data loading, and filtering.
 */
declare class DashboardContainerComponent implements OnInit, OnDestroy {
    private calculationService;
    private filterService;
    private eventBus;
    private widgetDataCache;
    private virtualScrollService;
    private undoRedoService;
    private templateService;
    /** Array of widgets to display in the dashboard */
    widgets: IWidget[];
    /** Current filter values applied to the dashboard */
    filterValues: IFilterValues[];
    /** Current chart height in pixels */
    chartHeight: number;
    private currentScrollPosition;
    visibleWidgets: IWidget[];
    totalDashboardHeight: number;
    canUndo: boolean;
    canRedo: boolean;
    private destroy$;
    private resizeTimeout;
    private currentBreakpoint;
    private stateChangeDebounceTimer;
    constructor(calculationService: CalculationService, filterService: FilterService, eventBus: EventBusService, widgetDataCache: WidgetDataCacheService, virtualScrollService: VirtualScrollService, undoRedoService: UndoRedoService, templateService: DashboardTemplateService);
    /**
     * Lifecycle hook that is called after the component is initialized
     */
    ngOnInit(): void;
    /**
     * Lifecycle hook that is called when the component is destroyed
     */
    ngOnDestroy(): void;
    /**
     * Initializes the undo/redo functionality
     */
    private initUndoRedo;
    /**
     * Sets up keyboard shortcuts for accessibility
     */
    private setupKeyboardShortcuts;
    /**
     * Tracks state changes in the dashboard
     * Debounces the state tracking to avoid too many history entries
     */
    private trackStateChange;
    /**
     * Undoes the last change
     */
    undo(): void;
    /**
     * Redoes the last undone change
     */
    redo(): void;
    /**
     * Applies a dashboard state
     *
     * @param state - The state to apply
     */
    private applyState;
    /**
     * Initializes virtual scrolling for the dashboard
     */
    private initVirtualScrolling;
    /**
     * Updates the list of visible widgets based on the current scroll position
     */
    private updateVisibleWidgets;
    /**
     * Handles scroll events in the dashboard
     *
     * @param event - The scroll event
     */
    onDashboardScroll(event: any): void;
    /**
     * Subscribes to events from the event bus
     */
    private subscribeToEvents;
    /** Event emitted when the container is touched/modified */
    containerTouchChanged: EventEmitter<any>;
    /** Event emitted when the edit mode string changes */
    editModeStringChange: EventEmitter<string>;
    /** Event emitted when changes are made to the dashboard */
    changesMade: EventEmitter<string>;
    /** Available dashboards for selection */
    availableDashboards: any[];
    /** ID of the current dashboard */
    dashboardId: any;
    /** Initial widget data */
    initialWidgetData: any;
    /** Whether the dashboard is in edit mode */
    isEditMode: boolean;
    /** Whether to show confirmation dialog */
    onShowConfirmation: any;
    /** Whether to show new dashboard dialog */
    onShowNewDashboardDialog: boolean;
    /** Whether the container has been touched/modified */
    containerTouched: boolean;
    /** String representation of the current edit mode state */
    editModeString: string;
    /** Form for creating a new dashboard */
    newDashboardForm: FormGroup;
    /**
     * Gridster configuration options for the dashboard layout
     * @see https://github.com/tiberiuzuld/angular-gridster2
     */
    options: GridsterConfig;
    /**
     * Loads data for a widget and applies any filters
     *
     * @param widget - The widget to load data for
     */
    onDataLoad(widget: IWidget): Promise<void>;
    /**
     * Builds OData query parameters from the current filter values
     *
     * @returns A string containing the OData query parameters
     */
    getFilterParams(): string;
    /**
     * Updates a widget in the dashboard and reloads data for all widgets
     *
     * @param widget - The updated widget
     */
    onUpdateWidget(widget: IWidget): void;
    /**
     * Callback when a widget is resized
     *
     * @param item - The gridster item being resized
     * @param itemComponent - The gridster item component
     */
    onWidgetResize(item: GridsterItem, itemComponent: GridsterItemComponentInterface): void;
    /**
     * Callback when a widget is moved or changed
     *
     * @param item - The gridster item being changed
     * @param itemComponent - The gridster item component
     */
    onWidgetChange(item: GridsterItem, itemComponent: GridsterItemComponentInterface): void;
    /**
     * Updates the edit mode string and emits the change
     *
     * @param editModeString - The new edit mode string
     */
    updateString(editModeString: string): void;
    /**
     * Gets the current edit mode string
     *
     * @returns The current edit mode string
     */
    getEditModeString(): string;
    /**
     * Updates the filter widget with new filter values
     *
     * @param $event - The filter event containing the new filter values
     */
    onUpdateFilter($event: any): void;
    /**
     * Updates a widget in the dashboard without reloading data
     *
     * @param widget - The updated widget
     */
    private updateWidgetWithoutReload;
    /**
     * Handles dashboard selection changes
     *
     * @param $event - The selection change event
     */
    onDashboardSelectionChanged($event: any): void;
    /**
     * Deletes a widget from the dashboard
     * Only available in edit mode
     *
     * @param widget - The widget to delete
     */
    onDeleteWidget(widget: IWidget): void;
    /**
     * Calculates the appropriate chart height based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @param flag - Optional flag to adjust height calculation
     * @param baseHeight - Base height to use for calculation
     * @returns The calculated chart height in pixels
     */
    calculateChartHeight(cols: number, rows: number, flag?: boolean, baseHeight?: number): number;
    /**
     * Calculates the appropriate map center coordinates based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns An array of [longitude, latitude] for the map center
     */
    calculateMapCenter(cols: number, rows: number): number[];
    /**
     * Calculates the appropriate map zoom level based on grid dimensions
     *
     * @param cols - Number of columns in the grid
     * @param rows - Number of rows in the grid
     * @returns The calculated zoom level for the map
     */
    calculateMapZoom(cols: number, rows: number): number;
    /**
     * Applies responsive layout based on screen size
     *
     * This method detects the current screen size and applies the appropriate
     * responsive layout configuration. It also updates widget positions and sizes
     * to ensure they fit properly on the current screen.
     */
    applyResponsiveLayout(): void;
    /**
     * Gets the responsive row height for a widget based on its type
     *
     * @param widget - The widget to calculate height for
     * @returns The number of rows the widget should occupy
     */
    private getResponsiveRowHeight;
    /**
     * Gets the current dashboard configuration for saving as a template
     *
     * @returns The dashboard configuration
     */
    getDashboardConfig(): any;
    /**
     * Loads a dashboard template
     *
     * @param template - The template to load
     */
    loadTemplate(template: IDashboardTemplate): void;
    /**
     * Handles when a template is saved
     *
     * @param template - The saved template
     */
    onTemplateSaved(template: IDashboardTemplate): void;
    /**
     * Shows a toast message
     *
     * @param severity - The severity of the message (success, info, warn, error)
     * @param summary - The summary of the message
     * @param detail - The detail of the message
     */
    private showToast;
    static ɵfac: i0.ɵɵFactoryDeclaration<DashboardContainerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DashboardContainerComponent, "vis-dashboard-container", never, { "widgets": { "alias": "widgets"; "required": false; }; "filterValues": { "alias": "filterValues"; "required": false; }; "dashboardId": { "alias": "dashboardId"; "required": false; }; "isEditMode": { "alias": "isEditMode"; "required": false; }; "options": { "alias": "options"; "required": false; }; }, { "containerTouchChanged": "containerTouchChanged"; "editModeStringChange": "editModeStringChange"; "changesMade": "changesMade"; }, never, never, true, never>;
}

declare class WidgetHeaderComponent {
    widget: IWidget;
    onUpdateWidget: EventEmitter<IWidget>;
    onDeleteWidget: EventEmitter<IWidget>;
    onEditMode: boolean;
    dashboardId: any;
    sidebarVisible: boolean;
    get title(): string | undefined;
    onUpdateOptions(data: IWidget): void;
    onEditModeClicked(): void;
    onDeleteWidgetClicked(event: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetHeaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WidgetHeaderComponent, "vis-widget-header", never, { "widget": { "alias": "widget"; "required": false; }; "onEditMode": { "alias": "onEditMode"; "required": false; }; "dashboardId": { "alias": "dashboardId"; "required": false; }; }, { "onUpdateWidget": "onUpdateWidget"; "onDeleteWidget": "onDeleteWidget"; }, never, never, true, never>;
}

/**
 * Interface for widget plugins in the dashboard framework
 *
 * This interface defines the contract that all widget plugins must implement
 * to be compatible with the dashboard system.
 */
interface IWidgetPlugin {
    /**
     * Unique identifier for the widget type
     */
    type: string;
    /**
     * Display name for the widget type (used in UI)
     */
    displayName: string;
    /**
     * Description of the widget's purpose and functionality
     */
    description: string;
    /**
     * Icon to represent this widget type in the UI
     */
    icon?: string;
    /**
     * Component type to be instantiated for this widget
     */
    component: any;
    /**
     * Default configuration for this widget type
     */
    defaultConfig: any;
    /**
     * Whether this widget type supports filtering
     */
    supportsFiltering?: boolean;
    /**
     * Whether this widget type can be a source of filter values
     */
    canBeFilterSource?: boolean;
}

/**
 * Service for managing widget plugins in the dashboard framework
 *
 * This service provides methods for registering, retrieving, and managing
 * widget plugins, making it easier to add new widget types.
 */
declare class WidgetPluginService {
    private plugins;
    private componentPromises;
    private loadedComponents;
    constructor();
    /**
     * Registers a new widget plugin
     *
     * @param plugin - The widget plugin to register
     */
    registerPlugin(plugin: IWidgetPlugin): void;
    /**
     * Gets a widget plugin by type
     *
     * @param type - The type of the widget plugin to retrieve
     * @returns The widget plugin if found, undefined otherwise
     */
    getPlugin(type: string): IWidgetPlugin | undefined;
    /**
     * Gets all registered widget plugins
     *
     * @returns Array of all registered widget plugins
     */
    getAllPlugins(): IWidgetPlugin[];
    /**
     * Gets the component for a widget type
     *
     * @param type - The type of the widget
     * @returns The component for the widget type, or a promise that resolves to the component
     */
    getComponentForType(type: string): any;
    /**
     * Loads a component for a widget type
     *
     * @param type - The type of the widget
     * @returns A promise that resolves to the component
     */
    private loadComponentForType;
    /**
     * Imports a component for a widget type
     *
     * @param type - The type of the widget
     * @returns A promise that resolves to the component
     */
    private importComponentForType;
    /**
     * Gets a placeholder component to use while the real component is loading
     *
     * @returns The placeholder component type
     */
    private getPlaceholderComponent;
    /**
     * Registers the default widget plugins
     */
    private registerDefaultPlugins;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetPluginService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WidgetPluginService>;
}

/**
 * Component for configuring dashboard widgets
 *
 * This component provides a user interface for creating and editing widget configurations.
 * It supports different widget types (charts, filters, tables, etc.) and provides
 * appropriate configuration options for each type.
 */
declare class WidgetConfigComponent implements OnInit {
    private fb;
    private messageService;
    private widgetPluginService;
    sidebarVisible: boolean;
    private _widget;
    private originalWidget;
    onUpdate: EventEmitter<IWidget>;
    onCancel: EventEmitter<void>;
    selectedDashboardId: any;
    set widget(value: IWidget | undefined);
    get widget(): IWidget | undefined;
    items: MenuItem[];
    activeItem: MenuItem;
    generalForm: FormGroup;
    positionForm: FormGroup;
    optionsForm: FormGroup;
    filterForm: FormGroup;
    advancedForm: FormGroup;
    availableComponents: any[];
    chartTypes: any[];
    chartThemes: any[];
    filterTypes: any[];
    isJsonInvalid: boolean;
    constructor(fb: FormBuilder, messageService: MessageService, widgetPluginService: WidgetPluginService);
    ngOnInit(): void;
    /**
     * Initializes all form groups with widget data
     *
     * This method populates the form controls with values from the current widget configuration.
     * It handles different widget types (charts, filters, etc.) and sets appropriate values
     * for each form group based on the widget type.
     */
    private initForms;
    /**
     * Gets the widget title
     */
    get title(): string;
    /**
     * Gets the widget type name for display
     */
    getWidgetTypeName(): string;
    /**
     * Checks if the widget is a new widget
     */
    get isNewWidget(): boolean;
    /**
     * Checks if the widget is an EChart widget
     */
    isEchartWidget(): boolean;
    /**
     * Checks if the widget is a filter widget
     */
    isFilterWidget(): boolean;
    /**
     * Gets the chart type from ECharts options
     */
    private getChartType;
    /**
     * Validates JSON input in the advanced configuration tab
     *
     * This method is used as a validator function for the JSON editor in the advanced tab.
     * It checks if the provided string is valid JSON and returns a validation error if not.
     *
     * @param control - The form control containing the JSON string to validate
     * @returns null if the JSON is valid, or an error object if invalid
     */
    private validateJson;
    /**
     * Checks if a form field is invalid
     *
     * This method is used to determine if a specific form field has validation errors
     * and has been touched or modified by the user. It's used to conditionally display
     * validation error messages in the UI.
     *
     * @param formName - The name of the form group (e.g., 'generalForm', 'positionForm')
     * @param fieldName - The name of the field within the form group to check
     * @returns true if the field is invalid and has been touched or modified, false otherwise
     */
    isFieldInvalid(formName: string, fieldName: string): boolean;
    /**
     * Formats the JSON in the advanced configuration tab
     *
     * This method attempts to parse the JSON string in the advanced editor,
     * then reformats it with proper indentation for better readability.
     * If the JSON is invalid, it sets the isJsonInvalid flag to true,
     * which can be used to display validation errors in the UI.
     *
     * This is typically triggered by a "Format JSON" button in the advanced tab.
     */
    formatJson(): void;
    /**
     * Checks if all forms are valid
     */
    isFormValid(): boolean;
    /**
     * Handles tab change
     */
    onActiveTabItemChange(event: MenuItem): void;
    /**
     * Resets the form to the original widget state
     */
    onReset(): void;
    /**
     * Cancels editing and emits cancel event
     */
    handleCancel(): void;
    /**
     * Saves the widget configuration
     *
     * This method collects values from all form groups, validates them, and creates
     * an updated widget configuration. It handles different widget types (charts, filters, etc.)
     * and applies appropriate transformations for each type.
     *
     * If the advanced JSON editor was used, it also merges those changes with the form values.
     *
     * On success, it emits the updated widget through the onUpdate EventEmitter.
     * On failure, it displays an error message.
     */
    onWidgetSave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetConfigComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WidgetConfigComponent, "vis-widget-config", never, { "selectedDashboardId": { "alias": "selectedDashboardId"; "required": false; }; "widget": { "alias": "widget"; "required": false; }; }, { "onUpdate": "onUpdate"; "onCancel": "onCancel"; }, never, never, true, never>;
}

/**
 * Base component for all widget types
 *
 * This component provides common functionality for all widget types,
 * reducing code duplication and improving maintainability.
 */
declare abstract class BaseWidgetComponent implements OnInit, OnDestroy {
    protected eventBus: EventBusService;
    /** The widget configuration */
    widget: IWidget;
    /** Event emitted when data needs to be loaded for the widget */
    onDataLoad: EventEmitter<IWidget>;
    /** Event emitted when filter values are updated */
    onUpdateFilter: EventEmitter<any>;
    /** Subject for handling component destruction */
    protected destroy$: Subject<void>;
    /** Loading state of the widget */
    protected loading: boolean;
    /** Error state of the widget */
    protected error: any;
    constructor(eventBus: EventBusService);
    /**
     * Initializes the component
     */
    ngOnInit(): void;
    /**
     * Cleans up resources when the component is destroyed
     */
    ngOnDestroy(): void;
    /**
     * Subscribes to relevant events from the event bus
     */
    protected subscribeToEvents(): void;
    /**
     * Loads data for the widget
     */
    protected loadData(): void;
    /**
     * Handles errors that occur during data loading
     *
     * @param error - The error that occurred
     */
    protected handleError(error: any): void;
    /**
     * Called when the widget is updated
     * Override in derived classes to handle widget updates
     */
    protected onWidgetUpdated(): void;
    /**
     * Called when filters are updated
     * Override in derived classes to handle filter updates
     *
     * @param filterData - The updated filter data
     */
    protected onFilterUpdated(filterData: any): void;
    /**
     * Updates a filter value
     *
     * @param value - The new filter value
     */
    protected updateFilter(value: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<BaseWidgetComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<BaseWidgetComponent, "ng-component", never, { "widget": { "alias": "widget"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

declare const formOptions: {
    type: string;
    fieldGroup: ({
        props: {
            label: string;
        };
        fieldGroup: {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                required: boolean;
                attributes: {
                    style: string;
                };
            };
        }[];
    } | {
        props: {
            label: string;
        };
        fieldGroup: ({
            key: string;
            type: string;
            templateOptions: {
                label: string;
                options: {
                    label: string;
                    value: string;
                }[];
                attributes: {
                    style: string;
                    appendTo: string;
                };
            };
            fieldGroup?: undefined;
            fieldArray?: undefined;
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                options?: undefined;
                attributes?: undefined;
            };
            fieldGroup: ({
                key: string;
                type: string;
                templateOptions: {
                    type: string;
                    label: string;
                    placeholder: string;
                    attributes: {
                        style: string;
                    };
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    attributes: {
                        style: string;
                    };
                    type?: undefined;
                    placeholder?: undefined;
                };
            })[];
            fieldArray?: undefined;
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                options?: undefined;
                attributes?: undefined;
            };
            fieldGroup: {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                };
                fieldGroup: ({
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder: string;
                        options: {
                            label: string;
                            value: string;
                        }[];
                        attributes: {
                            style: string;
                        };
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder: string;
                        attributes: {
                            style: string;
                        };
                        options?: undefined;
                    };
                })[];
            }[];
            fieldArray?: undefined;
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                options?: undefined;
                attributes?: undefined;
            };
            fieldArray: {
                fieldGroup: ({
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder: string;
                        options: {
                            label: string;
                            value: string;
                        }[];
                        attributes: {
                            style: string;
                        };
                    };
                    fieldGroup?: undefined;
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder: string;
                        attributes: {
                            style: string;
                        };
                        options?: undefined;
                    };
                    fieldGroup?: undefined;
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder?: undefined;
                        options?: undefined;
                        attributes?: undefined;
                    };
                    fieldGroup: {
                        key: string;
                        type: string;
                        templateOptions: {
                            label: string;
                            placeholder: string;
                            attributes: {
                                style: string;
                            };
                        };
                    }[];
                })[];
            };
            fieldGroup?: undefined;
        })[];
    } | {
        props: {
            label: string;
        };
        fieldGroup: {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                required: boolean;
                rows: number;
                attributes: {
                    style: string;
                };
            };
        }[];
    })[];
}[];

declare const dataOptions: {
    key: string;
    type: string;
    templateOptions: {
        label: string;
    };
    fieldArray: {
        fieldGroup: ({
            key: string;
            type: string;
            templateOptions: {
                label: string;
                placeholder: string;
                options: {
                    label: string;
                    value: string;
                }[];
                attributes: {
                    style: string;
                };
            };
            fieldGroup?: undefined;
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                placeholder: string;
                attributes: {
                    style: string;
                };
                options?: undefined;
            };
            fieldGroup?: undefined;
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                options: {
                    label: string;
                    value: boolean;
                }[];
                attributes: {
                    style: string;
                };
                placeholder?: undefined;
            };
            fieldGroup?: undefined;
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                options: {
                    label: string;
                    value: string;
                }[];
                attributes: {
                    style: string;
                };
                placeholder?: undefined;
            };
            fieldGroup?: undefined;
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                placeholder?: undefined;
                options?: undefined;
                attributes?: undefined;
            };
            fieldGroup: ({
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    placeHhlder: string;
                    attributes: {
                        style: string;
                    };
                    placeholder?: undefined;
                    placeHolder?: undefined;
                    options?: undefined;
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    placeholder: string;
                    attributes: {
                        style: string;
                    };
                    placeHhlder?: undefined;
                    placeHolder?: undefined;
                    options?: undefined;
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    placeHolder: string;
                    attributes: {
                        style: string;
                    };
                    placeHhlder?: undefined;
                    placeholder?: undefined;
                    options?: undefined;
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options: {
                        label: string;
                        value: string;
                    }[];
                    attributes: {
                        style: string;
                    };
                    placeHhlder?: undefined;
                    placeholder?: undefined;
                    placeHolder?: undefined;
                };
            })[];
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                placeholder?: undefined;
                options?: undefined;
                attributes?: undefined;
            };
            fieldGroup: ({
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options: {
                        label: string;
                        value: boolean;
                    }[];
                    attributes: {
                        style: string;
                    };
                    placeholder?: undefined;
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    placeholder: string;
                    attributes: {
                        style: string;
                    };
                    options?: undefined;
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options: {
                        label: string;
                        value: string;
                    }[];
                    attributes: {
                        style: string;
                    };
                    placeholder?: undefined;
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    attributes: {
                        style: string;
                    };
                    options?: undefined;
                    placeholder?: undefined;
                };
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    placeholder: string;
                    options: {
                        label: string;
                        value: string;
                    }[];
                    attributes: {
                        style: string;
                    };
                };
            })[];
        } | {
            key: string;
            type: string;
            templateOptions: {
                label: string;
                placeholder?: undefined;
                options?: undefined;
                attributes?: undefined;
            };
            fieldGroup: ({
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options: {
                        label: string;
                        value: boolean;
                    }[];
                    attributes: {
                        style: string;
                    };
                };
                fieldGroup?: undefined;
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options: {
                        label: string;
                        value: string;
                    }[];
                    attributes: {
                        style: string;
                    };
                };
                fieldGroup?: undefined;
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options?: undefined;
                    attributes?: undefined;
                };
                fieldGroup: ({
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        options: {
                            label: string;
                            value: boolean;
                        }[];
                        attributes: {
                            style: string;
                        };
                        placeholder?: undefined;
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder: string;
                        attributes: {
                            style: string;
                        };
                        options?: undefined;
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        options: {
                            label: string;
                            value: string;
                        }[];
                        attributes: {
                            style: string;
                        };
                        placeholder?: undefined;
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        attributes: {
                            style: string;
                        };
                        options?: undefined;
                        placeholder?: undefined;
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder: string;
                        options: {
                            label: string;
                            value: string;
                        }[];
                        attributes: {
                            style: string;
                        };
                    };
                })[];
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options?: undefined;
                    attributes?: undefined;
                };
                fieldGroup: ({
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        options: {
                            label: string;
                            value: boolean;
                        }[];
                        attributes: {
                            style: string;
                        };
                    };
                    fieldGroup?: undefined;
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        options?: undefined;
                        attributes?: undefined;
                    };
                    fieldGroup: ({
                        key: string;
                        type: string;
                        templateOptions: {
                            label: string;
                            placeholder: string;
                            attributes: {
                                style: string;
                            };
                            options?: undefined;
                        };
                    } | {
                        key: string;
                        type: string;
                        templateOptions: {
                            label: string;
                            options: {
                                label: string;
                                value: string;
                            }[];
                            attributes: {
                                style: string;
                            };
                            placeholder?: undefined;
                        };
                    })[];
                })[];
            } | {
                key: string;
                type: string;
                templateOptions: {
                    label: string;
                    options?: undefined;
                    attributes?: undefined;
                };
                fieldGroup: ({
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeHhlder: string;
                        attributes: {
                            style: string;
                        };
                        placeholder?: undefined;
                        placeHolder?: undefined;
                        options?: undefined;
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeholder: string;
                        attributes: {
                            style: string;
                        };
                        placeHhlder?: undefined;
                        placeHolder?: undefined;
                        options?: undefined;
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        placeHolder: string;
                        attributes: {
                            style: string;
                        };
                        placeHhlder?: undefined;
                        placeholder?: undefined;
                        options?: undefined;
                    };
                } | {
                    key: string;
                    type: string;
                    templateOptions: {
                        label: string;
                        options: {
                            label: string;
                            value: string;
                        }[];
                        attributes: {
                            style: string;
                        };
                        placeHhlder?: undefined;
                        placeholder?: undefined;
                        placeHolder?: undefined;
                    };
                })[];
            })[];
        })[];
    };
}[];

declare class EchartComponent extends BaseWidgetComponent implements AfterViewInit, OnDestroy {
    protected eventBus: EventBusService;
    private elementRef;
    isSingleClick: boolean;
    private resizeSubject;
    private resizeObserver;
    initOpts: any;
    constructor(eventBus: EventBusService, elementRef: ElementRef);
    /**
     * Gets the chart options with dataset API if available
     */
    get chartOptions(): echarts.EChartsOption;
    /**
     * Converts standard ECharts options to use the dataset API for better performance
     *
     * @param options - The ECharts options to convert
     */
    private convertToDatasetAPI;
    /**
     * Converts pie chart data to use the dataset API
     *
     * @param options - The ECharts options to convert
     * @param seriesArray - The array of series
     */
    private convertPieChartToDataset;
    /**
     * Converts heatmap chart data to use the dataset API
     *
     * @param options - The ECharts options to convert
     * @param seriesArray - The array of series
     */
    private convertHeatmapToDataset;
    /**
     * Converts gauge chart data to use the dataset API
     *
     * @param options - The ECharts options to convert
     * @param seriesArray - The array of series
     */
    private convertGaugeToDataset;
    private convertMultiSeriesToDataset;
    /**
     * Lifecycle hook that is called after the component's view has been initialized
     */
    ngAfterViewInit(): void;
    /**
     * Lifecycle hook that is called when the component is destroyed
     */
    ngOnDestroy(): void;
    /**
     * Sets up resize handling for the chart
     */
    private setupResizeHandling;
    /**
     * Resizes the chart to fit its container
     * Uses requestAnimationFrame for better performance
     */
    private resizeChart;
    /**
     * Initializes the chart instance
     *
     * @param instance - The ECharts instance
     */
    onChartInit(instance: any): void;
    /**
     * Handles double-click events on the chart
     *
     * @param e - The double-click event
     */
    onChartDblClick(e: any): void;
    /**
     * Handles click events on the chart
     *
     * @param e - The click event
     */
    onClick(e: any): void;
    /**
     * Called when the widget is updated
     * Reloads data if necessary
     */
    protected onWidgetUpdated(): void;
    /**
     * Called when filters are updated
     * Reloads data if the widget supports filtering
     *
     * @param filterData - The updated filter data
     */
    protected onFilterUpdated(filterData: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EchartComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EchartComponent, "vis-echart", never, {}, {}, never, never, true, never>;
}

/**
 * Component for displaying and managing filter values
 */
declare class FilterComponent implements OnInit {
    /** The widget configuration */
    widget: IWidget;
    /** Event emitter for filter updates */
    onUpdateFilter: EventEmitter<any>;
    /** Internal storage for filter values to prevent infinite loops */
    private _filterValues;
    /**
     * Initializes the component
     */
    ngOnInit(): void;
    /**
     * Gets the current filter values
     * @returns Array of filter values
     */
    get filterValues(): IFilterValues[];
    /**
     * Sets the filter values and updates the widget configuration
     * @param values - The new filter values
     */
    set filterValues(values: IFilterValues[]);
    /**
     * Clears all filter values
     *
     * @param item - The item that triggered the clear action
     */
    clearAllFilters(item: any): void;
    /**
     * Clears a specific filter value
     *
     * @param item - The filter value to clear
     */
    clearFilter(item: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FilterComponent, "vis-filters", never, { "widget": { "alias": "widget"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

declare class TableComponent {
    widget: IWidget;
    static ɵfac: i0.ɵɵFactoryDeclaration<TableComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TableComponent, "vis-table", never, { "widget": { "alias": "widget"; "required": false; }; }, {}, never, never, true, never>;
}

declare class TileComponent {
    widget: IWidget;
    static ɵfac: i0.ɵɵFactoryDeclaration<TileComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TileComponent, "vis-tile", never, { "widget": { "alias": "widget"; "required": false; }; }, {}, never, never, true, never>;
}

declare class MarkdownCellComponent {
    widget: IWidget;
    static ɵfac: i0.ɵɵFactoryDeclaration<MarkdownCellComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MarkdownCellComponent, "vis-markdown-cell", never, { "widget": { "alias": "widget"; "required": false; }; }, {}, never, never, true, never>;
}

declare class CodeCellComponent {
    widget: IWidget;
    static ɵfac: i0.ɵɵFactoryDeclaration<CodeCellComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CodeCellComponent, "vis-code-cell", never, { "widget": { "alias": "widget"; "required": false; }; }, {}, never, never, true, never>;
}

export { BaseWidgetComponent, CalculationService, CodeCellComponent, DashboardContainerComponent, EchartComponent, EventBusService, EventType, FilterComponent, FilterService, MarkdownCellComponent, TableComponent, TileComponent, WidgetBuilder, WidgetConfigComponent, WidgetHeaderComponent, WidgetPluginService, dataOptions, formOptions };
export type { Event, ICodeCellOptions, IFilterOptions, IFilterValues, IMarkdownCellOptions, IState, ITableOptions, ITileOptions, IWidget, IWidgetPlugin };

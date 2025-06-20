import * as i0 from '@angular/core';
import { OnInit, OnDestroy, AfterViewInit, EventEmitter, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Interface for Superset dashboard options
 */
interface ISupersetOptions {
    /** The URL of the Superset dashboard */
    dashboardUrl: string;
    /** The guest token for authentication */
    guestToken?: string;
    /** The dashboard ID */
    dashboardId: string;
    /** Additional configuration options */
    config?: {
        /** Whether to show the dashboard header */
        showHeader?: boolean;
        /** Whether to show the dashboard footer */
        showFooter?: boolean;
        /** Custom CSS classes to apply */
        cssClasses?: string[];
        /** Custom height for the dashboard */
        height?: string;
        /** Custom width for the dashboard */
        width?: string;
    };
}

interface IWidget {
    id?: string;
    position: any;
    config: {
        component?: string;
        header?: {
            title: string;
            options?: string[];
        };
        options: any;
    };
    loading?: boolean;
    error?: any;
}
declare class EventBusService {
    onWidgetUpdate(): any;
    onFilterUpdate(): any;
    publishError(error: any, source?: string): void;
}
/**
 * Component for displaying Superset dashboards
 */
declare class SupersetComponent implements OnInit, OnDestroy, AfterViewInit {
    private elementRef;
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
    /** Event bus service */
    protected eventBus: EventBusService;
    /** Reference to the container element */
    private container;
    /** The embedded dashboard instance */
    private embeddedDashboard;
    constructor(elementRef: ElementRef);
    /**
     * Initialize the component
     */
    ngOnInit(): void;
    /**
     * After view initialization, get the container element and initialize the dashboard
     */
    ngAfterViewInit(): void;
    /**
     * Clean up resources when the component is destroyed
     */
    ngOnDestroy(): void;
    /**
     * Subscribes to relevant events from the event bus
     */
    protected subscribeToEvents(): void;
    /**
     * Handles errors that occur during data loading
     *
     * @param error - The error that occurred
     */
    protected handleError(error: any): void;
    /**
     * Called when filters are updated
     * Override in derived classes to handle filter updates
     *
     * @param filterData - The updated filter data
     */
    protected onFilterUpdated(filterData: any): void;
    /**
     * Initialize the Superset dashboard
     */
    private initializeDashboard;
    /**
     * Called when the widget is updated
     */
    protected onWidgetUpdated(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<SupersetComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<SupersetComponent, "vis-superset", never, { "widget": { "alias": "widget"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

export { EventBusService, SupersetComponent };
export type { ISupersetOptions, IWidget };

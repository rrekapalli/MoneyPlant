import * as i0 from '@angular/core';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { embedDashboard } from '@superset-ui/embedded-sdk';

// Define a simplified EventBusService
class EventBusService {
    onWidgetUpdate() {
        return new Subject().asObservable();
    }
    onFilterUpdate() {
        return new Subject().asObservable();
    }
    publishError(error, source) {
        console.error(`Error in widget ${source}:`, error);
    }
}
/**
 * Component for displaying Superset dashboards
 */
class SupersetComponent {
    constructor(elementRef) {
        this.elementRef = elementRef;
        /** Subject for handling component destruction */
        this.destroy$ = new Subject();
        /** Loading state of the widget */
        this.loading = false;
        /** Error state of the widget */
        this.error = null;
        /** Reference to the container element */
        this.container = null;
        /** The embedded dashboard instance */
        this.embeddedDashboard = null;
        this.eventBus = new EventBusService();
    }
    /**
     * Initialize the component
     */
    ngOnInit() {
        // Subscribe to relevant events
        this.subscribeToEvents();
    }
    /**
     * After view initialization, get the container element and initialize the dashboard
     */
    ngAfterViewInit() {
        this.container = this.elementRef.nativeElement.querySelector('.superset-container');
        this.initializeDashboard();
    }
    /**
     * Clean up resources when the component is destroyed
     */
    ngOnDestroy() {
        // Clean up the embedded dashboard if it exists
        if (this.embeddedDashboard) {
            // The SDK might provide a destroy method in the future
            this.embeddedDashboard = null;
        }
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
            .subscribe((updatedWidget) => {
            if (updatedWidget.id === this.widget.id) {
                this.widget = updatedWidget;
                this.onWidgetUpdated();
            }
        });
        // Subscribe to filter update events
        this.eventBus.onFilterUpdate()
            .pipe(takeUntil(this.destroy$))
            .subscribe((filterData) => {
            this.onFilterUpdated(filterData);
        });
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
     * Called when filters are updated
     * Override in derived classes to handle filter updates
     *
     * @param filterData - The updated filter data
     */
    onFilterUpdated(filterData) {
        // No-op by default
    }
    /**
     * Initialize the Superset dashboard
     */
    initializeDashboard() {
        if (!this.container) {
            console.error('Superset container element not found');
            return;
        }
        const options = this.widget.config.options;
        if (!options.dashboardUrl || !options.dashboardId) {
            console.error('Missing required Superset options: dashboardUrl or dashboardId');
            return;
        }
        this.loading = true;
        try {
            // Embed the dashboard using the Superset SDK
            embedDashboard({
                id: options.dashboardId,
                supersetDomain: options.dashboardUrl,
                mountPoint: this.container,
                fetchGuestToken: () => {
                    // If a guest token is provided, use it
                    if (options.guestToken) {
                        return Promise.resolve(options.guestToken);
                    }
                    // Otherwise, you would typically fetch it from your backend
                    // For now, we'll just return an error
                    return Promise.reject('No guest token provided');
                },
                dashboardUiConfig: {
                    hideTitle: options.config?.showHeader === false,
                    hideChartControls: true,
                    hideTab: false,
                }
            })
                .then(dashboard => {
                this.embeddedDashboard = dashboard;
                this.loading = false;
            })
                .catch(error => {
                this.handleError(error);
            });
        }
        catch (error) {
            this.handleError(error);
        }
    }
    /**
     * Called when the widget is updated
     */
    onWidgetUpdated() {
        // Reinitialize the dashboard if the widget is updated
        this.initializeDashboard();
    }
    static { this.ɵfac = function SupersetComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SupersetComponent)(i0.ɵɵdirectiveInject(i0.ElementRef)); }; }
    static { this.ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SupersetComponent, selectors: [["vis-superset"]], inputs: { widget: "widget", onDataLoad: "onDataLoad", onUpdateFilter: "onUpdateFilter" }, decls: 2, vars: 0, consts: [["supersetContainer", ""], [1, "superset-container"]], template: function SupersetComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelement(0, "div", 1, 0);
        } }, dependencies: [CommonModule], styles: [".superset-container[_ngcontent-%COMP%]{width:100%;height:100%;overflow:auto}"], changeDetection: 0 }); }
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SupersetComponent, [{
        type: Component,
        args: [{ selector: 'vis-superset', standalone: true, template: `<div class="superset-container" #supersetContainer></div>`, imports: [CommonModule], changeDetection: ChangeDetectionStrategy.OnPush, styles: [".superset-container{width:100%;height:100%;overflow:auto}\n"] }]
    }], () => [{ type: i0.ElementRef }], { widget: [{
            type: Input
        }], onDataLoad: [{
            type: Input
        }], onUpdateFilter: [{
            type: Input
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SupersetComponent, { className: "SupersetComponent", filePath: "lib/widgets/superset/superset.component.ts", lineNumber: 56 }); })();

/*
 * Public API Surface of superset-integration
 */
// Entities

/**
 * Generated bundle index. Do not edit.
 */

export { EventBusService, SupersetComponent };
//# sourceMappingURL=superset-integration.mjs.map

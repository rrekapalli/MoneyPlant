import { EChartsOption, ECharts } from 'echarts';
import { GridsterItem, GridsterConfig, GridsterItemComponentInterface } from 'angular-gridster2';
import * as i0 from '@angular/core';
import { EventEmitter, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { ECharts as ECharts$1 } from 'echarts/core';

interface IState {
    accessor: string;
    column: string;
    isOdataQuery: boolean;
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
 * Interface representing a widget in the dashboard
 */
interface IWidget {
    /** Unique identifier for the widget */
    id?: string;
    /** Position and size configuration for the gridster layout */
    position: GridsterItem;
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
        /** Widget-specific options based on the component type */
        options: EChartsOption | IFilterOptions | ITileOptions | IMarkdownCellOptions | ICodeCellOptions | ITableOptions;
        /** Event handlers */
        events?: {
            /** Callback function when chart options change
             * @param widget - The current widget instance
             * @param chart - Optional ECharts instance
             * @param filters - Optional filter values
             */
            onChartOptions?: (widget: IWidget, chart?: ECharts, filters?: string | IFilterValues[]) => void;
        };
    };
    /** Data series for the widget */
    series?: [{}];
    /** Reference to the ECharts instance if applicable */
    chartInstance?: ECharts | null;
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
 * A container component for dashboard widgets.
 *
 * This component provides a grid-based layout for dashboard widgets using angular-gridster2.
 * It handles widget positioning, resizing, data loading, and filtering.
 */
declare class DashboardContainerComponent {
    /** Array of widgets to display in the dashboard */
    widgets: IWidget[];
    /** Current filter values applied to the dashboard */
    filterValues: IFilterValues[];
    /** Current chart height in pixels */
    chartHeight: number;
    /** Default chart height in pixels */
    readonly defaultChartHeight: number;
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

declare class WidgetConfigComponent {
    sidebarVisible: boolean;
    private _widget;
    onUpdate: EventEmitter<IWidget>;
    selectedDashboardId: any;
    set widget(value: IWidget | undefined);
    formModel: any;
    items: MenuItem[];
    get title(): string | undefined;
    activeItem: MenuItem;
    formWidgetOptions: FormGroup<{}>;
    form: FormGroup<{}>;
    formSeriesOptions: FormGroup<{}>;
    ngOnInit(): void;
    onActiveTabItemChange(event: MenuItem): void;
    onWidgetSave(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<WidgetConfigComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<WidgetConfigComponent, "vis-widget-config", never, { "selectedDashboardId": { "alias": "selectedDashboardId"; "required": false; }; "widget": { "alias": "widget"; "required": false; }; }, { "onUpdate": "onUpdate"; }, never, never, true, never>;
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

declare class EchartComponent {
    widget: IWidget;
    onDataLoad: EventEmitter<IWidget>;
    onUpdateFilter: EventEmitter<any>;
    isSingleClick: boolean;
    initOpts: any;
    get chartOptions(): EChartsOption;
    onChartInit(instance: ECharts$1): void;
    onChartDblClick(e: any): void;
    onClick(e: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EchartComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EchartComponent, "vis-echart", never, { "widget": { "alias": "widget"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
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

export { DashboardContainerComponent, EchartComponent, FilterComponent, MarkdownCellComponent, TableComponent, TileComponent, WidgetBuilder, WidgetConfigComponent, WidgetHeaderComponent, dataOptions, formOptions };
export type { ICodeCellOptions, IFilterOptions, IFilterValues, IMarkdownCellOptions, IState, ITableOptions, ITileOptions, IWidget };

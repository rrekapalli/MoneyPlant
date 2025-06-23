import { EChartsOption, ECharts } from 'echarts';
import { GridsterItem, GridsterConfig, GridsterItemComponentInterface } from 'angular-gridster2';
import * as i0 from '@angular/core';
import { EventEmitter } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MenuItem } from 'primeng/api';

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
    accessor?: string;
    value: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: string;
    color: string;
    description: string;
}

interface IMarkdownCellOptions {
    accessor?: string;
    content: string;
}

interface ICodeCellOptions {
    accessor: string;
}

interface ITableOptions {
    accessor?: string;
    columns: string[];
    data: any[];
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

declare class DashboardContainerComponent {
    widgets: IWidget[];
    filterValues: IFilterValues[];
    container: typeof DashboardContainerComponent;
    chartHeight: number;
    readonly defaultChartHeight: number;
    containerTouchChanged: EventEmitter<any>;
    editModeStringChange: EventEmitter<string>;
    changesMade: EventEmitter<string>;
    availableDashboards: any[];
    dashboardId: any;
    initialWidgetData: any;
    isEditMode: boolean;
    onShowConfirmation: any;
    onShowNewDashboardDialog: boolean;
    static containerTouched: any;
    static editModeString: string;
    newDashboardForm: FormGroup;
    options: GridsterConfig;
    ngOnInit(): void;
    onDataLoad(widget: IWidget): Promise<void>;
    getFilterParams(): string;
    onUpdateWidget(widget: IWidget): void;
    static onWidgetResize(item: GridsterItem, itemComponent: GridsterItemComponentInterface): void;
    static onWidgetChange(item: GridsterItem, itemComponent: GridsterItemComponentInterface): void;
    updateString(editModeString: any): void;
    getEditModeString(editModeString: any): string;
    onUpdateFilter($event: any): void;
    onDashboardSelectionChanged($event: any): void;
    onDeleteWidget(widget: IWidget): void;
    calculateChartHeight(cols: number, rows: number, flag?: boolean, baseHeight?: number): number;
    calculateMapCenter(cols: number, rows: number): number[];
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
    onChartInit(instance: any): void;
    onChartDblClick(e: any): void;
    onClick(e: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<EchartComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<EchartComponent, "vis-echart", never, { "widget": { "alias": "widget"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

declare class FilterComponent {
    widget: IWidget;
    onUpdateFilter: EventEmitter<any>;
    onDataLoad: EventEmitter<any>;
    get filterValues(): IFilterValues[];
    set filterValues(values: IFilterValues[]);
    clearAllFilters(item: any): void;
    clearFilter(item: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FilterComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FilterComponent, "vis-filters", never, { "widget": { "alias": "widget"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; }, {}, never, never, true, never>;
}

declare class TableComponent {
    widget: IWidget;
    onDataLoad: EventEmitter<any>;
    onUpdateFilter: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TableComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TableComponent, "vis-table", never, { "widget": { "alias": "widget"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

declare class TileComponent {
    widget: IWidget;
    onDataLoad: EventEmitter<any>;
    onUpdateFilter: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TileComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<TileComponent, "vis-tile", never, { "widget": { "alias": "widget"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

declare class MarkdownCellComponent {
    widget: IWidget;
    onDataLoad: EventEmitter<any>;
    onUpdateFilter: EventEmitter<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<MarkdownCellComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<MarkdownCellComponent, "vis-markdown-cell", never, { "widget": { "alias": "widget"; "required": false; }; "onDataLoad": { "alias": "onDataLoad"; "required": false; }; "onUpdateFilter": { "alias": "onUpdateFilter"; "required": false; }; }, {}, never, never, true, never>;
}

export { DashboardContainerComponent, EchartComponent, FilterComponent, MarkdownCellComponent, TableComponent, TileComponent, WidgetBuilder, WidgetConfigComponent, WidgetHeaderComponent, dataOptions, formOptions };
export type { ICodeCellOptions, IFilterOptions, IFilterValues, IMarkdownCellOptions, IState, ITableOptions, ITileOptions, IWidget };

import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Subscription } from 'rxjs';

// Import echarts core module and components
import * as echarts from 'echarts/core';
// Import bar, line, pie, and other chart components
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart
} from 'echarts/charts';
// Import tooltip, title, legend, and other components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent
} from 'echarts/components';
// Import renderer
import {
  CanvasRenderer
} from 'echarts/renderers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent,
  VisualMapComponent,
  PolarComponent,
  DataZoomComponent,
  BrushComponent,
  ToolboxComponent,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  GaugeChart,
  HeatmapChart,
  MapChart,
  TreemapChart,
  SunburstChart,
  SankeyChart,
  CandlestickChart,
  CanvasRenderer
]);

// Register built-in maps and custom maps
import { DensityMapBuilder } from '@dashboards/public-api';

// Register the world map with ECharts
// We'll use a dynamic import to load the world map data
import('echarts-map-collection/custom/world.json').then((worldMapData) => {
  DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
}).catch((error) => {
  // Handle world map loading error silently
});

// Import dashboard modules and chart builders
import { 
  IWidget,
  DashboardContainerComponent,
  DashboardHeaderComponent,
  // Fluent API
  StandardDashboardBuilder,
  ExcelExportService,
  FilterService,
  // Enhanced Chart Builders
  ApacheEchartBuilder,
  PieChartBuilder,
  AreaChartBuilder,
  TreemapChartBuilder,
  SankeyChartBuilder,
  // Other builders and utilities
  BarChartBuilder,
  HorizontalBarChartBuilder,
  ScatterChartBuilder,
  GaugeChartBuilder,
  HeatmapChartBuilder,
  PolarChartBuilder,
  CandlestickChartBuilder,
  SunburstChartBuilder,
  // Stock List Chart Builder
  StockListChartBuilder,
  StockListData,
  // Filter enum
  FilterBy,
  // Tile Builder for updating tiles
  TileBuilder,
  StockTileBuilder
} from '@dashboards/public-api';

// Import only essential widget creation functions and data
import {
  createFilterWidget,
  updateFilterData,
  addFilter as addFilterToWidget,
  removeFilter as removeFilterFromWidget,
  clearAllFilters as clearAllFiltersFromWidget,
  // Dashboard data
  INITIAL_DASHBOARD_DATA
} from './widgets';
import { createMetricTiles as createMetricTilesFunction } from './widgets/metric-tiles';

// Import base dashboard component
import { BaseDashboardComponent, IFilterValues } from '@dashboards/public-api';

// Import component communication service
import { ComponentCommunicationService, SelectedIndexData } from '../../../services/component-communication.service';

// Import stock ticks service and entities
import { StockTicksService } from '../../../services/apis/stock-ticks.api';
import {StockDataDto, StockTicksDto} from '../../../services/entities/stock-ticks';

// Import indices service and historical data entities
import { IndicesService } from '../../../services/apis/indices.api';
import { IndexHistoricalData } from '../../../services/entities/index-historical-data';

// Import NSE Indices service and entities


// Import modern Angular v20 WebSocket services and entities
import { ModernIndicesWebSocketService, IndexDataDto, IndicesDto } from '../../../services/websockets';

/**
 * Filter criteria interface for centralized filtering system
 */
interface FilterCriteria {
  type: 'industry' | 'sector' | 'symbol' | 'custom' | 'macro';
  field: string; // The field name in StockDataDto to filter on
  value: string | number; // The value to filter by
  operator?: 'equals' | 'contains' | 'greaterThan' | 'lessThan'; // Comparison operator
  source?: string; // Which widget/chart applied this filter (for tracking)
}

// Define the specific data structure for this dashboard
export interface DashboardDataRow {
  id: string;
  assetCategory: string;
  month: string;
  market: string;
  totalValue: number;
  riskValue?: number;
  returnValue?: number;
  description?: string;
}

@Component({
  selector: 'app-overall',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule,
    MessageModule,
    ScrollPanelModule,
    // Dashboard components
    DashboardContainerComponent,
    DashboardHeaderComponent
  ],
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Financial Dashboard with centralized filtering system for consistent
 * filtering behavior across all widgets and charts.
 */
export class OverallComponent extends BaseDashboardComponent<StockDataDto> {
  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: StockDataDto[] = [];
  protected readonly initialDashboardData: StockDataDto[] = [];






  // Filtered stock data for cross-chart filtering
  protected filteredDashboardData: StockDataDto[] | null = this.dashboardData || [];

  // Central applied filters array for cumulative filtering
  protected appliedFilters: FilterCriteria[] = [];
  
  // Dashboard title - dynamic based on selected index
  public dashboardTitle: string = 'Financial Dashboard';
  
  // Subscription management
  private selectedIndexSubscription: Subscription | null = null;
  
  // Chart update control to prevent rapid reinitialization
  private chartUpdateTimer: any = null;
  private indicesWebSocketSubscription: Subscription | null = null;
  private webSocketConnectionStateSubscription: Subscription | null = null;
  
  // Current selected index data from WebSocket
  private currentSelectedIndexData: IndexDataDto | null = null;
  
  // Historical data for candlestick chart
  private historicalData: IndexHistoricalData[] = [];

  // WebSocket connection state tracking
  private isWebSocketConnected: boolean = false;
  private currentSubscribedIndex: string | null = null;



  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService,
    private componentCommunicationService: ComponentCommunicationService,
    private stockTicksService: StockTicksService,
    private indicesService: IndicesService,
    private modernIndicesWebSocketService: ModernIndicesWebSocketService,

  ) {
    super(cdr, excelExportService, filterService);
  }

  override ngOnInit(): void {
    super.ngOnInit?.();
  }

  protected onChildInit(): void {
    // Register world map for density map charts
    import('echarts-map-collection/custom/world.json').then((worldMapData) => {
      DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
    }).catch(() => {
      // Handle world map loading error silently
    });

    // Initialize WebSocket connection and monitor connection state
    this.initializeWebSocket();
    this.monitorWebSocketConnectionState();

    // Clear any existing subscription
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }

    // Reset filters and title
    this.appliedFilters = [];
    this.dashboardTitle = 'Financial Dashboard';
    this.componentCommunicationService.clearSelectedIndex();

    // Subscribe to selected index changes
    this.selectedIndexSubscription = this.componentCommunicationService.getSelectedIndex().subscribe(selectedIndex => {
      if (selectedIndex) {
        this.updateDashboardWithSelectedIndex(selectedIndex);
      } else {
        this.loadDefaultNifty50Data();
      }
    });

    // Load default data if no index selected
    setTimeout(() => {
      const currentSelectedIndex = this.componentCommunicationService.getSelectedIndex();
      if (!currentSelectedIndex) {
        this.loadDefaultNifty50Data();
      }
    }, 100);
  }

  protected onChildDestroy(): void {
    // Clean up chart update timer
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
      this.chartUpdateTimer = null;
    }
    
    // Unsubscribe from selected index subscription to prevent memory leaks
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }
    
    // Unsubscribe from WebSocket subscription
    if (this.indicesWebSocketSubscription) {
      this.indicesWebSocketSubscription.unsubscribe();
      this.indicesWebSocketSubscription = null;
    }

    // Unsubscribe from WebSocket connection state monitoring
    if (this.webSocketConnectionStateSubscription) {
      this.webSocketConnectionStateSubscription.unsubscribe();
      this.webSocketConnectionStateSubscription = null;
    }
    
    // Disconnect modern WebSocket
    this.modernIndicesWebSocketService.disconnect();
    
    // Clear stock ticks data and reset filters
    this.dashboardData = [];
    this.filteredDashboardData = null;
    this.appliedFilters = [];
    this.currentSelectedIndexData = null;
    this.historicalData = [];
    
    // Reset WebSocket state
    this.isWebSocketConnected = false;
    this.currentSubscribedIndex = null;
  }

  private loadDefaultNifty50Data(): void {
    this.dashboardTitle = 'NIFTY 50 - Financial Dashboard';
    
    const defaultNifty50Data: SelectedIndexData = {
      id: 'NIFTY50',
      symbol: 'NIFTY 50',
      name: 'NIFTY 50',
      lastPrice: 0,
      variation: 0,
      percentChange: 0,
      keyCategory: 'Index'
    };
    
    this.updateDashboardWithSelectedIndex(defaultNifty50Data);
  }

  private loadStockTicksData(indexSymbol: string): void {
    if (indexSymbol && indexSymbol.trim()) {
      this.stockTicksService.getStockTicksByIndex(indexSymbol).subscribe({
        next: (stockTicksData: StockDataDto[]) => {
          this.dashboardData = stockTicksData || [];
          this.appliedFilters = [];
          this.filteredDashboardData = this.dashboardData;

          this.updateMetricTilesWithFilters([]);
          this.populateWidgetsWithInitialData();
          this.updateAllChartsWithFilteredData();
          this.cdr.detectChanges();
        },
        error: () => {
          this.dashboardData = [];
          this.filteredDashboardData = [];
          this.appliedFilters = [];
          
          this.updateMetricTilesWithFilters([]);
          this.updateAllChartsWithFilteredData();
          this.cdr.detectChanges();
        }
      });
    }
  }

  /**
   * Load historical data for the selected index
   * @param indexName The name of the index to load historical data for
   */
  private loadHistoricalData(indexName: string): void {
    if (indexName && indexName.trim()) {
      this.indicesService.getIndexHistoricalData(indexName).subscribe({
        next: (historicalData: IndexHistoricalData[]) => {
          this.historicalData = historicalData || [];
          this.updateCandlestickChartWithHistoricalData();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.warn('Failed to load historical data for', indexName, ':', error);
          this.historicalData = [];
          this.updateCandlestickChartWithHistoricalData();
          this.cdr.detectChanges();
        }
      });
    }
  }

  /**
   * Clear all widgets data to prevent stale data display
   */
  private clearAllWidgetsData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Find all echart widgets and clear their data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      // Clear widget data by setting empty data
      this.updateEchartWidget(widget, []);
    });
  }

  /**
   * Update dashboard data with selected index information
   * @param selectedIndex The selected index data object from indices component
   */
  private updateDashboardWithSelectedIndex(selectedIndex: SelectedIndexData): void {
    // Update dashboard title with selected index name or symbol
    this.dashboardTitle = selectedIndex.name || selectedIndex.symbol || 'Financial Dashboard';

    // Transform the selected index data to dashboard data format
    const dashboardDataRow = this.componentCommunicationService.transformToDashboardData(selectedIndex);
    
    // Add the new data to the existing dashboard data
    // First, remove any existing data for the same symbol to avoid duplicates
    this.dashboardData = this.dashboardData.filter(row => row.symbol !== dashboardDataRow.symbol);
    
    // Add the new data row
    this.dashboardData = [dashboardDataRow, ...this.dashboardData];
    
    // Set initial selected index data for immediate display
    this.currentSelectedIndexData = {
      indexName: selectedIndex.name || selectedIndex.symbol,
      indexSymbol: selectedIndex.symbol,
      lastPrice: selectedIndex.lastPrice || 0,
      variation: selectedIndex.variation || 0,
      percentChange: selectedIndex.percentChange || 0
    };
    
    // Fetch stock ticks data for the selected index
    // Extract symbol from selectedIndex object
    const indexSymbol = selectedIndex.symbol;
    this.loadStockTicksData(indexSymbol);
    
    // Load historical data for the selected index
    const indexName = selectedIndex.name || selectedIndex.symbol;
    if (indexName) {
      this.loadHistoricalData(indexName);
      
      // Subscribe to WebSocket updates for the selected index
      this.subscribeToIndexWebSocket(indexName).catch(error => {
        console.error('Failed to subscribe to WebSocket:', error);
      });
    }
    
    // Trigger change detection and update widgets
    this.populateWidgetsWithInitialData();
    this.cdr.detectChanges();
  }

  /**
   * Create metric tiles using stock ticks data and indices data
   * @param data - Dashboard data (not used, we use stockTicksData instead)
   */
  protected createMetricTiles(data: StockDataDto[]): IWidget[] {
    return createMetricTilesFunction(this.filteredDashboardData || this.dashboardData, this.currentSelectedIndexData);
  }

  /**
   * Override updateMetricTilesWithFilters to use filtered data
   */
  protected override updateMetricTilesWithFilters(filters: any[]): void {
    // Find all tile widgets (both regular tiles and stock tiles)
    const tileWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'tile' || widget.config?.component === 'stock-tile'
    );

    // Create new metric tiles with filtered data - use filteredDashboardData
    const updatedMetricTiles = this.createMetricTiles(this.filteredDashboardData || this.dashboardData);

    // Update each tile widget with new data
    tileWidgets.forEach((widget, index) => {
      if (index < updatedMetricTiles.length) {
        const updatedTile = updatedMetricTiles[index];
        
        // Check if this tile should update on data change
        const tileOptions = widget.config?.options as any;
        const shouldUpdate = tileOptions?.updateOnDataChange !== false;
        
        if (shouldUpdate) {
          // Extract tile data properties from the updated tile
          const tileOptions = updatedTile.config?.options as any;
          
          if (widget.config?.component === 'stock-tile') {
            // Handle stock tile updates
            const stockTileData = {
              value: tileOptions?.value || '',
              change: tileOptions?.change || '',
              changeType: tileOptions?.changeType || 'neutral',
              description: tileOptions?.description || '',
              icon: tileOptions?.icon || '',
              color: tileOptions?.color || '',
              backgroundColor: tileOptions?.backgroundColor || '',
              highValue: tileOptions?.highValue || '',
              lowValue: tileOptions?.lowValue || '',
              currency: tileOptions?.currency || '₹'
            };
            
            // Use StockTileBuilder to properly update the stock tile data
            StockTileBuilder.updateData(widget, stockTileData);
          } else {
            // Handle regular tile updates
            const tileData = {
              value: tileOptions?.value || '',
              change: tileOptions?.change || '',
              changeType: tileOptions?.changeType || 'neutral',
              description: tileOptions?.description || '',
              icon: tileOptions?.icon || '',
              color: tileOptions?.color || '',
              backgroundColor: tileOptions?.backgroundColor || '',
              title: tileOptions?.title || '',
              subtitle: tileOptions?.subtitle || tileOptions?.customData?.subtitle || ''
            };
            
            // Use TileBuilder to properly update the tile data
            TileBuilder.updateData(widget, tileData);
          }
        }
      }
    });
    
    // Trigger change detection to ensure tiles are refreshed
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 50);
  }

  protected initializeDashboardConfig(): void {
    // Stock Industry Horizontal Bar Chart
    const barStockIndustry = HorizontalBarChartBuilder.create()
        .setData(this.filteredDashboardData || []) // Start with current filtered data or empty array
        .setHeader('Industry')
        .setCurrencyFormatter('INR', 'en-US')
        .setPredefinedPalette('business')
        .setTooltip('item', (params: any) => {
          const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'INR'
          });
          return `${params.name}: ${formatter.format(params.value)}`;
        })
        .setAccessor('industry')
        .setFilterColumn('industry', FilterBy.Value)
        .setEvents((widget, chart) => {
          if (chart) {
            chart.off('click');
            chart.on('click', (params: any) => {
              params.event?.stop?.();
              const industryName = params.name || (params.data && params.data.name);
              if (industryName && typeof industryName === 'string' && isNaN(Number(industryName))) {
                this.filterChartsByIndustry(industryName);
              }
              return false;
            });
          }
        })
        .setId('industry-bar-chart')
        .setSkipDefaultFiltering(true)
        .build();
    
    // Stock Sector Allocation Pie Chart with financial display
    const pieStockSector = PieChartBuilder.create()
      .setData(this.filteredDashboardData) // Use filtered data for consistent filtering
      .setHeader('Sector Allocation')
      .setShowLegend(false)
      .setDonutStyle('40%', '70%')
      .setFinancialDisplay('INR', 'en-US')
      .setPredefinedPalette('finance')
      .setAccessor('sector')
      .setFilterColumn('sector', FilterBy.Value)
      .setEvents((widget, chart) => {
          if (chart) {
            chart.off('click');
            chart.on('click', (params: any) => {
              params.event?.stop?.();
              const sectorName = params.name || (params.data && params.data.name);
              if (sectorName && typeof sectorName === 'string' && isNaN(Number(sectorName))) {
                this.filterChartsBySector(sectorName);
              }
              return false;
            });
        }
      })
      .setId('sector-pie-chart')
      .setSkipDefaultFiltering(true)
      .build();

    // Stock Price Candlestick Chart - Now shows historical data
    const candlestickChart = CandlestickChartBuilder.create()
      .setData(this.filteredDashboardData || [])
      .setHeader('Index Historical Price Movement')
      .setCurrencyFormatter('INR', 'en-IN')
      .setPredefinedPalette('finance')
      .setAccessor('symbol')
      .setFilterColumn('symbol')
      .setXAxisName('Trading Date')
      .setYAxisName('Price (₹)')
      .enableDataZoom(70, 100)  // Show last 30% by default with zoom functionality
      .setBarWidth('60%')  // Set candlestick bar width for better visibility
      .enableBrush()  // Enable brush selection for technical analysis
      .setLargeMode(100)  // Enable large mode for datasets with 100+ points
      .setTooltipType('axis')  // Enable crosshair tooltip for better analysis
      .setEvents((widget, chart) => {
        if (chart) {
          chart.off('click');
          chart.on('click', (params: any) => {
            params.event?.stop?.();
            // For historical data, we don't filter by symbol since it's all the same index
            // Just log the click for debugging
            console.log('Candlestick chart clicked:', params);
            return false;
          });
        }
      })
      .setId('candlestick-chart')
      .setSkipDefaultFiltering(true)
      .build();

    // Add enhanced X-axis and Y-axis configuration to candlestick chart
    if (candlestickChart.config?.options) {
      const options = candlestickChart.config.options as any;
      
      // Enhanced X-axis configuration for better date display
      options.xAxis = {
        ...options.xAxis,
        type: 'category',
        data: [],
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          color: '#666',
          formatter: (value: string) => {
            // Format date labels for better readability
            if (value && typeof value === 'string') {
              try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                  return date.toLocaleDateString('en-IN', { 
                    month: 'short', 
                    day: 'numeric',
                    year: '2-digit'
                  });
                }
              } catch (e) {
                // If not a valid date, return as is
              }
            }
            return value;
          }
        },
        axisTick: {
          alignWithLabel: true
        },
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        }
      };

      // Enhanced Y-axis configuration
      options.yAxis = {
        ...options.yAxis,
        type: 'value',
        scale: true,
        axisLabel: {
          formatter: (value: number) => {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            }).format(value);
          },
          color: '#333',  // Full opacity for y-axis labels
          fontSize: 10
        },
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#f0f0f0',
            type: 'dashed'
          }
        }
      };

      // Enhanced tooltip configuration
      options.tooltip = {
        ...options.tooltip,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        formatter: (params: any) => {
          const param = Array.isArray(params) ? params[0] : params;
          const data = param.data;
          const date = param.name;
          
          // Format date for tooltip
          let formattedDate = date;
          try {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toLocaleDateString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            }
          } catch (e) {
            // Keep original date if parsing fails
          }

          const formatter = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });

          return `
            <div style="padding: 8px;">
              <div style="font-weight: bold; margin-bottom: 8px;">${formattedDate}</div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">Open:</span> 
                <span style="font-weight: bold;">${formatter.format(data[0])}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">Close:</span> 
                <span style="font-weight: bold;">${formatter.format(data[1])}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">Low:</span> 
                <span style="font-weight: bold;">${formatter.format(data[2])}</span>
              </div>
              <div style="margin: 4px 0;">
                <span style="color: #666;">High:</span> 
                <span style="font-weight: bold;">${formatter.format(data[3])}</span>
              </div>
            </div>
          `;
        }
      };

      // Enhanced grid configuration for better spacing
      options.grid = {
        ...options.grid,
        top: '15%',
        left: '5%',   // Reduced from 10% to 5%
        right: '5%',  // Reduced from 10% to 5%
        bottom: '18%',  // Reduced from 25% to 18% to bring zoom control closer
        containLabel: true
      };

      // Update data zoom configuration with increased height
      if (options.dataZoom && Array.isArray(options.dataZoom)) {
        options.dataZoom.forEach((zoom: any) => {
          if (zoom.type === 'slider') {
            zoom.height = '8%';  // Increased from 3% to 8%
            zoom.bottom = '1%';   // Reduced from 3% to 1% to bring it closer to x-axis
          }
        });
      }
    }

    // Stock List Widget - Initialize with empty data, will be populated later
    const stockListWidget = StockListChartBuilder.create()
      .setData(this.filteredDashboardData)
      .setStockPerformanceConfiguration()
      .setHeader('Stock List')
      .setCurrencyFormatter('INR', 'en-IN')
      .setPredefinedPalette('finance')
      .setAccessor('symbol')
      .setFilterColumn('symbol', FilterBy.Value)
      .setId('stock-list-widget')
      .build();



    const filterWidget = createFilterWidget();
    const metricTiles = this.createMetricTiles([]);

    // Position filter widget at row 2 (below metric tiles which occupy rows 0-1)
    filterWidget.position = { x: 0, y: 2, cols: 12, rows: 1 };

    // Position charts with proper spacing - start from row 4 to avoid filter collision  
    candlestickChart.position = { x: 0, y: 3, cols: 8, rows: 8 };
    stockListWidget.position = { x: 8, y: 3, cols: 4, rows: 16 };

    barStockIndustry.position = { x: 0, y: 11, cols: 4, rows: 8 };
    pieStockSector.position = { x: 4, y: 11, cols: 4, rows: 8 };
    
    // Use the Fluent API to build the dashboard config with filter highlighting enabled
    this.dashboardConfig = StandardDashboardBuilder.createStandard()
      .setDashboardId('overall-dashboard')
      // Enable filter highlighting mode with custom styling
      .enableFilterHighlighting(true, {
        filteredOpacity: 0.25,
        highlightedOpacity: 1.0,
        highlightColor: '#ff6b6b',
        filteredColor: '#e0e0e0'
      })
      .setWidgets([
        ...metricTiles,
        filterWidget,

        barStockIndustry,
        pieStockSector,
        candlestickChart,
        stockListWidget,
      ])
      .setEditMode(false)
      .build();

    // Populate widgets with initial data
    this.populateWidgetsWithInitialData();
  }

  /**
   * Populate all widgets with initial data from the shared dataset
   */
  protected override populateWidgetsWithInitialData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    // Find all echart widgets and populate them with initial data
    const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    echartWidgets.forEach(widget => {
      const widgetTitle = widget.config?.header?.title;
      
      // Try to get data by widget title first
      let initialData = null;
      if (widgetTitle) {
        initialData = this.getFilteredDataForWidget(widgetTitle);
      }
      
      // If no data found by title, try to detect chart type and provide appropriate data
      if (!initialData) {
        initialData = this.getSummarizedDataByWidget(widgetTitle);
      }
      
      if (initialData) {
        this.updateEchartWidget(widget, initialData);
      }
    });

    // Find and populate stock list widgets
    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );

    stockListWidgets.forEach(widget => {
      const stockData = this.filteredDashboardData || this.dashboardData;
      
      if (stockData && stockData.length > 0) {
        // Update the widget's data directly
        if (widget.data) {
          widget.data.stocks = stockData;
          widget.data.isLoadingStocks = false;
        } else {
          // Initialize widget data if it doesn't exist
          widget.data = {
            stocks: stockData,
            isLoadingStocks: false
          };
        }
      } else {
        // Set empty data to show the empty message
        if (widget.data) {
          widget.data.stocks = [];
          widget.data.isLoadingStocks = false;
        } else {
          widget.data = {
            stocks: [],
            isLoadingStocks: false
          };
        }
      }
    });





    // Populate metric tiles with initial data
    this.updateMetricTilesWithFilters([]);

    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Get data for widget based on chart type detection
   */
  protected override getSummarizedDataByWidget(widgetTitle: string | undefined): any {
    const widget = this.dashboardConfig.widgets.find(widget =>
        widget.config?.header?.title === widgetTitle
    );

    if(!widget)
    {
      return null;
    }

    const chartOptions = widget.config?.options as any;

    if (!chartOptions?.series?.[0]) {
      return null;
    }

    // Detect chart type and provide appropriate data
    switch (widgetTitle) {
      case 'Sector Allocation':
        // This is a pie chart - provide asset allocation data
        return this.groupByAndSum(this.filteredDashboardData || this.dashboardData, 'sector', 'totalTradedValue');
      case 'Industry':
        // This is a pie chart - provide asset allocation data
        return this.groupByAndSum(this.filteredDashboardData || this.dashboardData, 'industry', 'totalTradedValue');
      case 'Portfolio Distribution':
        // This is a pie chart - provide asset allocation data
        return this.groupByAndSum(this.filteredDashboardData || this.dashboardData, 'industry', 'totalTradedValue');
      case 'Index Historical Price Movement':
        // This is a candlestick chart - provide OHLC data from historical data if available
        if (this.historicalData.length > 0) {
          // Use historical data for candlestick chart
          const candlestickData = this.historicalData.map(item => [
            item.open,
            item.close,
            item.low,
            item.high
          ]);
          const xAxisLabels = this.historicalData.map(item => {
            const date = new Date(item.date);
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
          });
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
        } else {
          // Fallback to stock data
          const stockData = this.filteredDashboardData || this.dashboardData;
          if (!stockData || stockData.length === 0) {
            return [];
          }
          const candlestickData = stockData.map(stock => [
            stock.openPrice || 0,
            stock.lastPrice || 0,
            stock.dayLow || 0,
            stock.dayHigh || 0
          ]);
          const xAxisLabels = stockData.map(stock => stock.symbol || 'Unknown');
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
        }
      default:
        return null;
    }
  }

  /**
   * Get filtered data for a specific widget using enhanced chart builder transformation methods
   */
  protected getFilteredDataForWidget(widgetTitle: string, data?: StockDataDto[]): any {
    const sourceData = data || this.filteredDashboardData || this.dashboardData;

    switch (widgetTitle) {
      case 'Sector Allocation':
        // Use stock ticks data grouped by sector with totalTradedValue
        if (!sourceData) {
          return [];
        }
        
        // Group by sector and sum totalTradedValue
        const sectorData = sourceData.reduce((acc, stock) => {
          const sector = stock.sector || 'Unknown';
          const tradedValue = stock.totalTradedValue || 0;
          
          if (!acc[sector]) {
            acc[sector] = 0;
          }
          acc[sector] += tradedValue;
          return acc;
        }, {} as Record<string, number>);
        
        // Transform to pie chart format
        return Object.entries(sectorData).map(([sector, value]) => ({
          name: sector,
          value: value
        })).sort((a, b) => b.value - a.value);
        
      case 'Industry':
        // Use stock ticks data grouped by industry with totalTradedValue
        if (!sourceData) {
          return [];
        }
        
        // Group by industry and sum totalTradedValue
        const industryData = sourceData.reduce((acc, stock) => {
          const industry = stock.industry || 'Unknown';
          const tradedValue = stock.totalTradedValue || 0;
          
          if (!acc[industry]) {
            acc[industry] = 0;
          }
          acc[industry] += tradedValue;
          return acc;
        }, {} as Record<string, number>);
        
        // Business color palette for individual bars
        const businessColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
        
        // Transform to bar chart format with individual colors and descending sort
        return Object.entries(industryData)
          .map(([industry, value]) => ({
            name: industry,
            value: value
          }))
          .sort((a, b) => b.value - a.value)
          .map((item, index) => ({
            ...item,
            itemStyle: {
              color: businessColors[index % businessColors.length]
            }
          }));
        
      case 'Portfolio Distribution':
        // Use stock ticks data with macro, industry, and sector hierarchy
        if (!sourceData) {
          return [];
        }
        
        // Create hierarchical treemap data: macro -> industry -> sector with sum(totalTradedValue)
        const macroGroups = sourceData.reduce((acc, stock) => {
          const macro = stock.macro || 'Unknown Macro';
          const industry = stock.industry || 'Unknown Industry';
          const sector = stock.sector || 'Unknown Sector';
          const tradedValue = stock.totalTradedValue || 0;
          
          if (!acc[macro]) {
            acc[macro] = {};
          }
          if (!acc[macro][industry]) {
            acc[macro][industry] = {};
          }
          if (!acc[macro][industry][sector]) {
            acc[macro][industry][sector] = 0;
          }
          acc[macro][industry][sector] += tradedValue;
          return acc;
        }, {} as Record<string, Record<string, Record<string, number>>>);
        
        // Transform to treemap format
        return Object.entries(macroGroups).map(([macro, industries]) => {
          const industryChildren = Object.entries(industries).map(([industry, sectors]) => {
            const sectorChildren = Object.entries(sectors).map(([sector, value]) => ({
              name: sector,
              value: value
            }));
            
            const industryValue = sectorChildren.reduce((sum, child) => sum + child.value, 0);
            
            return {
              name: industry,
              value: industryValue,
              children: sectorChildren
            };
          });
          
          const macroValue = industryChildren.reduce((sum, child) => sum + child.value, 0);
          
          return {
            name: macro,
            value: macroValue,
            children: industryChildren
          };
        }).sort((a, b) => b.value - a.value);

      case 'Index Historical Price Movement':
        // Use historical data for candlestick chart if available, otherwise use stock data
        if (this.historicalData.length > 0) {
          // Transform historical data to candlestick format: [open, close, low, high]
          const candlestickData = this.historicalData.map(item => [
            item.open,
            item.close,
            item.low,
            item.high
          ]);
          
          // Set X-axis labels (dates) with proper ISO format for consistency
          const xAxisLabels = this.historicalData.map(item => {
            const date = new Date(item.date);
            return date.toISOString().split('T')[0]; // Use ISO date format for consistency
          });
          
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
        } else {
          // Fallback to stock data
          if (!sourceData) {
            return [];
          }
          
          // Transform stock data to candlestick format: [open, close, low, high]
          const candlestickData = sourceData.map(stock => [
            stock.openPrice || 0,
            stock.lastPrice || 0,
            stock.dayLow || 0,
            stock.dayHigh || 0
          ]);
          
          // Set X-axis labels (symbols or dates if available)
          const xAxisLabels = sourceData.map(stock => {
            // Try to use lastUpdateTime if available, otherwise fall back to symbol
            if (stock.lastUpdateTime) {
              try {
                const date = new Date(stock.lastUpdateTime);
                if (!isNaN(date.getTime())) {
                  return date.toISOString().split('T')[0];
                }
              } catch (e) {
                // Fall back to symbol if date parsing fails
              }
            }
            return stock.symbol || 'Unknown';
          });
          
          return {
            data: candlestickData,
            xAxisLabels: xAxisLabels
          };
        }

      default:
        return null;
    }
  }



  /**
   * Enhanced filtering method that applies filters and updates all widgets
   */
  protected applyEnhancedFilters(filters: any[]): void {
    if (!this.dashboardConfig?.widgets) return;

    // Apply filters to base data
    let filteredData = this.dashboardData;
    
    if (filters && filters.length > 0) {
      // Use the enhanced filtering from the base chart builder
      const dataFilters = filters.map(filter => ({
        property: filter.filterColumn || 'industry',
        operator: 'equals' as const,
        value: filter.value
      }));
      
      filteredData = ApacheEchartBuilder.applyFilters(filteredData, dataFilters);
    }

    // Update the filteredDashboardData property
    this.filteredDashboardData = filteredData;

    // Update all chart widgets with filtered data
    this.updateAllChartsWithFilteredData();

    // Trigger change detection
    setTimeout(() => this.cdr.detectChanges(), 100);
  }

  /**
   * Helper method to create treemap data from stockTicksData with proper hierarchy
   */
  protected createStockTicksTreemapData(data: StockDataDto[] | null): Array<{
    name: string;
    value: number;
    children?: Array<{ name: string; value: number; children?: Array<{ name: string; value: number }> }>
  }> {
    if (!data || data.length === 0) {
      return [];
    }

    // Group by macro -> industry -> sector hierarchy
    const macroGroups = new Map<string, StockDataDto[]>();
    
    data.forEach(stock => {
      const macro = stock.macro || 'Other';
      if (!macroGroups.has(macro)) {
        macroGroups.set(macro, []);
      }
      macroGroups.get(macro)!.push(stock);
    });

    return Array.from(macroGroups.entries()).map(([macro, macroStocks]) => {
      // Group by industry within macro
      const industryGroups = new Map<string, StockDataDto[]>();
      
      macroStocks.forEach(stock => {
        const industry = stock.industry || 'Other';
        if (!industryGroups.has(industry)) {
          industryGroups.set(industry, []);
        }
        industryGroups.get(industry)!.push(stock);
      });

      const industryChildren = Array.from(industryGroups.entries()).map(([industry, industryStocks]) => {
        // Group by sector within industry
        const sectorGroups = new Map<string, StockDataDto[]>();
        
        industryStocks.forEach(stock => {
          const sector = stock.sector || 'Other';
          if (!sectorGroups.has(sector)) {
            sectorGroups.set(sector, []);
          }
          sectorGroups.get(sector)!.push(stock);
        });

        const sectorChildren = Array.from(sectorGroups.entries()).map(([sector, sectorStocks]) => {
          const sectorValue = sectorStocks.reduce((sum, stock) => sum + (stock.lastPrice || 0), 0);
          return {
            name: sector,
            value: sectorValue
          };
        });

        const industryValue = sectorChildren.reduce((sum, child) => sum + child.value, 0);
        
        return {
          name: industry,
          value: industryValue,
          children: sectorChildren
        };
      });

      const macroValue = industryChildren.reduce((sum, child) => sum + child.value, 0);
      
      return {
        name: macro,
        value: macroValue,
        children: industryChildren
      };
    });
  }

  private applyFilters(): void {
    if (!this.dashboardData || this.dashboardData.length === 0) {
      this.filteredDashboardData = [];
      this.updateAllChartsWithFilteredData();
      return;
    }

    if (this.appliedFilters.length === 0) {
      this.filteredDashboardData = [...this.dashboardData];
      this.updateAllChartsWithFilteredData();
      return;
    }

    let filtered = [...this.dashboardData];
    for (const filter of this.appliedFilters) {
      filtered = this.applyIndividualFilter(filtered, filter);
    }

    this.filteredDashboardData = filtered;
    this.updateAllChartsWithFilteredData();
  }

  private applyIndividualFilter(data: StockDataDto[], filter: FilterCriteria): StockDataDto[] {
    const operator = filter.operator || 'equals';
    
    return data.filter(stock => {
      const fieldValue = (stock as any)[filter.field];
      
      switch (operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'contains':
          return fieldValue && fieldValue.toString().toLowerCase().includes(filter.value.toString().toLowerCase());
        case 'greaterThan':
          return fieldValue > filter.value;
        case 'lessThan':
          return fieldValue < filter.value;
        default:
          return fieldValue === filter.value;
      }
    });
  }

  /**
   * Convert FilterCriteria to IFilterValues format for filter widget display
   */
  private convertFilterCriteriaToIFilterValues(filter: FilterCriteria): IFilterValues {
    const stringValue = typeof filter.value === 'number' ? filter.value.toString() : filter.value;
    
    // Create a user-friendly display format
    const fieldDisplayName = this.getFieldDisplayName(filter.field);
    const displayValue = `${fieldDisplayName}: '${filter.value}'`;
    
    // CRITICAL FIX: Filter widget displays 'value' property, so set it to the display name
    // Calculate numeric value for internal use (percentage, etc.)
    let numericValue = 0;
    if (typeof filter.value === 'string') {
      numericValue = this.getAggregatedValueForCategory(filter.field, filter.value as string);
    }
    
    return {
      accessor: filter.field,
      filterColumn: filter.field,
      category: stringValue,     // Category name for reference
      value: stringValue,        // FIXED: Display name (e.g., "Iron & Steel") - this is what's shown
      numericValue: numericValue.toString(), // Numeric value for internal use
      percentage: numericValue.toString(),   // For compatibility
      [filter.field]: stringValue,
      displayValue: displayValue,
      source: filter.source || 'Unknown'
    };
  }

  /**
   * Get aggregated value for a category (industry/sector) for filter display
   */
  private getAggregatedValueForCategory(field: string, categoryName: string): number {
    if (!this.dashboardData || this.dashboardData.length === 0) {
      return 0;
    }
    
    // Calculate aggregated totalTradedValue for the category
    return this.dashboardData
      .filter(stock => (stock as any)[field] === categoryName)
      .reduce((sum, stock) => sum + (stock.totalTradedValue || 0), 0);
  }

  /**
   * Get user-friendly display name for filter fields
   */
  private getFieldDisplayName(field: string): string {
    switch (field) {
      case 'industry': return 'Industry';
      case 'sector': return 'Sector';
      case 'macro': return 'Macro';
      case 'symbol': return 'Symbol';
      default: return field.charAt(0).toUpperCase() + field.slice(1);
    }
  }

  /**
   * Get the filter widget from dashboard configuration
   */
  private getFilterWidget() {
    return this.dashboardConfig?.widgets?.find(widget => 
      widget.id === 'filter-widget' || widget.config?.component === 'filter'
    );
  }

  /**
   * Update filter widget with current applied filters
   */
  private updateFilterWidget(): void {
    const filterWidget = this.getFilterWidget();
    if (filterWidget) {
      const filterValues = this.appliedFilters.map(filter => 
        this.convertFilterCriteriaToIFilterValues(filter)
      );
      updateFilterData(filterWidget, filterValues);
      this.cdr.detectChanges();
    }
  }

  private addFilter(filter: FilterCriteria): void {
    // Check if this exact filter already exists
    const exactFilterExists = this.appliedFilters.some(f => 
      f.type === filter.type && f.field === filter.field && f.value === filter.value
    );
    
    if (exactFilterExists) {
      // Remove and re-add for refresh behavior
      this.appliedFilters = this.appliedFilters.filter(f => 
        !(f.type === filter.type && f.field === filter.field && f.value === filter.value)
      );
    } else {
      // Remove any existing filter of the same type and field
      this.appliedFilters = this.appliedFilters.filter(f => 
        !(f.type === filter.type && f.field === filter.field)
      );
    }
    
    this.appliedFilters.push(filter);
    this.applyFilters();
    this.updateFilterWidget();
  }

  /**
   * Remove a specific filter from the applied filters array
   * This method removes a filter based on its type and field, then reapplies
   * all remaining filters to update the filteredStockData
   * 
   * @param filterType The type of filter to remove (e.g., 'industry', 'sector')
   * @param field The field name of the filter to remove
   */
  private removeFilter(filterType: string, field: string): void {
    this.appliedFilters = this.appliedFilters.filter(f => 
      !(f.type === filterType && f.field === field)
    );
    
    // Apply remaining filters
    this.applyFilters();
    
    // Update filter widget to reflect the removed filter
    this.updateFilterWidget();
  }

  public override clearAllFilters(): void {
    this.appliedFilters = [];
    this.filteredDashboardData = [...(this.dashboardData || [])];
    this.applyFilters();
    this.updateAllChartsWithFilteredData();
    
    const filterWidget = this.getFilterWidget();
    if (filterWidget) {
      clearAllFiltersFromWidget(filterWidget);
    }
    
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 50);
    
    super.clearAllFilters();
  }

  override onFilterValuesChanged(filters: any[]): void {
    // Handle clear all operation
    if (!filters || filters.length === 0) {
      this.appliedFilters = [];
      this.filteredDashboardData = [...(this.dashboardData || [])];
      this.updateAllChartsWithFilteredData();
      
      const filterWidget = this.getFilterWidget();
      if (filterWidget) {
        clearAllFiltersFromWidget(filterWidget);
      }
      
      this.cdr.detectChanges();
      return;
    }
    
    // CRITICAL FIX: Default dashboard system sets value=numeric, category=name
    // But filter widget displays 'value', so we need to swap them for display
    const correctedFilters = filters.map(filter => {
      // If this looks like a chart filter with numeric value and string category
      if (filter.category && typeof filter.category === 'string' && 
          typeof filter.value === 'number' && !isNaN(filter.value)) {
        
        // Swap value and category so filter widget displays the name
        return {
          ...filter,
          value: filter.category,      // Set value to display name (what filter widget shows)
          category: filter.category,   // Keep category as display name
          numericValue: filter.value   // Store original numeric value
        };
      }
      
      return filter;
    });
    
    // Update the filter widget with corrected values
    const filterWidget = this.getFilterWidget();
    if (filterWidget) {
      updateFilterData(filterWidget, correctedFilters);
    }
    
    // Handle individual filter removal or sync with filter widget
    // Convert current filter widget state to appliedFilters format
    const newAppliedFilters: FilterCriteria[] = [];
    
    correctedFilters.forEach(filter => {
      const categoryName = filter.category || filter.value;
      
      if (filter.filterColumn === 'sector' && categoryName && 
          typeof categoryName === 'string' && isNaN(Number(categoryName))) {
        newAppliedFilters.push({
          type: 'sector',
          field: 'sector',
          value: categoryName,
          operator: 'equals',
          source: 'Filter Widget'
        });
      } else if (filter.filterColumn === 'industry' && categoryName && 
                 typeof categoryName === 'string' && isNaN(Number(categoryName))) {
        newAppliedFilters.push({
          type: 'industry',
          field: 'industry',
          value: categoryName,
          operator: 'equals',
          source: 'Filter Widget'
        });
      } else if (filter.filterColumn === 'symbol' && categoryName && 
                 typeof categoryName === 'string' && isNaN(Number(categoryName))) {
        newAppliedFilters.push({
          type: 'symbol',
          field: 'symbol',
          value: categoryName,
          operator: 'equals',
          source: 'Filter Widget'
        });
      }
    });
    
    // Update appliedFilters to match filter widget state
    this.appliedFilters = newAppliedFilters;
    
    // Apply the updated filters
    this.applyFilters();
  }

  private updateAllChartsWithFilteredData(): void {
    if (!this.filteredDashboardData) {
      return;
    }
    
    // Debounce chart updates to prevent rapid reinitialization
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
    }
    
    this.chartUpdateTimer = setTimeout(() => {
      this.updateBarChartWithFilteredData();
      this.updatePieChartWithFilteredData();
      // Use historical data for candlestick chart if available, otherwise use filtered data
      if (this.historicalData.length > 0) {
        this.updateCandlestickChartWithHistoricalData();
      } else {
        this.updateCandlestickChartWithFilteredData();
      }
      this.updateStockListWithFilteredData();
      
      // Update metric tiles with filtered data
      this.updateMetricTilesWithFilters([]);
      
      this.cdr.detectChanges();
      this.chartUpdateTimer = null;
    }, 150); // Increased delay and debounce to reduce chart reinitialization
  }

  private filterChartsByIndustry(industry: string): void {
    if (!this.dashboardData || this.dashboardData.length === 0 || 
        typeof industry !== 'string' || !isNaN(Number(industry))) {
      return;
    }

    const availableIndustries = [...new Set(this.dashboardData.map(s => s.industry))];
    if (!availableIndustries.includes(industry)) {
      return;
    }

    this.addFilter({
      type: 'industry',
      field: 'industry',
      value: industry,
      operator: 'equals',
      source: 'Industry Chart'
    });
  }

  private filterChartsBySector(sector: string): void {
    if (!this.dashboardData || this.dashboardData.length === 0 || 
        typeof sector !== 'string' || !isNaN(Number(sector))) {
      return;
    }

    const availableSectors = [...new Set(this.dashboardData.map(s => s.sector))];
    if (!availableSectors.includes(sector)) {
      return;
    }

    this.addFilter({
      type: 'sector',
      field: 'sector',
      value: sector,
      operator: 'equals',
      source: 'Sector Chart'
    });
  }

  /**
   * Filter charts by macro category (called when treemap is clicked)
   */
  private filterChartsByMacro(macro: string): void {
    if (!this.dashboardData || this.dashboardData.length === 0) return;

    // Use centralized filter system
    this.addFilter({
      type: 'macro',
      field: 'macro',
      value: macro,
      operator: 'equals',
      source: 'Treemap Chart'
    });
  }

  private filterChartsBySymbol(symbol: string): void {
    if (!this.dashboardData || this.dashboardData.length === 0 || 
        typeof symbol !== 'string' || !isNaN(Number(symbol))) {
      return;
    }

    const availableSymbols = [...new Set(this.dashboardData.map(s => s.symbol))];
    if (!availableSymbols.includes(symbol)) {
      return;
    }

    this.addFilter({
      type: 'symbol',
      field: 'symbol',
      value: symbol,
      operator: 'equals',
      source: 'Candlestick Chart'
    });
  }

  private updatePieChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) {
      return;
    }

    const pieWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Sector Allocation'
    );

    if (pieWidget) {
      const sectorData = this.filteredDashboardData.reduce((acc, stock) => {
        const sector = stock.sector || 'Unknown';
        if (!acc[sector]) {
          acc[sector] = 0;
        }
        acc[sector] += stock.totalTradedValue || 0;
        return acc;
      }, {} as Record<string, number>);

      const pieData = Object.entries(sectorData)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
      
      try {
        PieChartBuilder.updateData(pieWidget, pieData);
        
        if (pieWidget.chartInstance && typeof pieWidget.chartInstance.setOption === 'function') {
          const newOptions = {
            ...pieWidget.config?.options,
            series: [{
              ...((pieWidget.config?.options as any)?.series?.[0] || {}),
              data: pieData
            }]
          };
          pieWidget.chartInstance.setOption(newOptions, true);
        }
        
        this.updateEchartWidget(pieWidget, pieData);
      } catch (error) {
        // Silent error handling
      }
    }
  }

  private updateBarChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) {
      return;
    }

    const barWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Industry'
    );

    if (barWidget) {
      const industryData = this.filteredDashboardData.reduce((acc, stock) => {
        const industry = stock.industry || 'Unknown';
        if (!acc[industry]) {
          acc[industry] = 0;
        }
        acc[industry] += stock.totalTradedValue || 0;
        return acc;
      }, {} as Record<string, number>);

      const businessColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
      
      const barData = Object.entries(industryData)
        .map(([industry, value]) => ({
          name: industry,
          value: value
        }))
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({
          ...item,
          itemStyle: {
            color: businessColors[index % businessColors.length]
          }
        }));
      
      try {
        HorizontalBarChartBuilder.updateData(barWidget, barData);
        
        if (barWidget.chartInstance && typeof barWidget.chartInstance.setOption === 'function') {
          const newOptions = {
            ...barWidget.config?.options,
            series: [{
              ...((barWidget.config?.options as any)?.series?.[0] || {}),
              data: barData
            }],
            yAxis: {
              ...((barWidget.config?.options as any)?.yAxis || {}),
              data: barData.map(item => item.name)
            }
          };
          barWidget.chartInstance.setOption(newOptions, true);
        }
        
        this.updateEchartWidget(barWidget, barData);
      } catch (error) {
        // Silent error handling
      }
    }
  }

  /**
   * Update candlestick chart with historical data from the API
   */
  private updateCandlestickChartWithHistoricalData(): void {
    if (!this.dashboardConfig?.widgets) return;

    const candlestickWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Index Historical Price Movement'
    );

    if (candlestickWidget && this.historicalData.length > 0) {
      // Transform historical data to candlestick format: [open, close, low, high]
      const candlestickData = this.historicalData.map(item => [
        item.open,
        item.close,
        item.low,
        item.high
      ]);
      
      // Create X-axis labels (dates) with proper formatting
      const xAxisLabels = this.historicalData.map(item => {
        const date = new Date(item.date);
        return date.toISOString().split('T')[0]; // Use ISO date format for consistency
      });
      
      // Update the widget with historical data
      this.updateEchartWidget(candlestickWidget, candlestickData);
      
      // Update X-axis labels and chart options if chart instance exists
      if (candlestickWidget.chartInstance && typeof candlestickWidget.chartInstance.setOption === 'function') {
        const currentOptions = candlestickWidget.chartInstance.getOption();
        const newOptions = {
          ...currentOptions,
          xAxis: {
            ...((currentOptions as any)?.xAxis || {}),
            data: xAxisLabels
          },
          series: [{
            ...((currentOptions as any)?.series?.[0] || {}),
            data: candlestickData
          }]
        };
        
        // Apply the new options
        candlestickWidget.chartInstance.setOption(newOptions, true);
        
        // Force a resize to ensure proper rendering
        setTimeout(() => {
          if (candlestickWidget.chartInstance && typeof candlestickWidget.chartInstance.resize === 'function') {
            candlestickWidget.chartInstance.resize();
          }
        }, 100);
      }
      
      // Also update the widget's config options for consistency
      if (candlestickWidget.config?.options) {
        const options = candlestickWidget.config.options as any;
        if (options.xAxis) {
          options.xAxis.data = xAxisLabels;
        }
        if (options.series && options.series[0]) {
          options.series[0].data = candlestickData;
        }
      }
    }
  }

  /**
   * Update candlestick chart with filtered data (fallback to stock data)
   */
  private updateCandlestickChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) return;

    const candlestickWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Index Historical Price Movement'
    );

    if (candlestickWidget) {
      // Create candlestick data from filtered stock data
      const candlestickData = this.filteredDashboardData.map(stock => [
        stock.openPrice || 0,
        stock.lastPrice || 0,
        stock.dayLow || 0,
        stock.dayHigh || 0
      ]);
      
      // Create X-axis labels (symbols or dates if available)
      const xAxisLabels = this.filteredDashboardData.map(stock => {
        // Try to use lastUpdateTime if available, otherwise fall back to symbol
        if (stock.lastUpdateTime) {
          try {
            const date = new Date(stock.lastUpdateTime);
            if (!isNaN(date.getTime())) {
              return date.toISOString().split('T')[0];
            }
          } catch (e) {
            // Fall back to symbol if date parsing fails
          }
        }
        return stock.symbol || 'Unknown';
      });
      
      // Update the widget with new data and X-axis labels
      this.updateEchartWidget(candlestickWidget, candlestickData);
      
      // Update X-axis labels and chart options if chart instance exists
      if (candlestickWidget.chartInstance && typeof candlestickWidget.chartInstance.setOption === 'function') {
        const currentOptions = candlestickWidget.chartInstance.getOption();
        const newOptions = {
          ...currentOptions,
          xAxis: {
            ...((currentOptions as any)?.xAxis || {}),
            data: xAxisLabels
          },
          series: [{
            ...((currentOptions as any)?.series?.[0] || {}),
            data: candlestickData
          }]
        };
        
        // Apply the new options
        candlestickWidget.chartInstance.setOption(newOptions, true);
        
        // Force a resize to ensure proper rendering
        setTimeout(() => {
          if (candlestickWidget.chartInstance && typeof candlestickWidget.chartInstance.resize === 'function') {
            candlestickWidget.chartInstance.resize();
          }
        }, 100);
      }
      
      // Also update the widget's config options for consistency
      if (candlestickWidget.config?.options) {
        const options = candlestickWidget.config.options as any;
        if (options.xAxis) {
          options.xAxis.data = xAxisLabels;
        }
        if (options.series && options.series[0]) {
          options.series[0].data = candlestickData;
        }
      }
    }
  }

  /**
   * Update treemap chart with filtered data
   */
  private updateTreemapWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) return;

    const treemapWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Portfolio Distribution'
    );

    if (treemapWidget) {
      // Create hierarchical treemap data from filtered stock data
      const treemapData = this.createStockTicksTreemapData(this.filteredDashboardData);
      
      // Update the widget with new data
      this.updateEchartWidget(treemapWidget, treemapData);
    }
  }

  private updateStockListWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets) {
      return;
    }

    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );

    stockListWidgets.forEach(widget => {
      const stockData = this.filteredDashboardData || [];
      const newStockDataArray = [...stockData];
      
      if (widget.data) {
        widget.data.stocks = newStockDataArray;
        widget.data.isLoadingStocks = false;
      } else {
        widget.data = {
          stocks: newStockDataArray,
          isLoadingStocks: false
        };
      }
    });
    
    // Batch the change detection and refresh operations
    setTimeout(() => {
      this.cdr.detectChanges();
      
      stockListWidgets.forEach(widget => {
        if (widget.data && typeof (widget.data as any).refresh === 'function') {
          (widget.data as any).refresh();
        }
      });
      
      this.cdr.markForCheck();
    }, 50);
  }

  /**
   * Initialize WebSocket connection for indices data
   */
  private async initializeWebSocket(): Promise<void> {
    try {
      await this.modernIndicesWebSocketService.connect();
    } catch (error) {
      console.warn('WebSocket initialization failed - continuing without real-time data:', (error as Error).message || error);
    }
  }

  /**
   * Subscribe to WebSocket updates for the selected index
   * @param indexName - The name of the index to subscribe to
   */
  private async subscribeToIndexWebSocket(indexName: string): Promise<void> {
    // Unsubscribe from previous subscription if any
    if (this.indicesWebSocketSubscription) {
      this.indicesWebSocketSubscription.unsubscribe();
      this.indicesWebSocketSubscription = null;
    }

    // Track the current subscribed index
    this.currentSubscribedIndex = indexName;

    // Convert index name to WebSocket format (e.g., "NIFTY 50" -> "NIFTY-50")
    const webSocketIndexName = indexName.replace(/\s+/g, '-').toUpperCase();

    try {
      // Use the modern Angular v20 WebSocket service
      await this.modernIndicesWebSocketService.connect();
      
      // Only subscribe if WebSocket is actually connected
      if (this.modernIndicesWebSocketService.isConnected) {
        // First try to subscribe to specific index data
        try {
          this.indicesWebSocketSubscription = this.modernIndicesWebSocketService
            .subscribeToIndex(webSocketIndexName)
            .subscribe({
              next: (indicesData: IndicesDto) => {
                this.handleWebSocketData(indicesData, indexName);
              },
              error: (error) => {
                console.warn(`Specific index subscription failed for ${webSocketIndexName}, falling back to all indices:`, error.message || error);
                // Fallback to all indices subscription
                this.subscribeToAllIndicesAsFallback(indexName);
              },
              complete: () => {
                // WebSocket subscription completed
              }
            });
        } catch (error) {
          console.warn(`Specific index subscription failed for ${webSocketIndexName}, falling back to all indices:`, error);
          // Fallback to all indices subscription
          this.subscribeToAllIndicesAsFallback(indexName);
        }
          
      } else {
        // WebSocket not connected - skipping real-time subscription
        console.warn('WebSocket not connected - skipping real-time subscription for', webSocketIndexName);
      }
    } catch (error) {
      console.warn(`WebSocket subscription failed for ${webSocketIndexName} - continuing without real-time data:`, (error as Error).message || error);
      // Don't clear currentSelectedIndexData on WebSocket connection failures to prevent tile from reverting
      this.cdr.detectChanges();
    }
  }

  /**
   * Fallback subscription to all indices data when specific index subscription fails
   * @param targetIndexName - The name of the index we're looking for
   */
  private subscribeToAllIndicesAsFallback(targetIndexName: string): void {
    try {
      this.indicesWebSocketSubscription = this.modernIndicesWebSocketService
        .subscribeToAllIndices()
        .subscribe({
          next: (indicesData: IndicesDto) => {
            // Filter for the target index from all indices data
            if (indicesData && indicesData.indices && indicesData.indices.length > 0) {
              const targetIndex = indicesData.indices.find(index => {
                const indexName = index.indexName || index.index || '';
                const indexSymbol = index.indexSymbol || index.key || '';
                return indexName.toLowerCase().includes(targetIndexName.toLowerCase()) ||
                       indexSymbol.toLowerCase().includes(targetIndexName.toLowerCase()) ||
                       targetIndexName.toLowerCase().includes(indexName.toLowerCase()) ||
                       targetIndexName.toLowerCase().includes(indexSymbol.toLowerCase());
              });
              
              if (targetIndex) {
                this.handleWebSocketData({ ...indicesData, indices: [targetIndex] }, targetIndexName);
              }
            }
          },
          error: (error) => {
            console.warn('All indices subscription error:', error.message || error);
            this.cdr.detectChanges();
          },
          complete: () => {
            // WebSocket subscription completed
          }
        });
    } catch (error) {
      console.error('Failed to subscribe to all indices as fallback:', error);
    }
  }

  /**
   * Handle WebSocket data updates for the selected index
   * @param indicesData - Data received from WebSocket
   * @param indexName - The name of the index being monitored
   */
  private handleWebSocketData(indicesData: IndicesDto, indexName: string): void {
    try {
      if (indicesData && indicesData.indices && indicesData.indices.length > 0) {
        // Update current selected index data with real-time information
        const realTimeIndexData = indicesData.indices[0];
        this.currentSelectedIndexData = realTimeIndexData;
        
        // Update the first tile (index price tile) with real-time data
        this.updateFirstTileWithRealTimeData(realTimeIndexData);
        
        // Force complete recreation of metric tiles with new data
        this.recreateMetricTiles();
        
        this.forceDashboardRefresh(); // Force refresh to update all widgets
        this.cdr.detectChanges();
      } else {
        console.warn('WebSocket received data but no valid indices found:', indicesData);
      }
    } catch (error) {
      console.error('Error processing received index data:', error);
    }
  }

  /**
   * Attempt to reconnect to WebSocket and resubscribe to current index
   */
  private async attemptWebSocketReconnection(): Promise<void> {
    if (!this.currentSubscribedIndex) {
      return;
    }

    try {
      console.log('Attempting WebSocket reconnection...');
      await this.modernIndicesWebSocketService.connect();
      
      if (this.modernIndicesWebSocketService.isConnected) {
        console.log('WebSocket reconnected successfully, resubscribing to', this.currentSubscribedIndex);
        this.subscribeToIndexWebSocket(this.currentSubscribedIndex);
      }
    } catch (error) {
      console.warn('WebSocket reconnection failed:', error);
      // Schedule another reconnection attempt after a delay
      setTimeout(() => {
        this.attemptWebSocketReconnection();
      }, 5000); // 5 second delay before retry
    }
  }

  /**
   * Update the first tile (index price tile) with real-time WebSocket data
   * @param realTimeIndexData - Real-time index data from WebSocket
   */
  private updateFirstTileWithRealTimeData(realTimeIndexData: IndexDataDto): void {
    if (!this.dashboardConfig?.widgets) {
      console.warn('Dashboard config not available for first tile update');
      return;
    }

    // Find the first tile (index price tile) - it should be at position (0,0)
    const firstTile = this.dashboardConfig.widgets.find(widget => 
      widget.position?.x === 0 && widget.position?.y === 0 &&
      (widget.config?.component === 'stock-tile' || widget.config?.component === 'tile')
    );

    if (!firstTile) {
      console.warn('First tile not found at position (0,0)');
      return;
    }

    if (!realTimeIndexData) {
      console.warn('No real-time index data available for first tile update');
      return;
    }

    try {
      // Extract real-time data using both expected and actual WebSocket field names
      const indexName = realTimeIndexData.indexName || realTimeIndexData.index || 'Index';
      const lastPrice = realTimeIndexData.lastPrice || realTimeIndexData.last || 0;
      const percentChange = realTimeIndexData.percentChange || realTimeIndexData.perChange || 0;
      const dayHigh = realTimeIndexData.dayHigh || realTimeIndexData.high || 0;
      const dayLow = realTimeIndexData.dayLow || realTimeIndexData.low || 0;
      const variation = realTimeIndexData.variation || realTimeIndexData.change || 0;

      console.log(`Updating first tile with real-time data for ${indexName}:`, {
        lastPrice,
        percentChange,
        variation,
        dayHigh,
        dayLow,
        timestamp: new Date().toLocaleTimeString()
      });

      if (firstTile.config?.component === 'stock-tile') {
        // Update stock tile with real-time data
        const stockTileData = {
          value: lastPrice.toFixed(2),
          change: variation.toFixed(2),
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: indexName,
          icon: 'fas fa-chart-line',
          color: percentChange >= 0 ? '#16a34a' : '#dc2626',
          backgroundColor: percentChange >= 0 ? '#bbf7d0' : '#fecaca',
          highValue: dayHigh.toFixed(2),
          lowValue: dayLow.toFixed(2),
          currency: '₹'
        };
        
        // Use StockTileBuilder to properly update the stock tile data
        StockTileBuilder.updateData(firstTile, stockTileData);
        console.log('First tile (stock-tile) updated successfully');
      } else {
        // Update regular tile with real-time data
        const tileData = {
          value: lastPrice.toFixed(2),
          change: variation.toFixed(2),
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: indexName,
          icon: 'fas fa-chart-line',
          color: percentChange >= 0 ? '#16a34a' : '#dc2626',
          backgroundColor: percentChange >= 0 ? '#bbf7d0' : '#fecaca',
          title: indexName,
          subtitle: `Change: ${percentChange.toFixed(2)}%`
        };
        
        // Use TileBuilder to properly update the tile data
        TileBuilder.updateData(firstTile, tileData);
        console.log('First tile (regular tile) updated successfully');
      }

      // Log real-time update for debugging
      console.log(`Real-time update for ${indexName}:`, {
        lastPrice,
        percentChange,
        variation,
        dayHigh,
        dayLow,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error updating first tile with real-time data:', error);
    }
  }

  /**
   * Force refresh the dashboard to update all widgets
   */
  private forceDashboardRefresh(): void {
    // Update metric tiles with current data
    this.updateMetricTilesWithFilters([]);
    
    // Trigger change detection
    this.cdr.detectChanges();
    
    // Force another change detection after a short delay
    setTimeout(() => {
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    }, 100);
  }

  private recreateMetricTiles(): void {
    const currentMetricTiles = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'tile' || widget.config?.component === 'stock-tile'
    );

    const newMetricTiles = this.createMetricTiles(this.filteredDashboardData || this.dashboardData);

    currentMetricTiles.forEach((widget, index) => {
      if (index < newMetricTiles.length) {
        const updatedTile = newMetricTiles[index];
        
        // Check if this tile should update on data change
        const tileOptions = widget.config?.options as any;
        const shouldUpdate = tileOptions?.updateOnDataChange !== false;
        
        if (shouldUpdate) {
          // Extract tile data properties from the updated tile
          const tileOptions = updatedTile.config?.options as any;
          
          if (widget.config?.component === 'stock-tile') {
            // Handle stock tile updates
            const stockTileData = {
              value: tileOptions?.value || '',
              change: tileOptions?.change || '',
              changeType: tileOptions?.changeType || 'neutral',
              description: tileOptions?.description || '',
              icon: tileOptions?.icon || '',
              color: tileOptions?.color || '',
              backgroundColor: tileOptions?.backgroundColor || '',
              highValue: tileOptions?.highValue || '',
              lowValue: tileOptions?.lowValue || '',
              currency: tileOptions?.currency || '₹'
            };
            
            // Use StockTileBuilder to properly update the stock tile data
            StockTileBuilder.updateData(widget, stockTileData);
          } else {
            // Handle regular tile updates
            const tileData = {
              value: tileOptions?.value || '',
              change: tileOptions?.change || '',
              changeType: tileOptions?.changeType || 'neutral',
              description: tileOptions?.description || '',
              icon: tileOptions?.icon || '',
              color: tileOptions?.color || '',
              backgroundColor: tileOptions?.backgroundColor || '',
              title: tileOptions?.title || '',
              subtitle: tileOptions?.subtitle || tileOptions?.customData?.subtitle || ''
            };
            
            // Use TileBuilder to properly update the tile data
            TileBuilder.updateData(widget, tileData);
          }
        }
      }
    });
  }

  /**
   * Monitor WebSocket connection state changes
   */
  private monitorWebSocketConnectionState(): void {
    this.webSocketConnectionStateSubscription = this.modernIndicesWebSocketService.connectionState
      .subscribe({
        next: (state: any) => {
          this.isWebSocketConnected = state === 'CONNECTED';
          
          if (this.isWebSocketConnected) {
            console.log('WebSocket connected - ready for real-time data');
            // If we have a current subscribed index, resubscribe
            if (this.currentSubscribedIndex) {
              this.subscribeToIndexWebSocket(this.currentSubscribedIndex);
            }
          } else if (state === 'DISCONNECTED' || state === 'ERROR') {
            console.log('WebSocket disconnected or error state:', state);
            // Attempt reconnection if we have a subscribed index
            if (this.currentSubscribedIndex) {
              this.attemptWebSocketReconnection();
            }
          } else {
            console.log('WebSocket state changed:', state);
          }
        },
        error: (error) => {
          console.error('WebSocket connection state monitoring error:', error);
          this.isWebSocketConnected = false;
          // Attempt reconnection on error
          if (this.currentSubscribedIndex) {
            this.attemptWebSocketReconnection();
          }
        }
      });
  }

}
import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Subscription } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';

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

// Extend Window interface for garbage collection (if available in development)
declare global {
  interface Window {
    gc?: () => void;
  }
}

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

// Import stock service and historical data entities
import { StockService } from '../../../services/apis/stock.api';
import { StockHistoricalData } from '../../../services/entities/stock-historical-data';

// Import indices service and historical data entities
import { IndicesService } from '../../../services/apis/indices.api';
import { IndexHistoricalData } from '../../../services/entities/index-historical-data';

// Import NSE Indices service and entities


// Import consolidated WebSocket service and entities
import { WebSocketService, IndexDataDto, IndicesDto } from '../../../services/websockets';

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
  selector: 'app-stock-insights',
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
  templateUrl: './stock-insights.component.html',
  styleUrls: ['./stock-insights.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Financial Dashboard with a centralized filtering system for consistent
 * filtering behavior across all widgets and charts.
 */
export class StockInsightsComponent extends BaseDashboardComponent<StockDataDto> {
  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: StockDataDto[] = [];
  protected readonly initialDashboardData: StockDataDto[] = [];

  // Filtered stock data for cross-chart filtering
  protected filteredDashboardData: StockDataDto[] | null = this.dashboardData || [];

  // Central applied filters array for cumulative filtering
  protected appliedFilters: FilterCriteria[] = [];
  
  // Dashboard title - dynamic based on a selected stock
  public dashboardTitle: string = 'Stock Insights Dashboard';
  
  // Subscription management
  private selectedStockSubscription: Subscription | null = null;
  
  // Chart update control to prevent rapid reinitialization
  private chartUpdateTimer: any = null;
  private stockWebSocketSubscription: Subscription | null = null;
  private webSocketConnectionStateSubscription: Subscription | null = null;
  
  // Current selected stock data
  private currentSelectedStockData: StockDataDto | null = null;
  
  // Historical data for candlestick chart
  private historicalData: StockHistoricalData[] = [];

  // WebSocket connection state tracking
  private isWebSocketConnected: boolean = false;
  private currentSubscribedStock: string | null = null;
  private isSubscribing: boolean = false; // Track if we're currently in the process of subscribing
  private subscribedTopics: Set<string> = new Set(); // Track which topics we're already subscribed to

  // Debug flag to control verbose console logging
  private readonly enableDebugLogging: boolean = false;
  // Track the last stock for which previous-day data was fetched (to avoid repeated calls)
  private lastPrevDayFetchStock: string | null = null;


  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService,
    private componentCommunicationService: ComponentCommunicationService,
    private stockTicksService: StockTicksService,
    private stockService: StockService,
    private indicesService: IndicesService,
    private webSocketService: WebSocketService

  ) {
    super(cdr, excelExportService, filterService);
  }

  override ngOnInit(): void {
    try {
      console.log('StockInsightsComponent ngOnInit called');
      super.ngOnInit?.();
      console.log('StockInsightsComponent ngOnInit completed');
    } catch (error) {
      console.error('Error in StockInsightsComponent ngOnInit:', error);
    }
  }

  protected onChildInit(): void {
    try {
      console.log('StockInsightsComponent onChildInit called');
      
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
      if (this.selectedStockSubscription) {
        this.selectedStockSubscription.unsubscribe();
        this.selectedStockSubscription = null;
      }

      // Reset filters and title
      this.appliedFilters = [];
      this.dashboardTitle = 'Stock Insights Dashboard';
      // Note: We'll need to implement stock selection communication
      // this.componentCommunicationService.clearSelectedStock();

      // Subscribe to selected stock changes (dedupe same stock emissions)
      // Note: We'll need to implement stock selection communication
      // this.selectedStockSubscription = this.componentCommunicationService.getSelectedStock()
      //   .pipe(
      //     distinctUntilChanged((a: any, b: any) => {
      //       const keyA = (a && (a.name || a.symbol)) || a;
      //       const keyB = (b && (b.name || b.symbol)) || b;
      //       return keyA === keyB;
      //     })
      //   )
      //   .subscribe((selectedStock: any) => {
      //     if (selectedStock) {
      //       this.updateDashboardWithSelectedStock(selectedStock);
      //     } else {
      //       this.loadDefaultStockData();
      //     }
      //   });

      // Load default data if no stock selected
      setTimeout(() => {
        // Note: We'll need to implement stock selection communication
        // const currentSelectedStock = this.componentCommunicationService.getSelectedStock();
        // if (!currentSelectedStock) {
          this.loadDefaultStockData();
        // }
      }, 100);
      
      console.log('StockInsightsComponent onChildInit completed');
    } catch (error) {
      console.error('Error in StockInsightsComponent onChildInit:', error);
    }
  }

  protected onChildDestroy(): void {
    // Clean up chart update timer
    if (this.chartUpdateTimer) {
      clearTimeout(this.chartUpdateTimer);
      this.chartUpdateTimer = null;
    }
    
    // Unsubscribe from selected stock subscription to prevent memory leaks
    if (this.selectedStockSubscription) {
      this.selectedStockSubscription.unsubscribe();
      this.selectedStockSubscription = null;
    }
    
    // Unsubscribe from WebSocket subscription
    if (this.stockWebSocketSubscription) {
      this.stockWebSocketSubscription.unsubscribe();
      this.stockWebSocketSubscription = null;
    }

    // Unsubscribe from WebSocket connection state monitoring
    if (this.webSocketConnectionStateSubscription) {
      this.webSocketConnectionStateSubscription.unsubscribe();
      this.webSocketConnectionStateSubscription = null;
    }
    
    // Disconnect WebSocket
    this.webSocketService.disconnect();
    
    // Clear stock ticks data and reset filters
    this.dashboardData = [];
    this.filteredDashboardData = null;
    this.appliedFilters = [];
    this.currentSelectedStockData = null;
    this.historicalData = [];
    
    // Reset WebSocket state
    this.isWebSocketConnected = false;
    this.currentSubscribedStock = null;
    this.isSubscribing = false;
    this.subscribedTopics.clear();
  }

  /**
   * Load default stock data for INFY
   * Note: Currently using NIFTY 50 index data as a workaround since we don't have
   * stock-specific endpoints in the backend yet. In the future, we should implement:
   * 1. /api/v1/stock-ticks/by-symbol/{symbol} for individual stock data
   * 2. /api/v1/stock/{symbol}/history for historical data (already implemented)
   */
  private loadDefaultStockData(): void {
    this.dashboardTitle = 'Stock Insights Dashboard - INFY (Infosys)';
    
    // Load INFY as the default stock
    const defaultStockSymbol = 'INFY';
    console.log('Loading default stock data for:', defaultStockSymbol);
    
    // Fetch stock ticks data for INFY
    this.loadStockTicksData(defaultStockSymbol);
    
    // Load historical data for INFY using the date-range endpoint /stock/INFY/history
    this.loadHistoricalData(defaultStockSymbol);
    
    // Set current selected stock data
    this.currentSelectedStockData = {
      symbol: defaultStockSymbol,
      lastPrice: 0, // Will be updated when data loads
      priceChange: 0,
      percentChange: 0
    } as StockDataDto;
    
    // Update dashboard title with stock info
    this.dashboardTitle = `${defaultStockSymbol} - Stock Insights Dashboard`;
  }

  private loadStockTicksData(stockSymbol: string): void {
    if (stockSymbol && stockSymbol.trim()) {
      // For now, use NIFTY 50 as the index since we need an index, not a stock symbol
      // TODO: Implement a proper stock-specific endpoint in the backend
      const indexName = 'NIFTY 50';
      console.log(`Loading stock ticks data for index: ${indexName} (stock symbol: ${stockSymbol})`);
      
      this.stockTicksService.getStockTicksByIndex(indexName).subscribe({
        next: (stockTicksData: StockDataDto[]) => {
          this.dashboardData = stockTicksData || [];
          this.appliedFilters = [];
          this.filteredDashboardData = this.dashboardData;

          this.updateMetricTilesWithFilters([]);
          this.populateWidgetsWithInitialData();
          this.updateAllChartsWithFilteredData();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.warn('Failed to load stock ticks data for index:', indexName, ':', error);
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
   * Load historical data for the selected stock using the /stock/{symbol}/history endpoint
   * @param stockSymbol The symbol of the stock to load historical data for
   */
  private loadHistoricalData(stockSymbol: string): void {
    if (stockSymbol && stockSymbol.trim()) {
      // Use the date-range endpoint: /stock/{symbol}/history (POST with date range)
      // Backend now accepts dates in yyyy-MM-dd format
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      
      // Format dates as yyyy-MM-dd strings (backend expected format)
      const startDateStr = startDate.toISOString().split('T')[0]; // yyyy-MM-dd
      const endDateStr = endDate.toISOString().split('T')[0];     // yyyy-MM-dd
      
      console.log(`Loading historical data for ${stockSymbol} from ${startDateStr} to ${endDateStr}`);
      
      this.stockService.getStockHistory(stockSymbol, startDateStr, endDateStr).subscribe({
        next: (historicalData: StockHistoricalData[]) => {
          this.historicalData = historicalData || [];
          this.updateCandlestickChartWithHistoricalData();
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.warn('Failed to load historical data for', stockSymbol, ':', error);
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
   * Unsubscribe from the current WebSocket topic before switching to a new stock
   */
  private unsubscribeFromCurrentWebSocketTopic(): void {
    if (this.stockWebSocketSubscription) {
      this.stockWebSocketSubscription.unsubscribe();
      this.stockWebSocketSubscription = null;
    }
    
    // Clear current subscription tracking
    if (this.currentSubscribedStock) {
      const webSocketStockName = this.currentSubscribedStock.replace(/\s+/g, '-').toLowerCase();
      const topicName = `/topic/nse-stocks/${webSocketStockName}`;
      this.subscribedTopics.delete(topicName);

    }
    
    this.currentSubscribedStock = null;
    this.isSubscribing = false;
  }

  /**
   * Update dashboard data with selected stock information
   * @param selectedStock The selected stock data object from an stocks component
   */
  private updateDashboardWithSelectedStock(selectedStock: SelectedIndexData): void {
    // Unsubscribe from previous WebSocket topic if any
    this.unsubscribeFromCurrentWebSocketTopic();
    
    // Update dashboard title with selected stock name or symbol
    this.dashboardTitle = selectedStock.name || selectedStock.symbol || 'Stock Insights Dashboard';

    // Transform the selected stock data to dashboard data format
    const dashboardDataRow = this.componentCommunicationService.transformToDashboardData(selectedStock);
    
    // Add the new data to the existing dashboard data
    // First, remove any existing data for the same symbol to avoid duplicates
    this.dashboardData = this.dashboardData.filter(row => row.symbol !== dashboardDataRow.symbol);
    
    // Add the new data row
    this.dashboardData = [dashboardDataRow, ...this.dashboardData];
    
    // Set initial selected stock data for immediate display
    this.currentSelectedStockData = {
      symbol: selectedStock.symbol,
      lastPrice: selectedStock.lastPrice || 0,
      variation: selectedStock.variation || 0,
      percentChange: selectedStock.percentChange || 0
    } as StockDataDto;
    
    // Fetch stock ticks data for the selected stock
    // Extract symbol from selectedStock object
    const stockSymbol = selectedStock.symbol;
    this.loadStockTicksData(stockSymbol);
    
    // Load historical data for the selected stock
    const stockName = selectedStock.name || selectedStock.symbol;
    if (stockName) {
      this.loadHistoricalData(stockName);
      
      // Subscribe to WebSocket updates for the selected stock
      this.subscribeToStockWebSocket(stockName).catch(error => {
        console.error('Failed to subscribe to WebSocket:', error);
      });
    }
    
    // CRITICAL FIX: Force metric tiles to refresh with new stock data
    this.forceMetricTilesRefresh();

    // Conditionally fetch previous-day data only when WebSocket is not connected
    if (stockName) {
      // Reset last previous-day fetch when stock changes
      this.lastPrevDayFetchStock = null;
      this.maybeFetchPreviousDay(stockName);
    }
    
    // Trigger change detection and update widgets
    this.populateWidgetsWithInitialData();
    this.cdr.detectChanges();
  }

  /**
   * Force metric tiles to refresh with current stock data
   */
  private forceMetricTilesRefresh(): void {

    
    // CRITICAL FIX: Completely recreate metric tiles with new data
    if (this.dashboardConfig?.widgets) {
      // Find and remove existing metric tiles
      const existingTiles = this.dashboardConfig.widgets.filter(widget => 
        widget.config?.component === 'tile' || widget.config?.component === 'stock-tile'
      );
      
      // Remove existing tiles
      existingTiles.forEach(tile => {
        const index = this.dashboardConfig.widgets.indexOf(tile);
        if (index > -1) {
          this.dashboardConfig.widgets.splice(index, 1);
        }
      });
      
      // Create new metric tiles with current data
      const newMetricTiles = this.createMetricTiles(this.filteredDashboardData || this.dashboardData);
      
      // Add new tiles at the beginning
      this.dashboardConfig.widgets.unshift(...newMetricTiles);
      

    }
    
    // Update metric tiles with current data
    this.updateMetricTilesWithFilters([]);
    
    // Force change detection
    this.cdr.detectChanges();
    
    // Additional refresh after a short delay to ensure tiles are updated
    setTimeout(() => {
      this.updateMetricTilesWithFilters([]);
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Fetch previous-day data for the current stock and update the metric tiles
   */
  private fetchAndUpdateCurrentStockData(): void {
    // Note: This method will be invoked only when selected stock changes and WebSocket is not connected
    if (!this.currentSelectedStockData?.symbol) {
      return;
    }
    
    const stockSymbol = this.currentSelectedStockData.symbol;

    
    // For now, we'll skip this functionality since we don't have a previous-day stock data service
    // In the future, this could be implemented using StockService or a similar service
    console.log(`Previous-day data fetch not implemented for stock: ${stockSymbol}`);
    
    // Update metric tiles with current data
    this.updateMetricTilesWithFilters([]);
    this.cdr.detectChanges();
  }

  /**
   * Conditionally fetch previous-day data only when the WebSocket is not connected
   */
  private maybeFetchPreviousDay(stockName: string): void {
    if (!stockName) {
      return;
    }
    // Only fetch if WebSocket is not connected and we haven't fetched for this stock yet
    if (!this.isWebSocketConnected && this.lastPrevDayFetchStock !== stockName) {
      this.lastPrevDayFetchStock = stockName;
      this.fetchAndUpdateCurrentStockData();
    }
  }

  /**
   * Create metric tiles using stock ticks data and indices data
   * @param data - Dashboard data (not used, we use stockTicksData instead)
   */
  protected createMetricTiles(data: StockDataDto[]): IWidget[] {
    return createMetricTilesFunction(
      this.filteredDashboardData || this.dashboardData, 
      this.currentSelectedStockData,
      this.webSocketService,
      this.indicesService
    );
  }

  /**
   * Override updateMetricTilesWithFilters to use filtered data
   */
  protected override updateMetricTilesWithFilters(filters: any[]): void {
    // Ensure dashboardConfig and widgets exist before proceeding
    if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
      // No widgets available yet; safely exit
      // Optionally, we could schedule a retry, but avoiding repeated retries to prevent loops
      return;
    }

    // Find all tile widgets (both regular tiles and stock tiles)
    const tileWidgets = (this.dashboardConfig?.widgets || []).filter(widget => 
      widget?.config?.component === 'tile' || widget?.config?.component === 'stock-tile'
    );

    if (!tileWidgets.length) {
      // Nothing to update
      return;
    }

    // Create new metric tiles with filtered data - use filteredDashboardData
    const updatedMetricTiles = this.createMetricTiles(this.filteredDashboardData || this.dashboardData);

    // Update each tile widget with new data
    tileWidgets.forEach((widget, index) => {
      if (index < updatedMetricTiles.length) {
        const updatedTile = updatedMetricTiles[index];
        
        // Check if this tile should update on data change
        const currentTileOptions = widget?.config?.options as any;
        const shouldUpdate = currentTileOptions?.updateOnDataChange !== false;
        
        if (shouldUpdate) {
          // Extract tile data properties from the updated tile
          const newTileOptions = updatedTile?.config?.options as any;
          
          if (widget?.config?.component === 'stock-tile') {
            // Handle stock tile updates
            const stockTileData = {
              value: newTileOptions?.value ?? '',
              change: newTileOptions?.change ?? '',
              changeType: newTileOptions?.changeType ?? 'neutral',
              description: newTileOptions?.description ?? '',
              icon: newTileOptions?.icon ?? '',
              color: newTileOptions?.color ?? '',
              backgroundColor: newTileOptions?.backgroundColor ?? '',
              highValue: newTileOptions?.highValue ?? '',
              lowValue: newTileOptions?.lowValue ?? '',
              currency: newTileOptions?.currency ?? '₹'
            };
            
            // Use StockTileBuilder to properly update the stock tile data
            StockTileBuilder.updateData(widget, stockTileData);
          } else {
            // Handle regular tile updates
            const tileData = {
              value: newTileOptions?.value ?? '',
              change: newTileOptions?.change ?? '',
              changeType: newTileOptions?.changeType ?? 'neutral',
              description: newTileOptions?.description ?? '',
              icon: newTileOptions?.icon ?? '',
              color: newTileOptions?.color ?? '',
              backgroundColor: newTileOptions?.backgroundColor ?? '',
              title: newTileOptions?.title ?? '',
              subtitle: newTileOptions?.subtitle ?? newTileOptions?.customData?.subtitle ?? ''
            };
            
            // Use TileBuilder to properly update the tile data
            TileBuilder.updateData(widget, tileData);
          }
        }
      }
    });
    
    // Trigger change detection to ensure tiles are refreshed
    setTimeout(() => {
      this.cdr?.detectChanges?.();
    }, 50);
  }

  protected initializeDashboardConfig(): void {
    try {
      console.log('StockInsightsComponent initializeDashboardConfig called');
      
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
      
      console.log('Industry bar chart created successfully');
      
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

      console.log('Sector pie chart created successfully');
      
      // Stock Price Candlestick Chart - Now shows historical stock data
      const candlestickChart = CandlestickChartBuilder.create()
        .setData(this.filteredDashboardData || [])
        .setHeader('INFY - Stock Historical Price Movement')
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
              // For historical data, we don't filter by symbol since it's all the same stock
              // Just log the click for debugging
              console.log('Candlestick chart clicked:', params);
              return false;
            });
          }
        })
        .setId('candlestick-chart')
        .setSkipDefaultFiltering(true)
        .build();

      console.log('Candlestick chart created successfully');

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

      console.log('Stock list widget created successfully');

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

      console.log('Dashboard config created successfully');

      // Populate widgets with initial data
      this.populateWidgetsWithInitialData();
      
      console.log('StockInsightsComponent initializeDashboardConfig completed');
    } catch (error) {
      console.error('Error initializing dashboard config:', error);
    }
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

    // Trigger immediate fallback data fetch for metric tiles if no valid data
    this.triggerImmediateFallbackDataFetch();

    // Trigger change detection to ensure widgets are updated
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  /**
   * Trigger immediate fallback data fetch for metric tiles if no valid data is available
   */
  private triggerImmediateFallbackDataFetch(): void {
    // Check if we have valid stock data
    if (!this.currentSelectedStockData || 
        !this.currentSelectedStockData.lastPrice || 
        this.currentSelectedStockData.lastPrice === 0) {
      // Only attempt previous-day fetch when WebSocket is not connected
      if (this.isWebSocketConnected) {
        return;
      }

      // Determine target stock name (default to NIFTY 50)
      const stockName = this.currentSelectedStockData?.symbol || 'NIFTY 50';

      // Avoid repeated fetches for the same stock
      if (this.lastPrevDayFetchStock === stockName) {
        return;
      }

      // Skip if offline (no point calling backend without internet)
      try {
        if (typeof navigator !== 'undefined' && 'onLine' in navigator && navigator.onLine === false) {
          if (this.enableDebugLogging) {
            console.warn('Offline detected, skipping previous-day fetch');
          }
          return;
        }
      } catch { /* no-op */ }



      // Mark as fetched for this stock to prevent duplicates
      this.lastPrevDayFetchStock = stockName;

      // Fetch previous-day data
      // For now, we'll skip this functionality since we don't have a previous-day stock data service
      // In the future, this could be implemented using StockService or a similar service
      console.log(`Previous-day data fetch not implemented for stock: ${stockName}`);
      
      // Update metric tiles with current data
      this.updateMetricTilesWithFilters([]);
      this.cdr.detectChanges();
    }
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
      case 'INFY - Stock Historical Price Movement':
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

      case 'INFY - Stock Historical Price Movement':
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
      widget.config?.header?.title === 'INFY - Stock Historical Price Movement'
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
      widget.config?.header?.title === 'INFY - Stock Historical Price Movement'
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
      await this.webSocketService.connect();
    } catch (error: any) {
      // Silent warning - the application should continue to work without WebSocket
      // Tiles will show initial values or fallback data from APIs
    }
  }

  /**
   * Subscribe to WebSocket updates for the selected stock
   * @param stockName - The name of the stock to subscribe to
   */
  private async subscribeToStockWebSocket(stockName: string): Promise<void> {
    // Prevent duplicate subscriptions
    if (this.isSubscribing) {
      return;
    }

    // Check if we're already subscribed to this stock
    const webSocketStockName = stockName.replace(/\s+/g, '-').toLowerCase();
    const topicName = `/topic/nse-stocks/${webSocketStockName}`;
    
    if (this.subscribedTopics.has(topicName)) {
      return;
    }

    // Unsubscribe from previous subscription if any
    if (this.stockWebSocketSubscription) {
      this.stockWebSocketSubscription.unsubscribe();
      this.stockWebSocketSubscription = null;
    }

    // Track the current subscribed stock
    this.currentSubscribedStock = stockName;
    this.isSubscribing = true;

    try {
              // Wait for WebSocket to be connected before attempting subscription
        if (!this.webSocketService.connected) {
        // Wait for connection to be established
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
          }, 10000); // 10 second timeout
          
          const connectionCheck = this.webSocketService.connectionState
            .pipe(filter((state: any) => state === 'CONNECTED'))
            .subscribe({
              next: () => {
                clearTimeout(timeout);
                connectionCheck.unsubscribe();
                resolve();
              },
              error: (error) => {
                clearTimeout(timeout);
                connectionCheck.unsubscribe();
                reject(error);
              }
            });
        });
      }
      
      // Now WebSocket should be connected, verify and subscribe
              if (this.webSocketService.connected) {
        
        // First try to subscribe to specific stock data
        try {
          // For now, we'll skip WebSocket subscription since stock-specific methods don't exist
          // In the future, this could be implemented when stock WebSocket services are available
          console.log(`Stock WebSocket subscription not implemented for ${webSocketStockName}`);
          
          // Mark this topic as subscribed to prevent repeated attempts
          this.subscribedTopics.add(topicName);
          
        } catch (error) {
          console.warn(`Stock subscription failed for ${webSocketStockName}, continuing without real-time data:`, error);
          // Continue without WebSocket subscription
        }
          
      } else {
        // WebSocket still not connected - skipping real-time subscription
        console.warn('WebSocket still not connected - skipping real-time subscription for', webSocketStockName);
      }
    } catch (error) {
      console.warn(`WebSocket subscription failed for ${webSocketStockName} - continuing without real-time data:`, (error as Error).message || error);
      // Don't clear currentSelectedStockData on WebSocket connection failures to prevent tile from reverting
      this.cdr.detectChanges();
    } finally {
      // Always reset the subscribing flag
      this.isSubscribing = false;
    }
  }

  /**
   * Fallback subscription to all stocks data when specific stock subscription fails
   * @param targetStockName - The name of the stock we're looking for
   */
  private subscribeToAllStocksAsFallback(targetStockName: string): void {
    try {
      // For now, we'll skip WebSocket subscription since stock-specific methods don't exist
      // In the future, this could be implemented when stock WebSocket services are available
      console.log(`All stocks WebSocket subscription not implemented for ${targetStockName}`);
      
    } catch (error) {
      console.error('Failed to subscribe to all stocks as fallback:', error);
    }
  }

  /**
   * Handle WebSocket data updates for the selected stock
   * @param stockData - Raw stock data received from WebSocket
   * @param stockName - The name of the stock being monitored
   */
  private handleWebSocketData(stockData: any, stockName: string): void {
    try {

      
      // The WebSocket now returns raw stock data directly, not wrapped in IndicesDto
      if (stockData && (stockData.stockName || stockData.stockSymbol)) {
        
        
        // Update current selected stock data with real-time information
        this.currentSelectedStockData = stockData;
        
        // Check if dashboard is ready before updating
        if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
          console.warn('Dashboard not ready yet, deferring first tile update');
          // Schedule the update for later
          setTimeout(() => {
            this.updateFirstTileWithRealTimeData(stockData);
          }, 1000);
          return;
        }
        
        // Throttle UI updates to avoid excessive re-initializations
        if (this.chartUpdateTimer) {
          return; // A recent update is in progress; skip this tick
        }
        this.chartUpdateTimer = setTimeout(() => {
          try {
            // Update the first tile (stock price tile) with real-time data
            this.updateFirstTileWithRealTimeData(stockData);
            // Update metric tiles in-place with new data (non-destructive)
            this.recreateMetricTiles();
            // Trigger change detection
            this.cdr.detectChanges();
          } finally {
            this.chartUpdateTimer = null;
          }
        }, 250);
      } else {
        console.warn('WebSocket received data but no valid stock data found:', stockData);
      }
    } catch (error: any) {
      console.error('Error processing received stock data:', error);
    }
  }

  /**
   * Attempt to reconnect to WebSocket and resubscribe to current stock
   */
  private async attemptWebSocketReconnection(): Promise<void> {
    if (!this.currentSubscribedStock) {
      return;
    }

    try {

      await this.webSocketService.connect();
      
              if (this.webSocketService.connected) {
        this.subscribeToStockWebSocket(this.currentSubscribedStock);
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
   * Update the first tile (stock price tile) with real-time WebSocket data
   * @param realTimeStockData - Real-time stock data from WebSocket
   */
  private updateFirstTileWithRealTimeData(realTimeStockData: StockDataDto): void {
    // Wait for dashboard to be ready
    if (!this.dashboardConfig?.widgets || this.dashboardConfig.widgets.length === 0) {
      // Wait for dashboard to be ready and retry
      setTimeout(() => {
        this.updateFirstTileWithRealTimeData(realTimeStockData);
      }, 500);
      return;
    }

    // Find the first tile (stock price tile) - try multiple strategies
    let firstTile = this.dashboardConfig.widgets.find(widget =>
      widget.position?.x === 0 && widget.position?.y === 0 &&
      (widget.config?.component === 'stock-tile' || widget.config?.component === 'tile')
    );

    // If not found at (0,0), try to find any stock-tile or tile
    if (!firstTile) {
      firstTile = this.dashboardConfig.widgets.find(widget =>
        widget.config?.component === 'stock-tile' || widget.config?.component === 'tile'
      );
    }

    // If still not found, try to find by title
    if (!firstTile) {
      firstTile = this.dashboardConfig.widgets.find(widget =>
        widget.config?.header?.title?.toLowerCase().includes('nifty') ||
        widget.config?.header?.title?.toLowerCase().includes('index') ||
        widget.config?.header?.title?.toLowerCase().includes('price')
      );
    }

    if (!firstTile) {
      console.warn('No suitable tile found for real-time updates');
      return;
    }



    if (!realTimeStockData) {
      console.warn('No real-time stock data available for first tile update');
      return;
    }

    try {
      // Extract real-time data using WebSocket field names
      const stockName = realTimeStockData.symbol || 'Stock';
      const lastPrice = realTimeStockData.lastPrice || 0;
      const percentChange = realTimeStockData.percentChange || 0;
      const dayHigh = realTimeStockData.dayHigh || 0;
      const dayLow = realTimeStockData.dayLow || 0;
      const priceChange = realTimeStockData.priceChange || 0;



      if (firstTile.config?.component === 'stock-tile') {
        // Update stock tile with real-time data using exact WebSocket fields
        const stockTileData = {
          value: lastPrice.toFixed(2),
          change: priceChange.toFixed(2), // Use priceChange field from WebSocket
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: stockName, // Use stockName from WebSocket
          icon: 'fas fa-chart-line',
          color: percentChange >= 0 ? '#16a34a' : '#dc2626',
          backgroundColor: percentChange >= 0 ? '#bbf7d0' : '#fecaca',
          highValue: dayHigh.toFixed(2), // Use dayHigh from WebSocket
          lowValue: dayLow.toFixed(2), // Use dayLow from WebSocket
          currency: '₹'
        };



        // Use StockTileBuilder to properly update the stock tile data
        StockTileBuilder.updateData(firstTile, stockTileData);

        // Also update the widget data property directly
        firstTile.data = { ...firstTile.data, ...stockTileData };


      } else {
        // Update regular tile with real-time data
        const tileData = {
          value: lastPrice.toFixed(2),
          change: priceChange.toFixed(2),
          changeType: (percentChange >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' | 'neutral',
          description: stockName,
          icon: 'fas fa-chart-line',
          color: percentChange >= 0 ? '#16a34a' : '#dc2626',
          backgroundColor: percentChange >= 0 ? '#bbf7d0' : '#fecaca',
          title: stockName,
          subtitle: `Change: ${percentChange.toFixed(2)}%`
        };

        // Use TileBuilder to properly update the tile data
        TileBuilder.updateData(firstTile, tileData);

        // Also update the widget data property directly
        firstTile.data = { ...firstTile.data, ...tileData };


      }

      // Force change detection for OnPush strategy
      this.cdr.markForCheck();
      this.cdr.detectChanges();

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
  }
  
  /**
   * Public method to force tile refresh (called from dashboard header)
   */
  public forceTileRefresh(): void {
    console.log('🔄 Manual tile refresh triggered from dashboard header');
    
    // Safe refresh: update tiles and trigger change detection
    this.updateMetricTilesWithFilters([]);
    this.cdr.markForCheck();
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.cdr.detectChanges();
      console.log('🔄 Manual tile refresh completed');
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
    this.webSocketConnectionStateSubscription = this.webSocketService.connectionState
      .subscribe({
        next: (state: any) => {
          this.isWebSocketConnected = state === 'CONNECTED';
          
          if (this.isWebSocketConnected) {
            // Only resubscribe if we have a current subscribed stock AND we're not already subscribed
            if (this.currentSubscribedStock && !this.isSubscribing) {
              const webSocketStockName = this.currentSubscribedStock.replace(/\s+/g, '-').toLowerCase();
              const topicName = `/topic/nse-stocks/${webSocketStockName}`;
              
              if (!this.subscribedTopics.has(topicName)) {
                
                this.subscribeToStockWebSocket(this.currentSubscribedStock);
                              } else {
                  // Already subscribed to topic, no need to resubscribe
                }
            }
          } else if (state === 'DISCONNECTED' || state === 'ERROR') {
            // Clear subscribed topics when disconnected
            this.subscribedTopics.clear();
            // Attempt reconnection if we have a subscribed stock
            if (this.currentSubscribedStock) {
              this.attemptWebSocketReconnection();
            }
          }
        },
        error: (error) => {
          console.error('WebSocket connection state monitoring error:', error);
          this.isWebSocketConnected = false;
          // Clear subscribed topics on error
          this.subscribedTopics.clear();
          // Attempt reconnection on error
          if (this.currentSubscribedStock) {
            this.attemptWebSocketReconnection();
          }
        }
      });
  }

  /**
   * Public method to switch to a different stock
   * @param stockSymbol The stock symbol to switch to (e.g., 'RELIANCE', 'TCS', 'HDFC')
   */
  public switchToStock(stockSymbol: string): void {
    if (!stockSymbol || stockSymbol.trim() === '') {
      console.warn('Invalid stock symbol provided');
      return;
    }

    console.log(`Switching to stock: ${stockSymbol}`);
    
    // Update dashboard title
    this.dashboardTitle = `${stockSymbol} - Stock Insights Dashboard`;
    
    // Clear existing data
    this.dashboardData = [];
    this.filteredDashboardData = [];
    this.historicalData = [];
    this.appliedFilters = [];
    
    // Load new stock data using the date-range endpoint
    this.loadStockTicksData(stockSymbol);
    this.loadHistoricalData(stockSymbol); // This now uses /stock/{symbol}/history with date range
    
    // Update current selected stock data
    this.currentSelectedStockData = {
      symbol: stockSymbol,
      lastPrice: 0, // Will be updated when data loads
      priceChange: 0,
      percentChange: 0
    } as StockDataDto;
    
    // Force refresh of all widgets
    this.forceDashboardRefresh();
    
    // Trigger change detection
    this.cdr.detectChanges();
  }

  /**
   * Handle stock selection change from the dropdown
   * @param event The change event from the select element
   */
  public onStockSelectionChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    if (selectElement && selectElement.value) {
      this.switchToStock(selectElement.value);
    }
  }

}
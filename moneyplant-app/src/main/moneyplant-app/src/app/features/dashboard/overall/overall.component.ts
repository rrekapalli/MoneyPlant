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
  StockListData
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

/**
 * Filter criteria interface for centralized filtering system
 * This interface defines the structure for filters that can be applied across all widgets
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
 * OverallComponent - Financial Dashboard with Centralized Filtering System
 * 
 * This component implements a centralized filtering system that provides consistent
 * filtering behavior across all widgets and charts. The system works as follows:
 * 
 * ARCHITECTURE:
 * - stockTicksData: Original unfiltered data source
 * - filteredStockData: Single filtered data source used by all widgets
 * - appliedFilters: Array tracking all active filters from different widgets
 * 
 * FILTERING FLOW:
 * 1. User clicks on chart elements (pie slices, bar segments, etc.)
 * 2. Click handlers call addFilter() with appropriate FilterCriteria
 * 3. addFilter() manages the appliedFilters array and calls applyFilters()
 * 4. applyFilters() processes all filters sequentially on original data
 * 5. filteredStockData is updated with the result
 * 6. All widgets are refreshed using the same filtered data source
 * 
 * BENEFITS:
 * - Consistent filtering across all widgets
 * - Cumulative filtering (multiple filters can be applied simultaneously)
 * - Single source of truth for filtered data
 * - Easy filter management (add, remove, clear all)
 * - Prevents filter conflicts and data inconsistencies
 * 
 * USAGE:
 * - Chart click handlers use filterChartsByIndustry(), filterChartsBySector()
 * - Filters can be cleared using clearAllChartFilters()
 * - All widgets automatically update when filters change
 */
export class OverallComponent extends BaseDashboardComponent<StockDataDto> {
  // Shared dashboard data - Flat structure (implements abstract property)
  protected dashboardData: StockDataDto[] = [];
  protected readonly initialDashboardData: StockDataDto[] = [];

  // Add a static log when class is loaded
  static {
    console.log('🎯 OverallComponent class loaded!');
  }


  // // Stock ticks data storage
  // protected stockTicksData: StockDataDto[] | null = [];

  // Filtered stock data for cross-chart filtering
  protected filteredDashboardData: StockDataDto[] | null = this.dashboardData || [];

  /**
   * Central applied filters array to track all active filters
   * This array maintains all filters currently applied across different widgets
   * Each filter is applied sequentially to create cumulative filtering effect
   */
  protected appliedFilters: FilterCriteria[] = [];
  
  // Dashboard title - dynamic based on selected index
  public dashboardTitle: string = 'Financial Dashboard';
  
  // Subscription management
  private selectedIndexSubscription: Subscription | null = null;

  constructor(
    cdr: ChangeDetectorRef,
    excelExportService: ExcelExportService,
    filterService: FilterService,
    private componentCommunicationService: ComponentCommunicationService,
    private stockTicksService: StockTicksService
  ) {
    super(cdr, excelExportService, filterService);
    
    console.log('🚀 OverallComponent constructor initialized!');
    
    // Make test methods available globally for debugging
    if (typeof window !== 'undefined') {
      (window as any).debugOverall = {
        testManualFilter: (industry?: string) => this.testManualFilter(industry),
        clearAllFilters: () => this.clearAllFilters(),
        showCurrentData: () => {
          console.log('📊 Original data:', this.dashboardData);
          console.log('📊 Filtered data:', this.filteredDashboardData);
          console.log('📊 Applied filters:', this.appliedFilters);
        },
        showAvailableValues: () => {
          if (this.dashboardData && this.dashboardData.length > 0) {
            console.log('📋 Available industries:', [...new Set(this.dashboardData.map(s => s.industry))]);
            console.log('📋 Available sectors:', [...new Set(this.dashboardData.map(s => s.sector))]);
            console.log('📋 Available macros:', [...new Set(this.dashboardData.map(s => s.macro))]);
          } else {
            console.log('❌ No data available yet');
          }
        },
        simpleTest: () => {
          console.log('✅ SIMPLE TEST: OverallComponent is working!');
          console.log('✅ Dashboard data count:', this.dashboardData?.length || 0);
          console.log('✅ Filtered data count:', this.filteredDashboardData?.length || 0);
          console.log('✅ Applied filters count:', this.appliedFilters?.length || 0);
          return 'Debug methods are working!';
        },
        testStockListUpdate: () => {
          console.log('🧪 Testing stock list update manually...');
          this.updateStockListWithFilteredData();
          return 'Stock list update triggered!';
        },
        inspectStockListWidgets: () => {
          const stockListWidgets = this.dashboardConfig?.widgets?.filter(widget => 
            widget.config?.component === 'stock-list-table'
          ) || [];
          
          console.log(`🔍 Found ${stockListWidgets.length} stock list widgets:`);
          stockListWidgets.forEach((widget, index) => {
            console.log(`Widget ${index + 1}:`, {
              id: widget.id,
              title: widget.config?.header?.title,
              component: widget.config?.component,
              hasData: !!widget.data,
              stocksCount: widget.data?.stocks?.length || 0,
              isLoading: widget.data?.isLoadingStocks
            });
          });
          
          return `Found ${stockListWidgets.length} stock list widgets`;
        },
        debugFilterFlow: () => {
          console.log('🔍 FILTER FLOW DEBUG:');
          console.log('📊 Original data count:', this.dashboardData?.length || 0);
          console.log('📊 Filtered data count:', this.filteredDashboardData?.length || 0);
          console.log('📊 Applied filters:', this.appliedFilters);
          
          const stockListWidgets = this.dashboardConfig?.widgets?.filter(widget => 
            widget.config?.component === 'stock-list-table'
          ) || [];
          
          stockListWidgets.forEach((widget, index) => {
            console.log(`📋 Stock List Widget ${index + 1}:`, {
              id: widget.id,
              currentStocks: widget.data?.stocks?.length || 0,
              expectedStocks: this.filteredDashboardData?.length || 0,
              dataMatches: (widget.data?.stocks?.length || 0) === (this.filteredDashboardData?.length || 0)
            });
          });
          
          return 'Filter flow debug complete - check console logs';
        },
        recreateDashboard: () => {
          console.log('🔧 MANUAL DASHBOARD RECREATION:');
          console.log('📊 Current data count:', this.dashboardData?.length || 0);
          
          if (!this.dashboardData || this.dashboardData.length === 0) {
            console.warn('❌ No data available for dashboard recreation');
            return 'No data available';
          }
          
          console.log('🔧 Recreating dashboard config...');
          this.initializeDashboardConfig();
          
          console.log('🔧 Updating all charts...');
          this.updateAllChartsWithFilteredData();
          
          console.log('🔧 Triggering change detection...');
          this.cdr.detectChanges();
          
          return 'Dashboard recreated successfully';
        },
        testClickFiltering: (industry = 'Iron & Steel') => {
          console.log(`🧪 MANUAL CLICK FILTERING TEST: Testing with industry "${industry}"`);
          
          if (!this.dashboardData || this.dashboardData.length === 0) {
            console.warn('❌ No data available for filtering test');
            return 'No data available';
          }
          
          console.log('🧪 Simulating bar chart click...');
          console.log('🧪 Current data before filter:', this.filteredDashboardData?.length || 0, 'records');
          
          // Directly call the filtering method
          this.filterChartsByIndustry(industry);
          
          console.log('🧪 Data after filter:', this.filteredDashboardData?.length || 0, 'records');
          
          return `Filtering test completed for "${industry}"`;
        },
        checkDashboardState: () => {
          console.log('🔍 DASHBOARD STATE CHECK:');
          console.log('📊 Dashboard config exists:', !!this.dashboardConfig);
          console.log('📊 Widget count:', this.dashboardConfig?.widgets?.length || 0);
          console.log('📊 Dashboard data count:', this.dashboardData?.length || 0);
          console.log('📊 Filtered data count:', this.filteredDashboardData?.length || 0);
          console.log('📊 Applied filters count:', this.appliedFilters?.length || 0);
          
          if (this.dashboardConfig?.widgets) {
            this.dashboardConfig.widgets.forEach((widget, index) => {
              console.log(`📋 Widget ${index + 1}:`, {
                id: widget.id,
                title: widget.config?.header?.title,
                component: widget.config?.component,
                hasData: !!widget.data,
                position: widget.position
              });
            });
          }
          
          return 'Dashboard state check complete - see console logs';
        },
        inspectChartInstances: () => {
          console.log('🔍 CHART INSTANCES INSPECTION:');
          
          if (!this.dashboardConfig?.widgets) {
            console.warn('❌ No dashboard widgets found');
            return 'No widgets found';
          }
          
          const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
            widget.config?.component === 'echart'
          );
          
          console.log(`📊 Found ${echartWidgets.length} echart widgets`);
          
          echartWidgets.forEach((widget, index) => {
            console.log(`📊 Widget ${index + 1}:`, {
              id: widget.id,
              title: widget.config?.header?.title,
              hasChartInstance: !!widget.chartInstance,
              chartInstanceType: typeof widget.chartInstance,
              hasOnMethod: widget.chartInstance && typeof widget.chartInstance.on === 'function'
            });
            
            if (widget.chartInstance) {
              console.log(`📊 Widget ${index + 1} chart instance:`, widget.chartInstance);
            }
          });
          
          return 'Chart instances inspection complete - see console logs';
        },
        testClearFilters: () => {
          console.log('🧪 MANUAL CLEAR FILTERS TEST:');
          console.log('🧪 Before clear - Applied filters:', this.appliedFilters?.length || 0);
          console.log('🧪 Before clear - Filtered data count:', this.filteredDashboardData?.length || 0);
          console.log('🧪 Before clear - Original data count:', this.dashboardData?.length || 0);
          
          this.clearAllFilters();
          
          console.log('🧪 After clear - Applied filters:', this.appliedFilters?.length || 0);
          console.log('🧪 After clear - Filtered data count:', this.filteredDashboardData?.length || 0);
          console.log('🧪 After clear - Original data count:', this.dashboardData?.length || 0);
          
          return 'Clear filters test completed - check console logs';
        },
        forceChartUpdate: () => {
          console.log('🔧 MANUAL FORCE CHART UPDATE:');
          console.log('🔧 Current filtered data count:', this.filteredDashboardData?.length || 0);
          
          if (!this.filteredDashboardData || this.filteredDashboardData.length === 0) {
            console.warn('❌ No filtered data available for update');
            return 'No data available';
          }
          
          this.updateAllChartsWithFilteredData();
          
          return 'Force chart update completed - charts should refresh now';
        },
        fixCustomClickHandlers: () => {
          console.log('🔧 MANUAL FIX CUSTOM CLICK HANDLERS:');
          
          if (!this.dashboardConfig?.widgets) {
            console.warn('❌ No dashboard widgets found');
            return 'No widgets found';
          }
          
          const echartWidgets = this.dashboardConfig.widgets.filter(widget => 
            widget.config?.component === 'echart'
          );
          
          console.log(`📊 Found ${echartWidgets.length} echart widgets`);
          
          echartWidgets.forEach((widget, index) => {
            const title = widget.config?.header?.title;
            console.log(`📊 Widget ${index + 1}: ${title}`, {
              hasChartInstance: !!widget.chartInstance,
              chartInstanceType: typeof widget.chartInstance
            });
            
            if (widget.chartInstance && typeof widget.chartInstance.on === 'function') {
              console.log(`🔧 Manually attaching click handler to ${title}`);
              
              // Remove existing handlers
              widget.chartInstance.off('click');
              
              // Add new handler based on chart type
              if (title === 'Industry') {
                widget.chartInstance.on('click', (params: any) => {
                  console.log('🔥🔥🔥 MANUAL INDUSTRY CLICK HANDLER TRIGGERED! 🔥🔥🔥');
                  console.log('📊 Click params:', params);
                  
                  const industryName = params.name || (params.data && params.data.name);
                  if (industryName && typeof industryName === 'string' && isNaN(Number(industryName))) {
                    console.log('✅ Valid industry name found:', industryName);
                    this.filterChartsByIndustry(industryName);
                  } else {
                    console.error('❌ Invalid industry name:', industryName);
                  }
                });
                console.log(`✅ Attached industry click handler to ${title}`);
              } else if (title === 'Sector Allocation') {
                widget.chartInstance.on('click', (params: any) => {
                  console.log('🔥🔥🔥 MANUAL SECTOR CLICK HANDLER TRIGGERED! 🔥🔥🔥');
                  console.log('📊 Click params:', params);
                  
                  const sectorName = params.name || (params.data && params.data.name);
                  if (sectorName && typeof sectorName === 'string' && isNaN(Number(sectorName))) {
                    console.log('✅ Valid sector name found:', sectorName);
                    this.filterChartsBySector(sectorName);
                  } else {
                    console.error('❌ Invalid sector name:', sectorName);
                  }
                });
                console.log(`✅ Attached sector click handler to ${title}`);
              }
            } else {
              console.warn(`⚠️ Widget ${title} has no chart instance or on method`);
            }
          });
          
          return 'Custom click handlers fixed - try clicking charts now';
        },
        testDirectClicks: () => {
          console.log('🧪 TESTING DIRECT CHART CLICKS:');
          
          // Test industry filtering
          console.log('🧪 Testing industry filtering with "Iron & Steel"...');
          this.filterChartsByIndustry('Iron & Steel');
          
          setTimeout(() => {
            console.log('🧪 Testing clear filters...');
            this.clearAllFilters();
            
            setTimeout(() => {
              console.log('🧪 Testing sector filtering with "Metals & Mining"...');
              this.filterChartsBySector('Metals & Mining');
            }, 1000);
          }, 2000);
          
          return 'Direct click test sequence started - watch console logs';
        }
      };
      console.log('🛠️ Debug methods attached to window.debugOverall');
    }
  }

  override ngOnInit(): void {
    console.log('🚀 OverallComponent ngOnInit called');
    
    // Call parent ngOnInit if it exists
    super.ngOnInit?.();
    
    // Load initial stock ticks data - you can modify this to use a default index symbol
    // For now, we'll let the component communication service handle the initial load
    // this.loadStockTicksData('NIFTY50'); // Uncomment and set default symbol if needed
  }

  // Implement abstract methods from BaseDashboardComponent
  protected onChildInit(): void {
    // Register world map for density map charts
    import('echarts-map-collection/custom/world.json').then((worldMapData) => {
      DensityMapBuilder.registerMap('world', worldMapData.default || worldMapData);
    }).catch((error) => {
      // Handle world map loading error silently
    });

    // Clear any existing subscription to prevent memory leaks
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }

    // Reset centralized filters but keep dashboard data intact 
    // (dashboard was just created in parent ngOnInit)
    this.appliedFilters = [];
    
    console.log('🔧 onChildInit: Preserving dashboard data for existing charts');
    
    // Reset dashboard title
    this.dashboardTitle = 'Financial Dashboard';
    
    // Clear any existing selected index data to prevent stale data issues
    this.componentCommunicationService.clearSelectedIndex();

    console.log('🔧 onChildInit: Skipping clearAllWidgetsData() to preserve newly created dashboard');

    // Subscribe to selected index data changes and store the subscription
    this.selectedIndexSubscription = this.componentCommunicationService.getSelectedIndex().subscribe(selectedIndex => {
      if (selectedIndex) {
        this.updateDashboardWithSelectedIndex(selectedIndex);
      } else {
        // If no selected index, load NIFTY 50 by default
        this.loadDefaultNifty50Data();
      }
    });

    // Load NIFTY 50 data by default on initial load
    setTimeout(() => {
      const currentSelectedIndex = this.componentCommunicationService.getSelectedIndex();
      // Check if there's no current selected index, then load default
      if (!currentSelectedIndex) {
        this.loadDefaultNifty50Data();
      }
    }, 100);
  }

  protected onChildDestroy(): void {
    // Unsubscribe from selected index subscription to prevent memory leaks
    if (this.selectedIndexSubscription) {
      this.selectedIndexSubscription.unsubscribe();
      this.selectedIndexSubscription = null;
    }
    
    // Clear stock ticks data and reset filters
    this.dashboardData = [];
    this.filteredDashboardData = null;
    this.appliedFilters = [];
  }

  /**
   * Load default NIFTY METAL data when no index is selected
   */
  private loadDefaultNifty50Data(): void {
    console.log('🚀 loadDefaultNifty50Data: Starting to load default NIFTY METAL data');
    
    // Set dashboard title for NIFTY METAL
    this.dashboardTitle = 'NIFTY METAL - Financial Dashboard';
    
    // Create default NIFTY METAL selected index data
    const defaultNiftyMetalData: SelectedIndexData = {
      id: 'NIFTYMETAL',
      symbol: 'NIFTY METAL',
      name: 'NIFTY-METAL',
      lastPrice: 0,
      variation: 0,
      percentChange: 0,
      keyCategory: 'Index'
    };
    
    console.log('🚀 loadDefaultNifty50Data: Created default data:', defaultNiftyMetalData);
    
    // Update dashboard with NIFTY METAL data
    this.updateDashboardWithSelectedIndex(defaultNiftyMetalData);
  }

  /**
   * Load stock ticks data for the given index symbol
   * @param indexSymbol The symbol of the index to fetch stock ticks data for
   */
  private loadStockTicksData(indexSymbol: string): void {
    if (indexSymbol && indexSymbol.trim()) {
      this.stockTicksService.getStockTicksByIndex(indexSymbol).subscribe({
        next: (stockTicksData: StockDataDto[]) => {
          // Check if we received empty or null data
          if (!stockTicksData || stockTicksData.length === 0) {
            stockTicksData = [];
          }
          
          // Store the stock ticks data
          this.dashboardData = stockTicksData;
          
          // DEBUG: Log sample data structure to understand field names and values
          if (stockTicksData && stockTicksData.length > 0) {
            console.log(`📈 loadStockTicksData: Loaded ${stockTicksData.length} records`);
            console.log(`📈 loadStockTicksData: Sample record structure:`, stockTicksData[0]);
            console.log(`📈 loadStockTicksData: Available industries:`, [...new Set(stockTicksData.map(s => s.industry))].slice(0, 10));
            console.log(`📈 loadStockTicksData: Available sectors:`, [...new Set(stockTicksData.map(s => s.sector))].slice(0, 10));
          } else {
            console.log(`❌ loadStockTicksData: No data received`);
          }
          
          // Reset all filters when new data is loaded
          this.appliedFilters = [];
          
          // Initialize filtered data with original data (no filters applied)
          this.filteredDashboardData = stockTicksData;

          // Update metric tiles with the new stock data
          this.updateMetricTilesWithFilters([]);
          
          // Dashboard config was created during initialization - now populate widgets with actual data
          console.log('🔧 loadStockTicksData: Populating widgets with actual data');
          this.populateWidgetsWithInitialData();
          
          // Update all widgets with the new stock data using centralized system
          this.updateAllChartsWithFilteredData();
          
          // Trigger change detection after receiving stock data
          this.cdr.detectChanges();
        },
        error: (error) => {
          // Use fallback sample data when service fails
          this.dashboardData = [];
          this.filteredDashboardData = [];
          this.appliedFilters = [];
          
          // Update widgets with fallback data
          this.updateMetricTilesWithFilters([]);
          this.updateAllChartsWithFilteredData();
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
    
    // Fetch stock ticks data for the selected index
    // Extract symbol from selectedIndex object
    const indexSymbol = selectedIndex.symbol;
    this.loadStockTicksData(indexSymbol);
    
    // Trigger change detection and update widgets
    this.populateWidgetsWithInitialData();
    this.cdr.detectChanges();
  }

  /**
   * Create metric tiles using stock ticks data
   * @param data - Dashboard data (not used, we use stockTicksData instead)
   */
  protected createMetricTiles(data: StockDataDto[]): IWidget[] {
    return createMetricTilesFunction(this.dashboardData);
  }

  /**
   * Initialize dashboard config using the Enhanced Chart Builders
   */
  protected initializeDashboardConfig(): void {
    console.log('🔧 initializeDashboardConfig: Starting dashboard initialization');
    console.log('🔧 initializeDashboardConfig: Current dashboardData:', this.dashboardData?.length || 0, 'records');
    console.log('🔧 initializeDashboardConfig: Current filteredDashboardData:', this.filteredDashboardData?.length || 0, 'records');
    
    // Create widgets using enhanced chart builders - charts will be updated with data when it loads

    // Stock Industry Horizontal Bar Chart
    console.log('🔧 initializeDashboardConfig: Creating Industry bar chart with data:', this.filteredDashboardData?.length || 0, 'records');
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
        .setFilterColumn('industry')
        .setEvents((widget, chart) => {
          if (chart) {
            console.log('🔧 Setting up CUSTOM click handler for Industry bar chart');
            console.log('🔧 Chart instance for Industry bar chart:', chart);
            console.log('🔧 Chart instance type:', typeof chart);
            console.log('🔧 Chart has on method:', typeof chart.on === 'function');
            
            // Remove any existing click handlers to prevent conflicts
            chart.off('click');
            
            chart.on('click', (params: any) => {
              console.log('🔥🔥🔥 INDUSTRY BAR CHART CLICKED! Event triggered! 🔥🔥🔥');
              // Prevent the default dashboard click handler from running
              params.event?.stop?.();
              
              // Debug what we're getting from the click event
              console.log('📊 Bar chart click - FULL params object:', params);
              console.log('📊 Bar chart click params breakdown:', {
                name: params.name,
                value: params.value,
                data: params.data,
                dataIndex: params.dataIndex,
                componentType: params.componentType,
                seriesType: params.seriesType,
                seriesIndex: params.seriesIndex,
                dataType: params.dataType
              });
              
              // Check if name is numeric (which would be wrong)
              if (params.name && !isNaN(Number(params.name))) {
                console.error('❌ ERROR: Bar chart click received NUMERIC name value:', params.name, 'This should be a string industry name!');
                console.log('📊 Full params object for numeric name issue:', params);
              }
              
              // Filter by industry when bar is clicked
              // Ensure we're using the name (industry name) not the value
              const industryName = params.name || (params.data && params.data.name);
              if (industryName && typeof industryName === 'string' && isNaN(Number(industryName))) {
                console.log('✅ Bar chart click - Valid industry name found:', industryName);
                this.filterChartsByIndustry(industryName);
              } else {
                console.error('❌ ERROR: No valid industry name found in click params. Expected string, got:', industryName, typeof industryName);
                console.log('📊 Full params for debugging:', params);
              }
              
              // Return false to prevent event bubbling
              return false;
            });
          }
        })
        .build();
    
    // Mark this widget as using custom filtering and assign ID
    barStockIndustry.id = 'industry-bar-chart';
    barStockIndustry.config = barStockIndustry.config || {};
    (barStockIndustry.config as any).skipDefaultFiltering = true;
    
    // Stock Sector Allocation Pie Chart with financial display
    const pieStockSector = PieChartBuilder.create()
      .setData(this.filteredDashboardData) // Use filtered data for consistent filtering
      .setHeader('Sector Allocation')
      .setShowLegend(false)
      .setDonutStyle('40%', '70%')
      .setFinancialDisplay('INR', 'en-US')
      .setPredefinedPalette('finance')
      .setAccessor('sector')
      .setFilterColumn('sector')
              .setEvents((widget, chart) => {
          if (chart) {
            console.log('🔧 Setting up CUSTOM click handler for Sector pie chart');
            console.log('🔧 Chart instance for Sector pie chart:', chart);
            console.log('🔧 Chart instance type:', typeof chart);
            console.log('🔧 Chart has on method:', typeof chart.on === 'function');
            
            // Remove any existing click handlers to prevent conflicts
            chart.off('click');
            
            chart.on('click', (params: any) => {
              console.log('🔥🔥🔥 SECTOR PIE CHART CLICKED! Event triggered! 🔥🔥🔥');
              // Prevent the default dashboard click handler from running
              params.event?.stop?.();
              
              // Debug what we're getting from the click event
              console.log('🥧 Pie chart click params:', {
                name: params.name,
                value: params.value,
                data: params.data,
                dataIndex: params.dataIndex
              });
              
              // Filter by sector when pie slice is clicked
              // Ensure we're using the name (sector name) not the value
              const sectorName = params.name || (params.data && params.data.name);
              if (sectorName && typeof sectorName === 'string' && isNaN(Number(sectorName))) {
                console.log('✅ Pie chart click - Valid sector name found:', sectorName);
                this.filterChartsBySector(sectorName);
              } else {
                console.warn('⚠️ No valid sector name found in click params:', params);
              }
              
              // Return false to prevent event bubbling
              return false;
            });
        }
      })
      .build();

    // Mark this widget as using custom filtering and assign ID
    pieStockSector.id = 'sector-pie-chart';
    pieStockSector.config = pieStockSector.config || {};
    (pieStockSector.config as any).skipDefaultFiltering = true;

    // Portfolio Distribution Treemap
    // const treemapChart = TreemapChartBuilder.create()
    //   .setData(this.filteredDashboardData) // Start with empty data, will be populated when stock data loads
    //   .setHeader('Portfolio Distribution')
    //   .setPortfolioConfiguration()
    //   .setItemStyle('#fff', 1, 1)
    //   .setFinancialDisplay('INR', 'en-US')
    //   .setAccessor('industry')
    //   .setFilterColumn('industry')
    //   .setEvents((widget, chart) => {
    //     if (chart) {
    //       chart.on('click', (params: any) => {
    //         // Filter by industry category when treemap is clicked
    //         this.filterChartsByIndustry(params.name);
    //       });
    //     }
    //   })
    //   .build();

    // Stock List Widget - Initialize with empty data, will be populated later
    const stockListWidget = StockListChartBuilder.create()
      .setData(this.filteredDashboardData) // Start with empty data, will be populated when stock data loads
      .setStockPerformanceConfiguration()
      .setHeader('Stock List')
      .setCurrencyFormatter('₹', 'en-IN')
      .setPredefinedPalette('finance')
      .setAccessor('symbol')
      .setFilterColumn('symbol')
      .build();
    
    // Assign ID to stock list widget
    stockListWidget.id = 'stock-list-widget';

    const filterWidget = createFilterWidget();
    const metricTiles = this.createMetricTiles([]);

    // Position filter widget at row 1 (below metric tiles)
    filterWidget.position = { x: 0, y: 1, cols: 12, rows: 1 };

    // Position charts with proper spacing to avoid overlap
    barStockIndustry.position = { x: 0, y: 2, cols: 4, rows: 8 };
    
    pieStockSector.position = { x: 4, y: 2, cols: 4, rows: 8 };
    //treemapChart.position = { x: 0, y: 3, cols: 4, rows: 8 };
    stockListWidget.position = { x: 8, y: 2, cols: 4, rows: 12 };
    
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
        //treemapChart,
        stockListWidget,
      ])
      .setEditMode(false)
      .build();

    // Populate widgets with initial data
    this.populateWidgetsWithInitialData();
    
    console.log('🔧 initializeDashboardConfig: Dashboard initialization completed successfully');
    console.log('🔧 initializeDashboardConfig: Created dashboard with', this.dashboardConfig?.widgets?.length || 0, 'widgets');
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

    const seriesType = chartOptions.series[0].type;
    const mapType = chartOptions.series[0].map;

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
    let filteredData = this.filteredDashboardData || this.dashboardData;
    
    if (filters && filters.length > 0) {
      // Use the enhanced filtering from the base chart builder
      const dataFilters = filters.map(filter => ({
        property: filter.filterColumn || 'industry',
        operator: 'equals' as const,
        value: filter.value
      }));
      
      filteredData = ApacheEchartBuilder.applyFilters(filteredData, dataFilters);
    }

    // Update all chart widgets with filtered data
    const chartWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'echart'
    );

    this.updateAllChartsWithFilteredData();

    // Update metric tiles
    this.updateMetricTilesWithFilters(filters);

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

  /**
   * Central method to apply all filters to stock data
   * This is the core method of the centralized filtering system that:
   * 1. Takes the original dashboardData as input
   * 2. Applies each filter in appliedFilters array sequentially
   * 3. Updates filteredDashboardData with the result
   * 4. If no filters are applied, reassigns dashboardData to filteredDashboardData
   * 5. Triggers updates to all dependent widgets/charts
   * 
   * This ensures all widgets use the same filtered data source for consistency
   */
  private applyFilters(): void {
    console.log(`🔍 DEBUG: applyFilters: Starting with ${this.appliedFilters.length} filter(s): ${JSON.stringify(this.appliedFilters)}`);
    console.log(`🔍 DEBUG: applyFilters: Original data count: ${this.dashboardData?.length || 0}`);

    // If no original data, return early
    if (!this.dashboardData || this.dashboardData.length === 0) {
      console.log(`🔍 DEBUG: applyFilters: No original data, setting empty filtered data`);
      this.filteredDashboardData = [];
      this.updateAllChartsWithFilteredData();
      return;
    }

    // If no filters are applied, reassign original data to filtered data
    if (this.appliedFilters.length === 0) {
      console.log(`🔍 DEBUG: applyFilters: No filters, using original data (${this.dashboardData.length} records)`);
      this.filteredDashboardData = [...this.dashboardData];
      this.updateAllChartsWithFilteredData();
      return;
    }

    // CRITICAL FIX: Start with original data, not already filtered data
    let filtered = [...this.dashboardData];
    console.log(`🔍 DEBUG: applyFilters: Starting filtering with ${filtered.length} records`);

    // Apply each filter in the appliedFilters array sequentially
    for (const filter of this.appliedFilters) {
      const beforeCount = filtered.length;
      filtered = this.applyIndividualFilter(filtered, filter);
      console.log(`🔍 DEBUG: applyFilters: Filter ${filter.field}='${filter.value}' reduced records from ${beforeCount} to ${filtered.length}`);
    }

    // Update filtered data
    this.filteredDashboardData = filtered;
    console.log(`🔍 DEBUG: applyFilters: Final filtered data count: ${this.filteredDashboardData.length}`);

    // Update all widgets that depend on filtered data
    this.updateAllChartsWithFilteredData();
  }

  /**
   * Apply a single filter to the data
   */
  private applyIndividualFilter(data: StockDataDto[], filter: FilterCriteria): StockDataDto[] {
    const operator = filter.operator || 'equals';
    
    console.log(`🔍 DEBUG: applyIndividualFilter: Filtering ${data.length} records by ${filter.field}='${filter.value}' (operator: ${operator})`);
    
    // Sample a few records to see their field values
    const sampleRecords = data.slice(0, 3);
    console.log(`🔍 DEBUG: applyIndividualFilter: Sample field values for '${filter.field}':`, 
      sampleRecords.map(stock => ({ symbol: stock.symbol, [filter.field]: (stock as any)[filter.field] })));
    
    const result = data.filter(stock => {
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
    
    console.log(`🔍 DEBUG: applyIndividualFilter: Filter result: ${result.length} records match`);
    return result;
  }

  /**
   * Convert FilterCriteria to IFilterValues format for filter widget display
   */
  private convertFilterCriteriaToIFilterValues(filter: FilterCriteria): IFilterValues {
    const stringValue = typeof filter.value === 'number' ? filter.value.toString() : filter.value;
    
    // Create a user-friendly display format
    const fieldDisplayName = this.getFieldDisplayName(filter.field);
    const displayValue = `${fieldDisplayName}: '${filter.value}'`;
    
    return {
      accessor: filter.field,
      filterColumn: filter.field,
      [filter.field]: stringValue,
      value: stringValue,
      displayValue: displayValue,
      source: filter.source || 'Unknown'
    };
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

  /**
   * Add a filter to the applied filters array
   * This method manages filter addition with the following logic:
   * 1. Removes any existing filter of the same type and field to prevent duplicates
   * 2. Adds the new filter to the appliedFilters array
   * 3. Automatically applies all filters to update filteredStockData
   * 
   * @param filter The filter criteria to add
   */
  private addFilter(filter: FilterCriteria): void {
    console.log(`➕ addFilter: STARTING - Adding filter:`, filter);
    console.log(`➕ addFilter: Current applied filters before:`, this.appliedFilters);
    console.log(`➕ addFilter: Original data count:`, this.dashboardData?.length || 0);
    
    // Check if this exact filter already exists
    const exactFilterExists = this.appliedFilters.some(f => 
      f.type === filter.type && f.field === filter.field && f.value === filter.value
    );
    
    if (exactFilterExists) {
      console.log(`⚠️ addFilter: Exact same filter already exists, removing and re-adding to refresh`);
      // Remove the exact filter and re-add it (this allows "refresh" behavior)
      this.appliedFilters = this.appliedFilters.filter(f => 
        !(f.type === filter.type && f.field === filter.field && f.value === filter.value)
      );
    } else {
      // Remove any existing filter of the same type and field to avoid conflicts
      const beforeFilterCount = this.appliedFilters.length;
      this.appliedFilters = this.appliedFilters.filter(f => 
        !(f.type === filter.type && f.field === filter.field)
      );
      const removedCount = beforeFilterCount - this.appliedFilters.length;
      console.log(`➕ addFilter: Removed ${removedCount} existing filters of same type`);
    }
    
    // Add the new filter
    this.appliedFilters.push(filter);
    
    console.log(`➕ addFilter: Added filter for ${filter.field}=${filter.value}, total filters: ${this.appliedFilters.length}`);
    console.log(`➕ addFilter: Current applied filters after:`, this.appliedFilters);
    
    // Apply all filters
    this.applyFilters();
    
    // Update filter widget to display the applied filters
    this.updateFilterWidget();
    
    console.log(`➕ addFilter: COMPLETED - Filter applied successfully`);
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

  /**
   * Clear all filters and restore original data
   * This method resets the filtering system by:
   * 1. Clearing the appliedFilters array
   * 2. Reapplying filters (which results in showing all original data)
   * 3. Updating all dependent widgets with the unfiltered data
   * 4. Calls parent clearAllFilters to maintain consistency with base class
   */
  public override clearAllFilters(): void {
    console.log(`🧹 clearAllFilters: STARTING - Clearing ${this.appliedFilters.length} filters`);
    console.log(`🧹 clearAllFilters: Original data count: ${this.dashboardData?.length || 0}`);
    console.log(`🧹 clearAllFilters: Current filtered data count: ${this.filteredDashboardData?.length || 0}`);
    
    // Clear our custom applied filters
    this.appliedFilters = [];
    
    // CRITICAL: Restore filteredDashboardData to original dashboardData
    this.filteredDashboardData = [...(this.dashboardData || [])];
    console.log(`🧹 clearAllFilters: Restored filtered data to original: ${this.filteredDashboardData?.length || 0} records`);
    
    // Apply filters (with empty filter array, this restores original data)
    this.applyFilters();
    
    // Force update all charts with original data
    console.log(`🧹 clearAllFilters: Forcing chart updates with original data`);
    this.updateAllChartsWithFilteredData();
    
    // Clear the filter widget display
    const filterWidget = this.getFilterWidget();
    if (filterWidget) {
      clearAllFiltersFromWidget(filterWidget);
      console.log(`🧹 clearAllFilters: Cleared filter widget display`);
    }
    
    // Force change detection multiple times to ensure UI updates
    this.cdr.detectChanges();
    setTimeout(() => {
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 50);
    
    // Call parent method FIRST to clear the filter service
    super.clearAllFilters();
    
    console.log(`🧹 clearAllFilters: COMPLETED - All filters cleared and data restored`);
  }

  /**
   * Override onFilterValuesChanged to also handle clear all from filter service
   */
  override onFilterValuesChanged(filters: any[]): void {
    console.log('🚫 onFilterValuesChanged: Intercepting filter processing');
    console.log('🚫 Received filters:', filters);
    
    // Check if this is a "clear all" operation (empty filters array)
    if (!filters || filters.length === 0) {
      console.log('🧹 onFilterValuesChanged: Detected clear all operation');
      
      // Clear our custom filters without calling super again (avoid infinite loop)
      this.appliedFilters = [];
      this.filteredDashboardData = [...(this.dashboardData || [])];
      this.updateAllChartsWithFilteredData();
      
      // Update filter widget
      const filterWidget = this.getFilterWidget();
      if (filterWidget) {
        clearAllFiltersFromWidget(filterWidget);
      }
      
      this.cdr.detectChanges();
      console.log('🧹 onFilterValuesChanged: Clear all completed');
      return;
    }
    
    // ISSUE: These filters have accessor: 'category' which means they're coming from 
    // the default dashboard system, NOT our custom click handlers
    // Our custom handlers should trigger with 🔥 logs and call filterChartsByIndustry/Sector directly
    
    console.log('⚠️ WARNING: Default dashboard filters detected instead of custom click handlers!');
    console.log('⚠️ Expected: 🔥 INDUSTRY BAR CHART CLICKED! or 🔥 SECTOR PIE CHART CLICKED!');
    console.log('⚠️ This suggests custom click handlers are not working properly');
    
    // For now, let's process these default filters to get some filtering working
    // while we debug the custom click handlers
    console.log('🔧 Processing default filters as fallback');
    
    filters.forEach((filter, index) => {
      console.log(`🔧 Filter ${index + 1}:`, {
        accessor: filter.accessor,
        filterColumn: filter.filterColumn,
        value: filter.value,
        category: filter.category
      });
      
      // Try to map the filter to our custom filtering system
      // CRITICAL FIX: Use filter.category (name) not filter.value (numeric value)
      const categoryName = filter.category || filter.value;
      
      if (filter.filterColumn === 'sector' && categoryName) {
        console.log(`🔧 Converting default sector filter: value=${filter.value}, category=${filter.category}`);
        console.log(`🔧 Using category name for sector filter: ${categoryName}`);
        if (typeof categoryName === 'string' && isNaN(Number(categoryName))) {
          this.filterChartsBySector(categoryName);
        } else {
          console.warn(`⚠️ Invalid sector name: ${categoryName} (type: ${typeof categoryName})`);
        }
      } else if (filter.filterColumn === 'industry' && categoryName) {
        console.log(`🔧 Converting default industry filter: value=${filter.value}, category=${filter.category}`);
        console.log(`🔧 Using category name for industry filter: ${categoryName}`);
        if (typeof categoryName === 'string' && isNaN(Number(categoryName))) {
          this.filterChartsByIndustry(categoryName);
        } else {
          console.warn(`⚠️ Invalid industry name: ${categoryName} (type: ${typeof categoryName})`);
        }
      }
    });
    
    // Skip the default processing since we handled it above
    return;
  }

  /**
   * TEST METHOD: Add a manual filter for debugging purposes
   * This method can be called from browser console to test filtering manually
   */
  public testManualFilter(industry: string = 'Aluminium'): void {
    console.log(`🧪 testManualFilter: Testing manual filter for industry: ${industry}`);
    console.log(`🧪 testManualFilter: Current data count: ${this.dashboardData?.length || 0}`);
    
    if (!this.dashboardData || this.dashboardData.length === 0) {
      console.warn(`❌ testManualFilter: No data available for testing`);
      return;
    }
    
    // Check if the industry exists in the data
    const availableIndustries = [...new Set(this.dashboardData.map(s => s.industry))];
    console.log(`🧪 testManualFilter: Available industries:`, availableIndustries);
    
    if (!availableIndustries.includes(industry)) {
      console.warn(`⚠️ testManualFilter: Industry '${industry}' not found. Available: ${availableIndustries.join(', ')}`);
      return;
    }
    
    console.log(`✅ testManualFilter: Industry '${industry}' found! Applying filter...`);
    
    // Apply the filter manually
    this.filterChartsByIndustry(industry);
  }

  /**
   * Update all charts with filtered data
   */
  private updateAllChartsWithFilteredData(): void {
    console.log(`📊 updateAllChartsWithFilteredData: STARTING update process`);
    console.log(`📊 updateAllChartsWithFilteredData: Widgets available: ${this.dashboardConfig?.widgets?.length || 0}`);
    console.log(`📊 updateAllChartsWithFilteredData: Filtered data records: ${this.filteredDashboardData?.length || 0}`);
    console.log(`📊 updateAllChartsWithFilteredData: Original data records: ${this.dashboardData?.length || 0}`);
    
    if (!this.filteredDashboardData) {
      console.warn('⚠️ updateAllChartsWithFilteredData: No filtered data available, skipping update');
      return;
    }
    
    try {
      console.log('📊 Step 1: Updating bar chart...');
      this.updateBarChartWithFilteredData();
      
      console.log('📊 Step 2: Updating pie chart...');
      this.updatePieChartWithFilteredData();
      
      console.log('📊 Step 3: Updating stock list...');
      this.updateStockListWithFilteredData();
      
      //this.updateTreemapWithFilteredData();
      // Add other chart updates as needed
      
      console.log('📊 Step 4: Final change detection...');
      // Trigger change detection with delay to ensure DOM updates
      this.cdr.detectChanges();
      
      // Additional change detection after short delay
      setTimeout(() => {
        console.log('📊 Step 5: Delayed change detection...');
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }, 100);
      
      console.log('✅ updateAllChartsWithFilteredData: All widgets updated successfully!');
      
    } catch (error) {
      console.error('❌ updateAllChartsWithFilteredData: Error during update process:', error);
    }
  }

  /**
   * Filter charts by industry (called when bar chart is clicked)
   */
  private filterChartsByIndustry(industry: string): void {
    console.log(`🎯 filterChartsByIndustry: CALLED with industry: "${industry}" (type: ${typeof industry})`);
    
    if (!this.dashboardData || this.dashboardData.length === 0) {
      console.warn(`⚠️ filterChartsByIndustry: No dashboard data available`);
      return;
    }

    // Validate that we received a string industry name, not a number
    if (typeof industry !== 'string') {
      console.error(`❌ filterChartsByIndustry: Invalid input - received non-string value:`, industry, typeof industry);
      return;
    }

    // Check if industry is numeric (which would be wrong)
    if (!isNaN(Number(industry))) {
      console.error(`❌ filterChartsByIndustry: Invalid input - received numeric value that should be industry name:`, industry);
      return;
    }

    // Validate that the industry exists in the data
    const availableIndustries = [...new Set(this.dashboardData.map(s => s.industry))];
    if (!availableIndustries.includes(industry)) {
      console.error(`❌ filterChartsByIndustry: Industry "${industry}" not found in data. Available:`, availableIndustries);
      return;
    }

    console.log(`✅ filterChartsByIndustry: Valid industry "${industry}" found. Applying filter...`);
    console.log(`🎯 filterChartsByIndustry: Current data count: ${this.dashboardData.length}`);
    console.log(`🎯 filterChartsByIndustry: Current filtered data count: ${this.filteredDashboardData?.length || 0}`);

    // Use centralized filter system
    this.addFilter({
      type: 'industry',
      field: 'industry',
      value: industry,
      operator: 'equals',
      source: 'Industry Chart'
    });

    console.log(`🎯 filterChartsByIndustry: COMPLETED - Filter system triggered`);
  }

  /**
   * Filter charts by sector (called when pie chart is clicked)
   */
  private filterChartsBySector(sector: string): void {
    console.log(`🎯 filterChartsBySector: CALLED with sector: "${sector}" (type: ${typeof sector})`);
    
    if (!this.dashboardData || this.dashboardData.length === 0) {
      console.warn(`⚠️ filterChartsBySector: No dashboard data available`);
      return;
    }

    // Validate that we received a string sector name, not a number
    if (typeof sector !== 'string') {
      console.error(`❌ filterChartsBySector: Invalid input - received non-string value:`, sector, typeof sector);
      return;
    }

    // Check if sector is numeric (which would be wrong)
    if (!isNaN(Number(sector))) {
      console.error(`❌ filterChartsBySector: Invalid input - received numeric value that should be sector name:`, sector);
      return;
    }

    // Validate that the sector exists in the data
    const availableSectors = [...new Set(this.dashboardData.map(s => s.sector))];
    if (!availableSectors.includes(sector)) {
      console.error(`❌ filterChartsBySector: Sector "${sector}" not found in data. Available:`, availableSectors);
      return;
    }

    console.log(`✅ filterChartsBySector: Valid sector "${sector}" found. Applying filter...`);
    console.log(`🎯 filterChartsBySector: Current data count: ${this.dashboardData.length}`);
    console.log(`🎯 filterChartsBySector: Current filtered data count: ${this.filteredDashboardData?.length || 0}`);

    // Use centralized filter system
    this.addFilter({
      type: 'sector',
      field: 'sector',
      value: sector,
      operator: 'equals',
      source: 'Sector Chart'
    });

    console.log(`🎯 filterChartsBySector: COMPLETED - Filter system triggered`);
  }

  /**
   * Filter charts by macro category (called when treemap is clicked)
   */
  private filterChartsByMacro(macro: string): void {
    if (!this.dashboardData || this.dashboardData.length === 0) return;

    console.log(`🎯 filterChartsByMacro: Filtering by macro: ${macro}`);

    // Use centralized filter system
    this.addFilter({
      type: 'macro',
      field: 'macro',
      value: macro,
      operator: 'equals',
      source: 'Treemap Chart'
    });
  }

  /**
   * Update pie chart with filtered data
   */
  private updatePieChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) {
      console.log(`🥧 updatePieChartWithFilteredData: No widgets or filtered data`);
      return;
    }

    console.log(`🥧 updatePieChartWithFilteredData: Updating with ${this.filteredDashboardData.length} filtered records`);

    const pieWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Sector Allocation'
    );

    if (pieWidget) {
      // Transform filtered data for pie chart (group by sector)
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
      
      console.log(`🥧 updatePieChartWithFilteredData: Sector aggregation:`, sectorData);
      console.log(`🥧 updatePieChartWithFilteredData: Final pie data structure:`, pieData);
      
      // Force chart instance update with multiple approaches
      try {
        // Approach 1: Use specific builder update
        PieChartBuilder.updateData(pieWidget, pieData);
        console.log(`✅ updatePieChartWithFilteredData: PieChartBuilder update completed`);
        
        // Approach 2: Direct chart instance update (more reliable)
        if (pieWidget.chartInstance && typeof pieWidget.chartInstance.setOption === 'function') {
          const newOptions = {
            ...pieWidget.config?.options,
            series: [{
              ...((pieWidget.config?.options as any)?.series?.[0] || {}),
              data: pieData
            }]
          };
          
          console.log(`🥧 updatePieChartWithFilteredData: Updating chart instance directly`);
          pieWidget.chartInstance.setOption(newOptions, true);
          console.log(`✅ updatePieChartWithFilteredData: Direct chart instance update completed`);
        }
        
        // Approach 3: Generic widget update as final fallback
        this.updateEchartWidget(pieWidget, pieData);
        console.log(`✅ updatePieChartWithFilteredData: Generic widget update completed`);
        
      } catch (error) {
        console.error(`❌ updatePieChartWithFilteredData: All update methods failed:`, error);
      }
    } else {
      console.warn(`⚠️ updatePieChartWithFilteredData: Sector pie widget not found`);
    }
  }

  /**
   * Update bar chart with filtered data
   */
  private updateBarChartWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets || !this.filteredDashboardData) {
      console.log(`📊 updateBarChartWithFilteredData: No widgets or filtered data`);
      return;
    }

    console.log(`📊 updateBarChartWithFilteredData: Updating with ${this.filteredDashboardData.length} filtered records`);

    const barWidget = this.dashboardConfig.widgets.find(widget => 
      widget.config?.header?.title === 'Industry'
    );

    if (barWidget) {
      // Transform filtered data for bar chart (group by industry)
      const industryData = this.filteredDashboardData.reduce((acc, stock) => {
        const industry = stock.industry || 'Unknown';
        if (!acc[industry]) {
          acc[industry] = 0;
        }
        acc[industry] += stock.totalTradedValue || 0;
        return acc;
      }, {} as Record<string, number>);

      console.log(`📊 updateBarChartWithFilteredData: Industry aggregation:`, industryData);

      // Business color palette for individual bars
      const businessColors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];
      
      // Transform to bar chart format with individual colors and descending sort
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
      
      console.log(`📊 updateBarChartWithFilteredData: Final bar data structure:`, barData);
      
      // Force chart instance update with multiple approaches
      try {
        // Approach 1: Use specific builder update
        HorizontalBarChartBuilder.updateData(barWidget, barData);
        console.log(`✅ updateBarChartWithFilteredData: HorizontalBarChartBuilder update completed`);
        
        // Approach 2: Direct chart instance update (more reliable)
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
          
          console.log(`📊 updateBarChartWithFilteredData: Updating chart instance directly`);
          barWidget.chartInstance.setOption(newOptions, true);
          console.log(`✅ updateBarChartWithFilteredData: Direct chart instance update completed`);
        }
        
        // Approach 3: Generic widget update as final fallback
        this.updateEchartWidget(barWidget, barData);
        console.log(`✅ updateBarChartWithFilteredData: Generic widget update completed`);
        
      } catch (error) {
        console.error(`❌ updateBarChartWithFilteredData: All update methods failed:`, error);
      }
    } else {
      console.warn(`⚠️ updateBarChartWithFilteredData: Industry bar widget not found`);
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

  /**
   * Update stock list widgets with filtered data
   */
  private updateStockListWithFilteredData(): void {
    if (!this.dashboardConfig?.widgets) {
      console.log('📋 updateStockListWithFilteredData: No dashboard widgets found');
      return;
    }

    console.log(`📋 updateStockListWithFilteredData: Searching for stock-list widgets among ${this.dashboardConfig.widgets.length} widgets`);

    const stockListWidgets = this.dashboardConfig.widgets.filter(widget => 
      widget.config?.component === 'stock-list-table'
    );

    console.log(`📋 updateStockListWithFilteredData: Found ${stockListWidgets.length} stock-list widgets`);

    stockListWidgets.forEach((widget, index) => {
      const stockData = this.filteredDashboardData || [];
      
      console.log(`📋 updateStockListWithFilteredData: Widget ${index + 1}:`, {
        widgetId: widget.id,
        widgetTitle: widget.config?.header?.title,
        currentDataCount: widget.data?.stocks?.length || 0,
        newDataCount: stockData.length,
        hasData: !!widget.data
      });
      
      // CRITICAL FIX: Create new array reference for OnPush change detection
      const newStockDataArray = [...stockData];
      
      // Update the widget's data directly
      if (widget.data) {
        widget.data.stocks = newStockDataArray;
        widget.data.isLoadingStocks = false;
        console.log(`📋 updateStockListWithFilteredData: Updated existing data for widget ${widget.id} with NEW array reference`);
      } else {
        // Initialize widget data if it doesn't exist
        widget.data = {
          stocks: newStockDataArray,
          isLoadingStocks: false
        };
        console.log(`📋 updateStockListWithFilteredData: Initialized new data for widget ${widget.id} with NEW array reference`);
      }
      
      console.log(`📋 updateStockListWithFilteredData: Final data for widget ${widget.id}:`, {
        stocksCount: widget.data.stocks?.length || 0,
        isLoading: widget.data.isLoadingStocks,
        firstStock: widget.data.stocks?.[0]?.symbol || 'None',
        arrayReference: widget.data.stocks === stockData ? 'SAME (BAD)' : 'NEW (GOOD)'
      });
    });
    
    // Force change detection to ensure the UI updates
    console.log('📋 updateStockListWithFilteredData: Triggering change detection');
    this.cdr.detectChanges();
    
    // Additional step: Try to force component refresh by triggering ngOnChanges-like behavior
    stockListWidgets.forEach((widget) => {
      if (widget.data && typeof (widget.data as any).refresh === 'function') {
        console.log(`📋 updateStockListWithFilteredData: Calling refresh method on widget ${widget.id}`);
        (widget.data as any).refresh();
      }
    });
    
    // Mark widgets for check in case they use OnPush strategy
    setTimeout(() => {
      console.log('📋 updateStockListWithFilteredData: Delayed change detection');
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }, 10);
  }
}
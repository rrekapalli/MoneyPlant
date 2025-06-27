import { IWidget } from '../entities/IWidget';
import { PieChartBuilder, PieChartData } from '../echart-chart-builders/pie/pie-chart-builder';
import { PieChartConfiguration } from '../echart-chart-builders/chart-configurations';

/**
 * Enhanced Asset Allocation Examples
 * 
 * This file demonstrates how to use the enhanced PieChartBuilder for asset allocation
 * charts with all the new management features, replacing the need for separate
 * asset-allocation-widget.ts files.
 */

// ========== BASIC USAGE EXAMPLES ==========

/**
 * Example 1: Simple asset allocation widget creation
 */
export function createBasicAssetAllocation(): IWidget {
  const sampleData: PieChartData[] = [
    { name: 'Stocks', value: 50 },
    { name: 'Bonds', value: 20 },
    { name: 'Cash', value: 20 },
    { name: 'Real Estate', value: 8 },
    { name: 'Commodities', value: 2 }
  ];

  return PieChartBuilder.createAssetAllocationWidget(
    sampleData,
    undefined, // no filter service
    { x: 0, y: 0, cols: 4, rows: 8 }
  );
}

/**
 * Example 2: Asset allocation with filtering support
 */
export function createAssetAllocationWithFiltering(filterService: any): IWidget {
  const sampleData: PieChartData[] = [
    { name: 'Technology', value: 35 },
    { name: 'Healthcare', value: 25 },
    { name: 'Finance', value: 20 },
    { name: 'Energy', value: 12 },
    { name: 'Utilities', value: 8 }
  ];

  return PieChartBuilder.createAssetAllocationWidget(
    sampleData,
    filterService,
    { x: 0, y: 0, cols: 6, rows: 8 }
  );
}

// ========== COMPLETE MANAGEMENT EXAMPLES ==========

/**
 * Example 3: Complete asset allocation setup with all management features
 */
export function setupCompleteAssetAllocationExample(filterService?: any) {
  const initialData: PieChartData[] = [
    { name: 'Growth Stocks', value: 45 },
    { name: 'Value Stocks', value: 25 },
    { name: 'International', value: 15 },
    { name: 'Bonds', value: 10 },
    { name: 'Alternatives', value: 5 }
  ];

  // Data loader function (simulates API call)
  const dataLoader = async (): Promise<PieChartData[]> => {
    console.log('Loading asset allocation data...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate updated data
    return initialData.map(item => ({
      ...item,
      value: item.value + Math.random() * 10 - 5 // Random variance
    }));
  };

  // Setup complete management interface
  const assetAllocationManager = PieChartBuilder.setupCompleteAssetAllocation(
    null, // container element
    initialData,
    filterService,
    dataLoader
  );

  // Example usage of management interface
  console.log('Widget Info:', assetAllocationManager.getInfo());

  // Return the management interface for further use
  return assetAllocationManager;
}

/**
 * Example 4: Data management examples
 */
export async function demonstrateDataManagement(
  assetAllocationManager: ReturnType<typeof setupCompleteAssetAllocationExample>
) {
  try {
    // Update with new data
    const newData: PieChartData[] = [
      { name: 'US Stocks', value: 40 },
      { name: 'International Stocks', value: 30 },
      { name: 'Bonds', value: 20 },
      { name: 'Cash', value: 10 }
    ];
    assetAllocationManager.updateData(newData);

    // Load data asynchronously
    await assetAllocationManager.loadDataAsync();

    // Apply current filters
    assetAllocationManager.applyFilters();

    console.log('Data management completed successfully');
  } catch (error) {
    console.error('Data management failed:', error);
  }
}

// ========== MULTIPLE VARIATIONS EXAMPLES ==========

/**
 * Example 5: Creating multiple asset allocation variations
 */
export function createMultipleAssetAllocationVariations(filterService?: any) {
  const baseData: PieChartData[] = [
    { name: 'Aggressive Growth', value: 40 },
    { name: 'Conservative', value: 35 },
    { name: 'Balanced', value: 25 }
  ];

  const variations = PieChartBuilder.createAssetAllocationVariations(
    baseData,
    filterService
  );

  // Demonstrate updating each variation
  variations.forEach(({ name, widget, updateData }: { name: string; widget: IWidget; updateData: (data: PieChartData[]) => void }) => {
    console.log(`Created ${name} variation`);
    
    // Update each variation with slightly different data
    const variantData = baseData.map(item => ({
      ...item,
      value: item.value * (0.8 + Math.random() * 0.4)
    }));
    
    updateData(variantData);
  });

  return variations;
}

// ========== FACTORY PATTERN EXAMPLES ==========

/**
 * Example 6: Using factory pattern for consistent creation
 */
export function demonstrateFactoryPattern(filterService?: any) {
  const factory = PieChartBuilder.createAssetAllocationFactory(filterService);
  
  const sampleData: PieChartData[] = [
    { name: 'Equity', value: 60 },
    { name: 'Fixed Income', value: 30 },
    { name: 'Alternatives', value: 10 }
  ];

  // Create different styles using factory
  const widgets = {
    financial: factory.createFinancial(sampleData, { x: 0, y: 0, cols: 4, rows: 4 }),
    donut: factory.createDonut(sampleData, { x: 4, y: 0, cols: 4, rows: 4 }),
    minimal: factory.createMinimal(sampleData, { x: 8, y: 0, cols: 4, rows: 4 })
  };

  return widgets;
}

// ========== ADVANCED FILTERING EXAMPLES ==========

/**
 * Example 7: Advanced filtering and event handling
 */
export function setupAdvancedFilteringExample(filterService: any): IWidget {
  const widget = PieChartBuilder.createAssetAllocationWidget(
    [],
    filterService,
    { x: 0, y: 0, cols: 6, rows: 6 }
  );

  // Configure custom click handler
  PieChartBuilder.configureClickHandler(widget, (clickData: any, w: IWidget) => {
    console.log('Asset allocation clicked:', clickData);
    
    // Create custom filter
    const filter = PieChartBuilder.createAssetAllocationFilter(clickData);
    if (filter) {
      filterService.addFilter(filter);
      console.log('Filter added:', filter);
    }
  });

  // Configure hover effects
  PieChartBuilder.configureHoverHandler(
    widget,
    (data: any) => console.log('Hovering over:', data.name),
    () => console.log('Hover ended')
  );

  return widget;
}

/**
 * Example 8: Batch operations
 */
export function demonstrateBatchOperations(widgets: IWidget[], filterService?: any) {
  const newData: PieChartData[] = [
    { name: 'Large Cap', value: 50 },
    { name: 'Mid Cap', value: 30 },
    { name: 'Small Cap', value: 20 }
  ];

  // Batch update multiple widgets
  const updates = widgets.map(widget => ({
    widget,
    data: newData,
    filterService
  }));

  PieChartBuilder.batchUpdateData(updates);
  console.log('Batch update completed for', widgets.length, 'widgets');
}

// ========== ASYNC OPERATIONS EXAMPLES ==========

/**
 * Example 9: Async data loading with retry
 */
export async function demonstrateAsyncOperations(widget: IWidget) {
  const dataLoader = async (): Promise<PieChartData[]> => {
    // Simulate unreliable API
    if (Math.random() < 0.3) {
      throw new Error('Simulated API failure');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { name: 'Success Data 1', value: 40 },
      { name: 'Success Data 2', value: 35 },
      { name: 'Success Data 3', value: 25 }
    ];
  };

  try {
    await PieChartBuilder.loadDataAsync(widget, dataLoader, {
      retryCount: 3,
      retryDelay: 1000,
      timeout: 5000
    });
    console.log('Async data loading successful');
  } catch (error) {
    console.error('Async data loading failed after retries:', error);
  }
}

// ========== CONFIGURATION EXAMPLES ==========

/**
 * Example 10: Runtime customization
 */
export function demonstrateRuntimeCustomization(widget: IWidget) {
  PieChartBuilder.applyRuntimeCustomization(widget, (chartOptions: any, seriesOptions: any) => {
    // Customize appearance at runtime
    seriesOptions.radius = ['50%', '80%'];
    seriesOptions.itemStyle = {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    };
    
    if (chartOptions.tooltip) {
      chartOptions.tooltip.formatter = '{b}: ${c}K ({d}%)';
    }
  });
  
  console.log('Runtime customization applied');
}

/**
 * Example 11: Widget validation
 */
export function validateAssetAllocationWidget(widget: IWidget) {
  const validation = PieChartBuilder.validateConfiguration(widget);
  
  if (validation.isValid) {
    console.log('Widget configuration is valid');
  } else {
    console.error('Widget validation errors:', validation.errors);
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('Widget validation warnings:', validation.warnings);
    }
  }
  
  return validation;
}

// ========== EXPORT AND UTILITY EXAMPLES ==========

/**
 * Example 12: Data export functionality
 */
export function demonstrateDataExport(widget: IWidget) {
  const exportData = PieChartBuilder.exportData(widget);
  const headers = PieChartBuilder.getExportHeaders(widget);
  const sheetName = PieChartBuilder.getExportSheetName(widget);
  
  console.log('Export Headers:', headers);
  console.log('Export Data:', exportData);
  console.log('Sheet Name:', sheetName);
  
  return { headers, data: exportData, sheetName };
}

/**
 * Example 13: Widget information and monitoring
 */
export function monitorAssetAllocationWidget(widget: IWidget) {
  const info = PieChartBuilder.getWidgetInfo(widget);
  
  console.log('Widget Information:', {
    chartType: info.chartType,
    hasData: info.hasData,
    dataCount: info.dataCount,
    filterColumn: info.filterColumn,
    configuration: info.configuration
  });
  
  return info;
}

// ========== COMPLETE USAGE WORKFLOW ==========

/**
 * Example 14: Complete workflow demonstration
 */
export async function completeAssetAllocationWorkflow(filterService?: any) {
  console.log('Starting complete asset allocation workflow...');
  
  // 1. Create widget with enhanced features
  const widget = PieChartBuilder.createAssetAllocationWidget(
    [
      { name: 'Portfolio A', value: 45 },
      { name: 'Portfolio B', value: 35 },
      { name: 'Portfolio C', value: 20 }
    ],
    filterService
  );
  
  // 2. Validate configuration
  const validation = validateAssetAllocationWidget(widget);
  if (!validation.isValid) {
    throw new Error('Widget validation failed');
  }
  
  // 3. Setup complete management
  const manager = setupCompleteAssetAllocationExample(filterService);
  
  // 4. Demonstrate all operations
  await demonstrateDataManagement(manager);
  
  // 5. Create variations
  const variations = createMultipleAssetAllocationVariations(filterService);
  
  // 6. Apply runtime customizations
  demonstrateRuntimeCustomization(widget);
  
  // 7. Monitor widget
  const info = monitorAssetAllocationWidget(widget);
  
  console.log('Complete workflow finished successfully');
  
  return {
    widget,
    manager,
    variations,
    info
  };
} 
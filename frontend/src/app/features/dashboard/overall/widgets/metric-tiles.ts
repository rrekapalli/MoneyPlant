import { TileBuilder, StockTileBuilder } from '@dashboards/public-api';
import { DashboardDataRow } from './dashboard-data';
import {StockDataDto, StockTicksDto} from '../../../../services/entities/stock-ticks';
import { IndexDataDto } from '../../../../services/entities/indices-websocket';
import { IndicesService } from '../../../../services/apis/indices.api';
import { IndexHistoricalData } from '../../../../services/entities/index-historical-data';
import { ModernIndicesWebSocketService } from '../../../../services/websockets/modern-indices-websocket.service';

/**
 * Create metric tiles that display key statistics from stock ticks data and indices data
 * 
 * WebSocket Integration:
 * - Stock tiles are configured with data events to receive real-time updates
 * - When an index is selected, the stock tile listens for WebSocket data matching that index
 * - Market overview tiles listen for general market data updates
 * - Data events automatically update the tile display with new values
 * - Includes fallback to historical data API when WebSocket is not available
 * 
 * Usage with WebSocket Health Check and Fallback:
 * ```typescript
 * const tiles = createMetricTiles(
 *   stockTicksData, 
 *   selectedIndexData, 
 *   webSocketService,    // ModernIndicesWebSocketService instance
 *   indicesService       // IndicesService instance
 * );
 * ```
 * 
 * The function will automatically:
 * 1. Check WebSocket connection health
 * 2. Use real-time data when WebSocket is working
 * 3. Fall back to historical data API when WebSocket is not available
 * 4. Update tiles with appropriate data source indicators
 */

// Minimal debug logging toggle for this module
const DEBUG_LOGGING = false;
// Dedup set to avoid repeated previous-day fetch attempts per index
const previousDayFetchAttempted = new Set<string>();

// Helper function to check WebSocket health and get fallback data
const getFallbackIndexData = async (
  indexName: string, 
  indicesService?: IndicesService,
  webSocketService?: ModernIndicesWebSocketService
): Promise<IndexHistoricalData | null> => {
  if (!indicesService) return null;
  
  // Only fetch previous-day if WebSocket is not healthy
  if (isWebSocketHealthy(webSocketService)) {
    return null;
  }

  // Avoid duplicates per index
  if (previousDayFetchAttempted.has(indexName)) {
    return null;
  }

  // Skip if offline
  try {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator && navigator.onLine === false) {
      if (DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.warn('Offline detected, skipping previous-day fallback for', indexName);
      }
      return null;
    }
  } catch { /* no-op */ }

  try {
    if (DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log(`Attempting to get fallback data for index: ${indexName}`);
    }

    previousDayFetchAttempted.add(indexName);
    
    // First try to get previous day's data from the new endpoint
    const previousDayData = await indicesService.getPreviousDayIndexData(indexName).toPromise();
    if (DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('Previous day data received:', previousDayData);
    }
    
    if (previousDayData && previousDayData.indices && previousDayData.indices.length > 0) {
      // Convert IndicesDto to IndexHistoricalData format for compatibility
      const indexData = previousDayData.indices[0];
      if (DEBUG_LOGGING) {
        // eslint-disable-next-line no-console
        console.log('Index data from previous day:', indexData);
      }
      
      // Handle both field name variations (lastPrice/last, dayHigh/high, dayLow/low)
      const lastPrice = indexData.lastPrice || indexData.last || 0;
      const dayHigh = indexData.dayHigh || indexData.high || 0;
      const dayLow = indexData.dayLow || indexData.low || 0;
      const openPrice = indexData.openPrice || indexData.open || 0;
      
      return {
        indexName: indexData.indexName || indexData.index || indexName,
        date: new Date().toISOString().split('T')[0], // Use current date as fallback
        open: openPrice,
        high: dayHigh,
        low: dayLow,
        close: lastPrice,
        volume: 0 // Volume not available in current indices data
      };
    }
    
    // Fallback to historical data if previous day data is not available
    if (DEBUG_LOGGING) {
      // eslint-disable-next-line no-console
      console.log('No previous day data, trying historical data API');
    }
    const historicalData = await indicesService.getIndexHistoricalData(indexName).toPromise();
    if (historicalData && historicalData.length > 0) {
      // Return the most recent data (first item since it's ordered by date DESC)
      return historicalData[0];
    }
  } catch (error) {
    // Keep warning minimal
    // eslint-disable-next-line no-console
    console.warn(`Failed to get fallback data for index ${indexName}:`, error);
  }
  return null;
};

// Helper function to check if WebSocket is healthy
const isWebSocketHealthy = (webSocketService?: ModernIndicesWebSocketService): boolean => {
  return webSocketService?.isConnected === true;
};

export function createMetricTiles(
  stockTicksData: StockDataDto[] | null, 
  selectedIndexData?: IndexDataDto | null,
  webSocketService?: ModernIndicesWebSocketService,
  indicesService?: IndicesService
) {
  // Handle null or undefined stockTicksData
  if (!stockTicksData) {
    return createEmptyMetricTiles(selectedIndexData, webSocketService, indicesService);
  }

  // Calculate metrics from stockTicksData
  const stocksCount = stockTicksData.length || 0;
  const declines = stockTicksData.filter(stock => (stock.percentChange || 0.0 ) < 0.0).length;
  const advances = stockTicksData.filter(stock => (stock.percentChange || 0.0) > 0.0).length;
  const unchanged = stockTicksData.filter(stock => (stock.percentChange || 0.0) === 0.0).length;
  
  // Calculate total traded value (sum of all totalTradedValue)
  const totalTradedValue = stockTicksData.reduce((sum: number, stock: any) => {
    const value = stock.totalTradedValue || 0;
    return isNaN(value) || !isFinite(value) ? sum : sum + value;
  }, 0) || 0;
  
  // Calculate total traded volume (sum of all totalTradedVolume)
  const totalTradedVolume = stockTicksData.reduce((sum: number, stock: any) => {
    const volume = stock.totalTradedVolume || 0;
    return isNaN(volume) || !isFinite(volume) ? sum : sum + volume;
  }, 0) || 0;

  // Safe value handling
  const safeTotalTradedValue = isNaN(totalTradedValue) || !isFinite(totalTradedValue) ? 0 : totalTradedValue;
  const safeTotalTradedVolume = isNaN(totalTradedVolume) || !isFinite(totalTradedVolume) ? 0 : totalTradedVolume;

  // Create tiles
  const tiles = [];

  // Check if selectedIndexData exists and has valid data
  // Handle both expected field names (indexName, lastPrice) and actual WebSocket field names (index, last)
  const hasValidIndexData = selectedIndexData && 
    (selectedIndexData.indexName || selectedIndexData.index) && 
    (selectedIndexData.lastPrice !== undefined || selectedIndexData.last !== undefined) && 
    (selectedIndexData.lastPrice !== null || selectedIndexData.last !== null) &&
    (selectedIndexData.lastPrice !== 0 || selectedIndexData.last !== 0); // Also check if price is not zero

  if (hasValidIndexData) {
    // Extract data using actual WebSocket field names
    const indexName = selectedIndexData.indexName || selectedIndexData.index || 'Index';
    const lastPrice = selectedIndexData.lastPrice || selectedIndexData.last || 0;
    const percentChange = selectedIndexData.percentChange || 0;
    const variation = selectedIndexData.variation || 0;
    const dayHigh = selectedIndexData.dayHigh || selectedIndexData.high || 0;
    const dayLow = selectedIndexData.dayLow || selectedIndexData.low || 0;
    
    // Index Price Tile - Show current price, change, and day high/low using stock tile
    tiles.push(
      StockTileBuilder.createStockTile(
        lastPrice,
        percentChange,
        indexName,
        dayHigh,
        dayLow,
        ''
      )
        .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
        .setDataEvent(async (widget: any, data?: any) => {
          // Enhanced data event with WebSocket health check and fallback
          if (data && data.index && (data.index === indexName || data.index === selectedIndexData.index)) {
            // WebSocket is working - update with real-time data
            const newPrice = data.lastPrice || data.last || lastPrice;
            const newPercentChange = data.percentChange || percentChange;
            const newHigh = data.dayHigh || data.high || dayHigh;
            const newLow = data.dayLow || data.low || dayLow;
            
            // Update widget options with new data
            if (widget.config?.options) {
              widget.config.options.value = newPrice.toLocaleString();
              widget.config.options.change = `${newPercentChange >= 0 ? '+' : ''}${newPercentChange.toFixed(2)}%`;
              widget.config.options.changeType = newPercentChange >= 0 ? 'positive' : 'negative';
              widget.config.options.highValue = newHigh.toLocaleString();
              widget.config.options.lowValue = newLow.toLocaleString();
            }
          } else if (!isWebSocketHealthy(webSocketService)) {
            // WebSocket is not working - try to get fallback data from historical API
            if (DEBUG_LOGGING) {
              // eslint-disable-next-line no-console
              console.log(`WebSocket not healthy, attempting to get fallback data for index: ${indexName}`);
            }
            try {
              const fallbackData = await getFallbackIndexData(indexName, indicesService, webSocketService);
              if (fallbackData && widget.config?.options) {
                // Update widget with historical data
                widget.config.options.value = fallbackData.close.toLocaleString();
                widget.config.options.change = 'Historical Data';
                widget.config.options.changeType = 'neutral';
                widget.config.options.highValue = fallbackData.high.toLocaleString();
                widget.config.options.lowValue = fallbackData.low.toLocaleString();
                // Add a note that this is historical data
                widget.config.options.subtitle = `Last updated: ${fallbackData.date}`;
                if (DEBUG_LOGGING) {
                  // eslint-disable-next-line no-console
                  console.log(`Updated stock tile with fallback data for ${indexName}:`, fallbackData);
                }
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn(`Failed to get fallback data for index ${indexName}:`, error);
            }
          }
        })
        .build()
    );
  } else {
    // No valid index data - try to get fallback data immediately for a common index
    const fallbackIndexName = 'NIFTY 50'; // Default to NIFTY 50
    
    // Create a tile that will immediately try to get fallback data
    tiles.push(
      StockTileBuilder.createStockTile(
        0, // current price - will be updated with fallback data
        0, // percent change - will be updated with fallback data
        fallbackIndexName, // description
        0, // high value - will be updated with fallback data
        0, // low value - will be updated with fallback data
        '₹' // currency
      )
        .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
        .setDataEvent(async (widget: any, data?: any) => {
          // Enhanced data event with immediate fallback data fetch
          if (data && data.type === 'market-overview') {
            // WebSocket is working - update with real-time data
            if (widget.config?.options) {
              widget.config.options.value = data.totalStocks || '0';
              widget.config.options.change = `${data.advances || 0} / ${data.declines || 0}`;
              widget.config.options.changeType = 'neutral';
              widget.config.options.highValue = data.totalTradedValue || '0';
              widget.config.options.lowValue = data.totalTradedVolume || '0';
            }
          } else {
            // Try to get fallback data immediately when WebSocket is not healthy and online
            try {
              const fallbackData = await getFallbackIndexData(fallbackIndexName, indicesService, webSocketService);
              if (fallbackData && widget.config?.options) {
                widget.config.options.value = fallbackData.close.toLocaleString();
                widget.config.options.change = 'Historical Data';
                widget.config.options.changeType = 'neutral';
                widget.config.options.highValue = fallbackData.high.toLocaleString();
                widget.config.options.lowValue = fallbackData.low.toLocaleString();
                widget.config.options.subtitle = `Last updated: ${fallbackData.date}`;
                if (DEBUG_LOGGING) {
                  // eslint-disable-next-line no-console
                  console.log(`Updated stock tile with fallback data for ${fallbackIndexName}:`, fallbackData);
                }
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.warn(`Failed to get fallback data for index ${fallbackIndexName}:`, error);
            }
          }
        })
        .build()
    );
    
    // Only attempt immediate fallback when online and WebSocket is not healthy, and do it once per index
    if (indicesService) {
      getFallbackIndexData(fallbackIndexName, indicesService, webSocketService).then(() => {
        // No-op: widget will update via data event if needed
      }).catch(() => {
        // Swallow errors silently here to avoid console noise
      });
    }
  }

  // Add remaining tiles
  tiles.push(
    // Declines - Number of declining stocks
    TileBuilder.createInfoTile(
      'Declines',
      declines.toString(),
      'Declining Stocks',
      'fas fa-arrow-down',
      '#dc2626'
    )
      .setBackgroundColor('#fecaca')
      .setBorder('#f87171', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 2, y: 0, cols: 2, rows: 2 })
      .build(),

    // Advances - Number of advancing stocks
    TileBuilder.createInfoTile(
      'Advances',
      advances.toString(),
      'Advancing Stocks',
      'fas fa-arrow-up',
      '#16a34a'
    )
      .setBackgroundColor('#bbf7d0')
      .setBorder('#4ade80', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 4, y: 0, cols: 2, rows: 2 })
      .build(),

    // Unchanged - Number of unchanged stocks
    TileBuilder.createInfoTile(
      'Unchanged',
      unchanged.toString(),
      'Unchanged Stocks',
      'fas fa-minus',
      '#6b7280'
    )
      .setBackgroundColor('#e5e7eb')
      .setBorder('#9ca3af', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 6, y: 0, cols: 2, rows: 2 })
      .build(),

    // Traded Value - Total traded value
    TileBuilder.createFinancialTile(
      safeTotalTradedValue,
      0, // No growth rate for traded value
      'Traded Value',
      '₹',
      'fas fa-rupee-sign'
    )
      .setColor('#047857')
      .setBackgroundColor('#a7f3d0')
      .setBorder('#5eead4', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 8, y: 0, cols: 2, rows: 2 })
      .build(),

    // Traded Volume - Total traded volume
    TileBuilder.createInfoTile(
      'Traded Volume',
      safeTotalTradedVolume.toLocaleString(),
      'Total Volume',
      'fas fa-chart-bar',
      '#7c3aed'
    )
      .setBackgroundColor('#ddd6fe')
      .setBorder('#a78bfa', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 10, y: 0, cols: 2, rows: 2 })
      .build()
  );

  return tiles;
}

/**
 * Create empty metric tiles when stockTicksData is null or unavailable
 */
function createEmptyMetricTiles(
  selectedIndexData?: IndexDataDto | null,
  webSocketService?: ModernIndicesWebSocketService,
  indicesService?: IndicesService
) {
  const tiles = [
    // Stocks - Empty state - use stock tile format with fallback data
    StockTileBuilder.createStockTile(
      0, // current price - will be updated with fallback data
      0, // percent change - will be updated with fallback data
      'NIFTY 50', // description - default to NIFTY 50
      0, // high value - will be updated with fallback data
      0, // low value - will be updated with fallback data
      '₹' // currency
    )
      .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
      .setDataEvent(async (widget: any, data?: any) => {
        // Enhanced data event with immediate fallback data fetch
        if (data && data.type === 'market-overview') {
          // WebSocket is working - update with real-time data
          if (widget.config?.options) {
            widget.config.options.value = data.totalStocks || '0';
            widget.config.options.change = `${data.advances || 0} / ${data.declines || 0}`;
            widget.config.options.changeType = 'neutral';
            widget.config.options.highValue = data.totalTradedValue || '0';
            widget.config.options.lowValue = data.totalTradedVolume || '0';
          }
        } else {
          // Try to get fallback data immediately when WebSocket is not healthy and online
          try {
            const fallbackData = await getFallbackIndexData('NIFTY 50', indicesService, webSocketService);
            if (fallbackData && widget.config?.options) {
              widget.config.options.value = fallbackData.close.toLocaleString();
              widget.config.options.change = 'Historical Data';
              widget.config.options.changeType = 'neutral';
              widget.config.options.highValue = fallbackData.high.toLocaleString();
              widget.config.options.lowValue = fallbackData.low.toLocaleString();
              widget.config.options.subtitle = `Last updated: ${fallbackData.date}`;
              if (DEBUG_LOGGING) {
                // eslint-disable-next-line no-console
                console.log('Updated stock tile with fallback data for NIFTY 50:', fallbackData);
              }
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn('Failed to get fallback data for NIFTY 50:', error);
          }
        }
      })
      .build(),

    // Declines - Empty state
    TileBuilder.createInfoTile(
      'Declines',
      '0',
      'Declining Stocks',
      'fas fa-arrow-down',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 2, y: 0, cols: 2, rows: 2 })
      .build(),

    // Advances - Empty state
    TileBuilder.createInfoTile(
      'Advances',
      '0',
      'Advancing Stocks',
      'fas fa-arrow-up',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 4, y: 0, cols: 2, rows: 2 })
      .build(),

    // Unchanged - Empty state
    TileBuilder.createInfoTile(
      'Unchanged',
      '0',
      'Unchanged Stocks',
      'fas fa-minus',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 6, y: 0, cols: 2, rows: 2 })
      .build(),

    // Traded Value - Empty state
    TileBuilder.createFinancialTile(
      0,
      0,
      'Traded Value',
      '₹',
      'fas fa-rupee-sign'
    )
      .setColor('#6b7280')
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 8, y: 0, cols: 2, rows: 2 })
      .build(),

    // Traded Volume - Empty state
    TileBuilder.createInfoTile(
      'Traded Volume',
      '0',
      'Total Volume',
      'fas fa-chart-bar',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 10, y: 0, cols: 2, rows: 2 })
      .build()
  ];

  // Only attempt immediate fallback when online and WebSocket is not healthy, and do it once per index
  if (indicesService) {
    getFallbackIndexData('NIFTY 50', indicesService, webSocketService).then(() => {
      // No-op: widget will update via data event if needed
    }).catch(() => {
      // Swallow errors silently here to avoid console noise
    });
  }

  return tiles;
}

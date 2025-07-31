import { TileBuilder } from '@dashboards/public-api';
import { DashboardDataRow } from './dashboard-data';
import {StockDataDto, StockTicksDto} from '../../../../services/entities/stock-ticks';

/**
 * Create metric tiles that display key statistics from stock ticks data
 */
export function createMetricTiles(stockTicksData: StockDataDto[] | null) {
  // Handle null or undefined stockTicksData
  if (!stockTicksData) {
    return createEmptyMetricTiles();
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
  const tiles = [
    // Stocks - Total number of stocks
    TileBuilder.createInfoTile(
      'Stocks',
      stocksCount.toString(),
      'Total Stocks',
      'fas fa-chart-line',
      '#1e40af'
    )
      .setBackgroundColor('#bfdbfe')
      .setBorder('#7dd3fc', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
      .build(),

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
  ];

  return tiles;
}

/**
 * Create empty metric tiles when stockTicksData is null or unavailable
 */
function createEmptyMetricTiles() {
  const tiles = [
    // Stocks - Empty state
    TileBuilder.createInfoTile(
      'Stocks',
      '0',
      'Total Stocks',
      'fas fa-chart-line',
      '#6b7280'
    )
      .setBackgroundColor('#f3f4f6')
      .setBorder('#d1d5db', 1, 8)
      .setUpdateOnDataChange(true)
      .setPosition({ x: 0, y: 0, cols: 2, rows: 2 })
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

  return tiles;
}

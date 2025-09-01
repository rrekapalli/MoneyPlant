/**
 * Interface representing NSE historical data.
 */
import { NseHistoricalDataId } from './nse-historical-data-id';

export interface NseHistoricalData {
    id: NseHistoricalDataId;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number | null;
    vwap?: number | null;
    previousClose?: number | null;
    totalTradedValue?: number | null;
    totalTrades?: number | null;
    deliveryQuantity?: number | null;
    deliveryPercentage?: number | null;
    series?: string | null;
    createdAt?: string | null; // ISO timestamp
    updatedAt?: string | null; // ISO timestamp
}
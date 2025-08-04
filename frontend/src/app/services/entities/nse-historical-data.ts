/**
 * Interface representing NSE historical data.
 */
import { NseHistoricalDataId } from './nse-historical-data-id';

export interface NseHistoricalData {
    id: NseHistoricalDataId;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
/**
 * Interface representing NSE Indices Tick Data
 * Based on the actual API response from the engines project
 */
export interface NseIndicesTickDto {
  timestamp: string | null;
  indices: IndexTickDataDto[] | null;
  marketStatus: string | null;
  source: string | null;
  ingestionTimestamp: string;
}

/**
 * Interface for individual index tick data
 */
export interface IndexTickDataDto {
  key: string | null;
  index: string;
  indexSymbol: string;
  last: number;
  variation: number;
  percentChange: number;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  previousClose: number | null;
  yearHigh: number | null;
  yearLow: number | null;
  indicativeClose: number | null;
  pe: number | null;
  pb: number | null;
  dy: number | null;
  declines: number | null;
  advances: number | null;
  unchanged: number | null;
  perChange365d: number | null;
  date365dAgo: string | null;
  chart365dPath: string | null;
  date30dAgo: string | null;
  perChange30d: number | null;
  chart30dPath: string | null;
  chartTodayPath: string | null;
  tickTimestamp: string;
}

/**
 * Interface for NSE Indices ingestion status response
 */
export interface NseIndicesStatusResponse {
  ingestionStatus: string;
  webSocketConnected: boolean;
  connectionStats: string;
  timestamp: string;
}

/**
 * Interface for NSE Indices system info response
 */
export interface NseIndicesSystemInfo {
  serviceName: string;
  version: string;
  description: string;
  dataSource: string;
  outputDestination: string;
  supportedIndices: string[];
  ingestionStatus: string;
  webSocketConnected: boolean;
  timestamp: string;
}

/**
 * Interface for NSE Indices WebSocket health response
 */
export interface NseIndicesWebSocketHealth {
  webSocketConnected: boolean;
  connectionStats: string;
  timestamp: string;
}

/**
 * Interface for NSE Indices operation response
 */
export interface NseIndicesOperationResponse {
  status: string;
  message: string;
  timestamp: string;
  indexName?: string;
}

/**
 * Interface for NSE Indices subscription response
 */
export interface NseIndicesSubscriptionResponse extends NseIndicesOperationResponse {
  indexName: string;
}

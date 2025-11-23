package com.moneyplant.engines.ingestion.provider;

import com.moneyplant.engines.common.entities.NseEquityMaster;
import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

/**
 * Interface for market data providers.
 * Defines common contract for fetching historical data and symbol master information.
 * 
 * Implementations:
 * - NseDataProvider: Fetches data from NSE API
 * - YahooFinanceProvider: Fetches data from Yahoo Finance API
 * 
 * Requirements: 6.1, 6.2
 */
public interface DataProvider {
    
    /**
     * Fetches historical OHLCV data for a symbol within a date range.
     * 
     * @param symbol Trading symbol (e.g., "RELIANCE", "TCS")
     * @param start Start date (inclusive)
     * @param end End date (inclusive)
     * @param timeframe Data timeframe (e.g., 1min, 1day)
     * @return Mono containing list of OHLCV data
     */
    Mono<List<OhlcvData>> fetchHistorical(String symbol, LocalDate start, LocalDate end, Timeframe timeframe);
    
    /**
     * Fetches equity master data (symbol metadata).
     * Only applicable for NSE provider.
     * 
     * @return Mono containing list of equity master records
     */
    Mono<List<NseEquityMaster>> fetchEquityMasterData();
    
    /**
     * Checks if the provider is healthy and operational.
     * 
     * @return Mono containing health status
     */
    Mono<Boolean> isHealthy();
    
    /**
     * Returns the provider type.
     * 
     * @return Provider type enum
     */
    ProviderType getType();
    
    /**
     * Enum representing different data provider types
     */
    enum ProviderType {
        NSE,
        YAHOO_FINANCE,
        CSV
    }
}

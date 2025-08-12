package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.common.dto.MarketDataDto;

import java.util.List;

/**
 * Service interface for data ingestion operations
 */
public interface IngestionService {
    
    /**
     * Start data ingestion from a specific data source
     */
    void startIngestion(String dataSource);
    
    /**
     * Stop data ingestion from a specific data source
     */
    void stopIngestion(String dataSource);
    
    /**
     * Get ingestion status for a data source
     */
    String getIngestionStatus(String dataSource);
    
    /**
     * Ingest market data
     */
    void ingestMarketData(MarketDataDto marketData);
    
    /**
     * Get ingested data for a symbol
     */
    List<MarketDataDto> getIngestedData(String symbol);
    
    /**
     * Process streaming data
     */
    void processStreamingData(String data);
}

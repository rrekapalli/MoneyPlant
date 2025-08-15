package com.moneyplant.engines.storage.service;

import com.moneyplant.engines.common.dto.MarketDataDto;

import java.util.List;

/**
 * Service interface for storage operations
 */
public interface StorageService {
    
    /**
     * Write single market data record
     */
    void writeData(MarketDataDto marketData);
    
    /**
     * Write batch market data records
     */
    void writeBatchData(List<MarketDataDto> marketDataList);
    
    /**
     * Read data for a specific symbol
     */
    List<MarketDataDto> readData(String symbol);
    
    /**
     * Read data for a symbol within date range
     */
    List<MarketDataDto> readDataByDateRange(String symbol, String startDate, String endDate);
    
    /**
     * Delete data for a symbol
     */
    void deleteData(String symbol);
    
    /**
     * Get list of available tables
     */
    List<String> getAvailableTables();
    
    /**
     * Optimize storage performance
     */
    void optimizeStorage();
    
    /**
     * Write to Hudi table
     */
    void writeToHudi(String tableName, Object data);
    
    /**
     * Write to Iceberg table
     */
    void writeToIceberg(String tableName, Object data);
    
    /**
     * Read from Hudi table
     */
    List<Object> readFromHudi(String tableName, String query);
    
    /**
     * Read from Iceberg table
     */
    List<Object> readFromIceberg(String tableName, String query);
}

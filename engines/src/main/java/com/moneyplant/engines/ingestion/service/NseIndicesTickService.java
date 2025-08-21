package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.common.entities.NseIndicesTick;
import com.moneyplant.engines.common.NseIndicesTickDto;

import java.time.Instant;
import java.util.List;

/**
 * Service interface for managing NSE indices tick data operations.
 * Handles database operations for storing and retrieving real-time NSE indices data.
 */
public interface NseIndicesTickService {
    
    /**
     * Save or update NSE indices tick data in the database
     * Uses UPSERT operation to handle duplicates efficiently
     */
    void upsertTickData(NseIndicesTickDto tickDto);
    
    /**
     * Save or update multiple NSE indices tick data entries
     */
    void upsertMultipleTickData(List<NseIndicesTickDto> tickDtos);
    
    /**
     * Get the latest tick data for a specific index
     */
    NseIndicesTick getLatestTickData(String indexName);
    
    /**
     * Get the latest tick data for all indices
     */
    List<NseIndicesTick> getLatestTicksForAllIndices();
    
    /**
     * Get tick data for a specific index within a time range
     */
    List<NseIndicesTick> getTickDataByIndexAndTimeRange(String indexName, Instant startTime, Instant endTime);
    
    /**
     * Get tick data within a time range for all indices
     */
    List<NseIndicesTick> getTickDataByTimeRange(Instant startTime, Instant endTime);
    
    /**
     * Clean up old tick data to prevent table from growing too large
     * Removes data older than the specified cutoff time
     */
    void cleanupOldTickData(Instant cutoffTime);
    
    /**
     * Get total count of tick data records
     */
    long getTotalTickDataCount();
    
    /**
     * Get tick data by source
     */
    List<NseIndicesTick> getTickDataBySource(String source);
    
    /**
     * Convert DTO to entity for database operations
     */
    NseIndicesTick convertDtoToEntity(NseIndicesTickDto dto);
    
    /**
     * Convert entity to DTO for API responses
     */
    NseIndicesTickDto convertEntityToDto(NseIndicesTick entity);
}

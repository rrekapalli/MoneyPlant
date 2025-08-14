package com.moneyplant.engines.ingestion.service;

import com.moneyplant.engines.common.dto.NseIndicesTickDto;

import java.util.List;

/**
 * Service interface for NSE indices data ingestion operations.
 * Handles WebSocket connection to NSE, data processing, and Kafka publishing.
 */
public interface NseIndicesService {
    
    /**
     * Start NSE indices data ingestion
     * Connects to NSE WebSocket and starts streaming data
     */
    void startNseIndicesIngestion();
    
    /**
     * Stop NSE indices data ingestion
     * Gracefully closes WebSocket connection
     */
    void stopNseIndicesIngestion();
    
    /**
     * Get the current ingestion status
     */
    String getIngestionStatus();
    
    /**
     * Subscribe to all NSE indices data
     */
    void subscribeToAllIndices();
    
    /**
     * Subscribe to specific NSE index data
     */
    void subscribeToIndex(String indexName);
    
    /**
     * Unsubscribe from all NSE indices data
     */
    void unsubscribeFromAllIndices();
    
    /**
     * Unsubscribe from specific NSE index data
     */
    void unsubscribeFromIndex(String indexName);
    
    /**
     * Get the latest ingested indices data
     */
    List<NseIndicesTickDto> getLatestIndicesData();
    
    /**
     * Get the latest data for a specific index
     */
    NseIndicesTickDto getLatestIndexData(String indexName);
    
    /**
     * Manually trigger data ingestion for testing purposes
     */
    void triggerManualIngestion();
    
    /**
     * Check WebSocket connection health
     */
    boolean isWebSocketConnected();
    
    /**
     * Get connection statistics
     */
    String getConnectionStats();
    
    /**
     * Test Kafka consumer with sample data
     */
    void testKafkaConsumer();
}

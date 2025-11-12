package com.moneyplant.engines.ingestion.model;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.Map;

/**
 * Data model representing the current status of the ingestion engine.
 * Provides information about active providers, data flow, and health metrics.
 * 
 * Requirements: 2.8
 */
@Data
@Builder
public class IngestionStatus {
    
    /**
     * Overall status of the ingestion engine
     */
    private Status status;
    
    /**
     * Timestamp when the status was generated
     */
    private Instant timestamp;
    
    /**
     * Number of active data providers
     */
    private int activeProviders;
    
    /**
     * Number of symbols currently being ingested
     */
    private int activeSymbols;
    
    /**
     * Total ticks processed since startup
     */
    private long totalTicksProcessed;
    
    /**
     * Total OHLCV candles generated since startup
     */
    private long totalCandlesGenerated;
    
    /**
     * Current throughput (ticks per second)
     */
    private double currentThroughput;
    
    /**
     * Average processing latency in milliseconds
     */
    private double averageLatencyMs;
    
    /**
     * Number of errors encountered
     */
    private long errorCount;
    
    /**
     * Last error message (if any)
     */
    private String lastError;
    
    /**
     * Timestamp of last error
     */
    private Instant lastErrorTime;
    
    /**
     * Provider-specific status information
     */
    private Map<String, ProviderStatus> providerStatuses;
    
    /**
     * Kafka connection status
     */
    private boolean kafkaConnected;
    
    /**
     * TimescaleDB connection status
     */
    private boolean databaseConnected;
    
    /**
     * Uptime in seconds
     */
    private long uptimeSeconds;
    
    /**
     * Overall status enum
     */
    public enum Status {
        RUNNING,
        STARTING,
        STOPPING,
        STOPPED,
        ERROR
    }
    
    /**
     * Provider-specific status information
     */
    @Data
    @Builder
    public static class ProviderStatus {
        private String providerName;
        private boolean connected;
        private int subscribedSymbols;
        private long ticksReceived;
        private Instant lastTickTime;
        private String errorMessage;
    }
}

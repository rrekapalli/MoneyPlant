package com.moneyplant.engines.ingestion.kite.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.util.Map;

/**
 * DTO containing summary statistics for an ingestion job.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestionSummary {
    
    /**
     * Total number of records processed.
     */
    private int totalRecords;
    
    /**
     * Number of successfully processed records.
     */
    private int successCount;
    
    /**
     * Number of failed records.
     */
    private int failureCount;
    
    /**
     * Breakdown of records by category (e.g., by exchange or instrument type).
     * Key: category name, Value: count
     */
    private Map<String, Integer> recordsByCategory;
    
    /**
     * Total execution time.
     */
    private Duration executionTime;
}

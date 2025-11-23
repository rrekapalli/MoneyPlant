package com.moneyplant.engines.ingestion.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Result model for end-of-day archival operations.
 * Contains metadata about the archival process including status and record counts.
 * 
 * Requirements: 11.2
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivalResult {
    
    /**
     * Date for which archival was performed
     */
    private LocalDate date;
    
    /**
     * Number of records archived from TimescaleDB
     */
    private long sourceRecordCount;
    
    /**
     * Number of records written to Hudi
     */
    private long destinationRecordCount;
    
    /**
     * Whether archival was successful
     */
    private boolean success;
    
    /**
     * Timestamp when archival started
     */
    private Instant startTime;
    
    /**
     * Timestamp when archival completed
     */
    private Instant endTime;
    
    /**
     * Duration of archival in milliseconds
     */
    private long durationMs;
    
    /**
     * Error message if archival failed
     */
    private String errorMessage;
    
    /**
     * Whether data integrity check passed (source count == destination count)
     */
    private boolean integrityCheckPassed;
    
    /**
     * Whether intraday table was truncated after archival
     */
    private boolean tableTruncated;
    
    /**
     * Convenience constructor for successful archival
     */
    public ArchivalResult(LocalDate date, long recordCount, boolean success) {
        this.date = date;
        this.sourceRecordCount = recordCount;
        this.destinationRecordCount = recordCount;
        this.success = success;
        this.integrityCheckPassed = true;
        this.tableTruncated = success;
    }
    
    /**
     * Calculate duration from start and end times
     */
    public void calculateDuration() {
        if (startTime != null && endTime != null) {
            this.durationMs = endTime.toEpochMilli() - startTime.toEpochMilli();
        }
    }
    
    /**
     * Check if record counts match
     */
    public boolean isRecordCountMatch() {
        return sourceRecordCount == destinationRecordCount;
    }
}

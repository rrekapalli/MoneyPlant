package com.moneyplant.engines.ingestion.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

/**
 * Request model for triggering backfill operations.
 * Specifies symbols, date range, and timeframe for historical data ingestion.
 * 
 * Requirements: 2.8
 */
@Data
@Builder
public class BackfillRequest {
    
    /**
     * Set of trading symbols to backfill
     */
    @NotEmpty(message = "Symbols cannot be empty")
    private Set<String> symbols;
    
    /**
     * Start date for backfill (inclusive)
     */
    @NotNull(message = "Start date cannot be null")
    private LocalDate startDate;
    
    /**
     * End date for backfill (inclusive)
     */
    @NotNull(message = "End date cannot be null")
    private LocalDate endDate;
    
    /**
     * Timeframe for OHLCV data
     */
    @NotNull(message = "Timeframe cannot be null")
    private Timeframe timeframe;
    
    /**
     * Whether to detect and fill only gaps (true) or fetch all data (false)
     */
    private boolean fillGapsOnly;
    
    /**
     * Maximum number of concurrent symbol fetches
     */
    private int maxConcurrency;
    
    /**
     * Default constructor with sensible defaults
     */
    public BackfillRequest() {
        this.fillGapsOnly = true;
        this.maxConcurrency = 5;
    }
    
    /**
     * All-args constructor for builder
     */
    public BackfillRequest(Set<String> symbols, LocalDate startDate, LocalDate endDate, 
                          Timeframe timeframe, boolean fillGapsOnly, int maxConcurrency) {
        this.symbols = symbols;
        this.startDate = startDate;
        this.endDate = endDate;
        this.timeframe = timeframe;
        this.fillGapsOnly = fillGapsOnly;
        this.maxConcurrency = maxConcurrency > 0 ? maxConcurrency : 5;
    }
}

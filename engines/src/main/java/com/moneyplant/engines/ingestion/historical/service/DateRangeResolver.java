package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.DateRange;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

/**
 * Service interface for resolving date ranges for historical data ingestion.
 * 
 * This service determines the appropriate date range based on:
 * - User-provided start and end dates
 * - Existing data in the database (for incremental ingestion)
 * - Default start date (1998-01-01) when no data exists
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */
public interface DateRangeResolver {
    
    /**
     * Resolves the date range for historical data ingestion.
     * 
     * Resolution logic:
     * 1. If both startDate and endDate are provided → use them directly
     * 2. If no startDate provided:
     *    a. Query nse_eq_ohlcv_historic for MAX(time)
     *    b. If MAX(time) found → use MAX(time) + 1 day as start (incremental ingestion)
     *    c. If no existing data → use default start date (1998-01-01)
     * 3. If no endDate provided → use current date
     * 
     * @param startDate optional start date (null for automatic detection)
     * @param endDate optional end date (null for current date)
     * @return Mono containing the resolved DateRange
     * 
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
     */
    Mono<DateRange> resolveDateRange(LocalDate startDate, LocalDate endDate);
}

package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.DateRange;
import com.moneyplant.engines.ingestion.historical.repository.HistoricalOhlcvRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

/**
 * Implementation of DateRangeResolver service.
 * 
 * This service intelligently determines the appropriate date range for historical data ingestion
 * by checking existing data in the database and applying smart defaults.
 * 
 * Key features:
 * - Automatic incremental ingestion (starts from day after last available data)
 * - Full ingestion when no data exists (starts from 1998-01-01)
 * - Explicit date range support for custom ingestion periods
 * - Comprehensive logging for monitoring and debugging
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
 */
@Service
@Slf4j
public class DateRangeResolverImpl implements DateRangeResolver {
    
    /**
     * Default start date for NSE historical data (NSE started electronic trading in 1994,
     * but comprehensive data is available from 1998)
     */
    private static final LocalDate DEFAULT_START_DATE = LocalDate.of(1998, 1, 1);
    
    private final HistoricalOhlcvRepository ohlcvRepository;
    
    public DateRangeResolverImpl(HistoricalOhlcvRepository ohlcvRepository) {
        this.ohlcvRepository = ohlcvRepository;
    }
    
    /**
     * Resolves the date range for historical data ingestion.
     * 
     * Resolution logic:
     * 1. If both dates provided → use them directly
     * 2. If no startDate → query database for MAX(time)
     *    - If MAX(time) found → incremental ingestion from MAX(time) + 1
     *    - If no data → full ingestion from 1998-01-01
     * 3. If no endDate → use current date
     * 
     * @param startDate optional start date (null for automatic detection)
     * @param endDate optional end date (null for current date)
     * @return Mono containing the resolved DateRange
     * 
     * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7
     */
    @Override
    public Mono<DateRange> resolveDateRange(LocalDate startDate, LocalDate endDate) {
        log.debug("Resolving date range - startDate: {}, endDate: {}", startDate, endDate);
        
        // Determine effective end date (use current date if not provided)
        LocalDate effectiveEndDate = endDate != null ? endDate : LocalDate.now();
        
        // If both dates provided explicitly, use them without querying database
        if (startDate != null) {
            log.info("Using explicit date range: {} to {}", startDate, effectiveEndDate);
            log.info("Full ingestion from {} to {}", startDate, effectiveEndDate);
            
            DateRange dateRange = DateRange.builder()
                    .start(startDate)
                    .end(effectiveEndDate)
                    .build();
            
            logDateRangeSummary(dateRange);
            return Mono.just(dateRange);
        }
        
        // No start date provided - check for existing data to determine incremental vs full ingestion
        log.debug("No start date provided, querying database for existing data");
        
        return ohlcvRepository.getMaxDate()
                .flatMap(maxDate -> {
                    // Incremental ingestion: start from day after max date
                    LocalDate incrementalStart = maxDate.plusDays(1);
                    
                    if (incrementalStart.isAfter(effectiveEndDate)) {
                        log.info("Data already up to date (max date: {})", maxDate);
                        log.info("No ingestion needed - data is current up to {}", maxDate);
                        
                        // Return empty range (start > end indicates no work needed)
                        DateRange emptyRange = DateRange.builder()
                                .start(effectiveEndDate)
                                .end(effectiveEndDate.minusDays(1))
                                .build();
                        
                        return Mono.just(emptyRange);
                    }
                    
                    log.info("Incremental ingestion from {} to {}", incrementalStart, effectiveEndDate);
                    log.info("Existing data found up to {}, starting incremental ingestion from {}", 
                            maxDate, incrementalStart);
                    
                    DateRange dateRange = DateRange.builder()
                            .start(incrementalStart)
                            .end(effectiveEndDate)
                            .build();
                    
                    logDateRangeSummary(dateRange);
                    return Mono.just(dateRange);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    // No existing data - use default start date for full ingestion
                    log.info("Full ingestion from {} to {}", DEFAULT_START_DATE, effectiveEndDate);
                    log.info("No existing data found, starting full ingestion from default start date: {}", 
                            DEFAULT_START_DATE);
                    
                    DateRange dateRange = DateRange.builder()
                            .start(DEFAULT_START_DATE)
                            .end(effectiveEndDate)
                            .build();
                    
                    logDateRangeSummary(dateRange);
                    return Mono.just(dateRange);
                }));
    }
    
    /**
     * Logs a summary of the resolved date range including day count.
     * 
     * @param dateRange the resolved date range
     * 
     * Requirements: 3.6, 3.7
     */
    private void logDateRangeSummary(DateRange dateRange) {
        if (dateRange.isValid()) {
            long dayCount = dateRange.getDayCount();
            log.info("Resolved date range: {} to {} ({} days)", 
                    dateRange.getStart(), dateRange.getEnd(), dayCount);
        } else if (dateRange.isEmpty()) {
            log.info("Resolved empty date range - no ingestion needed");
        } else {
            log.warn("Resolved invalid date range: {} to {}", 
                    dateRange.getStart(), dateRange.getEnd());
        }
    }
}

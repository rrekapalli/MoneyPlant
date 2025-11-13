package com.moneyplant.engines.ingestion.historical.repository;

import com.moneyplant.engines.ingestion.historical.model.BhavCopyData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDate;

/**
 * Repository for historical OHLCV data operations.
 * Provides methods for querying and managing NSE bhav copy data in the nse_eq_ohlcv_historic table.
 * 
 * This repository focuses on raw data operations without any calculations or adjustments.
 * 
 * Requirements: 3.1, 3.2
 */
@Repository
@Slf4j
public class HistoricalOhlcvRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    private static final String GET_MAX_DATE_SQL = 
        "SELECT MAX(time)::date as max_date " +
        "FROM nse_eq_ohlcv_historic " +
        "WHERE timeframe = '1day'";
    
    public HistoricalOhlcvRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Get the maximum date across all data in the nse_eq_ohlcv_historic table.
     * Used for incremental ingestion detection to determine where to start downloading new data.
     * 
     * This method queries the MAX(time) across all symbols to find the most recent date
     * for which we have data. The ingestion service can then start from the next day.
     * 
     * @return Mono containing the maximum date, or empty Mono if no data exists
     * 
     * Requirements: 3.1, 3.2
     */
    @Transactional(readOnly = true)
    public Mono<LocalDate> getMaxDate() {
        log.debug("Querying maximum date from nse_eq_ohlcv_historic table");
        
        return Mono.fromCallable(() -> {
            LocalDate maxDate = jdbcTemplate.queryForObject(
                GET_MAX_DATE_SQL,
                LocalDate.class
            );
            
            if (maxDate != null) {
                log.info("Found maximum date in historical data: {}", maxDate);
            } else {
                log.info("No existing data found in nse_eq_ohlcv_historic table");
            }
            
            return maxDate;
        })
        .subscribeOn(Schedulers.boundedElastic())
        .onErrorResume(e -> {
            log.error("Error querying maximum date from nse_eq_ohlcv_historic", e);
            return Mono.empty();
        });
    }
}

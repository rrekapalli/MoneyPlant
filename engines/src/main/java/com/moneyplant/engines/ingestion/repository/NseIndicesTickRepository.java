package com.moneyplant.engines.ingestion.repository;

import com.moneyplant.engines.common.entities.NseIndicesTick;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for NseIndicesTick entity.
 * Provides methods to interact with the nse_indices_ticks table in the database.
 */
@Repository
public interface NseIndicesTickRepository extends JpaRepository<NseIndicesTick, Long> {
    
    /**
     * Find the latest tick data for a specific index by index name
     */
    Optional<NseIndicesTick> findFirstByIndexNameOrderByTickTimestampDesc(String indexName);
    
    /**
     * Find all tick data for a specific index within a time range
     */
    List<NseIndicesTick> findByIndexNameAndTickTimestampBetweenOrderByTickTimestampDesc(
        String indexName, Instant startTime, Instant endTime);
    
    /**
     * Find all tick data within a time range
     */
    List<NseIndicesTick> findByTickTimestampBetweenOrderByTickTimestampDesc(Instant startTime, Instant endTime);
    
    /**
     * Find the latest tick data for all indices
     */
    @Query("SELECT DISTINCT n FROM NseIndicesTick n " +
           "WHERE n.tickTimestamp = (SELECT MAX(n2.tickTimestamp) FROM NseIndicesTick n2 WHERE n2.indexName = n.indexName)")
    List<NseIndicesTick> findLatestTicksForAllIndices();
    
    /**
     * Upsert tick data - insert if not exists, update if exists
     * Uses native SQL for better performance on large datasets
     */
    @Modifying
    @Query(value = "INSERT INTO nse_indices_ticks (" +
           "index_name, index_symbol, last_price, variation, percent_change, " +
           "open_price, day_high, day_low, previous_close, year_high, year_low, " +
           "indicative_close, pe_ratio, pb_ratio, dividend_yield, declines, advances, " +
           "unchanged, percent_change_365d, date_365d_ago, chart_365d_path, " +
           "date_30d_ago, percent_change_30d, chart_30d_path, chart_today_path, " +
           "market_status, market_status_message, trade_date, market_status_time, " +
           "tick_timestamp, created_by, created_on, modified_by, modified_on) " +
           "VALUES (:#{#tick.indexName}, :#{#tick.indexSymbol}, :#{#tick.lastPrice}, " +
           ":#{#tick.variation}, :#{#tick.percentChange}, :#{#tick.openPrice}, " +
           ":#{#tick.dayHigh}, :#{#tick.dayLow}, :#{#tick.previousClose}, " +
           ":#{#tick.yearHigh}, :#{#tick.yearLow}, :#{#tick.indicativeClose}, " +
           ":#{#tick.peRatio}, :#{#tick.pbRatio}, :#{#tick.dividendYield}, " +
           ":#{#tick.declines}, :#{#tick.advances}, :#{#tick.unchanged}, " +
           ":#{#tick.percentChange365d}, :#{#tick.date365dAgo}, :#{#tick.chart365dPath}, " +
           ":#{#tick.date30dAgo}, :#{#tick.percentChange30d}, :#{#tick.chart30dPath}, " +
           ":#{#tick.chartTodayPath}, :#{#tick.marketStatus}, :#{#tick.marketStatusMessage}, " +
           ":#{#tick.tradeDate}, :#{#tick.marketStatusTime}, :#{#tick.tickTimestamp}, " +
           ":#{#tick.createdBy}, :#{#tick.createdOn}, :#{#tick.modifiedBy}, :#{#tick.modifiedOn}) " +
           "ON CONFLICT (index_name, tick_timestamp) " +
           "DO UPDATE SET " +
           "index_symbol = EXCLUDED.index_symbol, " +
           "last_price = EXCLUDED.last_price, " +
           "variation = EXCLUDED.variation, " +
           "percent_change = EXCLUDED.percent_change, " +
           "open_price = EXCLUDED.open_price, " +
           "day_high = EXCLUDED.day_high, " +
           "day_low = EXCLUDED.day_low, " +
           "previous_close = EXCLUDED.previous_close, " +
           "year_high = EXCLUDED.year_high, " +
           "year_low = EXCLUDED.year_low, " +
           "indicative_close = EXCLUDED.indicative_close, " +
           "pe_ratio = EXCLUDED.pe_ratio, " +
           "pb_ratio = EXCLUDED.pb_ratio, " +
           "dividend_yield = EXCLUDED.dividend_yield, " +
           "declines = EXCLUDED.declines, " +
           "advances = EXCLUDED.advances, " +
           "unchanged = EXCLUDED.unchanged, " +
           "percent_change_365d = EXCLUDED.percent_change_365d, " +
           "date_365d_ago = EXCLUDED.date_365d_ago, " +
           "chart_365d_path = EXCLUDED.chart_365d_path, " +
           "date_30d_ago = EXCLUDED.date_30d_ago, " +
           "percent_change_30d = EXCLUDED.percent_change_30d, " +
           "chart_30d_path = EXCLUDED.chart_30d_path, " +
           "chart_today_path = EXCLUDED.chart_today_path, " +
           "market_status = EXCLUDED.market_status, " +
           "market_status_message = EXCLUDED.market_status_message, " +
           "trade_date = EXCLUDED.trade_date, " +
           "market_status_time = EXCLUDED.market_status_time, " +
           "modified_by = EXCLUDED.modified_by, " +
           "modified_on = EXCLUDED.modified_on", 
           nativeQuery = true)
    void upsertTickData(@Param("tick") NseIndicesTick tick);
    
    /**
     * Delete old tick data to prevent table from growing too large
     */
    @Modifying
    @Query("DELETE FROM NseIndicesTick n WHERE n.tickTimestamp < :cutoffTime")
    void deleteOldTickData(@Param("cutoffTime") Instant cutoffTime);
    
    /**
     * Count total records in the table
     */
    long count();
    
    /**
     * Find tick data by created by
     */
    List<NseIndicesTick> findByCreatedByOrderByTickTimestampDesc(String createdBy);
}

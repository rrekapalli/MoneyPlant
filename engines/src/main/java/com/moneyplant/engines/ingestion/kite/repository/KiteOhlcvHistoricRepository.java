package com.moneyplant.engines.ingestion.kite.repository;

import com.moneyplant.engines.ingestion.kite.model.entity.KiteOhlcvHistoric;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteOhlcvHistoricId;
import com.moneyplant.engines.ingestion.kite.model.enums.CandleInterval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Spring Data JPA repository for KiteOhlcvHistoric entity.
 * Provides CRUD operations and custom queries for historical OHLCV data.
 */
@Repository
public interface KiteOhlcvHistoricRepository extends JpaRepository<KiteOhlcvHistoric, KiteOhlcvHistoricId> {
    
    /**
     * Find OHLCV data for an instrument within a date range.
     * @param instrumentToken The instrument token
     * @param exchange The exchange code
     * @param candleInterval The candle interval
     * @param startDate Start of date range
     * @param endDate End of date range
     * @return List of OHLCV records ordered by date
     */
    @Query("SELECT k FROM KiteOhlcvHistoric k WHERE k.instrumentToken = :instrumentToken " +
           "AND k.exchange = :exchange AND k.candleInterval = :candleInterval " +
           "AND k.date BETWEEN :startDate AND :endDate ORDER BY k.date ASC")
    List<KiteOhlcvHistoric> findByInstrumentAndDateRange(
        @Param("instrumentToken") String instrumentToken,
        @Param("exchange") String exchange,
        @Param("candleInterval") CandleInterval candleInterval,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Find latest OHLCV data for an instrument.
     * @param instrumentToken The instrument token
     * @param exchange The exchange code
     * @param candleInterval The candle interval
     * @param limit Maximum number of records to return
     * @return List of latest OHLCV records ordered by date descending
     */
    @Query(value = "SELECT * FROM kite_ohlcv_historic WHERE instrument_token = :instrumentToken " +
           "AND exchange = :exchange AND candle_interval = :candleInterval " +
           "ORDER BY date DESC LIMIT :limit", nativeQuery = true)
    List<KiteOhlcvHistoric> findLatestByInstrument(
        @Param("instrumentToken") String instrumentToken,
        @Param("exchange") String exchange,
        @Param("candleInterval") String candleInterval,
        @Param("limit") int limit
    );
    
    /**
     * Count OHLCV records for an instrument.
     * @param instrumentToken The instrument token
     * @param exchange The exchange code
     * @return Count of records
     */
    long countByInstrumentTokenAndExchange(String instrumentToken, String exchange);
    
    /**
     * Find all candle intervals available for an instrument.
     * @param instrumentToken The instrument token
     * @param exchange The exchange code
     * @return List of available candle intervals
     */
    @Query("SELECT DISTINCT k.candleInterval FROM KiteOhlcvHistoric k " +
           "WHERE k.instrumentToken = :instrumentToken AND k.exchange = :exchange")
    List<CandleInterval> findAvailableIntervals(
        @Param("instrumentToken") String instrumentToken,
        @Param("exchange") String exchange
    );
    
    /**
     * Get date range for available data for an instrument.
     * @param instrumentToken The instrument token
     * @param exchange The exchange code
     * @param candleInterval The candle interval
     * @return Array with [minDate, maxDate]
     */
    @Query("SELECT MIN(k.date), MAX(k.date) FROM KiteOhlcvHistoric k " +
           "WHERE k.instrumentToken = :instrumentToken AND k.exchange = :exchange " +
           "AND k.candleInterval = :candleInterval")
    Object[] findDateRange(
        @Param("instrumentToken") String instrumentToken,
        @Param("exchange") String exchange,
        @Param("candleInterval") CandleInterval candleInterval
    );
    
    /**
     * Delete old data before a specific date (for data retention).
     * @param beforeDate Delete records before this date
     * @return Number of records deleted
     */
    @Query("DELETE FROM KiteOhlcvHistoric k WHERE k.date < :beforeDate")
    int deleteByDateBefore(@Param("beforeDate") LocalDateTime beforeDate);
}

package com.moneyplant.engines.ingestion.kite.repository;

import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMaster;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteOhlcvHistoric;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.util.Arrays;
import java.util.List;

/**
 * Repository for high-performance batch insert/update operations using JDBC.
 * Uses JDBC batch operations for bulk inserts to achieve better performance
 * than JPA for large datasets.
 */
@Repository
@Slf4j
public class KiteBatchRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    @Value("${kite.ingestion.batch-size:1000}")
    private int batchSize;
    
    public KiteBatchRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Batch upsert instruments using JDBC batch operations.
     * Uses INSERT ... ON CONFLICT ... DO UPDATE for PostgreSQL.
     * 
     * @param instruments List of instruments to upsert
     * @return Array of update counts for each batch
     */
    public int[] batchUpsertInstruments(List<KiteInstrumentMaster> instruments) {
        if (instruments == null || instruments.isEmpty()) {
            log.warn("No instruments to upsert");
            return new int[0];
        }
        
        String sql = """
            INSERT INTO kite_instrument_master (
                instrument_token, exchange_token, tradingsymbol, name, last_price,
                expiry, strike, tick_size, lot_size, instrument_type, segment, exchange,
                last_updated, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (instrument_token, exchange)
            DO UPDATE SET
                exchange_token = EXCLUDED.exchange_token,
                tradingsymbol = EXCLUDED.tradingsymbol,
                name = EXCLUDED.name,
                last_price = EXCLUDED.last_price,
                expiry = EXCLUDED.expiry,
                strike = EXCLUDED.strike,
                tick_size = EXCLUDED.tick_size,
                lot_size = EXCLUDED.lot_size,
                instrument_type = EXCLUDED.instrument_type,
                segment = EXCLUDED.segment,
                last_updated = CURRENT_TIMESTAMP
            """;
        
        log.info("Batch upserting {} instruments with batch size {}", instruments.size(), batchSize);
        
        int[] results = jdbcTemplate.batchUpdate(sql, instruments, batchSize,
            (PreparedStatement ps, KiteInstrumentMaster instrument) -> {
                ps.setString(1, instrument.getInstrumentToken());
                ps.setString(2, instrument.getExchangeToken());
                ps.setString(3, instrument.getTradingsymbol());
                ps.setString(4, instrument.getName());
                
                if (instrument.getLastPrice() != null) {
                    ps.setDouble(5, instrument.getLastPrice());
                } else {
                    ps.setNull(5, java.sql.Types.DOUBLE);
                }
                
                if (instrument.getExpiry() != null) {
                    ps.setDate(6, Date.valueOf(instrument.getExpiry()));
                } else {
                    ps.setNull(6, java.sql.Types.DATE);
                }
                
                if (instrument.getStrike() != null) {
                    ps.setDouble(7, instrument.getStrike());
                } else {
                    ps.setNull(7, java.sql.Types.DOUBLE);
                }
                
                if (instrument.getTickSize() != null) {
                    ps.setDouble(8, instrument.getTickSize());
                } else {
                    ps.setNull(8, java.sql.Types.DOUBLE);
                }
                
                if (instrument.getLotSize() != null) {
                    ps.setInt(9, instrument.getLotSize());
                } else {
                    ps.setNull(9, java.sql.Types.INTEGER);
                }
                
                ps.setString(10, instrument.getInstrumentType());
                ps.setString(11, instrument.getSegment());
                ps.setString(12, instrument.getExchange());
            });
        
        int totalAffected = Arrays.stream(results).sum();
        log.info("Batch upsert completed. Total rows affected: {}", totalAffected);
        
        return results;
    }
    
    /**
     * Batch insert OHLCV data using JDBC batch operations.
     * Uses INSERT ... ON CONFLICT DO NOTHING to avoid duplicates.
     * 
     * @param ohlcvData List of OHLCV records to insert
     * @return Total number of records inserted
     */
    public int batchInsertOhlcv(List<KiteOhlcvHistoric> ohlcvData) {
        if (ohlcvData == null || ohlcvData.isEmpty()) {
            log.warn("No OHLCV data to insert");
            return 0;
        }
        
        String sql = """
            INSERT INTO kite_ohlcv_historic (
                instrument_token, exchange, date, open, high, low, close, volume,
                candle_interval, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (instrument_token, exchange, date, candle_interval) DO NOTHING
            """;
        
        log.info("Batch inserting {} OHLCV records with batch size {}", ohlcvData.size(), batchSize);
        
        int[] results = jdbcTemplate.batchUpdate(sql, ohlcvData, batchSize,
            (PreparedStatement ps, KiteOhlcvHistoric ohlcv) -> {
                ps.setString(1, ohlcv.getInstrumentToken());
                ps.setString(2, ohlcv.getExchange());
                ps.setTimestamp(3, Timestamp.valueOf(ohlcv.getDate()));
                ps.setDouble(4, ohlcv.getOpen());
                ps.setDouble(5, ohlcv.getHigh());
                ps.setDouble(6, ohlcv.getLow());
                ps.setDouble(7, ohlcv.getClose());
                ps.setLong(8, ohlcv.getVolume());
                ps.setString(9, ohlcv.getCandleInterval().name());
            });
        
        int totalInserted = Arrays.stream(results).sum();
        log.info("Batch insert completed. Total rows inserted: {}", totalInserted);
        
        return totalInserted;
    }
    
    /**
     * Get the configured batch size.
     * @return The batch size for JDBC operations
     */
    public int getBatchSize() {
        return batchSize;
    }
}

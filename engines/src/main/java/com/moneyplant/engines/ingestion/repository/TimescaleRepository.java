package com.moneyplant.engines.ingestion.repository;

import com.moneyplant.engines.ingestion.model.TickData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Repository for TimescaleDB tick data operations.
 * Provides high-performance methods for inserting and querying tick data.
 * 
 * Requirements: 5.1, 5.4, 5.5
 */
@Repository
@Slf4j
public class TimescaleRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    private static final String INSERT_TICK_SQL = 
        "INSERT INTO nse_eq_ticks (time, symbol, price, volume, bid, ask, metadata) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?::jsonb) " +
        "ON CONFLICT (symbol, time) DO UPDATE SET " +
        "price = EXCLUDED.price, " +
        "volume = EXCLUDED.volume, " +
        "bid = EXCLUDED.bid, " +
        "ask = EXCLUDED.ask, " +
        "metadata = EXCLUDED.metadata";
    
    private static final String SELECT_TICKS_FOR_DATE_SQL = 
        "SELECT time, symbol, price, volume, bid, ask, metadata " +
        "FROM nse_eq_ticks " +
        "WHERE time >= ? AND time < ? " +
        "ORDER BY time ASC, symbol ASC";
    
    private static final String TRUNCATE_TICK_TABLE_SQL = 
        "TRUNCATE TABLE nse_eq_ticks";
    
    private static final String COUNT_TICKS_FOR_DATE_SQL = 
        "SELECT COUNT(*) FROM nse_eq_ticks " +
        "WHERE time >= ? AND time < ?";
    
    private static final String GET_LATEST_TICK_SQL = 
        "SELECT time, symbol, price, volume, bid, ask, metadata " +
        "FROM nse_eq_ticks " +
        "WHERE symbol = ? " +
        "ORDER BY time DESC " +
        "LIMIT 1";
    
    private static final String GET_LATEST_TICKS_ALL_SYMBOLS_SQL = 
        "SELECT DISTINCT ON (symbol) time, symbol, price, volume, bid, ask, metadata " +
        "FROM nse_eq_ticks " +
        "ORDER BY symbol, time DESC";
    
    public TimescaleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Save a single tick data record.
     * Uses upsert logic to handle duplicate timestamps.
     * 
     * @param tickData the tick data to save
     * @return number of rows affected (1 for insert, 1 for update)
     */
    @Transactional
    public int save(TickData tickData) {
        log.debug("Saving tick data for symbol: {} at time: {}", 
            tickData.getSymbol(), tickData.getTimestamp());
        
        return jdbcTemplate.update(INSERT_TICK_SQL,
            Timestamp.from(tickData.getTimestamp()),
            tickData.getSymbol(),
            tickData.getPrice(),
            tickData.getVolume(),
            tickData.getBid(),
            tickData.getAsk(),
            tickData.getMetadata()
        );
    }
    
    /**
     * Batch insert tick data using JDBC batch operations.
     * Provides high-performance bulk inserts (100,000+ rows per second).
     * 
     * @param tickDataList list of tick data to insert
     * @return array of update counts for each batch
     */
    @Transactional
    public int[] batchInsert(List<TickData> tickDataList) {
        if (tickDataList == null || tickDataList.isEmpty()) {
            log.warn("Attempted to batch insert empty tick data list");
            return new int[0];
        }
        
        log.info("Batch inserting {} tick records", tickDataList.size());
        
        int[] updateCounts = jdbcTemplate.batchUpdate(INSERT_TICK_SQL, 
            new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    TickData tick = tickDataList.get(i);
                    ps.setTimestamp(1, Timestamp.from(tick.getTimestamp()));
                    ps.setString(2, tick.getSymbol());
                    ps.setBigDecimal(3, tick.getPrice());
                    ps.setLong(4, tick.getVolume());
                    
                    if (tick.getBid() != null) {
                        ps.setBigDecimal(5, tick.getBid());
                    } else {
                        ps.setNull(5, java.sql.Types.NUMERIC);
                    }
                    
                    if (tick.getAsk() != null) {
                        ps.setBigDecimal(6, tick.getAsk());
                    } else {
                        ps.setNull(6, java.sql.Types.NUMERIC);
                    }
                    
                    if (tick.getMetadata() != null) {
                        ps.setString(7, tick.getMetadata());
                    } else {
                        ps.setNull(7, java.sql.Types.OTHER);
                    }
                }
                
                @Override
                public int getBatchSize() {
                    return tickDataList.size();
                }
            }
        );
        
        log.info("Successfully batch inserted {} tick records", updateCounts.length);
        return updateCounts;
    }
    
    /**
     * Get all tick data for a specific date.
     * Used for end-of-day export to Apache Hudi.
     * 
     * @param date the date to query
     * @return list of tick data for the specified date
     */
    @Transactional(readOnly = true)
    public List<TickData> getTickDataForDate(LocalDate date) {
        log.info("Fetching tick data for date: {}", date);
        
        Instant startOfDay = date.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        
        List<TickData> ticks = jdbcTemplate.query(
            SELECT_TICKS_FOR_DATE_SQL,
            new Object[]{Timestamp.from(startOfDay), Timestamp.from(endOfDay)},
            new TickDataRowMapper()
        );
        
        log.info("Fetched {} tick records for date: {}", ticks.size(), date);
        return ticks;
    }
    
    /**
     * Get count of tick records for a specific date.
     * Used for verification during archival process.
     * 
     * @param date the date to query
     * @return count of tick records
     */
    @Transactional(readOnly = true)
    public long getTickCountForDate(LocalDate date) {
        Instant startOfDay = date.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        Instant endOfDay = date.plusDays(1).atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        
        Long count = jdbcTemplate.queryForObject(
            COUNT_TICKS_FOR_DATE_SQL,
            new Object[]{Timestamp.from(startOfDay), Timestamp.from(endOfDay)},
            Long.class
        );
        
        return count != null ? count : 0L;
    }
    
    /**
     * Truncate the tick table for daily cleanup.
     * Called after successful end-of-day archival to Apache Hudi.
     * 
     * WARNING: This operation is irreversible. Ensure data is archived before calling.
     */
    @Transactional
    public void truncateTickTable() {
        log.warn("Truncating nse_eq_ticks table - this operation is irreversible");
        jdbcTemplate.execute(TRUNCATE_TICK_TABLE_SQL);
        log.info("Successfully truncated nse_eq_ticks table");
    }
    
    /**
     * Get the latest tick for a specific symbol (synchronous).
     * 
     * @param symbol the symbol to query
     * @return the latest tick data or null if not found
     */
    @Transactional(readOnly = true)
    public TickData getLatestTickSync(String symbol) {
        List<TickData> ticks = jdbcTemplate.query(
            GET_LATEST_TICK_SQL,
            new Object[]{symbol},
            new TickDataRowMapper()
        );
        
        return ticks.isEmpty() ? null : ticks.get(0);
    }
    
    /**
     * Get the latest tick for all symbols.
     * Useful for market snapshot queries.
     * 
     * @return list of latest ticks for all symbols
     */
    @Transactional(readOnly = true)
    public List<TickData> getLatestTicksAllSymbols() {
        return jdbcTemplate.query(
            GET_LATEST_TICKS_ALL_SYMBOLS_SQL,
            new TickDataRowMapper()
        );
    }
    
    /**
     * RowMapper for converting ResultSet to TickData.
     */
    private static class TickDataRowMapper implements RowMapper<TickData> {
        @Override
        public TickData mapRow(ResultSet rs, int rowNum) throws SQLException {
            return TickData.builder()
                .timestamp(rs.getTimestamp("time").toInstant())
                .symbol(rs.getString("symbol"))
                .price(rs.getBigDecimal("price"))
                .volume(rs.getLong("volume"))
                .bid(rs.getBigDecimal("bid"))
                .ask(rs.getBigDecimal("ask"))
                .metadata(rs.getString("metadata"))
                .build();
        }
    }
    
    /**
     * Get the latest tick for a specific symbol (reactive wrapper).
     * 
     * @param symbol the symbol to query
     * @return Mono of the latest tick data or empty if not found
     */
    public reactor.core.publisher.Mono<TickData> getLatestTick(String symbol) {
        return reactor.core.publisher.Mono.fromCallable(() -> {
            List<TickData> ticks = jdbcTemplate.query(
                GET_LATEST_TICK_SQL,
                new Object[]{symbol},
                new TickDataRowMapper()
            );
            return ticks.isEmpty() ? null : ticks.get(0);
        });
    }
}

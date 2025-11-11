package com.moneyplant.engines.ingestion.repository;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.Timeframe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/**
 * Repository for historical OHLCV data operations.
 * Provides methods for inserting and querying OHLCV candlestick data.
 * 
 * Requirements: 5.2, 5.8
 */
@Repository
@Slf4j
public class OhlcvRepository {
    
    private final JdbcTemplate jdbcTemplate;
    
    private static final String INSERT_OHLCV_SQL = 
        "INSERT INTO nse_eq_ohlcv_historic " +
        "(time, symbol, timeframe, open, high, low, close, volume, vwap, created_at, updated_at) " +
        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
        "ON CONFLICT (symbol, timeframe, time) DO UPDATE SET " +
        "open = EXCLUDED.open, " +
        "high = EXCLUDED.high, " +
        "low = EXCLUDED.low, " +
        "close = EXCLUDED.close, " +
        "volume = EXCLUDED.volume, " +
        "vwap = EXCLUDED.vwap, " +
        "updated_at = CURRENT_TIMESTAMP";
    
    private static final String SELECT_OHLCV_BY_DATE_RANGE_SQL = 
        "SELECT time, symbol, timeframe, open, high, low, close, volume, vwap " +
        "FROM nse_eq_ohlcv_historic " +
        "WHERE symbol = ? AND timeframe = ? AND time >= ? AND time < ? " +
        "ORDER BY time ASC";
    
    private static final String SELECT_OHLCV_BY_DATE_RANGE_PAGINATED_SQL = 
        "SELECT time, symbol, timeframe, open, high, low, close, volume, vwap " +
        "FROM nse_eq_ohlcv_historic " +
        "WHERE symbol = ? AND timeframe = ? AND time >= ? AND time < ? " +
        "ORDER BY time DESC " +
        "LIMIT ? OFFSET ?";
    
    private static final String COUNT_OHLCV_BY_DATE_RANGE_SQL = 
        "SELECT COUNT(*) FROM nse_eq_ohlcv_historic " +
        "WHERE symbol = ? AND timeframe = ? AND time >= ? AND time < ?";
    
    private static final String SELECT_LATEST_OHLCV_SQL = 
        "SELECT time, symbol, timeframe, open, high, low, close, volume, vwap " +
        "FROM nse_eq_ohlcv_historic " +
        "WHERE symbol = ? AND timeframe = ? " +
        "ORDER BY time DESC " +
        "LIMIT 1";
    
    private static final String SELECT_OHLCV_BY_SYMBOL_SQL = 
        "SELECT time, symbol, timeframe, open, high, low, close, volume, vwap " +
        "FROM nse_eq_ohlcv_historic " +
        "WHERE symbol = ? " +
        "ORDER BY time DESC " +
        "LIMIT ?";
    
    public OhlcvRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Save a single OHLCV data record.
     * Uses upsert logic to handle duplicate timestamps.
     * 
     * @param ohlcvData the OHLCV data to save
     * @return number of rows affected
     */
    @Transactional
    public int save(OhlcvData ohlcvData) {
        log.debug("Saving OHLCV data for symbol: {} timeframe: {} at time: {}", 
            ohlcvData.getSymbol(), ohlcvData.getTimeframe(), ohlcvData.getTimestamp());
        
        return jdbcTemplate.update(INSERT_OHLCV_SQL,
            Timestamp.from(ohlcvData.getTimestamp()),
            ohlcvData.getSymbol(),
            ohlcvData.getTimeframe().getCode(),
            ohlcvData.getOpen(),
            ohlcvData.getHigh(),
            ohlcvData.getLow(),
            ohlcvData.getClose(),
            ohlcvData.getVolume(),
            ohlcvData.getVwap()
        );
    }
    
    /**
     * Batch insert OHLCV data using JDBC batch operations.
     * Provides high-performance bulk inserts.
     * 
     * @param ohlcvDataList list of OHLCV data to insert
     * @return array of update counts for each batch
     */
    @Transactional
    public int[] batchInsert(List<OhlcvData> ohlcvDataList) {
        if (ohlcvDataList == null || ohlcvDataList.isEmpty()) {
            log.warn("Attempted to batch insert empty OHLCV data list");
            return new int[0];
        }
        
        log.info("Batch inserting {} OHLCV records", ohlcvDataList.size());
        
        int[] updateCounts = jdbcTemplate.batchUpdate(INSERT_OHLCV_SQL, 
            new BatchPreparedStatementSetter() {
                @Override
                public void setValues(PreparedStatement ps, int i) throws SQLException {
                    OhlcvData ohlcv = ohlcvDataList.get(i);
                    ps.setTimestamp(1, Timestamp.from(ohlcv.getTimestamp()));
                    ps.setString(2, ohlcv.getSymbol());
                    ps.setString(3, ohlcv.getTimeframe().getCode());
                    ps.setBigDecimal(4, ohlcv.getOpen());
                    ps.setBigDecimal(5, ohlcv.getHigh());
                    ps.setBigDecimal(6, ohlcv.getLow());
                    ps.setBigDecimal(7, ohlcv.getClose());
                    ps.setLong(8, ohlcv.getVolume());
                    
                    if (ohlcv.getVwap() != null) {
                        ps.setBigDecimal(9, ohlcv.getVwap());
                    } else {
                        ps.setNull(9, java.sql.Types.NUMERIC);
                    }
                }
                
                @Override
                public int getBatchSize() {
                    return ohlcvDataList.size();
                }
            }
        );
        
        log.info("Successfully batch inserted {} OHLCV records", updateCounts.length);
        return updateCounts;
    }
    
    /**
     * Query OHLCV data by symbol, timeframe, and date range.
     * 
     * @param symbol the symbol to query
     * @param timeframe the timeframe to query
     * @param startDate start date (inclusive)
     * @param endDate end date (exclusive)
     * @return list of OHLCV data
     */
    @Transactional(readOnly = true)
    public List<OhlcvData> findBySymbolAndTimeframeAndDateRange(
            String symbol, Timeframe timeframe, LocalDate startDate, LocalDate endDate) {
        
        log.debug("Querying OHLCV data for symbol: {} timeframe: {} from {} to {}", 
            symbol, timeframe, startDate, endDate);
        
        Instant startInstant = startDate.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        Instant endInstant = endDate.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        
        return jdbcTemplate.query(
            SELECT_OHLCV_BY_DATE_RANGE_SQL,
            new Object[]{symbol, timeframe.getCode(), Timestamp.from(startInstant), Timestamp.from(endInstant)},
            new OhlcvDataRowMapper()
        );
    }
    
    /**
     * Query OHLCV data with pagination support.
     * 
     * @param symbol the symbol to query
     * @param timeframe the timeframe to query
     * @param startDate start date (inclusive)
     * @param endDate end date (exclusive)
     * @param pageable pagination parameters
     * @return page of OHLCV data
     */
    @Transactional(readOnly = true)
    public Page<OhlcvData> findBySymbolAndTimeframeAndDateRange(
            String symbol, Timeframe timeframe, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        
        log.debug("Querying OHLCV data with pagination for symbol: {} timeframe: {} from {} to {}", 
            symbol, timeframe, startDate, endDate);
        
        Instant startInstant = startDate.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        Instant endInstant = endDate.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        
        // Get total count
        Long total = jdbcTemplate.queryForObject(
            COUNT_OHLCV_BY_DATE_RANGE_SQL,
            new Object[]{symbol, timeframe.getCode(), Timestamp.from(startInstant), Timestamp.from(endInstant)},
            Long.class
        );
        
        if (total == null || total == 0) {
            return new PageImpl<>(List.of(), pageable, 0);
        }
        
        // Get paginated results
        List<OhlcvData> content = jdbcTemplate.query(
            SELECT_OHLCV_BY_DATE_RANGE_PAGINATED_SQL,
            new Object[]{
                symbol, 
                timeframe.getCode(), 
                Timestamp.from(startInstant), 
                Timestamp.from(endInstant),
                pageable.getPageSize(),
                pageable.getOffset()
            },
            new OhlcvDataRowMapper()
        );
        
        return new PageImpl<>(content, pageable, total);
    }
    
    /**
     * Get the latest OHLCV data for a symbol and timeframe.
     * 
     * @param symbol the symbol to query
     * @param timeframe the timeframe to query
     * @return the latest OHLCV data or null if not found
     */
    @Transactional(readOnly = true)
    public OhlcvData findLatestBySymbolAndTimeframe(String symbol, Timeframe timeframe) {
        List<OhlcvData> results = jdbcTemplate.query(
            SELECT_LATEST_OHLCV_SQL,
            new Object[]{symbol, timeframe.getCode()},
            new OhlcvDataRowMapper()
        );
        
        return results.isEmpty() ? null : results.get(0);
    }
    
    /**
     * Get recent OHLCV data for a symbol (all timeframes).
     * 
     * @param symbol the symbol to query
     * @param limit maximum number of records to return
     * @return list of recent OHLCV data
     */
    @Transactional(readOnly = true)
    public List<OhlcvData> findRecentBySymbol(String symbol, int limit) {
        return jdbcTemplate.query(
            SELECT_OHLCV_BY_SYMBOL_SQL,
            new Object[]{symbol, limit},
            new OhlcvDataRowMapper()
        );
    }
    
    /**
     * RowMapper for converting ResultSet to OhlcvData.
     */
    private static class OhlcvDataRowMapper implements RowMapper<OhlcvData> {
        @Override
        public OhlcvData mapRow(ResultSet rs, int rowNum) throws SQLException {
            return OhlcvData.builder()
                .timestamp(rs.getTimestamp("time").toInstant())
                .symbol(rs.getString("symbol"))
                .timeframe(Timeframe.fromCode(rs.getString("timeframe")))
                .open(rs.getBigDecimal("open"))
                .high(rs.getBigDecimal("high"))
                .low(rs.getBigDecimal("low"))
                .close(rs.getBigDecimal("close"))
                .volume(rs.getLong("volume"))
                .vwap(rs.getBigDecimal("vwap"))
                .build();
        }
    }
}

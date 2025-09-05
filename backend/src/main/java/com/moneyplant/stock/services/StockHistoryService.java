package com.moneyplant.stock.services;

import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.stock.dtos.StockHistoricalDataDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

/**
 * Service for fetching historical OHLCV data for stocks using direct SQL (Trino-compatible).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockHistoryService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Fetch historical data for symbol between startDate and endDate (inclusive).
     */
    public List<StockHistoricalDataDto> getHistory(String symbol, LocalDate startDate, LocalDate endDate) {
        try {
            if (symbol == null || symbol.isBlank()) {
                throw new IllegalArgumentException("Symbol cannot be null or empty");
            }
            if (startDate == null || endDate == null) {
                throw new IllegalArgumentException("startDate and endDate are required");
            }
            if (endDate.isBefore(startDate)) {
                throw new IllegalArgumentException("endDate cannot be before startDate");
            }

            String sql = """
                SELECT 
                    symbol,
                    date,
                    open,
                    high,
                    low,
                    close,
                    volume
                FROM nse_eq_ohlcv_historic 
                WHERE symbol = ? 
                  AND date BETWEEN ? AND ?
                ORDER BY date ASC
                """;

            List<StockHistoricalDataDto> rows = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new StockHistoricalDataDto(
                    rs.getString("symbol"),
                    rs.getDate("date").toLocalDate(),
                    rs.getFloat("open"),
                    rs.getFloat("high"),
                    rs.getFloat("low"),
                    rs.getFloat("close"),
                    rs.getFloat("volume")
                ),
                symbol,
                Date.valueOf(startDate),
                Date.valueOf(endDate)
            );

            if (rows.isEmpty()) {
                throw new ResourceNotFoundException("No historical data found for symbol: " + symbol);
            }
            return rows;
        } catch (IllegalArgumentException e) {
            log.error("Invalid historical data request: {}", e.getMessage());
            throw new ServiceException("Invalid request: " + e.getMessage(), e);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching historical data for symbol {}: {}", symbol, e.getMessage(), e);
            throw new ServiceException("Failed to fetch historical data for symbol: " + symbol, e);
        }
    }

    /**
     * Fetch all historical data for symbol.
     */
    public List<StockHistoricalDataDto> getAllHistory(String symbol) {
        try {
            if (symbol == null || symbol.isBlank()) {
                throw new IllegalArgumentException("Symbol cannot be null or empty");
            }

            String sql = """
                SELECT 
                    symbol,
                    date,
                    open,
                    high,
                    low,
                    close,
                    volume
                FROM nse_eq_ohlcv_historic 
                WHERE symbol = ? 
                ORDER BY date ASC
                """;

            List<StockHistoricalDataDto> rows = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> new StockHistoricalDataDto(
                    rs.getString("symbol"),
                    rs.getDate("date").toLocalDate(),
                    rs.getFloat("open"),
                    rs.getFloat("high"),
                    rs.getFloat("low"),
                    rs.getFloat("close"),
                    rs.getFloat("volume")
                ),
                symbol
            );

            if (rows.isEmpty()) {
                throw new ResourceNotFoundException("No historical data found for symbol: " + symbol);
            }
            return rows;
        } catch (IllegalArgumentException e) {
            log.error("Invalid all-history request: {}", e.getMessage());
            throw new ServiceException("Invalid request: " + e.getMessage(), e);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching all historical data for symbol {}: {}", symbol, e.getMessage(), e);
            throw new ServiceException("Failed to fetch all historical data for symbol: " + symbol, e);
        }
    }
}

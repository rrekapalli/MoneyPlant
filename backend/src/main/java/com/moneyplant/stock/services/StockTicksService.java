package com.moneyplant.stock.services;

import com.moneyplant.stock.dtos.StockTicksDto;
import com.moneyplant.stock.dtos.EnrichedStockTickDto;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.core.entities.NseStockTick;
import com.moneyplant.stock.repositories.NseStockTickRepository;
import com.moneyplant.stock.mappers.StockTicksMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service for fetching stock ticks data from the database.
 * Provides data access for stock information.
 * Note: WebSocket functionality has been moved to the engines project.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockTicksService {

    private static final String STOCK_TICKS_SERVICE = "stockTicksService";
    
    private final NseStockTickRepository nseStockTickRepository;
    private final StockTicksMapper stockTicksMapper;

    /**
     * Fetches stock ticks data for a specific index from the database.
     * 
     * @param indexName The name of the index (e.g., "NIFTY 50")
     * @return StockTicksDto containing the stock data
     * @throws ServiceException if there is an error fetching the data
     */
    @CircuitBreaker(name = STOCK_TICKS_SERVICE, fallbackMethod = "getStockTicksFallback")
    public StockTicksDto getStockTicks(String indexName) {
        try {
            log.info("Fetching stock ticks for index: {} from database", indexName);
            
            // Fetch all stock ticks from a database ordered by symbol
            List<NseStockTick> stockTicks = nseStockTickRepository.findAllByIdentifierOrderBySymbolAsc(indexName);
            
            if (stockTicks.isEmpty()) {
                log.warn("No stock ticks found in database for index: {}", indexName);
                return stockTicksMapper.toStockTicksDto(stockTicks, indexName);
            }
            
            // Convert entities to DTO using mapper
            StockTicksDto result = stockTicksMapper.toStockTicksDto(stockTicks, indexName);
            
            log.info("Successfully fetched {} stock ticks for index: {} from database", 
                    stockTicks.size(), indexName);
            
            return result;
            
        } catch (Exception e) {
            log.error("Error fetching stock ticks for index {} from database: {}", 
                    indexName, e.getMessage(), e);
            throw new ServiceException("Error fetching stock ticks for index: " + indexName, e);
        }
    }

    // Helper to safely pick an index without IndexOutOfBounds
    private Object safeGet(Object[] row, int index) {
        return (row != null && index >= 0 && index < row.length) ? row[index] : null;
    }

    // Type-safe converters to avoid ClassCastException across schema/type changes
    private String convertToString(Object value) {
        if (value == null) return null;
        if (value instanceof java.sql.Date d) return d.toLocalDate().toString();
        if (value instanceof java.sql.Timestamp ts) return ts.toInstant().toString();
        return String.valueOf(value);
    }

    private Integer convertToInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.intValue();
        if (value instanceof String s) {
            try { return Integer.valueOf(s.trim()); } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private Long convertToLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.longValue();
        if (value instanceof String s) {
            try { return Long.valueOf(s.trim()); } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private Float convertToFloat(Object value) {
        if (value == null) return null;
        if (value instanceof Number n) return n.floatValue();
        if (value instanceof String s) {
            try { return Float.valueOf(s.trim()); } catch (NumberFormatException ignored) {}
        }
        return null;
    }

    private Boolean convertToBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean b) return b;
        if (value instanceof Number n) return n.intValue() != 0;
        if (value instanceof String s) {
            String t = s.trim().toLowerCase();
            if ("true".equals(t) || "t".equals(t) || "1".equals(t) || "y".equals(t) || "yes".equals(t)) return true;
            if ("false".equals(t) || "f".equals(t) || "0".equals(t) || "n".equals(t) || "no".equals(t)) return false;
        }
        return null;
    }

    private java.time.Instant convertToInstant(Object value) {
        if (value == null) return null;
        if (value instanceof java.sql.Timestamp ts) return ts.toInstant();
        if (value instanceof java.sql.Date d) return d.toInstant();
        if (value instanceof java.util.Date d) return d.toInstant();
        if (value instanceof String s) {
            try { return java.time.Instant.parse(s.trim()); } catch (Exception ignored) {}
        }
        return null;
    }


    /**
     * Fetches stock ticks data for a specific index using the identifier field.
     * This method uses the new findAllByIdentifierOrderBySymbolAsc repository method.
     * Results are ordered by symbol in ascending order.
     * 
     * @param identifier The identifier (index name) to search for
     * @return StockTicksDto containing the stock data for the specific identifier, ordered by symbol ascending
     * @throws ServiceException if there is an error fetching the data
     */
    @CircuitBreaker(name = STOCK_TICKS_SERVICE, fallbackMethod = "getStockTicksByIdentifierFallback")
    public StockTicksDto getStockTicksByIdentifier(String identifier) {
        try {
            log.info("Fetching stock ticks for identifier: {} from database", identifier);
            
            // Use the new repository method to fetch stock ticks by identifier ordered by symbol ascending
            List<NseStockTick> stockTicks = nseStockTickRepository.findAllByIdentifierOrderBySymbolAsc(identifier);
            
            if (stockTicks.isEmpty()) {
                log.warn("No stock ticks found in database for identifier: {}", identifier);
                return stockTicksMapper.toStockTicksDto(stockTicks, identifier);
            }
            
            // Convert entities to DTO using mapper
            StockTicksDto result = stockTicksMapper.toStockTicksDto(stockTicks, identifier);
            
            log.info("Successfully fetched {} stock ticks for identifier: {} from database", 
                    stockTicks.size(), identifier);
            
            return result;
            
        } catch (Exception e) {
            log.error("Error fetching stock ticks for identifier {} from database: {}", 
                    identifier, e.getMessage(), e);
            throw new ServiceException("Error fetching stock ticks for identifier: " + identifier, e);
        }
    }

    /**
     * Fetches enriched stock ticks data for a specific index with additional fields from nse_equity_master.
     * Returns comprehensive stock data including basic_industry, pd_sector_ind, macro, sector, and company_name.
     * 
     * @param selectedIndex The sector index to search for
     * @return List of EnrichedStockTickDto containing comprehensive stock data
     * @throws ServiceException if there is an error fetching the data
     */
    @CircuitBreaker(name = STOCK_TICKS_SERVICE, fallbackMethod = "getEnrichedStockTicksByIndexFallback")
    public List<EnrichedStockTickDto> getEnrichedStockTicksByIndex(String selectedIndex) {
        try {
            log.info("Fetching enriched stock ticks for index: {} from database", selectedIndex);
            
            // Use the repository method to fetch enriched stock ticks data
            List<Object[]> results = nseStockTickRepository.getStockTicksByIndex(selectedIndex);
            
            if (results.isEmpty()) {
                log.warn("No enriched stock ticks found in database for index: {}", selectedIndex);
                return List.of();
            }
            
            // Convert Object[] results to EnrichedStockTickDto
            List<EnrichedStockTickDto> enrichedStockTicks = results.stream()
                .map(this::mapToEnrichedStockTickDto)
                .toList();
            
            log.info("Successfully fetched {} enriched stock ticks for index: {} from database", 
                    enrichedStockTicks.size(), selectedIndex);
            
            return enrichedStockTicks;
            
        } catch (Exception e) {
            log.error("Error fetching enriched stock ticks for index {} from database: {}", 
                    selectedIndex, e.getMessage(), e);
            throw new ServiceException("Error fetching enriched stock ticks for index: " + selectedIndex, e);
        }
    }

    /**
     * Maps Object[] result from native query to EnrichedStockTickDto.
     * 
     * @param row The Object[] row from the database query
     * @return EnrichedStockTickDto mapped from the row data
     */
    private EnrichedStockTickDto mapToEnrichedStockTickDto(Object[] row) {
        EnrichedStockTickDto dto = new EnrichedStockTickDto();
        
        // Note: Avoid direct index-casts due to evolving schema; use safe converters below.
        
        // Defensive: ensure row is not null or too short
        if (row == null || row.length == 0) {
            return dto;
        }

        // The repository query selects:
        //   t.*,
        //   qe.basic_industry, qe.pd_sector_ind, qe.macro, qe.sector
        // So the last 4 elements are always the qe.* fields regardless of t.* width.
        int n = row.length;
        int qeStart = Math.max(0, n - 4);

        // Map appended fields from nse_eq_master (basic_industry, pd_sector_ind, macro, sector)
        // These are at the tail of the result set
        if (n >= 4) {
            dto.setBasicIndustry(convertToString(row[qeStart]));
            dto.setPdSectorInd(convertToString(row[qeStart + 1]));
            dto.setMacro(convertToString(row[qeStart + 2]));
            dto.setSector(convertToString(row[qeStart + 3]));
        }

        // Map fields from t.* (historic OHLCV table)
        // NOTE: Column order in nse_eq_ohlcv_historic may differ from the old nse_stock_tick.
        // Use safe converters to avoid ClassCastException if types/positions differ.
        // Commonly, index 0 is symbol in both schemas.
        dto.setSymbol(convertToString(safeGet(row, 0)));

        // Old mapping had "priority" at index 1, but new schema likely has a DATE column here.
        // We'll attempt a numeric conversion; if it's a Date/Timestamp, this returns null.
        dto.setPriority(convertToInteger(safeGet(row, 1)));

        // Attempt to map typical price/volume fields using previous positions with safe conversion.
        // If the schema differs, these will become null instead of throwing.
        dto.setIdentifier(convertToString(safeGet(row, 2)));
        dto.setSeries(convertToString(safeGet(row, 3)));
        dto.setOpenPrice(convertToFloat(safeGet(row, 4)));
        dto.setDayHigh(convertToFloat(safeGet(row, 5)));
        dto.setDayLow(convertToFloat(safeGet(row, 6)));
        dto.setLastPrice(convertToFloat(safeGet(row, 7)));
        dto.setPreviousClose(convertToFloat(safeGet(row, 8)));
        dto.setPriceChange(convertToFloat(safeGet(row, 9)));
        dto.setPercentChange(convertToFloat(safeGet(row, 10)));
        dto.setTotalTradedVolume(convertToLong(safeGet(row, 11)));
        dto.setStockIndClosePrice(convertToFloat(safeGet(row, 12)));
        dto.setTotalTradedValue(convertToFloat(safeGet(row, 13)));
        dto.setYearHigh(convertToFloat(safeGet(row, 14)));
        dto.setFfmc(convertToFloat(safeGet(row, 15)));
        dto.setYearLow(convertToFloat(safeGet(row, 16)));
        dto.setNearWeekHigh(convertToFloat(safeGet(row, 17)));
        dto.setNearWeekLow(convertToFloat(safeGet(row, 18)));
        dto.setPercentChange365d(convertToFloat(safeGet(row, 19)));
        dto.setDate365dAgo(convertToString(safeGet(row, 20)));
        dto.setChart365dPath(convertToString(safeGet(row, 21)));
        dto.setDate30dAgo(convertToString(safeGet(row, 22)));
        dto.setPercentChange30d(convertToFloat(safeGet(row, 23)));
        dto.setChart30dPath(convertToString(safeGet(row, 24)));
        dto.setChartTodayPath(convertToString(safeGet(row, 25)));
        dto.setCompanyName(convertToString(safeGet(row, 26)));
        dto.setIndustry(convertToString(safeGet(row, 27)));
        dto.setIsFnoSec(convertToBoolean(safeGet(row, 28)));
        dto.setIsCaSec(convertToBoolean(safeGet(row, 29)));
        dto.setIsSlbSec(convertToBoolean(safeGet(row, 30)));
        dto.setIsDebtSec(convertToBoolean(safeGet(row, 31)));
        dto.setIsSuspended(convertToBoolean(safeGet(row, 32)));
        dto.setIsEtfSec(convertToBoolean(safeGet(row, 33)));
        dto.setIsDelisted(convertToBoolean(safeGet(row, 34)));
        dto.setIsin(convertToString(safeGet(row, 35)));
        dto.setSlbIsin(convertToString(safeGet(row, 36)));
        dto.setListingDate(convertToString(safeGet(row, 37)));
        dto.setIsMunicipalBond(convertToBoolean(safeGet(row, 38)));
        dto.setIsHybridSymbol(convertToBoolean(safeGet(row, 39)));
        dto.setEquityTime(convertToString(safeGet(row, 40)));
        dto.setPreOpenTime(convertToString(safeGet(row, 41)));
        dto.setQuotePreOpenFlag(convertToBoolean(safeGet(row, 42)));

        // Created/Updated timestamps might not exist in the historic table; convert if present
        dto.setCreatedAt(convertToInstant(safeGet(row, 43)));
        dto.setUpdatedAt(convertToInstant(safeGet(row, 44)));

        return dto;
    }

    /**
     * Fallback for enriched stock ticks when circuit breaker is open or errors occur.
     * @param selectedIndex The sector index
     * @param ex The exception that triggered the fallback
     * @return Empty list
     */
    public List<EnrichedStockTickDto> getEnrichedStockTicksByIndexFallback(String selectedIndex, Exception ex) {
        log.warn("Enriched stock ticks service fallback triggered for index {}: {}", selectedIndex, ex.getMessage());
        return List.of();
    }

    /**
     * Fallback method for circuit breaker when stock ticks service is unavailable.
     * 
     * @param indexName The index name
     * @param ex The exception that triggered the fallback
     * @return Empty StockTicksDto or cached data
     */
    public StockTicksDto getStockTicksFallback(String indexName, Exception ex) {
        log.warn("Stock ticks service fallback triggered for index {}: {}", indexName, ex.getMessage());
        
        // Return a basic response indicating service unavailability
        return stockTicksMapper.toStockTicksDto(List.of(), indexName);
    }

    /**
     * Fallback method for circuit breaker when stock ticks by identifier service is unavailable.
     * 
     * @param identifier The identifier
     * @param ex The exception that triggered the fallback
     * @return Empty StockTicksDto or cached data
     */
    public StockTicksDto getStockTicksByIdentifierFallback(String identifier, Exception ex) {
        log.warn("Stock ticks by identifier service fallback triggered for identifier {}: {}", identifier, ex.getMessage());
        
        // Return a basic response indicating service unavailability
        return stockTicksMapper.toStockTicksDto(List.of(), identifier);
    }

}
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
            List<java.util.Map<String, Object>> results = nseStockTickRepository.getStockTicksByIndex(selectedIndex);
            
            if (results.isEmpty()) {
                log.warn("No enriched stock ticks found in database for index: {}", selectedIndex);
                return List.of();
            }
            
            // Convert Map<String,Object> results to EnrichedStockTickDto using column names
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
     * Maps a result row (as Map of column name to value) from native query to EnrichedStockTickDto.
     * Mapping is by column names (case-insensitive), not by index.
     */
    private EnrichedStockTickDto mapToEnrichedStockTickDto(java.util.Map<String, Object> row) {
        EnrichedStockTickDto dto = new EnrichedStockTickDto();
        if (row == null || row.isEmpty()) {
            return dto;
        }

        // Helper lambdas for lookup and conversion
        java.util.function.Function<String[], Object> get = (keys) -> getValue(row, keys);

        // qe.* appended fields (explicit aliases in query)
        dto.setBasicIndustry(convertToString(get.apply(new String[]{"basic_industry"})));
        dto.setPdSectorInd(convertToString(get.apply(new String[]{"pd_sector_ind"})));
        dto.setMacro(convertToString(get.apply(new String[]{"macro"})));
        dto.setSector(convertToString(get.apply(new String[]{"sector"})));

        // t.* fields. Try multiple likely aliases for resilience (case-insensitive match)
        dto.setSymbol(convertToString(get.apply(new String[]{"symbol"})));
        dto.setPriority(convertToInteger(get.apply(new String[]{"priority"})));
        dto.setIdentifier(convertToString(get.apply(new String[]{"identifier", "index_name", "index"})));
        dto.setSeries(convertToString(get.apply(new String[]{"series"})));
        dto.setOpenPrice(convertToFloat(get.apply(new String[]{"open_price", "open"})));
        dto.setDayHigh(convertToFloat(get.apply(new String[]{"day_high", "high"})));
        dto.setDayLow(convertToFloat(get.apply(new String[]{"day_low", "low"})));
        dto.setLastPrice(convertToFloat(get.apply(new String[]{"last_price", "ltp", "price", "close"})));
        dto.setPreviousClose(convertToFloat(get.apply(new String[]{"previous_close", "prev_close", "prevclose"})));
        dto.setPriceChange(convertToFloat(get.apply(new String[]{"price_change", "price_change"})));
        dto.setPercentChange(convertToFloat(get.apply(new String[]{"percent_change", "percent_change"})));
        dto.setTotalTradedVolume(convertToLong(get.apply(new String[]{"total_traded_volume", "volume", "traded_volume"})));
        dto.setStockIndClosePrice(convertToFloat(get.apply(new String[]{"stock_ind_close_price", "close_price"})));
        dto.setTotalTradedValue(convertToFloat(get.apply(new String[]{"total_traded_value", "value"})));
        dto.setYearHigh(convertToFloat(get.apply(new String[]{"year_high", "high_52", "week_52_high"})));
        dto.setFfmc(convertToFloat(get.apply(new String[]{"ffmc"})));
        dto.setYearLow(convertToFloat(get.apply(new String[]{"year_low", "low_52", "week_52_low"})));
        dto.setNearWeekHigh(convertToFloat(get.apply(new String[]{"near_week_high", "near_wk_high"})));
        dto.setNearWeekLow(convertToFloat(get.apply(new String[]{"near_week_low", "near_wk_low"})));
        dto.setPercentChange365d(convertToFloat(get.apply(new String[]{"percent_change_365d", "per_change_365d"})));
        dto.setDate365dAgo(convertToString(get.apply(new String[]{"date_365d_ago"})));
        dto.setChart365dPath(convertToString(get.apply(new String[]{"chart_365d_path"})));
        dto.setDate30dAgo(convertToString(get.apply(new String[]{"date_30d_ago"})));
        dto.setPercentChange30d(convertToFloat(get.apply(new String[]{"percent_change_30d", "per_change_30d"})));
        dto.setChart30dPath(convertToString(get.apply(new String[]{"chart_30d_path"})));
        dto.setChartTodayPath(convertToString(get.apply(new String[]{"chart_today_path"})));
        dto.setCompanyName(convertToString(get.apply(new String[]{"company_name", "name"})));
        dto.setIndustry(convertToString(get.apply(new String[]{"industry"})));
        dto.setIsFnoSec(convertToBoolean(get.apply(new String[]{"is_fno_sec", "fno"})));
        dto.setIsCaSec(convertToBoolean(get.apply(new String[]{"is_ca_sec"})));
        dto.setIsSlbSec(convertToBoolean(get.apply(new String[]{"is_slb_sec"})));
        dto.setIsDebtSec(convertToBoolean(get.apply(new String[]{"is_debt_sec"})));
        dto.setIsSuspended(convertToBoolean(get.apply(new String[]{"is_suspended", "suspended"})));
        dto.setIsEtfSec(convertToBoolean(get.apply(new String[]{"is_etf_sec", "etf"})));
        dto.setIsDelisted(convertToBoolean(get.apply(new String[]{"is_delisted", "delisted"})));
        dto.setIsin(convertToString(get.apply(new String[]{"isin"})));
        dto.setSlbIsin(convertToString(get.apply(new String[]{"slb_isin"})));
        dto.setListingDate(convertToString(get.apply(new String[]{"listing_date"})));
        dto.setIsMunicipalBond(convertToBoolean(get.apply(new String[]{"is_municipal_bond"})));
        dto.setIsHybridSymbol(convertToBoolean(get.apply(new String[]{"is_hybrid_symbol"})));
        dto.setEquityTime(convertToString(get.apply(new String[]{"equity_time"})));
        dto.setPreOpenTime(convertToString(get.apply(new String[]{"pre_open_time"})));
        dto.setQuotePreOpenFlag(convertToBoolean(get.apply(new String[]{"quote_pre_open_flag"})));

        dto.setCreatedAt(convertToInstant(get.apply(new String[]{"created_at"})));
        dto.setUpdatedAt(convertToInstant(get.apply(new String[]{"updated_at"})));

        return dto;
    }

    // Case-insensitive retrieval of a value by any of the provided keys
    private Object getValue(java.util.Map<String, Object> row, String... candidateKeys) {
        if (row == null || row.isEmpty() || candidateKeys == null) return null;
        // Build a case-insensitive index once per call
        java.util.Map<String, Object> ci = new java.util.HashMap<>();
        for (java.util.Map.Entry<String, Object> e : row.entrySet()) {
            if (e.getKey() != null) ci.put(e.getKey().toLowerCase(), e.getValue());
        }
        for (String key : candidateKeys) {
            if (key == null) continue;
            Object v = ci.get(key.toLowerCase());
            if (v != null) return v;
            // Also try simple normalized variants
            String snake = toSnakeCase(key).toLowerCase();
            v = ci.get(snake);
            if (v != null) return v;
            String camel = toCamelCase(key).toLowerCase();
            v = ci.get(camel);
            if (v != null) return v;
        }
        return null;
    }

    private String toSnakeCase(String s) {
        if (s == null) return null;
        return s.replaceAll("([a-z])([A-Z])", "$1_$2").replace('-', '_');
    }

    private String toCamelCase(String s) {
        if (s == null) return null;
        String[] parts = s.toLowerCase().split("[_-]");
        if (parts.length == 0) return s;
        StringBuilder sb = new StringBuilder(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            if (parts[i].length() > 0) sb.append(Character.toUpperCase(parts[i].charAt(0))).append(parts[i].substring(1));
        }
        return sb.toString();
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
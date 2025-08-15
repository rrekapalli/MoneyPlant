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
        
        // Map fields from nse_stock_tick table (indices 0-43)
        dto.setSymbol((String) row[0]);
        dto.setPriority((Integer) row[1]);
        dto.setIdentifier((String) row[2]);
        dto.setSeries((String) row[3]);
        dto.setOpenPrice((Float) row[4]);
        dto.setDayHigh((Float) row[5]);
        dto.setDayLow((Float) row[6]);
        dto.setLastPrice((Float) row[7]);
        dto.setPreviousClose((Float) row[8]);
        dto.setPriceChange((Float) row[9]);
        dto.setPercentChange((Float) row[10]);
        dto.setTotalTradedVolume((Long) row[11]);
        dto.setStockIndClosePrice((Float) row[12]);
        dto.setTotalTradedValue((Float) row[13]);
        dto.setYearHigh((Float) row[14]);
        dto.setFfmc((Float) row[15]);
        dto.setYearLow((Float) row[16]);
        dto.setNearWeekHigh((Float) row[17]);
        dto.setNearWeekLow((Float) row[18]);
        dto.setPercentChange365d((Float) row[19]);
        dto.setDate365dAgo((String) row[20]);
        dto.setChart365dPath((String) row[21]);
        dto.setDate30dAgo((String) row[22]);
        dto.setPercentChange30d((Float) row[23]);
        dto.setChart30dPath((String) row[24]);
        dto.setChartTodayPath((String) row[25]);
        dto.setCompanyName((String) row[26]);
        dto.setIndustry((String) row[27]);
        dto.setIsFnoSec((Boolean) row[28]);
        dto.setIsCaSec((Boolean) row[29]);
        dto.setIsSlbSec((Boolean) row[30]);
        dto.setIsDebtSec((Boolean) row[31]);
        dto.setIsSuspended((Boolean) row[32]);
        dto.setIsEtfSec((Boolean) row[33]);
        dto.setIsDelisted((Boolean) row[34]);
        dto.setIsin((String) row[35]);
        dto.setSlbIsin((String) row[36]);
        dto.setListingDate((String) row[37]);
        dto.setIsMunicipalBond((Boolean) row[38]);
        dto.setIsHybridSymbol((Boolean) row[39]);
        dto.setEquityTime((String) row[40]);
        dto.setPreOpenTime((String) row[41]);
        dto.setQuotePreOpenFlag((Boolean) row[42]);
        dto.setCreatedAt(row[43] != null ? ((java.sql.Timestamp) row[43]).toInstant() : null);
        dto.setUpdatedAt(row[44] != null ? ((java.sql.Timestamp) row[44]).toInstant() : null);
        
        // Map additional fields from nse_equity_master table (indices 45-48)
        dto.setBasicIndustry((String) row[45]);
        dto.setPdSectorInd((String) row[46]);
        dto.setMacro((String) row[47]);
        dto.setSector((String) row[48]);
        
        return dto;
    }

    /**
     * Fallback method for circuit breaker when enriched stock ticks service is unavailable.
     * 
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
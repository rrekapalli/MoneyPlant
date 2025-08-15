package com.moneyplant.stock.services;

import com.moneyplant.core.entities.Index;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.stock.dtos.IndicesDto;
import com.moneyplant.stock.dtos.IndicesDto.IndexDataDto;
import com.moneyplant.stock.dtos.IndicesDto.MarketStatusDto;
import com.moneyplant.index.repositories.IndexRepository;
import com.moneyplant.index.dtos.IndexHistoricalDataDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing NSE indices data from database.
 * Provides data access for indices information.
 * Note: WebSocket functionality has been moved to the engines project.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IndicesService {

    private final IndexRepository indexRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Get indices data for a specific index.
     * 
     * @param indexName The name of the index
     * @return IndicesDto containing the index data
     * @throws ServiceException if there is an error fetching the data
     */
    public IndicesDto getIndexData(String indexName) {
        try {
            log.info("Fetching indices data for index: {} from database", indexName);
            
            if (indexName == null || indexName.trim().isEmpty()) {
                throw new IllegalArgumentException("Index name cannot be null or empty");
            }
            
            // Fetch index data from database
            Optional<Index> indexOptional = indexRepository.findByIndexNameIgnoreCase(indexName);
            
            if (indexOptional.isEmpty()) {
                log.warn("No indices found in database for index: {}", indexName);
                throw new ResourceNotFoundException("Index not found: " + indexName);
            }
            
            // Convert to DTO
            IndicesDto result = createIndicesDto(List.of(indexOptional.get()), indexName);
            
            log.info("Successfully fetched indices data for index: {} from database", indexName);
            return result;
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request parameter for indices: {}", e.getMessage());
            throw new ServiceException("Invalid index name: " + indexName, e);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching indices data for index {} from database: {}", 
                    indexName, e.getMessage(), e);
            throw new ServiceException("Failed to fetch indices data for index: " + indexName, e);
        }
    }

    /**
     * Get all indices data.
     * 
     * @return IndicesDto containing all indices data
     * @throws ServiceException if there is an error fetching the data
     */
    public IndicesDto getAllIndices() {
        try {
            log.info("Fetching all indices data from database");
            
            // Fetch all indices from database
            List<Index> indices = indexRepository.findAll();
            
            if (indices.isEmpty()) {
                log.warn("No indices found in database");
                return createEmptyIndicesDto();
            }
            
            // Convert to DTO
            IndicesDto result = createIndicesDto(indices, "ALL");
            
            log.info("Successfully fetched {} indices from database", indices.size());
            return result;
            
        } catch (Exception e) {
            log.error("Error fetching all indices data from database: {}", e.getMessage(), e);
            throw new ServiceException("Failed to fetch all indices data", e);
        }
    }

    /**
     * Get previous day's indices data for a specific index.
     * Fetches data for (current date - 1) or the most recent available data.
     * 
     * @param indexName The name of the index
     * @return IndicesDto containing the previous day's index data
     * @throws ServiceException if there is an error fetching the data
     */
    public IndicesDto getPreviousDayIndexData(String indexName) {
        try {
            log.info("Fetching previous day indices data for index: {} from historical database", indexName);
            
            if (indexName == null || indexName.trim().isEmpty()) {
                throw new IllegalArgumentException("Index name cannot be null or empty");
            }
            
            // First verify the index exists
            Optional<Index> indexOptional = indexRepository.findByIndexNameIgnoreCase(indexName);
            if (indexOptional.isEmpty()) {
                log.warn("No indices found in database for index: {}", indexName);
                throw new ResourceNotFoundException("Index not found: " + indexName);
            }
            
            // Get previous day's date
            java.time.LocalDate previousDay = java.time.LocalDate.now().minusDays(1);
            
            // Query historical data for previous day or most recent available
            String sql = """
                SELECT 
                    index_name,
                    date,
                    open,
                    high,
                    low,
                    close,
                    volume
                FROM nse_indices_historical_data 
                WHERE index_name = ? 
                AND date <= ?
                ORDER BY date DESC
                LIMIT 1
                """;
            
            // Fetch historical data
            List<IndexHistoricalDataDto> historicalData = jdbcTemplate.query(sql, 
                (rs, rowNum) -> new IndexHistoricalDataDto(
                    rs.getString("index_name"),
                    rs.getDate("date").toLocalDate(),
                    rs.getFloat("open"),
                    rs.getFloat("high"),
                    rs.getFloat("low"),
                    rs.getFloat("close"),
                    rs.getFloat("volume")
                ),
                indexName,
                java.sql.Date.valueOf(previousDay)
            );
            
            if (historicalData.isEmpty()) {
                log.warn("No historical data found for index: {} on or before date: {}", indexName, previousDay);
                throw new ResourceNotFoundException("No historical data found for index: " + indexName);
            }
            
            // Get the most recent historical data
            IndexHistoricalDataDto historicalRecord = historicalData.get(0);
            
            // Create a mock Index entity from historical data to reuse existing conversion logic
            Index mockIndex = new Index();
            mockIndex.setIndexName(historicalRecord.getIndexName());
            mockIndex.setLastPrice(historicalRecord.getClose());
            mockIndex.setOpenPrice(historicalRecord.getOpen());
            mockIndex.setHighPrice(historicalRecord.getHigh());
            mockIndex.setLowPrice(historicalRecord.getLow());
            mockIndex.setPreviousClose(historicalRecord.getClose()); // For historical data, previous close is the same as close
            
            // Convert to DTO using existing logic
            IndicesDto result = createIndicesDto(List.of(mockIndex), indexName + " (Historical: " + historicalRecord.getDate() + ")");
            
            log.info("Successfully fetched historical indices data for index: {} for date: {}", indexName, historicalRecord.getDate());
            return result;
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request parameter for indices: {}", e.getMessage());
            throw new ServiceException("Invalid index name: " + indexName, e);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching previous day indices data for index {} from historical database: {}", 
                    indexName, e.getMessage(), e);
            throw new ServiceException("Failed to fetch previous day indices data for index: " + indexName, e);
        }
    }

    /**
     * Create IndicesDto from list of Index entities.
     * 
     * @param indices List of Index entities
     * @param source Source identifier
     * @return IndicesDto
     */
    private IndicesDto createIndicesDto(List<Index> indices, String source) {
        IndicesDto dto = new IndicesDto();
        dto.setTimestamp(Instant.now().toString());
        dto.setSource("Database");
        
        // Convert Index entities to IndexDataDto
        List<IndexDataDto> indexDataList = indices.stream()
            .map(this::convertToIndexDataDto)
            .collect(Collectors.toList());
        
        dto.setIndices(indexDataList);
        
        // Create market status
        MarketStatusDto marketStatus = new MarketStatusDto();
        marketStatus.setStatus("CLOSED"); // Default status
        dto.setMarketStatus(marketStatus);
        
        return dto;
    }

    /**
     * Create empty IndicesDto.
     * 
     * @return Empty IndicesDto
     */
    private IndicesDto createEmptyIndicesDto() {
        IndicesDto dto = new IndicesDto();
        dto.setTimestamp(Instant.now().toString());
        dto.setSource("Database");
        dto.setIndices(new ArrayList<>());
        
        MarketStatusDto marketStatus = new MarketStatusDto();
        marketStatus.setStatus("CLOSED");
        dto.setMarketStatus(marketStatus);
        
        return dto;
    }

    /**
     * Convert Index entity to IndexDataDto.
     * 
     * @param index Index entity
     * @return IndexDataDto
     */
    private IndexDataDto convertToIndexDataDto(Index index) {
        IndexDataDto dto = new IndexDataDto();
        dto.setKey(index.getKeyCategory());
        dto.setIndexName(index.getIndexName());
        dto.setIndexSymbol(index.getIndexSymbol());
        dto.setLastPrice(index.getLastPrice());
        dto.setVariation(index.getVariation());
        dto.setPercentChange(index.getPercentChange());
        dto.setOpenPrice(index.getOpenPrice());
        dto.setDayHigh(index.getHighPrice());
        dto.setDayLow(index.getLowPrice());
        dto.setPreviousClose(index.getPreviousClose());
        dto.setYearHigh(index.getYearHigh());
        dto.setYearLow(index.getYearLow());
        dto.setIndicativeClose(index.getIndicativeClose());
        dto.setPeRatio(index.getPeRatio());
        dto.setPbRatio(index.getPbRatio());
        dto.setDividendYield(index.getDividendYield());
        dto.setDeclines(index.getDeclines());
        dto.setAdvances(index.getAdvances());
        dto.setUnchanged(index.getUnchanged());
        dto.setPercentChange365d(index.getPercentChange365d());
        dto.setDate365dAgo(index.getDate365dAgo());
        dto.setPercentChange30d(index.getPercentChange30d());
        dto.setDate30dAgo(index.getDate30dAgo());
        dto.setChart365dPath(index.getChart365dPath());
        dto.setChart30dPath(index.getChart30dPath());
        dto.setChartTodayPath(index.getChartTodayPath());
        return dto;
    }
}
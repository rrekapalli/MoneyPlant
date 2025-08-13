package com.moneyplant.stock.services;

import com.moneyplant.core.entities.Index;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.stock.dtos.IndicesDto;
import com.moneyplant.stock.dtos.IndicesDto.IndexDataDto;
import com.moneyplant.stock.dtos.IndicesDto.MarketStatusDto;
import com.moneyplant.index.repositories.IndexRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
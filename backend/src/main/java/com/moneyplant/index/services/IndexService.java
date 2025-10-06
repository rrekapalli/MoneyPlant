package com.moneyplant.index.services;

import com.moneyplant.index.dtos.IndexDto;
import com.moneyplant.index.dtos.IndexResponseDto;
import com.moneyplant.index.dtos.IndexHistoricalDataDto;
import com.moneyplant.core.entities.Index;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.index.repositories.IndexRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class IndexService {
    private final IndexRepository indexRepository;
    private final JdbcTemplate jdbcTemplate;

    private static final String INDEX_SERVICE = "indexService";

    /**
     * Creates a new index using the annotation-based circuit breaker approach.
     * 
     * @param indexDto The index data to create
     * @return The created index response
     * @throws ServiceException if there is an error creating the index
     */
    @CircuitBreaker(name = INDEX_SERVICE, fallbackMethod = "createIndexFallback")
    public IndexResponseDto createIndex(IndexDto indexDto) {
        try {
            Index newIndex = new Index();

            newIndex.setKeyCategory(indexDto.getKeyCategory());
            newIndex.setIndexName(indexDto.getIndexName());
            newIndex.setIndexSymbol(indexDto.getIndexSymbol());
            newIndex.setLastPrice(indexDto.getLastPrice());
            newIndex.setVariation(indexDto.getVariation());
            newIndex.setPercentChange(indexDto.getPercentChange());
            newIndex.setOpenPrice(indexDto.getOpenPrice());
            newIndex.setHighPrice(indexDto.getHighPrice());
            newIndex.setLowPrice(indexDto.getLowPrice());
            newIndex.setPreviousClose(indexDto.getPreviousClose());
            newIndex.setYearHigh(indexDto.getYearHigh());
            newIndex.setYearLow(indexDto.getYearLow());
            newIndex.setCreatedAt(Instant.now());
            newIndex.setUpdatedAt(Instant.now());

            Index savedIndex = indexRepository.save(newIndex);

            log.info("Index created successfully with symbol: {}", savedIndex.getIndexSymbol());

            return mapToResponseDto(savedIndex);
        } catch (Exception e) {
            log.error("Error creating index: {}", e.getMessage());
            throw new ServiceException("Error creating index: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for createIndex when the circuit is open.
     * 
     * @param indexDto The index data that was being created
     * @param e The exception that triggered the fallback
     * @return null
     */
    public IndexResponseDto createIndexFallback(IndexDto indexDto, Exception e) {
        log.error("Circuit breaker triggered for createIndex: {}", e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Gets all indices using the annotation-based circuit breaker approach.
     * 
     * @return List of index responses
     * @throws ServiceException if there is an error retrieving indices
     */
    @CircuitBreaker(name = INDEX_SERVICE, fallbackMethod = "getAllIndicesFallback")
    public List<IndexResponseDto> getAllIndices() {
        try {
            return indexRepository.findAll()
                    .stream()
                    .map(this::mapToResponseDto)
                    .toList();
        } catch (Exception e) {
            log.error("Error retrieving indices: {}", e.getMessage());
            throw new ServiceException("Error retrieving indices: " + e.getMessage(), e);
        }
    }

    /**
     * Gets an index by ID.
     * 
     * @param id The ID of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     * @throws ServiceException if there is an error retrieving the index
     */
    @CircuitBreaker(name = INDEX_SERVICE, fallbackMethod = "getIndexByIdFallback")
    public IndexResponseDto getIndexById(Integer id) {
        try {
            Index index = indexRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Index not found with id: " + id));

            return mapToResponseDto(index);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving index with id {}: {}", id, e.getMessage());
            throw new ServiceException("Error retrieving index: " + e.getMessage(), e);
        }
    }

    /**
     * Gets an index by symbol.
     * 
     * @param symbol The symbol of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     * @throws ServiceException if there is an error retrieving the index
     */
    @CircuitBreaker(name = INDEX_SERVICE, fallbackMethod = "getIndexBySymbolFallback")
    public IndexResponseDto getIndexBySymbol(String symbol) {
        try {
            Index index = indexRepository.findByIndexSymbolIgnoreCase(symbol)
                    .orElseThrow(() -> new ResourceNotFoundException("Index not found with symbol: " + symbol));

            return mapToResponseDto(index);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving index with symbol {}: {}", symbol, e.getMessage());
            throw new ServiceException("Error retrieving index: " + e.getMessage(), e);
        }
    }

    /**
     * Gets an index by name.
     * 
     * @param indexName The name of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     * @throws ServiceException if there is an error retrieving the index
     */
    @CircuitBreaker(name = INDEX_SERVICE, fallbackMethod = "getIndexByNameFallback")
    public IndexResponseDto getIndexByName(String indexName) {
        try {
            Index index = indexRepository.findByIndexNameIgnoreCase(indexName)
                    .orElseThrow(() -> new ResourceNotFoundException("Index not found with name: " + indexName));

            return mapToResponseDto(index);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving index with name {}: {}", indexName, e.getMessage());
            throw new ServiceException("Error retrieving index: " + e.getMessage(), e);
        }
    }

    /**
     * Gets an index by key category.
     * 
     * @param keyCategory The key category of the index to retrieve
     * @return The index response
     * @throws ResourceNotFoundException if the index is not found
     * @throws ServiceException if there is an error retrieving the index
     */
    @CircuitBreaker(name = INDEX_SERVICE, fallbackMethod = "getIndexByKeyCategoryFallback")
    public IndexResponseDto getIndexByKeyCategory(String keyCategory) {
        try {
            Index index = indexRepository.findByKeyCategoryIgnoreCase(keyCategory)
                    .orElseThrow(() -> new ResourceNotFoundException("Index not found with key category: " + keyCategory));

            return mapToResponseDto(index);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving index with key category {}: {}", keyCategory, e.getMessage());
            throw new ServiceException("Error retrieving index: " + e.getMessage(), e);
        }
    }

    /**
     * Gets historical data for a given index name using Trino query.
     * 
     * @param indexName The name of the index to retrieve historical data for
     * @return List of historical data for the index
     * @throws ResourceNotFoundException if the index is not found
     * @throws ServiceException if there is an error retrieving the historical data
     */
    @CircuitBreaker(name = INDEX_SERVICE, fallbackMethod = "getIndexHistoricalDataFallback")
    public List<IndexHistoricalDataDto> getIndexHistoricalData(String indexName) {
        try {
            // First verify the index exists
            Index index = indexRepository.findByIndexNameIgnoreCase(indexName)
                    .orElseThrow(() -> new ResourceNotFoundException("Index not found with name: " + indexName));

            // Query historical data using Trino
            String sql = """
                SELECT 
                    index_name,
                    date,
                    open,
                    high,
                    low,
                    close,
                    volume
                FROM nse_idx_ohlcv_historic 
                WHERE index_name = ? 
                ORDER BY date ASC
                """;

            return jdbcTemplate.query(sql, 
                (rs, rowNum) -> new IndexHistoricalDataDto(
                    rs.getString("index_name"),
                    rs.getDate("date").toLocalDate(),
                    rs.getFloat("open"),
                    rs.getFloat("high"),
                    rs.getFloat("low"),
                    rs.getFloat("close"),
                    rs.getFloat("volume")
                ),
                indexName
            );
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving historical data for index {}: {}", indexName, e.getMessage());
            throw new ServiceException("Error retrieving historical data for index: " + e.getMessage(), e);
        }
    }

    /**
     * Fallback method for getAllIndices when the circuit is open.
     * 
     * @param e The exception that triggered the fallback
     * @return An empty list of indices
     */
    public List<IndexResponseDto> getAllIndicesFallback(Exception e) {
        log.error("Circuit breaker triggered for getAllIndices: {}", e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getIndexById when the circuit is open.
     * 
     * @param id The ID of the index that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public IndexResponseDto getIndexByIdFallback(Integer id, Exception e) {
        log.error("Circuit breaker triggered for getIndexById with id {}: {}", id, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getIndexBySymbol when the circuit is open.
     * 
     * @param symbol The symbol of the index that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public IndexResponseDto getIndexBySymbolFallback(String symbol, Exception e) {
        log.error("Circuit breaker triggered for getIndexBySymbol with symbol {}: {}", symbol, e.getMessage());
        // Propagate not-found errors to ensure correct 404 response instead of 503
        if (e instanceof ResourceNotFoundException) {
            throw (ResourceNotFoundException) e;
        }
        if (e.getCause() instanceof ResourceNotFoundException) {
            throw (ResourceNotFoundException) e.getCause();
        }
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getIndexByName when the circuit is open.
     * 
     * @param indexName The name of the index that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public IndexResponseDto getIndexByNameFallback(String indexName, Exception e) {
        log.error("Circuit breaker triggered for getIndexByName with name {}: {}", indexName, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getIndexByKeyCategory when the circuit is open.
     * 
     * @param keyCategory The key category of the index that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public IndexResponseDto getIndexByKeyCategoryFallback(String keyCategory, Exception e) {
        log.error("Circuit breaker triggered for getIndexByKeyCategory with key category {}: {}", keyCategory, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Fallback method for getIndexHistoricalData when the circuit is open.
     * 
     * @param indexName The name of the index that was being retrieved
     * @param e The exception that triggered the fallback
     * @return null
     */
    public List<IndexHistoricalDataDto> getIndexHistoricalDataFallback(String indexName, Exception e) {
        log.error("Circuit breaker triggered for getIndexHistoricalData with index name {}: {}", indexName, e.getMessage());
        throw new ServiceException("Service unavailable", e);
    }

    /**
     * Maps an Index entity to IndexResponseDto.
     * 
     * @param index The index entity to map
     * @return The mapped IndexResponseDto
     */
    private IndexResponseDto mapToResponseDto(Index index) {
        return new IndexResponseDto(
                index.getId(),
                index.getKeyCategory(),
                index.getIndexName(),
                index.getIndexSymbol(),
                index.getLastPrice(),
                index.getVariation(),
                index.getPercentChange(),
                index.getOpenPrice(),
                index.getHighPrice(),
                index.getLowPrice(),
                index.getPreviousClose(),
                index.getYearHigh(),
                index.getYearLow(),
                index.getIndicativeClose(),
                index.getPeRatio(),
                index.getPbRatio(),
                index.getDividendYield(),
                index.getDeclines(),
                index.getAdvances(),
                index.getUnchanged(),
                index.getPercentChange365d(),
                index.getDate365dAgo(),
                index.getPercentChange30d(),
                index.getDate30dAgo(),
                index.getPreviousDay(),
                index.getOneWeekAgo(),
                index.getOneMonthAgo(),
                index.getOneYearAgo(),
                index.getCreatedAt(),
                index.getUpdatedAt()
        );
    }
}
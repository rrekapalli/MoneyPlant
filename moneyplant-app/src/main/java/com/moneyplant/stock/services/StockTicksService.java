package com.moneyplant.stock.services;

import com.moneyplant.stock.dtos.StockTicksDto;
import com.moneyplant.core.exceptions.ServiceException;
import com.moneyplant.core.entities.NseStockTick;
import com.moneyplant.stock.repositories.NseStockTickRepository;
import com.moneyplant.stock.mappers.StockTicksMapper;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for fetching and broadcasting stock ticks data from the database.
 * Provides real-time stock data updates via WebSocket connections.
 * Data is sourced from the nse_stock_tick table instead of external APIs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockTicksService {

    private static final String STOCK_TICKS_SERVICE = "stockTicksService";
    
    private final NseStockTickRepository nseStockTickRepository;
    private final StockTicksMapper stockTicksMapper;
    private final SimpMessagingTemplate messagingTemplate;
    
    // Store active subscriptions by index name
    private final Map<String, Boolean> activeSubscriptions = new ConcurrentHashMap<>();

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
     * Subscribes to real-time stock ticks updates for a specific index.
     * 
     * @param indexName The name of the index to subscribe to
     */
    public void subscribeToStockTicks(String indexName) {
        log.info("Subscribing to stock ticks for index: {}", indexName);
        activeSubscriptions.put(indexName, true);
        
        // Immediately fetch and broadcast current data
        try {
            StockTicksDto stockTicks = getStockTicks(indexName);
            broadcastStockTicks(indexName, stockTicks);
        } catch (Exception e) {
            log.error("Error during initial stock ticks fetch for subscription to index {}: {}", 
                    indexName, e.getMessage());
        }
    }

    /**
     * Unsubscribes from stock ticks updates for a specific index.
     * 
     * @param indexName The name of the index to unsubscribe from
     */
    public void unsubscribeFromStockTicks(String indexName) {
        log.info("Unsubscribing from stock ticks for index: {}", indexName);
        activeSubscriptions.remove(indexName);
    }

    /**
     * Scheduled method that runs every 2 minutes to fetch and broadcast stock ticks
     * for all active subscriptions.
     */
    @Scheduled(fixedRate = 120000) // 2 minutes = 120,000 milliseconds
    public void scheduledStockTicksUpdate() {
        if (activeSubscriptions.isEmpty()) {
            log.debug("No active subscriptions, skipping scheduled update");
            return;
        }

        log.info("Running scheduled stock ticks update for {} active subscriptions", 
                activeSubscriptions.size());

        activeSubscriptions.keySet().forEach(indexName -> {
            try {
                StockTicksDto stockTicks = getStockTicks(indexName);
                broadcastStockTicks(indexName, stockTicks);
            } catch (Exception e) {
                log.error("Error during scheduled stock ticks update for index {}: {}", 
                        indexName, e.getMessage());
            }
        });
    }

    /**
     * Broadcasts stock ticks data to WebSocket subscribers.
     * 
     * @param indexName The index name
     * @param stockTicks The stock ticks data to broadcast
     */
    private void broadcastStockTicks(String indexName, StockTicksDto stockTicks) {
        if (stockTicks != null) {
            String destination = "/topic/stock-ticks/" + indexName.replace(" ", "-").toLowerCase();
            messagingTemplate.convertAndSend(destination, stockTicks);
            log.debug("Broadcasted stock ticks for index {} to destination {}", indexName, destination);
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
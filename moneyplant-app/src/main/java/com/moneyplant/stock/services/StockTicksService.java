package com.moneyplant.stock.services;

import com.moneyplant.stock.dtos.StockTicksDto;
import com.moneyplant.core.exceptions.ServiceException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service for fetching and broadcasting stock ticks data from NSE India API.
 * Provides real-time stock data updates via WebSocket connections.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StockTicksService {

    private static final String STOCK_TICKS_SERVICE = "stockTicksService";
    private static final String NSE_BASE_URL = "https://www.nseindia.com";
    private static final String STOCK_INDICES_ENDPOINT = "/api/equity-stockIndices";
    
    private final WebClient webClient;
    private final SimpMessagingTemplate messagingTemplate;
    
    // Store active subscriptions by index name
    private final Map<String, Boolean> activeSubscriptions = new ConcurrentHashMap<>();

    /**
     * Fetches stock ticks data for a specific index from NSE India API.
     * 
     * @param indexName The name of the index (e.g., "NIFTY 50")
     * @return StockTicksDto containing the stock data
     * @throws ServiceException if there is an error fetching the data
     */
    @CircuitBreaker(name = STOCK_TICKS_SERVICE, fallbackMethod = "getStockTicksFallback")
    public StockTicksDto getStockTicks(String indexName) {
        try {
            log.info("Fetching stock ticks for index: {}", indexName);
            
            StockTicksDto stockTicks = webClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("www.nseindia.com")
                            .path(STOCK_INDICES_ENDPOINT)
                            .queryParam("index", indexName)
                            .build())
                    .headers(headers -> {
                        // Add required headers to mimic browser request
                        headers.add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                        headers.add("Accept", "application/json, text/plain, */*");
                        headers.add("Accept-Language", "en-US,en;q=0.9");
                        headers.add("Accept-Encoding", "gzip, deflate, br");
                        headers.add("Connection", "keep-alive");
                        headers.add("Upgrade-Insecure-Requests", "1");
                    })
                    .retrieve()
                    .bodyToMono(StockTicksDto.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            if (stockTicks != null) {
                log.info("Successfully fetched stock ticks for index: {} with {} data points", 
                        indexName, stockTicks.getData() != null ? stockTicks.getData().size() : 0);
            }
            
            return stockTicks;
            
        } catch (WebClientResponseException e) {
            log.error("HTTP error fetching stock ticks for index {}: {} - {}", 
                    indexName, e.getStatusCode(), e.getResponseBodyAsString());
            throw new ServiceException("Failed to fetch stock ticks for index: " + indexName + 
                    ". HTTP Status: " + e.getStatusCode(), e);
        } catch (Exception e) {
            log.error("Error fetching stock ticks for index {}: {}", indexName, e.getMessage(), e);
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
     * Fallback method for circuit breaker when stock ticks API is unavailable.
     * 
     * @param indexName The index name
     * @param ex The exception that triggered the fallback
     * @return Empty StockTicksDto or cached data
     */
    public StockTicksDto getStockTicksFallback(String indexName, Exception ex) {
        log.warn("Stock ticks service fallback triggered for index {}: {}", indexName, ex.getMessage());
        
        // Return a basic response indicating service unavailability
        StockTicksDto fallbackResponse = new StockTicksDto();
        fallbackResponse.setName(indexName);
        fallbackResponse.setTimestamp(java.time.LocalDateTime.now().toString());
        
        return fallbackResponse;
    }
}
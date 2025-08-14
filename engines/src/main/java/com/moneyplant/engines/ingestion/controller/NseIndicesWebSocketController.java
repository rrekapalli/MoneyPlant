package com.moneyplant.engines.ingestion.controller;

import com.moneyplant.engines.common.dto.NseIndicesTickDto;
import com.moneyplant.engines.ingestion.service.NseIndicesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

/**
 * WebSocket controller for real-time NSE indices data streaming.
 * Allows frontend to subscribe to real-time NSE indices updates via WebSocket.
 * 
 * WebSocket endpoints:
 * - /ws/nse-indices - Main WebSocket connection
 * - /topic/nse-indices - Subscribe to all indices data
 * - /topic/nse-indices/{indexName} - Subscribe to specific index data
 * - /app/subscribe-indices - Trigger subscription to all indices
 * - /app/subscribe-indices/{indexName} - Trigger subscription to specific index
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class NseIndicesWebSocketController {

    private final NseIndicesService nseIndicesService;

    /**
     * WebSocket subscription endpoint for all indices data.
     * Clients can subscribe to receive real-time updates for all NSE indices.
     * 
     * Subscription path: /topic/nse-indices
     * 
     * @return Current indices data for all indices
     */
    @SubscribeMapping("/nse-indices")
    public NseIndicesTickDto subscribeToAllIndices() {
        try {
            log.info("WebSocket subscription request for all NSE indices");
            
            // Subscribe to updates for all indices
            nseIndicesService.subscribeToAllIndices();
            
            // Return current data immediately
            List<NseIndicesTickDto> currentData = nseIndicesService.getLatestIndicesData();
            return currentData.isEmpty() ? null : currentData.get(currentData.size() - 1);
            
        } catch (Exception e) {
            log.error("Error during WebSocket subscription to all indices: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * WebSocket subscription endpoint for specific index data.
     * Clients can subscribe to receive real-time updates for a specific NSE index.
     * 
     * Subscription path: /topic/nse-indices/{indexName}
     * 
     * @param indexName The name of the NSE index (e.g., "NIFTY-50")
     * @return Current indices data for the specified index
     */
    @SubscribeMapping("/nse-indices/{indexName}")
    public NseIndicesTickDto subscribeToSpecificIndex(@DestinationVariable String indexName) {
        try {
            log.info("WebSocket subscription request for NSE index: {}", indexName);
            
            // Convert URL-friendly index name back to original format
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            
            // Subscribe to updates for this specific index
            nseIndicesService.subscribeToIndex(originalIndexName);
            
            // Return current data for this index
            return nseIndicesService.getLatestIndexData(originalIndexName);
            
        } catch (Exception e) {
            log.error("Error during WebSocket subscription to index {}: {}", indexName, e.getMessage(), e);
            return null;
        }
    }

    /**
     * WebSocket message mapping for subscribing to all indices updates.
     */
    @MessageMapping("/subscribe-indices")
    @SendTo("/topic/nse-indices")
    public NseIndicesTickDto subscribeToAllIndicesMessage() {
        try {
            log.info("WebSocket message request for all indices subscription");
            nseIndicesService.subscribeToAllIndices();
            
            // Return current data
            List<NseIndicesTickDto> currentData = nseIndicesService.getLatestIndicesData();
            return currentData.isEmpty() ? null : currentData.get(currentData.size() - 1);
            
        } catch (Exception e) {
            log.error("Error during subscribe to all indices: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * WebSocket message mapping for subscribing to specific index updates.
     */
    @MessageMapping("/subscribe-indices/{indexName}")
    @SendTo("/topic/nse-indices/{indexName}")
    public NseIndicesTickDto subscribeToIndexMessage(@DestinationVariable String indexName) {
        try {
            log.info("WebSocket message request for index subscription: {}", indexName);
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            nseIndicesService.subscribeToIndex(originalIndexName);
            
            // Return current data for this index
            return nseIndicesService.getLatestIndexData(originalIndexName);
            
        } catch (Exception e) {
            log.error("Error during subscribe to index {}: {}", indexName, e.getMessage(), e);
            return null;
        }
    }

    /**
     * WebSocket message mapping for unsubscribing from all indices updates.
     */
    @MessageMapping("/unsubscribe-indices")
    public void unsubscribeFromAllIndicesMessage() {
        try {
            log.info("WebSocket message request for all indices unsubscription");
            nseIndicesService.unsubscribeFromAllIndices();
        } catch (Exception e) {
            log.error("Error during unsubscribe from all indices: {}", e.getMessage(), e);
        }
    }

    /**
     * WebSocket message mapping for unsubscribing from specific index updates.
     */
    @MessageMapping("/unsubscribe-indices/{indexName}")
    public void unsubscribeFromIndexMessage(@DestinationVariable String indexName) {
        try {
            log.info("WebSocket message request for index unsubscription: {}", indexName);
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            nseIndicesService.unsubscribeFromIndex(originalIndexName);
            
        } catch (Exception e) {
            log.error("Error during unsubscribe from index {}: {}", indexName, e.getMessage(), e);
        }
    }

    /**
     * WebSocket message mapping for starting ingestion.
     */
    @MessageMapping("/start-ingestion")
    @SendTo("/topic/nse-indices")
    public NseIndicesTickDto startIngestionMessage() {
        try {
            log.info("WebSocket message request to start NSE indices ingestion");
            nseIndicesService.startNseIndicesIngestion();
            
            // Return current data after starting
            List<NseIndicesTickDto> currentData = nseIndicesService.getLatestIndicesData();
            return currentData.isEmpty() ? null : currentData.get(currentData.size() - 1);
            
        } catch (Exception e) {
            log.error("Error during start ingestion: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * WebSocket message mapping for stopping ingestion.
     */
    @MessageMapping("/stop-ingestion")
    public void stopIngestionMessage() {
        try {
            log.info("WebSocket message request to stop NSE indices ingestion");
            nseIndicesService.stopNseIndicesIngestion();
        } catch (Exception e) {
            log.error("Error during stop ingestion: {}", e.getMessage(), e);
        }
    }

    /**
     * WebSocket message mapping for triggering manual ingestion.
     */
    @MessageMapping("/trigger-ingestion")
    @SendTo("/topic/nse-indices")
    public NseIndicesTickDto triggerIngestionMessage() {
        try {
            log.info("WebSocket message request to trigger manual NSE indices ingestion");
            nseIndicesService.triggerManualIngestion();
            
            // Return current data after triggering
            List<NseIndicesTickDto> currentData = nseIndicesService.getLatestIndicesData();
            return currentData.isEmpty() ? null : currentData.get(currentData.size() - 1);
            
        } catch (Exception e) {
            log.error("Error during trigger ingestion: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Health check endpoint for WebSocket connections
     */
    @GetMapping("/ws/health")
    @ResponseBody
    public String webSocketHealth() {
        return "WebSocket endpoints are active";
    }
    
    /**
     * Test endpoint to trigger Kafka consumer with sample data
     * This helps verify that the WebSocket data flow is working
     */
    @GetMapping("/ws/test-kafka-consumer")
    @ResponseBody
    public String testKafkaConsumer() {
        try {
            log.info("REST endpoint triggered Kafka consumer test");
            nseIndicesService.testKafkaConsumer();
            return "Kafka consumer test triggered successfully. Check logs for details.";
        } catch (Exception e) {
            log.error("Error during Kafka consumer test: {}", e.getMessage(), e);
            return "Error during Kafka consumer test: " + e.getMessage();
        }
    }
}

package com.moneyplant.engines.ingestion.api;

import com.moneyplant.engines.common.NseIndicesTickDto;
import com.moneyplant.engines.ingestion.service.NseIndicesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for NSE indices data ingestion operations.
 * Manages WebSocket connections to NSE, data processing, and Kafka publishing.
 * 
 * This controller is part of the engines project and handles:
 * 1. Starting/stopping NSE indices data ingestion
 * 2. Managing WebSocket subscriptions to specific indices
 * 3. Monitoring ingestion status and connection health
 * 4. Triggering manual data ingestion for testing
 * 5. Publishing processed data to Kafka topics
 * 
 * Data flow: NSE WebSocket -> Engines (Processing) -> Kafka -> Backend (Database)
 */
@RestController
@RequestMapping("/api/nse-indices")
@RequiredArgsConstructor
@Slf4j
public class NseIndicesController {

    private final NseIndicesService nseIndicesService;

    /**
     * Start NSE indices data ingestion
     * Initiates WebSocket connection to NSE and starts streaming data
     */
    @PostMapping("/ingestion/start")
    public ResponseEntity<Map<String, String>> startIngestion() {
        try {
            log.info("Starting NSE indices data ingestion...");
            nseIndicesService.startNseIndicesIngestion();
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "NSE indices data ingestion started successfully",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Failed to start NSE indices ingestion: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to start NSE indices ingestion: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Stop NSE indices data ingestion
     * Gracefully closes WebSocket connection and stops data streaming
     */
    @PostMapping("/ingestion/stop")
    public ResponseEntity<Map<String, String>> stopIngestion() {
        try {
            log.info("Stopping NSE indices data ingestion...");
            nseIndicesService.stopNseIndicesIngestion();
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "NSE indices data ingestion stopped successfully",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Failed to stop NSE indices ingestion: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to stop NSE indices ingestion: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Get current ingestion status
     * Returns detailed status information including connection health and statistics
     */
    @GetMapping("/ingestion/status")
    public ResponseEntity<Map<String, Object>> getIngestionStatus() {
        try {
            String status = nseIndicesService.getIngestionStatus();
            boolean isConnected = nseIndicesService.isWebSocketConnected();
            String connectionStats = nseIndicesService.getConnectionStats();
            
            Map<String, Object> response = Map.of(
                "ingestionStatus", status,
                "webSocketConnected", isConnected,
                "connectionStats", connectionStats,
                "timestamp", java.time.Instant.now().toString()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to get ingestion status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to get ingestion status: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Subscribe to all NSE indices data
     * Sends subscription message to NSE WebSocket for all available indices
     */
    @PostMapping("/subscription/all")
    public ResponseEntity<Map<String, String>> subscribeToAllIndices() {
        try {
            log.info("Subscribing to all NSE indices data...");
            nseIndicesService.subscribeToAllIndices();
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Subscribed to all NSE indices data successfully",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Failed to subscribe to all indices: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to subscribe to all indices: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Subscribe to specific NSE index data
     * Sends subscription message to NSE WebSocket for a specific index
     */
    @PostMapping("/subscription/{indexName}")
    public ResponseEntity<Map<String, String>> subscribeToIndex(@PathVariable String indexName) {
        try {
            log.info("Subscribing to NSE index: {}", indexName);
            nseIndicesService.subscribeToIndex(indexName);
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Subscribed to NSE index: " + indexName,
                "indexName", indexName,
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Failed to subscribe to index {}: {}", indexName, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to subscribe to index " + indexName + ": " + e.getMessage(),
                "indexName", indexName,
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Unsubscribe from all NSE indices data
     * Sends unsubscribe message to NSE WebSocket for all indices
     */
    @DeleteMapping("/subscription/all")
    public ResponseEntity<Map<String, String>> unsubscribeFromAllIndices() {
        try {
            log.info("Unsubscribing from all NSE indices data...");
            nseIndicesService.unsubscribeFromAllIndices();
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Unsubscribed from all NSE indices data successfully",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Failed to unsubscribe from all indices: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to unsubscribe from all indices: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Unsubscribe from specific NSE index data
     * Sends unsubscribe message to NSE WebSocket for a specific index
     */
    @DeleteMapping("/subscription/{indexName}")
    public ResponseEntity<Map<String, String>> unsubscribeFromIndex(@PathVariable String indexName) {
        try {
            log.info("Unsubscribing from NSE index: {}", indexName);
            nseIndicesService.unsubscribeFromIndex(indexName);
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Unsubscribed from NSE index: " + indexName,
                "indexName", indexName,
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Failed to unsubscribe from index {}: {}", indexName, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to unsubscribe from index " + indexName + ": " + e.getMessage(),
                "indexName", indexName,
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Get latest ingested indices data
     * Returns the most recent NSE indices data from local cache
     */
    @GetMapping("/data/latest")
    public ResponseEntity<List<NseIndicesTickDto>> getLatestIndicesData() {
        try {
            log.debug("Retrieving latest NSE indices data...");
            List<NseIndicesTickDto> latestData = nseIndicesService.getLatestIndicesData();
            
            return ResponseEntity.ok(latestData);
            
        } catch (Exception e) {
            log.error("Failed to retrieve latest indices data: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get latest data for a specific index
     * Returns the most recent data for the specified index from local cache
     */
    @GetMapping("/data/{indexName}")
    public ResponseEntity<NseIndicesTickDto> getLatestIndexData(@PathVariable String indexName) {
        try {
            log.debug("Retrieving latest data for NSE index: {}", indexName);
            NseIndicesTickDto indexData = nseIndicesService.getLatestIndexData(indexName);
            
            if (indexData != null) {
                return ResponseEntity.ok(indexData);
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Failed to retrieve data for index {}: {}", indexName, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Manually trigger data ingestion for testing purposes
     * Useful for testing Kafka publishing without waiting for real-time data
     */
    @PostMapping("/ingestion/trigger")
    public ResponseEntity<Map<String, String>> triggerManualIngestion() {
        try {
            log.info("Manual NSE indices data ingestion triggered...");
            nseIndicesService.triggerManualIngestion();
            
            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Manual NSE indices data ingestion triggered successfully",
                "timestamp", java.time.Instant.now().toString()
            ));
            
        } catch (Exception e) {
            log.error("Failed to trigger manual ingestion: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to trigger manual ingestion: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Check WebSocket connection health
     * Returns the current connection status
     */
    @GetMapping("/health/websocket")
    public ResponseEntity<Map<String, Object>> checkWebSocketHealth() {
        try {
            boolean isConnected = nseIndicesService.isWebSocketConnected();
            String connectionStats = nseIndicesService.getConnectionStats();
            
            Map<String, Object> response = Map.of(
                "webSocketConnected", isConnected,
                "connectionStats", connectionStats,
                "timestamp", java.time.Instant.now().toString()
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to check WebSocket health: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to check WebSocket health: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }

    /**
     * Get system information and configuration
     * Returns configuration details and system status
     */
    @GetMapping("/system/info")
    public ResponseEntity<Map<String, Object>> getSystemInfo() {
        try {
            Map<String, Object> systemInfo = Map.of(
                "serviceName", "NSE Indices Ingestion Engine",
                "version", "1.0.0",
                "description", "Real-time NSE indices data ingestion service with Kafka publishing",
                "dataSource", "NSE WebSocket (wss://www.nseindia.com/streams/indices/high/drdMkt)",
                "outputDestination", "Kafka Topic: nse-indices-ticks",
                "supportedIndices", List.of("NIFTY 50", "SENSEX", "BANKNIFTY", "NIFTY IT", "NIFTY PHARMA"),
                "ingestionStatus", nseIndicesService.getIngestionStatus(),
                "webSocketConnected", nseIndicesService.isWebSocketConnected(),
                "timestamp", java.time.Instant.now().toString()
            );
            
            return ResponseEntity.ok(systemInfo);
            
        } catch (Exception e) {
            log.error("Failed to get system info: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                "status", "ERROR",
                "message", "Failed to get system info: " + e.getMessage(),
                "timestamp", java.time.Instant.now().toString()
            ));
        }
    }
}

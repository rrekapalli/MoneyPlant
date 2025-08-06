package com.moneyplant.stock.controllers;

import com.moneyplant.stock.dtos.IndicesDto;
import com.moneyplant.stock.services.IndicesService;
import com.moneyplant.core.exceptions.ResourceNotFoundException;
import com.moneyplant.core.exceptions.ServiceException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * WebSocket controller for real-time NSE indices data streaming.
 * Connects to NSE indices WebSocket stream and provides endpoints for subscribing to indices data updates.
 * 
 * Data source: wss://www.nseindia.com/streams/indices/high/drdMkt
 * 
 * Available endpoints:
 * 1. /indices - Subscribe to all indices data
 * 2. /indices/{indexName} - Subscribe to specific index data
 */
@Controller
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Indices", description = "Real-time NSE indices WebSocket API")
public class IndicesController {

    private final IndicesService indicesService;

    /**
     * REST endpoint to manually trigger subscription for testing
     */
    @PostMapping("/api/test/subscribe/{indexName}")
    @Operation(
        summary = "Test subscription to specific index",
        description = "Manually trigger subscription to test NSE WebSocket connection"
    )
    public IndicesDto testSubscribeToIndex(@PathVariable String indexName) {
        try {
            log.info("Test subscription request for index: {}", indexName);
            
            // Convert URL-friendly index name back to original format
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            
            // Subscribe to updates for this specific index
            indicesService.subscribeToIndex(originalIndexName);
            
            // Return current data immediately
            return indicesService.getIndexData(originalIndexName);
            
        } catch (Exception e) {
            log.error("Error during test subscription for index {}: {}", indexName, e.getMessage(), e);
            throw new ServiceException("Failed to test subscribe to index: " + indexName, e);
        }
    }

    /**
     * REST endpoint to check WebSocket connection status
     */
    @GetMapping("/api/test/status")
    @Operation(
        summary = "Check WebSocket connection status",
        description = "Check if NSE WebSocket connection is active"
    )
    public Object testConnectionStatus() {
        try {
            // This is a simple test - in a real implementation you'd expose connection status
            return Map.of(
                "status", "Service is running",
                "timestamp", java.time.Instant.now().toString(),
                "message", "Check backend logs for NSE WebSocket connection status"
            );
        } catch (Exception e) {
            log.error("Error checking connection status: {}", e.getMessage(), e);
            throw new ServiceException("Failed to check connection status", e);
        }
    }

    /**
     * WebSocket subscription endpoint for all indices data.
     * Clients can subscribe to receive real-time updates for all NSE indices.
     * 
     * Subscription path: /topic/indices
     * 
     * @return Current indices data for all indices
     */
    @SubscribeMapping("/indices")
    @Operation(
        summary = "Subscribe to all indices data",
        description = "Subscribe to real-time updates for all NSE indices data from NSE WebSocket stream"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully subscribed to all indices data",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = IndicesDto.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public IndicesDto subscribeToAllIndices() {
        try {
            log.info("WebSocket subscription request for all indices data");
            
            // Subscribe to updates for all indices
            indicesService.subscribeToAllIndices();
            
            // Return current data immediately
            return indicesService.getAllIndices();
            
        } catch (ServiceException e) {
            log.error("Service error during all indices subscription: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during all indices subscription: {}", e.getMessage(), e);
            throw new ServiceException("Failed to subscribe to all indices data", e);
        }
    }

    /**
     * WebSocket subscription endpoint for specific index data.
     * Clients can subscribe to receive real-time updates for a specific NSE index.
     * 
     * Subscription path: /topic/indices/{indexName}
     * 
     * @param indexName The name of the index (e.g., "NIFTY-50", "SENSEX", "BANKNIFTY")
     * @return Current indices data for the specified index
     */
    @SubscribeMapping("/indices/{indexName}")
    @Operation(
        summary = "Subscribe to specific index data",
        description = "Subscribe to real-time updates for a specific NSE index from NSE WebSocket stream"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully subscribed to index data",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = IndicesDto.class))),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public IndicesDto subscribeToIndex(
            @DestinationVariable 
            @Parameter(description = "Index name (e.g., NIFTY-50, SENSEX, BANKNIFTY)", required = true)
            String indexName) {
        try {
            log.info("WebSocket subscription request for index: {}", indexName);
            
            // Convert URL-friendly index name back to original format
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            
            // Subscribe to updates for this specific index
            indicesService.subscribeToIndex(originalIndexName);
            
            // Return current data immediately
            return indicesService.getIndexData(originalIndexName);
            
        } catch (ResourceNotFoundException e) {
            log.error("Index not found during subscription for index {}: {}", indexName, e.getMessage());
            throw e;
        } catch (ServiceException e) {
            log.error("Service error during index subscription for index {}: {}", indexName, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during index subscription for index {}: {}", indexName, e.getMessage(), e);
            throw new ServiceException("Failed to subscribe to index: " + indexName, e);
        }
    }

    /**
     * WebSocket message mapping for subscribing to all indices updates.
     */
    @MessageMapping("/subscribe-indices")
    @Operation(
        summary = "Subscribe to all indices data",
        description = "Trigger subscription to all indices and connect to NSE WebSocket"
    )
    public void subscribeToAllIndicesMessage() {
        try {
            log.info("WebSocket message request for all indices subscription");
            indicesService.subscribeToAllIndices();
        } catch (Exception e) {
            log.error("Error during subscribe to all indices: {}", e.getMessage(), e);
            throw new ServiceException("Failed to subscribe to all indices", e);
        }
    }

    /**
     * WebSocket message mapping for subscribing to specific index updates.
     */
    @MessageMapping("/subscribe-indices/{indexName}")
    @Operation(
        summary = "Subscribe to specific index data",
        description = "Trigger subscription to specific index and connect to NSE WebSocket"
    )
    public void subscribeToIndexMessage(
            @DestinationVariable 
            @Parameter(description = "Index name to subscribe to", required = true)
            String indexName) {
        try {
            log.info("WebSocket message request for index subscription: {}", indexName);
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            indicesService.subscribeToIndex(originalIndexName);
        } catch (Exception e) {
            log.error("Error during subscribe to index {}: {}", indexName, e.getMessage(), e);
            throw new ServiceException("Failed to subscribe to index: " + indexName, e);
        }
    }

    /**
     * WebSocket message mapping for unsubscribing from all indices updates.
     */
    @MessageMapping("/unsubscribe-indices")
    @Operation(
        summary = "Unsubscribe from all indices data",
        description = "Stop receiving real-time updates for all indices"
    )
    public void unsubscribeFromAllIndices() {
        try {
            log.info("WebSocket unsubscribe request for all indices");
            indicesService.unsubscribeFromAllIndices();
        } catch (Exception e) {
            log.error("Error during unsubscribe from all indices: {}", e.getMessage(), e);
            throw new ServiceException("Failed to unsubscribe from all indices", e);
        }
    }

    /**
     * WebSocket message mapping for unsubscribing from specific index updates.
     * 
     * @param indexName The name of the index to unsubscribe from
     */
    @MessageMapping("/unsubscribe-indices/{indexName}")
    @Operation(
        summary = "Unsubscribe from specific index data",
        description = "Stop receiving real-time updates for a specific index"
    )
    public void unsubscribeFromIndex(
            @DestinationVariable 
            @Parameter(description = "Index name to unsubscribe from", required = true)
            String indexName) {
        try {
            log.info("WebSocket unsubscribe request for index: {}", indexName);
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            indicesService.unsubscribeFromIndex(originalIndexName);
        } catch (Exception e) {
            log.error("Error during unsubscribe from index {}: {}", indexName, e.getMessage(), e);
            throw new ServiceException("Failed to unsubscribe from index: " + indexName, e);
        }
    }
}
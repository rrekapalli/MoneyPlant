package com.moneyplant.stock.controllers;

import com.moneyplant.stock.dtos.StockTicksDto;
import com.moneyplant.stock.dtos.EnrichedStockTickDto;
import com.moneyplant.stock.services.StockTicksService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * WebSocket controller for real-time stock ticks data streaming.
 * Provides endpoints for subscribing to stock index data updates.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Stock Ticks", description = "Real-time stock ticks WebSocket API")
public class StockTicksController {

    private final StockTicksService stockTicksService;

    /**
     * WebSocket subscription endpoint for stock ticks data.
     * Clients can subscribe to receive real-time updates for a specific index.
     * 
     * @param indexName The name of the stock index (e.g., "NIFTY-50")
     * @return Current stock ticks data for the specified index
     */
    @SubscribeMapping("/stock-ticks/{indexName}")
    public StockTicksDto subscribeToStockTicks(
            @DestinationVariable String indexName) {
        try {
            log.info("WebSocket subscription request for stock ticks: {}", indexName);
            
            // Convert URL-friendly index name back to original format
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            
            // Subscribe to updates for this index
            stockTicksService.subscribeToStockTicks(originalIndexName);
            
            // Return current data immediately
            return stockTicksService.getStockTicks(originalIndexName);
            
        } catch (ServiceException e) {
            log.error("Service error during stock ticks subscription for index {}: {}", 
                    indexName, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during stock ticks subscription for index {}: {}", 
                    indexName, e.getMessage(), e);
            throw new ServiceException("Failed to subscribe to stock ticks for index: " + indexName, e);
        }
    }

    /**
     * WebSocket message mapping for unsubscribing from stock ticks updates.
     * 
     * @param indexName The name of the stock index to unsubscribe from
     */
    @MessageMapping("/unsubscribe-stock-ticks/{indexName}")
    public void unsubscribeFromStockTicks(@DestinationVariable String indexName) {
        try {
            log.info("WebSocket unsubscribe request for stock ticks: {}", indexName);
            
            // Convert URL-friendly index name back to original format
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            
            stockTicksService.unsubscribeFromStockTicks(originalIndexName);
            
        } catch (Exception e) {
            log.error("Error during stock ticks unsubscription for index {}: {}", 
                    indexName, e.getMessage(), e);
        }
    }

    /**
     * REST endpoint to get current stock ticks data for a specific index.
     * This is a fallback HTTP endpoint for clients that don't support WebSocket.
     * 
     * @param indexName The name of the stock index
     * @return Current stock ticks data
     */
    @Operation(summary = "Get current stock ticks data", 
               description = "Retrieves current stock ticks data for the specified index")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved stock ticks data",
                content = @Content(schema = @Schema(implementation = StockTicksDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid index name"),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/api/v1/stock-ticks/{indexName}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<StockTicksDto> getStockTicks(
            @Parameter(description = "Name of the stock index (e.g., NIFTY 50)", required = true)
            @PathVariable String indexName) {
        try {
            log.info("REST request for stock ticks: {}", indexName);
            
            if (indexName == null || indexName.trim().isEmpty()) {
                throw new IllegalArgumentException("Index name cannot be null or empty");
            }
            
            // Convert URL-friendly index name back to original format
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            
            StockTicksDto stockTicks = stockTicksService.getStockTicks(originalIndexName);
            
            if (stockTicks == null) {
                throw new ResourceNotFoundException("No data found for index: " + originalIndexName);
            }
            
            return ResponseEntity.ok(stockTicks);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request parameter for stock ticks: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (ResourceNotFoundException e) {
            log.error("Stock ticks not found for index {}: {}", indexName, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (ServiceException e) {
            log.error("Service error retrieving stock ticks for index {}: {}", indexName, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unexpected error retrieving stock ticks for index {}: {}", 
                    indexName, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * REST endpoint to get enriched stock ticks data for a specific index.
     * Returns comprehensive stock data including additional fields from nse_equity_master table.
     * 
     * @param selectedIndex The sector index to search for
     * @return List of enriched stock ticks data
     */
    @Operation(summary = "Get enriched stock ticks data by index", 
               description = "Retrieves enriched stock ticks data for the specified sector index with additional fields from nse_equity_master")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved enriched stock ticks data"),
        @ApiResponse(responseCode = "400", description = "Invalid index parameter"),
        @ApiResponse(responseCode = "404", description = "No data found for the specified index"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/api/v1/stock-ticks/by-index/{selectedIndex}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<EnrichedStockTickDto>> getStockTicksByIndex(
            @Parameter(description = "Sector index to search for (e.g., NIFTY 50)", required = true)
            @PathVariable String selectedIndex) {
        try {
            log.info("REST request for enriched stock ticks by index: {}", selectedIndex);
            
            if (selectedIndex == null || selectedIndex.trim().isEmpty()) {
                throw new IllegalArgumentException("Selected index cannot be null or empty");
            }
            
            // Convert URL-friendly index name back to original format if needed
            String originalIndexName = selectedIndex.replace("-", " ").toUpperCase();
            
            List<EnrichedStockTickDto> enrichedStockTicks = stockTicksService.getEnrichedStockTicksByIndex(originalIndexName);
            
            if (enrichedStockTicks.isEmpty()) {
                throw new ResourceNotFoundException("No data found for index: " + originalIndexName);
            }
            
            return ResponseEntity.ok(enrichedStockTicks);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request parameter for enriched stock ticks: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (ResourceNotFoundException e) {
            log.error("Enriched stock ticks not found for index {}: {}", selectedIndex, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (ServiceException e) {
            log.error("Service error retrieving enriched stock ticks for index {}: {}", selectedIndex, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            log.error("Unexpected error retrieving enriched stock ticks for index {}: {}", 
                    selectedIndex, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * REST endpoint to get list of available stock indices.
     * 
     * @return List of available indices for stock ticks data
     */
    @Operation(summary = "Get available stock indices", 
               description = "Retrieves list of available stock indices for real-time data")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved available indices"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping("/api/v1/stock-ticks/indices")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<String[]> getAvailableIndices() {
        try {
            // Return commonly available NSE indices
            String[] availableIndices = {
                "NIFTY 50",
                "NIFTY NEXT 50", 
                "NIFTY 100",
                "NIFTY 200",
                "NIFTY 500",
                "NIFTY MIDCAP 50",
                "NIFTY MIDCAP 100",
                "NIFTY SMALLCAP 100",
                "NIFTY BANK",
                "NIFTY IT",
                "NIFTY PHARMA",
                "NIFTY AUTO",
                "NIFTY FMCG",
                "NIFTY METAL",
                "NIFTY REALTY"
            };
            
            return ResponseEntity.ok(availableIndices);
            
        } catch (Exception e) {
            log.error("Error retrieving available indices: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
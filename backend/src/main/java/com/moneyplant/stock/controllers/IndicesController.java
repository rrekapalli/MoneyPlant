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
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST controller for NSE indices data.
 * Provides endpoints for retrieving indices data.
 * Note: WebSocket functionality has been moved to the engines project.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Indices", description = "NSE indices REST API")
public class IndicesController {

    private final IndicesService indicesService;

    /**
     * REST endpoint to get indices data for a specific index.
     */
    @GetMapping("/api/v1/indices/{indexName}")
    @Operation(
        summary = "Get indices data for specific index",
        description = "Retrieves current indices data for the specified index"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved indices data",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = IndicesDto.class))),
        @ApiResponse(responseCode = "404", description = "Index not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public IndicesDto getIndexData(@PathVariable String indexName) {
        try {
            log.info("REST request for indices data: {}", indexName);
            
            if (indexName == null || indexName.trim().isEmpty()) {
                throw new IllegalArgumentException("Index name cannot be null or empty");
            }
            
            // Convert URL-friendly index name back to original format
            String originalIndexName = indexName.replace("-", " ").toUpperCase();
            
            return indicesService.getIndexData(originalIndexName);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid request parameter for indices: {}", e.getMessage());
            throw new ServiceException("Invalid index name: " + indexName, e);
        } catch (ResourceNotFoundException e) {
            log.error("Index not found: {}", indexName);
            throw e;
        } catch (Exception e) {
            log.error("Error retrieving indices data for index {}: {}", indexName, e.getMessage(), e);
            throw new ServiceException("Failed to retrieve indices data for index: " + indexName, e);
        }
    }

    /**
     * REST endpoint to get all indices data.
     */
    @GetMapping("/api/v1/indices")
    @Operation(
        summary = "Get all indices data",
        description = "Retrieves current data for all available indices"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved all indices data",
                content = @Content(mediaType = "application/json", schema = @Schema(implementation = IndicesDto.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public IndicesDto getAllIndices() {
        try {
            log.info("REST request for all indices data");
            return indicesService.getAllIndices();
        } catch (Exception e) {
            log.error("Error retrieving all indices data: {}", e.getMessage(), e);
            throw new ServiceException("Failed to retrieve all indices data", e);
        }
    }

    /**
     * REST endpoint to check service status.
     */
    @GetMapping("/api/v1/indices/status")
    @Operation(
        summary = "Check service status",
        description = "Check if the indices service is running"
    )
    public Object getServiceStatus() {
        try {
            return Map.of(
                "status", "Service is running",
                "timestamp", java.time.Instant.now().toString(),
                "message", "Indices service is operational. WebSocket functionality moved to engines project."
            );
        } catch (Exception e) {
            log.error("Error checking service status: {}", e.getMessage(), e);
            throw new ServiceException("Failed to check service status", e);
        }
    }

    /**
     * REST endpoint to get available indices list.
     */
    @GetMapping("/api/v1/indices/available")
    @Operation(
        summary = "Get available indices list",
        description = "Retrieves list of available indices"
    )
    public String[] getAvailableIndices() {
        try {
            // Return commonly available NSE indices
            return new String[]{
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
                "NIFTY REALTY",
                "SENSEX",
                "BANKEX"
            };
        } catch (Exception e) {
            log.error("Error retrieving available indices: {}", e.getMessage(), e);
            throw new ServiceException("Failed to retrieve available indices", e);
        }
    }
}
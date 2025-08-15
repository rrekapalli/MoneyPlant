package com.moneyplant.engines.ingestion.controller;

import com.moneyplant.engines.common.entities.NseIndicesTick;
import com.moneyplant.engines.ingestion.service.NseIndicesTickService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * REST controller for NSE indices tick data operations.
 * Provides endpoints for testing and managing tick data in the database.
 * 
 * NOTE: This controller is temporarily disabled to avoid PostgreSQL ingestion failures.
 * Database operations have been removed from the Kafka subscription flow.
 */
// @RestController  // Temporarily disabled
// @RequestMapping("/api/nse-indices-ticks")  // Temporarily disabled
// @RequiredArgsConstructor  // Temporarily disabled
@Slf4j
public class NseIndicesTickController {

    // private final NseIndicesTickService nseIndicesTickService;  // Temporarily disabled

    /**
     * Get the latest tick data for all indices
     */
    // @GetMapping("/latest")  // Temporarily disabled
    public ResponseEntity<List<NseIndicesTick>> getLatestTicksForAllIndices() {
        // Temporarily disabled - service not available
        return ResponseEntity.ok(List.of());
    }

    /**
     * Get the latest tick data for a specific index
     */
    // @GetMapping("/latest/{indexName}")  // Temporarily disabled
    public ResponseEntity<NseIndicesTick> getLatestTickData(@PathVariable String indexName) {
        // Temporarily disabled - service not available
        return ResponseEntity.notFound().build();
    }

    /**
     * Get tick data for a specific index within a time range
     */
    // @GetMapping("/{indexName}/range")  // Temporarily disabled
    public ResponseEntity<List<NseIndicesTick>> getTickDataByIndexAndTimeRange(
            @PathVariable String indexName,
            @RequestParam Instant startTime,
            @RequestParam Instant endTime) {
        // Temporarily disabled - service not available
        return ResponseEntity.ok(List.of());
    }

    /**
     * Get total count of tick data records
     */
    // @GetMapping("/count")  // Temporarily disabled
    public ResponseEntity<Long> getTotalTickDataCount() {
        // Temporarily disabled - service not available
        return ResponseEntity.ok(0L);
    }

    /**
     * Clean up old tick data
     */
    // @DeleteMapping("/cleanup")  // Temporarily disabled
    public ResponseEntity<String> cleanupOldTickData(@RequestParam(defaultValue = "90") int daysToKeep) {
        // Temporarily disabled - service not available
        return ResponseEntity.ok("Cleanup disabled - database operations not available");
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("NSE Indices Tick Service is running");
    }
}

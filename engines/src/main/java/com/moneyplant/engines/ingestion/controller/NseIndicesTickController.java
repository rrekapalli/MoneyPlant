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
 */
@RestController
@RequestMapping("/api/nse-indices-ticks")
@RequiredArgsConstructor
@Slf4j
public class NseIndicesTickController {

    private final NseIndicesTickService nseIndicesTickService;

    /**
     * Get the latest tick data for all indices
     */
    @GetMapping("/latest")
    public ResponseEntity<List<NseIndicesTick>> getLatestTicksForAllIndices() {
        try {
            List<NseIndicesTick> latestTicks = nseIndicesTickService.getLatestTicksForAllIndices();
            return ResponseEntity.ok(latestTicks);
        } catch (Exception e) {
            log.error("Error retrieving latest ticks for all indices: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get the latest tick data for a specific index
     */
    @GetMapping("/latest/{indexName}")
    public ResponseEntity<NseIndicesTick> getLatestTickData(@PathVariable String indexName) {
        try {
            NseIndicesTick latestTick = nseIndicesTickService.getLatestTickData(indexName);
            if (latestTick != null) {
                return ResponseEntity.ok(latestTick);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving latest tick data for index {}: {}", indexName, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get tick data for a specific index within a time range
     */
    @GetMapping("/{indexName}/range")
    public ResponseEntity<List<NseIndicesTick>> getTickDataByIndexAndTimeRange(
            @PathVariable String indexName,
            @RequestParam Instant startTime,
            @RequestParam Instant endTime) {
        try {
            List<NseIndicesTick> tickData = nseIndicesTickService
                .getTickDataByIndexAndTimeRange(indexName, startTime, endTime);
            return ResponseEntity.ok(tickData);
        } catch (Exception e) {
            log.error("Error retrieving tick data for index {} in time range {} to {}: {}", 
                     indexName, startTime, endTime, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get total count of tick data records
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalTickDataCount() {
        try {
            long count = nseIndicesTickService.getTotalTickDataCount();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("Error retrieving total tick data count: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Clean up old tick data
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<String> cleanupOldTickData(@RequestParam(defaultValue = "90") int daysToKeep) {
        try {
            Instant cutoffTime = Instant.now().minusSeconds(daysToKeep * 24 * 60 * 60L);
            nseIndicesTickService.cleanupOldTickData(cutoffTime);
            return ResponseEntity.ok("Cleanup completed successfully. Removed data older than " + daysToKeep + " days.");
        } catch (Exception e) {
            log.error("Error during cleanup of old tick data: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Cleanup failed: " + e.getMessage());
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("NSE Indices Tick Service is running");
    }
}

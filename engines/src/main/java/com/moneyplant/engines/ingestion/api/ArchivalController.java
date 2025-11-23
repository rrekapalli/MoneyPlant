package com.moneyplant.engines.ingestion.api;

import com.moneyplant.engines.ingestion.model.ArchivalMetadata;
import com.moneyplant.engines.ingestion.model.ArchivalResult;
import com.moneyplant.engines.ingestion.service.EndOfDayArchivalService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for end-of-day archival operations.
 * Provides endpoints to trigger, monitor, and query archival processes.
 * 
 * Requirements: 11.2
 */
@RestController
@RequestMapping("/api/v1/archival")
@Slf4j
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "hudi.enabled",
    havingValue = "true",
    matchIfMissing = false
)
public class ArchivalController {
    
    private final EndOfDayArchivalService archivalService;
    
    @Autowired
    public ArchivalController(EndOfDayArchivalService archivalService) {
        this.archivalService = archivalService;
    }
    
    /**
     * Trigger manual archival for a specific date.
     * 
     * POST /api/v1/archival/trigger?date=2024-01-15
     * 
     * @param date the date to archive (format: yyyy-MM-dd)
     * @return archival result
     */
    @PostMapping("/trigger")
    public Mono<ResponseEntity<ArchivalResult>> triggerArchival(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Manual archival triggered for date: {}", date);
        
        return archivalService.archiveTickData(date)
            .map(result -> {
                if (result.isSuccess()) {
                    return ResponseEntity.ok(result);
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
                }
            })
            .onErrorResume(error -> {
                log.error("Error during manual archival for date: {}", date, error);
                ArchivalResult errorResult = ArchivalResult.builder()
                    .date(date)
                    .success(false)
                    .errorMessage(error.getMessage())
                    .build();
                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult));
            });
    }
    
    /**
     * Retry failed archival for a specific date.
     * 
     * POST /api/v1/archival/retry?date=2024-01-15
     * 
     * @param date the date to retry
     * @return archival result
     */
    @PostMapping("/retry")
    public Mono<ResponseEntity<ArchivalResult>> retryArchival(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Retry archival triggered for date: {}", date);
        
        return archivalService.retryFailedArchival(date)
            .map(result -> {
                if (result.isSuccess()) {
                    return ResponseEntity.ok(result);
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
                }
            })
            .onErrorResume(error -> {
                log.error("Error during retry archival for date: {}", date, error);
                ArchivalResult errorResult = ArchivalResult.builder()
                    .date(date)
                    .success(false)
                    .errorMessage(error.getMessage())
                    .build();
                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResult));
            });
    }
    
    /**
     * Get archival metadata for a specific date.
     * 
     * GET /api/v1/archival/metadata?date=2024-01-15
     * 
     * @param date the date to query
     * @return archival metadata
     */
    @GetMapping("/metadata")
    public ResponseEntity<ArchivalMetadata> getArchivalMetadata(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.debug("Fetching archival metadata for date: {}", date);
        
        ArchivalMetadata metadata = archivalService.getArchivalMetadata(date);
        
        if (metadata != null) {
            return ResponseEntity.ok(metadata);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get archival history for a date range.
     * 
     * GET /api/v1/archival/history?startDate=2024-01-01&endDate=2024-01-31
     * 
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return list of archival metadata
     */
    @GetMapping("/history")
    public ResponseEntity<List<ArchivalMetadata>> getArchivalHistory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        log.debug("Fetching archival history from {} to {}", startDate, endDate);
        
        List<ArchivalMetadata> history = archivalService.getArchivalHistory(startDate, endDate);
        return ResponseEntity.ok(history);
    }
    
    /**
     * Get all failed archival records.
     * 
     * GET /api/v1/archival/failed
     * 
     * @return list of failed archival metadata
     */
    @GetMapping("/failed")
    public ResponseEntity<List<ArchivalMetadata>> getFailedArchivals() {
        log.debug("Fetching all failed archival records");
        
        List<ArchivalMetadata> failedArchivals = archivalService.getFailedArchivals();
        return ResponseEntity.ok(failedArchivals);
    }
    
    /**
     * Health check endpoint for archival service.
     * 
     * GET /api/v1/archival/health
     * 
     * @return health status
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Archival service is running");
    }
}

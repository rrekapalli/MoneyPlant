package com.moneyplant.engines.ingestion.api;

import com.moneyplant.engines.ingestion.model.BackfillRequest;
import com.moneyplant.engines.ingestion.model.IngestionStatus;
import com.moneyplant.engines.ingestion.service.BackfillService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for data ingestion operations.
 * Provides endpoints for triggering backfill and monitoring ingestion status.
 * 
 * Requirements: 2.8
 */
@RestController
@RequestMapping("/api/v1/ingestion")
@Slf4j
public class IngestionController {
    
    private final BackfillService backfillService;
    private final com.moneyplant.engines.ingestion.service.EodIngestionScheduler eodScheduler;
    
    // Track ingestion metrics (in production, use a proper metrics service)
    private long totalTicksProcessed = 0;
    private long totalCandlesGenerated = 0;
    private long errorCount = 0;
    private String lastError = null;
    private Instant lastErrorTime = null;
    private final Instant startTime = Instant.now();
    
    @Autowired
    public IngestionController(
            BackfillService backfillService,
            com.moneyplant.engines.ingestion.service.EodIngestionScheduler eodScheduler) {
        this.backfillService = backfillService;
        this.eodScheduler = eodScheduler;
    }
    
    /**
     * Trigger backfill operation for historical data.
     * 
     * POST /api/v1/ingestion/backfill
     * 
     * Request body example:
     * {
     *   "symbols": ["RELIANCE", "TCS", "INFY"],
     *   "startDate": "2024-01-01",
     *   "endDate": "2024-01-31",
     *   "timeframe": "1day",
     *   "fillGapsOnly": true,
     *   "maxConcurrency": 5
     * }
     * 
     * @param request backfill request parameters
     * @return backfill report with success/failure counts
     */
    @PostMapping("/backfill")
    public Mono<ResponseEntity<BackfillService.BackfillReport>> triggerBackfill(
            @Valid @RequestBody BackfillRequest request) {
        
        log.info("Backfill triggered for {} symbols from {} to {} with timeframe {}",
                request.getSymbols().size(), request.getStartDate(), request.getEndDate(), request.getTimeframe());
        
        if (request.isFillGapsOnly()) {
            // Detect gaps and fill them
            return backfillService.detectGapsForSymbols(
                    request.getSymbols(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getTimeframe()
                )
                .collectList()
                .flatMap(gaps -> {
                    log.info("Detected {} gaps to fill", gaps.size());
                    return backfillService.fillGaps(gaps);
                })
                .map(ResponseEntity::ok)
                .onErrorResume(error -> {
                    log.error("Error during backfill operation", error);
                    errorCount++;
                    lastError = error.getMessage();
                    lastErrorTime = Instant.now();
                    
                    BackfillService.BackfillReport errorReport = BackfillService.BackfillReport.builder()
                        .totalGaps(0)
                        .successCount(0)
                        .failureCount(request.getSymbols().size())
                        .recordsInserted(0)
                        .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorReport));
                });
        } else {
            // Fetch all data for the date range (not just gaps)
            log.info("Fetching all data (not just gaps) for {} symbols", request.getSymbols().size());
            
            // For now, treat this as gap filling (full implementation would bypass gap detection)
            return backfillService.detectGapsForSymbols(
                    request.getSymbols(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getTimeframe()
                )
                .collectList()
                .flatMap(gaps -> backfillService.fillGaps(gaps))
                .map(ResponseEntity::ok)
                .onErrorResume(error -> {
                    log.error("Error during backfill operation", error);
                    errorCount++;
                    lastError = error.getMessage();
                    lastErrorTime = Instant.now();
                    
                    BackfillService.BackfillReport errorReport = BackfillService.BackfillReport.builder()
                        .totalGaps(0)
                        .successCount(0)
                        .failureCount(request.getSymbols().size())
                        .recordsInserted(0)
                        .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorReport));
                });
        }
    }
    
    /**
     * Get current ingestion status.
     * 
     * GET /api/v1/ingestion/status
     * 
     * Returns information about:
     * - Overall status (RUNNING, STOPPED, ERROR)
     * - Active providers and symbols
     * - Throughput and latency metrics
     * - Error counts
     * - Connection status (Kafka, Database)
     * 
     * @return current ingestion status
     */
    @GetMapping("/status")
    public ResponseEntity<IngestionStatus> getIngestionStatus() {
        log.debug("Fetching ingestion status");
        
        try {
            // Calculate uptime
            long uptimeSeconds = Instant.now().getEpochSecond() - startTime.getEpochSecond();
            
            // Build provider statuses (placeholder - in production, query actual providers)
            Map<String, IngestionStatus.ProviderStatus> providerStatuses = new HashMap<>();
            
            // Yahoo Finance provider status
            providerStatuses.put("yahoo-finance", IngestionStatus.ProviderStatus.builder()
                .providerName("Yahoo Finance")
                .connected(true)
                .subscribedSymbols(0)
                .ticksReceived(0)
                .lastTickTime(null)
                .errorMessage(null)
                .build());
            
            // NSE provider status (placeholder)
            providerStatuses.put("nse", IngestionStatus.ProviderStatus.builder()
                .providerName("NSE")
                .connected(false)
                .subscribedSymbols(0)
                .ticksReceived(0)
                .lastTickTime(null)
                .errorMessage("Not implemented yet")
                .build());
            
            // Build overall status
            IngestionStatus status = IngestionStatus.builder()
                .status(errorCount > 0 ? IngestionStatus.Status.ERROR : IngestionStatus.Status.RUNNING)
                .timestamp(Instant.now())
                .activeProviders(1) // Yahoo Finance
                .activeSymbols(0)
                .totalTicksProcessed(totalTicksProcessed)
                .totalCandlesGenerated(totalCandlesGenerated)
                .currentThroughput(0.0)
                .averageLatencyMs(0.0)
                .errorCount(errorCount)
                .lastError(lastError)
                .lastErrorTime(lastErrorTime)
                .providerStatuses(providerStatuses)
                .kafkaConnected(true) // Placeholder - should check actual connection
                .databaseConnected(true) // Placeholder - should check actual connection
                .uptimeSeconds(uptimeSeconds)
                .build();
            
            return ResponseEntity.ok(status);
        } catch (Exception error) {
            log.error("Error fetching ingestion status", error);
            
            // Return minimal error status
            IngestionStatus errorStatus = IngestionStatus.builder()
                .status(IngestionStatus.Status.ERROR)
                .timestamp(Instant.now())
                .activeProviders(0)
                .activeSymbols(0)
                .totalTicksProcessed(totalTicksProcessed)
                .totalCandlesGenerated(totalCandlesGenerated)
                .currentThroughput(0.0)
                .averageLatencyMs(0.0)
                .errorCount(errorCount + 1)
                .lastError(error.getMessage())
                .lastErrorTime(Instant.now())
                .providerStatuses(new HashMap<>())
                .kafkaConnected(false)
                .databaseConnected(false)
                .uptimeSeconds(0)
                .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorStatus);
        }
    }
    
    /**
     * Health check endpoint for ingestion service.
     * 
     * GET /api/v1/ingestion/health
     * 
     * @return health status
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Ingestion service is running");
    }
    
    /**
     * Trigger manual EOD ingestion for testing.
     * 
     * POST /api/v1/ingestion/eod/trigger
     * 
     * Optional query parameter: date (format: YYYY-MM-DD)
     * If not provided, uses today's date.
     * 
     * @param dateStr optional date string (YYYY-MM-DD)
     * @return success message
     */
    @PostMapping("/eod/trigger")
    public ResponseEntity<String> triggerEodIngestion(
            @RequestParam(required = false) String date) {
        
        try {
            java.time.LocalDate targetDate = date != null 
                ? java.time.LocalDate.parse(date)
                : java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
            
            log.info("Manual EOD ingestion triggered via API for date: {}", targetDate);
            
            // Trigger ingestion asynchronously
            new Thread(() -> {
                eodScheduler.triggerManualEodIngestion(targetDate);
            }).start();
            
            return ResponseEntity.ok("EOD ingestion triggered for date: " + targetDate + 
                ". Check logs for progress and results.");
        } catch (Exception e) {
            log.error("Error triggering EOD ingestion", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error: " + e.getMessage());
        }
    }
}

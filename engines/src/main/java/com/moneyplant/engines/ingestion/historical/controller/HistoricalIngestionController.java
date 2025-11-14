package com.moneyplant.engines.ingestion.historical.controller;

import com.moneyplant.engines.ingestion.historical.provider.NseBhavCopyDownloader;

import com.moneyplant.engines.ingestion.historical.model.dto.IngestionJobResponse;
import com.moneyplant.engines.ingestion.historical.model.dto.IngestionRequest;
import com.moneyplant.engines.ingestion.historical.service.HistoricalDataJobService;
import com.moneyplant.engines.ingestion.historical.service.NseBhavCopyIngestionService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * REST controller for NSE historical data ingestion operations.
 * 
 * Provides endpoints for:
 * - Triggering historical data ingestion
 * - Querying job status and progress
 * 
 * The controller uses reactive programming with Project Reactor for non-blocking operations.
 * 
 * Requirements: 4.1, 4.2, 4.5, 4.6, 4.7, 4.8, 5.7
 */
@RestController
@RequestMapping("/api/v1/ingestion/historical/nse")
@Slf4j
public class HistoricalIngestionController {
    
    private final NseBhavCopyIngestionService ingestionService;
    private final HistoricalDataJobService jobService;
    private final NseBhavCopyDownloader downloader;
    private final com.moneyplant.engines.ingestion.historical.service.SimpleHistoricalIngestionService simpleIngestionService;
    
    @Autowired
    public HistoricalIngestionController(
            NseBhavCopyIngestionService ingestionService,
            HistoricalDataJobService jobService,
            NseBhavCopyDownloader downloader,
            com.moneyplant.engines.ingestion.historical.service.SimpleHistoricalIngestionService simpleIngestionService) {
        this.ingestionService = ingestionService;
        this.jobService = jobService;
        this.downloader = downloader;
        this.simpleIngestionService = simpleIngestionService;
    }
    
    /**
     * Triggers NSE historical data ingestion.
     * 
     * POST /api/v1/ingestion/historical/nse
     * 
     * Request body (all fields optional):
     * {
     *   "startDate": "2024-01-01",  // Optional - if not provided, uses incremental ingestion
     *   "endDate": "2024-01-31"     // Optional - if not provided, uses current date
     * }
     * 
     * Response:
     * {
     *   "jobId": "550e8400-e29b-41d4-a716-446655440000",
     *   "message": "Ingestion job started successfully",
     *   "status": "PENDING"
     * }
     * 
     * The ingestion runs asynchronously. Use the returned jobId to query status.
     * 
     * Requirements: 4.1, 4.2, 4.5
     * 
     * @param request ingestion request with optional date range
     * @return Mono containing the job response with job ID
     */
    @PostMapping
    public Mono<ResponseEntity<IngestionJobResponse>> startIngestion(
            @Valid @RequestBody(required = false) IngestionRequest request) {
        
        // Handle null request body (all parameters optional)
        if (request == null) {
            request = new IngestionRequest();
        }
        
        log.info("Received ingestion request - startDate: {}, endDate: {}", 
                request.getStartDate(), request.getEndDate());
        
        return ingestionService.startIngestion(request.getStartDate(), request.getEndDate())
                .map(jobId -> {
                    log.info("Ingestion job created successfully - jobId: {}", jobId);
                    
                    IngestionJobResponse response = IngestionJobResponse.created(
                            jobId, 
                            "Ingestion job started successfully. Use the jobId to query status.");
                    
                    return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
                })
                .onErrorResume(IllegalArgumentException.class, error -> {
                    // Handle case where data is already up to date
                    log.info("Ingestion not needed: {}", error.getMessage());
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .message(error.getMessage())
                            .build();
                    
                    return Mono.just(ResponseEntity.ok(response));
                })
                .onErrorResume(error -> {
                    log.error("Error starting ingestion", error);
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .message("Failed to start ingestion: " + error.getMessage())
                            .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response));
                });
    }
    
    /**
     * Queries the status of an ingestion job.
     * 
     * GET /api/v1/ingestion/historical/nse/{jobId}
     * 
     * Response:
     * {
     *   "jobId": "550e8400-e29b-41d4-a716-446655440000",
     *   "status": "RUNNING",
     *   "progressPercentage": 45,
     *   "startDate": "2024-01-01",
     *   "endDate": "2024-01-31",
     *   "currentDate": "2024-01-15",
     *   "totalDates": 20,
     *   "processedDates": 9,
     *   "totalRecords": 450000,
     *   "insertedRecords": 448500,
     *   "failedRecords": 1500,
     *   "startedAt": "2024-01-01T10:00:00Z",
     *   "estimatedSecondsRemaining": 1200
     * }
     * 
     * Requirements: 4.6, 4.7, 4.8, 5.7
     * 
     * @param jobId unique job identifier
     * @return Mono containing the job status response
     */
    @GetMapping("/{jobId}")
    public Mono<ResponseEntity<IngestionJobResponse>> getJobStatus(@PathVariable String jobId) {
        
        log.debug("Querying status for job: {}", jobId);
        
        return jobService.getJob(jobId)
                .flatMap(job -> {
                    // If job is running, include estimated time remaining
                    if (job.isRunning()) {
                        return jobService.estimateTimeRemaining(jobId)
                                .map(duration -> {
                                    long secondsRemaining = duration.getSeconds();
                                    IngestionJobResponse response = IngestionJobResponse.fromJobWithEstimate(
                                            job, secondsRemaining);
                                    
                                    // Calculate current date being processed
                                    if (job.getProcessedDates() != null && job.getProcessedDates() > 0) {
                                        response.setCurrentDate(
                                                job.getStartDate().plusDays(job.getProcessedDates()));
                                    }
                                    
                                    return ResponseEntity.ok(response);
                                })
                                .onErrorResume(error -> {
                                    // If estimate fails, return response without it
                                    log.warn("Failed to estimate time remaining for job {}: {}", 
                                            jobId, error.getMessage());
                                    return Mono.just(ResponseEntity.ok(IngestionJobResponse.fromJob(job)));
                                });
                    } else {
                        // Job is not running, return basic response
                        return Mono.just(ResponseEntity.ok(IngestionJobResponse.fromJob(job)));
                    }
                })
                .switchIfEmpty(Mono.defer(() -> {
                    log.warn("Job not found: {}", jobId);
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .jobId(jobId)
                            .message("Job not found")
                            .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(response));
                }))
                .onErrorResume(error -> {
                    log.error("Error querying job status for {}", jobId, error);
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .jobId(jobId)
                            .message("Error querying job status: " + error.getMessage())
                            .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response));
                });
    }
    
    /**
     * Resumes a failed or timed-out ingestion job.
     * 
     * POST /api/v1/ingestion/historical/nse/{jobId}/resume
     * 
     * Response:
     * {
     *   "jobId": "550e8400-e29b-41d4-a716-446655440000",
     *   "message": "Ingestion job resumed successfully",
     *   "status": "RUNNING"
     * }
     * 
     * The job will continue from the last successfully processed date.
     * 
     * Requirements: 6.8
     * 
     * @param jobId unique job identifier to resume
     * @return Mono containing the job response
     */
    @PostMapping("/{jobId}/resume")
    public Mono<ResponseEntity<IngestionJobResponse>> resumeIngestion(@PathVariable String jobId) {
        
        log.info("Received resume request for job: {}", jobId);
        
        return ingestionService.resumeIngestion(jobId)
                .map(resumedJobId -> {
                    log.info("Ingestion job resumed successfully - jobId: {}", resumedJobId);
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .jobId(resumedJobId)
                            .message("Ingestion job resumed successfully. Use the jobId to query status.")
                            .build();
                    
                    return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
                })
                .onErrorResume(IllegalArgumentException.class, error -> {
                    log.warn("Job not found: {}", error.getMessage());
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .jobId(jobId)
                            .message("Job not found: " + error.getMessage())
                            .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(response));
                })
                .onErrorResume(IllegalStateException.class, error -> {
                    log.warn("Cannot resume job: {}", error.getMessage());
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .jobId(jobId)
                            .message("Cannot resume job: " + error.getMessage())
                            .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response));
                })
                .onErrorResume(error -> {
                    log.error("Error resuming ingestion for job {}", jobId, error);
                    
                    IngestionJobResponse response = IngestionJobResponse.builder()
                            .jobId(jobId)
                            .message("Failed to resume ingestion: " + error.getMessage())
                            .build();
                    
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response));
                });
    }
    
    /**
     * Health check endpoint for historical ingestion service.
     * 
     * GET /api/v1/ingestion/historical/nse/health
     * 
     * @return health status message
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Historical ingestion service is running");
    }
    
    /**
     * Simple ingestion endpoint - uses direct JDBC instead of Spark.
     * 
     * POST /api/v1/ingestion/historical/nse/simple
     * 
     * @param request ingestion request with optional start/end dates
     * @return job ID
     */
    @PostMapping("/simple")
    public ResponseEntity<IngestionJobResponse> startSimpleIngestion(@RequestBody @Valid IngestionRequest request) {
        log.info("Simple ingestion request received: startDate={}, endDate={}", 
                request.getStartDate(), request.getEndDate());
        
        try {
            String jobId = simpleIngestionService.startSimpleIngestion(
                    request.getStartDate(),
                    request.getEndDate());
            
            if (jobId == null) {
                return ResponseEntity.ok(IngestionJobResponse.builder()
                        .message("No ingestion needed - data is up to date")
                        .build());
            }
            
            IngestionJobResponse response = IngestionJobResponse.builder()
                    .jobId(jobId)
                    .message("Simple ingestion job started successfully. Use the jobId to query status.")
                    .status(com.moneyplant.engines.ingestion.historical.model.IngestionJobStatus.PENDING)
                    .build();
            
            log.info("Simple ingestion job created successfully - jobId: {}", jobId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Failed to start simple ingestion", e);
            
            IngestionJobResponse response = IngestionJobResponse.builder()
                    .message("Failed to start ingestion: " + e.getMessage())
                    .build();
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Test endpoint to verify URL building and download configuration.
     * 
     * GET /api/v1/ingestion/historical/nse/test/url?date=2024-01-08
     * 
     * @param date date to test (format: yyyy-MM-dd)
     * @return URL that would be used for download
     */
    @GetMapping("/test/url")
    public ResponseEntity<String> testUrl(@RequestParam String date) {
        try {
            java.time.LocalDate localDate = java.time.LocalDate.parse(date);
            downloader.testUrlBuilding(localDate);
            
            // Build the URL manually to return it
            int year = localDate.getYear();
            String month = localDate.format(java.time.format.DateTimeFormatter.ofPattern("MMM", java.util.Locale.ENGLISH)).toUpperCase();
            String dateStr = localDate.format(java.time.format.DateTimeFormatter.ofPattern("ddMMMyyyy", java.util.Locale.ENGLISH)).toUpperCase();
            String url = String.format("https://archives.nseindia.com/content/historical/EQUITIES/%d/%s/cm%sbhav.csv.zip", 
                    year, month, dateStr);
            
            return ResponseEntity.ok("URL for " + date + ": " + url);
        } catch (Exception e) {
            log.error("Error testing URL", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
}

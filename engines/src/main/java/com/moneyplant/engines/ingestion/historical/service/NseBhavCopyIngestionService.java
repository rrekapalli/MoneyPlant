package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.DateRange;
import com.moneyplant.engines.ingestion.historical.model.IngestionJob;
import com.moneyplant.engines.ingestion.historical.model.IngestionJobStatus;
import com.moneyplant.engines.ingestion.historical.model.IngestionResult;
import com.moneyplant.engines.ingestion.historical.provider.NseBhavCopyDownloader;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Service for orchestrating NSE Bhav Copy historical data ingestion.
 * 
 * This service coordinates the complete ingestion pipeline:
 * 1. Resolve date range using DateRangeResolver
 * 2. Create job record for tracking
 * 3. Download bhavcopy files to staging directory
 * 4. Trigger Spark processing for bulk insert
 * 5. Clean up staging directory
 * 6. Update job status and statistics
 * 
 * The service uses @Async for non-blocking execution and returns job ID immediately.
 * 
 * Requirements: 1.1, 1.2, 1.4, 1.5, 1.12, 2.2, 3.1, 3.8, 3.10, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.6
 */
@Service
@Slf4j
public class NseBhavCopyIngestionService {
    
    @Autowired
    private DateRangeResolver dateRangeResolver;
    
    @Autowired
    private NseBhavCopyDownloader downloader;
    
    @Autowired
    private SparkProcessingService sparkProcessor;
    
    @Autowired
    private HistoricalDataJobService jobService;
    
    @Value("${ingestion.providers.nse.historical.staging-directory:/tmp/bhav_staging}")
    private String stagingBaseDir;
    
    @Value("${ingestion.providers.nse.historical.job-timeout-hours:6}")
    private int jobTimeoutHours;
    
    /**
     * Starts the historical data ingestion process.
     * 
     * This method:
     * 1. Resolves the date range using DateRangeResolver
     * 2. Creates a job record with PENDING status
     * 3. Executes the ingestion asynchronously
     * 4. Returns the job ID immediately
     * 
     * Requirements: 3.1, 4.5, 5.1
     * 
     * @param startDate optional start date (null for automatic detection)
     * @param endDate optional end date (null for current date)
     * @return Mono containing the job ID
     */
    public Mono<String> startIngestion(LocalDate startDate, LocalDate endDate) {
        String jobId = UUID.randomUUID().toString();
        
        log.info("Starting NSE historical data ingestion - jobId: {}, startDate: {}, endDate: {}", 
                jobId, startDate, endDate);
        
        // 1. Resolve date range
        return dateRangeResolver.resolveDateRange(startDate, endDate)
                .flatMap(dateRange -> {
                    // Check if date range is empty (no work needed)
                    if (dateRange.isEmpty()) {
                        log.info("No ingestion needed - data is already up to date");
                        return Mono.error(new IllegalArgumentException(
                                "No ingestion needed - data is already up to date"));
                    }
                    
                    // Log ingestion start with date range and total days
                    long totalDays = dateRange.getDayCount();
                    log.info("Ingestion job {} - Date range: {} to {} ({} days)", 
                            jobId, dateRange.getStart(), dateRange.getEnd(), totalDays);
                    
                    // 2. Create job record
                    return jobService.createJob(jobId, dateRange)
                            .flatMap(job -> {
                                // 3. Execute asynchronously
                                executeIngestionAsync(job, dateRange);
                                
                                // 4. Return job ID immediately
                                log.info("Ingestion job {} started successfully - processing asynchronously", jobId);
                                return Mono.just(jobId);
                            });
                });
    }
    
    /**
     * Executes the ingestion pipeline asynchronously.
     * 
     * This method runs in a separate thread and handles:
     * - Downloading bhavcopy files to staging directory
     * - Triggering Spark processing for bulk insert
     * - Cleaning up staging directory
     * - Updating job progress and status
     * - Handling errors and timeouts
     * 
     * Requirements: 1.1, 1.2, 1.4, 1.5, 1.12, 2.2, 3.8, 3.10, 5.2, 5.3, 5.4, 5.5, 5.6, 6.6
     * 
     * @param job the ingestion job
     * @param dateRange the date range to process
     */
    @Async
    public void executeIngestionAsync(IngestionJob job, DateRange dateRange) {
        String jobId = job.getJobId();
        Path stagingDir = Paths.get(stagingBaseDir, jobId);
        Instant startTime = Instant.now();
        
        log.info("Starting async ingestion execution for job: {}", jobId);
        
        try {
            // Update status to RUNNING
            jobService.updateStatus(jobId, IngestionJobStatus.RUNNING)
                    .block();
            
            log.info("Job {} status updated to RUNNING", jobId);
            
            // Create CompletableFuture for timeout handling
            CompletableFuture<IngestionResult> ingestionFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return performIngestion(job, dateRange, stagingDir).block();
                } catch (Exception e) {
                    throw new RuntimeException("Ingestion failed", e);
                }
            });
            
            // Wait for completion with timeout
            IngestionResult result;
            try {
                result = ingestionFuture.get(jobTimeoutHours, TimeUnit.HOURS);
            } catch (TimeoutException e) {
                log.error("Job {} exceeded timeout of {} hours", jobId, jobTimeoutHours);
                ingestionFuture.cancel(true);
                
                // Mark job as TIMEOUT
                jobService.updateStatus(jobId, IngestionJobStatus.TIMEOUT)
                        .block();
                
                cleanupStagingDirectory(stagingDir);
                return;
            }
            
            // Calculate duration
            Instant endTime = Instant.now();
            Duration duration = Duration.between(startTime, endTime);
            
            // Update result with duration
            result = IngestionResult.builder()
                    .totalDatesProcessed(result.getTotalDatesProcessed())
                    .totalRecordsProcessed(result.getTotalRecordsProcessed())
                    .totalRecordsInserted(result.getTotalRecordsInserted())
                    .totalRecordsFailed(result.getTotalRecordsFailed())
                    .duration(duration)
                    .build();
            
            // Log summary on completion
            log.info("Job {} completed successfully - Total dates: {}, Total records: {}, " +
                    "Inserted: {}, Failed: {}, Duration: {}", 
                    jobId, result.getTotalDatesProcessed(), result.getTotalRecordsProcessed(),
                    result.getTotalRecordsInserted(), result.getTotalRecordsFailed(), duration);
            
            // Clean up staging directory
            cleanupStagingDirectory(stagingDir);
            
            // Mark job as completed
            jobService.completeJob(jobId, result)
                    .block();
            
            log.info("Job {} marked as COMPLETED", jobId);
            
        } catch (Exception e) {
            // Log errors with exception details
            log.error("Job {} failed with error: {}", jobId, e.getMessage(), e);
            
            // Clean up staging directory
            cleanupStagingDirectory(stagingDir);
            
            // Mark job as failed
            jobService.failJob(jobId, e.getMessage())
                    .block();
            
            log.error("Job {} marked as FAILED", jobId);
        }
    }
    
    /**
     * Performs the actual ingestion work.
     * 
     * This method:
     * 1. Downloads bhavcopy files to staging directory
     * 2. Triggers Spark processing for bulk insert
     * 3. Returns ingestion statistics
     * 
     * Requirements: 1.1, 1.2, 1.4, 1.5, 2.2, 5.3, 5.4
     * 
     * @param job the ingestion job
     * @param dateRange the date range to process
     * @param stagingDir the staging directory for CSV files
     * @return Mono containing ingestion result
     */
    private Mono<IngestionResult> performIngestion(
            IngestionJob job, 
            DateRange dateRange,
            Path stagingDir) {
        
        String jobId = job.getJobId();
        
        // Log progress for download phase
        log.info("Job {} - Downloading bhavcopy files from {} to {}", 
                jobId, dateRange.getStart(), dateRange.getEnd());
        
        // 1. Download bhavcopy files to staging directory
        return downloader.downloadToStaging(
                dateRange.getStart(), dateRange.getEnd(), stagingDir)
                .then(Mono.defer(() -> {
                    // Log progress for Spark processing phase
                    log.info("Job {} - Starting Spark processing for staging directory: {}", 
                            jobId, stagingDir);
                    
                    // 2. Process all CSV files using Spark and bulk insert
                    return sparkProcessor.processAndStore(stagingDir)
                            .doOnSuccess(result -> {
                                // Log Spark bulk insert statistics
                                log.info("Job {} - Spark processing completed - Records processed: {}, " +
                                        "Inserted: {}, Failed: {}", 
                                        jobId, result.getTotalRecordsProcessed(),
                                        result.getTotalRecordsInserted(), result.getTotalRecordsFailed());
                            });
                }));
    }
    
    /**
     * Cleans up the staging directory after processing.
     * 
     * Deletes all CSV files and the staging directory itself.
     * Handles cleanup errors gracefully without failing the job.
     * 
     * Requirements: 1.12
     * 
     * @param stagingDir the staging directory to clean up
     */
    private void cleanupStagingDirectory(Path stagingDir) {
        try {
            if (Files.exists(stagingDir)) {
                log.info("Cleaning up staging directory: {}", stagingDir);
                
                // Delete all files and subdirectories
                Files.walk(stagingDir)
                        .sorted(Comparator.reverseOrder())
                        .forEach(path -> {
                            try {
                                Files.delete(path);
                                log.debug("Deleted: {}", path);
                            } catch (IOException e) {
                                log.warn("Failed to delete: {}", path, e);
                            }
                        });
                
                log.info("Successfully cleaned up staging directory: {}", stagingDir);
            } else {
                log.debug("Staging directory does not exist, no cleanup needed: {}", stagingDir);
            }
        } catch (IOException e) {
            log.error("Failed to cleanup staging directory: {}", stagingDir, e);
            // Don't throw exception - cleanup failure should not fail the job
        }
    }
}

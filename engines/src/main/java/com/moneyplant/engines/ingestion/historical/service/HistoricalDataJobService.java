package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.DateRange;
import com.moneyplant.engines.ingestion.historical.model.IngestionJob;
import com.moneyplant.engines.ingestion.historical.model.IngestionJobStatus;
import com.moneyplant.engines.ingestion.historical.model.IngestionResult;
import reactor.core.publisher.Mono;

import java.time.Duration;

/**
 * Service interface for managing NSE historical data ingestion jobs.
 * 
 * Provides operations for:
 * - Creating and initializing jobs
 * - Updating job status and progress
 * - Completing or failing jobs
 * - Querying job status
 * - Calculating progress metrics
 * 
 * Requirements: 4.5, 4.6, 4.7, 4.8, 5.7
 */
public interface HistoricalDataJobService {
    
    /**
     * Creates a new ingestion job with the specified parameters.
     * Initializes the job record with PENDING status.
     * 
     * @param jobId unique job identifier (UUID)
     * @param dateRange date range for the ingestion
     * @return Mono containing the created job
     * 
     * Requirements: 4.5
     */
    Mono<IngestionJob> createJob(String jobId, DateRange dateRange);
    
    /**
     * Updates the status of an existing job.
     * 
     * @param jobId unique job identifier
     * @param status new status to set
     * @return Mono that completes when the update is done
     * 
     * Requirements: 4.6
     */
    Mono<Void> updateStatus(String jobId, IngestionJobStatus status);
    
    /**
     * Updates the progress of a job with new record counts.
     * Increments the processed dates counter and updates record statistics.
     * 
     * @param jobId unique job identifier
     * @param additionalRecords number of records processed in this batch
     * @param additionalInserted number of records successfully inserted in this batch
     * @return Mono that completes when the update is done
     * 
     * Requirements: 4.7
     */
    Mono<Void> updateProgress(String jobId, int additionalRecords, int additionalInserted);
    
    /**
     * Marks a job as completed with final statistics.
     * Sets status to COMPLETED and records completion timestamp.
     * 
     * @param jobId unique job identifier
     * @param result final ingestion result with statistics
     * @return Mono that completes when the update is done
     * 
     * Requirements: 4.8
     */
    Mono<Void> completeJob(String jobId, IngestionResult result);
    
    /**
     * Marks a job as failed with an error message.
     * Sets status to FAILED and records error details.
     * 
     * @param jobId unique job identifier
     * @param errorMessage description of the error
     * @return Mono that completes when the update is done
     * 
     * Requirements: 4.8
     */
    Mono<Void> failJob(String jobId, String errorMessage);
    
    /**
     * Retrieves a job by its unique identifier.
     * 
     * @param jobId unique job identifier
     * @return Mono containing the job if found, empty Mono otherwise
     * 
     * Requirements: 4.6
     */
    Mono<IngestionJob> getJob(String jobId);
    
    /**
     * Calculates the estimated time remaining for a job based on current progress.
     * Uses average processing time per date to estimate completion time.
     * 
     * @param jobId unique job identifier
     * @return Mono containing the estimated remaining duration
     * 
     * Requirements: 5.7
     */
    Mono<Duration> estimateTimeRemaining(String jobId);
    
    /**
     * Increments the processed dates counter for a job.
     * Called after successfully processing each date.
     * 
     * @param jobId unique job identifier
     * @return Mono that completes when the update is done
     * 
     * Requirements: 4.7
     */
    Mono<Void> incrementProcessedDates(String jobId);
}

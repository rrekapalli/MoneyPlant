package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.DateRange;
import com.moneyplant.engines.ingestion.historical.model.IngestionJob;
import com.moneyplant.engines.ingestion.historical.model.IngestionJobStatus;
import com.moneyplant.engines.ingestion.historical.model.IngestionResult;
import com.moneyplant.engines.ingestion.historical.repository.IngestionJobRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Implementation of HistoricalDataJobService for managing NSE historical data ingestion jobs.
 * 
 * This service handles:
 * - Job lifecycle management (create, update, complete, fail)
 * - Progress tracking and statistics
 * - Time estimation based on processing rates
 * 
 * All database operations are wrapped in reactive Mono types for non-blocking execution.
 * 
 * Requirements: 4.5, 4.6, 4.7, 4.8, 5.7
 */
@Service
@Slf4j
public class HistoricalDataJobServiceImpl implements HistoricalDataJobService {
    
    private static final String JOB_TYPE = "NSE_BHAV_COPY";
    
    @Autowired
    private IngestionJobRepository jobRepository;
    
    /**
     * Creates a new ingestion job with the specified parameters.
     * Initializes the job with PENDING status and calculates total dates to process.
     * 
     * @param jobId unique job identifier (UUID)
     * @param dateRange date range for the ingestion
     * @return Mono containing the created job
     * 
     * Requirements: 4.5
     */
    @Override
    @Transactional
    public Mono<IngestionJob> createJob(String jobId, DateRange dateRange) {
        return Mono.fromCallable(() -> {
            log.info("Creating ingestion job: jobId={}, dateRange={} to {}", 
                jobId, dateRange.getStart(), dateRange.getEnd());
            
            // Calculate total dates to process
            int totalDates = (int) ChronoUnit.DAYS.between(
                dateRange.getStart(), 
                dateRange.getEnd()
            ) + 1; // +1 to include end date
            
            IngestionJob job = IngestionJob.builder()
                .jobId(jobId)
                .jobType(JOB_TYPE)
                .status(IngestionJobStatus.PENDING)
                .startDate(dateRange.getStart())
                .endDate(dateRange.getEnd())
                .totalDates(totalDates)
                .processedDates(0)
                .totalRecords(0)
                .insertedRecords(0)
                .failedRecords(0)
                .startedAt(Instant.now())
                .build();
            
            IngestionJob savedJob = jobRepository.save(job);
            
            log.info("Created job: jobId={}, totalDates={}, status={}", 
                savedJob.getJobId(), savedJob.getTotalDates(), savedJob.getStatus());
            
            return savedJob;
        }).subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * Updates the status of an existing job.
     * 
     * @param jobId unique job identifier
     * @param status new status to set
     * @return Mono that completes when the update is done
     * 
     * Requirements: 4.6
     */
    @Override
    @Transactional
    public Mono<Void> updateStatus(String jobId, IngestionJobStatus status) {
        return Mono.fromRunnable(() -> {
            log.debug("Updating job status: jobId={}, newStatus={}", jobId, status);
            
            IngestionJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
            
            job.setStatus(status);
            jobRepository.save(job);
            
            log.info("Updated job status: jobId={}, status={}", jobId, status);
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }
    
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
    @Override
    @Transactional
    public Mono<Void> updateProgress(String jobId, int additionalRecords, int additionalInserted) {
        return Mono.fromRunnable(() -> {
            log.debug("Updating job progress: jobId={}, additionalRecords={}, additionalInserted={}", 
                jobId, additionalRecords, additionalInserted);
            
            IngestionJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
            
            // Update record counts
            job.updateProgress(additionalRecords, additionalInserted);
            jobRepository.save(job);
            
            log.debug("Updated job progress: jobId={}, totalRecords={}, insertedRecords={}, failedRecords={}, progress={}%", 
                jobId, job.getTotalRecords(), job.getInsertedRecords(), 
                job.getFailedRecords(), job.getProgressPercentage());
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }
    
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
    @Override
    @Transactional
    public Mono<Void> completeJob(String jobId, IngestionResult result) {
        return Mono.fromRunnable(() -> {
            log.info("Completing job: jobId={}", jobId);
            
            IngestionJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
            
            job.setStatus(IngestionJobStatus.COMPLETED);
            job.setCompletedAt(Instant.now());
            
            // Update final statistics from result
            job.setProcessedDates(result.getTotalDatesProcessed());
            job.setTotalRecords(result.getTotalRecordsProcessed());
            job.setInsertedRecords(result.getTotalRecordsInserted());
            job.setFailedRecords(result.getTotalRecordsFailed());
            
            jobRepository.save(job);
            
            Duration duration = Duration.between(job.getStartedAt(), job.getCompletedAt());
            
            log.info("Job completed: jobId={}, status={}, processedDates={}, totalRecords={}, " +
                    "insertedRecords={}, failedRecords={}, duration={}", 
                jobId, job.getStatus(), job.getProcessedDates(), job.getTotalRecords(),
                job.getInsertedRecords(), job.getFailedRecords(), duration);
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }
    
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
    @Override
    @Transactional
    public Mono<Void> failJob(String jobId, String errorMessage) {
        return Mono.fromRunnable(() -> {
            log.error("Failing job: jobId={}, error={}", jobId, errorMessage);
            
            IngestionJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
            
            job.setStatus(IngestionJobStatus.FAILED);
            job.setCompletedAt(Instant.now());
            job.setErrorMessage(errorMessage);
            
            jobRepository.save(job);
            
            log.error("Job failed: jobId={}, status={}, processedDates={}/{}, error={}", 
                jobId, job.getStatus(), job.getProcessedDates(), job.getTotalDates(), errorMessage);
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }
    
    /**
     * Retrieves a job by its unique identifier.
     * 
     * @param jobId unique job identifier
     * @return Mono containing the job if found, empty Mono otherwise
     * 
     * Requirements: 4.6
     */
    @Override
    public Mono<IngestionJob> getJob(String jobId) {
        return Mono.fromCallable(() -> {
            log.debug("Retrieving job: jobId={}", jobId);
            
            return jobRepository.findByJobId(jobId)
                .orElse(null);
        }).subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * Calculates the estimated time remaining for a job based on current progress.
     * Uses average processing time per date to estimate completion time.
     * 
     * Formula: 
     * - Average time per date = (current time - start time) / processed dates
     * - Remaining time = average time per date × remaining dates
     * 
     * @param jobId unique job identifier
     * @return Mono containing the estimated remaining duration
     * 
     * Requirements: 5.7
     */
    @Override
    public Mono<Duration> estimateTimeRemaining(String jobId) {
        return Mono.fromCallable(() -> {
            log.debug("Estimating time remaining for job: jobId={}", jobId);
            
            IngestionJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
            
            // If job is not running or no dates processed yet, cannot estimate
            if (!job.isRunning() || job.getProcessedDates() == 0) {
                log.debug("Cannot estimate time remaining: job not running or no dates processed yet");
                return Duration.ZERO;
            }
            
            // Calculate elapsed time
            Duration elapsed = Duration.between(job.getStartedAt(), Instant.now());
            
            // Calculate average time per date
            long averageMillisPerDate = elapsed.toMillis() / job.getProcessedDates();
            
            // Calculate remaining dates
            int remainingDates = job.getTotalDates() - job.getProcessedDates();
            
            // Calculate estimated remaining time
            Duration estimatedRemaining = Duration.ofMillis(averageMillisPerDate * remainingDates);
            
            log.debug("Time estimation: jobId={}, processedDates={}/{}, elapsed={}, " +
                    "avgPerDate={}ms, remainingDates={}, estimatedRemaining={}", 
                jobId, job.getProcessedDates(), job.getTotalDates(), elapsed,
                averageMillisPerDate, remainingDates, estimatedRemaining);
            
            return estimatedRemaining;
        }).subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * Increments the processed dates counter for a job.
     * Called after successfully processing each date.
     * 
     * @param jobId unique job identifier
     * @return Mono that completes when the update is done
     * 
     * Requirements: 4.7
     */
    @Override
    @Transactional
    public Mono<Void> incrementProcessedDates(String jobId) {
        return Mono.fromRunnable(() -> {
            log.debug("Incrementing processed dates for job: jobId={}", jobId);
            
            IngestionJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
            
            job.incrementProcessedDates();
            jobRepository.save(job);
            
            log.debug("Incremented processed dates: jobId={}, processedDates={}/{}, progress={}%", 
                jobId, job.getProcessedDates(), job.getTotalDates(), job.getProgressPercentage());
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }
    
    /**
     * Updates the last successfully processed date for a job.
     * This is used for resume functionality to track which dates have been completed.
     * 
     * @param jobId unique job identifier
     * @param date the date that was successfully processed
     * @return Mono that completes when the update is done
     * 
     * Requirements: 6.8
     */
    @Override
    @Transactional
    public Mono<Void> updateLastProcessedDate(String jobId, LocalDate date) {
        return Mono.fromRunnable(() -> {
            log.debug("Updating last processed date for job: jobId={}, date={}", jobId, date);
            
            IngestionJob job = jobRepository.findByJobId(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found: " + jobId));
            
            job.updateLastProcessedDate(date);
            jobRepository.save(job);
            
            log.info("Updated last processed date: jobId={}, lastProcessedDate={}", 
                jobId, job.getLastProcessedDate());
        }).subscribeOn(Schedulers.boundedElastic()).then();
    }
}

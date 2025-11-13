package com.moneyplant.engines.ingestion.historical.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.moneyplant.engines.ingestion.historical.model.IngestionJob;
import com.moneyplant.engines.ingestion.historical.model.IngestionJobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Response DTO for ingestion job information.
 * 
 * Contains job status, progress metrics, and statistics.
 * Used for both job creation response and status query response.
 * 
 * Requirements: 4.1, 4.2, 4.6, 4.7, 4.8, 5.7
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class IngestionJobResponse implements Serializable {
    
    /**
     * Unique job identifier (UUID)
     */
    private String jobId;
    
    /**
     * Human-readable message about the job
     */
    private String message;
    
    /**
     * Current status of the job
     */
    private IngestionJobStatus status;
    
    /**
     * Progress percentage (0-100)
     */
    private Integer progressPercentage;
    
    /**
     * Start date of the ingestion range
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;
    
    /**
     * End date of the ingestion range
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
    
    /**
     * Current date being processed (only present when job is running)
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate currentDate;
    
    /**
     * Total number of dates to process
     */
    private Integer totalDates;
    
    /**
     * Number of dates processed so far
     */
    private Integer processedDates;
    
    /**
     * Total number of records encountered
     */
    private Integer totalRecords;
    
    /**
     * Number of records successfully inserted
     */
    private Integer insertedRecords;
    
    /**
     * Number of records that failed to insert
     */
    private Integer failedRecords;
    
    /**
     * Error message if job failed
     */
    private String errorMessage;
    
    /**
     * Timestamp when the job was started
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private Instant startedAt;
    
    /**
     * Timestamp when the job completed
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'", timezone = "UTC")
    private Instant completedAt;
    
    /**
     * Estimated time remaining in seconds (only present when job is running)
     */
    private Long estimatedSecondsRemaining;
    
    /**
     * Creates a response for a newly created job
     * 
     * @param jobId the job identifier
     * @param message success message
     * @return response DTO
     */
    public static IngestionJobResponse created(String jobId, String message) {
        return IngestionJobResponse.builder()
                .jobId(jobId)
                .message(message)
                .status(IngestionJobStatus.PENDING)
                .build();
    }
    
    /**
     * Creates a response from an IngestionJob entity
     * 
     * @param job the ingestion job
     * @return response DTO
     */
    public static IngestionJobResponse fromJob(IngestionJob job) {
        return IngestionJobResponse.builder()
                .jobId(job.getJobId())
                .status(job.getStatus())
                .progressPercentage(job.getProgressPercentage())
                .startDate(job.getStartDate())
                .endDate(job.getEndDate())
                .totalDates(job.getTotalDates())
                .processedDates(job.getProcessedDates())
                .totalRecords(job.getTotalRecords())
                .insertedRecords(job.getInsertedRecords())
                .failedRecords(job.getFailedRecords())
                .errorMessage(job.getErrorMessage())
                .startedAt(job.getStartedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }
    
    /**
     * Creates a response from an IngestionJob entity with current date
     * 
     * @param job the ingestion job
     * @param currentDate the current date being processed
     * @return response DTO
     */
    public static IngestionJobResponse fromJobWithCurrentDate(IngestionJob job, LocalDate currentDate) {
        IngestionJobResponse response = fromJob(job);
        response.setCurrentDate(currentDate);
        return response;
    }
    
    /**
     * Creates a response from an IngestionJob entity with estimated time remaining
     * 
     * @param job the ingestion job
     * @param estimatedSecondsRemaining estimated seconds until completion
     * @return response DTO
     */
    public static IngestionJobResponse fromJobWithEstimate(IngestionJob job, Long estimatedSecondsRemaining) {
        IngestionJobResponse response = fromJob(job);
        response.setEstimatedSecondsRemaining(estimatedSecondsRemaining);
        return response;
    }
}

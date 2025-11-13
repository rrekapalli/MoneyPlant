package com.moneyplant.engines.ingestion.historical.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.io.Serializable;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Entity representing an NSE historical data ingestion job.
 * Maps to ingestion_jobs table in the database.
 * 
 * Tracks the progress and status of bhav copy ingestion jobs.
 * 
 * Requirements: 3.5, 3.7, 3.8
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ingestion_jobs")
public class IngestionJob implements Serializable {
    
    /**
     * Auto-generated primary key
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * Unique job identifier (UUID)
     */
    @NotBlank(message = "Job ID cannot be blank")
    @Column(name = "job_id", nullable = false, unique = true, length = 36)
    private String jobId;
    
    /**
     * Type of ingestion job (e.g., "NSE_BHAV_COPY")
     */
    @NotBlank(message = "Job type cannot be blank")
    @Column(name = "job_type", nullable = false, length = 50)
    private String jobType;
    
    /**
     * Current status of the job
     */
    @NotNull(message = "Status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IngestionJobStatus status;
    
    /**
     * Start date of the ingestion range
     */
    @NotNull(message = "Start date cannot be null")
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    /**
     * End date of the ingestion range
     */
    @NotNull(message = "End date cannot be null")
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    /**
     * Comma-separated list of symbols to ingest (null means all symbols)
     */
    @Column(columnDefinition = "TEXT")
    private String symbols;
    
    /**
     * Total number of dates to process
     */
    @PositiveOrZero(message = "Total dates must be non-negative")
    @Column(name = "total_dates")
    private Integer totalDates;
    
    /**
     * Number of dates processed so far
     */
    @PositiveOrZero(message = "Processed dates must be non-negative")
    @Column(name = "processed_dates")
    @Builder.Default
    private Integer processedDates = 0;
    
    /**
     * Total number of records encountered
     */
    @PositiveOrZero(message = "Total records must be non-negative")
    @Column(name = "total_records")
    @Builder.Default
    private Integer totalRecords = 0;
    
    /**
     * Number of records successfully inserted
     */
    @PositiveOrZero(message = "Inserted records must be non-negative")
    @Column(name = "inserted_records")
    @Builder.Default
    private Integer insertedRecords = 0;
    
    /**
     * Number of records that failed to insert
     */
    @PositiveOrZero(message = "Failed records must be non-negative")
    @Column(name = "failed_records")
    @Builder.Default
    private Integer failedRecords = 0;
    
    /**
     * Error message if job failed
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    /**
     * Timestamp when the job was started
     */
    @NotNull(message = "Started at cannot be null")
    @Column(name = "started_at", nullable = false)
    private Instant startedAt;
    
    /**
     * Timestamp when the job completed (success or failure)
     */
    @Column(name = "completed_at")
    private Instant completedAt;
    
    /**
     * Calculates the progress percentage of the job
     * 
     * @return progress percentage (0-100)
     */
    public int getProgressPercentage() {
        if (totalDates == null || totalDates == 0) {
            return 0;
        }
        return (int) ((processedDates * 100.0) / totalDates);
    }
    
    /**
     * Checks if the job is in a terminal state (completed, failed, or timeout)
     * 
     * @return true if job is finished
     */
    public boolean isFinished() {
        return status == IngestionJobStatus.COMPLETED
                || status == IngestionJobStatus.FAILED
                || status == IngestionJobStatus.TIMEOUT;
    }
    
    /**
     * Checks if the job is currently running
     * 
     * @return true if job is running
     */
    public boolean isRunning() {
        return status == IngestionJobStatus.RUNNING;
    }
    
    /**
     * Updates the job progress with new counts
     * 
     * @param additionalRecords number of records processed in this batch
     * @param additionalInserted number of records successfully inserted in this batch
     */
    public void updateProgress(int additionalRecords, int additionalInserted) {
        this.totalRecords += additionalRecords;
        this.insertedRecords += additionalInserted;
        this.failedRecords = this.totalRecords - this.insertedRecords;
    }
    
    /**
     * Increments the processed dates counter
     */
    public void incrementProcessedDates() {
        this.processedDates++;
    }
}

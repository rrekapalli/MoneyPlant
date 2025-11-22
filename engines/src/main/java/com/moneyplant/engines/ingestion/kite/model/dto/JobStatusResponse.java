package com.moneyplant.engines.ingestion.kite.model.dto;

import com.moneyplant.engines.ingestion.kite.model.enums.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for job status queries.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobStatusResponse {
    
    /**
     * Unique job identifier.
     */
    private String jobId;
    
    /**
     * Current status of the job.
     */
    private JobStatus status;
    
    /**
     * Job start timestamp.
     */
    private LocalDateTime startTime;
    
    /**
     * Job end timestamp (null if still running).
     */
    private LocalDateTime endTime;
    
    /**
     * Summary of ingestion results (null if not completed).
     */
    private IngestionSummary summary;
    
    /**
     * Error message if job failed (null if successful).
     */
    private String errorMessage;
}

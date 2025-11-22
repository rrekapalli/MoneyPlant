package com.moneyplant.engines.ingestion.kite.model.enums;

/**
 * Enum representing the status of an ingestion job.
 */
public enum JobStatus {
    /**
     * Job has been created but not yet started.
     */
    PENDING,
    
    /**
     * Job is currently running.
     */
    IN_PROGRESS,
    
    /**
     * Job completed successfully.
     */
    COMPLETED,
    
    /**
     * Job failed with an error.
     */
    FAILED,
    
    /**
     * Job was cancelled by user or system.
     */
    CANCELLED
}

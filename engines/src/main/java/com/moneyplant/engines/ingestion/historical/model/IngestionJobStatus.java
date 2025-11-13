package com.moneyplant.engines.ingestion.historical.model;

/**
 * Enum representing the status of an ingestion job.
 * 
 * Requirements: 3.5, 3.7, 3.8
 */
public enum IngestionJobStatus {
    /**
     * Job has been created but not yet started
     */
    PENDING,
    
    /**
     * Job is currently running
     */
    RUNNING,
    
    /**
     * Job completed successfully
     */
    COMPLETED,
    
    /**
     * Job failed due to an error
     */
    FAILED,
    
    /**
     * Job exceeded the configured timeout and was cancelled
     */
    TIMEOUT
}

package com.moneyplant.engines.ingestion.kite.service;

import com.moneyplant.engines.ingestion.kite.model.dto.IngestionSummary;
import com.moneyplant.engines.ingestion.kite.model.dto.JobStatusResponse;

public interface KiteJobTrackingService {
    
    JobStatusResponse startJob(String jobId, String jobType);
    
    void updateJobStatus(String jobId);
    
    void completeJob(String jobId, IngestionSummary summary);
    
    void failJob(String jobId, String errorMessage);
    
    JobStatusResponse getJobStatus(String jobId);
    
    int cleanupOldJobs(int olderThanHours);
}

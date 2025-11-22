package com.moneyplant.engines.ingestion.kite.service.impl;

import com.moneyplant.engines.ingestion.kite.model.dto.IngestionSummary;
import com.moneyplant.engines.ingestion.kite.model.dto.JobStatusResponse;
import com.moneyplant.engines.ingestion.kite.model.enums.JobStatus;
import com.moneyplant.engines.ingestion.kite.service.KiteJobTrackingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class KiteJobTrackingServiceImpl implements KiteJobTrackingService {
    
    private final ConcurrentHashMap<String, JobStatusResponse> jobs = new ConcurrentHashMap<>();
    
    @Override
    public JobStatusResponse startJob(String jobId, String jobType) {
        log.info("Starting job {} of type {}", jobId, jobType);
        
        JobStatusResponse jobStatus = JobStatusResponse.builder()
            .jobId(jobId)
            .status(JobStatus.PENDING)
            .startTime(LocalDateTime.now())
            .build();
        
        jobs.put(jobId, jobStatus);
        jobStatus.setStatus(JobStatus.IN_PROGRESS);
        
        log.debug("Job {} started and set to IN_PROGRESS", jobId);
        return jobStatus;
    }
    
    @Override
    public void updateJobStatus(String jobId) {
        JobStatusResponse job = jobs.get(jobId);
        if (job != null) {
            job.setStatus(JobStatus.IN_PROGRESS);
            log.debug("Updated job {} status to IN_PROGRESS", jobId);
        } else {
            log.warn("Attempted to update non-existent job: {}", jobId);
        }
    }
    
    @Override
    public void completeJob(String jobId, IngestionSummary summary) {
        JobStatusResponse job = jobs.get(jobId);
        if (job != null) {
            job.setStatus(JobStatus.COMPLETED);
            job.setEndTime(LocalDateTime.now());
            job.setSummary(summary);
            
            if (job.getStartTime() != null && summary != null) {
                Duration executionTime = Duration.between(job.getStartTime(), job.getEndTime());
                summary.setExecutionTime(executionTime);
            }
            
            log.info("Job {} completed successfully. Total records: {}, Success: {}, Failures: {}", 
                jobId, 
                summary != null ? summary.getTotalRecords() : 0,
                summary != null ? summary.getSuccessCount() : 0,
                summary != null ? summary.getFailureCount() : 0);
        } else {
            log.warn("Attempted to complete non-existent job: {}", jobId);
        }
    }
    
    @Override
    public void failJob(String jobId, String errorMessage) {
        JobStatusResponse job = jobs.get(jobId);
        if (job != null) {
            job.setStatus(JobStatus.FAILED);
            job.setEndTime(LocalDateTime.now());
            job.setErrorMessage(errorMessage);
            
            log.error("Job {} failed: {}", jobId, errorMessage);
        } else {
            log.warn("Attempted to fail non-existent job: {}", jobId);
        }
    }
    
    @Override
    public JobStatusResponse getJobStatus(String jobId) {
        JobStatusResponse job = jobs.get(jobId);
        if (job != null) {
            log.debug("Retrieved status for job {}: {}", jobId, job.getStatus());
            return job;
        } else {
            log.debug("Job not found: {}", jobId);
            return null;
        }
    }
    
    @Override
    public int cleanupOldJobs(int olderThanHours) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(olderThanHours);
        
        int removedCount = 0;
        for (String jobId : jobs.keySet()) {
            JobStatusResponse job = jobs.get(jobId);
            if (job != null && job.getEndTime() != null && job.getEndTime().isBefore(cutoffTime)) {
                jobs.remove(jobId);
                removedCount++;
            }
        }
        
        if (removedCount > 0) {
            log.info("Cleaned up {} old jobs older than {} hours", removedCount, olderThanHours);
        }
        
        return removedCount;
    }
    
    @Scheduled(fixedRate = 3600000)
    public void scheduledCleanup() {
        cleanupOldJobs(24);
    }
    
    public int getJobCount() {
        return jobs.size();
    }
    
    public long getJobCountByStatus(JobStatus status) {
        return jobs.values().stream()
            .filter(job -> job.getStatus() == status)
            .count();
    }
}

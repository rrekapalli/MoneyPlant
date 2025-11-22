package com.moneyplant.engines.ingestion.kite;

import com.moneyplant.engines.ingestion.kite.model.dto.IngestionSummary;
import com.moneyplant.engines.ingestion.kite.model.dto.JobStatusResponse;
import com.moneyplant.engines.ingestion.kite.model.enums.JobStatus;
import com.moneyplant.engines.ingestion.kite.service.KiteJobTrackingService;
import com.moneyplant.engines.ingestion.kite.service.impl.KiteJobTrackingServiceImpl;
import net.jqwik.api.*;
import org.junit.jupiter.api.Tag;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based test for async job tracking.
 * Feature: kite-ingestion, Property 20: Async job tracking
 * Validates: Requirements 14.3, 14.4, 14.5
 */
@Tag("property-test")
public class JobTrackingPropertyTest {

    /**
     * Property 20: Async job tracking
     */
    @Property(tries = 20)
    @Tag("property-test")
    void asyncJobTrackingLifecycle(@ForAll @StringLength(min = 5, max = 20) String jobType,
                                  @ForAll @IntRange(min = 1, max = 1000) int totalRecords,
                                  @ForAll @IntRange(min = 0, max = 100) int failureCount) {
        
        KiteJobTrackingService jobTracker = new KiteJobTrackingServiceImpl();
        String jobId = UUID.randomUUID().toString();
        
        JobStatusResponse startResponse = jobTracker.startJob(jobId, jobType);
        
        assertThat(startResponse).isNotNull();
        assertThat(startResponse.getJobId()).isEqualTo(jobId);
        assertThat(startResponse.getStatus()).isEqualTo(JobStatus.IN_PROGRESS);
        assertThat(startResponse.getStartTime()).isNotNull();
        
        JobStatusResponse queryResponse = jobTracker.getJobStatus(jobId);
        assertThat(queryResponse).isNotNull();
        assertThat(queryResponse.getJobId()).isEqualTo(jobId);
        assertThat(queryResponse.getStatus()).isEqualTo(JobStatus.IN_PROGRESS);
        
        int successCount = totalRecords - failureCount;
        IngestionSummary summary = IngestionSummary.builder()
            .totalRecords(totalRecords)
            .successCount(successCount)
            .failureCount(failureCount)
            .build();
        
        jobTracker.completeJob(jobId, summary);
        
        JobStatusResponse finalResponse = jobTracker.getJobStatus(jobId);
        assertThat(finalResponse).isNotNull();
        assertThat(finalResponse.getJobId()).isEqualTo(jobId);
        assertThat(finalResponse.getStatus()).isEqualTo(JobStatus.COMPLETED);
        assertThat(finalResponse.getEndTime()).isNotNull();
        assertThat(finalResponse.getSummary()).isNotNull();
        assertThat(finalResponse.getSummary().getTotalRecords()).isEqualTo(totalRecords);
        assertThat(finalResponse.getSummary().getSuccessCount()).isEqualTo(successCount);
        assertThat(finalResponse.getSummary().getFailureCount()).isEqualTo(failureCount);
        assertThat(finalResponse.getSummary().getExecutionTime()).isNotNull();
    }

    @Property(tries = 10)
    @Tag("property-test")
    void jobFailureHandling(@ForAll @StringLength(min = 5, max = 50) String errorMessage) {
        KiteJobTrackingService jobTracker = new KiteJobTrackingServiceImpl();
        String jobId = UUID.randomUUID().toString();
        
        jobTracker.startJob(jobId, "TEST_JOB");
        jobTracker.failJob(jobId, errorMessage);
        
        JobStatusResponse response = jobTracker.getJobStatus(jobId);
        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(JobStatus.FAILED);
        assertThat(response.getErrorMessage()).isEqualTo(errorMessage);
        assertThat(response.getEndTime()).isNotNull();
    }

    @Property(tries = 10)
    @Tag("property-test")
    void concurrentJobTracking(@ForAll @IntRange(min = 2, max = 10) int jobCount) {
        KiteJobTrackingService jobTracker = new KiteJobTrackingServiceImpl();
        
        String[] jobIds = new String[jobCount];
        for (int i = 0; i < jobCount; i++) {
            jobIds[i] = UUID.randomUUID().toString();
            jobTracker.startJob(jobIds[i], "CONCURRENT_JOB_" + i);
        }
        
        for (String jobId : jobIds) {
            JobStatusResponse response = jobTracker.getJobStatus(jobId);
            assertThat(response).isNotNull();
            assertThat(response.getJobId()).isEqualTo(jobId);
            assertThat(response.getStatus()).isEqualTo(JobStatus.IN_PROGRESS);
        }
        
        for (String jobId : jobIds) {
            IngestionSummary summary = IngestionSummary.builder()
                .totalRecords(100)
                .successCount(100)
                .failureCount(0)
                .build();
            jobTracker.completeJob(jobId, summary);
        }
        
        for (String jobId : jobIds) {
            JobStatusResponse response = jobTracker.getJobStatus(jobId);
            assertThat(response).isNotNull();
            assertThat(response.getStatus()).isEqualTo(JobStatus.COMPLETED);
        }
    }

    @Property(tries = 10)
    @Tag("property-test")
    void nonExistentJobQueries() {
        KiteJobTrackingService jobTracker = new KiteJobTrackingServiceImpl();
        String nonExistentJobId = UUID.randomUUID().toString();
        
        JobStatusResponse response = jobTracker.getJobStatus(nonExistentJobId);
        assertThat(response).isNull();
    }
}

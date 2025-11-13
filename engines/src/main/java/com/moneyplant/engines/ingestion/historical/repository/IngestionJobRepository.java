package com.moneyplant.engines.ingestion.historical.repository;

import com.moneyplant.engines.ingestion.historical.model.IngestionJob;
import com.moneyplant.engines.ingestion.historical.model.IngestionJobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for ingestion job operations.
 * Provides CRUD operations for tracking NSE historical data ingestion jobs.
 * 
 * Uses Spring Data JPA for automatic query generation and custom queries
 * for complex operations.
 * 
 * Requirements: 4.5, 4.6
 */
@Repository
public interface IngestionJobRepository extends JpaRepository<IngestionJob, Long> {
    
    /**
     * Find an ingestion job by its unique job ID (UUID).
     * 
     * @param jobId the unique job identifier
     * @return Optional containing the job if found
     * 
     * Requirements: 4.5, 4.6
     */
    Optional<IngestionJob> findByJobId(String jobId);
    
    /**
     * Find all jobs with a specific status.
     * Useful for monitoring and cleanup operations.
     * 
     * @param status the job status to filter by
     * @return list of jobs with the specified status
     */
    List<IngestionJob> findByStatus(IngestionJobStatus status);
    
    /**
     * Find all jobs of a specific type.
     * 
     * @param jobType the job type (e.g., "NSE_BHAV_COPY")
     * @return list of jobs with the specified type
     */
    List<IngestionJob> findByJobType(String jobType);
    
    /**
     * Find all jobs with a specific status and type.
     * 
     * @param status the job status to filter by
     * @param jobType the job type to filter by
     * @return list of matching jobs
     */
    List<IngestionJob> findByStatusAndJobType(IngestionJobStatus status, String jobType);
    
    /**
     * Find all running jobs (status = RUNNING).
     * Useful for monitoring active ingestion operations.
     * 
     * @return list of currently running jobs
     */
    @Query("SELECT j FROM IngestionJob j WHERE j.status = 'RUNNING'")
    List<IngestionJob> findRunningJobs();
    
    /**
     * Find all jobs that have been running longer than a specified duration.
     * Useful for detecting stuck or timed-out jobs.
     * 
     * @param threshold the time threshold (jobs started before this instant)
     * @return list of long-running jobs
     */
    @Query("SELECT j FROM IngestionJob j WHERE j.status = 'RUNNING' AND j.startedAt < :threshold")
    List<IngestionJob> findLongRunningJobs(@Param("threshold") Instant threshold);
    
    /**
     * Find all completed jobs within a date range.
     * Useful for reporting and analytics.
     * 
     * @param startTime start of the time range
     * @param endTime end of the time range
     * @return list of completed jobs in the specified range
     */
    @Query("SELECT j FROM IngestionJob j WHERE j.status = 'COMPLETED' " +
           "AND j.completedAt >= :startTime AND j.completedAt <= :endTime " +
           "ORDER BY j.completedAt DESC")
    List<IngestionJob> findCompletedJobsInRange(
        @Param("startTime") Instant startTime,
        @Param("endTime") Instant endTime
    );
    
    /**
     * Find the most recent job of a specific type.
     * Useful for checking the last ingestion status.
     * 
     * @param jobType the job type to query
     * @return Optional containing the most recent job if found
     */
    @Query("SELECT j FROM IngestionJob j WHERE j.jobType = :jobType " +
           "ORDER BY j.startedAt DESC LIMIT 1")
    Optional<IngestionJob> findMostRecentJobByType(@Param("jobType") String jobType);
    
    /**
     * Count jobs by status.
     * Useful for dashboard metrics.
     * 
     * @param status the job status to count
     * @return count of jobs with the specified status
     */
    long countByStatus(IngestionJobStatus status);
    
    /**
     * Delete jobs older than a specified date.
     * Useful for cleanup operations.
     * 
     * @param threshold jobs started before this instant will be deleted
     * @return number of jobs deleted
     */
    @Query("DELETE FROM IngestionJob j WHERE j.startedAt < :threshold")
    int deleteJobsOlderThan(@Param("threshold") Instant threshold);
}

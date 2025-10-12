package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerRun entity with custom queries.
 */
@Repository
public interface ScreenerRunRepository extends JpaRepository<ScreenerRun, Long> {

    /**
     * Finds runs by screener ID with pagination.
     */
    Page<ScreenerRun> findByScreenerScreenerIdOrderByStartedAtDesc(Long screenerId, Pageable pageable);

    /**
     * Finds runs by screener ID.
     */
    List<ScreenerRun> findByScreenerScreenerIdOrderByStartedAtDesc(Long screenerId);

    /**
     * Finds latest successful run by screener ID.
     */
    @Query("SELECT sr FROM ScreenerRun sr WHERE sr.screener.screenerId = :screenerId AND " +
           "sr.status = 'success' ORDER BY sr.runForTradingDay DESC, sr.startedAt DESC LIMIT 1")
    Optional<ScreenerRun> findLatestSuccessfulRun(@Param("screenerId") Long screenerId);

    /**
     * Finds runs by status.
     */
    List<ScreenerRun> findByStatusOrderByStartedAtDesc(String status);

    /**
     * Finds runs by screener ID and status.
     */
    List<ScreenerRun> findByScreenerScreenerIdAndStatusOrderByStartedAtDesc(Long screenerId, String status);

    /**
     * Finds runs by trading day.
     */
    List<ScreenerRun> findByRunForTradingDayOrderByStartedAtDesc(LocalDate tradingDay);

    /**
     * Finds run by ID and screener owner.
     */
    @Query("SELECT sr FROM ScreenerRun sr WHERE sr.screenerRunId = :runId AND " +
           "sr.screener.ownerUserId = :userId")
    Optional<ScreenerRun> findByIdAndScreenerOwner(@Param("runId") Long runId, 
                                                  @Param("userId") Long userId);

    /**
     * Finds run by ID (public or owned by user).
     */
    @Query("SELECT sr FROM ScreenerRun sr WHERE sr.screenerRunId = :runId AND " +
           "(sr.screener.ownerUserId = :userId OR sr.screener.isPublic = true)")
    Optional<ScreenerRun> findByIdAndOwnerOrPublic(@Param("runId") Long runId, 
                                                  @Param("userId") Long userId);

    /**
     * Counts runs by screener ID.
     */
    long countByScreenerScreenerId(Long screenerId);

    /**
     * Counts runs by status.
     */
    long countByStatus(String status);

    /**
     * Finds runs by user ID.
     */
    List<ScreenerRun> findByTriggeredByUserIdOrderByStartedAtDesc(Long userId);

    /**
     * Finds criteria-based runs by screener ID (runs with DSL JSON).
     */
    @Query(value = "SELECT sr FROM ScreenerRun sr WHERE sr.screener.screenerId = :screenerId AND " +
           "sr.screenerVersion.dslJson IS NOT NULL ORDER BY sr.startedAt DESC")
    List<ScreenerRun> findCriteriaRunsByScreenerId(@Param("screenerId") Long screenerId, 
                                                   Pageable pageable);
}

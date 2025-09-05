package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerSchedule entity with custom queries.
 */
@Repository
public interface ScreenerScheduleRepository extends JpaRepository<ScreenerSchedule, Long> {

    /**
     * Finds schedules by screener ID.
     */
    List<ScreenerSchedule> findByScreenerScreenerIdOrderByCreatedAtDesc(Long screenerId);

    /**
     * Finds enabled schedules by screener ID.
     */
    List<ScreenerSchedule> findByScreenerScreenerIdAndIsEnabledTrueOrderByCreatedAtDesc(Long screenerId);

    /**
     * Finds schedule by ID and screener owner.
     */
    @Query("SELECT ss FROM ScreenerSchedule ss WHERE ss.scheduleId = :scheduleId AND " +
           "ss.screener.ownerUserId = :userId")
    Optional<ScreenerSchedule> findByIdAndScreenerOwner(@Param("scheduleId") Long scheduleId, 
                                                       @Param("userId") Long userId);

    /**
     * Finds all enabled schedules.
     */
    List<ScreenerSchedule> findByIsEnabledTrueOrderByCreatedAtDesc();

    /**
     * Counts schedules by screener ID.
     */
    long countByScreenerScreenerId(Long screenerId);

    /**
     * Counts enabled schedules by screener ID.
     */
    long countByScreenerScreenerIdAndIsEnabledTrue(Long screenerId);
}

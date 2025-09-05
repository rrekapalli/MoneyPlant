package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerAlert entity with custom queries.
 */
@Repository
public interface ScreenerAlertRepository extends JpaRepository<ScreenerAlert, Long> {

    /**
     * Finds alerts by screener ID.
     */
    List<ScreenerAlert> findByScreenerScreenerIdOrderByCreatedAtDesc(Long screenerId);

    /**
     * Finds enabled alerts by screener ID.
     */
    List<ScreenerAlert> findByScreenerScreenerIdAndIsEnabledTrueOrderByCreatedAtDesc(Long screenerId);

    /**
     * Finds alert by ID and screener owner.
     */
    @Query("SELECT sa FROM ScreenerAlert sa WHERE sa.alertId = :alertId AND " +
           "sa.screener.ownerUserId = :userId")
    Optional<ScreenerAlert> findByIdAndScreenerOwner(@Param("alertId") Long alertId, 
                                                    @Param("userId") Long userId);

    /**
     * Finds all enabled alerts.
     */
    List<ScreenerAlert> findByIsEnabledTrueOrderByCreatedAtDesc();

    /**
     * Counts alerts by screener ID.
     */
    long countByScreenerScreenerId(Long screenerId);

    /**
     * Counts enabled alerts by screener ID.
     */
    long countByScreenerScreenerIdAndIsEnabledTrue(Long screenerId);
}

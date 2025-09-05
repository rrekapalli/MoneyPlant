package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerSavedView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerSavedView entity with custom queries.
 */
@Repository
public interface ScreenerSavedViewRepository extends JpaRepository<ScreenerSavedView, Long> {

    /**
     * Finds saved views by screener ID.
     */
    List<ScreenerSavedView> findByScreenerScreenerIdOrderByCreatedAtDesc(Long screenerId);

    /**
     * Finds saved views by user ID.
     */
    List<ScreenerSavedView> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Finds saved views by screener ID and user ID.
     */
    List<ScreenerSavedView> findByScreenerScreenerIdAndUserIdOrderByCreatedAtDesc(Long screenerId, Long userId);

    /**
     * Finds saved view by ID and user ID.
     */
    Optional<ScreenerSavedView> findBySavedViewIdAndUserId(Long savedViewId, Long userId);

    /**
     * Finds saved view by screener ID, user ID, and name.
     */
    Optional<ScreenerSavedView> findByScreenerScreenerIdAndUserIdAndName(Long screenerId, Long userId, String name);

    /**
     * Checks if saved view name exists for user and screener.
     */
    boolean existsByScreenerScreenerIdAndUserIdAndName(Long screenerId, Long userId, String name);

    /**
     * Counts saved views by screener ID.
     */
    long countByScreenerScreenerId(Long screenerId);

    /**
     * Counts saved views by user ID.
     */
    long countByUserId(Long userId);

    /**
     * Finds saved view by ID and screener owner.
     */
    @Query("SELECT ssv FROM ScreenerSavedView ssv WHERE ssv.savedViewId = :savedViewId AND " +
           "ssv.screener.ownerUserId = :userId")
    Optional<ScreenerSavedView> findByIdAndScreenerOwner(@Param("savedViewId") Long savedViewId, 
                                                        @Param("userId") Long userId);
}

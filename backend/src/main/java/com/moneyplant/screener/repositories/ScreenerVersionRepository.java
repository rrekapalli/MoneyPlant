package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerVersion entity with custom queries.
 */
@Repository
public interface ScreenerVersionRepository extends JpaRepository<ScreenerVersion, Long> {

    /**
     * Finds versions by screener ID.
     */
    List<ScreenerVersion> findByScreenerScreenerIdOrderByVersionNumberDesc(Long screenerId);

    /**
     * Finds version by screener ID and version number.
     */
    Optional<ScreenerVersion> findByScreenerScreenerIdAndVersionNumber(Long screenerId, Integer versionNumber);

    /**
     * Finds latest version by screener ID.
     */
    @Query("SELECT sv FROM ScreenerVersion sv WHERE sv.screener.screenerId = :screenerId " +
           "ORDER BY sv.versionNumber DESC LIMIT 1")
    Optional<ScreenerVersion> findLatestByScreenerId(@Param("screenerId") Long screenerId);

    /**
     * Finds active versions by screener ID.
     */
    List<ScreenerVersion> findByScreenerScreenerIdAndStatusOrderByVersionNumberDesc(Long screenerId, String status);

    /**
     * Checks if version number exists for screener.
     */
    boolean existsByScreenerScreenerIdAndVersionNumber(Long screenerId, Integer versionNumber);

    /**
     * Finds version by ID and screener owner.
     */
    @Query("SELECT sv FROM ScreenerVersion sv WHERE sv.screenerVersionId = :versionId AND " +
           "sv.screener.ownerUserId = :userId")
    Optional<ScreenerVersion> findByIdAndScreenerOwner(@Param("versionId") Long versionId, 
                                                      @Param("userId") Long userId);

    /**
     * Finds version by ID (public or owned by user).
     */
    @Query("SELECT sv FROM ScreenerVersion sv WHERE sv.screenerVersionId = :versionId AND " +
           "(sv.screener.ownerUserId = :userId OR sv.screener.isPublic = true)")
    Optional<ScreenerVersion> findByIdAndOwnerOrPublic(@Param("versionId") Long versionId, 
                                                      @Param("userId") Long userId);

    /**
     * Gets next version number for screener.
     */
    @Query("SELECT COALESCE(MAX(sv.versionNumber), 0) + 1 FROM ScreenerVersion sv " +
           "WHERE sv.screener.screenerId = :screenerId")
    Integer getNextVersionNumber(@Param("screenerId") Long screenerId);
}

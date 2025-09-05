package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerParamset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerParamset entity with custom queries.
 */
@Repository
public interface ScreenerParamsetRepository extends JpaRepository<ScreenerParamset, Long> {

    /**
     * Finds paramsets by screener version ID.
     */
    List<ScreenerParamset> findByScreenerVersionScreenerVersionIdOrderByCreatedAtDesc(Long screenerVersionId);

    /**
     * Finds paramset by version ID and name.
     */
    Optional<ScreenerParamset> findByScreenerVersionScreenerVersionIdAndName(Long screenerVersionId, String name);

    /**
     * Finds paramset by ID and version owner.
     */
    @Query("SELECT sp FROM ScreenerParamset sp WHERE sp.paramsetId = :paramsetId AND " +
           "sp.screenerVersion.screener.ownerUserId = :userId")
    Optional<ScreenerParamset> findByIdAndVersionOwner(@Param("paramsetId") Long paramsetId, 
                                                      @Param("userId") Long userId);

    /**
     * Finds paramset by ID (public or owned by user).
     */
    @Query("SELECT sp FROM ScreenerParamset sp WHERE sp.paramsetId = :paramsetId AND " +
           "(sp.screenerVersion.screener.ownerUserId = :userId OR sp.screenerVersion.screener.isPublic = true)")
    Optional<ScreenerParamset> findByIdAndOwnerOrPublic(@Param("paramsetId") Long paramsetId, 
                                                       @Param("userId") Long userId);

    /**
     * Checks if paramset name exists for version.
     */
    boolean existsByScreenerVersionScreenerVersionIdAndName(Long screenerVersionId, String name);

    /**
     * Finds paramsets by created by user.
     */
    List<ScreenerParamset> findByCreatedByUserIdOrderByCreatedAtDesc(Long userId);
}

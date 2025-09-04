package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.ScreenerStar;
import com.moneyplant.screener.entities.ScreenerStarId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ScreenerStar entity with custom queries.
 */
@Repository
public interface ScreenerStarRepository extends JpaRepository<ScreenerStar, ScreenerStarId> {

    /**
     * Finds stars by screener ID.
     */
    List<ScreenerStar> findByScreenerScreenerIdOrderByCreatedAtDesc(Long screenerId);

    /**
     * Finds stars by user ID.
     */
    List<ScreenerStar> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Finds star by screener ID and user ID.
     */
    Optional<ScreenerStar> findByScreenerScreenerIdAndUserId(Long screenerId, Long userId);

    /**
     * Checks if user has starred screener.
     */
    boolean existsByScreenerScreenerIdAndUserId(Long screenerId, Long userId);

    /**
     * Counts stars by screener ID.
     */
    long countByScreenerScreenerId(Long screenerId);

    /**
     * Counts stars by user ID.
     */
    long countByUserId(Long userId);

    /**
     * Finds starred screeners by user ID.
     */
    @Query("SELECT ss.screener FROM ScreenerStar ss WHERE ss.userId = :userId " +
           "ORDER BY ss.createdAt DESC")
    List<ScreenerStar> findStarredScreenersByUserId(@Param("userId") Long userId);
}

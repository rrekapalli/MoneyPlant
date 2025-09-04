package com.moneyplant.screener.repositories;

import com.moneyplant.screener.entities.Screener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Screener entity with custom queries.
 */
@Repository
public interface ScreenerRepository extends JpaRepository<Screener, Long> {

    /**
     * Finds screeners by owner or public with search.
     */
    @Query("SELECT s FROM Screener s WHERE " +
           "(s.ownerUserId = :userId OR s.isPublic = true) AND " +
           "(:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Screener> findByOwnerUserIdOrIsPublicTrueWithSearch(
            @Param("userId") Long userId, 
            @Param("search") String search, 
            Pageable pageable);

    /**
     * Finds screeners by owner.
     */
    List<Screener> findByOwnerUserIdOrderByCreatedAtDesc(Long ownerUserId);

    /**
     * Finds public screeners.
     */
    List<Screener> findByIsPublicTrueOrderByCreatedAtDesc();

    /**
     * Finds screener by ID and owner.
     */
    Optional<Screener> findByScreenerIdAndOwnerUserId(Long screenerId, Long ownerUserId);

    /**
     * Finds screener by ID (public or owned by user).
     */
    @Query("SELECT s FROM Screener s WHERE s.screenerId = :screenerId AND " +
           "(s.ownerUserId = :userId OR s.isPublic = true)")
    Optional<Screener> findByIdAndOwnerOrPublic(@Param("screenerId") Long screenerId, 
                                               @Param("userId") Long userId);

    /**
     * Checks if screener exists and is owned by user.
     */
    boolean existsByScreenerIdAndOwnerUserId(Long screenerId, Long ownerUserId);

    /**
     * Counts screeners by owner.
     */
    long countByOwnerUserId(Long ownerUserId);

    /**
     * Counts public screeners.
     */
    long countByIsPublicTrue();
}

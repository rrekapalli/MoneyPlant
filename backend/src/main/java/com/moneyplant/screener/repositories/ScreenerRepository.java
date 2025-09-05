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
    @Query(value = "SELECT s.* FROM screener s WHERE " +
           "(s.owner_user_id = :userId OR s.is_public = true) AND " +
           "(:search IS NULL OR LOWER(CAST(s.name AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(s.description AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY s.created_at DESC", 
           countQuery = "SELECT COUNT(s.*) FROM screener s WHERE " +
           "(s.owner_user_id = :userId OR s.is_public = true) AND " +
           "(:search IS NULL OR LOWER(CAST(s.name AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(CAST(s.description AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')))", 
           nativeQuery = true)
    Page<Screener> findByOwnerUserIdOrIsPublicTrueWithSearch(
            @Param("userId") Long userId, 
            @Param("search") String search, 
            Pageable pageable);

    /**
     * Finds screeners by owner.
     */
    @Query(value = "SELECT s.* FROM screener s WHERE s.owner_user_id = :ownerUserId ORDER BY s.created_at DESC", nativeQuery = true)
    List<Screener> findByOwnerUserIdOrderByCreatedAtDesc(@Param("ownerUserId") Long ownerUserId);

    /**
     * Finds public screeners.
     */
    @Query(value = "SELECT s.* FROM screener s WHERE s.is_public = true ORDER BY s.created_at DESC", nativeQuery = true)
    List<Screener> findByIsPublicTrueOrderByCreatedAtDesc();

    /**
     * Finds screener by ID and owner.
     */
    Optional<Screener> findByScreenerIdAndOwnerUserId(Long screenerId, Long ownerUserId);

    /**
     * Finds screener by ID (public or owned by user).
     */
    @Query(value = "SELECT s.* FROM screener s WHERE s.screener_id = :screenerId AND " +
           "(s.owner_user_id = :userId OR s.is_public = true)", nativeQuery = true)
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

    /**
     * Finds screeners starred by user.
     */
    @Query(value = "SELECT s.* FROM screener s " +
           "JOIN screener_star ss ON s.screener_id = ss.screener_id " +
           "WHERE ss.user_id = :userId " +
           "ORDER BY ss.created_at DESC", nativeQuery = true)
    List<Screener> findStarredByUserId(@Param("userId") Long userId);
}

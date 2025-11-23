package com.moneyplant.engines.ingestion.repository;

import com.moneyplant.engines.ingestion.model.ArchivalMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository for archival metadata operations.
 * Provides methods to track and query archival history.
 * 
 * Requirements: 11.2
 */
@Repository
public interface ArchivalMetadataRepository extends JpaRepository<ArchivalMetadata, Long> {
    
    /**
     * Find archival metadata by date
     * 
     * @param archivalDate the date to query
     * @return optional archival metadata
     */
    Optional<ArchivalMetadata> findByArchivalDate(LocalDate archivalDate);
    
    /**
     * Find all archival records for a date range
     * 
     * @param startDate start date (inclusive)
     * @param endDate end date (inclusive)
     * @return list of archival metadata
     */
    List<ArchivalMetadata> findByArchivalDateBetween(LocalDate startDate, LocalDate endDate);
    
    /**
     * Find all archival records by status
     * 
     * @param status the status to filter by
     * @return list of archival metadata
     */
    List<ArchivalMetadata> findByStatus(ArchivalMetadata.ArchivalStatus status);
    
    /**
     * Find the most recent archival record
     * 
     * @return optional archival metadata
     */
    @Query("SELECT a FROM ArchivalMetadata a ORDER BY a.archivalDate DESC LIMIT 1")
    Optional<ArchivalMetadata> findMostRecent();
    
    /**
     * Find all failed archival records
     * 
     * @return list of failed archival metadata
     */
    @Query("SELECT a FROM ArchivalMetadata a WHERE a.status = 'FAILED' ORDER BY a.archivalDate DESC")
    List<ArchivalMetadata> findAllFailed();
    
    /**
     * Check if archival exists for a specific date
     * 
     * @param archivalDate the date to check
     * @return true if archival exists
     */
    boolean existsByArchivalDate(LocalDate archivalDate);
    
    /**
     * Count successful archival records
     * 
     * @return count of successful archivals
     */
    long countByStatus(ArchivalMetadata.ArchivalStatus status);
}
